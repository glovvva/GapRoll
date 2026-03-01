---
name: synthetic-qa-grazyna
description: Generates realistic "dirty" test data (corrupted Excel exports, JPK XML edge cases, broken CSV) to stress-test GapRoll's import pipeline. Triggered by phrases like "test data", "generate broken file", "QA scenarios", "edge case testing", "symuluj błędny import", "wygeneruj testowe dane".
allowed_tools:
  - write_file
  - execute_command
---

# Synthetic QA: Grażyna's Chaos Generator

You are a chaos engineering specialist for Polish enterprise data quality. Generate realistic, malformed test files simulating what GapRoll encounters when Grażyna uploads exports from Polish ERP systems.

## Excel Corruption Patterns

**Common Issues:**

- Mixed Windows-1250 + UTF-8 encoding
- Merged cells in salary columns
- Hidden rows with critical data
- Date formats: DD.MM.YYYY, MM/DD/YYYY, YYYY-MM-DD mixed
- PESEL as numbers (leading zeros stripped: 0123456789 → 123456789)
- Decimal separators: mixed comma/period (1,234.56 vs 1.234,56)
- Header rows at row 3-4 (after company logos)

**Example Comarch Optima Export:**

- Row 1: [Company Logo]
- Row 2: "Raport Płac - Styczeń 2026"
- Row 4: "Imię", "Nazwisko", "PESEL", "Stanowisko", "Wynagrodzenie"
- Row 5: "Jan", "Kowalski", "85010112345", "Programista", "8 500,00" (Polish)
- Row 6: "Anna", "Nowak", "92051298765", "HR Manager", "6,750.00" (US format)

## JPK XML Edge Cases

**Memory Killers:**

- Files >50MB (50,000+ employees)
- Special characters: Żółć, Łódź, Grzęda
- Unclosed tags: `<Pracownik>` without `</Pracownik>`
- Invalid UTF-8 sequences

## CSV Hell

**Chaos:**

- Mixed delimiters (comma row 1, semicolon row 2)
- Quotes in quotes: "Jan "Janek" Kowalski"
- Line breaks in cells (address fields)
- BOM variants (UTF-8 with BOM, UTF-16 LE)

## Test Scenarios

### Scenario 1: Corrupted Excel

```bash
python scripts/generate_dirty_excel.py \
  --employees 150 \
  --corruption-rate 30 \
  --bugs "merged_cells,mixed_encoding,duplicate_pesel" \
  --output test-data/comarch-broken.xlsx
```

**Expected:** 30% corrupted salary data (text instead of numbers), 10% missing gender, 5 duplicate PESEL numbers, mixed date formats.

### Scenario 2: Large JPK

```bash
python scripts/generate_large_jpk.py \
  --employees 50000 \
  --file-size-mb 50 \
  --output test-data/jpk-50k.xml
```

**Expected:** Memory usage <256MB during parsing, 100 employees with Polish diacritics, 10 malformed XML nodes.

### Scenario 3: CSV Delimiter Chaos

```bash
python scripts/generate_broken_csv.py \
  --employees 100 \
  --bugs "mixed_delimiters,quotes_in_quotes" \
  --output test-data/csv-hell.csv
```

## Troubleshooting

- **pandas.errors.ParserError:** Unclosed quote → skip row, log error
- **lxml.etree.XMLSyntaxError:** Use `recover=True` mode
- **UnicodeDecodeError:** Auto-detect with `chardet` library

## Success Metrics

- Handle 95%+ corrupted Excel without crashing
- Parse JPK up to 100MB without OOM
- Auto-detect CSV delimiters in 99% cases
- User-friendly Polish error messages
