# Audyt tłumaczeń UI na polski (i18n)

**Data:** 2026-02-14  
**Zakres:** Dashboard, Pay Gap, EVG Scoring, Raport Art. 16  
**Zasady:** formalna polszczyzna, nazwy własne (PayCompass, EVG) bez tłumaczenia, zmienne w kodzie po angielsku, etykiety UI po polsku.

---

## PRIORYTET 1 – Dashboard (`apps/web/app/dashboard/page.tsx`)

| Było (EN)           | Jest (PL)              | Status   |
|---------------------|------------------------|----------|
| Total Employees     | Liczba Pracowników     | ✅ Zmieniono |
| Pay Gap             | Luka Płacowa           | ✅ Zmieniono |
| EVG Groups          | Grupy EVG              | ✅ Zmieniono |
| Reports             | Raporty                | ✅ Zmieniono |
| Welcome to PayCompass | Witamy w PayCompass  | ✅ Zmieniono |

**Uwagi:** Nazwa „PayCompass” zachowana (nazwa własna). Metryki ExplainableMetric (Luka Płacowa (Mediana), Luka w Kwartylu 4, Wskaźnik Reprezentacji Kobiet) były już po polsku.

---

## PRIORYTET 2 – Pay Gap (`apps/web/app/dashboard/paygap/page.tsx`)

| Element                    | Było (EN / niespójne) | Jest (PL)                    | Status   |
|---------------------------|------------------------|------------------------------|----------|
| Nagłówek strony          | Analiza Luki Płacowej  | Bez zmian (już PL)           | ✅       |
| Karta „Całkowita Luka”   | Całkowita Luka Płacowa | Bez zmian (już PL)           | ✅       |
| Karta mediana M           | Mediana Mężczyźni      | Mediana (mężczyźni)          | ✅ Zmieniono |
| Karta mediana K           | Mediana Kobiety        | Mediana (kobiety)            | ✅ Zmieniono |
| Tabela – tytuł            | Luka Płacowa per Stanowisko | Bez zmian (już PL)     | ✅       |
| Tabela – nagłówki         | Stanowisko, Luka %, Mediana M, Mediana K, Liczebność | Bez zmian (już PL) | ✅       |
| Wykres – oś X (EVG)       | EVG Score              | Wynik EVG                    | ✅ Zmieniono |
| Legenda wykresu – linia   | Fair Pay Line          | Linia Fair Pay               | ✅ Zmieniono |
| Karta „Fair Pay Line”     | Fair Pay Line          | Linia Fair Pay               | ✅ Zmieniono |
| ExplainerCard tytuł       | Co to jest Fair Pay Line? | Co to jest Linia Fair Pay? | ✅ Zmieniono |
| Opis równania             | Salary = … × EVG_Score | Wynagrodzenie = … × Wynik_EVG | ✅ Zmieniono |
| Tekst „EVG Score” w opisach | EVG Score            | wynik EVG                    | ✅ Zmieniono |
| Lista „Porównaj M/F…”     | EVG Scores             | wynikach EVG, M/K            | ✅ Zmieniono |

**Tooltip RODO:** „Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)” – bez zmian (już PL).

---

## PRIORYTET 3 – EVG Scoring (`apps/web/app/dashboard/evg/page.tsx`)

| Element              | Było (EN)     | Jest (PL)        | Status   |
|----------------------|---------------|------------------|----------|
| Tytuł tabeli         | Wyniki Scoringu | Bez zmian (już PL) | ✅    |
| Nagłówek kolumny     | Total Score   | Wynik Całkowity  | ✅ Zmieniono |
| Nagłówki kolumn      | Skills, Effort, Responsibility, Conditions | Umiejętności, Wysiłek, Odpowiedzialność, Warunki | ✅ (wcześniejsza zmiana) |
| Lista kryteriów (karta) | Umiejętności, Wysiłek… | Bez zmian (już PL) | ✅ |
| Sekcja METODOLOGIA   | Umiejętności (0-25)… | Bez zmian (już PL) | ✅ |

**Uwagi:** EVG pozostaje jako skrót (nazwa własna). Nagłówek strony „EVG Scoring” zachowany (termin z Dyrektywy).

---

## PRIORYTET 4 – Raport Art. 16 (`apps/web/app/dashboard/report/page.tsx`)

| Element                    | Było (EN / mieszane)     | Jest (PL)                          | Status   |
|---------------------------|--------------------------|------------------------------------|----------|
| Nagłówek raportu          | Raport Równości Wynagrodzeń (Art. 16) | Bez zmian (już PL)           | ✅       |
| Informacja o N&lt;3       | N&lt;3 suppressed: X groups. | Grupy z N&lt;3 (ukryte RODO): X.   | ✅ Zmieniono |
| Karta kwartyle            | Rozkład kwartylowy (Kobiety / Mężczyźni) | Bez zmian (już PL)        | ✅       |
| Opis karty                | Tabela Q1–Q4 × Kobiety/Mężczyźni | Bez zmian (już PL)              | ✅       |
| Nagłówki tabeli           | Kwartyl, Zakres, Mediana M, Mediana K, Mężczyźni, Kobiety, Δ | Bez zmian (już PL) | ✅       |
| Tooltip InfoTooltip       | Podział na 4 grupy… Art. 16… | Bez zmian (już PL)                 | ✅       |
| Przypis RODO pod tabelą   | *** Dane ukryte…         | Bez zmian (już PL)                 | ✅       |
| Sekcja „Jak interpretować?” | Treść po polsku       | Bez zmian (już PL)                 | ✅       |

**Uwagi:** „Quartile Distribution” nie występowało w UI; używany jest „Rozkład kwartylowy” / „Rozkład kwartylowy (Kobiety / Mężczyźni)”. Wszystkie sprawdzone nagłówki i tooltipy są po polsku.

---

## Podsumowanie

- **Dashboard:** 5 etykiet metryk + 1 tytuł karty przetłumaczone na polski.
- **Pay Gap:** Ujednolicone „Mediana (mężczyźni)” / „Mediana (kobiety)”; etykiety wykresu i karty (Wynik EVG, Linia Fair Pay, równanie, opisy) po polsku.
- **EVG:** Kolumna „Total Score” → „Wynik Całkowity”; pozostałe kolumny i kryteria już po polsku.
- **Raport Art. 16:** Tekst „N&lt;3 suppressed…” zastąpiony polskim „Grupy z N&lt;3 (ukryte RODO): X.”; reszta sprawdzona – bez angielskich nagłówków.

**Nazwy własne zachowane:** PayCompass, EVG (jako skrót), Fair Pay → „Linia Fair Pay” (termin w kontekście polskim).

**Konwencja kodu:** Nazwy zmiennych, pól API i kluczy (np. `evg_score`, `gap_percent`, `median_male`) pozostają po angielsku; zmieniane były wyłącznie etykiety wyświetlane użytkownikowi.

---

**Ścieżka w repozytorium:** `paycompass-v2/docs/outputs/i18n-polish-audit.md`
