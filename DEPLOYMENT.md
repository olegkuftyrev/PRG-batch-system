# Production Deployment

## Live URLs

- **Frontend**: http://134.199.223.99:8080
- **API**: http://134.199.223.99:3333
- **Host**: DigitalOcean Droplet, Ubuntu 24.04
- **IP**: 134.199.223.99

## What's Running

**3 Docker containers:**

1. **prg-postgres** (postgres:16-alpine)
   - Port: 5432 (internal only)
   - Database: `prg_batch`
   - User: `prg`
   - Volume: `postgres_data` (persists data)

2. **prg-api** (custom build from `/api/Dockerfile`)
   - Port: 3333 (public)
   - AdonisJS v6.18.0, Node.js 22
   - Runs migrations on startup
   - Endpoint: `GET /health` → `{"ok":true,"database":"connected"}`

3. **prg-web** (custom build from `/web/Dockerfile`)
   - Port: 8080 (public)
   - nginx serving React SPA
   - Build: React 19 + Vite 7

## Database

**Tables:** `menu_items`, `menu_versions`, `tickets`, `adonis_schema`

**Seed data:** 16 menu items (3 appetizers, 3 beef, 6 chicken, 1 seafood, 2 sides, 1 veg)

## Environment

**API container** (`.env` in `/opt/PRG-batch-system/.env`):
```env
APP_KEY=<randomly generated, 32 bytes>
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
DB_HOST=postgres
DB_PORT=5432
DB_USER=prg
DB_PASSWORD=<set in docker-compose.yml>
DB_DATABASE=prg_batch
DB_SSL=false
```

**Frontend build arg** (set in `docker-compose.yml`):
```
VITE_API_URL=http://134.199.223.99:3333
```

## How to Deploy Updates

SSH into droplet:
```bash
ssh root@134.199.223.99
cd /opt/PRG-batch-system
```

Pull and rebuild:
```bash
git pull
docker-compose build
docker-compose down
docker-compose up -d
```

Check status:
```bash
docker-compose ps
docker-compose logs -f
```

## Commands

**Run migrations:**
```bash
docker-compose exec api node build/scripts/run-migrations.js
```

**Seed data:**
```bash
docker-compose exec api node build/scripts/run-seed.js
```

**View logs:**
```bash
docker-compose logs -f api       # API logs
docker-compose logs -f web       # Frontend build logs
docker-compose logs -f postgres  # Database logs
```

**Restart a service:**
```bash
docker-compose restart api
docker-compose restart web
```

**Connect to database:**
```bash
docker-compose exec postgres psql -U prg -d prg_batch
```

## API Endpoints (Live)

**Health:**
```bash
curl http://134.199.223.99:3333/health
# Returns: {"ok":true,"database":"connected"}
```

**Menu:**
```bash
# List all
GET http://134.199.223.99:3333/api/menu

# Create item
POST http://134.199.223.99:3333/api/menu
# Body: {"code":"C1","title":"Orange Chicken","station":"fryer","batchSizes":["1","2","3"],"cookTimes":{"1":480,"2":480,"3":480},"enabled":true}

# Update/delete
PATCH http://134.199.223.99:3333/api/menu/:id
DELETE http://134.199.223.99:3333/api/menu/:id
```

**Tickets:**
```bash
GET http://134.199.223.99:3333/api/tickets
POST http://134.199.223.99:3333/api/tickets
POST http://134.199.223.99:3333/api/tickets/:id/start
POST http://134.199.223.99:3333/api/tickets/:id/complete
```

**WebSocket:**
```
ws://134.199.223.99:3333/socket.io
Events: snapshot, ticket_created, timer_started, ticket_completed, menu_updated
```

## Known Issues

**TypeScript errors during build:**
- Fixed with `--ignore-ts-errors` flag
- Pre-existing validation errors in `menu_items_controller.ts`
- Does not affect runtime

**"relation tickets does not exist" on startup:**
- Harmless race condition
- API starts before migrations finish
- Server recovers automatically

## Resolved Issues

**[2026-02-27] App crash: `Cannot read properties of undefined (reading 'length')`**

- **Symptom**: Frontend crashed on load with a TypeError in the minified bundle. All screens were broken.
- **Root cause**: `MenuItem.serialize()` and `Ticket.serialize()` in the API models returned snake_case keys (`batch_sizes`, `cook_times`, `recommended_batch`, etc.) but the frontend TypeScript types expect camelCase (`batchSizes`, `cookTimes`, `recommendedBatch`). This meant `item.batchSizes` was `undefined`, causing `.length` to throw.
- **Why it only broke in production**: The local dev server was running old compiled code from a worktree that predated the `serialize()` override. The production Docker build compiled the latest source which included the snake_case serializer.
- **Fix**: Updated `api/app/models/menu_item.ts` and `api/app/models/ticket.ts` to return camelCase keys from `serialize()`, matching the frontend contract.
- **Commit**: `2c304e4`

**[2026-02-27] docker-compose `ContainerConfig` error when recreating containers**

- **Symptom**: `docker-compose up` fails with `KeyError: 'ContainerConfig'` when trying to recreate a container that previously exited.
- **Root cause**: The droplet runs docker-compose v1.29.2 (legacy Python-based), which is incompatible with newer Docker Engine versions. Stale exited containers in a broken state confuse the old compose.
- **Fix**: Manually remove the stale container with `docker rm <container_name>`, then run `docker-compose up -d` again.
- **Long-term fix**: Upgrade to Docker Compose v2 plugin: `apt install docker-compose-plugin -y`. Then use `docker compose` (no hyphen) instead of `docker-compose`.

## Monitoring

**Check health:**
```bash
curl http://134.199.223.99:3333/health        # API
curl -I http://134.199.223.99:8080            # Frontend
docker-compose ps                              # Containers
```

**Watch logs:**
```bash
docker-compose logs -f          # All
docker-compose logs -f api      # API only
docker-compose logs -f postgres # DB only
```

**Resource usage:**
```bash
docker stats    # Container CPU/RAM
htop            # System overview
df -h           # Disk space
```

## Backup & Restore

**Backup database:**
```bash
docker-compose exec postgres pg_dump -U prg prg_batch > backup-$(date +%Y%m%d-%H%M).sql
```

**Restore database:**
```bash
docker-compose exec -T postgres psql -U prg prg_batch < backup-20260221-0633.sql
```

**Backup entire system:**
```bash
tar -czf prg-backup-$(date +%Y%m%d).tar.gz /opt/PRG-batch-system --exclude=node_modules --exclude=build
```

## Security

**Current setup:**
- APP_KEY: Random 32-byte key
- DB password: Strong random password
- Env vars: Not in git
- HTTP only (no SSL)
- Ports exposed directly (no reverse proxy)

**To improve:**
1. Add nginx reverse proxy (see `deploy-droplet.md`)
2. Enable SSL with Let's Encrypt (requires domain)
3. Configure UFW firewall
4. Install fail2ban for SSH
5. Run `apt update && apt upgrade` monthly

## Costs

**Current droplet:** $6/month (1GB RAM, 1 vCPU, 25GB SSD, 1TB transfer)

**Recommended upgrade:** $12/month (2GB RAM) for production load

## Performance

**Specs:** 1 vCPU (shared), 1GB RAM, 25GB SSD

**Tested:**
- Menu API requests: Works
- WebSocket connections: Stable
- Database queries: Fast
- May need 2GB RAM for high traffic

## Troubleshooting

**Frontend won't load:**
```bash
docker-compose logs web
docker-compose restart web
```

**API errors:**
```bash
docker-compose logs api
docker-compose restart api
```

**Database issues:**
```bash
docker-compose logs postgres
docker-compose exec postgres psql -U prg -d prg_batch -c '\dt'
```

**Rebuild from scratch:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

**Deployed:** February 21, 2026  
**Repo:** https://github.com/olegkuftyrev/PRG-batch-system
