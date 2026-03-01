# GapRoll — Concierge Onboarding Checklist
## For First 50 Customers (Lemkin Lesson: Self-Service Doesn't Work for Complex Agents)

**Last Updated:** 2026-02-15  
**Owner:** Bartek  
**Target:** First 50 paying customers (May-Jun 2026)  
**Goal:** >80% customers generate Art. 16 report within 7 days

---

## Why Concierge Onboarding?

**Lemkin's Warning:**
> "Agents that require deep training cannot be self-trained yet. If you buy a cheap tool that claims it's self-trained, make sure it actually works."

**Our Reality:**
- ❌ Grażyna won't "figure out" EVG Manual Override on her own
- ❌ Self-service wizard ≠ zero support (it's still complex compliance software)
- ✅ 30-min Zoom call = trust building + training + first success

**ROI:**
- Investment: 30 min/customer × 50 = **25h total** (May-Jun)
- Return: 80%+ activation rate (vs 40% self-service baseline) = **2x revenue retention**

---

## Pre-Call Prep (5 min)

### Checklist:

- [ ] **Customer record in Supabase**
  - Email verified
  - Company name + size
  - Trial started (auto-email sent)
  
- [ ] **Send Calendly invite**
  - Subject: "GapRoll Setup Call — 15 min do pierwszego raportu Art. 16"
  - Body:
    ```
    Dzień dobry,
    
    Dziękuję za rozpoczęcie trial GapRoll!
    
    Chciałbym zaproponować 15-minutową rozmowę, na której pokażę Ci:
    - Jak wygenerować raport Art. 16 w 15 minut
    - Jak działa EVG Manual Override (gdy AI się myli)
    - Jak wyeksportować PDF zgodny z Dyrektywą
    
    Umów się tutaj: [Calendly link]
    
    Pozdrawiam,
    Bartek
    GapRoll — CPTO
    ```

- [ ] **Prepare screen share environment**
  - Login to Supabase admin panel
  - Open GapRoll dashboard (staging or production)
  - Test CSV file ready (demo-data.csv with 50 rows)

---

## Zoom Call Agenda (30 min)

### 1. Intro (2 min)

**Script:**
```
Cześć [Name], dzień dobry!

Dziękuję za czas. W ciągu 30 minut pokażę Ci jak:
1. Wygenerować raport Art. 16 w 15 minut (zamiast 3 tygodni w Excelu)
2. Sprawdzić EVG scoring i go poprawić, jeśli AI się myli
3. Wyeksportować PDF zgodny z Dyrektywą

Masz jakieś pytania zanim zaczniemy?

[Wait for response]

Okej, to zaczynamy. Widzisz mój ekran?
```

---

### 2. CSV Upload (5 min)

**Demo Steps:**

1. **Navigate to Dashboard**
   - "Kliknij 'Nowy Projekt' → nazwij np. 'Q1 2026'"
   
2. **Upload CSV**
   - "Kliknij 'Upload CSV' → wybierz plik z danymi płacowymi"
   - "GapRoll obsługuje polskie separatory (średnik) i encoding (Windows-1250)"
   
3. **Show auto-detection**
   - "System automatycznie wykrywa kolumny — ale możesz to zmienić ręcznie"

**Common Issues (proactive address):**

| Issue | Solution |
|-------|----------|
| "Nie mam CSV, tylko Excel" | "Nie problem. Otwórz Excel → Zapisz jako → CSV (średnik)" |
| "Dane zawierają błędy" | "GapRoll pokaże błędy walidacji — poprawimy razem" |
| "Mamy B2B contractors" | "Świetnie! Mamy B2B Equalizer — pokażę za chwilę" |

---

### 3. Column Mapping (5 min)

**Demo Steps:**

1. **Show mapping wizard**
   - "Tu mapujesz kolumny z CSV na pola GapRoll"
   
2. **Required fields (red asterisk):**
   - `employee_id` → "ID pracownika (może być cokolwiek unikalnego)"
   - `salary` → "Wynagrodzenie brutto (miesięczne)"
   - `gender` → "Płeć (M/K)"
   - `period` → "Okres (np. 2026-01)"

3. **Optional fields (for Strategia tier):**
   - `position` → "Stanowisko (dla EVG scoring)"
   - `department` → "Dział (dla root cause analysis)"
   - `hire_date` → "Data zatrudnienia (dla retention analysis)"

**Grażyna Question (expect this):**
> "A co jeśli nie mam stanowiska w danych?"

**Answer:**
```
Nie problem! Do raportu Art. 16 (Compliance tier) wystarczą 4 pola: 
ID, wynagrodzenie, płeć, okres.

Stanowisko potrzebne jest dopiero do EVG scoring (również w Compliance tier, 
ale opcjonalne). Jeśli nie masz, możemy je dodać później.

Pytanie: Czy chcesz teraz spróbować EVG scoring, czy najpierw wygenerujemy 
raport Art. 16 bez EVG?

[Wait for response — 90% wybierze "najpierw raport"]
```

---

### 4. EVG Manual Override Demo (5 min) — CRITICAL

**Why This Matters:**
- Lemkin: "AI agents hallucinate. You need humans in the loop."
- Grażyna: **Won't buy without Manual Override** (zero trust in AI)

**Demo Steps:**

1. **Show EVG scores**
   - "System automatycznie obliczył EVG scores (1-100) dla każdego stanowiska"
   - "Używamy 4 kryteriów: Skills, Effort, Responsibility, Conditions (Art. 4 Dyrektywy)"

2. **Click on one EVG score**
   - "Zobaczmy breakdown dla 'Senior Developer' — EVG Score: 78/100"
   
3. **Show 4-axis breakdown:**
   ```
   Skills: 22/25 (Wymaga JS, Python, AWS — poziom senior)
   Effort: 18/25 (Praca przy komputerze 8h/dzień)
   Responsibility: 20/25 (Odpowiedzialność za zespół 5 osób)
   Conditions: 18/25 (Biuro, standardowe warunki)
   ```

4. **Demonstrate Manual Override:**
   - "Nie zgadzasz się? Kliknij 'Edit Manually'"
   - "Zmieniam Skills z 22 → 20 (bo ten developer nie zna AWS)"
   - "EVG Score automatycznie się przelicza: 78 → 76"
   - "Kliknij 'Save' → zmiany zapisane w audyt log (RODO compliance)"

**Key Message:**
```
GapRoll używa AI, żeby zaoszczędzić Ci 2 tygodnie pracy.
ALE: Ty masz ZAWSZE ostatnie słowo.
AI proponuje, Ty decydujesz.

To ważne dla PIP — audytor zapyta: "Skąd te EVG scores?"
Odpowiedź: "System AI wygenerował, ja zweryfikowałam ręcznie."

[Pause for Grażyna nod]

Pytanie: Czy to daje Ci poczucie kontroli?

[Wait for "Tak" — if not, re-explain]
```

---

### 5. Generate Art. 16 Report (5 min)

**Demo Steps:**

1. **Click "Generate Report"**
   - "Kliknij przycisk — system przetwarza dane (10-30 sekund)"

2. **Show report preview**
   - "To jest raport Art. 16 zgodny z Dyrektywą UE 2023/970"
   - Scroll through sections:
     - Quartile analysis (4 quartiles × gender)
     - Component gap (base / variable / allowances)
     - Joint Pay Assessment alert (if gap >5%)

3. **Highlight legal citations**
   - "Widzisz? Każda metryka ma citation: 'Art. 16 ust. 2 lit. a)'"
   - "To jest kluczowe dla PIP — audytor musi wiedzieć skąd wzięły się liczby"

**Grażyna Question (expect this):**
> "A co jeśli PIP zapyta: 'Skąd ta liczba 12%?'"

**Answer:**
```
Kliknij na metrykę → zobaczysz tooltip:

"Luka płacowa: 12%
Definicja: Średnia różnica wynagrodzenia kobiet vs mężczyzn
Podstawa prawna: Art. 16 ust. 2 lit. a) Dyrektywy UE 2023/970
Interpretacja: Kobiety zarabiają średnio 12% mniej niż mężczyźni"

Możesz to pokazać PIP — wszystko jest udokumentowane.

[Pause]

Pytanie: Czy to wystarczy żeby obronić się przed PIP?

[Wait for "Tak"]
```

---

### 6. PDF Export (3 min)

**Demo Steps:**

1. **Click "Export PDF"**
   - "Kliknij przycisk → PDF generuje się automatycznie (5-10 sekund)"

2. **Open PDF**
   - "Zobaczmy co dostaniesz"
   - Scroll through:
     - Cover page (company name, period, date)
     - Executive summary
     - Quartile tables
     - Legal citations (footer: "Art. 16 Dyrektywy UE 2023/970")

3. **Show RODO compliance**
   - "Widzisz? Jeśli grupa ma mniej niż 3 osoby, dane są zamaskowane: '< 3 employees'"
   - "To jest RODO compliance — nie ujawniamy danych indywidualnych"

**Key Message:**
```
Ten PDF jest gotowy do wysłania:
- Do zarządu (Executive Summary)
- Do PIP (jeśli będzie audyt)
- Do pracowników (Art. 7 — na żądanie)

Nie musisz nic edytować. Wystarczy kliknąć 'Download'.

[Pause]

Pytanie: Czy to oszczędza Ci czas vs Excel?

[Wait for "Tak, absolutnie"]
```

---

### 7. Q&A + Next Steps (5 min)

**Common Questions:**

| Question | Answer |
|----------|--------|
| "Ile to kosztuje?" | "99 PLN/mies dla Compliance tier (wszystko co pokazałem). Strategia tier (advanced analytics) 499 PLN/mies." |
| "Czy mogę anulować w każdej chwili?" | "Tak, brak zobowiązania. Anuluj kiedy chcesz." |
| "Czy dane są bezpieczne?" | "Tak. Servery w Niemczech (Hetzner), RODO compliance, EU data residency." |
| "A co jeśli mam pytanie prawne?" | "Mamy Guardian Agent (AI prawnika) — ale zawsze kończy: 'Zalecam konsultację z radcą prawnym' (nie jesteśmy kancelarią)." |
| "Czy mogę pokazać to księgowej?" | "Tak! Zaproś ją do projektu (User Management → Add User)." |

**Next Steps Script:**
```
Okej, to co teraz?

1. [Jeśli trial aktywny] "Masz 14 dni trial — wygeneruj raport dla swojej firmy"
2. [Jeśli trial zakończony] "Czy chcesz kontynuować? Kliknij 'Upgrade to Compliance' (99 PLN/mies)"
3. "Jeśli masz pytania — napisz na support@gaproll.eu (odpowiadam w 24h)"
4. "Za 7 dni wyślę Ci auto-email: 'Jak idzie?' — żeby sprawdzić czy wszystko działa"

Pytanie: Czy masz jeszcze jakieś pytania?

[Wait for response]

[If no questions]

Super! Dziękuję za czas. Powodzenia z raportem!

[End call]
```

---

## Post-Call Follow-Up (10 min)

### Checklist:

- [ ] **Send recording link + FAQ PDF**
  - Email template:
    ```
    Temat: Recording + FAQ — GapRoll Setup Call
    
    Cześć [Name],
    
    Dziękuję za rozmowę!
    
    Jak obiecałem, przesyłam:
    - Recording: [Zoom link]
    - FAQ PDF: [Attachment]
    
    Jeśli masz pytania — pisz śmiało.
    
    Pozdrawiam,
    Bartek
    ```

- [ ] **Tag customer in Supabase**
  - Add tag: `onboarded_concierge`
  - Add note: "Onboarding call [date], customer understood EVG Override"

- [ ] **Schedule 7-day check-in**
  - n8n workflow (automated):
    ```
    Trigger: 7 days after onboarding call
    Email:
    "Cześć [Name],
    
    Minął tydzień od naszej rozmowy. Jak idzie z GapRoll?
    Czy udało się wygenerować raport Art. 16?
    
    Jeśli potrzebujesz pomocy — daj znać!
    
    Bartek"
    ```

---

## Success Metrics

| Metric | Target | Tracking Method |
|--------|--------|-----------------|
| **Onboarding completion rate** | >95% | Supabase tag: `onboarded_concierge` |
| **First report within 7 days** | >80% | Supabase query: `created_at < 7 days AND report_generated = TRUE` |
| **Upgrade to paid (after trial)** | >60% | Supabase: `trial_end_date < NOW() AND subscription_status = 'active'` |
| **Customer satisfaction (NPS)** | >40 | Post-call survey (optional, via Typeform) |

---

## Scaling Beyond 50 Customers

**When to stop Concierge Onboarding:**
- After 50 customers (Jun 2026)
- When self-service activation rate >70% (Aug 2026?)

**What to replace it with:**
- ✅ Recorded video tutorial (Loom, 15 min)
- ✅ Interactive wizard improvements (tooltips, inline help)
- ✅ Chat support (Intercom, 24h response)

**But keep Concierge for:**
- 🏢 **Enterprise tier** (white-label partners, custom integrations)
- 🔥 **High-value leads** (biura rachunkowe with >100 clients)

---

## Tools Needed

| Tool | Purpose | Cost | Setup Deadline |
|------|---------|------|----------------|
| **Calendly** | Booking calls | Free tier (1 event type) | Apr 20 |
| **Zoom** | Video calls | Free tier (40 min limit = fine) | Already have |
| **Loom** | Recording follow-up | Free tier (25 videos) | Apr 20 |
| **n8n** | Auto-email workflows | €20/mies (cloud) | Mar 1 (already planned) |
| **Typeform** | NPS survey (optional) | Free tier (10 responses/month) | May 1 |

---

## Lessons from Lemkin (Applied to GapRoll)

| Lemkin Quote | GapRoll Application |
|--------------|---------------------|
| "Self-trained agents don't work for complex tools" | ✅ Concierge onboarding for first 50 |
| "We spend 15-20h/week managing agents" | ✅ Bartek spends 7h/week babysitting Hunter/Guardian |
| "Agents over-promise without constraints" | ✅ Hunter Constraints List (Section 2.6 in 06_AGENT_BLUEPRINTS.md) |
| "Talk to forward-deployed engineers before buying" | ✅ We're building, not buying — but same principle: Test with users early |

---

**END OF ONBOARDING CHECKLIST**

**Next Review:** After first 10 customers onboarded (May 15, 2026)  
**Owner:** Bartek  
**Estimated Time Investment:** 30 min/customer × 50 = **25h total** (May-Jun 2026)
