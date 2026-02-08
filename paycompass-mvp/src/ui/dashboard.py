# -*- coding: utf-8 -*-
"""
UI Dashboard Module - Compliance Cockpit
=======================================
3-Zone hierarchy for Grażyna (Compliance / HR):
  Zone 1: Audit Status (Traffic Light + 3 KPI cards: Mean Gap, Median Gap, Quartile Stacked Bar)
  Zone 2: Equal Value Grid (job groups from get_evg_buckets_structure; "Dlaczego?" for red flags >5%)
  Zone 3: Advanced Intelligence (light background: Adjusted Gap, Budget Simulation placeholders)

Uses structured payload from get_evg_buckets_structure. Binder-like layout with st.container/st.columns.

Integration (e.g. in app.py):
  from src.logic.evg_engine import get_evg_buckets_structure
  from src.ui.dashboard import render_compliance_cockpit
  evg_buckets = get_evg_buckets_structure(df_filtered, valuations_df, salary_col=..., gender_col=...)
  render_compliance_cockpit(evg_buckets, mean_gap=global_pay_gap, quartiles_data=quartiles_data)
"""

import streamlit as st
from typing import Dict, Any, Optional, List

try:
    import plotly.graph_objects as go
except ImportError:
    go = None

from src.logic.art16_reporting import format_quartile_for_chart


# --- Traffic light thresholds (Art. 10 / Joint Pay Assessment) ---
RED_FLAG_THRESHOLD_PCT = 5.0   # >5% → red
AMBER_FLAG_THRESHOLD_PCT = 3.0 # >3% → amber; else green


def _traffic_light_status(weighted_gap: Optional[float]) -> tuple:
    """Returns (status, label, color): 'green'|'amber'|'red', label, hex color."""
    if weighted_gap is None:
        return "green", "Brak danych", "#22c55e"
    gap = abs(float(weighted_gap))
    if gap > RED_FLAG_THRESHOLD_PCT:
        return "red", "Wymaga uzasadnienia (Art. 10)", "#ef4444"
    if gap > AMBER_FLAG_THRESHOLD_PCT:
        return "amber", "Monitoruj", "#f59e0b"
    return "green", "W normie", "#22c55e"


def _zone1_audit_status(
    evg_buckets: Dict[str, Any],
    mean_gap: Optional[float] = None,
    median_gap: Optional[float] = None,
    quartiles_data: Optional[Dict] = None,
) -> None:
    """Zone 1: Top fold – Traffic Light + 3 KPI cards (Mean Gap, Median Gap, Quartile Stacked Bar)."""
    summary = evg_buckets.get("summary") or {}
    weighted_gap = summary.get("weighted_pay_gap") if summary else None
    if mean_gap is not None:
        weighted_gap = mean_gap  # allow override from global pay gap

    status, status_label, status_color = _traffic_light_status(weighted_gap)

    # --- Traffic Light (large) ---
    with st.container():
        st.markdown("### 🚦 Status audytu zgodności")
        st.markdown(
            f'<div style="'
            f'border: 3px solid {status_color}; border-radius: 12px; padding: 1.25rem 1.5rem; '
            f'background: linear-gradient(135deg, {status_color}22, {status_color}08); '
            f'text-align: center; margin-bottom: 0.5rem;">'
            f'<span style="font-size: 3rem; line-height: 1;">'
            f'<span style="color: {status_color};">●</span></span>'
            f'<div style="font-size: 1.25rem; font-weight: 600; color: {status_color}; margin-top: 0.5rem;">{status_label}</div>'
            f'<div style="font-size: 0.9rem; color: #888;">Ważona luka płacowa (EVG): '
            f'<strong>{weighted_gap if weighted_gap is not None else "—"}%</strong></div>'
            f'</div>',
            unsafe_allow_html=True,
        )
        if status == "green":
            st.success("**Zgodność w normie.** Luka płacowa nie przekracza progu wymagającego uzasadnienia (Art. 10).")
        elif status == "amber":
            st.info("**Warto monitorować.** Luka przekracza 3% – zalecana okresowa weryfikacja i dokumentacja.")
        else:
            st.warning("**Wymaga uzasadnienia (Art. 10).** Luka >5% – należy udokumentować obiektywne, niedyskryminujące przyczyny.")

    # --- 3 KPI cards + Quartile chart ---
    col_mean, col_median, col_quartile = st.columns(3)

    with col_mean:
        mean_val = mean_gap if mean_gap is not None else weighted_gap
        mean_str = f"{mean_val:.1f}%" if mean_val is not None else "—"
        st.metric("Średnia luka (Mean Gap)", mean_str, help="Średnia ważona luka w kategoriach EVG / globalna")

    with col_median:
        median_str = f"{median_gap:.1f}%" if median_gap is not None else "—"
        st.metric("Mediana luki (Median Gap)", median_str, help="Mediana wynagrodzeń M vs K")

    with col_quartile:
        st.markdown("**Rozkład kwartylowy (Q1–Q4)**")
        if quartiles_data and quartiles_data.get("total_employees", 0) > 0 and go is not None:
            chart_df = format_quartile_for_chart(quartiles_data)
            if not chart_df.empty:
                fig = go.Figure()
                q_order = ["Q1", "Q2", "Q3", "Q4"]
                men = chart_df[chart_df["Płeć"] == "Mężczyźni"].set_index("Kwartyl").reindex(q_order)["Procent"].fillna(0)
                women = chart_df[chart_df["Płeć"] == "Kobiety"].set_index("Kwartyl").reindex(q_order)["Procent"].fillna(0)
                fig.add_trace(go.Bar(name="Mężczyźni", x=q_order, y=men.tolist(), marker_color="#3b82f6"))
                fig.add_trace(go.Bar(name="Kobiety", x=q_order, y=women.tolist(), marker_color="#ec4899"))
                fig.update_layout(barmode="stack", margin=dict(l=20, r=20, t=24, b=20), height=140,
                                  showlegend=True, legend=dict(orientation="h", y=1.08),
                                  xaxis_title="", yaxis_title="%", yaxis=dict(range=[0, 100]))
                st.plotly_chart(fig, use_container_width=True, key="cockpit_quartile_bar")
            else:
                st.caption("Brak danych do wykresu.")
        elif quartiles_data and quartiles_data.get("total_employees", 0) > 0:
            q1, q4 = quartiles_data.get("Q1", {}), quartiles_data.get("Q4", {})
            st.caption(f"Q1 K: {q1.get('women_pct')}% M: {q1.get('men_pct')}% | Q4 K: {q4.get('women_pct')}% M: {q4.get('men_pct')}%")
        else:
            st.caption("Załaduj dane do wykresu kwartyli.")

    st.divider()


def _zone2_equal_value_grid(evg_buckets: Dict[str, Any], show_unassigned: bool = False) -> None:
    """Zone 2: Main list of job groups from proposed_groups; Why button for red flags (>5%). Unassigned moved to Diagnostic Mode (bottom)."""
    st.subheader("📋 Siatka równiej wartości (Equal Value Grid)")
    proposed = evg_buckets.get("proposed_groups") or []

    if not proposed:
        st.info("Brak grup EVG. Załaduj dane pracowników i wartościowanie stanowisk (Art. 4).")
        return
    for group in proposed:
        name = group.get("name", "—")
        pay_gap_pct = group.get("pay_gap_pct")
        total_employees = group.get("total_employees", 0)
        men = group.get("men", 0)
        women = group.get("women", 0)
        avg_salary = group.get("avg_salary")
        score_range = group.get("score_range", [0, 0])
        roles = group.get("roles") or []
        gid = group.get("id", "")

        is_red = pay_gap_pct is not None and abs(pay_gap_pct) > RED_FLAG_THRESHOLD_PCT
        gap_color = "#ef4444" if (pay_gap_pct is not None and abs(pay_gap_pct) > RED_FLAG_THRESHOLD_PCT) else "#22c55e"
        gap_str = f"{pay_gap_pct:.1f}%" if pay_gap_pct is not None else "—"

        with st.container():
            row1, row2 = st.columns([3, 1])
            with row1:
                st.markdown(
                    f'<div style="font-weight: 600;">{name}</div>'
                    f'<div style="font-size: 0.8rem; color: #888;">'
                    f'Zakres: {score_range[0]}-{score_range[1]} pkt · {total_employees} os. (M: {men}, K: {women})'
                    f'</div>',
                    unsafe_allow_html=True,
                )
            with row2:
                st.markdown(
                    f'<div style="text-align: right; color: {gap_color}; font-weight: 600;">{gap_str}</div>'
                    f'<div style="text-align: right; font-size: 0.75rem; color: #888;">Luka</div>',
                    unsafe_allow_html=True,
                )
                if is_red:
                    if st.button("Dlaczego?", key=f"why_evg_{gid}", type="primary", use_container_width=True,
                                help="Otwórz warstwę uzasadnień (Justification Layer)"):
                        st.toast("Opening Justification Layer...")

            if roles:
                with st.expander("Stanowiska w grupie", expanded=False):
                    for r in roles:
                        job_title = r.get("job_title", "—")
                        emp_count = r.get("employee_count", 0)
                        score = r.get("score")
                        score_str = str(score) if score is not None else "—"
                        st.caption(f"**{job_title}** · {emp_count} os. · score: {score_str}")

            st.markdown(
                '<div style="height: 1px; background: #333; margin: 0.5rem 0;"></div>',
                unsafe_allow_html=True,
            )

    st.divider()


def _zone3_advanced_intelligence(adjusted_gap: Optional[float] = None) -> None:
    """Zone 3: Adjusted Gap (EVG-weighted when provided) & Budget Simulation placeholder."""
    with st.container():
        st.markdown(
            '<div style="background: #f5f5f5; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; border: 1px solid #e0e0e0;">',
            unsafe_allow_html=True,
        )
        st.subheader("🧠 Zaawansowana analityka")
        st.caption("Luka skorygowana o wartość pracy (EVG) oraz symulacja budżetu.")

        c1, c2 = st.columns(2)
        with c1:
            adj_str = f"{adjusted_gap:.1f}%" if adjusted_gap is not None else "—"
            st.markdown(
                f'<div style="background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #e5e5e5;">'
                f'<div style="color: #666; font-size: 0.9rem;">Skorygowana luka (Adjusted Gap)</div>'
                f'<div style="font-size: 1.5rem; font-weight: 600; color: #333;">{adj_str}</div>'
                f'<div style="font-size: 0.75rem; color: #999;">Po kontroli wartości pracy (EVG)</div>'
                f'</div>',
                unsafe_allow_html=True,
            )
    with c2:
        st.markdown(
            '<div style="background: #fff; padding: 1rem; border-radius: 8px; border: 1px solid #e5e5e5;">'
            '<div style="color: #666; font-size: 0.9rem;">Symulacja budżetu</div>'
            '<div style="font-size: 1.5rem; font-weight: 600; color: #333;">—</div>'
            '<div style="font-size: 0.75rem; color: #999;">Szacunek kosztów wyrównania</div>'
            '</div>',
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)


def _render_unassigned_list(unassigned: List[Dict[str, Any]]) -> None:
    """Renders the list of unassigned roles on the dedicated sub-page (tab)."""
    st.caption("Przypisz te stanowiska w zakładce **Wartościowanie stanowisk** (Art. 4), aby wynik zgodności był kompletny.")
    for r in unassigned:
        job_title = r.get("job_title", "—")
        emp_count = r.get("employee_count", 0)
        st.markdown(f"- **{job_title}** · {emp_count} os.")


def render_compliance_cockpit(
    evg_buckets: Optional[Dict[str, Any]] = None,
    *,
    mean_gap: Optional[float] = None,
    median_gap: Optional[float] = None,
    adjusted_gap: Optional[float] = None,
    quartiles_data: Optional[Dict] = None,
) -> None:
    """
    Renders the Compliance Cockpit for Grażyna.
    When there are unassigned roles: shows a warning at top and the list in a dedicated sub-page (tab).
    Grażyna only sees the full Result (3 zones) once her data is clean (no unassigned roles).
    """
    if evg_buckets is None:
        evg_buckets = {
            "proposed_groups": [],
            "unassigned_roles": [],
            "summary": {"weighted_pay_gap": None, "total_assigned": 0, "total_unassigned": 0},
        }

    unassigned = evg_buckets.get("unassigned_roles") or []
    n_unassigned = len(unassigned)

    with st.container():
        st.markdown("## 🎛️ Compliance Cockpit")
        st.caption("Widok zgodności z Dyrektywą UE 2023/970 – dla Grażyny (Audit & HR).")
        st.markdown("")

    if n_unassigned > 0:
        st.warning(
            f"⚠️ **Your data needs attention ({n_unassigned} role{'s' if n_unassigned != 1 else ''} unassigned).** "
            "Assign these roles in job valuation (Art. 4) to see your full compliance result below."
        )
        tab_result, tab_unassigned = st.tabs(["Wynik zgodności", "Stanowiska nieprzypisane"])
        with tab_result:
            st.info(
                f"**Wynik zgodności pojawi się tutaj, gdy dane będą kompletne.** "
                f"Obecnie {n_unassigned} stanowisk nie ma przypisanej kategorii EVG. "
                "Otwórz zakładkę **Stanowiska nieprzypisane**, aby zobaczyć listę, następnie uzupełnij wartościowanie w zakładce **Wartościowanie stanowisk**."
            )
        with tab_unassigned:
            _render_unassigned_list(unassigned)
        return

    _zone1_audit_status(evg_buckets, mean_gap=mean_gap, median_gap=median_gap, quartiles_data=quartiles_data)
    _zone2_equal_value_grid(evg_buckets, show_unassigned=False)
    with st.container():
        st.markdown("")
    _zone3_advanced_intelligence(adjusted_gap=adjusted_gap)
