# Lessons Learned - PayCompass Development
## Critical Mistakes, Pitfalls & Solutions

**Purpose:** Document hard-won knowledge to prevent future bugs  
**Audience:** Developers, AI Agents, Future Self  
**Last Updated:** 2026-02-03

---

## 🔴 CRITICAL LESSONS (Must Read First)

### 1. NEVER use `st.stop()` before rendering content in router
**Symptom:** Black screen, blank page, "nothing happens"

**BAD CODE:**
```python
def main():
    if not st.session_state.get("authenticated"):
        st.stop()  # ❌ WRONG - blocks rendering!
        show_landing_page()  # Never reached
```

**CORRECT CODE:**
```python
def main():
    if not st.session_state.get("authenticated"):
        show_landing_page()  # ✅ Render content FIRST
        st.stop()  # Then block further execution
```

**Why:** `st.stop()` immediately halts all rendering. If called before UI code, user sees empty page.

**Date Learned:** 2026-02-02 (cost: 2 hours debugging)

---

### 2. ALWAYS explicitly set text color in dark mode
**Symptom:** Invisible text, "black on black" or "white on white"

**BAD CODE:**
```python
st.markdown("Important text")  # ❌ WRONG - color unpredictable
```

**CORRECT CODE:**
```python
st.markdown("<p style='color: #ffffff;'>Important text</p>", unsafe_allow_html=True)
# OR
st.markdown("""
<style>
p { color: #ffffff !important; }
</style>
""", unsafe_allow_html=True)
st.markdown("Important text")
```

**Why:** Streamlit's default text color changes unpredictably based on theme, browser, OS. Always override with `!important`.

**Date Learned:** 2026-01-28 (cost: 1.5 hours debugging, user complained "nothing visible")

---

### 3. Use `use_container_width=True`, NOT `use_column_width=True`
**Symptom:** `DeprecationWarning` or `AttributeError`

**BAD CODE:**
```python
st.dataframe(df, use_column_width=True)  # ❌ DEPRECATED (Streamlit 1.20+)
```

**CORRECT CODE:**
```python
st.dataframe(df, use_container_width=True)  # ✅ Current API
```

**Why:** Streamlit renamed parameter in v1.20 to better describe behavior.

**Date Learned:** 2026-01-15 (flagged in code review)

---

### 4. ALWAYS check `os.path.exists()` before loading CSV
**Symptom:** Cryptic `FileNotFoundError`, app crashes, or silently uses mock data

**BAD CODE:**
```python
def load_data(filename):
    df = pd.read_csv(filename)  # ❌ WRONG - assumes file exists
    return df
```

**CORRECT CODE:**
```python
def load_data(filename):
    if not os.path.exists(filename):
        raise FileNotFoundError(f"File not found: {filename}")
        # OR return mock data with clear warning
    df = pd.read_csv(filename)
    return df
```

**Why:** File paths are fragile (CWD changes, typos, deleted files). Always validate before I/O.

**Date Learned:** 2026-02-03 (cost: 2 hours, user confused why seeing fake data)

---

### 5. Use `st.session_state` for navigation, NOT URL params
**Symptom:** Navigation state lost on refresh, unpredictable routing

**BAD CODE:**
```python
# URL: /?page=dashboard
params = st.query_params()
page = params.get("page", "home")  # ❌ FRAGILE - lost on refresh
```

**CORRECT CODE:**
```python
if "page" not in st.session_state:
    st.session_state["page"] = "home"

if st.button("Go to Dashboard"):
    st.session_state["page"] = "dashboard"
    st.rerun()

# Router
if st.session_state["page"] == "dashboard":
    show_dashboard()
```

**Why:** `st.session_state` persists during session (until browser close). URL params reset on manual refresh.

**Date Learned:** 2026-01-20 (recommended by Streamlit docs)

---

## ⚠️ HIGH-PRIORITY LESSONS

### 6. Initialize `st.session_state` keys at module level
**Symptom:** `KeyError`, inconsistent state, hard-to-debug race conditions

**BAD CODE:**
```python
def show_dashboard():
    if st.session_state.get("user_id"):  # ❌ FRAGILE - might not exist
        # ...
```

**CORRECT CODE:**
```python
# At top of app.py (before any functions)
if "authenticated" not in st.session_state:
    st.session_state["authenticated"] = False
if "user_id" not in st.session_state:
    st.session_state["user_id"] = None
if "active_project_id" not in st.session_state:
    st.session_state["active_project_id"] = None
```

**Why:** Guarantees keys exist before any code accesses them. Prevents defensive `.get()` everywhere.

**Date Learned:** 2026-01-18 (best practice from Streamlit Discord)

---

### 7. Call `st.rerun()` after state changes, NOT `st.experimental_rerun()`
**Symptom:** `DeprecationWarning`, app might break in future Streamlit versions

**BAD CODE:**
```python
st.session_state["page"] = "dashboard"
st.experimental_rerun()  # ❌ DEPRECATED
```

**CORRECT CODE:**
```python
st.session_state["page"] = "dashboard"
st.rerun()  # ✅ Current API (Streamlit 1.27+)
```

**Date Learned:** 2026-01-10 (Streamlit 1.27 release notes)

---

### 8. Use `on_click` callback for buttons, NOT conditional checks after button
**Symptom:** Button requires double-click, state updates inconsistently

**BAD CODE:**
```python
if st.button("Login"):
    st.session_state["authenticated"] = True  # ❌ WRONG - might not persist
    st.rerun()
```

**CORRECT CODE:**
```python
def login_callback():
    st.session_state["authenticated"] = True

st.button("Login", on_click=login_callback)  # ✅ Callback runs BEFORE rerun
```

**Why:** Callbacks execute before page rerun, guaranteeing state update persists.

**Date Learned:** 2026-01-25 (cost: 1 hour debugging "button doesn't work")

---

### 9. NEVER nest `st.form()` or use `st.button()` inside `st.form()`
**Symptom:** Form doesn't submit, `StreamlitAPIException`

**BAD CODE:**
```python
with st.form("my_form"):
    name = st.text_input("Name")
    if st.button("Submit"):  # ❌ WRONG - regular button inside form
        st.success("Submitted!")
```

**CORRECT CODE:**
```python
with st.form("my_form"):
    name = st.text_input("Name")
    submitted = st.form_submit_button("Submit")  # ✅ Use form_submit_button

if submitted:  # Check OUTSIDE form
    st.success("Submitted!")
```

**Date Learned:** 2026-01-12 (Streamlit docs explicitly warn against this)

---

### 10. Use `try-except` around Supabase calls, NOT bare calls
**Symptom:** Uncaught exceptions crash app, poor UX

**BAD CODE:**
```python
user = supabase.auth.sign_in_with_password({"email": email, "password": password})
st.success("Logged in!")  # ❌ WRONG - crashes if credentials invalid
```

**CORRECT CODE:**
```python
try:
    user = supabase.auth.sign_in_with_password({"email": email, "password": password})
    st.success("Logged in!")
except Exception as e:
    st.error(f"Login failed: {str(e)}")
```

**Date Learned:** 2026-01-08 (user reported app crash on typo in password)

---

## 📊 DATA PROCESSING LESSONS

### 11. Use `pd.read_csv(sep=None, engine='python')` for auto-detect separator
**Symptom:** File loads but only 1 column, "all data in first column"

**BAD CODE:**
```python
df = pd.read_csv(file)  # ❌ WRONG - assumes comma separator
```

**CORRECT CODE:**
```python
df = pd.read_csv(file, sep=None, engine='python')  # ✅ Auto-detects , or ;
```

**Why:** Polish Excel uses `;` (semicolon), US Excel uses `,` (comma). Auto-detect handles both.

**Date Learned:** 2026-01-30 (cost: 1 hour, user uploaded Polish CSV)

---

### 12. Strip whitespace from column names immediately after loading
**Symptom:** `KeyError: 'Salary'` when column actually named `' Salary '`

**BAD CODE:**
```python
df = pd.read_csv(file)
salary = df['Salary']  # ❌ WRONG - might fail if column has spaces
```

**CORRECT CODE:**
```python
df = pd.read_csv(file)
df.columns = df.columns.str.strip()  # ✅ Remove leading/trailing spaces
salary = df['Salary']
```

**Date Learned:** 2026-01-22 (cost: 30 min debugging "column not found" error)

---

### 13. Use `pd.to_numeric(..., errors='coerce')` for dirty data
**Symptom:** `ValueError: could not convert string to float: '1,234'`

**BAD CODE:**
```python
df['Salary'] = df['Salary'].astype(float)  # ❌ WRONG - crashes on non-numeric
```

**CORRECT CODE:**
```python
df['Salary'] = pd.to_numeric(df['Salary'], errors='coerce').fillna(0)
# coerce: invalid values → NaN
# fillna(0): replace NaN with 0
```

**Date Learned:** 2026-01-16 (user uploaded CSV with formatted numbers "1,234.56")

---

### 14. Check for empty DataFrame BEFORE operations
**Symptom:** Cryptic errors like `ZeroDivisionError`, `IndexError`

**BAD CODE:**
```python
median_salary = df['Salary'].median()  # ❌ WRONG - crashes if df is empty
```

**CORRECT CODE:**
```python
if df.empty:
    st.warning("No data to analyze")
    st.stop()

median_salary = df['Salary'].median()  # ✅ Safe
```

**Date Learned:** 2026-01-14 (edge case: user uploaded empty CSV)

---

## 🎨 UI/UX LESSONS

### 15. Set `initial_sidebar_state="expanded"` for data apps
**Symptom:** Users don't realize sidebar exists, can't find controls

**BAD CODE:**
```python
st.set_page_config(layout="wide", initial_sidebar_state="collapsed")  # ❌ WRONG for dashboards
```

**CORRECT CODE:**
```python
st.set_page_config(layout="wide", initial_sidebar_state="expanded")  # ✅ Show controls by default
```

**Why:** Data apps need filters/controls. Hiding sidebar adds friction.

**Date Learned:** 2026-02-03 (user feedback: "where do I upload file?")

---

### 16. Use `st.spinner()` for operations > 1 second
**Symptom:** User thinks app is frozen, clicks button multiple times

**BAD CODE:**
```python
df = load_large_file()  # ❌ WRONG - no feedback during load
```

**CORRECT CODE:**
```python
with st.spinner("Loading data..."):
    df = load_large_file()  # ✅ Shows spinner during load
```

**Date Learned:** 2026-01-19 (UX best practice)

---

### 17. Always provide `help` parameter for complex inputs
**Symptom:** User confusion, support tickets, incorrect data entry

**BAD CODE:**
```python
scoring = st.number_input("Scoring")  # ❌ WRONG - what scale? 0-100? 1-10?
```

**CORRECT CODE:**
```python
scoring = st.number_input(
    "Scoring",
    min_value=1,
    max_value=100,
    help="Wartość stanowiska: 1 (junior) - 100 (C-level)"
)  # ✅ Clear guidance
```

**Date Learned:** 2026-01-17 (user entered scoring as 1-10 instead of 1-100)

---

### 18. Hide index in `st.dataframe()` unless needed
**Symptom:** Ugly row numbers (0, 1, 2...) clutter table

**BAD CODE:**
```python
st.dataframe(df)  # ❌ Shows row numbers by default
```

**CORRECT CODE:**
```python
st.dataframe(df, hide_index=True)  # ✅ Clean table
```

**Date Learned:** 2026-01-11 (visual polish)

---

## 🔐 SECURITY LESSONS

### 19. NEVER log sensitive data (passwords, API keys, PII)
**Symptom:** Data breach, GDPR violation, security audit failure

**BAD CODE:**
```python
print(f"User login: {email}, {password}")  # ❌ DANGER - password in logs!
```

**CORRECT CODE:**
```python
print(f"User login attempt: {email}")  # ✅ Log event, not credentials
```

**Date Learned:** 2026-01-05 (security audit recommendation)

---

### 20. Use RLS (Row Level Security) for multi-tenancy, NOT manual filters
**Symptom:** Data leakage, User A sees User B's data

**BAD CODE:**
```python
# In Python
all_employees = supabase.table("employees").select("*").execute()
user_employees = [e for e in all_employees.data if e["user_id"] == current_user_id]
# ❌ WRONG - fetches all data, filters client-side (insecure!)
```

**CORRECT CODE:**
```sql
-- In Supabase (enable RLS on table)
CREATE POLICY "Users see own employees"
ON public.employees
FOR SELECT
USING (user_id = auth.uid());
```
```python
# In Python - RLS filters automatically
user_employees = supabase.table("employees").select("*").execute()
# ✅ SAFE - RLS enforced at DB level
```

**Date Learned:** 2026-01-07 (Supabase best practice)

---

## 📈 PERFORMANCE LESSONS

### 21. Use `st.cache_data` for expensive computations
**Symptom:** Slow page loads, re-calculating same data on every interaction

**BAD CODE:**
```python
def load_data():
    return pd.read_csv("large_file.csv")  # ❌ WRONG - reloads on every rerun
```

**CORRECT CODE:**
```python
@st.cache_data
def load_data():
    return pd.read_csv("large_file.csv")  # ✅ Cached - loads once per session
```

**When NOT to cache:**
- Data changes frequently (real-time data)
- Data depends on user input (dynamic filters)

**Date Learned:** 2026-01-09 (Streamlit optimization docs)

---

### 22. Batch database inserts (500-1000 records at a time)
**Symptom:** Slow uploads (10+ seconds for 1000 employees)

**BAD CODE:**
```python
for employee in employees:
    supabase.table("employees").insert(employee).execute()  # ❌ SLOW - 1000 queries
```

**CORRECT CODE:**
```python
batch_size = 500
for i in range(0, len(employees), batch_size):
    batch = employees[i:i+batch_size]
    supabase.table("employees").insert(batch).execute()  # ✅ FAST - 2 queries
```

**Date Learned:** 2026-01-13 (cost: 5 min upload → 1 sec upload)

---

## 🐛 DEBUGGING LESSONS

### 23. Print current working directory when debugging file paths
**Symptom:** "File not found" but file exists (in different directory)

**DEBUG CODE:**
```python
import os
print(f"CWD: {os.getcwd()}")
print(f"Files: {os.listdir('.')}")
```

**Date Learned:** 2026-02-03 (cost: 30 min, file was in parent directory)

---

### 24. Add debug expanders in sidebar for development
**Symptom:** Can't see session state, hard to debug navigation issues

**DEBUG CODE:**
```python
with st.sidebar.expander("🐛 Debug Info", expanded=False):
    st.write("Session State:", st.session_state)
    st.write("CWD:", os.getcwd())
```

**Date Learned:** 2026-01-21 (huge time-saver for debugging)

---

### 25. Use `st.write()` for quick type inspection
**Symptom:** Unsure what type/structure variable has

**DEBUG CODE:**
```python
st.write("Type:", type(my_variable))
st.write("Value:", my_variable)
```

**Date Learned:** 2026-01-06 (faster than print() + checking console)

---

## 📚 GENERAL BEST PRACTICES

### 26. Document WHY, not WHAT
**BAD COMMENT:**
```python
# Set user to authenticated
st.session_state["authenticated"] = True
```

**GOOD COMMENT:**
```python
# Must set before rerun() - callback guarantees state persists
st.session_state["authenticated"] = True
```

**Date Learned:** 2026-01-04 (code review feedback)

---

### 27. Use type hints for function parameters
**BAD CODE:**
```python
def calculate_gap(df):
    # What type is df? Pandas? List? Dict?
```

**GOOD CODE:**
```python
def calculate_gap(df: pd.DataFrame) -> float:
    """Calculate pay gap percentage."""
```

**Date Learned:** 2026-01-03 (Python best practice)

---

### 28. Keep functions under 50 lines (Single Responsibility Principle)
**Symptom:** Hard to test, debug, reuse

**Solution:** Extract sub-functions
```python
# BEFORE: 200-line monster function
def process_data(df):
    # ... 200 lines ...

# AFTER: Small, focused functions
def clean_data(df): ...
def calculate_metrics(df): ...
def generate_report(metrics): ...
```

**Date Learned:** 2026-01-01 (refactoring exercise)

---

## 🔮 FUTURE LESSONS (To Be Added)

- Performance benchmarks (when dataset > 10k employees)
- Microservices migration strategy (when Streamlit limitations hit)
- A/B testing framework (for feature experimentation)

---

## 📝 How to Use This Document

**For Developers:**
1. Read CRITICAL LESSONS before touching code
2. Search for error message / symptom when debugging
3. Add new lessons when you discover a pitfall

**For AI Agents:**
1. Reference this doc when generating code (avoid BAD patterns)
2. Cite lesson number when explaining fix (e.g., "Per Lesson #4, always check os.path.exists()")
3. Update this doc when user reports new bug pattern

**Template for New Lessons:**
```markdown
### X. [LESSON TITLE]
**Symptom:** [What user sees/experiences]

**BAD CODE:**
```python
# ❌ WRONG
```

**CORRECT CODE:**
```python
# ✅ RIGHT
```

**Why:** [Root cause explanation]
**Date Learned:** YYYY-MM-DD (cost: [time/impact])
```

---

**Document Owner:** Engineering Team  
**Contributors:** All developers, AI agents, QA  
**Last Review:** 2026-02-03  
**Next Review:** 2026-02-10 (weekly review during active development)
