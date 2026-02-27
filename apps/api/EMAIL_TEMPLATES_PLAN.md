# Plan szablonów e-mail — GapRoll

**Status:** Szablony e-mail **nie istnieją** w `apps/api`. Do zaimplementowania w **Week 5 (Invoice automation sprint)**.

---

## 1. Wynik skanowania (rebrand task)

- **`/templates`** — brak katalogu
- **`/emails`** — brak katalogu
- **Inline w kodzie** — brak wywołań wysyłki e-mail (send_email, SMTP, Resend, SendGrid, Mailgun itd.)

W repozytorium nie ma obecnie żadnych szablonów e-mail do aktualizacji pod rebrand PayCompass → GapRoll.

---

## 2. Gdzie dodać szablony (rekomendacja)

| Lokalizacja | Opis |
|-------------|------|
| **`apps/api/templates/email/`** | Szablony HTML/tekstowe (Jinja2 lub zwykłe .html/.txt) |
| **`apps/api/emails/`** | Alternatywa: moduł Pythona z funkcjami `send_welcome()`, `send_password_reset()` itd. i stringami szablonów |
| **Supabase Auth** | E-maile rejestracja/reset hasła — konfiguracja w Supabase Dashboard (templates); treść do ujednolicenia z GapRoll |

**Rekomendacja:** `apps/api/templates/email/` dla plików szablonów + helper w `routers/` lub `emails/service.py` do renderowania i wysyłki.

---

## 3. Szablony do stworzenia (Week 5)

### 3.1 Welcome email (rejestracja)

- **Temat:** `Witamy w GapRoll`
- **Treść:** Powitanie (formalna polszczyzna, Pan/Pani), nazwa produktu **GapRoll** (nie PayCompass).
- **Stopka:** `Zespół GapRoll`

### 3.2 Password reset

- **Temat:** `Reset hasła - GapRoll`
- **Treść:** Formalna polszczyzna, link do resetu, bezpieczeństwo.
- **Stopka:** `Zespół GapRoll`

### 3.3 Invoice notification (jeśli będzie w Week 5)

- **Temat:** np. `Faktura od GapRoll — [nr faktury]`
- **Treść:** Informacja o wystawionej fakturze, link do PDF / Fakturownia.
- **Stopka:** `Zespół GapRoll`

### 3.4 Weekly report (jeśli będzie w backlogu)

- **Temat:** np. `Raport tygodniowy - GapRoll`
- **Treść:** Podsumowanie (np. Art. 16, luka płacowa), link do dashboardu.
- **Stopka:** `Zespół GapRoll`

---

## 4. Zasady stylu (obowiązkowe)

- **Język:** formalna polszczyzna (Pan/Pani).
- **Brak anglicyzmów** w treści widocznej dla użytkownika (np. „reset hasła” zamiast „password reset” w tekście).
- **Stopka we wszystkich szablonach:** `Zespół GapRoll`.
- **Nazwa produktu:** wszędzie **GapRoll** (nigdy PayCompass w nowych szablonach).

---

## 5. Integracje do rozważenia (Week 5)

- **Supabase Auth:** w Dashboard → Authentication → Email Templates — ustawić tematy i treści po polsku z GapRoll.
- **Fakturownia / Resend / SendGrid:** jeśli wybrane do faktur — dodać szablony w `apps/api/templates/email/` i w kodzie używać jednej marki (GapRoll).

---

**Ostatnia aktualizacja:** 2026-02-14 (rebrand email templates task — brak istniejących szablonów do zmiany).
