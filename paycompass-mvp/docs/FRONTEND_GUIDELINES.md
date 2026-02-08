# Frontend Development Guidelines
## PayCompass Pro - UI/UX Standards & Best Practices

**Version:** 2.0  
**Last Updated:** 2026-02-03  
**Target Audience:** Frontend Developers, AI Agents, Designers

---

## 1. Design Philosophy: High-Trust Financial UI

### 1.1 Core Principles
1. **Clarity over Creativity:** Function > Form. Users need to understand data immediately.
2. **Flat Design:** No shadows, no gradients, no 3D effects. Clean, geometric shapes only.
3. **High Contrast:** WCAG AAA compliance (7:1 ratio minimum for body text).
4. **Scanability:** F-pattern layout, clear visual hierarchy, generous whitespace.
5. **Professional Tone:** Enterprise-ready, not playful. SaaS/Fintech aesthetic.

### 1.2 Visual References
**Inspired by:**
- Stripe Dashboard (minimalist, high contrast)
- Linear App (flat, geometric, dark mode)
- Figma UI (clean typography, subtle interactions)

**NOT inspired by:**
- ❌ Colorful consumer apps (Notion, Asana)
- ❌ Skeuomorphic designs (old iOS)
- ❌ Low-contrast "modern" designs (illegible text)

---

## 2. Color System

### 2.1 Dark Mode Palette (Primary)
```css
/* Background Layers */
--bg-primary: #0f172a;      /* Slate-900 - Main background */
--bg-secondary: #1e293b;    /* Slate-800 - Cards, inputs, elevated surfaces */
--bg-tertiary: #334155;     /* Slate-700 - Hover states, borders */

/* Text Colors */
--text-primary: #ffffff;     /* White - Headings, labels, primary text */
--text-secondary: #e2e8f0;   /* Slate-200 - Body text, descriptions */
--text-muted: #94a3b8;       /* Slate-400 - Placeholders, disabled text */
--text-inverse: #0f172a;     /* Dark on light backgrounds (rare) */

/* Accent Colors */
--accent-teal: #14b8a6;      /* Primary CTA, links, interactive elements */
--accent-teal-hover: #0d9488; /* Hover state for teal */
--accent-blue: #3b82f6;      /* Info, charts (male) */
--accent-pink: #ec4899;      /* Charts (female), highlights */
--accent-amber: #f59e0b;     /* Warnings, caution */
--accent-red: #ef4444;       /* Errors, critical alerts */
--accent-green: #10b981;     /* Success, positive trends */

/* Chart-Specific */
--chart-male: #4A90E2;       /* Blue for male in charts */
--chart-female: #FF6B9D;     /* Pink for female in charts */
--chart-neutral: #8b5cf6;    /* Purple for non-binary/other */
```

### 2.2 Light Mode Palette (Secondary - Future)
```css
/* Not implemented yet - planned for Phase 3 */
--bg-primary-light: #ffffff;
--bg-secondary-light: #f8fafc;
--text-primary-light: #0f172a;
```

### 2.3 Color Usage Rules
| Element | Color Variable | Rationale |
|---------|----------------|-----------|
| Page Background | `--bg-primary` | Maximum contrast for text |
| Card/Container | `--bg-secondary` | Subtle elevation without shadows |
| Input Fields | `--bg-secondary` | Match containers, reduce visual noise |
| Primary Button | `--accent-teal` | Brand color, high visibility |
| Destructive Button | `--accent-red` | Universal danger signal |
| Headings (H1-H3) | `--text-primary` | Maximum readability |
| Body Text | `--text-secondary` | Slightly softer for long reading |
| Placeholder Text | `--text-muted` | Clearly differentiate from user input |

**CRITICAL RULE:** Never use dark text on dark background. Always verify contrast ratio.

---

## 3. Typography

### 3.1 Font Families
```css
/* Primary Font (UI Text) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace Font (Numbers, Code) */
font-family: 'JetBrains Mono', 'Roboto Mono', 'Courier New', monospace;
```

### 3.2 Font Weights
- **Regular (400):** Body text, paragraphs
- **Medium (500):** Labels, captions, emphasis
- **Semibold (600):** Headings, buttons, navigation
- **Bold (700):** Metric values (KPIs), numbers in monospace

### 3.3 Type Scale
```css
/* Headings */
h1 { font-size: 2.5rem; font-weight: 600; line-height: 1.2; color: var(--text-primary); }
h2 { font-size: 2rem; font-weight: 600; line-height: 1.3; color: var(--text-primary); }
h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.4; color: var(--text-primary); }
h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; color: var(--text-secondary); }

/* Body */
body { font-size: 1rem; font-weight: 400; line-height: 1.6; color: var(--text-secondary); }
p { font-size: 1rem; margin-bottom: 1rem; }

/* Small */
small, .caption { font-size: 0.875rem; color: var(--text-muted); }

/* Numbers (Monospace) */
.metric-value, .currency, .percentage {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 1.5rem;
    color: var(--text-primary);
}
```

### 3.4 Typography Rules
1. **Always specify `color` explicitly** - Streamlit defaults are unreliable in dark mode
2. **Use JetBrains Mono for:**
   - Percentages (e.g., `23.5%`)
   - Currencies (e.g., `45,000 PLN`)
   - Scores/Metrics (e.g., `78/100`)
   - Code blocks
3. **Line height:** 1.6 for body, 1.2-1.4 for headings (readability)
4. **Never use font sizes < 0.75rem** (12px) - accessibility

---

## 4. Streamlit Component Styling

### 4.1 Critical CSS Overrides (styles.py)

**Problem:** Streamlit's default styles often create black-on-black or white-on-white issues in dark mode.

**Solution:** Aggressive CSS overrides with `!important`

```css
/* ===== INPUT FIELDS ===== */
.stTextInput input,
.stNumberInput input,
.stTextArea textarea,
.stSelectbox [data-baseweb="select"] span,
[data-baseweb="input"] input {
    color: #e2e8f0 !important;           /* Light text */
    background-color: #1e293b !important; /* Dark background */
    border: 1px solid #475569 !important; /* Visible border */
    caret-color: #14b8a6 !important;      /* Teal cursor */
}

.stTextInput input::placeholder,
.stNumberInput input::placeholder {
    color: #64748b !important;  /* Muted but visible */
    opacity: 1 !important;
}

/* ===== BUTTONS ===== */
.stButton > button {
    color: #ffffff !important;
    background-color: #1e293b !important;
    border: 1px solid #475569 !important;
    font-weight: 600 !important;
    transition: all 0.2s ease;
}

.stButton > button:hover {
    background-color: #334155 !important;
    border-color: #14b8a6 !important;
}

/* Primary Button */
.stButton > button[kind="primary"] {
    background-color: #14b8a6 !important;
    border-color: #14b8a6 !important;
}

.stButton > button[kind="primary"]:hover {
    background-color: #0d9488 !important;
}

/* ===== SELECTBOX DROPDOWN ===== */
[data-baseweb="popover"] [role="option"] {
    color: #e2e8f0 !important;
    background-color: #1e293b !important;
}

[data-baseweb="popover"] [role="option"]:hover {
    background-color: #334155 !important;
}

/* ===== DATAFRAME / DATA EDITOR ===== */
.stDataFrame {
    background-color: #1e293b !important;
}

.stDataFrame th {
    background-color: #334155 !important;
    color: #ffffff !important;
    font-weight: 600 !important;
}

.stDataFrame td {
    color: #e2e8f0 !important;
}

/* ===== METRIC CARDS ===== */
.stMetric {
    background-color: #1e293b !important;
    padding: 1rem !important;
    border-radius: 8px !important;
    border: 1px solid #334155 !important;
}

.stMetric label {
    color: #94a3b8 !important;  /* Muted label */
}

.stMetric [data-testid="stMetricValue"] {
    color: #ffffff !important;   /* Bright value */
    font-family: 'JetBrains Mono', monospace !important;
    font-weight: 700 !important;
}
```

### 4.2 Streamlit API Best Practices

**✅ DO:**
```python
# Use correct parameter names (Streamlit 1.40+)
st.dataframe(df, use_container_width=True)
st.plotly_chart(fig, use_container_width=True)

# Explicitly set colors for charts
fig = px.scatter(df, x='Scoring', y='Salary', color='Gender',
                 color_discrete_map={'Kobieta': '#FF6B9D', 'Mężczyzna': '#4A90E2'})

# Always specify button type for clarity
st.button("Submit", type="primary")  # Teal
st.button("Cancel", type="secondary")  # Gray

# Use columns for layout (not beta_columns)
col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Pay Gap", "12.3%")
```

**❌ DON'T:**
```python
# Deprecated parameter (will break in future Streamlit versions)
st.dataframe(df, use_column_width=True)  # ❌ WRONG

# Missing color specification (Plotly will use random defaults)
fig = px.scatter(df, x='Scoring', y='Salary', color='Gender')  # ❌ WRONG

# Ambiguous button (no visual distinction)
st.button("Submit")  # ❌ WRONG - use type="primary"

# Assuming default text color is visible
st.markdown("Important text")  # ❌ WRONG - specify color in CSS
```

---

## 5. Layout & Spacing

### 5.1 Grid System
```python
# 12-column inspired (using st.columns)

# Two equal columns (50/50)
col1, col2 = st.columns(2)

# Three equal columns (33/33/33)
col1, col2, col3 = st.columns(3)

# Asymmetric (25/50/25) - use ratios
col1, col2, col3 = st.columns([1, 2, 1])

# Sidebar + Main (default Streamlit layout)
with st.sidebar:
    # Navigation, filters
    pass

# Main content area (auto-sized)
```

### 5.2 Spacing Scale
```css
/* Use consistent spacing (8px base unit) */
--space-xs: 0.25rem;  /* 4px */
--space-sm: 0.5rem;   /* 8px */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
```

**Rules:**
- **Padding inside cards:** `1rem` (16px)
- **Margin between sections:** `2rem` (32px)
- **Gap in columns:** `1rem` (16px)
- **Button padding:** `0.75rem 1.5rem` (12px 24px)

### 5.3 Container Widths
```python
# Streamlit page config
st.set_page_config(
    layout="wide",  # Use full viewport width (recommended)
    # OR
    layout="centered"  # Max 700px width (not recommended for data apps)
)

# Custom max-width for specific sections
st.markdown("""
<style>
.custom-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}
</style>
""", unsafe_allow_html=True)
```

---

## 6. Interactive Elements

### 6.1 Buttons
**States:**
1. **Default:** Gray background, white text
2. **Hover:** Darker gray, teal border
3. **Active (Primary):** Teal background, white text
4. **Disabled:** Gray, 50% opacity, no hover

**Usage:**
```python
# Primary action (save, submit, continue)
st.button("Save Changes", type="primary", use_container_width=True)

# Secondary action (cancel, back)
st.button("Cancel", type="secondary")

# Dangerous action (delete, reset)
if st.button("Delete Data", type="secondary"):
    st.warning("Are you sure?")
    if st.button("Yes, Delete", type="primary"):
        # Perform deletion
        pass
```

### 6.2 Input Fields
**Components:**
- `st.text_input()` - Single-line text
- `st.number_input()` - Numeric (salary, scoring)
- `st.selectbox()` - Dropdown (single choice)
- `st.multiselect()` - Dropdown (multiple choices)
- `st.slider()` - Range selection (rarely used - prefer number_input)

**Best Practices:**
```python
# Always provide labels
email = st.text_input("Email Address", placeholder="you@company.com")

# Use help text for clarification
salary = st.number_input(
    "Monthly Salary (PLN)",
    min_value=0,
    max_value=100000,
    step=100,
    help="Gross salary before tax"
)

# Provide clear options in selectbox
gender = st.selectbox(
    "Gender",
    options=["Kobieta", "Mężczyzna", "Inna", "Wolę nie podawać"],
    index=0  # Default to first option
)
```

### 6.3 Data Tables
```python
# Read-only display (optimized for large datasets)
st.dataframe(
    df,
    use_container_width=True,
    hide_index=True,  # Hide row numbers (cleaner)
    column_config={
        "Salary": st.column_config.NumberColumn(
            "Salary",
            format="%.0f PLN",  # Format as currency
        ),
        "Gender": st.column_config.TextColumn(
            "Gender",
            width="small",  # Optimize column width
        ),
    }
)

# Editable table (for scoring adjustments)
edited_df = st.data_editor(
    df,
    use_container_width=True,
    num_rows="dynamic",  # Allow adding/deleting rows
    column_config={
        "Scoring": st.column_config.NumberColumn(
            "Scoring",
            min_value=1,
            max_value=100,
            step=1,
            required=True,
        ),
    }
)
```

---

## 7. Feedback & Notifications

### 7.1 Message Types
```python
# Success (green)
st.success("✅ Data saved successfully!")

# Info (blue)
st.info("ℹ️ Using demo dataset: test_payroll_data.csv")

# Warning (amber)
st.warning("⚠️ Pay gap exceeds 5% - review required")

# Error (red)
st.error("❌ File not found: data.csv")
```

### 7.2 Spinners & Progress
```python
# Short operation (< 3s)
with st.spinner("Loading data..."):
    df = load_data()

# Long operation (> 3s) - show progress
progress_bar = st.progress(0)
for i in range(100):
    # Process chunk
    progress_bar.progress(i + 1)
```

### 7.3 Toasts (Temporary Notifications)
```python
# Quick feedback (auto-dismiss after 3s)
if st.button("Copy to Clipboard"):
    # ... copy logic ...
    st.toast("📋 Copied!", icon="✅")
```

---

## 8. Charts & Visualizations

### 8.1 Plotly Configuration
```python
# Standard config for all charts
config = {
    'displayModeBar': True,  # Show toolbar on hover
    'displaylogo': False,    # Hide Plotly logo
    'modeBarButtonsToRemove': ['lasso2d', 'select2d'],  # Remove unused tools
}

st.plotly_chart(fig, use_container_width=True, config=config)
```

### 8.2 Chart Styling
```python
# Consistent layout for all charts
fig.update_layout(
    font=dict(
        family='Inter, sans-serif',
        size=14,
        color='#e2e8f0'  # Light text on dark background
    ),
    paper_bgcolor='#0f172a',  # Match page background
    plot_bgcolor='#1e293b',   # Slightly elevated plot area
    title_font_size=18,
    title_font_color='#ffffff',
    xaxis=dict(
        gridcolor='#334155',  # Subtle grid lines
        zerolinecolor='#475569',
    ),
    yaxis=dict(
        gridcolor='#334155',
        zerolinecolor='#475569',
    ),
    hovermode='closest',
    hoverlabel=dict(
        bgcolor='#1e293b',
        font_size=14,
        font_family='Inter',
    )
)
```

### 8.3 Color Consistency
**Golden Rule:** Use the same colors across all charts for the same data categories.

```python
# Gender colors (use everywhere)
GENDER_COLORS = {
    'Kobieta': '#FF6B9D',   # Pink
    'Mężczyzna': '#4A90E2',  # Blue
    'Inna': '#8b5cf6',       # Purple
}

# Pay gap severity (traffic light system)
GAP_COLORS = {
    'Low (0-3%)': '#10b981',    # Green
    'Medium (3-5%)': '#f59e0b',  # Amber
    'High (>5%)': '#ef4444',     # Red
}
```

---

## 9. Accessibility (WCAG 2.1 AA Minimum)

### 9.1 Contrast Requirements
- **Normal Text (< 18px):** 4.5:1 ratio minimum
- **Large Text (≥ 18px):** 3:1 ratio minimum
- **UI Components:** 3:1 ratio minimum

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**Passing Combinations:**
- ✅ White (#ffffff) on Slate-900 (#0f172a) - 17.3:1 ⭐
- ✅ Slate-200 (#e2e8f0) on Slate-900 (#0f172a) - 13.2:1 ⭐
- ✅ Teal (#14b8a6) on Slate-900 (#0f172a) - 5.8:1 ✓
- ❌ Slate-400 (#94a3b8) on Slate-800 (#1e293b) - 2.9:1 ❌

### 9.2 Keyboard Navigation
- All interactive elements must be keyboard-accessible
- Tab order follows visual flow (top → bottom, left → right)
- Buttons show focus outline (never use `outline: none` without replacement)

### 9.3 Screen Readers
```python
# Use semantic HTML elements
st.markdown("<h1>Dashboard</h1>", unsafe_allow_html=True)  # ✅
# NOT st.markdown("<div style='font-size:32px'>Dashboard</div>")  # ❌

# Provide alt text for images (if using custom HTML)
st.markdown('<img src="logo.png" alt="PayCompass Logo">', unsafe_allow_html=True)
```

---

## 10. Common Pitfalls & Solutions

### 10.1 Black Screen / Invisible Content
**Symptom:** Page renders but shows only black background

**Causes:**
1. `st.stop()` called too early in router
2. Text color set to dark on dark background
3. Conditional rendering logic error

**Solution:**
```python
# ✅ CORRECT Router
if not st.session_state.get("authenticated"):
    show_landing_page()  # Render content FIRST
    st.stop()  # Then block further execution

# ❌ WRONG Router
if not st.session_state.get("authenticated"):
    st.stop()  # Blocks rendering - user sees black screen!
    show_landing_page()  # Never reached
```

### 10.2 Form Submit Not Working
**Symptom:** Button click doesn't trigger action

**Cause:** Using `st.button()` inside `st.form()`

**Solution:**
```python
# ✅ CORRECT
with st.form("my_form"):
    name = st.text_input("Name")
    submitted = st.form_submit_button("Submit")  # Use form_submit_button

if submitted:
    st.success(f"Hello, {name}!")

# ❌ WRONG
with st.form("my_form"):
    name = st.text_input("Name")
    if st.button("Submit"):  # Regular button doesn't work in forms!
        st.success(f"Hello, {name}!")
```

### 10.3 Session State Lost on Refresh
**Symptom:** User data disappears after page reload

**Cause:** `st.session_state` is memory-only (not persisted)

**Solution:**
```python
# Save critical state to Supabase
if "authenticated" not in st.session_state:
    # Try to restore from Supabase token
    user = supabase.auth.get_user()
    if user:
        st.session_state["authenticated"] = True
        st.session_state["user_id"] = user.id
```

---

## 11. Code Review Checklist

Before merging UI changes, verify:

- [ ] All text has explicit `color` set (no relying on Streamlit defaults)
- [ ] Contrast ratio ≥ 4.5:1 for all text (use WebAIM checker)
- [ ] Buttons use `type="primary"` or `type="secondary"`
- [ ] All `st.dataframe()` use `use_container_width=True` (not `use_column_width`)
- [ ] Charts use consistent colors from `GENDER_COLORS` or `GAP_COLORS`
- [ ] Numbers use JetBrains Mono font
- [ ] No `st.stop()` in main router (only after rendering content)
- [ ] Input fields have placeholders and help text
- [ ] Loading states use `st.spinner()` or `st.progress()`
- [ ] Mobile responsive (test at 375px width minimum)

---

**Document Owner:** Frontend Team  
**Last Review:** 2026-02-03  
**Next Review:** 2026-03-15
