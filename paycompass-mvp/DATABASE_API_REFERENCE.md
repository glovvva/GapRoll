# 📚 DATABASE API REFERENCE

Quick reference for `src.database` module functions.

---

## 🔌 Connection (`client`)

### `get_supabase_client() → Client`
Returns singleton Supabase client from `st.secrets`.

**Example:**
```python
from src.database import get_supabase_client

client = get_supabase_client()
response = client.table('employees').select('*').execute()
```

---

### `get_supabase_admin_client() → Optional[Client]`
Returns admin client with `service_role_key` (bypasses RLS).

**Use only for:** Tenant initialization, bulk operations.

---

## 🔐 Authentication (`auth`)

### `init_auth_session() → None`
Initializes session state variables for auth.

**Session keys:** `authenticated`, `user`, `user_id`, `company_id`, `user_email`, `auth_error`

---

### `login_user(email: str, password: str) → bool`
Authenticates user via Supabase Auth.

**Example:**
```python
from src.database import login_user

if login_user("user@example.com", "password123"):
    st.success("Zalogowano!")
    # st.session_state.user_id is now set
```

---

### `logout_user() → None`
Logs out user and clears session.

---

### `register_user(email: str, password: str, company_id: str = None) → bool`
Registers new user.

---

### `get_current_user() → Optional[Dict]`
Returns current user data from session.

**Returns:** `{'id': ..., 'email': ..., 'company_id': ...}`

---

### `require_auth() → bool`
Checks if user is authenticated. Use at page start.

**Example:**
```python
from src.database import require_auth

if not require_auth():
    st.warning("Zaloguj się!")
    st.stop()
```

---

## 📝 Audit Log (`audit`)

### `log_action(user_id, company_id, action_type, details=None) → bool`
Logs action to immutable audit log.

**Action types:** See `AUDIT_ACTION_TYPES` (USER_LOGIN, FILE_UPLOAD, JOB_VALUATION_SAVED, etc.)

**Example:**
```python
from src.database import log_action

log_action(
    user_id=st.session_state.user_id,
    company_id=st.session_state.company_id,
    action_type='MANUAL_OVERRIDE',
    details={'field': 'salary', 'old_value': 5000, 'new_value': 5500}
)
```

---

### `get_audit_logs(company_id, limit=100, ...) → List[Dict]`
Fetches audit logs for company.

---

## 🔒 Security (`security`)

### `sanitize_upload(df: pd.DataFrame, log_removed=True) → pd.DataFrame`
Removes PII columns before processing.

**Example:**
```python
from src.database import sanitize_upload

df = pd.read_csv(uploaded_file)
df_clean = sanitize_upload(df)  # Removes PESEL, email, phone, etc.
```

**Removes:** PESEL, NIP, email, phone, address, IBAN, names, etc. (40+ patterns)

---

### `detect_pii_columns(df: pd.DataFrame) → List[str]`
Detects PII columns without removing them.

**Use for:** Showing warnings to user.

---

### `generate_employee_hash(row: pd.Series, salt=None) → str`
Generates anonymized employee ID.

**Returns:** `"EMP_a1b2c3d4..."` (SHA256 hash)

---

### `query_with_rls(table_name, select='*', filters=None) → List[Dict]`
Executes query with automatic RLS filtering by `company_id`.

---

## 🏢 Multi-Tenancy (`projects`)

### `get_user_projects(user_id: str) → List[Dict]`
Fetches all projects for user.

**Returns:** `[{'id': ..., 'name': ..., 'organization_id': ..., 'role': 'admin'}, ...]`

---

### `initialize_default_tenant(user_id, email) → Optional[Dict]`
Creates default organization + project for new user.

**Creates:** 1 organization, 1 project, 1 membership (admin role)

---

### `set_project_context(project_id: str) → bool`
Sets active project (activates RLS).

---

### `get_active_project() → Optional[Dict]`
Returns current project from `st.session_state`.

---

### `switch_project(project_id: str) → bool`
Switches to different project.

**Example:**
```python
from src.database import switch_project, get_user_projects

projects = get_user_projects(st.session_state.user_id)
selected_id = st.selectbox("Projekt", [p['id'] for p in projects])

if st.button("Przełącz"):
    switch_project(selected_id)
    st.rerun()
```

---

## 💼 Job Valuations (`projects`)

### `save_job_valuation(project_id, job_data) → Optional[Dict]`
Saves job valuation to database.

**job_data schema:**
```python
{
    'job_title': 'Senior Developer',
    'skills': 20,
    'effort': 18,
    'responsibility': 22,
    'conditions': 15,
    'total_score': 75,
    'justification': 'High complexity...',
    'confidence': 0.85,
    'needs_review': False
}
```

---

### `save_job_valuations_batch(project_id, valuations) → int`
Saves multiple valuations.

**Returns:** Count of saved records.

---

### `get_project_valuations(project_id) → List[Dict]`
Fetches all valuations for project.

---

### `get_valuation_by_job_title(project_id, job_title) → Optional[Dict]`
Fetches specific valuation.

---

### `delete_project_valuations(project_id) → bool`
Deletes all valuations for project.

---

### `get_valuations_statistics(project_id) → Dict`
Calculates valuation stats.

**Returns:**
```python
{
    'count': 50,
    'avg_score': 67.5,
    'avg_skills': 18.2,
    'avg_effort': 16.8,
    'avg_responsibility': 19.5,
    'avg_conditions': 13.0,
    'needs_review_count': 5,
    'min_score': 35,
    'max_score': 95
}
```

---

## 👥 Employees Data (`projects`)

### `save_employees_to_project(project_id, df, source_filename=None) → int`
Saves employee data from DataFrame to database.

**Auto-detects columns:** Employee_ID, Position, Department, Salary, Gender, etc.

**Returns:** Count of saved records.

**Example:**
```python
from src.database import save_employees_to_project

df = pd.read_csv(uploaded_file)
count = save_employees_to_project(
    project_id='abc-123',
    df=df,
    source_filename='payroll_2024.csv'
)
st.success(f"Zapisano {count} pracowników")
```

---

### `get_project_employees(project_id) → List[Dict]`
Fetches all employees for project.

---

### `delete_project_employees(project_id) → bool`
Deletes all employees for project.

---

## 🎯 COMMON PATTERNS

### Pattern 1: Authentication Flow
```python
from src.database import init_auth_session, require_auth, login_user

init_auth_session()

if not require_auth():
    email = st.text_input("Email")
    password = st.text_input("Hasło", type="password")
    
    if st.button("Zaloguj"):
        if login_user(email, password):
            st.success("Zalogowano!")
            st.rerun()
    st.stop()

# Protected content here
st.write(f"Witaj, {st.session_state.user_email}")
```

---

### Pattern 2: Project Selection
```python
from src.database import get_user_projects, switch_project

user_id = st.session_state.user_id
projects = get_user_projects(user_id)

if not projects:
    st.warning("Brak projektów")
else:
    project_names = [p['name'] for p in projects]
    selected = st.selectbox("Wybierz projekt", project_names)
    
    if st.button("Aktywuj"):
        project_id = next(p['id'] for p in projects if p['name'] == selected)
        switch_project(project_id)
        st.rerun()
```

---

### Pattern 3: Safe File Upload
```python
from src.database import sanitize_upload, detect_pii_columns, log_action

uploaded_file = st.file_uploader("Wgraj CSV", type=['csv'])

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    
    # Detect PII
    pii_cols = detect_pii_columns(df)
    if pii_cols:
        st.warning(f"Wykryto dane osobowe: {', '.join(pii_cols)}")
    
    # Sanitize
    df_clean = sanitize_upload(df, log_removed=True)
    
    # Log action
    log_action(
        user_id=st.session_state.user_id,
        company_id=st.session_state.company_id,
        action_type='FILE_UPLOAD',
        details={'filename': uploaded_file.name, 'rows': len(df_clean)}
    )
    
    st.success(f"Załadowano {len(df_clean)} wierszy")
```

---

### Pattern 4: Job Valuation Workflow
```python
from src.database import save_job_valuation, get_project_valuations

# Save valuation
job_data = {
    'job_title': 'Data Scientist',
    'skills': 22,
    'effort': 20,
    'responsibility': 18,
    'conditions': 12,
    'total_score': 72,
    'justification': 'Complex analytics, ML models',
    'confidence': 0.9,
    'needs_review': False
}

result = save_job_valuation(
    project_id=st.session_state.active_project_id,
    job_data=job_data
)

if result:
    st.success("Zapisano wycenę stanowiska")

# Display all valuations
valuations = get_project_valuations(st.session_state.active_project_id)
df_valuations = pd.DataFrame(valuations)
st.dataframe(df_valuations)
```

---

## 📌 CONSTANTS

### `AUDIT_ACTION_TYPES` (25 types)
```python
from src.database import AUDIT_ACTION_TYPES

# User actions
'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER'

# File operations
'FILE_UPLOAD', 'FILE_DOWNLOAD', 'DATA_EXPORT'

# Reports
'PDF_GENERATED', 'REPORT_DOWNLOADED'

# Multi-tenancy
'TENANT_CREATED', 'TENANT_SWITCHED', 'PROJECT_CREATED', 'ORGANIZATION_CREATED'

# Job valuations
'JOB_VALUATION_SAVED', 'JOB_VALUATIONS_DELETED', 'JOB_GRADING_STARTED', 'JOB_GRADING_COMPLETED'

# Other
'B2B_PARAMETER_CHANGE', 'SCORING_MODEL_APPROVED', 'MANUAL_OVERRIDE', 'RLS_QUERY', 'ADMIN_ACTION', 'ANALYSIS_METHOD_CHANGED'
```

---

### `PII_COLUMNS` (40+ patterns)
Polish & English patterns for: PESEL, NIP, email, phone, address, IBAN, names, birthdates, etc.

---

### `PII_PATTERNS` (10 regex patterns)
Regular expressions for detecting PII in column names.

---

## 🆘 TROUBLESHOOTING

### Error: "Brak wymaganej konfiguracji Supabase"
**Fix:** Add to `.streamlit/secrets.toml`:
```toml
[supabase]
url = "https://xxx.supabase.co"
key = "eyJhbGciOiJIUzI1..."
service_role_key = "eyJhbGciOiJIUzI1..."  # optional
```

---

### Error: Session state not initialized
**Fix:** Call `init_auth_session()` before using auth functions.

---

### Error: "Not authenticated"
**Fix:** Wrap protected code with `require_auth()` check:
```python
if not require_auth():
    st.warning("Zaloguj się!")
    st.stop()
```

---

### PII columns not removed
**Fix:** Use `sanitize_upload()` immediately after loading CSV:
```python
df = pd.read_csv(file)
df = sanitize_upload(df)  # Now safe
```

---

## 🔗 SEE ALSO

- `DATABASE_MIGRATION_COMPLETE.md` - Full migration documentation
- `src/database/__init__.py` - Module exports
- Original: `db_manager.py` (deprecated, can be deleted)

---

**Version:** 2.0.0-modular  
**Last Updated:** 2026-02-05
