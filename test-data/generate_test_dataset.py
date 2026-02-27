# -*- coding: utf-8 -*-
"""
Generates gaproll_test_75.csv — 75 employees, Polish CSV (;), target pay gap ~12%.
No external deps; run: python test-data/generate_test_dataset.py
"""
import csv
import os
import random

random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__))
OUTPUT_CSV = os.path.join(OUTPUT_DIR, "gaproll_test_75.csv")

# Position templates: (position_name, department, evg_group, salary_min, salary_max)
# We need 75 total. Counts: Dev 15, HR 10, Finance 10, Sales 10, Ops 10, C-suite 4, Intern 6 = 65 → +10
# Add 3 Dev, 2 HR, 2 Finance, 2 Sales, 2 Ops, 1 Intern → 18 Dev, 12 HR, 12 Fin, 12 Sales, 12 Ops, 4 C-suite, 7 Intern = 77. Too many.
# 18 Dev, 11 HR, 11 Fin, 11 Sales, 11 Ops, 4 C-suite, 9 Intern = 75.
POSITION_TEMPLATES = [
    ("Developer Junior", "IT", "Specjaliści IT", 5000, 7000),
    ("Developer Junior", "IT", "Specjaliści IT", 5000, 7000),
    ("Developer Junior", "IT", "Specjaliści IT", 5000, 7000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Lead", "IT", "Specjaliści IT", 15000, 22000),
    ("Developer Lead", "IT", "Specjaliści IT", 15000, 22000),
    ("Developer Lead", "IT", "Specjaliści IT", 15000, 22000),
    ("Developer Junior", "IT", "Specjaliści IT", 5000, 7000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Lead", "IT", "Specjaliści IT", 15000, 22000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    ("Developer Senior", "IT", "Specjaliści IT", 8000, 13000),
    # HR: 12 (women earn more here - reversed gap)
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Manager", "HR", "Specjaliści HR i Admin", 11000, 18000),
    ("HR Manager", "HR", "Specjaliści HR i Admin", 11000, 18000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Manager", "HR", "Specjaliści HR i Admin", 11000, 18000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    ("HR Manager", "HR", "Specjaliści HR i Admin", 11000, 18000),
    ("HR Specialist", "HR", "Specjaliści HR i Admin", 6000, 9000),
    # Finance: 11
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    ("Senior Accountant", "Finance", "Specjaliści Finansowi", 8000, 13000),
    ("Senior Accountant", "Finance", "Specjaliści Finansowi", 8000, 13000),
    ("Senior Accountant", "Finance", "Specjaliści Finansowi", 8000, 13000),
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    ("Senior Accountant", "Finance", "Specjaliści Finansowi", 8000, 13000),
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    ("Senior Accountant", "Finance", "Specjaliści Finansowi", 8000, 13000),
    ("Accountant", "Finance", "Specjaliści Finansowi", 6000, 9000),
    # Sales: 11
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Manager", "Sales", "Sprzedaż i Obsługa Klienta", 11000, 18000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Manager", "Sales", "Sprzedaż i Obsługa Klienta", 11000, 18000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Manager", "Sales", "Sprzedaż i Obsługa Klienta", 11000, 18000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Representative", "Sales", "Sprzedaż i Obsługa Klienta", 6000, 9000),
    ("Sales Manager", "Sales", "Sprzedaż i Obsługa Klienta", 11000, 18000),
    # Operations: 11
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Manager", "Operations", "Operacje i Logistyka", 11000, 18000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Manager", "Operations", "Operacje i Logistyka", 11000, 18000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Manager", "Operations", "Operacje i Logistyka", 11000, 18000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Specialist", "Operations", "Operacje i Logistyka", 6000, 9000),
    ("Operations Manager", "Operations", "Operacje i Logistyka", 11000, 18000),
    # C-suite: 4 (equal pay)
    ("CEO", "Management", "Kadra Zarządzająca", 35000, 45000),
    ("CFO", "Management", "Kadra Zarządzająca", 28000, 38000),
    ("CTO", "Management", "Kadra Zarządzająca", 28000, 38000),
    ("COO", "Management", "Kadra Zarządzająca", 25000, 35000),
    # Intern: 6 (one will get salary=0 for edge case)
    ("Intern", "IT", "Stażyści", 3500, 4200),
    ("Intern", "HR", "Stażyści", 3500, 4200),
    ("Intern", "Finance", "Stażyści", 3500, 4200),
    ("Intern", "Sales", "Stażyści", 3500, 4200),
    ("Intern", "Operations", "Stażyści", 3500, 4200),
    ("Intern", "IT", "Stażyści", 3500, 4200),
]

# For RODO N=2 edge case: 3 groups with exactly 2 people (same position, same gender).
# Pairs of row indices that share the same position — we assign same gender to each pair.
N2_GROUP_INDICES = [(10, 11), (36, 37), (43, 44)]  # Developer Lead, Senior Accountant, Sales Representative

assert len(POSITION_TEMPLATES) == 75

CONTRACT_TYPES = ["UoP"] * 45 + ["B2B"] * 19 + ["UZ"] * 11  # 60% / 25% / 15%
random.shuffle(CONTRACT_TYPES)

HIRE_YEARS = list(range(2015, 2026))  # 2015-2025


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Target: 42 K, 33 M. First fix 3 N=2 groups (6 people): 4 K, 2 M. Then assign 38 K, 31 M to the rest.
    n2_indices = set()
    for (a, b) in N2_GROUP_INDICES:
        n2_indices.add(a)
        n2_indices.add(b)
    rest_indices = [i for i in range(75) if i not in n2_indices]
    random.shuffle(rest_indices)
    gender_by_idx = {}
    for idx in n2_indices:
        gender_by_idx[idx] = None  # set later
    # N2 groups: two pairs K, one pair M
    for (idx_a, idx_b), g in zip(N2_GROUP_INDICES, ["K", "K", "M"]):
        gender_by_idx[idx_a] = g
        gender_by_idx[idx_b] = g
    for i, idx in enumerate(rest_indices):
        gender_by_idx[idx] = "K" if i < 38 else "M"

    employees = []
    for i, (pos, dept, evg_group, sal_lo, sal_hi) in enumerate(POSITION_TEMPLATES):
        gender = gender_by_idx[i]
        # Base salary (as if male) in range
        base = random.randint(sal_lo, sal_hi)
        # Apply gap: women 85-95% except HR (women higher 105-115%) and C-suite (100%)
        if gender == "M":
            salary = base
        else:
            if "HR" in evg_group:
                salary = int(base * random.uniform(1.05, 1.15))
            elif pos in ("CEO", "CFO", "CTO", "COO"):
                salary = base
            else:
                salary = int(base * random.uniform(0.82, 0.90))
            salary = max(sal_lo, min(sal_hi, salary))

        employees.append({
            "employee_id": f"GR-{1000 + i}",
            "gender": gender,
            "salary": salary,
            "position": pos,
            "evg_group": evg_group,
            "department": dept,
            "hire_year": random.choice(HIRE_YEARS),
            "contract_type": CONTRACT_TYPES[i],
            "reporting_period": "2024",
        })

    # Edge case 1: One Intern with salary=0 (unpaid)
    for e in employees:
        if e["position"] == "Intern" and e["salary"] > 0:
            e["salary"] = 0
            break

    # Edge case 2: Two employees with identical salary (duplicate value)
    candidates = [e for e in employees if e["position"] != "Intern" and e["salary"] > 0]
    if len(candidates) >= 2:
        dup_val = candidates[0]["salary"]
        candidates[1]["salary"] = dup_val

    # Edge case 3 & 4: 3 groups N=2 done above; COO is single (N=1)

    # Reorder so COO is the N=1 position (only one COO). We have one COO already.
    # And ensure we have 3 pairs: e.g. pick two "Developer Lead" female and two "Developer Lead" male? We have 3 Lead.
    # So (Developer Lead, K) could be 1, (Developer Lead, M) could be 2. We need 3 groups with N=2.
    # Let's ensure: make exactly 2 people for "CTO" (so CTO has 2), and exactly 2 for "COO"... no, COO should be N=1.
    # So: COO = 1 person (N=1). For N=2 we need 3 groups. E.g. (Developer Lead, K) = 2, (HR Manager, M) = 2, (Senior Accountant, K) = 2.
    # Adjust template: have 2 Developer Lead F, 2 HR Manager M, 2 Senior Accountant K. We already have 3 Lead, 3 HR Manager, etc.
    # So by random gender assignment we might get 2F+1M for Lead or 2M+1F. So we'll get some N=2 groups. Good.

    # Write CSV
    fieldnames = ["employee_id", "gender", "salary", "position", "evg_group", "department", "hire_year", "contract_type", "reporting_period"]
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(fieldnames)
        for e in employees:
            w.writerow([e[k] for k in fieldnames])

    # Compute actual gap
    women = [e["salary"] for e in employees if e["gender"] == "K" and e["salary"] > 0]
    men = [e["salary"] for e in employees if e["gender"] == "M" and e["salary"] > 0]
    avg_f = sum(women) / len(women) if women else 0
    avg_m = sum(men) / len(men) if men else 0
    gap = ((avg_m - avg_f) / avg_m * 100) if avg_m else 0

    try:
        print(f"\u2705 Generated {len(employees)} employees, gap: {gap:.1f}%")
    except UnicodeEncodeError:
        print(f"Generated {len(employees)} employees, gap: {gap:.1f}%")


if __name__ == "__main__":
    main()
