# -*- coding: utf-8 -*-
"""
Analytics Module
================
Core pay gap calculations and outlier removal.
"""

import pandas as pd
from typing import Optional
from .evg_engine import calculate_pay_gap_evg


def remove_outliers_iqr(df, col: str = "Salary", factor: float = 1.5):
    """Usuwa odchylenia (outliery) metodą rozstępu ćwiartkowego (IQR)."""
    if df is None or df.empty or col not in df.columns:
        return df.copy() if df is not None else pd.DataFrame()
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - (factor * IQR)
    upper_bound = Q3 + (factor * IQR)
    return df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]


def calculate_pay_gap(
    df,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
    already_filtered: bool = False,
    evg_mode: bool = False,
) -> float:
    """
    Liczy lukę płacową (Raw Gap).
    evg_mode=False: globalny pay gap; evg_mode=True: ważona średnia z grup EVG.
    N < 50: mediana; N >= 50: średnia (z IQR jeśli not already_filtered).
    Zwraca: (M - K) / M * 100.
    """
    if df is None or df.empty:
        return 0.0
    if salary_col not in df.columns or gender_col not in df.columns:
        return 0.0
    work = df.copy()
    work[salary_col] = pd.to_numeric(work[salary_col], errors="coerce")
    work = work.dropna(subset=[salary_col])
    male_labels = ("M", "Mężczyzna", "Mezczyzna")
    female_labels = ("K", "Kobieta", "F")
    if evg_mode and "EVG_Group" in work.columns:
        return calculate_pay_gap_evg(work, salary_col=salary_col, gender_col=gender_col)
    men = work[work[gender_col].isin(male_labels)][salary_col]
    women = work[work[gender_col].isin(female_labels)][salary_col]
    if len(men) == 0 or len(women) == 0:
        return 0.0
    if len(work) < 50:
        m_metric = men.median()
        w_metric = women.median()
    elif already_filtered:
        m_metric = men.mean()
        w_metric = women.mean()
    else:
        men_df = work[work[gender_col].isin(male_labels)]
        women_df = work[work[gender_col].isin(female_labels)]
        men_clean = remove_outliers_iqr(men_df, col=salary_col)[salary_col]
        women_clean = remove_outliers_iqr(women_df, col=salary_col)[salary_col]
        m_metric = men_clean.mean()
        w_metric = women_clean.mean()
    if pd.isna(m_metric) or m_metric == 0:
        return 0.0
    if pd.isna(w_metric):
        w_metric = 0.0
    return float(round(((m_metric - w_metric) / m_metric) * 100, 1))


def calculate_pay_gap_median(
    df,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
) -> Optional[float]:
    """
    Luka płacowa oparta wyłącznie na medianie (M−K)/M·100.
    Użycie: KPI „Mediana luki” w Compliance Cockpit.
    """
    if df is None or df.empty:
        return None
    if salary_col not in df.columns or gender_col not in df.columns:
        return None
    work = df.copy()
    work[salary_col] = pd.to_numeric(work[salary_col], errors="coerce")
    work = work.dropna(subset=[salary_col])
    male_labels = ("M", "Mężczyzna", "Mezczyzna")
    female_labels = ("K", "Kobieta", "F")
    men = work[work[gender_col].isin(male_labels)][salary_col]
    women = work[work[gender_col].isin(female_labels)][salary_col]
    if len(men) == 0 or len(women) == 0:
        return None
    m_med = men.median()
    w_med = women.median()
    if pd.isna(m_med) or m_med == 0:
        return None
    if pd.isna(w_med):
        w_med = 0.0
    return float(round(((m_med - w_med) / m_med) * 100, 1))
