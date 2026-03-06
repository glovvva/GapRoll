# GapRoll — Tech Constraints
## Lean Stack Enforcement & Architecture Rules

**Last Updated:** 2026-03-03  
**Previous Name:** PayCompass (sunset Feb 14, 2026)  
**Rule:** Reject ANY suggestion that violates this stack. No exceptions.

---

## 1. Core Principle: Lean Stack

**Philosophy:**
> Use boring, proven tech. Optimize for solo founder velocity, not enterprise scale.

**Anti-Patterns We Avoid:**
- ❌ Microservices (overengineered for <1M users)
- ❌ Kubernetes (DevOps nightmare for solo founder)
- ❌ NoSQL "because scale" (PostgreSQL handles billions of rows)
- ❌ Latest shiny framework (Next.js 15 is stable, don't chase Next.js 16 beta)

---

## 2. Approved Stack

### 2.1 Frontend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js | 15 (App Router) | RSC, Suspense, Streaming, React 19 ready |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 3.x | Utility-first, no CSS-in-JS overhead |
| **Components** | Shadcn/UI | Latest | Copy-paste components, full control |
| **Icons** | Lucide React | Latest | Tree-shakeable, consistent design |
| **Forms** | React Hook Form | 7.x | Performant, minimal re-renders |
| **Validation** | Zod | 3.x | TypeScript-first schema validation |
| **State** | Zustand | 4.x | Minimal boilerplate, no Redux complexity |
| **Data Fetching** | TanStack Query | 5.x | Caching, optimistic updates, SSR support |
| **Charts** | Recharts | 2.x | Declarative, composable charts |
| **Animation** | Framer Motion | 11.x | Production-ready, gesture support |
| **Date** | date-fns | 3.x | Tree-shakeable (vs Moment.js bloat) |
| **Tables** | TanStack Table | 8.x | Headless, full control over UI |

**BANNED:**
- ❌ Material UI, Chakra UI (opinionated styles, hard to customize)
- ❌ Ant Design (Chinese design system, not EU-friendly)
- ❌ Styled Components, Emotion (CSS-in-JS overhead, Next.js warns against it)
- ❌ Redux, MobX (overengineered state management)

---

### 2.2 Backend

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | FastAPI | 0.110+ | Async, auto docs, Pydantic validation |
| **Language** | Python | 3.12 | Type hints, performance improvements |
| **Database** | PostgreSQL | 16 | ACID, RLS, JSONB, full-text search |
| **ORM** | SQLAlchemy | 2.x | Mature, async support, type-safe |
| **Migrations** | Alembic | 1.x | Industry standard for SQLAlchemy |
| **Auth** | Kinde | Free / Scale | SSO/SAML, email/password, OAuth, RBAC. Replaces Supabase Auth (Mar 2026). See Section 2.2.1 |
| **Validation** | Pydantic | 2.x | Type-safe, FastAPI native |
| **Task Queue** | Celery (Phase 3+) | 5.x | Async tasks, not needed until scale |
| **HTTP Client** | httpx | 0.27+ | Async, modern (vs requests) |

**BANNED:**
- ❌ Django (too heavy, admin panel not needed)
- ❌ Flask (async support weak, FastAPI superior)
- ❌ MongoDB, Firebase (schema flexibility = chaos for compliance)
- ❌ Prisma (Node.js ORM, we're Python backend)
- ❌ Supabase Auth (replaced by Kinde, Mar 2026. Supabase stays as database only.)

### 2.2.1 Auth Strategy: Kinde (replaces Supabase Auth)

**Decision (Mar 2026):** Kinde replaces Supabase Auth as SOLE auth provider for ALL tiers.

| Tier | Kinde Plan | Features | Cost |
|------|-----------|----------|------|
| **Compliance / Strategia** | Free | Email/password, Google OAuth, Magic Links | $0 (10,500 MAU) |
| **Enterprise** | Scale ($250/mies) | + SSO/SAML, SCIM, RBAC, Audit Logs | $250/mies flat (unlimited connections) |

**Why Kinde (not WorkOS, not Supabase Auth):**
- ✅ Kinde Scale: $250/mies flat = unlimited SSO connections. WorkOS: $125/connection = $2,500/mies at 10 clients (10x more expensive)
- ✅ Kinde: Org-first architecture (native multi-tenant B2B), RBAC built-in, Next.js SDK
- ✅ One auth system = no dual-provider overhead, simpler codebase, easier debugging
- ✅ Migrating now (0 clients) is 100x easier than migrating later (100 clients on Supabase Auth)
- ⚠️ Kinde SCIM: beta (production ~Q2-Q3 2026). Acceptable — our enterprise clients = 5-10 users per org, not 200

**BANNED auth providers:**
- ❌ WorkOS ($125/connection = unscalable per-connection pricing for multi-tenant B2B)
- ❌ Auth0 (expensive post-Okta acquisition, complex pricing)
- ❌ Clerk (B2C-optimized, SSO pricing traps, no SCIM)
- ❌ Keycloak / Authentik self-hosted (DevOps burden kills solo founder)
- ❌ Supabase Auth (replaced — Supabase stays as PostgreSQL database only)

**Architecture after migration:**
```
Frontend (Next.js)
  → Kinde hosted login (email/password OR SSO/SAML)
  → Kinde session (JWT in cookie)
  → API call to FastAPI (Authorization: Bearer <kinde_jwt>)
    → FastAPI validates Kinde JWT
    → FastAPI queries Supabase with service_role_key (bypasses RLS)
    → Response with ComplianceContext
```

- **Supabase = database ONLY.** No more auth.uid() in RLS for application queries.
- **FastAPI enforces authorization.** Validates Kinde JWT, checks org membership, enforces tenant isolation.
- **service_role_key pattern = already established** (Hard-Won Rule #1, #21).
- **Kinde webhook → Supabase profiles sync.** On user.created/updated/deleted, Kinde sends webhook, FastAPI upserts/deletes in Supabase profiles table.

**Migration:** Feature #43 (Kinde Auth Migration), 14-16h, Week 7 (Mar 16-22). See 09_FEATURE_BACKLOG.md.

---

### 2.3 Database & Storage

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Primary DB** | Supabase PostgreSQL | Managed, RLS, EU hosting, auth integration |
| **Vector Store** | Weaviate | Open-source, GraphRAG support, self-hosted |
| **Cache** | Redis | Fast, simple, key-value store for sessions |
| **File Storage** | Supabase Storage | S3-compatible, EU data residency |
| **Backup** | Hetzner Storage Box | €3.81/month for 1TB, EU-based |

**BANNED:**
- ❌ AWS RDS, DynamoDB (vendor lock-in, US-centric)
- ❌ MongoDB Atlas (NoSQL not needed, RODO concerns)
- ❌ Pinecone (expensive, closed-source)

---

### 2.4 AI & Agents

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Orchestration** | LangGraph | Deterministic, HITL breakpoints, checkpointing |
| **LLM (Production)** | GPT-4o-mini | Cost-effective, fast, OpenAI API or Azure |
| **LLM (Eval/Training)** | GPT-4o | High quality for teacher model (DSPy MIPROv2) |
| **Prompt Optimization** | DSPy | Automatic prompt engineering, LangGraph compatible |
| **Observability** | LangSmith | Tracing, debugging, token cost tracking |
| **Embeddings** | text-embedding-3-small | OpenAI, 1536 dims, cheap |

**BANNED:**
- ❌ CrewAI, AutoGen (too opinionated, poor HITL support)
- ❌ LlamaIndex (document-centric, not agent-centric)
- ❌ LangChain (deprecated for agents, LangGraph is successor)
- ❌ Claude API (Anthropic ToS forbids pay equity use cases)

---

### 2.5 Hosting & Infrastructure

| Component | Technology | Cost | Rationale |
|-----------|-----------|------|-----------|
| **VPS** | Hetzner Cloud CPX31 | €12.90/month | EU data residency, 70% cheaper than Vercel |
| **Deployment** | Coolify | Free (self-hosted) | Vercel-like UX, Git-based deploy |
| **Domain** | OVH or nazwa.pl | ~€10/year | Polish registrar, RODO-compliant |
| **Email (Marketing)** | Mailchimp | €20/month | GDPR-compliant, EU servers |
| **Email (Transactional)** | Postmark | Pay-per-use | 99%+ deliverability |
| **Email (Behavior)** | Customer.io | €100/month | Event-triggered journeys |
| **Monitoring** | Sentry | Free tier | Error tracking, performance monitoring |
| **CI/CD** | GitHub Actions | Free | Integrated with GitHub |

**BANNED:**
- ❌ Vercel, Netlify (€40-60/month, vendor lock-in)
- ❌ AWS, Azure, GCP (complex pricing, US-centric defaults)
- ❌ Railway, Render (US-based, RODO concerns)
- ❌ Heroku (sunset, expensive legacy platform)

---

### 2.6 Payments & Invoicing 🆕

| Component | Technology | Cost | Rationale |
|-----------|-----------|------|-----------|
| **Invoice Generation** | Fakturownia.pl | ~50 PLN/month | Polish accounting standard, JPK_FA, KSeF ready |
| **Payment Gateway** | Przelewy24 | 1.49% per transaction | #1 in Poland, BLIK, przelew, karty |
| **Backup Transactional** | Stripe (Phase 3+) | 1.4% + 1 PLN | International expansion, not Polish B2B |

**Why Fakturownia.pl (NOT Stripe for Polish B2B):**
- ✅ JPK_FA export (Polish accounting requirement)
- ✅ KSeF ready (e-faktury mandatory from July 2026)
- ✅ Polish VAT rules (23%, reverse charge for EU B2B)
- ✅ Integration with Polish accounting software (Comarch, Sage, etc.)
- ❌ Stripe: No JPK_FA, no KSeF, high fees for Polish transfers

**When to use Stripe:**
- Phase 3+: International expansion (EU outside Poland)
- Enterprise tier: Customers prefer Stripe for procurement systems

**Timeline:**
- Week 5 (Mar 2-8): Setup Fakturownia.pl + Przelewy24
- Week 6 (Mar 9-15): Supabase webhook integration
- Week 8 (Mar 23-29): Production ready (100% automated invoicing)

---

### 2.7 Automation & Workflows

| Component | Technology | Cost | Rationale |
|-----------|-----------|------|-----------|
| **Workflow Automation** | n8n.io (Cloud SaaS) | €20/month | No-code automation, 200+ integrations |
| **Alternative (Phase 4+)** | n8n self-hosted | Free (VPS cost) | Full control, but requires maintenance |

**Why n8n (NOT Zapier/Make):**
- ✅ 75% cheaper than Zapier (€20 vs €70/month)
- ✅ GDPR-compliant (EU servers option)
- ✅ Unlimited workflows (Zapier charges per Zap)
- ❌ Zapier: Expensive, US-based, limits workflows

**Use Cases:**
- Partner onboarding (Typeform → Supabase → DocuSign → Email)
- Customer onboarding (Supabase webhook → Mailchimp → Calendly)
- Hunter lead enrichment (KRS API → CEIDG API → Supabase)
- CEO weekly dashboard (Supabase → LangSmith → PDF → Email)

---

### 2.8 Email Infrastructure 🆕

**Domain Authentication (MANDATORY before sending ANY email):**

| Record Type | Purpose | Example |
|-------------|---------|---------|
| **SPF** | Sender Policy Framework | `v=spf1 include:servers.mcsv.net include:_spf.customer.io ~all` |
| **DKIM** | DomainKeys Identified Mail | Auto-generated by Mailchimp/Customer.io/Postmark (add TXT records) |
| **DMARC** | Domain-based Message Auth | `v=DMARC1; p=none; rua=mailto:bartek@gaproll.eu` (start with p=none, escalate to p=reject) |

**Domain Warming Protocol (6 WEEKS MINIMUM):**

| Week | Daily Volume | Action | Target |
|------|--------------|--------|--------|
| 1 | 5-10 | Warm contacts (friends, test accounts) | >98% inbox |
| 2 | 10-20 | Gradual increase, monitor bounce rate | >97% inbox |
| 3 | 20-50 | Test small manual outreach | >96% inbox |
| 4 | 50-100 | Increase volume slowly | >95% inbox |
| 5 | 100-150 | Approaching target | >95% inbox |
| 6 | 150-200 | Stabilize | >95% inbox |
| 7+ | 200 max | **Domain warmed** — Hunter automation can start | >95% inbox |

**Red Flags (PAUSE immediately):**
- Bounce rate >3%
- Spam complaint rate >0.5%
- Deliverability <90%
- Domain blacklisted (check: mxtoolbox.com/blacklists)

**Hunter Agent Email Limits:**

| Period | Daily Limit | Rationale |
|--------|-------------|-----------|
| Warm-up (Feb-Apr) | 20/day | Domain warming |
| Discovery (May-Jun) | 50/day | Manual sales |
| Outreach (Jul+) | 100/day | Hunter automation |
| Hard limit | 200/day | NEVER exceed (spam trigger) |

---

## 3. Development Tools

| Tool | Purpose | Cost |
|------|---------|------|
| **IDE** | Cursor | Free (VS Code fork with AI) |
| **Version Control** | Git + GitHub | Free |
| **Package Manager (Frontend)** | pnpm | Free (faster than npm/yarn) |
| **Package Manager (Backend)** | pip + venv | Free |
| **Linting (TS)** | ESLint + Prettier | Free |
| **Linting (Python)** | Ruff | Free (replaces Pylint, Black, isort) |
| **Type Checking (Python)** | mypy | Free |
| **Testing (Frontend)** | Vitest | Free (faster than Jest) |
| **Testing (Backend)** | pytest | Free |
| **API Testing** | Hoppscotch | Free (Postman alternative) |

**BANNED:**
- ❌ WebStorm, PyCharm Pro (expensive, Cursor is free with AI)
- ❌ Pylint + Black + isort (Ruff replaces all 3, 10-100x faster)
- ❌ Jest (slow, Vitest is drop-in replacement, faster)

---

## 4. Architecture Patterns

### 4.1 Next.js Structure

```
apps/web/
├── app/                    # App Router (Next.js 15)
│   ├── (auth)/            # Route group (layout without path segment)
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/       # Protected routes
│   │   ├── layout.tsx     # Shared dashboard layout
│   │   ├── page.tsx       # Dashboard home
│   │   ├── reports/
│   │   └── settings/
│   ├── api/               # API routes
│   │   ├── auth/
│   │   └── webhooks/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Shadcn/UI components
│   ├── dashboard/         # Dashboard-specific components
│   └── marketing/         # Landing page components
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── api.ts             # API client (to FastAPI backend)
│   └── utils.ts           # Shared utilities
└── types/
    └── database.ts        # TypeScript types (generated from Supabase)
```

---

### 4.2 FastAPI Structure

```
apps/api/
├── main.py                # FastAPI app entry point
├── routers/
│   ├── auth.py            # Authentication endpoints
│   ├── reports.py         # Art. 16 reports
│   ├── evg.py             # EVG scoring
│   └── agents.py          # Hunter, Guardian, Analyst
├── models/
│   ├── database.py        # SQLAlchemy models
│   └── schemas.py         # Pydantic schemas (request/response)
├── services/
│   ├── evg_service.py     # EVG scoring logic
│   ├── agent_service.py   # LangGraph orchestration
│   └── email_service.py   # Mailchimp/Postmark integration
├── agents/
│   ├── hunter.py          # Hunter agent (LangGraph)
│   ├── guardian.py        # Guardian agent (LangGraph + GraphRAG)
│   └── analyst.py         # Analyst agent (DSPy MIPROv2)
├── db/
│   ├── session.py         # Database session factory
│   └── migrations/        # Alembic migrations
└── utils/
    ├── rodo.py            # N<3 masking utilities
    └── audit.py           # Audit trail helpers
```

---

### 4.3 Supabase RLS (Row-Level Security)

**Multi-tenancy Architecture:**

```sql
-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table (one org can have multiple projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'user' -- 'admin', 'user', 'partner'
);

-- RLS Policy: Users can only see data from their organization
CREATE POLICY "Users can view own org data"
  ON projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Partners can see their clients' data
CREATE POLICY "Partners can view client data"
  ON projects
  FOR SELECT
  USING (
    organization_id IN (
      SELECT client_org_id FROM partner_clients
      WHERE partner_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );
```

**Key Rules:**
- ALWAYS enable RLS on every table
- NEVER rely on client-side filtering (RLS at DB level)
- Test RLS policies in staging before production

---

### 4.4 Agent Architecture (LangGraph)

**Pattern: Generator-Critic Loop**

```python
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    messages: List[BaseMessage]
    iterations: int
    approved: bool

def generator(state: AgentState) -> AgentState:
    """Generate email draft"""
    draft = llm.invoke(state["messages"])
    return {"messages": state["messages"] + [draft], "iterations": state["iterations"] + 1}

def critic(state: AgentState) -> AgentState:
    """Critique email draft"""
    critique = llm.invoke([SystemMessage(content="Review this email for spam triggers"), state["messages"][-1]])
    if "APPROVED" in critique.content:
        return {"approved": True}
    else:
        return {"messages": state["messages"] + [critique], "approved": False}

def should_continue(state: AgentState) -> str:
    if state["approved"] or state["iterations"] >= 3:
        return END
    return "generator"

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("generator", generator)
workflow.add_node("critic", critic)
workflow.add_edge("generator", "critic")
workflow.add_conditional_edges("critic", should_continue)
workflow.set_entry_point("generator")

app = workflow.compile()
```

**HITL Breakpoint (EU AI Act compliance):**

```python
from langgraph.checkpoint.sqlite import SqliteSaver

memory = SqliteSaver.from_conn_string(":memory:")

# Compile with checkpoints
app = workflow.compile(checkpointer=memory, interrupt_before=["send_email"])

# Run until interrupt
result = app.invoke(initial_state, config={"configurable": {"thread_id": "1"}})

# Human reviews email draft in UI
# If approved:
app.invoke(None, config={"configurable": {"thread_id": "1"}})  # Resumes from checkpoint
```

---

## 5. RODO / GDPR Patterns

### 5.1 N<3 Masking

**Rule:** NEVER display aggregate statistics when N < 3 (privacy risk)

```python
def apply_n3_mask(df: pd.DataFrame, group_cols: List[str], metric_col: str) -> pd.DataFrame:
    """
    Mask groups with N<3 to comply with RODO.
    
    Example:
    >>> df = pd.DataFrame({
    ...     "department": ["IT", "IT", "HR", "HR", "HR"],
    ...     "gender": ["M", "F", "M", "F", "F"],
    ...     "salary": [8000, 7500, 6000, 5500, 6200]
    ... })
    >>> apply_n3_mask(df, ["department", "gender"], "salary")
       department gender  salary  count
    0          IT      M     NaN      1  # Masked (N=1)
    1          IT      F     NaN      1  # Masked (N=1)
    2          HR      M     NaN      1  # Masked (N=1)
    3          HR      F  5850.0      2  # NOT masked (N=2, borderline)
    """
    grouped = df.groupby(group_cols)[metric_col].agg(["mean", "count"]).reset_index()
    grouped.loc[grouped["count"] < 3, "mean"] = None  # Mask if N<3
    return grouped
```

**Display in UI:**

```tsx
{count < 3 ? (
  <span className="text-text-secondary italic">
    Dane wygaszone (N&lt;3, ochrona RODO)
  </span>
) : (
  <span>{mean.toFixed(0)} PLN</span>
)}
```

---

### 5.2 Audit Trail

**Rule:** Log ALL data operations (RODO Art. 30 — record of processing activities)

```python
from datetime import datetime
from uuid import UUID

def log_audit_trail(
    user_id: UUID,
    action: str,  # "READ", "CREATE", "UPDATE", "DELETE"
    table: str,
    record_id: UUID,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    justification: Optional[str] = None,
):
    """
    Log audit trail for RODO compliance.
    
    Example:
    >>> log_audit_trail(
    ...     user_id=UUID("123"),
    ...     action="UPDATE",
    ...     table="evg_scores",
    ...     record_id=UUID("456"),
    ...     old_value="78",
    ...     new_value="72",
    ...     justification="AWS skill not required anymore"
    ... )
    """
    db.execute(
        """
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_value, new_value, justification, timestamp)
        VALUES (:user_id, :action, :table, :record_id, :old_value, :new_value, :justification, :timestamp)
        """,
        {
            "user_id": user_id,
            "action": action,
            "table": table,
            "record_id": record_id,
            "old_value": old_value,
            "new_value": new_value,
            "justification": justification,
            "timestamp": datetime.utcnow(),
        },
    )
```

**Retention:** 3 years (PIP audit requirement)

---

## 6. Performance Budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Lighthouse Score** | >90 | Chrome DevTools |
| **First Contentful Paint** | <1.5s | Web Vitals |
| **Largest Contentful Paint** | <2.5s | Web Vitals |
| **Cumulative Layout Shift** | <0.1 | Web Vitals |
| **Time to Interactive** | <3s | Lighthouse |
| **API Response Time (p95)** | <500ms | LangSmith |
| **Database Query Time (p95)** | <100ms | Supabase Dashboard |

**Monitoring:** Monthly performance audit, track regressions

---

## 7. Security Checklist

- [ ] All Supabase tables have RLS enabled
- [ ] No API keys in frontend code (use environment variables)
- [ ] HTTPS only (Let's Encrypt via Coolify)
- [ ] CORS configured (whitelist gaproll.eu, localhost)
- [ ] Input validation (Zod on frontend, Pydantic on backend)
- [ ] SQL injection prevention (SQLAlchemy parameterized queries)
- [ ] XSS prevention (React escapes by default, no `dangerouslySetInnerHTML`)
- [ ] CSRF protection (SameSite cookies, CSRF tokens for mutations)
- [ ] Rate limiting (FastAPI Slowapi middleware: 100 req/min per IP)
- [ ] Secrets in env vars (`.env.local` never committed to Git)

---

## 8. Banned Technologies (Auto-Reject)

| Technology | Reason | Approved Alternative |
|-----------|--------|---------------------|
| **AWS, Azure, GCP** | Complex pricing, US-centric, RODO concerns | Hetzner (EU data residency, simple pricing) |
| **Vercel, Netlify** | Expensive (€40-60/month), vendor lock-in | Coolify on Hetzner VPS (€12.90/month) |
| **CrewAI, AutoGen** | Poor HITL support, opinionated | LangGraph (deterministic, checkpointing) |
| **MongoDB, Firebase** | Schema flexibility = compliance chaos | PostgreSQL (ACID, RLS, schema enforcement) |
| **Stripe (for Polish B2B)** | No JPK_FA, no KSeF, high fees | Fakturownia.pl + Przelewy24 |
| **Material UI, Chakra** | Opinionated styles, hard to customize | Shadcn/UI (copy-paste, full control) |
| **Redux, MobX** | Overengineered state management | Zustand (minimal boilerplate) |
| **Zapier** | Expensive (€70/month), US-based | n8n.io (€20/month, EU servers) |

**Rejection Process:**
1. User suggests banned tech: "Should we use AWS?"
2. Assistant responds: "❌ AWS is on our BANNED list (04_TECH_CONSTRAINTS). Reason: Complex pricing, US-centric. Approved alternative: Hetzner (EU data residency, €12.90/month)."
3. No debate, no exceptions.

---

## 9. API Design Standards (NEW — Feb 2026)

**Rule:** Every new FastAPI endpoint MUST follow these standards. See 12_API_FIRST_ARCHITECTURE.md for full details.

### 9.1 Response Envelope

ALL endpoints return `APIResponse[T]` with `data`, `meta` (request_id, timestamp, processing_time_ms), and `compliance` (directive_articles, rodo_applied, ai_generated, human_override, audit_id).

Base models defined in: `apps/api/schemas/base.py` (see 12_API_FIRST_ARCHITECTURE.md Section 8)

### 9.2 Endpoint Naming

Path pattern: `/api/v1/{domain}/{action}`
- Domain = noun: `gap`, `evg`, `report`, `solio`, `benchmark`, `compliance`, `partner`, `upload`
- Action = verb: `calculate`, `score`, `override`, `simulate`, `compare`, `export`

**BANNED:**
- ❌ `/api/dashboard-data` (not tool-friendly)
- ❌ `/api/get-info` (generic)
- ❌ `/api/process` (ambiguous)

### 9.3 Idempotency

- GET = always safe to retry
- POST/PUT = MUST accept `Idempotency-Key` header (prevents duplicate writes on agent retry)

### 9.4 Error Format

ALL errors return `APIError` with: `error` (machine code like `gap.insufficient_data`), `message` (Polish human-readable), `details` (dict), `article` (legal reference), `retry_after` (seconds, for rate limits).

### 9.5 API Versioning

- Version in URL path: `/api/v1/...`
- Breaking changes = new version (`/api/v2/...`)
- Old version supported 12 months after deprecation

### 9.6 MCP Protocol

**Approved:**
- ✅ MCP (Model Context Protocol) — Anthropic standard for agent-to-tool communication
- MCP Server endpoint: `/mcp/v1/sse` (future, post-Milestone 3)
- Tool definitions auto-generated from OpenAPI spec

**BANNED:**
- ❌ Custom agent protocols (use MCP standard)
- ❌ GraphQL for external API (REST + MCP is sufficient, GraphQL adds complexity)

---

## LESSONS

- **Next.js 15 + Coolify monorepo:** `turbopack.root` must NOT be set in next.config.ts for Docker builds. Always add postbuild to copy static assets to standalone output.

---

**END OF 04_TECH_CONSTRAINTS.md**

**Next Review:** After Milestone 1 (Mar 15, 2026)

**Key Updates This Version (Feb 14, 2026):**
- ✅ Fakturownia.pl + Przelewy24 added (Invoice Automation)
- ✅ Email infrastructure section (SPF/DKIM/DMARC, domain warming)
- ✅ Hunter Agent email limits (20→50→100/day progression)
- ✅ n8n.io Cloud SaaS approved (€20/month)
- ✅ Rebrand PayCompass → GapRoll
- ✅ Stripe moved from BANNED to "Phase 3+ international expansion"
