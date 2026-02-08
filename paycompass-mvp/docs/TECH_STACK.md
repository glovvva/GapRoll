# Technical Stack Documentation
## PayCompass Pro - Technology Choices & Dependencies

**Version:** 2.0  
**Last Updated:** 2026-02-03

---

## 1. Frontend Framework

### 1.1 Streamlit
**Version:** 1.40.0+  
**License:** Apache 2.0  
**Rationale:** Rapid prototyping, Python-native, excellent for data apps

**Key APIs Used:**
```python
# Page Configuration
st.set_page_config(
    layout="wide",
    page_title="PayCompass Pro",
    initial_sidebar_state="expanded"  # CRITICAL: Always "expanded" for logged-in users
)

# Session State (Primary Navigation Mechanism)
st.session_state["authenticated"] = True
st.session_state["setup_complete"] = False
st.session_state["active_project_id"] = "uuid-here"

# Data Display Widgets
st.dataframe(df, use_container_width=True)  # ✅ CORRECT (not use_column_width)
st.data_editor(df, use_container_width=True)

# Charts
st.plotly_chart(fig, use_container_width=True)  # ✅ CORRECT

# File Upload
uploaded_file = st.file_uploader("Upload CSV", type=["csv"])
```

**CRITICAL DEPRECATION WARNINGS:**
- ❌ `use_column_width=True` → ✅ `use_container_width=True`
- ❌ `st.beta_columns()` → ✅ `st.columns()`
- ❌ `st.cache` → ✅ `st.cache_data` or `st.cache_resource`

**Known Limitations:**
- Not suitable for > 10k employees (performance degradation)
- Limited customization vs. React/Vue
- Session state resets on page refresh (mitigated by Supabase persistence)

---

## 2. Backend & Database

### 2.1 Supabase
**Service:** Managed PostgreSQL + Auth + Storage  
**Version:** PostgreSQL 15+  
**Rationale:** Fast setup, built-in RLS, real-time subscriptions

**Connection:**
```python
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
```

**Tables:**
```sql
-- Users (handled by Supabase Auth)
auth.users
  - id (uuid, PK)
  - email (text)
  - created_at (timestamp)

-- Organizations (Multi-tenancy parent)
public.organizations
  - id (uuid, PK, default: gen_random_uuid())
  - name (text)
  - owner_id (uuid, FK -> auth.users.id)
  - created_at (timestamp)
  - updated_at (timestamp)

-- Projects (Tenant isolation unit)
public.projects
  - id (uuid, PK)
  - organization_id (uuid, FK -> organizations.id)
  - name (text)
  - description (text, nullable)
  - created_at (timestamp)

-- Employees (Core data)
public.employees
  - id (uuid, PK)
  - project_id (uuid, FK -> projects.id)
  - employee_id (text)
  - gender (text)
  - position (text)
  - salary (numeric)
  - variable_pay (numeric, nullable)
  - allowances (numeric, nullable)
  - scoring (integer, nullable)
  - department (text, nullable)
  - created_at (timestamp)
```

**Row Level Security (RLS) Policies:**
```sql
-- Example: Users can only see their own projects
CREATE POLICY "Users see own projects"
ON public.projects
FOR SELECT
USING (
  organization_id IN (
    SELECT id FROM public.organizations
    WHERE owner_id = auth.uid()
  )
);

-- Example: Users can only see employees in their projects
CREATE POLICY "Users see own employees"
ON public.employees
FOR SELECT
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

**Functions in db_manager.py:**
- `get_user_projects(user_id)` - Fetch all projects for user
- `save_employees_to_project(project_id, df)` - Bulk insert employees
- `load_employees_from_project(project_id)` - Fetch employees as DataFrame
- `initialize_default_tenant(user_id, email)` - Create default org + project

---

## 3. Data Visualization

### 3.1 Plotly
**Version:** 5.18.0+  
**License:** MIT  
**Rationale:** Interactive, publication-quality charts, JS-free (runs in Python)

**Primary Charts:**

**1. Fair Pay Line (Scatter Plot)**
```python
import plotly.graph_objects as go

fig = go.Figure()
fig.add_trace(go.Scatter(
    x=df['Scoring'],
    y=df['Salary'],
    mode='markers',
    marker=dict(
        size=10,
        color=df['Gender'].map({'Kobieta': '#FF6B9D', 'Mężczyzna': '#4A90E2'}),
        opacity=0.7
    ),
    text=df['Position'],
    hovertemplate='<b>%{text}</b><br>Scoring: %{x}<br>Salary: %{y:,.0f} PLN<extra></extra>'
))

# Regression line (Fair Pay)
fig.add_trace(go.Scatter(
    x=scoring_range,
    y=fair_pay_line,
    mode='lines',
    line=dict(color='#10b981', width=3, dash='dash'),
    name='Fair Pay Line'
))

st.plotly_chart(fig, use_container_width=True)
```

**2. Quartile Chart (Stacked Bar - Horizontal)**
```python
fig = go.Figure()

fig.add_trace(go.Bar(
    name='Kobiety',
    y=['Q1', 'Q2', 'Q3', 'Q4'],
    x=quartiles['Female_Pct'],
    orientation='h',
    marker_color='#FF6B9D'
))

fig.add_trace(go.Bar(
    name='Mężczyźni',
    y=['Q1', 'Q2', 'Q3', 'Q4'],
    x=quartiles['Male_Pct'],
    orientation='h',
    marker_color='#4A90E2'
))

fig.update_layout(
    barmode='stack',
    title='Rozkład płci w kwartylach płacowych (Art. 16)',
    xaxis_title='Udział procentowy (%)',
    yaxis_title='Kwartyl',
    font=dict(family='Inter, sans-serif', size=14)
)
```

**3. EVG Gap Breakdown (Bar Chart)**
```python
import plotly.express as px

fig = px.bar(
    evg_summary,
    x='EVG_Group',
    y='Pay_Gap_Pct',
    color='Pay_Gap_Pct',
    color_continuous_scale=['#10b981', '#fbbf24', '#ef4444'],
    title='Luka płacowa według grup EVG (Art. 4)',
    labels={'Pay_Gap_Pct': 'Luka płacowa (%)', 'EVG_Group': 'Grupa EVG'}
)
```

**Alternative (Considered but not used):**
- Matplotlib: Too static, poor interactivity
- Chart.js: Requires JS integration (Streamlit limitation)
- D3.js: Overkill, steep learning curve

---

## 4. Authentication & Authorization

### 4.1 Streamlit Session State + Supabase Auth
**Rationale:** Lightweight, no external dependencies (JWT handled by Supabase)

**Flow:**
```python
# 1. User Login (app.py)
def login_user(email, password):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        st.session_state["authenticated"] = True
        st.session_state["user_id"] = response.user.id
        st.session_state["user_email"] = response.user.email
        return True
    except Exception as e:
        return False

# 2. Session Persistence (check on every st.rerun())
if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False

# 3. Protected Routes
if not st.session_state.get("authenticated"):
    show_landing_page()
    st.stop()  # Block rendering of dashboard

# 4. Logout
def logout_user():
    st.session_state.clear()
    supabase.auth.sign_out()
```

**Security Considerations:**
- ✅ Passwords never stored in code (env vars)
- ✅ RLS enforces data isolation at DB level
- ⚠️ Session state stored in memory (lost on page refresh) - mitigated by "Remember Me" + Supabase token refresh
- ❌ No 2FA (planned for Phase 4)

---

## 5. Data Processing

### 5.1 Pandas
**Version:** 2.2.0+  
**License:** BSD-3-Clause

**Key Operations:**
```python
# CSV Loading with auto-detection
df = pd.read_csv(
    file,
    sep=None,  # Auto-detect separator (, or ;)
    engine='python',
    encoding='utf-8'
)

# Column mapping
df.columns = df.columns.str.strip()
df.rename(columns={'Wynagrodzenie': 'Salary', 'Płeć': 'Gender'}, inplace=True)

# Type conversion
df['Salary'] = pd.to_numeric(df['Salary'], errors='coerce').fillna(0).astype(int)

# Quartile calculation
df['Quartile'] = pd.qcut(df['Total_Comp'], q=4, labels=['Q1', 'Q2', 'Q3', 'Q4'])

# Aggregation
summary = df.groupby(['Gender', 'Quartile']).size().reset_index(name='Count')
```

### 5.2 NumPy
**Version:** 1.26.0+  
**Purpose:** Statistical calculations (median, percentiles, IQR)

```python
# Outlier removal (IQR method)
Q1 = df['Salary'].quantile(0.25)
Q3 = df['Salary'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR
df_clean = df[(df['Salary'] >= lower_bound) & (df['Salary'] <= upper_bound)]

# Fair pay regression
coefficients = np.polyfit(df['Scoring'], df['Salary'], deg=1)
fair_pay_line = np.polyval(coefficients, scoring_range)
```

---

## 6. AI & LLM Integration

### 6.1 LangChain + OpenAI
**Version:** LangChain 0.1.0+, OpenAI 1.6.0+  
**Model:** GPT-4o (gpt-4o-2024-11-20)  
**Cost:** ~$0.01 per analysis (50 positions)

**Use Cases:**
1. **Job Scoring (EVG):** Automatic 1-100 scoring based on position title + description
2. **Risk Analysis:** Identify legal/financial risks per department
3. **Recommendations:** Generate actionable advice for HR/CFO

**Example (Job Grading):**
```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

def get_ai_job_grading(positions: list, api_key: str):
    chat = ChatOpenAI(openai_api_key=api_key, model="gpt-4o")
    
    prompt = f"""
    Jesteś ekspertem od wartościowania stanowisk. Przypisz scoring 1-100 dla każdego stanowiska.
    
    Stanowiska: {', '.join(positions)}
    
    Kryteria:
    - 1-30: Entry-level (Junior, Stażysta)
    - 31-60: Mid-level (Specjalista, Manager)
    - 61-100: Senior-level (Dyrektor, C-level)
    
    Zwróć JSON: {{"Stanowisko": scoring}}
    """
    
    response = chat.invoke([HumanMessage(content=prompt)])
    return json.loads(response.content)
```

**Fallback:** Jeśli brak klucza API → użytkownik musi ręcznie przypisać scoring

---

## 7. PDF Generation

### 7.1 ReportLab
**Version:** 4.0.0+  
**License:** BSD  
**Purpose:** Generate Art. 7 + Art. 16 compliance reports

**Template Structure:**
```python
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table

def generate_art7_report(company_name, df, quartiles, gaps):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    
    elements = []
    elements.append(Paragraph(f"<b>PayCompass Art. 7 Report</b>", title_style))
    elements.append(Paragraph(f"Organization: {company_name}", body_style))
    
    # Quartile table
    table_data = [['Quartile', 'Female %', 'Male %']]
    for q in quartiles:
        table_data.append([q['Quartile'], f"{q['Female_Pct']:.1f}%", f"{q['Male_Pct']:.1f}%"])
    
    table = Table(table_data)
    elements.append(table)
    
    doc.build(elements)
    return buffer.getvalue()
```

---

## 8. Styling & Theming

### 8.1 Custom CSS (styles.py)
**Design System:** High-Trust Financial (Flat, Dark Mode, High Contrast)

**Color Palette:**
```css
:root {
    --slate-900: #0f172a;     /* Background */
    --slate-800: #1e293b;     /* Cards, inputs */
    --slate-400: #94a3b8;     /* Muted text */
    --white: #ffffff;         /* Primary text */
    --accent-teal: #14b8a6;   /* Primary CTA */
    --accent-amber: #f59e0b;  /* Warnings */
    --accent-red: #ef4444;    /* Errors, alerts */
}
```

**Typography:**
- **Body:** Inter (400, 500, 600) - sans-serif
- **Numbers:** JetBrains Mono (500, 700) - monospace (for percentages, currencies)

**Critical CSS Overrides:**
```css
/* Fix: Black text on dark background (common Streamlit bug) */
.stTextInput input,
.stSelectbox span,
.stNumberInput input {
    color: #e2e8f0 !important;
    background-color: #1e293b !important;
}

/* Fix: Button visibility */
.stButton > button {
    color: #FFFFFF !important;
    background-color: #14b8a6 !important;
    border: none !important;
}

/* Fix: Sidebar collapse button hidden */
[data-testid="collapsedControl"] {
    display: block !important;  /* Never hide */
}
```

---

## 9. Environment & Deployment

### 9.1 Local Development
```bash
# Python version
python --version  # 3.11+

# Virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Environment variables (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...

# Run locally
streamlit run app.py --server.port 8501
```

### 9.2 Production (Streamlit Community Cloud)
**Deployment:** Git-based (push to main → auto-deploy)

**Secrets Management:**
```toml
# .streamlit/secrets.toml (NOT committed to Git)
SUPABASE_URL = "https://xxx.supabase.co"
SUPABASE_ANON_KEY = "eyJxxx..."
OPENAI_API_KEY = "sk-xxx..."
```

**Access in code:**
```python
import streamlit as st
SUPABASE_URL = st.secrets.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
```

---

## 10. Dependencies (requirements.txt)

```txt
# Core Framework
streamlit==1.40.0

# Data Processing
pandas==2.2.0
numpy==1.26.0

# Visualization
plotly==5.18.0

# Database
supabase==2.3.0

# AI/LLM
langchain==0.1.0
langchain-openai==0.0.5
openai==1.6.0

# PDF Generation
reportlab==4.0.0

# Utilities
python-dotenv==1.0.0
openpyxl==3.1.2  # For Excel export

# Testing (optional)
pytest==8.0.0
pytest-cov==4.1.0
```

---

## 11. Performance Benchmarks

| Operation | Dataset Size | Time (Avg) | Notes |
|-----------|--------------|------------|-------|
| CSV Upload | 1,000 rows | 0.8s | Including auto-detect |
| Pay Gap Calc | 1,000 rows | 0.3s | Pandas groupby |
| Quartile Chart | 1,000 rows | 0.5s | Plotly rendering |
| AI Scoring | 50 positions | 8.2s | GPT-4o API call |
| PDF Export | 20 pages | 1.2s | ReportLab |
| RLS Query (Supabase) | 10 projects | 0.15s | With indexes |

**Bottlenecks:**
- AI Scoring (network latency) - mitigated by caching results
- Large CSV (> 5k rows) - consider pagination in Phase 3

---

## 12. Alternatives Considered (& Why Not)

| Technology | Alternative | Why Not Used |
|------------|-------------|--------------|
| Frontend | React + FastAPI | Slower development, overkill for MVP |
| Database | MySQL | No built-in RLS, harder multi-tenancy |
| Auth | Auth0 | Extra cost, Supabase already integrated |
| Charts | Chart.js | Requires JS, Plotly is Python-native |
| AI | Claude (Anthropic) | OpenAI has better structured output |
| PDF | WeasyPrint | More complex, ReportLab sufficient |

---

**Document Owner:** Engineering Team  
**Last Review:** 2026-02-03  
**Next Review:** 2026-04-01
