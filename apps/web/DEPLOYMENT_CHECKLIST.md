# GapRoll — Deployment Checklist (Coolify)

## Pre-Deploy (wykonaj PRZED kliknięciem Deploy)

### Repo
- [ ] Branch w Coolify Git Source == branch lokalny (`git branch`)
- [ ] Ostatni commit zawiera wszystkie zmiany (`git status` czysty)
- [ ] Brak TypeScript errors lokalnie (`pnpm tsc --noEmit`)
- [ ] Build lokalnie przechodzi (`pnpm build`)

### Coolify Configuration  
- [ ] Domain: `https://gaproll.eu` (nie www, nie http)
- [ ] Base Directory: `/apps/web`
- [ ] Branch: `master`

### Environment Variables (Configuration → Environment Variables)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Available at Buildtime ✅ + Runtime ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy JWT eyJ...) — Available at Buildtime ✅ + Runtime ✅
- [ ] `NIXPACKS_NODE_VERSION` = 22

### Kod
- [ ] `middleware.ts` matcher wyklucza: `_next/static|_next/image|favicon.ico|api/|.*\.png$|.*\.jpg$|.*\.svg$|.*\.ico$|.*\.webp$`
- [ ] Wszystkie layouty z Supabase mają `export const dynamic = 'force-dynamic'`
- [ ] Brak zduplikowanych właściwości w obiektach style (TypeScript złapie, ale sprawdź)

### Serwer
- [ ] Brak plików override w `/data/coolify/proxy/dynamic/` (poza `Caddyfile`)
- [ ] `docker ps` — coolify-proxy działa (healthy)

## Post-Deploy Verification
- [ ] Deployment status: Finished (nie Failed)
- [ ] `curl https://gaproll.eu` zwraca 200
- [ ] Obrazki ładują się (Network tab — brak 307/400 dla .png)
- [ ] `/login` działa
- [ ] `/dashboard` przekierowuje do `/login` gdy niezalogowany

## Rollback
Jeśli deploy failed i strona down:
1. Coolify → Deployments → poprzedni działający deploy → Rollback
2. Sprawdź logi przed kolejną próbą
3. NIE klikaj Deploy ponownie bez zrozumienia przyczyny błędu
