"""
Router analizy płac - pay gap i statystyki.
"""

from collections import defaultdict
from typing import Any, Dict, List

import statistics
from fastapi import APIRouter, HTTPException

from config import settings
from supabase import create_client

router = APIRouter(prefix="/analysis", tags=["analysis"])


def calculate_fair_pay_line(data_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Oblicza linię regresji liniowej (Fair Pay Line).
    Używa numeric encoding dla stanowisk.
    """
    if len(data_points) < 2:
        return {"slope": 0, "intercept": 0, "line_points": []}

    positions = sorted(set(p["position"] for p in data_points))
    position_to_num = {pos: idx for idx, pos in enumerate(positions)}

    x_values = [position_to_num[p["position"]] for p in data_points]
    y_values = [p["salary"] for p in data_points]

    n = len(x_values)
    x_mean = sum(x_values) / n
    y_mean = sum(y_values) / n

    numerator = sum(
        (x_values[i] - x_mean) * (y_values[i] - y_mean) for i in range(n)
    )
    denominator = sum((x_values[i] - x_mean) ** 2 for i in range(n))

    if denominator == 0:
        return {"slope": 0, "intercept": y_mean, "line_points": []}

    slope = numerator / denominator
    intercept = y_mean - slope * x_mean

    line_points = []
    for pos in positions:
        x = position_to_num[pos]
        y = slope * x + intercept
        line_points.append({"position": pos, "salary": round(y, 2)})

    return {
        "slope": round(slope, 2),
        "intercept": round(intercept, 2),
        "line_points": line_points,
    }


@router.get("/paygap")
async def get_pay_gap_analysis(
    user_id: str = "00000000-0000-0000-0000-000000000000",  # temporary
) -> Dict[str, Any]:
    """
    Oblicza lukę płacową (pay gap) między mężczyznami a kobietami.

    Returns:
        - overall_gap_percent: float (całkowita luka %)
        - median_male: float
        - median_female: float
        - count_male: int
        - count_female: int
        - gap_by_position: List[Dict] (luka per stanowisko)
        - data_points: List[Dict] (dla scatter plot)
    """
    try:
        if not settings.is_supabase_configured():
            raise HTTPException(
                status_code=503,
                detail="Supabase nie jest skonfigurowane.",
            )

        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

        response = (
            supabase.table("payroll_data")
            .select("first_name, last_name, position, gender, salary")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Brak danych do analizy")

        data = response.data
        print(f"DEBUG: Fetched {len(data)} records for analysis")

        male_salaries = []
        female_salaries = []
        data_points = []

        for row in data:
            salary = float(row.get("salary") or 0)
            if salary <= 0:
                continue

            gender = (row.get("gender") or "").strip().lower()

            if gender in ["mężczyzna", "male", "m", "męzczyzna"]:
                male_salaries.append(salary)
                gender_normalized = "Male"
            elif gender in ["kobieta", "female", "f", "k"]:
                female_salaries.append(salary)
                gender_normalized = "Female"
            else:
                continue

            data_points.append(
                {
                    "name": f"{row.get('first_name', '')} {row.get('last_name', '')}".strip(),
                    "position": row.get("position", "Unknown"),
                    "gender": gender_normalized,
                    "salary": salary,
                }
            )

        if not male_salaries or not female_salaries:
            raise HTTPException(
                status_code=400,
                detail="Brak wystarczających danych (potrzeba mężczyzn i kobiet)",
            )

        median_male = statistics.median(male_salaries)
        median_female = statistics.median(female_salaries)
        overall_gap_percent = ((median_male - median_female) / median_male) * 100

        gap_by_position = calculate_gap_by_position(data)

        fair_pay_line = calculate_fair_pay_line(data_points)
        print(
            f"DEBUG: Fair Pay Line - slope: {fair_pay_line['slope']}, intercept: {fair_pay_line['intercept']}"
        )

        return {
            "overall_gap_percent": round(overall_gap_percent, 2),
            "median_male": round(median_male, 2),
            "median_female": round(median_female, 2),
            "count_male": len(male_salaries),
            "count_female": len(female_salaries),
            "gap_by_position": gap_by_position,
            "data_points": data_points,
            "fair_pay_line": fair_pay_line,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR get_pay_gap_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


def calculate_gap_by_position(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Grupuje po stanowisku i oblicza gap.
    RODO: maskuj jeśli N < 3 w danej płci.
    """
    positions = defaultdict(lambda: {"male": [], "female": []})

    for row in data:
        salary = float(row.get("salary") or 0)
        if salary <= 0:
            continue

        position = row.get("position", "Unknown")
        gender = (row.get("gender") or "").strip().lower()

        if gender in ["mężczyzna", "male", "m", "męzczyzna"]:
            positions[position]["male"].append(salary)
        elif gender in ["kobieta", "female", "f", "k"]:
            positions[position]["female"].append(salary)

    result = []

    for position, salaries in positions.items():
        male_list = salaries["male"]
        female_list = salaries["female"]

        if len(male_list) < 3 or len(female_list) < 3:
            result.append(
                {
                    "position": position,
                    "gap_percent": None,
                    "median_male": None,
                    "median_female": None,
                    "count_male": len(male_list),
                    "count_female": len(female_list),
                    "masked": True,
                    "reason": "RODO: Mniej niż 3 osoby w grupie",
                }
            )
            continue

        median_m = statistics.median(male_list)
        median_f = statistics.median(female_list)
        gap = ((median_m - median_f) / median_m) * 100

        result.append(
            {
                "position": position,
                "gap_percent": round(gap, 2),
                "median_male": round(median_m, 2),
                "median_female": round(median_f, 2),
                "count_male": len(male_list),
                "count_female": len(female_list),
                "masked": False,
            }
        )

    return result
