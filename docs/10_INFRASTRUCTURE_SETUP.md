# GapRoll — Infrastructure Setup
## Hosting, Funding, Automation & Operational Security

**Last Updated:** 2026-02-14  
**Owner:** CPTO  
**Status:** Pre-production (deployment: Mar 1, 2026)

---

## 1. Hosting Strategy

### 1.1 Decision: Hetzner + Coolify

**Stack:**
- **VPS:** Hetzner Cloud CPX31 (4 vCPU, 8GB RAM, 160GB SSD)
- **Deployment:** Coolify (open-source Vercel alternative, self-hosted PaaS)
- **Cost:** €12.90/month (~58 PLN/month)

**Why NOT Vercel/Railway/Heroku:**
- ❌ Vercel: €40-60/month, vendor lock-in, non-EU default regions
- ❌ Railway: €20+/month, US-based (RODO concerns)
- ❌ Heroku: Deprecated (sunset 2023), expensive
- ✅ Hetzner: 70% cost savings, EU data residency (Germany/Finland), full control

**Why Coolify (not manual Docker):**
- ✅ Vercel-like UX but self-hosted
- ✅ Git-based deploy (push to main → auto-deploy)
- ✅ SSL via Let's Encrypt (automatic)
- ✅ Can manage multiple services (Next.js + FastAPI + Redis + Weaviate on same VPS)
- ❌ Manual Docker Compose = too much overhead for solo founder

**Setup Timeline:**
| Date | Action | Time Required | Owner |
|------|--------|---------------|-------|
| Feb 25 | Rent Hetzner VPS (CPX31, Germany datacenter) | 5 min | Bartek |
| Feb 26 | Install Coolify (one-click setup) | 30 min | Bartek |
| Feb 27 | Deploy test (Next.js + FastAPI) | 1 hour | Bartek |
| Mar 1 | Production deploy (Milestone 1 ready) | 1 hour | Bartek |

**Datacenter:** Falkenstein, Germany (closest to Poland, <20ms latency)

---

### 1.2 Infrastructure Components

| Component | Technology | Hosting | Cost/Month |
|-----------|-----------|---------|------------|
| **Frontend** | Next.js 15 (App Router, RSC) | Hetzner (Coolify) | Included in VPS |
| **Backend API** | Python FastAPI | Hetzner (Coolify) | Included in VPS |
| **Database** | Supabase PostgreSQL | Supabase Cloud (EU) | €25 (Pro plan) |
| **Auth** | Supabase Auth | Supabase Cloud | Included |
| **Vector Store** | Weaviate | Hetzner (Docker) | Included in VPS |
| **Cache** | Redis | Hetzner (Docker) | Included in VPS |
| **Email** | Mailchimp + Postmark | Cloud | €20 + pay-per-use |
| **Monitoring** | LangSmith | Cloud | $0 (Free tier: 5k traces/month) |
| **Error Tracking** | Sentry | Cloud | $0 (Free tier: 10k events/month) |
| **Invoice** | Fakturownia.pl | Cloud | 50 PLN (~€11) |
| **Payments** | Przelewy24 | Cloud | 1.49% per transaction |
| **Automation** | n8n.io | Cloud SaaS | €20 |
| **CI/CD** | GitHub Actions | Cloud | $0 (included in GitHub) |
| **Backup** | Hetzner Storage Box | Hetzner | €3.81 (1TB) |

**Total Monthly Cost:**
- **Month 1 (Feb):** €12.90 (VPS only) = ~58 PLN
- **Month 3 (Apr):** €130 (~585 PLN) - all services active
- **Month 6 (Jul):** €560 (~2,520 PLN) - at scale (1000 users, 100k API calls)

**Cost as % of Revenue:**
- Jun (3-5k MRR): €130 / €700 = **18.5%** (acceptable for early stage)
- Sep (15-20k MRR): €560 / €3,500 = **16%** (healthy SaaS margin)
- Target: <10% by Dec (economies of scale)

---

### 1.3 Deployment Pipeline

**Git Flow:**
```
Developer (Bartek) commits to `main` branch
  ↓
GitHub webhook triggers Coolify
  ↓
Coolify pulls latest code
  ↓
Builds Next.js (npm run build)
  ↓
Builds FastAPI (Docker container)
  ↓
Runs tests (optional: can skip in early stage)
  ↓
Deploys to production (zero downtime)
  ↓
Health check (ping /api/health)
  ↓
Rollback if health check fails
```

**Rollback Strategy:**
- Coolify keeps last 3 deployments
- One-click rollback via UI
- Database migrations: manual (via Supabase dashboard, not auto-migrated)

---

### 1.4 Disaster Recovery Plan

**Backup Strategy:**
- **Database:** Supabase auto-backup (daily, retained 7 days on Pro plan)
- **Additional backup:** Daily cron job dumps Supabase → Hetzner Storage Box (retained 30 days)
- **Code:** GitHub (source of truth, already backed up)
- **User uploads:** Supabase Storage (replicated across EU datacenters)

**Recovery Scenarios:**

| Scenario | Impact | Recovery Time | Action |
|----------|--------|---------------|--------|
| Hetzner VPS crash | HIGH | 30 min | Spin up new VPS, run Coolify restore script |
| Supabase outage | CRITICAL | 0 min (wait) | Supabase has 99.9% SLA, auto-failover |
| Accidental DB deletion | CRITICAL | 2 hours | Restore from Hetzner backup (manual SQL import) |
| Bad deployment | MEDIUM | 5 min | One-click rollback via Coolify |
| Domain DNS issue | HIGH | 1 hour | Update DNS records, 15-60 min propagation |

---

### 1.5 Hetzner + Coolify — Landing Page Deploy

**Status:** TODO (mar 1-3, 2026)

**Kroki:**
1. Hetzner Cloud → stwórz VPS CPX21 (€7.49/mc, 3 vCPU, 4GB RAM)
2. Zainstaluj Coolify (panel deploy): `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
3. Coolify → dodaj projekt gaproll-landing (Next.js)
4. Połącz z GitHub repo
5. Cloudflare → gaproll.eu → DNS → Add record:
   - Type: A | Name: @ | Content: [Hetzner VPS IP] | Proxy: Proxied
   - Type: CNAME | Name: www | Content: gaproll.eu | Proxy: Proxied
6. Coolify → ustaw domenę: gaproll.eu
7. SSL: Cloudflare full (strict) mode

**Po deployu:**
- Google Search Console → dodaj gaproll.eu → zweryfikuj → "Request indexing"
- sitemap.xml (Next.js generuje automatycznie pod /sitemap.xml)

**PRODUCTION NOTES:**
- SSH key: WSL key added to /root/.ssh/authorized_keys
- Coolify SSH fix: Coolify container pub keys added to host authorized_keys
- Traefik routing: manual /data/coolify/proxy/dynamic/gaproll-eu.yaml (survives redeploys)
- standalone path: server.js at /app/.next/standalone/server.js (NOT apps/web/)
- Static files: postbuild script in package.json copies public/ and .next/static/ to standalone
- Start command: HOSTNAME=0.0.0.0 node .next/standalone/server.js

⚠️ **BEFORE next redeploy:** SSH → delete `/data/coolify/proxy/dynamic/gaproll-eu.yaml` permanently (see INFRA-001 in 00_CONTEXT_MEMORY.md).

### 1.6 Environment Variables (Backend / n8n)

Dodatkowe zmienne dla API (FastAPI) i workflowów n8n:

```
N8N_WEBHOOK_ERI_SEND=https://n8n.gaproll.eu/webhook/eri-send
N8N_WEBHOOK_ERI_REMINDER=https://n8n.gaproll.eu/webhook/eri-reminder
```

**Supabase Storage bucket "employee-requests":** private, limit 5MB, MIME `application/pdf`. RLS policy wymagana dla service_role — bez niej upload failuje nawet z service role key. Przykład: `CREATE POLICY "Service role full access" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'employee-requests') WITH CHECK (bucket_id = 'employee-requests').`

**Monitoring Alerts (Slack integration):**
- API response time >2s for 5 min → alert
- Error rate >5% → alert
- Database CPU >80% for 10 min → alert
- Disk space <10% free → alert
- Invoice generation failed → immediate alert

---

## 4. Known Issues & Fixes

### Traefik 502 After Redeploy
- **Cause:** Static file router in `/data/coolify/proxy/dynamic/gaproll-eu.yaml` overrides Docker label routers with hardcoded container name suffix.
- **Permanent fix:** SSH into server → `rm /data/coolify/proxy/dynamic/gaproll-eu.yaml` → www redirect via Cloudflare Page Rules instead.
- **Temporary workaround:** Update container suffix in yaml after each redeploy (see INFRA-001 in 00_CONTEXT_MEMORY.md).
- **Diagnosis commands:**
  - `docker ps --format "table {{.Names}}\t{{.Networks}}" | grep gaproll` — verify container network
  - `docker logs coolify-proxy --tail 50` — check Traefik routing errors
  - `curl -sI https://gaproll.eu` — verify live status

---

## 2. Funding Applications

### 2.1 Microsoft for Startups Founders Hub

**Value:** $150,000 Azure credits (2-year validity)

**Requirements:**
- [x] Active company (Sp. z o.o.) → Getting Feb 15
- [x] Company email domain (@gaproll.eu) → Getting Feb 18
- [x] LinkedIn company page → Creating Feb 19
- [x] Pitch deck (10 slides) → Already in timeline (Mar 8 sales materials)
- [ ] Application form → Submit Feb 20

**Application URL:** https://www.microsoft.com/en-us/startups

**Application Timeline:**
| Date | Action | Owner |
|------|--------|-------|
| Feb 18 | Domain purchased (gaproll.eu) | Bartek |
| Feb 19 | Setup email (bartek@gaproll.eu via Google Workspace free tier) | Bartek |
| Feb 19 | Create LinkedIn company page | Bartek |
| Feb 20 | Fill MS Founders Hub application | Bartek |
| Feb 25 | Follow-up email if no auto-response | Bartek |
| Mar 10 | Expected approval (10-15 business days typical) | Microsoft |

**What We'll Use Credits For:**

| Service | Estimated Usage | Value (2 years) |
|---------|----------------|-----------------|
| **Azure OpenAI Service** | GPT-4o for agents (Hunter, Guardian, Analyst) | ~$60,000 |
| **Bing Search API** | Hunter lead discovery (company search) | ~$12,000 |
| **Azure Cognitive Services** | OCR for Benchmark PDF parsing | ~$5,000 |
| **Azure Storage** | Backup redundancy (optional, Hetzner primary) | ~$3,000 |
| **Total** | | **~$80,000 actual usage** |

**Approval Probability:** **85% (HIGH)**

**Rationale:**
- ✅ B2B SaaS (their sweet spot)
- ✅ EU compliance focus (aligned with Microsoft's EU data strategy)
- ✅ Clear Azure OpenAI use case (not vague "AI for good")
- ✅ Traction: MVP built, paying customers by May (shows seriousness)
- ⚠️ Risk: We're bootstrapped (no VC backing), but many accepted without VC

**If Rejected:**
- Backup: OpenAI API credits (apply Q3 2026 if we raise pre-seed, requires investor intro)
- Mitigation: OpenAI direct ($20/month for GPT-4o usage = affordable at small scale)

---

### 2.2 Scaleway Startup Program

**Value:** €2,000-5,000 credits

**Requirements:**
- [x] Active company → Getting Feb 15
- [x] Company docs (KRS extract PDF) → Available after S24 registration
- [ ] Description of use case → Write Feb 19
- [ ] Application form → Submit Feb 20

**Application URL:** https://www.scaleway.com/en/startup-program/

**Application Timeline:**
| Date | Action |
|------|--------|
| Feb 16 | KRS registration complete → download extract PDF |
| Feb 19 | Write use case: "EU data residency for RODO compliance, object storage for backups" |
| Feb 20 | Submit application |
| Mar 5 | Expected approval (2-3 weeks typical) |

**What We'll Use Credits For:**

| Service | Estimated Usage | Cost (without credits) |
|---------|----------------|------------------------|
| **Object Storage** | Supabase backups (daily dumps, 30-day retention) | ~€20/month |
| **GPU Instances** | Future: custom model training (Phase 4+) | ~€200/month (if/when needed) |
| **Total** | | ~€20/month initially |

**Approval Probability:** **60% (MEDIUM)**

**Rationale:**
- ✅ EU data residency (strong fit for Scaleway's positioning)
- ✅ Clear object storage use case
- ⚠️ We're not AI/ML heavy (they prefer deep learning startups)
- ⚠️ Competition: many applicants, selective program

**If Rejected:**
- Alternative: Hetzner Storage Boxes (€3.81/month for 1TB) → affordable without credits
- No blocking impact, just nice-to-have

---

## 3. Automation Setup (n8n.io)

### 3.1 Decision: n8n Cloud SaaS (NOT self-hosted)

**Why Cloud SaaS:**
- ✅ €20/month (unlimited workflows) vs self-hosted (VPS overhead, maintenance)
- ✅ Zero DevOps (no Docker, no updates, no security patches)
- ✅ Built-in monitoring (uptime, execution logs)
- ❌ Self-hosted = more control, but Bartek is solo until Q3 (can't waste time on infra)

**Cost:** €20/month (~90 PLN/month)

**Start Date:** Mar 1 (after Milestone 1, when we have customers to onboard)

---

### 3.2 Workflow 1: Partner Onboarding (Priority P0)

**Trigger:** Partner fills "Become a Partner" form (Typeform or Google Forms)

**Steps:**
1. Create partner record in Supabase (`partners` table)
2. Send partner agreement PDF (DocuSign link or email attachment)
3. Send onboarding video (Loom link in welcome email)
4. Schedule kickoff call (Calendly auto-booking link)
5. Add to partner CRM (Notion database or Airtable)
6. Notify Slack #new-partners channel

**Value:** 100% automated partner onboarding (zero manual work for Bartek)

**Setup Time:** ~3 hours

**Email Template (Polish, formal tone):**
```
Temat: Witamy w Programie Partnerskim GapRoll

Szanowna Pani / Szanowny Panie,

Dziękujemy za zainteresowanie współpracą z GapRoll!

Następne kroki:
1. Podpisanie umowy partnerskiej (link poniżej, 5 min)
2. Obejrzenie filmu onboardingowego (10 min)
3. Umówienie spotkania kickoff (30 min)

[Link do umowy] [Link do filmu] [Umów spotkanie]

Pozdrawiam,
Zespół GapRoll
```

---

### 3.3 Workflow 2: Customer Onboarding (Priority P0)

**Trigger:** New customer signs up (Supabase webhook: `INSERT` on `customers` table)

**Steps:**
1. Send welcome email (Mailchimp: "Witamy w GapRoll" with first steps)
2. Add to Customer.io journey (14-day email sequence):
   - Day 1: "Jak zacząć? (krok po kroku)"
   - Day 3: "Wygeneruj pierwszy raport Art. 16"
   - Day 7: "5 najczęstszych błędów w EVG"
   - Day 14: "Rozważ upgrade do Strategia (ROI calculator)"
3. Create Notion page for customer notes (for manual follow-up if needed)
4. Notify Slack #new-customers channel
5. If Strategia tier: schedule onboarding call (Calendly)

**Value:** Saves 30 min/customer × 50 customers/month = 25 hours/month

**Setup Time:** ~2 hours

---

### 3.4 Workflow 3: Hunter Lead Enrichment (Priority P1)

**Trigger:** Hunter agent finds company (manual trigger from dashboard: "Enrich this lead")

**Steps:**
1. Call KRS API (fetch: company size, revenue, NIP, legal form)
2. If not in KRS → call CEIDG API (individual entrepreneurs)
3. Store enriched data in Supabase `leads` table
4. Return to Hunter agent for scoring
5. If score >70 → queue for outreach

**Value:** Lazy loading (only call paid KRS API when lead score >70%, saves ~70% cost)

**Cost:** KRS API ~1 PLN/query, budget 30-50 PLN/day (30-50 leads enriched/day)

**Setup Time:** ~2 hours

---

### 3.5 Workflow 4: CEO Weekly Dashboard (Priority P2)

**Trigger:** Every Monday 9 AM (cron schedule)

**Steps:**
1. Query Supabase:
   - New customers (last 7 days)
   - MRR change (current vs previous week)
   - Churn (customers who cancelled)
2. Query LangSmith:
   - Agent usage (Hunter emails sent, Guardian queries answered)
   - Token consumption (cost tracking)
3. Generate PDF report (via n8n PDF module or WeasyPrint)
4. Send to bartek@gaproll.eu

**Value:** Weekly snapshot without manual SQL queries (saves 1 hour/week)

**Setup Time:** ~2 hours

---

### 3.6 Total n8n Setup

| Workflow | Priority | Setup Time | Value |
|----------|----------|------------|-------|
| Partner Onboarding | P0 | 3h | 100% automation |
| Customer Onboarding | P0 | 2h | Saves 25h/month |
| Hunter Lead Enrichment | P1 | 2h | Saves 70% API cost |
| CEO Weekly Dashboard | P2 | 2h | Saves 1h/week |
| **Total** | | **9 hours** | **ROI: break-even after 1 month** |

**Timeline:** Week 6 (Mar 9-15) — setup all workflows

---

## 5. Email Infrastructure

### 5.1 Stack Decision

| Use Case | Service | Cost | Rationale |
|----------|---------|------|-----------|
| **Marketing emails** | Mailchimp | €20/month (500 contacts) | GDPR-compliant, EU servers, Polish templates |
| **Behavior-triggered emails** | Customer.io | €100/month (1000 users) | Sophisticated journeys, event tracking |
| **Transactional emails** | Postmark | Pay-per-use (~€10/month) | 99%+ deliverability for invoices, password resets |
| **Backup transactional** | SendGrid | Free tier (100 emails/day) | Failover redundancy |

**Why NOT Mailgun/AWS SES:**
- Mailgun: US-based, GDPR concerns
- AWS SES: Complex setup, we're avoiding AWS (see 04_TECH_CONSTRAINTS)

---

### 5.2 Domain Authentication (MANDATORY before ANY email)

**Setup (Feb 22, immediately after domain purchase):**

1. **SPF Record** (Sender Policy Framework):
```
TXT record: v=spf1 include:servers.mcsv.net include:_spf.customer.io include:spf.mtasv.net ~all
```

2. **DKIM Records** (DomainKeys Identified Mail):
- Mailchimp: auto-generated, add TXT records (provided in Mailchimp dashboard)
- Customer.io: auto-generated, add TXT records
- Postmark: auto-generated, add TXT records

3. **DMARC Record** (Domain-based Message Authentication):
```
TXT record: v=DMARC1; p=none; rua=mailto:bartek@gaproll.eu
```
- Start with `p=none` (monitoring only)
- Week 2: escalate to `p=quarantine` (if reports look good)
- Week 4: escalate to `p=reject` (maximum protection)

**Why CRITICAL:**
- Without SPF/DKIM/DMARC → emails go to spam folder (death for cold outreach)
- Gmail/Outlook REQUIRE these in 2026 (new anti-spam policies)

---

### 5.3 Domain Warming Protocol (6 WEEKS MINIMUM)

**CRITICAL:** Cannot skip this. Skipping = blacklisted domain = business death.

| Week | Daily Volume | Action | Deliverability Target |
|------|--------------|--------|----------------------|
| **1** (Feb 22-29) | 5-10 emails | Warm contacts only (friends, advisors, test accounts) | >98% inbox |
| **2** (Mar 1-7) | 10-20 emails | Gradual increase, monitor bounce rate (<2%) | >97% inbox |
| **3** (Mar 8-14) | 20-50 emails | Test small manual outreach (warm intros) | >96% inbox |
| **4** (Mar 15-21) | 50-100 emails | Increase volume slowly, watch spam complaints (<0.5%) | >95% inbox |
| **5** (Mar 22-28) | 100-150 emails | Approaching target volume | >95% inbox |
| **6** (Mar 29 - Apr 4) | 150-200 emails | Stabilize at target volume | >95% inbox |
| **7+** (Apr 5+) | 200 emails (max) | **Domain warmed** — Hunter automation can start | >95% inbox |

**Monitoring (DAILY):**
- Bounce rate (target: <2%)
- Spam complaint rate (target: <0.5%)
- Open rate (target: >20% for warm outreach, >10% for cold)
- Inbox placement (use tool: mail-tester.com)

**Red Flags (PAUSE immediately if any occur):**
- Bounce rate >3%
- Spam complaints >0.5%
- Deliverability <90%
- Domain listed on blacklist (check: mxtoolbox.com/blacklists)

**If Domain Gets Blacklisted:**
1. STOP all sending immediately
2. Identify cause (bad list, content, sending pattern)
3. Request removal from blacklist (most allow one-time delisting)
4. Restart warming from Week 1 (cannot rush recovery)

---

### 5.4 Hunter Agent Email Limits (After Warming)

| Period | Daily Limit | Rationale |
|--------|-------------|-----------|
| **Warm-up (Feb-Apr)** | 20/day | Domain warming phase |
| **Discovery (May-Jun)** | 50/day | Manual sales, low volume |
| **Outreach (Jul+)** | 100/day | Hunter automation validated |
| **Hard limit (NEVER exceed)** | 200/day | Spam trigger threshold |

**Monitoring Alerts:**
- Bounce rate >3% → **PAUSE Hunter agent**
- Spam complaints >0.5% → **Manual review required**
- Deliverability <90% → **Domain audit**

---

### 5.5 Domain Warming Tool

**Narzędzie:** Instantly.ai ($37/mc)  
**Start:** 1 marca 2026  
**Konto:** bartek@gaproll.eu

**Dlaczego Instantly (nie Mailreach):**
- Warming + cold outreach w jednym narzędziu
- Własna sieć warm-up pool (tysiące kont)
- Integracja z Hunter agentem w fazie 2

**Harmonogram warmingu:**

| Tydzień | Dzienna liczba | Action |
|---------|----------------|--------|
| 1-2 (mar 1-14) | 5-10 | Automatically warmed emails w sieci Instantly |
| 3-4 (mar 15-28) | 10-30 | Warm intros + manualne outreachy |
| 5-6 (mar 29 - apr 11) | 30-50 | Pierwsze manualne kampanie |
| 7+ (apr 14+) | 50-100 | Hunter agent może startować |

**SPF update gdy Instantly aktywny:**  
W Cloudflare → gaproll.eu → DNS → edytuj rekord SPF:
```
v=spf1 include:_spf.google.com include:spf.instantlyai.com ~all
```

---

## 6. Stealth Mode — Operational Security

### 6.1 Context (Why Stealth?)

**From user memory:**
> "Bartek is employed under non-compete agreement, requiring low-profile approach with institutional rather than personal branding."

**Constraints:**
- ❌ NO personal LinkedIn posts about GapRoll (until after leaving corpo)
- ❌ NO "Founder & CEO" title on personal LinkedIn
- ✅ Institutional branding (GapRoll company page, NOT Bartek personal brand)
- ✅ Agents do outreach (Hunter sends emails, NOT Bartek)

---

### 6.2 Red Lines (DO NOT CROSS)

**Forbidden Actions (Until Non-Compete Expires):**

| Action | Risk Level | Consequence if Violated |
|--------|-----------|-------------------------|
| Personal LinkedIn post about GapRoll | CRITICAL | Legal action, termination, lawsuit |
| "I'm building X" on any social media (Twitter/X, Reddit, HackerNews) | CRITICAL | Traceable, permanent record |
| Speaking at conferences/podcasts | CRITICAL | Public record, Google searchable |
| Mentioning GapRoll to corpo colleagues (even trusted ones) | HIGH | NDAs exist, gossip spreads |
| Using corpo laptop/email for GapRoll work | CRITICAL | Assume keylogged and monitored |
| Using corpo WiFi for GapRoll work (even with VPN) | MEDIUM | Traffic analysis possible |
| GitHub repo public | HIGH | Searchable, linkable to personal GitHub |

---

### 6.3 Safe Practices

**Communication Channels (Safe):**

| Channel | Safety Level | Use For |
|---------|-------------|---------|
| **Personal laptop** (NOT corpo) | ✅ SAFE | All GapRoll work |
| **Personal email (Gmail)** | ✅ SAFE | External communication |
| **Company email (@gaproll.eu)** | ✅ SAFE | Once domain purchased (Feb 18) |
| **Personal phone (mobile data)** | ✅ SAFE | LinkedIn, emails, calls |
| **VPN on personal devices** | ✅ SAFE | Extra privacy layer |
| **Corpo laptop** | ❌ NEVER | Assume monitored |
| **Corpo email** | ❌ NEVER | Monitored, auditable |
| **Corpo WiFi** | ⚠️ RISKY | Use mobile hotspot instead |

**Public Presence (Safe):**

| Activity | Status | Notes |
|----------|--------|-------|
| **LinkedIn company page for GapRoll** | ✅ SAFE | No personal affiliation visible |
| **Domain registration (gaproll.eu)** | ✅ SAFE | Use company name, not personal |
| **GitHub repo (private)** | ✅ SAFE | Keep private until after leaving corpo |
| **Pitch deck with Bartek's name** | ⚠️ RISKY | Use "GapRoll Team" instead of personal name in title slide |
| **MS Founders Hub application** | ✅ SAFE | Uses company email, doesn't require personal LinkedIn |
| **Partner outreach (accounting firms)** | ✅ SAFE | Hunter agent sends emails (from hello@gaproll.eu), not Bartek |
| **Webinars** | ⚠️ RISKY | Don't host personally — use recorded video OR hire external presenter |
| **Twitter/X account for GapRoll** | ❌ SKIP | Too public, not needed for Polish B2B market |
| **Reddit/HackerNews posts** | ❌ SKIP | Too public, risk of corpo discovery |

---

### 6.4 When Can Stealth End?

**Conditions (ANY of these):**
1. ✅ Employment terminated (voluntary resignation or mutual agreement)
2. ✅ Non-compete period expired (check contract: typically 6-12 months)
3. ✅ Lawyer confirms safe (consult radca prawny, show employment contract + non-compete clause)

**Until then:** Maintain stealth, institutional branding only, zero personal association.

---

## 7. Cost Projections

### 7.1 Monthly Infrastructure Cost

| Month | Services Active | Total Cost (EUR) | Total Cost (PLN) | MRR | % of Revenue |
|-------|----------------|------------------|------------------|-----|--------------|
| **Feb** | VPS only | €12.90 | ~58 PLN | 0 | N/A |
| **Mar** | VPS + Supabase + n8n | €58 | ~261 PLN | 0 (pre-launch) | N/A |
| **Apr** | All except high-volume email | €130 | ~585 PLN | ~3k PLN (pilot) | 19.5% |
| **May** | All | €200 | ~900 PLN | ~10k PLN | 9% ✅ |
| **Jun** | All + scaling | €300 | ~1,350 PLN | ~15k PLN | 9% ✅ |
| **Sep** | At scale (500 users) | €560 | ~2,520 PLN | ~20k PLN | 12.6% |
| **Dec** | At scale (1000 users) | €800 | ~3,600 PLN | ~50k PLN | 7.2% ✅ |

**Target:** <10% infrastructure cost as % of revenue (healthy SaaS margin)

**Benchmark:** Healthy B2B SaaS = 5-15% infrastructure cost

---

### 7.2 Cost Breakdown at Scale (Dec 2026, 1000 users)

| Service | Cost/Month (EUR) | Notes |
|---------|------------------|-------|
| Hetzner VPS (CPX31) | €12.90 | May need upgrade to CPX41 (€26) |
| Supabase Pro | €25 | 8GB DB, 250GB bandwidth |
| Kinde Scale (Enterprise auth) | €230 (~$250) | Flat fee, unlimited SSO. Only if Enterprise clients exist. $0 if none. |
| Mailchimp | €50 | 2,500 contacts |
| Customer.io | €150 | 5,000 users |
| Postmark | €50 | ~10k transactional emails/month |
| n8n.io | €20 | Unlimited workflows |
| Fakturownia.pl | €11 (~50 PLN) | 100 invoices/month |
| LangSmith | €100 | 50k traces/month (paid plan) |
| Sentry | €26 | 50k events/month (paid plan) |
| OpenAI API | €200 | GPT-4o-mini, ~2M tokens/month |
| Hetzner Storage Box | €3.81 | 1TB backups |
| **Total (with Kinde)** | **~€880** | **~3,960 PLN** |
| **Total (without Kinde)** | **~€650** | **~2,925 PLN** |

**Note:** At 1000 users with 50k MRR, €650 = **1.3% of revenue** (excellent margin)

**Note on Kinde:** $250/mies flat regardless of enterprise client count. Activated only when first Enterprise deal closes. MŚP clients use Kinde Free tier ($0). If zero enterprise clients, Kinde cost = $0.

---

## 8. Security & Compliance

**Auth Migration (Mar 2026):** Supabase Auth replaced by Kinde. Supabase remains as database only. All auth flows (login, session, JWT) managed by Kinde. See 04_TECH_CONSTRAINTS.md Section 2.2.1.

### 8.1 RODO / GDPR Compliance

**Data Residency:**
- ✅ Hetzner: Germany/Finland datacenters (EU)
- ✅ Supabase: EU region selected
- ✅ Mailchimp: EU servers option enabled
- ❌ Avoid: AWS US, Azure US, GCP US (default non-EU)

**Data Processing Agreement (DPA):**
- Required for all processors: Supabase, Hetzner, Mailchimp, Customer.io
- Sign DPA with each (standard templates available)
- Store in `/legal/DPAs/` folder

**User Rights (Art. 15-22 RODO):**
- Right to access: User can download all their data (CSV export via dashboard)
- Right to deletion: User can delete account + all data (30-day grace period)
- Right to portability: CSV export includes all personal data
- Right to rectification: User can edit all profile fields

---

### 8.2 EU AI Act Compliance

**High-Risk AI System:** EVG Engine (job evaluation affects employment decisions)

**Requirements (Art. 14 EU AI Act):**
- ✅ Human oversight (HITL): Manual Override UI (Feature #12)
- ✅ Transparency: Explainability system (08_EXPLAINABILITY_ROADMAP.md)
- ✅ Accuracy: Validation set >90% accuracy (Golden Datasets)
- ✅ Robustness: Fallback to manual scoring if AI fails
- ✅ Logging: Audit trail for all AI decisions (stored 3 years)

**Documentation Required:**
- Technical documentation (AI model card, training data sources)
- Risk assessment (DPIA - Data Protection Impact Assessment)
- Conformity assessment (self-assessment until mid-2027, then third-party)

**Timeline:**
- Feb-May: Build with compliance in mind (HITL, audit trails)
- Apr: Conduct DPIA (week 12, before Beta release)
- May: EU AI Act audit (internal, document readiness)

---

## 9. Monitoring & Alerts

### 9.1 Critical Alerts (Slack notifications)

**Infrastructure:**
- VPS CPU >80% for 10 min
- VPS disk <10% free
- API response time >2s for 5 min
- Error rate >5%
- Database connections >80% of pool

**Business:**
- Invoice generation failed
- Payment webhook not received (24h after subscription)
- Customer cancellation (churn alert)
- Partner signup

**Email Deliverability:**
- Bounce rate >3%
- Spam complaint rate >0.5%
- Domain blacklisted

---

### 9.2 Dashboards

**Grafana (optional, Phase 3+):**
- Infrastructure metrics (CPU, RAM, disk, network)
- API performance (request rate, latency, errors)
- Database performance (connections, query time)

**LangSmith:**
- Agent performance (Hunter, Guardian, Analyst)
- Token consumption (cost tracking)
- Latency distribution

**Supabase Dashboard:**
- RLS policies audit
- Database size growth
- Active connections

---

**END OF 10_INFRASTRUCTURE_SETUP.md**

**Next Review:** March 1, 2026 (after production deployment)

**Key Updates This Version (Feb 14, 2026):**
- ✅ Hetzner + Coolify decision (€12.90/month vs €40-60 Vercel)
- ✅ MS Founders Hub roadmap ($150k credits, 85% approval probability)
- ✅ Scaleway roadmap (€2-5k credits, 60% approval probability)
- ✅ n8n workflows (4 total, 9h setup, ROI after 1 month)
- ✅ Email infrastructure (domain warming 6 weeks, Hunter limits)
- ✅ Stealth mode protocols (red lines, safe practices)
- ✅ Cost projections (Feb: €12.90, Dec: €650 = 1.3% of revenue)
- ✅ RODO/GDPR + EU AI Act compliance requirements
