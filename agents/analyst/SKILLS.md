# Analyst Agent - Skills (Codified Rules)

**Last Updated:** 2026-02-15  
**Type:** Dynamic (updated after optimization failures or bad recommendations)  
**Purpose:** How to analyze agent performance and optimize prompts correctly

---

## Optimization Rules

*(Will be populated after first DSPy runs - May 10+)*

<!-- Example:
- RULE: Minimum 50 examples in Golden Dataset before optimization
- RULE: Always test on 20% holdout set (never seen during training)
- RULE: If improvement <5% → reject, don't deploy
- RULE: Run optimization weekly (Monday), not daily (overfitting risk)
-->

---

## Pattern Recognition Rules

<!-- Example:
- RULE: Same correction 3x in 7 days = codify as SKILLS rule
- RULE: Same preference 5x total = add to MEMORY
- RULE: Hallucination even once = add verification step to SKILLS
-->

---

## Metrics Thresholds

<!-- Example:
- Hunter spam rate >0.5% = CRITICAL alert
- Guardian HITL rejection >20% = WARNING alert
- MRR vs target <-20% = URGENT action needed
-->

---

**DO NOT EDIT MANUALLY EXCEPT DURING FAILURE POST-MORTEM.**  
This file is updated by Bartek after analyzing why an optimization failed.
