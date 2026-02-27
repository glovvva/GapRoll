# Raport zgodności komponentów explainability z 05_FRONTEND_STANDARDS.md

**Data audytu:** 2026-02-14  
**Lokalizacja:** `apps/web/components/explainability/`

---

## CitationBadge.tsx

### Props Interface

```typescript
interface CitationBadgeProps {
  citation: string;
  variant?: "default" | "warning" | "critical";
  href?: string;
  className?: string;
}
```

### Kolory użyte

- **Brak zmiennych z 05_FRONTEND_STANDARDS** — używane klasy Tailwind:
  - `border-slate-600`, `bg-forest-card/80`, `text-text-primary` (default)
  - `border-amber-600/60`, `bg-amber-900/30`, `text-amber-200` (warning)
  - `border-red-600/60`, `bg-red-900/30`, `text-red-200` (critical)
- Odpowiedniki w standardzie: amber → --accent-amber (#f59e0b), red → --accent-red (#ef4444). Tekst używa slate-200, nie --text-primary/--text-secondary.

### Typography

- **Font:** `Geist Mono, ui-monospace, monospace` (inline style).
- Wartości liczbowe: citation to string (np. "Art. 9"); font stosowany do całej treści badge.
- **Nie używa JetBrains Mono** — standard: `--font-mono: 'JetBrains Mono', 'Fira Code', Consolas`.

### Accessibility (contrast)

- default: `text-text-primary` (#e2e8f0) na `bg-forest-card/80` — kontrast na ciemnym tle zwykle ≥ 4.5:1.
- warning: `text-amber-200` na `bg-amber-900/30` — możliwy niższy kontrast na przezroczystym tle (zależnie od tła pod spodem).
- critical: `text-red-200` na `bg-red-900/30` — j.w.
- **Rekomendacja:** Zweryfikować kontrast dla variantów warning/critical na rzeczywistym tle (np. card).

### Issues

- Użycie **Geist Mono** zamiast **JetBrains Mono** (niespójne z 05_FRONTEND_STANDARDS).
- Kolory nie korzystają z tokenów CSS (--accent-*, --text-primary/secondary); zalecane przejście na zmienne lub tokeny Tailwind z design systemu.

---

## ExplainableMetric.tsx

### Props Interface

```typescript
interface ExplainableMetricProps {
  value: number;
  unit: string;
  label: string;
  explanation: string;
  citation: string;
  status?: "good" | "warning" | "critical";
  actionLabel?: string;
  onAction?: () => void;
}
```

### Kolory użyte

- **Brak zmiennych CSS** — klasy Tailwind:
  - `text-emerald-400` (good), `text-amber-400` (warning), `text-red-400` (critical)
  - `border-teal-primary/15`, `bg-forest-card`, `text-text-primary`, `text-text-secondary`
- Standard: Success = green-500 (#22c55e); Warning = amber (#f59e0b); Error = red (#ef4444). "Good" używa emerald zamiast teal/green — dopuszczalne semantycznie, ale inny odcień niż w dokumencie.

### Typography

- Wartość metryki: `<span className={cn("text-[32px] font-bold tabular-nums", valueColor)}>` — **brak `font-mono`**.
- **Wartości liczbowe nie używają JetBrains Mono** — powinny używać `font-mono` (wg 05_FRONTEND_STANDARDS wartości liczbowe w font-mono).

### Accessibility (contrast)

- `text-emerald-400` / `text-amber-400` / `text-red-400` na `bg-forest-card` (ciemne tło): zwykle ≥ 4.5:1.
- `text-text-primary` i `text-text-secondary` na card — zależne od theme; przy slate-100/slate-400 na slate-800 dokument potwierdza dobre kontrasty.

### Issues

- **Brak JetBrains Mono dla wartości liczbowej** — dodać `font-mono` do spanu z `{value}{unit}`.

---

## InfoTooltip.tsx

### Props Interface

```typescript
interface InfoTooltipProps {
  children: React.ReactNode;
  className?: string;
}
```

### Kolory użyte

- `text-text-secondary` na ikonie (HelpCircle).
- TooltipContent: dziedziczy `bg-popover`, `text-popover-foreground` z UI (Shadcn) — nie bezpośrednie użycie --accent-* ani --text-primary/secondary w tym pliku.

### Typography

- Brak wyświetlania wartości liczbowych; typografia z komponentu Tooltip.

### Accessibility (contrast)

- `text-text-secondary` na tle strony — zależne od theme; przy standardzie (slate-400 na slate-900) dokument ostrzega: "slate-400 on slate-800: 2.9:1 ❌". Na pełnym tle slate-900 może być lepiej; **zalecana weryfikacja**.
- Trigger to ikona bez tekstu — brak `aria-label` (dla accessibility zalecane `aria-label` na triggerze, np. "Informacja" / "Pomoc").

### Issues

- Dodać `aria-label` do TooltipTrigger (np. "Pomoc" / "Informacja") dla screen readerów.
- Upewnić się, że kontrast `text-text-secondary` na faktycznym tle ≥ 4.5:1.

---

## ComplianceAlert.tsx

### Props Interface

```typescript
interface ComplianceAlertProps {
  type: "info" | "warning" | "critical";
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  citation?: string;
}
```

### Kolory użyte

- **Brak zmiennych CSS** — klasy Tailwind:
  - info: `border-teal-primary/50`, `bg-teal-primary/10`, `[&_svg]:text-teal-primary`
  - warning: `border-amber-500/50`, `bg-amber-500/10`, `[&_svg]:text-amber-500`
  - critical: `border-red-500/50`, `bg-red-500/10`, `[&_svg]:text-red-500`
- Tekst: `text-text-primary`, `text-text-secondary`.
- Odpowiedniki w standardzie: blue-500 = Info (#3b82f6), amber-500 = Warning (#f59e0b), red-500 = Error (#ef4444) — **zgodne semantycznie**, ale bez użycia zmiennych --accent-blue/amber/red.

### Typography

- Brak wyświetlania wartości liczbowych; typografia standardowa (body).

### Accessibility (contrast)

- Tekst primary/secondary na tle alertu (bg z przezroczystością) — zwykle OK.
- blue-500/amber-500/red-500 na ikonie na ciemnym tle — kontrast zwykle ≥ 3:1 (UI); tekst w foreground/muted — docelowo ≥ 4.5:1.

### Issues

- Brak poważnych; opcjonalnie: użycie zmiennych CSS (--accent-*) dla spójności z design systemem.

---

## EVGScoreCard.tsx

### Props Interface

```typescript
interface Axes {
  skills: number;
  effort: number;
  responsibility: number;
  conditions: number;
}

interface EVGScoreCardProps {
  score: number;
  confidence: number;
  axes: Axes;
  onOverride?: (newScore: number, reason: string) => void;
  citation: string;
  evidence?: Partial<Record<keyof Axes, string>>;
}
```

### Kolory użyte

- **Tailwind:** `text-text-primary`, `text-text-secondary`, `bg-secondary`, `border-teal-primary/15`, `bg-forest-card`.
- **Hardcoded hex:**
  - Pasek osi: `backgroundColor: "#3b82f6"` — odpowiada --accent-blue / Info (#3b82f6) ✅.
  - Tooltip (AxisBar): `backgroundColor: "#0f172a"`, `color: "#f1f5f9"` — tło slate-900, tekst slate-100; dokument: 17.3:1 ✅.
- ConfidenceBadge: `bg-emerald-500/20 text-emerald-400`, `bg-amber-500/20 text-amber-400`, `bg-red-500/20 text-red-400` — spójne z semantyką success/warning/error, ale bez zmiennych CSS.

### Typography

- **Wartości liczbowe:** `font-mono` użyte dla:
  - `{score}/100` (główny wynik): `text-2xl font-bold font-mono text-text-primary` ✅
  - `{value}/{max}` w AxisBar: `font-mono text-text-primary` ✅
- W `globals.css`: `.font-mono { font-family: 'JetBrains Mono', ... }` — **zgodne z 05_FRONTEND_STANDARDS**.

### Accessibility (contrast)

- #f1f5f9 na #0f172a: 17.3:1 (dokument) ✅.
- emerald-400 / amber-400 / red-400 na ciemnym tle — zwykle ≥ 4.5:1.
- Tekst formularza (labels, inputs) w standardowych komponentach — zależne od theme.

### Issues

- Jeden kolor na stałe w kodzie: `#3b82f6` — zalecane użycie zmiennej (np. `var(--accent-blue)` lub tokenu Tailwind), aby trzymać się design systemu.
- Tekst na sztywno po polsku ("AI pewność", "Nie zgadzam się...", "Nowa ocena:", "Uzasadnienie:", "Zatwierdź", "Anuluj") — brak i18n; to kwestia produktu, nie standardu frontendu.

---

## Podsumowanie

| Komponent         | Kolory (zmienne)     | Typography (JetBrains Mono) | Contrast ≥ 4.5:1   |
|------------------|----------------------|-----------------------------|--------------------|
| CitationBadge    | ❌ Tailwind tylko    | ❌ Geist Mono               | ⚠️ do weryfikacji  |
| ExplainableMetric| ❌ Tailwind tylko    | ❌ brak font-mono na value   | ✅                 |
| InfoTooltip      | ✅ semantic (muted)  | N/A                         | ⚠️ + brak aria-label |
| ComplianceAlert  | ❌ Tailwind (zgodne) | N/A                         | ✅                 |
| EVGScoreCard     | ⚠️ 1× hex #3b82f6   | ✅ font-mono                | ✅                 |

**Rekomendacje:**

1. **CitationBadge:** Zamienić Geist Mono na `font-mono` (JetBrains Mono); rozważyć tokeny kolorów (--accent-*, --text-*).
2. **ExplainableMetric:** Dodać `font-mono` do wyświetlania `value` + `unit`.
3. **InfoTooltip:** Dodać `aria-label` do triggera; zweryfikować kontrast muted-foreground.
4. **EVGScoreCard:** Zastąpić `#3b82f6` zmienną (np. `var(--primary)` / token blue) dla spójności.
