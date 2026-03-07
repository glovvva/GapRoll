# GapRoll — Context Memory
## Distilled Wisdom & Operational State

**Last Updated:** 2026-02-27  
**Rule:** Update this file at the END of every working session.

---

## 1. Project Phase

| Dimension | Status |
|-----------|--------|
| **Current Phase** | Phase 1 — Platform Development (Feb 21 - Mar 15) |
| **Sprint Focus** | Milestone 1: Platform Baseline (Mar 15, 2026) |
| **Blocking Risk** | Must-have features DONE. Wiszą: kosmetyka, invoice automation, onboarding n8n. **paygapnews.pl NOT YET LIVE** (SEO clock not started — critical to fix before departure). |
| **Next Milestone** | Milestone 1: Platform Baseline (Mar 15, 2026) — Product-Ready for paying customers |
| **Critical Path** | ✅ Spółka (Feb 15) → ✅ Bank (Feb 16) → ✅ Domains (Feb 18) → Invoice setup (Mar 2-8) → Sales materials (Mar 8) → ✅ Partner Portal (Mar 15) |

---

## 2. Business Foundations

### 2.1 Legal Entity
- **Structure:** Sp. z o.o. (Polish LLC)
- **Registration:** ✅ ZAREJESTROWANA (S24, Feb 15-16, 2026)
- **Bank:** ✅ PKO BP — konto otwarte (Feb 16-18)
- **Domains:** ✅ gaproll.eu / gaproll.pl / gaproll.com zakupione (Feb 18)

### 2.2 Domain Strategy
**Primary Domains:**
- gaproll.eu (main brand, EU focus) ✅
- gaproll.pl (Polish market) ✅
- gaproll.com (international expansion future) ✅

**Satellite Domains:**
- **paygapnews.pl/eu:** SEO shield (blog, case studies, organic traffic)
- **nopaygap.com:** Micro-tool strategy (pay gap calculator — Phase 3+)

**Landing page Next.js na gaproll.eu** — prawie gotowa, do publikacji.

**Domain warming:** START od 1 marca przez Instantly.ai

**Email:** Google Workspace — bartek@gaproll.eu ✅

### 2.3 Funding Applications
**Microsoft for Startups Founders Hub:**
- **Value:** $150,000 Azure credits
- **Status:** Aplikacja złożona (Feb 20) — oczekiwanie na odpowiedź
- **Probability:** 85%

---

## 3. What Has Been Built (Next.js MVP — Stan na 2026-02-21)

### ✅ CORE PLATFORM (Production-ready)
- CSV Upload + auto-detect separator (Polish `;` support)
- Column Mapping Wizard
- Pay Gap Calculation (median M/F, per EVG group)
- Fair Pay Line (scatter + regression)
- Art. 16 Reporting (quartile analysis, component gaps)
- RODO Shield (masking when N < 3, audit trail)
- Multi-tenancy (Supabase RLS: user_id isolation)
- Authentication (Supabase Auth + middleware guard)
- AI Job Scoring (GPT-4o, 1-100 scale, Polish justifications)
- Dashboard Metrics API (GET /analysis/dashboard-metrics)

### ✅ EVG MANUAL OVERRIDE (Milestone 1 — Feb 21)
- EVGScoreCard.tsx — karta stanowiska z 4-osiowym breakdownem
- EVGDetailModal.tsx — modal z read-only AI scores + tolerance band
- ManualOverrideForm.tsx — formularz override (0-25 na oś, justification min 20 znaków)
- POST /evg/override endpoint — walidacja + zapis do evg_audit_log
- Audit trail: kto zmienił, kiedy, co i dlaczego
- Badge "Zmodyfikowano ręcznie" z datą na karcie
- Podstawa prawna: Art. 4 Dyrektywy UE 2023/970 + EU AI Act Art. 14 (HITL)

### ✅ PARTNER PORTAL v1 (Milestone 1 — Feb 21)
- /partner dashboard z MRR cards (Aktywni klienci, Twój MRR, Wypłata)
- ClientListTable — Nazwa firmy, NIP, Pracownicy, Tier, Status, Przychód
- OnboardClientForm — Nazwa, NIP (checksum validation), Email, Pracownicy (min 50), Tier
- POST /partner/onboard-client — NIP validation, Supabase invite, trial 14 dni
- GET /partner/clients, GET /partner/mrr
- Auth guard: middleware przekierowuje na /login jeśli brak sesji
- Revenue: Compliance = 50 PLN/klient, Strategia = 100 PLN/klient

### ✅ EXPLAINABILITY LAYER (Milestone 1 — Feb 21)
- InfoTooltip.tsx — ⓘ icon + Shadcn Tooltip z definicją i cytowaniem
- CitationBadge.tsx — pill badge "⚖️ Art. X Dyrektywy UE 2023/970"
- LegalStatusAlert.tsx — zielony/żółty/czerwony alert z progiem 5%/15%
- ExplainableMetric.tsx — metryka z tooltipem, cytowaniem, statusem
- Tooltopy przy każdej osi EVG (Umiejętności, Wysiłek, Odpowiedzialność, Warunki)
- LegalStatusAlert na głównym dashboardzie (luka 11.2% → żółty alert)
- CitationBadge na każdej karcie metryki

### ✅ SUPABASE SCHEMA (Migracje zastosowane)
Tabele nowe:
- `evg_scores` — position_id (TEXT), user_id, evg_score, 4 osie, is_overridden, module
- `evg_audit_log` — kto/kiedy/co zmienił, old/new axes (JSONB), module
- `subscriptions` — company_id, tier, status (trial/active/cancelled), trial_ends_at
- `partner_payouts` — partner_id, month, amount_pln, status, module

Tabele zmodyfikowane:
- `profiles` — dodano partner_id (uuid), company_id zmienione TEXT→UUID
- `companies` — dodano employee_count, tier, partner_id

Kolumna `module` na wszystkich nowych tabelach: 'pay_transparency' | 'controller' | 'common'

### ✅ DATA TABLE VIEW (done Feb 2026)
- **Route:** /dashboard/dane — Podgląd załadowanych danych
- Paginated table, inline editing, field validation, RODO masking, audit log corrections
- Paginated employee records (50/page, server-side)
- Column headers: "Polska nazwa (original_csv_column)"
- Null cell highlighting (amber) + tooltips "Uzupełnij aby odblokować [funkcja]"
- RODO masking: "— (RODO)" przy N<3 w grupie evg_group+gender
- Strategia columns locked (performance_rating, job_level, hire_date, manager_id, employment_type)
- Inline edit z field validation (enum→Select, numeric→onKeyDown) + audit log
- Period selector + trend indicator (tylko N≥3, multi-period)
- Backend: GET /api/data/records + PATCH /api/data/records/{id}
- Supabase: reporting_period w payroll_data + data_corrections_audit z RLS

### ✅ ROOT CAUSE ANALYSIS (done Feb 2026)
- Why-gap-exists breakdown, department/seniority/tenure drill-down

### ✅ SOLIO SOLVER v1 (done Feb 2026)
- Greedy budget optimization, 6 constraints, interactive modeling

### ✅ ERI-01 Skrzynka Wniosków Pracowniczych (Art. 7)
| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| ERI-01 | Skrzynka Wniosków Pracowniczych (Art. 7) | ✅ PROD | Track A (magic link) + Track B (ręczny), obliczenia EVG, PDF, HITL, audit log |

---

## 4. What Is NOT Built Yet

❌ **Invoice Automation** (Fakturownia.pl — Week 5-8, Mar 2-29) — PRIORITY P0  
❌ **Collaborative Review** (Strategia tier — Apr 27 - May 3)  
❌ **Retention ROI Calculator** (Apr 12 v1)  
❌ **Benchmark Engine** (Mar 22 v1 PDF parsing)  
❌ **Agent Hunter** (LangGraph discovery Mar 29, outreach Jun 8)  
❌ **Agent Guardian** (GraphRAG legal assistant Apr 12)  
❌ **Agent Analyst** (DSPy self-improvement May 10)  
❌ **Article 16 Report PDF Export** (Milestone 1 — needs completion)  
❌ **White-label / custom branding** (Phase 3, Partner Portal enhancement)  
❌ **Kinde Auth Migration** (Feature #43, P0, Week 7 Mar 16-22 — replaces Supabase Auth entirely)
❌ **Enterprise Auth (Kinde Scale SSO/SAML)** (Feature #36, P1 — triggered by first enterprise client)

---

## 5. Hard-Won Rules (Distilled from Lessons)

### INFRA-001: Coolify + Traefik — Static File Router Bug (2026-03-03)
**Problem:** After every Coolify redeploy, gaproll.eu returned 502 Bad Gateway.
**Root cause:** `/data/coolify/proxy/dynamic/gaproll-eu.yaml` contained a hardcoded container suffix (e.g. `-134538693077`). Each redeploy generates a new suffix, so Traefik's file router pointed to a dead container, overriding the correct Docker label routers (which had lower priority).
**Fix applied (temporary):** Updated the URL in gaproll-eu.yaml to the new container name via sed.
**Permanent fix:** Delete `/data/coolify/proxy/dynamic/gaproll-eu.yaml` entirely and rely solely on Coolify's Docker label-based routers. The www→non-www redirect should be handled via Cloudflare Page Rules, not Traefik file config.
**After every redeploy checklist until permanent fix applied:**
```bash
NEW=$(docker ps --filter "name=s4sg0k0ckkgok08w0kwgk48o" --format "{{.Names}}" | head -1)
sed -i "s|s4sg0k0ckkgok08w0kwgk48o-[0-9]*:3000|${NEW}:3000|" /data/coolify/proxy/dynamic/gaproll-eu.yaml
```
**Status:** Temporary fix active. Permanent fix (delete yaml) pending — do before next redeploy.

---

### 🔴 CRITICAL (violating these costs hours/days)

| # | Rule | Why |
|---|------|-----|
| 1 | Zawsze używaj SUPABASE_SERVICE_ROLE_KEY w FastAPI do wszystkich operacji na chronionych tabelach | Anon key + RLS = 403/42501. Cost: 3h debugging. |
| 2 | Next.js Route Handlers w `app/api/` przechwytują requesty PRZED rewrite do FastAPI | Jeśli istnieje `app/api/evg/override/route.ts`, rewrite nigdy nie odpali. Zawsze sprawdź `app/api/` przed debugowaniem 400. |
| 3 | `@supabase/ssr` przechowuje sesję w cookies, NIE localStorage | `getSession()` może zwrócić null w browser context. Użyj `refreshSession()` jako fallback w `fetchWithAuth`. |
| 4 | Middleware Next.js musi wykluczać `/api/*` z matchera | Bez `(?!api/)` middleware crashuje proxy do FastAPI (500). |
| 5 | Diagnozuj proaktywnie, nie reaktywnie | Nie wymieniaj się po 1 komendzie. Jeden Cursor Composer prompt = pełna diagnoza + fix. |
| 6 | Never render-then-stop. Always: content FIRST, `st.stop()` AFTER | Black screen bug. |
| 7 | `try-except` around all Supabase calls | Uncaught crashes. |
| 8 | RLS at DB level, never client-side filtering | Security fundamental. |
| 9 | EVG Manual Override = MANDATORY (EU AI Act Art. 14 HITL requirement) | Legal compliance. |
| 10 | Pydantic undefined fields → 422 (często jako 400) | Sprawdź czy frontend wysyła WSZYSTKIE wymagane pola (nie undefined). |

### ⚠️ AUTH RULES (Next.js + Supabase SSR)

> ⚠️ **MIGRATION PENDING:** Rules #3, #4, #11-15, #38 below will become OBSOLETE after Kinde Auth Migration (Feature #43, Week 7). They describe Supabase Auth workarounds. After migration: Kinde handles sessions, middleware, cookies. Keep rules until migration confirmed complete.

| # | Rule |
|---|------|
| 11 | Login page i api-client muszą używać TEGO SAMEGO `createBrowserClient` z `@supabase/ssr` |
| 12 | `window.__supabase` nie istnieje — debug przez `localStorage` lub DevTools → Application → Cookies |
| 13 | Supabase SSR cookies: sesja widoczna w DevTools → Cookies (nie localStorage) |
| 14 | Po zmianie `role` w profiles → wymagany re-login lub refresh tokenu |
| 15 | `get_current_user` bez tokenu zwraca sentinel UUID `00000000-0000-0000-0000-000000000000` — NIE rzuca błędu |

### 📊 DATA RULES

| # | Rule |
|---|------|
| 16 | `pd.read_csv(sep=None, engine='python')` for auto-detect separator |
| 17 | `df.columns = df.columns.str.strip()` immediately after load |
| 18 | `pd.to_numeric(errors='coerce').fillna(0)` for dirty salary data |
| 19 | `payroll_data` musi mieć OBIE płcie (M i K) — bez tego paygap endpoint zwraca 400 |

### 🔧 FASTAPI RULES

| # | Rule |
|---|------|
| 20 | Zawsze uruchamiaj uvicorn z venv: `.\venv\Scripts\Activate.ps1` przed komendą |
| 21 | `create_client(URL, SERVICE_ROLE_KEY)` dla wszystkich operacji backend → Supabase |
| 22 | Pydantic field_validator z `mode="before"` do coercji float→int dla osi EVG |
| 23 | Debug prints usuwaj przed każdym commitem (zostawiaj tylko `ERROR` w except) |

### 📈 PERFORMANCE RULES

| # | Rule |
|---|------|
| 24 | Batch DB inserts (500–1000 records per call) |
| 25 | Cache EVG scores w `job_valuations` (cache hit = brak wywołania GPT-4o) |

### 📦 SUPABASE / DATA INTEGRITY RULES

| # | Rule | Why |
|---|------|-----|
| 26 | Supabase `REFERENCES organizations(id)` może nie istnieć — sprawdź rzeczywistą nazwę tabeli (`companies` w GapRoll) przed każdą migracją | 42P01 na migration. |
| 27 | RLS policies używają `profiles`, NIE `users` — `SELECT company_id FROM profiles WHERE id = auth.uid()` | 42P01 przy tworzeniu policy. |
| 28 | Enum fields w inline edit = Shadcn Select, NIE free-text Input — free-text korumpuje dane downstream (pay gap, EVG) | Data integrity. |

### 🔧 ERI / Infra (Mar 2026)

| # | Rule | When |
|---|------|------|
| 45 | Supabase Storage bucket wymaga explicit RLS policy dla service_role — bez niej upload failuje nawet z service role key | Mar 2026 |
| 46 | FastAPI redirect_slashes=True + Next.js rewrite = 307 cross-origin → Authorization header stripped. Fix: @router.get("") zamiast @router.get("/") | Mar 2026 |
| 47 | uvicorn --reload nie przeładowuje plików edytowanych przez zewnętrzne narzędzia (Cursor/CC) — zawsze restart ręczny po zmianach CC | Mar 2026 |
| 48 | Shadcn/UI wymaga zdefiniowania --popover i --accent HSL tokenów w globals.css — bez nich dropdown tła są przezroczyste | Mar 2026 |
| 49 | RLS na tabeli profiles z subquery do tej samej tabeli = infinite recursion (42P17). Zawsze używaj tylko id = auth.uid() bez JOIN/subquery | Mar 2026 |

---

## 6. Strategic Rules

| # | Rule | Learned When |
|---|------|--------------|
| 26 | Domain warming 2-4 weeks BEFORE cold outreach | Feb 13 |
| 27 | Data moat = core defensibility (largest Polish wage dataset) | Feb 13 |
| 28 | Entry pricing for viral adoption (99 PLN removes friction) | Feb 13 |
| 29 | Partner distribution > direct sales (biura rachunkowe = trusted relationships) | Feb 13 |
| 30 | Explainability = trust (every metric: definition + citation + interpretation) | Feb 13 |
| 31 | **EVG is Compliance, not Premium** (Art. 4 + Art. 7 make it mandatory) | Feb 14 |
| 32 | **Invoice automation = Priority Zero** (saves 12.5h/month at 50 customers) | Feb 14 |
| 33 | **Realistic targets > ambitious** (Jun 8 = 10-20 customers, not 50) | Feb 14 |
| 34 | **Proaktywne debugowanie** — jeden Cursor prompt = pełna diagnoza, nie wymiana 1 komenda na raz | Feb 21 |
| 35 | **Kolumna `module`** na każdej nowej tabeli — koszt: 1 linia teraz vs. tygodnie migracji przy launchu Controller | Feb 21 |
| 46 | **Kinde (nie WorkOS) dla CAŁEGO auth.** $250/mies flat vs $125/connection. Jeden provider zamiast dual-system. | Mar 3 |
| 47 | **Enterprise tier = custom pricing, min 2,999 PLN/mies. Nigdy publiczna cena.** Uzasadnienie: czas obsługi, nie COGS auth. | Mar 3 |
| 48 | **Migruj auth TERAZ (0 klientów), nie później (100 klientów).** "Supabase Auth już stoi" = sunk cost fallacy. | Mar 3 |
| 49 | **Po migracji: FastAPI = jedyny gateway do danych.** Frontend → Kinde JWT → FastAPI → Supabase (service_role_key). | Mar 3 |

### 📐 UX / INTEGRATION RULES (Session I — Feb 25)

| # | Rule | Why |
|---|------|-----|
| 36 | Supabase nowe klucze NIE działają z supabase-py 2.11 — legacy JWT | Key format compatibility. |
| 37 | preview_rows ≠ all_rows — zawsze sprawdź co frontend wysyła do save | Upload zapisywał 10 zamiast 75 (preview vs pełny dataset). |
| 38 | user_id=zeroes = brak Authorization header w fetch | Sentinel UUID gdy brak tokenu. |
| 39 | ReportLab zamiast WeasyPrint na Windows (brak GTK) | PDF export. |
| 40 | Wykres Recharts: domain={[0,'auto']} na YAxis gdy dane zawsze >= 0 | Unikaj ujemnych wartości na osi (np. wynagrodzenia). |
| 45 | Po restarcie serwerów zawsze sprawdź cookies (DevTools → Application → Cookies → localhost:3000). Brak sb-* cookies = wygasła sesja = sentinel UUID we wszystkich endpointach. | Fix: wyloguj + zaloguj ponownie. |

### 🔌 API-First / MCP RULES (Feb 2026)

| # | Rule | Why |
|---|------|-----|
| 34 | Każdy nowy endpoint musi przejść Agent-Ready Checklist (16 punktów) z 12_API_FIRST_ARCHITECTURE.md | Koszt: 0. Wartość: 2-5x exit multiplier. |
| 35 | MCP tools = 5-7 intent-based grup, NIE 1:1 mapping endpoint→tool | Źródło: Anthropic Claude Code team. Mniej narzędzi = lepszy agent. |
| 36 | API responses: summary + available_drilldowns (progressive disclosure) | Agent sam decyduje co drążyć. Nie zalewaj danymi. |
| 37 | `ask_human` = osobny dedykowany tool z blocking semantiką | EU AI Act Art. 14 + lepszy UX. Nie parametr innego toola. |

---

## 7. Key Metrics (Targets)

### V1.0 Launch (Jun 8, 2026) — REALISTIC:
| Metric | Target | Rationale |
|--------|--------|-----------|
| Paying Companies (Direct B2B) | 10-20 | 1-2 months manual sales (May-Jun) |
| Partner Offices Signed | 2-3 | Pilots, ~100-150 end customers |
| MRR | 3,000-5,000 PLN | Avg 100 PLN/customer × 30-50 total |
| RODO Violations | 0 | Compliance mandatory |
| Invoice Automation | Live | Zero manual invoicing |

### SUCCESS MILESTONE (Sep 2026):
| Metric | Target |
|--------|--------|
| Paying Companies | 50 |
| Partner Offices | 5 |
| MRR | 15,000-20,000 PLN |

### PMF Validation (Dec 2026):
| Metric | Target |
|--------|--------|
| Paying Companies | 100+ |
| MRR | 50,000 PLN |
| NPS | >40 |

---

## 8. Recent Updates (Session Changelog)

### Session Log — GTM Strategy Session (Mar 7, 2026)

**Focus:** paygapnews.pl blueprint + GTM strategy to June 7, 2026

**Key Decisions:**
- paygapnews.pl is #1 pre-departure priority (SEO needs 6–8 weeks before June deadline)
- Zero-touch onboarding (Fakturownia/Przelewy24) DEFERRED — no customers yet, manual is fine
- VSL Machine: 3 videos × 3 personas (VSL-A biura rachunkowe FIRST, VSL-C HR second, VSL-B kancelarie third)
- Synthetic LinkedIn personas REJECTED — compliance brand cannot use bot network
- PhantomBuster FB groups REJECTED — same reputation risk

**Content Production Rule (PERMANENT):**
- Bartek = approver only, NEVER content writer
- Agent (P2-seo-content-machine) generates all articles
- n8n automates pipeline from Week 7 onward

**Deliverables Created:**
- PAYGAPNEWS_BLUEPRINT.md v2.0 — complete Gemini handoff document
- Cursor Composer batch prompt for 6 first articles
- n8n workflow spec (draft pipeline + lead capture)
- System prompt for Gemini

**Next Session Priorities:**
1. Ghost CMS deploy on Hetzner via Coolify (Sesja 1 z Gemini)
2. Run P2-seo-content-machine batch prompt → generate 6 articles
3. n8n lead capture workflow

---

### Sessions A–G (Feb 13-14, 2026)
*[Zachowane bez zmian — patrz poprzednia wersja pliku]*

---

### Session H: Partner Portal v1 + EVG Override + Auth Debugging (2026-02-21)

**Duration:** ~6h  
**Sprint:** Week 2/16 — Milestone 1 features  

#### Completed Tasks

**1. EVG Manual Override — end-to-end:**
- ✅ Komponenty UI (EVGScoreCard, EVGDetailModal, ManualOverrideForm)
- ✅ POST /evg/override endpoint z audit trail
- ✅ Supabase migracja: evg_scores + evg_audit_log (z kolumną module)
- ✅ RLS policies
- ✅ Przetestowany end-to-end: override Developer Senior 78→80, badge "Zmodyfikowano ręcznie"

**2. Partner Portal v1 — end-to-end:**
- ✅ Dashboard (/partner) z MRR cards
- ✅ ClientListTable + OnboardClientForm
- ✅ FastAPI router (GET /clients, POST /onboard-client, GET /mrr)
- ✅ Supabase migracja: subscriptions + partner_payouts + companies modyfikacje
- ✅ Przetestowany: onboarding klienta ABC (NIP: 1234563218, Compliance, Trial)

**3. Auth system fix:**
- ✅ Next.js middleware.ts z @supabase/ssr (chroni /partner/*)
- ✅ Matcher wyklucza /api/* (bez tego middleware crashował proxy do FastAPI)
- ✅ fetchWithAuth z refreshSession() fallback
- ✅ login-form.tsx z router.push() + router.refresh() (bez race condition)

**4. Explainability Layer:**
- ✅ InfoTooltip, CitationBadge, LegalStatusAlert, ExplainableMetric
- ✅ Tooltopy przy osiach EVG z definicjami Art. 4
- ✅ LegalStatusAlert na dashboard (luka 11.24% → żółty alert Art. 9)
- ✅ Formalna polszczyzna wszędzie

**5. Service Role Key fix:**
- ✅ Wszystkie endpointy w analysis.py, partner.py, evg_override.py używają SERVICE_ROLE_KEY
- ✅ Usunięte debug printy z analysis.py i evg_override.py

#### Lessons Learned

- **LESSON 36:** Next.js Route Handler w `app/api/evg/override/route.ts` przechwytuje request PRZED rewrite — usuń jeśli endpoint ma iść do FastAPI.
- **LESSON 37:** `@supabase/ssr` + cookies → `getSession()` może zwrócić null w browser context nawet po zalogowaniu. `refreshSession()` jako fallback rozwiązuje problem.
- **LESSON 38:** Middleware matcher `/((?!_next/static|_next/image|favicon.ico|api/).*)` — kluczowe jest `api/` w wykluczeniach.
- **LESSON 39:** Sentinel UUID `00000000-0000-0000-0000-000000000000` = brak Authorization headera w request. Sprawdź czy session istnieje zanim debugujesz backend.
- **LESSON 40:** Proaktywne debugowanie: jeden Cursor Composer prompt z pełnym kontekstem oszczędza 2-3h latania po 1 komendzie.

#### Blockers Resolved

1. **403 "Brak profilu partnera"** → root cause: role='admin' zamiast 'partner' + anon key zamiast service role
2. **500 na /api/evg/override** → root cause: Next.js Route Handler w app/api/evg/override/route.ts
3. **400 na override** → root cause: undefined fields w new_axes (JSON.stringify pomija undefined)
4. **ECONNREFUSED** → uvicorn nie był uruchomiony
5. **Middleware 500** → matcher nie wykluczał /api/*

#### Files Modified/Created This Session

**Frontend:**
- apps/web/app/(partner)/layout.tsx (auth guard, middleware)
- apps/web/app/(partner)/partner/page.tsx (dashboard)
- apps/web/app/(partner)/partner/onboard/page.tsx
- apps/web/components/partner/PartnerSidebar.tsx
- apps/web/components/partner/ClientListTable.tsx
- apps/web/components/partner/MRRSummaryCard.tsx
- apps/web/components/partner/OnboardClientForm.tsx
- apps/web/components/evg/EVGScoreCard.tsx
- apps/web/components/evg/EVGDetailModal.tsx
- apps/web/components/evg/ManualOverrideForm.tsx
- apps/web/app/dashboard/evg/page.tsx (EVGScoreCard grid + explainability)
- apps/web/components/explainability/InfoTooltip.tsx (updated)
- apps/web/components/explainability/CitationBadge.tsx (updated)
- apps/web/components/explainability/LegalStatusAlert.tsx (NEW)
- apps/web/components/explainability/ExplainableMetric.tsx (updated)
- apps/web/middleware.ts (NEW)
- apps/web/lib/api-client.ts (refreshSession fallback)
- apps/web/components/auth/login-form.tsx (router.push + Suspense)
- DELETED: apps/web/app/api/evg/override/route.ts

**Backend:**
- apps/api/routers/partner.py (NEW — GET/POST/GET endpoints)
- apps/api/routers/evg_override.py (NEW — POST /evg/override)
- apps/api/routers/analysis.py (service role key, debug prints removed)
- apps/api/main.py (include_router evg_override, partner)

**Supabase Migrations:**
- supabase/migrations/20260219000000_evg_scores_and_audit.sql
- supabase/migrations/20260219010000_partner_portal.sql

#### Next Session Priorities

1. **Article 16 Report PDF Export** — ostatni brakujący element Milestone 1 (Mar 15)
2. **Invoice Automation setup** (Fakturownia.pl) — Priority P0, Mar 2-8
3. **Sales materials** — email templates, one-pager dla biur rachunkowych
4. **Usunąć debug printy z partner.py** (pozostały DEBUG get_current_partner)
5. **Przywrócić role='admin'** na koncie Bartka w Supabase

#### Next Actions
- **P0:** Hetzner VPS setup + Coolify deploy landinga gaproll.eu
- **P0:** Google Search Console — zarejestruj gaproll.eu
- **P0:** Instantly.ai signup → aktywuj domain warming bartek@gaproll.eu
- **P1:** Claude Cowork 4 pluginy setup (Productivity/Marketing/Legal/Sales)
- **P1:** paygapnews.pl Ghost setup + 3 artykuły bazowe
- **P1:** Fakturownia.pl + Przelewy24 integration (invoice automation)
- **P2:** Hunter agent — start budowania (LangGraph discovery flow)

---

## 9. Current Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Domain blacklisted (no warming) | CRITICAL | High | 6-week mandatory warm-up (Feb 22 - Apr 5) |
| MS Founders Hub rejected | HIGH | Low (15%) | Backup: OpenAI API credits |
| Non-compete violation | CRITICAL | Medium | Stealth mode protocols |
| Manual invoicing bottleneck | HIGH | High | Invoice automation Week 5-8 (Priority P0) |
| Art. 16 PDF Export brakujący | MEDIUM | — | Next session |

---

## 10. Tech Debt

| Item | Severity | Deadline | Status |
|------|----------|----------|--------|
| PayCompass → GapRoll global find-replace | CRITICAL | Mar 1 | ✅ DONE (done Feb 2026) |
| Streamlit sunset (migration complete) | CRITICAL | Mar 15 | 🔄 IN PROGRESS |
| Debug printy w partner.py | LOW | Next session | ❌ TODO |
| role='admin' przywrócić Bartkowi | MEDIUM | ASAP | ❌ TODO — SQL: `UPDATE profiles SET role='admin' WHERE id='b450de23-f438-4978-a2c4-db43c5ff02e9'` |
| Article 16 PDF Export | HIGH | Mar 15 | ❌ TODO |
| Domain warming (cold email blocked) | IN PROGRESS | Apr 5 | 🔄 IN PROGRESS |
| Unit tests RODO masking | LOW | Mar 29 | ❌ TODO |
| n8n ERI workflow | HIGH | Apr 5 | ❌ TODO — N8N_WEBHOOK_ERI_SEND nie skonfigurowany, email do pracownika nie działa |
| profiles.full_name | MEDIUM | Mar 29 | ❌ TODO — tabela profiles nie ma full_name, podpis w PDF generuje "—" |

Root Cause — hardcoded company_id w frontendzie. To jest tymczasowy fix tylko na potrzeby testów. Przed launchem trzeba to właściwie podpiąć pod profil użytkownika.

---

## 11. Quick Reference — Uruchamianie projektu

```powershell
# FastAPI (backend)
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\api
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Next.js (frontend) — osobny terminal
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\web
npm run dev
# lub: pnpm dev
```

**Supabase:** Project → Settings → API → service_role key musi być w `apps/api/.env` jako `SUPABASE_SERVICE_ROLE_KEY`

**Test user:** bartgroki@PROTON.ME — `role` w profiles musi być 'partner' dla testów Partner Portal, 'admin' dla normalnej pracy.

---

### Session: 2026-03-01 — Legal Partner Portal (Kancelarie Prawne)

**Duration:** ~4h  
**Sprint:** Week 3/16 — Partner Channel Expansion  
**Phase:** Milestone 1 (target: Mar 15, 2026)  
**Commit:** cdda63f + fix papaparse/turbopack (16 files, +2081/-79 lines)

#### Completed Tasks

**1. Supabase Schema Extension:**
- ✅ `partner_type` enum (`accounting` | `legal`) + column on `profiles` (default: `accounting`)
- ✅ `audit_tokens` table — pay-per-audit model (total_purchased, total_used, price_per_token_pln in grosz)
- ✅ `audit_token_usage` table — log każdego zużytego tokena (partner_id, client_nip, audit_session_id)
- ✅ `white_label_config` table — logo_url, primary_color_hex, legal_disclaimer per partner
- ✅ Storage bucket `partner-logos` (public: false, 2MB limit, PNG/SVG/JPEG)
- ✅ RLS policies na wszystkich nowych tabelach
- Migration file: `apps/api/migrations/20260301_legal_partner_schema.sql`

**2. FastAPI Router `/legal-partner/*`:**
- ✅ `GET /legal-partner/token-balance` — saldo tokenów (total/used/available/price)
- ✅ `GET /legal-partner/dashboard` — metryki + ostatnie audyty
- ✅ `POST /legal-partner/use-token` — zużyj token (402 gdy brak), walidacja NIP checksum
- ✅ `GET /legal-partner/white-label-config` — pobierz konfigurację brandingu
- ✅ `PUT /legal-partner/white-label-config` — zapisz branding (firm_name, hex color, disclaimer)
- ✅ `POST /legal-partner/upload-logo` — multipart upload do Supabase Storage, zwraca signed URL
- ✅ Auth guard: `get_current_legal_partner` — wymaga `role='partner'` AND `partner_type='legal'`
- File: `apps/api/routers/legal_partner.py`

**3. Next.js Frontend:**
- ✅ `/legal-partner` dashboard — RODO banner (Art. 9), 3 karty metryk, tabela ostatnich audytów
- ✅ `NewAuditModal` — Step 1: NIP validation + token check; Step 2: CSV upload z client-side PapaParse PII anonymization
- ✅ `/legal-partner/settings` — white-label config (logo upload, color picker, disclaimer textarea, preview)
- ✅ `LegalPartnerSidebar` + layout z auth redirect
- ✅ PDF white-label injection w `apps/api/routers/reports.py` (logo, kolor nagłówka, disclaimer w stopce)
- ✅ Warunkowy link "Portal Kancelarii" w sidebar (tylko dla `partner_type='legal'`)

**4. Fixes:**
- ✅ `papaparse` + `@types/papaparse` zainstalowane (pnpm install --no-frozen-lockfile)
- ✅ Turbopack root config w `next.config.ts` (błąd: "couldn't find next/package.json")
- ✅ Navbar.tsx syntax error (linia 304 — `)}` → ternary `? ... : null`)

#### Architecture Decision: Rozszerzenie vs. Osobny Portal
**Decyzja:** Rozszerzenie istniejącego Partner Portal (nie osobny /legal-partner portal od zera)  
**Powód:** Wspólna infrastruktura RLS, auth, layout. Różnice obsłużone przez `partner_type` enum + conditional rendering. Oszczędność ~13h vs budowanie od zera.

#### Model Biznesowy Kancelarii
- **Pay-per-audit tokens** (nie subskrypcja per-client jak biura rachunkowe)
- Cena: 1500 PLN/token (przechowywana w groszach: 150000)
- Arbitraż marżowy: kancelaria zarabia ~17 475 PLN netto vs 11 500 PLN bez GapRoll (na audycie 150-os. firmy)
- White-label: kancelaria dostarcza raport pod własnym brandem

#### Lessons Learned
- **LESSON 47:** `partner_type` enum w Supabase — `ADD COLUMN IF NOT EXISTS` może wykonać się bez błędu ale enum nie powstaje jeśli kolejność w migracji jest zła. Zawsze weryfikuj: `SELECT column_name FROM information_schema.columns WHERE table_name='profiles' AND column_name='partner_type'` po migracji.
- **LESSON 48:** `Invoke-RestMethod` to PowerShell — w bash/Ubuntu terminalu użyj `curl`. Nie mieszaj powłok.
- **LESSON 49:** Supabase SSR trzyma sesję w **cookies**, nie localStorage. Do pobrania JWT w bash: napisz `test_get_token.py` z `requests` + Supabase Auth API `/auth/v1/token?grant_type=password`. Usuń po teście.
- **LESSON 50:** Turbopack w monorepo (apps/web) wymaga `turbopack.root` w `next.config.ts` wskazującego na root repozytorium — bez tego fatal error przy `import` z outside `apps/web/app`.
- **LESSON 51:** `pnpm install` w Claude Code wymaga `CI=true` flag w non-TTY środowisku (bez tego: `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`).

#### Next Session Goals
- [ ] Przetestować NewAuditModal end-to-end (upload CSV → PapaParse anonymization → submit)
- [ ] Przetestować white-label PDF (zaloguj jako legal partner → generuj Art. 16 → sprawdź logo/kolor/disclaimer)
- [ ] Invoice Automation (Fakturownia.pl) — P0, nadal niezrobione
- [ ] Sales materials (deck, one-pager) — Milestone 1 blocker

---

### Session 2026-03-02: Landing page deployed to production

Landing page deployed to production at https://gaproll.eu on Hetzner CPX32 + Coolify.

**Key fixes needed:** Coolify SSH access (added Coolify's pub key to authorized_keys), standalone output path (removed turbopack.root from next.config.ts, added nixpacks.toml, added postbuild script for static files), Traefik routing (added /data/coolify/proxy/dynamic/gaproll-eu.yaml manually).

**Remaining issues:** Navbar missing in production, logo/dashboard image missing, card borders missing, Coolify config panel 500 error (custom_labels issue).

**LESSON:** Always run pnpm build locally before push. Use Claude Code for all SSH/server tasks.

---

**END OF 00_CONTEXT_MEMORY.md**

**Last Updated:** 2026-03-01  
**Next Update:** After Invoice Automation + Legal Partner e2e test  
**Critical Updates This Version (Mar 1, 2026):**
- ✅ Session: Legal Partner Portal — schema, API, frontend, white-label PDF
- ✅ Hard-Won Rules #47–#51 dodane
- ✅ Feature #43 dodana do backlogu (DONE)
- ✅ Architecture decision: extend vs. separate portal (extend won)

**Critical Updates (Feb 21, 2026):**
- ✅ Session H: Partner Portal v1 + EVG Override + Explainability — DONE
- ✅ Hard-Won Rules zaktualizowane (reguły 1-25 nowe/przepisane)
- ✅ Lessons 36-40 dodane
- ✅ Tech Debt zaktualizowany
- ✅ Quick Reference uruchamiania dodany

---

### Session I: UX Polish + EVG HITL + Filtry Działowe (2026-02-25)

**Completed:**
- ✅ Upload fix — zapisuje wszystkie wiersze (preview vs all_rows w backendzie i frontendzie)
- ✅ Loading skeleton — animate-pulse na paygap, report, root-cause
- ✅ Tooltipy — contentStyle ciemny na wszystkich Recharts + TooltipContent (Shadcn)
- ✅ Banner sukcesu po upload — zielony, persistent, nie znika po 4s
- ✅ Filtr działowy — Pay Gap + Art. 16, GET /analysis/departments, ?department=
- ✅ Mediana IT usunięta z nawigacji (sidebar + topbar)
- ✅ EVG HITL — approve-session, approve per stanowisko, counter (np. 2/16), banner statusu
- ✅ Art. 16 ostrzeżenie gdy EVG niezatwierdzone (soft warning + link do EVG)
- ✅ Wykres oś Y — domain={[0,'auto']}, przycięcie Linii Fair Pay, brak wartości ujemnych

**Hard-Won Rules dodane (sekcja 5):** #36–#40 (Supabase keys, preview≠all_rows, user_id=zeroes, ReportLab, Recharts domain).

---

## Session Log - Week 3, Day 2 (Feb 24, 2026)

**Completed:**
- ✅ Built 3 core skills (dashboard, legal, SEO)
- ✅ Validated skills working in Cursor
- ✅ Generated first SEO article (waiting for domain to deploy)
- ✅ Analyzed Gemini's Virtual C-Suite proposal

**Priority Shifts:**
- SEO moved from P5 → P2 (need 6-8 week head start)
- Synthetic QA Grażyna elevated to P1a (launch blocker)
- Ruthless MVP Prioritizer elevated to P1b (scope creep protection)

**Blocked On:**
- Domain purchase (waiting for spółka registration from sąd)
- SEO deployment (need gaproll.eu live)

**Next Session:**
- Build P1a + P1b skills (Synthetic QA + Prioritizer)
- Prepare remaining 7 SEO articles (as .mdx files)
- Run first DevSecOps scan (manual, before building skill)

## Session Log - Week 3, Day 2 (Feb 24, 2026) - CONTINUED

**API Key Rotation (Security):**
- ✅ Rotated all API keys (Supabase + OpenAI)
- ✅ Supabase migrated to new key format (sb_publishable_, sb_secret_)
- ✅ OpenAI new key: GapRoll_Production_Feb2026
- ✅ Old OpenAI keys revoked: PayCompass_Dev, PayCompass_Dev2
- ✅ .gitignore created to prevent future .env leaks
- ⚠️ Git history cleanup DEFERRED (requires git-filter-repo, risky)

**Agent Skills Built:**
- ✅ P1-dashboard-architect (WCAG, Polish formatting)
- ✅ P1-compliance-legal (EU Directive citations)
- ✅ P2-seo-content-machine (Polish B2B SEO)
- 🔄 P1a-synthetic-qa-grazyna (in progress via Cursor)
- 🔄 P1b-ruthless-mvp-prioritizer (in progress via Cursor)

**Strategic Decisions:**
- PayGapNews.com strategy: Soft launch Week 6 (manual), automate Week 10+
- SEO content generation deferred (waiting for domain)
- Security audit report saved to outputs/

**Blocked On:**
- SEO article deployment (waiting for gaproll.eu DNS setup)
- Git history cleanup (deferred to separate session)

Session I: API Key Rotation + Agent Skills (Feb 24, 2026)
Duration: ~4h
Focus: Security hardening + Skills infrastructure
Completed:
1. Security: API Key Rotation COMPLETE

✅ Supabase keys rotated (new format: sb_publishable_ + sb_secret_)
✅ OpenAI key rotated (new: GapRoll_Production_Feb2026)
✅ Old OpenAI keys REVOKED: PayCompass_Dev, PayCompass_Dev2
✅ .gitignore created (prevents future .env commits)
✅ Backend tested: 200 OK on /health
✅ Frontend tested: Login + Dashboard working
📄 Security audit report: SECURITY_AUDIT_2026-02-24.md

2. Agent Skills Infrastructure (5 Skills Operational)

✅ P1-dashboard-architect (WCAG AA dashboards, Polish formatting)
✅ P1-compliance-legal (EU Directive citations)
✅ P2-seo-content-machine (Polish B2B SEO content)
✅ P1a-synthetic-qa-grazyna (dirty test data generator: Excel/JPK/CSV)
✅ P1b-ruthless-mvp-prioritizer (scope creep assassin)

Files Created:
.ai/skills/
├── P1-dashboard-architect/ (WCAG, Polish locale)
├── P1-compliance-legal/ (EU Directive 2023/970)
├── P2-seo-content-machine/ (SEO + Grażyna tone)
├── P1a-synthetic-qa-grazyna/
│   ├── SKILL.md
│   ├── scripts/ (generate_dirty_excel.py, generate_large_jpk.py, generate_broken_csv.py)
│   ├── references/ (common-erp-export-bugs.md, test-scenario-templates.md)
│   └── requirements.txt
└── P1b-ruthless-mvp-prioritizer/
    ├── SKILL.md
    └── references/ (mvp-scope-definition.md, approved-rejected-examples.md)

.ai/skill-catalog.json (5 skills registered)
.ai/cursor-rules.md (auto-load triggers)
.gitignore (comprehensive exclusions)
3. Strategic Decisions

PayGapNews.com strategy: Soft launch Week 6 (manual), automate Week 10+
SEO timeline: Generate articles Week 4-5, deploy when domain ready
Knowledge Base vs Blog clarified (Blog = prospects, KB = customers)

Lessons Learned:

LESSON 41: Supabase new key format (sb_publishable_, sb_secret_) works with Python SDK seamlessly
LESSON 42: FastAPI has NO /api/ prefix; Next.js rewrites frontend calls
LESSON 43: Agent Skills = 10x productivity (P1a generates in 2 min what takes 2h manually)
LESSON 44: Missing .gitignore = critical security risk; mandatory rotation even if keys not visibly leaked

Blockers Resolved:

Missing .gitignore → Created with comprehensive exclusions
API keys in Git history → Rotated all keys; Git cleanup deferred
Unclear PayGapNews timing → Defined: soft Week 6, automate Week 10+

Next Session Priorities:

Generate 7 remaining SEO articles (using P2-seo-content-machine)
Test P1a Skill: Generate corrupted Excel + verify import pipeline handles errors
Test P1b Skill: Submit 3 feature requests, verify 70%+ rejection rate
DevSecOps fixes (from audit): RLS policies, rate limiting, debug print cleanup
Domain setup: DNS configuration for gaproll.eu (when company registered)


REPLACE SECTION 6 (Strategic Rules) - ADD THESE RULES:
| 41 | Supabase new key format (sb_publishable_, sb_secret_) works with Python SDK | Feb 24 |
| 42 | FastAPI has NO /api/ prefix (Next.js rewrites frontend calls, curl must omit prefix) | Feb 24 |
| 43 | Agent Skills = 10x productivity (P1a generates in 2 min what takes 2h manually) | Feb 24 |
| 44 | Missing .gitignore = critical security risk (mandatory rotation even if keys not visibly leaked) | Feb 24 |

REPLACE SECTION 11 (Tech Debt):
11. Tech Debt
ItemSeverityDeadlineStatusPayCompass → GapRoll global find-replaceCRITICALMar 1❌ TODOStreamlit sunset (migration complete)CRITICALMar 15❌ TODOGit history cleanup (.env purge via git-filter-repo)CRITICALMar 1❌ DEFERREDRLS policies audit (evg_audit_log, subscriptions, partner_payouts)HIGHMar 8❌ TODORate limiting implementation (Slowapi middleware)HIGHMar 8❌ TODORemove debug prints from backend (PII leak risk)MEDIUMMar 1❌ TODODomain warming (cold email blocked)IN PROGRESSApr 5🔄 IN PROGRESSUnit tests RODO maskingLOWMar 29❌ TODO
Security Audit Items (Feb 24, 2026):

Git cleanup: Rewrites commit history. Use: git filter-repo --path .env --invert-paths --force
RLS audit: Verify all tables: SELECT tablename FROM pg_policies WHERE schemaname='public'
Rate limiting: Slowapi on /auth/login (5/min), /partner/* (10/hour), /analysis/* (20/min)
Debug cleanup: Search for print( with patterns: "pesel|salary|email|wynagrodzenie"


UPDATE FOOTER:
Last Updated: 2026-02-25
Next Update: After Article 16 PDF + next session
Critical Updates This Version (Feb 25, 2026):

✅ Session I: UX Polish + EVG HITL + Filtry Działowe (2026-02-25)
✅ Hard-Won Rules #36–#40 dodane (Supabase keys, preview≠all_rows, user_id=zeroes, ReportLab, Recharts Y domain)
✅ Upload all_rows, loading skeletons, tooltipy, banner sukcesu, filtr działowy, EVG approve-session, wykres Y≥0

    
## Session: 2026-02-26 — Security Audit Remediation

**Status:** ZAMKNIĘTY 100%

### Wykonane:
- [x] CRIT-001: Rotacja kluczy Supabase + OpenAI
- [x] CRIT-002: Purge .env z Git history  
- [x] HIGH-001: RLS na wszystkich tabelach
  - companies, profiles, employees, payroll_data (fix organization_id::uuid cast)
  - subscriptions, evg_scores, evg_audit_log, partner_payouts, audit_log
- [x] HIGH-002: Rate limiting (slowapi) — 9 endpointów
- [x] HIGH-003: PII usunięte z logów (print → logger.debug/error)
- [x] MED-001: Pydantic hardening — max_length, bounds, sanityzacja SQL/XSS
- [x] MED-002: Audit trail — utils/audit.py + tabela audit_log w Supabase
- [x] MED-003: CORS whitelist — gaproll.eu/pl/com + localhost:3000
- [x] LOW-001: Security headers middleware (X-Frame, HSTS, nosniff)

### Bandit scan: 0 HIGH, 0 MEDIUM (19x LOW — try/except pass, celowo pominięte)

### Następna sesja: powrót do Milestone 1 — Partner Portal

---

### Session I: Data Table View (2026-02-27)

**Duration:** ~3h  
**Focus:** Feature #38 — Podgląd załadowanych danych

**Completed:**
1. ✅ Supabase migration: reporting_period + data_corrections_audit
2. ✅ FastAPI router: data_preview.py (GET paginacja + RODO masking, PATCH + audit)
3. ✅ Frontend: /dashboard/dane, DataTableView, PeriodSelector
4. ✅ Field validation: enum→Select, numeric→onKeyDown, backend 422 safety net
5. ✅ 09_FEATURE_BACKLOG.md zaktualizowany (#38 dodany)

**Lessons Learned:**
- LESSON 45: Supabase tabela users = auth.users — własna tabela profili to `profiles` lub `companies` (sprawdź schemat przed migracją)
- LESSON 46: Enum pola w tabelach danych ZAWSZE renderuj jako Select w UI — free-text input korumpuje kalkulacje downstream

**Next Session:**
- Invoice Automation (Fakturownia.pl) — P0, Mar 2-8
- Article 16 PDF Export — P0, Mar 15

---

### Session: 2026-02-27/28 — API-First Architecture & Agent-Ready Strategy

**Duration:** ~3h (across 2 days)
**Sprint:** Week 3/16 — Strategic Architecture Planning
**Phase:** Milestone 1 — Platform Baseline (target: Mar 15, 2026)

#### Completed Tasks

**1. API-First Architecture Document Created**
- New file: 12_API_FIRST_ARCHITECTURE.md
- 3 deployment models defined (Remote MCP Server, SDK/CLI, Hybrid)
- Response envelope standard (APIResponse[T] + ComplianceContext)
- Permission scope model (gap:read, evg:score, solio:simulate, etc.)
- API key format: gaproll_live_sk_xxx / gaproll_test_sk_xxx
- Rate limiting per tier (Compliance 30/min, Strategia 60/min, Enterprise 300/min)
- Agent-Ready Checklist (16 items, every new endpoint must pass)
- Pydantic base models copy-paste ready (apps/api/schemas/base.py)
- Migration path for 6 existing endpoints

**2. Claude Code Article Analysis ("Lessons from Building Claude Code")**
- Intent-based tool grouping: 5-7 MCP tools (not 15+ raw endpoints)
- Progressive disclosure: summary + available_drilldowns in responses
- `ask_human` as dedicated MCP tool with blocking semantics
- Tools age — keep MCP layer thin and swappable over REST API

**3. MCP Action Space Defined**
- 7 tools: analyze_pay_gap, score_positions, generate_report, simulate_budget, query_benchmark, ask_human, get_company_context
- Each tool maps to 2-3 REST endpoints internally
- External agents never access Guardian/Hunter/Analyst directly

#### Decisions Made
- [x] API-First added as 7th Strategic Pillar
- [x] MCP Server v1 target: Milestone 3 (May 17)
- [x] Endpoint migration to APIResponse: Milestone 2 (Apr 26)
- [x] Model A (Remote MCP) first, Model B (SDK) post-PMF
- [x] Intent-based tool grouping over 1:1 endpoint mapping
- [x] MacBook Pro migration in ~2 weeks (WSL2 checklist unnecessary)

#### Files Created
- 12_API_FIRST_ARCHITECTURE.md (new)

#### Files That Need Update (this session identified gaps)
- 01_STRATEGY.md (API-First pillar, competitive matrix, exit valuation, timeline, lessons)
- 06_AGENT_BLUEPRINTS.md (external agent section, MCP tool definitions)
- 09_FEATURE_BACKLOG.md (Feature #37 upgrade P3→P1, new #41 #42)
- 04_TECH_CONSTRAINTS.md (API design standards section)

#### Lessons Learned
- LESSON 34: API-First costs zero extra during development but delivers 2-5x exit valuation multiplier. Design endpoints as tools, not pages.
- LESSON 35: MCP tools should be 5-7 intent-based groups, not 1:1 endpoint mappings. Fewer tools = better agent performance (source: Anthropic Claude Code team).
- LESSON 36: Progressive disclosure in API responses — return summary + drilldowns. Agent decides what to explore. Don't dump everything in one response.
- LESSON 37: `ask_human` must be a dedicated, blocking tool — not a parameter on other tools. EU AI Act Art. 14 compliance + better UX.

#### Next Session Goals
- [ ] Apply all file updates (Cursor Composer batch)
- [ ] Claude Code setup on current machine (pre-MacBook migration)
- [ ] Continue Milestone 1 deliverables (invoice automation, sales materials)

---

### Session: 2026-03-03 — Enterprise Auth Strategy + Kinde Migration Decision

**Duration:** ~3h
**Sprint:** Week 5/16 — Strategic Architecture
**Phase:** Milestone 1 — Platform Baseline (target: Mar 15, 2026)

#### Context
Bartek znalazł WorkOS jako "autostradę do enterprise". Przeprowadzono deep research z Gemini (raport .docx), analizę z Claude, i podjęto serię decyzji zmieniających architekturę auth.

#### Decision Chain (3 pivot points w jednej sesji)

**Pivot 1: WorkOS → Kinde**
WorkOS kosztuje $125/connection. Przy 10 klientach = $2,500/mies. Kinde Scale = $250/mies flat (unlimited). Różnica roczna = $27,000. SCIM u Kinde w beta, ale nasi enterprise klienci mają 5-10 userów → SCIM nie jest deal-breaker.

**Pivot 2: Dual auth (Supabase + Kinde) → Kinde only**
Bartek słusznie wskazał: "łatwiej zmieniać auth bez klientów niż czekać i robić chaos". Argument "Supabase Auth już stoi" = sunk cost fallacy. Jeden system auth = prostszy codebase, mniej bugów, mniej dokumentacji.

**Pivot 3: Enterprise COGS justification → service time justification**
Przy Kinde flat fee, COGS auth per klient ≈ 0. Enterprise pricing (min 2,999 PLN) uzasadniony jest czasem obsługi (security questionnaire 8h, custom onboarding 4h, SLA, DPA), nie kosztem auth.

#### Decisions Made
- [x] Kinde = sole auth provider for ALL tiers (replaces Supabase Auth entirely)
- [x] WorkOS BANNED (unscalable per-connection pricing)
- [x] Enterprise tier = "Wycena indywidualna", min 2,999 PLN/mies
- [x] Feature #43: Kinde Auth Migration (P0, 16h, Week 7 Mar 16-22)
- [x] Feature #36: Enterprise Auth = Kinde Scale upgrade (P1, triggered by first enterprise client)
- [x] Post-migration architecture: Frontend → Kinde JWT → FastAPI → Supabase (database only)
- [x] Auth Rules #3, #4, #11-15, #38 → obsolete after migration

#### Lessons Learned
- LESSON 46: Kinde (nie WorkOS) dla CAŁEGO auth. $250/mies flat vs $125/connection. 10 klientów = $27k/rok różnicy.
- LESSON 47: Enterprise tier = custom pricing. Uzasadnienie: service time, nie COGS auth.
- LESSON 48: Migruj auth TERAZ (0 klientów). "Już stoi" = sunk cost fallacy.
- LESSON 49: Po migracji: FastAPI = jedyny gateway. Frontend → Kinde JWT → FastAPI → Supabase (service_role).

#### Files Updated (by this Composer prompt)
- 01_STRATEGY.md (Enterprise tier, feature matrix, pricing, 4 new lessons)
- 04_TECH_CONSTRAINTS.md (Kinde in approved stack, Section 2.2.1, WorkOS banned)
- 09_FEATURE_BACKLOG.md (Feature #43 Kinde Migration P0, Feature #36 upgrade)
- 10_INFRASTRUCTURE_SETUP.md (Kinde in cost projections)
- 00_CONTEXT_MEMORY.md (this session log, rules #46-49, auth rules obsolescence note)

#### Next Session Goals
- [ ] Feature #43: Kinde Auth Migration (Claude Code — 2-3 days)
- [ ] Kinde dev account created, quickstart validated
- [ ] Continue Milestone 1 deliverables (invoice automation, sales materials)
