"""
Router Podgląd Załadowanych Danych (Data Table View).
GET /api/data/records — paginated employee records
PATCH /api/data/records/{record_id} — inline edit with audit
"""

import logging
from collections import defaultdict
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from config import settings
from routers.auth import get_current_user
from supabase_client import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/data", tags=["data-preview"])


def _is_male(g: str) -> bool:
    g = (g or "").strip().lower()
    return g in ["mężczyzna", "male", "m", "męzczyzna"]


def _is_female(g: str) -> bool:
    g = (g or "").strip().lower()
    return g in ["kobieta", "female", "f", "k"]


def _evg_score_to_group(score: Optional[float]) -> str:
    """Map EVG score 1-100 to EVG-1, EVG-2, EVG-3."""
    if score is None:
        return "EVG-?"
    if score <= 33:
        return "EVG-1"
    if score <= 66:
        return "EVG-2"
    return "EVG-3"


def _normalize_gender(g: str) -> str:
    if _is_male(g):
        return "M"
    if _is_female(g):
        return "K"
    return (g or "").strip().upper()[:1] or ""


@router.get("/records")
async def get_records(
    user_id: str = Depends(get_current_user),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=50),
    period: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """
    Paginated employee records for Data Table View.
    RODO: masks salary where (evg_group + gender) has N < 3.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase nie jest skonfigurowane.",
        )

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    # Select with reporting_period (required — run migration if missing)
    select_cols = "id, first_name, last_name, position, gender, salary, raw_data, filename, reporting_period"

    query = (
        supabase.table("payroll_data")
        .select(select_cols, count="exact")
        .eq("user_id", user_id)
    )
    try:
        if period:
            query = query.eq("reporting_period", period)
    except Exception as e:
        logger.error("reporting_period filter failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Kolumna reporting_period nie istnieje. Uruchom migrację w Supabase SQL Editor.",
        ) from e

    # Pagination
    start = (page - 1) * per_page
    try:
        query = query.range(start, start + per_page - 1).order("id")
        result = query.execute()
    except Exception as e:
        logger.error("payroll_data query failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Błąd zapytania. Sprawdź czy kolumna reporting_period istnieje (migracja 20260227100000_data_preview.sql).",
        ) from e

    total = result.count if hasattr(result, "count") and result.count is not None else len(result.data or [])

    # Fetch job_valuations for evg_group
    evg_by_position: Dict[str, float] = {}
    try:
        jv = supabase.table("job_valuations").select("position, evg_score").eq("user_id", user_id).execute()
        if jv.data:
            evg_by_position = {r["position"]: float(r.get("evg_score") or 0) for r in jv.data}
    except Exception:
        pass

    rows = result.data or []

    # RODO: count (evg_group, gender) — mask if N < 3
    group_counts: Dict[tuple, int] = defaultdict(int)
    for r in rows:
        pos = r.get("position") or "Unknown"
        evg_score = evg_by_position.get(pos)
        evg_grp = _evg_score_to_group(evg_score)
        g = (r.get("gender") or "").strip().lower()
        gender_key = "M" if _is_male(g) else ("K" if _is_female(g) else "?")
        group_counts[(evg_grp, gender_key)] += 1

    # Build response records
    records: List[Dict[str, Any]] = []
    for r in rows:
        pos = r.get("position") or "Unknown"
        evg_score = evg_by_position.get(pos)
        evg_grp = _evg_score_to_group(evg_score)
        g = r.get("gender") or ""
        gender_key = "M" if _is_male(g) else ("K" if _is_female(g) else "?")
        rodo_masked = group_counts[(evg_grp, gender_key)] < 3

        raw = r.get("raw_data") or {}
        rec: Dict[str, Any] = {
            "id": str(r.get("id", "")),
            "employee_id": str(r.get("id", "")),
            "full_name": f"{(r.get('first_name') or '').strip()} {(r.get('last_name') or '').strip()}".strip() or "—",
            "department": raw.get("department") or raw.get("dział") or raw.get("department"),
            "position_title": pos,
            "evg_group": evg_grp,
            "evg_score": evg_score,
            "gender": g or "—",
            "salary_monthly_gross": None if rodo_masked else (r.get("salary") or None),
            "salary_bonus": None if rodo_masked else (raw.get("salary_bonus") or raw.get("bonus") or None),
            "contract_type": raw.get("contract_type") or raw.get("typ_umowy") or raw.get("contract_type"),
            "reporting_period": r.get("reporting_period", "2025-Q4"),
            "rodo_masked": rodo_masked,
            "raw_data": raw,
            "first_name": r.get("first_name"),
            "last_name": r.get("last_name"),
            "position": pos,
        }
        records.append(rec)

    # Distinct periods (sorted desc)
    try:
        periods_resp = supabase.table("payroll_data").select("reporting_period").eq("user_id", user_id).execute()
        periods_set: set = set()
        for p in (periods_resp.data or []):
            v = p.get("reporting_period")
            if v:
                periods_set.add(str(v))
        periods = sorted(periods_set, reverse=True) if periods_set else ["2025-Q4"]
    except Exception:
        periods = ["2025-Q4"]

    return {
        "records": records,
        "total": total,
        "page": page,
        "per_page": per_page,
        "periods": periods,
    }


class PatchRecordRequest(BaseModel):
    field: str = Field(..., min_length=1)
    new_value: Any = None
    justification: str = Field(..., min_length=20)


FORBIDDEN_FIELDS = {
    "employee_id",
    "evg_group",
    "evg_score",
    "id",
    "organization_id",
}

FIELD_RULES: Dict[str, Dict[str, Any]] = {
    "salary_monthly_gross": {"type": "float", "min": 0.01, "max": 500000},
    "salary_bonus": {"type": "float", "min": 0, "max": 500000},
    "contract_type": {
        "type": "enum",
        "values": ["UoP", "B2B", "UZ", "UoD", "Mianowanie"],
    },
    "gender": {"type": "enum", "values": ["K", "M"]},
    "employment_type": {"type": "enum", "values": ["full-time", "part-time"]},
    "full_name": {"type": "str", "min_len": 2, "max_len": 100},
    "department": {"type": "str", "min_len": 1, "max_len": 100},
    "position_title": {"type": "str", "min_len": 2, "max_len": 150},
}


def validate_field_value(field: str, value: Any) -> str:
    """
    Validate and normalize field value.
    Returns normalized value as str. Raises ValueError on invalid.
    """
    if field in FORBIDDEN_FIELDS:
        raise ValueError(f"Pole '{field}' nie może być edytowane")

    rules = FIELD_RULES.get(field)
    if not rules:
        v = str(value).strip() if value is not None else ""
        if not v:
            raise ValueError("Wartość nie może być pusta")
        if len(v) > 255:
            raise ValueError("Wartość zbyt długa (maks. 255 znaków)")
        return v

    if rules["type"] == "float":
        # salary_bonus is optional
        if field == "salary_bonus" and (value is None or str(value).strip() == ""):
            return ""
        try:
            s = str(value).replace(",", ".").replace(" ", "")
            n = float(s)
        except (ValueError, TypeError):
            raise ValueError(f"Pole '{field}' musi być liczbą")
        if "min" in rules and n < rules["min"]:
            raise ValueError(f"Pole '{field}' musi być >= {rules['min']}")
        if "max" in rules and n > rules["max"]:
            raise ValueError(f"Pole '{field}' musi być <= {rules['max']}")
        return str(round(n, 2))

    if rules["type"] == "enum":
        v = str(value).strip()
        if v not in rules["values"]:
            raise ValueError(
                f"Pole '{field}' musi być jedną z: {', '.join(rules['values'])}"
            )
        return v

    if rules["type"] == "str":
        v = str(value).strip()
        if len(v) < rules.get("min_len", 0):
            raise ValueError(
                f"Pole '{field}' zbyt krótkie (min. {rules['min_len']} znaków)"
            )
        if len(v) > rules.get("max_len", 255):
            raise ValueError(
                f"Pole '{field}' zbyt długie (maks. {rules['max_len']} znaków)"
            )
        return v

    return str(value)


# Map frontend field names to DB column / raw_data key
FIELD_TO_DB: Dict[str, str] = {
    "full_name": "_composite",  # first_name + last_name
    "first_name": "first_name",
    "last_name": "last_name",
    "department": "raw_data.department",
    "position_title": "position",
    "gender": "gender",
    "salary_monthly_gross": "salary",
    "contract_type": "raw_data.contract_type",
    "reporting_period": "reporting_period",
}


@router.patch("/records/{record_id}")
async def patch_record(
    record_id: str,
    body: PatchRecordRequest,
    user_id: str = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Inline edit: update one field. Audit log required.
    FORBIDDEN: employee_id, evg_group, evg_score.
    """
    if body.field.lower() in {f.lower() for f in FORBIDDEN_FIELDS}:
        raise HTTPException(
            status_code=400,
            detail=f"Pole '{body.field}' nie może być edytowane w tym widoku. Użyj flow HITL dla EVG.",
        )

    try:
        normalized_value = validate_field_value(body.field, body.new_value)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e

    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    # Fetch current record
    r = supabase.table("payroll_data").select("id, first_name, last_name, position, gender, salary, raw_data, reporting_period").eq("id", record_id).eq("user_id", user_id).execute()
    if not r.data or len(r.data) == 0:
        raise HTTPException(status_code=404, detail="Nie znaleziono rekordu.")

    row = r.data[0]
    field = body.field

    # Resolve field -> db column and old value
    old_value: Any = None
    update_payload: Dict[str, Any] = {}

    # Use normalized_value from validation above
    val = normalized_value

    if field == "first_name":
        old_value = row.get("first_name")
        update_payload["first_name"] = val
    elif field == "last_name":
        old_value = row.get("last_name")
        update_payload["last_name"] = val
    elif field == "full_name":
        fn = row.get("first_name") or ""
        ln = row.get("last_name") or ""
        old_value = f"{fn} {ln}".strip()
        parts = val.strip().split(maxsplit=1)
        update_payload["first_name"] = parts[0] if parts else ""
        update_payload["last_name"] = parts[1] if len(parts) > 1 else ""
    elif field == "position_title" or field == "position":
        old_value = row.get("position")
        update_payload["position"] = val
    elif field == "gender":
        old_value = row.get("gender")
        update_payload["gender"] = val
    elif field == "salary_monthly_gross" or field == "salary":
        old_value = row.get("salary")
        update_payload["salary"] = float(val)
    elif field == "department":
        raw = dict(row.get("raw_data") or {})
        old_value = raw.get("department")
        raw["department"] = val
        update_payload["raw_data"] = raw
    elif field == "contract_type":
        raw = dict(row.get("raw_data") or {})
        old_value = raw.get("contract_type")
        raw["contract_type"] = val
        update_payload["raw_data"] = raw
    elif field == "reporting_period":
        old_value = row.get("reporting_period")
        update_payload["reporting_period"] = val
    elif field == "salary_bonus":
        raw = dict(row.get("raw_data") or {})
        old_value = raw.get("salary_bonus") or raw.get("bonus")
        if val == "":
            raw.pop("salary_bonus", None)
            raw.pop("bonus", None)
        else:
            raw["salary_bonus"] = val
        update_payload["raw_data"] = raw
    elif field == "employment_type":
        raw = dict(row.get("raw_data") or {})
        old_value = raw.get("employment_type")
        raw["employment_type"] = val
        update_payload["raw_data"] = raw
    else:
        raise HTTPException(status_code=400, detail=f"Nieznane pole do edycji: {field}.")

    # Write audit first
    audit_row = {
        "user_id": user_id,
        "record_id": record_id,
        "field_name": field,
        "old_value": str(old_value) if old_value is not None else "",
        "new_value": normalized_value,
        "justification": body.justification,
        "changed_by": user_id,
    }
    audit_result = supabase.table("data_corrections_audit").insert(audit_row).execute()
    audit_id = None
    if audit_result.data and len(audit_result.data) > 0:
        audit_id = str(audit_result.data[0].get("id", ""))

    # Update payroll_data
    try:
        supabase.table("payroll_data").update(update_payload).eq("id", record_id).eq("user_id", user_id).execute()
    except Exception as e:
        logger.error("patch_record update failed: %s", e)
        raise HTTPException(status_code=500, detail="Błąd zapisu. Spróbuj ponownie.") from e

    return {
        "success": True,
        "audit_entry_id": audit_id,
    }
