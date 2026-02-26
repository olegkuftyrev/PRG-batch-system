# PRG Batch System

Kitchen display system for tracking batch cooking and prep tickets.

## Live URLs

- **Frontend**: http://134.199.223.99:8080
- **API**: http://134.199.223.99:3333
- **Database**: PostgreSQL 16 (port 5432, internal)

Full deployment docs: [DEPLOYMENT.md](./DEPLOYMENT.md)

## What This Does

Track cooking batches across multiple kitchen stations. Create tickets, start timers, complete orders. Display real-time status on FOH/Drive-Thru/BOH screens.

**Screens:**
- FOH (Front of House) - Customer-facing
- Drive-Thru - Fixed 12-item layout
- BOH - Station filters: Stirfry, Fryer, Sides, Grill

**Core functions:**
- Create ticket → Auto-start timer → Mark complete
- WebSocket updates all screens in real-time
- Configure menu items: batch sizes, cook times per batch, enable/disable

## Stack

**Frontend** (`/web`)
- React 19 + TypeScript
- Vite 7
- TailwindCSS 4 + shadcn/ui
- Socket.io Client

**Backend** (`/api`)
- AdonisJS 6 + TypeScript
- Lucid ORM
- Socket.io
- PostgreSQL driver

**Database**
- PostgreSQL 16
- Migrations in `/api/database/migrations`
- Seeders in `/api/database/seeders`

**Deployment**
- Docker Compose
- nginx (serves frontend static files)
- DigitalOcean Droplet (Ubuntu 24.04)

## Run Locally

**Requirements:** Node.js 22+, Docker Compose

### Option 1: Docker (simplest)

```bash
git clone https://github.com/olegkuftyrev/PRG-batch-system.git
cd PRG-batch-system
docker-compose up -d
```

Check status:
- Frontend: http://localhost:8080
- API: http://localhost:3333/health

### Option 2: Manual (for development)

**1. Start database:**
```bash
docker-compose up -d postgres
```

**2. Run API:**
```bash
cd api
npm install
cp .env.example .env
# Edit .env: set DB_HOST=localhost, DB_PORT=5432, DB_USER=prg, DB_PASSWORD=<from docker-compose.yml>
node ace migration:run
node ace db:seed
npm run dev
```

API runs on http://localhost:3333

**3. Run frontend:**
```bash
cd web
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Docs

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [deploy-droplet.md](./deploy-droplet.md) - DigitalOcean setup
- [web/README.md](./web/README.md) - Frontend details
- [api/.env.example](./api/.env.example) - Environment variables

## How It Works

### Screens

**FOH (Front of House)**
- Shows active orders for customers
- Groups by menu sections

**Drive-Thru**
- 12 fixed menu items
- One-click call buttons

**BOH (Back of House)**
- Filter by station: Stirfry, Fryer, Sides, Grill
- Show timers counting down
- Show batch size (0.5, 1, 2, 3, etc.)
- Display completed tickets

### Menu Config

Edit menu items:
- Set batch sizes (array, e.g., `["1","2","3"]`)
- Set cook time per batch (JSON, e.g., `{"1":480,"2":480,"3":480}` in seconds)
- Enable/disable item
- Changes sync to all screens via WebSocket

### Ticket Flow

1. User clicks "Call" on FOH or Drive-Thru
2. API creates ticket, broadcasts via WebSocket
3. BOH screen shows ticket, auto-starts timer
4. Timer counts down
5. Kitchen staff marks complete → ticket moves to history

## Database

**Tables:**

`menu_items` - Menu configuration
- `id`, `code`, `title`, `station`
- `batch_sizes` (array, e.g., `["1","2","3"]`)
- `cook_times` (JSON, e.g., `{"1":480,"2":600}`)
- `enabled` (boolean), `recommended_batch` (JSON)

`menu_versions` - Track menu changes
- `id`, `version` (increments on menu update)

`tickets` - Cooking tickets
- `id`, `station`, `seq`, `state`, `source` (foh/driveThru)
- Snapshot of menu item at creation time
- `created_at`, `updated_at`

**Seeded data:** 16 items (3 appetizers, 3 beef, 6 chicken, 1 seafood, 2 sides, 1 vegetable)

## API

**Menu:**
- `GET /api/menu` - List items + current version
- `POST /api/menu` - Create item
- `PATCH /api/menu/:id` - Update item
- `DELETE /api/menu/:id` - Delete item

**Tickets:**
- `GET /api/tickets` - List all
- `POST /api/tickets` - Create (body: `menuItemId`, `batchSize`, `source`)
- `POST /api/tickets/:id/start` - Start timer
- `POST /api/tickets/:id/complete` - Mark done

**Health:**
- `GET /health` - Returns `{"ok":true,"database":"connected"}`

**WebSocket** (`ws://localhost:3333/socket.io`):
- Listen: `snapshot`, `ticket_created`, `timer_started`, `ticket_completed`, `menu_updated`
- Emit: `join` (to subscribe to station-specific updates)

## Project Structure

```
/api                 # AdonisJS backend
  /app/controllers   # HTTP endpoints
  /app/models        # Database models (Lucid ORM)
  /database/migrations
  /database/seeders
  
/web                 # React frontend
  /src/components    # UI components
  /src/hooks         # useSocket, useMenu, etc.
  /src/api           # API client functions
```

## Commands

**API:**
```bash
cd api
npm run dev              # Dev server with hot reload
npm run build            # Compile TypeScript → build/
node ace migration:run   # Apply migrations
node ace db:seed         # Insert test data
```

**Frontend:**
```bash
cd web
npm run dev      # Vite dev server
npm run build    # Production bundle
npm run lint     # ESLint check
```

**Docker:**
```bash
docker-compose up -d        # Start all
docker-compose logs -f api  # Watch API logs
docker-compose restart api  # Restart API only
docker-compose exec api sh  # Shell into container
```

## Troubleshooting

**API won't start:**
1. Check Postgres running: `docker-compose ps`
2. Check `.env` exists with DB credentials
3. Run migrations: `node ace migration:run`

**Frontend can't reach API:**
1. Check API is up: `curl http://localhost:3333/health`
2. Check `VITE_API_URL` in `.env` or build args
3. Open browser console → Network tab → look for CORS errors

**Database errors:**
1. Verify credentials in `.env` match `docker-compose.yml`
2. Connect manually: `docker-compose exec postgres psql -U prg -d prg_batch`
3. Check logs: `docker-compose logs postgres`

**WebSocket won't connect:**
1. Confirm API URL includes `http://` (not `https://` if not using SSL)
2. Check Socket.io path is `/socket.io`
3. Browser DevTools → Network → WS filter → check connection status

---

**Deployed:** February 21, 2026  
**Live:** http://134.199.223.99:8080  
**Version:** 1.0.0
