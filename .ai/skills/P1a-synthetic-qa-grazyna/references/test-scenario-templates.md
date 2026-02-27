# Test Scenario Templates — Synthetic QA

Use these templates with the scripts in `../scripts/` to generate reproducible dirty test data.

## Template 1: Comarch Optima Export Gone Wrong

**Purpose:** Stress-test Excel import with typical Comarch-style corruption.

**Command:**

```bash
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_dirty_excel.py \
  --employees 150 \
  --corruption-rate 30 \
  --bugs "merged_cells,mixed_encoding,duplicate_pesel,invalid_salary" \
  --output test-data/comarch-broken.xlsx
```

**Expected:** 150 rows, header at row 4; ~30% corrupted salary (text or mixed format); 5 duplicate PESELs; some merged salary cells; mixed number formats (8 500,00 vs 6,750.00).

**Validation:** Upload via GapRoll import; expect user-friendly Polish errors for invalid_salary and duplicate_pesel; no stack trace to user.

---

## Template 2: 50k Employee JPK (Memory Stress)

**Purpose:** Test streaming parser and memory limits.

**Command:**

```bash
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_large_jpk.py \
  --employees 50000 \
  --malformed 10 \
  --output test-data/jpk-50k.xml
```

**Expected:** XML file ~50MB; 50,000 `<Pracownik>` nodes; 100+ names with Polish diacritics (Żółć, Łódź); 10 intentionally malformed nodes (unclosed tag or invalid character).

**Validation:** Parser should use <256MB peak memory (streaming); malformed nodes should be skipped or reported with clear message; no OOM.

---

## Template 3: CSV Delimiter Chaos

**Purpose:** Test CSV delimiter auto-detection and quoted fields.

**Command:**

```bash
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_broken_csv.py \
  --employees 100 \
  --bugs "mixed_delimiters,quotes_in_quotes,line_breaks_in_cells" \
  --output test-data/csv-hell.csv
```

**Expected:** Some rows comma-separated, some semicolon; some names with embedded quotes; some cells with newlines.

**Validation:** Import should detect delimiter per-row or fail gracefully with Polish message; no crash on unclosed quote.

---

## Template 4: Minimal Smoke (Fast)

**Purpose:** Quick sanity check that all three generators run.

**Commands:**

```bash
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_dirty_excel.py --employees 10 --corruption-rate 10 --bugs "duplicate_pesel" --output test-data/smoke.xlsx
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_large_jpk.py --employees 100 --malformed 2 --output test-data/smoke-jpk.xml
python .ai/skills/P1a-synthetic-qa-grazyna/scripts/generate_broken_csv.py --employees 20 --bugs "mixed_delimiters" --output test-data/smoke.csv
```

**Validation:** All three files created; open Excel/XML/CSV in viewer and confirm structure.
