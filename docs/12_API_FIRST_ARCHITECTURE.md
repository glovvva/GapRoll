# GapRoll — API-First Architecture Guidelines
## Agent-Ready Platform Design for Enterprise & MCP Compatibility

**Created:** 2026-02-27  
**Author:** Bartek (CPTO) + Claude (CPTO-AI)  
**Status:** ACTIVE — apply to ALL new endpoints from now  
**Rule:** Every new FastAPI endpoint MUST pass the Agent-Ready Checklist (Section 6) before merge.

---

## 1. Strategic Context

### 1.1 Why API-First

GapRoll's exit strategy targets Polish ERP companies (Comarch, Symfonia, enova). These buyers value:

| What they buy | Multiplier | How API-First delivers |
|---------------|-----------|----------------------|
| SaaS tool | 3-5x ARR | Dashboard alone |
| API platform | 8-12x ARR | Third-party integrations, ecosystem lock-in |
| Data moat + API | 12-20x ARR | Benchmark data + programmatic access |

**Decision:** Every feature built from now on is an API endpoint first, UI second.

### 1.2 Three Deployment Models

| Model | Data flow | Target segment | Timeline |
|-------|-----------|----------------|----------|
| **A: Remote MCP Server** | Agent klienta → GapRoll API → response | Enterprise with cloud-first policy | Post-Milestone 2 (kwiecień 2026) |
| **B: GapRoll SDK/CLI** | Klient instaluje pakiet lokalnie, dane nigdy nie opuszczają infra | Regulated (banki, ubezpieczenia, sektor publiczny) | Post-PMF (Q3 2026, 50+ klientów) |
| **C: Hybrid** | Zanonimizowane dane → GapRoll API → wynik. PII stays local | Compliance-cautious mid-market | Razem z Model A |

**Current focus:** Model A architecture. Model B requires core logic extraction (deferred).

---

## 2. API Design Principles

### 2.1 Tool-Friendly Naming

Agents parse endpoint names to understand capabilities. Name endpoints like **tools**, not like pages.

```
✅ GOOD (agent understands intent):
POST   /api/v1/gap/calculate          — "oblicz lukę płacową"
POST   /api/v1/evg/score              — "oceń wartość stanowiska"
POST   /api/v1/evg/override           — "nadpisz ocenę EVG"
GET    /api/v1/report/article-16      — "pobierz raport Art. 16"
POST   /api/v1/solio/simulate         — "symuluj scenariusz budżetowy"
GET    /api/v1/gap/root-causes        — "pokaż przyczyny luki"
POST   /api/v1/benchmark/compare      — "porównaj z benchmarkiem"
GET    /api/v1/compliance/status       — "sprawdź status zgodności"

❌ BAD (agent has no idea):
GET    /api/dashboard-data
GET    /api/get-info
POST   /api/process
GET    /api/page/settings
```

**Rule:** Endpoint path = `/{domain}/{action}`. Domain is a noun (gap, evg, report, solio, benchmark, compliance). Action is a verb (calculate, score, simulate, compare, export).

### 2.2 Versioned API

```
/api/v1/gap/calculate    ← current
/api/v2/gap/calculate    ← breaking changes only
```

- **v1** is the contract. Once published, never change response shape — only add fields.
- Breaking changes = new version. Old version supported for 12 months.
- Version in URL path (not header) — simpler for agent developers.

### 2.3 Idempotent Operations

Agents may retry requests (network issues, timeout recovery). Every endpoint must be safe to call twice.

```python
# ✅ Idempotent — same input = same output, no side effects
POST /api/v1/gap/calculate
Body: {"company_id": "uuid", "dataset_id": "uuid"}
→ Always returns same gap calculation for same dataset

# ✅ Idempotent with idempotency key — mutation safe to retry
POST /api/v1/evg/override
Header: Idempotency-Key: "uuid-generated-by-client"
Body: {"position_id": "...", "axes": {...}, "justification": "..."}
→ Second call with same key returns cached result, no duplicate write

# ❌ Non-idempotent — dangerous for agents
POST /api/v1/report/generate
→ Creates new report every call (orphaned reports on retry)
```

**Rule:** Read operations (GET) are always idempotent. Write operations (POST/PUT) MUST accept `Idempotency-Key` header. FastAPI middleware handles deduplication via Redis/Supabase cache.

### 2.4 Structured Error Responses

Agents need machine-parseable errors, not HTML error pages.

```python
# Standard error envelope — EVERY error follows this schema
class APIError(BaseModel):
    error: str              # Machine-readable code: "gap.insufficient_data"
    message: str            # Human-readable (Polish): "Za mało danych do obliczenia luki"
    details: dict | None    # Context: {"min_required": 6, "provided": 2, "gender": "K"}
    article: str | None     # Legal reference: "Art. 9 ust. 1 Dyrektywy 2023/970"
    retry_after: int | None # Seconds to wait (for rate limits)

# Example: 422 Unprocessable Entity
{
    "error": "evg.justification_too_short",
    "message": "Uzasadnienie musi mieć minimum 20 znaków",
    "details": {"min_length": 20, "provided_length": 8},
    "article": "Art. 14 EU AI Act — wymóg uzasadnienia decyzji",
    "retry_after": null
}
```

**Error code taxonomy:**

```
gap.*          — Pay gap calculation errors
evg.*          — EVG scoring/override errors
report.*       — Report generation errors
solio.*        — Budget simulation errors
auth.*         — Authentication/authorization errors
rodo.*         — RODO/data protection blocks
upload.*       — Data upload/validation errors
rate_limit.*   — Throttling
```

---

## 3. Response Envelope Standard

Every successful response follows the same envelope. Agents parse predictably.

```python
class APIResponse(BaseModel, Generic[T]):
    data: T                          # The actual payload
    meta: ResponseMeta               # Pagination, timing, version
    compliance: ComplianceContext     # Legal citations (always present)

class ResponseMeta(BaseModel):
    request_id: str                  # UUID for tracing
    timestamp: datetime              # ISO 8601
    api_version: str                 # "v1"
    processing_time_ms: int          # Latency tracking
    cached: bool                     # Was this served from cache?

class ComplianceContext(BaseModel):
    """Every response carries its legal basis — non-negotiable for GapRoll."""
    directive_articles: list[str]    # ["Art. 9 ust. 1", "Art. 16 ust. 2"]
    rodo_applied: bool               # Was N<3 masking triggered?
    rodo_masked_fields: list[str]    # ["mean_salary_K", "median_salary_K"]
    ai_generated: bool               # Was AI involved in this response?
    ai_model: str | None             # "gpt-4o-2024-08-06" (EU AI Act transparency)
    human_override: bool             # Was HITL applied?
    audit_id: str | None             # UUID linking to evg_audit_log
```

**Example response:**

```json
{
    "data": {
        "overall_gap_percent": 11.2,
        "gap_direction": "M>K",
        "threshold_status": "warning",
        "groups": [
            {
                "evg_group": "Senior Developer",
                "gap_percent": 8.3,
                "median_m": 18500,
                "median_k": 16965,
                "n_m": 12,
                "n_k": 4,
                "masked": false
            }
        ]
    },
    "meta": {
        "request_id": "550e8400-e29b-41d4-a716-446655440000",
        "timestamp": "2026-02-27T14:30:00Z",
        "api_version": "v1",
        "processing_time_ms": 142,
        "cached": false
    },
    "compliance": {
        "directive_articles": ["Art. 9 ust. 1 Dyrektywy 2023/970"],
        "rodo_applied": false,
        "rodo_masked_fields": [],
        "ai_generated": false,
        "ai_model": null,
        "human_override": false,
        "audit_id": null
    }
}
```

---

## 4. Permission & Scope Model

### 4.1 API Key Scopes

Enterprise klient tworzy API key z granularnymi uprawnieniami. Agent dostaje tylko to, czego potrzebuje.

```
# Scope taxonomy
gap:read              — Odczyt luki płacowej (calculate, root causes)
gap:export            — Eksport raportów (Art. 16 PDF, CSV)
evg:read              — Odczyt scorów EVG
evg:score             — Uruchomienie scoringu AI
evg:override          — Nadpisanie scorów (wymaga HITL justification)
solio:simulate        — Uruchamianie symulacji budżetowych
solio:apply           — Zatwierdzanie scenariuszy (write)
benchmark:read        — Odczyt benchmarków
report:generate       — Generowanie raportów
upload:write          — Upload nowych danych CSV
admin:manage          — Zarządzanie użytkownikami, ustawieniami
```

**Przykładowe profile:**

```
CEO Dashboard Agent:     gap:read, benchmark:read, solio:simulate
HR Compliance Agent:     gap:read, gap:export, evg:read, report:generate
HRBP Review Agent:       gap:read, evg:read, evg:score
CFO Budget Agent:        gap:read, solio:simulate, solio:apply
Auditor (read-only):     gap:read, evg:read, report:generate
Full Admin:              * (all scopes)
```

### 4.2 API Key Format

```
gaproll_live_sk_xxxxxxxxxxxx    — Production key
gaproll_test_sk_xxxxxxxxxxxx    — Sandbox key (fake data, no billing)
```

### 4.3 Rate Limiting (per API key)

| Tier | Requests/min | Requests/day | Concurrent |
|------|-------------|-------------|-----------|
| Compliance (99 PLN) | 30 | 1,000 | 5 |
| Strategia (199 PLN) | 60 | 5,000 | 10 |
| Enterprise (4,999 PLN) | 300 | 50,000 | 50 |

Rate limit info in response headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1709042400
Retry-After: 30  (only on 429)
```

---

## 5. MCP Server Readiness

### 5.1 What is MCP (for context)

Model Context Protocol — standard by Anthropic for connecting AI agents to external tools. Agent discovers available tools, calls them with structured input, gets structured output.

### 5.2 MCP Tool Definition Pattern

Each FastAPI endpoint maps 1:1 to an MCP tool. FastAPI's OpenAPI spec auto-generates tool definitions.

```python
# FastAPI endpoint (what we write)
@router.post(
    "/gap/calculate",
    summary="Oblicz lukę płacową",
    description="Calculates gender pay gap for a company dataset. "
                "Returns overall gap, per-EVG-group breakdown, and Art. 9 threshold status. "
                "Requires gap:read scope.",
    response_model=APIResponse[GapCalculationResult],
    tags=["gap"],
)
async def calculate_gap(
    request: GapCalculateRequest,
    company_id: UUID = Depends(get_company_from_api_key),
) -> APIResponse[GapCalculationResult]:
    ...
```

```json
// Auto-generated MCP tool definition (what agent sees)
{
    "name": "calculate_pay_gap",
    "description": "Oblicz lukę płacową — gender pay gap for a company dataset. Returns overall gap, per-EVG-group breakdown, and Art. 9 threshold status.",
    "input_schema": {
        "type": "object",
        "properties": {
            "dataset_id": {"type": "string", "format": "uuid"},
            "include_root_causes": {"type": "boolean", "default": false},
            "language": {"type": "string", "enum": ["pl", "en"], "default": "pl"}
        },
        "required": ["dataset_id"]
    }
}
```

### 5.3 Design Rules for MCP Compatibility

| Rule | Why | Example |
|------|-----|---------|
| Every endpoint has `summary` + `description` in Polish+English | Agent needs to understand what tool does | `summary="Oblicz lukę płacową"` |
| Input params have `description` and `examples` | Agent needs to know what to send | `dataset_id: UUID = Field(description="UUID of uploaded dataset")` |
| Enum values for constrained params | Agent picks from list, doesn't guess | `tier: Literal["compliance", "strategia"]` |
| Optional params have sensible defaults | Agent can call with minimal input | `include_root_causes: bool = False` |
| No session/cookie dependency | Agents use API keys, not browser sessions | Auth via `Authorization: Bearer gaproll_live_sk_...` |
| Response includes `compliance` context | Agent can explain legal basis to user | Always present, never null |

### 5.4 MCP Server Implementation (Future — Post-Milestone 2)

```
/api/v1/*              ← REST API (current, universal)
/mcp/v1/sse            ← MCP Server-Sent Events endpoint (future)
/mcp/v1/tools          ← MCP tool discovery (future)
/.well-known/mcp.json  ← MCP server manifest (future)
```

MCP server will be a thin wrapper around existing REST API. No duplicate logic.

---

## 6. Agent-Ready Checklist

**Every new endpoint MUST pass all items before merge:**

```
□ NAMING: Path follows /{domain}/{action} pattern
□ NAMING: summary (PL) and description (PL+EN) present
□ VERSION: Under /api/v1/ prefix
□ IDEMPOTENCY: GET is safe. POST/PUT accepts Idempotency-Key header
□ RESPONSE: Uses APIResponse[T] envelope with meta + compliance
□ ERRORS: Uses APIError schema with machine-readable error code
□ ERRORS: Error code follows {domain}.{specific_error} taxonomy
□ AUTH: Accepts Bearer token (API key), no cookie/session dependency
□ SCOPES: Endpoint declares required scope(s) in dependency
□ PARAMS: All params have description, type hints, and defaults where sensible
□ PARAMS: Enums for constrained values (Literal, Enum)
□ RODO: Response masks fields when N<3 (compliance.rodo_applied = true)
□ LEGAL: compliance.directive_articles populated for every response
□ AI ACT: If AI-generated, compliance.ai_generated = true + model name
□ OPENAPI: Endpoint appears correctly in /docs with examples
□ TEST: At least 1 happy path + 1 error path test
```

**Cursor Composer prompt for new endpoints:**

```
Create a new FastAPI endpoint following GapRoll API-First guidelines:
- Path: /api/v1/{domain}/{action}
- Use APIResponse[T] envelope (data + meta + compliance)
- Use APIError for all error responses
- Add Idempotency-Key header support for mutations
- Declare required API scope in Depends()
- Add summary (Polish) and description (Polish + English)
- All Pydantic models with Field(description=..., examples=[...])
- Include directive_articles in ComplianceContext
- Write pytest: 1 happy path, 1 auth error, 1 validation error
```

---

## 7. Migration Path for Existing Endpoints

Existing endpoints (built before this document) need gradual migration:

| Endpoint | Current | Target | Priority |
|----------|---------|--------|----------|
| `GET /analysis/dashboard-metrics` | No envelope, no compliance context | `GET /api/v1/gap/dashboard` | P1 (pre-sales) |
| `POST /evg/override` | Direct Supabase, no API key auth | `POST /api/v1/evg/override` | P1 |
| `GET /partner/clients` | Partner-only, no versioning | `GET /api/v1/partner/clients` | P2 |
| `GET /partner/mrr` | Partner-only | `GET /api/v1/partner/mrr` | P2 |
| `POST /evg/score` | Works but no envelope | `POST /api/v1/evg/score` | P2 |
| Upload CSV flow | Multi-step, session-based | `POST /api/v1/upload/dataset` | P3 |

**Migration strategy:** Don't break existing UI. Add `/api/v1/` endpoints alongside existing ones. UI migrates gradually. Old endpoints deprecated after UI migration complete.

---

## 8. Pydantic Base Models (Copy-Paste Ready)

```python
"""
GapRoll API-First base models.
File: apps/api/schemas/base.py
"""
from datetime import datetime
from typing import Generic, TypeVar
from uuid import uuid4

from pydantic import BaseModel, Field

T = TypeVar("T")


class ComplianceContext(BaseModel):
    """Legal context attached to every API response. Non-negotiable."""
    directive_articles: list[str] = Field(
        default_factory=list,
        description="EU Directive 2023/970 articles applicable to this response",
        examples=[["Art. 9 ust. 1", "Art. 16 ust. 2"]],
    )
    rodo_applied: bool = Field(
        default=False,
        description="Whether N<3 RODO masking was triggered",
    )
    rodo_masked_fields: list[str] = Field(
        default_factory=list,
        description="Field names that were masked due to RODO N<3 rule",
    )
    ai_generated: bool = Field(
        default=False,
        description="Whether AI model was involved in generating this response",
    )
    ai_model: str | None = Field(
        default=None,
        description="AI model identifier if ai_generated=True",
        examples=["gpt-4o-2024-08-06"],
    )
    human_override: bool = Field(
        default=False,
        description="Whether human-in-the-loop override was applied",
    )
    audit_id: str | None = Field(
        default=None,
        description="UUID linking to audit trail in evg_audit_log",
    )


class ResponseMeta(BaseModel):
    """Metadata for every API response."""
    request_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="Unique request identifier for tracing",
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Response timestamp (ISO 8601)",
    )
    api_version: str = Field(
        default="v1",
        description="API version",
    )
    processing_time_ms: int = Field(
        default=0,
        description="Server-side processing time in milliseconds",
    )
    cached: bool = Field(
        default=False,
        description="Whether response was served from cache",
    )


class APIResponse(BaseModel, Generic[T]):
    """Standard response envelope for all GapRoll API endpoints."""
    data: T
    meta: ResponseMeta = Field(default_factory=ResponseMeta)
    compliance: ComplianceContext = Field(default_factory=ComplianceContext)


class APIError(BaseModel):
    """Standard error response for all GapRoll API endpoints."""
    error: str = Field(
        description="Machine-readable error code: {domain}.{specific_error}",
        examples=["gap.insufficient_data", "evg.justification_too_short"],
    )
    message: str = Field(
        description="Human-readable error message (Polish)",
        examples=["Za mało danych do obliczenia luki płacowej"],
    )
    details: dict | None = Field(
        default=None,
        description="Additional context for debugging",
    )
    article: str | None = Field(
        default=None,
        description="Legal reference if error relates to compliance",
        examples=["Art. 9 ust. 1 Dyrektywy 2023/970"],
    )
    retry_after: int | None = Field(
        default=None,
        description="Seconds to wait before retrying (rate limit errors only)",
    )
```

---

## 9. Relationship to Other Documents

| Document | Relationship |
|----------|-------------|
| **04_TECH_CONSTRAINTS.md** | API-First adds to, doesn't replace. FastAPI remains the framework |
| **06_AGENT_BLUEPRINTS.md** | Hunter/Guardian/Analyst are INTERNAL agents. This doc covers EXTERNAL agent access |
| **08_EXPLAINABILITY_ROADMAP.md** | ComplianceContext in every response = explainability by default |
| **10_INFRASTRUCTURE_SETUP.md** | Rate limiting, API keys, monitoring — infrastructure supports API-First |
| **01_STRATEGY.md** | Enterprise tier (4,999 PLN) = API access + white-label. This doc defines the "API access" part |

---

**END OF 12_API_FIRST_ARCHITECTURE.md**

**Next Review:** After Milestone 2 (April 26, 2026)  
**Key Updates This Version (Feb 27, 2026):**
- ✅ Three deployment models defined (Remote MCP, SDK, Hybrid)
- ✅ API naming conventions established
- ✅ Response envelope standard (APIResponse + ComplianceContext)
- ✅ Permission scope model (granular API keys)
- ✅ MCP readiness rules
- ✅ Agent-Ready Checklist for every new endpoint
- ✅ Pydantic base models (copy-paste ready)
- ✅ Migration path for existing endpoints
