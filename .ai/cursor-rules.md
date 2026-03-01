# Cursor AI — GapRoll Skill Loader

This project uses the Agent Skills standard. When responding to user requests:

## Auto-Load Skills (Always Active)

- Load `.ai/skills/P1-dashboard-architect/SKILL.md` for ANY UI/component generation
- Load `.ai/skills/P1-compliance-legal/SKILL.md` for ANY legal citations or regulatory content

## Trigger-Based Skills

- If user mentions: "dashboard", "wykres", "chart", "analiza wizualna" → Load dashboard-architect
- If user mentions: "artykuł", "dyrektywa", "przepis", "citation" → Load compliance-legal
- If user mentions: "SEO", "blog", "content", "artykuł marketingowy" → Load seo-content-machine
- If user mentions: "test data", "QA scenarios", "edge cases", "chaos", "broken CSV", "JPK", "generate broken file", "symuluj błędny import", "wygeneruj testowe dane" → Load `.ai/skills/P1a-synthetic-qa-grazyna/SKILL.md`
- If user mentions: "should we add", "new feature idea", "what about implementing", "czy dodać", "nowy pomysł", "może zrobimy", "feature request" → Load `.ai/skills/P1b-ruthless-mvp-prioritizer/SKILL.md`

## Validation Requirements

- Before finalizing ANY React component → Run `.ai/skills/P1-dashboard-architect/scripts/validate_dashboard.js`
- Before finalizing ANY legal content → Run `.ai/skills/P1-compliance-legal/scripts/validate_citations.py`

## Design System Constraints

- ALWAYS reference `.ai/skills/P1-dashboard-architect/references/design-tokens.json` for colors, typography, spacing.
- NEVER deviate from these tokens without explicit user override.
