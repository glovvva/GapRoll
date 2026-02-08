# Backend Architecture Documentation
## PayCompass Pro - Database Schema & Multi-Tenancy

**Version:** 2.0  
**Last Updated:** 2026-02-03  
**Database:** PostgreSQL 15+ (Supabase)

---

## 1. Multi-Tenancy Strategy

### 1.1 Overview
PayCompass uses **Row Level Security (RLS)** for complete data isolation between organizations.

**Key Concepts:**
- **Organization:** Top-level tenant (company)
- **Project:** Dataset within organization (e.g., "Q1 2026 Audit", "HR Department")
- **User:** Individual with access to one or more organizations

**Data Flow:**
```
User (auth.users)
  ↓
Organization (public.organizations) - owner_id
  ↓
Projects (public.projects) - organization_id
  ↓
Employees (public.employees) - project_id
```

### 1.2 RLS Implementation
```sql
-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own organizations
CREATE POLICY "Users see own organizations"
ON public.organizations
FOR ALL
USING (owner_id = auth.uid());

-- Policy: Users can only see projects in their organizations
CREATE POLICY "Users see own projects"
ON public.projects
FOR ALL
USING (
  organization_id IN (
    SELECT id FROM public.organizations
    WHERE owner_id = auth.uid()
  )
);

-- Policy: Users can only see employees in their projects
CREATE POLICY "Users see own employees"
ON public.employees
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects
    WHERE organization_id IN (
      SELECT id FROM public.organizations
      WHERE owner_id = auth.uid()
    )
  )
);
```

**Benefits:**
- ✅ Impossible for User A to access User B's data (enforced at DB level)
- ✅ No need for manual `WHERE user_id = ...` in every query
- ✅ Works with all Supabase client methods (select, insert, update, delete)

---

## 2. Database Schema

### 2.1 Core Tables

#### `auth.users` (Supabase Built-in)
Managed by Supabase Auth - do NOT manually modify.

```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- ... other Supabase Auth fields ...
);
```

**Access in Python:**
```python
user = supabase.auth.get_user()
user_id = user.id
user_email = user.email
```

---

#### `public.organizations`
Top-level tenant. One user can own multiple organizations (future: team members).

```sql
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  settings JSONB DEFAULT '{}',  -- Future: custom settings (timezone, currency, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_organizations_owner ON public.organizations(owner_id);

-- RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own organizations"
ON public.organizations
FOR ALL
USING (owner_id = auth.uid());
```

**Default Organization:**
- Created automatically on first login via `initialize_default_tenant()`
- Name format: `"{user_email} - Główny projekt"`

---

#### `public.projects`
Dataset within organization. Employees belong to exactly one project.

```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  metadata JSONB DEFAULT '{}',  -- Future: custom fields (department, location, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, name)  -- Prevent duplicate project names within org
);

-- Indexes
CREATE INDEX idx_projects_organization ON public.projects(organization_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects"
ON public.projects
FOR ALL
USING (
  organization_id IN (
    SELECT id FROM public.organizations WHERE owner_id = auth.uid()
  )
);
```

**Use Cases:**
- Separate Q1 vs Q2 audit data
- Different departments (HR, Sales, Engineering)
- Before/after pay equity adjustments

---

#### `public.employees`
Individual employee records. Core data for pay gap analysis.

```sql
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Core Fields (Required)
  employee_id TEXT NOT NULL,  -- Internal ID from company HR system
  gender TEXT NOT NULL CHECK (gender IN ('Kobieta', 'Mężczyzna', 'Inna', 'Wolę nie podawać')),
  position TEXT NOT NULL,
  salary NUMERIC(10, 2) NOT NULL,  -- Monthly gross salary (PLN)
  
  -- Optional Fields
  variable_pay NUMERIC(10, 2) DEFAULT 0,  -- Bonuses, commissions
  allowances NUMERIC(10, 2) DEFAULT 0,    -- Fixed allowances (car, housing, etc.)
  benefit_value NUMERIC(10, 2) DEFAULT 0, -- Non-cash benefits (insurance, gym, etc.)
  scoring INTEGER CHECK (scoring BETWEEN 1 AND 100),  -- Job value scoring (EVG)
  department TEXT,
  contract_type TEXT CHECK (contract_type IN ('UoP', 'B2B', 'Umowa zlecenie', 'Inne')),
  
  -- Metadata
  notes TEXT,  -- Internal notes (not shown to employee)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, employee_id)  -- Prevent duplicate employee IDs within project
);

-- Indexes
CREATE INDEX idx_employees_project ON public.employees(project_id);
CREATE INDEX idx_employees_gender ON public.employees(gender);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_scoring ON public.employees(scoring);

-- Composite index for common queries
CREATE INDEX idx_employees_project_gender ON public.employees(project_id, gender);

-- RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own employees"
ON public.employees
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects
    WHERE organization_id IN (
      SELECT id FROM public.organizations WHERE owner_id = auth.uid()
    )
  )
);
```

**Calculated Fields (NOT stored in DB):**
```python
# Computed in Python/Pandas
Total_Compensation = Salary + Variable_Pay + Allowances + Benefit_Value
Fair_Pay = (Linear regression based on Scoring)
Adjustment = Fair_Pay - Total_Compensation (if > 0)
```

---

### 2.2 Future Tables (Planned Phase 3+)

#### `public.team_members`
Allow multiple users per organization (role-based access).

```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);
```

**Roles:**
- `owner`: Full access, can delete org
- `admin`: Can manage projects, employees (cannot delete org)
- `viewer`: Read-only access

---

#### `public.audit_logs`
Track all data changes for compliance.

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  action TEXT NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'
  resource_type TEXT NOT NULL,  -- 'employee', 'project', etc.
  resource_id UUID,
  changes JSONB,  -- Before/after values
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
```

---

#### `public.reports`
Store generated reports (PDF, CSV exports).

```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'art_7', 'art_16', 'solio_adjustment'
  file_path TEXT NOT NULL,  -- Supabase Storage path
  metadata JSONB DEFAULT '{}',  -- Report parameters (date range, filters, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Database Functions (Python - db_manager.py)

### 3.1 User & Organization Management

#### `initialize_default_tenant(user_id, user_email)`
Creates default organization + project for new user.

```python
def initialize_default_tenant(user_id: str, user_email: str) -> dict:
    """
    Create default organization and project for new user.
    Called automatically on first login.
    
    Returns:
        dict: Created project details (id, name, organization_id)
    """
    # 1. Create organization
    org_response = supabase.table("organizations").insert({
        "name": f"{user_email} - Główny projekt",
        "owner_id": user_id,
        "description": "Domyślna organizacja"
    }).execute()
    
    org_id = org_response.data[0]["id"]
    
    # 2. Create default project
    project_response = supabase.table("projects").insert({
        "organization_id": org_id,
        "name": "Projekt Główny",
        "description": "Automatycznie utworzony projekt"
    }).execute()
    
    return project_response.data[0]
```

---

#### `get_user_projects(user_id)`
Fetch all projects accessible by user (via RLS).

```python
def get_user_projects(user_id: str) -> list:
    """
    Get all projects for authenticated user.
    RLS automatically filters by ownership.
    
    Returns:
        list: [{"id": "uuid", "name": "Project 1", ...}, ...]
    """
    response = supabase.table("projects").select(
        "id, name, description, created_at, organization_id"
    ).eq("status", "active").execute()
    
    return response.data
```

---

### 3.2 Employee Data Management

#### `save_employees_to_project(project_id, df)`
Bulk insert employees from DataFrame.

```python
def save_employees_to_project(project_id: str, df: pd.DataFrame) -> bool:
    """
    Save employee data to Supabase (upsert: update if exists, insert if new).
    
    Args:
        project_id: Target project UUID
        df: Pandas DataFrame with columns: employee_id, gender, position, salary, etc.
    
    Returns:
        bool: Success status
    """
    # Delete existing employees in project (replace strategy)
    supabase.table("employees").delete().eq("project_id", project_id).execute()
    
    # Prepare records
    records = []
    for _, row in df.iterrows():
        records.append({
            "project_id": project_id,
            "employee_id": str(row.get("Employee_ID", "")),
            "gender": str(row["Gender"]),
            "position": str(row["Position"]),
            "salary": float(row["Salary"]),
            "variable_pay": float(row.get("Variable_Pay", 0)),
            "allowances": float(row.get("Allowances", 0)),
            "benefit_value": float(row.get("Benefit_Value", 0)),
            "scoring": int(row["Scoring"]) if pd.notna(row.get("Scoring")) else None,
            "department": str(row.get("Department", "")),
        })
    
    # Batch insert (500 records at a time)
    batch_size = 500
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        supabase.table("employees").insert(batch).execute()
    
    return True
```

---

#### `load_employees_from_project(project_id)`
Fetch employees as DataFrame.

```python
def load_employees_from_project(project_id: str) -> pd.DataFrame:
    """
    Load employee data from Supabase into Pandas DataFrame.
    
    Args:
        project_id: Source project UUID
    
    Returns:
        pd.DataFrame: Employee data with standardized column names
    """
    response = supabase.table("employees").select("*").eq("project_id", project_id).execute()
    
    if not response.data:
        return pd.DataFrame()
    
    df = pd.DataFrame(response.data)
    
    # Rename to match internal column names
    df.rename(columns={
        "employee_id": "Employee_ID",
        "gender": "Gender",
        "position": "Position",
        "salary": "Salary",
        "variable_pay": "Variable_Pay",
        "allowances": "Allowances",
        "benefit_value": "Benefit_Value",
        "scoring": "Scoring",
        "department": "Department",
    }, inplace=True)
    
    return df
```

---

## 4. Data Migration Strategy

### 4.1 Version Control (Supabase Migrations)
```bash
# Create new migration
supabase migration new add_audit_logs_table

# Apply migrations
supabase db push

# Rollback (if needed)
supabase db reset
```

### 4.2 Backup Strategy
- **Automated:** Supabase performs daily backups (retained 7 days on free tier, 30+ days on Pro)
- **Manual:** Export via `pg_dump` weekly
- **Point-in-Time Recovery:** Available on Pro tier (restore to any second in last 30 days)

---

## 5. Performance Optimization

### 5.1 Indexes
**Current:**
- Primary keys (automatic B-tree index)
- Foreign keys (automatic index on referenced column)
- Gender, Department, Scoring (for filtering in reports)

**Future (if > 10k employees per project):**
- Partial indexes on `status = 'active'`
- GIN index on JSONB metadata fields

### 5.2 Query Optimization
```python
# ✅ GOOD: Select only needed columns
response = supabase.table("employees").select("gender, salary").eq("project_id", project_id).execute()

# ❌ BAD: Select all columns (slower, more bandwidth)
response = supabase.table("employees").select("*").eq("project_id", project_id).execute()

# ✅ GOOD: Use RLS (automatic filtering)
response = supabase.table("projects").select("*").execute()  # RLS filters by owner_id

# ❌ BAD: Manual filtering (less secure, more code)
all_projects = supabase.table("projects").select("*").execute()
user_projects = [p for p in all_projects.data if p["owner_id"] == user_id]
```

### 5.3 Connection Pooling
Supabase handles connection pooling automatically (PgBouncer).

**Limits:**
- **Free Tier:** 60 concurrent connections
- **Pro Tier:** 200+ concurrent connections

---

## 6. Security Best Practices

### 6.1 RLS Golden Rules
1. **Enable RLS on ALL user-facing tables** (never expose public.* without RLS)
2. **Test policies with different users** (don't assume `auth.uid()` is always set)
3. **Use CASCADE deletes** (prevent orphaned records)

### 6.2 SQL Injection Prevention
**✅ SAFE:** Supabase client uses parameterized queries
```python
response = supabase.table("employees").select("*").eq("project_id", user_input).execute()  # Safe
```

**❌ UNSAFE:** Raw SQL (only use for admin scripts, never user input)
```python
supabase.rpc("execute_sql", {"query": f"SELECT * FROM employees WHERE id = '{user_input}'"})  # Unsafe!
```

### 6.3 Environment Variables
**NEVER commit to Git:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (admin access - use sparingly)

**Storage:**
- Local: `.env` file (excluded in `.gitignore`)
- Production: Streamlit secrets or environment variables

---

## 7. Testing Strategy

### 7.1 Unit Tests (Future)
```python
# Example: Test RLS isolation
def test_rls_isolation():
    # Create User A
    user_a = create_test_user("usera@test.com")
    org_a = initialize_default_tenant(user_a.id, user_a.email)
    
    # Create User B
    user_b = create_test_user("userb@test.com")
    org_b = initialize_default_tenant(user_b.id, user_b.email)
    
    # Try to access User A's project as User B
    with pytest.raises(Exception):  # Should fail
        load_employees_from_project(org_a["id"], user_id=user_b.id)
```

### 7.2 Load Testing (Phase 3)
**Scenarios:**
- 100 concurrent users
- 10,000 employees per project
- 10 MB CSV upload

**Tools:** Locust, k6

---

## 8. Troubleshooting

### 8.1 Common Issues

**Issue:** "Row Level Security violation"  
**Cause:** Policy missing or `auth.uid()` returns NULL  
**Fix:** Verify user is authenticated, check policy with `SELECT * FROM pg_policies;`

**Issue:** "Foreign key constraint violation"  
**Cause:** Trying to insert employee with invalid `project_id`  
**Fix:** Verify project exists and user has access

**Issue:** Slow queries (> 2s)  
**Cause:** Missing index or full table scan  
**Fix:** Run `EXPLAIN ANALYZE` on slow query, add index

---

**Document Owner:** Backend Team  
**Last Review:** 2026-02-03  
**Next Review:** 2026-04-01
