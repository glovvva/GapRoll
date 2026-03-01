# Dashboard integration – screenshot checklist

**Strona:** `apps/web/app/dashboard/page.tsx`  
**Data integracji:** 2026-02-14

---

## Zintegrowane komponenty

| Komponent | Import | Użycie na stronie |
|-----------|--------|--------------------|
| `ExplainableMetric` | `@/components/explainability/ExplainableMetric` | 3 metryki w siatce (Luka płacowa mediana, Kwartyl 4, Reprezentacja zarząd) |
| `ComplianceAlert` | `@/components/explainability/ComplianceAlert` | Na górze strony, gdy `gap > 5%` (payGapPercent=23.5, CTA → /solio-solver) |
| `CitationBadge` | — | Używany wewnętrznie w ExplainableMetric i ComplianceAlert; brak bezpośredniego importu na dashboardzie |

---

## Checklist do weryfikacji (screenshoty / ręczny test)

### 1. ComplianceAlert (góra strony)

- [ ] **Widoczność:** Alert wyświetla się na górze dashboardu (gap 23.5% > 5%).
- [ ] **Wariant:** Critical (luka > 10%) – obramowanie/tło w kolorze czerwonym (--accent-red).
- [ ] **Treść:** Tytuł i opis w formalnej polszczyźnie, cytowanie Art. 9 Dyrektywy UE 2023/970.
- [ ] **CTA:** Link „Zobacz Plan Działania” prowadzi do `/solio-solver`.
- [ ] **CitationBadge:** Badge z cytatem Art. 9 w prawym dolnym rogu alertu.

### 2. ExplainableMetric – trzy karty

- [ ] **Metryka 1 – Luka Płacowa (Mediana):** wartość 23.5%, jednostka %, CitationBadge „Art. 9 ust. 2…”, rozwijane objaśnienie o medianie, brak badge „Wymaga weryfikacji” (confidence 0.95).
- [ ] **Metryka 2 – Luka w Kwartylu 4:** wartość 18.2%, jednostka %, CitationBadge „Art. 16 ust. 1 lit. b…”, objaśnienie o kwartylu 4, brak „Wymaga weryfikacji” (confidence 0.92).
- [ ] **Metryka 3 – Wskaźnik Reprezentacji Kobiet (Zarząd):** wartość 33.3%, jednostka %, CitationBadge „Art. 7 ust. 1…”, objaśnienie o zarządzie, brak „Wymaga weryfikacji” (confidence 1.0).
- [ ] **Wspólne:** Wartości w JetBrains Mono, 24px, pogrubione; label pod wartością; CitationBadge w prawym górnym rogu karty; po kliknięciu rozwijana sekcja z explanation.

### 3. Responsive layout

- [ ] **Mobile (< 640px):** Metryki w **1 kolumnie** (`grid-cols-1`), pełna szerokość, czytelna kolejność.
- [ ] **Tablet (640–1024px):** Metryki w **2 kolumnach** (`sm:grid-cols-2`), gap 4 między kartami.
- [ ] **Desktop (> 1024px):** Metryki w **3 kolumnach** (`lg:grid-cols-3`), gap 4.

### 4. Istniejący layout

- [ ] **Karta „Welcome to PayCompass”** pozostaje pod metrykami ExplainableMetric.
- [ ] **Cztery kafelki** (Total Employees, Pay Gap, EVG Groups, Reports) bez zmian – grid 2 kolumny, ikony, wartości.
- [ ] **Spacing:** `space-y-6` między sekcjami (ComplianceAlert → grid metryk → Card).

### 5. TypeScript

- [ ] Brak błędów typu w `dashboard/page.tsx` (value jako number, wszystkie wymagane propsy przekazane).

---

## Szybki test w przeglądarce

1. Otwórz `/dashboard`.
2. Sprawdź, czy na górze widać czerwony alert z linkiem „Zobacz Plan Działania”.
3. Sprawdź trzy karty z wartościami 23.5%, 18.2%, 33.3% i rozwijanymi objaśnieniami.
4. Zmień szerokość okna: < 640px (1 kol.), 640–1024px (2 kol.), > 1024px (3 kol.).
5. Sprawdź, czy pod metrykami jest karta „Welcome to PayCompass” z 4 kafelkami.

---

**Plik wygenerowany po integracji komponentów explainability w `apps/web/app/dashboard/page.tsx`.**

Ścieżka w repozytorium: `paycompass-v2/docs/outputs/dashboard-integration-checklist.md`.
