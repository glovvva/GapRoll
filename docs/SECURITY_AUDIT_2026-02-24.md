# GapRoll DevSecOps Security Audit Report

**Date:** 2026-02-24  
**Auditor:** Claude (AI Security Analyst)  
**Scope:** GapRoll Platform (Next.js + FastAPI + Supabase)  
**Severity Scale:** CRITICAL → HIGH → MEDIUM → LOW

---

## 🚨 EXECUTIVE SUMMARY

**Overall Security Posture:** ⚠️ **HIGH RISK**

**Critical Findings:** 2  
**High Severity:** 4  
**Medium Severity:** 3  
**Low Severity:** 2  

**Immediate Actions Required:**
1. Rotate all API keys (Supabase, OpenAI)
2. Purge .env from Git history
3. Implement RLS policies on all tables
4. Add rate limiting to FastAPI endpoints

**Estimated Remediation Time:** 6-8 hours  
**Recommended Completion:** Before first customer onboarding (March 1, 2026)

---

## 🔴 CRITICAL VULNERABILITIES

### CRIT-001: API Keys Leaked in Git History

**Severity:** 🔴 CRITICAL  
**Discovery Date:** 2026-02-24  
**Status:** ❌ UNRESOLVED

**Finding:**
```bash
commit 0872a17b37211e3a9ef8ec7d9744429e14390600
Author: Bartosz Grocki <bartgroki@proton.me>
Date:   Sun Feb 8 16:42:58 2026 +0100
Complete Krok 6 - Full stack integration working
```

Git log shows .env files were committed on Feb 8, 2026. This means:
- Supabase service_role key potentially exposed
- OpenAI API key potentially exposed
- Database credentials potentially exposed

**Impact:**
- Unauthorized access to production database
- Ability to bypass Row Level Security (RLS)
- Unlimited API usage (financial risk)
- RODO/GDPR violation (€20M fine potential)

**Proof of Concept:**
```python
# If attacker has service_role key from Git:
import supabase
client = supabase.create_client(URL, LEAKED_SERVICE_ROLE_KEY)
# Can now read ALL companies' salary data
data = client.table("employees").select("*").execute()
```

**Remediation:**

**Step 1: Rotate ALL keys immediately**
```
☐ Supabase anon key
☐ Supabase service_role key  
☐ OpenAI API key
☐ Any other third-party API keys
```

**Step 2: Purge from Git history**
```bash
pip install git-filter-repo --break-system-packages
cd paycompass-v2
git filter-repo --path apps/api/.env --invert-paths --force
git filter-repo --path apps/web/.env.local --invert-paths --force
git push origin master --force
```

**Step 3: Verify rotation worked**
```bash
# Try old key (should fail):
curl https://[project].supabase.co/rest/v1/companies \
  -H "apikey: OLD_KEY" \
  -H "Authorization: Bearer OLD_KEY"
# Expected: 401 Unauthorized
```

**Priority:** 🔥 P0 - Complete within 24 hours  
**Effort:** 2 hours  
**Owner:** Bartek

---

### CRIT-002: Missing .gitignore (Resolved)

**Severity:** 🔴 CRITICAL  
**Discovery Date:** 2026-02-24  
**Status:** ✅ RESOLVED (2026-02-24)

**Finding:**
Project root had no .gitignore file, risking future .env commits.

**Remediation:**
.gitignore created with comprehensive exclusions:
```
.env
.env.local
apps/api/.env
apps/web/.env.local
venv/
node_modules/
```

**Verification:**
```bash
git status --ignored
# Should show .env files as ignored
```

**Priority:** 🔥 P0 - COMPLETED ✅

---

## 🟠 HIGH SEVERITY ISSUES

### HIGH-001: Incomplete RLS Policies

**Severity:** 🟠 HIGH  
**Status:** ❌ PARTIALLY IMPLEMENTED

**Finding:**
Row Level Security (RLS) policies exist on some tables but coverage is unverified.

**Known RLS Status:**
```sql
✅ evg_scores (user_id filter confirmed)
✅ profiles (partner_id, company_id filters)
✅ companies (partner_id filter)
❓ evg_audit_log (NO CONFIRMATION)
❓ subscriptions (NO CONFIRMATION)
❓ partner_payouts (NO CONFIRMATION)
❓ employees (NO CONFIRMATION)
❓ payroll_data (NO CONFIRMATION)
```

**Impact:**
Cross-tenant data leakage:
- Partner A can view Partner B's clients
- Company A can access Company B's salary data
- Regulatory violation: RODO Art. 32 (€20M fine)

**Test Procedure:**
```sql
-- Run in Supabase SQL Editor:
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: EVERY user-accessible table has policies
-- Exception: audit_log (admin-only via service role)
```

**Remediation Template:**
```sql
-- Example: subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view own subscriptions"
ON subscriptions
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Partners can view client subscriptions"
ON subscriptions
FOR SELECT
USING (
  company_id IN (
    SELECT id FROM companies WHERE partner_id = (
      SELECT partner_id FROM profiles WHERE id = auth.uid()
    )
  )
);
```

**Priority:** 🔥 P1 - Before first partner onboarding  
**Effort:** 4 hours  
**Owner:** Bartek

---

### HIGH-002: No Rate Limiting

**Severity:** 🟠 HIGH  
**Status:** ❌ NOT IMPLEMENTED

**Finding:**
FastAPI endpoints lack rate limiting. Documented in 04_TECH_CONSTRAINTS.md but not implemented.

**Attack Vectors:**
1. Brute force on `/auth/login`
2. API abuse: Partner uploads 10,000 fake companies
3. DDoS: Flood `/api/analysis/paygap` to exhaust OpenAI credits

**Impact:**
- Credential stuffing attacks succeed
- $1,000+ OpenAI bill from abuse
- Service downtime (resource exhaustion)

**Remediation:**
```python
# apps/api/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply to sensitive endpoints:
@app.post("/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(credentials: LoginRequest):
    ...

@app.post("/partner/onboard-client")
@limiter.limit("10/hour")  # Max 10 new clients per hour
async def onboard_client(data: CompanyOnboard):
    ...

@app.post("/api/analysis/paygap")
@limiter.limit("20/minute")  # Max 20 analyses per minute
async def calculate_paygap(request: PayGapRequest):
    ...
```

**Dependencies:**
```bash
pip install slowapi --break-system-packages
```

**Priority:** 🔴 P1 - Before launch  
**Effort:** 2 hours  
**Owner:** Bartek

---

### HIGH-003: PII in Debug Logs

**Severity:** 🟠 HIGH  
**Status:** ⚠️ PARTIALLY RESOLVED

**Finding:**
00_CONTEXT_MEMORY.md notes: "Usunąć debug printy z partner.py"

**Risk:**
```python
# BAD (if present):
print(f"Processing payroll for {employee_name}, PESEL: {pesel}, salary: {salary}")
# ↑ This data goes to:
# - Terminal logs (visible in PowerShell)
# - Hetzner system logs
# - Potentially Sentry/error tracking
```

**RODO Violation:**
Art. 32 requires "pseudonymisation and encryption of personal data."
Logging plaintext PII = non-compliance.

**Audit Command:**
```bash
cd apps/api
Get-ChildItem -Recurse -Include *.py | Select-String -Pattern 'print\(' | Select-String -Pattern 'pesel|salary|wynagrodzenie|nip'
```

**Remediation:**
```python
# BEFORE (BAD):
print(f"User {user_id} accessed salary: {salary}")

# AFTER (GOOD):
logger.info(f"User {user_id} accessed salary data", extra={
    "salary_masked": f"{salary[:2]}***" if salary else None
})
```

**Complete Removal:**
```bash
# Remove ALL print() statements:
cd apps/api
# Manual review + deletion in routers/partner.py
# Leave only logger.error() in except blocks
```

**Priority:** 🟡 P2 - Before March 1  
**Effort:** 1 hour  
**Owner:** Bartek

---

### HIGH-004: Service Role Key in Frontend Risk

**Severity:** 🟠 HIGH  
**Status:** ✅ VERIFIED SAFE (No matches found)

**Finding:**
Scan confirmed NO instances of SERVICE_ROLE in frontend code.

**Verification:**
```powershell
Get-ChildItem -Path apps\web -Include *.ts,*.tsx -Recurse | Select-String -Pattern "SERVICE_ROLE"
# Result: No matches ✅
```

**Best Practice Reminder:**
```typescript
// apps/web/lib/supabase/client.ts (CORRECT):
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // ✅ Anon key only
)

// NEVER do this:
// process.env.SUPABASE_SERVICE_ROLE_KEY  // ❌ CRITICAL if in frontend
```

**Priority:** N/A - Already compliant ✅

---

## 🟡 MEDIUM SEVERITY ISSUES

### MED-001: Insufficient Input Validation

**Severity:** 🟡 MEDIUM  
**Status:** ⚠️ NEEDS HARDENING

**Finding:**
Pydantic validation exists but lacks comprehensive sanitization.

**Current State (Example):**
```python
class CompanyOnboard(BaseModel):
    nip: str  # ✅ Has NIP checksum validation
    email: str  # ❓ Email format validation?
    employee_count: int  # ❓ Min/max bounds?
    company_name: str  # ❌ No XSS/SQL injection protection
```

**Attack Vectors:**

1. **SQL Injection via company_name:**
```python
# Malicious payload:
{
  "company_name": "ABC'; DROP TABLE companies; --",
  "nip": "1234567890"
}
```

2. **XSS via justification field:**
```python
# If justification rendered as HTML:
{
  "justification": "<script>alert('XSS')</script>"
}
```

3. **Integer overflow:**
```python
{
  "employee_count": 999999999999  # Crashes calculation
}
```

**Remediation:**
```python
from pydantic import BaseModel, EmailStr, Field, validator

class CompanyOnboard(BaseModel):
    nip: str = Field(regex=r'^\d{10}$')  # Exact 10 digits
    email: EmailStr  # Built-in email validation
    employee_count: int = Field(ge=50, le=100000)  # Min 50, max 100k
    company_name: str = Field(max_length=200)
    
    @validator('company_name')
    def sanitize_name(cls, v):
        # Block SQL injection patterns
        dangerous = ['--', ';', '/*', '*/', 'DROP', 'DELETE', 'INSERT', 'UPDATE']
        v_upper = v.upper()
        if any(d in v_upper for d in dangerous):
            raise ValueError('Invalid characters in company name')
        
        # Block XSS
        if '<script' in v.lower() or 'javascript:' in v.lower():
            raise ValueError('Invalid characters in company name')
        
        return v.strip()
    
    @validator('justification', check_fields=False)
    def sanitize_justification(cls, v):
        if v and ('<' in v or '>' in v):
            raise ValueError('HTML tags not allowed in justification')
        return v
```

**Priority:** 🟡 P2 - Before scale (Week 6)  
**Effort:** 3 hours  
**Owner:** Bartek

---

### MED-002: Missing Comprehensive Audit Trail

**Severity:** 🟡 MEDIUM  
**Status:** ⚠️ PARTIAL COVERAGE

**Finding:**
EVG override has audit trail, but other sensitive operations lack logging.

**Missing Audit Logs:**
```
❌ Partner onboarding new client (WHO invited WHICH company WHEN)
❌ RODO data access (WHO viewed salary data of WHICH employee WHEN)
❌ Subscription tier changes (WHO upgraded WHAT WHEN)
❌ Manual payment adjustments
❌ User role changes (admin → partner)
```

**Impact:**
- Cannot prove compliance during PIP audit
- Cannot investigate security incidents
- RODO Art. 30 violation (record of processing activities)

**Remediation:**
```python
# apps/api/utils/audit.py (CREATE NEW FILE)
from datetime import datetime
from uuid import UUID
from typing import Optional, Dict, Any
from fastapi import Request

async def log_audit_event(
    user_id: UUID,
    action: str,  # "partner.onboard_client", "rodo.view_salary"
    resource_type: str,  # "company", "employee", "subscription"
    resource_id: UUID,
    metadata: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None
):
    """
    Log security-relevant event for compliance.
    
    Example:
    >>> await log_audit_event(
    ...     user_id=UUID("123"),
    ...     action="partner.onboard_client",
    ...     resource_type="company",
    ...     resource_id=UUID("456"),
    ...     metadata={"nip": "1234567890", "tier": "Compliance"},
    ...     request=request
    ... )
    """
    from lib.supabase import supabase
    
    ip_address = request.client.host if request else None
    user_agent = request.headers.get("user-agent") if request else None
    
    await supabase.table("audit_log").insert({
        "user_id": str(user_id),
        "action": action,
        "resource_type": resource_type,
        "resource_id": str(resource_id),
        "metadata": metadata,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "timestamp": datetime.utcnow().isoformat()
    }).execute()

# Usage in endpoints:
@app.post("/partner/onboard-client")
async def onboard_client(data: CompanyOnboard, request: Request):
    # ... onboarding logic ...
    
    await log_audit_event(
        user_id=current_user.id,
        action="partner.onboard_client",
        resource_type="company",
        resource_id=new_company.id,
        metadata={"nip": data.nip, "tier": data.tier},
        request=request
    )
```

**Database Schema:**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_audit_user_time ON audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
```

**Retention Policy:**
```sql
-- Automatically delete audit logs older than 3 years (PIP requirement)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_log WHERE timestamp < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT delete_old_audit_logs()');
```

**Priority:** 🟡 P2 - Before first audit (Week 8)  
**Effort:** 4 hours  
**Owner:** Bartek

---

### MED-003: CORS Misconfiguration Risk

**Severity:** 🟡 MEDIUM  
**Status:** ❓ NEEDS VERIFICATION

**Finding:**
Tech constraints document mentions CORS whitelist, but no code verification.

**Risk:**
```python
# DANGEROUS (if present):
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← ANY domain can call API
)
```

**Verification Command:**
```bash
cd apps/api
Get-ChildItem -Recurse -Include *.py | Select-String -Pattern "CORSMiddleware"
```

**Expected Safe Configuration:**
```python
# apps/api/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://gaproll.eu",
        "https://gaproll.pl",
        "https://gaproll.com",
        "http://localhost:3000",  # Dev only
        "http://localhost:8000",  # Dev only
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

**Test:**
```bash
# Should FAIL (blocked origin):
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api.gaproll.eu/api/analysis/paygap

# Should SUCCEED:
curl -H "Origin: https://gaproll.eu" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api.gaproll.eu/api/analysis/paygap
```

**Priority:** 🟡 P2 - Verify by Week 5  
**Effort:** 30 minutes  
**Owner:** Bartek

---

## ℹ️ LOW SEVERITY ISSUES

### LOW-001: Missing Security Headers

**Severity:** ℹ️ LOW  
**Status:** ❌ NOT IMPLEMENTED

**Finding:**
Standard security headers not present in HTTP responses.

**Missing Headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

**Impact:**
- Clickjacking vulnerability (X-Frame-Options)
- MIME sniffing attacks (X-Content-Type-Options)
- Reduced defense-in-depth

**Remediation:**
```python
# apps/api/main.py
from fastapi import Request, Response

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    
    return response
```

**Verification:**
```bash
curl -I https://api.gaproll.eu/api/health
# Should include all security headers
```

**Priority:** ℹ️ P3 - Before production (Week 6)  
**Effort:** 30 minutes  
**Owner:** Bartek

---

### LOW-002: No HTTPS Redirect

**Severity:** ℹ️ LOW  
**Status:** ❓ NEEDS VERIFICATION IN PRODUCTION

**Finding:**
Hetzner/Coolify setup should enforce HTTPS, but not verified.

**Test:**
```bash
# Should redirect to HTTPS:
curl -I http://gaproll.eu
# Expected: 301 Moved Permanently
# Location: https://gaproll.eu
```

**Nginx Configuration (If not present):**
```nginx
server {
    listen 80;
    server_name gaproll.eu www.gaproll.eu;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gaproll.eu www.gaproll.eu;
    
    ssl_certificate /etc/letsencrypt/live/gaproll.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gaproll.eu/privkey.pem;
    
    # ... rest of config
}
```

**Priority:** ℹ️ P3 - Verify at deployment  
**Effort:** 15 minutes (if Coolify handles it)  
**Owner:** Bartek

---

## 📋 REMEDIATION ROADMAP

### Week 4 (Feb 24-28) - CRITICAL

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| Rotate all API keys (Supabase, OpenAI) | P0 | 1h | Bartek | ❌ TODO |
| Purge .env from Git history | P0 | 1h | Bartek | ❌ TODO |
| Verify .gitignore working | P0 | 15m | Bartek | ✅ DONE |
| Audit RLS policies on ALL tables | P1 | 4h | Bartek | ❌ TODO |
| Implement rate limiting (Slowapi) | P1 | 2h | Bartek | ❌ TODO |

**Total Week 4 Effort:** 8h 15m

---

### Week 5 (Mar 1-7) - HIGH

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| Remove debug prints from backend | P1 | 1h | Bartek | ❌ TODO |
| Harden Pydantic validation | P2 | 3h | Bartek | ❌ TODO |
| Verify CORS configuration | P2 | 30m | Bartek | ❌ TODO |
| Add security headers middleware | P3 | 30m | Bartek | ❌ TODO |

**Total Week 5 Effort:** 5h

---

### Week 6-8 (Post-Launch) - MEDIUM

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| Implement comprehensive audit logging | P2 | 4h | Bartek | ❌ TODO |
| Verify HTTPS redirect in production | P3 | 15m | Bartek | ❌ TODO |
| External penetration test | P4 | $500 | External | ⏳ FUTURE |

**Total Week 6-8 Effort:** 4h 15m

---

## 🎯 ACCEPTANCE CRITERIA

Before declaring "Security Compliant", ALL of these must be ✅:

### Pre-Launch Checklist:
- [ ] All API keys rotated (Supabase, OpenAI)
- [ ] .env purged from Git history
- [ ] .gitignore prevents future .env commits
- [ ] RLS enabled on 100% of user-accessible tables
- [ ] Rate limiting active on auth + sensitive endpoints
- [ ] No PII in debug logs (all print() removed)
- [ ] SERVICE_ROLE_KEY never in frontend code
- [ ] Pydantic validation blocks SQL injection
- [ ] CORS whitelist configured (no allow_origins=["*"])
- [ ] Security headers in HTTP responses
- [ ] HTTPS redirect enforced

### Post-Launch Monitoring:
- [ ] Audit log retention policy (3 years)
- [ ] Weekly security scan (automated)
- [ ] Incident response plan documented
- [ ] Penetration test by external auditor (Q2 2026)

---

## 📞 INCIDENT RESPONSE PLAN

### If API Keys Are Compromised:

1. **Immediate (within 1 hour):**
   - Rotate compromised keys
   - Check database for unauthorized access
   - Review audit logs for suspicious activity

2. **Short-term (within 24 hours):**
   - Notify affected customers (if data accessed)
   - File RODO breach report (if PII exposed)
   - Change all related credentials

3. **Long-term (within 1 week):**
   - Root cause analysis
   - Update security procedures
   - Train team on key management

### Contact Information:
- **Security Lead:** Bartek (bartgroki@proton.me)
- **Legal Counsel:** [TBD - hire after funding]
- **RODO Officer:** [TBD - required at 250+ employees]

---

## 🔬 TESTING RECOMMENDATIONS

### Automated Security Scanning:

**Install Bandit (Python security linter):**
```bash
pip install bandit --break-system-packages
cd apps/api
bandit -r . -f json -o security-report.json
```

**Install ESLint Security Plugin (TypeScript):**
```bash
cd apps/web
npm install --save-dev eslint-plugin-security
```

**Add to package.json:**
```json
"scripts": {
  "security-scan": "eslint --ext .ts,.tsx --plugin security ."
}
```

**Run before every deploy:**
```bash
npm run security-scan
```

### Manual Penetration Testing:

**Recommended Tools:**
- OWASP ZAP (free, open-source)
- Burp Suite Community Edition
- SQLMap (SQL injection testing)

**When:** Q2 2026 (after 50+ customers)  
**Budget:** $500-1000 for external auditor

---

## 📚 REFERENCES

**Standards & Frameworks:**
- OWASP Top 10 (2021): https://owasp.org/Top10/
- RODO/GDPR Compliance: https://gdpr.eu/
- EU AI Act Article 14: https://eur-lex.europa.eu/
- CWE Top 25: https://cwe.mitre.org/top25/

**GapRoll Internal Docs:**
- 04_TECH_CONSTRAINTS.md (Security Checklist)
- 00_CONTEXT_MEMORY.md (Hard-Won Rules #1-25)

---

**Report Generated:** 2026-02-24 by Claude DevSecOps Analyzer  
**Next Review:** 2026-03-24 (monthly cadence)  
**Version:** 1.0

---

## ✅ SIGN-OFF

**Security Lead:**  
Name: Bartosz Grocki  
Role: Founder & CPTO  
Signature: _________________________  
Date: _________________________

**Compliance Officer (Future):**  
Name: [TBD]  
Role: RODO Officer  
Signature: _________________________  
Date: _________________________
