# -*- coding: utf-8 -*-
"""
Job Grading Module
==================
Wartościowanie stanowisk (Job Valuation), mapowanie score → tier.
Supports AI-Assisted Buckets UX: returns structured data (proposed_groups, unassigned_roles)
ready for drag-and-drop UI.
"""

import pandas as pd
from typing import Dict, List, Any, Optional

# Industry Standard Gradation (0–1000 pkt)
TIER_DEFINITIONS = [
    {"id": "junior", "name": "Junior (Entry)", "score_min": 0, "score_max": 150},
    {"id": "mid", "name": "Mid / Regular", "score_min": 151, "score_max": 300},
    {"id": "senior", "name": "Senior", "score_min": 301, "score_max": 500},
    {"id": "expert", "name": "Expert / Architect", "score_min": 501, "score_max": 700},
    {"id": "head", "name": "Head of Department", "score_min": 701, "score_max": 900},
    {"id": "executive", "name": "Executive / C-Suite", "score_min": 901, "score_max": 9999},
]

MAX_CATEGORY_POINTS = 25.0  # EU Standard per category


def map_score_to_tier(score: float) -> str:
    """
    Mapuje total score na poziom hierarchiczny (Industry Standard Gradation).

    Args:
        score: Total score (0–1000 pkt) obliczony jako suma ważona 4 kategorii

    Returns:
        str: Nazwa rangi/poziomu
    """
    if pd.isna(score):
        return "Brak oceny"

    score = float(score)

    if score <= 150:
        return "Junior (Entry)"
    elif score <= 300:
        return "Mid / Regular"
    elif score <= 500:
        return "Senior"
    elif score <= 700:
        return "Expert / Architect"
    elif score <= 900:
        return "Head of Department"
    else:
        return "Executive / C-Suite"


def calculate_weighted_score(
    skills: float,
    effort: float,
    responsibility: float,
    conditions: float,
    weights: Dict[str, float],
) -> float:
    """
    Oblicza ważony total score na podstawie 4 kategorii i wag.

    Args:
        skills: Punkty za wiedzę/umiejętności (0–25 EU Standard)
        effort: Punkty za wysiłek (0–25)
        responsibility: Punkty za odpowiedzialność (0–25)
        conditions: Punkty za warunki pracy (0–25)
        weights: {'skills': 0.35, 'effort': 0.20, 'responsibility': 0.35, 'conditions': 0.10}

    Returns:
        float: Ważony total score (0–1000 pkt)
    """
    skills_pct = float(skills) / MAX_CATEGORY_POINTS if not pd.isna(skills) else 0
    effort_pct = float(effort) / MAX_CATEGORY_POINTS if not pd.isna(effort) else 0
    responsibility_pct = float(responsibility) / MAX_CATEGORY_POINTS if not pd.isna(responsibility) else 0
    conditions_pct = float(conditions) / MAX_CATEGORY_POINTS if not pd.isna(conditions) else 0

    total_score = (
        skills_pct * weights.get("skills", 0.25) * 1000
        + effort_pct * weights.get("effort", 0.25) * 1000
        + responsibility_pct * weights.get("responsibility", 0.25) * 1000
        + conditions_pct * weights.get("conditions", 0.25) * 1000
    )

    return round(total_score, 1)


def get_tier_definitions() -> List[Dict[str, Any]]:
    """
    Zwraca definicje tierów dla UI (np. drag-and-drop buckets).

    Returns:
        list[dict]: [{"id", "name", "score_min", "score_max"}, ...]
    """
    return [dict(t) for t in TIER_DEFINITIONS]


def propose_tier_buckets(
    valuations_df: pd.DataFrame,
    weights: Optional[Dict[str, float]] = None,
    job_title_col: str = "job_title",
    skills_col: str = "skills",
    effort_col: str = "effort",
    responsibility_col: str = "responsibility",
    conditions_col: str = "conditions",
    total_score_col: str = "total_score",
) -> Dict[str, Any]:
    """
    Buduje strukturę "Proposed Groups" i "Unassigned Roles" dla AI-Assisted Buckets UX.
    Każda grupa to jeden tier z listą ról (stanowisk); role bez wyniku trafiają do unassigned.

    Args:
        valuations_df: DataFrame z wartościowaniami (kolumny: job_title, skills, effort, ...)
        weights: Wagi do przeliczenia score (jeśli brak total_score). Domyślnie równomierne.
        job_title_col: Nazwa kolumny ze stanowiskiem
        skills_col, effort_col, ...: Nazwy kolumn kryteriów
        total_score_col: Kolumna z total score (opcjonalna; jeśli brak, liczymy z wag)

    Returns:
        dict: {
            "tier_definitions": [...],
            "proposed_groups": [
                {
                    "id": "tier_junior",
                    "name": "Junior (Entry)",
                    "tier": "Junior (Entry)",
                    "score_range": [0, 150],
                    "roles": [{"job_title": str, "score": float, "skills": int, ...}, ...],
                },
                ...
            ],
            "unassigned_roles": [{"job_title": str, "reason": "no_score"}, ...],
        }
    """
    if weights is None:
        weights = {"skills": 0.25, "effort": 0.25, "responsibility": 0.25, "conditions": 0.25}

    tier_defs = get_tier_definitions()
    proposed_groups: List[Dict[str, Any]] = []
    unassigned_roles: List[Dict[str, Any]] = []

    # Inicjalizuj grupy po tierach
    for t in tier_defs:
        proposed_groups.append({
            "id": f"tier_{t['id']}",
            "name": t["name"],
            "tier": t["name"],
            "score_range": [t["score_min"], t["score_max"]],
            "roles": [],
        })

    if valuations_df is None or valuations_df.empty:
        return {
            "tier_definitions": tier_defs,
            "proposed_groups": proposed_groups,
            "unassigned_roles": unassigned_roles,
        }

    for _, row in valuations_df.iterrows():
        job_title = row.get(job_title_col)
        if pd.isna(job_title) or str(job_title).strip() == "":
            unassigned_roles.append({"job_title": str(job_title) if job_title else "(brak nazwy)", "reason": "empty_title"})
            continue

        job_title = str(job_title).strip()
        total_score = row.get(total_score_col)

        if pd.isna(total_score) or total_score == "":
            # Oblicz z kryteriów jeśli są
            sk = row.get(skills_col, 0)
            ef = row.get(effort_col, 0)
            res = row.get(responsibility_col, 0)
            cond = row.get(conditions_col, 0)
            if pd.notna(sk) and pd.notna(ef) and pd.notna(res) and pd.notna(cond):
                total_score = calculate_weighted_score(float(sk), float(ef), float(res), float(cond), weights)
            else:
                unassigned_roles.append({"job_title": job_title, "reason": "no_score"})
                continue

        total_score = float(total_score)
        tier_name = map_score_to_tier(total_score)

        role_payload = {
            "job_title": job_title,
            "score": total_score,
            "skills": row.get(skills_col),
            "effort": row.get(effort_col),
            "responsibility": row.get(responsibility_col),
            "conditions": row.get(conditions_col),
        }

        for grp in proposed_groups:
            if grp["name"] == tier_name:
                grp["roles"].append(role_payload)
                break
        else:
            unassigned_roles.append({"job_title": job_title, "score": total_score, "reason": "tier_not_matched"})

    return {
        "tier_definitions": tier_defs,
        "proposed_groups": proposed_groups,
        "unassigned_roles": unassigned_roles,
    }
