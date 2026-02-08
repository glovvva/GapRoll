# -*- coding: utf-8 -*-
"""
B2B Equalizer Module
====================
B2B-to-UoP conversion, ZUS helpers, overrides (50% KUP, paid leave).
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional

# B2B Equalizer v2.0 – konfiguracja 2026
ZUS_CAP_ANNUAL = 282_600
RATE_CAPPED = 0.1626
RATE_UNCAPPED = 0.0422
B2B_LEAVE_FACTOR = 0.917
ZUS_B2B_MONTHLY = 1_600
KUP_50_PERCENT_ANNUAL_LIMIT = 120_000


def _zus_employer_annual(gross_annual: float) -> float:
    """Koszt ZUS pracodawcy rocznie."""
    capped_part = min(gross_annual, ZUS_CAP_ANNUAL) * RATE_CAPPED
    uncapped_part = gross_annual * RATE_UNCAPPED
    return capped_part + uncapped_part


def _employer_cost_annual(gross_annual: float) -> float:
    """Roczny koszt pracodawcy = Brutto + ZUS pracodawcy."""
    return gross_annual + _zus_employer_annual(gross_annual)


def calculate_virtual_gross_uop(b2b_net_monthly) -> float:
    """Konwertuje Fakturę B2B Netto na Wirtualne Brutto UoP (binary search + ZUS + urlop)."""
    if b2b_net_monthly <= 0:
        return 0
    target_tec_annual = b2b_net_monthly * 12 * B2B_LEAVE_FACTOR
    low, high = 0.0, target_tec_annual
    for _ in range(40):
        mid_gross = (low + high) / 2
        zus_capped = min(mid_gross, ZUS_CAP_ANNUAL) * RATE_CAPPED
        zus_uncapped = mid_gross * RATE_UNCAPPED
        current_tec = mid_gross + zus_capped + zus_uncapped
        if current_tec < target_tec_annual:
            low = mid_gross
        else:
            high = mid_gross
    return round(low / 12)


def calculate_b2b_equivalents(invoice_netto: float, tax_rate: float) -> Dict:
    """Kalkulator B2B Equalizer: uop_brutto, b2b_take_home, employer_cost."""
    uop_brutto = calculate_virtual_gross_uop(invoice_netto)
    employer_cost = invoice_netto
    b2b_take_home = invoice_netto - (invoice_netto * tax_rate) - ZUS_B2B_MONTHLY
    return {
        "uop_brutto": round(uop_brutto, 0),
        "b2b_take_home": round(b2b_take_home, 0),
        "employer_cost": round(employer_cost, 0),
    }


def b2b_to_uop_bulk(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    contract_col: Optional[str] = None,
    uop_output_col: str = "Salary_UoP",
) -> pd.DataFrame:
    """Przelicza masowo B2B na ekwiwalent UoP (B2B Equalizer v2.0)."""
    if df is None or df.empty:
        return df.copy() if df is not None else pd.DataFrame()
    out = df.copy()
    if salary_col not in out.columns:
        out[uop_output_col] = np.nan
        return out
    is_b2b = (
        out[contract_col].astype(str).str.strip().str.upper().isin(["B2B", "B2B "])
        if contract_col and contract_col in out.columns
        else pd.Series(False, index=out.index)
    )

    def row_to_uop(row):
        if is_b2b.loc[row.name]:
            return calculate_virtual_gross_uop(float(row[salary_col]))
        return float(row[salary_col])

    out[uop_output_col] = out.apply(row_to_uop, axis=1).round(2)
    return out


def calculate_virtual_gross_with_overrides(
    b2b_net_monthly: float,
    paid_leave_days: int = 0,
    kup_50_percent: bool = False,
) -> float:
    """Konwertuje B2B Netto na Wirtualne Brutto UoP z nadpisami (urlop płatny, 50% KUP)."""
    if b2b_net_monthly <= 0:
        return 0
    paid_leave_days = min(max(paid_leave_days, 0), 26)
    if paid_leave_days == 0:
        leave_factor = B2B_LEAVE_FACTOR
    else:
        leave_factor = B2B_LEAVE_FACTOR + (1 - B2B_LEAVE_FACTOR) * (paid_leave_days / 26)
    target_tec_annual = b2b_net_monthly * 12 * leave_factor
    low, high = 0.0, target_tec_annual
    for _ in range(40):
        mid_gross = (low + high) / 2
        zus_capped = min(mid_gross, ZUS_CAP_ANNUAL) * RATE_CAPPED
        zus_uncapped = mid_gross * RATE_UNCAPPED
        current_tec = mid_gross + zus_capped + zus_uncapped
        if current_tec < target_tec_annual:
            low = mid_gross
        else:
            high = mid_gross
    virtual_gross_monthly = low / 12
    if kup_50_percent:
        virtual_gross_monthly = virtual_gross_monthly * 0.88
    return round(virtual_gross_monthly)
