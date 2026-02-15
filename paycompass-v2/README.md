# GapRoll

**GapRoll** — platforma do raportowania luk płacowych i zgodności z Dyrektywą UE 2023/970 (pay transparency).

## Struktura repozytorium

- **`apps/web`** — frontend Next.js (dashboard, Pay Gap, EVG, Art. 16, raporty)
- **`apps/api`** — backend FastAPI (upload CSV, analizy, EVG scoring, dashboard metrics)

## Wymagania

- Node.js 20+ (frontend)
- Python 3.11+ (backend)
- Supabase (auth, payroll_data, job_valuations)

## Szybki start

### Frontend (Next.js)

```bash
cd apps/web
npm install
npm run dev
```

Aplikacja: [http://localhost:3000](http://localhost:3000)

### Backend (FastAPI)

```bash
cd apps/api
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

API: [http://localhost:8000](http://localhost:8000)  
Dokumentacja: [http://localhost:8000/docs](http://localhost:8000/docs)

### Zmienne środowiskowe

- **apps/api**: skopiuj `apps/api/.env.example` do `.env` i uzupełnij `SUPABASE_URL`, `SUPABASE_KEY`, `OPENAI_API_KEY` (dla EVG).
- **apps/web**: skonfiguruj Supabase w `apps/web/.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).

## Dokumentacja

Szczegóły produktu, roadmap i standardy w katalogu `docs/`.
