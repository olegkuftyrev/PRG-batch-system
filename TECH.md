# PRG Batch System — Technical

Technical stack, architecture, and implementation notes. For product vision and behavior, see [README.md](./README.md). For MVP stages and how to build, see [MVP.md](./MVP.md).

---

## Tech stack (recommended)

| Layer | Choice | Notes |
|-------|--------|--------|
| **Backend / API** | **AdonisJS** (TypeScript) | Serves API, menu CRUD, ticket actions; WebSocket server in same process. No auth. |
| **DB** | **Postgres** (local or cloud) | Menu (editable), tickets, timer metadata. Avoid SQLite + timer state in DB under rush load — see below. |
| **Realtime / sync** | **Socket.IO** (or raw WS) | Server-authoritative timestamps; tickets and timer events broadcast to BOH rooms. See [Timer sync](#timer-sync-critical). |
| **Frontend** | **React** (Vite or Next) as **PWA / kiosk** | Single app, 5 screen types + menu. Runs in browser on tablets; installable/kiosk mode. |
| **UI components** | **shadcn/ui** | Official UI library for consistent, accessible components. [Installation](https://ui.shadcn.com/docs/installation) — use with Vite (or Next). |
| **Deploy** | **Docker Compose** (preferred), or **PM2** | See [Deployment](#deployment) below. |

**Avoid:** Adonis + SQLite + “timer state in DB” — that combo can behave oddly under rush load. Prefer Postgres for this project.

**Why Postgres over SQLite here:** Under rush load you get many concurrent ticket creates, timer starts, and completes. Postgres handles concurrent writes and connection pooling cleanly; SQLite's single-writer model and file locking can cause contention, timeouts, or weirdness when the app + Socket.IO are hammering the DB. Postgres (local or cloud) keeps menu, tickets, and timer metadata predictable under load and plays well with Adonis.

**Why this fits:** Adonis + Postgres patterns match; **timers** stay in sync via server-authoritative timestamps over Socket.IO; PWA/kiosk fits tablets; Docker Compose gives a clean, reproducible deploy.

---

## Timer sync (critical)

Timers must show the **same remaining time** on every BOH screen for that category. **Approach: server as source of truth, clients compute display.**

1. **Start** — Client sends action to server. Server stores `startedAt` (Unix ms) + `durationSeconds` (cook time from menu), then broadcasts to all clients in that BOH category: `{ type: 'timer_started', ticketId, startedAt, durationSeconds }`.

2. **Countdown** — Each client computes remaining from **server time**, not raw `Date.now()`. Device clocks can be off by seconds or minutes, so: on socket connect, do a quick ping/pong to estimate `offsetMs = serverNowMs - clientNowMs`; then use `serverNow ≈ Date.now() + offsetMs` for all countdown math. So: `remainingSeconds = durationSeconds - ((Date.now() + offsetMs)/1000 - startedAt/1000)`. Same `startedAt`, `durationSeconds`, and offset logic on all clients → same time even if a tablet’s clock is wrong. Update UI every second.

3. **Quality check** — When `remainingSeconds <= 0`, client shows "Quality check" and plays sound. **Server must also emit `timer_ended(ticketId)`**. Node timers can drift under load or be lost on restart. Safer pattern: store `startedAt` + `durationMs`; schedule `setTimeout(durationMs)` when the timer is started; when the timeout fires → **verify** `now >= startedAt + duration` before emitting (drift guard). If the server restarted, **reschedule from DB on boot** for any tickets still in `started` state whose `startedAt + duration` is in the past or near future, then emit or re-arm. That way `timer_ended` is reliable even after restart. Clients still compute locally; server guarantees final state.

4. **Complete** — Client sends to server; server moves ticket to completed queue and broadcasts → all BOH screens update.

**Why not client-only timer?** Local timers would drift (different receive time, device clocks). One server `startedAt` + clients computing remaining using **server time offset** keeps everyone in sync.

**WebSocket rooms: by station, not screen.** Rooms are **stirfry**, **fryer**, **sides**, **grill** (four stations). Screen 3 subscribes to `stirfry`; screen 4 to `fryer`; screen 5 to **both** `sides` and `grill`. That makes the “one timer for sides and one for grill” rule clean. Broadcast ticket/timer updates only to the relevant station room(s).

---

## Reconnect / state rehydrate

Sync assumes continuous connection; in reality tablets reload or drop Wi-Fi. Without rehydrate, a reconnecting BOH tablet could show empty queues.

**On client connect/reconnect:**

1. Client joins the appropriate **station rooms** (e.g. `sides` + `grill` for screen 5).
2. Server sends a **snapshot** with this minimal shape so FE/BE stay aligned:
   - **tickets:** for each active ticket (not completed) in those stations: `id`, `station`, `seq`, `state`, `startedAt`, `duration` (or `durationSeconds`), and **snapshots** (item_title_snapshot, batch_size_snapshot, duration_snapshot / menu_version_at_call as needed).
   - **menu_version**
   - **serverNowMs** — so the client can compute `offsetMs = serverNowMs - Date.now()` immediately without a separate ping.
3. Client rebuilds UI from this snapshot (waiting queue, in-progress with timers, offset from `serverNowMs`).

Clients then stay in sync via normal events; the snapshot is the bootstrap after reconnect.

---

## Ticket lifecycle states (canonical)

Define these explicitly so frontend and backend don't drift. Some are stored, some derived.

| State | Stored / derived | Meaning |
|-------|-------------------|---------|
| **created** | Stored | Ticket created; in waiting queue. |
| **started** | Stored | Cook tapped Start; timer running. `startedAt` + `durationSeconds` stored. |
| **quality_check** | Derived | `now >= startedAt + duration`; timer at 0; waiting for Complete. Client shows "Quality check" and plays sound. |
| **completed** | Stored | Cook tapped Complete; ticket in completed queue. |
| **canceled** | Stored (optional) | Ticket voided/canceled. |

Use the same state names everywhere.

---

## Station routing: DB-driven

Rooms are **stirfry**, **fryer**, **sides**, **grill**. Ensure the DB drives routing, not hardcoded category maps.

- **Schema:** `menu_items.station` — enum or string: `stirfry` | `fryer` | `sides` | `grill`. Each menu item has one station. When a ticket is created, route it to the station room(s) from the item’s `station`.
- **Why:** Future-proofs new items, category changes, and multi-store configs. No code change when you add an item or change which station it goes to.
- Product doc maps categories (Stir fry, Fry item, Sides, Appetizer, Grill) to stations: stir fry → `stirfry`, fry item + appetizer → `fryer`, sides → `sides`, grill → `grill`. Store that mapping in data (e.g. category → station) or store `station` directly on `menu_items`.

---

## DB: store events, not ticking state

Persist only **events**, not derived state. Do **not** write remaining time every second.

**Write to DB only:**

- ticket **created**
- timer **started** (with `startedAt`, `durationSeconds`)
- ticket **completed**
- (optional) ticket **canceled / voided**

Everything else (remaining time, "in progress" list, completed list) is **derived** from these events. Keeps writes low and avoids weirdness under load.

---

## Ordering: "last order first"

You want newest ticket at the top. Under concurrency, two tickets can land in the same millisecond.

**Best practice for kitchens: monotonic sequence per station per day.**

- **DB:** `station_seq INT`, `station_day DATE` on each ticket. Sequence increments per station per day (e.g. ticket 1, 2, 3… for stirfry today).
- **Reset rule:** Define explicitly so multi-TZ doesn't get messy: **reset at local store midnight in server timezone**, or set `station_day = DATE(created_at or startedAt)` in the store's timezone. Same rule everywhere (e.g. server TZ = store TZ, or store has a configurable TZ). Document it; otherwise deployments in different TZ will disagree on "today."
- **Why better than timestamp:** human-readable order ("ticket 42"); no clock tie; stable across migrations; easier debugging. Sort by `station_day DESC, station_seq DESC` (or ASC for "oldest first" completed list).

Fallback: `created_at DESC, id DESC` if you don’t add seq yet. Prefer the sequence once you can.

---

## Menu: version for mid-shift updates

If the menu changes mid-shift, tablets should know they're current.

- Add **menu_version** (integer) or **updated_at** snapshot on the menu.
- On menu save, bump version and **broadcast** `menu_updated` with the new version (e.g. over Socket.IO to all clients or to a `menu` room).
- Clients refresh menu when they receive a version newer than what they have.

**Menu version on ticket (edge case):** A ticket can be created under menu v5; menu is edited to v6; a cook screen reloads. If the ticket still references live menu fields, the UI can show wrong item title or duration. Store on the **ticket** at create time: **menu_version_at_call**, **item_title_snapshot**, **batch_size_snapshot**, **duration_snapshot**. Display from these snapshots so "menu changed mid-rush" doesn’t cause mismatches.

---

## Methodology

**Development process:** Staged delivery (as in [MVP.md](./MVP.md)) works well. Treat each stage as a **milestone** with a clear “Done when” and verification steps.

- **Planning:** Work in stage order (0 → 8). Optionally break stages into smaller tasks in a backlog; no need for full Scrum unless the team is large.
- **Definition of Done per stage:** Backend: migrations/API/Socket behavior as in MVP; frontend: screen(s) working against that backend; reconnect/boot behavior where the stage requires it. Run the stage’s “Verify” steps (e.g. curl/Postman for Stage 1) before marking done.
- **Code approach:** **Vertical slices** per feature (e.g. “create ticket” = API route + Socket broadcast + DB + one frontend flow) so each stage delivers a working slice. Prefer **feature-aligned** folders on the frontend (screens, tickets, menu) rather than only “by type” (all components in one bucket).

**Out of scope for MVP:** Formal sprints, story points, or heavy process. Keep it lightweight: stage → tasks → implement → verify → next stage.

---

## Project structure

Recommended layout: **monorepo**, backend and frontend in separate roots so Adonis and Vite each own their tooling. Use **feature-oriented** structure on the frontend (screens + shared), and **layer + domain** on the backend.

```
PRG-batch-system/
├── README.md
├── TECH.md
├── MVP.md
├── docker-compose.yml          # Postgres (and optionally API) for dev/prod
├── api/                        # AdonisJS backend
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── menu_items_controller.ts
│   │   │   └── tickets_controller.ts
│   │   ├── models/
│   │   │   ├── menu_item.ts
│   │   │   ├── menu_version.ts
│   │   │   └── ticket.ts
│   │   ├── services/          # optional: timer scheduling, snapshot builder
│   │   └── sockets/           # or start/socket.ts: room join, broadcast, snapshot
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── config/
│   ├── start/
│   ├── package.json
│   └── ...
├── web/                        # React (Vite) frontend
│   ├── src/
│   │   ├── components/         # shared UI (shadcn + custom)
│   │   │   ├── ui/            # shadcn components
│   │   │   └── ...
│   │   ├── screens/           # one folder per screen type (feature-oriented)
│   │   │   ├── foh/
│   │   │   ├── drive-thru/
│   │   │   ├── boh-stirfry/
│   │   │   ├── boh-fryer/
│   │   │   ├── boh-sides-grill/
│   │   │   ├── menu/
│   │   │   └── screen-picker/  # “which screen is this tablet”
│   │   ├── lib/               # api client, socket, server-time offset, constants
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
└── .env.example
```

**Backend (api/):**

- **Layer + domain:** `app/controllers`, `app/models`, and optionally `app/services` for timer/snapshot logic; keep Socket handling in `app/sockets` or `start/socket.ts` so it’s easy to find. Migrations and seeders under `database/`.
- **Stations:** Keep station names (`stirfry`, `fryer`, `sides`, `grill`) in config or a single constants module so DB and Socket rooms stay in sync.

**Frontend (web/):**

- **Feature-oriented screens:** `screens/foh`, `screens/drive-thru`, `screens/boh-stirfry`, etc. Each screen folder can contain its components, hooks, and sub-routes if needed. Shared pieces (timer display, ticket card, queue list) live in `components/` or a `components/shared/` (or under a screen if used only there first; extract when reused).
- **lib/:** API client, Socket.IO connection, server-time offset helper, dayparts/stations constants. Keeps screens thin and testable.
- **Routing:** One route per screen (e.g. `/foh`, `/drive-thru`, `/boh/stirfry`, `/boh/fryer`, `/boh/sides-grill`, `/menu`) plus a root that redirects to screen-picker or default. Screen-picker is the “which screen is this tablet” selector available from every screen.
- **UI components (one per primitive, props for variants):** Keep a single **Button** in `components/ui/` (and similarly one **Card**, **Input**, etc.). Control look and behavior via **props** (e.g. `variant`, `size`, `disabled`), not by creating many component files (no `ButtonPrimary`, `ButtonSecondary`, `RedButton`, etc.). Screens import `<Button variant="default" size="lg">` from the UI folder. Same idea for all primitives: one component, props for differences. Easier to find (“button is in UI”) and consistent with shadcn’s approach.

**Alternatives:**

- **api/ vs backend/:** `api/` is short and clear; `backend/` is equally valid.
- **web/ vs frontend/ vs app/:** Any is fine; `web/` avoids confusion with Adonis “app” folder.
- **Flat screens:** If you prefer fewer folders, `screens/FohScreen.tsx` etc. under one `screens/` directory is fine; the important part is grouping by screen/feature rather than only by type.

This structure supports the MVP pipeline: Stage 0 creates `api/` and `web/`; later stages add controllers/models, then sockets, then screen folders and lib.

---

## Routes

Defined so backend and frontend share one contract. Implement these in Stage 0–2 (API) and Stage 3 (frontend routes).

### Backend (API) — HTTP

Base URL: `/api` (e.g. `http://localhost:3333/api`). No auth.

**Menu — full CRUD + flexible list**

| Method | Path | Purpose | Notes |
|--------|------|---------|--------|
| GET | `/api/menu` | List menu + version | Query (optional): `?station=stirfry`, `?enabled=true`. Response: `{ items: MenuItem[], menu_version: number }`. |
| GET | `/api/menu/:id` | Get one menu item | For edit form or detail. 404 if not found. |
| POST | `/api/menu` | Create menu item | Body: full item fields; bumps `menu_version`. |
| PATCH | `/api/menu/:id` | Update menu item | Body: partial item; bumps `menu_version`. |
| DELETE | `/api/menu/:id` | Delete menu item | Bumps `menu_version`. |

**Tickets — create, read, update, cancel, start, complete**

| Method | Path | Purpose | Notes |
|--------|------|---------|--------|
| GET | `/api/tickets` | List tickets | Query: `?station=stirfry` (required for BOH). Optional: `?state=created,started,completed` (default: all non-canceled so BOH gets waiting + in progress + completed queue). Order: last first. |
| GET | `/api/tickets/:id` | Get one ticket | For detail or before update. 404 if not found. |
| POST | `/api/tickets` | Create ticket | Body: `{ menu_item_id, batch_size, source: 'foh' \| 'drive_thru' }`. Server sets station, station_seq, station_day, snapshots. |
| PATCH | `/api/tickets/:id` | Update ticket | Only when `state === 'created'` (e.g. fix item, batch_size, or source). Re-snapshots from current menu; optional re-route if station changes. 400/409 if already started. |
| POST | `/api/tickets/:id/cancel` | Cancel / void ticket | Sets `state: 'canceled'`; broadcast so BOH drops it. Allowed in `created` or `started` (e.g. mistaken call or timer abandoned). |
| POST | `/api/tickets/:id/start` | Start timer | Sets `started_at`, `duration_seconds`; returns updated ticket. |
| POST | `/api/tickets/:id/complete` | Complete ticket | Sets `state: 'completed'`. |

**Config / server time / daypart**

| Method | Path | Purpose | Notes |
|--------|------|---------|--------|
| GET | `/api/config` | Server time + current daypart | Response: `{ serverNowMs, currentDaypart: 'breakfast' \| 'lunch' \| 'snack' \| 'dinner' \| 'late_snack' }`. Lets FOH/Drive-thru get recommended batch and sync time without opening a Socket first. |
| GET | `/health` | Liveness | Optional; can live outside `/api` (e.g. `/health`). |

**Optional (if you want server as single source of truth)**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/stations` | List station codes | Response: `[{ id: 'stirfry', label? }, ...]`. Else frontend uses a shared constant. |

All JSON. Use standard status codes (200, 201, 400, 404, 409, 422).

### Backend — Socket.IO (realtime)

**Client → Server**

| Event | Payload | Purpose |
|-------|---------|--------|
| `join` | `{ stations: ('stirfry' \| 'fryer' \| 'sides' \| 'grill')[] }` | Subscribe to station room(s). After join, server sends snapshot. |

**Server → Client**

| Event | Payload | When |
|-------|---------|------|
| `snapshot` | `{ tickets, menu_version, serverNowMs }` | Right after client `join`. |
| `ticket_created` | `{ ticket }` | New ticket for that station. |
| `ticket_updated` | `{ ticket }` | Ticket edited (only in `created`); e.g. item/batch/source changed. |
| `ticket_canceled` | `{ ticketId }` or `{ ticket }` | Ticket voided; BOH removes from queue. |
| `timer_started` | `{ ticketId, startedAt, durationSeconds }` | Cook started timer. |
| `timer_ended` | `{ ticketId }` | Timer reached 0 (quality check). |
| `ticket_completed` | `{ ticketId }` or `{ ticket }` | Ticket moved to completed. |
| `menu_updated` | `{ menu_version }` | Menu save; client refetches menu. |

### Frontend (web) — browser routes

Single React app; one route per screen. Base path: `/` (or PWA root).

| Path | Screen | Purpose |
|------|--------|---------|
| `/` | Screen picker | “Which screen is this tablet?” → redirect or choose 1–5 or Menu. |
| `/foh` | Screen 1 | Front of house — call food (full menu, 3 sections). |
| `/drive-thru` | Screen 2 | Drive-thru — call food (12 items, 3 sections). |
| `/boh/stirfry` | Screen 3 | BOH — stir fry queue + Start/timer/Complete. |
| `/boh/fryer` | Screen 4 | BOH — fryer + appetizer queue + Start/timer/Complete. |
| `/boh/sides-grill` | Screen 5 | BOH — sides + grill queue + Start/timer/Complete. |
| `/menu` | Menu | Edit menu (items, codes, station, batch sizes, cook times, enable/disable, recommended batch per daypart). |
| `/instructions` | Instructions | Optional; “How to use” (link from global nav). |

Use React Router (or similar): define these paths and render the corresponding screen component. Default route `/` can show the screen-picker; no need for `/screen` unless you prefer it.

---

## Key technical decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | None in app | Access controlled by server/network; see [README](./README.md#access-no-authentication). |
| Dayparts & drive-thru layout | Fixed / const in code | Not editable in app; see product doc. |
| Menu data | Editable in app | Stored and loaded from backend; categories drive BOH routing. |

---

## Deployment

- **While developing:** Fine to run everything on your host locally (Adonis + Postgres + frontend). Tablets can point at your machine for testing.
- **Production:** No local machine in production. Internet is always available for tablets and does not go down. Tablets connect **over the internet** to a **hosted server** (e.g. VPS, cloud, or your own server with a public or VPN reachable URL). Deploy the stack (Adonis + Postgres + static frontend) there with Docker Compose or PM2. Tablets run the PWA in kiosk mode and talk to that server.

**Docker (what it covers):**

- **`docker compose up`** runs **Postgres** and **API** (Adonis). The repo root has `docker-compose.yml`; `api/Dockerfile` builds the API image. The **web** (Vite) app is not in Docker in dev so you get fast HMR on the host; in production you build the web app and serve it from the API or a static server.
- **Postgres:** image `postgres:16-alpine`, persistent volume `postgres_data`, healthcheck. Env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` (see `.env.example`).
- **API:** build from `api/`, depends on Postgres healthy, env for `DB_*` and `HOST`/`PORT`. Exposes `3333`; Socket.IO runs on the same process.
- **Optional:** `docker compose up -d postgres` runs only Postgres so you can run the API and web on the host (same env; set `DB_HOST=127.0.0.1` for the API).

---

## Setup & run

- **Prerequisites:** Node 20+, pnpm or npm, Docker and Docker Compose.
- **Env:** Copy `.env.example` to `.env` in the repo root; set `POSTGRES_*` and `DB_*` (and `API_PORT` if you change it). When API runs on host, use `DB_HOST=127.0.0.1`.
- **Run (dev):**  
  - Start DB (and optionally API) with Docker: `docker compose up -d` or `docker compose up -d postgres`.  
  - From repo root: `cd api && npm install && node ace serve --watch`; in another terminal `cd web && npm install && npm run dev`.  
  - Open the web app (e.g. http://localhost:5173); it proxies API to http://localhost:3333. Hit `GET /health` or `GET /api/health` to confirm the API.
- **Run (prod):** On the server, `docker compose up -d` (Postgres + API). Build the web app and serve it (e.g. from API or nginx). Tablets point at the server URL.

**How to test:**

1. **Postgres only (works now, before Stage 0.1)**  
   From repo root:
   ```bash
   cp .env.example .env
   docker compose up -d postgres
   docker compose exec postgres pg_isready -U prg -d prg_batch
   ```
   You should see `prg_batch:5432 - accepting connections`. Optional: `docker compose exec postgres psql -U prg -d prg_batch -c '\dt'` (empty list of tables is fine).

2. **Postgres + API (after Adonis is in `api/`)**  
   ```bash
   docker compose up -d
   curl -s http://localhost:3333/health
   ```
   Expect a 200 and a body like `{"ok":true}` or similar. Then `curl -s http://localhost:3333/api/health` if your health route lives under `/api`.

3. **Full dev stack (after Stage 0)**  
   Terminal 1: `docker compose up -d postgres` (or `docker compose up -d` to run API in Docker).  
   Terminal 2: `cd api && node ace serve --watch`.  
   Terminal 3: `cd web && npm run dev`.  
   Open http://localhost:5173 and in another tab http://localhost:3333/health (or the URL your Vite proxy uses for the API). You should see the app and a successful health response.

---

## Realtime behavior (summary)

- **Call food (screen 1 or 2):** New ticket created → routed by item category to BOH screen(s) 3, 4, or 5.
- **BOH Start:** Timer starts for that ticket; timer value and state sync to all BOH screens for that category.
- **Timer ends:** Sound; ticket enters “quality check” until **Complete** → then moves to completed queue (shown at bottom).
- **Menu edit:** Changes persist and are reflected on call screens (and anywhere menu is read).

---

## Architecture verdict

The stack choice matches the system shape: **event-driven**, **realtime**, **low latency**, **moderate concurrency**, **no auth**, **kiosk clients**. Adonis + Postgres + Socket.IO + PWA is a clean fit.

**Go / No-Go (engineering reliability):**

| Area | Status |
|------|--------|
| Timer sync | ✔ |
| Concurrency | ✔ |
| Ordering | ✔ |
| Menu edits | ✔ |
| Realtime model | ✔ |
| Deployment | ✔ |

**This is now a build-ready architecture.**

---

*Update this doc as the stack and structure are defined.*
