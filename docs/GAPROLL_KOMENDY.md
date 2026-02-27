# GapRoll — Cheatsheet Komend
> Zapisz na pulpicie. Aktualizuj po każdej zmianie struktury projektu.
> Ścieżka projektu: `C:\Users\dev\Desktop\paycompass-production\paycompass-v2`

---

## 🟢 URUCHAMIANIE

### Frontend (Next.js)
```powershell
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\web
npm run dev
```
> Dostępny na: http://localhost:3000

### Backend (FastAPI / uvicorn)
```powershell
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\api
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
> Dostępny na: http://localhost:8000
> Docs: http://localhost:8000/docs

### Oba naraz (dwa terminale PowerShell)
```
Terminal 1 → frontend (npm run dev)
Terminal 2 → backend (uvicorn)
```

---

## 🔵 GIT

### Status — co się zmieniło
```powershell
git status
git diff
```

### Commit (conventional commits)
```powershell
git add .
git commit -m "feat(solio): add budget optimizer page with greedy algorithm"
```

### Push do GitHub
```powershell
git push origin master
```

### Pull (sync z remote)
```powershell
git pull origin master
```

### Historia commitów
```powershell
git log --oneline -10
```

### Cofnij ostatni commit (zachowaj zmiany)
```powershell
git reset --soft HEAD~1
```

### Tagi (wersje)
```powershell
git tag v0.1.0
git push origin v0.1.0
```

---

## 🟡 FRONTEND (Next.js)

### Instalacja paczek
```powershell
cd apps\web
npm install <nazwa-paczki>
```

### Build produkcyjny (sprawdź czy się kompiluje)
```powershell
cd apps\web
npm run build
```

### Lint (sprawdź błędy TypeScript)
```powershell
cd apps\web
npm run lint
```

### Dodaj shadcn/ui komponent
```powershell
cd apps\web
npx shadcn@latest add <komponent>
# np: npx shadcn@latest add dialog
# np: npx shadcn@latest add select
```

---

## 🟠 BACKEND (FastAPI)

### Aktywuj venv
```powershell
cd C:\Users\dev\Desktop\paycompass-production\paycompass-v2\apps\api
.\venv\Scripts\Activate.ps1
```

### Zainstaluj pakiet Pythona
```powershell
# (venv musi być aktywny)
pip install <nazwa-pakietu>
pip freeze > requirements.txt
```

### Uruchom testy
```powershell
pytest
pytest tests/test_analysis.py -v
```

### Sprawdź logi uvicorn
> Logi wyświetlają się na bieżąco w terminalu gdzie uruchomiony jest uvicorn.

---

## 🗄️ SUPABASE

### Lokalne Supabase CLI (jeśli zainstalowane)
```powershell
supabase status
supabase db reset
supabase db push
```

### SQL — otwórz w przeglądarce
> https://supabase.com/dashboard → projekt GapRoll → SQL Editor

---

## 📁 STRUKTURA PROJEKTU

```
paycompass-v2/
├── apps/
│   ├── web/                    ← Next.js 15 frontend
│   │   ├── app/
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          ← Dashboard główny
│   │   │       ├── paygap/           ← Analiza luki płacowej
│   │   │       ├── evg/              ← Wartościowanie stanowisk
│   │   │       ├── report/           ← Raport Art. 16
│   │   │       └── solio/            ← Optymalizator budżetowy
│   │   ├── components/
│   │   │   ├── ui/                   ← shadcn/ui komponenty
│   │   │   ├── dashboard/            ← sidebar, topbar
│   │   │   └── explainability/       ← CitationBadge, InfoTooltip etc.
│   │   └── lib/
│   │       ├── solio-algorithm.ts    ← Greedy optimizer
│   │       ├── api-client.ts         ← fetch wrappery
│   │       └── supabase/             ← Supabase klient
│   └── api/                    ← FastAPI backend
│       ├── main.py
│       ├── routers/
│       │   ├── analysis.py           ← pay gap, EVG, dashboard metrics
│       │   └── upload.py             ← CSV upload
│       └── venv/                     ← Python virtual env
└── docs/
    └── outputs/                ← Audyty, dokumentacja
```

---

## ⚡ NAJCZĘSTSZE SCENARIUSZE

### "Coś się nie kompiluje na frontendzie"
```powershell
cd apps\web
npm run build
# Czytaj błędy TypeScript
```

### "Backend nie startuje"
```powershell
# Sprawdź czy venv jest aktywny (powinno być (venv) w PS)
# Sprawdź czy port 8000 nie jest zajęty:
netstat -ano | findstr :8000
# Jeśli zajęty: taskkill /PID <PID> /F
```

### "Chcę zobaczyć API docs"
> Uruchom backend → otwórz http://localhost:8000/docs

### "Chcę dodać nową stronę w dashboard"
```
1. Utwórz: apps/web/app/dashboard/<nazwa>/page.tsx
2. Dodaj link do: apps/web/components/dashboard/sidebar.tsx
```

### "Chcę przetestować algorytm Solvera bez frontendu"
```powershell
cd apps\web
npx ts-node lib/solio-algorithm.ts
```

---

## 🏷️ CONVENTIONAL COMMITS — PREFIXES

| Prefix | Kiedy |
|--------|-------|
| `feat:` | Nowa funkcja |
| `fix:` | Naprawa błędu |
| `refactor:` | Zmiana kodu bez nowej funkcji |
| `docs:` | Tylko dokumentacja |
| `style:` | Formatowanie, brak logiki |
| `test:` | Testy |
| `chore:` | Tooling, config, paczki |

**Przykłady:**
```
feat(solio): add CSV export with Polish decimal format
fix(evg): resolve TooltipTrigger TypeScript error
refactor(dashboard): rename Solio to Optymalizator Budzetowy
docs(readme): update setup instructions
chore(deps): upgrade Next.js to 15.2
```

---

*Ostatnia aktualizacja: 2026-02-19*
*Projekt: GapRoll Sp. z o.o.*
