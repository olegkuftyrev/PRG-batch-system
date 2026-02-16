# PRG Batch System — MVP: stages and build pipeline

This doc defines **MVP scope**, **stages**, and **how to build** the app. It sits between [README.md](./README.md) (product/vision) and [TECH.md](./TECH.md) (architecture). Use it to plan and execute development in order.

---

## MVP scope

**In scope for MVP:**

- **5 screen types + menu page** in one app; user switches which screen this tablet is (1 FOH, 2 Drive-thru, 3–5 BOH, or Menu). [README: Tablets and screens](README.md#tablets-and-screens-5-total)
- **Call food** from screen 1 (FOH, full menu, 3 sections) and screen 2 (Drive-thru, 12 items, 3 sections). Tickets route to BOH by **station** (stirfry, fryer, sides, grill). [TECH: Station routing](TECH.md#station-routing-db-driven)
- **BOH screens** (3, 4, 5): waiting queue, Start → timer, quality check (sound), Complete → completed queue at bottom. Timer sync across clients; server time offset; server emits `timer_ended`. [TECH: Timer sync](TECH.md#timer-sync-critical)
- **Menu:** editable (items, codes, titles, station, batch sizes, cook times, enable/disable, recommended batch per daypart). Menu version + broadcast on change; ticket snapshots at create. [README: Menu](README.md#menu-predefined-and-editable), [TECH: Menu version](TECH.md#menu-version-for-mid-shift-updates)
- **Reconnect / rehydrate:** on connect, server sends snapshot (tickets, timers, menu_version, serverNowMs). [TECH: Reconnect](TECH.md#reconnect--state-rehydrate)
- **No auth.** Run on host locally for dev; production = tablets over internet to hosted server. [TECH: Deployment](TECH.md#deployment)

**Out of scope for MVP (can add later):**

- POS integration
- Multi-store or multi-timezone (single store, one server TZ is enough for MVP)
- Canceled/voided tickets (optional in TECH; can ship without and add later)
- Instructions/help screen content (placeholder is fine; fill later)

---

## Build pipeline (order of work)

Build in this order so each step has something to plug into:

1. **Project + data** — Repo, Adonis + Postgres, schema (menu_items, tickets, menu_version, station_seq/day).
2. **API only** — Menu CRUD, create ticket, start timer, complete ticket. No Socket yet; test with HTTP.
3. **Socket.IO + rooms** — Connect, join station rooms, broadcast ticket/timer events, snapshot on connect.
4. **Frontend shell** — Single React (Vite) app, navigation to pick screen (1–5, Menu), placeholder content per screen.
5. **Screen 1 (FOH) + Screen 2 (Drive-thru)** — Call food UI, menu by section, create ticket via API then Socket.
6. **Screens 3, 4, 5 (BOH)** — Waiting/completed queues, Start/Complete, timer display (server time offset), sound on quality check.
7. **Menu screen** — Load/save menu, version bump, broadcast menu_updated.
8. **Reconnect + timer on boot** — Snapshot payload; server reschedule timers from DB on boot. [TECH: Timer drift guard](TECH.md#timer-sync-critical), [TECH: Reconnect](TECH.md#reconnect--state-rehydrate)
9. **PWA + deploy** — Installable/kiosk, Docker Compose or PM2, tablets point at server.

---

## Stages (detailed)

### Stage 0: Project setup

**Goal:** Repo and stack run locally; DB exists; no features yet.

| Step | What to do | Reference |
|------|------------|-----------|
| 0.1 | Create AdonisJS (TypeScript) app; add Postgres driver. | [TECH: Stack](TECH.md#tech-stack-recommended) |
| 0.2 | **Use Docker from the start (recommended):** Add Docker Compose with **Postgres** (and optionally Adonis) so the same setup runs for Stage 0 and Stage 1. No need to install Postgres on the host. | [TECH: Deploy](TECH.md#deployment) |
| 0.3 | Create DB (e.g. via migration or init script) and run migrations when you add them in Stage 1. | — |
| 0.4 | Create React (Vite) app in same repo or subfolder; proxy API in dev. | [TECH: Frontend](TECH.md#tech-stack-recommended) |
| 0.5 | Install **shadcn/ui** in the frontend app (Vite). Use [shadcn/ui Installation](https://ui.shadcn.com/docs/installation) — e.g. `pnpm dlx shadcn@latest create` for new project, or add to existing Vite app per docs. | [TECH: UI components](TECH.md#tech-stack-recommended) |

**Done when:** `docker compose up` (or equivalent) brings up Postgres (and API if in Docker); `npm run dev` starts backend and frontend; DB connects; you can hit a health endpoint from the browser.

---

### Stage 1: Data model and API

**Goal:** Schema matches TECH; REST endpoints for menu and tickets; no Socket yet.

| Step | What to do | Reference |
|------|------------|-----------|
| 1.1 | **Menu table:** `menu_items` with code, title, **station** (stirfry \| fryer \| sides \| grill), batch sizes (JSON or related), cook_time per batch (JSON or related), enabled, recommended_batch per daypart. **Menu version:** `menu_version` table or single row with `version` integer. | [TECH: Station routing](TECH.md#station-routing-db-driven), [README: Menu](README.md#menu-predefined-and-editable) |
| 1.2 | **Tickets table:** id, **station**, **station_seq**, **station_day**, state (created \| started \| completed \| canceled), created_at, started_at, duration_seconds; **snapshots:** menu_version_at_call, item_title_snapshot, batch_size_snapshot, duration_snapshot. | [TECH: Ticket lifecycle](TECH.md#ticket-lifecycle-states-canonical), [TECH: Menu on ticket](TECH.md#menu-version-for-mid-shift-updates), [TECH: Ordering](TECH.md#ordering-last-order-first) |
| 1.3 | **Dayparts:** Fixed in code (6–11, 11–2, 2–5, 5–8, 8–12). Helper: current daypart from server time. | [README: Dayparts](README.md#dayparts) |
| 1.4 | **API:** Menu list (with version), menu create/update/delete (bump version); ticket create (assign station from menu_items.station, set station_day + station_seq, store snapshots); ticket start (set started_at, duration_seconds); ticket complete. | [TECH: DB events](TECH.md#db-store-events-not-ticking-state) |
| 1.5 | Seed or migrate initial menu items and stations per README (stir fry, fry, sides, appetizer, grill → stations). | [README: Category → items](README.md#food-categories-and-routing-to-boh) |

**Done when:** You can create a ticket via POST, start it, complete it; menu CRUD works; ordering uses station_day + station_seq.

**Verify Stage 1 (how to check it's good to go):**

1. **Migrations:** Run migrations; no errors; tables `menu_items`, `tickets`, and menu version (e.g. `menu_versions` or `settings`) exist.
2. **Seed:** Run seed; menu has items with correct `station` (stirfry, fryer, sides, grill). Menu version is present (e.g. 1).
3. **Menu API:**  
   - `GET /api/menu` (or your route) returns list of items and `menu_version`.  
   - `PATCH /api/menu/:id` (or create/update) updates an item and bumps version.
4. **Ticket create:**  
   - `POST /api/tickets` with body e.g. `{ menuItemId, batchSize, source: 'foh' }` returns 201 and a ticket with `station`, `station_seq`, `station_day`, `state: 'created'`, and snapshots filled.
5. **Ticket start:**  
   - `POST /api/tickets/:id/start` returns 200; ticket has `state: 'started'`, `started_at` and `duration_seconds` set.
6. **Ticket complete:**  
   - `POST /api/tickets/:id/complete` returns 200; ticket has `state: 'completed'`.
7. **Ordering:**  
   - Create two tickets for the same station; `GET /api/tickets?station=stirfry` (or your route) returns them in **last-first** order (newest at top: `station_day DESC`, `station_seq DESC` or equivalent).

Use **curl**, **Postman**, or a small script. Once all seven pass, Stage 1 is good to go.

---

### Stage 2: Socket.IO and realtime

**Goal:** Clients connect, join station rooms; server broadcasts ticket/timer events; snapshot on connect.

| Step | What to do | Reference |
|------|------------|-----------|
| 2.1 | Add Socket.IO (or ws) to Adonis; same process as HTTP. | [TECH: Realtime](TECH.md#tech-stack-recommended) |
| 2.2 | **Rooms:** stirfry, fryer, sides, grill. Client sends "join" with list of stations (e.g. screen 5 → [sides, grill]). | [TECH: WebSocket rooms](TECH.md#timer-sync-critical) |
| 2.3 | **Events to broadcast:** ticket_created (to station room), timer_started (startedAt, durationSeconds), timer_ended (ticketId), ticket_completed; menu_updated (version). | [TECH: Timer sync](TECH.md#timer-sync-critical) |
| 2.4 | **Snapshot on connect:** For joined stations, send active tickets (not completed) with id, station, seq, state, startedAt, duration, snapshots; menu_version; **serverNowMs**. | [TECH: Reconnect snapshot](TECH.md#reconnect--state-rehydrate) |
| 2.5 | **Timer on server:** On start, store startedAt + durationMs; schedule setTimeout; on fire, verify `now >= startedAt + duration` then emit timer_ended. On server boot, load tickets in state `started`, reschedule or emit if already past. | [TECH: Timer drift guard](TECH.md#timer-sync-critical) |

**Done when:** Two browser tabs in same station room both see ticket create and timer start/end; reconnect gets snapshot with serverNowMs.

---

### Stage 3: Frontend shell and navigation

**Goal:** One React app; top-level "which screen" (1–5, Menu); placeholder content per screen; Socket connect and join rooms based on screen.

| Step | What to do | Reference |
|------|------------|-----------|
| 3.1 | **Routing or state:** Current screen = 1 | 2 | 3 | 4 | 5 | Menu. Navigation control (e.g. sidebar or menu) to switch. No auth. | [README: Screen functions](README.md#screen-functions-global-vs-per-screen) |
| 3.2 | **Socket:** On mount, connect; get serverNowMs from snapshot or ping, compute offsetMs. Join rooms: screen 1/2 → none for BOH; screen 3 → stirfry; 4 → fryer; 5 → sides, grill; Menu → optional menu room. | [TECH: Reconnect](TECH.md#reconnect--state-rehydrate) |
| 3.3 | Placeholder UI per screen: "FOH", "Drive-thru", "BOH Stir fry", "BOH Fryer", "BOH Sides+Grill", "Menu". Instructions/help entry point (can be a link to a static page for MVP). | [README: How to use](README.md#how-to-use-defined-on-a-screen) |

**Done when:** Switching "screen" changes the view and Socket room membership; serverNowMs/offset available for timers.

---

### Stage 4: Call food (screens 1 and 2)

**Goal:** FOH and Drive-thru can select item + batch and create a ticket; ticket appears on correct BOH station(s).

| Step | What to do | Reference |
|------|------------|-----------|
| 4.1 | **Screen 1 (FOH):** Load menu (by section: Section 1, 2, 3 per README). Show only enabled items. Current daypart for recommended batch. On submit: POST create ticket (source = FOH), then Socket will broadcast to station room(s). | [README: FOH sections](README.md#front-of-house-screen-1-full-menu-3-sections-steam-table) |
| 4.2 | **Screen 2 (Drive-thru):** Fixed 12 items in 3 sections (hardcode or const from README). Same flow: select item, batch, POST create ticket (source = drive-thru). | [README: Drive-thru](README.md#drive-thru-screen-2-12-items-and-3-sections-fixed) |
| 4.3 | **Ticket create payload:** menu_item_id (or code), batch_size, source (foh \| drive_thru). Backend sets station from menu_items.station; station_day + station_seq; snapshots from current menu. | [TECH: Menu on ticket](TECH.md#menu-version-for-mid-shift-updates) |
| 4.4 | **Own calls only:** Screen 1 subscribes to "my tickets" for FOH (optional: filter by source in snapshot/events or only show "last N" for this device). Same for screen 2 drive-thru. Simplest MVP: show only tickets created from this screen (e.g. store device/source in localStorage and filter). | [README: Who sees what](README.md#who-sees-what-visibility) |

**Done when:** Creating a ticket from FOH or Drive-thru shows it on the right BOH screen(s) via Socket; FOH/Drive-thru see their own calls.

---

### Stage 5: BOH screens (3, 4, 5)

**Goal:** Waiting queue, Start → timer, quality check (sound), Complete → completed queue; timer in sync across clients.

| Step | What to do | Reference |
|------|------------|-----------|
| 5.1 | **Queues:** Waiting (state = created); In progress (state = started, show timer); Completed (state = completed) at bottom. Order: last first (station_day DESC, station_seq DESC). | [README: BOH queues](README.md#who-sees-what-visibility), [TECH: Ordering](TECH.md#ordering-last-order-first) |
| 5.2 | **Start:** Button per ticket in waiting. POST start → server stores started_at + duration_seconds, broadcasts timer_started; server schedules setTimeout + drift guard, emits timer_ended when due. | [TECH: Timer sync](TECH.md#timer-sync-critical) |
| 5.3 | **Timer display:** Client computes remaining from server time: `(Date.now() + offsetMs) / 1000 - startedAt/1000`; remaining = durationSeconds - elapsed. Update every second. When remaining <= 0 → show "Quality check", play sound. | [TECH: Countdown](TECH.md#timer-sync-critical) |
| 5.4 | **Complete:** Button when in quality check (or anytime for started). POST complete → server sets state = completed, broadcasts ticket_completed. | [TECH: Ticket lifecycle](TECH.md#ticket-lifecycle-states-canonical) |
| 5.5 | **Timer limits per station:** Fryer = multiple; Stir fry = max 2; Sides = 1; Grill = 1. Enforce on server when starting (reject or queue). | [README: Multiple timers](README.md#who-sees-what-visibility) |

**Done when:** Multiple tablets on same station see same queues and timers; sound on quality check; complete moves ticket to completed queue.

---

### Stage 6: Menu screen

**Goal:** Load and edit menu; save bumps version and broadcasts menu_updated; clients refresh when version changes.

| Step | What to do | Reference |
|------|------------|-----------|
| 6.1 | **Menu UI:** List items; add/edit form (code, title, station, batch sizes, cook times per batch, enabled, recommended batch per daypart). | [README: Menu editing](README.md#menu-predefined-and-editable) |
| 6.2 | **Save:** PUT/PATCH menu item or bulk; increment menu_version; broadcast menu_updated(version). | [TECH: Menu version](TECH.md#menu-version-for-mid-shift-updates) |
| 6.3 | **Client:** On menu_updated or snapshot with newer menu_version, refetch menu (or receive full menu in event). Call screens use latest menu for new tickets. | [TECH: Menu version](TECH.md#menu-version-for-mid-shift-updates) |

**Done when:** Editing menu updates DB and version; all clients get new version and refresh menu.

---

### Stage 7: Reconnect and robustness

**Goal:** Reconnecting client gets full snapshot; server survives restart and re-arms timers.

| Step | What to do | Reference |
|------|------------|-----------|
| 7.1 | **Snapshot shape:** On Socket connect after join, server sends { tickets, menu_version, serverNowMs } per TECH. Client rebuilds queues and applies offset. | [TECH: Reconnect](TECH.md#reconnect--state-rehydrate) |
| 7.2 | **Boot:** On Adonis start, query tickets in state `started`; for each, if now >= started_at + duration_seconds, emit timer_ended; else schedule setTimeout for remaining ms. | [TECH: Timer on boot](TECH.md#timer-sync-critical) |
| 7.3 | **Station day reset:** Implement station_day = DATE(created_at) in store TZ; station_seq per station per day. | [TECH: Ordering reset](TECH.md#ordering-last-order-first) |

**Done when:** Reload BOH tablet → sees current queues and timers; restart server → timers still fire or emit.

---

### Stage 8: PWA and deploy

**Goal:** App installable/kiosk; run on hosted server; tablets over internet.

| Step | What to do | Reference |
|------|------------|-----------|
| 8.1 | **PWA:** Add manifest and service worker (e.g. Vite PWA plugin). Installable on tablets; optional kiosk mode (browser fullscreen or device kiosk app). | [TECH: Frontend](TECH.md#tech-stack-recommended) |
| 8.2 | **Deploy:** Docker Compose (Postgres + Adonis + static build) or PM2. Server URL configurable in frontend (env or build-time). | [TECH: Deployment](TECH.md#deployment) |
| 8.3 | **Instructions screen:** Add a simple "How to use" page (link from global nav); content can be short for MVP. | [README: How to use](README.md#how-to-use-defined-on-a-screen) |

**Done when:** Tablets can install the app and point at the hosted server; full flow works over internet.

---

## Checklist summary

| Stage | Key outcome |
|-------|-------------|
| 0 | Project + DB + dev run |
| 1 | Schema + API (menu, tickets, start, complete) |
| 2 | Socket.IO + rooms + snapshot + timer server logic |
| 3 | Frontend shell + navigation + Socket join |
| 4 | FOH + Drive-thru call food |
| 5 | BOH queues + Start + timer + Complete + sound |
| 6 | Menu screen + version + broadcast |
| 7 | Reconnect snapshot + server boot timers |
| 8 | PWA + deploy |

---

## References

- **Product and behavior:** [README.md](./README.md)
- **Architecture and technical decisions:** [TECH.md](./TECH.md)

Update this doc as you complete stages or change scope.
