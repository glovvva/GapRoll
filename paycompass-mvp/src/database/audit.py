# -*- coding: utf-8 -*-
"""
Database Audit Module
=====================
Immutable audit log - każda istotna akcja w systemie jest logowana.

Functions:
    - log_action(user_id, company_id, action_type, details) -> bool
    - get_audit_logs(company_id, limit, action_types, start_date, end_date) -> List[Dict]

Constants:
    - AUDIT_ACTION_TYPES: Lista dozwolonych typów akcji
"""

import streamlit as st
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from .client import get_supabase_client, get_supabase_admin_client


# Dozwolone typy akcji w systemie
AUDIT_ACTION_TYPES = [
    'USER_LOGIN',
    'USER_LOGOUT', 
    'USER_REGISTER',
    'FILE_UPLOAD',
    'FILE_DOWNLOAD',
    'PDF_GENERATED',
    'REPORT_DOWNLOADED',
    'B2B_PARAMETER_CHANGE',
    'SCORING_MODEL_APPROVED',
    'MANUAL_OVERRIDE',
    'DATA_EXPORT',
    'RLS_QUERY',
    'ADMIN_ACTION',
    # Multi-tenancy
    'TENANT_CREATED',
    'TENANT_SWITCHED',
    'PROJECT_CREATED',
    'ORGANIZATION_CREATED',
    # Job Valuations (EU Standard Grader)
    'JOB_VALUATION_SAVED',
    'JOB_VALUATIONS_DELETED',
    'JOB_GRADING_STARTED',
    'JOB_GRADING_COMPLETED',
    # Analysis
    'ANALYSIS_METHOD_CHANGED',
]


def log_action(
    user_id: str,
    company_id: str,
    action_type: str,
    details: Dict[str, Any] = None
) -> bool:
    """
    Zapisuje wpis do immutable Audit Log.
    
    Każda istotna zmiana w systemie (upload pliku, zmiana parametrów B2B, 
    pobranie PDF) generuje wpis w tabeli audit_logs.
    
    Args:
        user_id: UUID użytkownika wykonującego akcję
        company_id: UUID firmy (dla filtrowania RLS)
        action_type: Typ akcji (np. 'MANUAL_OVERRIDE', 'FILE_UPLOAD')
        details: Dodatkowe szczegóły w formacie JSON
    
    Returns:
        bool: True jeśli zapis się powiódł
    
    Tabela audit_logs powinna zawierać:
        - id (UUID, PK)
        - timestamp (TIMESTAMPTZ)
        - user_id (UUID, FK do auth.users)
        - company_id (UUID, FK do companies)
        - action_type (TEXT)
        - details (JSONB)
        - ip_hash (TEXT, opcjonalne - zhashowany IP)
    """
    if not user_id or not action_type:
        return False
    
    # Walidacja action_type
    if action_type not in AUDIT_ACTION_TYPES:
        # Pozwól na niestandardowe typy, ale zaloguj ostrzeżenie
        pass
    
    try:
        # Użyj admin client do zapisu (obejście RLS na audit_logs)
        client = get_supabase_admin_client()
        if client is None:
            client = get_supabase_client()
        
        # Przygotuj dane do zapisu
        audit_entry = {
            'user_id': user_id,
            'company_id': company_id,
            'action_type': action_type,
            'details': json.dumps(details, ensure_ascii=False, default=str) if details else None,
            'created_at': datetime.utcnow().isoformat(),
        }
        
        # Zapis do tabeli
        response = client.table('audit_logs').insert(audit_entry).execute()
        
        return response.data is not None
        
    except Exception as e:
        # W przypadku błędu - loguj lokalnie (fallback)
        _log_audit_fallback(user_id, company_id, action_type, details, str(e))
        return False


def _log_audit_fallback(user_id: str, company_id: str, action_type: str, details: Dict, error: str):
    """
    Fallback: loguje do session_state gdy zapis do DB się nie powiedzie.
    Pozwala na późniejszą synchronizację.
    """
    if 'audit_log_fallback' not in st.session_state:
        st.session_state.audit_log_fallback = []
    
    st.session_state.audit_log_fallback.append({
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id,
        'company_id': company_id,
        'action_type': action_type,
        'details': details,
        'db_error': error,
    })


def get_audit_logs(
    company_id: str,
    limit: int = 100,
    action_types: List[str] = None,
    start_date: datetime = None,
    end_date: datetime = None
) -> List[Dict]:
    """
    Pobiera logi audytowe dla firmy (filtrowane przez RLS).
    
    Args:
        company_id: UUID firmy
        limit: Maksymalna liczba rekordów
        action_types: Opcjonalna lista typów akcji do filtrowania
        start_date: Opcjonalna data początkowa
        end_date: Opcjonalna data końcowa
    
    Returns:
        list[dict]: Lista wpisów audit log
    """
    try:
        client = get_supabase_client()
        
        query = client.table('audit_logs').select('*').eq('company_id', company_id)
        
        if action_types:
            query = query.in_('action_type', action_types)
        
        if start_date:
            query = query.gte('created_at', start_date.isoformat())
        
        if end_date:
            query = query.lte('created_at', end_date.isoformat())
        
        query = query.order('created_at', desc=True).limit(limit)
        
        response = query.execute()
        return response.data if response.data else []
        
    except Exception:
        return []
