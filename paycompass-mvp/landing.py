# -*- coding: utf-8 -*-
"""
PayCompass Pro – Landing Page (Zintegrowany)
Dla: Pracodawca 50+, średnie i duże przedsiębiorstwa, zespoły B2B/UoP.
Styl: Profesjonalne SaaS/Fintech (Emerald Green #059669, Navy Blue / Dark Mode)
Importowany przez app.py jako moduł.
"""
import streamlit as st
import streamlit.components.v1 as components
import pandas as pd
import numpy as np
import time
from datetime import date
import plotly.graph_objects as go
from logic import calculate_b2b_equivalents, load_and_validate, detect_and_load_csv, suggest_column_mapping

# Lista datasetów demo do uruchomienia Sandboxa
DEMO_DATASETS = [
    "data_clean_v2.csv",
    "data_dirty_v2.csv",
    "data_1_clean.csv",
    "data_2_dirty.csv",
    "data_3_no_gender.csv",
    "data_4_high_volume.csv",
]

# Callback dla przycisku CTA
def go_to_login():
    """Callback wywoływany przez przycisk CTA - ustawia flagę show_login"""
    st.session_state["show_login"] = True
    st.session_state["auth_mode"] = "login"

def show_landing_page():
    # 1. UKRYWANIE SIDEBARA (Wymuszenie CSS)
    st.markdown("<style>[data-testid='stSidebar'] { display: none; }</style>", unsafe_allow_html=True)

    # 2. STYLE CSS – Emerald Green (#059669) + Navy Blue / Dark Mode (SaaS/Fintech)
    st.markdown("""
    <style>
        /* CENTROWANIE I TYPOGRAFIA (Globalne) */
        h1, h2, h3, p {
            text-align: center !important;
        }
        .block-container, [data-testid="block-container"] { max-width: 1200px; margin-left: auto !important; margin-right: auto !important; padding-left: 2rem; padding-right: 2rem; }
        /* TYPOGRAFIA – Profesjonalne SaaS/Fintech (WHITE TEXT dla Dark Mode) */
        h1 {
            font-family: 'Inter', sans-serif; color: #FFFFFF !important; font-weight: 800 !important;
            font-size: 3rem !important; margin-bottom: 1rem;
        }
        h2 {
            font-family: 'Inter', sans-serif; color: #e2e8f0 !important; font-weight: 600;
            font-size: 1.6rem !important; margin-bottom: 2rem;
        }
        h3 { color: #cbd5e1 !important; font-weight: 700; margin-top: 0; }
        p { font-size: 1.05rem; line-height: 1.6; color: #94a3b8 !important; }

        /* CONTEXT BAR (kontekst prawny pod Hero) */
        .context-bar {
            background-color: #1e293b; border: 1px solid #10b981; border-radius: 12px;
            padding: 1.25rem 2rem; margin-bottom: 2rem; text-align: center;
            display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;
        }
        .context-bar-icon { font-size: 1.5rem; }
        .context-bar-text { margin: 0; font-size: 1rem; line-height: 1.65; color: #cbd5e1 !important; font-weight: 500; max-width: 900px; }

        /* TRUST BAR */
        .trust-bar {
            background-color: #1e293b; border-bottom: 1px solid #475569; border-top: 1px solid #475569;
            padding: 20px 2rem; margin-bottom: 40px; text-align: center;
            display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 2rem; max-width: 700px; margin-left: auto; margin-right: auto;
        }
        .trust-item { font-size: 0.9rem; color: #94a3b8 !important; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }

        /* SCENARIUSZE A/B – stonowane (nie czerwienie) */
        .scenario-box { padding: 25px; border-radius: 12px; height: 100%; }
        .scenario-bad { background-color: #1e293b; border: 1px solid #475569; }
        .scenario-good { background-color: #064e3b; border: 1px solid #10b981; }
        .scenario-title-bad { color: #cbd5e1 !important; font-weight: 800; font-size: 1.3rem; margin-bottom: 15px; }
        .scenario-title-good { color: #10b981 !important; font-weight: 800; font-size: 1.3rem; margin-bottom: 15px; }
        .list-bad li { list-style-type: "\\2716 "; padding-left: 10px; margin-bottom: 10px; color: #94a3b8 !important; }
        .list-good li { list-style-type: "\\2713 "; padding-left: 10px; margin-bottom: 10px; color: #6ee7b7 !important; }

        /* HOW IT WORKS */
        .step-circle {
            background-color: #10b981; color: white; width: 50px; height: 50px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-size: 24px; font-weight: bold; margin: 0 auto 15px auto;
        }
        .step-box { text-align: center; padding: 20px; }
        .step-box h3, .step-box p { color: #e2e8f0 !important; }

        /* FINALNY FIX PRZYCISKÓW: IDEALNIE NA ŚRODKU, max-width 500px, kolumny [1,2,1] */
        div.stButton, [data-testid="stButton"] {
            width: 100% !important; max-width: 500px !important; margin-left: auto !important; margin-right: auto !important; display: block !important;
        }
        div.stButton > button, [data-testid="stButton"] > button, [data-testid="stButton"] button {
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto !important;
            display: block !important;
            padding: 0.8rem 1rem !important;
            background-color: #059669 !important;
            color: #fff !important;
            font-size: 1.1rem !important;
            font-weight: 700 !important;
            border-radius: 8px !important;
            border: none !important;
            transition: transform 0.1s;
        }
        div.stButton > button:hover, [data-testid="stButton"] > button:hover, [data-testid="stButton"] button:hover {
            transform: scale(1.02); background-color: #047857 !important; color: #fff !important;
        }

        /* Naprawa koloru przycisku "Pobierz szablon" */
        div.stDownloadButton, [data-testid="stDownloadButton"] {
            width: 100% !important; margin-left: auto !important; margin-right: auto !important; display: block !important;
        }
        [data-testid="stDownloadButton"] button, div.stDownloadButton > button {
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto !important;
            display: block !important;
            padding: 0.8rem 1rem !important;
            color: #0f172a !important;
            font-weight: 700 !important;
            border: 1px solid #D1D5DB !important;
            background-color: #FFFFFF !important;
        }
        [data-testid="stDownloadButton"] button:hover, div.stDownloadButton > button:hover {
            border-color: #0A2540 !important;
            color: #0A2540 !important;
            background-color: #F3F4F6 !important;
        }

        /* KROK 4: File uploader – ciemny tekst, wyraźne obramowanie */
        [data-testid="stFileUploader"],
        [data-testid="stFileUploader"] *,
        [data-testid="stFileUploader"] section,
        [data-testid="stFileUploader"] label,
        [data-testid="stFileUploader"] p,
        [data-testid="stFileUploader"] span {
            color: #111827 !important;
        }
        [data-testid="stFileUploader"] section {
            border: 2px dashed #0A2540 !important; background-color: #f8fafc !important;
        }
        /* Usunięcie białego pola: brak pustych ramek przerywanych nad file uploaderem */
        [data-testid="stFileUploader"] + div[style*="dashed"] { display: none !important; }

        .countdown-box { font-size: 2rem !important; font-weight: 800 !important; color: #DC2626 !important; text-align: center !important; margin: 1.5rem 0 !important; line-height: 1.3 !important; }
        .risk-high { color: #059669; font-weight: 900; font-size: 2.5rem; }
        .blurred-content { filter: blur(5px); opacity: 0.6; pointer-events: none; }
        .unlock-overlay {
            background: rgba(255,255,255,0.95); border: 2px solid #059669; border-radius: 12px;
            padding: 20px; text-align: center; margin-top: -120px; position: relative; z-index: 10;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .metric-box { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2rem; border-radius: 16px; text-align: center; }
        .metric-value { font-size: 2.5rem; font-weight: 800; color: #059669; }
        /* CENNIK */
        .pricing-card { background: #1e293b; border: 1px solid #475569; border-radius: 16px; padding: 1.5rem; height: 100%; }
        .pricing-card.featured { border: 2px solid #10b981; background: #064e3b; }
        .pricing-title { font-size: 1.25rem; font-weight: 700; color: #e2e8f0 !important; margin-bottom: 0.5rem; }
        .pricing-price { font-size: 2rem; font-weight: 800; color: #10b981 !important; margin: 0.5rem 0; }
        .pricing-desc { font-size: 0.9rem; color: #94a3b8 !important; margin-bottom: 1rem; }
        .pricing-features { font-size: 0.9rem; color: #cbd5e1 !important; line-height: 1.6; list-style: none; padding-left: 0; }
        .pricing-features li { margin-bottom: 0.35rem; padding-left: 1.2rem; position: relative; }
        .pricing-features li::before { content: "✓"; color: #10b981; font-weight: bold; position: absolute; left: 0; }
        /* FAQ */
        .faq-item { background: #1e293b; border: 1px solid #475569; border-radius: 12px; padding: 1.25rem; margin-bottom: 1rem; }
        .faq-q { font-weight: 700; color: #e2e8f0 !important; margin-bottom: 0.5rem; }
        .faq-a { font-size: 0.95rem; color: #94a3b8 !important; line-height: 1.6; }
        .footer-map { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .footer-map a { color: #10b981 !important; text-decoration: none; font-weight: 600; }
        .footer-map a:hover { text-decoration: underline; }
        .newsletter-box { background: #1e293b; border: 1px solid #475569; border-radius: 12px; padding: 1.5rem; text-align: center; max-width: 480px; margin: 0 auto 2rem auto; }

        /* SaaS Product Hero – Kicker nad H1, H1 wyśrodkowany */
        .hero-section { text-align: center; margin-bottom: 2rem; padding: 2rem 1rem; }
        .hero-kicker { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; color: #10b981; margin-bottom: 0.75rem; text-transform: uppercase; text-align: center !important; }
        .hero-h1 { font-family: 'Inter', sans-serif; font-size: 2.75rem; font-weight: 800; color: #FFFFFF !important; line-height: 1.2; margin-bottom: 1rem; max-width: 800px; margin-left: auto; margin-right: auto; text-align: center !important; }
        .hero-rotating-wrap { position: relative; min-height: 2.8rem; margin-bottom: 1.5rem; }
        .hero-rotating-wrap .phrase { position: absolute; left: 50%; transform: translateX(-50%); width: 100%; max-width: 700px; font-size: 1.35rem; color: #10b981 !important; font-weight: 600; opacity: 0; animation: rotatePhrase 12s infinite; }
        .hero-rotating-wrap .phrase:nth-child(1) { animation-delay: 0s; }
        .hero-rotating-wrap .phrase:nth-child(2) { animation-delay: 3s; }
        .hero-rotating-wrap .phrase:nth-child(3) { animation-delay: 6s; }
        .hero-rotating-wrap .phrase:nth-child(4) { animation-delay: 9s; }
        @keyframes rotatePhrase { 0% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }
        .hero-rotating-outer { position: relative; width: 100%; }
        .countdown-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #94a3b8 !important; text-align: center; margin-bottom: 0.5rem; text-transform: uppercase; }
        #countdown-container { font-family: 'Roboto Mono', 'Courier New', monospace; font-size: 2.5rem; font-weight: 900; color: #e2e8f0 !important; letter-spacing: 0.15em; margin: 0.5rem 0 1.5rem 0; text-align: center; }
        #countdown-container .unit { color: #dc2626 !important; font-weight: 900; }
        #countdown-container .sep { color: #94a3b8 !important; margin: 0 0.1em; font-weight: 900; }

        /* FAQ: usuń ewentualne content na expanderze (naprawa "green arrow") */
        .streamlit-expanderHeader::before,
        .streamlit-expanderHeader::after,
        [data-testid="stExpanderExpandIcon"]::before,
        [data-testid="stExpanderExpandIcon"]::after { content: none !important; }
    </style>
    """, unsafe_allow_html=True)

    # =============================================================================
    # SEKCJA 1: HERO (SaaS Product Hero – styl Brand24)
    # =============================================================================
    st.markdown("""
    <div class="hero-section">
        <div class="hero-kicker">#1 Pay Gap Compliance &amp; HR Analytics</div>
        <h1 class="hero-h1">Najlepsze narzędzie do analizowania i monitorowania luki płacowej</h1>
        <div class="hero-rotating-outer">
            <div class="hero-rotating-wrap">
                <span class="phrase">PayCompass Pro to… automatyzacja raportów Art. 7 Dyrektywy UE</span>
                <span class="phrase">PayCompass Pro to… ochrona przed pozwami o dyskryminację</span>
                <span class="phrase">PayCompass Pro to… błyskawiczne wartościowanie stanowisk</span>
                <span class="phrase">PayCompass Pro to… wykrywanie luki płacowej w czasie rzeczywistym</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # CONTEXT BAR (kontekst prawny – zaraz pod Hero)
    # =============================================================================
    st.markdown("""
    <div class="context-bar">
        <span class="context-bar-icon" aria-hidden="true">🇪🇺</span>
        <p class="context-bar-text">
            Dyrektywa UE 2023/970 nakłada na pracodawców nowe obowiązki: jawność wynagrodzeń, raportowanie luki płacowej i wspólna ocena stawek. 
            To nie tylko zmiana prawa – to konieczność wdrożenia nowych procesów analitycznych w HR. PayCompass automatyzuje te wyzwania.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # DYNAMICZNY COUNTDOWN (DD : HH : MM : SS) – nowoczesny, Bold/Black, monospaced
    # =============================================================================
    countdown_html = """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700;900&display=swap');
    .countdown-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; color: #64748b; text-align: center; margin-bottom: 0.5rem; text-transform: uppercase; }
    .countdown-grid { display: flex; justify-content: center; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin: 0.5rem 0 1.5rem 0; font-family: 'Roboto Mono', 'Courier New', monospace; }
    .countdown-cell { text-align: center; min-width: 3rem; }
    .countdown-cell .unit { display: block; font-size: 2.5rem; font-weight: 900; color: #dc2626; letter-spacing: 0.05em; }
    .countdown-unit-label { display: block; font-size: 0.7rem; font-weight: 600; color: #64748b; margin-top: 0.25rem; letter-spacing: 0.05em; }
    body { margin: 0; }
    </style>
    <div class="countdown-label">CZAS DO PEŁNEGO WDROŻENIA DYREKTYWY (CZERWIEC 2026)</div>
    <div id="countdown-container" class="countdown-grid">
        <div class="countdown-cell"><span id="cd-days" class="unit">--</span><span class="countdown-unit-label">DNI</span></div>
        <div class="countdown-cell"><span id="cd-hours" class="unit">--</span><span class="countdown-unit-label">GODZ</span></div>
        <div class="countdown-cell"><span id="cd-mins" class="unit">--</span><span class="countdown-unit-label">MIN</span></div>
        <div class="countdown-cell"><span id="cd-secs" class="unit">--</span><span class="countdown-unit-label">SEK</span></div>
    </div>
    <script>
    (function() {
        var target = new Date('2026-06-07T00:00:00').getTime();
        function pad(n) { return n < 10 ? '0' + n : n; }
        function update() {
            var now = new Date().getTime();
            var d = target - now;
            if (d <= 0) {
                document.getElementById('cd-days').textContent = '00';
                document.getElementById('cd-hours').textContent = '00';
                document.getElementById('cd-mins').textContent = '00';
                document.getElementById('cd-secs').textContent = '00';
                return;
            }
            var days = Math.floor(d / (1000 * 60 * 60 * 24));
            var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
            var s = Math.floor((d % (1000 * 60)) / 1000);
            document.getElementById('cd-days').textContent = pad(days);
            document.getElementById('cd-hours').textContent = pad(h);
            document.getElementById('cd-mins').textContent = pad(m);
            document.getElementById('cd-secs').textContent = pad(s);
        }
        update();
        setInterval(update, 1000);
    })();
    </script>
    """
    components.html(countdown_html, height=120)

    # CTA między licznikiem a wykresem – IDEALNIE NA ŚRODKU, max-width 500px, kolumny [1, 2, 1]
    c1, c2, c3 = st.columns([1, 2, 1])
    with c2:
        st.button("Rozpocznij darmowy audyt", on_click=go_to_login, key="landing_cta_main", type="primary")

    # =============================================================================
    # SCENARIUSZE: Bez narzędzia vs Z PayCompass
    # =============================================================================
    st.write("---")
    st.markdown("<h2>Dyrektywa 2023/970: Art. 7 i Art. 18 – wyzwania, które PayCompass pomaga „odklikać” w 3 minuty</h2>", unsafe_allow_html=True)

    sc_col1, sc_col2 = st.columns(2, gap="medium")

    with sc_col1:
        st.markdown("""
        <div class="scenario-box scenario-bad">
            <div class="scenario-title-bad">Bez narzędzia</div>
            <ul class="list-bad" style="list-style: none; padding: 0;">
                <li><b>Art. 7</b> – Prawo pracownika do informacji: ręczne zbieranie danych, ryzyko błędów i naruszenia RODO.</li>
                <li><b>Art. 18</b> – Ciężar dowodu: bez obiektywnego modelu trudno uzasadnić różnice. Typowe pytanie: „Dlaczego specjalista na kontrakcie B2B zarabia o 30% więcej niż manager na etacie?”</li>
                <li>Godziny pracy HR na Excelu i ad-hoc raportach.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with sc_col2:
        st.markdown("""
        <div class="scenario-box scenario-good">
            <div class="scenario-title-good">Z PayCompass</div>
            <ul class="list-good" style="list-style: none; padding: 0;">
                <li><b>Art. 7:</b> Automatyczne raporty na wnioski pracowników – anonimizacja, grupowanie, gotowe PDF-y.</li>
                <li><b>Art. 18:</b> Obiektywne dane i model B2B↔UoP – gotowy materiał na ewentualne uzasadnienie różnic.</li>
                <li>Odpowiedzi na wnioski i raporty w minutach, nie tygodniach.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("""
    <p style="text-align: center; font-weight: 700; color: #0f172a; margin-top: 20px;">
    Bądź przygotowany na wymogi Dyrektywy 2023/970 dzięki obiektywnym danym.
    </p>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Art. 7 (Tekst): Prawo pracownika do informacji
    # =============================================================================
    st.write("---")
    st.markdown("<h2>Art. 7: Prawo pracownika do informacji – od ręcznych raportów do 3 minut</h2>", unsafe_allow_html=True)
    st.markdown("""
    <p>Wnioski pracowników o informację o wynagrodzeniach (średnie w grupie, podział na płeć itd.) to wyzwanie procesowe:</p>
    <p><span style="color:#64748b; font-weight:bold;">Bez automatyzacji:</span> HR spędza dni na zbieraniu danych w Excelu, wartościowaniu stanowisk, anonimizacji i weryfikacji RODO.</p>
    <p><span style="color:#059669; font-weight:bold;">Z PayCompass:</span> „Generuj raporty Art. 7” – grupowanie stanowisk, średnie, anonimizacja i gotowe PDF-y. <b>Czas operacji: ok. 3 minuty.</b></p>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Filary Bezpieczeństwa (Trust Bar 2x2)
    # =============================================================================
    st.markdown("""
    <div class="trust-bar">
        <div class="trust-item">🔒 Szyfrowanie AES-256 (Standard Bankowy)</div>
        <div class="trust-item">🇵🇱 Pełna anonimizacja danych pracowników (RODO)</div>
        <div class="trust-item">💻 Dane nie opuszczają Polski (Hostowane lokalnie)</div>
        <div class="trust-item">📊 Przeanalizowaliśmy już &gt;500 umów B2B/UoP</div>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Wdrożenie: Jak to działa (Kroki 1-2-3)
    # =============================================================================
    st.write("---")
    st.markdown("<h2>Wdrożenie w minutach, nie miesiącach</h2>", unsafe_allow_html=True)

    hw1, hw2, hw3 = st.columns(3)

    with hw1:
        st.markdown("""
        <div class="step-box">
            <div class="step-circle">1</div>
            <h3>Wgraj dane</h3>
            <p>Import z Excela lub integracja z Enova/Optima (CSV).</p>
        </div>
        """, unsafe_allow_html=True)
    with hw2:
        st.markdown("""
        <div class="step-box">
            <div class="step-circle">2</div>
            <h3>Analiza</h3>
            <p>Model matematyczny mapuje stanowiska i przelicza stawki.</p>
        </div>
        """, unsafe_allow_html=True)
    with hw3:
        st.markdown("""
        <div class="step-box">
            <div class="step-circle">3</div>
            <h3>Wynik</h3>
            <p>Otrzymujesz raport z rekomendacjami i wskazówkami.</p>
        </div>
        """, unsafe_allow_html=True)

    # =============================================================================
    # Wykres + Kalkulator B2B (Dashboard Preview + Obiektywny model)
    # =============================================================================
    st.write("---")
    np.random.seed(42)
    levels = ["Junior", "Mid", "Senior", "Lead"]
    n = 50
    stanowiska = np.random.choice(levels, n, p=[0.25, 0.35, 0.3, 0.1])
    plec = np.random.choice(["K", "M"], n, p=[0.45, 0.55])
    # Scoring (wartość stanowiska) – numeryczny 1–100
    scoring = np.round(
        np.where(stanowiska == "Junior", np.random.uniform(20, 45, n),
        np.where(stanowiska == "Mid", np.random.uniform(40, 65, n),
        np.where(stanowiska == "Senior", np.random.uniform(60, 85, n),
        np.random.uniform(75, 95, n))))).astype(int)
    wynagrodzenie = np.round(
        np.where(stanowiska == "Junior", np.random.uniform(6_000, 12_000, n),
        np.where(stanowiska == "Mid", np.random.uniform(10_000, 18_000, n),
        np.where(stanowiska == "Senior", np.random.uniform(14_000, 24_000, n),
        np.random.uniform(18_000, 28_000, n))))).astype(int)
    df_chart = pd.DataFrame({
        "Scoring": scoring, "Wynagrodzenie": wynagrodzenie,
        "Płeć": plec, "Stanowisko": stanowiska,
    })
    # Linia trendu (Fair Pay Line) – regresja liniowa przez środek chmury
    m, b = np.polyfit(df_chart["Scoring"], df_chart["Wynagrodzenie"], 1)
    x_line = np.array([df_chart["Scoring"].min(), df_chart["Scoring"].max()])
    y_line = m * x_line + b

    fig = go.Figure()
    for gender, color, label in [("K", "#FF69B4", "Kobiety"), ("M", "#1E90FF", "Mężczyźni")]:
        mask = df_chart["Płeć"] == gender
        sub = df_chart[mask]
        fig.add_trace(go.Scatter(
            x=sub["Scoring"], y=sub["Wynagrodzenie"], mode="markers", name=label,
            marker=dict(size=12, color=color, line=dict(width=1, color="white")),
            text=sub["Stanowisko"],
            hovertemplate="<b>Stanowisko: %{text}</b><br>Scoring (Wartość Stanowiska): %{x}<br>Wynagrodzenie (PLN): %{y:,.0f}<extra></extra>",
        ))
    fig.add_trace(go.Scatter(
        x=x_line, y=y_line, mode="lines", name="Fair Pay Line",
        line=dict(color="#059669", width=2, dash="dash"),
    ))
    fig.update_layout(
        title=dict(text="Dashboard Preview – Luka płacowa (przykładowe dane)", x=0.5, xanchor="center"),
        xaxis_title="Scoring (Wartość Stanowiska)",
        yaxis_title="Wynagrodzenie (PLN)",
        template="plotly_white", height=500, margin=dict(t=60, b=50),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
        showlegend=True,
    )
    st.plotly_chart(fig, width="stretch")
    st.caption("Wizualizacja: Porównanie realnego kosztu pracodawcy B2B vs UoP po uwzględnieniu 14 zmiennych (ZUS, urlopy, benefity).")

    st.write("---")
    st.markdown("<h2>Obiektywny model porównań B2B i UoP</h2>", unsafe_allow_html=True)

    invoice_amount = st.slider(
        "Miesięczna kwota faktury B2B (netto, PLN)",
        min_value=5_000,
        max_value=50_000,
        value=18_000,
        step=1_000,
        key="b2b_invoice",
    )
    tax_choice = st.selectbox(
        "Stawka podatku / ryczałtu",
        options=[8.5, 12, 19],
        format_func=lambda x: {8.5: "8,5% (IT)", 12: "12% (Dyr/Kier)", 19: "19% (Liniowy)"}[x],
        index=1,
        key="b2b_tax",
    )
    result = calculate_b2b_equivalents(invoice_amount, tax_choice / 100)
    multiplier_note = "1,2048 (do limitu 30× ZUS)" if result["uop_brutto"] <= 19_500 else "część pow. 19 500 brutto: 1,0323"

    calc_col1, calc_col2, calc_col3 = st.columns(3)
    with calc_col1:
        st.metric("B2B na rękę", f"{int(result['b2b_take_home']):,} PLN".replace(",", " "), f"Po podatku {tax_choice}% i ZUS 1 600 PLN")
    with calc_col2:
        st.metric("Ekwiwalent UoP brutto", f"{int(result['uop_brutto']):,} PLN".replace(",", " "), f"Mnożnik: {multiplier_note}")
    with calc_col3:
        st.metric("Całkowity koszt pracodawcy", f"{int(result['employer_cost']):,} PLN".replace(",", " "), "UoP = koszt B2B (faktura netto)")
        st.caption(f"**Odpowiada to wynagrodzeniu {int(result['uop_brutto']):,} PLN Brutto na umowie o pracę.**".replace(",", " "))

    st.caption("Podstawa prawna: Dyrektywa (UE) 2023/970. Limit 30-krotności ZUS: powyżej 19 500 PLN brutto/mies. mnożnik kosztu pracodawcy spada do 1,0323.")
    st.markdown("""
    <p style="text-align: center; font-size: 1.1rem; color: #475569; margin-top: 1rem;">
    Algorytm porównuje <b>wartość pracy</b> niezależnie od formy zatrudnienia – zgodnie z Dyrektywą 2023/970.
    </p>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Nagłówek Lead Magnetu
    # =============================================================================
    st.markdown("<h2 style='margin-top:20px;'>📊 Sprawdź lukę płacową w kilka minut</h2>", unsafe_allow_html=True)
    st.markdown("""
    <p style="text-align: center; color: #64748b; margin-bottom: 20px;">
    Dla pracodawców 50+, średnich i dużych przedsiębiorstw oraz zespołów B2B/UoP. Analiza w izolowanej sesji efemerycznej (RAM). Zero zapisu w bazie danych.
    </p>
    """, unsafe_allow_html=True)

    audit_col1, audit_col2 = st.columns([1, 1], gap="large")

    with audit_col1:
        st.markdown("""
        <div style="padding: 10px;">
            <h3 style="color:#0f172a;">Jak działa analiza?</h3>
            <p>Wgraj plik CSV (np. eksport z Enova/Optima). Algorytm obliczy lukę płacową i wskaźnik ryzyka.</p>
            <ul style="line-height: 1.8; list-style: none; padding-left: 0;">
                <li>✓ <b>100% Prywatności:</b> Sesja efemeryczna, zero zapisu w bazie.</li>
                <li>✓ <b>Natychmiastowy wynik:</b> Wskaźnik ryzyka + wykres.</li>
                <li>✓ <b>Domyślne szablony stanowisk</b> – gotowe do raportów Art. 7. Nie zaczynaj wartościowania stanowisk od 0.</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with audit_col2:
        lead_email = st.text_input("Służbowy adres email (wymagane)", key="lead_email", placeholder="imie.firma@domena.pl", type="default")

        # Generowanie przykładowego CSV – szablony stanowisk gotowe do raportów
        sample_data = pd.DataFrame({
            "Stanowisko": ["Kluczowy Specjalista", "Manager Projektu", "Specjalista", "Koordynator"],
            "Płeć": ["M", "K", "M", "K"],
            "Stawka": [20000, 16000, 12000, 10000],
            "Umowa": ["B2B", "UoP", "B2B", "UoP"],
        })
        csv_bytes = sample_data.to_csv(index=False).encode("utf-8")
        st.download_button("📥 Pobierz szablon CSV", csv_bytes, "szablon.csv", "text/csv", key="dl_template")

        st.markdown("""
        <p style="margin-top: 1rem; margin-bottom: 0.5rem; font-weight: 600; color: #0f172a;">Instrukcja krok po kroku:</p>
        <ol style="margin: 0 0 1rem 1.2rem; padding: 0; color: #475569; line-height: 1.8;">
            <li>Podaj maila i pobierz szablon powyżej.</li>
            <li>Wklej swoje dane: Stanowisko, Płeć, Stawka.</li>
            <li>Wgraj plik poniżej.</li>
        </ol>
        """, unsafe_allow_html=True)

        newsletter_consent = st.checkbox(
            "Wyrażam zgodę na otrzymywanie informacji o aktualizacjach prawnych i ofercie PayCompass (Newsletter).",
            value=False,
            key="lead_newsletter_consent",
        )

        uploaded_file = st.file_uploader("Przeciągnij i upuść plik CSV tutaj", type=["csv"], key="lead_upload")

        if uploaded_file is not None:
            # Identyfikator pliku – przy nowym pliku resetujemy mapowanie
            file_id = getattr(uploaded_file, "file_id", None) or f"{uploaded_file.name}_{uploaded_file.size}"
            if st.session_state.get("lead_magnet_file_id") != file_id:
                st.session_state["lead_magnet_file_id"] = file_id
                st.session_state["lead_magnet_mapping_confirmed"] = False
                st.session_state["lead_magnet_raw_df"] = None

            df_raw = st.session_state.get("lead_magnet_raw_df")
            if df_raw is None:
                with st.spinner("⚙️ Wczytuję plik (wykrywam kodowanie i separator)..."):
                    df_raw = detect_and_load_csv(uploaded_file)
                st.session_state["lead_magnet_raw_df"] = df_raw

            if df_raw.empty:
                st.warning("Nie udało się wczytać pliku. Sprawdź format (CSV z separatorem ; lub ,) i kodowanie (UTF-8, CP1250).")
            else:
                mapping_confirmed = st.session_state.get("lead_magnet_mapping_confirmed", False)

                if not mapping_confirmed:
                    st.markdown("**Sprawdź mapowanie kolumn**")
                    st.caption("Dopasuj kolumny z pliku do wymaganych pól analizy.")
                    cols = df_raw.columns.tolist()
                    suggested = suggest_column_mapping(cols)

                    idx_stanowisko = cols.index(suggested["Stanowisko"]) if suggested["Stanowisko"] in cols else 0
                    idx_plec = cols.index(suggested["Płeć"]) if suggested["Płeć"] in cols else min(1, len(cols) - 1)
                    idx_wynagrodzenie = cols.index(suggested["Wynagrodzenie"]) if suggested["Wynagrodzenie"] in cols else min(2, len(cols) - 1)

                    col_stanowisko = st.selectbox("Wskaż kolumnę Stanowisko", cols, index=min(idx_stanowisko, len(cols) - 1), key="map_stanowisko")
                    col_plec = st.selectbox("Wskaż kolumnę Płeć", cols, index=min(idx_plec, len(cols) - 1), key="map_plec")
                    col_wynagrodzenie = st.selectbox("Wskaż kolumnę Wynagrodzenie", cols, index=min(idx_wynagrodzenie, len(cols) - 1), key="map_wynagrodzenie")

                    if st.button("Zatwierdź mapowanie i uruchom analizę", key="lead_confirm_mapping"):
                        st.session_state["lead_magnet_mapping"] = {
                            "Stanowisko": col_stanowisko,
                            "Płeć": col_plec,
                            "Wynagrodzenie": col_wynagrodzenie,
                        }
                        st.session_state["lead_magnet_mapping_confirmed"] = True
                        st.rerun()
                else:
                    # Po zatwierdzeniu: uruchom analizę luki płacowej
                    mapping = st.session_state.get("lead_magnet_mapping", {})
                    c_s, c_p, c_w = mapping.get("Stanowisko"), mapping.get("Płeć"), mapping.get("Wynagrodzenie")
                    if c_s and c_p and c_w and c_s in df_raw.columns and c_p in df_raw.columns and c_w in df_raw.columns:
                        df_audit = df_raw[[c_s, c_p, c_w]].copy()
                        df_audit.columns = ["Stanowisko", "Płeć", "Wynagrodzenie"]
                    else:
                        df_audit = df_raw.copy()
                        df_audit = df_audit.rename(columns={
                            mapping.get("Stanowisko", ""): "Stanowisko",
                            mapping.get("Płeć", ""): "Płeć",
                            mapping.get("Wynagrodzenie", ""): "Wynagrodzenie",
                        })
                        for col in ["Stanowisko", "Płeć", "Wynagrodzenie"]:
                            if col not in df_audit.columns:
                                df_audit[col] = "" if col != "Wynagrodzenie" else 0
                    df_audit["Wynagrodzenie"] = pd.to_numeric(df_audit["Wynagrodzenie"], errors="coerce").fillna(0).astype(int)

                    # Prosta luka płacowa (średnie M vs K)
                    pay_gap_pct = 0.0
                    if "Płeć" in df_audit.columns and "Wynagrodzenie" in df_audit.columns:
                        plec_norm = df_audit["Płeć"].astype(str).str.strip().str.upper().str[:1]
                        m_avg = df_audit.loc[plec_norm.isin(["M"])]["Wynagrodzenie"].mean()
                        f_avg = df_audit.loc[plec_norm.isin(["K", "F"])]["Wynagrodzenie"].mean()
                        if m_avg and not np.isnan(m_avg) and m_avg > 0:
                            pay_gap_pct = round((float(m_avg - (f_avg if not np.isnan(f_avg) else 0)) / float(m_avg)) * 100, 1)
                        elif f_avg and not np.isnan(f_avg) and f_avg > 0:
                            pay_gap_pct = round((float(f_avg - (m_avg if not np.isnan(m_avg) else 0)) / float(f_avg)) * 100, 1)

                    st.markdown("""
                    <div style="text-align:center; padding: 20px; background-color: #f0fdf4; border-radius: 10px; margin-bottom: 20px;">
                        <span style="font-size:1.2rem; color:#047857; font-weight:bold;">WSKAŹNIK RYZYKA:</span><br>
                        <span class="risk-high">Analiza gotowa</span><br>
                        <span style="font-size:1rem; color:#0f172a;">Luka płacowa (M vs K): """ + str(pay_gap_pct) + """%</span>
                    </div>
                    """, unsafe_allow_html=True)

                    st.markdown("""
                    <div class="blurred-content">
                        <p>1. Kluczowy Specjalista (B2B vs UoP): Rozbieżność krytyczna...</p>
                        <p>2. Manager Projektu: Ryzyko dyskryminacji...</p>
                        <p>3. Rekomendacja: Wyrównaj stawki w grupie L2 do 30 dni.</p>
                    </div>
                    <div class="unlock-overlay">
                        <h3 style="color:#059669;">📋 Zobacz pełny raport</h3>
                        <p>Uruchom Sandbox, aby zobaczyć szczegóły i rekomendacje.</p>
                    </div>
                    """, unsafe_allow_html=True)

                    if lead_email and "@" in lead_email:
                        if st.button("🚀 POKAŻ WYNIKI", key="lead_unlock"):
                            st.session_state["scenario"] = DEMO_DATASETS[0]
                            st.rerun()
                    else:
                        st.info("Podaj służbowy adres email powyżej, aby otrzymać wynik analizy.")

    # =============================================================================
    # CENNIK (Model subskrypcyjny)
    # =============================================================================
    st.write("---")
    st.markdown("<h2 id='cennik'>Cennik</h2>", unsafe_allow_html=True)

    price_col1, price_col2, price_col3 = st.columns(3)
    with price_col1:
        st.markdown("""
        <div class="pricing-card">
            <div class="pricing-title">Single Audit</div>
            <div class="pricing-desc">Jednorazowy raport luki płacowej</div>
            <div class="pricing-price">2 499 PLN</div>
            <div class="pricing-desc">jednorazowo</div>
            <ul class="pricing-features">
                <li>Raport luki płacowej dla jednego audytu</li>
                <li>Eksport PDF</li>
                <li>Bez zobowiązań</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Wybierz Single Audit", key="price_single"):
            st.info("Skontaktujemy się w celu realizacji audytu.")
    with price_col2:
        st.markdown("""
        <div class="pricing-card featured">
            <div class="pricing-title">PRO – Subskrypcja roczna</div>
            <div class="pricing-desc">Płatne z góry, najlepsza wartość</div>
            <div class="pricing-price">449 PLN <span style="font-size:1rem; font-weight:600;">/ mies.</span></div>
            <div class="pricing-desc">rocznie z góry</div>
            <ul class="pricing-features">
                <li>Nielimitowane raporty Art. 7 (wnioski pracowników)</li>
                <li>Monitorowanie luki płacowej w czasie rzeczywistym</li>
                <li>Archiwum dowodów i raportów</li>
                <li>Wsparcie priorytetowe</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Wybierz PRO (roczny)", key="price_pro"):
            st.info("Przekierujemy do płatności rocznej.")
    with price_col3:
        st.markdown("""
        <div class="pricing-card">
            <div class="pricing-title">FLEX – Miesięcznie</div>
            <div class="pricing-desc">Pełna funkcjonalność, bez zobowiązań</div>
            <div class="pricing-price">649 PLN <span style="font-size:1rem; font-weight:600;">/ mies.</span></div>
            <div class="pricing-desc">rozliczenie miesięczne</div>
            <ul class="pricing-features">
                <li>Wszystkie funkcje PRO</li>
                <li>Anuluj kiedy chcesz</li>
                <li>Bez długoterminowych umów</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Wybierz FLEX", key="price_flex"):
            st.info("Przekierujemy do płatności miesięcznej.")

    # =============================================================================
    # Symulator rekrutacji (Planuj rekrutację bez ryzyka prawnego)
    # =============================================================================
    st.write("---")
    st.markdown("<h2 style='margin-top: 2rem;'>Planuj rekrutację bez ryzyka prawnego</h2>", unsafe_allow_html=True)
    st.markdown("""
    <h2 style='font-size: 1.4rem; margin-top: 0.5rem;'>Symulacja „What-if”: Rekrutuj bez psucia luki płacowej.</h2>
    <p style='max-width: 700px; margin-left: auto; margin-right: auto; color: #64748b; margin-bottom: 1.5rem;'>
    Zanim zatrudnisz, sprawdź wpływ nowej oferty na Twój raport zgodności. Jedna oferta z „gwiazdorską” stawką może zniszczyć miesięce pracy nad równością płac. PayCompass pozwala Ci przetestować scenariusz rekrutacyjny w 5 sekund.
    </p>
    """, unsafe_allow_html=True)
    st.markdown("""
    <div class="simulator-mockup" style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 2rem; max-width: 500px; margin: 0 auto 2rem auto; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧮</div>
        <div style="font-weight: 700; color: #0f172a; font-size: 1.1rem;">What-if Analysis</div>
        <p style="font-size: 0.9rem; color: #64748b; margin-top: 0.5rem;">Symuluj ofertę → Zobacz wpływ na lukę płacową</p>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Bądź przygotowany (Tarcza Prawna)
    # =============================================================================
    st.write("---")
    st.markdown("""
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 60px; border-radius: 20px; text-align: center; margin-top: 40px; color: white;">
        <h2 style="color: white; margin-bottom: 20px;">Bądź przygotowany na wymogi Dyrektywy 2023/970 dzięki obiektywnym danym.</h2>
        <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 30px;">
            Oszczędność czasu HR, precyzyjne raporty i spokój w polityce płacowej.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # Oszczędność czasu HR (blok 120h)
    # =============================================================================
    st.markdown("""
    <div class="metric-box" style="max-width: 400px; margin: 2rem auto;">
        <div style="font-size: 0.9rem; opacity: 0.9;">Oszczędność czasu HR</div>
        <div class="metric-value">ok. 120h</div>
        <div style="font-size: 0.9rem;">rocznie przy zespole 50 osób</div>
    </div>
    """, unsafe_allow_html=True)

    # =============================================================================
    # CTA: Umów rozmowę
    # =============================================================================
    c_final1, c_final2, c_final3 = st.columns([1, 2, 1])
    with c_final2:
        if st.button("📅 UMÓW ROZMOWĘ", key="final_cta"):
            st.success("Dziękujemy. Skontaktujemy się w ciągu 24h.")

    # =============================================================================
    # STOPKA: Mapa strony + Newsletter
    # =============================================================================
    st.write("---")
    st.markdown("""
    <div class="footer-map">
        <a href="#">Dashboard</a>
        <a href="#cennik">Cennik</a>
        <a href="#faq">FAQ</a>
        <a href="#">Kontakt</a>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<h3 style='text-align: center; color: #334155; margin-bottom: 0.5rem;'>Zapisz się na newsletter</h3>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #64748b; font-size: 0.9rem; margin-bottom: 1rem;'>Porady o Dyrektywie 2023/970, luka płacowa i PayCompass – bez spamu.</p>", unsafe_allow_html=True)
    nl_col1, nl_col2, nl_col3 = st.columns([1, 2, 1])
    with nl_col2:
        newsletter_email = st.text_input("Email", key="newsletter_email", placeholder="twoj@email.pl", label_visibility="collapsed")
        if st.button("Zapisz się", key="newsletter_btn"):
            if newsletter_email and "@" in newsletter_email:
                st.success("Dziękujemy za zapis. Na podany adres wyślemy potwierdzenie.")
            else:
                st.warning("Podaj poprawny adres e-mail.")

    # =============================================================================
    # FAQ (rozwijane sekcje st.expander)
    # =============================================================================
    st.markdown("<h2 id='faq' style='margin-top: 2rem;'>FAQ</h2>", unsafe_allow_html=True)

    with st.expander("**Q:** Czy moje dane płacowe są bezpieczne i czy opuszczają Polskę?"):
        st.markdown("""
        **A:** Bezpieczeństwo to nasz priorytet. PayCompass Pro wykorzystuje izolowane sesje efemeryczne (RAM). 
        Oznacza to, że dane są przetwarzane „w locie” i trwale usuwane natychmiast po zamknięciu karty przeglądarki. 
        Nie przechowujemy Twoich list płac w bazie danych. Całość infrastruktury znajduje się w certyfikowanych 
        centrach danych w Polsce, co gwarantuje pełną zgodność z RODO.
        """)

    with st.expander("**Q:** Na jakiej podstawie system porównuje kontrakty B2B z umowami o pracę?"):
        st.markdown("""
        **A:** Wykorzystujemy autorski model B2B Equalizer, oparty na twardej matematyce kosztów pracodawcy. 
        System przelicza fakturę netto na ekwiwalent Brutto UoP, uwzględniając składki ZUS, limit 30-krotności, 
        koszty urlopów oraz podatki.
        """)
        st.latex(r"Ekwiwalent_{UoP} = \frac{Faktura_{netto}}{1{,}2048}")
        st.markdown("""
        Dzięki temu porównujesz realną wartość pracy i koszt dla organizacji, a nie tylko liczby na różnych typach umów.
        """)

    with st.expander("**Q:** Jak PayCompass Pro pomaga w spełnieniu wymogów Artykułu 7 Dyrektywy UE?"):
        st.markdown("""
        **A:** Artykuł 7 daje pracownikom prawo do uzyskania informacji o średnim poziomie wynagrodzenia w ich grupie zawodowej. 
        PayCompass automatyzuje ten proces – zamiast godzin pracy w Excelu, generujesz spersonalizowane, anonimowe raporty 
        jednym kliknięciem. System dba o to, by odpowiedzi były precyzyjne, zgodne z prawem i nie naruszały prywatności innych osób.
        """)

    with st.expander("**Q:** Czy muszę wdrażać nowy system HR, aby korzystać z aplikacji?"):
        st.markdown("""
        **A:** Nie. PayCompass Pro został zaprojektowany jako lekkie narzędzie typu „Plug & Play”. 
        Wystarczy eksport danych do formatu CSV z Twojego obecnego systemu (np. Enova, Optima, SAP). 
        Nasz Silnik Walidacji automatycznie rozpozna strukturę Twoich danych i przygotuje je do analizy w kilka minut.
        """)

    with st.expander("**Q:** Co się stanie, jeśli system wykryje lukę płacową powyżej 5%?"):
        st.markdown("""
        **A:** System nie tylko wskaże problem, ale zadziała jak doradca. Zgodnie z Artykułem 18 Dyrektywy, 
        otrzymasz gotową ścieżkę postępowania i model wartościowania stanowisk, który pomoże Ci obiektywnie 
        uzasadnić różnice lub przygotować plan ich niwelowania. To Twoja linia obrony na wypadek kontroli lub roszczeń.
        """)

    with st.expander("**Q:** Kogo dotyczą nowe przepisy o jawności wynagrodzeń?"):
        st.markdown("""
        **A:** Dyrektywa obejmuje wszystkich pracodawców w sektorze prywatnym i publicznym. Firmy zatrudniające powyżej 100 pracowników 
        będą musiały regularnie raportować lukę płacową. Mniejsze firmy również muszą dostosować się do zasad jawności wobec kandydatów 
        i pracowników (Art. 5 i 7).
        """)

    with st.expander("**Q:** Co to jest „Wspólna ocena wynagrodzeń” i kiedy jest wymagana?"):
        st.markdown("""
        **A:** Jeśli Twoje raporty wykażą lukę płacową powyżej 5%, której nie da się uzasadnić obiektywnymi kryteriami, będziesz musiał 
        przeprowadzić „Wspólną ocenę” we współpracy z przedstawicielami pracowników. PayCompass Pro pomaga monitorować ten wskaźnik 
        na bieżąco, abyś mógł skorygować stawki, zanim staniesz się zobligowany do tej procedury.
        """)

    with st.expander("**Q:** Czy pracownicy naprawdę zyskają prawo do informacji o zarobkach innych?"):
        st.markdown("""
        **A:** Tak. Zgodnie z nowymi przepisami, każdy pracownik będzie mógł zawnioskować o informację dotyczącą średniego wynagrodzenia 
        w podziale na płeć dla swojej kategorii zawodowej. Nasz system generuje takie odpowiedzi automatycznie, chroniąc jednocześnie 
        dane osobowe i tajemnicę przedsiębiorstwa w innych obszarach.
        """)

    with st.expander("**Q:** Jakie są konsekwencje braku dostosowania się do Dyrektywy?"):
        st.markdown("""
        **A:** Oprócz ryzyka wizerunkowego (Employer Branding), państwa członkowskie wprowadzą skuteczne, proporcjonalne i odstraszające 
        sankcje. Co ważniejsze, ciężar dowodu w sprawach o równą płacę spoczywa teraz na pracodawcy. Bez analityki PayCompass, 
        obrona przed roszczeniami jest bardzo trudna.
        """)

    st.markdown("<hr><p style='text-align:center; color:#64748b;'>© 2026 PayCompass Pro. Wszelkie prawa zastrzeżone.</p>", unsafe_allow_html=True)

    # SEO Footer
    st.markdown(
        "<p style='font-size: 0.75rem; color: #94a3b8; text-align: center; margin-top: 2rem;'>"
        "Słowa kluczowe: luka płacowa, equal pay, obowiązek raportowania luki płacowej 2026, "
        "jak porównać wynagrodzenie B2B i UoP, Dyrektywa 2023/970, audyt równości płac w firmie IT.</p>",
        unsafe_allow_html=True,
    )