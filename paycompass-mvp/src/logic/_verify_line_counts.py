# -*- coding: utf-8 -*-
"""Recursive check: migration target files must be < 150 lines."""
import os

MAX_LINES = 150
TARGETS = ("analytics.py", "b2b_equalizer.py", "art16_reporting.py", "csv_loader.py")

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    ok = True
    for name in TARGETS:
        path = os.path.join(base, name)
        if not os.path.isfile(path):
            print(f"SKIP (missing): {name}")
            continue
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            n = sum(1 for _ in f)
        if n >= MAX_LINES:
            print(f"FAIL: {name} has {n} lines (max {MAX_LINES})")
            ok = False
        else:
            print(f"OK: {name} {n} lines")
    return 0 if ok else 1

if __name__ == "__main__":
    exit(main())
