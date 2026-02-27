# Technical Specification: Start Local Server with Docker

## Difficulty: Easy

Operational task — no code changes required. The goal is to bring up the full local stack using Docker Compose so subsequent development tasks can proceed.

---

## Technical Context

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Database  | PostgreSQL 16 (Alpine)            |
| API       | AdonisJS 6 (Node/TypeScript)      |
| Web       | React 19 + Vite (TypeScript)      |
| Sockets   | Socket.IO 4                       |
| Container | Docker Compose                    |

### Services defined in `docker-compose.yml`

| Service    | Container       | Port (host) | Notes                              |
|------------|-----------------|-------------|------------------------------------|
| `postgres`  | `prg-postgres` | 5432        | healthcheck before API starts      |
| `api`       | `prg-api`      | 3333        | depends on `postgres` health       |
| `web`       | `prg-web`      | 8080        | static Nginx; depends on `api`     |

---

## Implementation Approach

1. Create a local `.env` file (if absent) by copying from `.env.production` and filling in a valid `APP_KEY`.
2. Run `docker compose up -d` from the project root.
3. Verify all three services reach `running` / `healthy` state.

### Environment prerequisites
- A `.env` file must exist at the project root with at minimum:
  ```
  NODE_ENV=production
  APP_KEY=<random-32-char-string>
  POSTGRES_USER=prg
  POSTGRES_PASSWORD=prg_secret
  POSTGRES_DB=prg_batch
  ```
- No `.env` file is committed (gitignored); `.env.production` is the template.

---

## Source Code Changes

None. This task is purely operational (run existing Docker Compose setup).

---

## Data Model / API / Interface Changes

None.

---

## Verification

```bash
# 1. Bring up stack
docker compose up -d

# 2. Check all services are running
docker compose ps

# 3. Verify API health endpoint
curl http://localhost:3333/health

# 4. Verify web is served
curl -I http://localhost:8080

# 5. Verify DB connectivity via API logs
docker compose logs api --tail 30
```

Expected: all three containers show `running`; API health returns 200; web returns 200.
