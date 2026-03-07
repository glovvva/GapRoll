"""
Skrzynka Wniosków Pracowniczych — Art. 7 Dyrektywy 2023/970.
Track A: publiczny formularz + magic link. Track B: ręczny wniosek przez Grażynę.
Część 2: auto-match EVG, obliczenia, generowanie PDF odpowiedzi.
"""

import io
import json
import logging
import os
import secrets
import statistics
import uuid
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr, Field
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from config import settings
from routers.auth import get_current_user
from supabase_client import get_supabase_client
from utils.audit import log_audit_event

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/employee-requests", tags=["employee-requests"])

# --- ReportLab fonts (Polish) ---
def _register_polish_fonts() -> tuple[str, str]:
    try:
        import reportlab
        rl_dir = os.path.dirname(reportlab.__file__)
        font_path = os.path.join(rl_dir, "fonts", "DejaVuSans.ttf")
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont("DejaVuSans", font_path))
            pdfmetrics.registerFont(
                TTFont("DejaVuSans-Bold", os.path.join(rl_dir, "fonts", "DejaVuSans-Bold.ttf"))
            )
            return "DejaVuSans", "DejaVuSans-Bold"
    except Exception:
        pass
    return "Helvetica", "Helvetica-Bold"

_FONT_NORMAL, _FONT_BOLD = _register_polish_fonts()


# --- Schemas ---

class PublicRequestCreate(BaseModel):
    """Track A: formularz publiczny (przed weryfikacją magic link)."""
    token: str = Field(..., min_length=1, description="Token z linku /wnioski/[token]")
    employee_name: str = Field(..., min_length=2, max_length=200)
    employee_email: EmailStr
    employee_position: str = Field(..., min_length=1, max_length=300)


class ManualRequestCreate(BaseModel):
    """Track B: wniosek ręczny (Grażyna)."""
    employee_name: str = Field(..., min_length=2, max_length=200)
    employee_position: str = Field(..., min_length=1, max_length=300)
    submitted_channel: str = Field("online", pattern="^(online|ustny|papierowy)$")


class VerifyByTokenBody(BaseModel):
    """Weryfikacja po kliknięciu magic linku."""
    token: str = Field(..., min_length=1)


def _get_domain(email: str) -> str:
    """Wyciąga domenę z adresu email."""
    part = email.strip().split("@")[-1] if "@" in email else ""
    return part.lower()


def _user_id_for_organization(supabase: Any, organization_id: str) -> Optional[str]:
    """Zwraca user_id użytkownika przypisanego do firmy (profiles.company_id)."""
    try:
        r = supabase.table("profiles").select("id").eq("company_id", organization_id).limit(1).execute()
        if r.data and len(r.data) > 0 and r.data[0].get("id"):
            return str(r.data[0]["id"])
    except Exception as e:
        logger.warning("_user_id_for_organization: %s", e)
    return None


def _evg_score_to_group_name(score: Optional[float]) -> Optional[str]:
    """Mapuje EVG score 1–100 na nazwę grupy EVG-1, EVG-2, EVG-3."""
    if score is None:
        return None
    if score <= 33:
        return "EVG-1"
    if score <= 66:
        return "EVG-2"
    return "EVG-3"


def _get_evg_group_id_by_name(supabase: Any, name: str) -> Optional[str]:
    """Zwraca id grupy evg_groups po nazwie (EVG-1, EVG-2, EVG-3)."""
    try:
        r = supabase.table("evg_groups").select("id").eq("name", name).limit(1).execute()
        if r.data and len(r.data) > 0 and r.data[0].get("id"):
            return str(r.data[0]["id"])
    except Exception as e:
        logger.warning("_get_evg_group_id_by_name: %s", e)
    return None


def _try_evg_auto_match(
    supabase: Any,
    request_id: str,
    organization_id: str,
    employee_name: str,
    employee_position: Optional[str],
) -> None:
    """
    Po zapisaniu wniosku: szuka rekordu w payroll_data (name ILIKE employee_name),
    bierze stanowisko -> job_valuations evg_score -> EVG-1/2/3 -> evg_group_id, aktualizuje employee_requests.
    """
    user_id = _user_id_for_organization(supabase, organization_id)
    if not user_id:
        return
    try:
        payroll = (
            supabase.table("payroll_data")
            .select("first_name, last_name, position, salary")
            .eq("user_id", user_id)
            .execute()
        )
        if not payroll.data:
            return
        name_clean = (employee_name or "").strip()
        if not name_clean:
            return
        matched_position: Optional[str] = None
        for row in payroll.data:
            first = (row.get("first_name") or "").strip()
            last = (row.get("last_name") or "").strip()
            full = f"{first} {last}".strip()
            if full and name_clean.lower() == full.lower():
                matched_position = (row.get("position") or "").strip() or None
                break
        if not matched_position:
            return
        jv = (
            supabase.table("job_valuations")
            .select("position, evg_score")
            .eq("user_id", user_id)
            .execute()
        )
        evg_score = None
        if jv.data:
            for r in jv.data:
                if (r.get("position") or "").strip() == matched_position:
                    try:
                        evg_score = float(r.get("evg_score") or 0)
                    except (TypeError, ValueError):
                        pass
                    break
        group_name = _evg_score_to_group_name(evg_score)
        if not group_name:
            return
        evg_group_id = _get_evg_group_id_by_name(supabase, group_name)
        if not evg_group_id:
            return
        supabase.table("employee_requests").update({
            "evg_group_id": evg_group_id,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", request_id).execute()
        logger.info("evg_auto_match: request_id=%s evg_group_id=%s", request_id, evg_group_id)
    except Exception as e:
        logger.warning("_try_evg_auto_match: %s", e)


@router.get("/public-link")
async def get_public_link_info(token: str = Query(..., min_length=1)) -> dict[str, Any]:
    """
    Publiczny odczyt — sprawdza czy token jest prawidłowy i zwraca nazwę firmy
    (dla nagłówka formularza /wnioski/[token]). Bez auth.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Serwis niedostępny.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    try:
        link = (
            supabase.table("employee_request_links")
            .select("company_id")
            .eq("token", token.strip())
            .execute()
        )
        if not link.data or len(link.data) == 0:
            raise HTTPException(status_code=404, detail="Nieprawidłowy lub wygasły link.")
        company_id = str(link.data[0]["company_id"])
        company = (
            supabase.table("companies")
            .select("name")
            .eq("id", company_id)
            .execute()
        )
        company_name = "Pracodawca"
        if company.data and len(company.data) > 0 and company.data[0].get("name"):
            company_name = str(company.data[0]["name"]).strip()
        return {"valid": True, "company_name": company_name}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("public-link lookup: %s", e)
        raise HTTPException(status_code=500, detail="Błąd weryfikacji linku.") from e


def _get_organization_ids(supabase: Any, user_id: str) -> list[str]:
    """Zwraca listę organization_id (company_id) dostępnych dla użytkownika."""
    org_ids: list[str] = []
    # Profil: company_id użytkownika
    try:
        r = supabase.table("profiles").select("company_id").eq("id", user_id).execute()
        if r.data and r.data[0].get("company_id"):
            org_ids.append(str(r.data[0]["company_id"]))
    except Exception as e:
        logger.warning("profiles company_id: %s", e)
    # Partner: firmy gdzie partner_id = user_id
    try:
        r = supabase.table("companies").select("id").eq("partner_id", user_id).execute()
        if r.data:
            for row in r.data:
                if row.get("id"):
                    org_ids.append(str(row["id"]))
    except Exception as e:
        logger.warning("companies partner: %s", e)
    return list(dict.fromkeys(org_ids))  # uniq


@router.post("/public")
async def create_public_request(body: PublicRequestCreate) -> dict[str, Any]:
    """
    Publiczny endpoint — Track A. Tworzy wniosek (auth_verified=false),
    waliduje domenę email. Frontend wyśle magic link (signInWithOtp) po otrzymaniu verification_token.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    # Znajdź company po tokenie (request_links)
    try:
        link = (
            supabase.table("employee_request_links")
            .select("company_id")
            .eq("token", body.token.strip())
            .execute()
        )
        if not link.data or len(link.data) == 0:
            raise HTTPException(status_code=404, detail="Nieprawidłowy lub wygasły link do formularza.")
        company_id = str(link.data[0]["company_id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error("request_links lookup: %s", e)
        raise HTTPException(status_code=500, detail="Błąd weryfikacji linku.") from e

    # Domeny dozwolone (companies.allowed_email_domains)
    try:
        company = (
            supabase.table("companies")
            .select("allowed_email_domains, name")
            .eq("id", company_id)
            .execute()
        )
        allowed_domains: list[str] = []
        company_name: str = "Pracodawca"
        if company.data and len(company.data) > 0:
            company_name = (company.data[0].get("name") or "Pracodawca").strip()
            ad = company.data[0].get("allowed_email_domains")
            if isinstance(ad, list):
                allowed_domains = [str(d).lower().strip() for d in ad if d]
        email_domain = _get_domain(body.employee_email)
        if allowed_domains and email_domain not in allowed_domains:
            domains_str = ", ".join(f"@{d}" for d in allowed_domains)
            raise HTTPException(
                status_code=400,
                detail=f"Podaj służbowy adres email w domenie organizacji ({domains_str}).",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("companies allowed_email_domains: %s", e)

    verification_token = uuid.uuid4()
    deadline = datetime.now(timezone.utc) + timedelta(days=60)

    row = {
        "organization_id": company_id,
        "employee_name": body.employee_name.strip(),
        "employee_email": body.employee_email.strip().lower(),
        "employee_position": body.employee_position.strip(),
        "source": "online",
        "auth_verified": False,
        "submitted_channel": "online",
        "status": "pending",
        "deadline_at": deadline.isoformat(),
        "verification_token": str(verification_token),
    }
    try:
        ins = supabase.table("employee_requests").insert(row).execute()
        if not ins.data or len(ins.data) == 0:
            raise HTTPException(status_code=500, detail="Nie udało się zapisać wniosku.")
        request_id = str(ins.data[0]["id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error("employee_requests insert: %s", e)
        raise HTTPException(status_code=500, detail="Błąd zapisu wniosku.") from e

    return {
        "request_id": request_id,
        "verification_token": str(verification_token),
        "message": "Wysłaliśmy link weryfikacyjny na Twój adres email. Kliknij go, aby złożyć wniosek.",
    }


@router.patch("/verify-by-token")
async def verify_by_token(body: VerifyByTokenBody) -> dict[str, Any]:
    """
    Wywołane po kliknięciu magic linku (strona /wnioski/verify).
    Ustawia auth_verified=true dla wniosku z danym verification_token.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    try:
        up = (
            supabase.table("employee_requests")
            .update({"auth_verified": True, "updated_at": datetime.now(timezone.utc).isoformat()})
            .eq("verification_token", body.token.strip())
            .execute()
        )
        if not up.data or len(up.data) == 0:
            raise HTTPException(status_code=404, detail="Nieprawidłowy lub już wykorzystany link weryfikacyjny.")
        row = up.data[0]
        request_id = str(row["id"])
        organization_id = str(row["organization_id"])
        employee_name = (row.get("employee_name") or "").strip()
        employee_position = (row.get("employee_position") or "").strip() or None
        _try_evg_auto_match(supabase, request_id, organization_id, employee_name, employee_position)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("verify-by-token update: %s", e)
        raise HTTPException(status_code=500, detail="Błąd weryfikacji.") from e

    return {
        "verified": True,
        "message": "Twój wniosek został złożony. Pracodawca ma 60 dni na odpowiedź zgodnie z Art. 7 Dyrektywy 2023/970.",
    }


@router.post("/manual")
async def create_manual_request(
    body: ManualRequestCreate,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Track B: Grażyna wprowadza wniosek ręcznie (ustny/papierowy). Wymaga auth."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")

    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    org_ids = _get_organization_ids(supabase, user_id)
    if not org_ids:
        raise HTTPException(status_code=403, detail="Brak przypisanej organizacji.")

    # Użyj pierwszej organizacji użytkownika (np. company_id z profilu)
    organization_id = org_ids[0]
    deadline = datetime.now(timezone.utc) + timedelta(days=60)

    row = {
        "organization_id": organization_id,
        "employee_name": body.employee_name.strip(),
        "employee_email": None,
        "employee_position": body.employee_position.strip(),
        "source": "manual",
        "auth_verified": False,
        "submitted_by_user_id": user_id,
        "submitted_channel": body.submitted_channel,
        "status": "pending",
        "deadline_at": deadline.isoformat(),
    }
    try:
        ins = supabase.table("employee_requests").insert(row).execute()
        if not ins.data or len(ins.data) == 0:
            raise HTTPException(status_code=500, detail="Nie udało się zapisać wniosku.")
        request_id = str(ins.data[0]["id"])
    except HTTPException:
        raise
    except Exception as e:
        logger.error("employee_requests manual insert: %s", e)
        raise HTTPException(status_code=500, detail="Błąd zapisu wniosku.") from e

    _try_evg_auto_match(
        supabase, request_id, organization_id,
        body.employee_name.strip(), body.employee_position.strip() or None,
    )
    return {"request_id": request_id, "message": "Wniosek został zapisany."}


def _get_request_and_check_access(
    supabase: Any, request_id: str, user_id: str
) -> dict[str, Any]:
    """Pobiera wniosek i weryfikuje dostęp (organization). Raises HTTPException."""
    r = (
        supabase.table("employee_requests")
        .select("id, organization_id, employee_name, employee_position, evg_group_id, submitted_channel, source, created_at")
        .eq("id", request_id)
        .execute()
    )
    if not r.data or len(r.data) == 0:
        raise HTTPException(status_code=404, detail="Wniosek nie został znaleziony.")
    org_ids = _get_organization_ids(supabase, user_id)
    row = r.data[0]
    org_id = str(row["organization_id"])
    if org_id not in org_ids:
        raise HTTPException(status_code=403, detail="Brak dostępu do tego wniosku.")
    return row


def _median_by_evg_group(
    supabase: Any,
    user_id: str,
    evg_group_name: str,
) -> tuple[list[dict], Optional[float], Optional[float], int, int, Optional[float]]:
    """
    Pobiera payroll_data + job_valuations, filtruje po grupie EVG (EVG-1/2/3),
    zwraca: (data_points, median_female, median_male, n_female, n_male, gap_percent).
    RODO: jeśli N < 3 w grupie płci, mediana i gap = None.
    """
    payroll = (
        supabase.table("payroll_data")
        .select("first_name, last_name, position, gender, salary")
        .eq("user_id", user_id)
        .execute()
    )
    if not payroll.data:
        return ([], None, None, 0, 0, None)
    jv = supabase.table("job_valuations").select("position, evg_score").eq("user_id", user_id).execute()
    evg_by_pos = {}
    if jv.data:
        for r in jv.data:
            pos = (r.get("position") or "").strip()
            if pos:
                try:
                    evg_by_pos[pos] = float(r.get("evg_score") or 0)
                except (TypeError, ValueError):
                    pass
    male_salaries = []
    female_salaries = []
    for row in payroll.data:
        pos = (row.get("position") or "").strip() or "Unknown"
        grp = _evg_score_to_group_name(evg_by_pos.get(pos))
        if grp != evg_group_name:
            continue
        salary = float(row.get("salary") or 0)
        if salary <= 0:
            continue
        g = (row.get("gender") or "").strip().lower()
        if g in ["mężczyzna", "male", "m", "męzczyzna"]:
            male_salaries.append(salary)
        elif g in ["kobieta", "female", "f", "k"]:
            female_salaries.append(salary)
    n_male = len(male_salaries)
    n_female = len(female_salaries)
    median_m = round(statistics.median(male_salaries), 2) if n_male >= 3 and male_salaries else None
    median_f = round(statistics.median(female_salaries), 2) if n_female >= 3 and female_salaries else None
    rodo_masked = n_male < 3 or n_female < 3
    if rodo_masked:
        median_m = None
        median_f = None
    gap = None
    if median_m is not None and median_f is not None and median_m > 0:
        gap = round(((median_m - median_f) / median_m) * 100, 2)
    return (None, median_f, median_m, n_female, n_male, gap)


def _employee_salary_for_request(
    supabase: Any, user_id: str, organization_id: str, employee_name: str
) -> Optional[float]:
    """Pobiera wynagrodzenie wnioskującego z payroll_data (match po imię i nazwisko)."""
    payroll = (
        supabase.table("payroll_data")
        .select("first_name, last_name, salary")
        .eq("user_id", user_id)
        .execute()
    )
    if not payroll.data:
        return None
    name_clean = (employee_name or "").strip().lower()
    for row in payroll.data:
        first = (row.get("first_name") or "").strip()
        last = (row.get("last_name") or "").strip()
        full = f"{first} {last}".strip().lower()
        if full and name_clean == full:
            try:
                return round(float(row.get("salary") or 0), 2)
            except (TypeError, ValueError):
                return None
    return None


@router.post("/{request_id}/calculate")
async def calculate_request(
    request_id: str,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Oblicza mediany M/K i lukę % dla EVG grupy wniosku. Zapisuje do employee_request_calculations.
    RODO: jeśli N < 3 w grupie płci — rodo_masked=true, wartości nie ujawniane.
    """
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    row = _get_request_and_check_access(supabase, request_id, user_id)
    organization_id = str(row["organization_id"])
    employee_name = (row.get("employee_name") or "").strip()
    employee_position = (row.get("employee_position") or "").strip() or None
    evg_group_id = row.get("evg_group_id")
    evg_group_name: Optional[str] = None
    if evg_group_id:
        gr = supabase.table("evg_groups").select("name").eq("id", evg_group_id).limit(1).execute()
        if gr.data and gr.data[0].get("name"):
            evg_group_name = str(gr.data[0]["name"])
    if not evg_group_name and employee_position:
        user_id_org = _user_id_for_organization(supabase, organization_id)
        if user_id_org:
            jv = (
                supabase.table("job_valuations")
                .select("position, evg_score")
                .eq("user_id", user_id_org)
                .eq("position", employee_position)
                .limit(1)
                .execute()
            )
            if jv.data and jv.data[0].get("evg_score") is not None:
                try:
                    evg_group_name = _evg_score_to_group_name(float(jv.data[0]["evg_score"]))
                except (TypeError, ValueError):
                    pass
                if evg_group_name and not evg_group_id:
                    eg_id = _get_evg_group_id_by_name(supabase, evg_group_name)
                    if eg_id:
                        supabase.table("employee_requests").update({
                            "evg_group_id": eg_id,
                            "updated_at": datetime.now(timezone.utc).isoformat(),
                        }).eq("id", request_id).execute()
                        evg_group_id = eg_id

    if not evg_group_name:
        raise HTTPException(
            status_code=400,
            detail="Nie można określić grupy EVG dla wniosku. Przypisz grupę ręcznie w dashboardzie lub uzupełnij wartościowanie stanowiska.",
        )

    user_id_org = _user_id_for_organization(supabase, organization_id)
    if not user_id_org:
        raise HTTPException(status_code=400, detail="Brak użytkownika przypisanego do organizacji (dane płacowe).")

    _, median_female, median_male, n_female, n_male, gap_percent = _median_by_evg_group(
        supabase, user_id_org, evg_group_name
    )
    rodo_masked = (n_female or 0) < 3 or (n_male or 0) < 3
    employee_salary = _employee_salary_for_request(supabase, user_id_org, organization_id, employee_name)

    calc_row = {
        "request_id": request_id,
        "evg_group_id": evg_group_id,
        "employee_salary": employee_salary,
        "median_female": median_female if not rodo_masked else None,
        "median_male": median_male if not rodo_masked else None,
        "gap_percent": gap_percent if not rodo_masked else None,
        "n_female": n_female,
        "n_male": n_male,
        "rodo_masked": rodo_masked,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        ins = supabase.table("employee_request_calculations").insert(calc_row).execute()
        if not ins.data or len(ins.data) == 0:
            raise HTTPException(status_code=500, detail="Nie udało się zapisać obliczeń.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("employee_request_calculations insert: %s", e)
        raise HTTPException(status_code=500, detail="Błąd zapisu obliczeń.") from e

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="eri_calculated",
            resource_type="employee_request",
            resource_id=request_id,
            metadata={
                "evg_group_id": evg_group_id,
                "gap_percent": gap_percent,
                "rodo_masked": rodo_masked,
            },
            request=request,
        )
    except Exception:
        pass

    return {
        "request_id": request_id,
        "calculation_id": str(ins.data[0]["id"]),
        "rodo_masked": rodo_masked,
        "gap_percent": gap_percent,
        "median_female": median_female,
        "median_male": median_male,
        "n_female": n_female,
        "n_male": n_male,
    }


def _build_art7_response_pdf(
    company_name: str,
    employee_name: str,
    submitted_channel: str,
    created_at_iso: str,
    response_date: str,
    employee_salary: Optional[float],
    evg_group_name: str,
    median_female: Optional[float],
    median_male: Optional[float],
    gap_percent: Optional[float],
    n_female: int,
    n_male: int,
    rodo_masked: bool,
    hr_manager_name: str,
    hr_position: str,
) -> bytes:
    """Generuje PDF odpowiedzi na wniosek Art. 7 (ReportLab). A4, marginesy 2.5 cm, 11 pt body, 14 pt nagłówki."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2.5 * cm,
        leftMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )
    styles = getSampleStyleSheet()
    h1_style = ParagraphStyle(
        "Art7H1",
        parent=styles["Heading1"],
        fontName=_FONT_BOLD,
        fontSize=14,
        spaceAfter=6,
    )
    h2_style = ParagraphStyle(
        "Art7H2",
        parent=styles["Heading2"],
        fontName=_FONT_BOLD,
        fontSize=12,
        spaceBefore=14,
        spaceAfter=6,
    )
    normal_style = ParagraphStyle(
        "Art7Normal",
        parent=styles["Normal"],
        fontName=_FONT_NORMAL,
        fontSize=11,
    )
    meta_style = ParagraphStyle(
        "Art7Meta",
        parent=styles["Normal"],
        fontName=_FONT_NORMAL,
        fontSize=10,
        textColor=colors.HexColor("#444444"),
        spaceAfter=4,
    )

    def pl_date(iso: str) -> str:
        if not iso:
            return "—"
        try:
            d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
            return d.strftime("%d.%m.%Y")
        except Exception:
            return iso[:10] if len(iso) >= 10 else iso

    def salary_fmt(x: Optional[float]) -> str:
        if x is None:
            return "—"
        return f"{x:,.2f} PLN".replace(",", " ")

    story = []
    story.append(Paragraph("ODPOWIEDŹ NA WNIOSEK O INFORMACJĘ O WYNAGRODZENIU", h1_style))
    story.append(Paragraph(
        "Na podstawie Art. 7 ust. 1 Dyrektywy Parlamentu Europejskiego i Rady 2023/970",
        meta_style,
    ))
    story.append(Spacer(1, 16))

    story.append(Paragraph("Sekcja 1 — Dane wniosku", h2_style))
    story.append(Paragraph(f"Data złożenia wniosku: {pl_date(created_at_iso)}", normal_style))
    story.append(Paragraph(f"Data odpowiedzi: {response_date}", normal_style))
    story.append(Paragraph(f"Wnioskodawca: {employee_name or '—'}", normal_style))
    story.append(Paragraph(f"Pracodawca: {company_name or '—'}", normal_style))
    if submitted_channel and submitted_channel != "online":
        story.append(Paragraph(f"Kanał złożenia: {submitted_channel}", normal_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Sekcja 2 — Informacje o wynagrodzeniu", h2_style))
    story.append(Paragraph(f"Twoje wynagrodzenie podstawowe: {salary_fmt(employee_salary)}", normal_style))
    story.append(Paragraph(f"Kategoria stanowiska (EVG): {evg_group_name}", normal_style))
    story.append(Paragraph(
        "Kryteria wartościowania: Kwalifikacje / Wysiłek / Odpowiedzialność / Warunki pracy",
        normal_style,
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Sekcja 3 — Porównanie według płci w kategorii {evg_group_name}", h2_style))
    if rodo_masked:
        story.append(Paragraph(
            "Dane wygaszone zgodnie z Art. 5 Rozporządzenia RODO 2016/679 (ochrona danych osobowych — zbyt mała grupa pracowników).",
            normal_style,
        ))
    else:
        story.append(Paragraph(
            f"Mediana wynagrodzenia (kobiety): {salary_fmt(median_female)} [N = {n_female}]",
            normal_style,
        ))
        story.append(Paragraph(
            f"Mediana wynagrodzenia (mężczyźni): {salary_fmt(median_male)} [N = {n_male}]",
            normal_style,
        ))
        story.append(Paragraph(f"Luka płacowa: {gap_percent}%", normal_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Sekcja 4 — Podstawa prawna", h2_style))
    story.append(Paragraph(
        "Niniejsza informacja została przygotowana na podstawie:",
        normal_style,
    ))
    story.append(Paragraph(
        "– Art. 7 ust. 1 Dyrektywy 2023/970 — prawo pracownika do informacji o wynagrodzeniu",
        normal_style,
    ))
    story.append(Paragraph(
        "– Art. 4 Dyrektywy 2023/970 — wartościowanie stanowisk pracy równej wartości",
        normal_style,
    ))
    story.append(Paragraph(
        "– Art. 5 Rozporządzenia (UE) 2016/679 (RODO) — minimalizacja danych",
        normal_style,
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Sekcja 5 — Podpis", h2_style))
    story.append(Paragraph("Podpis i pieczęć: ______________________", normal_style))
    story.append(Paragraph(hr_manager_name or "—", normal_style))
    story.append(Paragraph(hr_position or "—", normal_style))
    story.append(Paragraph(response_date, normal_style))

    doc.build(story)
    return buffer.getvalue()


@router.post("/{request_id}/generate-pdf")
async def generate_response_pdf(
    request_id: str,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Generuje PDF odpowiedzi na wniosek Art. 7 i zapisuje do Supabase Storage (bucket employee-requests).
    Ustawia employee_requests.pdf_url. Wymaga wcześniejszego wywołania calculate.
    """
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    row = _get_request_and_check_access(supabase, request_id, user_id)
    organization_id = str(row["organization_id"])
    company = (
        supabase.table("companies")
        .select("name")
        .eq("id", organization_id)
        .limit(1)
        .execute()
    )
    company_name = "Pracodawca"
    if company.data and company.data[0].get("name"):
        company_name = str(company.data[0]["name"]).strip()

    calc = (
        supabase.table("employee_request_calculations")
        .select("*")
        .eq("request_id", request_id)
        .order("calculated_at", desc=True)
        .limit(1)
        .execute()
    )
    if not calc.data or len(calc.data) == 0:
        raise HTTPException(
            status_code=400,
            detail="Najpierw wykonaj obliczenia (POST /employee-requests/{id}/calculate).",
        )
    c = calc.data[0]
    evg_group_id = c.get("evg_group_id")
    evg_group_name = "—"
    if evg_group_id:
        gr = supabase.table("evg_groups").select("name").eq("id", evg_group_id).limit(1).execute()
        if gr.data and gr.data[0].get("name"):
            evg_group_name = str(gr.data[0]["name"])

    hr_manager_name = "—"
    hr_position = "—"
    try:
        profile = supabase.table("profiles").select("full_name, raw_user_meta_data").eq("id", user_id).limit(1).execute()
        if profile.data and profile.data[0]:
            hr_manager_name = (profile.data[0].get("full_name") or "").strip() or "—"
            meta = profile.data[0].get("raw_user_meta_data") or {}
            hr_position = (meta.get("job_title") or "").strip() or "—"
    except Exception:
        pass

    response_date = datetime.now(timezone.utc).strftime("%d.%m.%Y")
    pdf_bytes = _build_art7_response_pdf(
        company_name=company_name,
        employee_name=(row.get("employee_name") or "").strip(),
        submitted_channel=(row.get("submitted_channel") or "online"),
        created_at_iso=row.get("created_at") or "",
        response_date=response_date,
        employee_salary=c.get("employee_salary"),
        evg_group_name=evg_group_name,
        median_female=c.get("median_female"),
        median_male=c.get("median_male"),
        gap_percent=c.get("gap_percent"),
        n_female=int(c.get("n_female") or 0),
        n_male=int(c.get("n_male") or 0),
        rodo_masked=bool(c.get("rodo_masked")),
        hr_manager_name=hr_manager_name or "—",
        hr_position=hr_position or "—",
    )

    storage_path = f"{organization_id}/{request_id}/odpowiedz.pdf"
    bucket = "employee-requests"
    try:
        supabase.storage.from_(bucket).upload(
            storage_path,
            pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
    except Exception as e:
        logger.error("storage upload employee-requests: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Nie udało się zapisać PDF w magazynie. Sprawdź czy bucket 'employee-requests' istnieje.",
        ) from e

    try:
        public_url = supabase.storage.from_(bucket).get_public_url(storage_path)
    except Exception:
        public_url = f"{bucket}/{storage_path}"
    try:
        supabase.table("employee_requests").update({
            "pdf_url": public_url,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", request_id).execute()
    except Exception as e:
        logger.warning("update pdf_url: %s", e)

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="eri_pdf_generated",
            resource_type="employee_request",
            resource_id=request_id,
            metadata={"evg_group_id": evg_group_id, "path": storage_path},
            request=request,
        )
    except Exception:
        pass

    return {
        "request_id": request_id,
        "pdf_url": public_url,
        "message": "PDF odpowiedzi został wygenerowany i zapisany.",
    }


@router.get("/approaching-deadline")
async def approaching_deadline(
    days: int = Query(7, ge=1, le=60),
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Wnioski z terminem odpowiedzi w ciągu najbliższych `days` dni, o statusie != sent.
    Do wywołania przez n8n cron (z JWT) lub z dashboardu.
    """
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    org_ids = _get_organization_ids(supabase, user_id)
    if not org_ids:
        return {"requests": []}

    now = datetime.now(timezone.utc)
    end = now + timedelta(days=days)
    now_s = now.isoformat()
    end_s = end.isoformat()

    try:
        r = (
            supabase.table("employee_requests")
            .select("id, employee_name, employee_position, deadline_at, status, created_at")
            .in_("organization_id", org_ids)
            .neq("status", "sent")
            .gte("deadline_at", now_s)
            .lte("deadline_at", end_s)
            .order("deadline_at", desc=False)
            .execute()
        )
        requests = r.data or []
    except Exception as e:
        logger.error("approaching_deadline: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu wniosków.") from e

    return {"requests": requests, "days": days}


@router.get("/evg-groups")
async def list_evg_groups(
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Lista grup EVG (EVG-1, EVG-2, EVG-3) do przypisania w dashboardzie."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    try:
        r = supabase.table("evg_groups").select("id, name").order("name").execute()
        return {"evg_groups": r.data or []}
    except Exception as e:
        logger.error("list evg_groups: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu grup EVG.") from e


class UpdateRequestBody(BaseModel):
    """Częściowa aktualizacja wniosku (np. przypisanie EVG)."""
    evg_group_id: Optional[str] = None


@router.patch("/{request_id}")
async def update_request(
    request_id: str,
    body: UpdateRequestBody,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Aktualizuje wniosek (np. evg_group_id). Dostęp tylko dla swojej organizacji."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    _get_request_and_check_access(supabase, request_id, user_id)
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if body.evg_group_id is not None:
        updates["evg_group_id"] = body.evg_group_id
    if not updates or len(updates) <= 1:
        raise HTTPException(status_code=400, detail="Brak pól do aktualizacji.")
    try:
        supabase.table("employee_requests").update(updates).eq("id", request_id).execute()
    except Exception as e:
        logger.error("update employee_request: %s", e)
        raise HTTPException(status_code=500, detail="Błąd aktualizacji wniosku.") from e
    return {"request_id": request_id, "message": "Wniosek zaktualizowany."}


@router.get("/{request_id}")
async def get_request(
    request_id: str,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Pojedynczy wniosek z ostatnim obliczeniem (jeśli jest)."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    row = _get_request_and_check_access(supabase, request_id, user_id)
    # Pełne pola + pdf_url, sent_at (jeśli kolumna istnieje)
    full = (
        supabase.table("employee_requests")
        .select("id, organization_id, employee_name, employee_email, employee_position, evg_group_id, source, auth_verified, submitted_channel, status, deadline_at, created_at, updated_at, pdf_url, sent_at")
        .eq("id", request_id)
        .single()
        .execute()
    )
    request_data = full.data if full.data else row
    if not request_data.get("pdf_url"):
        try:
            req2 = supabase.table("employee_requests").select("pdf_url, sent_at").eq("id", request_id).single().execute()
            if req2.data:
                request_data["pdf_url"] = req2.data.get("pdf_url")
                request_data["sent_at"] = req2.data.get("sent_at")
        except Exception:
            request_data.setdefault("pdf_url", None)
            request_data.setdefault("sent_at", None)
    # Ostatnie obliczenie
    calc = (
        supabase.table("employee_request_calculations")
        .select("*")
        .eq("request_id", request_id)
        .order("calculated_at", desc=True)
        .limit(1)
        .execute()
    )
    request_data["latest_calculation"] = calc.data[0] if calc.data else None
    return request_data


def _call_n8n_webhook(webhook_url: str, payload: dict[str, Any]) -> None:
    """Wywołuje webhook n8n (POST JSON). Nie rzuca wyjątku przy błędzie sieci — loguje."""
    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(webhook_url, data=data, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status >= 400:
                logger.warning("n8n webhook returned %s: %s", resp.status, webhook_url)
    except urllib.error.HTTPError as e:
        logger.warning("n8n webhook HTTP error %s: %s", e.code, webhook_url)
    except Exception as e:
        logger.warning("n8n webhook request failed: %s", e)


@router.post("/{request_id}/send")
async def send_response(
    request_id: str,
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Wysyła odpowiedź na wniosek (email z PDF). Idempotentne: jeśli status = sent, zwraca 200 bez ponownej wysyłki.
    Wywołuje N8N_WEBHOOK_ERI_SEND z payloadem; n8n wysyła emaile.
    """
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    row = _get_request_and_check_access(supabase, request_id, user_id)

    if str(row.get("status")) == "sent":
        return {"request_id": request_id, "status": "sent", "message": "Odpowiedź została wcześniej wysłana."}

    pdf_url = row.get("pdf_url") or (supabase.table("employee_requests").select("pdf_url").eq("id", request_id).single().execute().data or {}).get("pdf_url")
    if not pdf_url:
        raise HTTPException(
            status_code=400,
            detail="Brak wygenerowanego PDF. Najpierw wykonaj obliczenia i generowanie PDF.",
        )

    organization_id = str(row["organization_id"])
    company = supabase.table("companies").select("name").eq("id", organization_id).limit(1).execute()
    organization_name = (company.data[0].get("name") or "Pracodawca").strip() if company.data else "Pracodawca"

    grazyna_email = ""
    try:
        r = supabase.auth.admin.get_user_by_id(user_id)
        if getattr(r, "user", None) and getattr(r.user, "email", None):
            grazyna_email = (r.user.email or "").strip()
    except Exception:
        try:
            ru = supabase.table("auth.users").select("email").eq("id", user_id).limit(1).execute()
            if ru.data and len(ru.data) > 0 and ru.data[0].get("email"):
                grazyna_email = (ru.data[0]["email"] or "").strip()
        except Exception:
            pass

    employee_email = (row.get("employee_email") or "").strip() or None
    employee_name = (row.get("employee_name") or "").strip() or "Wnioskodawca"
    is_manual_no_email = row.get("source") == "manual" and not employee_email

    webhook_url = settings.N8N_WEBHOOK_ERI_SEND
    webhook_skipped = not webhook_url
    if webhook_url:
        payload = {
            "request_id": request_id,
            "employee_email": employee_email,
            "grazyna_email": grazyna_email,
            "pdf_url": pdf_url,
            "organization_name": organization_name,
            "employee_name": employee_name,
            "manual_no_email": is_manual_no_email,
        }
        try:
            _call_n8n_webhook(webhook_url, payload)
        except Exception as e:
            logger.error("n8n send webhook: %s", e)
            raise HTTPException(status_code=502, detail="Nie udało się wywołać usługi wysyłki. Sprawdź konfigurację webhooka.") from e
    else:
        logger.warning("N8N_WEBHOOK_ERI_SEND not set; skipping email send (status updated to sent).")

    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        supabase.table("employee_requests").update({
            "status": "sent",
            "updated_at": now_iso,
            "sent_at": now_iso,
        }).eq("id", request_id).execute()
    except Exception as e:
        if "sent_at" in str(e).lower() or "column" in str(e).lower():
            supabase.table("employee_requests").update({
                "status": "sent",
                "updated_at": now_iso,
            }).eq("id", request_id).execute()
        else:
            raise

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="eri_sent",
            resource_type="employee_request",
            resource_id=request_id,
            metadata={
                "recipient_email": employee_email,
                "sent_at": now_iso,
                "pdf_url": pdf_url,
                "manual_no_email": is_manual_no_email,
            },
            request=request,
        )
    except Exception:
        pass

    if webhook_skipped:
        message = "Email nie został wysłany — brak konfiguracji webhook. Zapisano w logu audytowym."
    elif is_manual_no_email:
        message = "Status zaktualizowany. PDF gotowy do wydruku (wniosek ręczny bez adresu email)."
    else:
        message = "Odpowiedź została wysłana."

    return {
        "request_id": request_id,
        "status": "sent",
        "message": message,
    }


@router.get("")
async def list_requests(
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Lista wniosków dla organizacji użytkownika (Grażyna / partner)."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")

    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    org_ids = _get_organization_ids(supabase, user_id)
    if not org_ids:
        return {"requests": []}

    try:
        # service_role omija RLS; filtrujemy po organization_id
        r = (
            supabase.table("employee_requests")
            .select("id, employee_name, employee_email, employee_position, source, auth_verified, submitted_channel, status, deadline_at, created_at, sent_at")
            .in_("organization_id", org_ids)
            .order("deadline_at", desc=False)
            .execute()
        )
        requests = r.data or []
    except Exception as e:
        logger.error("list employee_requests: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu listy wniosków.") from e

    return {"requests": requests}


@router.post("/generate-link")
async def generate_request_link(
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """Generuje unikalny link do formularza wniosku (Track A) dla organizacji użytkownika."""
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Wymagane zalogowanie.")

    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    org_ids = _get_organization_ids(supabase, user_id)
    if not org_ids:
        raise HTTPException(status_code=403, detail="Brak przypisanej organizacji.")

    organization_id = org_ids[0]
    token = secrets.token_urlsafe(24)

    try:
        ins = (
            supabase.table("employee_request_links")
            .insert({"company_id": organization_id, "token": token})
            .execute()
        )
        if not ins.data or len(ins.data) == 0:
            raise HTTPException(status_code=500, detail="Nie udało się wygenerować linku.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("employee_request_links insert: %s", e)
        raise HTTPException(status_code=500, detail="Błąd generowania linku.") from e

    return {
        "token": token,
        "url": f"/wnioski/{token}",
        "message": "Link wygenerowany. Udostępnij go pracownikom (np. przez email lub intranet).",
    }
