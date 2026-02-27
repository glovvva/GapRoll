# GapRoll — Skill Library
## Specialized Reasoning Loops for Domain-Specific Tasks

**Last Updated:** 2026-02-24
**Previous Name:** PayCompass (sunset Feb 14, 2026)
**Usage:** Invoke skills via XML tags in user prompts (e.g., `<skill_legal_audit>`)

---

## 1. Skill System Overview

**Concept:**
> Skills are specialized reasoning loops that Claude (CPTO assistant) can invoke for domain-specific tasks requiring deep expertise.

**Benefits:**
- ✅ Consistent quality (predefined protocols vs ad-hoc reasoning)
- ✅ Reusable across sessions (codified best practices)
- ✅ Traceable (explicit skill invocation vs implicit)

---

## 2. Available Skills

### 2.1 `<skill_legal_audit>` — Compliance Verification

**Purpose:** Audit any feature, document, or email for legal compliance (EU Directive 2023/970, RODO, EU AI Act, Kodeks Pracy).

**Invocation:**
```xml
<skill_legal_audit>
Feature: EVG Manual Override UI
Artifacts: 08_EXPLAINABILITY_ROADMAP.md, Figma mockup
</skill_legal_audit>
```

**Protocol:**
```
STEP 1: Identify Applicable Laws
- EU Directive 2023/970 (pay transparency)
- EU AI Act (high-risk AI systems)
- RODO / GDPR (data protection)
- Kodeks Pracy (Polish labor code)

STEP 2: Map Feature to Legal Requirements
- Which articles apply? (e.g., Art. 4, Art. 7, Art. 14 EU AI Act)
- What are the obligations? (e.g., "employer must have EVG system")
- Does feature fulfill obligation? (YES/NO/PARTIAL)

STEP 3: Identify Gaps
- Missing: Audit trail for EVG overrides (EU AI Act Art. 14)
- Missing: Citation of Art. X in UI (Grażyna trust requirement)
- Risk: If manual override not saved, PIP can challenge

STEP 4: Recommend Fixes
- Add audit_log table (user_id, timestamp, old_value, new_value, justification)
- Add CitationBadge component showing "Art. 4 Dyrektywy UE 2023/970"
- Add retention policy (3 years for PIP audit)

STEP 5: Risk Score (1-10)
- 1-3: Low risk (cosmetic issues)
- 4-7: Medium risk (compliance gaps, fixable)
- 8-10: High risk (legal violation, urgent fix needed)

OUTPUT: Markdown report with gaps + fixes + risk score
```

**Example Output:**
```markdown
# Legal Audit: EVG Manual Override UI

## Applicable Laws
- EU AI Act Art. 14 (HITL requirement)
- EU Directive 2023/970 Art. 4 (EVG methodology)

## Compliance Status
✅ HITL requirement met (Manual Override button present)
⚠️ PARTIAL: Audit trail missing (EU AI Act Art. 14 requires logging)
❌ MISSING: Legal citation (Grażyna won't trust without "Art. 4" badge)

## Recommended Fixes
1. Add audit_log table (high priority)
2. Add CitationBadge: "⚖️ Art. 4 Dyrektywy UE 2023/970" (high priority)
3. Add retention policy: 3 years (medium priority)

## Risk Score: 6/10 (MEDIUM)
Rationale: Functional compliance (HITL exists), but documentation gaps could cause PIP audit issues.
```

---

### 2.2 `<skill_grazyna_check>` — UX De-teching

**Purpose:** Translate technical jargon into Grażyna-friendly Polish.

**Invocation:**
```xml
<skill_grazyna_check>
Copy: "AI-powered pay equity analytics with ML-based job evaluation engine"
</skill_grazyna_check>
```

**Protocol:**
```
STEP 1: Identify Anglicisms
- "AI-powered" → scary, untrusted
- "analytics" → vague
- "ML-based" → incomprehensible

STEP 2: Identify Jargon
- "pay equity" → Grażyna says "luka płacowa"
- "job evaluation engine" → Grażyna says "wartościowanie stanowisk"

STEP 3: Rewrite in Grażyna's Vocabulary
- Use formal Polish (no casual tone)
- Use legal terms (podstawa prawna, raport zgodności)
- Cite articles (Art. 16, Art. 4)

STEP 4: Validate Against Persona
- Grażyna Test: "Czy Grażyna by to zrozumiała w 5 sekund?" (YES/NO)
- If NO → simplify further

OUTPUT: Rewritten copy + explanation of changes
```

**Example Output:**
```markdown
# Grażyna Check Results

## Original
"AI-powered pay equity analytics with ML-based job evaluation engine"

## Issues Detected
❌ "AI-powered" → scary
❌ "analytics" → vague
❌ "ML-based" → incomprehensible
❌ "pay equity" → anglicism

## Rewritten
"Automatyczne wartościowanie stanowisk (zgodnie z Art. 4 Dyrektywy UE 2023/970)
z możliwością edycji ręcznej. Raport Art. 16 gotowy w 15 minut."

## Grażyna Test: ✅ PASS
```

---

### 2.3 `<skill_hunter_safe_mode>` — Spam-Free Outreach

**Purpose:** Generate cold email content with 0% spam risk (avoid blacklist triggers).

**Invocation:**
```xml
<skill_hunter_safe_mode>
Target: Accounting firm (50 employees, Warsaw)
Decision Maker: Joanna Kowalska (CFO)
</skill_hunter_safe_mode>
```

**Protocol:**
```
STEP 1: Banned Words Check
NEVER use:
- "niesamowity", "rewolucyjny", "exclusive", "limited time"
- "guarantee", "100% success", "free money"
- "click here", "act now", "urgent"
- ALL CAPS (except acronyms: PIP, ZUS, NIP)
- Excessive punctuation (!!!, ???)

STEP 2: Personalization Requirement
MUST include:
- Specific detail about company (LinkedIn post, news, job listing)
- Decision maker's name + title (formal greeting)
- Industry-specific pain point (not generic)

STEP 3: Formal Polish Tone
- "Szanowna Pani" / "Szanowny Panie" (always)
- No casual "Cześć", no emojis, no contractions

STEP 4: CTA Simplicity
- ONE CTA only (Calendly link)
- No "reply to this email" (passive)

STEP 5: Spam Score Target
- SpamAssassin <3, mail-tester.com >8/10

OUTPUT: Email draft + spam score + personalization checklist
```

---

### 2.4 `<skill_mvp_prioritizer>` — Ruthless Scope Control ⭐ NEW

**Purpose:** Evaluate any feature request against MVP criteria. Protect the 10-customer target. Reject scope creep ruthlessly.

**Auto-Trigger keywords:** "should we add", "new feature idea", "what about implementing", "czy dodać", "nowy pomysł", "może zrobimy", "feature request", "a co z...", "pomyślałem że"

**Invocation:**
```xml
<skill_mvp_prioritizer>
Feature: AI-powered salary benchmarking using Glassdoor API
Requestor: Bartek (internal idea)
</skill_mvp_prioritizer>
```

**Protocol:**
```
STEP 1: LEAN TEST
Q: "Is this required by EU Directive 2023/970 or RODO?"
Q: "Does removing this feature break the core compliance workflow?"
Q: "Does this directly help get the FIRST 10 paying customers?"
→ If ALL 3 = NO → INSTANT REJECT, go to STEP 5

STEP 2: GRAŻYNA TEST
Q: "Will Grażyna notice if this is missing?"
Q: "Will she refuse to buy WITHOUT this feature?"
→ If NO to both → REJECT

STEP 3: DEADLINE TEST
Q: "Can this be built AND tested before Milestone 1 (Mar 15)?"
Q: "Does it fit within the current sprint?"
→ If NO → defer to specific backlog slot

STEP 4: ALTERNATIVE TEST
Q: "Can we solve this manually for the first 10 customers?"
Q: "Is there an existing feature that covers 80% of this need?"
→ If YES to either → REJECT and document manual workaround

STEP 5: DECISION OUTPUT
- APPROVED ✅: Meets Lean + Grażyna tests, fits timeline
- DEFERRED ⏸️: Valid idea, wrong time — assign to specific backlog slot
- REJECTED ❌: Scope creep — explain why, suggest workaround

OUTPUT FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 FEATURE REQUEST: [name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAN TEST:    [PASS/FAIL] — [reason]
GRAŻYNA TEST: [PASS/FAIL] — [reason]
DEADLINE TEST:[PASS/FAIL] — [reason]
ALT TEST:     [PASS/FAIL] — [workaround if exists]

VERDICT: ✅ APPROVED / ⏸️ DEFERRED / ❌ REJECTED

REASONING: [2-3 sentences max]
WORKAROUND: [manual solution for now, if applicable]
BACKLOG SLOT: [if DEFERRED: exact milestone/date]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**MVP Scope Definition (IN SCOPE):**
- CSV upload + pay gap calculation
- EVG scoring + Manual Override
- Art. 16 Report PDF export
- RODO N<3 masking
- Partner Portal v1
- Invoice automation (Fakturownia.pl)
- Authentication + multi-tenancy

**OUT OF SCOPE until 10 paying customers:**
- Dark mode, mobile app, PWA
- Slack/Teams integration
- AI salary benchmarking (Glassdoor, Sedlak)
- White-label / custom branding
- SSO / SAML / Azure AD
- ERP integrations (Comarch, enova, Symfonia)
- Chatbot / conversational UI
- Any agent (Hunter, Guardian, Analyst) — Phase 2+

**Example Decisions:**
```
✅ APPROVED: EVG Manual Override
   Lean: Art. 14 EU AI Act mandates HITL. Non-negotiable.

❌ REJECTED: AI Benchmarking via Glassdoor API
   Lean: Directive doesn't require market benchmarking.
   Workaround: Ręczne raporty Sedlak & Sedlak dla pierwszych 10 klientów.
   Backlog: Post-PMF Q3 2026.

❌ REJECTED: Slack notifications
   Lean: Grażyna uses email. Slack = zero value for persona.
   Workaround: Email via n8n (already planned).

⏸️ DEFERRED: Invoice automation
   Valid P0, but after Partner Portal. Slot: Week 5-8 (Mar 2-29).
```

**Auto-Approve (no analysis needed):**
- Legal compliance requirements (Art. 4, 7, 16 of Directive)
- RODO/GDPR mandatory features
- Security fixes (auth, RLS, XSS)
- Bug fixes blocking core workflow

**Auto-Reject (no analysis needed):**
- Anything requiring new infrastructure (new DB, new cloud provider)
- Features for user segments that don't exist yet (enterprise, mobile users)
- "Nice to have" UX improvements not tied to conversion

---

### 2.5 `<skill_synthetic_qa>` — Test Data Generator ⭐ NEW

**Purpose:** Generate realistic, corrupted test files (CSV, Excel, JPK XML) to stress-test GapRoll's import pipeline. Simulates real ERP export bugs.

**Auto-Trigger keywords:** "test data", "QA scenarios", "edge cases", "generate broken file", "symuluj błędny import", "wygeneruj testowe dane", "dane testowe"

**Invocation:**
```xml
<skill_synthetic_qa>
File type: Excel
Employees: 50
Corruption rate: 20%
Bugs: merged_cells, duplicate_pesel, invalid_salary
Output: test-data/test.xlsx
</skill_synthetic_qa>
```

**Protocol:**
```
STEP 1: Determine File Type
- Excel (.xlsx) → generate_dirty_excel.py
- CSV → generate_broken_csv.py
- JPK XML → generate_large_jpk.py

STEP 2: Select Bug Profile
EXCEL BUGS:
- merged_cells: nagłówek w merged komórkach (Comarch Optima export)
- mixed_encoding: CP1250 + UTF-8 w jednym pliku (enova365 bug)
- duplicate_pesel: duplikat PESEL dla różnych pracowników
- invalid_salary: ujemna pensja, tekst zamiast liczby
- missing_gender: brak kolumny Płeć lub wartości NULL
- header_row_4: nagłówki w wierszu 4 (nie 1) — Symfonia export

CSV BUGS:
- mixed_delimiters: mix przecinka i średnika w jednym pliku
- quotes_in_quotes: nieescapowane cudzysłowy
- line_breaks_in_cells: \n wewnątrz wartości
- bom: UTF-8 BOM (problemy z pandas read_csv)
- wrong_decimal: przecinek jako separator dziesiętny (8.500,00 zamiast 8500.00)

JPK XML BUGS:
- malformed: niezamknięty tag XML
- encoding: brak deklaracji <?xml encoding?>
- namespace_mismatch: zły namespace JPK v3 vs v4

STEP 3: Generate Command
Output: exact Python command to run in venv

STEP 4: Validation Checklist
- File opens without crashing? (baseline)
- GapRoll shows meaningful error message? (not 500)
- RODO masking still works on corrupted data?

OUTPUT: Python command + expected failure mode + validation steps
```

**Script Locations:**
```
.ai/skills/P1a-synthetic-qa-grazyna/scripts/
├── generate_dirty_excel.py    → Excel corruption
├── generate_large_jpk.py      → JPK XML (streaming, no RAM limit)
└── generate_broken_csv.py     → CSV chaos
```

**Run from project root:**
```powershell
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2
# Activate venv first:
.\apps\api\venv\Scripts\Activate.ps1
# pip install openpyxl Faker (once)

python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_dirty_excel.py `
  --employees 50 --corruption-rate 20 `
  --bugs "merged_cells,duplicate_pesel" `
  --output test-data/test.xlsx

python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_broken_csv.py `
  --employees 20 --bugs "mixed_delimiters" `
  --output test-data/smoke.csv
```

**Common ERP Export Bugs Reference:**

| ERP | Bug | Symptom |
|-----|-----|---------|
| Comarch Optima | Nagłówki w wierszu 4 | pandas skiprows needed |
| enova365 | CP1250 encoding | UnicodeDecodeError |
| Symfonia | Merged cells w nagłówku | openpyxl returns None |
| JPK v3 | Zły namespace | XML parse error |
| Sage | Przecinek jako decimal sep | 8.500,00 → error |

---

## 3. Skill Invocation Rules

### 3.1 When to Invoke

**Auto-Invoke (no user request needed):**
- `<skill_legal_audit>` → before deploying ANY compliance feature
- `<skill_grazyna_check>` → before finalizing ANY user-facing copy
- `<skill_hunter_safe_mode>` → before sending ANY cold email
- `<skill_mvp_prioritizer>` → when ANY new feature is suggested

**Trigger-word Invoke:**
- "test data", "QA", "edge cases", "broken file" → `<skill_synthetic_qa>`
- "should we add", "nowy pomysł", "feature request" → `<skill_mvp_prioritizer>`

---

### 3.2 Skill Composition (Chaining)

```xml
<skill_grazyna_check>
Landing page hero copy
</skill_grazyna_check>

<skill_legal_audit>
Claims in the copy
</skill_legal_audit>
```

Workflow: Grażyna Check → rewrite → Legal Audit → verify → final output.

---

## 4. Skill Development Protocol

### 4.1 When to Create New Skill
- Task repeats >5 times with similar protocol
- Domain expertise required (legal, UX, sales, QA)
- Quality consistency is critical

### 4.2 Validation Checklist
- [ ] Protocol is deterministic (same input → same output)
- [ ] Output format is consistent
- [ ] Error handling defined
- [ ] At least 2 examples provided

---

## 5. Skill Library Changelog

| Date | Skill | Change |
|------|-------|--------|
| 2026-02-24 | `<skill_mvp_prioritizer>` | Created (P1b-ruthless-mvp-prioritizer) |
| 2026-02-24 | `<skill_synthetic_qa>` | Created (P1a-synthetic-qa-grazyna) |
| 2026-02-14 | All | Rebrand PayCompass → GapRoll |
| 2026-02-13 | `<skill_legal_audit>` | Created |
| 2026-02-13 | `<skill_grazyna_check>` | Created |
| 2026-02-13 | `<skill_hunter_safe_mode>` | Created |

---

**END OF 07_SKILL_LIBRARY.md**

**Active Skills:** 5 (legal_audit, grazyna_check, hunter_safe_mode, mvp_prioritizer, synthetic_qa)
**Next Review:** After 50 skill invocations

**Key Reminder:**
- Skills = Codified best practices
- Always invoke BEFORE finalizing deliverables
- `<skill_mvp_prioritizer>` fires on ANY new feature suggestion — no exceptions
