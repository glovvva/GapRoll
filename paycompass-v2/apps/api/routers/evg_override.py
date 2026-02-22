"""
EVG Manual Override — HITL (Human-in-the-Loop) per EU AI Act Art. 14.
POST /evg/override: zapis ręcznej korekty oceny z uzasadnieniem i audit trail.
"""

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator

from routers.auth import get_current_user
from config import settings
from supabase import create_client

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


class OverrideRequest(BaseModel):
    """Request body: snake_case (position_id, new_axes, justification). Aliases accept camelCase."""
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    position_id: str = Field(..., alias="positionId")  # position name (TEXT)
    new_axes: NewAxes = Field(..., alias="newAxes")
    justification: str = Field(..., min_length=20, alias="reason")

    @field_validator("justification", mode="before")
    @classmethod
    def strip_justification(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
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
async def evg_override(
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
    supabase = create_client(settings.SUPABASE_URL, key)
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

    return {
        "success": True,
        "new_score": new_score,
        "audit_id": audit_id,
        "new_axes": new_axes,
    }
