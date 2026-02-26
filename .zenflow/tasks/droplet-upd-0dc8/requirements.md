# Product Requirements Document: Digital Ocean Server Update

## Overview
The Digital Ocean droplet hosting the PRG Batch System is behind the latest GitHub repository code. This task requires manually updating the server to match the current GitHub state and verifying all services are functioning correctly.

## System Context

### Current Deployment
- **Server IP**: 134.199.223.99
- **Frontend URL**: http://134.199.223.99:8080
- **API URL**: http://134.199.223.99:3333
- **Server Location**: /opt/PRG-batch-system or /opt/prg-batch-system
- **Platform**: DigitalOcean Droplet, Ubuntu 24.04

### System Architecture
The PRG Batch System consists of three Docker containers:

1. **prg-postgres**: PostgreSQL 16 database
   - Internal port: 5432
   - Persistent volume: postgres_data
   - Database: prg_batch
   - User: prg

2. **prg-api**: AdonisJS v6.18.0 API
   - Public port: 3333
   - Runs migrations on startup
   - Health endpoint: GET /health

3. **prg-web**: React + Vite frontend
   - Public port: 8080
   - Nginx serving static build
   - API URL configured: http://134.199.223.99:3333

### Repository
- **GitHub**: https://github.com/olegkuftyrev/PRG-batch-system
- **Latest commit**: 3a6da1d (droplet-upd-0dc8 branch)

## Requirements

### 1. Server Update
**Objective**: Bring the server deployment up-to-date with the latest GitHub code

**Actions Required**:
- SSH into the droplet (root@134.199.223.99)
- Navigate to deployment directory (/opt/PRG-batch-system or /opt/prg-batch-system)
- Pull latest code from GitHub
- Rebuild Docker containers
- Restart services with zero/minimal downtime

### 2. Verification
**Objective**: Ensure all services are functioning correctly after update

**Health Checks Required**:

1. **Container Status**
   - All 3 containers running (postgres, api, web)
   - No restart loops or errors

2. **Database**
   - PostgreSQL healthy and accepting connections
   - All tables present (menu_items, menu_versions, tickets, adonis_schema)
   - Data integrity maintained

3. **API Health**
   - Health endpoint responds: `GET /health` → `{"ok":true,"database":"connected"}`
   - Menu API endpoints functional
   - Ticket API endpoints functional
   - WebSocket connections working

4. **Frontend**
   - Web interface loads at http://134.199.223.99:8080
   - Page renders correctly
   - API communication functional

5. **Logs**
   - No critical errors in any service logs
   - Migrations completed successfully
   - No database connection issues

### 3. Update Process
**Standard update procedure** (from DEPLOYMENT.md):
```bash
cd /opt/PRG-batch-system
git pull
docker compose build
docker compose down
docker compose up -d
```

**Alternative considerations**:
- Check if directory is /opt/prg-batch-system vs /opt/PRG-batch-system
- Verify git credentials are configured
- Ensure sufficient disk space before building
- Check if any schema migrations are needed

## Success Criteria

1. ✅ Server code matches latest GitHub commit
2. ✅ All Docker containers running and healthy
3. ✅ Database accessible and containing data
4. ✅ API health endpoint returns success
5. ✅ Frontend loads and displays correctly
6. ✅ WebSocket connections functional
7. ✅ No critical errors in logs

## Assumptions

1. **Access**: SSH credentials and access to root@134.199.223.99 are available
2. **Environment**: .env file on server is correctly configured and doesn't need updates
3. **Data preservation**: Existing database data should be preserved (postgres_data volume persists)
4. **Downtime acceptable**: Brief downtime during container rebuild is acceptable
5. **No schema changes**: Recent commits don't introduce breaking database schema changes
6. **Docker available**: Docker and docker compose are installed and functional on the server

## Potential Risks

1. **Directory location mismatch**: Documentation shows both /opt/prg-batch-system and /opt/PRG-batch-system
2. **Git authentication**: May need to configure git credentials if not already set up
3. **Build failures**: TypeScript errors may prevent build (known issue documented)
4. **Database migrations**: New migrations might fail or cause data issues
5. **Port conflicts**: Services might not restart if ports are already in use
6. **Disk space**: Building new images might fail if insufficient space

## Out of Scope

- SSL/HTTPS configuration
- Nginx reverse proxy setup
- Firewall configuration
- Performance optimization
- Domain name setup
- Database backup before update (though recommended)
- Security hardening

## Notes

### Known Issues (from DEPLOYMENT.md)
- TypeScript errors during build (fixed with --ignore-ts-errors flag)
- "relation tickets does not exist" on startup (harmless race condition, recovers automatically)

### Environment Variables
The server's .env file should already contain:
- APP_KEY (random 32-byte key)
- POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- NODE_ENV=production
- DB connection details

No environment variable changes are expected unless new variables were added in recent commits.
