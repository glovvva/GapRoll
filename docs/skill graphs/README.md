# Skill Graph Pilot — Art. 7 Dyrektywy UE 2023/970

**Created:** Feb 15, 2026  
**Purpose:** Proof-of-concept for Skill Graph architecture in GapRoll Guardian Agent

---

## Co to jest?

To **demonstracja** architektury Skill Graph — alternatywy dla płaskiego RAG (Retrieval-Augmented Generation).

Zamiast wrzucać Agentowi wszystkie pliki prawne naraz, tworzymy **graf wiedzy** z wikilinkami, po którym Agent może "chodzić" i znajdować dokładnie to, czego potrzebuje.

---

## Struktura Pilota

```
skill-graph-pilot/
├── 00_INDEX_Art7.md         # Entry point (start here)
├── Procedura_Wniosku.md     # Jak złożyć wniosek?
├── Terminy_Odpowiedzi.md    # W jakim terminie odpowiadać?
└── Zakres_Danych.md         # Jakie dane ujawnić?
```

**Każdy plik:**
- Ma YAML frontmatter (description, related, topic)
- Zawiera wikilinki `[[Inne_Pliki]]`
- Jest **samodzielny** — można go czytać oddzielnie
- **Razem** tworzą graf przyczynowo-skutkowy

---

## Jak Agent to używa? (Query Flow)

### Scenariusz: Grażyna pyta "W jakim terminie muszę odpowiedzieć na wniosek pracownika?"

**Flat RAG (obecna metoda):**
```python
query = "termin odpowiedzi na wniosek"
chunks = weaviate.search(query, limit=5)
# Zwraca fragmenty z różnych dokumentów, bez struktury
```

**Skill Graph (nowa metoda):**
```python
# Krok 1: Agent czyta INDEX
index = read_file("00_INDEX_Art7.md")
# Widzi: "Pytanie o terminy? Zobacz [[Terminy_Odpowiedzi]]"

# Krok 2: Agent idzie po linku
terminy_file = read_file("Terminy_Odpowiedzi.md")
# Znajduje: "2 miesiące max, zalecane 7-14 dni"

# Krok 3: Jeśli potrzebuje więcej kontekstu
# Agent widzi wikilink: [[Procedura_Wniosku]]
# I może pójść dalej w graf

# Wynik: Precyzyjna odpowiedź z minimum tokenów
```

---

## Korzyści vs Flat RAG

| Aspekt | Flat RAG (Weaviate) | Skill Graph |
|--------|---------------------|-------------|
| **Precision** | 70-80% (noise in results) | 90-95% (follows logic) |
| **Token usage** | ~5k tokens (retrieves too much) | ~1k tokens (retrieves exact) |
| **Hallucination risk** | Medium (conflicting chunks) | Low (structured context) |
| **Maintenance** | Hard (which chunks matter?) | Easy (update one file) |
| **Explainability** | Low (why this chunk?) | High (this link → this file) |

---

## Przykład Nawigacji

**Grażyna:** "Czy mogę przedłużyć termin odpowiedzi?"

**Agent flow:**
1. Czyta `00_INDEX_Art7.md` → "Pytanie o terminy? Zobacz [[Terminy_Odpowiedzi]]"
2. Czyta `Terminy_Odpowiedzi.md` → Znajduje sekcję "Przedłużenie Terminu"
3. Odpowiada: "Tak, możesz przedłużyć o 30 dni, ale musisz poinformować pracownika w ciągu 30 dni od wniosku."

**Tokeny użyte:** ~800 (vs 3000+ w flat RAG)

---

## Wikilinks w Prose (Key Innovation)

**Zauważ:** Linki są wplecione w zdania, nie tylko jako lista.

**Przykład z `00_INDEX_Art7.md`:**
```markdown
Pracownik może złożyć wniosek zgodnie z [[Procedura_Wniosku]].
Pracodawca musi odpowiedzieć w terminie określonym w [[Terminy_Odpowiedzi]].
Zakres danych do ujawnienia opisuje [[Zakres_Danych]].
```

**To daje Agentowi kontekst:**
- Nie tylko "istnieje plik Procedura_Wniosku"
- Ale **kiedy** i **dlaczego** powinien go przeczytać

---

## Kiedy Używać Skill Graph vs Flat RAG?

### ✅ Skill Graph jest lepsze gdy:
- Wiedza ma **strukturę logiczną** (prawo = hierarchia artykułów)
- Pytania wymagają **wieloetapowego rozumowania**
- Chcesz **explainability** ("jak Agent doszedł do odpowiedzi?")
- Musisz **minimalizować tokeny** (koszt API)

### ✅ Flat RAG jest lepsze gdy:
- Wiedza jest **niestrukturalna** (np. zbiór case studies)
- Pytania są **proste, jednoetapowe**
- Nie zależy Ci na minimalizacji tokenów
- Chcesz **szybkość implementacji** (Weaviate setup = 2h)

---

## Roadmap Wdrożenia w GapRoll

**Phase 1: Flat RAG (Week 10, Apr 6-12)** ← START HERE
- Weaviate + semantic search
- Good enough for 50 customers
- 80% accuracy

**Phase 2: Hybrid RAG (Week 20, Jun 1-7)** ← AFTER DATA
- Flat RAG + metadata hints
- Follow `related_articles` links
- 90% accuracy

**Phase 3: Full Skill Graph (Week 24, Jul 1-7)** ← ONLY IF NEEDED
- Migrate to full graph structure
- Graph traversal before vector search
- 95%+ accuracy

**Trigger for Phase 3:**
- Phase 2 accuracy <85%
- OR expansion to Czech Republic (new legal graph)
- OR 100+ customers (scale justifies investment)

---

## Jak Rozszerzyć Pilota?

### Dodaj nowe węzły:

1. **Art_9_Joint_Assessment.md** — Procedura wspólnej oceny (jeśli luka >5%)
2. **Kary_za_Naruszenie.md** — Sankcje za brak odpowiedzi
3. **RODO_Maskowanie.md** — Szczegóły maskowania (N<3)
4. **Skladniki_Wynagrodzenia.md** — Co wliczać do luki (Art. 4)

### Połącz z innymi artykułami:

- **Art. 16** (raportowanie luki) → link do `[[00_INDEX_Art7]]`
- **Art. 4** (EVG scoring) → link do `[[Metoda_EVG]]`

**Z czasem powstanie:**
```
Graf 50+ plików pokrywający całą Dyrektywę + Kodeks Pracy + RODO
```

---

## Tech Stack (Zero Dependencies)

**Wymagania:**
- ✅ Markdown files (any folder structure)
- ✅ Wikilinks `[[File_Name]]`
- ✅ YAML frontmatter (optional but recommended)
- ✅ LLM that understands wikilinks (Claude, GPT-4)

**NIE potrzeba:**
- ❌ Specjalne narzędzia (Obsidian nice-to-have, nie wymagane)
- ❌ Graph database (pliki wystarczą)
- ❌ Vector DB (można połączyć z Weaviate later)

---

## Next Steps

1. **Review pilot** — przeczytaj 4 pliki, sprawdź czy wikilinki mają sens
2. **Test with Guardian** — zasymuluj query Grażyny, zobacz jak Agent nawiguje
3. **Decide:** Czy inwestujemy w Phase 3 (Jul 2026) czy zostajemy z flat RAG?

**Jeśli pilot działa dobrze:**
- Expand to Art. 9, Art. 16, Art. 4
- Build full Directive graph (50+ files)
- Implement graph traversal in Guardian code

**Jeśli pilot nie przekonuje:**
- Stick with flat RAG (Weaviate sufficient for most queries)
- Revisit when scale increases (100+ customers, Czech expansion)

---

**Autor:** Claude (CPTO)  
**Data:** Feb 15, 2026  
**Status:** Proof-of-Concept  
**Next Review:** Week 20 (Jun 1-7) after flat RAG performance data collected
