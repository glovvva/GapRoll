# -*- coding: utf-8 -*-
"""
logic.py - Re-exports only (modular architecture).
All implementation lives in src.logic.*. This file ensures backward compatibility.
"""

# Job Grading & EVG (Phase 4)
from src.logic.job_grading import (
    map_score_to_tier,
    calculate_weighted_score,
    get_tier_definitions,
    propose_tier_buckets,
)
from src.logic.evg_engine import (
    create_equal_value_groups,
    get_evg_summary,
    calculate_pay_gap_evg,
    calculate_pay_gap_by_evg_groups,
    get_high_gap_evg_categories,
    get_evg_buckets_structure,
)

# CSV Loader
from src.logic.csv_loader import (
    ENCODINGS,
    SEPARATORS,
    NO_FILE_SELECTED,
    detect_and_load_csv,
    load_csv_with_forced_separator,
    suggest_column_mapping,
    scan_available_csv_files,
    load_and_validate,
    generate_mock_data,
    get_unique_positions,
)

# Analytics (pay gap, outliers)
from src.logic.analytics import (
    remove_outliers_iqr,
    calculate_pay_gap,
    calculate_pay_gap_median,
)

# B2B Equalizer (conversions)
from src.logic.b2b_equalizer import (
    ZUS_CAP_ANNUAL,
    RATE_CAPPED,
    RATE_UNCAPPED,
    B2B_LEAVE_FACTOR,
    ZUS_B2B_MONTHLY,
    KUP_50_PERCENT_ANNUAL_LIMIT,
    calculate_virtual_gross_uop,
    calculate_b2b_equivalents,
    b2b_to_uop_bulk,
    calculate_virtual_gross_with_overrides,
)
# B2B Overrides (50% KUP, paid leave)
from src.logic.b2b_overrides import (
    apply_salary_overrides,
    b2b_to_uop_bulk_with_overrides,
    create_overrides_dataframe,
)

# Art.16 Reporting (quartiles, component gaps, RODO)
from src.logic.art16_reporting import (
    RODO_GROUP_THRESHOLD,
    mask_sensitive_data,
    apply_rodo_shield,
    calculate_pay_quartiles,
    calculate_component_gaps,
    format_quartile_for_chart,
)

# AI Helpers
from src.logic.ai_helpers import (
    MAPPING_AGENT_SYSTEM_PROMPT,
    get_ai_analysis,
    get_unique_positions_mapping,
    get_ai_job_scoring_mini,
    get_ai_job_grading,
)
