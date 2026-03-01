# Blog publish checklist — Generate, Review, Publish, Track

## 1. Generate article

**Cursor Composer:** `Napisz artykuł SEO dla keyword: [keyword z tabeli]`

- Użyj skill P2-seo-content-machine.
- Keyword z `/.ai/skills/P2-seo-content-machine/references/target-keywords.md`.

---

## 2. Review output

| Check | Status |
|-------|--------|
| **Struktura** — H1 z keywordem | ✓ |
| **H2** — Czym jest, Kto musi, Kary, GapRoll, FAQ | ✓ |
| **FAQ** — min. 3–4 pytania i odpowiedzi | ✓ |
| **Cytowania** — Art. 4, 7, 9, 16 Dyrektywy (UE) 2023/970 | ✓ |
| **CTA** — „Sprawdź zgodność / bezpłatny audyt” | ✓ |
| **Meta description** — 150–160 znaków | ✓ |

### Review: dyrektywa-2023-970-termin-wdrozenia
- **H1:** „Dyrektywa 2023/970 — termin wdrożenia i obowiązki pracodawców” ✓
- **H2:** 5 sekcji (Czym jest, Kto musi, Kary, GapRoll, FAQ) ✓
- **FAQ:** 4 Q&A ✓
- **Art. 4, 7, 9, 16** — wszystkie w tekście ✓
- **CTA:** „Sprawdź zgodność... bezpłatny audyt” + link ✓
- **Meta description:** 158 znaków ✓

---

## 3. Publish

- **Markdown (headless CMS):** plik w `/content/blog/[slug].md`
- **WordPress / Webflow:** wklej HTML z `/content/blog/[slug].html` (lub wyeksportuj z CMS).

### Meta dla CMS / SEO
- **Title:** Dyrektywa 2023/970 — termin wdrożenia w Polsce. Obowiązki pracodawców
- **Meta description:** Dyrektywa 2023/970 termin wdrożenia: 7 czerwca 2026. Kto musi raportować lukę płacową, jakie kary za brak raportu. Praktyczny przewodnik dla HR.
- **Slug:** `dyrektywa-2023-970-termin-wdrozenia`
- **Alt text (obrazy):** przy dodaniu obrazka użyj np. „Kalendarz z datą 7 czerwca 2026 — termin wdrożenia Dyrektywy UE 2023/970” lub „Infografika: kto musi raportować lukę płacową według art. 9 Dyrektywy 2023/970”.

---

## 4. Track

- **Google Search Console:** dodaj URL strony (np. `https://twoja-domena.pl/blog/dyrektywa-2023-970-termin-wdrozenia`) → Sprawdź adres URL / Zgłoś indeksowanie.
- **Monitorowanie (od ok. tygodnia 8):** GSC → Wydajność → filtry: zapytanie zawierające „dyrektywa 2023/970 termin” — śledź wyświetlenia, kliknięcia, pozycję.
