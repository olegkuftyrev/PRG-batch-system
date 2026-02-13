# PRG Batch System — Technical

Technical stack, architecture, and implementation notes. For product vision and behavior, see [README.md](./README.md).

---

## Tech stack

*(Define and update as the project is scoped.)*

| Layer | Choice | Notes |
|-------|--------|--------|
| **Frontend** | *TBD* | Runs in browser on tablets (FOH, drive-thru, BOH). Must support 5 screen types + menu page, real-time updates. |
| **Realtime / sync** | *TBD* | Tickets, timers, and queue state must sync across tablets (WebSockets, SSE, or similar). |
| **Backend / API** | *TBD* | Serves menu, tickets, timer state. No auth (protected server). |
| **Data / persistence** | *TBD* | Menu (editable), tickets, timer state. SQLite, JSON files, or DB — TBD. |
| **Hosting / run** | *TBD* | Runs on a protected server (on-prem or private network). No public auth layer. |

**Constraints from product:**

- No login/auth in the app; access = who can reach the server.
- Same app serves all 5 screen types + menu; device chooses “which screen” via navigation.
- Real-time: BOH timers and queues must update on all relevant BOH screens when someone taps Start or Complete.

---

## Project structure

*(To be filled as the repo is set up.)*

```
PRG-batch-system/
├── README.md          # Product / vision
├── TECH.md            # This file — technical
├── ...
```

---

## Key technical decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | None in app | Access controlled by server/network; see [README](./README.md#access-no-authentication). |
| Dayparts & drive-thru layout | Fixed / const in code | Not editable in app; see product doc. |
| Menu data | Editable in app | Stored and loaded from backend; categories drive BOH routing. |

---

## Setup & run

*(Add once stack is chosen: install deps, env vars, how to run dev and prod.)*

- **Prerequisites:** *TBD*
- **Install:** *TBD*
- **Run (dev):** *TBD*
- **Run (prod / protected server):** *TBD*

---

## Realtime behavior (summary)

- **Call food (screen 1 or 2):** New ticket created → routed by item category to BOH screen(s) 3, 4, or 5.
- **BOH Start:** Timer starts for that ticket; timer value and state sync to all BOH screens for that category.
- **Timer ends:** Sound; ticket enters “quality check” until **Complete** → then moves to completed queue (shown at bottom).
- **Menu edit:** Changes persist and are reflected on call screens (and anywhere menu is read).

---

*Update this doc as the stack and structure are defined.*
