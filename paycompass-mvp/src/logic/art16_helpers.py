# -*- coding: utf-8 -*-
"""
Art.16 Helpers (internal)
========================
Private helpers for quartile and component-gap calculations.
"""

import pandas as pd
from typing import Tuple, Optional


def empty_quartiles_result() -> dict:
    """Empty quartiles result structure."""
    empty_q = {'total': 0, 'men': 0, 'women': 0, 'men_pct': None, 'women_pct': None, 'rodo_safe': False}
    return {
        'Q1': empty_q.copy(), 'Q2': empty_q.copy(), 'Q3': empty_q.copy(), 'Q4': empty_q.copy(),
        'total_employees': 0,
    }


def find_column(df: pd.DataFrame, candidates: list) -> Optional[str]:
    """First column from candidates that exists in df."""
    for col in candidates:
        if col in df.columns:
            return col
    return None


def calculate_single_gap(
    df: pd.DataFrame,
    col: Optional[str],
    gender_col: str,
    male_labels: Tuple,
    female_labels: Tuple,
    rodo_safe: bool,
) -> dict:
    """Single component pay gap (base_salary, variable_pay, or allowances)."""
    empty_result = {'gap': 0.0, 'men_avg': None, 'women_avg': None, 'rodo_safe': rodo_safe, 'column_exists': False}
    if col is None or col not in df.columns:
        return empty_result
    work = df.copy()
    work[col] = pd.to_numeric(work[col], errors='coerce').fillna(0)
    men_df = work[work[gender_col].isin(male_labels)]
    women_df = work[work[gender_col].isin(female_labels)]
    n_men, n_women = len(men_df), len(women_df)
    if n_men == 0 or n_women == 0:
        return {'gap': 0.0, 'men_avg': None, 'women_avg': None, 'rodo_safe': False, 'column_exists': True}
    men_avg = men_df[col].mean()
    women_avg = women_df[col].mean()
    gap = 0.0 if (pd.isna(men_avg) or men_avg == 0) else round(((men_avg - women_avg) / men_avg) * 100, 1)
    return {
        'gap': gap,
        'men_avg': round(men_avg, 0),
        'women_avg': round(women_avg, 0),
        'rodo_safe': rodo_safe,
        'column_exists': True,
    }


def empty_component_gaps() -> dict:
    """Empty component gaps structure."""
    empty = {'gap': 0.0, 'men_avg': None, 'women_avg': None, 'rodo_safe': False, 'column_exists': False}
    return {'base_salary': empty.copy(), 'variable_pay': empty.copy(), 'allowances': empty.copy()}
