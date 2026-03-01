#!/usr/bin/env python3
"""
Validates legal content for correct EU Directive 2023/970 citation format.
Checks for: Art. X, Dyrektywa (UE) 2023/970 (or equivalent), and flags missing citations.

Usage: python validate_citations.py <path_to_file_or_dir>
Example: python validate_citations.py .ai/skills/P1-compliance-legal/references/
"""

import re
import sys
from pathlib import Path

DIRECTIVE_PATTERN = re.compile(
    r"Dyrektywa\s*\(\s*UE\s*\)\s*2023/970|2023/970|directive\s+2023/970",
    re.IGNORECASE,
)
ART_PATTERN = re.compile(r"\bArt\.\s*\d+|art\.\s*\d+", re.IGNORECASE)
KODEKS_PATTERN = re.compile(r"Kodeks\s+pracy|kodeks\s+pracy", re.IGNORECASE)


def check_file(filepath: Path):
    errors = []
    warnings = []
    try:
        text = filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        errors.append(f"{filepath}: Could not read file: {e}")
        return errors, warnings

    # Skip binary / non-text
    if not all(ord(c) < 128 or c.isprintable() or c in "\n\r\t" for c in text[:2000]):
        return errors, warnings

    has_directive = bool(DIRECTIVE_PATTERN.search(text))
    has_art = bool(ART_PATTERN.search(text))
    has_kodeks = bool(KODEKS_PATTERN.search(text))

    # Legal-ish content: mentions "luka", "raport", "pracodawc", "obowiązek", "dyrektyw"
    legal_keywords = re.compile(
        r"luka\s+płacow|raportow|pracodawc|obowiązek|dyrektyw|art\.\s*\d+|Art\.\s*\d+",
        re.IGNORECASE,
    )
    if legal_keywords.search(text) and not (has_directive or has_art or has_kodeks):
        warnings.append(f"{filepath}: Legal-looking content but no citation (Art. X, Dyrektywa 2023/970, or Kodeks pracy).")

    if has_art and not has_directive and "Dyrektywa" not in text and "2023/970" not in text:
        warnings.append(f"{filepath}: Contains 'Art.' but no Directive (UE) 2023/970 reference.")

    return errors, warnings


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python validate_citations.py <path_to_file_or_dir>")
        sys.exit(1)

    root = Path(sys.argv[1])
    if not root.exists():
        print(f"Path not found: {root}")
        sys.exit(1)

    all_errors: list[str] = []
    all_warnings: list[str] = []

    if root.is_file():
        e, w = check_file(root)
        all_errors.extend(e)
        all_warnings.extend(w)
    else:
        for p in root.rglob("*"):
            if p.is_file() and p.suffix.lower() in (".md", ".tsx", ".ts", ".jsx", ".js", ".py", ".txt"):
                e, w = check_file(p)
                all_errors.extend(e)
                all_warnings.extend(w)

    if all_errors:
        print("Errors:")
        for msg in all_errors:
            print("  ", msg)
        sys.exit(1)

    if all_warnings:
        print("Warnings:")
        for msg in all_warnings:
            print("  ", msg)

    print("Citation validation finished. Errors:", len(all_errors), "Warnings:", len(all_warnings))
    sys.exit(0)


if __name__ == "__main__":
    main()
