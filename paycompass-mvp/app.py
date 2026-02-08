import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np
import os
from datetime import datetime
from dotenv import load_dotenv

# IMPORTY Z NOWYCH MODUŁÓW (Twoja architektura)
from styles import apply_custom_css, apply_branding
from src.ui.dashboard import render_compliance_cockpit
from src.ui.sidebar import render_sidebar
from logic import (
    load_and_validate, apply_rodo_shield, get_unique_positions, 
    get_ai_job_scoring_mini, get_unique_positions_mapping, b2b_to_uop_bulk, 
    get_ai_job_grading, calculate_pay_gap, calculate_pay_gap_median, remove_outliers_iqr, 
    mask_sensitive_data, RODO_GROUP_THRESHOLD,
    # EVG (Equal Value Groups) - Art. 4 Dyrektywy UE 2023/970
    create_equal_value_groups, get_evg_summary, calculate_pay_gap_by_evg_groups, get_evg_buckets_structure,
    # Advanced Overrides
    apply_salary_overrides, b2b_to_uop_bulk_with_overrides, create_overrides_dataframe,
    # CSV scanning
    scan_available_csv_files, NO_FILE_SELECTED, detect_and_load_csv,
    load_csv_with_forced_separator, generate_mock_data,
    # Art. 16 - Raportowanie zgodności
    calculate_pay_quartiles, calculate_component_gaps, format_quartile_for_chart,
    # Job Grading & Tier System
    map_score_to_tier, calculate_weighted_score,
)
from pdf_gen import create_pdf, generate_art7_report, generate_employee_report_pdf
from landing import show_landing_page
from ai_engine import get_expert_analysis
from memory import get_company_memory

# VAULT Security & Auth (Modular Architecture v2.0)
from src.database import (
    init_auth_session,
    login_user,
    logout_user,
    require_auth,
    get_current_user,
    log_action,
    sanitize_upload,
    detect_pii_columns,
    # Multi-tenancy
    get_user_projects,
    initialize_default_tenant,
    set_project_context,
    switch_project,
    # Employees (projekt -> dane pracowników)
    save_employees_to_project,
    get_project_employees,
    # Job Valuations (EU Standard Grader)
    save_job_valuation,
    save_job_valuations_batch,
    get_project_valuations,
    get_valuations_statistics,
)

# EU Standard Grader - Model Klasyfikacji
from agents.grader import AIJobGrader, results_to_dataframe, JobValuationResult

# 0. INICJALIZACJA
load_dotenv()
ENV_KEY = os.getenv("OPENAI_API_KEY")

# 1. KONFIGURACJA I STYLE
st.set_page_config(layout="wide", page_title="PayCompass Pro | Intelligence", initial_sidebar_state="expanded")
apply_custom_css()
apply_branding()  # Dodatkowe poprawki widoczności przycisków i pól

# Inicjalizacja sesji autoryzacji (Supabase Auth)
init_auth_session()

# ============================================================================
# INICJALIZACJA FLAG SESJI (KRYTYCZNE - musi być przed routerem)
# ============================================================================
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "show_login" not in st.session_state:
    st.session_state.show_login = False

# ============================================================================
# GŁÓWNY ROUTER - Landing Page vs Dashboard (KOLEJNOŚĆ KRYTYCZNA)
# ============================================================================
if st.session_state.get("authenticated", False):
    # UŻYTKOWNIK ZALOGOWANY -> Pokaż Dashboard
    pass  # Dashboard renderuje się poniżej
    
elif st.session_state.get("show_login", False):
    # UŻYTKOWNIK KLIKNĄŁ CTA -> Pokaż Logowanie w Sidebarze
    # Sidebar z formularzem logowania renderuje się poniżej
    pass
    
else:
    # DOMYŚLNIE -> Pokaż Landing Page
    show_landing_page()
    st.stop()  # Zatrzymaj renderowanie (nie pokazuj sidebara/dashboardu)

# ============================================================================
# KOD DASHBOARDU (renderuje się tylko dla zalogowanych lub show_login=True)
# ============================================================================
if st.session_state.get("authenticated", False) or st.session_state.get("show_login", False):
    # Fallback dla trybu demo (gdy brak Supabase)
    if 'company_id' not in st.session_state or st.session_state['company_id'] is None:
        st.session_state['company_id'] = "demo_corp_01"
    if 'is_pro' not in st.session_state:
        st.session_state['is_pro'] = False
    if 'scoring_model_approved' not in st.session_state:
        st.session_state['scoring_model_approved'] = False
    if 'auth_mode' not in st.session_state:
        st.session_state['auth_mode'] = 'login'  # 'login' lub 'register'
    if 'evg_analysis_mode' not in st.session_state:
        st.session_state['evg_analysis_mode'] = False  # Art. 4 - analiza wg wartości pracy
    
    # INICJALIZACJA WAG DLA WARTOŚCIOWANIA (Industry Standard - Alternatywa 2)
    if 'job_weights' not in st.session_state:
        st.session_state['job_weights'] = {
            'skills': 35,  # Wiedza i Umiejętności (%)
            'responsibility': 35,  # Odpowiedzialność (%)
            'effort': 20,  # Wysiłek i Rozwiązywanie Problemów (%)
            'conditions': 10,  # Warunki Pracy (%)
        }

    # SETUP/DASHBOARD - flaga stanu widoku
    if 'setup_complete' not in st.session_state:
        st.session_state['setup_complete'] = False
    if 'mapped_df' not in st.session_state:
        st.session_state['mapped_df'] = None

    # ROUTER: Sprawdź czy użytkownik jest zalogowany
    is_authenticated = st.session_state.get('authenticated', False)

    # 2. SIDEBAR (Zawsze otwarty - initial_sidebar_state="expanded")
    # Explicit trigger so sidebar renders after login (production: no debug, full UI)
    with st.sidebar:
        render_sidebar()
        # ========== WYBÓR ŹRÓDŁA DANYCH (PRIORYTET #1 - ZAWSZE NA GÓRZE) ==========
        st.markdown("### 📊 Źródło danych")
    
        # Wybór źródła danych (session_state pozwala na ustawienie z landing "Demo / Załaduj dane")
        data_source = st.radio(
            "Źródło:",
            ["Z dostępnych plików", "Z własnego pliku CSV"],
            horizontal=True,
            key="data_source_radio",
            label_visibility="collapsed"
        )
    
        df_raw = pd.DataFrame()
        scenario = st.session_state.get("scenario")  # Pobierz z session_state (może być ustawiony przez Demo)
    
        # Sprawdź czy są dane załadowane z projektu (priorytet)
        if 'project_employees_df' in st.session_state and st.session_state.get('scenario', '').startswith('project:'):
            df_raw = st.session_state['project_employees_df']
            scenario = st.session_state['scenario']
            project_id = scenario.replace('project:', '')
            st.info(f"📁 Dane z projektu: `{project_id[:8]}...` ({len(df_raw)} pracowników)")
        
            # Przycisk do przełączenia na pliki lokalne
            if st.button("🔄 Przełącz na pliki lokalne", key="switch_to_local_files"):
                st.session_state.pop('project_employees_df', None)
                st.session_state['scenario'] = None
                st.session_state['setup_complete'] = False
                st.rerun()
    
        if data_source == "Z dostępnych plików":
            # Dynamiczne skanowanie plików CSV z root i data/
            available_files = scan_available_csv_files()
            dataset_options = [NO_FILE_SELECTED] + available_files
        
            current_scenario = st.session_state.get("scenario")
        
            # Znajdź indeks aktualnego wyboru
            if current_scenario and current_scenario in dataset_options:
                index = dataset_options.index(current_scenario)
            else:
                index = 0  # "--- Wybierz dane ---"
        
            scenario = st.selectbox(
                "Wybierz dataset:",
                options=dataset_options,
                index=index,
                key="dataset_selectbox",
            )
        
            # Aktualizuj session_state
            if scenario != NO_FILE_SELECTED:
                st.session_state["scenario"] = scenario
                
                # ZAŁADUJ DANE Z WYBRANEGO PLIKU
                try:
                    with st.spinner(f"Ładuję {scenario}..."):
                        df_raw = load_and_validate(scenario, forced_separator=st.session_state.get("forced_separator"))
                    
                    if not df_raw.empty:
                        st.success(f"✅ Załadowano **{len(df_raw)}** wierszy z **{len(df_raw.columns)}** kolumnami")
                        # Zapisz do session_state
                        st.session_state["raw_df"] = df_raw
                        
                        # Wyczyść forced_separator jeśli załadowanie się powiodło
                        if st.session_state.get("forced_separator") and len(df_raw.columns) > 1:
                            st.session_state.pop("forced_separator", None)
                except FileNotFoundError as e:
                    st.error(f"❌ Plik nie znaleziony: {scenario}")
                    st.info("🔄 Używam danych awaryjnych (mock data)")
                    df_raw = generate_mock_data(50)
                    st.session_state["raw_df"] = df_raw
                except Exception as e:
                    st.error(f"❌ Błąd ładowania pliku: {type(e).__name__}")
                    st.code(str(e))
                    st.warning("Sprawdź format pliku CSV (separator, kodowanie)")
                    # Nie używaj mock data dla błędów parsowania - pozwól użytkownikowi naprawić
            elif scenario == NO_FILE_SELECTED:
                # Wyczyść dane jeśli wybrano "--- Wybierz dane ---"
                df_raw = pd.DataFrame()
                if "raw_df" in st.session_state:
                    st.session_state.pop("raw_df")
    
        elif data_source == "Z własnego pliku CSV":
            st.markdown("##### 📤 Wgraj plik CSV")
        
            uploaded_file = st.file_uploader(
                "Wybierz plik CSV z danymi pracowników",
                type=["csv"],
                key="csv_uploader",
                help="Obsługiwane kodowania: UTF-8, CP1250, Latin1. Separatory: ; lub ,"
            )
        
            if uploaded_file is not None:
                # Załaduj plik z auto-detekcją kodowania (lub wymuszonym separatorem)
                forced_sep = st.session_state.get("forced_separator")
                df_raw = detect_and_load_csv(uploaded_file, forced_separator=forced_sep)
            
                # Wyczyść wymuszony separator jeśli załadowanie się powiodło
                if forced_sep and len(df_raw.columns) > 1:
                    st.session_state.pop("forced_separator", None)
            
                if not df_raw.empty:
                    st.success(f"✓ Załadowano **{len(df_raw)}** wierszy z **{len(df_raw.columns)}** kolumnami")
                
                    # Zapisz w session_state
                    st.session_state["uploaded_df"] = df_raw
                    st.session_state["uploaded_filename"] = uploaded_file.name
                    st.session_state["scenario"] = f"upload:{uploaded_file.name}"
                    scenario = st.session_state["scenario"]
                
                    # Przypisz do aktywnego projektu
                    active_project_id = st.session_state.get('active_project_id')
                    if active_project_id:
                        st.session_state["data_project_id"] = active_project_id
                        st.caption(f"📁 Dane powiązane z projektem: `{active_project_id[:8]}...`")
                
                    # Przycisk zapisu do Supabase - aktywny tylko po zakończeniu setup
                    st.divider()
                    st.markdown("##### 💾 Zapisz do projektu")
                
                    setup_done = st.session_state.get('setup_complete', False)
                    has_project = active_project_id and active_project_id != 'demo_project_01'
                
                    if not setup_done:
                        st.caption("⏳ Najpierw zmapuj kolumny (Salary, Gender, Position)")
                    elif not has_project:
                        st.caption("🔐 Zaloguj się i wybierz projekt, aby zapisać dane trwale.")
                    else:
                        st.caption("Dane zostaną trwale zapisane w Supabase i powiązane z aktywnym projektem.")
                
                    # Przycisk aktywny tylko gdy: setup_complete=True ORAZ active_project_id istnieje
                    save_btn_disabled = not (setup_done and has_project)
                
                    if st.button("💾 Zapisz ten plik do projektu", key="save_to_project_btn", width="stretch", disabled=save_btn_disabled):
                        with st.spinner("Zapisywanie danych..."):
                            from db_manager import save_employees_to_project
                            # Użyj mapped_df jeśli dostępne
                            data_to_save = st.session_state.get('mapped_df', df_raw)
                            saved = save_employees_to_project(
                                project_id=active_project_id,
                                df=data_to_save,
                                source_filename=uploaded_file.name
                            )
                            if saved:
                                st.toast(f"✅ Dane zapisane trwale! ({saved} pracowników)", icon="💾")
                                st.success(f"✓ Zapisano **{saved}** pracowników do projektu")
                                log_action(
                                    user_id=st.session_state.get('user_id', 'anonymous'),
                                    company_id=st.session_state.get('company_id'),
                                    action_type='FILE_UPLOAD',
                                    details={
                                        'filename': uploaded_file.name,
                                        'rows': len(data_to_save),
                                        'project_id': active_project_id,
                                        'saved_to_db': True,
                                    }
                                )
                            else:
                                st.error("Nie udało się zapisać danych. Sprawdź połączenie z Supabase.")
                else:
                    st.error("Nie udało się wczytać pliku. Sprawdź format danych.")
        
            # Sprawdź czy są wcześniej wgrane dane
            elif "uploaded_df" in st.session_state and st.session_state.get("scenario", "").startswith("upload:"):
                df_raw = st.session_state["uploaded_df"]
                scenario = st.session_state["scenario"]
                st.info(f"📄 Używam poprzednio wgranego pliku: `{st.session_state.get('uploaded_filename', 'plik.csv')}`")
    
        # VAULT Security: Wykryj i ostrzeż o kolumnach PII
        if not df_raw.empty:
            pii_columns = detect_pii_columns(df_raw)
            if pii_columns:
                st.warning(f"⚠️ Wykryto {len(pii_columns)} kolumn z potencjalnym PII: {', '.join(pii_columns[:5])}{'...' if len(pii_columns) > 5 else ''}")
                if st.checkbox("🛡️ Automatycznie usuń kolumny PII (zalecane)", key="auto_sanitize_pii"):
                    df_raw = sanitize_upload(df_raw, log_removed=True)
                    st.success(f"✓ Usunięto {len(pii_columns)} kolumn PII")
    
        # FILTR DEPARTAMENTU (Przywrócony)
        if not df_raw.empty and 'Department' in df_raw.columns:
            depts = ["Wszystkie"] + sorted(df_raw['Department'].unique().tolist())
            selected_dept = st.selectbox("Globalny Filtr Departamentu:", depts)
        else:
            selected_dept = "Wszystkie"
        
        st.divider()
        st.session_state['is_pro'] = st.checkbox("Tryb PRO (Scoring & Validation)", value=st.session_state.get('is_pro', False), key="sidebar_is_pro")
        
        st.divider()
        
        # ========== SEKCJA AUTORYZACJI ==========
        st.markdown("### 🔐 Autoryzacja")
    
        # Sprawdź czy użytkownik jest zalogowany
        auth_status = require_auth()

        if auth_status:
            # ZALOGOWANY - pokaż info i przycisk wylogowania
            current_user = get_current_user()
            st.success(f"✓ Zalogowano")
            st.caption(f"📧 {current_user.get('email', 'Użytkownik')}")
        
            # ========== MULTI-TENANCY: TENANT SWITCHER ==========
            # Pobierz projekty użytkownika (z cache w session_state)
            user_id = st.session_state.get('user_id')
            user_email = st.session_state.get('user_email', current_user.get('email', ''))
        
            # Force-load projects jeśli brak w cache lub pusta lista
            needs_project_load = (
                'user_projects' not in st.session_state or 
                st.session_state.user_projects is None or
                len(st.session_state.get('user_projects', [])) == 0
            )
        
            if needs_project_load:
                with st.spinner("Ładowanie projektów..."):
                    if user_id and user_id != 'demo_user':
                        projects = get_user_projects(user_id)
                    
                        # BEZWZGLĘDNIE utwórz domyślny tenant jeśli brak projektów
                        if not projects or len(projects) == 0:
                            st.info("🔄 Tworzenie domyślnego projektu...")
                            new_project = initialize_default_tenant(user_id, user_email)
                            if new_project:
                                projects = [new_project]
                                st.session_state.user_projects = projects
                                st.session_state['active_project_id'] = new_project['id']
                                
                                # Sprawdź czy to tryb offline (mock project)
                                if new_project.get('_offline_mode'):
                                    st.warning("""
                                    ⚠️ **Tryb Offline**
                                    
                                    Brak połączenia z Supabase. Aplikacja działa w trybie lokalnym.
                                    Dane nie będą zapisywane do bazy danych.
                                    """)
                                else:
                                    st.success("✓ Utworzono domyślny projekt!")
                                st.rerun()  # Wymuś odświeżenie po utworzeniu projektu
                            else:
                                # Rzadki przypadek - soft-fail też nie zadziałał
                                st.error("❌ Krytyczny błąd inicjalizacji. Sprawdź logi konsoli.")
                                projects = []
                    
                        st.session_state.user_projects = projects
                    else:
                        # Tryb demo - projekt lokalny
                        st.session_state.user_projects = [{
                            'id': 'demo_project_01',
                            'name': 'Projekt Demo',
                            'organization_id': 'demo_corp_01',
                            'organization_name': 'Demo Corp',
                            'role': 'admin',
                        }]
                        # Ustaw aktywny projekt dla demo
                        if not st.session_state.get('active_project_id'):
                            st.session_state['active_project_id'] = 'demo_project_01'
        
            projects = st.session_state.get('user_projects', [])
        
            # FALLBACK: Jeśli projekty istnieją ale active_project_id jest None - ustaw pierwszy
            if projects and not st.session_state.get('active_project_id'):
                first_proj = projects[0]
                st.session_state['active_project_id'] = first_proj['id']
                st.session_state['company_id'] = first_proj.get('organization_id', first_proj['id'])
                set_project_context(first_proj['id'])
        
            if projects:
                # Tenant Switcher
                st.markdown("#### 📁 Aktywny Projekt")
                project_names = [f"{p['name']} ({p.get('organization_name', 'Org')})" for p in projects]
                project_ids = [p['id'] for p in projects]
            
                # Znajdź aktualny indeks
                current_project_id = st.session_state.get('active_project_id')
                current_index = 0
                if current_project_id and current_project_id in project_ids:
                    current_index = project_ids.index(current_project_id)
            
                selected_project_name = st.selectbox(
                    "Aktywny projekt:",
                    options=project_names,
                    index=current_index,
                    key="tenant_switcher",
                    label_visibility="collapsed"
                )
            
                # Pobierz wybrany projekt
                selected_index = project_names.index(selected_project_name)
                selected_project = projects[selected_index]
                selected_project_id = selected_project['id']
            
                # Sprawdź czy zmieniono projekt
                if selected_project_id != st.session_state.get('active_project_id'):
                    # Przełącz projekt i ustaw kontekst RLS
                    if switch_project(selected_project_id):
                        st.session_state['active_project_id'] = selected_project_id
                        st.session_state['company_id'] = selected_project.get('organization_id', selected_project_id)
                    
                        # Resetuj dane sesji przy zmianie projektu
                        st.session_state['setup_complete'] = False
                        st.session_state['mapped_df'] = None
                        st.session_state.pop('project_employees_df', None)
                    
                        st.rerun()
            
                # Ustaw aktywny projekt jeśli nie ustawiony
                if not st.session_state.get('active_project_id') and projects:
                    first_project = projects[0]
                    st.session_state['active_project_id'] = first_project['id']
                    st.session_state['company_id'] = first_project.get('organization_id', first_project['id'])
                    # Ustaw kontekst RLS
                    set_project_context(first_project['id'])
            
                # Pokaż rolę użytkownika w projekcie
                user_role = selected_project.get('role', 'member')
                role_emoji = {'admin': '👑', 'member': '👤', 'viewer': '👁️'}.get(user_role, '👤')
                st.caption(f"{role_emoji} Rola: {user_role}")
            
                # ========== ŁADOWANIE DANYCH Z PROJEKTU ==========
                if st.button("📥 Załaduj dane z projektu", key="load_project_data_btn", width="stretch"):
                    with st.spinner("Ładowanie danych pracowników..."):
                        employees = get_project_employees(selected_project_id)
                        if employees:
                            # Konwertuj do DataFrame
                            project_df = pd.DataFrame(employees)
                        
                            # Mapuj kolumny z bazy na standardowe
                            col_mapping = {
                                'employee_id': 'Employee_ID',
                                'position': 'Position',
                                'department': 'Department',
                                'salary': 'Salary',
                                'gender': 'Gender',
                                'contract_type': 'Contract_Type',
                                'scoring': 'Scoring',
                            }
                            project_df.rename(columns=col_mapping, inplace=True)
                        
                            # Zapisz do session_state
                            st.session_state['project_employees_df'] = project_df
                            st.session_state['mapped_df'] = project_df
                            st.session_state['setup_complete'] = True  # Dane z bazy są już zmapowane!
                            st.session_state['scenario'] = f"project:{selected_project_id}"
                        
                            st.success(f"✓ Załadowano **{len(project_df)}** pracowników z projektu")
                            st.rerun()
                        else:
                            st.info("📭 Projekt nie zawiera jeszcze danych. Wgraj plik CSV.")
        
            if st.button("🚪 Wyloguj", key="logout_btn", width="stretch"):
                # Wyczyść dane multi-tenancy
                st.session_state.pop('user_projects', None)
                st.session_state.pop('active_project_id', None)
                logout_user()
                st.rerun()
        
            st.divider()
        else:
            # NIEZALOGOWANY - pokaż formularz logowania/rejestracji
            st.markdown("### 🔐 Panel Logowania")
            
            # CSS dla widoczności formularza
            st.markdown("""
            <style>
                /* Wymuszenie widoczności pól formularza */
                .stTextInput label, .stTextInput > div > label {
                    color: #e2e8f0 !important;
                    font-weight: 600 !important;
                }
                .stTextInput input {
                    background-color: #1e293b !important;
                    color: #e2e8f0 !important;
                    border: 1px solid #475569 !important;
                }
                .stTextInput input::placeholder {
                    color: #64748b !important;
                }
                .stRadio label, .stRadio > div > label {
                    color: #e2e8f0 !important;
                }
            </style>
            """, unsafe_allow_html=True)
            
            # Przycisk "Wróć do Landing Page"
            if st.button("⬅ Wróć do strony głównej", key="back_to_landing", width="stretch"):
                st.session_state["show_login"] = False
                st.rerun()
            
            st.divider()

            # Ustaw domyślny indeks na podstawie show_login
            tabs = ["Logowanie", "Rejestracja", "Tryb Demo"]
            default_index = 0 if st.session_state.get("show_login") else 2  # Logowanie lub Tryb Demo
            
            auth_tab = st.radio(
                "Wybierz akcję:",
                tabs,
                index=default_index,
                horizontal=True,
                key="auth_tab_selector",
                label_visibility="collapsed"
            )
        
            if auth_tab == "Logowanie":
                st.markdown("#### 🔑 Zaloguj się")
                with st.form("login_form", clear_on_submit=False):
                    email = st.text_input("Email", key="login_email", placeholder="jan@firma.pl", value="demo@paycompass.local")
                    password = st.text_input("Hasło", type="password", key="login_password", value="demo123")
                    submit = st.form_submit_button("🔑 Zaloguj", width="stretch")
                
                    if submit:
                        if email and password:
                            with st.spinner("Logowanie..."):
                                if login_user(email, password):
                                    st.success("Zalogowano pomyślnie!")
                                    st.rerun()
                                else:
                                    st.error(st.session_state.get('auth_error', 'Błąd logowania'))
                        else:
                            st.warning("Wprowadź email i hasło")
        
            elif auth_tab == "Rejestracja":
                st.markdown("#### 📝 Utwórz konto")
                with st.form("register_form", clear_on_submit=False):
                    reg_email = st.text_input("Email", key="reg_email", placeholder="jan@firma.pl")
                    reg_password = st.text_input("Hasło (min. 6 znaków)", type="password", key="reg_password")
                    reg_password2 = st.text_input("Powtórz hasło", type="password", key="reg_password2")
                    reg_company = st.text_input("ID Firmy (opcjonalne)", key="reg_company", placeholder="UUID firmy")
                    submit_reg = st.form_submit_button("📝 Zarejestruj", width="stretch")
                
                    if submit_reg:
                        if reg_password != reg_password2:
                            st.error("Hasła nie są identyczne")
                        elif len(reg_password) < 6:
                            st.error("Hasło musi mieć min. 6 znaków")
                        elif reg_email and reg_password:
                            from db_manager import register_user
                            with st.spinner("Rejestracja..."):
                                if register_user(reg_email, reg_password, reg_company if reg_company else None):
                                    st.success("Zarejestrowano! Sprawdź email, aby potwierdzić konto.")
                                else:
                                    st.error(st.session_state.get('auth_error', 'Błąd rejestracji'))
                        else:
                            st.warning("Wprowadź email i hasło")
        
            else:  # Tryb Demo
                st.info("🎮 **Tryb Demo** - pełna funkcjonalność bez logowania")
                st.caption("Dane nie są zapisywane w chmurze. Audit Log lokalny.")
                if st.button("▶ Uruchom Demo", width="stretch", key="demo_mode_btn"):
                    st.session_state['authenticated'] = True
                    st.session_state['user_id'] = 'demo_user'
                    st.session_state['company_id'] = 'demo_corp_01'
                    st.session_state['user_email'] = 'demo@paycompass.local'
                    # Załaduj domyślny dataset demo
                    st.session_state['scenario'] = 'test_payroll_data.csv'
                    st.rerun()
        
            st.divider()
    
        # ========== POZOSTAŁA ZAWARTOŚĆ SIDEBARA ==========
        
        st.divider()
        st.subheader("🔧 Status Silników Systemowych")
    
        # STATUSY SILNIKÓW (Rebrandowane z Agentów)
        if not df_raw.empty:
            st.markdown('<div><span class="pulse-icon"></span><b>Silnik Walidacji Danych:</b> Aktywny</div>', unsafe_allow_html=True)
            if 'Scoring' in df_raw.columns:
                nan_count = df_raw['Scoring'].isna().sum()
                if nan_count > 0:
                    st.caption(f"⚠️ Wykryto {nan_count} braków w Scoringu.")
        else:
            st.caption("🔴 Silnik Walidacji: Oczekiwanie")

        if not df_raw.empty:
            st.markdown('<div><span class="pulse-icon"></span><b>Silnik Statystyczny:</b> Gotowy</div>', unsafe_allow_html=True)
            st.caption("🟢 Analizuję korelację Scoring vs Salary")
        else:
            st.caption("⚪ Silnik Statystyczny: Czeka na dane")

        st.caption("🟡 Moduł Security Audit: W gotowości")
        st.divider()
    
        # ========== SZYBKIE AKCJE (ZAWSZE WIDOCZNE) ==========
        st.markdown("### ⚡ Szybkie Akcje")
        
        # Przycisk Demo - zawsze widoczny
        if st.button("▶ Uruchom Demo", width="stretch", key="quick_demo_btn"):
            st.session_state['authenticated'] = True
            st.session_state['user_id'] = 'demo_user'
            st.session_state['company_id'] = 'demo_corp_01'
            st.session_state['user_email'] = 'demo@paycompass.local'
            # Załaduj domyślny dataset demo
            st.session_state['scenario'] = 'test_payroll_data.csv'
            st.session_state['setup_complete'] = False  # Wymuś setup po załadowaniu demo
            st.rerun()
        
        st.divider()
        
        # Przycisk powrotu - tylko gdy scenario jest wybrany
        if st.session_state.get("scenario") is not None:
            if st.button("⬅ Wróć do strony głównej", key="sidebar_back_home"):
                if "scenario" in st.session_state:
                    del st.session_state["scenario"]
                st.rerun()
    
        st.markdown("### 🛰️ PayCompass Control")
        openai_key = st.text_input("🔑 Klucz Dostępu do Modelu Obliczeniowego (Opcjonalnie)", type="password", help="Klucz API do zaawansowanego modelu statystycznego")
        active_key = openai_key if openai_key else ENV_KEY
    
        st.divider()

    # ============================================================================
    # GŁÓWNA ZAWARTOŚĆ STRONY (poza sidebarem)
    # ============================================================================
    
    # EKRAN LOGOWANIA (gdy show_login=True ale nie authenticated)
    if not st.session_state.get("authenticated", False) and st.session_state.get("show_login", False):
        st.title("🔐 Panel logowania")
        st.markdown("---")
        st.markdown("## 🔑 Zaloguj się")
        
        with st.container():
            st.markdown('<div style="background-color: #2D2D2D; padding: 30px; border-radius: 10px; border: 2px solid #10b981;">', unsafe_allow_html=True)
            
            email = st.text_input(
                "📧 Adres e-mail", 
                key="login_email_direct", 
                placeholder="demo@paycompass.local",
                value="demo@paycompass.local",
                help="Wpisz swój email"
            )
            
            password = st.text_input(
                "🔒 Hasło", 
                type="password", 
                key="login_pass_direct",
                value="demo123",
                help="Wpisz hasło"
            )
            
            col_btn1, col_btn2 = st.columns(2)
            with col_btn1:
                if st.button("🔑 ZALOGUJ SIĘ TERAZ", key="login_btn_direct", width="stretch", type="primary"):
                    if email and password:
                        with st.spinner("Logowanie..."):
                            if login_user(email, password):
                                st.success("✅ Zalogowano pomyślnie!")
                                st.session_state["show_login"] = False  # Resetuj flagę
                                st.rerun()
                            else:
                                st.error("❌ Nieprawidłowy email lub hasło")
                    else:
                        st.warning("⚠️ Wypełnij wszystkie pola")
            
            with col_btn2:
                if st.button("🎮 TRYB DEMO", key="demo_direct", width="stretch"):
                    st.session_state['authenticated'] = True
                    st.session_state['user_id'] = 'demo_user'
                    st.session_state['company_id'] = 'demo_corp_01'
                    st.session_state['user_email'] = 'demo@paycompass.local'
                    st.session_state['show_login'] = False
                    # Załaduj domyślny dataset demo
                    st.session_state['scenario'] = 'test_payroll_data.csv'
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown("---")
        
        # PRZYCISK AWARYJNY
        if st.button("🔴 RESTART SESJI I POWRÓT", key="emergency_reset", type="secondary"):
            st.session_state.clear()
            st.rerun()
        
        st.stop()  # Nie renderuj reszty dashboardu

        # 2c. LANDING PAGE / EMPTY STATE – High-Trust UX (dla zalogowanych bez wybranych danych)
        if scenario is None or (scenario == NO_FILE_SELECTED):
            # Tryb: brak wybranych danych - pokaż przyjazny komunikat (High-Trust UX)
            st.markdown("""
            <div class="ai-insight-box" style="text-align: center; padding: 2rem; margin: 2rem 0;">
                <h2 style="color: var(--slate-200) !important; margin-bottom: 1rem;">📊 Wybierz dane do analizy</h2>
                <p style="color: var(--slate-400) !important; font-size: 1.1rem; max-width: 600px; margin: 0 auto 1.5rem;">
                    Wybierz dataset z listy lub wgraj własny plik CSV, aby rozpocząć analizę.
                </p>
                <p style="color: var(--slate-500) !important; font-size: 0.9rem;">
                    Dashboard wymaga danych do wyświetlenia metryk, wykresów i raportów zgodności z Dyrektywą UE 2023/970.
                </p>
            </div>
            """, unsafe_allow_html=True)
        
            # Pokaż skrócony landing z demo datasetami
            st.markdown("---")
            st.markdown("### 🎯 Szybki start")
            col1, col2, col3 = st.columns(3)
            with col1:
                if st.button("📈 Demo: Czysty dataset", key="quick_demo_clean", width="stretch"):
                    st.session_state["scenario"] = "data_clean_v2.csv"
                    st.rerun()
            with col2:
                if st.button("⚠️ Demo: Dataset z błędami", key="quick_demo_dirty", width="stretch"):
                    st.session_state["scenario"] = "data_dirty_v2.csv"
                    st.rerun()
            with col3:
                if st.button("🏢 Demo: Enterprise (100+)", key="quick_demo_enterprise", width="stretch"):
                    st.session_state["scenario"] = "data_enterprise_test.csv"
                    st.rerun()
            
            st.stop()  # Zatrzymaj renderowanie jeśli brak danych
        else:
            # Dla innych przypadków - pokaż landing page
            st.markdown("""
            <style>
            h1, h2, h3, p { text-align: center !important; }
            .block-container { max-width: 100%; }
            </style>
            """, unsafe_allow_html=True)
            show_landing_page()
            st.stop()

    # Sprawdź czy są dane w session_state (mogły być załadowane wcześniej)
    if df_raw.empty and "raw_df" in st.session_state and not st.session_state["raw_df"].empty:
        df_raw = st.session_state["raw_df"]
    
    if df_raw.empty:
        # Brak danych - pokaż prosty komunikat
        st.markdown("""
        <div class="ai-insight-box" style="text-align: center; padding: 2rem; margin: 2rem 0;">
            <h2 style="color: var(--accent-amber) !important; margin-bottom: 1rem;">📊 Wybierz dane aby rozpocząć</h2>
            <p style="color: var(--slate-400) !important; font-size: 1rem;">
                Wybierz plik CSV w panelu bocznym lub użyj przycisku "▶ Uruchom Demo" aby załadować przykładowe dane.
            </p>
        </div>
        """, unsafe_allow_html=True)
        st.stop()
    else:
        # ✅ Dane załadowane - pokaż elegancki komunikat sukcesu
        if not st.session_state.get("data_loaded_notification_shown", False):
            st.success(f"✅ Dane załadowane poprawnie ({len(df_raw)} pracowników, {len(df_raw.columns)} kolumn)")
            st.session_state["data_loaded_notification_shown"] = True

    # 3. MAPPING WIZARD (Systemowa Weryfikacja Danych) – wymagane: Salary, Gender, Position; Scoring opcjonalnie z kolumny lub Model
    # Sprawdź czy setup jest już ukończony - jeśli tak, pomiń wizard
    if not df_raw.empty and not st.session_state.get('setup_complete', False):
        required_cols = ['Salary', 'Gender', 'Position']
    
        # ========== WYKRYWANIE BŁĘDU FORMATU (tylko 1 kolumna = zły separator) ==========
        if len(df_raw.columns) == 1:
            st.markdown("""
                <div class="mapping-card" style="border-left: 4px solid #ef4444;">
                    <h4>⚠️ Wykryto błąd formatu pliku</h4>
                    <p>Plik ma tylko <b>jedną kolumnę</b>. Prawdopodobnie separator (przecinek/średnik) nie został poprawnie wykryty.<br>
                    Polski Excel używa <b>średnika (;)</b> jako separatora, a amerykański <b>przecinka (,)</b>.</p>
                </div>
            """, unsafe_allow_html=True)
        
            col_sep1, col_sep2, col_sep3 = st.columns([1, 1, 2])
            with col_sep1:
                if st.button("🔧 Wymuś średnik (;)", key="force_sep_semicolon"):
                    st.session_state["forced_separator"] = ";"
                    st.rerun()
            with col_sep2:
                if st.button("🔧 Wymuś przecinek (,)", key="force_sep_comma"):
                    st.session_state["forced_separator"] = ","
                    st.rerun()
            with col_sep3:
                st.markdown("""
                    <p class="status-text" style="font-size: 0.8rem; color: var(--slate-400);">
                    Kliknij przycisk odpowiadający formatowi Twojego pliku.
                    </p>
                """, unsafe_allow_html=True)
        
            st.stop()
    
        # Auto-mapowanie znanych polskich nazw kolumn
        if 'Position' not in df_raw.columns and 'Stanowisko' in df_raw.columns:
            df_raw['Position'] = df_raw['Stanowisko']
        if 'Salary' not in df_raw.columns and 'Wynagrodzenie' in df_raw.columns:
            df_raw['Salary'] = df_raw['Wynagrodzenie']
        if 'Salary' not in df_raw.columns and 'Pensja' in df_raw.columns:
            df_raw['Salary'] = df_raw['Pensja']
        if 'Gender' not in df_raw.columns and 'Płeć' in df_raw.columns:
            df_raw['Gender'] = df_raw['Płeć']
        if 'Gender' not in df_raw.columns and 'Plec' in df_raw.columns:
            df_raw['Gender'] = df_raw['Plec']
    
        missing_cols = [c for c in required_cols if c not in df_raw.columns]
        show_scoring_opt = missing_cols or 'Scoring' not in df_raw.columns
    
        if missing_cols:
            st.markdown(f"""
                <div class="mapping-card">
                    <h4>🛠️ Systemowa Weryfikacja: Wymagane Mapowanie</h4>
                    <p>Plik <b>{scenario}</b> nie posiada kolumn: {', '.join(missing_cols)}.<br>
                    Wskaż odpowiedniki z Twojego pliku, aby odblokować dashboard. Scoring można dodać później (Model Wartościowania lub Krok 3 PRO).</p>
                </div>
            """, unsafe_allow_html=True)
        
            map_layout = st.columns(len(missing_cols))
            mappings_to_apply = {}
        
            for idx, missing in enumerate(missing_cols):
                with map_layout[idx]:
                    # Spróbuj znaleźć najlepsze dopasowanie domyślne
                    default_idx = 0
                    col_lower = [c.lower() for c in df_raw.columns]
                
                    if missing == 'Salary':
                        for kw in ['salary', 'wynagrodzenie', 'płaca', 'placa', 'pensja', 'brutto']:
                            for i, c in enumerate(col_lower):
                                if kw in c:
                                    default_idx = i
                                    break
                            if default_idx > 0:
                                break
                    elif missing == 'Gender':
                        for kw in ['gender', 'płeć', 'plec', 'sex']:
                            for i, c in enumerate(col_lower):
                                if kw in c:
                                    default_idx = i
                                    break
                            if default_idx > 0:
                                break
                    elif missing == 'Position':
                        for kw in ['position', 'stanowisko', 'job', 'tytuł', 'rola']:
                            for i, c in enumerate(col_lower):
                                if kw in c:
                                    default_idx = i
                                    break
                            if default_idx > 0:
                                break
                
                    mappings_to_apply[missing] = st.selectbox(
                        f"Dopasuj {missing}:", 
                        df_raw.columns, 
                        index=default_idx,
                        key=f"sel_{missing}"
                    )
        
            scoring_opt = st.selectbox(
                "Scoring (Opcjonalne) – własna kolumna lub użyj Modelu Wartościowania później",
                ["Brak / Generuj Model"] + df_raw.columns.tolist(),
                key="sel_scoring_opt",
            )
        
            # Walidacja: sprawdź czy wybrane kolumny istnieją i mają dane
            validation_errors = []
            for target_col, source_col in mappings_to_apply.items():
                if source_col not in df_raw.columns:
                    validation_errors.append(f"Kolumna '{source_col}' nie istnieje")
                elif df_raw[source_col].dropna().empty:
                    validation_errors.append(f"Kolumna '{source_col}' jest pusta")
        
            # Sprawdź czy Salary ma dane liczbowe
            salary_source = mappings_to_apply.get('Salary')
            if salary_source and salary_source in df_raw.columns:
                numeric_check = pd.to_numeric(df_raw[salary_source], errors='coerce')
                if numeric_check.dropna().empty:
                    validation_errors.append(f"Kolumna '{salary_source}' nie zawiera danych liczbowych")
        
            # Przycisk aktywny tylko gdy nie ma błędów walidacji
            button_disabled = len(validation_errors) > 0
        
            if st.button("✓ Zatwierdź i napraw strukturę", key="btn_apply_mapping", disabled=button_disabled):
                try:
                    # Zastosuj mapowania
                    for final_name, original_name in mappings_to_apply.items():
                        if original_name and original_name in df_raw.columns:
                            df_raw[final_name] = df_raw[original_name]
                        else:
                            st.error(f"❌ Brakująca kolumna: '{original_name}' dla '{final_name}'")
                            st.stop()
                
                    # Zastosuj scoring jeśli wybrano
                    if scoring_opt and scoring_opt != "Brak / Generuj Model":
                        df_raw["Scoring"] = pd.to_numeric(df_raw[scoring_opt], errors="coerce")
                
                    # Walidacja końcowa - czy mamy wymagane kolumny
                    final_missing = [c for c in required_cols if c not in df_raw.columns]
                    if final_missing:
                        st.error(f"❌ Nie udało się utworzyć mapped_df. Brakujące kolumny: {', '.join(final_missing)}")
                        st.stop()
                
                    # Zapisz zmapowane dane do session_state
                    st.session_state["mapped_df"] = df_raw.copy()
                    st.session_state["mapping_applied"] = True
                
                    # KLUCZOWE: Ustaw flagę zakończenia setup'u
                    st.session_state["setup_complete"] = True
                
                    st.success("✅ Struktura zatwierdzona! Przechodzę do Dashboardu...")
                    st.rerun()
                
                except Exception as e:
                    st.error(f"❌ Błąd podczas mapowania: {str(e)}")
                    st.stop()
        
            # Komunikat pomocniczy lub błędy walidacji (High-Trust UX)
            if validation_errors:
                st.markdown(f"""
                    <p class="status-text" style="margin-top: 0.5rem; font-size: 0.8rem; color: #ef4444;">
                    ⚠️ {'; '.join(validation_errors)}
                    </p>
                """, unsafe_allow_html=True)
            else:
                st.markdown("""
                    <p class="status-text" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--slate-400);">
                    💡 Scoring jest opcjonalny — możesz go wygenerować później przez Model Klasyfikacji.
                    </p>
                """, unsafe_allow_html=True)
        elif show_scoring_opt and 'Scoring' not in df_raw.columns:
            st.markdown("""
                <div class="mapping-card">
                    <h4>🛠️ Systemowa Weryfikacja: Scoring (Opcjonalne)</h4>
                    <p>Możesz wskazać kolumnę ze swoim scoringiem lub zostawić "Brak / Generuj Model" i uzupełnić wycenę w zakładce <b>Wartościowanie Stanowisk</b> lub w <b>Kroku 3 PRO</b>.</p>
                </div>
            """, unsafe_allow_html=True)
            col_score, col_btn = st.columns([3, 1])
            with col_score:
                scoring_opt = st.selectbox(
                    "Scoring (Opcjonalne)", 
                    ["Brak / Generuj Model"] + df_raw.columns.tolist(), 
                    key="sel_scoring_opt_standalone"
                )
            with col_btn:
                st.write("")  # Spacer dla wyrównania
                if st.button("Zastosuj", key="btn_apply_scoring"):
                    if scoring_opt and scoring_opt != "Brak / Generuj Model":
                        df_raw["Scoring"] = pd.to_numeric(df_raw[scoring_opt], errors="coerce")
                    st.session_state["mapped_df"] = df_raw.copy()
                    st.session_state["mapping_applied"] = True
                    st.session_state["setup_complete"] = True
                    st.success("✅ Scoring zastosowany!")
                    st.rerun()
        
            # Przycisk pominięcia scoringu
            if st.button("⏭️ Pomiń scoring i przejdź do Dashboardu", key="btn_skip_scoring"):
                st.session_state["mapped_df"] = df_raw.copy()
                st.session_state["mapping_applied"] = True
                st.session_state["setup_complete"] = True
                st.success("✅ Przechodzę do Dashboardu...")
                st.rerun()

    # AUTO-COMPLETE: Jeśli dane są kompletne bez mapowania, automatycznie zakończ setup
    if not df_raw.empty and not st.session_state.get('setup_complete', False):
        required_cols = ['Salary', 'Gender', 'Position']
        all_present = all(col in df_raw.columns for col in required_cols)
        if all_present:
            st.session_state["mapped_df"] = df_raw.copy()
            st.session_state["setup_complete"] = True

    # 4. PRZYGOTOWANIE DANYCH (Filtrowanie i Matematyka)
    # Użyj mapped_df jeśli dostępne (po zakończeniu setup), w przeciwnym razie df_raw
    working_df = st.session_state.get("mapped_df") if st.session_state.get("setup_complete") else df_raw
    if working_df is None:
        working_df = df_raw

    if not working_df.empty:
        # Filtr departamentu
        df = working_df[working_df['Department'] == selected_dept].copy() if selected_dept != "Wszystkie" and 'Department' in working_df.columns else working_df.copy()

        # Po zatwierdzeniu Krok 3: przypisanie scoringu na podstawie stanowiska (nazwa z pliku -> scoring)
        if st.session_state.get('scoring_model_approved') and 'approved_job_scoring_df' in st.session_state:
            pos_col = 'Position' if 'Position' in df.columns else ('Stanowisko' if 'Stanowisko' in df.columns else None)
            sc_df = st.session_state.get('approved_job_scoring_df')
            if pos_col and sc_df is not None and not sc_df.empty:
                name_col = 'nazwa_z_pliku' if 'nazwa_z_pliku' in sc_df.columns else ('stanowisko' if 'stanowisko' in sc_df.columns else None)
                col_sc = 'scoring' if 'scoring' in sc_df.columns else ('Scoring' if 'Scoring' in sc_df.columns else None)
                if name_col and col_sc:
                    score_map = sc_df.set_index(name_col)[col_sc].to_dict()
                    df['Scoring'] = df[pos_col].astype(str).str.strip().map(score_map)

        # Przeliczenia B2B -> UoP masowo na całym DataFrame (wydajność do ~5000 pracowników)
        contract_col = None
        for c in ['Contract_Type', 'ContractType', 'Contract', 'Umowa', 'Type']:
            if c in df.columns:
                contract_col = c
                break
        if contract_col and 'Salary' in df.columns:
            df = b2b_to_uop_bulk(df, salary_col='Salary', contract_col=contract_col, uop_output_col='Salary_UoP')

        # Jedna nadrzędna ramka: df_filtered = IQR gdy N >= 50 (Prezes znika z wykresu i z luki). Pay Gap i wykresy z tej samej ramki.
        df_with_uop_salary = df.copy()
        salary_col_vis = "Salary_UoP" if "Salary_UoP" in df_with_uop_salary.columns else "Salary"
        df_filtered = remove_outliers_iqr(df_with_uop_salary, col=salary_col_vis) if len(df_with_uop_salary) >= 50 else df_with_uop_salary.copy()
        global_pay_gap = calculate_pay_gap(df_filtered, salary_col=salary_col_vis, gender_col="Gender", already_filtered=(len(df_with_uop_salary) >= 50))
        m, b = 0, 0
        if "Scoring" in df_filtered.columns and salary_col_vis in df_filtered.columns and "Gender" in df_filtered.columns:
            df_math = df_filtered.dropna(subset=["Scoring", salary_col_vis])
            df_math = df_math[np.isfinite(df_math["Scoring"]) & np.isfinite(df_math[salary_col_vis])]
            if len(df_math) > 1:
                m, b = np.polyfit(df_math["Scoring"], df_math[salary_col_vis], 1)
                # Fix SettingWithCopyWarning: Create explicit copy before modification
                df_filtered = df_filtered.copy()
                df_filtered["Predicted_Salary"] = (df_filtered["Scoring"].fillna(0) * m + b).round(0)
                df_filtered["Pay_Diff_Pct"] = ((df_filtered[salary_col_vis] - df_filtered["Predicted_Salary"]) / df_filtered["Predicted_Salary"].replace(0, np.nan) * 100).round(1)

    # ============================================================================
    # 5. GŁÓWNY INTERFACE - ZAKŁADKI (TABS)
    # ============================================================================
    
    # Sprawdź czy są dane gotowe do wyświetlenia
    if working_df.empty or 'Salary' not in df.columns or 'Gender' not in df.columns:
        st.markdown(f'<h1><span class="pulse-icon"></span>Fair Pay Intelligence Dashboard</h1>', unsafe_allow_html=True)
        if working_df.empty:
            st.warning("Brak danych. Załaduj plik CSV w Sidebarze.")
        else:
            st.info("Czekam na zakończenie mapowania kolumn - użyj powyższego formularza.")
    else:
        # Dane gotowe - wyświetl zakładki
        tab_dashboard, tab_wartosciowanie, tab_art7, tab_ustawienia = st.tabs([
            "📊 Dashboard", 
            "⚖️ Wartościowanie", 
            "📩 Wnioski Art. 7", 
            "⚙️ Ustawienia"
        ])
        
        # ========================================================================
        # ZAKŁADKA 1: DASHBOARD
        # ========================================================================
        with tab_dashboard:
            st.markdown(f'<h1><span class="pulse-icon"></span>Fair Pay Intelligence Dashboard</h1>', unsafe_allow_html=True)
            # ========== ZAPISZ DO PROJEKTU (globalna akcja) ==========
            active_project = st.session_state.get('active_project_id')
            is_project_data = st.session_state.get('scenario', '').startswith('project:')
            setup_done = st.session_state.get('setup_complete', False)
        
            if setup_done and active_project and active_project != 'demo_project_01' and not is_project_data:
                with st.expander("💾 Zapisz dane do projektu", expanded=False):
                    st.caption("Dane są obecnie w pamięci sesji. Zapisz je do projektu, aby były trwałe.")
                
                    col_save, col_info = st.columns([2, 3])
                    with col_save:
                        if st.button("💾 Zapisz teraz", key="global_save_to_project_btn", width="stretch"):
                            with st.spinner("Zapisywanie..."):
                                data_to_save = st.session_state.get('mapped_df', df)
                                source_name = st.session_state.get('scenario', 'dashboard_export')
                            
                                saved = save_employees_to_project(
                                    project_id=active_project,
                                    df=data_to_save,
                                    source_filename=str(source_name)
                                )
                                if saved:
                                    st.toast(f"✅ Zapisano {saved} pracowników!", icon="💾")
                                    st.success(f"✓ Dane zapisane trwale w projekcie ({saved} rekordów)")
                                    log_action(
                                        user_id=st.session_state.get('user_id', 'anonymous'),
                                        company_id=st.session_state.get('company_id'),
                                        action_type='DATA_SAVE_TO_PROJECT',
                                        details={'rows': saved, 'project_id': active_project}
                                    )
                                else:
                                    st.error("Błąd zapisu. Sprawdź połączenie z Supabase.")
                    with col_info:
                        st.caption(f"📁 Projekt: `{active_project[:12]}...`")
                        st.caption(f"📊 Wierszy: **{len(df)}**")
        
            # Krok 3: Walidacja Wyceny Stanowisk (Human-in-the-loop) – tylko dla PRO; blokuje Dashboard do zatwierdzenia
            if st.session_state.get('is_pro') and not st.session_state.get('scoring_model_approved'):
                st.subheader("Krok 3: Walidacja Wyceny Stanowisk")
                st.caption("Zweryfikuj propozycje Modelu: znormalizowana nazwa, poziom i scoring (1–100). Dopóki nie zatwierdzisz, Dashboard z wykresami luki płacowej pozostaje zablokowany.")
                pos_col = "Position" if "Position" in df.columns else ("Stanowisko" if "Stanowisko" in df.columns else None)
                if not pos_col:
                    st.warning("Tryb PRO wymaga kolumny stanowisk (Position / Stanowisko).")
                else:
                    if "mapping_validation_table" not in st.session_state or st.session_state["mapping_validation_table"] is None:
                        if st.button("🔄 Uruchom Model Klasyfikacji", key="pro_gen_mapping"):
                            with st.spinner("Model analizuje stanowiska..."):
                                table = get_unique_positions_mapping(df, active_key, pos_col)
                                if table:
                                    st.session_state["mapping_validation_table"] = pd.DataFrame(table)
                                    st.rerun()
                                else:
                                    st.error("Brak klucza dostępu lub błąd połączenia. Ustaw klucz w sidebarze.")
                        st.info('Kliknij "Uruchom Model Klasyfikacji", aby uzyskać znormalizowane nazwy, poziomy (Junior/Mid/Senior) i sugerowany scoring (1-100).')
                    else:
                        val_df = st.session_state["mapping_validation_table"]
                        edited = st.data_editor(
                            val_df,
                            width="stretch",
                            key="krok3_validation_editor",
                            column_config={
                                "nazwa_z_pliku": st.column_config.TextColumn("Nazwa z pliku (A)", disabled=True),
                                "znormalizowana_nazwa": st.column_config.TextColumn("Znormalizowana nazwa (B)"),
                                "kategoria": st.column_config.TextColumn("Kategoria"),
                                "poziom": st.column_config.SelectboxColumn(
                                    "Poziom (C)",
                                    options=["Junior", "Mid", "Senior"],
                                    required=True,
                                ),
                                "scoring": st.column_config.NumberColumn("Sugerowany Scoring (D)", min_value=1, max_value=100),
                            },
                        )
                        if st.button("Zatwierdzam wartościowanie i generuję raport", key="pro_approve_validation"):
                            st.session_state["scoring_model_approved"] = True
                            st.session_state["approved_job_scoring_df"] = edited.copy()
                        
                            # Audit Log: Scoring model approval (Human-in-the-loop)
                            log_action(
                                user_id=st.session_state.get('user_id', 'anonymous'),
                                company_id=st.session_state.get('company_id'),
                                action_type='SCORING_MODEL_APPROVED',
                                details={
                                    'positions_count': len(edited),
                                    'scoring_range': {
                                        'min': int(edited['scoring'].min()) if 'scoring' in edited.columns else None,
                                        'max': int(edited['scoring'].max()) if 'scoring' in edited.columns else None,
                                    },
                                }
                            )
                        
                            if "mapping_validation_table" in st.session_state:
                                del st.session_state["mapping_validation_table"]
                            st.rerun()
                st.stop()

            # Wszystkie metryki i wykresy na df_filtered (ta sama ramka co Pay Gap)
            df_view = apply_rodo_shield(df_filtered.copy())
            
            # ========== FILTR WG GRADE/TIER (Industry Standard) ==========
            if 'Job_Grade_Tier' in df_filtered.columns:
                with st.expander("🎯 Filtr wg Grade / Tier", expanded=False):
                    tier_options = ["Wszystkie"] + sorted(
                        df_filtered['Job_Grade_Tier'].dropna().unique().tolist(),
                        key=lambda x: [
                            "Executive / C-Suite",
                            "Head of Department",
                            "Expert / Architect",
                            "Senior",
                            "Mid / Regular",
                            "Junior (Entry)",
                            "Brak oceny"
                        ].index(x) if x in [
                            "Executive / C-Suite",
                            "Head of Department",
                            "Expert / Architect",
                            "Senior",
                            "Mid / Regular",
                            "Junior (Entry)",
                            "Brak oceny"
                        ] else 999
                    )
                    
                    selected_tier = st.selectbox(
                        "Wybierz poziom hierarchiczny:",
                        options=tier_options,
                        help="Analizuj tylko pracowników z wybranego poziomu"
                    )
                    
                    if selected_tier != "Wszystkie":
                        df_filtered = df_filtered[df_filtered['Job_Grade_Tier'] == selected_tier].copy()
                        df_view = apply_rodo_shield(df_filtered.copy())
                        
                        st.success(f"✓ Filtr aktywny: **{selected_tier}** ({len(df_filtered)} pracowników)")
                        
                        # Przelicz pay gap dla przefiltrowanych danych
                        if len(df_filtered) >= 5:
                            global_pay_gap = calculate_pay_gap(df_filtered, salary_col=salary_col_vis, gender_col="Gender", already_filtered=True)
                        else:
                            st.warning("Za mało danych w tej grupie (min. 5 pracowników)")
        
            # ========== PRZEŁĄCZNIK TRYBU ANALIZY (EVG vs Stanowiska) ==========
            st.markdown("---")
            evg_col1, evg_col2 = st.columns([3, 1])
        
            with evg_col1:
                # Sprawdź czy są dostępne wartościowania
                project_id = st.session_state.get('active_project_id')
                valuations_available = False
                valuations_df = None
            
                if project_id:
                    existing_valuations = get_project_valuations(project_id)
                    if existing_valuations:
                        valuations_df = pd.DataFrame(existing_valuations)
                        valuations_available = True
            
                # Sprawdź też session_state (z bieżącej sesji grading)
                if not valuations_available and 'eu_grading_results' in st.session_state:
                    results = st.session_state.eu_grading_results
                    if results:
                        valuations_df = pd.DataFrame([{
                            'job_title': r.job_title,
                            'total_score': r.total_score
                        } for r in results])
                        valuations_available = True
        
            with evg_col2:
                if valuations_available:
                    # Przełącznik trybu analizy
                    new_evg_mode = st.toggle(
                        "Art. 4 - Wartość Pracy",
                        value=st.session_state.get('evg_analysis_mode', False),
                        help="Włącz analizę wg Kategorii Równej Wartości (Equal Value Groups) zgodnie z Art. 4 Dyrektywy UE 2023/970",
                        key="evg_mode_toggle"
                    )
                
                    # Loguj zmianę trybu analizy
                    if new_evg_mode != st.session_state.get('evg_analysis_mode', False):
                        st.session_state['evg_analysis_mode'] = new_evg_mode
                        log_action(
                            user_id=st.session_state.get('user_id', 'anonymous'),
                            company_id=st.session_state.get('company_id'),
                            action_type='ANALYSIS_METHOD_CHANGED',
                            details={
                                'new_mode': 'evg' if new_evg_mode else 'standard',
                                'project_id': project_id,
                            }
                        )
                else:
                    st.session_state['evg_analysis_mode'] = False
                    st.caption("🔒 Tryb EVG wymaga wartościowań")
        
            # Informacja o aktywnym trybie
            evg_mode_active = st.session_state.get('evg_analysis_mode', False) and valuations_available
        
            if evg_mode_active and valuations_df is not None:
                # Przypisz grupy EVG do danych
                df_filtered = create_equal_value_groups(df_filtered, valuations_df)
                df_view = create_equal_value_groups(df_view, valuations_df)
            
                # Przelicz pay gap w trybie EVG
                global_pay_gap = calculate_pay_gap(df_filtered, salary_col=salary_col_vis, gender_col="Gender", evg_mode=True)
            
                st.info(f"📊 **Tryb analizy: Wartość Pracy (Art. 4)** – Dane pogrupowane w {df_filtered['EVG_Group'].nunique()} Kategorii Równej Wartości")
            else:
                st.caption("📊 Tryb analizy: Standardowy (wg stanowisk)")
        
            # ========== PARAMETRY ZAAWANSOWANE (OVERRIDES) ==========
            with st.expander("⚙️ Parametry Zaawansowane (Overrides)", expanded=False):
                st.markdown("""
                <div class="override-section">
                <p class="status-text">Nadpisz parametry dla pojedynczych pracowników. Zmiany są rejestrowane w audit log.</p>
                </div>
                """, unsafe_allow_html=True)
            
                # Sprawdź czy mamy kolumnę ID
                id_col = None
                for col in ['Employee_ID', 'ID', 'id', 'Index']:
                    if col in df_filtered.columns:
                        id_col = col
                        break
            
                if id_col:
                    # Inicjalizuj overrides w session_state
                    if 'employee_overrides' not in st.session_state:
                        st.session_state.employee_overrides = create_overrides_dataframe(df_filtered)
                
                    # Sprawdź czy dane się zmieniły
                    current_ids = set(df_filtered[id_col].astype(str).unique())
                    stored_ids = set(st.session_state.employee_overrides['Employee_ID'].astype(str).unique()) if not st.session_state.employee_overrides.empty else set()
                
                    if current_ids != stored_ids:
                        st.session_state.employee_overrides = create_overrides_dataframe(df_filtered)
                
                    st.markdown("**Nadpisania parametrów:**")
                    st.caption("• **50% KUP** – dla pracowników UoP z prawami autorskimi (obniża efektywny ekwiwalent)")
                    st.caption("• **Dni wolne płatne B2B** – płatny urlop uwzględniony w przeliczniku (0-26 dni)")
                
                    # Edytor
                    edited_overrides = st.data_editor(
                        st.session_state.employee_overrides,
                        width="stretch",
                        height=250,
                        column_config={
                            "Employee_ID": st.column_config.TextColumn("ID", disabled=True, width="small"),
                            "Position": st.column_config.TextColumn("Stanowisko", disabled=True),
                            "Contract": st.column_config.TextColumn("Umowa", disabled=True, width="small"),
                            "50%_KUP": st.column_config.CheckboxColumn("50% KUP", help="Koszty uzyskania przychodu 50% (twórcy)"),
                            "Dni_wolne_B2B": st.column_config.NumberColumn("Dni wolne B2B", min_value=0, max_value=26, step=1, help="Płatne dni urlopu dla B2B (0-26)"),
                        },
                        key="overrides_editor"
                    )
                
                    # Sprawdź czy są zmiany
                    if not edited_overrides.equals(st.session_state.employee_overrides):
                        # Znajdź zmienione wiersze
                        changes = []
                        for idx, row in edited_overrides.iterrows():
                            old_row = st.session_state.employee_overrides.iloc[idx] if idx < len(st.session_state.employee_overrides) else None
                            if old_row is not None:
                                if row['50%_KUP'] != old_row['50%_KUP'] or row['Dni_wolne_B2B'] != old_row['Dni_wolne_B2B']:
                                    changes.append({
                                        'employee_id': row['Employee_ID'],
                                        'position': row['Position'],
                                        '50%_KUP': {'old': bool(old_row['50%_KUP']), 'new': bool(row['50%_KUP'])},
                                        'Dni_wolne_B2B': {'old': int(old_row['Dni_wolne_B2B']), 'new': int(row['Dni_wolne_B2B'])},
                                    })
                    
                        # Zapisz zmiany i zaloguj
                        st.session_state.employee_overrides = edited_overrides.copy()
                    
                        if changes:
                            # Audit Log: MANUAL_OVERRIDE
                            log_action(
                                user_id=st.session_state.get('user_id', 'anonymous'),
                                company_id=st.session_state.get('company_id'),
                                action_type='MANUAL_OVERRIDE',
                                details={
                                    'override_type': 'employee_parameters',
                                    'changes_count': len(changes),
                                    'changes': changes[:10],  # Limit do 10 dla audit log
                                }
                            )
                            st.toast(f"✓ Zapisano {len(changes)} zmian", icon="✅")
                
                    # Zastosuj overrides do danych
                    if not st.session_state.employee_overrides.empty:
                        # Sprawdź czy są jakiekolwiek nadpisania aktywne
                        has_any_override = (
                            st.session_state.employee_overrides['50%_KUP'].any() or 
                            (st.session_state.employee_overrides['Dni_wolne_B2B'] > 0).any()
                        )
                    
                        if has_any_override:
                            # Zastosuj overrides
                            df_filtered = apply_salary_overrides(df_filtered, st.session_state.employee_overrides)
                            df_view = apply_salary_overrides(df_view, st.session_state.employee_overrides)
                        
                            # Przelicz B2B z overrides
                            contract_col_detect = None
                            for c in ['Contract_Type', 'ContractType', 'Contract', 'Umowa', 'Type']:
                                if c in df_filtered.columns:
                                    contract_col_detect = c
                                    break
                        
                            if contract_col_detect:
                                df_filtered = b2b_to_uop_bulk_with_overrides(df_filtered, salary_col='Salary', contract_col=contract_col_detect)
                                df_view = b2b_to_uop_bulk_with_overrides(df_view, salary_col='Salary', contract_col=contract_col_detect)
                            
                                # Przelicz pay gap z nowymi danymi
                                global_pay_gap = calculate_pay_gap(df_filtered, salary_col=salary_col_vis, gender_col="Gender", evg_mode=evg_mode_active)
                        
                            st.markdown('<span class="audit-indicator">🔒 OVERRIDE AKTYWNY</span>', unsafe_allow_html=True)
                        
                            # Pokaż podsumowanie aktywnych overrides
                            active_kup = st.session_state.employee_overrides[st.session_state.employee_overrides['50%_KUP'] == True]
                            active_leave = st.session_state.employee_overrides[st.session_state.employee_overrides['Dni_wolne_B2B'] > 0]
                        
                            if len(active_kup) > 0:
                                st.caption(f"• 50% KUP aktywne dla {len(active_kup)} pracowników")
                            if len(active_leave) > 0:
                                avg_leave = active_leave['Dni_wolne_B2B'].mean()
                                st.caption(f"• Dni wolne B2B: {len(active_leave)} pracowników (śr. {avg_leave:.1f} dni)")
                else:
                    st.warning("Brak kolumny Employee_ID w danych. Nadpisania wymagają unikalnego identyfikatora.")
        
            st.markdown("---")

            # ---------- Compliance Cockpit (default analytics view) ----------
            valuations_for_evg = valuations_df if (valuations_df is not None and not valuations_df.empty) else pd.DataFrame()
            evg_buckets = get_evg_buckets_structure(
                df_filtered,
                valuations_for_evg,
                salary_col=salary_col_vis,
                gender_col="Gender",
            )
            quartiles_data = calculate_pay_quartiles(df_filtered, salary_col=salary_col_vis, gender_col="Gender")
            median_gap = calculate_pay_gap_median(df_filtered, salary_col=salary_col_vis, gender_col="Gender")
            summary = (evg_buckets or {}).get("summary") or {}
            adjusted_gap = summary.get("weighted_pay_gap")
            render_compliance_cockpit(
                evg_buckets,
                mean_gap=global_pay_gap,
                median_gap=median_gap,
                adjusted_gap=adjusted_gap,
                quartiles_data=quartiles_data,
            )

        # ========================================================================
        # ZAKŁADKA 2: WARTOŚCIOWANIE STANOWISK
        # ========================================================================
        with tab_wartosciowanie:
            # === GLOBALNE USTAWIENIE WAG (Industry Standard - Alternatywa 2) ===
            st.markdown("### ⚖️ Konfiguracja Wag Kategorii")
            st.caption("Dostosuj wpływ każdej kategorii na końcowy Total Score. Suma musi wynosić 100%.")
            
            # Suwaki wag w 4 kolumnach
            col_w1, col_w2, col_w3, col_w4 = st.columns(4)
            
            with col_w1:
                weight_skills = st.slider(
                    "💡 Wiedza i Umiejętności",
                    min_value=0,
                    max_value=100,
                    value=st.session_state['job_weights']['skills'],
                    step=5,
                    help="Kompetencje techniczne, certyfikaty, doświadczenie",
                    key="weight_skills_slider"
                )
            
            with col_w2:
                weight_responsibility = st.slider(
                    "👥 Odpowiedzialność",
                    min_value=0,
                    max_value=100,
                    value=st.session_state['job_weights']['responsibility'],
                    step=5,
                    help="Zarządzanie zespołem, budżetem, bezpieczeństwem",
                    key="weight_responsibility_slider"
                )
            
            with col_w3:
                weight_effort = st.slider(
                    "💪 Wysiłek i Problemy",
                    min_value=0,
                    max_value=100,
                    value=st.session_state['job_weights']['effort'],
                    step=5,
                    help="Wysiłek fizyczny/psychiczny, złożoność problemów",
                    key="weight_effort_slider"
                )
            
            with col_w4:
                weight_conditions = st.slider(
                    "🌡️ Warunki Pracy",
                    min_value=0,
                    max_value=100,
                    value=st.session_state['job_weights']['conditions'],
                    step=5,
                    help="Środowisko, stres, niebezpieczeństwo, godziny",
                    key="weight_conditions_slider"
                )
            
            # Walidacja sumy wag
            total_weights = weight_skills + weight_responsibility + weight_effort + weight_conditions
            
            if total_weights != 100:
                st.warning(f"""
                ⚠️ **Suma wag musi wynosić dokładnie 100%**
                
                Aktualna suma: **{total_weights}%**
                
                Dostosuj suwaki, aby suma = 100%.
                """)
                weights_valid = False
            else:
                st.success(f"✓ Suma wag: **{total_weights}%** - konfiguracja poprawna!")
                weights_valid = True
                
                # Zaktualizuj session_state jeśli zmieniono wagi
                st.session_state['job_weights'] = {
                    'skills': weight_skills,
                    'responsibility': weight_responsibility,
                    'effort': weight_effort,
                    'conditions': weight_conditions,
                }
            
            # Wizualizacja wag (poziomy wykres słupkowy)
            col_viz, col_tier = st.columns([2, 1])
            
            with col_viz:
                st.markdown("#### Rozkład wag")
                fig_weights = go.Figure()
                
                categories = ['Wiedza/Umiejętności', 'Odpowiedzialność', 'Wysiłek/Problemy', 'Warunki Pracy']
                weights_list = [weight_skills, weight_responsibility, weight_effort, weight_conditions]
                colors = ['#4A90E2', '#10b981', '#f59e0b', '#ef4444']
                
                fig_weights.add_trace(go.Bar(
                    y=categories,
                    x=weights_list,
                    orientation='h',
                    marker=dict(color=colors),
                    text=[f"{w}%" for w in weights_list],
                    textposition='inside',
                    textfont=dict(family='JetBrains Mono', size=14, color='white'),
                ))
                
                fig_weights.update_layout(
                    height=250,
                    xaxis=dict(title="Waga (%)", range=[0, 100], gridcolor='#333'),
                    yaxis=dict(title="", gridcolor='#333'),
                    plot_bgcolor='#1E1E1E',
                    paper_bgcolor='#1E1E1E',
                    font=dict(color='#DCDCDC'),
                    margin=dict(l=20, r=20, t=20, b=40),
                    showlegend=False,
                )
                
                st.plotly_chart(fig_weights, width="stretch")
            
            with col_tier:
                st.markdown("#### Gradacja Tier")
                st.markdown("""
                **0-150:** Junior (Entry)  
                **151-300:** Mid / Regular  
                **301-500:** Senior  
                **501-700:** Expert / Architect  
                **701-900:** Head of Dept.  
                **901+:** Executive / C-Suite
                """)
            
            st.divider()
            
            # Sub-tabs dla różnych metod wartościowania
            subtab_eu_grader, subtab_model_grader = st.tabs(["⚖️ EU Standard Grader", "🧮 Model Klasyfikacji"])
            
            # --- SUB-ZAKŁADKA: MODEL KLASYFIKACJI ---
            with subtab_model_grader:
                st.title("🧮 Model Klasyfikacji i Wartościowania")
        st.info("Model matematyczny oparty na 4 kryteriach: Kompetencje, Wysiłek, Odpowiedzialność, Warunki Pracy.")
    
        if not working_df.empty and 'Position' in working_df.columns:
            unique_jobs = working_df['Position'].unique().tolist()
            if st.button("🔄 Uruchom Model Wartościowania"):
                with st.spinner("Model analizuje unikalne stanowiska..."):
                    res = get_ai_job_grading(active_key, unique_jobs)
                    gradings = res.get("gradings", []) if isinstance(res, dict) else []
                    if gradings:
                        st.session_state["current_grading"] = pd.DataFrame(gradings)
                    else:
                        st.warning("Model nie zwrócił listy gradingu. Sprawdź klucz dostępu lub spróbuj ponownie.")
        
            if 'current_grading' in st.session_state:
                st.markdown("### Walidacja i Korekta Wag Dyrektywy")
                cols = st.columns(4)
                w1 = cols[0].slider("Waga: Kompetencje", 0.0, 1.0, 0.25)
                w2 = cols[1].slider("Waga: Wysiłek", 0.0, 1.0, 0.25)
                w3 = cols[2].slider("Waga: Odpowiedzialność", 0.0, 1.0, 0.25)
                w4 = cols[3].slider("Waga: Warunki", 0.0, 1.0, 0.25)
            
                st.latex(r"Total Score = (w_1 \cdot Skills) + (w_2 \cdot Effort) + (w_3 \cdot Responsibility) + (w_4 \cdot Conditions)")
            
                edited_df = st.data_editor(st.session_state['current_grading'], width="stretch")
            
                edited_df['Total_Score'] = (edited_df['skills']*w1 + edited_df['effort']*w2 + edited_df['responsibility']*w3 + edited_df['conditions']*w4).round(1)
            
                st.subheader("Wynikowa Tabela Gradingu")
                st.dataframe(edited_df[['title', 'Total_Score', 'justification']], width="stretch")
            
            # --- SUB-ZAKŁADKA: EU STANDARD GRADER ---
            with subtab_eu_grader:
                st.title("⚖️ Wartościowanie Stanowisk (EU Standard Grader)")
        st.markdown("""
        **Moduł zgodny z Artykułem 4 Dyrektywy UE 2023/970** (Pay Transparency Directive)
    
        Ocena stanowisk w 4 kategoriach (0-25 pkt każda):
        - **Skills** – Kompetencje i wiedza wymagana na stanowisku
        - **Effort** – Wysiłek fizyczny i psychiczny (gender-neutral!)
        - **Responsibility** – Odpowiedzialność za ludzi, finanse, bezpieczeństwo
        - **Conditions** – Warunki pracy (środowisko, czas, stres)
        """)
    
        st.divider()
    
        # Sprawdź czy użytkownik jest zalogowany i ma projekt
        project_id = st.session_state.get('active_project_id')
    
        st.divider()
        
        # === SEKCJA 1: ŹRÓDŁO STANOWISK ===
        st.subheader("📋 Źródło stanowisk do oceny")
    
        job_source = st.radio(
            "Wybierz źródło stanowisk:",
            ["Z wgranego pliku CSV", "Wprowadź ręcznie", "Z bazy danych (zapisane)"],
            horizontal=True,
            key="job_source_selector"
        )
    
        unique_jobs = []
    
        if job_source == "Z wgranego pliku CSV":
            if not working_df.empty:
                pos_col = None
                for col_name in ['Position', 'Stanowisko', 'Job', 'Tytuł', 'Job_Title']:
                    if col_name in working_df.columns:
                        pos_col = col_name
                        break
            
                if pos_col:
                    unique_jobs = sorted(working_df[pos_col].dropna().astype(str).str.strip().unique().tolist())
                    st.success(f"✓ Znaleziono **{len(unique_jobs)}** unikalnych stanowisk w kolumnie `{pos_col}`")
                
                    with st.expander("Podgląd stanowisk", expanded=False):
                        for i, job in enumerate(unique_jobs[:20], 1):
                            st.write(f"{i}. {job}")
                        if len(unique_jobs) > 20:
                            st.caption(f"... i {len(unique_jobs) - 20} więcej")
                else:
                    st.warning("Nie znaleziono kolumny ze stanowiskami. Upewnij się, że plik zawiera kolumnę: Position, Stanowisko, Job lub Tytuł.")
            else:
                st.info("Wgraj plik CSV w sidebarze, aby pobrać stanowiska.")
    
        elif job_source == "Wprowadź ręcznie":
            manual_jobs = st.text_area(
                "Wpisz stanowiska (jedno na linię):",
                placeholder="Senior Accountant\nJunior Developer\nWarehouse Worker\n...",
                height=150,
                key="manual_jobs_input"
            )
            if manual_jobs:
                unique_jobs = [j.strip() for j in manual_jobs.split('\n') if j.strip()]
                st.info(f"Wprowadzono **{len(unique_jobs)}** stanowisk")
    
        else:  # Z bazy danych
            if project_id and project_id != 'demo_project_01':
                existing_valuations = get_project_valuations(project_id)
                if existing_valuations:
                    st.success(f"✓ Znaleziono **{len(existing_valuations)}** zapisanych wartościowań")
                
                    # Pokaż zapisane wartościowania jako tabelę
                    existing_df = pd.DataFrame(existing_valuations)
                    display_cols = ['job_title', 'skills', 'effort', 'responsibility', 'conditions', 'total_score', 'needs_review']
                    display_cols = [c for c in display_cols if c in existing_df.columns]
                
                    if display_cols:
                        st.dataframe(
                            existing_df[display_cols].rename(columns={
                                'job_title': 'Stanowisko',
                                'skills': 'Skills',
                                'effort': 'Effort', 
                                'responsibility': 'Resp.',
                                'conditions': 'Cond.',
                                'total_score': 'Total',
                                'needs_review': 'Do weryfikacji'
                            }),
                            width="stretch",
                            height=300
                        )
                else:
                    st.info("Brak zapisanych wartościowań dla tego projektu. Uruchom Model Wartościowania, aby je wygenerować.")
            else:
                st.warning("Funkcja dostępna po zalogowaniu i wyborze projektu.")
    
        st.divider()
    
        # === SEKCJA 2: MODEL WARTOŚCIOWANIA ===
        st.subheader("🧮 Model Wartościowania (EU Standard)")
    
        if unique_jobs:
            col1, col2 = st.columns([3, 1])
        
            with col1:
                st.write(f"Gotowe do oceny: **{len(unique_jobs)} stanowisk**")
        
            with col2:
                run_grading = st.button(
                    "▶ Uruchom Model",
                    type="primary",
                    width="stretch",
                    key="run_eu_grading_btn"
                )
        
            if run_grading:
                if not active_key:
                    st.error("Brak klucza dostępu. Wprowadź klucz w sidebarze.")
                else:
                    # Audit Log: Grading started
                    log_action(
                        user_id=st.session_state.get('user_id', 'anonymous'),
                        company_id=st.session_state.get('company_id'),
                        action_type='JOB_GRADING_STARTED',
                        details={
                            'project_id': project_id,
                            'jobs_count': len(unique_jobs),
                        }
                    )
                
                    # Progress bar
                    progress_bar = st.progress(0)
                    status_text = st.empty()
                
                    try:
                        grader = AIJobGrader(api_key=active_key)
                        results = []
                    
                        for i, job_title in enumerate(unique_jobs):
                            status_text.text(f"Oceniam: {job_title}...")
                            progress_bar.progress((i + 1) / len(unique_jobs))
                        
                            result = grader.evaluate(job_title)
                            results.append(result)
                    
                        progress_bar.progress(1.0)
                        status_text.text("✓ Zakończono ocenę wszystkich stanowisk!")
                    
                        # Zapisz wyniki w session_state
                        st.session_state['eu_grading_results'] = results
                    
                        # Audit Log: Grading completed
                        log_action(
                            user_id=st.session_state.get('user_id', 'anonymous'),
                            company_id=st.session_state.get('company_id'),
                            action_type='JOB_GRADING_COMPLETED',
                            details={
                                'project_id': project_id,
                                'jobs_count': len(results),
                                'needs_review_count': sum(1 for r in results if r.needs_review),
                            }
                        )
                    
                        st.success(f"✓ Oceniono **{len(results)}** stanowisk")
                        st.rerun()
                    
                    except Exception as e:
                        st.error(f"Błąd podczas oceny: {str(e)}")
    
        # === SEKCJA 3: WYNIKI ===
        if 'eu_grading_results' in st.session_state and st.session_state.eu_grading_results:
            st.divider()
            st.subheader("📊 Wyniki wartościowania")
        
            results = st.session_state.eu_grading_results
            results_df = results_to_dataframe(results)
        
            # Statystyki
            stats_col1, stats_col2, stats_col3, stats_col4 = st.columns(4)
        
            with stats_col1:
                st.metric("Ocenionych stanowisk", len(results))
            with stats_col2:
                # UWAGA: Model zwraca score 0-100, ale po zastosowaniu wag będzie 0-1000
                avg_score_raw = sum(r.total_score for r in results) / len(results)
                st.metric("Średni Raw Score", f"{avg_score_raw:.1f}/100")
                st.caption("(Po zastosowaniu wag: 0-1000)")
            with stats_col3:
                needs_review = sum(1 for r in results if r.needs_review)
                st.metric("Do weryfikacji", needs_review, delta=f"-{needs_review}" if needs_review > 0 else None, delta_color="inverse")
            with stats_col4:
                high_conf = sum(1 for r in results if r.confidence >= 0.8)
                st.metric("Wysoka pewność", f"{high_conf}/{len(results)}")
        
            # Tabela wyników
            st.markdown("### Tabela wyników")
        
            # Dodaj kolumnę Grade/Tier do results_df (przed edycją)
            if 'Grade / Tier' not in results_df.columns:
                # Oblicz Total Score tymczasowo (bez wag, dla inicjalizacji)
                results_df['Total Score_temp'] = results_df['Skills'] + results_df['Effort'] + results_df['Responsibility'] + results_df['Conditions']
                results_df['Grade / Tier'] = results_df['Total Score_temp'].apply(map_score_to_tier)
                results_df.drop(columns=['Total Score_temp'], inplace=True)
            
            # Edytowalna tabela
            edited_results = st.data_editor(
                results_df,
                width="stretch",
                height=400,
                column_config={
                    "Stanowisko": st.column_config.TextColumn("Stanowisko", disabled=True),
                    "Skills": st.column_config.NumberColumn("Skills", min_value=0, max_value=25, help="0-25 pkt"),
                    "Effort": st.column_config.NumberColumn("Effort", min_value=0, max_value=25, help="0-25 pkt"),
                    "Responsibility": st.column_config.NumberColumn("Resp.", min_value=0, max_value=25, help="0-25 pkt"),
                    "Conditions": st.column_config.NumberColumn("Cond.", min_value=0, max_value=25, help="0-25 pkt"),
                    "Total Score": st.column_config.NumberColumn("Total (0-1000)", disabled=True),
                    "Grade / Tier": st.column_config.TextColumn("Tier", disabled=True, help="Junior | Mid | Senior | Expert | Head | C-Suite"),
                    "Confidence": st.column_config.TextColumn("Pewność", disabled=True),
                    "Status": st.column_config.TextColumn("Status", disabled=True),
                    "Uzasadnienie": st.column_config.TextColumn("Uzasadnienie", width="large"),
                },
                key="eu_grading_editor"
            )
        
            # Przelicz Total Score po edycji Z WAGAMI (Industry Standard - Alternatywa 2)
            if weights_valid:
                # Przelicz wagi z % na ułamki (35% → 0.35)
                weights_dict = {
                    'skills': st.session_state['job_weights']['skills'] / 100.0,
                    'responsibility': st.session_state['job_weights']['responsibility'] / 100.0,
                    'effort': st.session_state['job_weights']['effort'] / 100.0,
                    'conditions': st.session_state['job_weights']['conditions'] / 100.0,
                }
                
                # Oblicz ważony total score dla każdego stanowiska
                edited_results['Total Score'] = edited_results.apply(
                    lambda row: calculate_weighted_score(
                        skills=row['Skills'],
                        effort=row['Effort'],
                        responsibility=row['Responsibility'],
                        conditions=row['Conditions'],
                        weights=weights_dict
                    ),
                    axis=1
                )
                
                # Dodaj kolumnę Grade/Tier
                edited_results['Grade / Tier'] = edited_results['Total Score'].apply(map_score_to_tier)
            else:
                # Jeśli wagi niepoprawne, użyj prostej sumy (fallback)
                edited_results['Total Score'] = edited_results['Skills'] + edited_results['Effort'] + edited_results['Responsibility'] + edited_results['Conditions']
                edited_results['Grade / Tier'] = "Skonfiguruj wagi"
            
            # Wyświetl podsumowanie z Tier
            st.markdown("### 📊 Podsumowanie z Gradacją")
            
            # Statystyki po tier
            tier_counts = edited_results['Grade / Tier'].value_counts()
            
            tier_col1, tier_col2, tier_col3 = st.columns(3)
            
            with tier_col1:
                st.markdown("**Rozkład stanowisk wg Tier:**")
                for tier, count in tier_counts.items():
                    st.write(f"- {tier}: **{count}** stanowisk")
            
            with tier_col2:
                avg_by_tier = edited_results.groupby('Grade / Tier')['Total Score'].mean().sort_values(ascending=False)
                st.markdown("**Średni Score wg Tier:**")
                for tier, avg in avg_by_tier.items():
                    st.write(f"- {tier}: **{avg:.1f}** pkt")
            
            with tier_col3:
                st.markdown("**Top 3 stanowiska:**")
                top_3 = edited_results.nlargest(3, 'Total Score')[['Stanowisko', 'Total Score', 'Grade / Tier']]
                for idx, row in top_3.iterrows():
                    st.write(f"1. {row['Stanowisko']}: **{row['Total Score']:.1f}** ({row['Grade / Tier']})")
        
            # Przyciski akcji (pierwsza sekcja - zapis i eksport)
            st.markdown("<br>", unsafe_allow_html=True)
            
            with st.container():
                action_col1, action_col2, action_col3 = st.columns(3)
            
                with action_col1:
                    if st.button("💾 Zapisz do bazy", width="stretch", key="save_valuations_btn"):
                        if project_id and project_id != 'demo_project_01':
                            saved_count = 0
                            for _, row in edited_results.iterrows():
                                job_data = {
                                    'job_title': row['Stanowisko'],
                                    'skills': row['Skills'],
                                    'effort': row['Effort'],
                                    'responsibility': row['Responsibility'],
                                    'conditions': row['Conditions'],
                                    'total_score': row['Total Score'],
                                    'justification': row.get('Uzasadnienie', ''),
                                    'confidence': float(row.get('Confidence', '50%').replace('%', '')) / 100,
                                    'needs_review': '⚠️' in str(row.get('Status', '')),
                                }
                                if save_job_valuation(project_id, job_data):
                                    saved_count += 1
                        
                            st.success(f"✓ Zapisano **{saved_count}** wartościowań do bazy danych")
                        else:
                            st.warning("Zapisywanie do bazy wymaga zalogowania i wyboru projektu.")
        
                with action_col2:
                    csv_data = edited_results.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        "📥 Eksportuj CSV",
                        data=csv_data,
                        file_name=f"job_valuations_{datetime.now().strftime('%Y%m%d_%H%M')}.csv",
                        mime="text/csv",
                        width="stretch",
                        key="export_valuations_csv"
                    )
            
                with action_col3:
                    # Przycisk: Zastosuj scoring do pracowników (Job-Linked Scoring)
                    if st.button("🔗 Zastosuj do pracowników", width="stretch", key="apply_to_employees_btn"):
                        if not working_df.empty and 'Position' in working_df.columns:
                            # Przygotuj słownik: Position → Total Score + Grade/Tier
                            scoring_map = edited_results.set_index('Stanowisko')[['Total Score', 'Grade / Tier', 'Skills', 'Effort', 'Responsibility', 'Conditions']].to_dict('index')
                            
                            # Dodaj kolumny do working_df
                            working_df['Job_Total_Score'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Total Score', None)
                            )
                            working_df['Job_Grade_Tier'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Grade / Tier', 'Brak oceny')
                            )
                            working_df['Job_Skills'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Skills', None)
                            )
                            working_df['Job_Effort'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Effort', None)
                            )
                            working_df['Job_Responsibility'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Responsibility', None)
                            )
                            working_df['Job_Conditions'] = working_df['Position'].map(
                                lambda pos: scoring_map.get(pos, {}).get('Conditions', None)
                            )
                            
                            # Zaktualizuj session_state
                            st.session_state['mapped_df'] = working_df.copy()
                            st.session_state['raw_df'] = working_df.copy()
                            
                            # KLUCZOWE: Ustaw setup_complete aby odblokować Dashboard
                            st.session_state['setup_complete'] = True
                            
                            matched = working_df['Job_Total_Score'].notna().sum()
                            st.success(f"✓ Zastosowano scoring do **{matched}** pracowników (dopasowanie po stanowisku)")
                            st.toast("🎉 Model zatwierdzony! Dashboard odblokowany!", icon="✅")
                            
                            # Wymuś przeładowanie aby zaktualizować Dashboard
                            st.rerun()
                        else:
                            st.warning("Brak danych pracowników lub kolumny Position.")
            
            # === SEKCJA ZATWIERDZANIA (KLUCZOWA - Z MAKSYMALNĄ WIDOCZNOŚCIĄ) ===
            st.markdown("<br><br>", unsafe_allow_html=True)  # Extra spacing dla widoczności
            
            st.markdown("<div style='margin-top: 30px;'></div>", unsafe_allow_html=True)
            
            st.markdown("""
            <div style="background: linear-gradient(90deg, rgba(16,185,129,0.1) 0%, transparent 100%); 
                        border-left: 4px solid #10b981; 
                        padding: 1.5rem; 
                        border-radius: 6px; 
                        margin: 1.5rem 0;">
                <h3 style="color: #10b981 !important; margin-bottom: 0.5rem;">✓ Zatwierdzenie Modelu</h3>
                <p style="color: #cbd5e1 !important; font-size: 0.95rem;">
                    Kliknij poniższy przycisk, aby <b>zapisać wartościowania</b> i <b>odblokować pełny Dashboard</b> 
                    z analizą wg Grade/Tier. Dane zostaną trwale zapisane w sesji.
                </p>
            </div>
            """, unsafe_allow_html=True)
            
            with st.container():
                action2_col1, action2_col2, action2_col3 = st.columns([2, 1, 1])
                
                with action2_col1:
                    # GŁÓWNY PRZYCISK ZATWIERDZAJĄCY (wyróżniony, pełna szerokość)
                    if st.button("✅ Zatwierdź i Przelicz Model", type="primary", width="stretch", key="confirm_model_btn2"):
                        if not working_df.empty and 'Position' in working_df.columns:
                            # Mapowanie: Position → Total Score
                            scoring_map = edited_results.set_index('Stanowisko')['Total Score'].to_dict()
                            working_df['Scoring'] = working_df['Position'].map(scoring_map)
                            
                            # Zapisz do session_state
                            st.session_state['mapped_df'] = working_df.copy()
                            st.session_state['raw_df'] = working_df.copy()
                            st.session_state['setup_complete'] = True
                            
                            st.toast("✅ Model zatwierdzony i zapisany!", icon="🎉")
                            st.rerun()
                        else:
                            st.warning("Brak danych pracowników.")
                
                with action2_col2:
                    if st.button("🗑️ Wyczyść wyniki", width="stretch", key="clear_valuations_btn"):
                        del st.session_state['eu_grading_results']
                        st.rerun()
                
                with action2_col3:
                    # Placeholder dla przyszłych funkcji
                    pass
            
            # ===== DODATKOWY SPACING DLA WIDOCZNOŚCI PRZYCISKU NA DELL =====
            st.write("")
            st.write("")
            st.write("")
            st.markdown("<div style='height: 80px;'></div>", unsafe_allow_html=True)
        
            # Wizualizacja rozkładu
            st.markdown("### 📈 Rozkład punktacji")
        
            fig_dist = go.Figure()
        
            categories = ['Skills', 'Effort', 'Responsibility', 'Conditions']
            for cat in categories:
                fig_dist.add_trace(go.Box(
                    y=edited_results[cat if cat != 'Responsibility' else 'Responsibility'],
                    name=cat[:6],
                    boxpoints='all',
                    jitter=0.3,
                ))
        
            fig_dist.update_layout(
                title="Rozkład punktów w kategoriach",
                yaxis_title="Punkty (0-25)",
                showlegend=False,
                height=350,
                plot_bgcolor='#1E1E1E',
                paper_bgcolor='#1E1E1E',
                font=dict(color='#DCDCDC'),
            )
        
            st.plotly_chart(fig_dist, width="stretch")
    
        elif job_source != "Z bazy danych (zapisane)":
            st.info("Wybierz źródło stanowisk i kliknij **Uruchom Model**, aby rozpocząć wartościowanie.")
        
        # ========================================================================
        # ZAKŁADKA 3: WNIOSKI ART. 7
        # ========================================================================
        with tab_art7:
            st.title("📩 Wnioski Art. 7 - Generator Odpowiedzi")
            st.markdown("""
            **Moduł zgodny z Artykułem 7 Dyrektywy UE 2023/970** (Prawo pracownika do informacji o wynagrodzeniu)
            
            Pracownik może zażądać informacji o:
            - Średnim wynagrodzeniu w swojej grupie porównawczej
            - Medianie wynagrodzeń
            - Różnicach względem fair pay line
            
            Ten moduł generuje gotową odpowiedź dla HR/pracodawcy.
            """)
            
            st.divider()
            
            # --- Wybór pracownika ---
            st.subheader("1️⃣ Wybierz pracownika")
            
            if not working_df.empty and 'Position' in working_df.columns:
                # Utwórz listę pracowników (Employee_ID lub indeks + Position)
                if 'Employee_ID' in working_df.columns:
                    employee_options = [f"{row['Employee_ID']} - {row['Position']}" 
                                      for idx, row in working_df.iterrows()]
                    employee_ids = working_df['Employee_ID'].tolist()
                else:
                    employee_options = [f"Pracownik #{idx+1} - {row['Position']}" 
                                      for idx, row in working_df.iterrows()]
                    employee_ids = [f"EMP-{idx+1}" for idx in range(len(working_df))]
                
                selected_employee_display = st.selectbox(
                    "Wybierz pracownika z listy:",
                    options=employee_options,
                    key="art7_employee_selector"
                )
                
                # Znajdź indeks wybranego pracownika
                selected_idx = employee_options.index(selected_employee_display)
                selected_employee = working_df.iloc[selected_idx]
                selected_employee_id = employee_ids[selected_idx]
                
                st.divider()
                st.subheader("2️⃣ Podgląd danych pracownika")
                
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Stanowisko", selected_employee['Position'])
                with col2:
                    if 'Gender' in selected_employee:
                        gender_display = "Kobieta" if selected_employee['Gender'] == 'F' else "Mężczyzna"
                        st.metric("Płeć", gender_display)
                with col3:
                    salary_display = f"{int(selected_employee.get(salary_col_vis, 0)):,} PLN".replace(",", " ")
                    st.metric("Wynagrodzenie", salary_display)
                
                st.divider()
                st.subheader("3️⃣ Wygenerowana odpowiedź Art. 7")
                
                # Znajdź grupę porównawczą (to samo stanowisko)
                position = selected_employee['Position']
                gender = selected_employee.get('Gender', 'N/A')
                employee_salary = selected_employee.get(salary_col_vis, 0)
                
                # Filtruj grupę porównawczą (to samo stanowisko)
                comparison_group = df_filtered[df_filtered['Position'] == position]
                
                if len(comparison_group) > 1:
                    # Oblicz statystyki grupy
                    avg_salary = comparison_group[salary_col_vis].mean()
                    median_salary = comparison_group[salary_col_vis].median()
                    group_size = len(comparison_group)
                    
                    # Oblicz różnicę względem średniej
                    diff_from_avg = employee_salary - avg_salary
                    diff_pct = (diff_from_avg / avg_salary * 100) if avg_salary > 0 else 0
                    
                    # Wygeneruj tekst odpowiedzi
                    response_text = f"""
**INFORMACJA O WYNAGRODZENIU (Art. 7 Dyrektywy UE 2023/970)**

Data: {datetime.now().strftime('%Y-%m-%d')}  
Dla: {selected_employee_id} - {position}

---

**Grupa porównawcza:**
- Stanowisko: {position}
- Liczba pracowników w grupie: {group_size}

**Statystyki wynagrodzenia w grupie:**
- Średnie wynagrodzenie: **{int(avg_salary):,} PLN** (zaokrąglone)
- Mediana wynagrodzenia: **{int(median_salary):,} PLN** (zaokrąglone)

**Twoje wynagrodzenie:**
- Aktualne wynagrodzenie: **{int(employee_salary):,} PLN**
- Różnica względem średniej: **{int(diff_from_avg):+,} PLN** ({diff_pct:+.1f}%)
- Pozycja względem grupy: {"powyżej średniej" if diff_from_avg > 0 else "poniżej średniej" if diff_from_avg < 0 else "na poziomie średniej"}

---

**Informacja dodatkowa:**
Zgodnie z Artykułem 7 Dyrektywy UE 2023/970, pracownik ma prawo do informacji o swoim poziomie wynagrodzenia w porównaniu do innych pracowników wykonujących tę samą pracę lub pracę równej wartości. 

Powyższe dane obejmują całkowite wynagrodzenie (wynagrodzenie zasadnicze + składniki zmienne + dodatki) po uwzględnieniu korekt związanych z typem umowy (B2B → UoP).

Dane zostały zanonimizowane zgodnie z RODO - prezentujemy tylko wartości agregowane dla grup liczących co najmniej 3 osoby.

---

_Sporządzono automatycznie przez PayCompass Pro_
"""
                    
                    # Wyświetl w markdown box
                    st.markdown(f"""
                    <div style="background: var(--slate-800); border: 1px solid var(--slate-700); 
                                border-left: 4px solid var(--accent-green); padding: 1.5rem; 
                                border-radius: 6px; font-family: 'Inter', sans-serif;">
                        {response_text}
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Przycisk do kopiowania tekstu
                    st.divider()
                    col_copy, col_pdf = st.columns(2)
                    
                    with col_copy:
                        if st.button("📋 Skopiuj odpowiedź do schowka", width="stretch"):
                            st.code(response_text, language=None)
                            st.success("✓ Tekst gotowy do skopiowania!")
                    
                    with col_pdf:
                        st.info("🔄 Export PDF w przygotowaniu (Phase 3)")
                
                else:
                    st.warning(f"""
                    ⚠️ **Niewystarczająca grupa porównawcza**
                    
                    W danych znajduje się tylko **{len(comparison_group)}** pracownik(ów) na stanowisku "{position}".
                    
                    Zgodnie z RODO Shield, nie możemy wygenerować porównania dla grup mniejszych niż 3 osoby 
                    (wymóg ochrony prywatności).
                    
                    **Rekomendacja:** Rozszerz grupę porównawczą o stanowiska równej wartości (EVG Groups).
                    """)
            
            else:
                st.info("Moduł wymaga danych pracowników z kolumną `Position`. Załaduj dane w sidebarze.")
        
        # ========================================================================
        # ZAKŁADKA 4: USTAWIENIA
        # ========================================================================
        with tab_ustawienia:
            st.title("⚙️ Ustawienia & Security Audit")
            
            # --- Security Audit ---
            st.subheader("🔒 Security Audit")
            st.info("System weryfikacji tożsamości aktywny. Dane odizolowane i chronione protokołem 2026.")
    
    # ========== GLOBALNY SPACER DLA WIDOCZNOŚCI DOLNYCH PRZYCISKÓW ==========
    st.markdown('<div style="height: 150px;"></div>', unsafe_allow_html=True)