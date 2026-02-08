# -*- coding: utf-8 -*-
"""
Database Projects Module
========================
Multi-tenancy, zarządzanie projektami, job valuations, employees data.

Functions:
    - get_user_projects(user_id) -> List[Dict]
    - initialize_default_tenant(user_id, email) -> Optional[Dict]
    - set_project_context(project_id) -> bool
    - get_active_project() -> Optional[Dict]
    - switch_project(project_id) -> bool
    - save_job_valuation(project_id, job_data) -> Optional[Dict]
    - save_job_valuations_batch(project_id, valuations) -> int
    - get_project_valuations(project_id) -> List[Dict]
    - get_valuation_by_job_title(project_id, job_title) -> Optional[Dict]
    - delete_project_valuations(project_id) -> bool
    - get_valuations_statistics(project_id) -> Dict
    - save_employees_to_project(project_id, df, source_filename) -> int
    - get_project_employees(project_id) -> List[Dict]
    - delete_project_employees(project_id) -> bool
"""

import logging
import streamlit as st
import pandas as pd

logger = logging.getLogger(__name__)
from typing import List, Dict, Optional, Any
from .client import get_supabase_client, get_supabase_admin_client
from .audit import log_action, _log_audit_fallback


def get_user_projects(user_id: str) -> List[Dict]:
    """
    Pobiera projekty przypisane do użytkownika z tabeli project_memberships.
    Używa JOIN do tabeli projects, aby pobrać pełne dane projektu.
    
    Args:
        user_id: UUID użytkownika
    
    Returns:
        list[dict]: Lista projektów z danymi:
            - id: UUID projektu
            - name: Nazwa projektu
            - organization_id: UUID organizacji
            - role: Rola użytkownika w projekcie (admin/member/viewer)
            - organization_name: Nazwa organizacji (jeśli dostępna)
    """
    if not user_id:
        return []
    
    try:
        client = get_supabase_client()
        
        # Pobierz członkostwa z JOIN do projects i organizations
        response = client.table('project_memberships').select(
            '*, projects(id, name, organization_id, organizations(id, name))'
        ).eq('user_id', user_id).execute()
        
        if not response.data:
            return []
        
        # Przetwórz dane do płaskiej struktury
        projects = []
        for membership in response.data:
            project_data = membership.get('projects', {})
            org_data = project_data.get('organizations', {}) if project_data else {}
            
            projects.append({
                'id': project_data.get('id') if project_data else None,
                'name': project_data.get('name', 'Unnamed Project') if project_data else 'Unnamed Project',
                'organization_id': project_data.get('organization_id') if project_data else None,
                'role': membership.get('role', 'member'),
                'organization_name': org_data.get('name', '') if org_data else '',
                'membership_id': membership.get('id'),
            })
        
        return [p for p in projects if p['id'] is not None]
        
    except Exception as e:
        # Fallback: próbuj prostsze zapytanie bez nested joins
        try:
            client = get_supabase_client()
            response = client.table('project_memberships').select(
                'id, user_id, project_id, role'
            ).eq('user_id', user_id).execute()
            
            if not response.data:
                return []
            
            projects = []
            for membership in response.data:
                # Pobierz dane projektu osobno
                proj_response = client.table('projects').select('*').eq(
                    'id', membership['project_id']
                ).single().execute()
                
                if proj_response.data:
                    projects.append({
                        'id': proj_response.data['id'],
                        'name': proj_response.data.get('name', 'Unnamed Project'),
                        'organization_id': proj_response.data.get('organization_id'),
                        'role': membership.get('role', 'member'),
                        'organization_name': '',
                        'membership_id': membership.get('id'),
                    })
            
            return projects
        except Exception:
            return []


def initialize_default_tenant(user_id: str, email: str) -> Optional[Dict]:
    """
    Inicjalizuje domyślnego tenanta dla nowego użytkownika.
    Używa admin client do obejścia RLS podczas inicjalizacji.
    
    Wykonuje:
    1. Tworzy nową organizację
    2. Tworzy nowy projekt powiązany z organizacją
    3. Dodaje rekord do project_memberships (rola: 'admin')
    4. Aktualizuje profiles z organization_id
    
    Args:
        user_id: UUID użytkownika
        email: Email użytkownika (do nazewnictwa)
    
    Returns:
        dict | None: Dane utworzonego projektu lub None przy błędzie
    """
    if not user_id:
        return None
    
    # Użyj admin client do obejścia RLS
    admin_client = get_supabase_admin_client()
    if admin_client is None:
        # Fallback do zwykłego klienta (może nie działać z RLS)
        admin_client = get_supabase_client()
    
    try:
        # Generuj nazwy na podstawie email
        email_prefix = email.split('@')[0] if email else 'user'
        org_name = f"Organizacja {email_prefix}"
        project_name = f"Projekt główny"
        
        # 1. Utwórz organizację
        # UWAGA: Schemat może nie mieć kolumny 'owner_id', więc używamy tylko 'name'
        org_response = admin_client.table('organizations').insert({
            'name': org_name,
            # 'owner_id': user_id,  # Zakomentowano - kolumna może nie istnieć w schemacie
        }).execute()
        
        if not org_response.data:
            raise Exception("Nie udało się utworzyć organizacji")
        
        organization = org_response.data[0]
        organization_id = organization['id']
        
        # Audit Log: Organization created
        log_action(
            user_id=user_id,
            company_id=organization_id,  # Użyj org_id jako company_id
            action_type='ORGANIZATION_CREATED',
            details={'organization_name': org_name}
        )
        
        # 2. Utwórz projekt
        project_response = admin_client.table('projects').insert({
            'name': project_name,
            'organization_id': organization_id,
        }).execute()
        
        if not project_response.data:
            raise Exception("Nie udało się utworzyć projektu")
        
        project = project_response.data[0]
        project_id = project['id']
        
        # Audit Log: Project created
        log_action(
            user_id=user_id,
            company_id=organization_id,
            action_type='PROJECT_CREATED',
            details={
                'project_name': project_name,
                'project_id': project_id,
            }
        )
        
        # 3. Dodaj członkostwo (rola: admin)
        membership_response = admin_client.table('project_memberships').insert({
            'user_id': user_id,
            'project_id': project_id,
            'role': 'admin',
        }).execute()
        
        if not membership_response.data:
            raise Exception("Nie udało się utworzyć członkostwa w projekcie")
        
        # 4. Zaktualizuj profil użytkownika
        try:
            admin_client.table('profiles').upsert({
                'id': user_id,
                'organization_id': organization_id,
            }).execute()
        except Exception:
            # Profil może już istnieć, spróbuj update
            try:
                admin_client.table('profiles').update({
                    'organization_id': organization_id,
                }).eq('id', user_id).execute()
            except Exception:
                pass  # Ignoruj błędy aktualizacji profilu
        
        # Audit Log: Tenant created
        log_action(
            user_id=user_id,
            company_id=organization_id,
            action_type='TENANT_CREATED',
            details={
                'organization_id': organization_id,
                'organization_name': org_name,
                'project_id': project_id,
                'project_name': project_name,
            }
        )
        
        return {
            'id': project_id,
            'name': project_name,
            'organization_id': organization_id,
            'organization_name': org_name,
            'role': 'admin',
        }
        
    except Exception as e:
        # Log error to fallback
        _log_audit_fallback(
            user_id=user_id,
            company_id=None,
            action_type='TENANT_CREATED',
            details={'error': str(e), 'status': 'failed'},
            error=str(e)
        )
        # SOFT-FAIL: Tryb offline (bez traceback dla czystszych logów)
        logger.warning("Tryb Offline: %s - Brak połączenia z Supabase. Zwracam mock project.", type(e).__name__)
        return {
            'id': 'local-dev-project',
            'name': 'Lokalny Projekt (Offline)',
            'organization_id': 'local-dev-org',
            'organization_name': 'Organizacja Lokalna (Offline)',
            'role': 'admin',
            '_offline_mode': True  # Flag dla UI
        }


def set_project_context(project_id: str) -> bool:
    """
    Ustawia kontekst projektu w Supabase poprzez wywołanie funkcji RPC.
    To aktywuje RLS dla danego projektu.
    
    Args:
        project_id: UUID projektu do aktywacji
    
    Returns:
        bool: True jeśli kontekst został ustawiony pomyślnie
    """
    if not project_id:
        return False
    
    try:
        client = get_supabase_client()
        
        # Wywołaj funkcję RPC set_app_context
        response = client.rpc('set_app_context', {
            'p_project_id': project_id
        }).execute()
        
        # Zapisz aktywny projekt w session_state
        st.session_state['active_project_id'] = project_id
        
        # Audit Log: Project switch
        if st.session_state.get('user_id'):
            log_action(
                user_id=st.session_state.user_id,
                company_id=st.session_state.get('company_id'),
                action_type='TENANT_SWITCHED',
                details={
                    'project_id': project_id,
                }
            )
        
        return True
        
    except Exception as e:
        # Jeśli RPC nie istnieje, ustaw tylko w session_state
        st.session_state['active_project_id'] = project_id
        return True


def get_active_project() -> Optional[Dict]:
    """
    Zwraca aktywny projekt z session_state.
    
    Returns:
        dict | None: Dane aktywnego projektu lub None
    """
    project_id = st.session_state.get('active_project_id')
    if not project_id:
        return None
    
    # Pobierz pełne dane projektu jeśli mamy tylko ID
    projects = st.session_state.get('user_projects', [])
    for proj in projects:
        if proj.get('id') == project_id:
            return proj
    
    return {'id': project_id}


def switch_project(project_id: str) -> bool:
    """
    Przełącza aktywny projekt i ustawia kontekst RLS.
    
    Args:
        project_id: UUID projektu do aktywacji
    
    Returns:
        bool: True jeśli przełączenie się powiodło
    """
    if not project_id:
        return False
    
    # Ustaw kontekst w Supabase
    success = set_project_context(project_id)
    
    if success:
        st.session_state['active_project_id'] = project_id
        
        # Znajdź i zaktualizuj company_id na podstawie projektu
        projects = st.session_state.get('user_projects', [])
        for proj in projects:
            if proj.get('id') == project_id:
                st.session_state['company_id'] = proj.get('organization_id', project_id)
                break
    
    return success


# ==============================================================================
# JOB VALUATIONS (EU Standard Grader)
# ==============================================================================

def save_job_valuation(project_id: str, job_data: Dict[str, Any]) -> Optional[Dict]:
    """
    Zapisuje wynik wartościowania stanowiska do tabeli job_valuations.
    Respektuje RLS - wszystkie zapytania uwzględniają project_id.
    
    Args:
        project_id: UUID projektu (tenant)
        job_data: Słownik z danymi wartościowania:
            - job_title: str
            - skills: int (0-25)
            - effort: int (0-25)
            - responsibility: int (0-25)
            - conditions: int (0-25)
            - total_score: int (0-100)
            - justification: str
            - confidence: float (0.0-1.0)
            - needs_review: bool
    
    Returns:
        dict | None: Zapisany rekord lub None przy błędzie
    """
    if not project_id or not job_data:
        return None
    
    try:
        client = get_supabase_client()
        
        # Przygotuj dane do zapisu
        record = {
            'project_id': project_id,
            'job_title': job_data.get('job_title', ''),
            'skills': int(job_data.get('skills', 0)),
            'effort': int(job_data.get('effort', 0)),
            'responsibility': int(job_data.get('responsibility', 0)),
            'conditions': int(job_data.get('conditions', 0)),
            'total_score': int(job_data.get('total_score', 0)),
            'justification': str(job_data.get('justification', ''))[:500],
            'confidence': float(job_data.get('confidence', 0.0)),
            'needs_review': bool(job_data.get('needs_review', False)),
        }
        
        # Użyj upsert - jeśli stanowisko już istnieje w projekcie, zaktualizuj
        response = client.table('job_valuations').upsert(
            record,
            on_conflict='project_id,job_title'
        ).execute()
        
        if response.data:
            # Audit Log
            log_action(
                user_id=st.session_state.get('user_id'),
                company_id=st.session_state.get('company_id'),
                action_type='JOB_VALUATION_SAVED',
                details={
                    'project_id': project_id,
                    'job_title': record['job_title'],
                    'total_score': record['total_score'],
                }
            )
            return response.data[0]
        
        return None
        
    except Exception as e:
        _log_audit_fallback(
            user_id=st.session_state.get('user_id'),
            company_id=st.session_state.get('company_id'),
            action_type='JOB_VALUATION_SAVED',
            details={'error': str(e), 'job_title': job_data.get('job_title')},
            error=str(e)
        )
        return None


def save_job_valuations_batch(project_id: str, valuations: List[Dict]) -> int:
    """
    Zapisuje wiele wartościowań stanowisk jednocześnie.
    
    Args:
        project_id: UUID projektu
        valuations: Lista słowników z danymi wartościowania
    
    Returns:
        int: Liczba pomyślnie zapisanych rekordów
    """
    if not project_id or not valuations:
        return 0
    
    saved_count = 0
    for job_data in valuations:
        result = save_job_valuation(project_id, job_data)
        if result:
            saved_count += 1
    
    return saved_count


def get_project_valuations(project_id: str) -> List[Dict]:
    """
    Pobiera wszystkie wartościowania stanowisk dla danego projektu.
    Respektuje RLS - zwraca tylko dane dla project_id użytkownika.
    
    Args:
        project_id: UUID projektu
    
    Returns:
        list[dict]: Lista wartościowań stanowisk
    """
    if not project_id:
        return []
    
    try:
        client = get_supabase_client()
        
        response = client.table('job_valuations').select('*').eq(
            'project_id', project_id
        ).order('total_score', desc=True).execute()
        
        return response.data if response.data else []
        
    except Exception:
        return []


def get_valuation_by_job_title(project_id: str, job_title: str) -> Optional[Dict]:
    """
    Pobiera wartościowanie dla konkretnego stanowiska.
    
    Args:
        project_id: UUID projektu
        job_title: Nazwa stanowiska
    
    Returns:
        dict | None: Wartościowanie lub None
    """
    if not project_id or not job_title:
        return None
    
    try:
        client = get_supabase_client()
        
        response = client.table('job_valuations').select('*').eq(
            'project_id', project_id
        ).eq('job_title', job_title).single().execute()
        
        return response.data if response.data else None
        
    except Exception:
        return None


def delete_project_valuations(project_id: str) -> bool:
    """
    Usuwa wszystkie wartościowania dla projektu.
    
    Args:
        project_id: UUID projektu
    
    Returns:
        bool: True jeśli usunięcie się powiodło
    """
    if not project_id:
        return False
    
    try:
        client = get_supabase_client()
        
        client.table('job_valuations').delete().eq(
            'project_id', project_id
        ).execute()
        
        # Audit Log
        log_action(
            user_id=st.session_state.get('user_id'),
            company_id=st.session_state.get('company_id'),
            action_type='JOB_VALUATIONS_DELETED',
            details={'project_id': project_id}
        )
        
        return True
        
    except Exception:
        return False


def get_valuations_statistics(project_id: str) -> Dict:
    """
    Oblicza statystyki wartościowań dla projektu.
    
    Args:
        project_id: UUID projektu
    
    Returns:
        dict: Statystyki (count, avg_score, needs_review_count, etc.)
    """
    valuations = get_project_valuations(project_id)
    
    if not valuations:
        return {
            'count': 0,
            'avg_score': 0,
            'avg_skills': 0,
            'avg_effort': 0,
            'avg_responsibility': 0,
            'avg_conditions': 0,
            'needs_review_count': 0,
            'min_score': 0,
            'max_score': 0,
        }
    
    scores = [v['total_score'] for v in valuations]
    
    return {
        'count': len(valuations),
        'avg_score': round(sum(scores) / len(scores), 1),
        'avg_skills': round(sum(v['skills'] for v in valuations) / len(valuations), 1),
        'avg_effort': round(sum(v['effort'] for v in valuations) / len(valuations), 1),
        'avg_responsibility': round(sum(v['responsibility'] for v in valuations) / len(valuations), 1),
        'avg_conditions': round(sum(v['conditions'] for v in valuations) / len(valuations), 1),
        'needs_review_count': sum(1 for v in valuations if v.get('needs_review')),
        'min_score': min(scores),
        'max_score': max(scores),
    }


# ==============================================================================
# EMPLOYEES DATA (Zapisywanie danych pracowniczych do projektu)
# ==============================================================================

def save_employees_to_project(
    project_id: str,
    df: pd.DataFrame,
    source_filename: str = None
) -> int:
    """
    Zapisuje dane pracowników z DataFrame do tabeli employees w Supabase.
    Wszystkie dane są powiązane z project_id (multi-tenancy).
    
    Args:
        project_id: UUID projektu
        df: DataFrame z danymi pracowników
        source_filename: Nazwa pliku źródłowego (opcjonalne)
    
    Returns:
        int: Liczba zapisanych rekordów (0 przy błędzie)
    """
    if not project_id or df is None or df.empty:
        return 0
    
    try:
        client = get_supabase_client()
        
        # Przygotuj rekordy do zapisu
        records = []
        
        # Wykryj kolumny
        col_mapping = {
            'employee_id': ['Employee_ID', 'ID', 'id', 'Index'],
            'position': ['Position', 'Stanowisko', 'Job', 'Tytuł'],
            'department': ['Department', 'Dział', 'Dzial', 'Dept'],
            'salary': ['Salary', 'Wynagrodzenie', 'Płaca', 'Pensja'],
            'gender': ['Gender', 'Płeć', 'Plec', 'Sex'],
            'contract_type': ['Contract_Type', 'ContractType', 'Contract', 'Umowa'],
            'scoring': ['Scoring', 'Score', 'Punkty'],
        }
        
        detected_cols = {}
        for target, candidates in col_mapping.items():
            for candidate in candidates:
                if candidate in df.columns:
                    detected_cols[target] = candidate
                    break
        
        for idx, row in df.iterrows():
            record = {
                'project_id': project_id,
                'source_file': source_filename or 'upload',
            }
            
            # Mapuj kolumny
            for target, source_col in detected_cols.items():
                value = row.get(source_col)
                if pd.notna(value):
                    if target == 'salary':
                        record[target] = float(value)
                    elif target == 'scoring':
                        record[target] = int(value) if pd.notna(value) else None
                    else:
                        record[target] = str(value)
            
            # Generuj employee_id jeśli brak
            if 'employee_id' not in record or not record['employee_id']:
                record['employee_id'] = f"EMP_{idx:04d}"
            
            records.append(record)
        
        if not records:
            return 0
        
        # Batch insert z upsert na project_id + employee_id
        # Dziel na partie po 100 rekordów
        batch_size = 100
        saved_count = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                response = client.table('employees').upsert(
                    batch,
                    on_conflict='project_id,employee_id'
                ).execute()
                
                if response.data:
                    saved_count += len(response.data)
            except Exception as e:
                # Jeśli upsert nie działa, spróbuj insert
                try:
                    response = client.table('employees').insert(batch).execute()
                    if response.data:
                        saved_count += len(response.data)
                except Exception:
                    pass
        
        # Audit Log
        if saved_count > 0:
            log_action(
                user_id=st.session_state.get('user_id'),
                company_id=st.session_state.get('company_id'),
                action_type='FILE_UPLOAD',
                details={
                    'project_id': project_id,
                    'source_file': source_filename,
                    'records_saved': saved_count,
                    'total_records': len(records),
                }
            )
        
        return saved_count
        
    except Exception as e:
        _log_audit_fallback(
            user_id=st.session_state.get('user_id'),
            company_id=st.session_state.get('company_id'),
            action_type='FILE_UPLOAD',
            details={'error': str(e), 'project_id': project_id},
            error=str(e)
        )
        return 0


def get_project_employees(project_id: str) -> List[Dict]:
    """
    Pobiera wszystkich pracowników dla danego projektu.
    Respektuje RLS - zwraca tylko dane dla project_id użytkownika.
    
    Args:
        project_id: UUID projektu
    
    Returns:
        list[dict]: Lista pracowników
    """
    if not project_id:
        return []
    
    try:
        client = get_supabase_client()
        
        response = client.table('employees').select('*').eq(
            'project_id', project_id
        ).execute()
        
        return response.data if response.data else []
        
    except Exception:
        return []


def delete_project_employees(project_id: str) -> bool:
    """
    Usuwa wszystkich pracowników dla projektu.
    
    Args:
        project_id: UUID projektu
    
    Returns:
        bool: True jeśli usunięcie się powiodło
    """
    if not project_id:
        return False
    
    try:
        client = get_supabase_client()
        
        client.table('employees').delete().eq(
            'project_id', project_id
        ).execute()
        
        return True
        
    except Exception:
        return False
