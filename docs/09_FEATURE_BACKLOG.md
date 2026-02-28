# GapRoll — Feature Backlog
## Prioritized Roadmap with Impact × Effort Analysis

**Last Updated:** 2026-02-27  
**Owner:** CPTO  
**Status:** Living document (updated after each milestone)

---

## 1. Prioritization Formula

```
Priority Score = (Impact × 10) + (10 - Effort) + Strategic Bonus

Impact: 1-10 (business value, user pain relieved, competitive advantage)
Effort: 1-10 (dev time, complexity, dependencies)
Strategic Bonus: 0-5 (data moat, regulatory arbitrage, network effects)

Priority Tiers:
- P0 (30+): Drop everything, build now
- P1 (25-29): Next sprint
- P2 (20-24): This quarter
- P3 (15-19): Next quarter
- BACKLOG (<15): Future consideration
```

---

## 2. Feature Inventory (25 Features)

### 2.1 BUILT (Streamlit MVP — Production)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | CSV Upload + Auto-detect | ✅ PROD | Polish `;` separator support |
| 2 | Column Mapping Wizard | ✅ PROD | Manual selectbox |
| 3 | Pay Gap Calculation | ✅ PROD | Median M/F, per EVG group |
| 4 | Fair Pay Line | ✅ PROD | Plotly scatter + regression |
| 5 | Art. 16 Reporting | ✅ PROD | Quartile, component gaps |
| 6 | B2B Equalizer | ✅ PROD | UoP↔B2B, ZUS 2026, NET→GROSS |
| 7 | RODO Shield | ✅ PROD | N<3 masking, audit trail |
| 8 | PDF Export (Art. 7) | ✅ PROD | ReportLab |
| 9 | Multi-tenancy | ✅ PROD | Supabase RLS (org→project→user) |
| 10 | Authentication | ✅ PROD | Supabase Auth (email/password) |
| 11 | AI Job Scoring (basic) | ✅ PROD | GPT-4o, 1-100 scale |
| 12 | EVG Manual Override UI | ✅ PROD | done Feb 2026 |
| 14 | Explainability Layer (tooltips, legal citations, WCAG) | ✅ PROD | done Feb 2026 |
| 17 | Partner Portal v1 | ✅ PROD | done Feb 2026 |
| 18 | Rebrand PayCompass → GapRoll (codebase) | ✅ PROD | done Feb 2026 |
| 18c | Data Table View (/dashboard/dane, inline editing, audit log) | ✅ PROD | done Feb 2026 |
| 20 | Root Cause Analysis (why-gap-exists breakdown) | ✅ PROD | done Feb 2026 |
| 23 | Solio Solver v1 (budget optimization, greedy algorithm) | ✅ PROD | done Feb 2026 |

### 2.2 IN PROGRESS (Milestone 1 — Mar 15)

| # | Feature | Target | Phase | Priority | Impact | Effort |
|---|---------|--------|-------|----------|--------|--------|
| 13 | **Invoice Automation** | Mar 29 | 1 | **P0 (33)** | 10 | 7 |
| 15 | Onboarding Automation (n8n) | Mar 15 | 1 | P1 (28) | 8 | 5 |
| 16 | Sales Materials | Mar 8 | 1 | P1 (27) | 8 | 4 |
| 18b | **PESEL→Gender Auto-Detection** | Mar 1 | 1 | P1 (26) | 6 | 1 |
| 18d | **Claude Cowork setup** (4 pluginy: Productivity/Marketing/Legal/Sales) | Mar 1-3 | 1 | P1 (27) | 6 | 1 |

### 2.3 QUEUED (Agents & Strategia Features — Mar-Jun)

| # | Feature | Target | Phase | Priority | Impact | Effort |
|---|---------|--------|-------|----------|--------|--------|
| 19 | Hunter Agent (Discovery) — Start building: Mar 9-15 | Mar 29 | 2 | **P0 (32)** | 9 | 8 |
| 21 | **Collaborative Review** | May 3 | 3 | **P1 (28)** | 9 | 7 |
| 22 | Retention ROI Calculator | Apr 12 | 2 | P1 (26) | 8 | 4 |
| 24 | Benchmark Engine v1 (PDF) | Mar 22 | 2 | P2 (24) | 9 | 7 |
| 25 | Guardian Agent (Legal RAG) | Apr 12 | 2 | P1 (28) | 9 | 9 |
| 26 | HITL Approval Queue | Apr 26 | 2 | P1 (27) | 8 | 5 |
| 27 | Analyst Agent (DSPy) | May 10 | 3 | P2 (23) | 7 | 8 |
| 28 | Email Infrastructure | Apr 5 | 2 | P0 (30) | 8 | 3 |

### 2.4 BACKLOG (Post-V1.0 — Q3-Q4 2026)

| # | Feature | Phase | Priority | Impact | Effort |
|---|---------|-------|----------|--------|--------|
| 29 | Benchmark v2 (Web Scraping) | 3 | P2 (22) | 9 | 8 |
| 30 | Solio Solver v2 (AI-powered) | 4 | P2 (21) | 8 | 7 |
| 31 | Salary Review Cockpit | 4-5 | P3 (18) | 7 | 9 |
| 32 | Gamified Merit Matrix | 4-5 | P3 (16) | 6 | 9 |
| 33 | Smart Job Scorer | 3 | P2 (22) | 7 | 6 |
| 34 | Justification Agent (Art. 7) | 3 | P2 (23) | 8 | 6 |
| 35 | Partner Portal v2 (White-label) | 3 | P2 (24) | 8 | 7 |
| 36 | SSO / SAML / Azure AD | 3 | P2 (21) | 7 | 8 |
| 37 | API Access (for integrations) | 4 | P3 (19) | 6 | 7 |
| 38 | **ERP Integration Layer** | 5+ | P3 (17) | 9 | 10 |
| 39 | **PESEL Normalization Utils** | 4 | P3 (19) | 6 | 2 |
| 40 | **NormalizedEmployee Schema** | 3 | P2 (22) | 7 | 3 |
---

## 3. Detailed Feature Specs

### Feature #12: EVG Manual Override UI — ✅ DONE (done Feb 2026)

**Why P0:**
- **Legal:** EU AI Act Art. 14 requires HITL for high-risk AI
- **User:** Grażyna won't buy without override (zero trust in AI)
- **Compliance:** Art. 4 Dyrektywy requires employer control over EVG methodology

**User Story:**
```
As Grażyna, I need to manually override AI-generated EVG scores
so that I can correct errors and maintain audit trail for PIP inspection.
```

**Acceptance Criteria:**
- [ ] Click EVG score → modal opens with 4-axis breakdown
- [ ] "Override Score" button prominent
- [ ] Override requires justification (mandatory text field, min 20 chars)
- [ ] Before/after comparison visible
- [ ] Audit trail recorded (user, timestamp, old value, new value, reason)
- [ ] Override persists across sessions
- [ ] PDF export shows override in footnote: "EVG score manually adjusted by [user] on [date]. Justification: [reason]."

**Dependencies:** None (standalone feature)

**Effort Breakdown:**
- UI components (modal, form): 2h
- Backend (audit trail): 1h
- Testing (edge cases): 1h
- Total: 4h

**Timeline:** Week 5 (Mar 2-8)

---

### Feature #13: Invoice Automation — CRITICAL (Priority 33)

**Why P0:**
- **Time savings:** 12.5h/month at 50 customers (vs manual invoicing)
- **Scalability:** Cannot manually invoice 100+ customers
- **Professionalism:** Auto-invoicing expected by Polish B2B

**User Story:**
```
As a customer, when I sign up for GapRoll,
I receive an invoice automatically via email with payment link
so that I can pay immediately without waiting for manual invoice.
```

**Tech Stack:**
- **Fakturownia.pl:** Invoice generation API
  - JPK_FA export (Polish accounting standard)
  - KSeF ready (e-faktury from July 2026)
  - Cost: ~50 PLN/mies (100 invoices/month)
- **Przelewy24:** Payment gateway
  - BLIK, przelew, karty
  - Webhook → Fakturownia status update
  - Cost: 1.49% per transaction

**Acceptance Criteria:**
- [ ] New subscription → invoice auto-generated within 5 min
- [ ] Invoice PDF sent via email (with payment link)
- [ ] Customer pays → webhook updates status → confirmation email sent
- [ ] Failed payment → retry logic (3 attempts over 7 days)
- [ ] Manual invoice generation available (admin panel, for corrections)
- [ ] Invoice includes: company details, KRS, NIP, payment terms (14 days)
- [ ] Monitoring: Slack alert if invoice generation fails

**Dependencies:** 
- Fakturownia.pl account (created Week 5)
- Przelewy24 merchant account (created Week 5)
- Supabase webhook infrastructure

**Effort Breakdown:**
- Fakturownia API integration: 3h
- Przelewy24 webhook: 2h
- Email templates: 1h
- Error handling + retry logic: 2h
- Testing (mock payments): 2h
- Total: 10h

**Timeline:** 
- Week 5 (Mar 2-8): Setup accounts, configure templates
- Week 6 (Mar 9-15): Supabase integration
- Week 7 (Mar 16-22): Testing
- Week 8 (Mar 23-29): Production ready

**ROI:** Break-even after 1 month (saves 12.5h at 50 customers, costs ~50 PLN/mies)

---

### Feature #20: Root Cause Analysis — ✅ DONE (done Feb 2026)

**Why P1:**
- **Regulatory:** Art. 9 requires gap explanation if >5%
- **Sales:** Main differentiator vs Compliance tier (justifies 2x price)
- **Value:** Saves 1 week/year (vs manual pivot tables)

**User Story:**
```
As Grażyna with a 12% pay gap,
I need to understand WHY the gap exists (breakdown by cause)
so that I can explain to the board and get budget approved for remediation.
```

**Output Example:**
```
Luka Płacowa: 12%

Przyczyny (Root Causes):
1. Luka Stażu Pracy (40% wpływu): 
   - Mężczyźni: średnio 7.2 lat
   - Kobiety: średnio 4.8 lat
   - Różnica: 2.4 lat → wpływ na gap: 4.8%

2. Dystrybucja Stanowisk (35% wpływu):
   - Stanowiska senior: 90% mężczyźni, 10% kobiety
   - Wpływ na gap: 4.2%

3. Efekt Działowy (15% wpływu):
   - IT (wysokie płace): 75% mężczyźni
   - HR (niskie płace): 70% kobiety
   - Wpływ na gap: 1.8%

4. Typ Umowy (10% wpływu):
   - B2B (wyższe płace): 20% mężczyźni vs 5% kobiet
   - Wpływ na gap: 1.2%
```

**Acceptance Criteria:**
- [ ] Analysis runs on-demand (button: "Analyze Root Causes")
- [ ] Breakdown shows 4+ root causes with % contribution
- [ ] Each cause has: description, metric (avg/median/%), impact on gap
- [ ] Visual: pie chart or waterfall chart showing contribution
- [ ] Export to PDF (board-ready report)
- [ ] Legal citation: "Analiza przygotowana zgodnie z Art. 9 Dyrektywy UE 2023/970"

**Dependencies:** 
- Strategia tier data (hire_date, position_title, department, contract_type)

**Algorithm:**
```python
# Regression decomposition
from sklearn.linear_model import LinearRegression

# Features: seniority_years, is_senior_role, is_high_pay_dept, is_b2b
# Target: salary
# Coefficient weights → % contribution to gap

gap = median_male - median_female

seniority_effect = coef_seniority * (avg_seniority_male - avg_seniority_female)
position_effect = coef_senior * (pct_senior_male - pct_senior_female) * avg_senior_salary
# ... etc

contributions = [seniority_effect, position_effect, dept_effect, contract_effect]
pct_contributions = contributions / sum(contributions) * 100
```

**Effort Breakdown:**
- Algorithm (regression decomposition): 4h
- UI (breakdown table + chart): 3h
- PDF export template: 2h
- Testing (edge cases, data validation): 3h
- Total: 12h

**Timeline:** Week 11 (Apr 13-19)

**Sales Impact:** Estimated to increase Compliance→Strategia conversion from 35% → 45%

---

### Feature #21: Collaborative Review — STRATEGIA TIER (Priority 28)

**Why P1:**
- **Enterprise blocker:** Firms with 5+ managers won't buy without this
- **Time savings:** 10 days/year (4 review cycles × 2.5 days each)
- **Competitive:** Syndio has this, PayAnalytics doesn't (differentiator)

**User Story:**
```
As Grażyna managing 5 department managers,
I need each manager to propose raises for their team in one system
so that I can approve/override all in one dashboard (no Excel email ping-pong).
```

**Workflow:**
1. **Grażyna sets up review:**
   - Budget: 200k PLN
   - Deadline: 2 weeks
   - Invites 5 managers (auto-email sent)

2. **Managers propose raises:**
   - Each manager sees only their team
   - Proposes raises (amount + justification)
   - Real-time budget bar: "150k PLN allocated / 200k PLN total"
   - Conflict alert if 2 managers propose same person

3. **Grażyna reviews:**
   - Dashboard shows all proposals (sortable by dept, amount, justification)
   - Approve/override each proposal
   - Override requires justification
   - Export: CSV (who gets raise, how much) + PDF board report

**Acceptance Criteria:**
- [ ] Review creation form (budget, deadline, manager selection)
- [ ] Manager invitation emails (with login link)
- [ ] Manager UI: team list, propose raise form, budget tracker (WebSocket real-time)
- [ ] Grażyna dashboard: all proposals, approve/override, conflict resolution
- [ ] Audit trail: who proposed, who approved, timestamps
- [ ] Export: CSV + PDF
- [ ] Email notifications: proposal submitted, proposal approved, review complete

**Dependencies:**
- Strategia tier data (manager_id, performance_rating, job_level)
- WebSocket infrastructure (for real-time budget tracking)

**Tech Stack:**
- WebSocket: Supabase Realtime (real-time budget updates)
- Email: Mailchimp (invitation, notification emails)

**Effort Breakdown:**
- Review creation flow: 3h
- Manager UI (propose raise): 4h
- Grażyna dashboard (approve/override): 4h
- WebSocket real-time budget: 3h
- Email notifications: 2h
- PDF export template: 2h
- Testing (multi-user, conflict scenarios): 4h
- Total: 22h

**Timeline:** Week 13 (Apr 27 - May 3)

**Sales Impact:** Estimated to unlock enterprise segment (100-249 employees), increase ARPU 30%

---

### Feature #19: Hunter Agent (Discovery) — CRITICAL (P0, Priority 32)

**Start building:** Mar 9-15

**Why P0:**
- **Revenue:** Enables scaling beyond manual outreach (50 → 500 customers)
- **Data moat:** Lead database becomes strategic asset
- **Timing:** Must start discovery NOW to have leads ready for May sales

**User Story:**
```
As Bartek (CEO), I need an AI agent to discover and qualify Polish companies
so that I have a pipeline of 500+ qualified leads ready for outreach in May.
```

**Workflow (LangGraph):**
```
[START] → [Search ICP] → [Filter PKD] → [Check VAT Status]
→ [Enrich (KRS/CEIDG)] → [Find Decision Maker]
→ [Score Lead] → {Score > 70?}
├─ YES → [Queue for Outreach] → [END]
└─ NO → [Archive] → [END]
```

**Acceptance Criteria:**
- [ ] Search: Query KRS/CEIDG by PKD code (69.20.Z = accounting, 70.22.Z = consulting)
- [ ] Filter: Size (50-500 employees), Revenue (>1M PLN), Active (VAT registered)
- [ ] Enrich: KRS API (lazy loading, only if score >70%) fetches: company size, revenue, NIP
- [ ] Decision Maker: LinkedIn scraper (CEO, CFO, HR Manager)
- [ ] Score: Formula (size × industry_fit × revenue × recency)
- [ ] Output: Supabase `leads` table with all fields
- [ ] Daily limit: 100 leads/day (avoid API rate limits)
- [ ] Cost tracking: KRS API ~1 PLN/query, budget 100 PLN/day max

**Dependencies:**
- KRS API access (paid, ~1 PLN/query)
- CEIDG API access (free, rate limited)
- Biała Lista Podatników API (VAT verification, free)
- LinkedIn scraper (Cognism or Lusha, RODO-compliant)

**Effort Breakdown:**
- LangGraph flow: 4h
- KRS/CEIDG API integration: 3h
- LinkedIn scraper integration: 3h
- Lead scoring algorithm: 2h
- Database schema + UI (lead viewer): 3h
- Testing (API errors, rate limits): 3h
- Total: 18h

**Timeline:** Week 8 (Mar 23-29)
---

### Feature #18b: PESEL→Gender Auto-Detection — QUICK WIN (Priority 26)

**Why P1:**
- **UX:** Grażyna doesn't need to manually specify gender per employee
- **Data quality:** PESEL 10th digit parity is 100% deterministic (Even=F, Odd=M)
- **Compliance:** Art. 9 reporting requires gender — auto-detection reduces upload friction

**Implementation:**
```python
# utils/pesel.py
def parse_gender_from_pesel(pesel: str) -> str | None:
    """
    Determine gender from Polish PESEL number.
    10th digit (index 9): even = Female, odd = Male.
    Returns None if PESEL is invalid or missing.
    """
    if not pesel or len(pesel) != 11 or not pesel.isdigit():
        return None
    return "K" if int(pesel[9]) % 2 == 0 else "M"
```

**Integration points:**
- CSV upload wizard: if `pesel` column detected AND no `gender` column → auto-fill
- UI: show info tooltip: "Płeć wykryta automatycznie na podstawie numeru PESEL"
- Override: user can manually change (audit trail logged)

**Effort:** 1h (20 lines Python + CSV wizard update)
**Timeline:** Week 4 (Feb 23 - Mar 1, rebrand sprint)
---

### Feature #17: Partner Portal v1 — ✅ DONE (done Feb 2026)

**Why P1:**
- **Revenue multiplier:** 5 partners × 50 clients = 250 customers (vs 50 direct)
- **Sales blocker:** Cannot pitch partnerships without portal
- **Market timing:** Must be ready by Apr 6 (accounting firm outreach starts)

**User Story:**
```
As a partner (biuro rachunkowe), I need a portal to onboard my clients
so that I can offer GapRoll as a value-added service and earn recurring revenue.
```

**Features:**
- Partner dashboard: client list, MRR view, revenue share tracking
- Client onboarding: API endpoint to create new customer
- White-label option: rebrand as "Księgowość XYZ Compliance Pack" (custom logo, colors)
- Co-branded reports: partner logo + GapRoll logo on Art. 16 PDFs
- RLS architecture: partner sees all their clients, client sees only their data

**Acceptance Criteria:**
- [ ] Partner registration form (company details, KRS, NIP)
- [ ] Partner dashboard UI (client list, MRR chart, revenue share breakdown)
- [ ] Client onboarding API: `POST /api/partner/onboard-client` (creates customer, sends welcome email)
- [ ] White-label config (logo upload, color picker, company name)
- [ ] RLS rules: `partner_id` column in `customers` table, row-level security enforced
- [ ] Revenue share calculation: automatic (partner keeps 100-150 PLN/client, we get 49-199 PLN)
- [ ] Billing: monthly invoice sent to partner (for all clients combined)

**Dependencies:**
- Multi-tenancy architecture (Supabase RLS)
- Invoice automation (Feature #13)

**Effort Breakdown:**
- Partner registration + auth: 3h
- Dashboard UI: 4h
- Client onboarding API: 3h
- White-label config: 3h
- RLS rules + testing: 4h
- Revenue share calculation: 2h
- Total: 19h

**Timeline:** Week 5-6 (Mar 2-15)

---

### Feature #18c: Data Table View (Podgląd Załadowanych Danych) — ✅ DONE (done Feb 2026)

**Why P0:**
- **Trust foundation:** Blocks user trust in all other features — Grażyna must see and verify loaded data before trusting luka płacowa, raporty, or EVG.
- **Upsell trigger:** Missing Strategia columns shown as locked with CTA (strategic bonus for tier conversion).
- **Compliance:** Inline edit + audit log support RODO and Art. 7 traceability.

**User Story:**
```
As Grażyna, I need to see all loaded employee records in a clear table
so that I can verify mapping, fill gaps, and trust the numbers used in raporty and wartościowanie.
```

**Location in app:** `/dashboard/dane` (new route) OR as tab in existing upload flow.

**Requirements:**

1. **Table:** All loaded employee records, paginated (50 per page).
2. **Column headers:** Show mapped name + original CSV column name (e.g. "Płeć (gender)").
3. **Empty/null cells:** Highlighted in yellow with tooltip: "Uzupełnij aby odblokować [funkcja]".
4. **Missing Strategia columns:** Shown as locked columns with upsell CTA (e.g. "Data zatrudnienia — dostępne w pakiecie Strategia").
5. **Inline edit:** Click cell → edit → save, with audit log entry (user, timestamp, field, old value, new value).
6. **Period selector:** Show data from previous uploads by `reporting_period` (dropdown or tabs).
7. **Trend indicator:** Per employee when multiple periods are loaded (e.g. ↑/↓ vs previous period).

**Acceptance Criteria:**
- [x] Route `/dashboard/dane` renders paginated table (50/page, server-side).
- [x] Column headers: "Polska Nazwa (original_csv_column)" format.
- [x] Null/empty cells highlighted amber + tooltip "Uzupełnij aby odblokować [funkcja]".
- [x] RODO-masked cells show "— (RODO)" with tooltip, no salary value.
- [x] Strategia columns locked with LockIcon + upsell CTA (teal button).
- [x] Inline edit → justification dialog (min 20 chars) → audit log entry → toast.
- [x] Forbidden edits rejected: employee_id, evg_group, evg_score.
- [x] Period selector (Shadcn/UI Select, populated from DB).
- [x] Trend indicator per employee when N≥3, multi-period mode only (RODO safe).
- [x] data_corrections_audit table with RLS.

**Dependencies:** Upload + column mapping (existing); `reporting_period` on uploads; audit log table/schema.

**Effort:** 8h  
**Impact:** 9/10 (trust foundation for all other features)  
**Strategic bonus:** 3 (upsell trigger for Strategia tier)

**Effort Breakdown (suggested):**
- Table component (paginated, headers, sorting): 2h
- Empty-cell highlighting + tooltips: 1h
- Locked Strategia columns + CTA: 1h
- Inline edit + save + audit log: 2h
- Period selector + trend indicator: 1.5h
- Testing + edge cases: 0.5h

**7. PREREQUISITES BEFORE STARTING**

1. Backend running: `cd apps/api && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000`
2. Frontend running: `cd apps/web && pnpm dev`
3. `reporting_period` column in `payroll_data` via migration (20260227100000_data_preview.sql). Verify: `SELECT column_name FROM information_schema.columns WHERE table_name = 'payroll_data' AND column_name = 'reporting_period';` → Must return 1 row. If 0 rows: STOP and inform user.
4. `data_corrections_audit` table exists (create via same migration in Supabase SQL Editor if missing).

**Timeline:** Target Mar 15 (Milestone 1)

---

## 4. Dependency Graph

```
Milestone 1 (Mar 15)
├── EVG Manual Override (#12) → no dependencies
├── Invoice Automation (#13) → no dependencies
├── Explainability Layer (#14) → no dependencies
├── Data Table View (#18c) → depends on reporting_period migration + data_corrections_audit
├── Partner Portal v1 (#17) → depends on Invoice Automation (#13)
└── Rebrand (#18) → no dependencies

Strategia Features (Apr-May)
├── Root Cause Analysis (#20) → depends on Strategia tier data
├── Collaborative Review (#21) → depends on Strategia tier data + WebSocket
├── Retention ROI Calculator (#22) → depends on Benchmark v1 (#24)
└── Solio Solver v1 (#23) → no dependencies

Agents (Mar-May)
├── Hunter Discovery (#19) → no dependencies
├── Guardian Legal RAG (#25) → depends on Weaviate setup
└── Analyst DSPy (#27) → depends on Golden Datasets (Hunter + Guardian)
```

---

## 5. Rejected Features (Out of Scope)

| Feature | Reason | Alternative |
|---------|--------|-------------|
| Blockchain wage registry | Over-engineered, no real value | Centralized DB with audit log |
| Employee self-service portal | Not HR tool, different persona | Focus on Grażyna |
| Performance review module | Scope creep, unrelated to pay gap | Partner with Lattice/15Five |
| Job board integration | Not core value prop | Manual import from LinkedIn |
| Cryptocurrency payroll | Niche, regulatory nightmare | Focus on PLN/EUR |

---

### Knowledge Architecture Evolution (Guardian)

**Phase 1 (Week 10, Apr 6-12): Flat RAG**
- Implementation: Weaviate vector DB
- Structure: Individual markdown files (not one PDF)
- Metadata: `{article: "Art. 7", related: ["Art. 9"]}`
- Expected accuracy: 80%
- Effort: 8h
- Status: PLANNED

**Phase 2 (Week 20, Jun 1-7): Hybrid RAG + Graph Hints**
- Trigger: After 100+ Guardian queries analyzed
- Implementation: Keep Weaviate + add metadata-based link following
- When RAG returns Art. 7 → also retrieve Art. 9 (from `related` field)
- Expected accuracy: 90%
- Effort: 8h
- Status: CONDITIONAL (only if Phase 1 <85% accuracy)

**Phase 3 (Week 24, Jul 1-7): Full Skill Graph**
- Trigger: Phase 2 accuracy <85% OR Czech expansion OR 100+ customers
- Implementation: Full graph structure with wikilinks
  - `00_INDEX.md` for each legal domain
  - Graph traversal BEFORE vector search
  - Progressive disclosure pattern
- Expected accuracy: 95%+
- Effort: 40h
- Reference: `/skill-graph-pilot/` (proof-of-concept created Feb 15)
- Status: DEFERRED (evaluate Jun 2026)

**Rationale:**
- Heinrich (@arscontexta) concept validates structured knowledge for complex domains
- Legal knowledge = hierarchical (Dyrektywa → Artykuły → Paragrafy → Orzeczenia)
- Flat RAG loses logical structure → wikilinks preserve it
- BUT: Premature without usage data → defer until Jul 2026

---

### 5.1 Deferred Features (Validated Strategy, Not Yet Prioritized)

| Feature | Source | Trigger to Activate | Est. Effort |
|---------|--------|---------------------|-------------|
| **Symfonia WebAPI Connector** | Gemini ERP Report (Feb 2026) | 3+ customers request OR Symfonia contacts us | 80-100h |
| **enova365 API Connector** | Gemini ERP Report (Feb 2026) | 50 customers + demand survey confirms | 40-60h |
| **Comarch Optima Connector** | Gemini ERP Report (Feb 2026) | Pre-seed raised + 50 customers | 120h+ (hybrid SQL/API) |
| **CEE Expansion (Helios/NextUp)** | Gemini ERP Report (Feb 2026) | €1M ARR + Symfonia partnership active | 200h+ |

**Note:** Full technical blueprints (Python/FastAPI code, auth flows, schema maps) archived in `docs/erp-integration-blueprints.md`. Source: Gemini Deep Research, Feb 17, 2026.

---

## Agent Orchestration (Q3-Q4 2026)

### Multi-Agent Coordination Framework

**Problem Identified (Feb 15, 2026):**
- Current architecture: Bartek is "message bus" between agents
- Hunter discovers lead → Bartek copies to Guardian → Guardian checks compliance → Bartek copies back to Hunter
- This doesn't scale beyond 50 customers (Bartek becomes bottleneck)

**Solution Research: Agent Relay SDK**
- **What it is:** Open-source SDK for deterministic multi-agent systems
- **Key features:**
  - Real-time push communication between agents
  - Cross-provider support (Claude ↔ OpenAI ↔ Anthropic)
  - Peer-to-peer conversations (not just hierarchical sub-agents)
  - Channel-based messaging (like Slack for agents)
- **Example use case:** Hunter finds lead with compliance question → sends to Guardian channel → Guardian answers → Hunter incorporates into email → no human in loop
- **Repository:** https://github.com/AgentWorkforce/relay
- **Language:** TypeScript (Node.js server)

**Status: DEFERRED to Q3 2026**
- **Why:** We have 0 agents in production (Guardian Alpha = Apr 12)
- **Trigger:** When we have 2+ stable agents AND >50 customers AND Bartek is bottleneck
- **Effort estimate:** 2-3 weeks (TypeScript server + agent integration)
- **Alternative for MVP:** Bartek manually coordinates (acceptable for 10-50 customers)

**Decision rationale:**
- Tool is excellent for future state (multi-agent newsroom, autonomous compliance checking)
- Premature for Apr-Jun 2026 (focus on single-agent MVPs first)
- Revisit in Jul-Aug 2026 when Hunter + Guardian + Analyst all working

**Reference:** Will Washburn (@willwashburn) "Introducing Agent Relay" (Feb 9, 2026)

---

## 6. Success Metrics (Feature Adoption)

| Feature | Target Adoption | Measurement |
|---------|----------------|-------------|
| EVG Manual Override | 80% override at least 1 score | % users who click "Override Score" |
| Invoice Automation | 100% invoices auto-generated | Manual invoices = 0 |
| Root Cause Analysis | 60% Strategia users run analysis | % Strategia users who click "Analyze" |
| Collaborative Review | 40% enterprises use (100+ employees) | % users with >5 managers who enable |
| Partner Portal | 5 partners signed by May 1 | # active partners |
| Hunter Agent | 500 qualified leads by May 1 | # leads with score >70 |

---

**END OF 09_FEATURE_BACKLOG.md**

**Next Update:** After Milestone 1 (Mar 15, 2026)

**Key Additions This Version (Feb 14, 2026):**
- ✅ Invoice Automation (Priority P0, #13)
- ✅ Root Cause Analysis (Priority P1, #20)
- ✅ Collaborative Review (Priority P1, #21)
- ✅ EVG Manual Override elevated to P0 (EU AI Act compliance)
- ✅ Dependency graph mapped
- ✅ Effort breakdowns for top features
- ✅ Success metrics defined

**Key Additions (Feb 27, 2026):**
- ✅ Data Table View / Podgląd Załadowanych Danych (#18c) — P0, trust foundation + Strategia upsell


## Agent Skills Roadmap

### P1 (Week 3-4) ✅
- [x] gaproll-dashboard-architect
- [x] eu-compliance-legal-engine
- [x] seo-content-machine
- [ ] synthetic-qa-grazyna
- [ ] ruthless-mvp-prioritizer

### P2 (Week 5-6)
- [ ] devsecops-compliance-auditor
- [ ] legal-doc-generator-pl
- [ ] xml-jpk-stream-parser

### P3 (Week 8+)
- [ ] enterprise-architecture-reviewer
- [ ] partner-portal-orchestrator

### P4-P5 (Post-PMF)
- [ ] cloud-finops-controller
- [ ] gtm-launch-orchestrator
- [ ] vc-pitch-roaster
- [ ] red-teaming-strateg