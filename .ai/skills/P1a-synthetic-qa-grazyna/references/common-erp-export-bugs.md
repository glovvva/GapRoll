# Common ERP Export Bugs — Polish ERP Systems

Known data quality issues seen in exports from Polish accounting/HR systems. Use these when generating synthetic dirty test data.

## Comarch Optima

- **Merged summary rows** — Totals or section headers merged across columns; salary column merged with row below.
- **Header offset** — Data starts at row 4–5 after company name and report title.
- **Decimal separator** — Usually Polish (comma): `8 500,00`; sometimes space as thousands separator.
- **PESEL** — Occasionally exported as number, stripping leading zeros (e.g. `123456789` instead of `01234567890`).
- **Date format** — DD.MM.YYYY dominant; occasional mixed YYYY-MM-DD from system defaults.

## enova365

- **UTF-8 BOM** — File may start with BOM; some parsers expect no BOM or different encoding.
- **Mixed encoding** — Declared Windows-1250 but content in UTF-8 (or vice versa) in same file.
- **Quotes in names** — Double quotes inside quoted fields: `"Jan ""Janek"" Kowalski"` or broken `"Jan "Janek" Kowalski"`.
- **Line breaks in cells** — Address or notes fields contain literal newlines inside quoted CSV cells.

## Symfonia (Sage)

- **PESEL leading zeros stripped** — Exported as number: 85010112345 may become 8501011234 or 123456789.
- **Hidden rows** — Rows with key data (e.g. one employee) hidden for formatting; parsers that skip hidden rows miss data.
- **Mixed date formats** — DD.MM.YYYY and MM/DD/YYYY in same column depending on user locale.
- **Salary as text** — Values like "8 500,00 zł" or "brak" (missing) in salary column.

## Generic JPK / XML

- **Unclosed tags** — Malformed XML (e.g. missing `</Pracownik>`) after large exports or timeouts.
- **Polish diacritics** — Ą, Ć, Ę, Ł, Ń, Ó, Ś, Ź, Ż in names; encoding issues if declared encoding ≠ actual.
- **Large files** — Single-file JPK with 50k+ employees; memory stress if parsed in full into DOM.
- **Invalid UTF-8** — Isolated invalid bytes from legacy systems or copy-paste.
