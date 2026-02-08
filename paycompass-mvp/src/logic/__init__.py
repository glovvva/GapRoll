"""
Logic Module - Business Logic & Calculations
============================================

Moduły:
- csv_loader: Wczytywanie i walidacja CSV
- analytics: Pay gap, outlier removal
- evg_engine: Equal Value Groups (EVG) - Art. 4 Dyrektywy UE 2023/970
- b2b_equalizer: Konwersje B2B/UoP, ZUS
- art16_reporting: Kwartyle, component gaps, RODO
- job_grading: Wartościowanie stanowisk, tier mapping
- ai_helpers: LLM analysis, job mapping, scoring
"""

# Re-exports from submodules (for "from src.logic import ...")
from .job_grading import (
    map_score_to_tier,
    calculate_weighted_score,
    get_tier_definitions,
    propose_tier_buckets,
    TIER_DEFINITIONS,
)
from .evg_engine import (
    create_equal_value_groups,
    get_evg_summary,
    calculate_pay_gap_evg,
    calculate_pay_gap_by_evg_groups,
    get_high_gap_evg_categories,
    get_evg_buckets_structure,
    RODO_GROUP_THRESHOLD as EVG_RODO_GROUP_THRESHOLD,
)
from .csv_loader import (
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
from .analytics import remove_outliers_iqr, calculate_pay_gap, calculate_pay_gap_median
from .b2b_equalizer import (
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
from .b2b_overrides import (
    apply_salary_overrides,
    b2b_to_uop_bulk_with_overrides,
    create_overrides_dataframe,
)
from .art16_reporting import (
    RODO_GROUP_THRESHOLD,
    mask_sensitive_data,
    apply_rodo_shield,
    calculate_pay_quartiles,
    calculate_component_gaps,
    format_quartile_for_chart,
)
from .ai_helpers import (
    MAPPING_AGENT_SYSTEM_PROMPT,
    get_ai_analysis,
    get_unique_positions_mapping,
    get_ai_job_scoring_mini,
    get_ai_job_grading,
)

__all__ = [
    "map_score_to_tier",
    "calculate_weighted_score",
    "get_tier_definitions",
    "propose_tier_buckets",
    "TIER_DEFINITIONS",
    "create_equal_value_groups",
    "get_evg_summary",
    "calculate_pay_gap_evg",
    "calculate_pay_gap_by_evg_groups",
    "get_high_gap_evg_categories",
    "get_evg_buckets_structure",
    "EVG_RODO_GROUP_THRESHOLD",
    "ENCODINGS",
    "SEPARATORS",
    "NO_FILE_SELECTED",
    "detect_and_load_csv",
    "load_csv_with_forced_separator",
    "suggest_column_mapping",
    "scan_available_csv_files",
    "load_and_validate",
    "generate_mock_data",
    "get_unique_positions",
    "remove_outliers_iqr",
    "calculate_pay_gap",
    "calculate_pay_gap_median",
    "ZUS_CAP_ANNUAL",
    "RATE_CAPPED",
    "RATE_UNCAPPED",
    "B2B_LEAVE_FACTOR",
    "ZUS_B2B_MONTHLY",
    "KUP_50_PERCENT_ANNUAL_LIMIT",
    "calculate_virtual_gross_uop",
    "calculate_b2b_equivalents",
    "b2b_to_uop_bulk",
    "calculate_virtual_gross_with_overrides",
    "apply_salary_overrides",
    "b2b_to_uop_bulk_with_overrides",
    "create_overrides_dataframe",
    "RODO_GROUP_THRESHOLD",
    "mask_sensitive_data",
    "apply_rodo_shield",
    "calculate_pay_quartiles",
    "calculate_component_gaps",
    "format_quartile_for_chart",
    "MAPPING_AGENT_SYSTEM_PROMPT",
    "get_ai_analysis",
    "get_unique_positions_mapping",
    "get_ai_job_scoring_mini",
    "get_ai_job_grading",
]
