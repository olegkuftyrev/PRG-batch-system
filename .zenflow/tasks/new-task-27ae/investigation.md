# Investigation and Planning - Digital Ocean Deployment

**Date**: February 21, 2026  
**Task**: Fix deployment issues and prepare for production

---

## Bug Summary

The PRG Batch System worked perfectly on local machines but failed to deploy on Digital Ocean App Platform with the following error:

```
ERROR: failed to launch: determine start command: when there is no default process a command is required
```

---

## Root Cause Analysis

### 1. **Digital Ocean App Platform Issues**
- **Buildpack Detection Failed**: The monorepo structure (web/ and api/ folders) confused DO's automatic buildpack detection
- **No Start Command**: The Dockerfile didn't specify a default ENTRYPOINT or CMD that App Platform could detect
- **Source Directory Confusion**: Setting `/web` as the starting directory bypassed the issue but indicated configuration problems

### 2. **Configuration Problems Identified**
- **SSL Configuration**: `app.yaml` specified `DB_SSL: "true"` but database config didn't properly handle managed PostgreSQL SSL
- **Missing Environment Variables**: `APP_KEY` and `DB_PASSWORD` weren't properly configured as secrets
- **Migration Issues**: No automated database migration on deployment
- **Incorrect Dockerfile Path**: `dockerfile_path: api/Dockerfile` was wrong when `source_dir: api` was set

### 3. **Database Connectivity**
- Digital Ocean managed database credentials were provided but not properly integrated
- Database: `defaultdb` on `db-postgresql-sfo2-61933-do-user-25007663-0.j.db.ondigitalocean.com:25060`
- SSL mode required but not configured correctly

---

## Affected Components

1. **`.do/app.yaml`**: Deployment configuration file
2. **`api/Dockerfile`**: Backend container build
3. **`web/Dockerfile`**: Frontend container build
4. **`api/config/database.ts`**: Database SSL configuration
5. **`docker-compose.yml`**: Local/Droplet deployment orchestration
6. **Environment variables**: Missing/misconfigured across deployments

---

## Proposed Solution

### Decision: Switch from App Platform to Droplet

**Reasoning:**
- App Platform's buildpack detection issues with monorepo structure
- Simpler deployment with full Docker Compose control
- More cost-effective for current scale
- Direct server access for debugging and maintenance

### Implementation Plan

1. **Provision DigitalOcean Droplet**
   - Ubuntu 24.04 LTS
   - Install Docker & Docker Compose
   - Configure firewall rules

2. **Deploy Stack with Docker Compose**
   - PostgreSQL 16 database
   - AdonisJS API backend
   - React/Vite frontend with nginx

3. **Configure Environment**
   - Generate secure `APP_KEY` and database password
   - Set up proper database connection
   - Configure API URL for frontend build

4. **Database Setup**
   - Run migrations automatically on API startup
   - Seed menu data
   - Verify data persistence

5. **Verify Deployment**
   - Health checks for all services
   - WebSocket connectivity test
   - Frontend API communication test

---

## Implementation Notes

### Successful Deployment

**Live Environment:**
- **IP**: 134.199.223.99
- **Frontend**: http://134.199.223.99:8080
- **API**: http://134.199.223.99:3333
- **Status**: ✅ All services running

### Key Changes Made

1. **Fixed API URL Build Issue**
   - Added `VITE_API_URL` build argument to `web/Dockerfile`
   - Configured `docker-compose.yml` to pass API URL during build
   - Updated environment variable handling in frontend code

2. **Database Configuration**
   - Disabled SSL for local PostgreSQL in Docker (`DB_SSL: "false"`)
   - Generated secure credentials: `APP_KEY` and `DB_PASSWORD`
   - Configured proper database connection with health checks

3. **Service Dependencies**
   - API waits for PostgreSQL health check
   - Web service depends on API
   - Migrations run automatically on API startup

4. **Data Seeding**
   - Successfully seeded 16 menu items across 5 categories
   - Verified data visibility in frontend

### Documentation Created

- **[DEPLOYMENT.md](../../DEPLOYMENT.md)**: Comprehensive production deployment guide
- **[deploy-droplet.md](../../deploy-droplet.md)**: Step-by-step Droplet setup instructions
- **[README.md](../../README.md)**: Updated project overview
- **[web/README.md](../../web/README.md)**: Frontend-specific documentation
- **[UPGRADE.md](../../UPGRADE.md)**: Stage 2 planning (iPad optimization focus)

---

## Stage 2 Planning

### User Requirements
- Optimize all screens for iPad resolution: **834 x 1194 pixels**
- Portrait orientation
- Touch-optimized interface
- No scrolling required

### Affected Screens
1. FOH (Front of House)
2. Drive-Thru
3. BOH - Stirfry Station
4. BOH - Fryer Station
5. BOH - Sides/Grill Station
6. Menu Management

---

## Test Results

### Deployment Tests: ✅ PASSED
- [x] PostgreSQL database healthy and accessible
- [x] API starts successfully and runs migrations
- [x] Frontend builds with correct API URL
- [x] WebSocket connection works
- [x] Menu data loads in frontend
- [x] All HTTP endpoints responding
- [x] Docker containers restart automatically

### Local Development Tests: ✅ PASSED
- [x] API runs on localhost:3333
- [x] Frontend runs on localhost:5173
- [x] Hot reload works for both services
- [x] Database migrations work locally

---

## Edge Cases & Side Effects

### Considered
1. **Environment Variable Handling**: Different configs for local vs production
2. **API URL Configuration**: Must be set at build time for frontend
3. **Database Persistence**: Docker volumes ensure data survives container restarts
4. **SSL Certificates**: Not implemented yet (HTTP only for now)

### Future Considerations
1. **HTTPS/SSL**: Need reverse proxy with Let's Encrypt for production security
2. **Domain Name**: Currently using IP address
3. **Backup Strategy**: Need automated database backups
4. **Monitoring**: No alerting or uptime monitoring configured yet
5. **Scalability**: Current Droplet is basic tier, may need upgrade for production load

---

## Status

**Investigation**: ✅ Complete  
**Deployment**: ✅ Complete  
**Documentation**: ✅ Complete  
**Next Steps**: Begin Stage 2 UI optimization for iPad displays
