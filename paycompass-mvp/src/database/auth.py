# -*- coding: utf-8 -*-
"""
Database Auth Module
====================
Autentykacja użytkowników przez Supabase Auth.
Zarządza session_state dla Streamlit (authenticated, user_id, company_id).

Functions:
    - init_auth_session() -> None
    - login_user(email, password) -> bool
    - logout_user() -> None
    - register_user(email, password, company_id=None) -> bool
    - get_current_user() -> Optional[Dict]
    - require_auth() -> bool
"""

import streamlit as st
from typing import Optional, Dict
from .client import get_supabase_client


def init_auth_session():
    """Inicjalizuje zmienne sesji dla autoryzacji."""
    defaults = {
        'authenticated': False,
        'user': None,
        'user_id': None,
        'company_id': None,
        'user_email': None,
        'auth_error': None,
    }
    for key, default_value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default_value


def login_user(email: str, password: str) -> bool:
    """
    Loguje użytkownika przez Supabase Auth (Email/Password).
    Po zalogowaniu przypisuje company_id do sesji.
    
    Args:
        email: Adres email użytkownika
        password: Hasło
    
    Returns:
        bool: True jeśli logowanie się powiodło
    """
    from .audit import log_action
    
    init_auth_session()
    
    try:
        client = get_supabase_client()
        response = client.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if response.user:
            st.session_state.authenticated = True
            st.session_state.user = response.user
            st.session_state.user_id = response.user.id
            st.session_state.user_email = response.user.email
            st.session_state.auth_error = None
            
            # Pobierz company_id z metadanych użytkownika lub z tabeli profiles
            company_id = _fetch_user_company_id(response.user.id)
            st.session_state.company_id = company_id
            
            # Loguj akcję logowania
            log_action(
                user_id=response.user.id,
                company_id=company_id,
                action_type='USER_LOGIN',
                details={'email': email, 'method': 'email_password'}
            )
            
            return True
        else:
            st.session_state.auth_error = "Nieprawidłowe dane logowania"
            return False
            
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg:
            st.session_state.auth_error = "Nieprawidłowy email lub hasło"
        elif "Email not confirmed" in error_msg:
            st.session_state.auth_error = "Email nie został potwierdzony. Sprawdź skrzynkę."
        else:
            st.session_state.auth_error = f"Błąd logowania: {error_msg}"
        return False


def logout_user():
    """Wylogowuje użytkownika i czyści sesję."""
    from .audit import log_action
    
    try:
        # Loguj akcję przed wylogowaniem
        if st.session_state.get('authenticated') and st.session_state.get('user_id'):
            log_action(
                user_id=st.session_state.user_id,
                company_id=st.session_state.company_id,
                action_type='USER_LOGOUT',
                details={'email': st.session_state.get('user_email')}
            )
        
        client = get_supabase_client()
        client.auth.sign_out()
    except Exception:
        pass  # Ignoruj błędy przy wylogowaniu
    
    # Wyczyść sesję
    for key in ['authenticated', 'user', 'user_id', 'company_id', 'user_email', 'auth_error']:
        if key in st.session_state:
            st.session_state[key] = None
    st.session_state.authenticated = False


def register_user(email: str, password: str, company_id: str = None) -> bool:
    """
    Rejestruje nowego użytkownika.
    
    Args:
        email: Adres email
        password: Hasło (min. 6 znaków)
        company_id: Opcjonalne ID firmy do przypisania
    
    Returns:
        bool: True jeśli rejestracja się powiodła
    """
    from .audit import log_action
    
    init_auth_session()
    
    try:
        client = get_supabase_client()
        
        # Metadane użytkownika z company_id
        user_metadata = {}
        if company_id:
            user_metadata['company_id'] = company_id
        
        response = client.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": user_metadata
            }
        })
        
        if response.user:
            st.session_state.auth_error = None
            
            # Loguj akcję rejestracji (przez admin client jeśli dostępny)
            log_action(
                user_id=response.user.id,
                company_id=company_id,
                action_type='USER_REGISTER',
                details={'email': email}
            )
            
            return True
        else:
            st.session_state.auth_error = "Rejestracja nie powiodła się"
            return False
            
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            st.session_state.auth_error = "Ten email jest już zarejestrowany"
        elif "password" in error_msg.lower():
            st.session_state.auth_error = "Hasło musi mieć min. 6 znaków"
        else:
            st.session_state.auth_error = f"Błąd rejestracji: {error_msg}"
        return False


def _fetch_user_company_id(user_id: str) -> Optional[str]:
    """
    Pobiera company_id dla użytkownika z tabeli profiles lub metadanych.
    
    Args:
        user_id: UUID użytkownika
    
    Returns:
        str | None: company_id lub None
    """
    try:
        client = get_supabase_client()
        
        # Najpierw sprawdź metadane użytkownika
        user = client.auth.get_user()
        if user and user.user and user.user.user_metadata:
            company_id = user.user.user_metadata.get('company_id')
            if company_id:
                return company_id
        
        # Alternatywnie: pobierz z tabeli profiles (jeśli istnieje)
        try:
            response = client.table('profiles').select('company_id').eq('id', user_id).single().execute()
            if response.data and response.data.get('company_id'):
                return response.data['company_id']
        except Exception:
            pass  # Tabela profiles może nie istnieć
        
        return None
        
    except Exception:
        return None


def get_current_user() -> Optional[Dict]:
    """
    Zwraca dane aktualnie zalogowanego użytkownika.
    
    Returns:
        dict | None: Słownik z danymi użytkownika lub None
    """
    if not st.session_state.get('authenticated'):
        return None
    
    return {
        'id': st.session_state.get('user_id'),
        'email': st.session_state.get('user_email'),
        'company_id': st.session_state.get('company_id'),
    }


def require_auth() -> bool:
    """
    Sprawdza czy użytkownik jest zalogowany.
    Użyj na początku chronionych stron.
    
    Returns:
        bool: True jeśli użytkownik jest zalogowany
    """
    init_auth_session()
    return st.session_state.get('authenticated', False)
