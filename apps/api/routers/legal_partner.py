"""
Legal Partner API — kancelarie prawne (pay-per-audit token model).
Prefix: /legal-partner. Auth: partner with partner_type = 'legal'.
"""

import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator
from starlette.requests import Request

from config import settings
from routers.auth import get_current_user
from supabase_client import get_supabase_client
from utils.audit import log_audit_event

router = APIRouter(tags=["Legal Partner"])
logger = logging.getLogger(__name__)

BUCKET_LOGOS = "partner-logos"
MAX_LOGO_BYTES = 2 * 1024 * 1024  # 2MB
ALLOWED_LOGO_MIMES = {"image/png", "image/jpeg", "image/svg+xml"}
SIGNED_URL_EXPIRY = 31536000  # 1 year in seconds
DEFAULT_PRICE_GROSZ = 150000  # 1500 PLN


async def get_current_legal_partner(
    user_id: str = Depends(get_current_user),
) -> str:
    """Require authenticated user with role=partner and partner_type=legal."""
    user_id = (user_id or "").strip()
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Nieprawidłowy token.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if not key:
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    try:
        r = (
            supabase.table("profiles")
            .select("id, role, partner_type")
            .eq("id", user_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=403, detail="Brak profilu partnera.")
        row = r.data[0]
        role = (row.get("role") or "").strip().lower()
        partner_type = (row.get("partner_type") or "accounting").strip().lower()
        if role != "partner":
            raise HTTPException(status_code=403, detail="Brak profilu partnera.")
        if partner_type != "legal":
            raise HTTPException(
                status_code=403,
                detail="Dostęp tylko dla partnerów typu kancelaria prawna.",
            )
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_current_legal_partner: %s", e)
        raise HTTPException(status_code=403, detail="Brak dostępu.") from e


def _validate_nip(nip: str) -> bool:
    """Polish NIP 10 digits, checksum: weights 6,5,7,2,3,4,5,6,7 × digits, sum % 11 == digit[9]."""
    digits = "".join(c for c in nip if c.isdigit())
    if len(digits) != 10:
        return False
    weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    total = sum(int(digits[i]) * weights[i] for i in range(9))
    remainder = total % 11
    check = 0 if remainder == 10 else remainder
    return int(digits[9]) == check


def _get_supabase():
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    return get_supabase_client(settings.SUPABASE_URL, key)


# --- Request/Response models ---


class UseTokenRequest(BaseModel):
    client_company_name: str = Field(..., min_length=1, max_length=200)
    client_nip: str = Field(..., min_length=10, max_length=10)

    @field_validator("client_nip")
    @classmethod
    def nip_digits(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) != 10:
            raise ValueError("NIP musi mieć 10 cyfr")
        return digits


class WhiteLabelUpdate(BaseModel):
    firm_name: str = Field(..., min_length=1, max_length=200)
    primary_color_hex: str = Field(default="#003366", max_length=7)
    legal_disclaimer: Optional[str] = Field(default=None, max_length=500)

    @field_validator("primary_color_hex")
    @classmethod
    def hex_color(cls, v: str) -> str:
        if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Kolor musi być w formacie hex, np. #003366")
        return v


# --- Endpoints ---


@router.get("/dashboard")
async def get_dashboard(
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any]:
    """Token balance, usage this month, client list summary, recent audits."""
    supabase = _get_supabase()
    try:
        tok_r = (
            supabase.table("audit_tokens")
            .select("id, total_purchased, total_used")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner dashboard audit_tokens: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu danych.") from e

    token_row = (tok_r.data or [None])[0] if tok_r.data else None
    total_purchased = int(token_row["total_purchased"]) if token_row else 0
    total_used = int(token_row["total_used"]) if token_row else 0
    tokens_available = max(0, total_purchased - total_used)

    # Usage this month (from audit_token_usage)
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    month_start_str = month_start.isoformat().replace("+00:00", "Z")

    try:
        usage_r = (
            supabase.table("audit_token_usage")
            .select("id, client_company_name, client_nip, used_at, report_generated")
            .eq("partner_id", partner_id)
            .gte("used_at", month_start_str)
            .order("used_at", desc=True)
            .limit(20)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner dashboard audit_token_usage: %s", e)
        usage_r = type("R", (), {"data": []})()

    usages = usage_r.data or []
    tokens_used_this_month = len(usages)
    recent_audits = [
        {
            "client_name": u.get("client_company_name") or "",
            "nip": u.get("client_nip") or "",
            "date": (u.get("used_at") or "")[:10],
            "report_ready": bool(u.get("report_generated")),
        }
        for u in usages[:10]
    ]

    return {
        "tokens_available": tokens_available,
        "tokens_used_this_month": tokens_used_this_month,
        "total_clients_audited": total_used,
        "recent_audits": recent_audits,
    }


@router.post("/use-token")
async def use_token(
    request: Request,
    body: UseTokenRequest,
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any]:
    """Consume one audit token for a client. Returns 402 if no tokens left."""
    if not _validate_nip(body.client_nip):
        raise HTTPException(
            status_code=400,
            detail="Nieprawidłowy NIP (wymagane 10 cyfr i poprawna suma kontrolna).",
        )

    supabase = _get_supabase()
    try:
        tok_r = (
            supabase.table("audit_tokens")
            .select("id, total_purchased, total_used")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner use_token select: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu tokenów.") from e

    rows = tok_r.data or []
    if not rows:
        raise HTTPException(
            status_code=402,
            detail="Brak dostępnych tokenów. Doładuj pakiet.",
        )
    token_account = rows[0]
    tid = token_account["id"]
    total_purchased = int(token_account["total_purchased"])
    total_used = int(token_account["total_used"])
    available = total_purchased - total_used
    if available <= 0:
        raise HTTPException(
            status_code=402,
            detail="Brak dostępnych tokenów. Doładuj pakiet.",
        )

    new_total_used = total_used + 1
    try:
        supabase.table("audit_tokens").update(
            {"total_used": new_total_used, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", tid).execute()
    except Exception as e:
        logger.error("legal_partner use_token update: %s", e)
        raise HTTPException(status_code=500, detail="Nie udało się użyć tokenu.") from e

    audit_session_id = str(uuid.uuid4())
    try:
        supabase.table("audit_token_usage").insert(
            {
                "token_account_id": tid,
                "partner_id": partner_id,
                "client_company_name": body.client_company_name.strip(),
                "client_nip": body.client_nip,
                "audit_id": audit_session_id,
                "report_generated": False,
            }
        ).execute()
    except Exception as e:
        logger.error("legal_partner use_token usage insert: %s", e)
        # Rollback token count (best-effort)
        try:
            supabase.table("audit_tokens").update(
                {"total_used": total_used, "updated_at": datetime.now(timezone.utc).isoformat()}
            ).eq("id", tid).execute()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Nie udało się zarejestrować użycia.") from e

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=partner_id,
            action="legal_partner.use_token",
            resource_type="audit_token_usage",
            resource_id=audit_session_id,
            metadata={
                "module": "legal_partner",
                "client_company_name": body.client_company_name[:100],
                "client_nip": body.client_nip,
            },
            request=request,
        )
    except Exception:
        pass

    return {
        "token_used": True,
        "tokens_remaining": available - 1,
        "audit_session_id": audit_session_id,
    }


@router.post("/submit-audit-data")
async def submit_audit_data(
    request: Request,
    body: dict,
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any]:
    """Accept anonymized audit data from legal partner (client-side anonymization). Validates session ownership."""
    audit_session_id = body.get("audit_session_id")
    rows = body.get("rows")
    if not audit_session_id or not isinstance(rows, list):
        raise HTTPException(status_code=400, detail="Wymagane: audit_session_id i rows (lista).")

    supabase = _get_supabase()
    try:
        r = (
            supabase.table("audit_token_usage")
            .select("id")
            .eq("partner_id", partner_id)
            .eq("audit_id", audit_session_id)
            .execute()
        )
        if not r.data or len(r.data) == 0:
            raise HTTPException(status_code=404, detail="Nie znaleziono sesji audytu.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("legal_partner submit_audit_data: %s", e)
        raise HTTPException(status_code=500, detail="Błąd weryfikacji sesji.") from e

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=partner_id,
            action="legal_partner.submit_audit_data",
            resource_type="audit_token_usage",
            resource_id=str(audit_session_id),
            metadata={"module": "legal_partner", "row_count": len(rows)},
            request=request,
        )
    except Exception:
        pass

    return {"ok": True, "audit_session_id": audit_session_id}


@router.get("/token-balance")
async def get_token_balance(
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any]:
    """Total purchased, used, available, and price per token in PLN."""
    supabase = _get_supabase()
    try:
        r = (
            supabase.table("audit_tokens")
            .select("total_purchased, total_used, price_per_token_pln")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner token_balance: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu salda.") from e

    row = (r.data or [None])[0] if r.data else None
    if not row:
        return {
            "total_purchased": 0,
            "total_used": 0,
            "tokens_available": 0,
            "price_per_token_pln": DEFAULT_PRICE_GROSZ / 100.0,
        }
    total_purchased = int(row.get("total_purchased") or 0)
    total_used = int(row.get("total_used") or 0)
    price_grosz = int(row.get("price_per_token_pln") or DEFAULT_PRICE_GROSZ)
    return {
        "total_purchased": total_purchased,
        "total_used": total_used,
        "tokens_available": max(0, total_purchased - total_used),
        "price_per_token_pln": round(price_grosz / 100.0, 2),
    }


@router.get("/white-label-config")
async def get_white_label_config(
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any] | None:
    """Current white_label_config for this partner, or null if not set."""
    supabase = _get_supabase()
    try:
        r = (
            supabase.table("white_label_config")
            .select("*")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner white_label_config get: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu konfiguracji.") from e

    if not r.data or len(r.data) == 0:
        return None
    row = r.data[0]
    return {
        "id": row.get("id"),
        "partner_id": row.get("partner_id"),
        "firm_name": row.get("firm_name"),
        "logo_url": row.get("logo_url"),
        "primary_color_hex": row.get("primary_color_hex") or "#003366",
        "legal_disclaimer": row.get("legal_disclaimer"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
    }


@router.put("/white-label-config")
async def put_white_label_config(
    body: WhiteLabelUpdate,
    partner_id: str = Depends(get_current_legal_partner),
) -> dict[str, Any]:
    """Create or update white-label config. Logo is uploaded separately."""
    supabase = _get_supabase()
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "firm_name": body.firm_name.strip(),
        "primary_color_hex": body.primary_color_hex,
        "legal_disclaimer": body.legal_disclaimer,
        "updated_at": now,
    }

    try:
        r = (
            supabase.table("white_label_config")
            .select("id")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        logger.error("legal_partner white_label_config select: %s", e)
        raise HTTPException(status_code=500, detail="Błąd odczytu konfiguracji.") from e

    if r.data and len(r.data) > 0:
        try:
            supabase.table("white_label_config").update(payload).eq(
                "partner_id", partner_id
            ).execute()
        except Exception as e:
            logger.error("legal_partner white_label_config update: %s", e)
            raise HTTPException(status_code=500, detail="Nie udało się zaktualizować.") from e
        config_id = r.data[0]["id"]
    else:
        try:
            ins = supabase.table("white_label_config").insert(
                {"partner_id": partner_id, "created_at": now, **payload}
            ).execute()
            config_id = (ins.data or [{}])[0].get("id") if ins.data else None
        except Exception as e:
            logger.error("legal_partner white_label_config insert: %s", e)
            raise HTTPException(status_code=500, detail="Nie udało się utworzyć konfiguracji.") from e

    try:
        full = (
            supabase.table("white_label_config")
            .select("*")
            .eq("partner_id", partner_id)
            .execute()
        )
        row = (full.data or [None])[0] if full.data else None
    except Exception:
        row = {"id": config_id, "partner_id": partner_id, **payload}

    return {
        "id": row.get("id") if row else config_id,
        "partner_id": partner_id,
        "firm_name": payload["firm_name"],
        "logo_url": row.get("logo_url") if row else None,
        "primary_color_hex": payload["primary_color_hex"],
        "legal_disclaimer": payload["legal_disclaimer"],
        "updated_at": payload["updated_at"],
    }


@router.post("/upload-logo")
async def upload_logo(
    partner_id: str = Depends(get_current_legal_partner),
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """Upload logo to partner-logos bucket. Max 2MB, PNG/SVG/JPEG. Returns signed URL (1 year)."""
    if not file.content_type or file.content_type.lower() not in ALLOWED_LOGO_MIMES:
        raise HTTPException(
            status_code=400,
            detail="Dozwolone formaty: PNG, JPEG, SVG.",
        )

    content = await file.read()
    if len(content) > MAX_LOGO_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Plik zbyt duży. Maksymalny rozmiar: 2 MB.",
        )

    ext_map = {"image/png": "png", "image/jpeg": "jpeg", "image/svg+xml": "svg"}
    ext = ext_map.get(file.content_type.lower(), "png")
    path = f"{partner_id}/logo.{ext}"

    supabase = _get_supabase()
    try:
        supabase.storage.from_(BUCKET_LOGOS).upload(
            path,
            content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )
    except Exception as e:
        logger.error("legal_partner upload_logo: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Nie udało się przesłać logo.",
        ) from e

    try:
        signed = supabase.storage.from_(BUCKET_LOGOS).create_signed_url(
            path, SIGNED_URL_EXPIRY
        )
        # supabase-py may return dict or object; signedUrl is the download URL
        logo_url = ""
        if isinstance(signed, dict):
            logo_url = (
                signed.get("signedUrl")
                or signed.get("signed_url")
                or signed.get("url")
                or signed.get("path")
                or ""
            )
        else:
            logo_url = (
                getattr(signed, "signed_url", None)
                or getattr(signed, "signedUrl", None)
                or getattr(signed, "path", None)
                or ""
            )
    except Exception as e:
        logger.error("legal_partner create_signed_url: %s", e)
        logo_url = ""

    # Persist logo_url in white_label_config if row exists
    try:
        r = (
            supabase.table("white_label_config")
            .select("id")
            .eq("partner_id", partner_id)
            .execute()
        )
        if r.data and len(r.data) > 0:
            # Store path or signed URL; backend can regenerate signed URL when serving
            storage_path = f"{BUCKET_LOGOS}/{path}"
            supabase.table("white_label_config").update(
                {"logo_url": storage_path, "updated_at": datetime.now(timezone.utc).isoformat()}
            ).eq("partner_id", partner_id).execute()
    except Exception:
        pass

    return {"logo_url": logo_url}
