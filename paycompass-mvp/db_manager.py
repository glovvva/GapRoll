"""
db_manager.py - Moduł zarządzania połączeniem z Supabase i Audit Log
Architektura VAULT - PayCompass Pro

Ten moduł zawiera:
- get_supabase_client() - singleton klienta Supabase
- Funkcje autoryzacji (login/logout/session)
- log_action() - immutable audit log
- sanitize_upload() - walidacja Ingress (usuwanie PII)
"""

import logging
import streamlit as st
from supabase import create_client, Client
from datetime import datetime
import pandas as pd
import json
import hashlib
from typing import Optional, Dict, Any, List

logger = logging.getLogger(__name__)


# ==============================================================================
# KONFIGURACJA SUPABASE
# ==============================================================================

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


# ==============================================================================
# SYSTEM AUTORYZACJI (Supabase Auth)
# ==============================================================================

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


# ==============================================================================
# IMMUTABLE AUDIT LOG
# ==============================================================================

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


# ==============================================================================
# WALIDACJA INGRESS (VAULT SECURITY) - Sanityzacja PII
# ==============================================================================

# Kolumny mogące zawierać PII (Personally Identifiable Information)
PII_COLUMNS = [
    # Identyfikatory
    'pesel', 'PESEL', 'Pesel',
    'nip', 'NIP', 'Nip',
    'regon', 'REGON', 'Regon',
    'dowod', 'DOWOD', 'Dowód', 'dowód', 'nr_dowodu', 'numer_dowodu',
    'paszport', 'PASZPORT', 'Paszport', 'nr_paszportu',
    
    # Dane osobowe
    'imie', 'IMIE', 'Imię', 'imię', 'first_name', 'FirstName', 'firstname',
    'nazwisko', 'NAZWISKO', 'Nazwisko', 'last_name', 'LastName', 'lastname', 'surname',
    'imie_nazwisko', 'imię_nazwisko', 'full_name', 'FullName', 'fullname', 'name',
    
    # Kontakt
    'email', 'EMAIL', 'Email', 'e-mail', 'E-mail', 'mail',
    'telefon', 'TELEFON', 'Telefon', 'phone', 'Phone', 'tel', 'nr_tel', 'numer_telefonu',
    'komorka', 'komórka', 'mobile',
    
    # Adres
    'adres', 'ADRES', 'Adres', 'address', 'Address',
    'ulica', 'ULICA', 'Ulica', 'street',
    'miasto', 'MIASTO', 'Miasto', 'city',
    'kod_pocztowy', 'kod', 'postal_code', 'zip',
    
    # Finanse osobiste (wrażliwe)
    'konto', 'KONTO', 'Konto', 'nr_konta', 'numer_konta', 'bank_account', 'iban', 'IBAN',
    
    # Inne wrażliwe
    'data_urodzenia', 'data_ur', 'birth_date', 'birthdate', 'dob',
    'miejsce_urodzenia', 'birth_place',
]

# Wzorce regex dla wykrywania PII w nazwach kolumn
PII_PATTERNS = [
    r'(?i)pesel',
    r'(?i)nazwisk',
    r'(?i)imi[eę]',
    r'(?i)email',
    r'(?i)telefon',
    r'(?i)adres',
    r'(?i)kont[oa]',
    r'(?i)dowod|dowód',
    r'(?i)nip',
    r'(?i)iban',
]


def sanitize_upload(df: pd.DataFrame, log_removed: bool = True) -> pd.DataFrame:
    """
    Walidacja Ingress (Vault Security).
    Sprawdza i usuwa kolumny mogące zawierać PII przed przetworzeniem przez Solver.
    
    Args:
        df: DataFrame z wczytanego pliku CSV
        log_removed: Czy logować usunięte kolumny do session_state
    
    Returns:
        pd.DataFrame: Oczyszczony DataFrame bez kolumn PII
    
    Przykład użycia:
        df = pd.read_csv(uploaded_file)
        df_clean = sanitize_upload(df)
        # Teraz df_clean jest bezpieczny do dalszego przetwarzania
    """
    import re
    
    if df is None or df.empty:
        return pd.DataFrame()
    
    df_clean = df.copy()
    removed_columns = []
    
    # Sprawdź każdą kolumnę
    for col in df_clean.columns:
        col_str = str(col).strip()
        col_lower = col_str.lower()
        
        # Sprawdź bezpośrednie dopasowanie do listy PII
        if col_str in PII_COLUMNS or col_lower in [p.lower() for p in PII_COLUMNS]:
            removed_columns.append(col_str)
            continue
        
        # Sprawdź wzorce regex
        for pattern in PII_PATTERNS:
            if re.search(pattern, col_str):
                removed_columns.append(col_str)
                break
    
    # Usuń znalezione kolumny PII
    if removed_columns:
        df_clean = df_clean.drop(columns=removed_columns, errors='ignore')
        
        if log_removed:
            if 'sanitized_columns' not in st.session_state:
                st.session_state.sanitized_columns = []
            st.session_state.sanitized_columns.extend(removed_columns)
            
            # Loguj akcję sanityzacji
            if st.session_state.get('user_id') and st.session_state.get('company_id'):
                log_action(
                    user_id=st.session_state.user_id,
                    company_id=st.session_state.company_id,
                    action_type='FILE_UPLOAD',
                    details={
                        'sanitized': True,
                        'removed_columns': removed_columns,
                        'original_columns_count': len(df.columns),
                        'final_columns_count': len(df_clean.columns),
                    }
                )
    
    return df_clean


def detect_pii_columns(df: pd.DataFrame) -> List[str]:
    """
    Wykrywa kolumny mogące zawierać PII bez ich usuwania.
    Przydatne do wyświetlenia ostrzeżenia użytkownikowi.
    
    Args:
        df: DataFrame do analizy
    
    Returns:
        list[str]: Lista nazw kolumn z potencjalnym PII
    """
    import re
    
    if df is None or df.empty:
        return []
    
    pii_detected = []
    
    for col in df.columns:
        col_str = str(col).strip()
        col_lower = col_str.lower()
        
        # Sprawdź bezpośrednie dopasowanie
        if col_str in PII_COLUMNS or col_lower in [p.lower() for p in PII_COLUMNS]:
            pii_detected.append(col_str)
            continue
        
        # Sprawdź wzorce regex
        for pattern in PII_PATTERNS:
            if re.search(pattern, col_str):
                pii_detected.append(col_str)
                break
    
    return pii_detected


def generate_employee_hash(row: pd.Series, salt: str = None) -> str:
    """
    Generuje anonimowy hash ID pracownika z danych wejściowych.
    Używane gdy trzeba zachować relacje między rekordami bez ujawniania tożsamości.
    
    Args:
        row: Wiersz DataFrame z danymi pracownika
        salt: Opcjonalna sól do hasha (zwiększa bezpieczeństwo)
    
    Returns:
        str: SHA256 hash jako ID pracownika (np. "EMP_a1b2c3d4...")
    """
    # Zbierz dostępne dane identyfikujące
    components = []
    
    for col in ['Employee_ID', 'ID', 'id', 'Index', 'index']:
        if col in row.index and pd.notna(row[col]):
            components.append(str(row[col]))
            break
    
    # Dodaj inne unikalne cechy (bez PII)
    for col in ['Position', 'Stanowisko', 'Department', 'Salary', 'Gender']:
        if col in row.index and pd.notna(row[col]):
            components.append(str(row[col])[:20])  # Ogranicz długość
    
    if not components:
        components.append(str(hash(tuple(row.values))))
    
    # Dodaj sól
    if salt:
        components.append(salt)
    elif st.session_state.get('company_id'):
        components.append(st.session_state.company_id)
    
    # Generuj hash
    data = '|'.join(components)
    hash_value = hashlib.sha256(data.encode('utf-8')).hexdigest()[:12]
    
    return f"EMP_{hash_value}"


# ==============================================================================
# MULTI-TENANCY (Zarządzanie Projektami)
# ==============================================================================

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
# HELPER: RLS-AWARE QUERIES
# ==============================================================================

def query_with_rls(table_name: str, select: str = '*', filters: Dict = None) -> List[Dict]:
    """
    Wykonuje zapytanie do Supabase z automatycznym filtrowaniem przez company_id (RLS).
    
    Args:
        table_name: Nazwa tabeli
        select: Kolumny do pobrania (domyślnie wszystkie)
        filters: Dodatkowe filtry jako dict
    
    Returns:
        list[dict]: Wyniki zapytania
    """
    if not require_auth():
        return []
    
    company_id = st.session_state.get('company_id')
    if not company_id:
        return []
    
    try:
        client = get_supabase_client()
        query = client.table(table_name).select(select).eq('company_id', company_id)
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        response = query.execute()
        
        # Loguj dostęp (opcjonalnie)
        log_action(
            user_id=st.session_state.user_id,
            company_id=company_id,
            action_type='RLS_QUERY',
            details={'table': table_name, 'filters': filters}
        )
        
        return response.data if response.data else []
        
    except Exception:
        return []


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
