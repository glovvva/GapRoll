"""
Database Module - Supabase Integration
======================================

Moduły:
- client: Połączenie z Supabase, konfiguracja
- auth: Autentykacja użytkowników (login/register)
- audit: Audit log, historia zmian
- security: RLS, PII detection, masking
- projects: Multi-tenancy, zarządzanie projektami
"""

# Re-export all functions for backward compatibility
from .client import (
    get_supabase_client,
    get_supabase_admin_client,
)

from .auth import (
    init_auth_session,
    login_user,
    logout_user,
    register_user,
    get_current_user,
    require_auth,
)

from .audit import (
    log_action,
    get_audit_logs,
    AUDIT_ACTION_TYPES,
)

from .security import (
    sanitize_upload,
    detect_pii_columns,
    generate_employee_hash,
    query_with_rls,
    PII_COLUMNS,
    PII_PATTERNS,
)

from .projects import (
    get_user_projects,
    initialize_default_tenant,
    set_project_context,
    get_active_project,
    switch_project,
    save_job_valuation,
    save_job_valuations_batch,
    get_project_valuations,
    get_valuation_by_job_title,
    delete_project_valuations,
    get_valuations_statistics,
    save_employees_to_project,
    get_project_employees,
    delete_project_employees,
)

__all__ = [
    # client
    'get_supabase_client',
    'get_supabase_admin_client',
    # auth
    'init_auth_session',
    'login_user',
    'logout_user',
    'register_user',
    'get_current_user',
    'require_auth',
    # audit
    'log_action',
    'get_audit_logs',
    'AUDIT_ACTION_TYPES',
    # security
    'sanitize_upload',
    'detect_pii_columns',
    'generate_employee_hash',
    'query_with_rls',
    'PII_COLUMNS',
    'PII_PATTERNS',
    # projects
    'get_user_projects',
    'initialize_default_tenant',
    'set_project_context',
    'get_active_project',
    'switch_project',
    'save_job_valuation',
    'save_job_valuations_batch',
    'get_project_valuations',
    'get_valuation_by_job_title',
    'delete_project_valuations',
    'get_valuations_statistics',
    'save_employees_to_project',
    'get_project_employees',
    'delete_project_employees',
]
