"""
EVG Manual Override — HITL (Human-in-the-Loop) per EU AI Act Art. 14.
POST /evg/override: zapis ręcznej korekty oceny z uzasadnieniem i audit trail.
"""

import logging
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)

SENTINEL_UUID = "00000000-0000-0000-0000-000000000000"
from pydantic import BaseModel, ConfigDict, Field, field_validator
from starlette.requests import Request

from limiter import limiter
from routers.auth import get_current_user
from utils.audit import log_audit_event
from config import settings
from supabase_client import get_supabase_client

router = APIRouter(prefix="/evg", tags=["evg"])


class NewAxes(BaseModel):
    """Each axis 0-25; values coerced to int (frontend may send numbers from JSON)."""
    skills: int = Field(..., ge=0, le=25)
    effort: int = Field(..., ge=0, le=25)
    responsibility: int = Field(..., ge=0, le=25)
    conditions: int = Field(..., ge=0, le=25)

    @field_validator("skills", "effort", "responsibility", "conditions", mode="before")
    @classmethod
    def coerce_int(cls, v: Any) -> int:
        if isinstance(v, int):
            return v
        if isinstance(v, float):
            return int(round(v))
        if isinstance(v, str) and v.strip().lstrip("-").isdigit():
            return int(v.strip())
        return v  # let Pydantic raise if not int


def _sanitize_text(v):  # noqa: ANN001
    if not isinstance(v, str):
        return v
    dangerous_sql = [
        "--", ";--", "/*", "*/", "xp_",
        "EXEC ", "DROP ", "DELETE ", "INSERT ", "UPDATE ", "UNION ",
    ]
    v_upper = v.upper()
    if any(d in v_upper for d in dangerous_sql):
        raise ValueError("Invalid characters detected")
    if "<script" in v.lower() or "javascript:" in v.lower() or "onerror=" in v.lower():
        raise ValueError("HTML/JS not allowed")
    return v.strip()


class OverrideRequest(BaseModel):
    """Request body: snake_case (position_id, new_axes, justification). Aliases accept camelCase."""
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    position_id: str = Field(..., alias="positionId", max_length=200)
    new_axes: NewAxes = Field(..., alias="newAxes")
    justification: str = Field(..., min_length=20, max_length=2000, alias="reason")

    @field_validator("justification", mode="before")
    @classmethod
    def sanitize_justification(cls, v):  # noqa: ANN001
        if isinstance(v, str):
            return _sanitize_text(v)
        return v


def _get_old_evg(supabase: Any, user_id: str, position_id: str) -> tuple[float, dict]:
    """Pobierz bieżącą ocenę z evg_scores lub job_valuations. Zwraca (old_score, old_axes)."""
    old_axes = {"skills": 0, "effort": 0, "responsibility": 0, "conditions": 0}
    old_score = 0.0

    try:
        r = (
            supabase.table("evg_scores")
            .select("evg_score, skills, effort, responsibility, conditions")
            .eq("position_id", position_id)
            .eq("user_id", user_id)
            .execute()
        )
        if r.data and len(r.data) > 0:
            row = r.data[0]
            old_score = float(row.get("evg_score") or 0)
            old_axes = {
                "skills": int(row.get("skills") or 0),
                "effort": int(row.get("effort") or 0),
                "responsibility": int(row.get("responsibility") or 0),
                "conditions": int(row.get("conditions") or 0),
            }
            return old_score, old_axes
    except Exception:
        pass

    try:
        r = (
            supabase.table("job_valuations")
            .select("evg_score, skills, effort, responsibility, conditions")
            .eq("position", position_id)
            .eq("user_id", user_id)
            .execute()
        )
        if r.data and len(r.data) > 0:
            row = r.data[0]
            old_score = float(row.get("evg_score") or 0)
            old_axes = {
                "skills": int(row.get("skills") or 0),
                "effort": int(row.get("effort") or 0),
                "responsibility": int(row.get("responsibility") or 0),
                "conditions": int(row.get("conditions") or 0),
            }
            return old_score, old_axes
    except Exception:
        pass

    return old_score, old_axes


@router.post("/override")
@limiter.limit("60/minute")
async def evg_override(
    request: Request,
    body: OverrideRequest,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Zapis ręcznej korekty oceny EVG z uzasadnieniem (audit trail).
    Wymaga: osie 0–25, suma ≤ 100, uzasadnienie min. 20 znaków.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase nie jest skonfigurowane.",
        )

    axes = body.new_axes
    total = axes.skills + axes.effort + axes.responsibility + axes.conditions
    if total > 100:
        raise HTTPException(
            status_code=400,
            detail="Suma osi nie może przekraczać 100.",
        )

    # justification already stripped by model validator; min_length=20 enforced by Pydantic
    justification = body.justification
    if len(justification) < 20:
        raise HTTPException(
            status_code=400,
            detail="Uzasadnienie musi mieć co najmniej 20 znaków.",
        )

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    old_score, old_axes = _get_old_evg(supabase, user_id, body.position_id)
    new_score = float(total)
    new_axes = {
        "skills": axes.skills,
        "effort": axes.effort,
        "responsibility": axes.responsibility,
        "conditions": axes.conditions,
    }

    audit_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    try:
        supabase.table("evg_audit_log").insert(
            {
                "id": audit_id,
                "position_id": body.position_id,
                "old_score": old_score,
                "new_score": new_score,
                "old_axes": old_axes,
                "new_axes": new_axes,
                "justification": justification,
                "changed_by": user_id,
                "changed_at": now,
                "module": "pay_transparency",
            }
        ).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Nie udało się zapisać wpisu audytu: {str(e)}",
        ) from e

    try:
        existing = (
            supabase.table("evg_scores")
            .select("id")
            .eq("position_id", body.position_id)
            .eq("user_id", user_id)
            .execute()
        )
        if existing.data and len(existing.data) > 0:
            supabase.table("evg_scores").update(
                {
                    "evg_score": new_score,
                    "skills": axes.skills,
                    "effort": axes.effort,
                    "responsibility": axes.responsibility,
                    "conditions": axes.conditions,
                    "is_overridden": True,
                    "overridden_by": user_id,
                    "overridden_at": now,
                    "module": "pay_transparency",
                }
            ).eq("position_id", body.position_id).eq("user_id", user_id).execute()
        else:
            supabase.table("evg_scores").insert(
                {
                    "id": str(uuid.uuid4()),
                    "position_id": body.position_id,
                    "user_id": user_id,
                    "evg_score": new_score,
                    "skills": axes.skills,
                    "effort": axes.effort,
                    "responsibility": axes.responsibility,
                    "conditions": axes.conditions,
                    "ai_confidence": 0.0,
                    "is_overridden": True,
                    "overridden_by": user_id,
                    "overridden_at": now,
                    "module": "pay_transparency",
                }
            ).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Nie udało się zaktualizować oceny: {str(e)}",
        ) from e

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="evg.override_applied",
            resource_type="evg_score",
            resource_id=audit_id,
            metadata={"reason": body.justification},
            request=request,
        )
    except Exception:
        pass

    return {
        "success": True,
        "new_score": new_score,
        "audit_id": audit_id,
        "new_axes": new_axes,
    }


# Sentinel position_id for session-level approval (HITL checkpoint)
SESSION_APPROVAL_POSITION_ID = "__session__"


@router.post("/approve-session")
@limiter.limit("60/minute")
async def approve_evg_session(
    request: Request,
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Zapis zatwierdzenia całej sesji wartościowania EVG (EU AI Act Art. 14 — HITL).
    Zapisuje wpis w evg_audit_log jako checkpoint przed raportem Art. 16.
    """
    logger.error("approve-session: user_id=%s, type=%s", user_id, type(user_id).__name__)

    if user_id == SENTINEL_UUID:
        raise HTTPException(
            status_code=401,
            detail="Brak autoryzacji — zaloguj się ponownie",
        )

    if not settings.is_supabase_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase nie jest skonfigurowane.",
        )
    now = datetime.utcnow().isoformat() + "Z"
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    try:
        supabase.table("evg_audit_log").insert(
            {
                "id": str(uuid.uuid4()),
                "position_id": SESSION_APPROVAL_POSITION_ID,
                "old_score": 0,
                "new_score": 0,
                "old_axes": {},
                "new_axes": {},
                "justification": "Session approved",
                "changed_by": user_id,
                "changed_at": now,
                "module": "pay_transparency",
            }
        ).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Nie udało się zapisać zatwierdzenia sesji: {str(e)}",
        ) from e

    session_id = str(uuid.uuid4())
    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="evg.override_approved",
            resource_type="evg_session",
            resource_id=session_id,
            request=request,
        )
    except Exception:
        pass

    return {"status": "approved", "approved_at": now}


@router.get("/approval-status")
async def get_evg_approval_status(
    user_id: str = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Zwraca czy użytkownik zatwierdził sesję wartościowania EVG (do ostrzeżenia na raporcie Art. 16).
    """
    if not settings.is_supabase_configured():
        return {"approved": False, "approved_at": None}
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    try:
        r = (
            supabase.table("evg_audit_log")
            .select("changed_at")
            .eq("position_id", SESSION_APPROVAL_POSITION_ID)
            .eq("changed_by", user_id)
            .order("changed_at", desc=True)
            .limit(1)
            .execute()
        )
        if r.data and len(r.data) > 0:
            return {
                "approved": True,
                "approved_at": r.data[0].get("changed_at"),
            }
    except Exception:
        pass
    return {"approved": False, "approved_at": None}
