"""
Centralized audit logging for RODO/GDPR compliance.
Logs to audit_log table; failures must never crash the main request.
"""
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


async def log_audit_event(
    supabase_client,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    metadata: Optional[Dict[str, Any]] = None,
    request=None,
):
    """
    Log compliance-relevant events to audit_log table.

    Actions used in GapRoll:
    - partner.onboard_client
    - rodo.view_salary_data
    - evg.score_calculated
    - evg.override_applied
    - evg.override_approved
    - report.art16_exported
    - subscription.changed
    """
    try:
        ip_address = None
        user_agent = None
        if request:
            ip_address = getattr(getattr(request, "client", None), "host", None)
            user_agent = request.headers.get("user-agent") if hasattr(request, "headers") else None

        supabase_client.table("audit_log").insert(
            {
                "user_id": str(user_id),
                "action": action,
                "resource_type": resource_type,
                "resource_id": str(resource_id),
                "metadata": metadata or {},
                "ip_address": ip_address,
                "user_agent": user_agent,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

    except Exception as e:
        # Audit failure must NEVER crash the main request
        logger.error("Audit log failed | action=%s resource=%s error=%s", action, resource_id, e)
