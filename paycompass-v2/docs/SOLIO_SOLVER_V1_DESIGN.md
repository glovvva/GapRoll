# Solio Solver v1 — Design Document
## Interaktywne modelowanie budżetowe dla wyrównania luk płacowych

**Wersja:** 1.0  
**Data:** 2026-02-15  
**Autor:** Bartek (CPTO) + Claude (AI Architect)  
**Inspiracja UX:** SolioAnalytics FPL Planner (decision trees, scenario comparison, optimization presets)  
**Konkurencja:** PayAnalytics/beqom Remediation, Syndio PayEQ Budgeting, Trusaic R.O.S.A.  
**Timeline:** Mar 23-29 (Week 8) — v1 Greedy  
**Tier:** STRATEGIA (199+ PLN/mies)

---

## 1. Analiza Konkurencji — Co Mamy Pokonać

### 1.1 PayAnalytics/beqom
- Remediation Actions: budżet top-down i bottom-up
- Personalizowane rekomendacje podwyżek per pracownik
- Mapowanie sugestii do budżetu
- Brak: interaktywnych scenariuszy, brak drzewa decyzyjnego
- Cena: €1,100+/mies (enterprise)

### 1.2 Syndio PayEQ
- Intersectional budgeting (gender + race + age)
- "Rules" remediation: min/max budżet, wykluczenie PIP, caps/floors
- Multivariate regression → kto dostaje podwyżkę
- Brak: real-time sliders, brak porównania scenariuszy side-by-side
- Cena: enterprise (undisclosed, ~$50k+/year)

### 1.3 Trusaic R.O.S.A.
- AI agent uruchamiający setki symulacji
- Optymalizacja ROI budżetu
- "Before any dollars are spent" — preview impact
- Brak: transparentność (black box AI)
- Cena: enterprise

### 1.4 Nasza Przewaga (GapRoll Solio)
| Cecha | Konkurencja | GapRoll Solio |
|-------|-------------|---------------|
| **Cena** | €1,100+/mies | 199 PLN/mies |
| **Scenariusze** | 1 wynik | 3 ścieżki + "Suggest alternative" |
| **Interaktywność** | Statyczny raport | Real-time slidery + drzewo decyzyjne |
| **Transparentność** | Black box | Każda decyzja wyjaśniona |
| **Polski kontekst** | Ogólny | UoP/B2B, ZUS, Kodeks Pracy |
| **Collaborative** | Solo HR | Solio → Collaborative Review pipeline |
| **Performance-aware** | Osobny moduł / brak | Zintegrowane: priorytet dla top performers |
| **Locked/Banned** | Caps & floors only | 🟢 Must-raise + 🔴 Exclude (jak Solio FPL) |

---

## 2. Mapowanie Solio FPL → GapRoll Solio

### 2.1 Analogia Konceptualna

| Solio FPL | GapRoll Solio | Opis |
|-----------|---------------|------|
| Gameweek (GW27-31) | Kwartał/Rok (Q1-Q4) | Horyzont czasowy optymalizacji |
| Player (Haaland, Rice) | Pracownik (Anna K., Jan M.) | Jednostka otrzymująca zmianę |
| Points (projected) | PLN (oszczędności/koszt) | Metryka sukcesu |
| Budget (£0.7 ITB) | Budżet (200k PLN) | Ograniczenie główne |
| Free Transfers (0/3) | Pula podwyżek (np. 50 osób) | Ilość zmian |
| Locked Players (🟢) | Priorytetowi pracownicy | **MUSZĄ** dostać podwyżkę (np. kluczowe talenty) |
| Banned Players (🔴) | Wykluczeni pracownicy | **NIE MOGĄ** dostać podwyżki (PIP, świeża podwyżka, nowi) |
| Risk Preference slider | Agresywność wyrównania | Jak szybko zamykamy lukę |
| Disruption Probability | Prawdopodobieństwo odejść | Ryzyko rotacji |
| Decision Tree (branching) | Drzewo Scenariuszy | 3 ścieżki optymalizacji |
| "Suggest alternative" | "Zaproponuj alternatywę" | Więcej opcji z innym trade-off |
| Apply / Reject | Zatwierdź / Odrzuć | Akceptacja scenariusza |
| Distribution chart | Rozkład kosztów | Histogram podwyżek |
| Presets (Default, High Risk, Low Risk) | Presets (Ostrożny, Zbalansowany, Agresywny) | Szybkie konfiguracje |

### 2.2 Co Bierzemy z Solio FPL (Screenshots Analysis)

**Ze screena 1 (Lineup + Decision Tree):**
- ✅ Drzewo scenariuszy z lewej strony (Base, Clinical Tempo, Tricky Pre-assist → nasze: Ostrożny, Zbalansowany, Agresywny)
- ✅ GW-by-GW breakdown → nasz: kwartał-po-kwartale plan podwyżek
- ✅ Punkty per scenariusz → nasz: koszt PLN per scenariusz
- ✅ Koszulki graczy z ocenami → nasze: karty pracowników z kwotami podwyżek
- ✅ Histogram rozkładu punktów → nasz: histogram rozkładu podwyżek

**Ze screena 4 (Team Projections - Attack vs Defence scatter):**
- ✅ Scatter plot team strength → nasz: scatter plot departament × luka płacowa
- ✅ Projected Points ranking → nasz: ranking departamentów po koszcie wyrównania

**Ze screena 5 (Optimise Setup - Presets + Tuning):**
- ✅ **Presets:** Default / High Risk / Low Risk / Optimistic / Safe / Custom
- ✅ **Tuning sliders:** Risk Preference (Cautious ↔ Aggressive), Disruption Probability (Stable ↔ Turbulent)
- ✅ **Constraints:** Locked Players, Banned Players, Transfers Used
- ✅ Przycisk "Optimise" (prominent CTA)

**Ze screena 6 (Optimise Results):**
- ✅ **Results table:** Status, Preset, Horizon, Time, Move, Transfers, Points
- ✅ **Metrics:** Points, ±Risk, Transfers, Decisions
- ✅ **Distribution chart** (bell curve with highlighted result)
- ✅ **Solution Transfers timeline** (GW27→GW31 z konkretnym transferami)
- ✅ **Actions:** Apply ✅ / Copy 📋 / Alt 🔄 / Reject ❌
- ✅ **Settings summary:** Risk 0%, Disruption 50%, Locked, Banned

---

## 3. Architektura Solio Solver v1

### 3.1 Stack Techniczny

```
Frontend (Next.js 15):
├── /dashboard/solio/           → Main Solio page
│   ├── page.tsx                → Layout + state management
│   ├── components/
│   │   ├── SolioSetup.tsx      → Presets + Tuning + Constraints
│   │   ├── SolioResults.tsx    → Table + Distribution + Timeline
│   │   ├── ScenarioTree.tsx    → Decision tree visualization
│   │   ├── ScenarioCard.tsx    → Individual scenario summary
│   │   ├── EmployeeRaiseCard.tsx → Individual raise preview
│   │   ├── BudgetSlider.tsx    → Real-time budget adjustment
│   │   ├── GapTargetSlider.tsx → Target gap % adjustment
│   │   └── DistributionChart.tsx → Histogram of raises
│   └── hooks/
│       ├── useSolioOptimizer.ts → API call + state
│       └── useSolioExport.ts    → CSV/PDF export

Backend (FastAPI):
├── routers/solio.py            → API endpoints
├── services/solio_engine.py    → Optimization algorithm
├── services/solio_scenarios.py → Scenario generation
└── models/solio.py             → Pydantic schemas
```

### 3.2 Algorytm — Greedy Optimization (v1)

**Dlaczego Greedy a nie LP (Linear Programming)?**

| Aspekt | LP (PuLP) | Greedy | Wybór v1 |
|--------|-----------|--------|----------|
| Optymalność | Globalnie optymalne | Lokalnie optymalne | Greedy ✅ |
| Złożoność implementacji | Wysoka (constraint formulation) | Niska | Greedy ✅ |
| Czas obliczeń (100 osób) | ~2s | ~50ms | Greedy ✅ |
| Wyjaśnialność | Trudna (dual variables) | Łatwa (priorytet = kolejność) | Greedy ✅ |
| Ograniczenia nieliniowe | Wymaga MILP | Naturalne | Greedy ✅ |
| Audit trail | Solver log | Step-by-step | Greedy ✅ |

**Dla v2:** Możemy przejść na LP (PuLP + HiGHS solver jak Solio FPL) gdy constraints się skomplikują.

### 3.3 Algorytm Greedy — Pseudokod

```python
def solio_optimize(employees, config):
    """
    Greedy optimization: prioritize underpaid women,
    allocate raises from most-underpaid first.
    
    LEGAL BASIS: Art. 4 ust. 1 Dyrektywy 2023/970 
    — equal pay for equal work or work of equal value
    """
    
    # 1. Calculate current state
    current_gap = calculate_pay_gap(employees)
    target_gap = config.target_gap_percent  # e.g., 5%
    budget_remaining = config.budget_limit
    
    # 2. Separate employee pools
    banned = {e.id for e in employees if e.id in config.banned_employee_ids}
    locked = {e.id for e in employees if e.id in config.locked_employee_ids}
    
    eligible = [e for e in employees
                if e.id not in banned                        # constraint: banned out
                and e.department in config.departments       # constraint: dept filter
                and e.gender == 'K']                        # only raise underpaid gender
    
    # 3. Score each employee (priority = how underpaid × performance boost)
    has_performance = any(e.performance_rating is not None for e in eligible)
    perf_weight = config.performance_weight if has_performance else 0.0
    
    for emp in eligible:
        # Find comparable group (same EVG band or position)
        comparables = get_same_evg_band(emp, employees)
        male_median = median([c.salary for c in comparables if c.gender == 'M'])
        
        emp.gap_to_fair = max(0, male_median - emp.salary)
        
        # Base priority: how underpaid (0.0 - 1.0 normalized)
        base_priority = emp.gap_to_fair / emp.salary if emp.salary > 0 else 0
        
        # Performance boost (optional, 0.0 if no data or disabled)
        perf_boost = 0.0
        if perf_weight > 0 and emp.performance_rating is not None:
            # Normalize to 0-1 (assuming 1-5 scale)
            perf_boost = (emp.performance_rating - 1) / 4.0
        
        # Combined score: (1 - w) × underpaid + w × performance
        emp.priority_score = (1 - perf_weight) * base_priority + perf_weight * perf_boost
        
        # Locked employees get infinite priority (MUST get raise)
        if emp.id in locked:
            emp.priority_score = float('inf')
            emp.is_locked = True
    
    # 4. Sort by priority (locked first, then highest score)
    eligible.sort(key=lambda e: e.priority_score, reverse=True)
    
    # 5. Allocate raises greedily
    raises = []
    locked_not_served = set(locked)  # track that all locked get served
    
    for emp in eligible:
        if budget_remaining <= 0:
            # If locked employees remain unserved, warn
            if locked_not_served:
                # Continue anyway for locked — they MUST get raise
                if emp.id not in locked_not_served:
                    break
            else:
                break
        
        # Calculate ideal raise
        ideal_raise = emp.gap_to_fair
        
        # Apply constraints
        raise_amount = min(
            ideal_raise,                                    # don't overshoot
            budget_remaining,                               # constraint: budget
            emp.salary * config.max_raise_pct / 100,       # implicit: max % cap
        )
        
        # Apply min raise (constraint 6)
        if raise_amount < config.min_raise_pln:
            if budget_remaining >= config.min_raise_pln:
                raise_amount = config.min_raise_pln
            elif emp.id in locked_not_served:
                raise_amount = config.min_raise_pln         # locked: force min
            else:
                continue  # skip if can't meet minimum
        
        # Apply hard-coded overrides (constraint 7)
        if emp.id in config.hard_coded_raises:
            raise_amount = config.hard_coded_raises[emp.id]
        
        # Build justification
        justification = f"Wyrównanie do mediany grupy EVG ({emp.evg_band})"
        if getattr(emp, 'is_locked', False):
            justification += " — pracownik priorytetowy"
        if perf_weight > 0 and emp.performance_rating and emp.performance_rating >= 4:
            justification += f" (ocena: {emp.performance_rating}/5)"
        
        raises.append({
            'employee_id': emp.id,
            'current_salary': emp.salary,
            'raise_amount': raise_amount,
            'new_salary': emp.salary + raise_amount,
            'justification': justification,
            'is_locked': emp.id in locked,
            'performance_rating': emp.performance_rating,
        })
        
        budget_remaining -= raise_amount
        emp.salary += raise_amount  # update for next iteration gap calc
        locked_not_served.discard(emp.id)
    
    # 6. Calculate new gap
    new_gap = calculate_pay_gap(employees)
    
    # 7. Warnings
    warnings = []
    if locked_not_served:
        warnings.append(
            f"⚠️ {len(locked_not_served)} priorytetowych pracowników nie otrzymało "
            f"podwyżki z powodu wyczerpanego budżetu"
        )
    
    return {
        'raises': raises,
        'current_gap': current_gap,
        'new_gap': new_gap,
        'budget_used': config.budget_limit - budget_remaining,
        'budget_remaining': budget_remaining,
        'employees_affected': len(raises),
        'warnings': warnings,
        'performance_data_available': has_performance,
    }
```

### 3.4 Trzy Scenariusze (Inspiracja: Solio FPL Base/Clinical/Tricky)

```python
SCENARIO_PRESETS = {
    'ostrozny': {
        'name': 'Ostrożny',
        'description': 'Minimalny koszt — zamykamy lukę do 5% w 2 lata',
        'icon': '🛡️',
        'color': '#3b82f6',  # blue-500
        'params': {
            'target_gap_percent': 5.0,
            'time_horizon_quarters': 8,  # 2 years
            'budget_multiplier': 0.5,    # use 50% of available budget
            'priority': 'lowest_salary_first',
            'min_raise_pln': 300,
        }
    },
    'zbalansowany': {
        'name': 'Zbalansowany',
        'description': 'Optymalny koszt/efekt — zamykamy lukę do 5% w 1 rok',
        'icon': '⚖️',
        'color': '#14b8a6',  # teal-500 (primary)
        'params': {
            'target_gap_percent': 5.0,
            'time_horizon_quarters': 4,  # 1 year
            'budget_multiplier': 1.0,    # use full budget
            'priority': 'most_underpaid_first',
            'min_raise_pln': 500,
        }
    },
    'agresywny': {
        'name': 'Agresywny',
        'description': 'Pełne wyrównanie — zamykamy lukę do 0% teraz',
        'icon': '🚀',
        'color': '#f59e0b',  # amber-500
        'params': {
            'target_gap_percent': 0.0,
            'time_horizon_quarters': 1,  # this quarter
            'budget_multiplier': 1.5,    # may exceed initial budget
            'priority': 'equal_distribution',
            'min_raise_pln': 500,
        }
    }
}
```

---

## 4. Siedem Constraintów (v1)

### 4.1 Definicje

| # | Constraint | Typ | UI Element | Default | Przykład |
|---|-----------|-----|-----------|---------|---------|
| 1 | **Target Gap %** | Slider | `GapTargetSlider` | 5.0% | "Zmniejsz lukę do 5%" |
| 2 | **Budget Limit (PLN)** | Input + Slider | `BudgetSlider` | auto-calculate | "Max 200,000 PLN" |
| 3 | **🟢 Locked (priorytetowi)** | Multi-select chips (green) | Chip list | [] | "Anna K., Kasia M. MUSZĄ dostać" |
| 4 | **🔴 Banned (wykluczeni)** | Multi-select chips (red) | Chip list | [] | "Jan M. (PIP), Ola W. (nowa)" |
| 5 | **Department Filter** | Multi-select dropdown | Select | all | "Tylko IT i Sales" |
| 6 | **Min Raise (PLN)** | Number input | Input | 500 PLN | "Min 500 PLN (nie obrażaj)" |
| 7 | **Hard-coded Values** | Table inline edit | Editable table | {} | "Anna K. = dokładnie 2000 PLN" |

**🆕 Opcjonalny boost — Performance Weight:**

| Opcja | UI Element | Default | Opis |
|-------|-----------|---------|------|
| **Performance Priority** | Toggle + Slider | OFF / 30% | Waga oceny performance w priority score |
| **Top Performers First** | Checkbox | OFF | Priorytetyzuj pracowników z oceną ≥ 4/5 |

> **Graceful degradation:** Jeśli `performance_rating` brak w CSV → toggle disabled z tooltipem:
> *"Dodaj kolumnę performance_rating do CSV aby odblokować priorytetyzację wg wyników"*
>
> Dane performance_rating są już częścią 12-kolumnowego CSV Strategia tier — nie wymagają dodatkowego uploadu.

### 4.2 Walidacja Constraintów

```python
class SolioConfig(BaseModel):
    """Pydantic schema for Solio Solver input validation."""
    
    target_gap_percent: float = Field(
        ge=0.0, le=50.0, default=5.0,
        description="Docelowa luka płacowa (%)"
    )
    budget_limit: float = Field(
        gt=0, le=10_000_000,
        description="Maksymalny budżet na wyrównanie (PLN)"
    )
    locked_employee_ids: list[str] = Field(
        default_factory=list,
        description="🟢 ID pracowników, którzy MUSZĄ dostać podwyżkę (priorytet)"
    )
    banned_employee_ids: list[str] = Field(
        default_factory=list,
        description="🔴 ID pracowników WYKLUCZONYCH ze zmian (PIP, nowi, świeża podwyżka)"
    )
    department_filter: list[str] = Field(
        default_factory=list,
        description="Lista departamentów do uwzględnienia (puste = wszystkie)"
    )
    min_raise_pln: float = Field(
        ge=0, le=50_000, default=500,
        description="Minimalna kwota podwyżki per osoba (PLN)"
    )
    hard_coded_raises: dict[str, float] = Field(
        default_factory=dict,
        description="Ręczne override: {employee_id: kwota_PLN}"
    )
    
    # Performance weight (optional, graceful degradation)
    performance_weight: float = Field(
        ge=0.0, le=1.0, default=0.0,
        description="Waga performance_rating w priority score (0=off, 0.3=default, 1.0=max)"
    )
    top_performers_first: bool = Field(
        default=False,
        description="Priorytetyzuj pracowników z oceną ≥ 4/5"
    )
    
    # Derived from presets
    preset: Literal['ostrozny', 'zbalansowany', 'agresywny', 'custom'] = 'zbalansowany'
    time_horizon_quarters: int = Field(ge=1, le=12, default=4)
    priority_mode: Literal[
        'lowest_salary_first',
        'most_underpaid_first', 
        'equal_distribution',
        'top_performers_first'
    ] = 'most_underpaid_first'
    
    @validator('locked_employee_ids', 'banned_employee_ids')
    def no_overlap(cls, v, values):
        """Locked and Banned lists cannot overlap."""
        locked = values.get('locked_employee_ids', [])
        if set(v) & set(locked):
            overlap = set(v) & set(locked)
            raise ValueError(
                f"Pracownicy nie mogą być jednocześnie priorytetowi i wykluczeni: {overlap}"
            )
        return v
```

### 4.3 Polskie Konteksty Prawne per Constraint

| Constraint | Podstawa Prawna | Tooltip dla Grażyny |
|-----------|----------------|---------------------|
| Target Gap 5% | Art. 9 ust. 1 Dyrektywy | "Powyżej 5% wymaga wyjaśnienia i planu działania" |
| Budget | Art. 9 ust. 4 lit. c | "Plan działania musi zawierać środki naprawcze i harmonogram" |
| 🟢 Locked | — | "Pracownicy priorytetowi — MUSZĄ dostać podwyżkę (np. kluczowe talenty, zagrożeni odejściem)" |
| 🔴 Banned | — | "Pracownicy wykluczeni — BEZ podwyżki (np. PIP, świeża podwyżka, okres próbny)" |
| Department | Art. 9 ust. 4 lit. a | "Możesz analizować i wyrównywać per dział" |
| Min Raise | Kodeks Pracy Art. 78 | "Podwyżka poniżej 300 PLN może być demotywująca" |
| Hard-coded | — | "Ręczne ustawienie kwoty dla konkretnych osób" |
| Performance Weight | — | "Priorytetyzuj podwyżki dla najlepszych pracowników (dane z kolumny performance_rating)" |

---

## 5. UI Workflow — Krok po Kroku

### 5.1 Ekran Główny (3-panel layout, inspiracja Solio FPL)

```
┌──────────────────────────────────────────────────────────────────────┐
│  SOLIO SOLVER — Modelowanie Budżetowe         [Art. 9 Dyrektywy]   │
│  "Zaplanuj wyrównanie luk płacowych w ramach budżetu"               │
├─────────────────┬────────────────────────────────┬───────────────────┤
│                 │                                │                   │
│  PANEL LEWY     │  PANEL ŚRODKOWY               │  PANEL PRAWY      │
│  (Setup)        │  (Results)                     │  (Details)        │
│                 │                                │                   │
│  ┌───────────┐  │  ┌──────────────────────────┐  │  ┌─────────────┐ │
│  │ Presets   │  │  │ Drzewo Scenariuszy       │  │  │ Wybrany     │ │
│  │           │  │  │                          │  │  │ Scenariusz  │ │
│  │ 🛡️ Ostrożny│ │  │  ● Ostrożny → 134k PLN  │  │  │             │ │
│  │ ⚖️ Zbalanso│ │  │  ● Zbalansow → 198k PLN │  │  │ Metrics:    │ │
│  │ 🚀 Agresyw│  │  │  ● Agresywny → 312k PLN │  │  │ Cost: 198k  │ │
│  │           │  │  │                          │  │  │ Gap: 12→5%  │ │
│  ├───────────┤  │  ├──────────────────────────┤  │  │ People: 34  │ │
│  │ Tuning    │  │  │                          │  │  │ Avg: 5,823  │ │
│  │           │  │  │ Histogram rozkładu       │  │  │             │ │
│  │ Target:   │  │  │ podwyżek                 │  │  ├─────────────┤ │
│  │ [===5%==] │  │  │  ▂▃▅▇▅▃▂               │  │  │ Distribution│ │
│  │           │  │  │  0k  2k  4k  6k  8k     │  │  │ (bell curve)│ │
│  │ Budget:   │  │  │                          │  │  │             │ │
│  │ [=200k==] │  │  ├──────────────────────────┤  │  ├─────────────┤ │
│  │           │  │  │                          │  │  │ Timeline    │ │
│  │ Min raise:│  │  │ Tabela pracowników       │  │  │ Q1: 80k PLN│ │
│  │ [500 PLN] │  │  │ (sortowana by raise)     │  │  │ Q2: 60k PLN│ │
│  │           │  │  │                          │  │  │ Q3: 40k PLN│ │
│  ├───────────┤  │  │ Imię  | Teraz | Nowa | Δ │  │  │ Q4: 18k PLN│ │
│  │Constraints│  │  │ Anna  | 7200  | 8400 |+1.2│ │  │             │ │
│  │           │  │  │ Kasia | 7800  | 8600 |+0.8│ │  ├─────────────┤ │
│  │ Locked: 2 │  │  │ Ola   | 6500  | 7500 |+1.0│ │  │ Actions     │ │
│  │ Depts: All│  │  │ ...   | ...   | ...  |... │  │  │             │ │
│  │           │  │  │                          │  │  │ [Zatwierdź] │ │
│  └───────────┘  │  └──────────────────────────┘  │  │ [CSV Export]│ │
│                 │                                │  │ [PDF Raport]│ │
│  [Optymalizuj]  │                                │  │ [Alternatywa│ │
│                 │                                │  └─────────────┘ │
└─────────────────┴────────────────────────────────┴───────────────────┘
```

### 5.2 User Flow (Grażyna's Journey)

```
STEP 1: Grażyna wchodzi na /dashboard/solio
        → Widzi: "Twoja luka płacowa: 12%. Wymagany plan działania (Art. 9)."
        → Auto-loaded: dane z CSV (pracownicy, płace, gender, EVG bands)

STEP 2: Wybiera Preset
        → Klika "⚖️ Zbalansowany"
        → Slidery auto-ustawiają się: Target 5%, Budget auto-calculated
        → Budget auto-calc: system oblicza minimalny budżet potrzebny

STEP 3: Dostosowuje Constraints (opcjonalnie)
        → 🟢 Lockuje Annę K. i Kasię M. (priorytetowe — muszą dostać)
        → 🔴 Banuje Jana M. (PIP) i Olę N. (dołączyła 2 tyg. temu)
        → Filtruje na "IT" i "Sales" (bo reszta wyrównana)
        → Min raise: 500 PLN
        → Włącza "Priorytetyzuj wg wyników" (slider 30%)
        → ✅ "Top Performers First" (ocena ≥ 4/5)

STEP 4: Klika "Optymalizuj"
        → Loading: "Obliczam 3 scenariusze..." (spinner, ~1s)
        → 3 scenariusze pojawiają się w drzewie
        → Default: Zbalansowany jest wybrany (highlighted teal)

STEP 5: Przegląda scenariusze
        → Klika "Ostrożny" → widzi mniej podwyżek, niższy koszt, 2-letni plan
        → Klika "Agresywny" → widzi wszystkie podwyżki teraz, wysoki koszt
        → Wraca do "Zbalansowany" → optymalny trade-off

STEP 6: Przegląda szczegóły (panel prawy)
        → Tabela: kto, ile dostaje, dlaczego
        → Histogram: rozkład kwot podwyżek
        → Timeline: plan Q1-Q4

STEP 7: Klika "Zaproponuj alternatywę"
        → System generuje 3 nowe warianty z lekko innymi parametrami
        → (+5% budżet, -1% target, inna kolejność departamentów)

STEP 8: Akceptuje scenariusz
        → "Zatwierdź" → scenariusz saved do bazy
        → "Eksport CSV" → lista podwyżek per pracownik
        → "PDF Raport" → gotowy raport dla zarządu z Art. 9 compliance text
        → Opcja: "Wyślij do Collaborative Review" → pipeline do menedżerów
```

### 5.3 Responsive Design

| Breakpoint | Layout | Behavior |
|-----------|--------|----------|
| `xl+` (1280px+) | 3-panel (25% / 50% / 25%) | Full experience |
| `lg` (1024px) | 2-panel (Setup tabs ↔ Results) | Details w bottom sheet |
| `md` (768px) | 1-panel + tabs | Setup → Results → Details |
| `sm` (640px) | 1-panel stacked | Mobile: Setup → "Optymalizuj" → Results scroll |

---

## 6. API Design

### 6.1 Endpoints

```python
# POST /api/solio/optimize
# Body: SolioConfig
# Response: SolioResult (3 scenarios)

@router.post("/solio/optimize", response_model=SolioResult)
async def optimize_scenarios(
    config: SolioConfig,
    current_user: User = Depends(get_current_user),
    db: AsyncClient = Depends(get_db)
):
    """
    Generate 3 optimization scenarios for pay gap remediation.
    
    Legal basis: Art. 9 ust. 4 Dyrektywy UE 2023/970
    "Wspólna ocena wynagrodzeń zawiera plan działania 
     mający na celu zaradzenie nieuzasadnionym różnicom"
    """
    # 1. Load employee data for this org
    employees = await load_employee_data(db, current_user.org_id)
    
    # 2. Run 3 scenarios
    scenarios = generate_three_scenarios(employees, config)
    
    # 3. Add audit trail
    await save_audit_log(db, current_user, config, scenarios)
    
    return SolioResult(
        current_gap=calculate_current_gap(employees),
        scenarios=scenarios,
        generated_at=datetime.utcnow(),
        legal_basis="Art. 9 ust. 4 Dyrektywy UE 2023/970"
    )


# POST /api/solio/alternative
# Body: SolioAlternativeRequest (base scenario + variation params)
# Response: SolioResult (3 NEW scenarios)

@router.post("/solio/alternative", response_model=SolioResult)
async def suggest_alternative(
    request: SolioAlternativeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncClient = Depends(get_db)
):
    """Generate 3 alternative scenarios with slightly different parameters."""
    pass


# POST /api/solio/apply
# Body: SolioApplyRequest (scenario_id)
# Response: SolioApplyResult (saved + export ready)

@router.post("/solio/apply", response_model=SolioApplyResult)
async def apply_scenario(
    request: SolioApplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncClient = Depends(get_db)
):
    """
    Save chosen scenario as the active remediation plan.
    Creates audit trail entry.
    """
    pass


# GET /api/solio/export/{scenario_id}?format=csv|pdf
@router.get("/solio/export/{scenario_id}")
async def export_scenario(
    scenario_id: str,
    format: Literal['csv', 'pdf'] = 'csv',
    current_user: User = Depends(get_current_user),
    db: AsyncClient = Depends(get_db)
):
    """Export scenario as CSV (employee list) or PDF (board report)."""
    pass
```

### 6.2 Response Schema

```python
class EmployeeRaise(BaseModel):
    employee_id: str
    name: str                    # "Anna K." (RODO: inicjał nazwiska)
    department: str
    position_title: str
    evg_band: str               # "Band C (65-75)"
    current_salary: float
    raise_amount: float
    new_salary: float
    raise_percent: float         # % change
    justification: str           # "Wyrównanie do mediany grupy EVG Band C"
    priority_rank: int           # 1 = most underpaid
    is_locked: bool              # 🟢 priorytetowy
    is_banned: bool              # 🔴 wykluczony (always False in raises list, but in full employee view)
    performance_rating: float | None  # 1-5 scale, None if no data
    is_hard_coded: bool          # ręcznie ustawiona kwota

class ScenarioMetrics(BaseModel):
    total_cost: float            # Total PLN spent
    avg_raise: float             # Average raise per person
    median_raise: float          # Median raise
    min_raise: float             # Smallest raise given
    max_raise: float             # Largest raise given
    employees_affected: int      # How many people get raises
    employees_locked: int        # How many locked got raises
    employees_locked_unserved: int  # ⚠️ locked but no budget
    employees_banned: int        # How many were excluded
    gap_before: float            # Pay gap % before
    gap_after: float             # Pay gap % after
    gap_reduction: float         # Δ gap %
    budget_utilization: float    # % of budget used
    risk_score: float            # 0-100 (higher = more disruption)
    estimated_retention_impact: float  # "~X% fewer departures"
    performance_data_used: bool  # Was performance weight applied?
    avg_perf_of_raised: float | None  # Avg performance of raised employees

class ScenarioTimeline(BaseModel):
    """Quarterly breakdown of raises (for multi-quarter plans)."""
    quarter: str                 # "Q1 2026"
    amount: float                # PLN spent this quarter
    employees_in_quarter: int
    cumulative_gap: float        # Gap % at end of this quarter

class Scenario(BaseModel):
    id: str                      # UUID
    preset: str                  # 'ostrozny' | 'zbalansowany' | 'agresywny'
    name: str                    # "Ostrożny"
    description: str             # "Minimalny koszt — zamykamy..."
    icon: str                    # "🛡️"
    color: str                   # "#3b82f6"
    metrics: ScenarioMetrics
    raises: list[EmployeeRaise]
    timeline: list[ScenarioTimeline]
    settings_summary: dict       # Echo of input config
    
class SolioResult(BaseModel):
    current_gap: float
    scenarios: list[Scenario]    # Always 3
    generated_at: datetime
    legal_basis: str
    data_quality_warnings: list[str]  # e.g., "3 pracowników bez EVG band"
```

---

## 7. Komponenty Frontend — Specyfikacja

### 7.1 Presets Bar (inspiracja: Solio FPL Optimise Setup)

```tsx
// components/solio/SolioPresets.tsx
// 3 preset cards + 1 Custom, horizontal layout
// Active preset: teal border + filled background
// Hover: scale(1.02) + shadow

interface PresetCardProps {
  icon: string;          // emoji
  name: string;          // "Ostrożny"
  description: string;   // "Minimalny koszt..."
  isActive: boolean;
  onClick: () => void;
}

// Visual: Similar to Solio FPL's Default/High Risk/Low Risk/Optimistic/Safe cards
// Colors: Inactive: slate-800 border-slate-700
//         Active: slate-800 border-teal-500 ring-1 ring-teal-500/20
```

### 7.2 Tuning Sliders

```tsx
// components/solio/SolioTuning.tsx
// Uses Shadcn Slider component
// Real-time: moving slider → debounced API call (300ms)

// Slider 1: Target Gap %
// Range: 0% — current_gap%
// Labels: "0%" (lewo) — "Obecna luka: 12%" (prawo)
// Default: 5% (legal threshold)
// Special marker at 5%: "← próg Art. 9"

// Slider 2: Budget (PLN)
// Range: min_possible — 2x min_possible
// Auto-calculated min: system shows minimum needed
// Format: "200 000 PLN" (Polish number formatting)
// Labels: "Minimum" (lewo) — "Podwójny" (prawo)

// Slider 3: Min Raise (PLN)  
// Range: 0 — 5000
// Step: 100
// Default: 500
// Warning below 300: "Podwyżki poniżej 300 PLN mogą być demotywujące"
```

### 7.3 Constraints Panel

```tsx
// components/solio/SolioConstraints.tsx

// 🟢 Locked Employees (MUST get raise): Green chip/tag interface
// - Search input + dropdown of employees
// - Chips: "🟢 Anna K. ×" (green bg, removable)
// - Tooltip: "Pracownicy priorytetowi — MUSZĄ dostać podwyżkę"
// - Max 20 locked

// 🔴 Banned Employees (EXCLUDED): Red chip/tag interface
// - Search input + dropdown of employees
// - Chips: "🔴 Jan M. ×" (red bg, removable)
// - Tooltip: "Pracownicy wykluczeni — bez podwyżki (PIP, świeża podwyżka, okres próbny)"
// - Quick-add buttons: "Dodaj na PIP" / "Nowi (<6 mies)" / "Świeża podwyżka (<3 mies)"
//   → auto-populates from hire_date and last_raise_date if available
// - Validation: overlap with Locked → error "Pracownik nie może być priorytetowy i wykluczony"

// Department Filter: Multi-select with checkboxes
// - "Wszystkie departamenty" toggle
// - Individual: ☑ IT ☑ Sales ☐ HR ☐ Finance

// Hard-coded Raises: Inline editable table
// - Search + add employee
// - Table: Imię | Kwota (PLN) | ×
// - Example: "Anna K. | 2 000 PLN | ×"

// 🆕 Performance Priority (opcjonalne, graceful degradation):
// - Toggle: "Priorytetyzuj wg wyników" [OFF/ON]
//   → If performance_rating column missing in data: 
//     toggle DISABLED + tooltip: "Dodaj kolumnę performance_rating do CSV"
//   → If ON: 
//     Slider appears: "Waga performance" [0% ←——●—— 100%] default 30%
//     Checkbox: "☑ Top Performers First (ocena ≥ 4/5)"
//     Info: "Pracownicy z wyższą oceną dostaną podwyżkę w pierwszej kolejności"
```

### 7.4 Scenario Tree (inspiracja: Solio FPL Decision Tree)

```tsx
// components/solio/ScenarioTree.tsx
// Visual: Vertical tree with branches
// "Stan obecny" node at top → 3 branches → scenario nodes

// ● Stan Obecny (luka: 12%)
// ├── 🛡️ Ostrożny    → 134 000 PLN │ Gap: 12% → 6.2% │ 18 osób
// ├── ⚖️ Zbalansowany → 198 000 PLN │ Gap: 12% → 4.8% │ 34 osoby  ← SELECTED
// └── 🚀 Agresywny    → 312 000 PLN │ Gap: 12% → 0.3% │ 47 osób

// Selected: teal-500 border, glow effect
// Hover: tooltip with quick metrics
// Click: selects scenario, updates right panel
```

### 7.5 Employee Raise Table (main results)

```tsx
// components/solio/RaiseTable.tsx
// Sortable columns, scrollable, sticky header
// RODO: Imię + inicjał nazwiska (np. "Anna K.")

// Columns:
// # | Imię | Dział | Stanowisko | EVG Band | Ocena | Teraz (PLN) | Nowa (PLN) | Δ (PLN) | Δ (%) | Status

// Status badges:
// 🟢 "Priorytet" — locked employee (green chip)
// 🔴 "Wykluczony" — banned employee (red chip, row grayed out)
// ⭐ "Top Performer" — performance ≥ 4 (gold star)
// 🤚 "Ręczna" — hard-coded override (teal chip)

// Color coding raises:
// Raise > 10%: amber-500/10 background
// Raise > 20%: red-500/10 background (warning)
// Locked not served: red border + warning icon

// Performance column (conditional):
// - Shows if performance_weight > 0
// - Value: "⭐ 4.5/5" or "3.0/5"  
// - Hidden if no performance data uploaded

// Footer: Summary row
// SUMA | — | — | — | — | — | — | 198 000 PLN | — | —
```

### 7.6 Distribution Chart (inspiracja: Solio FPL bell curve)

```tsx
// components/solio/DistributionChart.tsx
// Library: Recharts (already in stack)
// Type: Histogram / Area chart

// X-axis: Kwota podwyżki (PLN) — 0, 1000, 2000, 3000, ...
// Y-axis: Liczba pracowników
// Highlighted: Median raise (vertical dashed line)
// Color: teal-500 fill, teal-600 stroke

// Annotation: "Mediana: 2 300 PLN" at peak
// Annotation: "Min: 500 PLN" at left edge
// Annotation: "Max: 8 200 PLN" at right edge
```

### 7.7 Timeline Chart (kwartalny plan)

```tsx
// components/solio/TimelineChart.tsx
// Type: Stacked bar chart (quarterly)
// Only for Ostrożny preset (multi-quarter plan)

// X-axis: Q1 2026 | Q2 2026 | Q3 2026 | Q4 2026
// Y-axis: PLN
// Bars: Budget spent per quarter
// Line overlay: Cumulative gap % reduction

// Color: teal gradient (darker = earlier quarters)
```

### 7.8 Actions Bar (inspiracja: Solio FPL Apply/Copy/Alt/Reject)

```tsx
// components/solio/SolioActions.tsx
// Fixed bottom bar (sticky)

// [✅ Zatwierdź scenariusz]  [📋 Kopiuj]  [🔄 Alternatywa]  [❌ Odrzuć]
// [📥 Eksport CSV]  [📄 Raport PDF]  [→ Wyślij do Collaborative Review]

// "Zatwierdź" = primary CTA (teal-500)
// "Alternatywa" = secondary (slate-700)
// "Eksport" = ghost buttons
// "Wyślij do CR" = link to Collaborative Review (if available)
```

---

## 8. Eksport — Dwa Formaty

### 8.1 CSV Export

```csv
# solio_scenariusz_zbalansowany_2026-02-15.csv
# Wygenerowano przez GapRoll Solio Solver
# Scenariusz: Zbalansowany
# Data: 2026-02-15
# Luka przed: 12.0%, Luka po: 4.8%
# Budżet: 198 000 PLN
# Performance weight: 30%

employee_id,imie,nazwisko_inicjal,dzial,stanowisko,evg_band,ocena,placa_obecna,podwyzka_pln,placa_nowa,podwyzka_procent,status,uzasadnienie
001,Anna,K.,IT,Developer Senior,Band C,4.5,7200,1200,8400,16.7%,🟢 Priorytet,"Wyrównanie do mediany grupy EVG Band C (ocena: 4.5/5)"
002,Kasia,M.,IT,Developer Senior,Band C,4.0,7800,800,8600,10.3%,⭐ Top Performer,"Wyrównanie do mediany grupy EVG Band C (ocena: 4.0/5)"
003,Ola,W.,Sales,Account Manager,Band B,3.5,6500,1000,7500,15.4%,,"Wyrównanie do mediany grupy EVG Band B"
```

### 8.2 PDF Board Report

```
╔══════════════════════════════════════════════════════════╗
║  GapRoll — Plan Wyrównania Luk Płacowych                ║
║  Raport zgodny z Art. 9 ust. 4 Dyrektywy UE 2023/970   ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Organizacja: [Nazwa firmy]                              ║
║  Data raportu: 15.02.2026                                ║
║  Scenariusz: Zbalansowany                                ║
║                                                          ║
║  ┌─────────────────────────────────────────────┐         ║
║  │ PODSUMOWANIE                                │         ║
║  │                                             │         ║
║  │ Luka płacowa (przed):    12.0%              │         ║
║  │ Luka płacowa (po):        4.8%              │         ║
║  │ Redukcja:                 7.2 pp            │         ║
║  │ Budżet wymagany:    198 000 PLN             │         ║
║  │ Pracownicy objęci:        34                │         ║
║  │ Średnia podwyżka:     5 824 PLN             │         ║
║  └─────────────────────────────────────────────┘         ║
║                                                          ║
║  PODSTAWA PRAWNA                                         ║
║  Art. 9 ust. 4 Dyrektywy UE 2023/970 stanowi, że        ║
║  w przypadku gdy luka płacowa przekracza 5%,              ║
║  pracodawca jest zobowiązany do przeprowadzenia           ║
║  wspólnej oceny wynagrodzeń i opracowania planu          ║
║  działania mającego na celu zaradzenie                    ║
║  nieuzasadnionym różnicom w wynagrodzeniach.             ║
║                                                          ║
║  HARMONOGRAM                                             ║
║  Q1 2026: 80 000 PLN (16 pracowników)                   ║
║  Q2 2026: 60 000 PLN (10 pracowników)                   ║
║  Q3 2026: 40 000 PLN  (5 pracowników)                   ║
║  Q4 2026: 18 000 PLN  (3 pracowników)                   ║
║                                                          ║
║  [Pełna lista podwyżek — patrz załącznik CSV]           ║
║                                                          ║
║  Wygenerowano przez GapRoll (gaproll.eu)                 ║
║  Raport nie stanowi porady prawnej.                      ║
╚══════════════════════════════════════════════════════════╝
```

---

## 9. Edge Cases & Data Quality

### 9.1 Edge Cases

| Sytuacja | Zachowanie | Komunikat dla Grażyny |
|----------|-----------|----------------------|
| Luka < 5% | Show info, Solio still usable | "Luka 3.2% — poniżej progu Art. 9. Optymalizacja opcjonalna." |
| Brak danych EVG | Fallback na position_title grouping | "Brak ocen EVG. Grupowanie po stanowisku." |
| Budget = 0 | Disable optimization, show min needed | "Minimalny budżet: 134 000 PLN (scenariusz Ostrożny)" |
| 0 women underpaid | No raises needed, celebrate | "Brak niedopłaconych pracownic. Gratulacje! 🎉" |
| All employees banned | Error | "Wszyscy pracownicy są wykluczeni. Odblokuj przynajmniej 1." |
| Locked + Banned overlap | Validation error | "Anna K. nie może być jednocześnie priorytetowa i wykluczona." |
| Locked not served (budget) | Warning + highlight | "⚠️ 2 priorytetowych pracownic nie otrzymało podwyżki — budżet wyczerpany" |
| N < 3 per group | RODO masking in export | Kwoty masked, "Dane ukryte (RODO, N<3)" |
| Single department only | No dept filter shown | Hide department filter |
| Hard-coded > budget | Warning | "Suma ręcznych podwyżek (250k) przekracza budżet (200k)." |
| No performance_rating col | Perf toggle disabled | "Dodaj kolumnę performance_rating do CSV aby odblokować" |
| Performance all same (3/5) | Perf toggle useless, info | "Wszystkie oceny identyczne — priorytetyzacja wg wyników nieefektywna" |

### 9.2 Data Quality Warnings

```python
DATA_QUALITY_CHECKS = [
    {
        'check': 'missing_evg',
        'condition': lambda emp: emp.evg_band is None,
        'severity': 'warning',
        'message': '{count} pracowników bez oceny EVG — grupowanie po stanowisku'
    },
    {
        'check': 'salary_outlier',
        'condition': lambda emp: emp.salary > 3 * median_salary,
        'severity': 'info',
        'message': '{count} pracowników z płacą >3x mediany — sprawdź poprawność danych'
    },
    {
        'check': 'small_group',
        'condition': lambda group: len(group) < 3,
        'severity': 'rodo',
        'message': '{count} grup z N<3 — dane zamaskowane (RODO)'
    },
    {
        'check': 'no_male_comparator',
        'condition': lambda group: count_male(group) == 0,
        'severity': 'critical',
        'message': '{count} grup bez mężczyzn — brak punktu odniesienia do wyrównania'
    }
]
```

---

## 10. Integration Points

### 10.1 Solio → Inne Moduły GapRoll

```
ComplianceAlert (Dashboard)
    ↓ CTA: "Zobacz Plan Działania"
Solio Solver
    ↓ "Zatwierdź scenariusz"
Saved Remediation Plan
    ↓ "Wyślij do Collaborative Review"
Collaborative Review (managers propose within Solio budget)
    ↓ "Wszystko zatwierdzone"
Export (CSV + PDF)
    ↓ 
Art. 9 Compliance Report
```

### 10.2 Dane Wymagane (Strategia tier: 12 kolumn)

| Kolumna | Solio Usage | Required? |
|---------|------------|-----------|
| employee_id | Unique key | ✅ |
| salary_monthly_gross | Base for calculations | ✅ |
| gender | Gap calculation | ✅ |
| position_title | Grouping (fallback) | ✅ |
| department | Department filter | ✅ |
| hire_date | Banned auto-suggest ("nowi <6 mies") | ⚠️ Nice-to-have |
| manager_id | Not used in v1 (→ Collab Review) | ❌ |
| contract_type | B2B normalization | ⚠️ Nice-to-have |
| employment_type | FTE adjustment | ⚠️ Nice-to-have |
| performance_rating | 🆕 Priority weight + Top Performers mode | ⚠️ Optional (graceful degradation) |
| job_level | Internal equity check | ⚠️ Nice-to-have |
| evg_band | Primary grouping | ✅ (or computed from EVG engine) |

---

## 11. Implementation Plan (Week 8: Mar 23-29)

### 11.1 Day-by-Day Breakdown

| Day | Task | Hours | Output |
|-----|------|-------|--------|
| Mon 23 | Backend: Pydantic schemas + greedy algorithm | 4h | `solio_engine.py` works in isolation |
| Mon 23 | Backend: 3 scenario generation | 2h | `solio_scenarios.py` |
| Tue 24 | Backend: API endpoints + tests | 3h | `/api/solio/optimize` returns data |
| Tue 24 | Frontend: Page layout + SolioSetup | 3h | Presets + sliders render |
| Wed 25 | Frontend: ScenarioTree + ScenarioCard | 3h | Tree visualization works |
| Wed 25 | Frontend: RaiseTable | 2h | Sortable employee table |
| Thu 26 | Frontend: DistributionChart + TimelineChart | 3h | Recharts histograms |
| Thu 26 | Frontend: SolioActions + Export CSV | 2h | CSV download works |
| Fri 27 | Backend: PDF export (ReportLab) | 3h | Board report PDF |
| Fri 28 | Integration testing + edge cases | 2h | Full flow works |
| Sat 29 | Polish UX + tooltips + legal citations | 2h | Grażyna-ready |

**Total: ~29h** (4-5h/day over 7 days, realistic for 1+AI)

### 11.2 Cursor Composer Instructions

**Krok 1: Backend — Model + Engine**
```
Katalog: C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\api
Venv: .\venv\Scripts\Activate.ps1

Pliki do stworzenia:
1. models/solio.py — Pydantic schemas (SolioConfig, SolioResult, etc.)
2. services/solio_engine.py — Greedy optimization algorithm
3. services/solio_scenarios.py — 3-scenario generator
4. routers/solio.py — FastAPI endpoints

Zależności: żadne nowe (Pydantic + FastAPI already in stack)
```

**Krok 2: Frontend — Components**
```
Katalog: C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\web

Pliki do stworzenia:
1. app/dashboard/solio/page.tsx — Main page layout
2. components/solio/SolioPresets.tsx
3. components/solio/SolioTuning.tsx
4. components/solio/SolioConstraints.tsx
5. components/solio/ScenarioTree.tsx
6. components/solio/ScenarioCard.tsx
7. components/solio/RaiseTable.tsx
8. components/solio/DistributionChart.tsx
9. components/solio/TimelineChart.tsx
10. components/solio/SolioActions.tsx
11. hooks/useSolioOptimizer.ts
12. hooks/useSolioExport.ts

Zależności: recharts (already installed), lucide-react (already installed)
```

---

## 12. v2 Roadmap (Jun 7) — AI-Powered

| Feature | v1 (Mar 29) | v2 (Jun 7) |
|---------|-------------|------------|
| Algorithm | Greedy | LP (PuLP + HiGHS) |
| Input | Sliders + forms | + Natural language: "Priorytet IT kobiety senior" |
| Scenarios | 3 presets | Unlimited custom + AI-suggested |
| Justification | Template-based | Guardian AI per-employee Art. 7 text |
| Prediction | Static | "Path A → ~18% fewer departures (saves 240k/year)" |
| Collaborative | Export CSV | Direct → Collaborative Review pipeline |
| Benchmarks | None | Benchmark Engine integration (market rates) |
| Constraints | 6 fixed | Dynamic (add custom constraints via NL) |

---

## 13. Metryki Sukcesu

| Metryka | Target v1 | Measurement |
|---------|----------|-------------|
| Time to first scenario | < 3s | Backend perf monitoring |
| Grażyna 5-second test | ✅ Rozumie co robi | User testing |
| Scenarios generated/session | ≥ 3 | Analytics |
| CSV exports/month | Track | Analytics |
| Compliance → Strategia conversion | +10pp (35→45%) | Stripe events |
| NPS (Solio feature) | > 40 | In-app survey |

---

## 14. Kluczowe Inspiracje z Solio FPL (Summary)

1. **Presets bar** → Szybki start bez konfiguracji (Grażyna nie musi rozumieć parametrów)
2. **Tuning sliders** → Zaawansowani użytkownicy mogą dostroić
3. **Decision tree** → Wizualny wybór scenariusza (nie tabela, nie dropdown)
4. **"Suggest alternative"** → Exploration mode (nie one-shot)
5. **Distribution chart** → Zaufanie do algorytmu (widzę rozkład, nie black box)
6. **Apply/Reject/Alt** → Clear action model (nie "Close", nie "Save", ale DECISION)
7. **Settings echo** → W wynikach widzę jakie constrainty zastosowałem
8. **Metrics dashboard** → Cost + Risk + People + Decisions w jednym widoku

---

**END OF DOCUMENT**

*"Solio to nie kalkulator — to silnik decyzyjny. Grażyna nie liczy podwyżki. Grażyna wybiera strategię."*
