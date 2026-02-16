# PRG Batch System — Test results

## Run: 2026-02-16

**Full log:** `test-logs.txt` (includes Docker pull output).

### Summary

| Step | Result |
|------|--------|
| 1. Start Postgres | ✅ `docker compose up -d postgres` — container started |
| 2. Wait for healthcheck | ✅ 5s wait |
| 3. Postgres readiness | ✅ `pg_isready`: `/var/run/postgresql:5432 - accepting connections` |
| 4. List tables | ✅ No relations (expected before migrations) |
| 5. Container status | ✅ `prg-postgres` Up, healthy, 0.0.0.0:5432->5432/tcp |

**Conclusion:** Postgres service and DB are working.

---

## Stage 0 complete (2026-02-16)

- **API (AdonisJS):** Scaffolded in `api/` with Postgres, Lucid, CORS, health at `/health` and `/api/health`. Run: `cd api && node ace serve` (or `npm run dev`). With Postgres: `DB_HOST=127.0.0.1 node ace serve`.
- **Web (Vite + React):** Created in `web/` with API proxy to `localhost:3333`. Run: `cd web && npm run dev` → http://localhost:5173.
- **shadcn/ui:** Installed in `web/`; Button component added. One component per primitive, props for variants (per TECH).
- **Full stack test:** Start Postgres (`docker compose up -d postgres`), then in one terminal `cd api && npx tsx bin/server.ts` (or `node ace serve`), in another `cd web && npm run dev`. Open http://localhost:5173 and click "Check API health" → should show `{ "ok": true }`.

---

## Fix: API health returning 500 / `node ace serve` failing (2026-02-16)

**Causes:**
1. With `node ace serve`, ts-node type-checked `adonisrc.ts`: the `meta` property is not in `RcFileInput`, so the app failed to start (exit 1) and the health check never responded.
2. Middleware had to resolve under both ts-node (ace serve) and tsx; using package subpath `#middleware/...` works for both.

**Fixes applied:**
- **adonisrc.ts:** Removed invalid `meta: { appName: '...' }` (not part of Adonis 6 rc config).
- **start/kernel.ts:** Use `#middleware/container_bindings_middleware` and `#middleware/force_json_response_middleware` so resolution works with `node ace serve` and `npm run dev:tsx`.
- Frontend: improved error handling (HTTP status + hint when the API fails).

**Result:** Stage 0 passes with `cd api && node ace serve` (or `npm run dev`): health returns 200 and `{ "ok": true }` from the browser.

---

## Stage 1 complete (2026-02-16)

- **Migrations:** menu_items, menu_versions, tickets (via `npx tsx scripts/run-migrations.ts`).
- **Models:** MenuItem, Ticket, MenuVersion.
- **API:** GET/POST/PATCH/DELETE /api/menu; GET/POST /api/tickets, POST /api/tickets/:id/start, POST /api/tickets/:id/complete.
- **Seed:** 16 menu items with stations, cook times, recommended batches (`npx tsx scripts/run-seed.ts`).
- **Daypart helper:** breakfast, lunch, snack, dinner, late_snack (Downtime = snack + late_snack).

---

## Stage 2 complete (2026-02-16)

- **Socket.IO:** Same process as HTTP; Ws service in `app/services/ws.ts`.
- **Rooms:** stirfry, fryer, sides, grill. Client emits `join` with `['stirfry']` etc.
- **Events:** ticket_created, timer_started, timer_ended, ticket_completed, menu_updated.
- **Snapshot on connect:** { tickets, menuVersion, serverNowMs } for joined stations.
- **Timer on server:** schedule() on ticket start; rescheduleOnBoot() for tickets in state=started.
- **Vite proxy:** /socket.io → API for frontend WebSocket.
