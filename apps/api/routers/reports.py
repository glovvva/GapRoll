"""
Router raportów — podgląd i eksport PDF Raportu Art. 16 (Dyrektywa UE 2023/970).
PDF generowany przez ReportLab (bez zależności systemowych jak WeasyPrint/GTK).
"""

import io
import os
import statistics
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from starlette.requests import Request

from limiter import limiter
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from config import settings
from routers.auth import get_current_user
from supabase_client import get_supabase_client
from utils.audit import log_audit_event


def _register_polish_fonts() -> tuple[str, str]:
    """Register fonts supporting Polish UTF-8 characters (ą ę ś ź ż ó ł ń ć)."""
    try:
        import reportlab

        rl_dir = os.path.dirname(reportlab.__file__)
        font_path = os.path.join(rl_dir, "fonts", "DejaVuSans.ttf")

        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont("DejaVuSans", font_path))
            pdfmetrics.registerFont(
                TTFont("DejaVuSans-Bold", os.path.join(rl_dir, "fonts", "DejaVuSans-Bold.ttf"))
            )
            return "DejaVuSans", "DejaVuSans-Bold"
    except Exception:
        pass

    # Fallback: use system font on Windows
    win_font = r"C:\Windows\Fonts\arial.ttf"
    win_font_bold = r"C:\Windows\Fonts\arialbd.ttf"
    if os.path.exists(win_font):
        pdfmetrics.registerFont(TTFont("Arial", win_font))
        pdfmetrics.registerFont(TTFont("Arial-Bold", win_font_bold))
        return "Arial", "Arial-Bold"

    # Last resort: Helvetica (no Polish chars but won't crash)
    return "Helvetica", "Helvetica-Bold"


FONT_NORMAL, FONT_BOLD = _register_polish_fonts()

router = APIRouter(prefix="/reports", tags=["reports"])


def _sanitize_text(v):  # noqa: ANN001
    if not isinstance(v, str):
        return v
    dangerous_sql = [
        "--", ";--", "/*", "*/", "xp_",
        "EXEC ", "DROP ", "DELETE ", "INSERT ", "UPDATE ", "UNION ",
    ]
    v_upper = v.upper()
    if any(d in v_upper for d in dangerous_sql):
        raise ValueError("Invalid characters detected")
    if "<script" in v.lower() or "javascript:" in v.lower() or "onerror=" in v.lower():
        raise ValueError("HTML/JS not allowed")
    return v.strip()


class Art16ExportBody(BaseModel):
    company_name: str = Field(..., max_length=200)
    krs_number: str = Field(..., max_length=20)
    reporting_period_start: str = Field(..., max_length=10)
    reporting_period_end: str = Field(..., max_length=10)
    employee_count: Optional[int] = Field(None, ge=1, le=100000)

    @field_validator("company_name", mode="before")
    @classmethod
    def sanitize_company_name(cls, v):
        return _sanitize_text(v)


def _normalize_gender(gender: str) -> Optional[str]:
    g = (gender or "").strip().lower()
    if g in ["mężczyzna", "male", "m", "męzczyzna"]:
        return "male"
    if g in ["kobieta", "female", "f", "k"]:
        return "female"
    return None


def _fetch_art16_data(supabase: Any, user_id: str) -> Dict[str, Any]:
    """Pobiera dane payroll i oblicza kwartyle + luka średnia/mediana. Bez PII w odpowiedzi."""
    response = (
        supabase.table("payroll_data")
        .select("position, gender, salary")
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Brak danych do wygenerowania raportu. Wgraj plik CSV najpierw.",
        )

    data = response.data
    all_salaries = [
        float(row.get("salary") or 0)
        for row in data
        if float(row.get("salary") or 0) > 0
    ]
    if len(all_salaries) < 4:
        raise HTTPException(
            status_code=400,
            detail="Za mało danych (wymagane minimum 4 pracowników).",
        )

    all_salaries_sorted = sorted(all_salaries)
    q1_b = float(np.percentile(all_salaries_sorted, 25))
    q2_b = float(np.percentile(all_salaries_sorted, 50))
    q3_b = float(np.percentile(all_salaries_sorted, 75))

    quartile_data: Dict[str, Dict[str, List[float]]] = {
        "Q1": {"male": [], "female": []},
        "Q2": {"male": [], "female": []},
        "Q3": {"male": [], "female": []},
        "Q4": {"male": [], "female": []},
    }

    male_all: List[float] = []
    female_all: List[float] = []

    for row in data:
        salary = float(row.get("salary") or 0)
        if salary <= 0:
            continue
        gender_key = _normalize_gender(str(row.get("gender") or ""))
        if gender_key is None:
            continue
        if gender_key == "male":
            male_all.append(salary)
        else:
            female_all.append(salary)

        if salary <= q1_b:
            quartile_data["Q1"][gender_key].append(salary)
        elif salary <= q2_b:
            quartile_data["Q2"][gender_key].append(salary)
        elif salary <= q3_b:
            quartile_data["Q3"][gender_key].append(salary)
        else:
            quartile_data["Q4"][gender_key].append(salary)

    labels = {
        "Q1": "Q1 (najniższe)",
        "Q2": "Q2",
        "Q3": "Q3",
        "Q4": "Q4 (najwyższe)",
    }
    quartiles: List[Dict[str, Any]] = []
    n_suppressed = 0
    for q_name in ["Q1", "Q2", "Q3", "Q4"]:
        male_s = quartile_data[q_name]["male"]
        female_s = quartile_data[q_name]["female"]
        total = len(male_s) + len(female_s)
        if total == 0:
            quartiles.append({
                "quartile": q_name,
                "label": labels[q_name],
                "percent_male": 0.0,
                "percent_female": 0.0,
                "suppressed": True,
            })
            n_suppressed += 1
            continue
        count_m = len(male_s)
        count_f = len(female_s)
        suppressed = count_m < 3 or count_f < 3
        if suppressed:
            n_suppressed += 1
        quartiles.append({
            "quartile": q_name,
            "label": labels[q_name],
            "percent_male": round(count_m / total * 100, 2),
            "percent_female": round(count_f / total * 100, 2),
            "suppressed": suppressed,
        })

    total_employees = len(male_all) + len(female_all)
    mean_m = statistics.mean(male_all) if male_all else 0.0
    mean_f = statistics.mean(female_all) if female_all else 0.0
    median_m = statistics.median(male_all) if male_all else 0.0
    median_f = statistics.median(female_all) if female_all else 0.0
    mean_gap_pct = round((mean_m - mean_f) / mean_m * 100, 2) if mean_m > 0 else 0.0
    median_gap_pct = round((median_m - median_f) / median_m * 100, 2) if median_m > 0 else 0.0

    last_evg = None
    try:
        r = (
            supabase.table("evg_audit_log")
            .select("created_at, changed_by")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if r.data and len(r.data) > 0:
            last_evg = r.data[0].get("created_at")
    except Exception:
        pass

    return {
        "quartiles": quartiles,
        "total_employees": total_employees,
        "mean_gap_pct": mean_gap_pct,
        "median_gap_pct": median_gap_pct,
        "n_suppressed": n_suppressed,
        "last_evg_modified": last_evg,
    }


@router.get("/art16/preview")
async def get_art16_preview(
    user_id: str = Depends(get_current_user),
) -> Dict[str, Any]:
    """Zwraca dane JSON do podglądu raportu Art. 16 (te same dane co do PDF)."""
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)
    return _fetch_art16_data(supabase, user_id)


def _format_pl_date(iso_date: Optional[str]) -> str:
    if not iso_date:
        return "—"
    try:
        dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        return dt.strftime("%d.%m.%Y")
    except Exception:
        return iso_date


def _pct_fmt(x: float) -> str:
    return str(x).replace(".", ",") + "%"


def _build_art16_pdf_reportlab(
    company_name: str,
    krs_number: str,
    period_start: str,
    period_end: str,
    employee_count: int,
    data: Dict[str, Any],
    generated_date: str,
    last_evg_str: str,
    user_email_masked: str,
) -> bytes:
    """Generuje PDF Raportu Art. 16 (5 sekcji) za pomocą ReportLab. Zwraca bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2.5 * cm,
    )
    styles = getSampleStyleSheet()
    h1_style = ParagraphStyle(
        "Art16H1",
        parent=styles["Heading1"],
        fontName=FONT_BOLD,
        fontSize=18,
        spaceAfter=6,
    )
    h2_style = ParagraphStyle(
        "Art16H2",
        parent=styles["Heading2"],
        fontName=FONT_BOLD,
        fontSize=13,
        spaceBefore=20,
        spaceAfter=8,
        borderPadding=0,
        borderWidth=0,
        borderColor=colors.black,
        leftIndent=0,
        borderPaddingBottom=4,
    )
    meta_style = ParagraphStyle(
        "Art16Meta",
        parent=styles["Normal"],
        fontName=FONT_NORMAL,
        fontSize=10,
        textColor=colors.HexColor("#444444"),
        spaceAfter=4,
    )
    normal_style = ParagraphStyle(
        "Art16Normal",
        parent=styles["Normal"],
        fontName=FONT_NORMAL,
        fontSize=11,
    )

    story: List[Any] = []

    story.append(Paragraph("Raport Równości Wynagrodzeń", h1_style))
    story.append(Paragraph(
        "<b>Zgodny z Art. 16 Dyrektywy UE 2023/970</b>",
        meta_style,
    ))
    story.append(Paragraph(
        f"Firma: {company_name} | KRS: {krs_number}",
        meta_style,
    ))
    story.append(Paragraph(
        f"Okres: {period_start} — {period_end} | Liczba pracowników: {employee_count}",
        meta_style,
    ))
    story.append(Paragraph(f"Data wygenerowania: {generated_date}", meta_style))
    story.append(Paragraph(
        "Podstawa prawna: Art. 16 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2023/970",
        meta_style,
    ))
    story.append(Spacer(1, 12))

    qs = data["quartiles"]
    mean_gap = data["mean_gap_pct"]
    median_gap = data["median_gap_pct"]
    n_suppressed = data["n_suppressed"]

    if mean_gap > 15:
        interpretation = "Wymaga natychmiastowego planu naprawczego."
    elif mean_gap > 5:
        interpretation = "Wymaga Joint Pay Assessment (Art. 9)."
    else:
        interpretation = "Zgodne z wymogami dyrektywy."

    story.append(Paragraph(
        "Sekcja 1 — Luka płacowa (Art. 16 ust. 2 lit. a)",
        h2_style,
    ))
    story.append(Paragraph(
        f"Średnia luka: {_pct_fmt(mean_gap)} (wzór: (wynagrodzenie_M − wynagrodzenie_K) / wynagrodzenie_M × 100).",
        normal_style,
    ))
    story.append(Paragraph(f"Mediana luki: {_pct_fmt(median_gap)}.", normal_style))
    story.append(Paragraph(
        f"<b>Interpretacja:</b> {interpretation}",
        normal_style,
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Sekcja 2 — Rozkład kwartyłowy (Art. 16 ust. 2 lit. a)",
        h2_style,
    ))
    table_data = [["Kwartyl", "% Kobiet", "% Mężczyzn", "Uwagi"]]
    for q in qs:
        if q.get("suppressed"):
            table_data.append([q["label"], "—", "—", "Dane wygaszone (RODO)"])
        else:
            table_data.append([
                q["label"],
                _pct_fmt(q["percent_female"]),
                _pct_fmt(q["percent_male"]),
                "",
            ])
    t = Table(table_data)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eeeeee")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
        ("FONTNAME", (0, 0), (-1, -1), FONT_NORMAL),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    story.append(Paragraph(
        "Sekcja 3 — Składniki wynagrodzenia (Art. 16 ust. 2 lit. b)",
        h2_style,
    ))
    story.append(Paragraph(
        "Wynagrodzenie podstawowe: luka uwzględniona w średniej powyżej.",
        normal_style,
    ))
    story.append(Paragraph("Wynagrodzenie zmienne: Brak danych.", normal_style))
    story.append(Paragraph("Dodatki: Brak danych.", normal_style))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Sekcja 4 — Zgodność z RODO", h2_style))
    story.append(Paragraph(
        f"Liczba grup wygaszonych (N&lt;3): {n_suppressed} grup.",
        normal_style,
    ))
    story.append(Paragraph(
        "PII: Dane osobowe pracowników nie są zawarte w raporcie.",
        normal_style,
    ))
    story.append(Paragraph(
        "Przechowywanie: Dane przechowywane przez 3 lata zgodnie z wymogami PIP.",
        normal_style,
    ))
    story.append(Paragraph(
        "Lokalizacja: Serwery EU (Hetzner, Niemcy/Finlandia).",
        normal_style,
    ))
    story.append(Spacer(1, 12))

    story.append(Paragraph("Sekcja 5 — Podpis i oświadczenie", h2_style))
    story.append(Paragraph(
        "Raport wygenerowany automatycznie przez GapRoll.",
        normal_style,
    ))
    story.append(Paragraph(
        f"Dane źródłowe: import CSV. Ostatnia modyfikacja EVG: {last_evg_str} przez {user_email_masked}",
        normal_style,
    ))
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "Podpis osoby odpowiedzialnej: ________________",
        normal_style,
    ))
    story.append(Paragraph("Data: ________________", normal_style))

    def add_footer(canvas, _doc):
        page_num = canvas.getPageNumber()
        canvas.saveState()
        canvas.setFont(FONT_NORMAL, 9)
        canvas.setFillColor(colors.HexColor("#666666"))
        canvas.drawCentredString(
            A4[0] / 2,
            1.5 * cm,
            f"GapRoll — Zgodność z Dyrektywą UE 2023/970 | gaproll.eu | Strona {page_num}",
        )
        canvas.restoreState()

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    return buffer.getvalue()


def _build_art16_pdf_html(
    company_name: str,
    krs_number: str,
    period_start: str,
    period_end: str,
    employee_count: int,
    data: Dict[str, Any],
    generated_date: str,
    last_evg_str: str,
    user_email_masked: str,
) -> str:
    qs = data["quartiles"]
    mean_gap = data["mean_gap_pct"]
    median_gap = data["median_gap_pct"]
    n_suppressed = data["n_suppressed"]

    if mean_gap > 15:
        interpretation = "Wymaga natychmiastowego planu naprawczego."
    elif mean_gap > 5:
        interpretation = "Wymaga Joint Pay Assessment (Art. 9)."
    else:
        interpretation = "Zgodne z wymogami dyrektywy."

    def pct_fmt(x: float) -> str:
        return str(x).replace(".", ",") + "%"

    rows = ""
    for q in qs:
        if q.get("suppressed"):
            uwagi = "Dane wygaszone (RODO)"
            pct_k = "—"
            pct_m = "—"
        else:
            pct_k = pct_fmt(q["percent_female"])
            pct_m = pct_fmt(q["percent_male"])
            uwagi = ""
        rows += f"""
        <tr>
            <td>{q['label']}</td>
            <td>{pct_k}</td>
            <td>{pct_m}</td>
            <td>{uwagi}</td>
        </tr>"""

    return f"""
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <title>Raport Art. 16</title>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
            @bottom-center {{
                content: "GapRoll — Zgodność z Dyrektywą UE 2023/970 | gaproll.eu | Strona " counter(page) " z " counter(pages);
                font-size: 9pt;
                color: #666;
            }}
        }}
        body {{ font-family: DejaVu Sans, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.4; }}
        h1 {{ font-size: 18pt; margin-bottom: 4px; }}
        h2 {{ font-size: 13pt; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #333; }}
        .meta {{ font-size: 10pt; color: #444; margin-bottom: 20px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
        th, td {{ border: 1px solid #333; padding: 6px 8px; text-align: left; }}
        th {{ background: #eee; }}
        .signature-block {{ margin-top: 30px; }}
    </style>
</head>
<body>
    <h1>Raport Równości Wynagrodzeń</h1>
    <p class="meta"><strong>Zgodny z Art. 16 Dyrektywy UE 2023/970</strong></p>
    <p class="meta">Firma: {company_name} | KRS: {krs_number}</p>
    <p class="meta">Okres: {period_start} — {period_end} | Liczba pracowników: {employee_count}</p>
    <p class="meta">Data wygenerowania: {generated_date}</p>
    <p class="meta">Podstawa prawna: Art. 16 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2023/970</p>

    <h2>Sekcja 1 — Luka płacowa (Art. 16 ust. 2 lit. a)</h2>
    <p>Średnia luka: {pct_fmt(mean_gap)} (wzór: (wynagrodzenie_M − wynagrodzenie_K) / wynagrodzenie_M × 100).</p>
    <p>Mediana luki: {pct_fmt(median_gap)}.</p>
    <p><strong>Interpretacja:</strong> {interpretation}</p>

    <h2>Sekcja 2 — Rozkład kwartyłowy (Art. 16 ust. 2 lit. a)</h2>
    <table>
        <thead><tr><th>Kwartyl</th><th>% Kobiet</th><th>% Mężczyzn</th><th>Uwagi</th></tr></thead>
        <tbody>{rows}
        </tbody>
    </table>

    <h2>Sekcja 3 — Składniki wynagrodzenia (Art. 16 ust. 2 lit. b)</h2>
    <p>Wynagrodzenie podstawowe: luka uwzględniona w średniej powyżej.</p>
    <p>Wynagrodzenie zmienne: Brak danych.</p>
    <p>Dodatki: Brak danych.</p>

    <h2>Sekcja 4 — Zgodność z RODO</h2>
    <p>Liczba grup wygaszonych (N&lt;3): {n_suppressed} grup.</p>
    <p>PII: Dane osobowe pracowników nie są zawarte w raporcie.</p>
    <p>Przechowywanie: Dane przechowywane przez 3 lata zgodnie z wymogami PIP.</p>
    <p>Lokalizacja: Serwery EU (Hetzner, Niemcy/Finlandia).</p>

    <h2>Sekcja 5 — Podpis i oświadczenie</h2>
    <p>Raport wygenerowany automatycznie przez GapRoll.</p>
    <p>Dane źródłowe: import CSV. Ostatnia modyfikacja EVG: {last_evg_str} przez {user_email_masked}</p>
    <p class="signature-block">Podpis osoby odpowiedzialnej: ________________</p>
    <p>Data: ________________</p>
</body>
</html>"""


@router.post("/art16/export")
@limiter.limit("60/minute")
async def export_art16_pdf(
    request: Request,
    body: Art16ExportBody,
    user_id: str = Depends(get_current_user),
):
    """Generuje i zwraca plik PDF Raportu Art. 16."""
    if not settings.is_supabase_configured():
        raise HTTPException(status_code=503, detail="Supabase nie jest skonfigurowane.")

    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    supabase = get_supabase_client(settings.SUPABASE_URL, key)

    try:
        data = _fetch_art16_data(supabase, user_id)
    except HTTPException:
        raise

    if not body.employee_count:
        try:
            count_result = (
                supabase.table("payroll_data")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            employee_count = getattr(count_result, "count", None) or data["total_employees"]
        except Exception:
            employee_count = data["total_employees"]
    else:
        employee_count = body.employee_count
    generated_date = datetime.now(timezone.utc).strftime("%d.%m.%Y")
    last_evg_str = _format_pl_date(data.get("last_evg_modified"))
    user_email_masked = "użytkownik (zalogowany)"

    try:
        pdf_bytes = _build_art16_pdf_reportlab(
            company_name=body.company_name,
            krs_number=body.krs_number,
            period_start=_format_pl_date(body.reporting_period_start) if body.reporting_period_start else "—",
            period_end=_format_pl_date(body.reporting_period_end) if body.reporting_period_end else "—",
            employee_count=employee_count,
            data=data,
            generated_date=generated_date,
            last_evg_str=last_evg_str,
            user_email_masked=user_email_masked,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Błąd generowania PDF. Spróbuj ponownie.",
        ) from e

    try:
        supabase.table("art16_export_log").insert({
            "user_id": user_id,
            "company_name": body.company_name,
            "exported_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except Exception:
        pass

    try:
        await log_audit_event(
            supabase_client=supabase,
            user_id=user_id,
            action="report.art16_exported",
            resource_type="report",
            resource_id=user_id,
            metadata={"format": getattr(body, "format", "pdf")},
            request=request,
        )
    except Exception:
        pass

    filename = f"GapRoll_Art16_{datetime.now(timezone.utc).strftime('%Y-%m-%d')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
