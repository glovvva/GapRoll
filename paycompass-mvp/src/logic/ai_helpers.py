# -*- coding: utf-8 -*-
"""
AI Helpers Module
=================
LLM-based analysis, job mapping, and scoring (OpenAI/LangChain).
"""

import json
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from .csv_loader import get_unique_positions

MAPPING_AGENT_SYSTEM_PROMPT = """Jesteś agentem mapowania stanowisk zgodnym z Dyrektywą UE 2023/970 o przejrzystości wynagrodzeń.

Twoje zadanie: dla każdej unikalnej NAZWY STANOWISKA z listy użytkownika zwróć:
1. ZNORMALIZOWANA_NAZWA – ujednolicona nazwa stanowiska (np. "Specjalista ds. HR" zamiast "Spec. HR", "HR Specialist").
2. KATEGORIA – krótka kategoria (np. IT, HR, Zarządzanie, Operacje, Finanse, Sprzedaż).
3. POZIOM – wyłącznie jedna z wartości: Junior, Mid, Senior (na podstawie typowego zakresu odpowiedzialności).
4. SCORING – sugerowana wartość stanowiska w skali 1–100 (wg kryteriów Dyrektywy: kompetencje, wysiłek, odpowiedzialność, warunki pracy).

Zasady:
- Zwracaj wyłącznie JSON. Nie wysyłaj całego pliku – tylko przetworzone unikalne nazwy.
- Zachowaj dokładną kolejność stanowisk z listy wejściowej.
- Nazwa z pliku (oryginał) musi być w każdym wierszu zwrotnym, aby można było połączyć dane.
- Scoring 1–100: Junior zwykle 20–45, Mid 45–70, Senior 70–95."""


def get_ai_analysis(api_key, context_data):
    """Senior Compensation Consultant & Legal Auditor – ryzyka w dziale."""
    if not api_key:
        return "⚠️ Wprowadz klucz API w panelu bocznym lub skonfiguruj .env."
    try:
        chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o")
        prompt = f"""
        Jestes Senior Compensation Consultant & Legal Auditor. Identyfikuj ryzyka w dziale {context_data['dept']}.
        DANE: Pracownicy: {context_data['count']}, Śr. płaca: {context_data['avg_sal']} PLN, Pay Gap: {context_data['gap']}%, Śr. scoring: {context_data['scoring']}
        ZADANIE: 1. Ryzyko prawne (1-10) pod kątem dyrektywy UE. 2. Konkretny problem. 3. Twarda rekomendacja dla Zarządu.
        Pisz konkretnie, profesjonalnie, bez zbędnych uprzejmości.
        """
        response = chat.invoke([HumanMessage(content=prompt)])
        return response.content
    except Exception as e:
        return f"❌ Błąd AI: {str(e)}"


def get_unique_positions_mapping(df, api_key: str, position_col=None) -> list:
    """AI Mapping: unikalne stanowiska → znormalizowana nazwa, kategoria, poziom, scoring (gpt-4o-mini)."""
    if df is None or df.empty or not api_key:
        return []
    if position_col is None:
        for c in ["Stanowisko", "Position", "Stanowiska", "Job", "Tytuł"]:
            if c in df.columns:
                position_col = c
                break
        if position_col is None and len(df.columns) > 0:
            position_col = df.columns[0]
    if position_col not in df.columns:
        return []
    unique_names = get_unique_positions(df, position_col)
    if not unique_names:
        return []
    try:
        chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o-mini", response_format={"type": "json_object"})
        list_str = ", ".join(f'"{n}"' for n in unique_names[:200])
        user_prompt = f"""Przetwórz poniższe unikalne nazwy stanowisk. Zwróć JSON w formacie:
{{"mapowanie": [{{"nazwa_z_pliku": "oryginalna nazwa", "znormalizowana_nazwa": "Nazwa ujednolicona", "kategoria": "IT", "poziom": "Mid", "scoring": 55}}, ...]}}

LISTA UNIKALNYCH NAZW STANOWISK (tylko te nazwy – nie cały plik):
[{list_str}]"""
        response = chat.invoke([HumanMessage(content=f"{MAPPING_AGENT_SYSTEM_PROMPT}\n\n{user_prompt}")])
        data = json.loads(response.content)
        raw_out = data.get("mapowanie", data.get("wyniki", []))
        out = []
        for i, name in enumerate(unique_names):
            row = raw_out[i] if i < len(raw_out) else {}
            if not isinstance(row, dict):
                row = {}
            row["nazwa_z_pliku"] = name
            row.setdefault("znormalizowana_nazwa", name)
            row.setdefault("kategoria", "Inne")
            if "poziom" in row:
                p = str(row["poziom"]).strip().capitalize()
                row["poziom"] = "Junior" if ("Junior" in p or p == "Junior") else ("Senior" if ("Senior" in p or p == "Senior") else "Mid")
            else:
                row["poziom"] = "Mid"
            row["scoring"] = max(1, min(100, int(row["scoring"]))) if "scoring" in row else 50
            out.append(row)
        return out
    except Exception:
        return []


def get_ai_job_scoring_mini(api_key: str, positions: list) -> list:
    """Przypisuje kategorię i wstępny scoring (1-100) stanowiskom (gpt-4o-mini, 4 kryteria Dyrektywy)."""
    if not api_key or not positions:
        return []
    try:
        chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o-mini", response_format={"type": "json_object"})
        list_str = ", ".join(f'"{p}"' for p in positions[:200])
        prompt = f"""
Jesteś ekspertem ds. wyceny wartości pracy zgodnie z Dyrektywą UE 2023/970.
Dla każdego stanowiska z listy:
1. Przypisz krótką kategorię (np. "IT", "HR", "Zarządzanie", "Operacje").
2. Oceń w skali 1-100 każde z 4 kryteriów: Kompetencje, Wysiłek, Odpowiedzialność, Warunki pracy.
3. Oblicz wstępny scoring (1-100) jako średnią zaokrągloną z tych 4 wartości.

LISTA STANOWISK: [{list_str}]

Zwróć wyłącznie JSON w formacie:
{{"wyniki": [{{"stanowisko": "nazwa", "kategoria": "IT", "kompetencje": 70, "wysilek": 50, "odpowiedzialnosc": 60, "warunki": 40, "scoring": 55}}, ...]}}
"""
        response = chat.invoke([HumanMessage(content=prompt)])
        data = json.loads(response.content)
        out = data.get("wyniki", data.get("gradings", []))
        for r in out:
            if "scoring" not in r and all(k in r for k in ("kompetencje", "wysilek", "odpowiedzialnosc", "warunki")):
                r["scoring"] = int(round((r["kompetencje"] + r["wysilek"] + r["odpowiedzialnosc"] + r["warunki"]) / 4))
        return out
    except Exception:
        return []


def get_ai_job_grading(api_key, job_titles):
    """Pełny format wyceny (gpt-4o): title, skills, effort, responsibility, conditions, justification. Zawsze zwraca {'gradings': [...]}."""
    default_result = {"gradings": []}
    if not api_key or not job_titles:
        return default_result
    try:
        chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o", response_format={"type": "json_object"})
        prompt = f"""
        Jesteś ekspertem ds. wyceny wartości pracy zgodnie z Dyrektywą UE 2023/970.
        Oceń każde z poniższych stanowisk w skali 0-100 dla każdego z czterech kryteriów:
        1. Kompetencje (Skills)
        2. Wysiłek (Effort)
        3. Odpowiedzialność (Responsibility)
        4. Warunki pracy (Working conditions)

        LISTA STANOWISK: {job_titles}

        Zwróć JSON: {{"gradings": [{{ "title": "nazwa", "skills": 80, "effort": 40, "responsibility": 70, "conditions": 20, "justification": "krótkie uzasadnienie" }}, ...]}}
        """
        response = chat.invoke([HumanMessage(content=prompt)])
        content = getattr(response, "content", response) if not isinstance(response, str) else response
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")
        content = str(content).replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        gradings = data.get("gradings", data.get("wyniki", []))
        if not isinstance(gradings, list):
            gradings = []
        return {"gradings": gradings}
    except json.JSONDecodeError:
        return default_result
    except Exception:
        return default_result
