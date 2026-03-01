# GapRoll Agent Skills Library

This directory contains specialized AI agent skills following the Anthropic/Vercel standard.

## Active Skills

### P1-dashboard-architect

**Purpose:** Generate WCAG AA compliant, Polish-localized analytical dashboards  
**Auto-loads:** When user requests UI/chart generation  
**Validation:** `scripts/validate_dashboard.js`

### P1-compliance-legal

**Purpose:** Ensure 100% accurate legal citations for EU Directive 2023/970  
**Auto-loads:** When legal content is generated  
**Validation:** `scripts/validate_citations.py`

### P2-seo-content-machine

**Purpose:** Create SEO-optimized blog content targeting Polish accounting/HR keywords  
**Trigger:** User mentions "SEO", "blog", or "content marketing"

### P1b-ruthless-mvp-prioritizer

**Purpose:** Evaluate feature requests against MVP criteria; reject scope creep. Target: 10 paying customers by Week 16.  
**Trigger:** User mentions "should we add", "new feature idea", "what about implementing", "czy dodać", "nowy pomysł", "może zrobimy", "feature request"  
**Refs:** `references/mvp-scope-definition.md`, `approved-rejected-examples.md`

### P1a-synthetic-qa-grazyna

**Purpose:** Generate realistic dirty test data (corrupted Excel, large JPK XML, broken CSV) via Python scripts to stress-test GapRoll import pipeline  
**Trigger:** User mentions "test data", "QA scenarios", "edge cases", "generate broken file", "symuluj błędny import", "wygeneruj testowe dane"  
**Scripts:** `scripts/generate_dirty_excel.py`, `generate_large_jpk.py`, `generate_broken_csv.py`  
**Refs:** `references/common-erp-export-bugs.md`, `test-scenario-templates.md`

### P2-synthetic-qa-grazyna

**Purpose:** Sample dirty files (CSV chaos, JPK edge-case XML) for quick QA  
**Samples:** `.ai/skills/P2-synthetic-qa-grazyna/samples/`

## Testing a Skill

1. Open Cursor Composer (Ctrl+I)
2. Type: "Wygeneruj dashboard luki płacowej dla 50 pracowników"
3. Verify that skill loaded (check for JetBrains Mono, Polish currency format)
4. Run validation: `node .ai/skills/P1-dashboard-architect/scripts/validate_dashboard.js`

## Updating Skills

Skills are versioned in Git. To modify:

1. Edit SKILL.md file
2. Update version in frontmatter YAML
3. Commit with message: `feat(skills): updated dashboard-architect v1.1 - added quartile chart support`
