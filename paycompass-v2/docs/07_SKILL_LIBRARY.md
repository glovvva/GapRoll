# GapRoll — Skill Library
## Specialized Reasoning Loops for Domain-Specific Tasks

**Last Updated:** 2026-02-14  
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
# Grazyna Check Results

## Original Copy
"AI-powered pay equity analytics with ML-based job evaluation engine"

## Issues Detected
❌ "AI-powered" → scary (Grażyna doesn't trust AI)
❌ "analytics" → vague (what does it actually do?)
❌ "ML-based" → incomprehensible jargon
❌ "pay equity" → anglicism (Grażyna says "luka płacowa")
❌ "job evaluation engine" → too technical

## Rewritten Copy
"Automatyczne wartościowanie stanowisk (zgodnie z Art. 4 Dyrektywy UE 2023/970) z możliwością edycji ręcznej. Raport Art. 16 gotowy w 15 minut."

## Changes Explained
- "AI-powered" → "Automatyczne" (neutral, less scary)
- "pay equity analytics" → "wartościowanie stanowisk" (Grażyna's term)
- Added: "z możliwością edycji ręcznej" (addresses control fear)
- Added: "Art. 4 Dyrektywy" (legal citation = trust signal)
- Added: "Raport Art. 16 gotowy w 15 minut" (concrete value prop)

## Grażyna Test: ✅ PASS
She understands: what it does, legal basis, that she has control, time saved.
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
- ALL CAPS (except acronyms like PIP, ZUS)
- Excessive punctuation (!!!, ???)

STEP 2: Personalization Requirement
MUST include:
- Specific detail about company (LinkedIn post, news, job listing)
- Decision maker's name + title (formal greeting)
- Industry-specific pain point (not generic)

STEP 3: Formal Polish Tone
- "Szanowna Pani" / "Szanowny Panie" (always)
- No casual "Cześć", "Co słychać?"
- No emojis
- No contractions ("nie ma" not "niema")

STEP 4: CTA Simplicity
- ONE CTA only (e.g., "Umów demo")
- Calendly link (no back-and-forth)
- No "reply to this email" (passive)

STEP 5: Spam Score Check
- SpamAssassin score <3 (target: <2)
- Mail-tester.com score >8/10
- No trigger words detected

OUTPUT: Email draft + spam score + personalization checklist
```

**Example Output:**
```markdown
# Hunter Safe Mode: Email Draft

## Target Profile
- Company: Biuro Rachunkowe Kowalski Sp. z o.o.
- Decision Maker: Joanna Kowalska (CFO)
- Employees: 50
- Location: Warsaw
- LinkedIn: Posted about ZUS compliance challenges (2 days ago)

## Email Draft

```
Temat: Zgodność Art. 16 — Rozwiązanie dla biur rachunkowych

Szanowna Pani Joanna,

Zauważyłem Pani post na LinkedIn o wyzwaniach z ZUS compliance. 

W związku z terminem 7 czerwca 2026 (Dyrektywa UE 2023/970), przygotowaliśmy 
GapRoll — rozwiązanie które automatyzuje raporty Art. 16 dla Państwa klientów.

Obecnie pracujemy z 3 biurami rachunkowymi (50-100 klientów każde).

Czy byłaby Pani zainteresowana 15-minutową rozmową?

[Umów demo - Calendly link]

Pozdrawiam,
Bartłomiej
GapRoll
bartek@gaproll.eu
```

## Spam Check Results
✅ SpamAssassin score: 1.8 (PASS, <3 target)
✅ Mail-tester.com: 9.2/10 (EXCELLENT)
✅ No banned words detected
✅ Personalization: LinkedIn post reference (recent, specific)
✅ Formal tone: "Szanowna Pani" used
✅ One CTA: Calendly link
✅ No ALL CAPS (except acronyms)
✅ Polish diacritics correct (Państwa, Pani)

## Personalization Checklist
✅ Specific detail: LinkedIn post about ZUS compliance (2 days ago)
✅ Decision maker name: Joanna Kowalska
✅ Industry pain point: Biura rachunkowe need Art. 16 solution for clients
✅ Social proof: "3 biura rachunkowe" (credibility)

## Estimated Deliverability: 95%+
```

---

## 3. Skill Invocation Rules

### 3.1 When to Invoke

**Auto-Invoke (Assistant should invoke without asking):**
- Legal audit before deploying ANY compliance feature
- Grażyna check before finalizing ANY user-facing copy
- Hunter safe mode before sending ANY cold email

**User-Invoked (User explicitly requests):**
```
User: "Sprawdź czy ta funkcja jest zgodna z RODO"
Assistant: [invokes <skill_legal_audit>]
```

---

### 3.2 Skill Composition (Chaining)

**Example:**
```xml
<skill_grazyna_check>
Copy from landing page hero section
</skill_grazyna_check>

<skill_legal_audit>
Claims made in copy (e.g., "Full compliance with Directive")
</skill_legal_audit>
```

**Workflow:**
1. Grażyna Check → rewrite copy in Polish formal tone
2. Legal Audit → verify claims are legally accurate
3. Output → Grażyna-friendly + legally sound copy

---

## 4. Skill Development Protocol

### 4.1 Creating New Skills

**When to create new skill:**
- Task repeats >5 times with similar protocol
- Domain expertise required (legal, UX, sales)
- Quality consistency critical (can't tolerate variance)

**Template:**
```markdown
## Skill Name: `<skill_xyz>`

**Purpose:** [One sentence]

**Invocation Example:**
```xml
<skill_xyz>
Input: [what user provides]
</skill_xyz>
```

**Protocol:**
```
STEP 1: [First check]
STEP 2: [Second check]
...
STEP N: [Final output]

OUTPUT: [Format description]
```

**Example Output:**
```markdown
[Show example]
```
```

---

### 4.2 Skill Testing

**Validation Checklist:**
- [ ] Protocol is deterministic (same input → same output)
- [ ] Output format is consistent
- [ ] Error handling defined (what if input is missing?)
- [ ] Performance acceptable (<30s for most skills)
- [ ] Examples provided (at least 2)

---

## 5. Skill Library Changelog

| Date | Skill | Change |
|------|-------|--------|
| 2026-02-14 | All | Rebrand PayCompass → GapRoll |
| 2026-02-13 | `<skill_legal_audit>` | Created (EU AI Act added) |
| 2026-02-13 | `<skill_grazyna_check>` | Created (Persona-based validation) |
| 2026-02-13 | `<skill_hunter_safe_mode>` | Created (Spam prevention) |

---

**END OF 07_SKILL_LIBRARY.md**

**Next Review:** After 50 skill invocations (validate effectiveness)

**Key Reminder:**
- Skills = Codified best practices (not ad-hoc reasoning)
- Always invoke relevant skills BEFORE finalizing deliverables
- Skills improve over time (add learnings from sessions)
