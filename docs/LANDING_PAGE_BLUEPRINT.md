# GapRoll Landing Page — Blueprint v1.0
## Next.js Implementation (Replaces Framer)

**Data:** 2026-02-15
**Cel:** Single Source of Truth dla budowy landing page w Next.js
**Priorytet:** Rebrand Sprint — Week 4 (Feb 23 - Mar 1)
**Stack:** Next.js 15 (App Router) + Tailwind CSS + Shadcn/UI + Framer Motion

---

## 1. DECYZJA PROJEKTOWA: "Forest Professional"

### 1.1 Filozofia

Nie jesteśmy AI startupem. Jesteśmy **platformą zgodności prawnej**, która używa AI w tle.
Grażyna (45-55 lat, HR Manager) kojarzy dobry software z: **powagą, czytelnością, brakiem niespodzianek**.

| Aspekt | TAK ✅ | NIE ❌ |
|--------|--------|--------|
| Nastrój | Zaufanie, spokój, kontrola | Futuryzm, gaming, "disruptive" |
| Kolor | Las, zieleń butelkowa, ciepłe złoto | Neon, fiolet, gradient tęcza |
| Typografia | Serif w nagłówkach (powaga prawna) | Monospace, geometric sans |
| Ikony | Outlined, stroke-2, spokojne | Filled, glowing, animated |
| Ton | "Instytucja, której ufasz" | "Startup, który dopiero zaczyna" |

### 1.2 Mood Board

- **BASE:** Deep forest (screenshot `deep_forest.png`) — ale ciemniejszy
- **AVOID:** Neonowy tech (screenshot `deep_tech_-_avoid_this.png`)
- **INSPIRACJE:** Stripe invoices (czytelność), Linear (precyzja), Wise (zaufanie w fintech)

---

## 2. PALETA KOLORÓW (FINALNA)

### 2.1 Core Tokens

```css
/* === FOREST PROFESSIONAL THEME === */

/* Primary Backgrounds */
--forest-deep: #0A3A2A;       /* Główne tło strony */
--forest-card: #0F4A36;       /* Karty, surface */
--forest-surface: #134D3A;    /* Hover na kartach, active states */

/* Accents */
--teal-primary: #14b8a6;      /* CTA, linki, active states */
--teal-hover: #0d9488;        /* Hover na CTA */
--teal-light: #5eead4;        /* Badges, subtle highlights */
--legal-gold: #F59E0B;        /* Compliance badges, legal citations */
--legal-gold-muted: #D97706;  /* Gold hover */

/* Text */
--text-primary: #F1F5F9;      /* slate-100 — główny tekst */
--text-secondary: #CBD5E1;    /* slate-300 — podtytuły */
--text-muted: #94A3B8;        /* slate-400 — placeholders (UWAGA: nie na ciemnych kartach!) */

/* Borders */
--border-subtle: rgba(20, 184, 166, 0.15);  /* Teal border low opacity */
--border-card: rgba(241, 245, 249, 0.08);   /* White border ultra-subtle */

/* Semantic */
--success: #10B981;            /* green-500 — "Zgodne" */
--warning: #F59E0B;            /* amber-500 — "Wymaga monitorowania" */
--error: #EF4444;              /* red-500 — "Konieczna akcja" */
```

### 2.2 WCAG Contrast Validation

| Kombinacja | Ratio | Wynik | Uwagi |
|------------|-------|-------|-------|
| `#F1F5F9` na `#0A3A2A` | **12.7:1** | ✅ PASS (AAA) | Główny tekst |
| `#CBD5E1` na `#0A3A2A` | **9.8:1** | ✅ PASS (AAA) | Podtytuły |
| `#14b8a6` na `#0A3A2A` | **5.2:1** | ✅ PASS (AA) | Akcenty, linki |
| `#F59E0B` na `#0A3A2A` | **7.1:1** | ✅ PASS (AA) | Legal gold badges |
| `#F1F5F9` na `#0F4A36` | **10.4:1** | ✅ PASS (AAA) | Tekst na kartach |
| `#14b8a6` na `#0F4A36` | **4.2:1** | ⚠️ PASS (AA large) | Akcent na kartach — użyj ≥18px |
| `#0A3A2A` na `#14b8a6` | **5.2:1** | ✅ PASS (AA) | Tekst na CTA button |

**Akcja:** Teal na kartach (#0F4A36) wymaga min. 18px font-size. Dla mniejszych tekstów użyj `#5eead4` (teal-light) lub `#F1F5F9`.

### 2.3 Tailwind Config Extension

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          deep: "#0A3A2A",
          card: "#0F4A36",
          surface: "#134D3A",
        },
        teal: {
          primary: "#14b8a6",
          hover: "#0d9488",
          light: "#5eead4",
        },
        legal: {
          gold: "#F59E0B",
          "gold-muted": "#D97706",
        },
        text: {
          primary: "#F1F5F9",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        heading: ["var(--font-lora)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        "glow-teal": "0 0 40px -12px rgba(20, 184, 166, 0.2)",
        "glow-gold": "0 0 30px -10px rgba(245, 158, 11, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 3. TYPOGRAFIA

### 3.1 Font Stack

| Rola | Font | Import | Uzasadnienie |
|------|------|--------|-------------|
| **Headings** | Lora (serif) | `next/font/google` | "Legal gravity" — instytucjonalny feel, serif = powaga, zaufanie |
| **Body** | Inter (sans-serif) | `next/font/google` | Excellent Polish diacritics (ąćęłńóśźż), czytelny w małych rozmiarach |

**Dlaczego Lora, nie Manrope/Plus Jakarta?**
- Grażyna pracuje z dokumentami prawnymi — serif kojarzy się z powagą
- Lora ma doskonałe polskie znaki diakrytyczne
- Para Lora + Inter daje kontrast "instytucja + czytelność"
- Stripe, banki, kancelarie prawne używają serif headings

### 3.2 Implementacja next/font

```typescript
// src/app/layout.tsx
import { Lora, Inter } from "next/font/google";

const lora = Lora({
  subsets: ["latin", "latin-ext"], // latin-ext = polskie znaki
  variable: "--font-lora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={`${lora.variable} ${inter.variable}`}>
      <body className="font-body bg-forest-deep text-text-primary">
        {children}
      </body>
    </html>
  );
}
```

### 3.3 Skala Typograficzna (dostosowana do Grażyny, 50 lat)

| Token | Desktop | Mobile | Line Height | Font | Użycie |
|-------|---------|--------|-------------|------|--------|
| **H1 (Hero)** | 56px (3.5rem) | 36px (2.25rem) | 1.15 | Lora 700 | Nagłówek hero |
| **H2 (Section)** | 40px (2.5rem) | 28px (1.75rem) | 1.2 | Lora 600 | Tytuły sekcji |
| **H3 (Card)** | 24px (1.5rem) | 20px (1.25rem) | 1.3 | Lora 600 | Tytuły kart |
| **Body Large** | 20px (1.25rem) | 18px (1.125rem) | 1.7 | Inter 400 | Podtytuły, hero subtitle |
| **Body Base** | 17px (1.0625rem) | 16px (1rem) | 1.7 | Inter 400 | Tekst standardowy |
| **Body Small** | 15px (0.9375rem) | 14px (0.875rem) | 1.6 | Inter 400 | Captions (NIE mniejszy!) |

**Kluczowe zasady:**
- **Minimum 16px body** (Grażyna, 50 lat, problemy ze wzrokiem)
- **Minimum 14px captions** (nigdy mniejsze!)
- **Line-height 1.7 dla body** (lepsza czytelność dla starszych użytkowników)
- **Letter-spacing:** H1/H2 → `tracking-tight` (-0.02em), body → default

### 3.4 Tailwind Typography Classes

```css
/* globals.css — dodatki */
@layer base {
  h1 {
    @apply font-heading text-4xl md:text-[3.5rem] font-bold leading-[1.15] tracking-tight;
  }
  h2 {
    @apply font-heading text-2xl md:text-[2.5rem] font-semibold leading-[1.2] tracking-tight;
  }
  h3 {
    @apply font-heading text-xl md:text-2xl font-semibold leading-[1.3];
  }
  p {
    @apply font-body text-[1.0625rem] leading-[1.7] text-text-secondary;
  }
}
```

---

## 4. STRUKTURA STRONY (Sekcje w kolejności)

### 4.1 Architektura plików

```
src/app/(landing)/
├── page.tsx                    # Landing page (główna)
├── layout.tsx                  # Layout z navbar + footer
├── components/
│   ├── Navbar.tsx              # Sticky + glassmorphism
│   ├── Hero.tsx                # H1 + subtitle + CTA
│   ├── SocialProof.tsx         # Logos / liczby
│   ├── ProblemSection.tsx      # "3 tygodnie w Excelu" → "15 minut"
│   ├── FeaturesGrid.tsx        # 3-4 kluczowe funkcje (karty)
│   ├── HowItWorks.tsx          # 3 kroki (upload → raport → zgodność)
│   ├── ComplianceBadges.tsx    # Art. 16, RODO, EU AI Act
│   ├── PricingSection.tsx      # 2 tier-y: Compliance + Strategia
│   ├── FAQ.tsx                 # Accordion z Grażyna-style pytaniami
│   ├── CTAFinal.tsx            # Ostatni CTA przed footer
│   └── Footer.tsx              # Links, legal, contact
```

### 4.2 Sekcje — Co ZOSTAWIĆ, co WYWALIĆ z Framera

| Sekcja | Status | Uzasadnienie |
|--------|--------|-------------|
| **Navbar** | ✅ ZACHOWAJ (przebuduj) | Sticky + glassmorphism, logo left, CTA right |
| **Hero** | ✅ ZACHOWAJ (przepisz copy) | Kluczowa sekcja, compliance-first messaging |
| **Logo bar / Social proof** | ✅ ZACHOWAJ | Ale zmień na: "Zgodne z Art. 16 Dyrektywy UE 2023/970" badges |
| **Features grid** | ✅ ZACHOWAJ (zmień treść) | 3-4 karty, Grażyna vocabulary |
| **"How it works"** | ✅ DODAJ (nowe) | 3 kroki: Upload CSV → Analiza → Raport PDF |
| **Testimonials** | ❌ WYWALIĆ | Nie mamy klientów. Zastąp: Compliance badges |
| **Team section** | ❌ WYWALIĆ | Stealth mode. Niepotrzebne. |
| **Blog preview** | ❌ WYWALIĆ (na razie) | Nie ma bloga. Dodaj po Mar 16 |
| **Newsletter** | ❌ WYWALIĆ | Nie mamy Mailchimp. Dodaj po Mar 1 |
| **Pricing** | ✅ ZACHOWAJ (przebuduj) | 2 tiery, PLN, Grażyna-focused |
| **FAQ** | ✅ DODAJ (nowe) | Objections z persona 03 |
| **Final CTA** | ✅ DODAJ (nowe) | "Rozpocznij darmowy trial" |
| **Footer** | ✅ ZACHOWAJ (uprość) | Legal links, kontakt, NIP |

---

## 5. SPECYFIKACJA SEKCJI (Copy + Design)

### 5.1 Navbar

```
Wygląd:
- Sticky top, glassmorphism: bg-forest-deep/80 backdrop-blur-md
- Border bottom: border-b border-white/5
- Height: 72px (desktop), 64px (mobile)
- Logo: "GapRoll" (Lora bold, teal-primary) — LEFT
- Nav links: "Funkcje", "Cennik", "FAQ" — CENTER (desktop) / hamburger (mobile)
- CTA: "Rozpocznij trial" (teal button) — RIGHT

Zachowanie:
- Scroll > 50px → dodaj shadow-glow-teal (subtelna poświata)
- Mobile: hamburger → slide-down menu
```

### 5.2 Hero Section

```
Layout: Centered text (max-w-4xl mx-auto text-center)
Background: forest-deep + subtle radial gradient (center → edge, forest-card)

Kopia:
  Badge (nad H1): "Dyrektywa UE 2023/970 — Termin: 7 czerwca 2026"
    - Style: legal-gold text, border legal-gold/20, rounded-full, px-4 py-1.5
    - Font: Inter 14px semibold, uppercase, tracking-wider

  H1: "Raport zgodności płacowej gotowy w 15 minut"
    - Font: Lora 56px bold, text-primary, tracking-tight
    - Alternatywnie: "Pełna zgodność z Dyrektywą UE za 99 PLN/mies."

  Subtitle: "Automatyczne wartościowanie stanowisk, analiza luki płacowej
    i raport Art. 16 — bez Excela, bez stresu, z pełną kontrolą."
    - Font: Inter 20px, text-secondary, max-w-2xl mx-auto
    - line-height: 1.7

  CTA Group (flex gap-4 justify-center):
    Primary: "Rozpocznij darmowy trial"
      - bg-teal-primary, text-forest-deep, font-semibold
      - h-12 px-8, rounded-lg
      - hover: bg-teal-hover, shadow-glow-teal
      - whileTap: scale(0.98)
    Secondary: "Zobacz jak działa →"
      - ghost/outline, border-teal-primary/30, text-teal-primary
      - hover: bg-teal-primary/10

  Subtext pod CTA: "14 dni za darmo · Bez karty kredytowej · RODO compliance"
    - Font: Inter 14px, text-muted

Spacing:
  - Badge → H1: 24px
  - H1 → Subtitle: 24px
  - Subtitle → CTA: 40px
  - CTA → Subtext: 16px
  - Section padding: py-32 (128px top/bottom)
```

### 5.3 Social Proof / Compliance Bar

```
Layout: Centered, py-16, border-y border-white/5
Background: forest-deep (same as hero, seamless)

Wariant A (Pre-launch — brak klientów):
  3-4 compliance badges w rzędzie:
  - "✓ Art. 16 Dyrektywy UE 2023/970"
  - "✓ Zgodne z RODO"
  - "✓ EU AI Act — Art. 14 HITL"
  - "✓ Serwery EU (Hetzner DE/FI)"
  Style: text-legal-gold, border border-legal-gold/20, rounded-lg px-4 py-2

Wariant B (Post-launch):
  "Zaufało nam X firm w Polsce" + loga partnerów
```

### 5.4 Problem Section ("Dlaczego GapRoll?")

```
Layout: 2-column grid (lg:grid-cols-2), max-w-6xl, gap-16, py-24
Background: forest-deep

Left column — PROBLEM:
  H2: "Przygotowanie raportu Art. 16 zajmuje 3 tygodnie"
  Body: "Ręczne zestawianie danych w Excelu, brak wartościowania stanowisk,
  ryzyko błędów — a termin to 7 czerwca 2026."

  3 pain points (flex flex-col gap-4):
  - "⏱️ 3 tygodnie pracy ręcznej w Excelu"
  - "⚠️ Brak automatycznych cytowań artykułów Dyrektywy"
  - "❌ Brak audit trail — nie obronisz się przed PIP"
  Style: forest-card cards, p-6, rounded-lg, border border-white/5

Right column — ROZWIĄZANIE:
  H2: "Z GapRoll — 15 minut"
  Body: "Upload CSV → automatyczna analiza → raport PDF z cytowaniami Art. X."

  3 solution points:
  - "✓ Raport Art. 16 w 15 minut (zamiast 3 tygodni)"
  - "✓ Automatyczne cytowania artykułów Dyrektywy UE"
  - "✓ Pełny audit trail — gotowy na kontrolę PIP"
  Style: forest-card cards, p-6, rounded-lg, border border-teal-primary/20
  (zielona ramka = pozytyw)
```

### 5.5 Features Grid

```
Layout: grid md:grid-cols-2 lg:grid-cols-3, gap-8, max-w-6xl, py-24

H2 (centered nad gridem): "Wszystko, czego wymaga Dyrektywa"
Subtitle: "Każda funkcja odwołuje się do konkretnego artykułu Dyrektywy UE 2023/970."

Karty (3-4):

1. "Wartościowanie stanowisk (EVG)"
   - Icon: Scale (lucide-react), teal-primary, h-8 w-8
   - Opis: "Automatyczna ocena 1-100 wg 4 kryteriów Art. 4:
     kwalifikacje, wysiłek, odpowiedzialność, warunki pracy."
   - Badge: "Art. 4 Dyrektywy UE" (legal-gold)
   - Footnote: "Z możliwością edycji ręcznej — Ty masz kontrolę."

2. "Raport Art. 16"
   - Icon: FileText (lucide-react), teal-primary
   - Opis: "Analiza kwartyli wynagrodzeń × płeć.
     Eksport PDF z pełnymi cytowaniami artykułów."
   - Badge: "Art. 16 ust. 2" (legal-gold)

3. "Ochrona danych (RODO)"
   - Icon: Shield (lucide-react), teal-primary
   - Opis: "Automatyczne maskowanie danych gdy N < 3.
     Audit trail każdej operacji. Serwery w UE."
   - Badge: "RODO / GDPR" (legal-gold)

4. (opcjonalnie) "Raporty dla pracowników (Art. 7)"
   - Icon: Users (lucide-react), teal-primary
   - Opis: "Pracownik pyta: 'Porównaj moją pensję z osobami
     o równej wartości pracy.' Odpowiedź gotowa automatycznie."
   - Badge: "Art. 7 ust. 1" (legal-gold)

Style kart:
  - bg-forest-card, rounded-xl (12px)
  - ring-1 ring-inset ring-white/5 (inner border trick)
  - p-8, flex flex-col gap-4
  - Hover: ring-teal-primary/20, shadow-glow-teal, translate-y-[-2px]
  - transition-all duration-300
```

### 5.6 How It Works (3 kroki)

```
Layout: Centered, max-w-4xl, py-24
H2: "Jak to działa?"

3 kroki (flex md:flex-row gap-8, z connecting line):

Krok 1: "Prześlij CSV"
  - Number: "01" (Lora, text-teal-primary, text-4xl, opacity-50)
  - Icon: Upload (lucide-react)
  - Opis: "Wyeksportuj dane z systemu kadrowego (Comarch, Sage, Excel).
    Upload pliku CSV — 2 minuty."

Krok 2: "Automatyczna analiza"
  - Number: "02"
  - Icon: BarChart3
  - Opis: "System wartościuje stanowiska (Art. 4), analizuje lukę płacową,
    generuje kwartyle (Art. 16). Wynik w 10 minut."

Krok 3: "Pobierz raport PDF"
  - Number: "03"
  - Icon: Download
  - Opis: "Gotowy raport zgodności z Dyrektywą UE 2023/970.
    Z cytowaniami artykułów i audit trail. Gotowy na PIP."

Style:
  - Każdy krok: text-center, flex flex-col items-center
  - Między krokami: dashed line (border-dashed border-teal-primary/20)
  - Number: font-heading text-5xl font-bold text-teal-primary/30
```

### 5.7 Pricing Section

```
Layout: max-w-5xl, py-24, grid md:grid-cols-2 gap-8

H2 (centered): "Prosty cennik. Bez ukrytych kosztów."
Subtitle: "Ceny w PLN netto. Faktura VAT."

Tier 1: COMPLIANCE (lewa karta)
  Badge: "Wymagane prawnie" (legal-gold)
  Price: "od 99 PLN/mies." (netto)
  Subtitle: "Dla firm 50-100 pracowników"

  Features (checkmark list):
  ✓ Wartościowanie stanowisk (EVG) z edycją ręczną
  ✓ Raport Art. 16 (kwartyle × płeć)
  ✓ Raporty Art. 7 (na żądanie pracownika)
  ✓ Ochrona danych RODO (maskowanie, audit trail)
  ✓ Eksport PDF z cytowaniami artykułów
  ✓ Serwery EU (Hetzner Niemcy/Finlandia)

  CTA: "Rozpocznij darmowy trial"
  Style: bg-forest-card, ring-1 ring-white/10

Tier 2: STRATEGIA (prawa karta — highlighted)
  Badge: "Najpopularniejszy" (teal-primary)
  Price: "od 199 PLN/mies." (netto)
  Subtitle: "Dla firm 50-100 pracowników"

  Features: Wszystko z Compliance +
  ✓ Analiza przyczyn luki płacowej (Root Cause)
  ✓ Współpraca z menedżerami (Collaborative Review)
  ✓ Benchmark wynagrodzeń (dane GUS + rynkowe)
  ✓ Symulator budżetu wyrównawczego
  ✓ Priorytetowe wsparcie

  CTA: "Rozpocznij darmowy trial"
  Style: bg-forest-card, ring-2 ring-teal-primary/50, shadow-glow-teal
  (wyróżniona karta)

Footnote: "Wszystkie plany: 14 dni trial za darmo. Bez karty kredytowej."

Pricing tiers (sub-text under each):
  - Small (50-100): 99 / 199 PLN
  - Medium (100-250): 299 / 599 PLN
  - Large (250-500): 799 / 1599 PLN
  - Enterprise (500+): Kontakt
```

### 5.8 FAQ Section

```
Layout: max-w-3xl mx-auto, py-24
Component: Shadcn/UI Accordion

H2: "Najczęściej zadawane pytania"

Pytania (z persona 03 — objections Grażyny):

Q1: "Czy AI może się mylić w wartościowaniu stanowisk?"
A: "Tak — dlatego KAŻDY wynik EVG możesz edytować ręcznie.
   AI to propozycja, Ty masz kontrolę. System zapisuje kto zmienił,
   kiedy i dlaczego (audit trail zgodny z Art. 14 EU AI Act)."

Q2: "Czy dane są bezpieczne?"
A: "Serwery w Niemczech i Finlandii (Hetzner EU). Pełna zgodność z RODO:
   maskowanie gdy N < 3, audit log, prawo do usunięcia.
   Umowa powierzenia danych (DPA) dostępna na żądanie."

Q3: "Mamy tylko 60 pracowników — czy to nas dotyczy?"
A: "Art. 7 Dyrektywy daje KAŻDEMU pracownikowi prawo zapytać:
   'Porównaj moją pensję z osobami o równej wartości pracy.'
   Bez wartościowania stanowisk (EVG) nie można odpowiedzieć
   — to naruszenie Dyrektywy."

Q4: "Ile czasu zajmuje wdrożenie?"
A: "Upload pliku CSV → raport gotowy w 15 minut.
   Bez IT, bez szkoleń. Trial 14 dni z pełnym dostępem."

Q5: "Dlaczego nie zostać przy Excelu?"
A: "Excel to 3 tygodnie pracy. GapRoll to 15 minut.
   Dodatkowo: automatyczne cytowania Art. X (Excel tego nie ma)
   i audit trail (Excel tego nie ma)."

Q6: "Czy platforma działa po polsku?"
A: "Tak — cały interfejs, raporty i wsparcie są w języku polskim.
   System obsługuje polskie znaki diakrytyczne i formalną terminologię HR."

Style accordion:
  - border border-white/5, rounded-lg
  - data-[state=open]: bg-forest-card/50
  - Trigger: text-lg font-heading, text-text-primary
  - Content: text-base font-body, text-text-secondary, leading-relaxed
```

### 5.9 Final CTA

```
Layout: text-center, py-24, max-w-3xl mx-auto
Background: subtle gradient (forest-deep → forest-card → forest-deep)

H2: "Termin mija 7 czerwca 2026"
Subtitle: "Nie czekaj na panikę. Przygotuj raport zgodności teraz."

CTA: "Rozpocznij darmowy trial — 14 dni"
  - Same style as Hero CTA (large, teal, glow)

Subtext: "Bez karty kredytowej · Setup w 2 minuty · Pełen dostęp"
```

### 5.10 Footer

```
Layout: border-t border-white/5, py-12, max-w-6xl

3-column grid:

Column 1: GapRoll
  - Logo (Lora, teal-primary)
  - "Platforma zgodności z Dyrektywą UE 2023/970"
  - © 2026 GapRoll Sp. z o.o. | NIP: [po rejestracji]

Column 2: Produkt
  - Funkcje
  - Cennik
  - FAQ
  - Dokumentacja (gdy będzie)

Column 3: Prawne
  - Polityka prywatności
  - Regulamin
  - Umowa powierzenia danych (DPA)
  - Kontakt: kontakt@gaproll.eu

Bottom bar:
  - "Dane przetwarzane na serwerach EU (Hetzner DE/FI)"
  - Ikona: flaga EU
```

---

## 6. EFEKTY WIZUALNE (Premium Techniques)

### 6.1 Co stosujemy (z porad Gemini)

| Technika | Gdzie | Kod Tailwind |
|----------|-------|-------------|
| **Inner border (ring)** | Karty | `ring-1 ring-inset ring-white/8` |
| **Glassmorphism** | Navbar | `bg-forest-deep/80 backdrop-blur-md border-b border-white/5` |
| **Colored glow** | CTA buttons | `shadow-[0_0_40px_-12px_rgba(20,184,166,0.25)]` |
| **Spotlight gradient** | Hero bg | Radial gradient z `forest-card` w centrum |
| **Noise texture** | Cała strona | SVG overlay z `opacity-[0.03] pointer-events-none fixed inset-0` |
| **Staggered entrance** | Feature cards | Framer Motion `staggerChildren: 0.1` |
| **Button press** | Wszystkie CTA | `whileTap={{ scale: 0.98 }}` |
| **Scroll reveal** | Sekcje | `useInView` + `once: true` fade-in |

### 6.2 Czego NIE stosujemy

| ❌ Avoid | Dlaczego |
|----------|---------|
| Neon glow / wielokolorowe gradienty | Gaming vibes, nie compliance |
| Parallax scrolling | Dezorientuje Grażynę |
| Auto-play video | Wolne ładowanie, denerwujące |
| Animowane liczby (counter) | Nie mamy danych do wyświetlenia |
| Floating elements / confetti | Niepoważne dla prawniczego software |
| Dark mode toggle | Dark mode ONLY (05_FRONTEND_STANDARDS) |

### 6.3 Noise Texture (implementacja)

```tsx
// src/components/NoiseOverlay.tsx
export function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
```

### 6.4 Spotlight Gradient (Hero background)

```tsx
// W Hero.tsx
<section className="relative min-h-screen flex items-center justify-center px-8">
  {/* Spotlight */}
  <div className="absolute inset-0 -z-10">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    h-[600px] w-[800px] rounded-full
                    bg-forest-card/40 blur-[120px]" />
  </div>

  {/* Content */}
  <div className="max-w-4xl text-center">
    ...
  </div>
</section>
```

---

## 7. KOMPONENT CTA BUTTON (Reusable)

```tsx
// src/components/ui/cta-button.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  size?: "default" | "large";
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function CTAButton({
  children,
  variant = "primary",
  size = "default",
  className,
  href,
  onClick,
}: CTAButtonProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
    size === "large" ? "h-14 px-10 text-lg" : "h-12 px-8 text-base",
    variant === "primary" && [
      "bg-teal-primary text-forest-deep font-semibold",
      "hover:bg-teal-hover hover:shadow-glow-teal",
    ],
    variant === "secondary" && [
      "border border-teal-primary/30 text-teal-primary",
      "hover:bg-teal-primary/10",
    ],
    className
  );

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={baseStyles}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
    >
      {children}
    </Component>
  );
}
```

---

## 8. ACCESSIBILITY (Grażyna-specific)

### 8.1 Touch Targets

| Element | Min. size | Standard |
|---------|-----------|----------|
| Buttons | 48px height | WCAG 2.5.5 (Target Size Enhanced) |
| Links (inline) | 44px touch area | Padding trick |
| Accordion triggers | 56px height | Larger for older users |
| Nav links | 44px height | Standard |

### 8.2 Focus States

```css
/* globals.css */
*:focus-visible {
  outline: 2px solid #14b8a6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### 8.3 Semantic HTML

```
<header> → Navbar
<main> → Cały content
<section> → Każda sekcja (hero, features, pricing, FAQ)
<article> → Feature cards
<nav> → Nawigacja (navbar + footer links)
<footer> → Footer
<h1> → Tylko 1 na stronie (Hero)
<h2> → Tytuły sekcji
<h3> → Tytuły kart
```

---

## 9. PERFORMANCE BUDGET

| Metryka | Target | Jak osiągnąć |
|---------|--------|-------------|
| **LCP** | < 2.5s | `priority` na Hero image (jeśli będzie), next/font preload |
| **FID** | < 100ms | Minimal JS, no heavy bundles |
| **CLS** | < 0.1 | `next/font` display swap, fixed heights |
| **Bundle size** | < 200KB first load | Tree-shaking, no heavy deps |
| **Lighthouse** | > 95 | Semantic HTML, optimized images |

### Optymalizacje:
- `next/font` z `display: "swap"` (FOUT elimination)
- Framer Motion: import `LazyMotion` + `domAnimation` (reduce bundle)
- Images: `next/image` z `priority` na hero, `placeholder="blur"` na reszcie
- Fonts: Lora + Inter = ~40KB (variable fonts)

---

## 10. IMPLEMENTACJA W CURSOR — KROK PO KROKU

### Faza 1: Setup (1h)

```
Prereqs: Node.js 18+, npm/pnpm

Komendy w Cursor terminal:

1. cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\web
   (albo nowy folder, jeśli landing page to osobny projekt)

2. Jeśli nowy projekt:
   npx create-next-app@latest gaproll-landing --typescript --tailwind --eslint --app --src-dir
   cd gaproll-landing

3. Inicjalizacja shadcn/ui:
   npx shadcn-ui@latest init
   → Style: Default
   → Base color: Slate (potem nadpiszemy)
   → CSS variables: Yes

4. Dodaj komponenty:
   npx shadcn-ui@latest add button card accordion badge

5. Zainstaluj dependencies:
   npm install framer-motion lucide-react

6. Konfiguracja fonts w layout.tsx (patrz sekcja 3.2)
7. Konfiguracja tailwind.config.ts (patrz sekcja 2.3)
8. Konfiguracja globals.css — kolory + typografia (patrz sekcje 2.1, 3.4)
```

### Faza 2: Components (3-4h)

```
Kolejność budowy w Cursor Composer:

1. NoiseOverlay.tsx (5 min) — nakładka szumu
2. CTAButton.tsx (15 min) — reusable CTA
3. Navbar.tsx (30 min) — sticky + glassmorphism + responsive
4. Hero.tsx (30 min) — główna sekcja z spotlight gradient
5. ComplianceBadges.tsx (15 min) — Art. 16, RODO badges
6. ProblemSection.tsx (30 min) — 2-column problem/solution
7. FeaturesGrid.tsx (45 min) — 3-4 karty z hover effects
8. HowItWorks.tsx (30 min) — 3 kroki
9. PricingSection.tsx (45 min) — 2 tiery z feature lists
10. FAQ.tsx (20 min) — accordion
11. CTAFinal.tsx (10 min) — ending CTA
12. Footer.tsx (20 min) — 3-column

Total: ~5-6h
```

### Faza 3: Polish & Animation (2h)

```
1. Framer Motion scroll animations (useInView + stagger)
2. Button hover/press states
3. Navbar scroll behavior
4. Mobile responsiveness testing
5. Lighthouse audit + fixes
```

### Faza 4: Deploy (30 min)

```
Opcja A (Hetzner + Coolify):
  - Build: npm run build
  - Dockerfile: node:20-alpine, next start
  - Deploy via Coolify dashboard

Opcja B (Tymczasowo Vercel — UWAGA: przenieść na Hetzner przed launch):
  - vercel deploy --prod
  - Custom domain: gaproll.eu
```

---

## 11. INSTRUKCJE DLA CURSOR COMPOSER

Gdy będziesz pracował z Cursor, kopiuj poniższe prompty sekcja po sekcji:

### Prompt 1 — Setup & Config

```
Skonfiguruj Next.js 15 landing page z następującą paletą kolorów (Forest Professional theme):
- Background: #0A3A2A (forest-deep)
- Cards: #0F4A36 (forest-card)
- Primary accent: #14b8a6 (teal)
- Legal accent: #F59E0B (gold)
- Text: #F1F5F9 (primary), #CBD5E1 (secondary)

Fonty: Lora (serif, headings) + Inter (sans, body) via next/font/google z subsets: ["latin", "latin-ext"].
Dodaj NoiseOverlay component (SVG noise, opacity 0.03, fixed, pointer-events-none).
Dark mode ONLY (brak toggle).
Język strony: polski (lang="pl").

Pliki do modyfikacji:
- tailwind.config.ts (extend colors, fontFamily, boxShadow)
- src/app/globals.css (CSS variables + base typography)
- src/app/layout.tsx (font imports, NoiseOverlay, body classes)
```

### Prompt 2 — Hero + Navbar

```
Zbuduj Navbar (sticky, glassmorphism) i Hero section dla GapRoll landing page.

NAVBAR:
- Logo "GapRoll" (font-heading, teal-primary) — left
- Links: "Funkcje", "Cennik", "FAQ" — center (hidden mobile)
- CTA button: "Rozpocznij trial" (teal, small) — right
- Mobile: hamburger menu
- glassmorphism: bg-forest-deep/80 backdrop-blur-md border-b border-white/5
- On scroll > 50px: add teal glow shadow

HERO:
- Centered layout, max-w-4xl
- Badge above H1: "Dyrektywa UE 2023/970 — Termin: 7 czerwca 2026" (gold border, gold text)
- H1: "Raport zgodności płacowej gotowy w 15 minut" (Lora 56px)
- Subtitle: "Automatyczne wartościowanie stanowisk, analiza luki płacowej i raport Art. 16 — bez Excela, bez stresu, z pełną kontrolą." (Inter 20px, text-secondary)
- 2 buttons: Primary "Rozpocznij darmowy trial" (teal) + Secondary "Zobacz jak działa →" (ghost)
- Subtext: "14 dni za darmo · Bez karty kredytowej · RODO compliance"
- Background: subtle radial gradient (forest-card/40, blur 120px, centered)

Use framer-motion for: button whileTap={scale: 0.98}, stagger entrance for text elements.
All text in Polish. Font heading = Lora serif. Font body = Inter.
```

*(Dalsze prompty Cursor dla kolejnych sekcji — analogicznie, kopiując specyfikację z sekcji 5.3-5.10)*

---

## 12. CHECKLIST PRE-DEPLOY

- [ ] Wszystkie kolory zgodne z sekcją 2 (Forest Professional)
- [ ] WCAG contrast ≥ 4.5:1 dla tekstu, ≥ 3:1 dla UI (sekcja 2.2)
- [ ] Lora + Inter załadowane via next/font (sekcja 3.2)
- [ ] Minimum body font 16px, captions ≥ 14px
- [ ] Wszystkie CTA buttons ≥ 48px height
- [ ] Focus-visible outline na wszystkich interactive elements
- [ ] Semantic HTML (h1 → 1 raz, h2 → sekcje, nav, main, footer)
- [ ] Mobile responsive (test na 375px, 768px, 1024px)
- [ ] Lighthouse > 95 (Performance, Accessibility, SEO)
- [ ] Grażyna Test: każdy tekst w formalnym polskim, bez anglicyzmów
- [ ] Legal citations: Art. 4, Art. 7, Art. 16, RODO
- [ ] No "AI-powered" — zamiast tego "automatyczne z możliwością edycji ręcznej"
- [ ] Dark mode only (brak light mode toggle)
- [ ] Noise overlay (subtelny, opacity 0.03)
- [ ] Footer: NIP (po rejestracji), kontakt@gaproll.eu, link do DPA
- [ ] OG Image + meta tags (SEO basics)

---

## 13. SEO BASICS

```tsx
// src/app/(landing)/page.tsx
export const metadata = {
  title: "GapRoll — Raport zgodności płacowej Art. 16 w 15 minut",
  description:
    "Platforma do analizy luki płacowej i wartościowania stanowisk (EVG) zgodnie z Dyrektywą UE 2023/970. Raport Art. 16 gotowy w 15 minut. Od 99 PLN/mies.",
  keywords: [
    "luka płacowa",
    "dyrektywa ue 2023/970",
    "raport art. 16",
    "wartościowanie stanowisk",
    "pay transparency",
    "equal pay",
    "EVG",
    "RODO",
  ],
  openGraph: {
    title: "GapRoll — Zgodność z Dyrektywą UE 2023/970",
    description: "Raport Art. 16 w 15 minut. Od 99 PLN/mies.",
    type: "website",
    locale: "pl_PL",
    url: "https://gaproll.eu",
  },
};
```

---

**END OF BLUEPRINT**

**Następny krok:** Otwórz Cursor, zacznij od Prompt 1 (Setup & Config), potem idź chronologicznie.
**Czas realizacji:** ~8-10h total (setup 1h, components 5-6h, polish 2h, deploy 0.5h)
**Deadline:** Mar 1 (Week 4 Rebrand Sprint)
