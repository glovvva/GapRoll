# Raport weryfikacji rebrandu — GapRoll

**Data:** 2026-02-14  
**Zakres:** build + smoke test (frontend), checklist (backend + przegląd wizualny)

---

## 1. Frontend build test

**Polecenie:** `cd apps/web; npm run build`

**Wynik:** ✅ **Sukces** (exit code 0)

- Next.js 16.1.6 (Turbopack)
- Kompilacja: OK (~22s)
- TypeScript: OK
- Generowanie stron: 12/12 (/, dashboard, login, register, paygap, evg, report, data, api/evg/override, _not-found)

**Błędy:** Brak błędów kompilacji, importów ani typów. W logach build **nie pojawia się** "PayCompass".

**Uwaga:** Next.js zgłasza ostrzeżenie o wielu lockfile’ach (root `package-lock.json` vs `apps/web/package-lock.json`). Nie blokuje buildu. Opcjonalnie: ustaw `turbopack.root` w next.config lub usuń zbędny lockfile.

---

## 2. Pozostałe wystąpienia "PayCompass"

| Lokalizacja | Kontekst | Akcja |
|-------------|----------|--------|
| **apps/api/EMAIL_TEMPLATES_PLAN.md** | Zdania: "szablonów e-mail do aktualizacji pod rebrand PayCompass → GapRoll", "nie PayCompass", "nigdy PayCompass w nowych szablonach" | **Zostawić** — dokumentacja planu (historyczny kontekst rebrandu) |

W **kodzie** (apps/web, apps/api *.py, *.tsx, *.ts) **nie ma** już żadnych wystąpień "PayCompass". Jedyna wzmianka to plik dokumentacyjny EMAIL_TEMPLATES_PLAN.md.

---

## 3. Backend test (manual — do wykonania przez Bartka)

**Polecenia:**

```powershell
cd paycompass-v2\apps\api
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

**Oczekiwane w logach:** W trakcie startu aplikacja ładuje `main.py` z tytułem **"GapRoll API"**. Po wejściu na `GET http://localhost:8000/` odpowiedź: `{"message": "GapRoll API v2"}`.

**Szybki test:**

```powershell
Invoke-WebRequest -Uri http://localhost:8000/ -UseBasicParsing | Select-Object -ExpandProperty Content
```

Oczekiwane: `{"message":"GapRoll API v2"}`.

---

## 4. Dev server (manual)

**Frontend:**

```powershell
cd paycompass-v2\apps\web
npm run dev
```

Otwórz: [http://localhost:3000](http://localhost:3000)

---

## 5. Przegląd wizualny — checklist

| Element | Oczekiwana wartość | Plik / uwagi |
|--------|---------------------|--------------|
| **Tytuł karty w przeglądarce** | "GapRoll" | `app/layout.tsx` → `metadata.title` |
| **Nagłówek dashboardu (sidebar)** | "GapRoll" | `components/dashboard/sidebar.tsx` (link do /dashboard) |
| **Karta „Witamy w…”** | "Witamy w GapRoll" | `app/dashboard/page.tsx` |
| **Stopka / footer** | Jeśli jest w UI: "GapRoll" lub "Zespół GapRoll" | Obecnie w kodzie nie ma globalnego footera w layout; ewentualne footery w podstronach sprawdzić ręcznie |
| **Login / Rejestracja** | Tekst "… dostęp do GapRoll" / "… korzystać z GapRoll" | `login-form.tsx`, `register-form.tsx` |

**Strony do przejrzenia:** `/`, `/login`, `/register`, `/dashboard` — potwierdzić brak "PayCompass" w widocznym tekście.

---

## 6. Podsumowanie

| Kryterium | Status |
|-----------|--------|
| Frontend build | ✅ OK |
| Brak "PayCompass" w kodzie (web + api) | ✅ OK (tylko w docs: EMAIL_TEMPLATES_PLAN.md) |
| Import / type errors | ✅ Brak |
| Backend startup (manual) | ⏳ Do sprawdzenia (GapRoll w main.py) |
| Przegląd wizualny (tytuł, header, footer) | ⏳ Do sprawdzenia w przeglądarce |

**Zalecenie:** Uruchomić backend i frontend w trybie dev, przejść po `/`, `/login`, `/register`, `/dashboard` i potwierdzić tytuł karty, nagłówek i treści z "GapRoll". Po tym rebrand można uznać za zweryfikowany.
