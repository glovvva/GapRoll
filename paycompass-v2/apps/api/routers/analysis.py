"""
Router analizy płac - pay gap, EVG scoring i statystyki.
"""

import json
from collections import defaultdict
from typing import Any, Dict, List

import numpy as np
import statistics
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from config import settings
from supabase import create_client

router = APIRouter(prefix="/analysis", tags=["analysis"])


def calculate_fair_pay_line(data_points: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Oblicza linię regresji liniowej (Fair Pay Line).
    Używa EVG score jako X (jeśli dostępne), inaczej position encoding.
    """
    if len(data_points) < 2:
        return {"slope": 0, "intercept": 0, "line_points": [], "use_evg": False}

    has_evg = any(p.get("evg_score") is not None for p in data_points)

    if has_evg:
        points_with_score = [
            p for p in data_points if p.get("evg_score") is not None
        ]

        if len(points_with_score) < 2:
            return {"slope": 0, "intercept": 0, "line_points": [], "use_evg": False}

        x_values = [p["evg_score"] for p in points_with_score]
        y_values = [p["salary"] for p in points_with_score]

        n = len(x_values)
        x_mean = sum(x_values) / n
        y_mean = sum(y_values) / n

        numerator = sum(
            (x_values[i] - x_mean) * (y_values[i] - y_mean) for i in range(n)
        )
        denominator = sum((x_values[i] - x_mean) ** 2 for i in range(n))

        if denominator == 0:
            return {
                "slope": 0,
                "intercept": y_mean,
                "line_points": [],
                "use_evg": True,
            }

        slope = numerator / denominator
        intercept = y_mean - slope * x_mean

        min_score = min(x_values)
        max_score = max(x_values)

        line_points = []
        for score in range(int(min_score), int(max_score) + 1, 5):
            salary = slope * score + intercept
            line_points.append({"evg_score": score, "salary": round(salary, 2)})

        return {
            "slope": round(slope, 2),
            "intercept": round(intercept, 2),
            "line_points": line_points,
            "use_evg": True,
        }

    else:
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
            return {
                "slope": 0,
                "intercept": y_mean,
                "line_points": [],
                "use_evg": False,
            }

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
            "use_evg": False,
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

        evg_scores = {}
        try:
            scores_response = (
                supabase.table("job_valuations")
                .select("position, evg_score")
                .eq("user_id", user_id)
                .execute()
            )
            if scores_response.data:
                evg_scores = {
                    s["position"]: s["evg_score"] for s in scores_response.data
                }
                print(f"DEBUG: Loaded {len(evg_scores)} EVG scores from cache")
        except Exception as e:
            print(f"DEBUG: No EVG scores found (table may not exist): {e}")

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
                    "evg_score": evg_scores.get(row.get("position", "Unknown")),
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
        print(
            f"DEBUG: Fair Pay Line uses EVG: {fair_pay_line.get('use_evg', False)}"
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


# ==================== EVG SCORING ====================


class EVGScoreRequest(BaseModel):
    """Request body dla POST /evg-score - lista stanowisk do oceny."""

    user_id: str = "00000000-0000-0000-0000-000000000000"
    positions: List[str]


async def score_position_with_ai(position: str) -> Dict[str, Any]:
    """Wywołaj OpenAI API do scoringu stanowiska."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    prompt = f"""You are an expert in job evaluation for EU Pay Transparency Directive 2023/970 (Art. 4).

Evaluate this job position using 4 objective criteria:

Position: {position}

Rate each criterion on a scale of 1-25 points:

1. SKILLS (1-25 points):
   - Education requirements
   - Technical expertise
   - Certifications needed
   - Years of experience

2. EFFORT (1-25 points):
   - Physical demands
   - Mental concentration
   - Stress level
   - Working hours intensity

3. RESPONSIBILITY (1-25 points):
   - Decision-making authority
   - Budget responsibility
   - Team leadership
   - Impact on business

4. CONDITIONS (1-25 points):
   - Work environment safety
   - Physical conditions
   - Travel requirements
   - Work-life balance

Return ONLY a JSON object (no markdown, no explanation):
{{
  "skills": <number 1-25>,
  "effort": <number 1-25>,
  "responsibility": <number 1-25>,
  "conditions": <number 1-25>,
  "total_score": <sum of above>,
  "reasoning": "<brief 1-sentence justification>"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a job evaluation expert."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content or "{}")

        total = (
            result.get("skills", 0)
            + result.get("effort", 0)
            + result.get("responsibility", 0)
            + result.get("conditions", 0)
        )
        result["total_score"] = total

        print(f"DEBUG: Scored {position} → {total}/100")

        return result

    except Exception as e:
        print(f"ERROR scoring {position}: {e}")
        raise HTTPException(status_code=500, detail=f"AI scoring failed: {str(e)}") from e


@router.post("/evg-score")
async def score_positions(request: EVGScoreRequest) -> Dict[str, Any]:
    """
    Scoring stanowisk pracy używając AI (GPT-4o).
    Zwraca EVG score (1-100) dla każdego stanowiska.
    """
    try:
        if not settings.OPENAI_API_KEY:
            raise HTTPException(
                status_code=503,
                detail="OpenAI API key not configured",
            )

        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        results = []

        for position in request.positions:
            try:
                cached = (
                    supabase.table("job_valuations")
                    .select("*")
                    .eq("position", position)
                    .eq("user_id", request.user_id)
                    .execute()
                )

                if cached.data:
                    results.append(cached.data[0])
                    print(f"DEBUG: Cache hit for {position}")
                    continue
            except Exception:
                print("DEBUG: Cache table doesn't exist, skipping cache")

            score_data = await score_position_with_ai(position)

            record = {
                "position": position,
                "user_id": request.user_id,
                "evg_score": score_data["total_score"],
                "skills": score_data.get("skills", 0),
                "effort": score_data.get("effort", 0),
                "responsibility": score_data.get("responsibility", 0),
                "conditions": score_data.get("conditions", 0),
                "reasoning": score_data.get("reasoning", ""),
            }

            try:
                supabase.table("job_valuations").insert(record).execute()
            except Exception as e:
                print(f"DEBUG: Could not cache result: {e}")

            results.append(record)

        return {"scores": results}

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR score_positions: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


# ==================== ART. 16 (Quarterly analysis) ====================


@router.get("/art16")
async def get_art16_analysis(
    user_id: str = "00000000-0000-0000-0000-000000000000",
) -> Dict[str, Any]:
    """
    Art. 16 Dyrektywy UE 2023/970 - quarterly analysis.
    Zwraca:
    - quartiles (4 quartile wynagrodzenia)
    - gender_distribution per quartile
    - joint_assessment_required (True jeśli w którymkolwiek quartile gap > 5%)
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
            .select("position, gender, salary")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Brak danych do analizy")

        data = response.data

        all_salaries = [
            float(row.get("salary") or 0)
            for row in data
            if float(row.get("salary") or 0) > 0
        ]

        if len(all_salaries) < 4:
            raise HTTPException(
                status_code=400,
                detail="Za mało danych (wymagane minimum 4 pracowników)",
            )

        all_salaries_sorted = sorted(all_salaries)
        q1_boundary = float(np.percentile(all_salaries_sorted, 25))
        q2_boundary = float(np.percentile(all_salaries_sorted, 50))
        q3_boundary = float(np.percentile(all_salaries_sorted, 75))

        quartile_data: Dict[str, Dict[str, List[float]]] = {
            "Q1": {"male": [], "female": []},
            "Q2": {"male": [], "female": []},
            "Q3": {"male": [], "female": []},
            "Q4": {"male": [], "female": []},
        }

        for row in data:
            salary = float(row.get("salary") or 0)
            if salary <= 0:
                continue

            gender = (row.get("gender") or "").strip().lower()
            if gender not in [
                "mężczyzna",
                "male",
                "m",
                "męzczyzna",
                "kobieta",
                "female",
                "f",
                "k",
            ]:
                continue

            gender_key = (
                "male"
                if gender in ["mężczyzna", "male", "m", "męzczyzna"]
                else "female"
            )

            if salary <= q1_boundary:
                quartile_data["Q1"][gender_key].append(salary)
            elif salary <= q2_boundary:
                quartile_data["Q2"][gender_key].append(salary)
            elif salary <= q3_boundary:
                quartile_data["Q3"][gender_key].append(salary)
            else:
                quartile_data["Q4"][gender_key].append(salary)

        labels = {
            "Q1": "Najniższe (0-25%)",
            "Q2": "Niskie-Średnie (25-50%)",
            "Q3": "Średnie-Wysokie (50-75%)",
            "Q4": "Najwyższe (75-100%)",
        }

        quartiles: List[Dict[str, Any]] = []
        for q_name in ["Q1", "Q2", "Q3", "Q4"]:
            male_salaries = quartile_data[q_name]["male"]
            female_salaries = quartile_data[q_name]["female"]
            all_q_salaries = male_salaries + female_salaries

            count_male = len(male_salaries)
            count_female = len(female_salaries)
            total = count_male + count_female

            if total == 0:
                quartiles.append(
                    {
                        "quartile": q_name,
                        "label": labels[q_name],
                        "min_salary": 0,
                        "max_salary": 0,
                        "median_salary": 0,
                        "count_male": 0,
                        "count_female": 0,
                        "percent_male": 0.0,
                        "percent_female": 0.0,
                    }
                )
                continue

            quartiles.append(
                {
                    "quartile": q_name,
                    "label": labels[q_name],
                    "min_salary": round(min(all_q_salaries), 2),
                    "max_salary": round(max(all_q_salaries), 2),
                    "median_salary": round(
                        statistics.median(all_q_salaries), 2
                    ),
                    "count_male": count_male,
                    "count_female": count_female,
                    "percent_male": round(count_male / total * 100, 2),
                    "percent_female": round(count_female / total * 100, 2),
                }
            )

        joint_assessment_required = any(
            abs(q["percent_male"] - q["percent_female"]) > 5 for q in quartiles
        )

        total_male = sum(q["count_male"] for q in quartiles)
        total_female = sum(q["count_female"] for q in quartiles)
        total_employees = total_male + total_female
        overall_gender_balance = {
            "percent_male": round(total_male / total_employees * 100, 2)
            if total_employees else 0,
            "percent_female": round(total_female / total_employees * 100, 2)
            if total_employees else 0,
        }

        print(
            f"DEBUG: Art.16 - {len(all_salaries)} employees, {len(quartiles)} quartiles"
        )
        print(f"DEBUG: Joint Assessment Required: {joint_assessment_required}")

        return {
            "quartiles": quartiles,
            "joint_assessment_required": joint_assessment_required,
            "total_employees": total_employees,
            "overall_gender_balance": overall_gender_balance,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR get_art16_analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
