# Technical Specification: FOH & Drive Thru Screens

## Overview

This is a kitchen display system (KDS) for a restaurant. The frontend is a React + TypeScript SPA (Vite) with Tailwind/shadcn UI. The backend is AdonisJS (Node.js) with Socket.IO for real-time updates.

---

## Architecture

### Screens

The app has a single shared `useSocket` hook that connects to the backend via Socket.IO and maintains a `SocketState`. The current screen (`ScreenId = 1 | 2 | 3 | 4 | 5 | 'menu'`) determines which Socket.IO rooms to join and which UI component to render.

| Screen ID | Component | Role | Socket Rooms |
|-----------|-----------|------|--------------|
| 1 | `ScreenFOH` | Front of House order caller | `foh` |
| 2 | `ScreenDriveThru` | Drive-thru order caller | `drive_thru` |
| 3 | `ScreenBOH` | Stir fry cook station | `stirfry` |
| 4 | `ScreenBOH` | Fryer cook station | `fryer` |
| 5 | `ScreenBOH` | Sides + Grill cook station | `sides`, `grill` |
| menu | `ScreenMenu` | Menu admin | — |

Navigation is hidden by default — a thin bar at the top toggles a dropdown nav.

---

## FOH & Drive Thru Screens (ScreenFOH / ScreenDriveThru)

Both screens share identical logic and structure. The only differences:
- **Source tag**: `foh` vs `drive_thru` sent in `createTicket()`
- **Menu grouping**: different item codes per section (from `useMenu.ts`)
- **Socket room filter**: matching on `t.source` field

### Layout

```
[ Section 1: N items in 4-column grid ]
[ Section 2: N items in 4-column grid ]
[ Section 3: N items in 4-column grid ]
[ My calls (collapsable, grouped by hour) ]
```

### Menu Sections

**FOH:**
- Section 1: `F4, R1, V1, M1, R2, B3, C2`
- Section 2: `B1, CB3, B5, C1, CB1, CB5`
- Section 3: everything else (enabled items not in S1/S2)

**Drive Thru:**
- Section 1: `M1, R2, V1, C3, C2`
- Section 2: `C1, C4, B1, F4, B5, CB3`
- Section 3: `R1`

### CallFoodItem Card

Each menu item is rendered as a card (`CallFoodItem.tsx`) with:
- **Color-coded code badge** (top-left)
- **Quality badge** (top-right): shown based on time since last call
  - `A quality` (green) → < 5 min ago
  - `B quality` (yellow) → 10–15 min ago
  - `Call Now` (red, pulsing) → > 15 min ago
  - Otherwise: relative time label (e.g. "3m ago")
- **Item title** (centered)
- **Food image** or placeholder
- **Batch size selector**: `BatchToggle` (3 options) or button group
- **Call button** (primary): shows timer countdown while cooking, hold countdown during quality check, "EXPIRED - DISCARD" when hold time exceeded
- **Cancel button** (outline): appears when an active ticket exists; triggers confirmation dialog

### Ticket State Machine

```
created → started → completed
                 ↘ cancelled
```

- `created`: ticket was called, waiting for cook to start
- `started`: cook started timer; `startedAt` + `durationSeconds` set
- `completed`: cook marked it done
- `cancelled`: deleted by FOH/DT

### "My Calls" Section

All tickets (active + completed) for the current screen are shown grouped by hour, with collapsible sections. Each row shows item title, batch size, and a status badge:
- `Waiting` (secondary) — state `created`
- `MM:SS` countdown (default) — state `started`, time remaining
- `Quality check` (orange) — state `started`, time expired
- `Done` (outline) — state `completed`

### Data Flow

1. `useSocket(screen)` connects to Socket.IO, joins the appropriate rooms, receives `snapshot` (full state) + incremental events
2. `SocketState` contains `tickets` (active), `completedTickets` (last 50), `offsetMs` (server clock drift correction)
3. FOH/DT merge optimistic tickets (from `createTicket()` HTTP response) with socket-pushed tickets using a `Map` keyed by ticket ID
4. `useRemainingSeconds(startedAt, duration, offsetMs)` ticks every second using corrected server time
5. `getLastCompletedTime()` finds the most recent completed ticket for each item to drive quality badges

### Key Files

| File | Purpose |
|------|---------|
| `web/src/components/ScreenFOH.tsx` | FOH screen component |
| `web/src/components/ScreenDriveThru.tsx` | Drive Thru screen (identical logic to FOH) |
| `web/src/components/CallFoodItem.tsx` | Individual menu item card with call/cancel |
| `web/src/hooks/useSocket.ts` | Socket.IO connection, ticket state management |
| `web/src/hooks/useMenu.ts` | Menu fetching + section grouping helpers |
| `web/src/hooks/useRemainingSeconds.ts` | 1-second countdown timer with server offset |
| `web/src/api/tickets.ts` | REST API: create/start/complete/reset/extend/cancel |
| `web/src/api/menu.ts` | REST API: menu CRUD |
| `web/src/helpers/daypart.ts` | Recommended batch size by time of day |

---

## Code Duplication

`ScreenFOH` and `ScreenDriveThru` are nearly identical (~95% duplicate code). Candidate for extraction into a shared component/hook if improvements are made to both.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), Socket.IO client
- **Backend**: AdonisJS v6, Socket.IO server, PostgreSQL
- **Real-time**: Socket.IO rooms per station; events: `snapshot`, `ticket_created`, `timer_started`, `ticket_completed`, `ticket_cancelled`, `menu_updated`

---

## Awaiting User Input

The task description says "read docs, look at how drive thru and FOH work, and I'll tell you what to do next." The codebase has been analyzed. Ready to receive specific improvement requirements.
