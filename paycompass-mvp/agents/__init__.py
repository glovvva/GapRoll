"""
agents/ - Moduły agentów AI dla PayCompass Pro

Architektura VAULT - Strict Modularization Standard
Cała logika AI znajduje się w tym folderze.

Dostępne moduły:
- grader.py - EU Standard Grader (Dyrektywa UE 2023/970)
- solver.py - Solver do optymalizacji
- vault.py - Agent sanityzacji danych PII
"""

from .grader import (
    AIJobGrader,
    JobValuationResult,
    grade_job,
    grade_jobs_batch,
    results_to_dataframe,
    EU_GRADER_SYSTEM_PROMPT,
    MAX_CATEGORY_SCORE,
    TOTAL_MAX_SCORE,
)

__all__ = [
    'AIJobGrader',
    'JobValuationResult',
    'grade_job',
    'grade_jobs_batch',
    'results_to_dataframe',
    'EU_GRADER_SYSTEM_PROMPT',
    'MAX_CATEGORY_SCORE',
    'TOTAL_MAX_SCORE',
]
