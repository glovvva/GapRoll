# -*- coding: utf-8 -*-
"""
Database Client Module
======================
Zarządzanie połączeniem z Supabase (singleton pattern).

Functions:
    - get_supabase_client() -> Client
    - get_supabase_admin_client() -> Optional[Client]
"""

import streamlit as st
from supabase import create_client, Client
from typing import Optional


def get_supabase_client() -> Client:
    """
    Zwraca singleton klienta Supabase.
    Dane połączenia pobierane wyłącznie z st.secrets.
    
    Wymagane sekrety w .streamlit/secrets.toml:
        [supabase]
        url = "https://xxx.supabase.co"
        key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # opcjonalne, dla operacji admin
    
    Returns:
        Client: Zainicjalizowany klient Supabase
    
    Raises:
        ValueError: Gdy brak wymaganych sekretów
    """
    # Sprawdź czy klient już istnieje w session_state (singleton pattern)
    if 'supabase_client' in st.session_state and st.session_state.supabase_client is not None:
        return st.session_state.supabase_client
    
    # Pobierz dane z st.secrets
    try:
        supabase_url = st.secrets["supabase"]["url"]
        supabase_key = st.secrets["supabase"]["key"]
    except KeyError as e:
        raise ValueError(
            f"Brak wymaganej konfiguracji Supabase w st.secrets: {e}. "
            "Dodaj sekcję [supabase] z 'url' i 'key' w .streamlit/secrets.toml"
        )
    
    if not supabase_url or not supabase_key:
        raise ValueError(
            "Supabase URL i Key nie mogą być puste. "
            "Sprawdź konfigurację w .streamlit/secrets.toml"
        )
    
    # Tworzenie klienta
    client = create_client(supabase_url, supabase_key)
    st.session_state.supabase_client = client
    
    return client


def get_supabase_admin_client() -> Optional[Client]:
    """
    Zwraca klienta Supabase z service_role_key (uprawnienia administracyjne).
    Używać tylko do operacji wymagających obejścia RLS.
    
    Returns:
        Client | None: Klient admin lub None jeśli brak klucza
    """
    if 'supabase_admin_client' in st.session_state and st.session_state.supabase_admin_client is not None:
        return st.session_state.supabase_admin_client
    
    try:
        supabase_url = st.secrets["supabase"]["url"]
        service_role_key = st.secrets["supabase"]["service_role_key"]
    except KeyError:
        return None
    
    if not service_role_key:
        return None
    
    admin_client = create_client(supabase_url, service_role_key)
    st.session_state.supabase_admin_client = admin_client
    
    return admin_client
