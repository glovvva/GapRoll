"""
Health check endpoints - status API i test połączenia z bazą (Supabase).
"""

from fastapi import APIRouter, HTTPException

from config import settings

router = APIRouter()


@router.get("/")
async def health() -> dict[str, str]:
    """
    GET /health/ - podstawowy health check.
    Zwraca status i aktualne środowisko.
    """
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
    }


@router.get("/db")
async def health_db() -> dict[str, str]:
    """
    GET /health/db - test połączenia z Supabase.
    Zwraca {"database": "connected"} lub 503 przy błędzie.
    """
    if not settings.is_supabase_configured():
        raise HTTPException(
            status_code=503,
            detail="Supabase not configured (missing SUPABASE_URL or SUPABASE_KEY)",
        )
    try:
        from supabase import create_client

        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        # Minimalne zapytanie weryfikujące połączenie z API (tabela może nie istnieć)
        client.from_("_health_ping").select("id").limit(1).execute()
    except Exception as e:
        err_msg = str(e).lower()
        # API odpowiedziało (np. relation not found) = połączenie działa
        if "does not exist" in err_msg or "relation" in err_msg or "404" in err_msg:
            return {"database": "connected"}
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}",
        ) from e
    return {"database": "connected"}
