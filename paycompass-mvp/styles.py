import streamlit as st

def apply_custom_css():
    st.markdown("""<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    /* ==========================================================================
       HIGH-TRUST UX / FINANCIAL SLATE DESIGN
       PayCompass Pro - Professional Banking/Forensic UI Standard
       ========================================================================== */
    
    :root {
        /* Financial Slate Palette - Zero gradients, flat design */
        --slate-900: #0f172a;
        --slate-800: #1e293b;
        --slate-700: #334155;
        --slate-600: #475569;
        --slate-500: #64748b;
        --slate-400: #94a3b8;
        --slate-300: #cbd5e1;
        --slate-200: #e2e8f0;
        --slate-100: #f1f5f9;
        
        /* Accent - Muted Professional Green */
        --accent-green: #10b981;
        --accent-green-muted: rgba(16, 185, 129, 0.15);
        --accent-red: #ef4444;
        --accent-amber: #f59e0b;
        
        /* Legacy compatibility */
        --navy: var(--slate-900);
        --navy-light: var(--slate-800);
        --emerald-green: var(--accent-green);
        --emerald-green-dim: var(--accent-green-muted);
        --glass-bg: var(--slate-800);
        --glass-border: var(--slate-700);
        --text-primary: var(--slate-200);
        --text-muted: var(--slate-400);
    }

    /* ==========================================================================
       HIDE STREAMLIT BRANDING (High-Trust requirement)
       ========================================================================== */
    
    /* Hide Deploy button */
    [data-testid="stToolbar"] {
        display: none !important;
        visibility: hidden !important;
    }
    
    /* Hide hamburger menu (MainMenu) */
    #MainMenu {
        display: none !important;
        visibility: hidden !important;
    }
    button[kind="header"] {
        display: none !important;
    }
    
    /* Hide "Made with Streamlit" footer */
    footer {
        display: none !important;
        visibility: hidden !important;
    }
    footer:after {
        display: none !important;
    }
    .reportview-container .main footer {
        display: none !important;
    }
    
    /* Hide viewer badge */
    .viewerBadge_container__r5tak {
        display: none !important;
    }
    
    /* ==========================================================================
       TYPOGRAPHY - Inter + JetBrains Mono for numbers
       ========================================================================== */
    
    /* Base typography - Inter */
    .stApp, body, html, h1, h2, h3, h4, h5, h6, p, label, span, 
    .stMarkdown, .stText, div, button, input, select, textarea {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    
    /* Monospaced font for financial numbers in tables */
    [data-testid="stDataFrame"] td,
    [data-testid="stTable"] td,
    .stDataFrame td,
    table td,
    [data-testid="stMetricValue"],
    .stMetric [data-testid="stMetricValue"],
    .financial-number,
    td[class*="col-"],
    .tabulator-cell {
        font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace !important;
        font-variant-numeric: tabular-nums !important;
        letter-spacing: -0.02em;
    }
    
    /* ==========================================================================
       FLAT DESIGN - Remove shadows and gradients
       ========================================================================== */
    
    .stApp { 
        background: var(--slate-900) !important;
        background-image: none !important;
    }
    
    /* Remove all box shadows globally */
    *, *::before, *::after {
        box-shadow: none !important;
        text-shadow: none !important;
    }
    
    /* Override specific shadow elements */
    .stButton > button,
    .stDownloadButton > button,
    [data-testid="stMetric"],
    [data-testid="stDataFrame"],
    .stTextInput > div,
    .stSelectbox > div,
    .stMultiSelect > div,
    .stDateInput > div,
    .stTimeInput > div,
    .stNumberInput > div,
    .stTextArea > div,
    .stFileUploader > div,
    .stExpander {
        box-shadow: none !important;
        background-image: none !important;
    }
    
    /* Flat borders instead of shadows */
    .stButton > button:hover,
    .stDownloadButton > button:hover {
        border-color: var(--accent-green) !important;
        box-shadow: none !important;
    }
    /* ==========================================================================
       LAYOUT - Clean, professional structure
       ========================================================================== */
    
    .block-container, [data-testid="stAppViewContainer"], section[data-testid="stSidebar"] + div {
        background: var(--slate-900) !important;
        padding-top: 1.5rem !important;
        padding-bottom: 200px !important;  /* Extra space at bottom for button visibility (Dell fix) */
        max-width: 1400px !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }
    
    .main .block-container {
        padding-bottom: 250px !important;  /* Ensure buttons at bottom are visible (Dell fix) */
        display: flex !important;
        flex-direction: column !important;
    }
    
    h1, h2, h3, h4, p, label, span, .stMarkdown { 
        color: var(--slate-200) !important; 
    }

    /* Header - minimal */
    [data-testid="stHeader"] { 
        background: var(--slate-900) !important; 
        border-bottom: 1px solid var(--slate-700);
    }

    /* ==========================================================================
       SIDEBAR - Financial Dashboard style
       ========================================================================== */
    
    [data-testid="stSidebar"] {
        background: var(--slate-800) !important;
        border-right: 1px solid var(--slate-700);
        height: 100vh !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
    }
    
    /* Ensure sidebar inner container also takes full height */
    [data-testid="stSidebar"] > div:first-child {
        height: 100% !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] {
        color: var(--slate-300) !important;
    }
    
    /* Sidebar collapse button */
    [data-testid="stSidebarCollapseButton"] {
        visibility: visible !important;
        color: var(--slate-400) !important;
    }
    [data-testid="stSidebarCollapseButton"]:hover {
        color: var(--accent-green) !important;
    }
    [data-testid="stSidebarCollapseButton"] svg {
        fill: currentColor !important;
    }

    /* ==========================================================================
       CARDS - Flat, bordered, professional
       ========================================================================== */
    
    .glass-card, .financial-card {
        background: var(--slate-800);
        border: 1px solid var(--slate-700);
        border-radius: 8px;
        padding: 1.25rem;
        transition: border-color 0.15s ease;
    }
    .glass-card:hover, .financial-card:hover {
        border-color: var(--slate-600);
    }

    .bento-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        width: 100%;
    }
    @media (max-width: 900px) {
        .bento-container { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 500px) {
        .bento-container { grid-template-columns: 1fr; }
    }

    .neon-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        letter-spacing: 0.05em;
        color: var(--emerald-green);
        background: transparent;
        border: 1px solid var(--emerald-green);
        border-radius: 6px;
        cursor: pointer;
        transition: box-shadow 0.2s ease, background 0.2s ease;
        text-decoration: none;
    }
    .neon-btn:hover {
        box-shadow: 0 0 20px rgba(5, 150, 105, 0.4);
        background: var(--emerald-green-dim);
    }

    /* ---------- Landing: Context Bar (kontekst prawny) ---------- */
    .context-bar {
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 12px;
        padding: 1.25rem 2rem;
        margin-bottom: 2rem;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .context-bar-icon { font-size: 1.5rem; }
    .context-bar-text { margin: 0; font-size: 1rem; line-height: 1.65; color: #000000 !important; font-weight: 500; max-width: 900px; }

    /* ---------- Landing: Countdown Timer (Bold/Black, monospaced) ---------- */
    .countdown-label {
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: #64748b;
        text-align: center;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
    }

    /* Karty Korzyści (spójne z page.tsx) */
    .feature-card {
        background: #1E293B;
        border-radius: 24px;
        border: 1px solid #334155;
        padding: 1.25rem;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        transition: border-color 0.2s ease;
    }
    .feature-card:hover { border-color: var(--emerald-green); }

    /* ==========================================================================
       METRICS - KPI Cards (Financial Dashboard style)
       ========================================================================== */
    
    div[data-testid="stMetric"] {
        background: var(--slate-800) !important;
        border: 1px solid var(--slate-700) !important;
        padding: 1rem 1.25rem;
        border-radius: 6px;
        min-height: 100px !important;
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 0.75rem !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: var(--slate-400) !important;
    }
    
    [data-testid="stMetricValue"] { 
        color: var(--slate-100) !important; 
        font-size: 1.75rem !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-weight: 500 !important;
    }
    
    [data-testid="stMetricDelta"] {
        font-family: 'JetBrains Mono', monospace !important;
    }
    
    /* ==========================================================================
       TABLES - Financial Data Display
       ========================================================================== */
    
    div[data-testid="stDataFrame"], .stDataFrame, div[data-testid="stFileUploader"] {
        background: var(--slate-800) !important;
        border: 1px solid var(--slate-700) !important;
        border-radius: 6px;
    }
    
    [data-testid="stTable"] td, [data-testid="stTable"] th,
    .stDataFrame td, .stDataFrame th {
        background: var(--slate-800) !important;
        color: var(--slate-200) !important;
        border-color: var(--slate-700) !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.85rem !important;
    }
    
    [data-testid="stTable"] th, .stDataFrame th {
        font-family: 'Inter', sans-serif !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        font-size: 0.7rem !important;
        letter-spacing: 0.05em !important;
        color: var(--slate-400) !important;
    }

    /* ==========================================================================
       STATUS INDICATORS - Flat, no pulse/glow
       ========================================================================== */
    
    .pulse-icon, .status-indicator {
        display: inline-block; 
        width: 8px; 
        height: 8px;
        background-color: var(--accent-green); 
        border-radius: 50%;
        margin-right: 8px;
        /* No animation - flat design */
    }
    
    .status-indicator-warning { background-color: var(--accent-amber); }
    .status-indicator-error { background-color: var(--accent-red); }
    .status-indicator-idle { background-color: var(--slate-500); }

    /* ==========================================================================
       INSIGHT BOXES - Professional callouts
       ========================================================================== */
    
    .ai-insight-box, .insight-box {
        background: var(--slate-800);
        border: 1px solid var(--slate-700);
        border-left: 3px solid var(--accent-green);
        padding: 1rem 1.25rem;
        border-radius: 4px;
        margin: 1rem 0;
    }

    .mapping-card, .override-card {
        background: var(--slate-800);
        padding: 1.25rem;
        border-radius: 6px;
        border: 1px solid var(--slate-600);
        margin-bottom: 1rem;
    }
    
    /* ==========================================================================
       ADVANCED PARAMETERS SECTION
       ========================================================================== */
    
    .override-section {
        background: var(--slate-900);
        border: 1px solid var(--slate-700);
        border-radius: 6px;
        padding: 1rem;
    }
    
    .override-section [data-testid="stExpander"] {
        border: 1px solid var(--slate-600);
        border-radius: 4px;
        background: var(--slate-800);
    }
    
    .override-warning {
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid var(--accent-amber);
        border-radius: 4px;
        padding: 0.75rem 1rem;
        color: var(--accent-amber);
        font-size: 0.85rem;
    }

    /* ---------- Landing (Hero, Filary, Kalkulator B2B, CTA) – spójne z page.tsx ---------- */
    .hero-kicker { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; color: #059669; margin-bottom: 0.75rem; text-transform: uppercase; text-align: center !important; }
    .hero-h1 { text-align: center !important; }
    .landing-hero-block { margin-bottom: 1rem; }
    .landing-hero-h1 {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text-primary) !important;
        margin-bottom: 0.75rem;
        line-height: 1.1;
        letter-spacing: -0.02em;
    }
    .landing-hero-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary) !important;
        margin-bottom: 0.5rem;
        line-height: 1.2;
        letter-spacing: -0.02em;
    }
    .landing-hero-sub {
        font-size: 1.1rem;
        color: var(--text-muted) !important;
        letter-spacing: 0.02em;
        line-height: 1.6;
        max-width: 42rem;
    }
    .landing-section-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.25em;
        color: var(--emerald-green) !important;
        margin-bottom: 0.35rem;
    }
    .landing-section-title {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--text-primary) !important;
        margin-bottom: 0.5rem;
        letter-spacing: -0.02em;
    }
    .landing-calc-block {
        background: var(--navy-light);
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-top: 0.5rem;
    }
    .landing-calc-block .landing-bento-body { margin-bottom: 0.5rem; }
    .landing-legal {
        font-size: 0.8rem;
        color: var(--text-muted) !important;
        margin-top: 0.75rem;
        font-style: italic;
    }
    .landing-section-subtitle {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-primary) !important;
        margin-bottom: 0.75rem;
        letter-spacing: -0.01em;
    }
    .landing-legal-defense {
        background: var(--navy-light);
        border: 1px solid var(--glass-border);
        border-left: 4px solid var(--emerald-green);
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 1.5rem;
    }
    .landing-legal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--emerald-green) !important;
        margin-bottom: 0.75rem;
    }
    .landing-sanctions-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 0.75rem;
    }
    .landing-sanctions-table th,
    .landing-sanctions-table td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid var(--glass-border);
    }
    .landing-sanctions-table th {
        background: var(--navy-light);
        color: var(--emerald-green) !important;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .landing-sanctions-table td {
        color: var(--text-muted) !important;
        font-size: 0.9rem;
    }
    .landing-sanctions-table tbody tr:hover {
        background: var(--glass-bg);
    }
    .landing-bento-tile {
        background: var(--glass-bg);
        backdrop-filter: blur(12px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 1.25rem;
        min-height: 320px;
        display: flex;
        flex-direction: column;
    }
    .landing-bento-tile:hover { border-color: var(--emerald-green); }
    .landing-bento-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--emerald-green) !important;
        margin-bottom: 0.5rem;
    }
    .landing-bento-body { color: var(--text-muted) !important; font-size: 0.9rem; }
    .landing-cta-wrapper { margin-top: 2rem; }
    /* Przycisk CTA na landingu – Emerald Green, profesjonalny SaaS/Fintech */
    div:has(.landing-cta-wrapper) + div .stButton > button,
    .landing-cta-wrapper + div .stButton > button {
        background: var(--emerald-green) !important;
        color: #fff !important;
        border: none !important;
        padding: 0.875rem 1.75rem !important;
        font-size: 1.1rem !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        max-width: 700px !important;
        width: 80% !important;
        margin: 0 auto !important;
        display: block !important;
    }
    div:has(.landing-cta-wrapper) + div .stButton > button:hover,
    .landing-cta-wrapper + div .stButton > button:hover {
        background: #047857 !important;
        color: #fff !important;
        box-shadow: 0 4px 20px rgba(5, 150, 105, 0.35) !important;
    }
    .landing-vault-banner {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        border-left: 4px solid var(--emerald-green);
        padding: 1.25rem 1.5rem;
        border-radius: 10px;
        margin-top: 1.5rem;
        color: var(--text-primary) !important;
        font-size: 0.95rem;
    }

    /* ==========================================================================
       BUTTONS - Flat, professional
       ========================================================================== */
    
    .stButton > button,
    .stDownloadButton > button {
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        font-size: 0.85rem !important;
        letter-spacing: 0.02em !important;
        border: 1px solid var(--slate-600) !important;
        color: var(--slate-200) !important;
        background: var(--slate-800) !important;
        border-radius: 4px !important;
        padding: 0.5rem 1rem !important;
        min-height: 44px !important;  /* Better touch target for Dell touchscreen */
        transition: border-color 0.15s ease, background 0.15s ease !important;
    }
    
    .stButton > button:hover,
    .stDownloadButton > button:hover {
        border-color: var(--accent-green) !important;
        background: var(--slate-700) !important;
        color: var(--slate-100) !important;
        transform: translateY(-1px) !important;  /* Subtle lift effect */
    }
    
    .stButton > button[kind="primary"] {
        background: var(--accent-green) !important;
        color: #fff !important;
        border: none !important;
        font-weight: 600 !important;
        min-height: 48px !important;  /* Larger primary buttons */
        font-size: 0.95rem !important;
    }
    
    .stButton > button[kind="primary"]:hover {
        background: #059669 !important;
        color: #fff !important;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25) !important;
        transform: translateY(-2px) !important;
    }
    
    /* Ensure buttons at bottom of tabs are visible */
    [data-testid="stTabs"] > div[data-baseweb="tab-panel"] {
        min-height: 70vh !important;
        padding-bottom: 3rem !important;
    }

    /* ==========================================================================
       FORM INPUTS - Flat, bordered
       ========================================================================== */
    
    .stTextInput > div > div,
    .stSelectbox > div > div,
    .stMultiSelect > div > div,
    .stNumberInput > div > div,
    .stTextArea > div > div {
        background: var(--slate-800) !important;
        border: 1px solid var(--slate-600) !important;
        border-radius: 4px !important;
    }
    
    .stTextInput input,
    .stSelectbox select,
    .stNumberInput input,
    .stTextArea textarea {
        background: var(--slate-800) !important;
        color: var(--slate-200) !important;
        font-family: 'Inter', sans-serif !important;
    }
    
    .stTextInput input:focus,
    .stNumberInput input:focus,
    .stTextArea textarea:focus {
        border-color: var(--accent-green) !important;
        outline: none !important;
    }

    /* ==========================================================================
       EXPANDERS - Clean accordion style
       ========================================================================== */
    
    [data-testid="stExpander"] {
        border: 1px solid var(--slate-700) !important;
        border-radius: 4px !important;
        background: var(--slate-800) !important;
    }
    
    [data-testid="stExpander"] summary {
        font-weight: 500 !important;
        color: var(--slate-300) !important;
    }
    
    .streamlit-expanderHeader::before,
    .streamlit-expanderHeader::after,
    [data-testid="stExpander"] .streamlit-expanderHeader *::before,
    [data-testid="stExpander"] .streamlit-expanderHeader *::after,
    [data-testid="stExpanderExpandIcon"]::before,
    [data-testid="stExpanderExpandIcon"]::after {
        content: none !important;
    }

    /* ==========================================================================
       TOGGLE / CHECKBOX - Flat style
       ========================================================================== */
    
    [data-testid="stCheckbox"] label span,
    .stToggle label {
        color: var(--slate-300) !important;
    }

    /* ==========================================================================
       LOADING STATES - Text-based status (no spinners)
       ========================================================================== */
    
    .status-text {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.75rem;
        color: var(--slate-400);
        letter-spacing: 0.02em;
    }
    
    .status-text-active {
        color: var(--accent-green);
    }
    
    .status-text-warning {
        color: var(--accent-amber);
    }
    
    .status-text-error {
        color: var(--accent-red);
    }

    /* ==========================================================================
       DATA EDITOR - Override styling for financial data
       ========================================================================== */
    
    [data-testid="stDataEditor"] {
        background: var(--slate-800) !important;
        border: 1px solid var(--slate-700) !important;
        border-radius: 4px !important;
    }
    
    [data-testid="stDataEditor"] input {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.85rem !important;
    }
    
    [data-testid="stDataEditor"] input[type="checkbox"] {
        accent-color: var(--accent-green);
    }

    /* ==========================================================================
       AUDIT TRAIL INDICATOR
       ========================================================================== */
    
    .audit-indicator {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid var(--accent-green);
        border-radius: 3px;
        font-size: 0.7rem;
        font-weight: 500;
        color: var(--accent-green);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* ==========================================================================
       UI DENSITY - FINANCIAL DASHBOARD STYLE (HIGH DENSITY)
       ========================================================================== */
    
    /* Reduce vertical spacing between elements */
    .block-container {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
    }
    
    /* Compact metrics - reduce padding */
    div[data-testid="stMetric"] {
        padding: 0.65rem 1rem !important;
        min-height: 80px !important;
        margin-bottom: 0.5rem !important;
    }
    
    [data-testid="stMetricValue"] { 
        font-size: 1.5rem !important;
        margin: 0.25rem 0 !important;
    }
    
    [data-testid="stMetricLabel"] {
        margin-bottom: 0.25rem !important;
    }
    
    /* Reduce spacing between columns */
    [data-testid="column"] {
        padding: 0 0.35rem !important;
    }
    
    /* Compact charts - reduce margins */
    [data-testid="stPlotlyChart"] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.75rem !important;
    }
    
    /* Compact headers */
    h1, h2, h3, h4 {
        margin-top: 0.75rem !important;
        margin-bottom: 0.5rem !important;
        line-height: 1.2 !important;
    }
    
    /* Compact dividers */
    hr, [data-testid="stHorizontalBlock"] {
        margin-top: 0.75rem !important;
        margin-bottom: 0.75rem !important;
    }
    
    /* Compact dataframes */
    [data-testid="stDataFrame"] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
    }
    
    /* Compact expanders */
    [data-testid="stExpander"] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
    }
    
    /* Compact tabs */
    [data-testid="stTabs"] {
        margin-top: 0.5rem !important;
    }
    
    [data-testid="stTabs"] [data-baseweb="tab-list"] {
        gap: 0.25rem !important;
        background: var(--slate-800) !important;
        border-bottom: 1px solid var(--slate-700) !important;
        padding: 0.5rem !important;
        border-radius: 6px 6px 0 0 !important;
    }
    
    [data-testid="stTabs"] [data-baseweb="tab"] {
        padding: 0.5rem 1rem !important;
        font-weight: 500 !important;
        font-size: 0.9rem !important;
        border-radius: 4px !important;
        background: transparent !important;
        color: var(--slate-400) !important;
    }
    
    [data-testid="stTabs"] [aria-selected="true"] {
        background: var(--slate-700) !important;
        color: var(--accent-green) !important;
        font-weight: 600 !important;
    }
    
    [data-testid="stTabs"] [data-baseweb="tab"]:hover {
        background: var(--slate-700) !important;
        color: var(--slate-200) !important;
    }
    
    /* Tab panels - compact padding */
    [data-testid="stTabs"] > div > div[data-baseweb="tab-panel"] {
        padding-top: 1rem !important;
    }
    
    /* Compact markdown paragraphs */
    .stMarkdown p {
        margin-bottom: 0.5rem !important;
    }
    
    /* Compact captions */
    .stCaption, [data-testid="stCaptionContainer"] {
        margin-top: 0.25rem !important;
        margin-bottom: 0.25rem !important;
    }

</style>""", unsafe_allow_html=True)


def apply_branding():
    """
    Wstrzykuje dodatkowy CSS poprawiający widoczność przycisków i pól tekstowych.
    Wywołaj po apply_custom_css() dla lepszego kontrastu.
    """
    st.markdown("""<style>
    /* ==========================================================================
       BRANDING FIX - Visibility Improvements
       ========================================================================== */
    
    /* BUTTONS - Ensure white text on all buttons */
    .stButton > button,
    .stDownloadButton > button,
    .stFormSubmitButton > button,
    button[kind="secondary"],
    button[kind="primary"] {
        color: #FFFFFF !important;
        background-color: #1e293b !important;
        border: 1px solid #475569 !important;
        font-weight: 600 !important;
    }
    
    .stButton > button:hover,
    .stDownloadButton > button:hover,
    .stFormSubmitButton > button:hover {
        background-color: #334155 !important;
        border-color: #10b981 !important;
        color: #FFFFFF !important;
    }
    
    /* Primary buttons - Green */
    .stButton > button[kind="primary"],
    .stFormSubmitButton > button {
        background-color: #10b981 !important;
        border-color: #10b981 !important;
        color: #FFFFFF !important;
    }
    
    .stButton > button[kind="primary"]:hover,
    .stFormSubmitButton > button:hover {
        background-color: #059669 !important;
        border-color: #059669 !important;
    }
    
    /* INPUT FIELDS - White text on dark background */
    .stTextInput input,
    .stTextInput input::placeholder,
    .stNumberInput input,
    .stTextArea textarea,
    .stSelectbox [data-baseweb="select"] span,
    .stSelectbox input,
    .stMultiSelect input,
    [data-baseweb="input"] input,
    [data-baseweb="textarea"] textarea {
        color: #e2e8f0 !important;
        background-color: #1e293b !important;
        caret-color: #10b981 !important;
    }
    
    .stTextInput input::placeholder,
    .stNumberInput input::placeholder,
    .stTextArea textarea::placeholder {
        color: #64748b !important;
        opacity: 1 !important;
    }
    
    /* Selectbox dropdown text */
    [data-baseweb="select"] [data-baseweb="tag"] span,
    [data-baseweb="select"] .css-1dimb5e-singleValue,
    [data-baseweb="popover"] li,
    [data-baseweb="menu"] li,
    .stSelectbox div[data-baseweb="select"] > div {
        color: #e2e8f0 !important;
    }
    
    /* Dropdown menu items */
    [data-baseweb="popover"] [role="option"],
    [data-baseweb="menu"] [role="option"] {
        color: #e2e8f0 !important;
        background-color: #1e293b !important;
    }
    
    [data-baseweb="popover"] [role="option"]:hover,
    [data-baseweb="menu"] [role="option"]:hover {
        background-color: #334155 !important;
    }
    
    /* Form labels */
    .stTextInput label,
    .stNumberInput label,
    .stSelectbox label,
    .stMultiSelect label,
    .stTextArea label,
    .stCheckbox label,
    .stRadio label {
        color: #cbd5e1 !important;
        font-weight: 500 !important;
    }
    
    /* Radio buttons text */
    .stRadio [role="radiogroup"] label span,
    .stRadio div[data-testid="stMarkdownContainer"] {
        color: #e2e8f0 !important;
    }
    
    /* Checkbox text */
    .stCheckbox span {
        color: #e2e8f0 !important;
    }
    
    /* Fix sidebar collapse button - remove "double left arrow" text */
    [data-testid="stSidebarCollapseButton"] span {
        font-size: 0 !important;
    }
    [data-testid="stSidebarCollapseButton"] svg {
        width: 20px !important;
        height: 20px !important;
    }
    
    /* Success/Error/Warning messages */
    .stSuccess, .stInfo, .stWarning, .stError {
        color: #e2e8f0 !important;
    }
    
    /* Toast messages */
    [data-testid="stToast"] {
        color: #e2e8f0 !important;
    }
    
    </style>""", unsafe_allow_html=True)
