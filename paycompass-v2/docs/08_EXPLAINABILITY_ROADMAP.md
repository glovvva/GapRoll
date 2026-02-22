# GapRoll — Explainability Roadmap
## How to Make Complex Pay Equity Understandable for Grażyna

**Last Updated:** 2026-02-14  
**Version:** 1.0  
**Owner:** CPTO  
**Related Files:** 03_PERSONA_GRAZYNA.md, 05_FRONTEND_STANDARDS.md, 01_STRATEGY.md

---

## 1. Core Principle: The Audit Trail

Grażyna does NOT trust black boxes. Every number, every gap, every recommendation must be traceable to:

1. **Prawna podstawa** (legal citation: article, paragraph, law)
2. **Data source** (where this number came from)
3. **Calculation logic** (show the formula, not just the result)

**Why This Matters:**
- Grażyna fears PIP audit (Państwowa Inspekcja Pracy)
- She needs to defend every metric to CEO/CFO
- Without citations, she won't buy (compliance anxiety trumps innovation)

---

## 2. Metrics That Need Explaining

### 2.1 Luka Płacowa (Pay Gap) — The Red Number

**What Grażyna sees:**
```
⚠️ Średnia luka płacowa: 12.5%
```

**What Grażyna is TERRIFIED of:**
- Is this a legal violation?
- Will PIP/ZUS fine me?
- Is this Article 7 or Article 16?
- How do I explain this to the board?

**Explainability Required:**

| Element | Placement | Content | Citation |
|---------|-----------|---------|----------|
| **Tooltip (hover)** | Icon next to % | "Średnia różnica wynagrodzenia kobiet vs mężczyzn. Ujemna wartość = kobiety zarabiają mniej." | Art. 16 Dyrektywy 2023/970 |
| **Contextual Alert** | Below number | "W Waszej branży (IT) średni gap to 8–15%. Jesteście w normie." | Internal benchmark (GapRoll aggregate data) |
| **Defense Strategy** | Expandable section | "Możliwe przyczyny: [Stanowisko X na Level 3 ma wyższą pensję u mężczyzn]. Rekomendacja: [Podwyżka dla Y osób]." | Art. 7 ust. 3 (justification) |
| **Legal Status** | Card | "🟢 BRAK OBOWIĄZKU do działania (gap < 5%). Jednak zalecamy monitorowanie." OR "🔴 GAP >5% — Art. 9 wymaga wyjaśnienia przyczyn." | Art. 16 ust. 1, Art. 9 (threshold) |

**UI Component:** `<PayGapExplainer />` (Shadcn collapsible + tooltip)

---

### 2.2 Wartościowanie Stanowisk (EVG Score) — The Black Box Risk

**What Grażyna sees:**
```
Stanowisko: Developer Senior
Ocena EVG: 78/100 [AI-scored]
```

**Her immediate panic:**
- Did the AI really understand this job?
- Can I override it? (CRITICAL: she MUST be able to!)
- What if the AI is wrong and PIP audits us?
- Will the board trust an AI over my judgment?

**Explainability Required:**

| Element | Placement | Content | Citation |
|---------|-----------|---------|----------|
| **4-Axis Breakdown** | Modal (click "78/100") | Skills: 22/25, Effort: 18/25, Responsibility: 20/25, Conditions: 18/25 | Art. 4 Dyrektywy (equal value of work) |
| **Evidence** | Collapsible per axis | **Skills:** "Wymaga biegłości w JS, Python, AWS. Poziom: Senior (4/5)." | Job description mapping |
| **AI Confidence** | Badge | "AI pewność: 89%. **[Przejrzyj szczegóły]**" | Explainability metric |
| **Manual Override Button** | Prominent | "❌ Nie zgadzam się. Zmieniam na 72." → Opens justification modal | HITL requirement (EU AI Act Art. 14) |
| **Tolerance Band** | Info box | "Tolerancja ±5 punktów. Przedziały: 73–83 = równa wartość pracy." | Art. 4 ust. 3 |
| **Audit Trail** | Expandable | "Historia zmian: Grażyna zmieniła z 78 → 72 dnia 2026-03-15. Powód: 'Dodatkowa odpowiedzialność za budżet projektu nie była uwzględniona.'" | EU AI Act compliance |

**UI Component:** `<EVGScoreCard />` + `<EVGDetailModal />` + `<ManualOverrideForm />` (Shadcn dialog + accordion)

**CRITICAL:** Manual Override is MANDATORY, not optional. Without it:
- ❌ EU AI Act violation (high-risk AI without HITL)
- ❌ Grażyna won't buy (zero trust in AI)
- ❌ PIP can challenge every score

---

### 2.3 Analiza Kwartyli (Quartile Analysis) — The Table That Confuses Everyone

**What Grażyna sees:**
```
Kwartyl 1 (najniżsi): 8 kobiet, 5 mężczyzn
Kwartyl 2: 12 kobiet, 10 mężczyzn
Kwartyl 3: 9 kobiet, 14 mężczyzn
Kwartyl 4 (najwyżsi): 3 kobiet, 11 mężczyzn
```

**Her question:**
- Why is this table here?
- What do I DO with it?
- Is this good or bad?
- How do I present this to the board?

**Explainability Required:**

| Element | Placement | Content | Citation |
|---------|-----------|---------|----------|
| **Visual Legend** | Above table | "Podział na 4 grupy wynagrodzenia (od najniższych do najwyższych). Porównanie: kobiety vs mężczyźni w każdej grupie." | Art. 16 ust. 2 lit. a) |
| **Narrative Alert** | Card | "🔴 **Problem:** W Kwartyl 4 kobiety są niedoreprezentowane (3 vs 11 mężczyzn). To może wskazywać na dysproporcję awansów." OR "🟢 **Dobra wiadomość:** Rozkład jest względnie równomierny." | Art. 9 (structural analysis) |
| **What To Do** | Action button | "Sprawdź, czy kryteria awansu są neutralne względem płci. [Przejdź do EVG]" | Art. 4 (equal value criteria) |
| **Data Quality** | Footer | "Dane z okresu: 01.01.2024–31.12.2024. N=72. N<3 wygaszone (RODO)." | RODO masking rule |

**UI Component:** `<QuartileAnalysisTable />` + `<QuartileInterpretation />` (Shadcn table + alert)

---

### 2.4 Art. 16 Report Components — The Regulatory Report

**What Grażyna needs in PDF/HTML export:**

| Component | Required By | Explanation Format | Citation |
|-----------|-------------|-------------------|----------|
| **Title** | Art. 16 ust. 1 | "Raport Równości Wynagrodzeń (Pay Gap Report)" | Required by law |
| **Reporting Period** | Art. 16 ust. 2 | "Okres: 01.01.2024–31.12.2024" | Must be 12 months |
| **Company Info** | Art. 16 ust. 3 | Name, KRS number, # employees | Audit trail |
| **Mean Pay Gap** | Art. 16 ust. 2 lit. a) | "Średnia luka: X%. Metodologia: (salary_M - salary_F) / salary_M" | Show formula |
| **Median Pay Gap** | Art. 16 ust. 2 lit. a) | "Mediana luki: Y%. Przyczyna rozbieżności: [explain if different from mean]" | Robustness check |
| **Quartile Distribution** | Art. 16 ust. 2 lit. a) | Table (as above) | Structural analysis |
| **Component Analysis** | Art. 16 ust. 2 lit. b) | Base salary, variable pay, allowances (separately) | Transparency |
| **Justification** | Art. 7 ust. 3 | "Lukę uzasadniają: [factors]. Plany naprawy: [actions]." | Defense clause |
| **Data Quality** | RODO compliance | "N<3 wygaszone. PII zamaskowane. Audit log: [date, user, changes]" | Transparency |

**UI Component:** `<Art16Report />` (HTML + PDF via Puppeteer or WeasyPrint)

---

## 3. Grażyna FAQ — What She Will Ask & How We Answer

### Q1: "Czy ta luka 12% to naruszenie prawa?"

**Answer Template (formal, reassuring):**
```
Nie automatycznie. Art. 16 Dyrektywy nie definiuje "niedopuszczalnego" poziomu luki.

Jednak:
- Jeśli luka > 5% → Art. 9 wymaga wyjaśnienia przyczyn (Joint Pay Assessment)
- Jeśli luka > 25% → PIP może wszcząć kontrolę (precedens orzecznictwa)
- Twoja luka (12%) → wymaga monitorowania i planu działania

Rekomendacja: Przygotuj Raport Art. 7 (uzasadnienie).
[Link do szablonu Art. 7]
```

**UI:** Alert + modal with Art. 7 template link

---

### Q2: "Jakie dane są potrzebne do Raportu Art. 16?"

**Answer Template:**
```
Minimum (Art. 16 ust. 2) — COMPLIANCE TIER:
✅ Wynagrodzenie podstawowe (brutto, miesięczne)
✅ Płeć (binarnie: M/K, lub "Inna/Wolę nie podawać")
✅ Okres raportowania (minimum 12 miesięcy)
✅ Identyfikator pracownika (do deduplication, może być anonimowy)

Opcjonalnie (dla pełnej analizy) — STRATEGIA TIER:
📊 Stanowisko (mapujemy do EVG automatycznie)
📊 Typ umowy (UoP, UZ/UoD, B2B — ważne dla ZUS normalizacji)
📊 Data zatrudnienia (seniority factor dla Root Cause Analysis)
📊 Dział (department effect dla Root Cause Analysis)
📊 Manager ID (dla Collaborative Review)
📊 Performance rating (dla Collaborative Review)

Nie potrzebujemy: PESEL, imię/nazwisko (maski są na poziomie bazy danych).
```

**UI:** Wizard step, checklist + data quality report

---

### Q3: "Co zrobić, jeśli EVG score jest niepoprawny?"

**Answer Template:**
```
Dwa kroki:

1. Przejrzyj ocenę AI (Art. 4):
   - Kliknij "EVG Score: 78/100"
   - Sprawdź 4 wymiary (Skills, Effort, Responsibility, Conditions)
   - Przeczytaj uzasadnienie AI dla każdego wymiaru

2. Zmień ręcznie + uzasadnij (Art. 4 ust. 3):
   - Kliknij [Override Score]
   - Nowa ocena: 72
   - Uzasadnienie: "Stanowisko nie wymaga AWS (zmiana w 2024), obniżam Skills z 22 → 18"
   - System zapisze wersję poprzednią (audit trail)

Twoja ocena przesłania AI. Ty jesteś ekspertem, AI jest tylko narzędziem.
```

**UI:** Modal with before/after, audit trail visible, justification field mandatory

---

### Q4: "Czy ta platforma gromadzi dane pracowników bez zgody?"

**Answer Template (RODO compliance):**
```
NIE. Zgodnie z RODO (Art. 6 ust. 1 lit. c):

✅ Przetwarzamy dane TYLKO w celu zgodności z Dyrektywą 2023/970 (wymóg prawny)
✅ Każdy dostęp do danych jest logowany (audit trail)
✅ Dane N<3 są automatycznie maskowane (nigdy nie wyświetlamy grup <3 osób)
✅ PII (PESEL, nazwisko) nigdy nie trafia do AI
✅ Data retention: 3 lata (wymóg PIP dla audytu)
✅ EU data residency: Hetzner Germany/Finland (nie USA)

Ty kontrolujesz: kto ma dostęp, kto może eksportować, kiedy usuwamy.

Przejrzyj: [Polityka prywatności + Audit Log]
```

**UI:** Privacy card + audit log viewer (admin panel)

---

## 4. UI Components — Implementation Guide

### 4.1 Explainability Patterns (Shadcn + Tailwind)

#### Pattern 1: Tooltip + Icon

```tsx
// Component: InfoTooltip
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild>
    <Info className="w-4 h-4 text-text-secondary hover:text-teal-500 cursor-help" />
  </TooltipTrigger>
  <TooltipContent side="right" className="max-w-xs">
    <p className="text-xs">Średnia różnica wynagrodzenia kobiet vs mężczyzn...</p>
    <p className="text-xs text-text-secondary mt-2">
      Źródło: Art. 16 Dyrektywy 2023/970
    </p>
  </TooltipContent>
</Tooltip>
```

#### Pattern 2: Expandable Section (Collapsible)

```tsx
// Component: ExplainableMetric
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger className="flex items-center gap-2 hover:text-teal-500">
    <span className="font-mono text-2xl font-bold">12.5%</span>
    <ChevronDown className="w-4 h-4" />
  </CollapsibleTrigger>
  <CollapsibleContent className="pt-4 border-t mt-4">
    <div className="space-y-3">
      <ExplanationSection title="Co to oznacza?" content="..." />
      <ExplanationSection title="Czy to problem?" content="..." />
      <ExplanationSection title="Co zrobić?" content="..." citation="Art. 7" />
    </div>
  </CollapsibleContent>
</Collapsible>
```

#### Pattern 3: Citation Badge

```tsx
// Component: CitationBadge
import { Scale } from "lucide-react"
import { Badge } from "@/components/ui/badge"

<Badge variant="outline" className="text-xs border-teal-500 text-teal-400">
  <Scale className="w-3 h-3 mr-1" />
  Art. 16 ust. 2 Dyrektywy 2023/970
</Badge>
```

#### Pattern 4: Alert + Action

```tsx
// Component: ComplianceAlert
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

<Alert className="border-teal-primary bg-blue-50/5">
  <AlertCircle className="h-4 w-4 text-teal-primary" />
  <AlertTitle>Konieczna akcja: Przygotuj Art. 7 Justification</AlertTitle>
  <AlertDescription>
    Twoja luka (12%) jest powyżej 5%. Art. 9 wymaga wyjaśnienia przyczyn.
    <Button variant="link" size="sm" className="ml-2">
      Przejdź do szablonu →
    </Button>
  </AlertDescription>
</Alert>
```

---

## 5. Copy Guidelines for Explanations (Polish, Formal Tone)

### ✅ GOOD Examples (Grażyna-friendly)

```
"Luka płacowa to średnia różnica wynagrodzenia pomiędzy kobietami a mężczyznami.
Twoja luka wynosi 12%, co oznacza, że kobiety zarabiają średnio o 12% mniej.
Art. 9 Dyrektywy wymaga wyjaśnienia, jeśli luka przekracza 5%."
```

### ❌ BAD Examples (Confusing, too technical)

```
"Your pay gap coefficient is 1.12 (M/F ratio). This suggests a potential structural 
inequity in your comp matrix. AI confidence: 87%."
```

**Rules:**
- ✅ "Analiza wykazała..." (not "AI wykrył...")
- ✅ "Zgodnie z Art. X..." (every metric cited)
- ✅ "Raport wskazuje..." (formal tone)
- ❌ "Dashboard insights" (no anglicisms)
- ❌ "Check out" (use "Sprawdź")
- ❌ "Best practices" (use "Sprawdzone rozwiązania")

---

## 6. Implementation Checklist — What Goes Into V1.0

### Phase 1: Dashboard (Art. 16 Report Page) — Week 3 (Feb 16-22)

- [ ] Main pay gap metric with tooltip
- [ ] Quartile analysis table with narrative alert
- [ ] Component breakdown (base / variable / allowances)
- [ ] Legal status badge ("BRAK NARUSZENIA", "WYMAGA DZIAŁANIA", etc.)
- [ ] PDF export button (Art. 16 compliant)

### Phase 2: EVG Scoring Page — Week 4 (Feb 23 - Mar 1)

- [ ] EVG score card with 4-axis breakdown
- [ ] AI confidence badge
- [ ] **MANDATORY Manual Override workflow** (modal + justification + audit trail)
- [ ] Audit trail viewer (who changed what, when, why)
- [ ] Tolerance band visualization (±5 points)

### Phase 3: Compliance Checklist — Week 5 (Mar 2-8)

- [ ] Required fields for Art. 16 report (data quality check)
- [ ] N<3 suppression count ("X grup wygaszono z powodu N<3")
- [ ] RODO compliance summary
- [ ] Export audit log (CSV with all changes)

### Phase 4: Grażyna Help Center — Week 6 (Mar 9-15)

- [ ] In-app FAQ (expandable, searchable)
- [ ] Art. 7 justification template (downloadable docx)
- [ ] Glossary (luka płacowa, EVG, kwartyl, etc.)
- [ ] Video tutorials (optional, linked from UI) — 3 min each:
  - "Jak wygenerować raport Art. 16?"
  - "Jak edytować EVG score ręcznie?"
  - "Jak przygotować uzasadnienie Art. 7?"

---

## 7. Citation Mapping (Legal References)

Every metric must map to exactly ONE article:

| Metric | Article | Paragraph | Link to UI |
|--------|---------|-----------|-----------|
| Pay Gap % | 16 | (2) lit. a) | Main dashboard |
| Quartile Distribution | 16 | (2) lit. a) | Analysis table |
| Component Breakdown | 16 | (2) lit. b) | Report section |
| EVG Scoring | 4 | (1), (3) | EVG modal |
| Justification | 7 | (3) | Alert → template |
| Data Retention | RODO | Art. 5 | Privacy settings |
| HITL Requirement | EU AI Act | Art. 14 | EVG Override UI |

---

## 8. Testing Scenarios (QA Checklist)

### Scenario A: Grażyna opens dashboard with 12% gap

- [ ] Main metric visible immediately (no scrolling)
- [ ] Tooltip works on hover (explains in Polish)
- [ ] Legal status badge visible ("Wymaga działania")
- [ ] "Przygotuj Art. 7" action button visible
- [ ] PDF export includes all Art. 16 sections
- [ ] No anglicisms in UI

### Scenario B: Grażyna reviews EVG score for "Developer Senior"

- [ ] Score 78/100 displays with confidence 89%
- [ ] Click opens modal with 4-axis breakdown
- [ ] Each axis shows evidence (skills mapped from job description)
- [ ] **Manual Override button prominent and functional**
- [ ] Override requires justification (mandatory field)
- [ ] Audit log shows: who changed, when, from what to what, why
- [ ] Old score still visible (before/after comparison)

### Scenario C: Grażyna checks RODO compliance

- [ ] Privacy page shows: what data collected, why, how long kept
- [ ] Audit log accessible (filtered by date range)
- [ ] N<3 suppression count visible ("5 grup wygaszono")
- [ ] Download GDPR data request template
- [ ] EU data residency badge visible (Hetzner Germany/Finland)

---

## 9. Rollout Plan

| Week | Action | Success Metric |
|------|--------|----------------|
| 3 (16–22 Feb) | Implement Phase 1 (Dashboard) | All tooltips working, PDF exports Art. 16 compliant |
| 4 (23 Feb–1 Mar) | Implement Phase 2 (EVG modal + Override) | Override + audit trail functional, no bugs |
| 5 (2–8 Mar) | Implement Phase 3 (Compliance checklist) | Data quality report accurate, RODO summary complete |
| 6 (9–15 Mar) | Implement Phase 4 (Help Center) | FAQ searchable, templates downloadable, videos linked |
| 6 (9–15 Mar) | **Test with Grażyna persona (UX)** | 5/5 on comprehension test (can she use without training?) |
| 6 (15 Mar) | Deploy to staging | Internal QA complete, ready for Milestone 1 |

---

## 10. Accessibility (WCAG 2.1 AA Minimum)

### Contrast Requirements

- **Normal Text (< 18px):** 4.5:1 ratio minimum
- **Large Text (≥ 18px):** 3:1 ratio minimum
- **UI Components:** 3:1 ratio minimum

**Tool:** WebAIM Contrast Checker

**Passing Combinations:**
- ✅ White (#ffffff) on Slate-900 (#0f172a) - 17.3:1 ⭐
- ✅ Slate-200 (#e2e8f0) on Slate-900 (#0f172a) - 13.2:1 ⭐
- ✅ Teal (#14b8a6) on Slate-900 (#0f172a) - 5.8:1 ✓
- ❌ Slate-400 (#94a3b8) on Slate-800 (#1e293b) - 2.9:1 ❌

### Keyboard Navigation

- All interactive elements must be keyboard-accessible (Tab, Enter, Escape)
- Tab order follows visual flow (top → bottom, left → right)
- Buttons show focus outline (never `outline: none` without custom replacement)
- Modal traps focus (can't Tab outside modal until closed)

### Screen Readers

```tsx
// Use semantic HTML elements
<h1>Dashboard</h1>  // ✅
<div style={{fontSize: 32}}>Dashboard</div>  // ❌

// Provide alt text for images
<img src="logo.png" alt="GapRoll Logo" />

// Use aria-labels for icons
<Info aria-label="Informacja o luce płacowej" />
```

---

## References

**EU Directive 2023/970** (sections 4, 7, 9, 16): `/mnt/project/DIRECTIVE_EU_2023_970.pdf`  
**Grażyna Persona** (fears, vocabulary): `03_PERSONA_GRAZYNA.md`  
**Frontend Standards** (color, typography, components): `05_FRONTEND_STANDARDS.md`  
**Strategy** (product roadmap): `01_STRATEGY.md`

---

**END OF 08_EXPLAINABILITY_ROADMAP.md**

**Next Review:** March 15, 2026 (after all phases deployed)

**Key Principles:**
- ✅ Every metric has: definition + legal citation + interpretation
- ✅ Formal Polish (no anglicisms, "Zgodnie z Art. X...")
- ✅ Manual Override = MANDATORY (EU AI Act + Grażyna trust)
- ✅ Progressive disclosure (tooltip → collapsible → full report)
- ✅ WCAG AA accessibility (contrast, keyboard nav, screen readers)
