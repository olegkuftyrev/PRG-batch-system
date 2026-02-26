# Technical Specification: Digital Ocean Server Update

## 1. Technical Context

### 1.1 System Architecture

**Deployment Environment:**
- **Platform**: DigitalOcean Droplet
- **OS**: Ubuntu 24.04
- **IP**: 134.199.223.99
- **Deployment Directory**: `/opt/PRG-batch-system` (or `/opt/prg-batch-system` - to be verified)

**Stack:**
- **Backend**: AdonisJS v6.18.0, Node.js 22, TypeScript 5.8.0
- **Frontend**: React 19.2.0, Vite 7.3.1, TypeScript 5.9.3
- **Database**: PostgreSQL 16 (Alpine Linux)
- **Container Orchestration**: Docker Compose
- **Web Server**: nginx (for frontend static files)

**Container Architecture:**
```
┌─────────────────────────────────────────────────┐
│  DigitalOcean Droplet (134.199.223.99)         │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  prg-web     │  │  prg-api     │           │
│  │  :8080       │  │  :3333       │           │
│  │  (nginx)     │──│  (AdonisJS)  │           │
│  └──────────────┘  └──────┬───────┘           │
│                            │                    │
│                    ┌───────┴───────┐           │
│                    │ prg-postgres  │           │
│                    │ :5432         │           │
│                    │ (PostgreSQL)  │           │
│                    └───────────────┘           │
│                            │                    │
│                    [postgres_data volume]      │
└─────────────────────────────────────────────────┘
```

### 1.2 Current State

**GitHub Repository**: https://github.com/olegkuftyrev/PRG-batch-system
- **Current Branch**: droplet-upd-0dc8
- **Latest Commit**: 3a6da1d

**Server State**: Behind latest GitHub commit (exact gap unknown)

### 1.3 Dependencies

**API (api/package.json):**
- @adonisjs/core: ^6.18.0
- @adonisjs/lucid: ^21.6.0
- socket.io: ^4.8.3
- pg: ^8.18.0

**Frontend (web/package.json):**
- react: ^19.2.0
- vite: ^7.3.1
- socket.io-client: ^4.8.3
- tailwindcss: ^4.1.18

## 2. Implementation Approach

### 2.1 Update Strategy

**Standard Deployment Flow** (from DEPLOYMENT.md):
```bash
ssh root@134.199.223.99
cd /opt/PRG-batch-system
git pull
docker compose build
docker compose down
docker compose up -d
```

**Process Breakdown:**

1. **Pre-update verification**
   - Verify SSH access
   - Confirm deployment directory path
   - Check current git status
   - Verify disk space for build
   - Document current container state

2. **Code synchronization**
   - Pull latest code from GitHub
   - Verify pull success and current commit
   - Check for merge conflicts

3. **Container rebuild**
   - Build new Docker images for api and web
   - Handle TypeScript build warnings (--ignore-ts-errors already configured)
   
4. **Service restart**
   - Stop existing containers (brief downtime)
   - Start updated containers
   - Wait for services to become healthy

5. **Post-update verification**
   - Verify all 3 containers running
   - Test health endpoints
   - Check logs for errors
   - Verify database connectivity
   - Test frontend loading
   - Test WebSocket connections

### 2.2 Risk Mitigation

**Known Issues (from DEPLOYMENT.md):**
1. **TypeScript build errors**: Already handled with `--ignore-ts-errors` flag in API Dockerfile
2. **Race condition on startup**: "relation tickets does not exist" - harmless, resolves automatically

**Additional Considerations:**
1. **Directory name variance**: May be `/opt/PRG-batch-system` or `/opt/prg-batch-system`
2. **Git authentication**: Verify git credentials are configured
3. **Database migrations**: New migrations run automatically via scripts/run-migrations.js
4. **Port conflicts**: Verify ports 3333, 8080, 5432 are available
5. **Environment variables**: Verify .env file is present and valid (should persist from previous deployment)

### 2.3 Data Preservation

**Persistent Data:**
- **postgres_data volume**: Contains all database data (menu_items, menu_versions, tickets)
- **uploads_data volume**: Contains uploaded files (if any)
- **Environment files**: `.env` and `.env.production` should remain unchanged

**Data Safety:**
- Docker volumes persist across container restarts
- Only containers are rebuilt, not volumes
- Database data remains intact during update

## 3. Implementation Details

### 3.1 No Source Code Changes Required

This is an **infrastructure/deployment task** with no code modifications needed. The goal is to synchronize the running server with the existing GitHub repository.

### 3.2 Configuration Files

**Existing configuration that should remain unchanged:**

1. **docker-compose.yml**: Defines 3 services with health checks and dependencies
2. **.env**: Contains production secrets (APP_KEY, DB credentials)
3. **.env.production**: Contains environment-specific settings
4. **web/.env.production**: Contains `VITE_API_URL=http://134.199.223.99:3333`

### 3.3 Build Process

**API Container Build** (`api/Dockerfile`):
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build -- --ignore-ts-errors
CMD ["node", "build/bin/server.js"]
```

**Web Container Build** (`web/Dockerfile`):
```dockerfile
FROM node:22-alpine AS builder
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

## 4. Verification Approach

### 4.1 Health Check Endpoints

**API Health:**
```bash
curl http://134.199.223.99:3333/health
# Expected: {"ok":true,"database":"connected"}
```

**Frontend Health:**
```bash
curl -I http://134.199.223.99:8080
# Expected: HTTP/1.1 200 OK
```

### 4.2 Container Status

```bash
docker compose ps
# Expected: All 3 containers with status "Up" and healthy
```

### 4.3 Log Verification

```bash
docker compose logs api --tail 50
# Expected: No critical errors, migrations completed
# Acceptable: "relation tickets does not exist" (transient race condition)

docker compose logs web --tail 20
# Expected: nginx started successfully

docker compose logs postgres --tail 20
# Expected: database system ready to accept connections
```

### 4.4 Functional Testing

1. **Database connectivity**:
   ```bash
   docker compose exec postgres psql -U prg -d prg_batch -c '\dt'
   # Expected: Lists tables (menu_items, menu_versions, tickets, adonis_schema)
   ```

2. **API endpoints**:
   ```bash
   curl http://134.199.223.99:3333/api/menu
   # Expected: JSON array of menu items
   ```

3. **WebSocket**:
   - Connect to ws://134.199.223.99:3333
   - Verify events: snapshot, ticket_created, timer_started, etc.

4. **Frontend**:
   - Open http://134.199.223.99:8080 in browser
   - Verify page loads and renders correctly
   - Test menu item creation/updates

### 4.5 Performance Check

```bash
docker stats --no-stream
# Monitor: CPU usage, memory usage, network I/O
# Current specs: 1GB RAM, 1 vCPU
```

## 5. Delivery Phases

### Phase 1: Pre-deployment Verification
**Goal**: Ensure environment is ready for update

**Tasks**:
- Connect to server via SSH
- Verify deployment directory location
- Check current git status and commit
- Verify disk space availability
- Document current container state
- Check .env file exists

**Success Criteria**:
- SSH access confirmed
- Current state documented
- No blockers identified

### Phase 2: Code Update
**Goal**: Synchronize server code with GitHub

**Tasks**:
- Pull latest code from GitHub
- Verify pull success
- Check for conflicts
- Confirm current commit matches expected

**Success Criteria**:
- Git pull successful
- No merge conflicts
- Commit hash verified

### Phase 3: Container Rebuild
**Goal**: Build updated Docker images

**Tasks**:
- Run `docker compose build`
- Monitor build output
- Verify build completion for all services
- Check for build errors (ignore expected TS warnings)

**Success Criteria**:
- All images built successfully
- No critical build errors
- Build artifacts created

### Phase 4: Service Restart
**Goal**: Deploy updated containers

**Tasks**:
- Stop current containers with `docker compose down`
- Start new containers with `docker compose up -d`
- Wait for containers to reach healthy state

**Success Criteria**:
- All containers started
- All health checks passing
- No restart loops

### Phase 5: Post-deployment Verification
**Goal**: Confirm system is fully functional

**Tasks**:
- Verify container status
- Test API health endpoint
- Test frontend loading
- Check database connectivity
- Review logs for errors
- Test WebSocket connections
- Verify data integrity

**Success Criteria**:
- All health checks pass
- No critical errors in logs
- Frontend accessible and functional
- API responding correctly
- WebSocket connections working
- Database contains expected data

## 6. Rollback Strategy

If critical issues are encountered:

**Quick Rollback**:
```bash
cd /opt/PRG-batch-system
git reset --hard <previous_commit_hash>
docker compose build
docker compose down
docker compose up -d
```

**Container-only Rollback**:
```bash
docker compose down
docker compose up -d
# Uses cached previous images if build hasn't run
```

**Database Restore** (if needed):
```bash
docker compose exec -T postgres psql -U prg prg_batch < backup.sql
```

## 7. Commands Reference

### Connection
```bash
ssh root@134.199.223.99
```

### Standard Update
```bash
cd /opt/PRG-batch-system
git pull
docker compose build
docker compose down
docker compose up -d
```

### Status & Monitoring
```bash
docker compose ps                    # Container status
docker compose logs -f               # All logs (follow)
docker compose logs -f api           # API logs only
docker compose logs -f web           # Web logs only
docker compose logs -f postgres      # DB logs only
docker stats                         # Resource usage
```

### Health Checks
```bash
curl http://134.199.223.99:3333/health              # API
curl -I http://134.199.223.99:8080                  # Frontend
docker compose exec postgres psql -U prg -d prg_batch -c '\dt'  # DB tables
```

### Manual Operations
```bash
# Run migrations manually (if needed)
docker compose exec api node build/scripts/run-migrations.js

# Restart single service
docker compose restart api

# View specific service logs
docker compose logs api --tail 100

# Database access
docker compose exec postgres psql -U prg -d prg_batch
```

## 8. Success Metrics

1. ✅ **Code Sync**: Server commit matches latest GitHub commit
2. ✅ **Container Health**: All 3 containers running with status "Up (healthy)"
3. ✅ **API Health**: `GET /health` returns `{"ok":true,"database":"connected"}`
4. ✅ **Frontend Access**: http://134.199.223.99:8080 loads successfully
5. ✅ **Database**: Tables present and data preserved
6. ✅ **Logs**: No critical errors in any service logs
7. ✅ **WebSocket**: Real-time connections functional
8. ✅ **Response Time**: Health endpoint responds within 2 seconds

## 9. Post-Deployment Documentation

After successful deployment, update will be verified by:
- Recording final commit hash deployed
- Documenting any issues encountered and resolutions
- Noting deployment completion time
- Confirming all success criteria met
