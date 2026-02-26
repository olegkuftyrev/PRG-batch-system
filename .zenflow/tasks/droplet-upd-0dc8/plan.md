# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 8249870c-3ba3-45f6-9c59-642aa1fab10a -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: cc353e80-9285-44ff-8d45-7b35a6dbdbd8 -->

Create a technical specification based on the PRD in `{@artifacts_path}/requirements.md`.

1. Review existing codebase architecture and identify reusable components
2. Define the implementation approach

Save to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach referencing existing code patterns
- Source code structure changes
- Data model / API / interface changes
- Delivery phases (incremental, testable milestones)
- Verification approach using project lint/test commands

### [x] Step: Planning
<!-- chat-id: 17c45bc1-6c8e-42fe-970a-94297191ca5c -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

1. Break down the work into concrete tasks
2. Each task should reference relevant contracts and include verification steps
3. Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint). Avoid steps that are too granular (single function) or too broad (entire feature).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

If the feature is trivial and doesn't warrant full specification, update this workflow to remove unnecessary steps and explain the reasoning to the user.

Save to `{@artifacts_path}/plan.md`.

### [ ] Step: Pre-deployment Verification

Connect to the DigitalOcean droplet and verify the environment is ready for update.

**Tasks:**
- [ ] SSH into root@134.199.223.99
- [ ] Verify deployment directory (/opt/PRG-batch-system or /opt/prg-batch-system)
- [ ] Check current git status and commit hash
- [ ] Document current container state (`docker compose ps`)
- [ ] Verify disk space availability (`df -h`)
- [ ] Confirm .env file exists

**Success Criteria:**
- SSH access confirmed
- Current deployment state documented
- Sufficient disk space available (>2GB free recommended)
- No immediate blockers identified

### [ ] Step: Code Update

Synchronize server code with the latest GitHub repository.

**Tasks:**
- [ ] Navigate to deployment directory
- [ ] Run `git pull` to fetch latest code
- [ ] Verify pull success (no merge conflicts)
- [ ] Confirm current commit hash matches expected (3a6da1d or later)

**Success Criteria:**
- Git pull completed successfully
- No merge conflicts
- Commit hash verified

### [ ] Step: Container Rebuild

Build updated Docker images for all services.

**Tasks:**
- [ ] Run `docker compose build`
- [ ] Monitor build output for errors
- [ ] Verify api image built successfully (ignore TS warnings with --ignore-ts-errors)
- [ ] Verify web image built successfully

**Success Criteria:**
- All images built without critical errors
- TypeScript warnings are acceptable (handled by --ignore-ts-errors flag)
- Build artifacts created

### [ ] Step: Service Restart

Deploy the updated containers.

**Tasks:**
- [ ] Run `docker compose down` to stop current containers
- [ ] Run `docker compose up -d` to start updated containers
- [ ] Wait for containers to reach healthy state (30-60 seconds)
- [ ] Verify all 3 containers are running (`docker compose ps`)

**Success Criteria:**
- All containers started successfully
- No restart loops
- Container health checks passing

### [ ] Step: Post-deployment Verification

Verify all services are functioning correctly after the update.

**Tasks:**
- [ ] Check container status: `docker compose ps` (all should show "Up (healthy)")
- [ ] Test API health: `curl http://134.199.223.99:3333/health` → expect `{"ok":true,"database":"connected"}`
- [ ] Test frontend: `curl -I http://134.199.223.99:8080` → expect HTTP 200
- [ ] Check database tables: `docker compose exec postgres psql -U prg -d prg_batch -c '\dt'`
- [ ] Review API logs: `docker compose logs api --tail 50` (no critical errors)
- [ ] Review web logs: `docker compose logs web --tail 20` (nginx started)
- [ ] Review postgres logs: `docker compose logs postgres --tail 20` (ready to accept connections)
- [ ] Test menu API: `curl http://134.199.223.99:3333/api/menu`
- [ ] Verify frontend loads in browser: http://134.199.223.99:8080
- [ ] Check WebSocket connections are functional

**Success Criteria:**
- ✅ All containers running and healthy
- ✅ API health endpoint returns success
- ✅ Frontend loads correctly
- ✅ Database accessible with all tables present
- ✅ No critical errors in logs
- ✅ WebSocket connections working
- ✅ Menu API responding correctly

**Notes:**
- Acceptable transient error: "relation tickets does not exist" (race condition, self-recovers)
- Expected during build: TypeScript warnings (handled by --ignore-ts-errors flag)
