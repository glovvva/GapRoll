# Product Requirements Document (PRD)
## PayCompass Pro - Enterprise Pay Equity Intelligence Platform

**Version:** 2.0  
**Last Updated:** 2026-02-03  
**Status:** Active Development

---

## 1. Executive Summary

PayCompass Pro to platforma SaaS do audytu i analizy luki płacowej zgodnej z Dyrektywą UE 2023/970 (Pay Transparency Directive). System umożliwia organizacjom:
- Identyfikację dysproporcji płacowych w czasie rzeczywistym
- Generowanie raportów zgodnych z Art. 16 Dyrektywy (kwartyle płacowe, analiza składników)
- Modelowanie scenariuszy wyrównania płac (Solio Solver)
- Bezpieczne zarządzanie danymi wrażliwymi (Data Vault + RODO Shield)

**Target Market:** Firmy 100+ pracowników w UE (wymóg raportowania od 2026)  
**Revenue Model:** Freemium (Free: 50 pracowników, Pro: Unlimited + AI + Projekty)

---

## 2. Core Modules

### 2.1 Data Vault (Moduł Bezpieczeństwa)
**Cel:** Zapewnienie zgodności z RODO i ISO 27001

**Features:**
- **PII Detection:** Automatyczne wykrywanie kolumn z danymi wrażliwymi (imiona, PESEL, adresy)
- **RODO Shield:** Maskowanie wartości gdy N < 3 w grupie (wyświetla "N < 3" zamiast kwot)
- **Multi-tenancy:** Row Level Security (RLS) w Supabase - dane organizacji są całkowicie izolowane
- **Audit Log:** Historia wszystkich operacji na danych (planowane)

**Technical:**
- Funkcja: `detect_pii_columns(df)` w `logic.py`
- Funkcja: `mask_sensitive_data(value, count, threshold=3)` w `logic.py`
- RLS Policies w `db_manager.py`

---

### 2.2 Reporting Pack (Art. 16 Dyrektywy UE 2023/970)
**Cel:** Automatyczne generowanie raportów wymaganych przez UE

**Features:**
- **Quartile Analysis:** Podział pracowników na 4 kwartyle płacowe z podziałem na płeć
- **Component Gap Analysis:** Oddzielne luki dla:
  - Base Salary (wynagrodzenie zasadnicze)
  - Variable Pay (premia, bonus)
  - Allowances (dodatki)
- **Joint Pay Assessment Alert:** Automatyczny warning gdy luka > 5% w jakiejkolwiek kategorii EVG
- **RODO Compliance:** Wartości "ND" (niejawne) dla grup < 3 osób

**Technical:**
- Funkcja: `calculate_pay_quartiles(df)` w `logic.py`
- Funkcja: `calculate_component_gaps(df)` w `logic.py`
- Funkcja: `format_quartile_for_chart(quartiles)` w `logic.py`
- Wizualizacja: Plotly stacked bar chart (horizontal)

**UI Components:**
- Sekcja "📊 Analiza Zgodności (Art. 16)" w `app.py`
- 3 Metric Cards (gap dla każdego składnika)
- Alert Box (st.error) gdy luka > 5%

---

### 2.3 EVG Engine (Art. 4 - Equal Value Groups)
**Cel:** Grupowanie stanowisk o równej wartości biznesowej

**Features:**
- **AI-Powered Scoring:** Automatyczny scoring stanowisk 1-100 (GPT-4o)
- **Manual Override:** Możliwość ręcznej edycji scoringu przez użytkownika
- **Tolerance Bands:** Grupowanie stanowisk w przedziały ±5 punktów
- **Pay Gap by EVG:** Luka płacowa obliczana osobno dla każdej grupy EVG

**Technical:**
- Funkcja: `create_equal_value_groups(df, tolerance=5)` w `logic.py`
- Funkcja: `get_evg_summary(df)` w `logic.py`
- Funkcja: `calculate_pay_gap_by_evg_groups(df)` w `logic.py`
- AI: `get_ai_job_grading(positions, api_key)` - OpenAI GPT-4o

**UI Components:**
- Sekcja "Art. 4: Equal Value Groups (Pro)" w `app.py`
- Edytowalny DataFrame (st.data_editor) ze scoringiem
- Breakdown table z luką płacową dla każdej grupy EVG

---

### 2.4 Solio Solver (Wage Adjustment Engine)
**Cel:** Modelowanie scenariuszy wyrównania płac

**Features:**
- **Target Pay Gap:** Użytkownik ustawia docelową lukę (np. 0%, 2%, 5%)
- **Budget Estimation:** Kalkulacja łącznego kosztu podwyżek
- **Individual Adjustments:** Obliczenie dla każdego pracownika:
  - Current Salary
  - Fair Pay (oczekiwana płaca na podstawie scoringu)
  - Adjustment (różnica)
- **Export:** CSV z listą podwyżek + PDF raport dla zarządu

**Technical:**
- Funkcja: `calculate_fair_pay_adjustments(df, target_gap=0.0)` w `logic.py` (do implementacji)
- PDF Generator: `generate_solio_report(adjustments_df)` w `pdf_gen.py` (do implementacji)

**Formula:**
```
Fair_Pay = Median_Salary_for_Scoring_Bracket * Gender_Equity_Factor
Adjustment = Fair_Pay - Current_Salary (jeśli > 0)
Total_Budget = SUM(Adjustments)
```

---

### 2.5 B2B Equalizer (Polish Market Specific)
**Cel:** Wyrównanie porównań między UoP a B2B (specyfika polska)

**Features:**
- **ZUS Cap Adjustment:** Uwzględnienie limitu 30-krotności (282,600 PLN rocznie w 2026)
- **Leave Correction:** Korekta 11/12 dla B2B (brak płatnego urlopu)
- **NET-to-GROSS Conversion:** Przeliczanie wynagrodzenia brutto B2B na ekwiwalent UoP

**Technical:**
- Funkcja: `b2b_to_uop_bulk(df)` w `logic.py`
- Stałe: `ZUS_CAP_ANNUAL`, `B2B_LEAVE_FACTOR`, `RATE_CAPPED`, `RATE_UNCAPPED`

**Formula:**
```
ZUS_Monthly_Cap = ZUS_CAP_ANNUAL / 12
Salary_Capped = min(B2B_Gross, ZUS_Monthly_Cap)
ZUS_Below_Cap = Salary_Capped * RATE_CAPPED
ZUS_Above_Cap = (B2B_Gross - Salary_Capped) * RATE_UNCAPPED
Net_Annual = (B2B_Gross - ZUS_Below_Cap - ZUS_Above_Cap) * 12 * B2B_LEAVE_FACTOR
UoP_Equivalent = Net_Annual / 0.70  # zakładamy 30% podatek UoP
```

---

## 3. User Personas

### 3.1 HR Manager (Primary)
- **Goal:** Szybki audyt luki płacowej przed deadline raportowania
- **Pain Point:** Brak narzędzi dedykowanych dla Dyrektywy UE 2023/970
- **Key Features:** One-click reporting, CSV upload, PDF export

### 3.2 CFO / Finance Director (Secondary)
- **Goal:** Estymacja budżetu na wyrównanie płac
- **Pain Point:** Brak realnych danych o koszcie compliance
- **Key Features:** Solio Solver, Total Budget view, Scenario comparison

### 3.3 Legal / Compliance Officer (Tertiary)
- **Goal:** Weryfikacja zgodności z RODO i Dyrektywą
- **Pain Point:** Ryzyko kar za niewłaściwe przetwarzanie danych
- **Key Features:** RODO Shield, Audit Log, Anonymization

---

## 4. Technical Requirements

### 4.1 Performance
- **Data Loading:** < 2s dla 1000 pracowników
- **Chart Rendering:** < 1s dla wszystkich wizualizacji
- **AI Scoring:** < 10s dla 50 stanowisk (GPT-4o)

### 4.2 Security
- **Authentication:** Supabase Auth (email/password + social login)
- **Authorization:** Row Level Security (RLS) - użytkownik widzi tylko swoje projekty
- **Data Encryption:** At-rest (Supabase default) + in-transit (HTTPS)
- **RODO Compliance:** Automatyczne maskowanie grup < 3 osób

### 4.3 Scalability
- **Current:** Single Streamlit instance (MVP)
- **Phase 2:** Horizontal scaling via Streamlit Community Cloud / Docker
- **Phase 3:** Microservices (FastAPI backend + React frontend)

---

## 5. Success Metrics (KPIs)

### 5.1 Product Metrics
- **MAU (Monthly Active Users):** Target 1000 w Q2 2026
- **Conversion Rate (Free → Pro):** Target 15%
- **Retention Rate (90-day):** Target 60%

### 5.2 Business Metrics
- **MRR (Monthly Recurring Revenue):** Target 50k EUR w Q4 2026
- **CAC (Customer Acquisition Cost):** < 200 EUR
- **LTV (Lifetime Value):** > 2000 EUR (12+ miesięcy)

### 5.3 Usage Metrics
- **Avg Reports per User:** Target 3/month
- **Avg Dataset Size:** 200 pracowników
- **Feature Adoption (Art. 16):** Target 80% użytkowników generuje raport w ciągu 7 dni

---

## 6. Roadmap

### Phase 1: MVP (✅ Completed - Q4 2025)
- [x] CSV Upload + Auto-mapping
- [x] Basic Pay Gap Calculation
- [x] Fair Pay Line (scatter plot)
- [x] PDF Export (Art. 7 Report)

### Phase 2: EU Compliance (🔄 In Progress - Q1 2026)
- [x] Art. 16 Reporting (Quartiles + Components)
- [x] RODO Shield (masking)
- [ ] EVG Engine finalization (manual override UI)
- [ ] Joint Pay Assessment Alert

### Phase 3: AI + Automation (📅 Q2 2026)
- [ ] Solio Solver (scenario modeling)
- [ ] AI Recommendations (GPT-4o powered insights)
- [ ] Automated scheduling (monthly reports)
- [ ] Email notifications

### Phase 4: Enterprise Features (📅 Q3 2026)
- [ ] SSO (SAML, Azure AD)
- [ ] Custom branding (white-label)
- [ ] API access (REST + webhooks)
- [ ] Advanced audit log

---

## 7. Competitive Landscape

| Feature | PayCompass Pro | Syndio | Pequity | Pave |
|---------|----------------|--------|---------|------|
| EU Directive 2023/970 | ✅ Native | ⚠️ Partial | ❌ No | ❌ No |
| RODO Compliance | ✅ Built-in | ❌ No | ❌ No | ❌ No |
| B2B Equalizer | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Freemium | ✅ 50 emp free | ❌ Enterprise only | ❌ Enterprise only | ⚠️ Limited |
| Pricing | €49-199/mo | $10k+/year | $15k+/year | Custom |

**Competitive Advantage:**
1. **EU-First Design:** Jedyne narzędzie natywnie wspierające Dyrektywę 2023/970
2. **RODO by Default:** Automatyczne maskowanie danych wrażliwych
3. **Polish Market:** B2B Equalizer (UoP vs B2B) - unikalna funkcja
4. **Affordability:** 10x tańsze niż konkurencja enterprise

---

## 8. Open Questions & Risks

### 8.1 Open Questions
- [ ] Czy dodać integrację z SAP/Workday? (API complexity)
- [ ] Czy wspierać wielojęzyczność? (priorytet: EN, PL, DE)
- [ ] Jaki model cenowy dla organizacji 5000+ pracowników?

### 8.2 Risks
- **Legal Risk:** Zmiany w interpretacji Dyrektywy (mitigation: regularne konsultacje z ekspertami prawnymi)
- **Technical Debt:** Streamlit limitations dla > 10k pracowników (mitigation: migracja do FastAPI w Phase 3)
- **Data Privacy:** Breach = katastrofa PR (mitigation: penetration testing, SOC 2 certification)

---

## 9. Acceptance Criteria (Definition of Done)

### For Phase 2 (Current):
- [x] Art. 16 Reporting renders without errors
- [x] Quartile chart shows correct gender distribution
- [ ] Component gaps (Base/Variable/Allowances) display correctly
- [ ] Joint Pay Assessment Alert triggers when gap > 5%
- [ ] RODO Shield masks values when N < 3
- [x] All percentage values use JetBrains Mono font
- [ ] PDF export includes Art. 16 section

---

**Document Owner:** Product Team  
**Last Review:** 2026-02-03  
**Next Review:** 2026-03-01
