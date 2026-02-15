"""
Router analizy płac - pay gap, EVG scoring i statystyki.
"""

import json
import time
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import statistics
from fastapi import APIRouter, Depends, HTTPException

from routers.auth import get_current_user
from openai import OpenAI
from pydantic import BaseModel

from config import settings
from supabase import create_client

router = APIRouter(prefix="/analysis", tags=["analysis"])

# Cache dla dashboard-metrics: user_id -> (expiry_timestamp, data)
_DASHBOARD_METRICS_CACHE: Dict[str, Tuple[float, Dict[str, Any]]] = {}
_DASHBOARD_CACHE_TTL = 300  # 5 minut


def invalidate_dashboard_cache(user_id: str) -> None:
    """Wywołaj po uploadzie nowych danych, aby unieważnić cache metryk."""
    _DASHBOARD_METRICS_CACHE.pop(user_id, None)


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

        # Generuj punkty linii (od min do max EVG score)
        min_score = int(min(x_values))
        max_score = int(max(x_values))

        line_points = []
        # Generate points co 1 punkt (dla smooth line)
        for score in range(min_score, max_score + 1):
            salary = slope * score + intercept
            line_points.append({"evg_score": score, "salary": round(salary, 2)})

        # CRITICAL: Zawsze dodaj pierwszy i ostatni punkt (endpoints)
        if min_score not in [p["evg_score"] for p in line_points]:
            line_points.insert(0, {"evg_score": min_score, "salary": round(slope * min_score + intercept, 2)})
        if max_score not in [p["evg_score"] for p in line_points]:
            line_points.append({"evg_score": max_score, "salary": round(slope * max_score + intercept, 2)})

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
    user_id: str = Depends(get_current_user),
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


def _should_mask_gender(count_male: int, count_female: int, gender: str) -> bool:
    """
    Art. 9 Dyrektywy UE 2023/970: maskuj TYLKO tę płeć, która ma N < 3.
    """
    if gender == "male":
        return count_male < 3
    if gender == "female":
        return count_female < 3
    return True  # inna / nieznana


def calculate_gap_by_position(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Grupuje po stanowisku i oblicza gap.
    RODO (Art. 9): maskuj tylko tę płeć, która ma N < 3 w grupie.
    Np. 4 M / 0 K → Mediana M pokazana, Mediana K = ***, Gap % = RODO.
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
        count_male = len(male_list)
        count_female = len(female_list)

        median_m = statistics.median(male_list) if male_list else None
        median_f = statistics.median(female_list) if female_list else None

        mask_male = _should_mask_gender(count_male, count_female, "male")
        mask_female = _should_mask_gender(count_male, count_female, "female")

        median_male_val = None if mask_male else (round(median_m, 2) if median_m is not None else None)
        median_female_val = None if mask_female else (round(median_f, 2) if median_f is not None else None)

        gap_percent = None
        if median_male_val is not None and median_female_val is not None and median_male_val > 0:
            gap_percent = round(
                ((median_male_val - median_female_val) / median_male_val) * 100, 2
            )

        result.append(
            {
                "position": position,
                "gap_percent": gap_percent,
                "median_male": median_male_val,
                "median_female": median_female_val,
                "count_male": count_male,
                "count_female": count_female,
                "masked": gap_percent is None,
                "reason": "RODO: Dane ukryte (mniej niż 3 osoby w grupie)" if gap_percent is None else None,
            }
        )

    return result


# ==================== EVG SCORING ====================


class EVGScoreRequest(BaseModel):
    """Request body dla POST /evg-score - lista stanowisk do oceny."""

    positions: List[str]


async def score_position_with_ai(position: str) -> Dict[str, Any]:
    """Wywołaj OpenAI API do scoringu stanowiska. Uzasadnienie (reasoning) zwracane wyłącznie po polsku."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    system_content = """You are a job evaluation expert for EU Pay Transparency Directive 2023/970 (Art. 4).
CRITICAL: Respond ONLY in Polish. Use formal business language (formalna polszczyzna).
The "reasoning" field MUST be exactly one sentence in Polish, starting with "Stanowisko [nazwa] wymaga..." (e.g. "Stanowisko Manager wymaga znaczących umiejętności i odpowiedzialności, umiarkowanego wysiłku oraz przeciętnych warunków pracy.").
Do not use English in the reasoning. Keep the same 1-25 point scale for each criterion; only the reasoning text must be in Polish."""

    prompt = f"""Oceń to stanowisko pracy według 4 obiektywnych kryteriów (Dyrektywa UE 2023/970, Art. 4).

Stanowisko: {position}

Przyznaj każdemu kryterium od 1 do 25 punktów:

1. SKILLS (1-25 pkt): wykształcenie, wiedza techniczna, certyfikaty, doświadczenie
2. EFFORT (1-25 pkt): wysiłek fizyczny/umysłowy, stres, intensywność godzin
3. RESPONSIBILITY (1-25 pkt): władza decyzyjna, budżet, zarządzanie, wpływ na biznes
4. CONDITIONS (1-25 pkt): bezpieczeństwo, warunki fizyczne, podróże, work-life balance

Zwróć TYLKO obiekt JSON (bez markdown, bez komentarza). Pole "reasoning" musi być JEDNYM zdaniem po polsku. Zdanie musi zaczynać się od "Stanowisko {position} wymaga..." i kontynuować formalnym uzasadnieniem (np. "znaczących umiejętności i odpowiedzialności, umiarkowanego wysiłku oraz przeciętnych warunków pracy").

Przykłady poprawnego "reasoning" (zastosuj tę samą strukturę dla stanowiska "{position}"):
- "Stanowisko Manager wymaga znaczących umiejętności i odpowiedzialności, umiarkowanego wysiłku oraz przeciętnych warunków pracy."
- "Stanowisko Analyst wymaga znaczącej wiedzy technicznej i wykształcenia, umiarkowanej odpowiedzialności, znacznego wysiłku umysłowego oraz ogólnie korzystnych warunków pracy."
- "Stanowisko Developer wymaga wysokiego poziomu wiedzy technicznej i koncentracji umysłowej, umiarkowanej odpowiedzialności oraz ogólnie korzystnych warunków pracy."

Format odpowiedzi:
{{
  "skills": <liczba 1-25>,
  "effort": <liczba 1-25>,
  "responsibility": <liczba 1-25>,
  "conditions": <liczba 1-25>,
  "total_score": <suma powyższych>,
  "reasoning": "Stanowisko {position} wymaga [jedno zdanie - formalna polszczyzna]."
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_content},
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
async def score_positions(
    request: EVGScoreRequest,
    user_id: str = Depends(get_current_user),
) -> Dict[str, Any]:
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
                    .eq("user_id", user_id)
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
                "user_id": user_id,
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


@router.delete("/evg-cache")
async def clear_evg_cache(
    user_id: str = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Czyści cache EVG (job_valuations) dla zalogowanego użytkownika.
    Po wywołaniu scoring zostanie przeliczony od zera przy następnym uruchomieniu.
    """
    try:
        if not settings.is_supabase_configured():
            raise HTTPException(
                status_code=503,
                detail="Supabase nie jest skonfigurowane.",
            )
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        supabase.table("job_valuations").delete().eq("user_id", user_id).execute()
        print(f"DEBUG: Cleared EVG cache for user_id={user_id}")
        return {"ok": True, "message": "Cache wyczyszczony."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR clear_evg_cache: {e}")
        raise HTTPException(
            status_code=500,
            detail="Nie udało się wyczyścić cache. Spróbuj ponownie.",
        ) from e


@router.get("/dashboard-metrics")
async def get_dashboard_metrics(
    user_id: str = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Metryki dla dashboardu: luka płacowa (mediana), luka w Q4, reprezentacja kobiet (zarząd).
    Cache 5 min; unieważniane przy uploadzie nowych danych.
    """
    now = time.time()
    cached = _DASHBOARD_METRICS_CACHE.get(user_id)
    if cached and now < cached[0]:
        return cached[1]

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
        data = response.data or []
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR get_dashboard_metrics fetch: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

    out: Dict[str, Any] = {
        "median_gap_percent": None,
        "median_gap_citation": "Art. 9 ust. 2 Dyrektywy UE 2023/970",
        "median_gap_explanation": "Mediana to środkowa wartość w uporządkowanym zbiorze wynagrodzeń. Luka płacowa obliczana jest jako różnica median męskich i żeńskich, podzielona przez medianę męską.",
        "median_gap_confidence": None,
        "quartile4_gap_percent": None,
        "quartile4_gap_citation": "Art. 16 ust. 1 lit. b Dyrektywy UE 2023/970",
        "quartile4_gap_explanation": "Kwartyl 4 to 25% najlepiej zarabiających pracowników. Wysoka luka w tym kwartylu wskazuje na niedoreprezentację kobiet na stanowiskach kierowniczych.",
        "quartile4_gap_confidence": None,
        "female_representation_percent": None,
        "female_representation_citation": "Art. 7 ust. 1 Dyrektywy UE 2023/970",
        "female_representation_explanation": "Odsetek kobiet w składzie zarządu. Dyrektywa wymaga raportowania reprezentacji w kategoriach zarządczych.",
        "female_representation_confidence": None,
    }

    def _is_male(g: str) -> bool:
        g = (g or "").strip().lower()
        return g in ["mężczyzna", "male", "m", "męzczyzna"]

    def _is_female(g: str) -> bool:
        g = (g or "").strip().lower()
        return g in ["kobieta", "female", "f", "k"]

    # 1. Median gap (cała organizacja)
    male_salaries = []
    female_salaries = []
    for row in data:
        s = float(row.get("salary") or 0)
        if s <= 0:
            continue
        g = row.get("gender") or ""
        if _is_male(g):
            male_salaries.append(s)
        elif _is_female(g):
            female_salaries.append(s)

    if male_salaries and female_salaries:
        n_m, n_f = len(male_salaries), len(female_salaries)
        rodo_note = " (RODO: mniej niż 3 osoby)" if n_m < 3 or n_f < 3 else ""
        out["median_gap_explanation"] = out["median_gap_explanation"].rstrip(".") + rodo_note + "."
        if n_m >= 3 and n_f >= 3:
            med_m = statistics.median(male_salaries)
            med_f = statistics.median(female_salaries)
            out["median_gap_percent"] = round(((med_m - med_f) / med_m) * 100, 2)
            out["median_gap_confidence"] = 0.95 if n_m >= 30 and n_f >= 30 else 0.85
        else:
            out["median_gap_confidence"] = 0.0

    # 2. Quartile 4 gap
    all_salaries = [float(r.get("salary") or 0) for r in data if float(r.get("salary") or 0) > 0]
    if len(all_salaries) >= 4:
        sorted_sal = sorted(all_salaries)
        q3_boundary = float(np.percentile(sorted_sal, 75))
        q4_male = []
        q4_female = []
        for row in data:
            s = float(row.get("salary") or 0)
            if s <= 0 or s < q3_boundary:
                continue
            g = row.get("gender") or ""
            if _is_male(g):
                q4_male.append(s)
            elif _is_female(g):
                q4_female.append(s)
        n_q4_m, n_q4_f = len(q4_male), len(q4_female)
        rodo_q4 = " (RODO: mniej niż 3 osoby)" if n_q4_m < 3 or n_q4_f < 3 else ""
        out["quartile4_gap_explanation"] = out["quartile4_gap_explanation"].rstrip(".") + rodo_q4 + "."
        if n_q4_m >= 3 and n_q4_f >= 3:
            med_q4_m = statistics.median(q4_male)
            med_q4_f = statistics.median(q4_female)
            out["quartile4_gap_percent"] = round(((med_q4_m - med_q4_f) / med_q4_m) * 100, 2)
            out["quartile4_gap_confidence"] = 0.92 if (n_q4_m + n_q4_f) >= 10 else 0.80
        else:
            out["quartile4_gap_confidence"] = 0.0

    # 3. Female representation (zarząd: Manager / Director / CEO)
    board_keywords = ["manager", "director", "ceo", "zarząd", "dyrektor", "kierownik"]
    board_male = 0
    board_female = 0
    for row in data:
        pos = (row.get("position") or "").lower()
        if not any(kw in pos for kw in board_keywords):
            continue
        g = row.get("gender") or ""
        if _is_male(g):
            board_male += 1
        elif _is_female(g):
            board_female += 1
    board_total = board_male + board_female
    if board_total > 0:
        out["female_representation_percent"] = round((board_female / board_total) * 100, 2)
        out["female_representation_confidence"] = 1.0
        if board_total < 3:
            out["female_representation_explanation"] = (
                out["female_representation_explanation"].rstrip(".") + " (RODO: mniej niż 3 osoby)."
            )
            out["female_representation_confidence"] = 0.0

    _DASHBOARD_METRICS_CACHE[user_id] = (now + _DASHBOARD_CACHE_TTL, out)
    return out


# ==================== ART. 16 (Quarterly analysis) ====================


@router.get("/art16")
async def get_art16_analysis(
    user_id: str = Depends(get_current_user),
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
                        "median_male": None,
                        "median_female": None,
                        "count_male": 0,
                        "count_female": 0,
                        "percent_male": 0.0,
                        "percent_female": 0.0,
                    }
                )
                continue

            median_male = (
                round(statistics.median(male_salaries), 2)
                if count_male >= 3 and male_salaries
                else None
            )
            median_female = (
                round(statistics.median(female_salaries), 2)
                if count_female >= 3 and female_salaries
                else None
            )
            quartiles.append(
                {
                    "quartile": q_name,
                    "label": labels[q_name],
                    "min_salary": round(min(all_q_salaries), 2),
                    "max_salary": round(max(all_q_salaries), 2),
                    "median_salary": round(
                        statistics.median(all_q_salaries), 2
                    ),
                    "median_male": median_male,
                    "median_female": median_female,
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
