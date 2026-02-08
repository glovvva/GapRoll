# -*- coding: utf-8 -*-
"""
PayCompass Pro – generator raportu audytu PDF (profesjonalna kolorystyka i układ).
Używa fpdf2; obsługa polskich znaków przez DejaVu (font/) lub fallback Helvetica z transliteracją.
"""
from fpdf import FPDF
from datetime import datetime
import os
import math

# Kolory: Navy #1A237E, tekst #333333, ramka KPI jasnoszara
NAVY = (26, 35, 126)
TEXT_DARK = (51, 51, 51)
BOX_LIGHT = (240, 240, 240)

# Transliteracja dla fallbacku (Helvetica bez UTF-8)
_POLISH_TO_ASCII = str.maketrans(
    "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ",
    "acelnoszzACELNOSZZ",
)


def _ensure_unicode_font(pdf: FPDF) -> bool:
    """Dodaje czcionkę DejaVu z katalogu font/ obok pdf_gen.py. Zwraca True jeśli dodano."""
    base = os.path.dirname(os.path.abspath(__file__))
    font_dir = os.path.join(base, "font")
    regular = os.path.join(font_dir, "DejaVuSans.ttf")
    bold = os.path.join(font_dir, "DejaVuSans-Bold.ttf")
    if os.path.isfile(regular):
        try:
            pdf.add_font("DejaVu", "", regular)
            if os.path.isfile(bold):
                pdf.add_font("DejaVu", "B", bold)
            else:
                pdf.add_font("DejaVu", "B", regular)
            return True
        except Exception:
            pass
    return False


# Znaki niewidoczne / zero-width, które Helvetica nie obsługuje – usuwane zawsze
_INVISIBLE_UNICODE = (
    "\u200B", "\u200C", "\u200D", "\u200E", "\u200F",  # zero-width, LRM, RLM
    "\u202A", "\u202B", "\u202C", "\u202D", "\u202E",  # directional
    "\u2060", "\u2061", "\u2062", "\u2063", "\uFEFF",  # word joiner, BOM
)


def _safe_text(text: str, use_unicode: bool) -> str:
    """Zwraca tekst z polskimi znakami lub transliterowany, zależnie od czcionki.
    Zamienia problematyczne znaki Unicode na ASCII-safe odpowiedniki.
    Gdy use_unicode=False (Helvetica), usuwa znaki spoza zestawu obsługiwanego przez czcionkę.
    """
    if not text:
        return text
    # Usuń znaki niewidoczne / zero-width (powodują FPDFUnicodeEncodingException w Helvetica)
    for ch in _INVISIBLE_UNICODE:
        text = text.replace(ch, "")
    # Zamiana problematycznych znaków Unicode na ASCII
    text = text.replace("\u2022", "-")      # bullet •
    text = text.replace("\u2013", "-")      # en-dash –
    text = text.replace("\u2014", "-")      # em-dash —
    text = text.replace("\u201E", '"')      # Polish opening quote „
    text = text.replace("\u201D", '"')      # Polish closing quote "
    text = text.replace("\u2018", "'")      # left single quote '
    text = text.replace("\u2019", "'")      # right single quote '
    text = text.replace("\u2026", "...")    # ellipsis …
    text = text.replace("\u00D7", "x")      # multiplication ×
    text = text.replace("\u00B0", " deg")   # degree °
    if use_unicode:
        return text
    text = text.translate(_POLISH_TO_ASCII)
    # Helvetica obsługuje tylko Latin-1; usuń/ zastąp znaki spoza (np. z odpowiedzi AI)
    result = []
    for c in text:
        if ord(c) <= 255:
            result.append(c)
        else:
            result.append("?")
    return "".join(result)


class PayCompassReport(FPDF):
    def __init__(self, use_unicode: bool = False):
        super().__init__()
        self._use_unicode = use_unicode
        self.set_margins(left=15, top=18, right=15)
        self.set_auto_page_break(True, margin=22)

    def header(self):
        self.set_font("DejaVu", "B", 14) if self._use_unicode else self.set_font("Helvetica", "B", 14)
        self.set_text_color(*NAVY)
        self.cell(0, 10, "PAYCOMPASS PRO | RAPORT AUDYTU", new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_draw_color(*NAVY)
        self.set_line_width(0.4)
        self.line(15, self.get_y() + 2, 195, self.get_y() + 2)
        self.ln(6)

    def footer(self):
        self.set_y(-18)
        self.set_font("DejaVu", "", 8) if self._use_unicode else self.set_font("Helvetica", "", 8)
        self.set_text_color(*TEXT_DARK)
        self.cell(
            0, 8,
            _safe_text(f"Strona {self.page_no()} | Wygenerowano: ", self._use_unicode) + datetime.now().strftime("%Y-%m-%d %H:%M"),
            new_x="LMARGIN", new_y="NEXT", align="C",
        )


def create_pdf(data_summary: dict, ai_text: str):
    """
    Tworzy raport PDF. data_summary: dept, count, avg_sal (int), gap (float).
    Zwraca dane binarne (output()) do użycia w st.download_button.
    """
    pdf = PayCompassReport(use_unicode=False)
    use_unicode = _ensure_unicode_font(pdf)
    pdf._use_unicode = use_unicode

    pdf.set_author("PayCompass Pro")
    pdf.add_page()

    # ------ Nagłówek: data i dział (granat) ------
    pdf.set_font("DejaVu", "B", 11) if use_unicode else pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 8, _safe_text(f"Data audytu: {datetime.now().strftime('%Y-%m-%d %H:%M')}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 8, _safe_text(f"Analizowany dział: {data_summary['dept']}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(6)

    # ------ Sekcja KPI w jasnoszarej ramce ------
    y0 = pdf.get_y()
    pdf.set_fill_color(*BOX_LIGHT)
    pdf.rect(15, y0, 180, 32, "F")

    pdf.set_xy(20, y0 + 6)
    pdf.set_font("DejaVu", "B", 10) if use_unicode else pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 6, _safe_text("Parametry wynagrodzeń (KPI)", use_unicode), new_x="LMARGIN", new_y="NEXT")

    pdf.set_xy(20, pdf.get_y() + 2)
    pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*TEXT_DARK)

    count = int(data_summary["count"])
    avg_sal = data_summary.get("avg_sal")
    gap = float(data_summary["gap"])
    # RODO Shield: N < 3 → nie pokazujemy średniej płacy
    avg_sal_display = "N < 3" if count < 3 else f"{int(round(avg_sal))} PLN"
    pdf.cell(0, 6, _safe_text(f"  - Liczba pracowników: {count}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  - Średnia płaca: {avg_sal_display}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  - Luka płacowa (Pay Gap): {gap:.1f}%", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)

    # ------ Sekcja analizy AI (tytuł granatowy) ------
    pdf.set_font("DejaVu", "B", 11) if use_unicode else pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 8, _safe_text("Analiza ekspercka AI", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*TEXT_DARK)
    pdf.multi_cell(0, 6, _safe_text(ai_text, use_unicode))

    return pdf.output()


def generate_art7_report(employee_data: dict, market_data: dict):
    """
    Generuje profesjonalny raport PDF Art. 7 Dyrektywy UE 2023/970 –
    informacja o poziomie wynagrodzenia dla pracownika (gotowy do wysłania).

    employee_data: {
        "employee_id_anon": str,   # zanonimizowany identyfikator (np. "Pracownik #E001")
        "position": str,           # stanowisko / kategoria zaszeregowania
        "gender": str,             # płeć (do kontekstu)
    }
    market_data: {
        "category_name": str,      # nazwa kategorii (stanowisko / grupa)
        "avg_category": float,      # średnie wynagrodzenie w kategorii
        "avg_female": float,       # średnie w kategorii – kobiety
        "avg_male": float,         # średnie w kategorii – mężczyźni
        "count_category": int,     # liczba osób w kategorii (opcjonalnie)
    }

    Zwraca dane binarne (bytes) do użycia w st.download_button.
    """
    pdf = PayCompassReport(use_unicode=False)
    use_unicode = _ensure_unicode_font(pdf)
    pdf._use_unicode = use_unicode

    pdf.set_author("PayCompass Pro")
    pdf.add_page()

    # ------ Nagłówek Art. 7 ------
    pdf.set_font("DejaVu", "B", 14) if use_unicode else pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 10, _safe_text("Informacja o poziomie wynagrodzenia (Art. 7 Dyrektywy UE 2023/970)", use_unicode), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(4)

    pdf.set_font("DejaVu", "", 9) if use_unicode else pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT_DARK)
    pdf.cell(0, 6, _safe_text(f"Data udostępnienia informacji: {datetime.now().strftime('%Y-%m-%d %H:%M')}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    # ------ Dane pracownika (zanonimizowane) ------
    pdf.set_font("DejaVu", "B", 11) if use_unicode else pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 7, _safe_text("Dane adresata informacji (zanonimizowane)", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*TEXT_DARK)
    id_anon = employee_data.get("employee_id_anon", "—")
    position = employee_data.get("position", "—")
    gender = employee_data.get("gender", "—")
    pdf.cell(0, 6, _safe_text(f"  Identyfikator wewnętrzny: {id_anon}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  Kategoria zaszeregowania: {position}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  Płeć (kontekst porównawczy): {gender}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)

    # ------ Średnie wynagrodzenie w kategorii (z podziałem na płeć) ------
    pdf.set_font("DejaVu", "B", 11) if use_unicode else pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 7, _safe_text("Średnie wynagrodzenie w kategorii zaszeregowania (z podziałem na płeć)", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    pdf.set_fill_color(*BOX_LIGHT)
    pdf.rect(15, pdf.get_y(), 180, 28, "F")
    pdf.set_xy(20, pdf.get_y() + 4)
    pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*TEXT_DARK)

    cat_name = market_data.get("category_name", position)
    avg_cat = market_data.get("avg_category", 0)
    avg_f = market_data.get("avg_female", 0)
    avg_m = market_data.get("avg_male", 0)
    pdf.cell(0, 6, _safe_text(f"  Kategoria: {cat_name}", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  Średnia w kategorii (ogółem): {int(round(avg_cat))} PLN", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, _safe_text(f"  Średnia – kobiety: {int(round(avg_f))} PLN  |  Średnia – mężczyźni: {int(round(avg_m))} PLN", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(pdf.get_y() + 10)

    # ------ Notka prawna ------
    pdf.set_font("DejaVu", "B", 10) if use_unicode else pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 6, _safe_text("Cel udostępnienia danych (Art. 7 Dyrektywy 2023/970)", use_unicode), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)

    legal_note = (
        "Informacja o poziomie wynagrodzenia jest udzielana na wniosek pracownika w celu realizacji prawa "
        "do przejrzystości wynagrodzeń. Dane służą wyłącznie do porównania własnego wynagrodzenia ze średnim "
        "w tej samej kategorii zaszeregowania (z podziałem na płeć), zgodnie z Dyrektywą (UE) 2023/970. "
        "Pracodawca nie może stosować środków odwetowych wobec pracownika składającego wniosek (Art. 9)."
    )
    pdf.set_font("DejaVu", "", 9) if use_unicode else pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT_DARK)
    pdf.multi_cell(0, 5, _safe_text(legal_note, use_unicode))

    return pdf.output()


# Minimalna wielkość grupy porównawczej (RODO): poniżej 3 osób nie ujawniamy średnich
MIN_GROUP_SIZE_ART7 = 3


def generate_employee_report_pdf(employee_row, df_context, salary_col="Salary"):
    """
    Generuje profesjonalny raport PDF dla pracownika zgodnie z Art. 7 Dyrektywy UE 2023/970.
    Użyj fpdf2. RODO Shield: jeśli w kategorii (stanowisko + poziom) jest < 3 osób,
    zamiast średnich wpis: "Zbyt mała grupa porównawcza dla zapewnienia anonimowości".

    employee_row: dict lub pd.Series z kluczami:
        - position / znormalizowana_nazwa: nazwa stanowiska (do "Dla Twojego stanowiska: ...")
        - level / poziom: poziom (opcjonalnie)
        - salary_equalized: wynagrodzenie wirtualne (Equalized Gross) w PLN
        - gender: płeć (opcjonalnie)
    df_context: DataFrame z tą samą kategorią (stanowisko+poziom), z kolumnami Gender oraz salary_col.
    salary_col: nazwa kolumny z wynagrodzeniem w df_context (np. "Salary_UoP" lub "Salary").

    Zwraca bytes do użycia w st.download_button.
    """
    if hasattr(employee_row, "to_dict"):
        employee_row = employee_row.to_dict()
    emp = employee_row if isinstance(employee_row, dict) else {}

    pdf = PayCompassReport(use_unicode=False)
    use_unicode = _ensure_unicode_font(pdf)
    pdf._use_unicode = use_unicode
    pdf.set_author("PayCompass Pro")
    pdf.add_page()
    # Szerokość obszaru tekstu (unikanie błędu "Not enough horizontal space" przy multi_cell(0,...))
    w = getattr(pdf, "epw", None) or (pdf.w - pdf.l_margin - pdf.r_margin)

    # ------ Nagłówek ------
    pdf.set_font("DejaVu", "B", 14) if use_unicode else pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 10, _safe_text("Informacja o poziomie wynagrodzenia", use_unicode), new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_x(pdf.l_margin)
    pdf.ln(8)

    # ------ Podstawa prawna ------
    pdf.set_font("DejaVu", "", 9) if use_unicode else pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*TEXT_DARK)
    legal = "Dokument sporzadzony zgodnie z wymogami Art. 7 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2023/970."
    if use_unicode:
        legal = "Dokument sporządzony zgodnie z wymogami Art. 7 Dyrektywy Parlamentu Europejskiego i Rady (UE) 2023/970."
    pdf.multi_cell(w, 6, _safe_text(legal, use_unicode), align="L")
    pdf.ln(10)

    # ------ Stanowisko i poziom ------
    znormalizowana = emp.get("znormalizowana_nazwa") or emp.get("position") or emp.get("Stanowisko") or emp.get("Position") or "—"
    level = emp.get("level") or emp.get("poziom") or emp.get("Level") or emp.get("Poziom") or ""
    stanowisko_tekst = f"Dla Twojego stanowiska: {znormalizowana}"
    if level:
        stanowisko_tekst += f" (Poziom: {level})."
    else:
        stanowisko_tekst += "."
    pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(*TEXT_DARK)
    pdf.multi_cell(w, 6, _safe_text(stanowisko_tekst, use_unicode), align="L")
    pdf.ln(10)

    # ------ Sekcja: Wynagrodzenia w kategorii (obramowanie) ------
    if df_context is None or (hasattr(df_context, "empty") and df_context.empty):
        n_cat = 0
    else:
        n_cat = len(df_context)

    # Wysokość ramki: zawsze miejsce na 3 linie tekstu + Twoje wynagrodzenie + padding
    line_h = 7
    box_h = 4 * line_h + 18
    y0_box = pdf.get_y()
    pdf.set_fill_color(*BOX_LIGHT)
    pdf.rect(pdf.l_margin, y0_box, w, box_h, "F")
    pdf.set_draw_color(200, 200, 200)
    pdf.set_line_width(0.2)
    pdf.rect(pdf.l_margin, y0_box, w, box_h, "D")
    pdf.set_xy(pdf.l_margin + 6, y0_box + 6)

    # Klauzula RODO gdy grupa zbyt mała (N < 3)
    rodo_clause_short = "Zbyt mala grupa porownawcza dla zapewnienia anonimowosci." if not use_unicode else "Zbyt mała grupa porównawcza dla zapewnienia anonimowości."
    rodo_clause_full = (
        "Ze wzgledu na mala liczebnosc grupy (N < 3), dane zostaly zanonimizowane zgodnie z polityka RODO w celu ochrony prywatnosci pracownikow."
        if not use_unicode
        else "Ze względu na małą liczebność grupy (N < 3), dane zostały zanonimizowane zgodnie z polityką RODO w celu ochrony prywatności pracowników."
    )

    if n_cat < MIN_GROUP_SIZE_ART7:
        pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*TEXT_DARK)
        pdf.multi_cell(w - 12, line_h, _safe_text(rodo_clause_short, use_unicode), align="L")
        pdf.ln(line_h)
    else:
        female_labels = ("K", "Kobieta", "F")
        male_labels = ("M", "Mężczyzna", "Mezczyzna")
        if salary_col not in df_context.columns:
            salary_col = "Salary" if "Salary" in df_context.columns else df_context.columns[0]
        women = df_context[df_context["Gender"].isin(female_labels)][salary_col]
        men = df_context[df_context["Gender"].isin(male_labels)][salary_col]
        n_women, n_men = len(women), len(men)
        avg_f = float(women.mean()) if n_women > 0 else 0.0
        avg_m = float(men.mean()) if n_men > 0 else 0.0
        pdf.set_font("DejaVu", "", 10) if use_unicode else pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(*TEXT_DARK)
        # Kobiety: kwota tylko gdy N >= 3, inaczej klauzula RODO
        if n_women < MIN_GROUP_SIZE_ART7:
            lbl_k = "Srednie wynagrodzenie brutto kobiet na tym poziomie: " if not use_unicode else "Średnie wynagrodzenie brutto kobiet na tym poziomie: "
            pdf.multi_cell(w - 12, line_h, _safe_text(lbl_k + rodo_clause_full, use_unicode), align="L")
        else:
            avg_f_text = f"Srednie wynagrodzenie brutto kobiet na tym poziomie: {int(round(avg_f))} PLN." if not use_unicode else f"Średnie wynagrodzenie brutto kobiet na tym poziomie: {int(round(avg_f))} PLN."
            pdf.multi_cell(w - 12, line_h, _safe_text(avg_f_text, use_unicode), align="L")
        pdf.ln(line_h)
        # Mężczyźni: kwota tylko gdy N >= 3, inaczej klauzula RODO
        if n_men < MIN_GROUP_SIZE_ART7:
            lbl_m = "Srednie wynagrodzenie brutto mezczyzn na tym poziomie: " if not use_unicode else "Średnie wynagrodzenie brutto mężczyzn na tym poziomie: "
            pdf.multi_cell(w - 12, line_h, _safe_text(lbl_m + rodo_clause_full, use_unicode), align="L")
        else:
            avg_m_text = f"Srednie wynagrodzenie brutto mezczyzn na tym poziomie: {int(round(avg_m))} PLN." if not use_unicode else f"Średnie wynagrodzenie brutto mężczyzn na tym poziomie: {int(round(avg_m))} PLN."
            pdf.multi_cell(w - 12, line_h, _safe_text(avg_m_text, use_unicode), align="L")
        pdf.ln(line_h)

    # ------ Twoje wynagrodzenie wirtualne (w ramce) ------
    sal_eq = emp.get("salary_equalized") or emp.get("Salary_UoP") or emp.get("Salary")
    if sal_eq is None or (isinstance(sal_eq, (int, float)) and math.isnan(sal_eq)):
        sal_eq = 0
    z_val = int(round(float(sal_eq)))
    pdf.set_font("DejaVu", "B", 10) if use_unicode else pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*NAVY)
    twoje_tekst = f"Twoje wynagrodzenie wirtualne (Equalized Gross): {z_val} PLN."
    pdf.multi_cell(w - 12, line_h, _safe_text(twoje_tekst, use_unicode), align="L")
    pdf.ln(4)

    pdf.set_y(y0_box + box_h + 10)

    # ------ Stopka ------
    pdf.set_font("DejaVu", "", 8) if use_unicode else pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*TEXT_DARK)
    footer_txt = "Wygenerowano przez system PayCompass Pro. Dane zanonimizowane."
    pdf.cell(w, 6, _safe_text(footer_txt, use_unicode), new_x="LMARGIN", new_y="NEXT", align="C")

    return pdf.output()
