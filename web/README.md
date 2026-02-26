# Frontend

React app for kitchen batch cooking displays.

## Stack

- React 19 + TypeScript
- Vite 7
- TailwindCSS 4
- shadcn/ui
- Socket.io Client
- Lucide React (icons)

## Screens

- **FOH** - Customer-facing
- **Drive-Thru** - Drive-through window
- **BOH** - Kitchen stations: Stirfry, Fryer, Sides/Grill
- **Menu** - Admin config

## What It Does

- WebSocket connection → real-time ticket updates
- Server time sync → accurate countdowns
- Auto-reconnect

Create ticket → start timer → complete → archive

## Dev Setup

**Requirements:** Node.js 22+

```bash
npm install
npm run dev      # Dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview build
```

**Environment:**

`.env.development.local`:
```
VITE_API_URL=http://localhost:3333
```

Production: Set via Docker build arg

**Live:** http://134.199.223.99:8080 (nginx serves static files)

## Project Structure

```
/src
  /api           # API client functions
  /components    # React components
    /ui          # shadcn/ui
    Screen*.tsx  # Screen components
  /hooks         # useSocket, useMenu, etc.
  /types         # TypeScript types
  /lib           # Utils
  App.tsx        # Main
```

## API

**REST:**
- `GET /api/menu`
- `POST /api/menu`
- `PATCH /api/menu/:id`
- `DELETE /api/menu/:id`
- `POST /api/tickets`
- `POST /api/tickets/:id/start`
- `POST /api/tickets/:id/complete`

**WebSocket (receive):**
- `snapshot` - Full state on connect
- `ticket_created`
- `timer_started`
- `ticket_completed`
- `menu_updated`

**WebSocket (emit):**
- `join` - Subscribe to station updates

## Screens

**ScreenFOH** - Customer display, active tickets grouped by section

**ScreenDriveThru** - 12 fixed items, quick-call buttons

**ScreenBOH** - Station filter, timers, batch sizes, completed history

**ScreenMenu** - CRUD menu items, cook times per batch, enable/disable

## Styling

TailwindCSS 4:
- Custom colors in `tailwind.config.js`
- shadcn/ui components
- Mobile-first
- No dark mode

## Commands

```bash
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Known Issues

- Socket reconnect → brief flicker
- Menu screen needs manual refresh after bulk edits
- No offline support

## Planned

- Offline mode (service workers)
- Print tickets
- Audio alerts
- Dark mode
- Mobile responsive
- Priority indicators

---

**Updated:** 2026-02-21
