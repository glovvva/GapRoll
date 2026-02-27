"""
Router analizy przyczyn luki płacowej.
"""

import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import numpy as np

logger = logging.getLogger(__name__)
from fastapi import APIRouter, Depends, HTTPException, Response
from openai import OpenAI
from starlette.requests import Request

from limiter import limiter
from pydantic import BaseModel, Field
from sklearn.linear_model import LinearRegression
from config import settings
from supabase_client import get_supabase_client
from routers.auth import get_current_user

router = APIRouter(prefix="/root-cause", tags=["root-cause"])

FACTOR_SPEC = [
    ("seniority", "Staż pracy"),
    ("senior_role", "Stanowisko senior"),
    ("contract_type", "Kontrakt B2B"),
    ("education", "Wykształcenie"),
]
SENIOR_KEYWORDS = (
    "senior", "manager", "director", "kierownik", "dyrektor", "lead", "główny",
)


class RootCauseRequest(BaseModel):
    company_id: str = Field(..., max_length=50)


def _normalize_gender(gender: str) -> str | None:
    g = (gender or "").strip().lower()
    if g in ["mężczyzna", "male", "m", "męzczyzna"]:
        return "male"
    if g in ["kobieta", "female", "f", "k"]:
        return "female"
    return None


def _build_features(row: Dict[str, Any]) -> List[float]:
    position = (row.get("position") or row.get("job_title") or "").lower()
    raw = row.get("raw_data") or {}
    if isinstance(raw, str):
        raw = {}
    seniority_years = float(
        raw.get("seniority_years") or raw.get("staz") or row.get("tenure_years") or 0
    )
    is_senior = 1.0 if any(k in position for k in SENIOR_KEYWORDS) else 0.0
    contract = str(
        raw.get("contract_type") or raw.get("contract") or row.get("contract_type") or ""
    ).upper()
    is_b2b = 1.0 if contract == "B2B" else 0.0
    education_level = float(
        raw.get("education_level") or raw.get("wyksztalcenie") or row.get("education_level") or 0
    )
    return [seniority_years, is_senior, is_b2b, education_level]


@router.post("/analyze")
@limiter.limit("20/minute")
async def analyze_root_cause(
    request: Request,
    body: RootCauseRequest,
    user_id: str = Depends(get_current_user),
) -> Response:
    """
    Analiza głównych przyczyn luki płacowej.
    Zwraca: gap_total_pln, gap_pct, avg_salary_M/F, n_*, contributions, narrative_pl, legal_citation, computed_at.
    """
    t0 = time.time()
    try:
        if not settings.is_supabase_configured():
            raise HTTPException(
                status_code=503,
                detail="Supabase nie jest skonfigurowane.",
            )

        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        supabase = get_supabase_client(settings.SUPABASE_URL, key)

        company_id = str(body.company_id)
        response = supabase.table("employees")\
            .select("gender, contract_type, job_title, raw_gross_salary, tenure_years, education_level")\
            .eq("company_id", company_id)\
            .execute()
        rows = response.data or []

        if not rows:
            raise HTTPException(
                status_code=404,
                detail="Brak danych do analizy przyczyn.",
            )

        normalized: List[Dict[str, Any]] = []
        for row in rows:
            salary = float(row.get("raw_gross_salary") or row.get("salary") or 0)
            if salary <= 0:
                continue
            gender = _normalize_gender(str(row.get("gender") or ""))
            if gender is None:
                continue
            feats = _build_features(row)
            normalized.append({
                "gender": gender,
                "salary": salary,
                "features": feats,
            })

        male_list = [r for r in normalized if r["gender"] == "male"]
        female_list = [r for r in normalized if r["gender"] == "female"]

        if len(male_list) < 3 or len(female_list) < 3:
            raise HTTPException(
                status_code=400,
                detail="Brak wystarczających danych do analizy przyczyn (minimum 3 osoby każdej płci).",
            )

        n_male = len(male_list)
        n_female = len(female_list)
        n_employees = n_male + n_female

        avg_salary_M = float(np.mean([r["salary"] for r in male_list]))
        avg_salary_F = float(np.mean([r["salary"] for r in female_list]))
        gap_total_pln = round(avg_salary_M - avg_salary_F, 2)
        gap_pct = round((gap_total_pln / avg_salary_M) * 100, 2) if avg_salary_M > 0 else 0.0

        X_M = np.array([r["features"] for r in male_list])
        y_M = np.array([r["salary"] for r in male_list])
        X_F = np.array([r["features"] for r in female_list])
        y_F = np.array([r["salary"] for r in female_list])

        reg_M = LinearRegression()
        reg_F = LinearRegression()
        reg_M.fit(X_M, y_M)
        reg_F.fit(X_F, y_F)

        coef_M = reg_M.coef_
        coef_F = reg_F.coef_
        mean_M = np.mean(X_M, axis=0)
        mean_F = np.mean(X_F, axis=0)

        contributions_raw: List[Dict[str, Any]] = []
        for i, (factor_key, factor_label) in enumerate(FACTOR_SPEC):
            if i >= len(coef_M) or i >= len(coef_F):
                continue
            c_m, c_f = float(coef_M[i]), float(coef_F[i])
            m_m, m_f = float(mean_M[i]), float(mean_F[i])
            contribution_pln = ((c_m + c_f) / 2.0) * (m_m - m_f)
            if abs(gap_total_pln) < 1e-6:
                contribution_pct = 0.0
            else:
                contribution_pct = (contribution_pln / gap_total_pln) * 100.0

            if abs(contribution_pct) < 1.0:
                direction = "neutralny"
            elif m_m > m_f:
                direction = "niekorzystny"
            else:
                direction = "korzystny"

            contributions_raw.append({
                "factor": factor_label,
                "factor_key": factor_key,
                "contribution_pct": round(contribution_pct, 2),
                "contribution_pln": round(contribution_pln, 2),
                "mean_M": round(m_m, 4),
                "mean_F": round(m_f, 4),
                "direction": direction,
            })

        contributions_raw.sort(key=lambda x: abs(x["contribution_pct"]), reverse=True)
        contributions = contributions_raw

        contributions_summary = ", ".join(
            f"{c['factor']} {c['contribution_pct']:.1f}%" for c in contributions
        )

        narrative_pl = ""
        if settings.OPENAI_API_KEY:
            try:
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                system_content = (
                    "Jesteś analitykiem wynagrodzeń komunikującym wyniki do dyrektora HR. "
                    "Używaj formalnego języka polskiego. Zero żargonu statystycznego."
                )
                user_content = (
                    f"Luka płacowa wynosi {gap_pct:.1f}% ({gap_total_pln:.0f} PLN). "
                    f"Główne przyczyny: {contributions_summary}. "
                    "Napisz dokładnie 3 zdania: (1) główna przyczyna z liczbami, (2) druga przyczyna lub brak istotności, (3) rekomendacja działania. "
                    "Zakończ: 'Analiza zgodna z Art. 9 Dyrektywy UE 2023/970.' Bez punktów, bez nagłówków — tylko paragraf."
                )
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": system_content},
                        {"role": "user", "content": user_content},
                    ],
                    temperature=0.3,
                )
                narrative_pl = (response.choices[0].message.content or "").strip()
            except Exception:
                narrative_pl = (
                    f"Luka płacowa wynosi {gap_pct:.1f}% ({gap_total_pln:.0f} PLN). "
                    f"Główne przyczyny: {contributions_summary}. "
                    "Analiza zgodna z Art. 9 Dyrektywy UE 2023/970."
                )
        else:
            narrative_pl = (
                f"Luka płacowa wynosi {gap_pct:.1f}% ({gap_total_pln:.0f} PLN). "
                f"Główne przyczyny: {contributions_summary}. "
                "Analiza zgodna z Art. 9 Dyrektywy UE 2023/970."
            )

        computed_at = datetime.now(tz=timezone.utc).isoformat()

        result = {
            "gap_total_pln": gap_total_pln,
            "gap_pct": gap_pct,
            "avg_salary_M": round(avg_salary_M, 2),
            "avg_salary_F": round(avg_salary_F, 2),
            "n_employees": n_employees,
            "n_male": n_male,
            "n_female": n_female,
            "contributions": contributions,
            "narrative_pl": narrative_pl,
            "legal_citation": "Art. 9 Dyrektywy UE 2023/970",
            "computed_at": computed_at,
        }

        logger.debug("timing /root-cause/analyze: %.3fs", time.time() - t0)
        return Response(
            content=json.dumps(result, ensure_ascii=False),
            media_type="application/json; charset=utf-8",
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
