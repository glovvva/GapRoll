import pandas as pd
import numpy as np

def generate_paycompass_data(n=100):
    positions = {
        'Junior Developer': {'base': (5000, 7000), 'var': (0, 1000), 'count': 20},
        'Senior Developer': {'base': (15000, 22000), 'var': (2000, 5000), 'count': 15},
        'Project Manager': {'base': (12000, 18000), 'var': (1000, 3000), 'count': 10},
        'Accountant': {'base': (6000, 9000), 'var': (500, 1500), 'count': 10},
        'HR Specialist': {'base': (5500, 8500), 'var': (200, 1000), 'count': 10},
        'Office Manager': {'base': (5000, 7500), 'var': (0, 500), 'count': 5},
        'Data Scientist': {'base': (14000, 25000), 'var': (3000, 7000), 'count': 10},
        'Sales Representative': {'base': (4000, 6000), 'var': (2000, 10000), 'count': 15},
        'CTO': {'base': (30000, 45000), 'var': (10000, 20000), 'count': 2},
        'CEO': {'base': (40000, 60000), 'var': (15000, 30000), 'count': 3},
    }

    data = []
    for pos, values in positions.items():
        for _ in range(values['count']):
            # Symulacja płci (więcej kobiet w HR/Accountancy, więcej mężczyzn w IT/Sales)
            if pos in ['Accountant', 'HR Specialist', 'Office Manager']:
                gender = np.random.choice(['F', 'M'], p=[0.8, 0.2])
            elif pos in ['CTO', 'Data Scientist', 'Senior Developer']:
                gender = np.random.choice(['F', 'M'], p=[0.2, 0.8])
            else:
                gender = np.random.choice(['F', 'M'], p=[0.5, 0.5])

            # Symulacja luki płacowej (kobiety statystycznie zarabiają 95% bazy mężczyzn)
            gender_gap_factor = 0.93 if gender == 'F' else 1.0
            
            base = np.random.randint(values['base'][0], values['base'][1]) * gender_gap_factor
            variable = np.random.randint(values['var'][0], values['var'][1]) * (gender_gap_factor - 0.05) # Większa luka w premiach
            allowances = np.random.choice([0, 500, 1000, 1500], p=[0.7, 0.15, 0.1, 0.05])
            benefit = np.random.choice([800, 1200, 2500], p=[0.6, 0.3, 0.1]) # Multisport/Medicover

            data.append({
                'Employee_ID': f'EMP-{len(data)+1000}',
                'Gender': gender,
                'Position': pos,
                'Base_Salary': round(base, 2),
                'Variable_Pay': round(variable, 2),
                'Allowances': round(allowances, 2),
                'Benefit_Value': round(benefit, 2),
                'Department': 'Technology' if 'Dev' in pos or 'Data' in pos or 'CTO' in pos else 'Business'
            })

    df = pd.DataFrame(data)
    df.to_csv('test_payroll_data.csv', index=False)

if __name__ == "__main__":
    generate_paycompass_data()