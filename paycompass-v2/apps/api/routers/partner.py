"""
Partner Portal API — biura rachunkowe (resellerzy GapRoll).
GET /partner/clients, POST /partner/onboard-client, GET /partner/mrr.
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from routers.auth import get_current_user
from config import settings
from supabase import create_client

router = APIRouter(prefix="/partner", tags=["partner"])
logger = logging.getLogger(__name__)

PARTNER_REVENUE = {"compliance": 50.0, "strategia": 100.0}


async def get_current_partner(
    user_id: str = Depends(get_current_user),
) -> str:
    user_id = (user_id or "").strip()
    if not user_id or user_id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Nieprawidłowy token.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = create_client(settings.SUPABASE_URL, key)

    try:
        r = (
            supabase.table("profiles")
            .select("id, role")
            .eq("id", user_id)
            .execute()
        )
        if not r.data:
            raise HTTPException(status_code=403, detail="Brak profilu partnera.")
        role = (r.data[0].get("role") or "").strip().lower()
        if role != "partner":
            raise HTTPException(status_code=403, detail="Brak profilu partnera.")
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR get_current_partner: {e}")
        raise HTTPException(status_code=403, detail="Brak dostępu.") from e


# --- NIP checksum (Poland) ---
def _validate_nip(nip: str) -> bool:
    digits = "".join(c for c in nip if c.isdigit())
    if len(digits) != 10:
        return False
    weights = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    total = sum(int(digits[i]) * weights[i] for i in range(9))
    remainder = total % 11
    check = 0 if remainder == 10 else remainder
    return int(digits[9]) == check


class OnboardClientRequest(BaseModel):
    company_name: str = Field(..., min_length=1)
    nip: str = Field(..., min_length=10, max_length=10)  # 10 digits, validated in handler
    email: EmailStr
    employee_count: int = Field(..., ge=50)
    tier: str = Field(..., pattern="^(compliance|strategia)$")


def _subscription_status(sub: dict, now: datetime) -> str:
    st = (sub.get("status") or "").strip().lower()
    if st == "active":
        return "active"
    if st in ("cancelled", "inactive"):
        return "inactive"
    trial_ends = sub.get("trial_ends_at")
    if trial_ends:
        try:
            end = datetime.fromisoformat(trial_ends.replace("Z", "+00:00"))
            if end < now.astimezone(end.tzinfo):
                return "inactive"
        except Exception:
            pass
    return "trial"


@router.get("/clients")
async def get_clients(
    partner_id: str = Depends(get_current_partner),
) -> dict[str, Any]:
    """Lista klientów partnera (companies gdzie partner_id = current user)."""
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = create_client(settings.SUPABASE_URL, key)
    try:
        r = (
            supabase.table("companies")
            .select("id, name, nip, employee_count, tier, created_at")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        print(f"ERROR get_clients: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

    rows = r.data or []
    company_ids = [row.get("id") for row in rows if row.get("id")]
    subs_by_company: dict[str, dict] = {}
    if company_ids:
        try:
            sub_r = (
                supabase.table("subscriptions")
                .select("company_id, status, trial_ends_at")
                .in_("company_id", company_ids)
                .execute()
            )
            for s in sub_r.data or []:
                cid = s.get("company_id")
                if cid:
                    subs_by_company[cid] = s
        except Exception:
            pass

    now = datetime.utcnow()
    clients = []
    for row in rows:
        cid = row.get("id")
        sub = subs_by_company.get(cid) or {}
        status = _subscription_status(sub, now)
        tier = (row.get("tier") or "compliance").strip().lower()
        if tier not in PARTNER_REVENUE:
            tier = "compliance"
        revenue = PARTNER_REVENUE[tier] if status in ("active", "trial") else 0.0
        clients.append({
            "id": cid,
            "company_name": row.get("name") or "",
            "nip": row.get("nip") or "",
            "employee_count": int(row.get("employee_count") or 0),
            "tier": tier,
            "status": status,
            "joined_at": row.get("created_at") or "",
            "partner_revenue_pln": revenue,
        })
    return {"clients": clients}


@router.post("/onboard-client")
async def onboard_client(
    body: OnboardClientRequest,
    partner_id: str = Depends(get_current_partner),
) -> dict[str, Any]:
    """
    Dodaj klienta: utwórz firmę, subskrypcję trial, wyślij zaproszenie e-mail.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    nip_clean = "".join(c for c in body.nip if c.isdigit())
    if len(nip_clean) != 10 or not _validate_nip(nip_clean):
        raise HTTPException(status_code=400, detail="Nieprawidłowy NIP (wymagane 10 cyfr i poprawna suma kontrolna).")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = create_client(settings.SUPABASE_URL, key)

    # Invite user via Supabase Auth (admin API)
    welcome_email_sent = False
    try:
        supabase.auth.admin.invite_user_by_email(body.email)
        welcome_email_sent = True
    except Exception:
        # Continue anyway; company/subscription still created (e.g. user already exists)
        pass

    company_id = str(uuid.uuid4())
    now = datetime.utcnow()
    trial_ends = now + timedelta(days=14)

    try:
        supabase.table("companies").insert({
            "id": company_id,
            "name": body.company_name.strip(),
            "nip": nip_clean,
            "employee_count": body.employee_count,
            "tier": body.tier,
            "partner_id": partner_id,
            "created_at": now.isoformat() + "Z",
        }).execute()
    except Exception as e:
        logger.exception("companies insert failed: %s", e)
        raise HTTPException(status_code=500, detail="Nie udało się utworzyć firmy.") from e

    try:
        supabase.table("subscriptions").insert({
            "id": str(uuid.uuid4()),
            "company_id": company_id,
            "tier": body.tier,
            "status": "trial",
            "trial_ends_at": trial_ends.isoformat() + "Z",
            "created_at": now.isoformat() + "Z",
        }).execute()
    except Exception as e:
        print(f"ERROR subscriptions insert: {e}")
        raise HTTPException(status_code=500, detail="Nie udało się utworzyć subskrypcji.") from e

    return {
        "success": True,
        "client_id": company_id,
        "welcome_email_sent": welcome_email_sent,
    }


@router.get("/mrr")
async def get_mrr(
    partner_id: str = Depends(get_current_partner),
) -> dict[str, Any]:
    """Aktywni klienci, suma przychodu partnera (MRR), wypłata w bieżącym miesiącu."""
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = create_client(settings.SUPABASE_URL, key)
    try:
        r = (
            supabase.table("companies")
            .select("id, tier")
            .eq("partner_id", partner_id)
            .execute()
        )
    except Exception as e:
        print(f"ERROR get_mrr companies: {e}")
        return {"active_clients": 0, "partner_mrr": 0.0, "payout_this_month": 0.0}

    companies = r.data or []
    # For each company, check subscription status
    active_count = 0
    partner_mrr = 0.0
    for row in companies:
        sub_r = (
            supabase.table("subscriptions")
            .select("status, trial_ends_at")
            .eq("company_id", row.get("id"))
            .execute()
        )
        sub_data = (sub_r.data or [])
        sub = sub_data[0] if sub_data else {}
        st = (sub.get("status") or "").strip().lower()
        trial_ends = sub.get("trial_ends_at")
        is_active = st == "active"
        is_trial = st == "trial"
        if trial_ends and is_trial:
            try:
                if datetime.fromisoformat(trial_ends.replace("Z", "+00:00")) < datetime.now().astimezone():
                    is_trial = False
            except Exception:
                pass
        if is_active or is_trial:
            active_count += 1
            tier = (row.get("tier") or "compliance").strip().lower()
            partner_mrr += PARTNER_REVENUE.get(tier, 50.0)

    # Wypłata w tym miesiącu: z partner_payouts lub przybliżenie (MRR)
    payout_this_month = partner_mrr
    try:
        pay_r = (
            supabase.table("partner_payouts")
            .select("amount_pln")
            .eq("partner_id", partner_id)
            .eq("month", datetime.utcnow().strftime("%Y-%m-01"))
            .execute()
        )
        if pay_r.data and len(pay_r.data) > 0:
            payout_this_month = float(pay_r.data[0].get("amount_pln") or partner_mrr)
    except Exception:
        pass

    return {
        "active_clients": active_count,
        "partner_mrr": round(partner_mrr, 2),
        "payout_this_month": round(payout_this_month, 2),
    }
