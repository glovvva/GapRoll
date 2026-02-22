"""
Konfiguracja środowiska - zmienne z .env (python-dotenv).
Singleton Settings bez pydantic-settings, tylko os.getenv.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

# Ładowanie .env przy imporcie modułu
load_dotenv()


class Settings:
    """
    Klasa konfiguracji z walidacją wymaganych zmiennych.
    Używa wyłącznie os.getenv (bez pydantic-settings).
    """

    def __init__(self) -> None:
        self._supabase_url: str | None = None
        self._supabase_key: str | None = None
        self._supabase_service_role_key: str | None = None
        self._supabase_jwt_secret: str = ""
        self._environment: str | None = None
        self._openai_api_key: str = ""
        self._load()

    def _load(self) -> None:
        """Wczytaj i zwaliduj zmienne środowiskowe."""
        self._supabase_url = os.getenv("SUPABASE_URL", "").strip() or None
        self._supabase_key = os.getenv("SUPABASE_KEY", "").strip() or None
        self._supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or None
        self._supabase_jwt_secret = (
            os.getenv("SUPABASE_JWT_SECRET", "").strip() or ""
        )
        self._environment = (
            os.getenv("ENVIRONMENT", "development").strip() or "development"
        )
        self._openai_api_key = os.getenv("OPENAI_API_KEY", "").strip() or ""

    @property
    def SUPABASE_URL(self) -> str | None:
        """URL projektu Supabase."""
        return self._supabase_url

    @property
    def SUPABASE_KEY(self) -> str | None:
        """Klucz anon Supabase."""
        return self._supabase_key

    @property
    def SUPABASE_SERVICE_ROLE_KEY(self) -> str | None:
        """Klucz service_role Supabase (pomija RLS). Używany przez backend do odczytu profiles itd."""
        return self._supabase_service_role_key

    @property
    def ENVIRONMENT(self) -> str:
        """Środowisko: development, staging, production."""
        return self._environment

    @property
    def OPENAI_API_KEY(self) -> str:
        """Klucz API OpenAI (opcjonalny, do EVG scoringu)."""
        return self._openai_api_key

    @property
    def SUPABASE_JWT_SECRET(self) -> str:
        """JWT Secret z Supabase Dashboard (Settings → API)."""
        return self._supabase_jwt_secret

    def is_supabase_configured(self) -> bool:
        """Czy Supabase jest skonfigurowane (URL i KEY ustawione)."""
        return bool(self._supabase_url and self._supabase_key)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton - jedna instancja Settings dla aplikacji."""
    return Settings()


# Singleton - jedna instancja dla całej aplikacji
# Użycie: from config import settings; settings.ENVIRONMENT, settings.SUPABASE_URL, ...
settings = get_settings()
