# -*- coding: utf-8 -*-
"""
Art.16 Reporting Module
=======================
Quartile analysis, component-based pay gaps, RODO shield (Art. 16 Dyrektywa UE 2023/970).
"""

import pandas as pd
import numpy as np
from typing import Optional

from . import art16_helpers as _h

# RODO: próg liczebności grupy (0 = DEV, 3 = production)
RODO_GROUP_THRESHOLD = 0


def mask_sensitive_data(value, count, threshold: int = 3, format_as_pln: bool = True):
    """Maskuje dane finansowe gdy grupa porównawcza jest zbyt mała (RODO Shield)."""
    if value is None or (isinstance(value, (int, float)) and pd.isna(value)):
        return "—"
    if not format_as_pln:
        return str(value)
    try:
        num = float(value)
        return f"{int(round(num)):,} PLN".replace(",", " ")
    except (TypeError, ValueError):
        return str(value)


def apply_rodo_shield(df, min_size: int = 3) -> pd.DataFrame:
    """Maskuje Salary i Pay_Diff_Pct gdy grupa (Department, Gender) < min_size."""
    if df.empty or 'Gender' not in df.columns or 'Department' not in df.columns:
        return df
    counts = df.groupby(['Department', 'Gender']).size().reset_index(name='group_count')
    df = df.merge(counts, on=['Department', 'Gender'], how='left')
    df_shielded = df.copy()
    mask = df_shielded['group_count'] < min_size
    df_shielded.loc[mask, 'Salary'] = np.nan
    if 'Pay_Diff_Pct' in df_shielded.columns:
        df_shielded.loc[mask, 'Pay_Diff_Pct'] = np.nan
    return df_shielded


def calculate_pay_quartiles(
    df: pd.DataFrame,
    salary_col: Optional[str] = None,
    gender_col: str = 'Gender',
) -> dict:
    """Rozkład płci w kwartylach wynagrodzeń (Art. 16)."""
    if df is None or df.empty:
        return _h.empty_quartiles_result()
    if salary_col is None:
        salary_col = 'Salary_UoP' if 'Salary_UoP' in df.columns else ('Salary' if 'Salary' in df.columns else None)
    if salary_col is None or salary_col not in df.columns or gender_col not in df.columns:
        return _h.empty_quartiles_result()
    work = df.copy()
    work[salary_col] = pd.to_numeric(work[salary_col], errors='coerce')
    work = work.dropna(subset=[salary_col, gender_col])
    if len(work) < 4:
        return _h.empty_quartiles_result()
    work = work.sort_values(salary_col, ascending=True).reset_index(drop=True)
    work['quartile'] = pd.qcut(work.index, q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])
    male_labels = ("M", "Mężczyzna", "Mezczyzna")
    female_labels = ("K", "Kobieta", "F")
    result = {'total_employees': len(work)}
    for q in ['Q1', 'Q2', 'Q3', 'Q4']:
        q_df = work[work['quartile'] == q]
        total = len(q_df)
        men = len(q_df[q_df[gender_col].isin(male_labels)])
        women = len(q_df[q_df[gender_col].isin(female_labels)])
        men_pct = round((men / total) * 100, 1) if total > 0 else 0
        women_pct = round((women / total) * 100, 1) if total > 0 else 0
        rodo_safe = men >= RODO_GROUP_THRESHOLD and women >= RODO_GROUP_THRESHOLD
        result[q] = {
            'total': total, 'men': men, 'women': women,
            'men_pct': men_pct, 'women_pct': women_pct, 'rodo_safe': rodo_safe,
        }
    return result


def calculate_component_gaps(df: pd.DataFrame, gender_col: str = 'Gender') -> dict:
    """Oddzielna luka płacowa dla składników: base_salary, variable_pay, allowances."""
    if df is None or df.empty or gender_col not in df.columns:
        return _h.empty_component_gaps()
    male_labels = ("M", "Mężczyzna", "Mezczyzna")
    female_labels = ("K", "Kobieta", "F")
    men_df = df[df[gender_col].isin(male_labels)]
    women_df = df[df[gender_col].isin(female_labels)]
    rodo_safe = len(men_df) >= RODO_GROUP_THRESHOLD and len(women_df) >= RODO_GROUP_THRESHOLD
    result = {}
    base_col = _h.find_column(df, ['Base_Salary', 'Salary', 'Wynagrodzenie', 'Salary_UoP'])
    result['base_salary'] = _h.calculate_single_gap(df, base_col, gender_col, male_labels, female_labels, rodo_safe)
    variable_col = _h.find_column(df, ['Variable_Pay', 'Bonus', 'Premia', 'Incentive', 'Commission'])
    result['variable_pay'] = _h.calculate_single_gap(df, variable_col, gender_col, male_labels, female_labels, rodo_safe)
    allowance_col = _h.find_column(df, ['Allowances', 'Benefits', 'Dodatki', 'Swiadczenia', 'Perks'])
    result['allowances'] = _h.calculate_single_gap(df, allowance_col, gender_col, male_labels, female_labels, rodo_safe)
    return result


def format_quartile_for_chart(quartiles_data: dict) -> pd.DataFrame:
    """Formatuje dane kwartylowe do wykresu Plotly."""
    rows = []
    for q in ['Q4', 'Q3', 'Q2', 'Q1']:
        q_data = quartiles_data.get(q, {})
        men_pct = q_data.get('men_pct')
        women_pct = q_data.get('women_pct')
        rows.append({
            'Kwartyl': q, 'Płeć': 'Mężczyźni',
            'Procent': men_pct if men_pct is not None else 0,
            'Label': f"{men_pct:.1f}%" if men_pct is not None else "ND",
            'RODO': men_pct is not None,
        })
        rows.append({
            'Kwartyl': q, 'Płeć': 'Kobiety',
            'Procent': women_pct if women_pct is not None else 0,
            'Label': f"{women_pct:.1f}%" if women_pct is not None else "ND",
            'RODO': women_pct is not None,
        })
    return pd.DataFrame(rows)
