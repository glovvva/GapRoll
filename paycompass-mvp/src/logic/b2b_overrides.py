# -*- coding: utf-8 -*-
"""
B2B Overrides Module
====================
Salary overrides (50% KUP, paid leave days) and bulk conversion with overrides.
Depends on b2b_equalizer for calculate_virtual_gross_with_overrides.
"""

import pandas as pd
import numpy as np
from typing import Optional

from .b2b_equalizer import calculate_virtual_gross_with_overrides


def apply_salary_overrides(df: pd.DataFrame, overrides_df: pd.DataFrame) -> pd.DataFrame:
    """Stosuje nadpisania parametrów (50%_KUP, Dni_wolne_B2B) do DataFrame pracowników."""
    if df is None or df.empty:
        return pd.DataFrame()
    if overrides_df is None or overrides_df.empty:
        result = df.copy()
        result['_override_kup_50'] = False
        result['_override_leave_days'] = 0
        return result
    result = df.copy()
    employee_id_col = next((c for c in ['Employee_ID', 'ID', 'id', 'Index'] if c in result.columns), None)
    if employee_id_col is None:
        result['_override_kup_50'] = False
        result['_override_leave_days'] = 0
        return result
    override_id_col = next((c for c in ['Employee_ID', 'ID', 'id', 'Index'] if c in overrides_df.columns), None)
    if override_id_col is None:
        result['_override_kup_50'] = False
        result['_override_leave_days'] = 0
        return result
    kup_map = {}
    leave_map = {}
    for _, row in overrides_df.iterrows():
        emp_id = str(row[override_id_col])
        if '50%_KUP' in overrides_df.columns:
            kup_map[emp_id] = bool(row.get('50%_KUP', False))
        if 'Dni_wolne_B2B' in overrides_df.columns:
            leave_map[emp_id] = int(row.get('Dni_wolne_B2B', 0) or 0)
    result['_override_kup_50'] = result[employee_id_col].astype(str).map(kup_map).fillna(False)
    result['_override_leave_days'] = result[employee_id_col].astype(str).map(leave_map).fillna(0).astype(int)
    return result


def b2b_to_uop_bulk_with_overrides(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    contract_col: Optional[str] = None,
    uop_output_col: str = "Salary_UoP",
) -> pd.DataFrame:
    """Przelicza masowo B2B na UoP z uwzględnieniem nadpisań (wymaga apply_salary_overrides wcześniej)."""
    if df is None or df.empty:
        return pd.DataFrame()
    out = df.copy()
    if salary_col not in out.columns:
        out[uop_output_col] = np.nan
        return out
    if contract_col is None:
        for c in ['Contract_Type', 'ContractType', 'Contract', 'Umowa', 'Type']:
            if c in out.columns:
                contract_col = c
                break
    is_b2b = (
        out[contract_col].astype(str).str.strip().str.upper().isin(["B2B", "B2B "])
        if contract_col and contract_col in out.columns
        else pd.Series(False, index=out.index)
    )
    is_uop = (
        out[contract_col].astype(str).str.strip().str.upper().isin(["UOP", "UOP ", "UO P"])
        if contract_col and contract_col in out.columns
        else pd.Series(True, index=out.index)
    )
    has_overrides = '_override_kup_50' in out.columns and '_override_leave_days' in out.columns

    def row_to_uop(row):
        sal = float(row[salary_col]) if pd.notna(row[salary_col]) else 0
        if has_overrides:
            kup_50 = bool(row.get('_override_kup_50', False))
            leave_days = int(row.get('_override_leave_days', 0) or 0)
        else:
            kup_50, leave_days = False, 0
        if is_b2b.loc[row.name]:
            return calculate_virtual_gross_with_overrides(sal, leave_days, kup_50)
        if is_uop.loc[row.name] and kup_50:
            return sal
        return sal

    out[uop_output_col] = out.apply(row_to_uop, axis=1).round(2)
    return out


def create_overrides_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Tworzy DataFrame do edycji nadpisań (Employee_ID, Position, Contract, 50%_KUP, Dni_wolne_B2B)."""
    if df is None or df.empty:
        return pd.DataFrame()
    id_col = next((c for c in ['Employee_ID', 'ID', 'id', 'Index'] if c in df.columns), None)
    pos_col = next((c for c in ['Position', 'Stanowisko', 'Job'] if c in df.columns), None)
    contract_col = next((c for c in ['Contract_Type', 'ContractType', 'Contract', 'Umowa'] if c in df.columns), None)
    data = {
        'Employee_ID': df[id_col].astype(str) if id_col else df.index.astype(str),
        'Position': df[pos_col].astype(str) if pos_col else 'N/A',
        'Contract': df[contract_col].astype(str) if contract_col else 'N/A',
        '50%_KUP': False,
        'Dni_wolne_B2B': 0,
    }
    return pd.DataFrame(data)
