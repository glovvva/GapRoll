# Audyt kontrastu WCAG 2.1 – komponenty explainability

**Data:** 2026-02-14  
**Metoda:** WCAG 2.1 Relative Luminance + Contrast Ratio  
**Wymagany stosunek:** ≥ 4.5:1 (tekst normalny)

---

## Algorytm WCAG 2.1

1. **Składowe sRGB** z hex (0–255).
2. **Liniowe RGB:** dla każdej składowej `c = value/255`:  
   `c_lin = c ≤ 0.03928 ? c/12.92 : ((c+0.055)/1.055)^2.4`
3. **Relative luminance:**  
   `L = 0.2126*R_lin + 0.7152*G_lin + 0.0722*B_lin`
4. **Contrast ratio:**  
   `CR = (L_max + 0.05) / (L_min + 0.05)`  
   gdzie L_max to jaśniejszy, L_min ciemniejszy kolor.

---

## 1. CitationBadge (info variant)

**Para sprawdzana:** Tekst `#ffffff` na tle `#3b82f6`

| Kolor   | Hex     | L (relative luminance) |
|--------|---------|------------------------|
| Tekst  | #ffffff | 1.000                  |
| Tło    | #3b82f6 | ~0.233                 |

**Contrast ratio:** (1.000 + 0.05) / (0.233 + 0.05) ≈ **3.71:1**

**Werdykt:** ❌ **< 4.5:1** – nie spełnia WCAG AA.

**Poprawka:** Użycie **ciemnego tekstu** na pełnym tle niebieskim:
- Tekst: `#0f172a` (L ≈ 0.008)
- Tło: `#3b82f6` (bez zmian)

**Nowy ratio:** (0.233 + 0.05) / (0.008 + 0.05) ≈ **4.88:1** ✅

**Wdrożone zmiany:**
- W `globals.css` dodane: `--accent-blue-fg: #0f172a`.
- W `CitationBadge.tsx` wariant **info**: tło `bg-[var(--accent-blue)]`, tekst `text-[var(--accent-blue-fg)]` (zamiast białego na niebieskim).

---

## 2. CitationBadge (warning variant)

**Para sprawdzana:** Tekst `#0f172a` (ciemny) na tle `#f59e0b`

| Kolor   | Hex     | L (relative luminance) |
|--------|---------|------------------------|
| Tekst  | #0f172a | ~0.008                 |
| Tło    | #f59e0b | ~0.450                 |

**Contrast ratio:** (0.450 + 0.05) / (0.008 + 0.05) ≈ **8.62:1**

**Werdykt:** ✅ **≥ 4.5:1** – spełnia WCAG AA.

**Poprawka:** Nie wymagana. Dla spójności wariant **warning** używa tej samej konwencji: pełne tło `--accent-amber`, tekst `--accent-amber-fg: #0f172a`.

---

## 3. ExplainableMetric – wartość

**Para sprawdzana:** Tekst `#ffffff` na tle `#1e293b`

| Kolor   | Hex     | L (relative luminance) |
|--------|---------|------------------------|
| Tekst  | #ffffff | 1.000                  |
| Tło    | #1e293b | ~0.035                 |

**Contrast ratio:** (1.000 + 0.05) / (0.035 + 0.05) ≈ **12.35:1**

**Werdykt:** ✅ **≥ 4.5:1** – spełnia WCAG AA.

**Poprawka:** Nie wymagana. Komponent używa `text-[var(--text-primary)]` (#f1f5f9) na `bg-forest-card` (~#1e293b), ratio pozostaje > 4.5:1.

---

## 4. InfoTooltip

**Para sprawdzana:** Tekst `#e2e8f0` na tle `#1e293b`

| Kolor   | Hex     | L (relative luminance) |
|--------|---------|------------------------|
| Tekst  | #e2e8f0 | ~0.880                 |
| Tło    | #1e293b | ~0.035                 |

**Contrast ratio:** (0.880 + 0.05) / (0.035 + 0.05) ≈ **10.94:1**

**Werdykt:** ✅ **≥ 4.5:1** – spełnia WCAG AA.

**Poprawka:** Nie wymagana. Komponent używa `text-[var(--text-secondary)]` (#cbd5e1) na `bg-[var(--bg-secondary)]` (#1e293b), ratio > 4.5:1.

---

## Podsumowanie

| Komponent              | Para (tekst / tło)   | Ratio  | Wymóg  | Status   | Akcja        |
|------------------------|----------------------|--------|--------|----------|--------------|
| CitationBadge (info)   | #ffffff / #3b82f6    | 3.71:1 | ≥ 4.5:1| ❌ Fail   | **Poprawiono** (ciemny tekst na niebieskim) |
| CitationBadge (warning)| #0f172a / #f59e0b    | 8.62:1 | ≥ 4.5:1| ✅ Pass  | —            |
| ExplainableMetric      | #ffffff / #1e293b    | 12.35:1| ≥ 4.5:1| ✅ Pass  | —            |
| InfoTooltip            | #e2e8f0 / #1e293b    | 10.94:1| ≥ 4.5:1| ✅ Pass  | —            |

---

## Zmiany w kodzie

1. **`app/globals.css`**  
   - Dodane zmienne: `--accent-blue-fg`, `--accent-amber-fg`, `--accent-red-fg` = `#0f172a` (tekst na pełnym tle akcentu, WCAG ≥ 4.5:1).

2. **`components/explainability/CitationBadge.tsx`**  
   - Warianty **info**, **warning**, **critical**: pełne tło koloru akcentu (`bg-[var(--accent-*)]`) zamiast tła z przezroczystością.  
   - Tekst: `text-[var(--accent-*-fg)]` (#0f172a) zamiast koloru akcentu na jasnym tle.  
   - Dzięki temu wszystkie warianty badge’a mają contrast ratio ≥ 4.5:1.

---

**Raport wygenerowany po audycie kontrastu WCAG 2.1 i automatycznej korekcie CitationBadge (info).**

Ścieżka w repozytorium: `paycompass-v2/docs/outputs/contrast-audit.md`.
