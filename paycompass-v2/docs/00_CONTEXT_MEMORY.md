# GapRoll — Context Memory
## Distilled Wisdom & Operational State

**Last Updated:** 2026-02-14  
**Rule:** Update this file at the END of every working session.

---

## 1. Project Phase

| Dimension | Status |
|-----------|--------|
| **Current Phase** | Phase 0 — Company Formation (Feb 14-22) |
| **Sprint Focus** | S24 registration (Feb 15) → PKO BP account (Feb 16) → Domains (Feb 18) → MS Founders Hub (Feb 20) |
| **Blocking Risk** | Domain email required for MS Founders Hub ($150k credits) — CANNOT apply without @gaproll.eu email |
| **Next Milestone** | Milestone 1: Platform Baseline (Mar 15, 2026) — Product-Ready for paying customers |
| **Critical Path** | Spółka (Feb 15) → Bank (Feb 16) → Domains (Feb 18) → Invoice setup (Mar 2-8) → Sales materials (Mar 8) → Partner Portal (Mar 15) |

---

## 2. Business Foundations

### 2.1 Legal Entity
- **Structure:** Sp. z o.o. (Polish LLC)
- **Registration:** S24 online platform (not notariusz) — instant registration
- **Expected Date:** Feb 15, 2026
- **Bank:** PKO BP (24-48h account opening, not 1 week)
- **Cost:** ~1,500 PLN (KRS registration + notary fees covered by S24)

### 2.2 Domain Strategy
**Primary Domains:**
- gaproll.eu (main brand, EU focus)
- gaproll.pl (Polish market)
- gaproll.com (international expansion future)

**Satellite Domains:**
- **paygapmonitor.pl:** SEO shield (blog, case studies, industry reports, organic traffic)
- **nopaygap.com:** Micro-tool strategy (pay gap calculator, viral growth hack — Phase 3+, reservation only Feb 18)

**Purchase Date:** Feb 18 (after bank account opened)
**Registrar:** OVH or nazwa.pl
**Email:** Google Workspace free tier (bartek@gaproll.eu)

### 2.3 Funding Applications

**Microsoft for Startups Founders Hub:**
- **Value:** $150,000 Azure credits (2-year validity)
- **Status:** Prerequisites met by Feb 20 (spółka ✓, domain ✓, LinkedIn page ✓)
- **Submit Date:** Feb 20, 2026
- **Expected Approval:** Mar 10, 2026
- **Probability:** 85% (HIGH) — B2B SaaS, EU compliance focus, clear Azure OpenAI use case
- **Use Cases:**
  - Azure OpenAI Service (GPT-4o for agents) — $60k value over 2 years
  - Bing Search API (Hunter lead discovery) — $12k value
  - Azure Cognitive Services (OCR for Benchmark PDF parsing) — $5k value

**Scaleway Startup Program:**
- **Value:** €2,000-5,000 credits
- **Submit Date:** Feb 20, 2026
- **Expected Approval:** Mar 5, 2026
- **Probability:** 60% (MEDIUM) — we're not AI/ML heavy
- **Use Cases:**
  - Object Storage (Supabase backups) — ~€20/month
  - GPU instances (future custom model training)
- **Alternative if rejected:** Hetzner Storage Boxes (€3.81/month for 1TB)

### 2.4 Naming Rationale (PayCompass → GapRoll)

**Why GapRoll:**
- "Gap" = luka płacowa (immediately clear what we do)
- "Roll" = automatyzacja/łatwość (rolling out compliance)
- Better SEO (people search "pay gap", not "pay compass")
- No confusion with financial/navigation products

**Effective Date:** Feb 14, 2026
**Rebrand Sprint:** Feb 23 - Mar 1 (Week 4)

---

## 3. What Has Been Built (Streamlit MVP)

✅ **CSV Upload + auto-detect separator** (Polish `;` support)  
✅ **Column Mapping Wizard** (manual selectbox)  
✅ **Pay Gap Calculation** (median M/F, per EVG group)  
✅ **Fair Pay Line** (Plotly scatter + regression)  
✅ **Art. 16 Reporting** (quartile analysis, component gaps)  
✅ **B2B Equalizer** (UoP ↔ B2B normalization, ZUS 2026 rates)  
✅ **RODO Shield** (masking when N < 3, audit trail)  
✅ **PDF Export** (Art. 7 report via ReportLab)  
✅ **Multi-tenancy** (Supabase RLS: org → project → user)  
✅ **Authentication** (Supabase Auth, email/password)  
✅ **AI Job Scoring** (GPT-4o, 1-100 scale)  
✅ **Landing Page (Streamlit)** (Hero + CTA)  
✅ **Next.js Landing + Dashboard** (parallel track, same Supabase DB)

---

## 4. What Is NOT Built Yet

❌ **EVG Manual Override UI** (CRITICAL — must be in Milestone 1, Mar 8)  
❌ **Partner Portal** (CRITICAL — must be live by Mar 15)  
❌ **Invoice Automation** (Fakturownia.pl integration — Week 5-8)  
❌ **Root Cause Analysis** (Strategia tier — Apr 13-19)  
❌ **Collaborative Review** (Strategia tier — Apr 27 - May 3)  
❌ **Solio Solver** (budget modeling — Mar 29 v1, Jun 7 v2)  
❌ **Retention ROI Calculator** (Apr 12 v1, May 24 v2)  
❌ **Benchmark Engine** (Mar 22 v1 PDF parsing, May 24 v2 scraping)  
❌ **Agent Hunter** (LangGraph discovery Mar 29, outreach Jun 8)  
❌ **Agent Guardian** (GraphRAG legal assistant Apr 12)  
❌ **Agent Analyst** (DSPy self-improvement May 10)  
❌ **HITL Approval Queue** (Next.js admin panel Apr 26)  
❌ **WebSocket streaming** (for agent responses)  
❌ **SSO / SAML / Azure AD** (Phase 3-4, Enterprise tier)  
❌ **White-label / custom branding** (Phase 3, Partner Portal enhancement)

---

## 5. Hard-Won Rules (Distilled from Lessons)

### 🔴 CRITICAL (violating these costs hours/days)

| # | Rule | Why |
|---|------|-----|
| 1 | Never render-then-stop. Always: content FIRST, `st.stop()` AFTER | Black screen bug. Cost: 2h. |
| 2 | Always set text color explicitly in dark mode (`!important`) | Invisible text. Cost: 1.5h. |
| 3 | `use_container_width=True`, never `use_column_width` | Deprecated API breaks. |
| 4 | `os.path.exists()` before any file I/O | Silent fallback to mock data. Cost: 2h. |
| 5 | `st.session_state` for nav, not URL params | State lost on refresh. |
| 6 | Initialize all session_state keys at module top | KeyError race conditions. |
| 7 | `st.rerun()`, never `st.experimental_rerun()` | Deprecated. |
| 8 | `on_click` callbacks, not conditionals after button | Double-click bug. |
| 9 | `st.form_submit_button`, never `st.button` inside `st.form` | Form doesn't submit. |
| 10 | `try-except` around all Supabase calls | Uncaught crashes. |

### ⚠️ DATA RULES

| # | Rule |
|---|------|
| 11 | `pd.read_csv(sep=None, engine='python')` for auto-detect separator |
| 12 | `df.columns = df.columns.str.strip()` immediately after load |
| 13 | `pd.to_numeric(errors='coerce').fillna(0)` for dirty salary data |

### 🔐 SECURITY RULES

| # | Rule |
|---|------|
| 19 | Never log passwords, API keys, PII |
| 20 | RLS at DB level, never client-side filtering |
| 21 | EVG Manual Override = MANDATORY (EU AI Act HITL requirement) |

### 📈 PERFORMANCE RULES

| # | Rule |
|---|------|
| 22 | `@st.cache_data` for expensive computations |
| 23 | Batch DB inserts (500–1000 records per call) |

---

## 6. Strategic Rules (NEW — Feb 13-14)

| # | Rule | Learned When |
|---|------|--------------|
| 24 | Domain warming 2-4 weeks BEFORE cold outreach (spam folder = death) | Feb 13 |
| 25 | Conservative revenue projections > optimistic (slow 2026, explosive 2027) | Feb 13 |
| 26 | Data moat = core defensibility (largest Polish wage dataset) | Feb 13 |
| 27 | Entry pricing for viral adoption (99 PLN removes friction) | Feb 13 |
| 28 | Partner distribution > direct sales (biura rachunkowe = trusted relationships) | Feb 13 |
| 29 | Explainability = trust (every metric: definition + citation + interpretation) | Feb 13 |
| 30 | **EVG is Compliance, not Premium** (Art. 4 + Art. 7 make it mandatory) | **Feb 14** |
| 31 | **Invoice automation = Priority Zero** (saves 12.5h/month at 50 customers) | **Feb 14** |
| 32 | **Realistic targets > ambitious** (Jun 8 = 10-20 customers, not 50) | **Feb 14** |

---

## 7. Key Metrics (Targets)

### V1.0 Launch (Jun 8, 2026) — REALISTIC:
| Metric | Target | Rationale |
|--------|--------|-----------|
| Paying Companies (Direct B2B) | 10-20 | 1-2 months manual sales (May-Jun) |
| Partner Offices Signed | 2-3 | Pilots, ~100-150 end customers |
| MRR | 3,000-5,000 PLN | Avg 100 PLN/customer × 30-50 total |
| Domain Reputation | >95% | Email deliverability validated |
| Monthly Churn | <5% | Early adopters, high engagement |
| Art. 16 Adoption | >80% within 7 days | Users generate report immediately |
| RODO Violations | 0 | Compliance mandatory |
| Invoice Automation | Live | Zero manual invoicing |

### SUCCESS MILESTONE (Sep 2026) — AMBITIOUS:
| Metric | Target | Rationale |
|--------|--------|-----------|
| Paying Companies (Direct B2B) | 50 | 3 months full sales + automation |
| Partner Offices | 5 | ~250+ end customers |
| MRR | 15,000-20,000 PLN | Avg 100 PLN × 150-200 total |
| Compliance → Strategia | 40%+ | Root Cause + Collaborative compelling |
| Monthly Churn | <3% | PMF signals |
| Hunter Automation | 100+ emails/day, >15% response | Agent proven |
| Benchmark v2 | Live | Web scraping operational |

### PMF Validation (Dec 2026):
| Metric | Target |
|--------|--------|
| Paying Companies | 100+ |
| MRR | 50,000 PLN |
| NPS | >40 (strong word-of-mouth) |
| Organic Growth | >30% (referrals) |
| Strategia Conversion | >50% |
| Monthly Churn | <2% |

---

## 8. Recent Updates (Session Changelog)

### Session A: Rebranding & Revenue Model (Feb 13, 2026)
**Duration:** ~3h  
**Key Decisions:**
- ✅ Rebrand PayCompass → GapRoll (effective Feb 14)
- ✅ Pricing finalized: 99-1599 PLN (Compliance/Strategia × Small/Medium/Large)
- ✅ Partner Channel designed: Hybrid (per-client 49/39/29 PLN, fixed 1999 PLN, white-label 4999 PLN)
- ✅ Timeline updated: Company formation Feb 15-16, bank Feb 16-18, domains Feb 18
- ✅ Satellite domain strategy: paygapmonitor.pl (SEO), nopaygap.com (micro-tool Phase 3+)

**Files Updated:** 01_STRATEGY.md (revenue model Section 8)

---

### Session B: Explainability Roadmap (Feb 13, 2026)
**Duration:** ~2h (integrated from separate chat)  
**Key Decisions:**
- ✅ Created 08_EXPLAINABILITY_ROADMAP.md (Grażyna-focused UX)
- ✅ UI patterns defined: InfoTooltip, CitationBadge, ExplainableMetric
- ✅ Formal Polish guidelines (no anglicisms, legal citations mandatory)
- ✅ 4 Phases mapped to timeline (Feb 16 - Mar 15)
- ✅ Accessibility: WCAG AA compliance (contrast 4.5:1, keyboard nav)

**Files Created:** 08_EXPLAINABILITY_ROADMAP.md

---

### Session C: Product Vision & Feature Backlog (Feb 13, 2026)
**Duration:** ~2.5h  
**Key Decisions:**
- ✅ Feature inventory: 25 features catalogued (Built, Queued, Backlog, Rejected)
- ✅ Priority Matrix: Impact × Effort scoring → Priority formula
- ✅ Timeline accelerated:
  - Partner Portal → Mar 15 (was Q3!) — CRITICAL for sales materials
  - Benchmark v1 → Mar 22 (concurrent development starts Feb 16)
  - Solio Solver v1 → Mar 29
- ✅ 2 NEW features added to Strategia:
  - **Root Cause Analysis** (Priority 30) — "WHY is gap 12%?" saves 1 week/year
  - **Collaborative Review** (Priority 28) — Multi-manager workflow, saves 10 days/year
- ✅ ROI Strategia tier: 251% (saves 3 weeks/year = 6000 PLN value, costs 2388 PLN/year)

**Files Created:** 09_FEATURE_BACKLOG.md

---

### Session D: Infrastructure & Funding (Feb 14, 2026)
**Duration:** ~2h  
**Key Decisions:**
- ✅ Hosting: Hetzner + Coolify (€12.90/mies vs €40-60 Vercel = 70% savings)
- ✅ Funding apps roadmap:
  - MS Founders Hub: $150k Azure credits (submit Feb 20, approval Mar 10, probability 85%)
  - Scaleway: €2-5k credits (submit Feb 20, approval Mar 5, probability 60%)
- ✅ Automation: n8n.io cloud SaaS (€20/mies, 4 workflows)
- ✅ Stealth mode protocols: Red lines defined (no personal LinkedIn, no corpo laptop/email)
- ✅ Deployment timeline: Feb 25 rent VPS → Mar 1 production deploy

**Files Created:** 10_INFRASTRUCTURE_SETUP.md

---

### Session E: Strategia Tier Analysis (Feb 14, 2026)
**Duration:** ~1.5h  
**Key Decisions:**
- ✅ **EVG RECLASSIFICATION:** Moved from Strategia → Compliance tier
  - **Why:** Art. 4 + Art. 7 make EVG MANDATORY for compliance
  - **Impact:** Main sales argument: "99 PLN = FULL compliance including AI job evaluation"
  - **Competitive:** PayAnalytics €1,100/mies vs GapRoll 99 PLN = **98% cheaper**
- ✅ Data requirements mapped:
  - Compliance: 4 fields minimum (employee_id, salary, gender, period)
  - Strategia: 12 fields full (+ position, dept, hire_date, manager_id, contract_type, etc.)
- ✅ Upsell flow designed: Upload 4 → see blurred preview → upgrade → upload 8 more
- ✅ Target conversion: 50% Compliance→Strategia (vs 35% baseline)

**Files Created:** 11_STRATEGIA_TIER_ANALYSIS.md

---

### Session F: Invoice Automation & Realistic Targets (Feb 14, 2026)
**Duration:** ~30 min  
**Key Decisions:**
- ✅ **Invoice Automation = Priority P0** (moved from "post-PMF" to Week 5-8)
  - **Why:** 12.5h/month wasted at 50 customers, cost ~50 PLN/mies = ROI after 1 month
  - **Stack:** Fakturownia.pl + Przelewy24 (Polish payments, BLIK, KSeF ready)
  - **Timeline:** Mar 2-29 (setup, integration, testing, production)
- ✅ **Realistic Targets:** Jun 8 = 10-20 customers (not 50!), Sep = 50 customers
  - **Rationale:** 1-2 months manual sales ≠ 50 conversions, Sep more achievable

**Files Updated:** 01_STRATEGY.md (Module 4.5, Timeline, Success Criteria)

---

### Session G: Explainability System Implementation (2026-02-14)

**Duration:** 6h  
**Sprint:** Week 2/16 — Migration Streamlit → Next.js

**Completed:**
1. ✅ Implemented explainability components (CitationBadge, ExplainableMetric, InfoTooltip, ComplianceAlert)
2. ✅ Fixed WCAG contrast issues (CitationBadge: 3.71:1 → 4.88:1 via dark text on blue)
3. ✅ Fixed RODO logic bug (per-gender masking instead of entire group)
4. ✅ Translated all UI to Polish (Dashboard, Pay Gap, EVG, Art. 16)
5. ✅ Fixed GPT-4o prompt for Polish EVG justifications
6. ✅ Integrated components in Dashboard (3 metrics, responsive grid)
7. ✅ Fixed CitationBadge layout (no overlap with values/labels)

**Lessons Learned:**
- LESSON 29: Next.js 15 cache requires hard restart + rm -rf .next (not just refresh)
- LESSON 30: FastAPI must run with venv activated (.\venv\Scripts\Activate.ps1)
- LESSON 31: Database cache persists after code changes - must clear or test with new data
- LESSON 32: WCAG contrast check BEFORE implementation saves rework time
- LESSON 33: Polish i18n requires context (formal vs. informal) - "Stanowisko X wymaga..." not "Position X requires..."

**Blockers Resolved:**
1. Frontend-only changes cached → Solution: rm -rf .next + restart
2. Backend ECONNREFUSED → Solution: venv activation required
3. GPT-4o prompt in English despite Polish instruction → Solution: Cache clear in Supabase
4. CitationBadge overlap → Solution: 2-line layout (badge under label)

**Next Session Goals:**
1. Add "Refresh Scoring" button (clear cache per position)
2. Verify Pay Gap RODO logic with Analyst row (Mediana M visible, K masked)
3. Backend integration: FastAPI endpoints for Dashboard metrics
4. Mobile testing (< 640px) - verify responsive grid

**Metrics:**
- Components created: 4 (CitationBadge, ExplainableMetric, InfoTooltip, ComplianceAlert)
- Issues fixed: 4 (overlap, RODO, i18n, EVG justifications)
- WCAG compliance: 100% (all ≥ 4.5:1)
- Lines of code: ~800 (frontend + backend)

---

### Session: 2026-02-14 — Explainability System + RODO Fixes + Backend Integration

**Duration:** 6.5h  
**Sprint:** Week 2/16 — Migration Streamlit → Next.js + Python  
**Participants:** Bartek + Claude (CPTO)  
**Phase:** Milestone 1 — Platform Baseline (target: 1 Mar 2026)

#### Completed Tasks

**1. Explainability Components (4 components created):**
- ✅ CitationBadge.tsx
  - 3 variants: info (blue), warning (amber), critical (red)
  - WCAG AA compliant: 4.88:1 contrast (dark text #0f172a on colored bg)
  - Optional tooltip with full article text
  - Hover: scale(1.05) + shadow
  - Font: Inter Medium 12px
- ✅ ExplainableMetric.tsx
  - JetBrains Mono for numeric values (24px, bold)
  - CitationBadge positioned under label (no overlap)
  - Confidence badge when < 0.7: "Wymaga weryfikacji"
  - Expandable explanation tooltip
  - Layout: value on top, label below, badge underneath
- ✅ InfoTooltip.tsx
  - aria-label="Pomoc" for accessibility
  - Tooltip: bg-[var(--bg-secondary)], text-[var(--text-secondary)], 14px
  - Max-width: 300px
  - Re-export in components/ui/info-tooltip.tsx
- ✅ ComplianceAlert.tsx
  - Trigger: displays when payGapPercent > 5%
  - Severity: warning (5-10%), critical (>10%)
  - CTA: "Zobacz Plan Działania" → /solio-solver
  - Citation: Art. 9 Dyrektywy UE 2023/970
  - Formal Polish text with legal references

**2. WCAG AA Compliance:**
- Fixed CitationBadge (info) contrast: 3.71:1 → 4.88:1
- Added CSS variables: --accent-blue-fg, --accent-amber-fg, --accent-red-fg (#0f172a)
- All components verified: ExplainableMetric (12.35:1), InfoTooltip (10.94:1)
- Contrast audit documented in docs/outputs/contrast-audit.md

**3. RODO Logic Fix (Backend):**
- Changed from masking entire group to per-gender masking
- Implementation in apps/api/routers/analysis.py:
  - _should_mask_gender(count_male, count_female, gender) helper function
  - calculate_gap_by_position: mask only gender with N < 3
  - Art. 16 quartiles: separate median_male, median_female fields
- Example: Analyst (4M/0K) → Mediana M = 6500 PLN (visible), Mediana K = *** (masked), Luka % = RODO
- Applied to: Pay Gap per position, Art. 16 quartile analysis
- Tooltip: "Dane ukryte zgodnie z RODO (mniej niż 3 osoby w grupie)"
- Compliance: Art. 9 Dyrektywy UE 2023/970

**4. i18n Polish Translation:**
- Dashboard: "Total Employees" → "Liczba Pracowników", "Pay Gap" → "Luka Płacowa", "EVG Groups" → "Grupy EVG", "Reports" → "Raporty"
- Pay Gap: "Fair Pay Line" → "Linia Fair Pay", "Median Male/Female" → "Mediana (mężczyźni/kobiety)"
- EVG: "Skills/Effort/Responsibility/Conditions" → "Umiejętności/Wysiłek/Odpowiedzialność/Warunki", "Total Score" → "Wynik Całkowity"
- Art. 16: All headers and labels translated
- Full audit: docs/outputs/i18n-polish-audit.md

**5. GPT-4o Polish Justifications:**
- Updated EVG scoring prompt in apps/api/routers/analysis.py
- System message: "CRITICAL: Respond ONLY in Polish. Use formal business language."
- Format: "Stanowisko {position} wymaga [formalna polszczyzna]..."
- Examples added for Manager, Analyst, Developer
- Cleared Supabase cache (job_valuations table) via DELETE query
- Verified: All new justifications in formal Polish

**6. Dashboard Integration:**
- Added 3 ExplainableMetric components:
  - Luka Płacowa (Mediana): 23.5%, Art. 9 ust. 2, confidence 0.95
  - Luka w Kwartylu 4: 18.2%, Art. 16 ust. 1 lit. b, confidence 0.92
  - Wskaźnik Reprezentacji Kobiet (Zarząd): 33.3%, Art. 7 ust. 1, confidence 1.0
- ComplianceAlert at top (triggers when gap > 5%)
- Responsive grid: 1 col (mobile <640px) / 2 col (tablet 640-1024px) / 3 col (desktop >1024px)
- Layout: ComplianceAlert → Metrics Grid → Welcome Card → 4 Tiles

**7. Refresh Scoring Feature:**
- Backend: DELETE /analysis/evg-cache endpoint (apps/api/routers/analysis.py)
- Deletes from job_valuations WHERE user_id = current_user
- Auth required, returns {"ok": true, "message": "Cache wyczyszczony."}
- Frontend: Button "🔄 Odśwież Scoring" in EVG page header
- Confirmation dialog: "Czy na pewno chcesz odświeżyć scoring?"
- Loading state: disabled + "Odświeżanie..." + spinner
- Toast notifications: success/error messages
- After delete: clears scores table, next run fetches fresh data

**8. Dashboard Metrics API:**
- Backend: GET /analysis/dashboard-metrics (apps/api/routers/analysis.py)
- Returns 3 metrics with confidence scores:
  - Median gap: calculated from entire org, confidence 0.95 if N ≥ 30
  - Quartile 4 gap: top 25% earners, confidence 0.92 if N ≥ 10
  - Female representation: board positions, confidence 1.0 (exact count)
- RODO handling: confidence = 0.0 + explanation "(RODO: mniej niż 3 osoby)" if N < 3
- Cache: in-memory TTL 5 minutes, key = user_id
- Cache invalidation: invalidate_dashboard_cache() called after data upload
- Frontend: fetchWithAuth + loading skeleton + error handling
- Status calculation: good/warning/critical based on thresholds

**9. Layout Fixes:**
- CitationBadge repositioned under label (2-line layout, no overlap)
- Removed truncate from labels (full text visible)
- Badge padding adjustments for mobile responsiveness

#### Lessons Learned

- **LESSON 29:** Next.js 15 aggressive caching requires `rm -rf .next` + full dev server restart. Hard refresh (Ctrl+Shift+R) alone is insufficient for component changes.
- **LESSON 30:** FastAPI requires venv activation (`.\venv\Scripts\Activate.ps1`) before `uvicorn` command. Without venv, command not found error occurs.
- **LESSON 31:** Database cache (Supabase job_valuations) persists after code changes. Must DELETE rows or test with new positions to see updated GPT-4o outputs.
- **LESSON 32:** WCAG contrast audit BEFORE implementation saves 2-3h of rework. Use WebAIM Contrast Checker during design phase.
- **LESSON 33:** Polish i18n requires context awareness and formal business language. "Stanowisko X wymaga..." (formal) vs literal "Position X requires" translation.
- **LESSON 34:** Multi-line git commit messages in PowerShell require single-line format with semicolons or alternative quoting.
- **LESSON 35:** Backend API cache + frontend component cache can compound. Clear both layers when debugging data issues.

#### Blockers Resolved

1. **Frontend changes not visible after code modifications**
   - Symptom: UI still showing old values despite code changes
   - Root cause: Next.js .next cache directory
   - Solution: `rm -rf .next` + restart dev server (not just Ctrl+Shift+R)

2. **Backend ECONNREFUSED errors in Next.js proxy**
   - Symptom: "Failed to proxy http://localhost:8000" errors
   - Root cause: FastAPI not running or venv not activated
   - Solution: `cd apps/api` → `.\venv\Scripts\Activate.ps1` → `python -m uvicorn main:app --reload`

3. **GPT-4o returns English despite Polish system prompt**
   - Symptom: EVG justifications in English ("The Manager position requires...")
   - Root cause: Supabase cache (job_valuations) contained old English justifications
   - Solution: DELETE FROM job_valuations WHERE position IN ('Manager', 'Analyst', 'Developer')
   - Prevention: Test with new positions or add "Refresh Scoring" button for users

4. **CitationBadge overlapping metric values**
   - Symptom: Badge "Art. 9 ust. 2..." covering "23.5%" text
   - Root cause: absolute positioning with insufficient padding
   - Solution: Repositioned badge under label in 2-line layout (flex flex-col)

#### Metrics & KPIs

- **Components created:** 12 (4 explainability + 8 UI components)
- **Features shipped:** 9 (explainability, RODO, i18n, API, refresh, dashboard integration)
- **Issues fixed:** 4 (CitationBadge overlap, RODO per-gender, i18n Polish, EVG justifications)
- **Lines of code:** 2,936 insertions, 268 deletions (30 files modified)
- **WCAG compliance:** 100% (all components ≥ 4.5:1 contrast ratio)
- **EU compliance:** ✅ Art. 9, Art. 16, RODO N<3, EU AI Act (confidence scoring, HITL ready)
- **i18n coverage:** 100% Polish UI (Dashboard, Pay Gap, EVG, Art. 16)
- **Test coverage:** Manual testing on 4 pages (Dashboard, Pay Gap, EVG, Art. 16)
- **Performance:** API response time <200ms, cache TTL 5min, no N+1 queries

#### Files Modified

**Frontend (12 files):**
- components/explainability/CitationBadge.tsx (new)
- components/explainability/ExplainableMetric.tsx (new)
- components/explainability/InfoTooltip.tsx (new)
- components/explainability/ComplianceAlert.tsx (new)
- components/explainability/EVGScoreCard.tsx (new)
- components/ui/info-tooltip.tsx (new, re-export)
- app/dashboard/page.tsx (metrics integration)
- app/dashboard/paygap/page.tsx (i18n, RODO display)
- app/dashboard/evg/page.tsx (i18n, refresh button)
- app/dashboard/report/page.tsx (i18n)
- app/globals.css (CSS variables)
- components/dashboard/topbar.tsx (i18n)

**Backend (1 file):**
- apps/api/routers/analysis.py (RODO logic, GPT-4o prompt, dashboard metrics API, cache invalidation)

**Backend Upload (1 file):**
- apps/api/routers/upload.py (cache invalidation on data upload)

**Documentation (4 files):**
- docs/outputs/explainability-audit.md
- docs/outputs/explainability-fixed-summary.md
- docs/outputs/contrast-audit.md
- docs/outputs/i18n-polish-audit.md

**Other (12 files):**
- Login/register pages (bonus: apps/web/app/login/page.tsx, app/register/page.tsx)
- Auth forms (bonus: components/auth/login-form.tsx, register-form.tsx)
- UI components: dialog.tsx, tooltip.tsx, collapsible.tsx, dropdown-menu.tsx, slider.tsx, textarea.tsx, label.tsx, explainer-card.tsx
- API client: lib/api-client.ts
- Supabase client: lib/supabase/client.ts

#### Next Session Priorities

1. **Mobile Testing (10 min)**
   - Test responsive grid on < 640px (iPhone SE)
   - Verify CitationBadge layout on mobile
   - Screenshot Dashboard, Pay Gap, EVG on mobile

2. **Solio Solver Page (45 min)**
   - Create /dashboard/solio route
   - Implement budget calculator (target gap → required salary adjustments)
   - Fair Pay formula: Median × Gender Equity Factor
   - CSV export + PDF board report
   - Link from ComplianceAlert CTA

3. **Loading Skeletons Refinement (15 min)**
   - Replace basic skeletons with branded design
   - Add shimmer animation
   - Improve UX during API calls

4. **Pay Gap RODO Edge Cases (20 min)**
   - Test with N=2 for both genders (both masked)
   - Test with N=1 (edge case)
   - Verify tooltip appears on all masked cells

5. **Art. 16 Report RODO Testing (15 min)**
   - Verify quartile median M/K masking
   - Check footnote appears when any quartile has masked data
   - Screenshot for documentation

#### Technical Debt & Future Work

- Add unit tests for RODO masking logic (pytest for backend)
- Add E2E tests for Dashboard metrics API (Playwright)
- Implement proper error boundaries in React (ErrorBoundary component)
- Add retry logic for API calls (exponential backoff)
- Optimize Supabase queries (add indexes on user_id, position, organization_id)
- Add Sentry for error tracking (production monitoring)
- Implement feature flags for gradual rollout (LaunchDarkly or PostHog)
- Add analytics events (Posthog: track button clicks, page views, API errors)

#### Git Commit

```
[master edf73ce] feat(explainability): complete WCAG-compliant UI + RODO fixes + i18n Polish
30 files changed, 2936 insertions(+), 268 deletions(-)
```

**Commit hash:** edf73ce  
**Branch:** master  
**Push status:** Pending (not yet pushed to remote)

---

## 9. Next Actions (Feb 14-22)

### IMMEDIATE (This Week):
| Date | Action | Priority | Owner | Status |
|------|--------|----------|-------|--------|
| **Feb 15** | S24 registration (Sp. z o.o.) | P0 | Bartek | ⏳ SCHEDULED |
| **Feb 16** | PKO BP bank account | P0 | Bartek | ⏳ PENDING |
| **Feb 16** | Benchmark v1 START (PDF parser prototype) | P1 | Bartek | ⏳ TODO |
| **Feb 18** | Domain purchase (gaproll.eu/.pl/.com) | P0 | Bartek | ⏳ PENDING |
| **Feb 18** | Google Workspace setup (bartek@gaproll.eu) | P0 | Bartek | ⏳ PENDING |
| **Feb 19** | LinkedIn company page | P1 | Bartek | ⏳ TODO |
| **Feb 20** | MS Founders Hub application | P0 | Bartek | ⏳ TODO |
| **Feb 20** | Scaleway application | P1 | Bartek | ⏳ TODO |
| **Feb 22** | Domain warming START (SPF/DKIM/DMARC) | P0 | Bartek | ⏳ TODO |

### NEXT WEEK (Feb 23 - Mar 1):
- Rebrand sprint: Landing page copy, Next.js codebase, email templates
- Explainability Phase 1-2: Dashboard tooltips, EVG modal

### MARCH (Critical Month):
- Week 5 (Mar 2-8): EVG Override UI, Invoice automation setup, Sales materials
- Week 6 (Mar 9-15): **MILESTONE 1** — Product-Ready, Partner Portal live
- Week 7-8 (Mar 16-29): Benchmark v1, Solio v1, Marketing start

---

## 10. Current Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Domain blacklisted (no warming) | CRITICAL | High | 6-week mandatory warm-up (Feb 22 - Apr 5) |
| MS Founders Hub rejected | HIGH | Low (15%) | Backup: OpenAI API credits (apply Q3 if pre-seed raised) |
| Non-compete violation | CRITICAL | Medium | Stealth mode protocols (see 10_INFRASTRUCTURE_SETUP.md) |
| Manual invoicing bottleneck | HIGH | High (if not automated) | **RESOLVED** — Invoice automation Week 5-8 (Priority P0) |
| Unrealistic Jun targets demotivate | MEDIUM | Medium | **RESOLVED** — Targets adjusted: Jun 10-20, Sep 50 |
| PayCompass branding in codebase | MEDIUM | High | Rebrand sprint Week 4 (Feb 23 - Mar 1) |
| Partner Portal not ready for sales | HIGH | Medium | **RESOLVED** — Moved to Mar 15 (Week 6, Milestone 1) |

---

## 11. Tech Debt

| Item | Severity | Deadline | Owner |
|------|----------|----------|-------|
| PayCompass → GapRoll global find-replace | CRITICAL | Mar 1 | Bartek |
| Streamlit sunset (migration complete) | CRITICAL | Mar 15 | Bartek |
| EVG Manual Override UI (missing HITL) | CRITICAL | Mar 8 | Bartek |
| Invoice automation (manual = time sink) | **RESOLVED** | Mar 29 | Bartek |
| Partner Portal (sales blocker) | **RESOLVED** | Mar 15 | Bartek |
| Domain warming (cold email blocked) | IN PROGRESS | Apr 5 | Bartek |

---

## 12. Session Log Template

```
## Session [Number]: [Title]
**Date:** YYYY-MM-DD
**Duration:** Xh
**Focus:** [Primary goal]

### Decisions Made:
- [ ] Decision 1
- [ ] Decision 2

### Files Updated:
- [File name] (what changed)

### Blockers Identified:
- [Blocker description]

### Next Session Goals:
- [ ] Goal 1
- [ ] Goal 2
```

---

**END OF 00_CONTEXT_MEMORY.md**

**Next Update:** After Milestone 1 (Mar 15, 2026)

**Critical Updates This Version (Feb 14, 2026):**
- ✅ 8 Sessions logged (A–G + Session 2026-02-14); Session 2026-02-14: Explainability System + RODO Fixes + Backend Integration (6.5h)
- ✅ EVG reclassification documented (Strategia → Compliance)
- ✅ Invoice automation added to Next Actions (Priority P0)
- ✅ Realistic targets updated (Jun 10-20, Sep 50)
- ✅ Strategic Rules expanded (30 → 32 rules)
- ✅ Current Phase: Company Formation (Feb 14-22)
- ✅ Key Metrics updated with 3 milestones (Jun, Sep, Dec)
