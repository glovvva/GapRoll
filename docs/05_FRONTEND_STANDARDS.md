# GapRoll — Frontend Standards
## Design System, UI Components & Typography

**Last Updated:** 2026-02-14  
**Previous Name:** PayCompass (sunset Feb 14, 2026)  
**Framework:** Next.js 15 + Tailwind CSS + Shadcn/UI

---

## 1. Color System

### 1.1 Primary Palette (Teal + Dark Mode)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Primary (Teal)** | #14b8a6 | `teal-500` | CTAs, links, active states |
| **Primary Dark** | #0d9488 | `teal-600` | Hover states |
| **Primary Light** | #5eead4 | `teal-300` | Badges, highlights |
| **Background** | #0f172a | `slate-900` | Main background |
| **Surface** | #1e293b | `slate-800` | Cards, modals |
| **Border** | #334155 | `slate-700` | Dividers, input borders |
| **Text Primary** | #f1f5f9 | `slate-100` | Main text |
| **Text Secondary** | #cbd5e1 | `slate-300` | Subtitles, descriptions |
| **Text Muted** | #94a3b8 | `slate-400` | Placeholders, disabled |

---

### 1.2 Semantic Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Success** | #22c55e | `green-500` | Confirmations, checkmarks |
| **Warning** | #f59e0b | `amber-500` | Alerts, warnings |
| **Error** | #ef4444 | `red-500` | Errors, validation failures |
| **Info** | #3b82f6 | `blue-500` | Info tooltips, help text |

---

### 1.3 Compliance Colors (Legal Status)

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| **Compliant** | Green | #22c55e | "Brak naruszenia" badge |
| **Warning** | Amber | #f59e0b | "Wymaga monitorowania" badge |
| **Non-Compliant** | Red | #ef4444 | "Konieczna akcja" badge |
| **Pending** | Blue | #3b82f6 | "W trakcie analizy" badge |

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

**Why Inter:**
- ✅ Open-source, free
- ✅ Excellent Polish diacritics support (ąćęłńóśźż)
- ✅ High readability at small sizes
- ✅ Variable font (reduces file size)

---

### 2.2 Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Footnotes, captions |
| `text-sm` | 14px | 20px | Table cells, labels |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Subtitles, emphasized text |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page headings |
| `text-4xl` | 36px | 40px | Hero text |

---

### 2.3 Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text, buttons |
| `font-semibold` | 600 | Headings, labels |
| `font-bold` | 700 | Alerts, critical info |

---

## 3. Spacing System

**Base Unit:** 4px (`0.25rem`)

| Token | Pixels | Usage |
|-------|--------|-------|
| `gap-1` | 4px | Tight spacing (icon + text) |
| `gap-2` | 8px | Related elements (label + input) |
| `gap-3` | 12px | Default spacing (cards, sections) |
| `gap-4` | 16px | Comfortable spacing (form fields) |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Page section spacing |
| `gap-12` | 48px | Major section dividers |

---

## 4. Component Library (Shadcn/UI)

### 4.1 Core Components

| Component | Usage | File |
|-----------|-------|------|
| **Button** | CTAs, actions | `@/components/ui/button` |
| **Input** | Text fields | `@/components/ui/input` |
| **Textarea** | Multi-line input | `@/components/ui/textarea` |
| **Select** | Dropdowns | `@/components/ui/select` |
| **Checkbox** | Multi-select | `@/components/ui/checkbox` |
| **Radio** | Single-select | `@/components/ui/radio-group` |
| **Switch** | Toggle on/off | `@/components/ui/switch` |
| **Slider** | Range input | `@/components/ui/slider` |
| **Card** | Content container | `@/components/ui/card` |
| **Alert** | Notifications | `@/components/ui/alert` |
| **Badge** | Status labels | `@/components/ui/badge` |
| **Tooltip** | Hover help | `@/components/ui/tooltip` |
| **Dialog** | Modals | `@/components/ui/dialog` |
| **Popover** | Contextual menus | `@/components/ui/popover` |
| **Tabs** | Content organization | `@/components/ui/tabs` |
| **Accordion** | Collapsible sections | `@/components/ui/accordion` |
| **Table** | Data grids | `@/components/ui/table` |
| **Progress** | Loading bars | `@/components/ui/progress` |

---

### 4.2 Custom Components (GapRoll-specific)

| Component | Purpose | Location |
|-----------|---------|----------|
| **InfoTooltip** | Legal citations, explanations | `@/components/dashboard/InfoTooltip` |
| **CitationBadge** | Art. X references | `@/components/dashboard/CitationBadge` |
| **ExplainableMetric** | Metric + tooltip + collapsible | `@/components/dashboard/ExplainableMetric` |
| **ComplianceAlert** | Art. 9 warnings, actions | `@/components/dashboard/ComplianceAlert` |
| **EVGScoreCard** | Job evaluation display | `@/components/evg/EVGScoreCard` |
| **EVGDetailModal** | 4-axis breakdown + override | `@/components/evg/EVGDetailModal` |
| **ManualOverrideForm** | HITL override UI | `@/components/evg/ManualOverrideForm` |
| **QuartileTable** | Art. 16 quartile analysis | `@/components/reports/QuartileTable` |
| **Art16Report** | PDF export preview | `@/components/reports/Art16Report` |

---

## 5. Layout Patterns

### 5.1 Dashboard Layout

```tsx
<div className="min-h-screen bg-forest-deep text-text-primary">
  {/* Sidebar */}
  <aside className="fixed left-0 top-0 h-screen w-64 border-r border-teal-primary/15 bg-forest-card">
    <nav>{/* Navigation */}</nav>
  </aside>

  {/* Main Content */}
  <main className="ml-64 p-8">
    {/* Page Header */}
    <header className="mb-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-text-secondary">Przegląd zgodności z Dyrektywą UE 2023/970</p>
    </header>

    {/* Content Grid */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>{/* Metric cards */}</Card>
    </div>
  </main>
</div>
```

---

### 5.2 Landing Page Layout

```tsx
<div className="min-h-screen bg-forest-deep text-text-primary">
  {/* Hero Section */}
  <section className="flex min-h-screen items-center justify-center px-8">
    <div className="max-w-4xl text-center">
      <h1 className="text-5xl font-bold">
        Pełna zgodność z Dyrektywą UE 2023/970 za 99 PLN/mies
      </h1>
      <p className="mt-6 text-xl text-text-secondary">
        Raport Art. 16 gotowy w 15 minut. Bez Excel, bez stresu.
      </p>
      <Button size="lg" className="mt-8">
        Rozpocznij trial (14 dni za darmo)
      </Button>
    </div>
  </section>

  {/* Features */}
  <section className="px-8 py-24">
    <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
      <FeatureCard icon={CheckCircle} title="..." description="..." />
    </div>
  </section>
</div>
```

---

## 6. Accessibility (WCAG 2.1 AA)

### 6.1 Contrast Requirements

| Element | Min Ratio | Tested |
|---------|-----------|--------|
| Normal text (<18px) | 4.5:1 | WebAIM Checker |
| Large text (≥18px) | 3:1 | WebAIM Checker |
| UI components | 3:1 | WebAIM Checker |

**Passing Combinations:**
- ✅ `slate-100` (#f1f5f9) on `slate-900` (#0f172a): **17.3:1** ⭐
- ✅ `teal-500` (#14b8a6) on `slate-900` (#0f172a): **5.8:1** ✓
- ✅ `slate-300` (#cbd5e1) on `slate-900` (#0f172a): **13.2:1** ⭐

**Failing Combinations (avoid):**
- ❌ `slate-400` (#94a3b8) on `slate-800` (#1e293b): **2.9:1** ❌

---

### 6.2 Keyboard Navigation

**Rules:**
- All interactive elements must be keyboard-accessible (Tab, Enter, Escape)
- Tab order follows visual flow (top→bottom, left→right)
- Focus indicators always visible (never `outline: none` without custom replacement)
- Modals trap focus (can't Tab outside modal until closed)

**Example Focus Styles:**
```css
.button:focus-visible {
  outline: 2px solid theme('colors.teal.500');
  outline-offset: 2px;
}
```

---

### 6.3 Screen Reader Support

**Best Practices:**
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- Provide `aria-label` for icon-only buttons
- Use `<h1>-<h6>` in hierarchical order (no skipping levels)
- Tables have `<caption>` and `<th scope="col|row">`

**Example:**
```tsx
<button aria-label="Informacja o luce płacowej">
  <Info className="h-4 w-4" />
</button>
```

---

## 7. Animation Guidelines

### 7.1 Framer Motion Presets

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| **Fade In** | 200ms | `easeOut` | Page load, modal open |
| **Slide Up** | 300ms | `easeOut` | Toasts, notifications |
| **Scale** | 150ms | `easeInOut` | Button press, card hover |
| **Collapse** | 250ms | `easeInOut` | Accordion, expandable sections |

**Example:**
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {content}
</motion.div>
```

---

### 7.2 Performance Budget

- Max 60fps (16ms per frame)
- Avoid animating `width`, `height` (use `transform: scale`)
- Avoid animating `top`, `left` (use `transform: translate`)
- Prefer `opacity` and `transform` (GPU-accelerated)

---

## 8. Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops, small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Mobile-First Approach:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablets, 3 on desktops */}
</div>
```

---

## 9. Icon System

**Library:** Lucide React (tree-shakeable, consistent design)

**Size Guide:**
| Size | Class | Usage |
|------|-------|-------|
| 16px | `h-4 w-4` | Inline icons (buttons, labels) |
| 20px | `h-5 w-5` | Standard icons (navigation, cards) |
| 24px | `h-6 w-6` | Large icons (hero sections, empty states) |
| 32px | `h-8 w-8` | Extra large (feature illustrations) |

**Example:**
```tsx
import { CheckCircle, AlertCircle, Info } from "lucide-react"

<CheckCircle className="h-5 w-5 text-green-500" />
<AlertCircle className="h-5 w-5 text-amber-500" />
<Info className="h-4 w-4 text-text-secondary" />
```

---

## 10. Form Validation

### 10.1 Validation States

| State | Border | Icon | Message Color |
|-------|--------|------|---------------|
| **Default** | `border-teal-primary/15` | None | N/A |
| **Focus** | `border-teal-500` | None | N/A |
| **Valid** | `border-green-500` | ✓ | `text-green-500` |
| **Error** | `border-red-500` | ✗ | `text-red-500` |

**Example:**
```tsx
<div>
  <Input
    className={cn(
      "border-teal-primary/15",
      error && "border-red-500",
      success && "border-green-500"
    )}
  />
  {error && (
    <p className="mt-1 text-sm text-red-500">{error.message}</p>
  )}
</div>
```

---

### 10.2 Validation Rules (Zod)

```typescript
import { z } from "zod"

const EVGOverrideSchema = z.object({
  score: z.number().min(0).max(100),
  justification: z.string().min(20, "Uzasadnienie musi mieć min. 20 znaków"),
})
```

---

## 11. Loading States

### 11.1 Skeletons (Preferred)

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Card>
  <Skeleton className="h-6 w-32 mb-2" /> {/* Title */}
  <Skeleton className="h-4 w-full" />     {/* Line 1 */}
  <Skeleton className="h-4 w-3/4" />      {/* Line 2 */}
</Card>
```

---

### 11.2 Spinners (For Short Delays)

```tsx
import { Loader2 } from "lucide-react"

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Generowanie raportu...
</Button>
```

---

## 12. Empty States

**Pattern:**
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <FileX className="h-12 w-12 text-text-secondary mb-4" />
  <h3 className="text-lg font-medium">Brak danych</h3>
  <p className="text-sm text-text-secondary mb-6">
    Prześlij plik CSV aby wygenerować raport.
  </p>
  <Button>Prześlij plik</Button>
</div>
```

---

## 13. Dark Mode (Default)

**Philosophy:** Dark mode ONLY (no light mode toggle)

**Rationale:**
- Grażyna works 8+ hours/day on computer (eye strain reduction)
- Professional aesthetic (corporate environments)
- Reduces distractions (focus on data, not UI)

**If Light Mode Requested (Future):**
- Use Tailwind `dark:` classes
- Store preference in `localStorage`
- Respect system preference (`prefers-color-scheme`)

---

**END OF 05_FRONTEND_STANDARDS.md**

**Next Review:** After Milestone 1 (Mar 15, 2026)

**Key Standards:**
- ✅ Teal (#14b8a6) primary color
- ✅ Dark mode default (slate-900 background)
- ✅ Inter font (excellent Polish diacritics)
- ✅ Shadcn/UI components (copy-paste, full control)
- ✅ WCAG AA accessibility (4.5:1 contrast minimum)
- ✅ Mobile-first responsive (640px, 768px, 1024px breakpoints)
