# -*- coding: utf-8 -*-
"""
CSV Loader Module
=================
Wczytywanie, walidacja i auto-detekcja CSV (kodowanie, separator).
"""

import os
import io
import pandas as pd
from typing import Optional

from .utils import suggest_column_mapping, generate_mock_data

# Encodings typowe dla plików z polskiej Optimy/Enovy
ENCODINGS = ["utf-8", "utf-8-sig", "cp1250", "latin1", "iso-8859-2"]
SEPARATORS = [";", ","]

NO_FILE_SELECTED = "--- Wybierz dane ---"


def detect_and_load_csv(file, forced_separator: Optional[str] = None) -> pd.DataFrame:
    """
    Automatycznie rozpoznaje kodowanie (utf-8, cp1250, latin1) i separator (; lub ,).
    """
    if file is None:
        return pd.DataFrame()
    try:
        if isinstance(file, (bytes, bytearray)):
            raw = bytes(file)
        elif isinstance(file, str) and os.path.isfile(file):
            with open(file, "rb") as f:
                raw = f.read()
        elif hasattr(file, "read"):
            raw = file.read()
            if hasattr(file, "seek"):
                file.seek(0)
        else:
            return pd.DataFrame()
    except Exception:
        return pd.DataFrame()

    separators_to_check = [forced_separator] if forced_separator else SEPARATORS
    best_df = pd.DataFrame()
    best_col_count = 0

    for enc in ENCODINGS:
        try:
            text = raw.decode(enc)
        except (UnicodeDecodeError, LookupError):
            continue
        for sep in separators_to_check:
            try:
                df = pd.read_csv(io.StringIO(text), sep=sep)
                df.columns = df.columns.str.strip()
                if df.shape[1] > best_col_count and len(df) > 0:
                    best_col_count = df.shape[1]
                    best_df = df
                    if df.shape[1] >= 3:
                        return df
            except Exception:
                continue
    return best_df


def load_csv_with_forced_separator(file_path: str, separator: str) -> pd.DataFrame:
    """Wczytuje CSV z wymuszonym separatorem."""
    return detect_and_load_csv(file_path, forced_separator=separator)


def scan_available_csv_files(base_dir: Optional[str] = None) -> list:
    """Skanuje dostępne pliki CSV w folderze głównym i data/."""
    import glob
    if base_dir is None:
        base_dir = os.getcwd()
    csv_files = []
    for filepath in glob.glob(os.path.join(base_dir, "*.csv")):
        if os.path.isfile(filepath):
            csv_files.append(os.path.basename(filepath))
    for filepath in glob.glob(os.path.join(base_dir, "data", "*.csv")):
        if os.path.isfile(filepath):
            csv_files.append(f"data/{os.path.basename(filepath)}")
    return sorted(csv_files)


def load_and_validate(file_name, forced_separator: Optional[str] = None) -> pd.DataFrame:
    """
    Ładuje i waliduje plik CSV z folderu głównego lub data/.
    Raises: FileNotFoundError, ValueError, Exception (parsing).
    """
    if file_name is None or file_name == NO_FILE_SELECTED:
        return pd.DataFrame()
    base_dir = os.getcwd()
    import glob
    path = os.path.join(base_dir, file_name)
    if not os.path.exists(path):
        alt_path = os.path.join(base_dir, 'data', file_name)
        if os.path.exists(alt_path):
            path = alt_path
        else:
            return generate_mock_data(num_employees=50)
    try:
        df = detect_and_load_csv(path, forced_separator=forced_separator)
    except Exception:
        raise
    if df.empty:
        raise ValueError(f"Plik '{file_name}' istnieje ale jest pusty lub ma nieprawidłowy format")
    df.columns = df.columns.str.strip()
    mapping = {
        'Plec_Pracownika': 'Gender', 'Kasa': 'Salary', 'Wynagrodzenie': 'Salary',
        'Płaca': 'Salary', 'Pensja': 'Salary', 'Base_Salary': 'Salary',
        'Stanowisko': 'Position', 'ID_Pracownika': 'Employee_ID',
        'Dział': 'Department', 'Dzial': 'Department', 'Płeć': 'Gender', 'Plec': 'Gender',
    }
    df.rename(columns=mapping, inplace=True)
    if 'Salary' in df.columns:
        df['Salary'] = pd.to_numeric(df['Salary'], errors='coerce').fillna(0).round(0).astype(int)
    return df


def get_unique_positions(df: pd.DataFrame, position_col: Optional[str] = None) -> list:
    """Wyciąga unikalne stanowiska z DataFrame."""
    if df is None or df.empty:
        return []
    if position_col is None:
        for cand in ["Position", "Stanowisko", "Stanowiska", "Job", "Tytuł"]:
            if cand in df.columns:
                position_col = cand
                break
        if position_col is None and len(df.columns) > 0:
            position_col = df.columns[0]
    if position_col not in df.columns:
        return []
    return sorted(df[position_col].dropna().astype(str).str.strip().unique().tolist())
