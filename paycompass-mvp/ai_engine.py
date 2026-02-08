from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import json

def get_expert_analysis(api_key, context, memory):
    """Analiza ekspercka z uwzględnieniem historii z pamięci firmy i Głęboką Wiedzą Przyczynową."""
    chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o")
    
    history_str = ""
    if memory.get("history"):
        last = memory["history"][-1]
        history_str = f"HISTORIA: Poprzedni audyt ({last['timestamp']}) wykazał Pay Gap: {last['gap']}%."

    # Głęboka Wiedza Przyczynowa – zaktualizowany prompt Legal Compliance Auditor
    system_prompt = """Jesteś Legal Compliance Auditor specjalizującym się w Dyrektywie (UE) 2023/970 
o przejrzystości wynagrodzeń. Twoja analiza musi być precyzyjna, oparta na dowodach i gotowa 
do obrony przed organami nadzoru (PIP, sąd pracy).

KLUCZOWE ZJAWISKA DO IDENTYFIKACJI:

1. CHCIWA PRACA (Greedy Work): Czy płaca rośnie NIELINIOWO względem czasu pracy lub dyspozycyjności? 
   Pracownicy z nadgodzinami/dyżurami mogą otrzymywać nieproporcjonalnie wysokie wynagrodzenie, 
   co dyskryminuje osoby z obowiązkami opiekuńczymi (statystycznie: kobiety).

2. PĘKNIĘTY SZCZEBEL (Broken Rung): Czy kobiety utykają na poziomie L1/L2 (Junior/Mid) 
   mimo porównywalnych wyników (Scoring)? Sprawdź, czy awanse na poziom L3+ są równomiernie 
   rozłożone między płciami.

3. PARADOKS SIMPSONA: Brak luki płacowej NA POZIOMIE STANOWISKA może MASKOWAĆ segregację pionową. 
   Jeśli kobiety dominują w nisko płatnych działach, a mężczyźni w wysoko płatnych, 
   globalna luka jest realna mimo pozornej równości.

4. STRONNICZOŚĆ BLISKOŚCI (Proximity Bias): Jeśli dane zawierają tryb pracy (Remote/Hybrid/Office), 
   sprawdź, czy nie ma "kary za Home Office" - systematycznie niższych wynagrodzeń lub wolniejszych 
   awansów dla pracowników zdalnych.

WYMOGI PRAWNE (Art. 18 Dyrektywy 2023/970):
- ODWRÓCONY CIĘŻAR DOWODU: To pracodawca musi udowodnić, że różnice wynagrodzeniowe są uzasadnione 
  obiektywnymi, neutralnymi płciowo czynnikami.
- OBIEKTYWNE KRYTERIA: Staż, zakres obowiązków, kwalifikacje, wyniki - ale NIE negocjacje wyjściowe.
- DOKUMENTACJA: Każda luka > 5% wymaga pisemnego uzasadnienia w raporcie dla organu nadzoru."""

    user_prompt = f"""
ANALIZA DZIAŁU: {context['dept']}
DANE WEJŚCIOWE:
- Liczba pracowników: {context['count']}
- Wykryta luka płacowa (Pay Gap): {context['gap']}%
- Średni Scoring (wartość pracy): {context['scoring']}
{history_str}

ZADANIE:
1. Zidentyfikuj, które z 4 zjawisk (Chciwa Praca, Pęknięty Szczebel, Paradoks Simpsona, Stronniczość Bliskości) 
   NAJPRAWDOPODOBNIEJ wyjaśnia wykrytą lukę w tym dziale.
2. Oceń ryzyko prawne (skala 1-10) w kontekście Art. 18 Dyrektywy 2023/970.
3. Podaj 1 KONKRETNĄ rekomendację naprawczą dla Zarządu z terminem wdrożenia.

FORMAT ODPOWIEDZI:
- Pisz w tonie audytora prawnego (Legal Compliance Auditor)
- Używaj terminologii Dyrektywy UE 2023/970
- Odwołuj się do odwróconego ciężaru dowodu (Art. 18)
- Bądź konkretny, techniczny, bez zbędnych uprzejmości
- Max 200 słów
"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    return chat.invoke(messages).content

def get_ai_job_grading(api_key, titles):
    """Re-eksport bezpiecznej wersji z logic.py (zawsze zwraca dict z kluczem 'gradings')."""
    from logic import get_ai_job_grading as _get_ai_job_grading
    return _get_ai_job_grading(api_key, titles)