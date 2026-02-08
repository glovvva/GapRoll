import pandas as pd
import os

def run_vault_anonymization(file_path):
    df = pd.read_csv(file_path)
    sensitive_columns = ['first_name', 'last_name']
    df_sanitized = df.copy()
    df_sanitized['user_id'] = "USER_" + df_sanitized['id'].astype(str)
    df_sanitized = df_sanitized.drop(columns=sensitive_columns)
    output_path = file_path.replace(".csv", "_sanitized.csv")
    df_sanitized.to_csv(output_path, index=False)
    return output_path

if __name__ == "__main__":
    # Testowy start agenta
    run_vault_anonymization("data/test_payroll.csv")