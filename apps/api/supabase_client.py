"""
Centralne tworzenie klienta Supabase.
Klucze w formacie sb_... (anon: sb_publi..., service: sb_secre...) wymagają
ClientOptions(auto_refresh_token=False, persist_session=False) w środowisku serwerowym.
Singleton per (url, key) — unika tworzenia klienta przy każdym request.
"""
from typing import Any

from supabase import create_client

try:
    from supabase import ClientOptions
except ImportError:
    try:
        from supabase.lib.client_options import ClientOptions
    except ImportError:
        try:
            from supabase.lib.client_options import SyncClientOptions as ClientOptions
        except ImportError:
            ClientOptions = None

# Singleton cache: (url, key) -> client (reused across requests)
_client_cache: dict[tuple[str, str], Any] = {}


def _client_options() -> Any:
    """Options dla kluczy sb_... w FastAPI (brak sesji przeglądarkowej)."""
    if ClientOptions is None:
        return None
    return ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
    )


def get_supabase_client(url: str, key: str) -> Any:
    """
    Zwraca klienta Supabase (singleton per url+key). Dla kluczy sb_... używa ClientOptions.
    url: SUPABASE_URL; key: SUPABASE_SERVICE_ROLE_KEY lub SUPABASE_KEY (anon).
    """
    if not url or not key:
        raise ValueError("SUPABASE_URL and key are required")
    cache_key = (url, key)
    if cache_key not in _client_cache:
        options = _client_options()
        if options is not None:
            _client_cache[cache_key] = create_client(url, key, options=options)
        else:
            _client_cache[cache_key] = create_client(url, key)
    return _client_cache[cache_key]
