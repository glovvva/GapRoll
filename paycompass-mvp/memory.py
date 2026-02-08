import json
import os
from datetime import datetime

# Dostosowujemy ścieżkę do tego, co masz na dysku
VAULT_DIR = os.path.join("agents", "vault")

def ensure_vault():
    if not os.path.exists(VAULT_DIR):
        os.makedirs(VAULT_DIR, exist_ok=True)

def get_company_memory(company_id):
    ensure_vault()
    file_path = os.path.join(VAULT_DIR, f"{company_id}_memory.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"history": [], "context": {}, "preferences": {}}

def save_audit_to_memory(company_id, audit_summary):
    ensure_vault()
    memory = get_company_memory(company_id)
    audit_summary["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    memory["history"].append(audit_summary)
    memory["history"] = memory["history"][-5:] # Trzymamy ostatnie 5 audytów
    
    file_path = os.path.join(VAULT_DIR, f"{company_id}_memory.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(memory, f, indent=4)