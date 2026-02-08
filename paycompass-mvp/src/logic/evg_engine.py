# -*- coding: utf-8 -*-
"""
EVG Engine Module
=================
Equal Value Groups (Art. 4 Dyrektywy UE 2023/970).
Assigns employees to score-based buckets and computes pay gap by group.
Supports AI-Assisted Buckets UX: returns structured data (proposed_groups, unassigned_roles)
ready for drag-and-drop UI.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional

# RODO: min persons per gender to show pay gap (0 = DEV mode, 3 = production)
RODO_GROUP_THRESHOLD = 0

MALE_LABELS = ("M", "Mężczyzna", "Mezczyzna")
FEMALE_LABELS = ("K", "Kobieta", "F")


def create_equal_value_groups(
    df: pd.DataFrame,
    valuations_df: pd.DataFrame,
    bin_size: int = 10,
    position_col: Optional[str] = None,
    valuation_title_col: str = "job_title",
    valuation_score_col: str = "total_score",
) -> pd.DataFrame:
    """
    Przypisuje każdemu pracownikowi wynik punktowy na podstawie stanowiska
    i grupuje w przedziały "Kategorii Równej Wartości" (Equal Value Groups).
    Zgodne z Art. 4 Dyrektywy UE 2023/970.

    Returns:
        pd.DataFrame: Kopia df z kolumnami EVG_Score, EVG_Group, EVG_Bin.
    """
    if df is None or df.empty:
        return pd.DataFrame()

    if valuations_df is None or valuations_df.empty:
        result = df.copy()
        result["EVG_Score"] = np.nan
        result["EVG_Group"] = "Uncategorized"
        result["EVG_Bin"] = -1
        return result

    if position_col is None:
        for col_name in ["Position", "Stanowisko", "Job", "Tytuł", "Job_Title", "position"]:
            if col_name in df.columns:
                position_col = col_name
                break

    if position_col is None or position_col not in df.columns:
        result = df.copy()
        result["EVG_Score"] = np.nan
        result["EVG_Group"] = "Uncategorized"
        result["EVG_Bin"] = -1
        return result

    valuations_dict = {}
    for _, row in valuations_df.iterrows():
        title = str(row.get(valuation_title_col, "")).strip().lower()
        score = row.get(valuation_score_col, 0)
        if title and pd.notna(score):
            valuations_dict[title] = int(score)

    result = df.copy()

    def get_score(position):
        if pd.isna(position):
            return np.nan
        pos_lower = str(position).strip().lower()
        return valuations_dict.get(pos_lower, np.nan)

    result["EVG_Score"] = result[position_col].apply(get_score)

    def get_evg_group(score):
        if pd.isna(score):
            return "Uncategorized"
        score = int(score)
        if score < 0:
            return "Uncategorized"
        if score > 100:
            score = 100
        bin_start = (score // bin_size) * bin_size
        bin_end = min(bin_start + bin_size - 1, 100)
        if bin_start == 0:
            bin_start = 1
        return f"{bin_start}-{bin_end} pkt"

    def get_evg_bin(score):
        if pd.isna(score) or score < 0:
            return -1
        return int(score) // bin_size

    result["EVG_Group"] = result["EVG_Score"].apply(get_evg_group)
    result["EVG_Bin"] = result["EVG_Score"].apply(get_evg_bin)

    return result


def get_evg_summary(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
) -> pd.DataFrame:
    """
    Tworzy podsumowanie statystyk dla każdej grupy EVG.
    Kolumny: EVG_Group, Total, Men, Women, Avg_Salary, Avg_Men, Avg_Women, Pay_Gap.
    """
    if df is None or df.empty or "EVG_Group" not in df.columns:
        return pd.DataFrame()

    summary_data = []
    for group_name, group_df in df.groupby("EVG_Group", dropna=False):
        if group_name is None:
            group_name = "Uncategorized"

        men_df = group_df[group_df[gender_col].isin(MALE_LABELS)]
        women_df = group_df[group_df[gender_col].isin(FEMALE_LABELS)]
        total = len(group_df)
        n_men = len(men_df)
        n_women = len(women_df)

        avg_salary = group_df[salary_col].mean() if total > 0 else 0
        avg_men = men_df[salary_col].mean() if n_men > 0 else 0
        avg_women = women_df[salary_col].mean() if n_women > 0 else 0

        if n_men >= RODO_GROUP_THRESHOLD and n_women >= RODO_GROUP_THRESHOLD and avg_men > 0:
            pay_gap = round(((avg_men - avg_women) / avg_men) * 100, 1)
        else:
            pay_gap = np.nan

        summary_data.append({
            "EVG_Group": group_name,
            "Total": total,
            "Men": n_men,
            "Women": n_women,
            "Avg_Salary": round(avg_salary, 0),
            "Avg_Men": round(avg_men, 0),
            "Avg_Women": round(avg_women, 0),
            "Pay_Gap": pay_gap,
        })

    result = pd.DataFrame(summary_data)

    def sort_key(group_name):
        if group_name == "Uncategorized":
            return (1, 999)
        try:
            start = int(group_name.split("-")[0])
            return (0, start)
        except (ValueError, IndexError):
            return (1, 998)

    result["_sort"] = result["EVG_Group"].apply(sort_key)
    result = result.sort_values("_sort").drop(columns=["_sort"])

    return result


def calculate_pay_gap_evg(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
) -> float:
    """
    Oblicza ważoną średnią lukę płacową wewnątrz grup EVG.
    Returns:
        float: Ważona średnia luka płacowa (%).
    """
    if df is None or df.empty or "EVG_Group" not in df.columns:
        return 0.0

    total_weight = 0
    weighted_gap_sum = 0.0

    for group_name, group_df in df.groupby("EVG_Group", dropna=False):
        if group_name == "Uncategorized" or group_name is None:
            continue

        men = group_df[group_df[gender_col].isin(MALE_LABELS)][salary_col]
        women = group_df[group_df[gender_col].isin(FEMALE_LABELS)][salary_col]
        n_men = len(men)
        n_women = len(women)

        if n_men < RODO_GROUP_THRESHOLD or n_women < RODO_GROUP_THRESHOLD:
            continue

        m_avg = men.mean()
        w_avg = women.mean()
        if pd.isna(m_avg) or m_avg == 0:
            continue

        group_gap = ((m_avg - w_avg) / m_avg) * 100
        weight = n_men + n_women
        weighted_gap_sum += group_gap * weight
        total_weight += weight

    if total_weight == 0:
        return 0.0
    return float(round(weighted_gap_sum / total_weight, 1))


def calculate_pay_gap_by_evg_groups(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
) -> Dict[str, Optional[float]]:
    """
    Oblicza lukę płacową osobno dla każdej grupy EVG.
    Returns:
        dict: {group_name: pay_gap_value or None, ...}
    """
    if df is None or df.empty or "EVG_Group" not in df.columns:
        return {}

    result = {}
    for group_name, group_df in df.groupby("EVG_Group", dropna=False):
        if group_name is None:
            group_name = "Uncategorized"

        men = group_df[group_df[gender_col].isin(MALE_LABELS)][salary_col]
        women = group_df[group_df[gender_col].isin(FEMALE_LABELS)][salary_col]
        n_men = len(men)
        n_women = len(women)

        if n_men < RODO_GROUP_THRESHOLD or n_women < RODO_GROUP_THRESHOLD:
            result[group_name] = None
            continue

        m_avg = men.mean()
        w_avg = women.mean()
        if pd.isna(m_avg) or m_avg == 0:
            result[group_name] = None
            continue

        result[group_name] = round(((m_avg - w_avg) / m_avg) * 100, 1)

    return result


def get_high_gap_evg_categories(
    df: pd.DataFrame,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
    threshold: float = 5.0,
) -> List[Dict[str, Any]]:
    """
    Zwraca listę kategorii EVG z luką płacową przekraczającą próg (Art. 10 Joint Pay Assessment).
    Returns:
        list[dict]: [{"category": str, "gap": float, "n_employees": int}, ...]
    """
    if df is None or df.empty or "EVG_Group" not in df.columns:
        return []

    evg_gaps = calculate_pay_gap_by_evg_groups(df, salary_col, gender_col)
    high_gap_categories = []

    for category, gap in evg_gaps.items():
        if category == "Uncategorized" or gap is None:
            continue
        if abs(gap) > threshold:
            n_employees = len(df[df["EVG_Group"] == category])
            high_gap_categories.append({
                "category": category,
                "gap": gap,
                "n_employees": n_employees,
            })

    high_gap_categories.sort(key=lambda x: abs(x["gap"]), reverse=True)
    return high_gap_categories


def get_evg_buckets_structure(
    df: pd.DataFrame,
    valuations_df: pd.DataFrame,
    salary_col: str = "Salary",
    gender_col: str = "Gender",
    bin_size: int = 10,
    position_col: Optional[str] = None,
    valuation_title_col: str = "job_title",
    valuation_score_col: str = "total_score",
) -> Dict[str, Any]:
    """
    Buduje strukturę "Proposed Groups" i "Unassigned Roles" dla AI-Assisted Buckets UX.
    Każda grupa to przedział punktowy EVG z listą ról (stanowisk) i statystykami płacowymi.
    Pracownicy bez dopasowanego stanowiska w valuations trafiają do unassigned.

    Args:
        df: DataFrame pracowników (Position, Salary, Gender)
        valuations_df: DataFrame wartościowań (job_title, total_score)
        salary_col, gender_col: Kolumny wynagrodzenia i płci
        bin_size: Rozmiar przedziału EVG (domyślnie 10)
        position_col, valuation_title_col, valuation_score_col: Mapowanie kolumn

    Returns:
        dict: {
            "proposed_groups": [
                {
                    "id": "evg_41_50",
                    "name": "41-50 pkt",
                    "score_range": [41, 50],
                    "roles": [{"job_title": str, "score": int, "employee_count": int}, ...],
                    "pay_gap_pct": float | None,
                    "total_employees": int,
                    "men": int,
                    "women": int,
                    "avg_salary": float,
                },
                ...
            ],
            "unassigned_roles": [
                {"job_title": str, "score": None, "employee_count": int},
                ...
            ],
            "summary": {
                "weighted_pay_gap": float,
                "total_assigned": int,
                "total_unassigned": int,
            },
        }
    """
    out: Dict[str, Any] = {
        "proposed_groups": [],
        "unassigned_roles": [],
        "summary": {"weighted_pay_gap": 0.0, "total_assigned": 0, "total_unassigned": 0},
    }

    df_with_evg = create_equal_value_groups(
        df,
        valuations_df,
        bin_size=bin_size,
        position_col=position_col,
        valuation_title_col=valuation_title_col,
        valuation_score_col=valuation_score_col,
    )

    if "EVG_Group" not in df_with_evg.columns:
        return out

    summary_df = get_evg_summary(df_with_evg, salary_col=salary_col, gender_col=gender_col)
    gaps_by_group = calculate_pay_gap_by_evg_groups(df_with_evg, salary_col=salary_col, gender_col=gender_col)

    # Ról w grupie: unikalne stanowiska (Position) w tej grupie
    for group_name, group_df in df_with_evg.groupby("EVG_Group", dropna=False):
        if group_name is None:
            group_name = "Uncategorized"

        pos_col = position_col
        if pos_col is None:
            for c in ["Position", "Stanowisko", "Job", "Tytuł", "Job_Title", "position"]:
                if c in group_df.columns:
                    pos_col = c
                    break
        if pos_col is None:
            pos_col = "Position"

        role_counts = group_df[pos_col].value_counts()
        roles_list = []
        for job_title, employee_count in role_counts.items():
            job_str = str(job_title).strip() if pd.notna(job_title) else "(brak)"
            # Score z valuations – uproszczenie: średni EVG_Score dla tej grupy
            score_vals = group_df[group_df[pos_col] == job_title]["EVG_Score"]
            score = float(score_vals.mean()) if len(score_vals) and score_vals.notna().any() else None
            roles_list.append({
                "job_title": job_str,
                "score": int(score) if score is not None and not np.isnan(score) else None,
                "employee_count": int(employee_count),
            })

        # score_range z nazwy grupy (np. "41-50 pkt" -> [41, 50])
        score_range = [0, 0]
        if group_name != "Uncategorized":
            try:
                parts = group_name.replace(" pkt", "").split("-")
                score_range = [int(parts[0]), int(parts[1])]
            except (ValueError, IndexError):
                pass

        row_summary = summary_df[summary_df["EVG_Group"] == group_name]
        total_employees = int(group_df.shape[0])
        men = int(row_summary["Men"].iloc[0]) if len(row_summary) else 0
        women = int(row_summary["Women"].iloc[0]) if len(row_summary) else 0
        avg_salary = float(row_summary["Avg_Salary"].iloc[0]) if len(row_summary) else 0.0
        pay_gap_pct = gaps_by_group.get(group_name)

        group_id = f"evg_{score_range[0]}_{score_range[1]}" if group_name != "Uncategorized" else "evg_uncategorized"

        out["proposed_groups"].append({
            "id": group_id,
            "name": group_name,
            "score_range": score_range,
            "roles": roles_list,
            "pay_gap_pct": pay_gap_pct,
            "total_employees": total_employees,
            "men": men,
            "women": women,
            "avg_salary": avg_salary,
        })

    # Unassigned: pracownicy w grupie "Uncategorized"
    uncat_df = df_with_evg[df_with_evg["EVG_Group"] == "Uncategorized"]
    if len(uncat_df) > 0:
        pos_col = position_col
        if pos_col is None:
            for c in ["Position", "Stanowisko", "Job", "Tytuł", "Job_Title", "position"]:
                if c in uncat_df.columns:
                    pos_col = c
                    break
        if pos_col:
            for job_title, employee_count in uncat_df[pos_col].value_counts().items():
                job_str = str(job_title).strip() if pd.notna(job_title) else "(brak)"
                out["unassigned_roles"].append({
                    "job_title": job_str,
                    "score": None,
                    "employee_count": int(employee_count),
                })
        out["summary"]["total_unassigned"] = int(uncat_df.shape[0])

    total_assigned = int(df_with_evg.shape[0]) - out["summary"]["total_unassigned"]
    out["summary"]["total_assigned"] = total_assigned
    out["summary"]["weighted_pay_gap"] = calculate_pay_gap_evg(df_with_evg, salary_col=salary_col, gender_col=gender_col)

    return out
