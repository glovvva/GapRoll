# AI-Assisted Buckets API

Structured data (dictionaries/JSON) for **Proposed Groups** and **Unassigned Roles**, ready for drag-and-drop UI.

---

## 1. Job Grading – Tier Buckets

**Module:** `src.logic.job_grading`

### `get_tier_definitions() → List[Dict]`

Returns tier definitions for UI (e.g. bucket headers).

```python
from src.logic.job_grading import get_tier_definitions

defs = get_tier_definitions()
# [{"id": "junior", "name": "Junior (Entry)", "score_min": 0, "score_max": 150}, ...]
```

### `propose_tier_buckets(valuations_df, weights=None, ...) → Dict`

Builds **Proposed Groups** (per tier) and **Unassigned Roles** from a valuations DataFrame.

**Returns:**
```python
{
    "tier_definitions": [{"id", "name", "score_min", "score_max"}, ...],
    "proposed_groups": [
        {
            "id": "tier_junior",
            "name": "Junior (Entry)",
            "tier": "Junior (Entry)",
            "score_range": [0, 150],
            "roles": [
                {"job_title": "Junior Dev", "score": 120.0, "skills": 15, "effort": 12, ...}
            ],
        },
        ...
    ],
    "unassigned_roles": [
        {"job_title": "Unknown Role", "reason": "no_score"},
        ...
    ],
}
```

**Example (drag-and-drop):**
- `proposed_groups` → one bucket per tier; `roles` are draggable.
- `unassigned_roles` → pool of roles to assign to a bucket.

---

## 2. EVG Engine – Equal Value Groups Buckets

**Module:** `src.logic.evg_engine`

### `get_evg_buckets_structure(df, valuations_df, salary_col=..., gender_col=..., ...) → Dict`

Builds **Proposed Groups** (EVG score bands) and **Unassigned Roles** (Uncategorized) with pay gap and employee counts.

**Returns:**
```python
{
    "proposed_groups": [
        {
            "id": "evg_41_50",
            "name": "41-50 pkt",
            "score_range": [41, 50],
            "roles": [
                {"job_title": "Analyst", "score": 45, "employee_count": 12}
            ],
            "pay_gap_pct": 2.1,
            "total_employees": 25,
            "men": 15,
            "women": 10,
            "avg_salary": 8500.0,
        },
        ...
    ],
    "unassigned_roles": [
        {"job_title": "Unvalued Role", "score": None, "employee_count": 3}
    ],
    "summary": {
        "weighted_pay_gap": 3.2,
        "total_assigned": 100,
        "total_unassigned": 5,
    },
}
```

**Example (drag-and-drop):**
- Each `proposed_groups` item is one EVG bucket; `roles` can be re-assigned.
- `unassigned_roles` = positions with no valuation (Uncategorized).
- Use `pay_gap_pct` and `summary.weighted_pay_gap` for Joint Pay Assessment (Art. 10).

---

## 3. Backward Compatibility

Existing code can keep using `logic`:

```python
from logic import (
    create_equal_value_groups,
    get_evg_summary,
    calculate_pay_gap_by_evg_groups,
    map_score_to_tier,
    calculate_weighted_score,
)
```

New bucket APIs are used via `src.logic`:

```python
from src.logic.job_grading import propose_tier_buckets, get_tier_definitions
from src.logic.evg_engine import get_evg_buckets_structure
```

---

## 4. JSON for Frontend

All return values are JSON-serializable (no DataFrame in bucket payloads). Example:

```python
import json
from src.logic.job_grading import propose_tier_buckets

buckets = propose_tier_buckets(valuations_df, weights=weights_dict)
json_str = json.dumps(buckets, ensure_ascii=False, indent=2)
# Send to frontend for drag-and-drop UI
```

---

**Version:** 2.0.0-modular  
**Phase:** 4 – Logic migration (job_grading, evg_engine)
