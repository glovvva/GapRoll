# GapRoll — Strategic Bible
## Vision, Roadmap & Product Requirements (Single Source of Truth)

**Last Updated:** 2026-03-08  
**CRITICAL UPDATES:** Rebrand, EVG→Compliance, Pricing 99-1599 PLN, Invoice Automation, Realistic Targets, API-First Architecture, MCP Server Readiness, GTM Strategy + paygapnews.pl Blueprint v3.0  
**Previous Name:** PayCompass (sunset Feb 14, 2026)  
**Rule:** EVERY feature proposal must be checked against this file first.

---

## 1. One-Line Vision

> GapRoll transforms EU pay transparency compliance from a 3-week Excel nightmare into a 15-minute wizard — an API-first platform powered by internal Agents (Hunter, Guardian, Analyst) and open for external agent integration via MCP protocol.

---

## 2. Strategic Pillars

| Pillar | Description | Non-Negotiable |
|--------|-------------|----------------|
| **EU-First** | Native support for Directive 2023/970 (Art. 4, 7, 9, 16) | Every feature must map to an Article |
| **RODO-by-Default** | Automatic PII masking, N<3 suppression, audit trail | Never display unmasked PII |
| **Polish-Market Moat** | B2B Equalizer (UoP↔B2B), ZUS 2026 rates, KRS/CEIDG integration | No "US-centric" assumptions |
| **Lean Stack** | Next.js 15 + Python (FastAPI) + Supabase + Hetzner | See 04_TECH_CONSTRAINTS |
| **Compliance-First AI** | LangGraph (deterministic), HITL for high-risk, no black boxes | EU AI Act Art. 14 compliance |
| **Data Moat Strategy** | 99 PLN entry = viral adoption → largest Polish wage dataset → defensibility | Benchmark Engine critical |
| **API-First Platform** | Every feature is an API endpoint first, UI second. Agent-ready architecture for enterprise MCP integration | See 12_API_FIRST_ARCHITECTURE.md |

---

## 3. Target Persona

**Primary:** Grażyna — Senior HR/Payroll Manager (see 03_PERSONA_GRAZYNA.md)

**Key Characteristics:**
- Buys for compliance, not innovation
- Needs wizard mode, not discovery mode
- Trusts citations (podstawa prawna), not AI confidence scores
- **CRITICAL:** Won't buy without EVG Manual Override (zero trust in AI, high sense of agency)
- Fears PIP audit, needs legal safety (every metric cited to Art. X)

---

## 4. Core Modules

### 4.1 Data Vault (RODO Shield) — **COMPLIANCE TIER**
- PII auto-detection → masking when N < 3
- Multi-tenancy via RLS (Supabase)
- Audit log for all data operations
- EU data residency (Hetzner Germany/Finland)

### 4.2 Art. 16 Reporting Pack — **COMPLIANCE TIER**
- Quartile analysis (4 pay quartiles × gender)
- Component gap analysis (base / variable / allowances)
- Joint Pay Assessment Alert (triggers when gap > 5%)
- PDF export with legal citations (Art. 16 ust. 2)
- Worker reports (Art. 7): Employee can request comparison

### 4.3 EVG Engine (Equal Value of Work) — **COMPLIANCE TIER** ⚠️ MOVED FROM STRATEGIA (Feb 14)

**CRITICAL CHANGE:** EVG is MANDATORY per Art. 4 + Art. 7 → MUST be in Compliance tier (99 PLN)

**Why Mandatory:**
- **Art. 4 ust. 1:** Employers MUST have pay structures based on EVG criteria
- **Art. 7 ust. 1:** Employees can request reports comparing to "work of equal value" → firm MUST be able to calculate EVG
- **EU AI Act Art. 14:** High-risk AI systems require Human-in-the-Loop → Manual Override mandatory

**Features:**
- 4-axis scoring: Skills + Effort + Responsibility + Conditions (0–25 each, total 0-100)
- AI scoring (GPT-4o via Azure OpenAI, zero data retention)
- **MANDATORY Manual Override UI** (HITL requirement)
- Tolerance bands (±5 points = same EVG group)
- Pay gap per EVG group (quartile analysis by EVG)
- Audit trail: who changed what, when, why (EU AI Act compliance)

**UI Workflow:**
1. Grażyna uploads CSV → AI scores all positions
2. System shows: "Sprawdź wyniki EVG — możesz edytować każdy score ręcznie"
3. Grażyna clicks position → 4-axis breakdown modal
4. If AI wrong → Manual Override → justification field
5. System saves audit trail
6. Report generated with EVG grouping

**Legal Basis:**
- Art. 4 Dyrektywy UE 2023/970 (equal value of work definition)
- EU AI Act Art. 14 (high-risk AI systems)

### 4.4 B2B Equalizer (Polish-specific) — **COMPLIANCE TIER**
- ZUS cap (30× = 282,600 PLN/year in 2026)
- Leave correction (11/12 for B2B vs UoP)
- NET→GROSS conversion
- Factor: 1.2048 (UoP gross equivalent)
- **Critical:** 40%+ Polish firms use mixed contracts (UoP + B2B)

### 4.5 Invoice Automation — **COMPLIANCE TIER** 🆕 (Priority P0, Week 5-8)

**Purpose:** Zero manual invoicing (saves 12.5h/month at 50 customers)

**Stack:**
- **Fakturownia.pl:** Auto-generate invoices (API integration)
  - JPK_FA export (dla księgowości)
  - KSeF ready (e-faktury obowiązek od lipca 2026)
  - Cost: ~50 PLN/mies (plan START: 100 faktur/mies)
- **Przelewy24:** Polish payment gateway (#1 w Polsce)
  - BLIK, przelew, karty
  - Webhook → Fakturownia "zapłacone"
  - Cost: 1.49% transaction fee

**Flow:**
```
Customer signs up (Supabase)
  ↓
Webhook triggers (Supabase Edge Function)
  ↓
Fakturownia API: create invoice
  ↓
Email sent (invoice PDF + Przelewy24 payment link)
  ↓
Customer pays
  ↓
Przelewy24 webhook → Fakturownia "zapłacone"
  ↓
Email: "Dziękujemy, faktura opłacona"
```

**Timeline:**
- Week 5 (Mar 2-8): Setup Fakturownia + Przelewy24, configure templates
- Week 6 (Mar 9-15): Supabase integration, webhook development
- Week 7 (Mar 16-22): Testing (mock customers)
- Week 8 (Mar 23-29): Production ready
- **May 1:** First real invoice (zero manual work)

**ROI:** Saves 12.5h/month at 50 customers, cost 50 PLN/mies + 1.49% = break-even after 1 month

### 4.6 Root Cause Analysis — **STRATEGIA TIER** (NEW - Priority 30)

**Purpose:** Answer "WHY is the gap 12%?" with data-driven breakdown

**Output Example:**
```
Pay Gap: 12%

Root Causes (Art. 9 wyjaśnienie):
1. Seniority Gap (40%): Mężczyźni średnio 7.2 lat, kobiety 4.8 lat
2. Position Distribution (35%): Stanowiska senior 90% mężczyźni
3. Department Effect (15%): IT (wysokie płace) 75% mężczyźni
4. Contract Type (10%): B2B (wyższe płace) 20% mężczyźni vs 5% kobiet
```

**Value Proposition:**
- Grażyna can explain gap to CEO with data (not guesses)
- Budget approval: "Need 180k PLN to fix seniority gap" (backed by numbers)
- Art. 9 compliance: Gap >5% requires explanation

**Time Saved:** 1 week/year (vs manual pivot tables)

**Data Requirements (Strategia tier):**
- hire_date (for seniority calculation)
- position_title (for position distribution)
- department (for department effect)
- contract_type (for UoP vs B2B analysis)

**Timeline:** Apr 13-19 (Week 11)

### 4.7 Collaborative Review — **STRATEGIA TIER** (NEW - Priority 28)

**Purpose:** Multi-manager salary review workflow (eliminates Excel email ping-pong)

**Problem Solved:**
- Current process: Grażyna sends Excel → 5 managers email back proposals → version control nightmare
- Review cycles: 4 per year × 2.5 days each = 10 days wasted

**Features:**
- Each manager sees only their team
- Proposes raises (amount, justification)
- Real-time budget tracking (WebSocket)
- Conflict resolution (2 managers want to raise same person)
- Grażyna dashboard: approve/override all in one view
- Full audit trail (who proposed, who approved, timestamps)

**UI Workflow:**
1. Grażyna sets budget (e.g., 200k PLN) + deadline
2. System invites managers (email notifications)
3. Manager logs in → sees their team → proposes raises
4. Real-time budget bar: "150k PLN allocated / 200k PLN total"
5. Grażyna reviews all proposals → approves/overrides
6. Export: CSV (who gets raise, how much) + PDF board report

**Value Proposition:**
- Firms with 5+ managers won't buy without this (enterprise blocker)
- Time saved: 10 days/year

**Data Requirements (Strategia tier):**
- manager_id (who manages whom)
- performance_rating (context for managers)
- job_level (for internal equity)

**Timeline:** Apr 27 - May 3 (Week 13)

### 4.8 Retention ROI Calculator — **STRATEGIA TIER**

**Formula:**
```
Annual_Savings = (Current_Turnover_F - Target_Turnover) × Female_Headcount × Avg_Recruitment_Cost
Budget_Needed = Solio Solver output (remediation cost)
ROI % = (Annual_Savings / Budget_Needed) × 100
```

**Example Sales Pitch:**
"Closing gap from 12% to 5% reduces female turnover 8% → 5%. 
With 50 women on staff, avg recruitment cost 30k PLN:
Savings: (8%-5%) × 50 × 30k = 45k PLN/year
Budget needed: 180k PLN (one-time)
ROI: 45k annually / 180k = 25% yearly return"

**Versions:**
- **v1 (Apr 12):** Simplified — user inputs recruitment cost manually
- **v2 (May 24):** Market comps — Benchmark Engine provides avg recruitment cost by industry

**Timeline:** Apr 12 (v1), May 24 (v2)

### 4.9 Solio Solver (Wage Adjustment) — **STRATEGIA TIER**

**Purpose:** Interactive budget modeling for remediation

**v1 (Mar 29):** Greedy optimization
- 6 constraints:
  1. Target gap (e.g., "reduce to 5%")
  2. Budget limit (e.g., "max 200k PLN")
  3. Locked employees (e.g., "don't touch CEO salary")
  4. Department filter (e.g., "only IT department")
  5. Min raise (e.g., "minimum 500 PLN to avoid insulting 50 PLN raises")
  6. Hard-coded values (e.g., "give Anna exactly 2000 PLN")
- Greedy algorithm: prioritizes lowest-paid women first
- Outputs: 3 optimal paths (different trade-offs)
- "Suggest alternative" button → 3 more paths with slightly higher budget
- Export: CSV (employee, current, new salary, diff) + PDF board report

**v2 (Jun 7):** AI-powered
- Natural language input: "Prioritize senior women in IT department"
- Guardian integration: Auto-generates Art. 7 justification for each scenario
- Predictive ROI: "Path A → estimated 18% retention improvement (saves 240k PLN/year)"

**Inspiration:** SolioAnalytics, PayAnalytics remediation engines

**Timeline:** Mar 29 (v1), Jun 7 (v2)

### 4.10 Benchmark Engine (Hybrid) — **STRATEGIA TIER**

**Strategic Importance:** DATA MOAT (largest Polish wage dataset by Q4 2026)

**v1 (Mar 22):** PDF parsing
- YOU (Bartek) provide free GUS/PARP/industry reports → 0 PLN cost
- Parser extracts tables (industry, position, salary ranges)
- ~10-20 reports initially
- Tech: Azure Cognitive Services OCR (free via MS Founders Hub credits)

**v2 (May 24):** Web scraping
- Pracuj.pl, NoFluffJobs salary ranges
- Rotating proxies (to avoid IP bans)
- Cost: ~500 PLN/month
- Ethical scraping: respect robots.txt, rate limits

**v3 (Q4 2026):** Crowdsourced
- Network effect: firms contribute anonymized data → get better benchmarks
- Strict RODO: N<3 masking, aggregate only, per-industry minimums
- Incentive: "Contribute data → unlock advanced benchmarks"

**Use Cases:**
- "Is our DevOps salary (8500 PLN) competitive?" → benchmark shows market avg 9200 PLN
- Retention ROI Calculator: market avg recruitment costs
- Smart Job Scorer: improves EVG auto-classification

**Timeline:** v1 Mar 22 (concurrent with Week 7), v2 May 24, v3 Q4

### 4.11 Partner Portal — **CRITICAL for Mar 15** (NEW)

**Purpose:** Enable biura rachunkowe to onboard their clients

**Why Critical:**
- 5 partners × 50 clients each = 250 end customers (vs 50 direct sales = 5x multiplier)
- Partners have existing trust relationships
- Must be ready BEFORE sales materials (can't pitch partnerships without portal)

**Features:**
- White-label option: rebrand as "Księgowość XYZ Compliance Pack"
- Revenue share: partner keeps 100-150 PLN/client, we get 49-199 PLN
- Automated client onboarding (API integration)
- Partner dashboard: client management, revenue tracking, MRR view
- Co-branded Art. 16 reports (partner logo + GapRoll logo)
- Tiered access: partner sees all clients, client sees only their data (RLS)

**Revenue Model:** See Section 8.2 (Partner Channel)

**Timeline:** Mar 2-15 (Week 5-6)

**Target:** 5 partner offices signed by May 1

### 4.12 Explainability System

**Purpose:** Make every metric understandable for Grażyna (see 08_EXPLAINABILITY_ROADMAP.md)

**Components:**
- InfoTooltip: hover → definition + legal basis
- CitationBadge: "⚖️ Art. 16 ust. 2 Dyrektywy UE 2023/970"
- ExplainableMetric: metric + tooltip + citation + "Co to oznacza?" expandable

**Phases:**
- Phase 1 (Feb 16-22): Dashboard tooltips + Art. 16 PDF export
- Phase 2 (Feb 23 - Mar 1): EVG modal (4-axis breakdown + manual override UI)
- Phase 3 (Mar 2-8): Compliance checklist + RODO summary + audit log export
- Phase 4 (Mar 9-15): Help Center (FAQ + Art. 7 template + glossary + video tutorials)

**Formal Polish Rules:**
- ✅ "Analiza wykazała..." (not "AI wykrył...")
- ✅ "Zgodnie z Art. X..." (every metric cited)
- ✅ "Raport wskazuje..." (formal tone)
- ❌ "Dashboard insights" (no anglicisms)

---

## 5. Agent System (Target Architecture)

| Agent | Role | Framework | Risk Level | Timeline |
|-------|------|-----------|------------|----------|
| **Hunter** | Lead discovery + outreach (Polish B2B) | LangGraph (Generator-Critic loop) | Medium | Mar 29 (v1) |
| **Guardian** | Legal/HR compliance assistant | LangGraph + GraphRAG | HIGH (EU AI Act) | Apr 12 |
| **Analyst** | Internal optimizer (DSPy, Reflexion) | LangGraph + DSPy MIPROv2 | Low | May 10 |

### Hunter Rules:
- **Discovery-Only Feb-Mar:** Build lead database, NO outreach until domain warmed
- **Warm-Up Apr-May:** Max 20 emails/day, monitor deliverability (target >95% inbox rate)
- **Scale Jun+:** 100 emails/day only if domain reputation >95%
- **Generator-Critic pattern:** 3 iterations max (prevent infinite loops)
- **Polish tone:** Formal ("Szanowna Pani"), no anglicisms, no "I hope this finds you well"
- **KRS/CEIDG integration:** Target by PKD codes (69.20.Z = accounting, 70.22.Z = consulting)
- **Lazy Loading:** KRS API (paid, ~1 PLN/query) only when lead score >70%
- **Humanizer:** Every message references specific detail (LinkedIn post, job listing, press mention)

### Guardian Rules:
- **Every response has `podstawa prawna`:** Legal citation (Art. X Dyrektywy / Kodeks Pracy Art. Y)
- **High-risk queries → HITL:** "Zwolnienie dyscyplinarne" = ALWAYS human approval
- **GraphRAG cross-reference:** Don't just keyword-match, follow graph edges (Art. X "wynika z" Art. Y)
- **Confidence <0.7 → needs_review:** Routes to HITL approval queue
- **Zero hallucination policy:** If unsure, say "Nie znalazłem jednoznacznej podstawy prawnej. Zalecam konsultację z radcą prawnym."
- **Tone:** Polite junior lawyer / experienced auditor (never casual)

### Analyst Rules:
- **Weekly DSPy MIPROv2 optimization:** Monitors Hunter & Guardian performance
- **Golden Datasets:** Minimum 50 examples per agent before any prompt optimization
- **Never auto-deploy:** Validate on holdout set, human approval required
- **Teacher model:** GPT-4o (expensive, high quality)
- **Student model:** GPT-4o-mini (production, 60% cheaper)
- **Cost tracking:** Tokens/day dashboard in LangSmith
- **Anomaly detection:** Alert if Guardian HITL rejection rate >20%

---

## 6. Execution Timeline (UPDATED Feb 14)

### Phase 0: Company Formation (Feb 14-22)

| Date | Milestone | Owner | Status |
|------|-----------|-------|--------|
| Feb 15 | S24 registration (Sp. z o.o.) | Bartek | ⏳ SCHEDULED |
| Feb 16 | PKO BP bank account (24-48h) | Bartek | ⏳ PENDING |
| Feb 16 | Benchmark v1 START (concurrent development) | Bartek | ⏳ TODO |
| Feb 18 | Domain purchase (gaproll.eu/.pl/.com) + Google Workspace | Bartek | ⏳ PENDING |
| Feb 19 | LinkedIn company page | Bartek | ⏳ TODO |
| Feb 20 | MS Founders Hub + Scaleway applications | Bartek | ⏳ TODO |
| Feb 22 | Domain warming START (SPF/DKIM/DMARC) | Bartek | ⏳ TODO |

### Satellite Domains
- **paygapnews.pl:** Blog SEO — Ghost CMS, target: 1 artykuł/tydzień od marca 2026
- **nopaygap.com:** Kalkulator luki płacowej — faza 3+ (maj-czerwiec 2026)

### Phase 1: Platform Baseline + Rebrand (Feb 23 - Mar 15)

| Week | Dates | Focus | Deliverables |
|------|-------|-------|--------------|
| 4 | Feb 23 - Mar 1 | **Rebrand Sprint** | Landing page copy update, Next.js codebase rebrand, email templates, social media assets |
| 5 | Mar 2-8 | **Critical Features** | EVG Override UI (HITL workflow), **Invoice Automation Setup** (Fakturownia + Przelewy24), Sales Materials (deck, one-pager, demo video), Onboarding Automation (n8n workflows), **Hetzner VPS setup + Coolify deploy Next.js landing**, **paygapnews.pl Ghost setup**, **Instantly.ai domain warming aktywny**. **paygapnews.pl:** Ghost CMS LIVE on Hetzner (Coolify deploy); 6 first articles generated by P2-seo-content-machine agent (Bartek approve only); Supabase leads table created + RLS configured; n8n lead capture workflow active (form → email with PDF checklist); Google Search Console configured, sitemap submitted. |
| 6 | Mar 9-15 | **MILESTONE 1** | Product-Ready: Streamlit sunset, Next.js production, Partner Portal live, Explainability complete, **Invoice automation integrated** |

### Phase 2: Strategia Features + Agents (Mar 16 - Apr 26)

| Week | Dates | Focus | Deliverables |
|------|-------|-------|--------------|
| 7 | Mar 16-22 | **Benchmark v1 + Marketing** | PDF parser (YOU provide GUS/PARP reports), LinkedIn content (3 posts/week), SEO strategy, paygapnews.pl blog (1 artykuł/tydzień). **paygapnews.pl:** n8n automated draft pipeline ACTIVE (scraping + GPT-4o + Ghost Admin API); Bartek weekly time on content: max 20 min (review + approve only). |
| 8 | Mar 23-29 | **Solio v1 + Blog** | Interactive budget modeling (6 constraints), paygapnews.pl blog (1 artykuł/tydzień), **Invoice automation PRODUCTION READY** |
| 9 | Mar 30 - Apr 5 | **Hunter Discovery + Webinar** | LangGraph discovery flow, Webinar #1: "EU Pay Transparency - Co musisz wiedzieć do 7 czerwca?" |
| 10 | Apr 6-12 | **Retention ROI + Guardian** | Calculator (simplified v1), Legal RAG ingestion (Kodeks Pracy → Weaviate), Accounting firm partnerships outreach |
| 11 | Apr 13-19 | **Root Cause Analysis** | Why-gap-exists breakdown, saves 1 week/year, Art. 9 compliance |
| 12 | Apr 20-26 | **MILESTONE 2: Alpha** | Agents integrated in UI, Root Cause live, Hunter drafts (human reviews & sends), **API v1 endpoints migrated to APIResponse envelope** (see 12_API_FIRST_ARCHITECTURE.md) |

### Phase 3: Collaborative + Beta (Apr 27 - May 31)

| Week | Dates | Focus | Deliverables |
|------|-------|-------|--------------|
| 13 | Apr 27 - May 3 | **Collaborative Review** | Multi-manager workflow, WebSocket real-time budget tracking, saves 10 days/year |
| 14 | May 4-10 | **Analyst + Domain Warming** | DSPy optimization, Domain reputation >95% validated |
| 15 | May 11-17 | **MILESTONE 3: Beta** | Pilot customers, Strategia tier compelling (40%+ conversion target), **MCP Server v1 live** (5-7 intent-based tools for enterprise agents) |
| 16 | May 18-24 | **Benchmark v2** | Web scraping (Pracuj.pl, NoFluffJobs), ~500 PLN/month operational cost |
| 17 | May 25-31 | **Stabilization** | Bug fixes, performance optimization, HITL workflow refinement |

### Phase 4: V1.0 Launch (Jun 1-14)

| Week | Dates | Focus | Deliverables |
|------|-------|-------|--------------|
| 18 | Jun 1-7 | **Solio v2 + Final Prep** | AI-powered remediation, Guardian justification integration, EU AI Act compliance audit |
| 19 | **Jun 8-14** | **🚀 V1.0 LAUNCH** | Hunter automation (cold email 100/day), **EU Directive deadline: Jun 7** (market urgency trigger) |

### Week 24 (Jul 1-7): Guardian Knowledge Evolution Decision Point

**Objective:** Evaluate Guardian performance data and decide on knowledge architecture upgrade.

**Decision Criteria:**
- If Phase 2 (Hybrid RAG) accuracy ≥85% → STOP, no further investment needed
- If Phase 2 accuracy <85% → Implement Phase 3 (Full Skill Graph)
- If Czech expansion confirmed → Implement Phase 3 (new legal graph for Czech law)

**Phase 3 Implementation (if triggered):**
- Migrate markdown files to full Skill Graph structure
- Add `00_INDEX.md` for each legal domain (Dyrektywa, Kodeks Pracy, RODO)
- Implement graph traversal in Guardian (read INDEX → follow wikilinks → retrieve exact files)
- Expected improvement: 90% → 95%+ accuracy
- Effort: 40h (1 week full-time)

**Deliverables:**
- Performance report: Guardian accuracy metrics (Apr-Jun data)
- Cost analysis: Token usage Phase 1 vs Phase 2
- Decision: GO/NO-GO on Phase 3
- If GO: Updated knowledge base structure + graph traversal code

### Key Dates Summary:

- **Feb 15:** Company formed
- **Mar 15:** Milestone 1 (Product-Ready, Invoice automation live)
- **Mar 16:** Bartek departs for Thailand (~9 weeks remote)
- **Mar 16:** paygapnews.pl — Ghost CMS live + 6 artykułów opublikowanych (SEO zegar startuje)
- **Apr 5:** Domain warming complete (week 7) — cold outreach Hunter odblokowany
- **May 1:** Manual sales START (warm network, 5 partner accounting firms)
- **May 1:** paygapnews.pl — 12+ artykułów live (SEO authority peak)
- **Jun 7:** EU Directive 2023/970 compliance deadline (market panic trigger)
- **Jun 8:** V1.0 Launch (Hunter automation, scale cold email)
- **Sep 2026:** SUCCESS MILESTONE (see Section 9)

### 6.5 paygapnews.pl — ToFu SEO Engine

**Purpose:** Organic traffic engine, lead capture, VSL distribution for all 3 personas (HR Manager, Biuro Rachunkowe, Kancelaria Prawna).

**Stack:** Ghost CMS (Hetzner/Coolify), n8n automation, Supabase leads table, OpenAI GPT-4o.

**Content Production Model:**
- **Bartek role:** APPROVER ONLY (5–10 min/article review, 20 min/week total).
- **Content generation:** P2-seo-content-machine (Cursor, batch) + n8n+GPT-4o (automated).
- **Bartek NEVER writes articles** — agent generates, Bartek approves.

**Three Phases:**
- **Phase 1 (before departure, Week 5):** 6 articles via Cursor batch prompt, Ghost CMS live.
- **Phase 2 (Thailand, Week 2–4):** n8n generates 2 drafts/week, Bartek approves 2× weekly.
- **Phase 3 (Week 5–8):** Full automation — n8n generates + publishes, Bartek weekly log review.

**Lead Magnet per Persona:**
- **HR Manager** → "Checklist zgodności — 12 kroków przed 7 czerwca 2026" (PDF).
- **Biuro Rachunkowe** → "Szablon oferty audytu luki płacowej dla klientów" (PDF).
- **Kancelaria Prawna** → "Architektura prawna audytu — bez ryzyka RODO" (PDF).

**PKE 2024 Compliance:** All forms collect explicit consent before any email is sent.

**KPIs by June 7, 2026:**
- 12+ articles published
- 8,000 monthly impressions (GSC)
- 300 email leads captured
- 30 trial starts attributed to paygapnews.pl

---

## 7. Competitive Position

| Feature | GapRoll Compliance (99 PLN) | GapRoll Strategia (199 PLN) | PayAnalytics | Syndio | Pequity |
|---------|-----------------------------|-----------------------------|--------------|--------|---------|
| **EU 2023/970** | ✅ Native | ✅ Native | ⚠️ Partial | ⚠️ Partial | ❌ |
| **RODO** | ✅ Built-in | ✅ Built-in | ❌ | ❌ | ❌ |
| **B2B Equalizer** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Polish Language** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **EVG Engine (AI + Override)** | ✅ **MANDATORY** | ✅ | ✅ | ✅ | ⚠️ Manual only |
| **Invoice Automation** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Root Cause Analysis** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Collaborative Review** | ❌ | ✅ | ✅ | ⚠️ Partial | ❌ |
| **Benchmark Engine** | ❌ | ✅ (v1: Mar 22) | ✅ | ✅ | ✅ |
| **Partner Channel** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **API / MCP Access** | ❌ | ✅ (agent-ready) | ❌ | ❌ | ❌ |
| **Enterprise SSO (SAML)** | Enterprise only | Enterprise only | ✅ (€1000+/mies) | ✅ (€800+/mies) | ❌ |
| **Price (Small firm)** | **99 PLN/mies** (~€22) | **199 PLN/mies** (~€44) | ~€1,100/mies | ~€800/mies | ~€1,250/mies |
| **Annual Cost** | 1,188 PLN (~€265) | 2,388 PLN (~€530) | ~€13,000 | ~€10,000 | ~€15,000 |
| **Savings vs Competitors** | **98% cheaper** | **96% cheaper** | - | - | - |

**Key Differentiators:**
1. **EVG in Compliance tier (99 PLN):** Competitors charge €1,000+/month for AI job evaluation
2. **Polish Market Moat:** B2B Equalizer, ZUS rates, KRS/CEIDG (competitors don't understand Polish labor law)
3. **Partner Channel:** Biura rachunkowe distribution (5 partners × 50 clients = 250 customers, competitors = direct sales only)
4. **Invoice Automation:** Built-in from day 1 (Fakturownia.pl integration)
5. **Data Moat:** Benchmark Engine (will have largest Polish wage dataset by Q4 2026)
6. **API-First + MCP Ready:** Enterprise agents (Claude, Copilot, custom AI) can query GapRoll programmatically. No competitor offers agent-to-platform integration in RegTech compliance.

---

## 7b. GTM Strategy — paygapnews.pl Content Engine

**Status:** Zatwierdzona strategia (2026-03-08). Wdrożenie: przed wylotem (Mar 16).

### Architektura lejka

```
paygapnews.pl (SEO+GEO ToFu)
  → Lead Magnet (PDF checklist per persona)
  → n8n: email z VSL GapRoll
  → Trial gaproll.eu
  → Paying customer
```

### Dwa filary SEO+GEO

Portal publikuje dwa typy treści — oba z GEO-formatem (Answer Nugget 40-60 słów, tabela Markdown, sekcja tradeoffs):

| Typ | Udział | Rola |
|-----|--------|------|
| SEO-fundament | 60% | Autorytet domeny, ruch organiczny, wiarygodność jako niezależne medium |
| Twardy Nabój | 40% | Dominacja LLM na zapytaniach decyzyjnych, trudne do skopiowania |

**Zasada "not make it obvious":** portal wygląda jak niezależne medium, nie mikrosajt. GapRoll pojawia się wyłącznie w bloku CTA na końcu artykułu.

### Plan 15 artykułów (tygodnie 1-8)

| Nr | Slug | Typ | Tydz. |
|----|------|-----|-------|
| 1 | dyrektywa-eu-2023-970-polska-firma-co-zrobic | SEO-fundament | 1 |
| 2 | art-16-raport-luka-placowa-kto-kiedy | SEO-fundament | 1 |
| 3 | kary-brak-raportu-luki-placowej | SEO+GEO | 2 |
| 4 | wartościowanie-stanowisk-evg-4-kryteria | SEO+GEO | 2 |
| 5 | odwrócony-ciężar-dowodu-pozew-pracowniczy | SEO+GEO | 3 |
| 6 | biuro-rachunkowe-nowa-usluga-luka-placowa | SEO+GEO | 3 |
| 7 | uc127-projekt-ustawy-co-zmienia | SEO-fundament | 4 |
| 8 | prawo-pracownika-informacja-wynagrodzenie-wzor | SEO+GEO | 4 |
| 9 | jak-wyliczyc-luke-placowa-excel-bledy-kwartyle | **Twardy Nabój** | 5 |
| 10 | wspolna-ocena-wynagrodzen-kiedy-grozi | SEO+GEO | 5 |
| 11 | firmy-150-pracownikow-kiedy-raportowac | SEO+GEO | 6 |
| 12 | matryca-ryzyka-kar-pip-kto-placi | **Twardy Nabój** | 6 |
| 13 | comarch-optima-symfonia-luka-placowa | **Twardy Nabój** | 7 |
| 14 | audyt-luki-placowej-koszt-zakres | SEO+GEO | 8 |
| 15 | consulting-hr-vs-oprogramowanie-3-opcje | **Twardy Nabój** | 8 |

### Techniczne GEO — obowiązkowe Day 1

- `llms.txt` na gaproll.eu i paygapnews.pl (AI-readable sitemap)
- JSON-LD `@type: Article` + `@type: FAQPage` w Ghost Code Injection
- `robots.txt`: odblokować `OAI-SearchBot` i `GPTBot`

### Decision Pages na gaproll.eu — Tajlandia

3 strony Gemini dla persona (/dla-hr, /dla-biur, /dla-kancelarii) — pisane pod GEO z tradeoffs. Realizacja: tydzień 5-6 Tajlandii.

### FAQ/Baza wiedzy na gaproll.eu — po paygapnews.pl

Realizacja: Tajlandia, po uruchomieniu paygapnews.pl i pierwszych leadach.

### VSL Machine — 3 wideo (Tajlandia)

| VSL | Persona | URL | CTA |
|-----|---------|-----|-----|
| VSL-A | Manager Biura Rachunkowego | /partner | Demo 10 min (Calendly) |
| VSL-B | Partner Kancelarii Prawnej | /kancelaria | Whitepaper Zero-Knowledge |
| VSL-C | HR Director SME | /hr | Darmowy Raport Ryzyka |

Kolejność produkcji: VSL-A → VSL-C → VSL-B.

### Pre-departure checklist (do Mar 16)

- [ ] Ghost CMS live na Hetzner/Coolify
- [ ] DNS paygapnews.pl w Cloudflare
- [ ] llms.txt na obu domenach
- [ ] JSON-LD w Ghost Code Injection
- [ ] 6 artykułów (1-6) — Cursor Tryb A, Bartek approve
- [ ] Supabase: tabela `leads` + RLS
- [ ] n8n: lead capture workflow aktywny
- [ ] Google Search Console + sitemap submitted
- [ ] PDF checklist HR (Canva, 1 strona)
- [ ] Test end-to-end: formularz → email z PDF

---

## 8. Revenue Model

### 8.1 Direct B2B (Companies buy directly)

**Tier Structure:** Compliance / Strategia × Small / Medium / Large

**Segmentation:**
- **Small:** <100 employees (Art. 9 threshold = 100, not 150)
- **Medium:** 100-249 employees
- **Large:** 250+ employees

**Naming:** Compliance / Strategia (NOT Basic/Advanced)
- **Rationale:** "Compliance" = must-have (Art. 9-16), "Strategia" = nice-to-have (analytics)

| Tier | Small (<100) | Medium (100-249) | Large (250+) |
|------|--------------|------------------|--------------|
| **Compliance** | **99 PLN/mies** | **299 PLN/mies** | **799 PLN/mies** |
| **Strategia** | **199 PLN/mies** | **599 PLN/mies** | **1,599 PLN/mies** |
| **Enterprise** | — | — | **Wycena indywidualna** (min 2,999 PLN/mies) |

**Pricing Philosophy:**
- **Entry (99 PLN):** Penetration pricing (viral adoption, data moat building)
- **2x jump (Compliance→Strategia):** Justified by time savings (3 weeks/year = 6000 PLN value, costs 2388 PLN/year = **ROI 251%**)
- **Progressive scaling:** Small→Large (3x, 6x, 16x multipliers based on complexity, headcount, audit risk)

**Enterprise Tier (Custom Pricing) — NEW Mar 2026:**
- **Target:** Firmy 250+ pracowników wymagające SSO/SAML, Directory Sync (SCIM), Audit Logs, SLA
- **Minimum:** 2,999 PLN/mies. Nigdy publiczna cena. Przycisk "Skontaktuj się" na landing page.
- **Typowe:** 4,999-9,999 PLN/mies (zależnie od headcount, modułów, SLA)
- **Auth:** Kinde Scale plan ($250/mies flat = unlimited SSO connections)
- **Uzasadnienie ceny (NIE COGS auth — Kinde flat fee):**
  - Security questionnaire: 4-8h pracy (~1,200 PLN jednorazowo)
  - Custom onboarding z IT klienta: 2-4h
  - DPA / umowa powierzenia danych: konsultacja prawna
  - SLA monitoring + dedykowany opiekun: ongoing
  - Audit logs export do SIEM: feature do zbudowania
- **Marża:** 85%+ (COGS auth = ~0 PLN per klient przy flat fee Kinde)
- **Sales flow:** Klient pyta o SSO → "Tak, wspieramy. Wycena indywidualna." → kontrakt → Kinde Scale upgrade (2-3 dni)

### 8.2 Feature Matrix

| Feature | Compliance | Strategia |
|---------|-----------|-----------|
| **Compliance (Art. 16, 7, 4, 9)** | | |
| Unlimited employees | ✅ | ✅ |
| Art. 16 Reporting (PDF) | ✅ | ✅ |
| **EVG Engine (AI + Manual Override)** | ✅ **MANDATORY** | ✅ |
| Worker Reports (Art. 7) | ✅ | ✅ |
| Fair Pay Line | ✅ | ✅ |
| B2B Equalizer | ✅ | ✅ |
| RODO Shield (N<3 masking) | ✅ | ✅ |
| **Invoice Automation** | ✅ | ✅ |
| **Analytics & Optimization** | | |
| Root Cause Analysis | ❌ | ✅ (saves 1 week/year) |
| Collaborative Review | ❌ | ✅ (saves 10 days/year) |
| Retention ROI Calculator | ❌ | ✅ |
| Solio Solver (remediation) | ❌ | ✅ |
| Benchmark Engine | ❌ | ✅ (Polish wage data) |
| Smart Job Scorer | ❌ | ✅ (EVG auto-classification) |
| Guardian Agent (legal Q&A) | ❌ | ✅ |
| **Support & Access** | | |
| Email support (48h) | ✅ | ✅ |
| Priority support (4h) | ❌ | ✅ |
| API Access (REST + MCP ready) | ❌ | ✅ (scoped keys, rate-limited) |
| WebSocket real-time | ❌ | ✅ |
| **Enterprise Security** | | |
| SSO / SAML 2.0 (Entra ID, Okta, Google) | ❌ | Enterprise tier only |
| Directory Sync (SCIM) | ❌ | Enterprise tier only |
| Audit Logs (SIEM export) | ❌ | Enterprise tier only |
| Dedicated support + SLA 99.9% | ❌ | Enterprise tier only |

**Data Requirements:**

**Compliance (4 fields MINIMUM):**
```csv
employee_id,salary_monthly_gross,gender,reporting_period
```

**Strategia (12 fields FULL):**
```csv
employee_id,salary_monthly_gross,gender,reporting_period,
position_title,department,hire_date,manager_id,
contract_type,employment_type,performance_rating,job_level
```

**Upsell Flow:**
1. Customer uploads 4 columns → Compliance report works ✅
2. See blurred preview: "🔓 Odblokuj Root Cause Analysis — dowiedz się DLACZEGO luka 12%"
3. Upgrade to Strategia → upload 8 more columns → full features unlocked
4. **Target conversion:** 50% (vs 35% industry baseline)

### 8.3 Partner Channel (Biura Rachunkowe)

**Model:** Hybrid (partner chooses what fits best)

#### Tier 1: Pay-per-Client (for small accounting offices)

| Volume | Price/Client/Month | Target Segment |
|--------|-------------------|----------------|
| 1-50 clients | **49 PLN** | Small offices (5-30 clients) |
| 51-150 clients | **39 PLN** | Medium offices (30-100 clients) |
| 151+ clients | **29 PLN** | Large offices (100+ clients) |

**Example:**
- Office with 30 clients pays: 30 × 49 PLN = **1,470 PLN/mies**
- Resells to clients at 149-199 PLN → **Margin: 100-150 PLN/client = 3,000-4,500 PLN/mies profit**

#### Tier 2: Fixed Unlimited (for medium-large offices)

- **1,999 PLN/mies** — unlimited clients
- **Break-even:** ~40 clients (1999 ÷ 49 ≈ 41)
- **Above 40 clients:** Fixed fee cheaper than per-client

#### Tier 3: White-Label Enterprise (for office networks)

- **4,999 PLN/mies** — full white-label + API access + MCP Server + SSO/SAML (Kinde) + dedicated support
- **Target:** Sieci biur (KPBR members, franchises with 100+ combined clients) + enterprise z własnymi agentami AI
- **Features:** Custom branding, REST API with scoped keys, MCP Server integration (agent-to-GapRoll), SSO/SAML + SCIM via Kinde, SLA guarantees
- **API-First details:** See 12_API_FIRST_ARCHITECTURE.md

**Why Hybrid Works:**
- **Small offices (5-30):** Choose per-client (low risk, pay 245-1470 PLN/mies)
- **Medium offices (30-100):** Choose fixed (1999 PLN < 1470-4900 PLN per-client cost)
- **Large networks (100+):** Choose white-label (brand as own service, enterprise support)

**Target:** 5 partner offices signed by May 1 → ~250+ end customers in pipeline

### 8.4 Revenue Projections (Conservative)

**2026 (slow growth, awareness building):**

| Quarter | MRR Target | Customers | Assumptions |
|---------|------------|-----------|-------------|
| **Q1** | 0 PLN | 0 | Pre-launch |
| **Q2** | **10,000 PLN** | 60 total (10 direct + 2 partners w/ 100 end customers) | Manual sales start May 1, avg 100 PLN/customer |
| **Q3** | **25,000 PLN** | 150 total | Hunter automation Jun 8, 3x growth, word-of-mouth |
| **Q4** | **50,000 PLN** | 350 total | Scaling, market awareness, deadline passed (Jun 7) |

**2027 (explosive growth, post-deadline panic + word-of-mouth):**

| Quarter | MRR Target | Customers | Driver |
|---------|------------|-----------|--------|
| **Q1** | **100,000 PLN** | 700 | Late adopters (Jun 7, 2026 deadline panic spillover) |
| **Q2** | **200,000 PLN** | 1,400 | Network effect, Benchmark data moat advantage |
| **Q3** | **350,000 PLN** | 2,500 | Market saturation begins |
| **Q4** | **500,000 PLN** | 3,500 | **6M PLN ARR milestone** |

**Key Assumption:** Conservative 2026 (slow adoption pre-deadline), explosive 2027 (regulatory urgency peak post-deadline).

**Conversion Funnel:**
- **Trial:** 14 days, full Compliance tier access
- **Trial → Paid:** 15% (Q2 2026), 20% (Q4 2026), 25% (2027)
- **Compliance → Strategia:** 40% (Q2 2026 target), 50% (Q4 2026 target) — enabled by compelling Root Cause + Collaborative Review
- **CAC target:** < 200 PLN (organic + Hunter agent, no paid ads until PMF validated)
- **Monthly churn:** < 5% (Q2), < 3% (Q4), < 2% (2027)

---

## 9. Success Criteria

### V1.0 Launch (Jun 8, 2026) — REALISTIC TARGETS:

- [ ] **10-20 paying companies** (direct B2B)
- [ ] **2-3 partner offices** signed (~100-150 end customers in pipeline)
- [ ] **3,000-5,000 PLN MRR**
- [ ] Domain reputation >95% (email deliverability validated)
- [ ] < 5% monthly churn
- [ ] Art. 16 feature adoption >80% within 7 days (users generate report immediately)
- [ ] Zero RODO violations or data breaches
- [ ] EU AI Act compliance audit passed (HITL workflow documented)
- [ ] **Invoice automation live** (zero manual invoicing)

**Rationale:** 1-2 months manual sales (May-Jun) = realistically 10-20 direct conversions + 2-3 partner pilots

---

### SUCCESS MILESTONE (Sep 2026) — AMBITIOUS BUT ACHIEVABLE:

- [ ] **50 paying companies** (direct B2B)
- [ ] **5 partner offices** (~250+ end customers)
- [ ] **15,000-20,000 PLN MRR**
- [ ] Compliance → Strategia conversion: **40%+** (50% target by Dec)
- [ ] < 3% monthly churn
- [ ] Hunter automation proven: 100+ cold emails/day, >15% response rate
- [ ] HITL approval queue <20% rejection rate (Guardian agent quality)
- [ ] Benchmark Engine v2 live (web scraping operational, 500 PLN/month cost)
- [ ] Partner Portal: 5 active partners generating recurring revenue

**Rationale:** 3 months full sales + automation (Jun-Aug) + word-of-mouth + EU deadline urgency (Jun 7 was market trigger)

---

### PMF Validation (Dec 2026):

- [ ] 100+ paying companies
- [ ] 50,000 PLN MRR
- [ ] NPS >40 (strong word-of-mouth)
- [ ] Organic growth >30% (referrals, not just Hunter)
- [ ] Strategia conversion >50%
- [ ] < 2% monthly churn

---

### Milestone 1 (Mar 15, 2026):

- [x] Product-ready: Streamlit sunset, Next.js production (done Feb 2026)
- [x] Partner Portal live (API functional, RLS configured) (done Feb 2026)
- [x] EVG Override UI complete (HITL workflow validated) (done Feb 2026)
- [x] Explainability complete (tooltips, citations, WCAG) (done Feb 2026)
- [x] Rebrand PayCompass → GapRoll (codebase) (done Feb 2026)
- [x] Data Table View (/dashboard/dane, inline editing, audit log) (done Feb 2026)
- [x] Root Cause Analysis (why-gap-exists breakdown) (done Feb 2026)
- [x] Solio Solver v1 (budget optimization, greedy algorithm) (done Feb 2026)
- [ ] Sales materials ready (deck, one-pager, templates, demo video)
- [ ] Onboarding automation live (n8n workflows functional)
- [ ] **Invoice automation integrated** (Fakturownia + Przelewy24 tested)

---
### 9.5 Exit Strategy — ERP Acquisition Targets

**Thesis:** GapRoll's primary exit vector is acquisition by a Polish/CEE ERP vendor seeking to plug the Pay Transparency compliance gap in their product suite. Compliance tools are "sticky" (low churn) and defensible (regulatory moat).

**Valuation Multiplier:** API-first SaaS platforms command 8-12x ARR (vs 3-5x for tool-only SaaS). MCP Server capability demonstrates platform-level architecture, making GapRoll attractive as an embeddable compliance engine within ERP ecosystems. See 12_API_FIRST_ARCHITECTURE.md for technical architecture.

**Primary Target: Symfonia (Accel-KKR / MidEuropa)**
- **Why:** Most aggressive acquirer in CEE. Recent buys: HRTec, Reset2, Cloud Planet, NextUp (Romania). Building "total employee lifecycle" ecosystem.
- **Market share:** ~25% of 50-500 segment (premium, compliance-conscious clients)
- **Integration:** REST WebAPI, ISV partner program available
- **CEE multiplier:** Symfonia→NextUp Romania = 2 markets with 1 relationship
- **Action (Q3-Q4 2026):** Apply to ISV program after 50 customers. Build Symfonia connector as acquisition signal.

**Secondary Target: Comarch (CVC Capital Partners)**
- **Why:** Recently delisted, PE-optimized. CVC wants sticky SaaS add-ons to protect Optima install base (~35% market share).
- **Risk:** On-prem dominated (90%), integration technically harder (hybrid SQL/API)
- **Action (2027):** Volume play — demonstrate shared client count to get attention.

**Tertiary Target: Asseco Solutions (CEE via Helios)**
- **Why:** Dominant in CZ+SK (Helios iNuvio >30%). Federation model = slow M&A.
- **Requirement:** €1M+ ARR minimum before serious conversations.
- **Action (2027+):** CEE expansion via Helios integration = 2 countries with 1 codebase.

**Pre-Conditions (before ANY ERP integration work):**
1. ≥50 paying customers (demand validation)
2. Customer survey: "Z jakiego systemu kadrowo-płacowego korzystacie?"
3. ≥3 customers explicitly request specific ERP connector
4. Pre-seed funding raised OR organic revenue covers 8-week sprint cost

**Source:** Gemini Deep Research — Polish & CEE ERP Ecosystem Analysis (Feb 2026)

-----------------------------

## 10. Strategic Lessons (Feb 13-14, 2026)

### From 4-Session Planning Marathon:

1. **Conservative > Optimistic:** Revenue projections slow 2026, explosive 2027 (deadline urgency effect)
2. **Data Moat = Defensibility:** Largest Polish wage dataset becomes strategic asset (Benchmark Engine critical)
3. **Domain Warming is CRITICAL:** 6 weeks mandatory before cold email (Hunter blocked until May)
4. **Partner Distribution > Direct Sales:** Biura rachunkowe = trusted relationships (5 partners × 50 clients = instant 250 customers)
5. **Pricing for Viral Adoption:** 99 PLN entry removes friction, maximizes data collection
6. **EVG is Compliance, not Premium:** Art. 4 + Art. 7 make EVG mandatory → MUST be in 99 PLN tier (Feb 14 reclassification)
7. **Explainability = Trust:** Every metric needs: definition + legal citation + interpretation (Grażyna won't buy black box)
8. **HITL = Non-Negotiable:** EU AI Act + Grażyna's zero trust = Manual Override mandatory for EVG
9. **Invoice Automation = Priority Zero:** 12.5h/month saved at 50 customers, cost ~50 PLN/mies = ROI after 1 month
10. **Realistic Targets:** Jun 8 = 10-20 customers (not 50!), Sep = 50 customers (aggressive but achievable)
11. **ERP Integration = Exit Signal, Not MVP Feature:** Strategically critical for acquisition (Symfonia/Comarch/Asseco) but operacyjnie przedwczesna before PMF. CSV-first → API-second. Validate demand with survey at 50 customers. (Source: Gemini ERP Report, Feb 2026)
12. **PESEL = Free Gender Detection:** 10th digit parity determines gender (Even=K, Odd=M). Implement in CSV parser — saves Grażyna one column of manual work. Zero cost, high UX impact.
13. **API-First = Zero Extra Cost, Massive Exit Value:** Designing endpoints as tools (not pages) costs nothing extra during development, but delivers 2-5x valuation multiplier. Every new endpoint uses APIResponse envelope with ComplianceContext. (Source: API-First Architecture Session, Feb 2026)
14. **Intent-Based Tool Grouping for MCP:** External agents should see 5-7 tools grouped by intent (analyze_pay_gap, score_positions, generate_report, simulate_budget, query_benchmark, ask_human, get_company_context), NOT 15+ raw endpoints. Based on Anthropic's Claude Code learnings. (Source: "Lessons from Building Claude Code" article analysis, Feb 2026)
15. **Progressive Disclosure in API Responses:** Return summary + available_drilldowns. Let the agent decide what to explore deeper. Don't dump everything in one response. (Source: Claude Code article, Feb 2026)
16. **Kinde zastępuje Supabase Auth CAŁKOWICIE.** Nie dual-provider. Jeden system = Kinde Free (MŚP, $0) + Kinde Scale (Enterprise, $250/mies flat). Przy 10 klientach enterprise: Kinde $250/mies vs WorkOS $2,500/mies. Supabase zostaje TYLKO jako database. (Source: WorkOS vs Kinde analysis, Mar 2026)
17. **Enterprise tier = custom pricing, min 2,999 PLN/mies.** Uzasadnienie: czas obsługi (security questionnaire 8h, custom onboarding 4h, SLA, DPA), NIE COGS auth. Publiczna cena zabija negocjacje. (Source: Enterprise Auth session, Mar 2026)
18. **Migruj auth TERAZ (0 klientów), nie PÓŹNIEJ (100 klientów).** Dual-system = permanentny overhead. "Supabase Auth już stoi" = sunk cost fallacy. Łatwiej zmienić bez klientów. (Source: Enterprise Auth session, Mar 2026)
19. **FastAPI = jedyny gateway do danych po migracji Kinde.** Frontend → Kinde session → API call → FastAPI (Kinde JWT validation) → Supabase (service_role_key). Eliminuje klasę bugów (session desync, cookie conflicts). Spójne z API-First. (Source: Enterprise Auth session, Mar 2026)
20. **paygapnews.pl content is 100% agent-generated. Bartek is approver only.** Never assign article writing to Bartek — use P2-seo-content-machine (Cursor) or n8n+GPT-4o. Manual writing = scope creep for solo founder with 9 days before departure. (Source: GTM session, Mar 2026)

---

**END OF 01_STRATEGY.md**

**Next Review:** March 1, 2026 (after Milestone 1)

**Critical Changes This Version (Feb 28, 2026):**
- ✅ API-First Platform added as 7th Strategic Pillar
- ✅ MCP Server readiness added to timeline (Milestone 3)
- ✅ New file: 12_API_FIRST_ARCHITECTURE.md (response envelope, scopes, MCP tools, checklist)
- ✅ Exit strategy updated with API-First valuation multiplier (8-12x ARR)
- ✅ 3 new Strategic Lessons (13-15): API-First, Intent-Based Tools, Progressive Disclosure

**Critical Changes (Feb 14, 2026):**
- ✅ Rebrand PayCompass → GapRoll
- ✅ Pricing €49-199 → 99-1599 PLN (Compliance/Strategia)
- ✅ **EVG moved to Compliance tier** (was Strategia) — BIGGEST CHANGE
- ✅ Partner Channel added (hybrid: per-client/fixed/white-label)
- ✅ Invoice Automation added (Fakturownia.pl, Week 5-8, Priority P0)
- ✅ Timeline accelerated (Milestone 1 = Mar 15, Partner Portal = Mar 15)
- ✅ Root Cause + Collaborative Review added to Strategia
- ✅ Realistic targets: Jun 8 = 10-20 customers, Sep = 50 customers
- ✅ Core Modules expanded (12 modules total)
- ✅ Revenue projections updated (conservative 2026, explosive 2027)
