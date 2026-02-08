# -*- coding: utf-8 -*-
"""
Logic Utils Module
==================
Narzędzia pomocnicze: mapowanie kolumn, generator danych testowych.
"""

import pandas as pd
from typing import Optional


def suggest_column_mapping(columns: list) -> dict:
    """Heurystyka: sugeruje mapowanie kolumn na Stanowisko, Płeć, Wynagrodzenie."""
    cols = [str(c).strip() for c in columns]
    mapping = {"Stanowisko": None, "Płeć": None, "Wynagrodzenie": None}
    for kw in ["stanowisko", "position", "nazwa stanowiska", "job", "tytuł", "tytul", "rola"]:
        for i, c in enumerate(cols):
            if kw in c.lower():
                mapping["Stanowisko"] = cols[i]
                break
        if mapping["Stanowisko"]:
            break
    if not mapping["Stanowisko"] and cols:
        mapping["Stanowisko"] = cols[0]
    for kw in ["płeć", "plec", "gender", "sex", "płec", "pleć"]:
        for i, c in enumerate(cols):
            if kw in c.lower():
                mapping["Płeć"] = cols[i]
                break
        if mapping["Płeć"]:
            break
    if not mapping["Płeć"] and len(cols) > 1:
        mapping["Płeć"] = cols[1]
    for kw in ["wynagrodzenie", "stawka", "salary", "płaca", "placa", "brutto", "netto", "pensja", "zarobek"]:
        for i, c in enumerate(cols):
            if kw in c.lower():
                mapping["Wynagrodzenie"] = cols[i]
                break
        if mapping["Wynagrodzenie"]:
            break
    if not mapping["Wynagrodzenie"] and len(cols) > 2:
        mapping["Wynagrodzenie"] = cols[2]
    return mapping


def generate_mock_data(num_employees: int = 50) -> pd.DataFrame:
    """Generator awaryjny - tworzy przykładowe dane pracowników w pamięci."""
    import numpy as np
    np.random.seed(42)
    positions = [
        'Junior Developer', 'Senior Developer', 'Tech Lead',
        'Junior Analyst', 'Senior Analyst', 'Manager',
        'HR Specialist', 'Recruiter', 'HR Manager',
        'Accountant', 'Senior Accountant', 'Finance Manager'
    ]
    departments = ['Technology', 'Analytics', 'HR', 'Finance']
    genders = ['M', 'F']
    data = []
    for i in range(num_employees):
        position = np.random.choice(positions)
        department = np.random.choice(departments)
        gender = np.random.choice(genders)
        base_salary = np.random.randint(4000, 12000)
        if 'Senior' in position or 'Manager' in position or 'Lead' in position:
            base_salary = np.random.randint(8000, 15000)
        variable_pay = np.random.randint(0, 2000) if np.random.random() > 0.3 else 0
        allowances = np.random.choice([0, 500, 1000, 1500])
        benefit_value = np.random.choice([800, 1200])
        data.append({
            'Employee_ID': f'EMP-{1000 + i}',
            'Gender': gender,
            'Position': position,
            'Salary': base_salary,
            'Variable_Pay': variable_pay,
            'Allowances': allowances,
            'Benefit_Value': benefit_value,
            'Department': department,
        })
    return pd.DataFrame(data)
