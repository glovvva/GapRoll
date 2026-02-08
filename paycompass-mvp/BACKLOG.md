#### 1. 🛡️ VAULT: Security & Architecture (HIGHEST PRIORITY)

*To zadanie jest fundamentem dla modelu partnerskiego (Biura Rachunkowe).*

- [x] **Supabase Init:** Podłączenie klienta, naprawa `secrets.toml`, weryfikacja bibliotek.
- [x] **Ingress Sanitization:** Usuwanie kolumn PII (PESEL/Nazwisko) przed processingiem.
- [ ] **DB Schema Refactor (Multi-tenancy):**
  - Stworzenie tabel: `organizations` (Partnerzy) i `projects` (Klienci końcowi).
  - Migracja tabeli `profiles` do obsługi relacji `many-to-many` (Jeden księgowy -> Wielu klientów).
- [ ] **RLS Implementation (The "Linked Tenant" Model):**
  - Wdrożenie mechanizmu `set_config('app.current_project_id', ...)` w `db_manager.py`.
  - Aktualizacja polityk SQL: `USING (project_id = current_setting(...))`.
  - **Test Bezpieczeństwa:** Próba "kradzieży" danych innego klienta (musi się nie udać).
- [ ] **Auth Triggers:**
  - Automatyczne tworzenie domyślnej Organizacji i Projektu przy rejestracji nowego użytkownika.

#### 2. 🎨 PRODUCT: High-Trust UX (Visual Trust)

*Odejście od "Streamlit Default Look" na rzecz "Financial Dashboard".*

- [ ] **Design System Setup:**
  - Implementacja CSS hacków w Streamlit dla niestandardowych fontów (Inter/Roboto).
  - Ustalenie palety kolorów: Navy/Slate (Zaufanie), Red/Green (Status). Usunięcie gradientów.
- [ ] **UI Cleanup:**
  - Usunięcie stopki "Made with Streamlit" i menu hamburgera.
  - Wdrożenie "Financial Dark Mode".
- [ ] **Loading States:**
  - Zmiana kręcącego się kółka na komunikaty tekstowe: *"Normalizing B2B contracts...", "Verifying Article 16 compliance..."*.

#### 3. ⚖️ LEGAL & BIZDEV (Foundation)

- [ ] **Law Firm "Privileged Mode":**
  - Dodanie checkboxa w ustawieniach projektu: *"Auto-delete data after 7 days"*.
- [ ] **Asset Pack v1:**
  - Szkic "One-pager" dla Kancelarii Prawnych (Plain text, focus na "Privileged Audit").

---

**Backlog Management Rules:**

1. Tasks are moved to `DONE` only after passing a manual check.
2. Security tasks (VAULT) block all other deployments.
3. Every DB change requires an update to `audit_logs` logic.

