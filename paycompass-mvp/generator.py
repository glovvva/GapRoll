import pandas as pd
import numpy as np
import os

def create_scenarios():
    base_path = r"C:\Users\dev\Documents\kompas-placowy\paycompass-core"
    n = 100
    np.random.seed(99) # Zmienione ziarno

    # Funkcja: Płaca silnie zależna od scoringu
    # Salary = 5000 + Scoring * 200 + mały szum
    def get_sal(scoring, gender):
        base = 5000 + (scoring * 200)
        noise = np.random.normal(0, 500) # Mały szum, żeby nie było idealnej linii
        gap = 0.90 if gender == 'Kobieta' else 1.0 # 10% luki
        return int((base + noise) * gap)

    clean = pd.DataFrame({
        'Employee_ID': [f'E{i:03d}' for i in range(n)],
        'Gender': np.random.choice(['Kobieta', 'Mężczyzna'], n),
        'Department': np.random.choice(['IT', 'HR', 'Sales', 'Finance'], n),
        'Contract_Type': np.random.choice(['UoP', 'B2B', 'UZ'], n),
        'Scoring': np.random.randint(30, 100, n)
    })
    clean['Salary'] = clean.apply(lambda x: get_sal(x['Scoring'], x['Gender']), axis=1)
    
    # Zapisujemy z nową nazwą, żeby ominąć Cache
    clean.to_csv(os.path.join(base_path, 'data_clean_v2.csv'), index=False)
    
    # Dirty v2
    dirty = clean.head(20).copy()
    dirty.rename(columns={'Gender': 'Plec_Pracownika', 'Salary': 'Kasa'}, inplace=True)
    dirty.loc[0:4, 'Scoring'] = np.nan
    dirty.to_csv(os.path.join(base_path, 'data_dirty_v2.csv'), index=False)

if __name__ == "__main__":
    create_scenarios()