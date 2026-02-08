import pandas as pd

def calculate_tce(row):
    """
    Uproszczona logika obliczania całkowitego kosztu pracodawcy (TCE).
    W wersji produkcyjnej dodamy tu dokładne progi podatkowe i ZUS.
    """
    base = row['base_salary']
    bonus = row.get('bonus', 0)
    total_gross = base + bonus
    
    if row['contract_type'] == 'UoP':
        # Koszt pracodawcy na UoP to ok. 120.48% kwoty brutto
        return round(total_gross * 1.2048, 2)
    elif row['contract_type'] == 'B2B':
        # Na B2B koszt to po prostu kwota na fakturze (zakładamy netto)
        return round(total_gross, 2)
    elif row['contract_type'] == 'UZ':
        # Uproszczony narzut na Umowę Zlecenie
        return round(total_gross * 1.18, 2)
    else:
        return round(total_gross, 2)

def run_solver_analysis(file_path):
    df = pd.read_csv(file_path)
    df['total_cost_employment'] = df.apply(calculate_tce, axis=1)
    avg_cost = df.groupby('gender')['total_cost_employment'].mean().to_dict()
    output_path = file_path.replace("_sanitized.csv", "_analyzed.csv")
    df.to_csv(output_path, index=False)
    return output_path

if __name__ == "__main__":
    # Testujemy na pliku, który przed chwilą wygenerował Vault
    run_solver_analysis("data/test_payroll_sanitized.csv")