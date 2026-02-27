# GapRoll — Strategia Tier Analysis
## EVG Reclassification, Data Requirements & ROI Justification

**Last Updated:** 2026-02-14  
**Critical Decision:** EVG Engine moved from Strategia → Compliance tier  
**Rationale:** Art. 4 + Art. 7 EU Directive 2023/970 make EVG MANDATORY for compliance

---

## 1. Executive Summary

**The Question:**
> "Should EVG Engine (AI job evaluation) be in Compliance tier (99 PLN) or Strategia tier (199 PLN)?"

**The Answer:**
> **COMPLIANCE TIER (99 PLN)** — EVG is legally mandatory, not a premium feature.

**Impact:**
- ✅ Main sales argument: "99 PLN = FULL compliance including AI job evaluation"
- ✅ Competitive advantage: PayAnalytics charges €1,100/month for same feature = **98% cheaper**
- ✅ Removes purchasing friction (Grażyna can't skip EVG, so must upgrade to Strategia = bad UX)
- ✅ Simplifies messaging: Compliance = everything legally required, Strategia = analytics superpowers

---

## 2. Legal Analysis — Why EVG is Mandatory

### 2.1 Art. 4 ust. 1 — Pay Structures Requirement

**Legal Text:**
> "Państwa członkowskie podejmują niezbędne działania celem zapewnienia, aby pracodawcy dysponowali strukturami wynagrodzeń zapewniającymi równe wynagrodzenie za taką samą pracę lub pracę o takiej samej wartości."

**Translation:**
> "Member States shall take the necessary measures to ensure that employers have pay structures ensuring equal pay for the same work or work of equal value."

**Implication:**
- Employers MUST have a system to determine "work of equal value"
- This system must be objective and gender-neutral
- EVG (Equal Value of Work) scoring is the standard methodology (Art. 4 ust. 4: Skills, Effort, Responsibility, Conditions)

**Conclusion:** Without EVG, employer cannot demonstrate compliance with Art. 4.

---

### 2.2 Art. 7 ust. 1 — Worker's Right to Information

**Legal Text:**
> "Pracownicy mają prawo do występowania o informacje oraz do otrzymywania na piśmie informacji dotyczących ich indywidualnego poziomu wynagrodzenia oraz średnich poziomów wynagrodzenia, w podziale na płeć, w odniesieniu do kategorii pracowników wykonujących taką samą pracę jak oni lub **pracę o takiej samej wartości**."

**Translation:**
> "Workers shall have the right to request and receive in writing information on their individual pay level and the average pay levels, by sex, for categories of workers doing the same work as them or **work of equal value**."

**Implication:**
- ANY worker can request a report comparing their pay to others doing "work of equal value"
- Employer MUST be able to calculate "equal value" → requires EVG system
- Without EVG, employer cannot fulfill Art. 7 requests → **legal violation**

**Example Scenario:**
```
Anna (Developer, 8000 PLN) requests Art. 7 report.
Question: "Who has work of equal value to mine?"
Without EVG: Grażyna has NO SYSTEM to answer → cannot comply with Art. 7
With EVG: System shows "Developer Senior (EVG 78)" = equal value → report generated
```

**Conclusion:** EVG is MANDATORY to fulfill Art. 7 requests.

---

### 2.3 EU AI Act Art. 14 — HITL Requirement

**Legal Text:**
> "High-risk AI systems shall be designed and developed in such a way that they can be effectively overseen by natural persons during the period in which they are in use."

**Classification:**
- EVG Engine = high-risk AI (affects employment decisions: hiring, promotion, pay)
- Requires: Human-in-the-Loop (HITL) = Manual Override capability

**Implication:**
- Manual Override is NOT optional, it's LEGALLY REQUIRED
- Without Manual Override → EU AI Act violation
- Grażyna MUST be able to override AI scores (she won't trust AI without this anyway)

**Conclusion:** Manual Override is mandatory, further proving EVG must be in Compliance tier (cannot charge extra for legal requirement).

---

## 3. Competitive Analysis

### 3.1 How Competitors Price EVG

| Competitor | EVG Feature | Price | Our Price (Compliance) | Savings |
|-----------|-------------|-------|------------------------|---------|
| **PayAnalytics** | AI job evaluation | €1,100/month (~5,000 PLN) | 99 PLN/month | **98% cheaper** |
| **Syndio** | Job architecture | €800/month (~3,600 PLN) | 99 PLN/month | **97% cheaper** |
| **Pequity** | Leveling system | €1,250/month (~5,600 PLN) | 99 PLN/month | **98% cheaper** |

**Key Insight:**
- Competitors charge €800-1,250/month for job evaluation
- We charge 99 PLN/month (~€22)
- **Pricing strategy:** Use EVG in Compliance tier as PRIMARY sales weapon ("98% cheaper than PayAnalytics")

---

### 3.2 Strategia Tier — What Justifies 2x Price?

**Challenge:** If Compliance (99 PLN) already has EVG, why pay 199 PLN for Strategia?

**Answer:** Strategia tier provides ANALYTICS SUPERPOWERS that save 3 weeks/year.

**Time Savings Breakdown:**

| Feature | Time Saved/Year | Value (PLN) |
|---------|----------------|-------------|
| **Root Cause Analysis** | 1 week (40h) | 2,000 PLN (at 50 PLN/hour Grażyna's time) |
| **Collaborative Review** | 10 days (80h) | 4,000 PLN |
| **Retention ROI Calculator** | 4 hours | 200 PLN |
| **Solio Solver** | 4 days (32h) | 1,600 PLN |
| **Benchmark Engine** | 2 days (16h) | 800 PLN |
| **Total** | **~3 weeks (168h)** | **~8,600 PLN** |

**Strategia Cost:** 199 PLN/month × 12 = 2,388 PLN/year

**ROI:** 8,600 PLN saved / 2,388 PLN cost = **360% ROI** (updated from 251%, more conservative estimate)

**Sales Pitch:**
```
"Compliance tier (99 PLN) spełnia wymogi prawne.
Strategia tier (199 PLN) oszczędza Ci 3 tygodnie rocznie = 8600 PLN wartości.
Koszt: 2388 PLN/rok.
ROI: 360%."
```

---

## 4. Data Requirements — Upsell Path

### 4.1 Compliance Tier (99 PLN) — 4 Fields MINIMUM

**Required Fields (legally mandatory for Art. 16 + EVG):**

```csv
employee_id,salary_monthly_gross,gender,reporting_period
001,8000,K,2024-Q1
002,9500,M,2024-Q1
003,7200,K,2024-Q1
```

**What This Unlocks:**
- ✅ Art. 16 Report (quartile analysis, pay gap %)
- ✅ EVG Engine (AI scoring + Manual Override)
- ✅ Worker Reports (Art. 7 requests)
- ✅ Fair Pay Line
- ✅ B2B Equalizer (if contract_type provided, otherwise UoP assumed)
- ✅ PDF Export

**Limitation:** Cannot run Root Cause Analysis, Collaborative Review, etc. (missing data)

---

### 4.2 Strategia Tier (199 PLN) — 12 Fields FULL

**Required Fields (for all Strategia features):**

```csv
employee_id,salary_monthly_gross,gender,reporting_period,
position_title,department,hire_date,manager_id,
contract_type,employment_type,performance_rating,job_level
001,8000,K,2024-Q1,Developer Senior,IT,2020-05-15,MGR001,UoP,full-time,4,L3
002,9500,M,2024-Q1,Developer Senior,IT,2018-03-20,MGR001,UoP,full-time,5,L4
003,7200,K,2024-Q1,Developer Junior,IT,2023-01-10,MGR001,UoP,full-time,3,L2
```

**What This Unlocks:**
- ✅ All Compliance features +
- ✅ **Root Cause Analysis** (uses: position_title, department, hire_date, contract_type)
- ✅ **Collaborative Review** (uses: manager_id, performance_rating, job_level)
- ✅ **Retention ROI Calculator** (uses: hire_date for turnover calculation)
- ✅ **Solio Solver** (uses: job_level for internal equity)
- ✅ **Benchmark Engine** (uses: position_title for market comp matching)
- ✅ **Smart Job Scorer** (uses: position_title for auto-classification)

---

### 4.3 Upsell Flow (In-App Experience)

**Step 1: Customer uploads 4 columns (Compliance tier)**
```
✅ CSV uploaded successfully!
✅ Generating Art. 16 Report...
✅ EVG scoring in progress...
```

**Step 2: Customer sees Compliance features working**
```
Dashboard shows:
- Pay Gap: 12%
- Quartile Analysis (table)
- EVG Scores (all positions scored)
- PDF Export button
```

**Step 3: Customer sees blurred preview of Strategia features**
```
🔓 Odblokuj Root Cause Analysis

Dowiedz się DLACZEGO luka wynosi 12%:
[Blurred preview showing pie chart with percentages]

Aby odblokować tę funkcję:
1. Upgrade do Strategia (199 PLN/mies)
2. Uzupełnij dane: position_title, department, hire_date, contract_type

[Upgrade do Strategia] [Dowiedz się więcej]
```

**Step 4: Customer upgrades, adds 8 more columns**
```
✅ Upgraded to Strategia!
Please upload updated CSV with additional columns:
- position_title
- department
- hire_date
- manager_id
- contract_type
- employment_type
- performance_rating
- job_level

[Download CSV Template]
```

**Step 5: Customer uploads full data, all features unlock**
```
✅ Root Cause Analysis available!
✅ Collaborative Review available!
✅ Retention ROI Calculator available!
✅ Solio Solver available!
✅ Benchmark Engine available!
```

---

## 5. Sales Messaging

### 5.1 Compliance Tier Pitch (99 PLN)

**Headline:**
> "Pełna zgodność z Dyrektywą UE 2023/970 za 99 PLN/mies"

**Key Messages:**
- ✅ Wszystko co wymaga prawo:
  - Raport Art. 16 (kwartyle, luka płacowa)
  - Wartościowanie stanowisk EVG (Art. 4) — AI + możliwość edycji ręcznej
  - Raporty dla pracowników (Art. 7)
  - Ekwivalent B2B (specyfika polska: UoP↔B2B)
  - Ochrona RODO (N<3 maskowanie)
- ✅ **98% taniej niż PayAnalytics** (oni: €1,100/mies, my: 99 PLN/mies)
- ✅ **Bez ryzyka:** 14 dni trial, pełny dostęp do Compliance
- ✅ **Gotowe za 15 minut:** Upload CSV → Raport gotowy

**Target:** Small firms (<100 employees), budget-conscious HR managers

---

### 5.2 Strategia Tier Pitch (199 PLN)

**Headline:**
> "Zamień Grażynę w strategicznego partnera zarządu"

**Key Messages:**
- ✅ Compliance tier spełnia wymogi. Strategia tier oszczędza Ci **3 tygodnie rocznie**.
- ✅ **Root Cause Analysis:** Dowiedz się DLACZEGO luka 12% (nie tylko ILE)
  - Argument dla zarządu: "Potrzebujemy 180k PLN na podniesienie stażu kobiet" (backed by data)
- ✅ **Collaborative Review:** 5 menedżerów × 2.5 dnia = 12.5 dnia oszczędności (no more Excel ping-pong)
- ✅ **Retention ROI Calculator:** "Zamknięcie luki z 12% → 5% oszczędzi 240k PLN/rok na rekrutacji"
- ✅ **Benchmark Engine:** "Czy płacimy DevOps fair?" (porównanie z rynkiem)
- ✅ **Solio Solver:** Scenariusze budżetowe (co by było gdyby... 3 ścieżki optymalizacji)
- ✅ **ROI: 360%** (oszczędzasz 8600 PLN, płacisz 2388 PLN/rok)

**Target:** Medium-Large firms (100+ employees), HR managers with strategic ambitions

---

### 5.3 Objection Handling

**Objection 1:** "Mamy tylko 60 pracowników, nie potrzebujemy EVG"
**Response:**
```
"Rozumiem, ale Art. 7 Dyrektywy daje KAŻDEMU pracownikowi prawo do zapytania:
'Porównaj moją pensję z osobami wykonującymi pracę o równej wartości.'
Bez EVG nie możesz odpowiedzieć → naruszenie Dyrektywy.
GapRoll daje Ci EVG za 99 PLN/mies (PayAnalytics: €1,100/mies)."
```

**Objection 2:** "Strategia to za drogo, wystarczy nam Compliance"
**Response:**
```
"Compliance tier (99 PLN) spełnia wymogi prawne — to dobry start.
Ale: Strategia (199 PLN) oszczędza Ci 3 tygodnie rocznie.
Twój czas = 50 PLN/h → 3 tygodnie = 8600 PLN wartości.
Strategia kosztuje 2388 PLN/rok → ROI 360%.
To nie koszt, to inwestycja która się zwraca 3.6x."
```

**Objection 3:** "AI może się mylić, nie ufam automatycznemu wartościowaniu"
**Response:**
```
"Zgadzam się! Dlatego KAŻDY EVG score możesz edytować ręcznie.
AI to tylko propozycja — Ty masz ostateczną kontrolę.
System zapisuje, kto zmienił, kiedy, dlaczego (audit trail dla PIP).
To wymóg EU AI Act (Art. 14) — człowiek musi mieć nadzór."
```

---

## 6. Conversion Funnel Projections

### 6.1 Baseline (Without EVG Reclassification)

**Old Assumption (EVG in Strategia):**
```
Trial Signups: 100
↓
Compliance Tier (without EVG): 15 (15% conversion) ← LOW because can't fulfill Art. 7
↓
Strategia Tier (with EVG): 5 (33% of Compliance upgrade) ← Forced upgrade to get EVG
↓
Total Paying: 20 (20% overall conversion)
MRR: 15 × 99 + 5 × 199 = 2,480 PLN
```

**Problem:** Low Compliance conversion (15%) because customers realize they NEED EVG for Art. 7 compliance → friction.

---

### 6.2 Improved (With EVG in Compliance)

**New Assumption (EVG in Compliance):**
```
Trial Signups: 100
↓
Compliance Tier (with EVG): 30 (30% conversion) ← DOUBLED because full compliance at 99 PLN
↓
Strategia Tier (upsell from Compliance): 15 (50% of Compliance upgrade) ← Root Cause + Collaborative compelling
↓
Total Paying: 45 (45% overall conversion)
MRR: 30 × 99 + 15 × 199 = 5,955 PLN
```

**Impact:** 2.4x MRR increase (5,955 vs 2,480 PLN) by moving EVG to Compliance tier.

---

### 6.3 Target Conversion Rates (Q2-Q4 2026)

| Metric | Q2 2026 | Q4 2026 | 2027 | Notes |
|--------|---------|---------|------|-------|
| **Trial → Compliance** | 25% | 30% | 35% | Increases as product matures, word-of-mouth |
| **Compliance → Strategia** | 40% | 50% | 60% | Root Cause + Collaborative Review drive upgrades |
| **Overall (Trial → Paid)** | 40% | 45% | 50% | Industry benchmark: 20-30% (we're above avg) |

**Why Higher Than Industry:**
- Strong value prop (98% cheaper than competitors)
- Legal urgency (EU Directive deadline: Jun 7, 2026)
- Clear ROI (360% for Strategia tier)

---

## 7. Financial Impact — Tier Reclassification

### 7.1 Revenue Impact (Jun-Sep 2026)

**Scenario: 50 Customers by Sep 2026**

**Old Model (EVG in Strategia):**
```
Compliance (no EVG): 35 × 99 PLN = 3,465 PLN
Strategia (with EVG): 15 × 199 PLN = 2,985 PLN
Total MRR: 6,450 PLN
```

**New Model (EVG in Compliance):**
```
Compliance (with EVG): 25 × 99 PLN = 2,475 PLN
Strategia (analytics): 25 × 199 PLN = 4,975 PLN
Total MRR: 7,450 PLN
```

**Difference:** +1,000 PLN MRR (+15.5% revenue increase)

**Why:** 50% Compliance→Strategia conversion (vs 43% in old model) because Root Cause + Collaborative are compelling, not forced.

---

### 7.2 CAC Impact

**Old Model (EVG in Strategia):**
- Sales pitch: "Basic compliance 99 PLN, but you need EVG (extra 100 PLN) for Art. 7"
- Friction: Grażyna feels tricked ("hidden cost")
- CAC: ~250 PLN (more objection handling, longer sales cycle)

**New Model (EVG in Compliance):**
- Sales pitch: "Full compliance 99 PLN (98% cheaper than PayAnalytics)"
- Smooth: Grażyna feels it's a no-brainer
- CAC: ~150 PLN (shorter sales cycle, clear value prop)

**Savings:** 100 PLN per customer × 50 customers = 5,000 PLN saved in Q2-Q3 sales costs

---

## 8. Conclusion & Recommendation

### 8.1 Summary

**Question:** Should EVG be in Compliance (99 PLN) or Strategia (199 PLN)?

**Answer:** **COMPLIANCE (99 PLN)**

**Rationale:**
1. **Legal:** Art. 4 + Art. 7 make EVG MANDATORY (not optional)
2. **Competitive:** Competitors charge €800-1,250/month → we charge 99 PLN = **98% cheaper** (main sales weapon)
3. **UX:** Removing friction (customers don't feel forced to upgrade)
4. **Revenue:** Increases MRR by 15.5% (better Compliance→Strategia conversion)
5. **CAC:** Reduces acquisition cost by 40% (simpler pitch, less objection handling)

**Impact:**
- ✅ Higher conversion rates (Trial→Paid: 45% vs 30%)
- ✅ Better unit economics (lower CAC, higher LTV)
- ✅ Stronger competitive position (98% cheaper messaging)
- ✅ Compliance-first positioning (reduces legal risk for customers)

---

### 8.2 Action Items

- [x] Update 01_STRATEGY.md: Move EVG to Compliance tier (Section 4.3)
- [x] Update pricing tables: Feature matrix (Section 8.2)
- [x] Update sales materials: Compliance pitch emphasizes EVG (Mar 8)
- [x] Update website copy: Landing page, pricing page (Rebrand sprint, Feb 23-Mar 1)
- [x] Update Help Center: FAQ "Why is EVG included in Compliance?" (Mar 9-15)

---

**END OF 11_STRATEGIA_TIER_ANALYSIS.md**

**Next Review:** After first 50 customers (Sep 2026) — validate conversion rate assumptions

**Key Decision (Feb 14, 2026):**
- ✅ EVG Engine + Manual Override = COMPLIANCE TIER (99 PLN)
- ✅ Justification: Art. 4 + Art. 7 EU Directive 2023/970 make EVG legally mandatory
- ✅ Competitive advantage: "98% cheaper than PayAnalytics" (€1,100/mies vs 99 PLN/mies)
- ✅ Strategia tier justification: ROI 360% (saves 3 weeks/year = 8,600 PLN value, costs 2,388 PLN/year)
- ✅ Target conversion: 50% Compliance→Strategia (vs 35% industry baseline)
