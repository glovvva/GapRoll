# Synthetic QA — Sample Files

- **csv_chaos_sample.csv** — CSV edge cases: mixed delimiters (; vs ,), quotes in names, line breaks in cells, corrupted salary (text), missing PESEL/gender, duplicate PESEL, Polish diacritics (Żółć, Łódź, ąęśćź).
- **jpk_edge_case_sample.xml** — Small JPK-style XML: Polish diacritics in names, one intentionally unclosed `<Nazwisko>` tag for error-recovery testing.

For full scenarios (Comarch 150 rows, 50MB JPK) run the skill with: "Generate Scenario 1: Comarch Optima export" or "Generate Scenario 2: 50k Employee JPK" and output to a path under `samples/` or project test fixtures.
