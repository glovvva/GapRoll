# -*- coding: utf-8 -*-
"""
Database Security Module
========================
Walidacja Ingress (Vault Security) - Sanityzacja PII, RLS queries.

Functions:
    - sanitize_upload(df, log_removed) -> pd.DataFrame
    - detect_pii_columns(df) -> List[str]
    - generate_employee_hash(row, salt) -> str
    - query_with_rls(table_name, select, filters) -> List[Dict]

Constants:
    - PII_COLUMNS: Lista kolumn mogących zawierać dane osobowe
    - PII_PATTERNS: Wzorce regex dla wykrywania PII
"""

import streamlit as st
import pandas as pd
import hashlib
import re
from typing import List, Dict, Optional
from .client import get_supabase_client


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
    from .audit import log_action
    
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
    from .auth import require_auth
    from .audit import log_action
    
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
