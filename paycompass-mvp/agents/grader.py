"""
agents/grader.py - EU Standard Grader
Moduł wartościowania stanowisk zgodnie z Artykułem 4 Dyrektywy UE 2023/970

Architektura VAULT - PayCompass Pro
Strict Modularization Standard: logika AI w agents/
"""

import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


# ==============================================================================
# STAŁE I KONFIGURACJA
# ==============================================================================

# Maksymalna liczba punktów w każdej kategorii
MAX_CATEGORY_SCORE = 25
TOTAL_MAX_SCORE = 100

# Próg pewności - poniżej tego model zwraca "Do weryfikacji"
CONFIDENCE_THRESHOLD = 0.6

# Kategorie oceny zgodne z Dyrektywą UE 2023/970, Art. 4
EVALUATION_CATEGORIES = [
    "skills",           # Kompetencje/Wiedza
    "effort",           # Wysiłek fizyczny i psychiczny
    "responsibility",   # Odpowiedzialność
    "conditions",       # Warunki pracy
]


# ==============================================================================
# STRUKTURY DANYCH
# ==============================================================================

@dataclass
class JobValuationResult:
    """Wynik wartościowania stanowiska."""
    job_title: str
    skills: int                    # 0-25 pkt
    effort: int                    # 0-25 pkt
    responsibility: int            # 0-25 pkt
    conditions: int                # 0-25 pkt
    total_score: int               # 0-100 pkt
    justification: str             # Uzasadnienie oceny
    confidence: float              # 0.0-1.0 poziom pewności
    needs_review: bool             # Flaga "Do weryfikacji"
    raw_response: Optional[Dict]   # Surowa odpowiedź modelu
    
    def to_dict(self) -> Dict:
        """Konwertuje do słownika."""
        return asdict(self)
    
    @classmethod
    def create_uncertain(cls, job_title: str, reason: str = "Model niepewny oceny") -> 'JobValuationResult':
        """Tworzy wynik z flagą 'Do weryfikacji' gdy model jest niepewny."""
        return cls(
            job_title=job_title,
            skills=0,
            effort=0,
            responsibility=0,
            conditions=0,
            total_score=0,
            justification=reason,
            confidence=0.0,
            needs_review=True,
            raw_response=None
        )


# ==============================================================================
# SYSTEM PROMPT - DYREKTYWA UE 2023/970
# ==============================================================================

EU_GRADER_SYSTEM_PROMPT = """Jesteś ekspertem ds. wartościowania stanowisk pracy zgodnie z Dyrektywą UE 2023/970 o przejrzystości wynagrodzeń (Pay Transparency Directive).

## Twoje zadanie
Oceń podane stanowisko w 4 kategoriach, przyznając punkty w skali 0-25 dla każdej kategorii.

## Kategorie oceny (Art. 4 Dyrektywy):

### 1. SKILLS (Kompetencje/Wiedza) - 0-25 pkt
Oceniaj:
- Wymagane wykształcenie i certyfikaty
- Doświadczenie zawodowe
- Specjalistyczna wiedza techniczna
- Umiejętności miękkie (komunikacja, negocjacje)
- Znajomość języków obcych
- Zdolności analityczne i rozwiązywania problemów

### 2. EFFORT (Wysiłek) - 0-25 pkt
WAŻNE: Ocena musi być GENDER-NEUTRAL. Nie faworyzuj wysiłku fizycznego nad psychicznym.
Oceniaj równoważnie:
- Wysiłek fizyczny (praca stojąca, podnoszenie, precyzja manualna)
- Wysiłek psychiczny (koncentracja, stres, presja czasowa, monotonia)
- Wysiłek emocjonalny (praca z klientami, trudne sytuacje)
- Intensywność pracy i tempo

### 3. RESPONSIBILITY (Odpowiedzialność) - 0-25 pkt
Oceniaj:
- Odpowiedzialność za ludzi (zarządzanie zespołem)
- Odpowiedzialność finansowa (budżety, decyzje zakupowe)
- Odpowiedzialność za bezpieczeństwo (BHP, dane, systemy)
- Wpływ decyzji na organizację
- Reprezentowanie firmy na zewnątrz

### 4. CONDITIONS (Warunki pracy) - 0-25 pkt
Oceniaj:
- Środowisko fizyczne (hałas, temperatura, zagrożenia)
- Czas pracy (zmianowość, nadgodziny, dyspozycyjność)
- Stres i presja psychiczna
- Podróże służbowe
- Praca zdalna vs. stacjonarna

## Skala punktowa (dla każdej kategorii):
- 0-5: Minimalne wymagania
- 6-10: Podstawowe wymagania
- 11-15: Umiarkowane wymagania
- 16-20: Wysokie wymagania
- 21-25: Bardzo wysokie wymagania

## Zasady oceny:
1. Bądź obiektywny i konsekwentny
2. Unikaj stereotypów płciowych
3. Oceniaj STANOWISKO, nie konkretną osobę
4. Jeśli nie znasz stanowiska lub nazwa jest niejednoznaczna, ustaw confidence < 0.6
5. Uzasadnienie musi być konkretne i odnosić się do kategorii

## Format odpowiedzi (TYLKO JSON):
{
    "skills": <0-25>,
    "effort": <0-25>,
    "responsibility": <0-25>,
    "conditions": <0-25>,
    "justification": "<krótkie uzasadnienie po polsku, max 200 znaków>",
    "confidence": <0.0-1.0>
}

WAŻNE: Zwróć TYLKO JSON, bez żadnego dodatkowego tekstu."""


# ==============================================================================
# KLASA GŁÓWNA: AIJobGrader
# ==============================================================================

class AIJobGrader:
    """
    Agent AI do wartościowania stanowisk zgodnie z Dyrektywą UE 2023/970.
    
    Używa modelu GPT-4o-mini do oceny stanowisk w 4 kategoriach:
    - Skills (Kompetencje)
    - Effort (Wysiłek)
    - Responsibility (Odpowiedzialność)
    - Conditions (Warunki pracy)
    
    Przykład użycia:
        grader = AIJobGrader(api_key="sk-...")
        result = grader.evaluate("Senior Accountant")
        result.total_score  # e.g. 68
    """
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        """
        Inicjalizuje grader.
        
        Args:
            api_key: Klucz API OpenAI
            model: Model do użycia (domyślnie gpt-4o-mini)
        """
        if not api_key:
            raise ValueError("Klucz API OpenAI jest wymagany")
        
        self.api_key = api_key
        self.model = model
        self.chat = ChatOpenAI(
            openai_api_key=api_key,
            model=model,
            temperature=0.3,  # Niska temperatura dla spójności
            response_format={"type": "json_object"}
        )
    
    def evaluate(self, job_title: str) -> JobValuationResult:
        """
        Ocenia pojedyncze stanowisko.
        
        Args:
            job_title: Nazwa stanowiska (np. "Senior Accountant")
        
        Returns:
            JobValuationResult: Wynik wartościowania
        """
        if not job_title or not job_title.strip():
            return JobValuationResult.create_uncertain(
                job_title=job_title or "",
                reason="Pusta nazwa stanowiska"
            )
        
        job_title = job_title.strip()
        
        try:
            # Przygotuj wiadomości
            messages = [
                SystemMessage(content=EU_GRADER_SYSTEM_PROMPT),
                HumanMessage(content=f"Oceń stanowisko: {job_title}")
            ]
            
            # Wywołaj model
            response = self.chat.invoke(messages)
            
            # Parsuj odpowiedź JSON
            return self._parse_response(job_title, response.content)
            
        except Exception as e:
            return JobValuationResult.create_uncertain(
                job_title=job_title,
                reason=f"Błąd API: {str(e)[:100]}"
            )
    
    def evaluate_batch(self, job_titles: List[str], progress_callback=None) -> List[JobValuationResult]:
        """
        Ocenia wiele stanowisk.
        
        Args:
            job_titles: Lista nazw stanowisk
            progress_callback: Opcjonalna funkcja callback(current, total, job_title)
        
        Returns:
            List[JobValuationResult]: Lista wyników
        """
        results = []
        total = len(job_titles)
        
        for i, title in enumerate(job_titles):
            if progress_callback:
                progress_callback(i + 1, total, title)
            
            result = self.evaluate(title)
            results.append(result)
        
        return results
    
    def _parse_response(self, job_title: str, content: str) -> JobValuationResult:
        """
        Parsuje odpowiedź modelu do JobValuationResult.
        
        Args:
            job_title: Nazwa stanowiska
            content: Odpowiedź modelu (JSON string)
        
        Returns:
            JobValuationResult: Sparsowany wynik
        """
        try:
            # Wyczyść odpowiedź z markdown jeśli jest
            content = content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            content = content.strip()
            
            data = json.loads(content)
            
            # Wyciągnij i zwaliduj wartości
            skills = self._clamp_score(data.get("skills", 0))
            effort = self._clamp_score(data.get("effort", 0))
            responsibility = self._clamp_score(data.get("responsibility", 0))
            conditions = self._clamp_score(data.get("conditions", 0))
            confidence = min(1.0, max(0.0, float(data.get("confidence", 0.5))))
            justification = str(data.get("justification", ""))[:500]
            
            # Oblicz total score
            total_score = skills + effort + responsibility + conditions
            
            # Sprawdź czy wymaga weryfikacji (Zero Hallucination)
            needs_review = confidence < CONFIDENCE_THRESHOLD
            
            if needs_review:
                justification = f"[DO WERYFIKACJI] {justification}"
            
            return JobValuationResult(
                job_title=job_title,
                skills=skills,
                effort=effort,
                responsibility=responsibility,
                conditions=conditions,
                total_score=total_score,
                justification=justification,
                confidence=confidence,
                needs_review=needs_review,
                raw_response=data
            )
            
        except json.JSONDecodeError:
            return JobValuationResult.create_uncertain(
                job_title=job_title,
                reason="Nieprawidłowy format odpowiedzi modelu"
            )
        except Exception as e:
            return JobValuationResult.create_uncertain(
                job_title=job_title,
                reason=f"Błąd parsowania: {str(e)[:50]}"
            )
    
    @staticmethod
    def _clamp_score(value: Any) -> int:
        """Ogranicza wartość do zakresu 0-25."""
        try:
            score = int(float(value))
            return max(0, min(MAX_CATEGORY_SCORE, score))
        except (TypeError, ValueError):
            return 0


# ==============================================================================
# FUNKCJE POMOCNICZE (do użycia bez tworzenia instancji)
# ==============================================================================

def grade_job(api_key: str, job_title: str) -> JobValuationResult:
    """
    Funkcja pomocnicza do szybkiej oceny pojedynczego stanowiska.
    
    Args:
        api_key: Klucz API OpenAI
        job_title: Nazwa stanowiska
    
    Returns:
        JobValuationResult: Wynik wartościowania
    """
    grader = AIJobGrader(api_key)
    return grader.evaluate(job_title)


def grade_jobs_batch(api_key: str, job_titles: List[str], progress_callback=None) -> List[JobValuationResult]:
    """
    Funkcja pomocnicza do oceny wielu stanowisk.
    
    Args:
        api_key: Klucz API OpenAI
        job_titles: Lista nazw stanowisk
        progress_callback: Opcjonalna funkcja callback
    
    Returns:
        List[JobValuationResult]: Lista wyników
    """
    grader = AIJobGrader(api_key)
    return grader.evaluate_batch(job_titles, progress_callback)


def results_to_dataframe(results: List[JobValuationResult]):
    """
    Konwertuje listę wyników do pandas DataFrame.
    
    Args:
        results: Lista JobValuationResult
    
    Returns:
        pd.DataFrame: Tabela wyników
    """
    import pandas as pd
    
    data = []
    for r in results:
        data.append({
            'Stanowisko': r.job_title,
            'Skills': r.skills,
            'Effort': r.effort,
            'Responsibility': r.responsibility,
            'Conditions': r.conditions,
            'Total Score': r.total_score,
            'Confidence': f"{r.confidence:.0%}",
            'Status': '⚠️ Do weryfikacji' if r.needs_review else '✓ OK',
            'Uzasadnienie': r.justification,
        })
    
    return pd.DataFrame(data)


# ==============================================================================
# TEST (uruchom bezpośrednio: python agents/grader.py)
# ==============================================================================

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        exit(1)
    
    grader = AIJobGrader(api_key)
    test_jobs = [
        "Senior Accountant",
        "Junior Software Developer",
        "Warehouse Worker",
        "Chief Financial Officer",
        "Receptionist",
    ]
    for job in test_jobs:
        grader.evaluate(job)
