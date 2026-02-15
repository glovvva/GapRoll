# Podsumowanie zmian – komponenty explainability (zgodność z 05_FRONTEND_STANDARDS)

**Data:** 2026-02-14  
**Lokalizacja:** `apps/web/components/explainability/`

---

## 1. CitationBadge.tsx

### Wprowadzone zmiany

- **Variant:** `variant?: 'default' | 'warning' | 'critical'` zastąpiony przez **`variant?: 'info' | 'warning' | 'critical'`** (domyślnie `"info"`).
- **Kolory:** Mapowanie wariantów na zmienne CSS:
  - `info` → `--accent-blue` (#3b82f6)
  - `warning` → `--accent-amber` (#f59e0b)
  - `critical` → `--accent-red` (#ef4444)  
  Klasy: `border-[var(--accent-*)]`, `bg-[var(--accent-*)]/10`, `text-[var(--accent-*)]`, `hover:bg-[var(--accent-*)]/20`.
- **Tooltip:** Nowy opcjonalny prop **`articleText?: string`** – pełny tekst artykułu w tooltipie (TooltipContent z `bg-[var(--bg-secondary)]`, `text-[var(--text-secondary)]`).
- **Typografia:** Inter Medium 12px → `font-medium text-xs`.
- **Hover:** `transition-transform duration-200 hover:scale-105 hover:shadow-md`.
- **Usunięto:** Geist Mono, inline `fontFamily`/`fontSize`; wszystkie style wyłącznie przez Tailwind.
- **Dokumentacja:** JSDoc + przykłady użycia.

### Pliki zależne

- `report/page.tsx`: `variant="default"` → `variant="info"`.
- `EVGScoreCard.tsx`: `variant="default"` → `variant="info"`.
- `ComplianceAlert.tsx`: mapowanie na `info`/`warning`/`critical` (bez `default`).

---

## 2. ExplainableMetric.tsx

### Wprowadzone zmiany

- **Wartość liczbowa:**  
  - Font: **JetBrains Mono** przez klasę `font-mono` (zgodne z `globals.css`).  
  - Rozmiar: **1.5rem (24px)** → `text-2xl`.  
  - Grubość: **700** → `font-bold`.  
  - Kolor: **`var(--text-primary)`** → `text-[var(--text-primary)]`.  
  - Zachowane: `tabular-nums`.
- **Layout:**  
  - Wartość **na górze**, etykieta **pod spodem** (flex-col, gap-1).  
  - **CitationBadge w prawym górnym rogu** (`absolute top-3 right-3`).
- **Confidence:**  
  - Nowy opcjonalny prop **`confidence?: number`** (0–1).  
  - Gdy **`confidence < 0.7`**: wyświetlany badge **„Wymaga weryfikacji”** (obramowanie/tło/tekst przez `var(--accent-amber)`).
- **Usunięto:** `statusStyles` (kolor wartości ujednolicony do `--text-primary`); CitationBadge przeniesiony z dolnej sekcji do rogu.
- **Dokumentacja:** JSDoc + przykład z `confidence`.

---

## 3. InfoTooltip.tsx

### Wprowadzone zmiany

- **Duplikat:** Brak pliku `ui/info-tooltip.tsx` – istnieje tylko `explainability/InfoTooltip.tsx`.  
  Dodany **re-export** w **`components/ui/info-tooltip.tsx`**, aby importy `@/components/ui/info-tooltip` (report, evg, paygap) działały bez zmian.
- **Dostępność:**  
  - **`aria-label`** na triggerze (domyślnie `"Pomoc"`).  
  - Opcjonalny prop **`ariaLabel?: string`**.  
  - Trigger jako `role="button"`, `tabIndex={0}`; ikona `aria-hidden`.
- **Tooltip:**  
  - Tło: **`var(--bg-secondary)`** → `bg-[var(--bg-secondary)]`.  
  - Tekst: **`var(--text-secondary)`**, **14px** → `text-sm text-[var(--text-secondary)]`.  
  - **Max-width: 300px** → `max-w-[300px]`.  
  - Zachowane: `border border-border`, `p-3`.
- **Dokumentacja:** JSDoc + przykład.

---

## 4. ComplianceAlert.tsx

### Wprowadzone zmiany

- **Kolory:** Zamiast klas typu `blue-500`/`amber-500`/`red-500` używane wyłącznie zmienne CSS:
  - `border-[var(--accent-blue)]`, `bg-[var(--accent-blue)]/10`, `[&_svg]:text-[var(--accent-blue)]` (info),
  - analogicznie `--accent-amber` (warning), `--accent-red` (critical).
- **Trigger „pay gap > 5%”:**  
  - Opcjonalny prop **`payGapPercent?: number`**.  
  - Gdy **`payGapPercent > 5`**: komponent się renderuje; **5–10%** → `warning`, **>10%** → `critical`.  
  - Gdy **`payGapPercent <= 5`** i jest podany – komponent **nie renderuje** nic (return null).  
  - Gdy `payGapPercent` jest podany i > 5%, używane są domyślne tytuły/opisy (formalna polszczyzna, Art. 9 Dyrektywy UE 2023/970).
- **Tekst:** Domyślne treści dla wariantów warning/critical w formalnej polszczyźnie z cytowaniem Art. 9 Dyrektywy UE 2023/970.
- **CTA:** Domyślna akcja dla warning/critical: **„Zobacz Plan Działania”** z **`href: COMPLIANCE_ACTION_HREF`** (`/dashboard/solio` – Solio Solver). Można nadpisać przez prop `action`.
- **Eksport:** Stała **`COMPLIANCE_ACTION_HREF`** do użycia w nawigacji.
- **Typy:** `type`, `title`, `description` opcjonalne; poprawione typowanie `action` (onClick vs href) pod TypeScript strict.
- **Dokumentacja:** JSDoc z przykładami ręcznego ustawienia i użycia z `payGapPercent`.

---

## 5. Zmienne CSS (globals.css)

Dodane w **`:root`** (bez hardcoded hex w komponentach):

- `--accent-teal: #14b8a6`
- `--accent-blue: #3b82f6`
- `--accent-amber: #f59e0b`
- `--accent-red: #ef4444`
- `--text-primary: #f1f5f9`
- `--text-secondary: #cbd5e1`
- `--bg-secondary: #1e293b`

Komponenty używają wyłącznie tych zmiennych (np. `text-[var(--text-primary)]`, `bg-[var(--bg-secondary)]`), bez wpisywania hex w JSX/TSX.

---

## 6. Zasady spełnione

- **Tailwind:** Tylko klasy utility; brak własnych plików CSS dla tych komponentów.
- **Kolory:** Wyłącznie przez `var(--accent-*)`, `var(--text-*)`, `var(--bg-secondary)` (oraz istniejące `border-border`, `text-foreground`, `text-muted-foreground` gdzie pasuje).
- **Brak hardcoded hex** w komponentach explainability.
- **TypeScript:** Strict mode; poprawione typy w ComplianceAlert (action z onClick vs href).
- **JSDoc:** Komentarze z przykładami dla CitationBadge, ExplainableMetric, InfoTooltip, ComplianceAlert.

---

## 7. Pliki zmodyfikowane / dodane

| Plik | Akcja |
|------|--------|
| `app/globals.css` | Dodane zmienne `--accent-*`, `--text-primary`, `--text-secondary`, `--bg-secondary` |
| `components/explainability/CitationBadge.tsx` | Przepisany (variant, tooltip, kolory, hover, JSDoc) |
| `components/explainability/ExplainableMetric.tsx` | Przepisany (layout, font-mono, confidence badge, JSDoc) |
| `components/explainability/InfoTooltip.tsx` | Zaktualizowany (aria-label, tooltip style, JSDoc) |
| `components/explainability/ComplianceAlert.tsx` | Przepisany (CSS vars, payGapPercent, Art. 9, CTA, JSDoc) |
| `components/ui/info-tooltip.tsx` | **Nowy** – re-export z explainability/InfoTooltip |
| `app/dashboard/report/page.tsx` | CitationBadge `variant="info"` |
| `components/explainability/EVGScoreCard.tsx` | CitationBadge `variant="info"` |

---

**Raport wygenerowany po wprowadzeniu poprawek zgodnych z 05_FRONTEND_STANDARDS.md.**
