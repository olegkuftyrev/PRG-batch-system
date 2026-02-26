# Technical Specification: PRG Batch System - Debugging & Refactoring Audit

## 1. Context

### 1.1 Technology Stack

**Backend:**
- Framework: AdonisJS 6 (Node.js ESM)
- Language: TypeScript 5.8
- ORM: Lucid ORM
- Database: PostgreSQL 16
- WebSocket: Socket.io 4.8.3
- Build: AdonisJS Assembler

**Frontend:**
- Framework: React 19
- Language: TypeScript 5.9
- Build Tool: Vite 7
- UI Library: shadcn/ui + TailwindCSS 4
- WebSocket: Socket.io Client 4.8.3

**Available Tooling:**
- Backend: `npm run lint` (eslint), `npm run build` (TypeScript check via AdonisJS)
- Frontend: `npm run lint` (eslint), `tsc -b` (TypeScript check)
- No test frameworks detected

### 1.2 Project Structure

```
/api                              # AdonisJS backend
  /app
    /controllers                  # HTTP endpoints (health, menu_items, tickets)
    /models                       # Lucid models (MenuItem, Ticket, MenuVersion)
    /services                     # Business logic (ws.ts, timer.ts)
    /validators                   # VineJS request validators
    /helpers                      # Utility functions (daypart.ts)
    /middleware                   # HTTP middleware
    /exceptions                   # Error handlers
  /database
    /migrations                   # 4 migrations (menu_items, menu_versions, tickets, Stage 2 additions)
    /seeders                      # 01_menu_seeder.ts (16 items)
  /start                          # Application bootstrap (ws.ts, routes.ts, kernel.ts, env.ts)
  /config                         # Configuration files
  /scripts                        # Utility scripts (migrations, seeding, testing)
  /build                          # TypeScript output (gitignored in api/, but not root)

/web                              # React frontend
  /src
    /components                   # React components (screens, UI components)
      /ui                         # shadcn/ui components (20+ components)
    /hooks                        # Custom hooks (useSocket, useMenu, useServerTime, useRemainingSeconds)
    /api                          # API client functions (menu.ts, tickets.ts)
    /helpers                      # Utility functions (daypart.ts)
    /lib                          # Utilities (utils.ts for cn())
    /types                        # TypeScript types (screen.ts)
  /public                         # Static assets
```

### 1.3 Architecture

**Real-time Communication:**
- HTTP REST API for CRUD operations
- WebSocket for real-time state synchronization
- Server-side timer service broadcasts updates
- Frontend hooks manage socket subscriptions

**State Management:**
- Backend: Lucid models with `serialize()` methods
- Frontend: React hooks + Socket.io events
- Menu versioning for cache invalidation

**Data Flow:**
1. User action → HTTP POST
2. Server updates DB → broadcasts WebSocket event
3. All connected clients receive update → re-render

## 2. Audit Objectives & Scope

### 2.1 Primary Goals

1. **Bug Identification**: Catalog all bugs, issues, and inconsistencies from documentation and code
2. **Status Verification**: Determine current state (open/resolved/partial) of each issue
3. **Requirement Validation**: Ensure code implementation matches documented requirements
4. **Code Quality**: Detect technical debt, architectural risks, and anti-patterns
5. **Safe Refactoring**: Fix bugs and improve code while preserving behavior and architecture
6. **Documentation**: Create comprehensive audit report with findings and actions

### 2.2 In Scope

**Investigation Areas:**
- All Markdown documentation (README.md, UPGRADE.md, DEPLOYMENT.md, deploy-droplet.md, web/README.md, web/SHADCN_AUDIT.md)
- Code comments (TODO, FIXME, HACK, BUG, NOTE)
- TypeScript source code (controllers, models, services, validators, components, hooks)
- Configuration files (.gitignore, tsconfig.json, eslint configs, docker configs)
- Database schema and migrations

**Code Quality Issues:**
- Console statements in production code (`console.log`, `console.error`, `console.warn`)
- TypeScript errors causing build to use `--ignore-ts-errors` flag
- Duplicate files (collapsable.tsx vs collapsible.tsx)
- Hardcoded values and magic numbers
- Inconsistent naming conventions
- Missing validation
- Error handling gaps

**Requirements Validation:**
- API endpoints vs documentation
- WebSocket events vs documentation
- Database schema vs requirements
- Feature completeness (Stage 1, Stage 2)
- UI/UX implementation vs design specs

### 2.3 Out of Scope

❌ **Explicitly Excluded:**
- New feature development (Stage 2 incomplete features)
- UI/UX redesign
- Performance optimization (beyond bug fixes)
- Security enhancements (beyond basic best practices)
- Test suite creation
- CI/CD pipeline setup
- Database schema changes (unless fixing bugs)
- Deployment process changes

### 2.4 Constraints

1. **Preserve Behavior**: All fixes must maintain current functionality
2. **No Breaking Changes**: Public API contracts (HTTP, WebSocket) cannot change
3. **Backward Compatibility**: Database must remain compatible
4. **Zero Downtime**: Changes should not require service interruption
5. **Architecture Integrity**: Core patterns (AdonisJS + React, WebSocket, Lucid ORM) must remain unchanged

## 3. Implementation Approach

### 3.1 Methodology

**Iterative Audit Cycle:**

```
1. Scan
   └─ Read documentation (Markdown files)
   └─ Extract requirements, bugs, issues
   └─ Search code for markers (TODO, FIXME, console.*)
   └─ Build comprehensive task list

2. Correlate
   └─ Map documentation → code implementation
   └─ Identify discrepancies
   └─ Check API contracts
   └─ Verify database schema usage

3. Analyze
   └─ Determine root causes
   └─ Assess severity and impact
   └─ Evaluate fix complexity
   └─ Identify architecture risks

4. Prioritize
   └─ Critical bugs (breaks functionality)
   └─ High-priority (TypeScript errors, console statements)
   └─ Medium (code smells, inconsistencies)
   └─ Low (documentation gaps, minor refactoring)

5. Fix
   └─ Implement bug fixes
   └─ Refactor problematic code
   └─ Update .gitignore
   └─ Improve error handling

6. Validate
   └─ Run linters (npm run lint in api/ and web/)
   └─ Run TypeScript checks (tsc --noEmit or npm run build without --ignore-ts-errors)
   └─ Manual testing of critical flows
   └─ Verify WebSocket updates

7. Document
   └─ Record findings
   └─ Log decisions and rationale
   └─ Track remaining issues
   └─ Update audit report
```

### 3.2 Investigation Strategy

#### Phase 1: Documentation Scan

**Files to analyze:**
- [x] `/README.md` - Project overview, API contracts, tech stack
- [x] `/UPGRADE.md` - Stage 2 requirements, known issues
- [x] `/DEPLOYMENT.md` - Deployment issues (TypeScript errors, race conditions)
- [x] `/deploy-droplet.md` - Infrastructure setup
- [x] `/web/README.md` - Frontend architecture, known bugs
- [x] `/web/SHADCN_AUDIT.md` - UI component inventory

**Extract:**
- Documented bugs and their status
- Feature requirements (Stage 1, Stage 2)
- API endpoint specifications
- WebSocket event specifications
- Database schema requirements
- Known workarounds and technical debt

#### Phase 2: Code Pattern Search

**Search patterns:**
```bash
# Console statements
grep -r "console\.(log|error|warn|info|debug)" --include="*.ts" --include="*.tsx" api/ web/

# Code markers
grep -r "TODO\|FIXME\|HACK\|BUG\|XXX" --include="*.ts" --include="*.tsx" api/ web/

# TypeScript error suppressions
grep -r "@ts-ignore\|@ts-expect-error\|@ts-nocheck" --include="*.ts" --include="*.tsx" api/ web/

# Hardcoded values (example searches)
grep -r "420\|600\|5000000" --include="*.ts" --include="*.tsx" api/ web/
```

**Files with console statements (identified):**
- `/api/start/ws.ts`
- `/api/app/services/ws.ts`
- `/web/src/components/ScreenBOH.tsx`
- `/web/src/components/ui/batch-toggle.tsx`
- Scripts (acceptable): run-seed.ts, verify-stage1-2.ts, test-socket.ts, apply_migration.ts, run-migrations.ts

#### Phase 3: Code Quality Analysis

**Check for:**

1. **Type Safety Issues**
   - Files causing TypeScript errors
   - Missing type definitions
   - `any` types
   - Unsafe type assertions

2. **Code Duplication**
   - Duplicate components: `collapsable.tsx` vs `collapsible.tsx`
   - Duplicated logic across files
   - Repeated constants

3. **Error Handling**
   - Missing try-catch blocks
   - Silent failures
   - User-facing error messages

4. **Naming Inconsistencies**
   - camelCase vs snake_case
   - Abbreviated vs full names
   - Inconsistent terminology

5. **Hardcoded Values**
   - Magic numbers
   - Hardcoded URLs
   - Hardcoded station names
   - Timer limits

#### Phase 4: Requirements Validation

**Validate against documentation:**

1. **API Endpoints** (from README.md)
   - Compare documented endpoints vs implemented routes
   - Check request/response formats
   - Verify validation rules
   - **Known gap**: Image upload/delete endpoints exist but not documented

2. **WebSocket Events** (from README.md, web/README.md)
   - Compare documented events vs implementation
   - Check event payloads
   - Verify room subscriptions
   - **Known gap**: `ticket_cancelled`, `ping`, `pong` events undocumented

3. **Database Schema**
   - Verify migrations match requirements
   - Check Stage 2 fields usage (color, image_url, hold_time)
   - Ensure models use all schema fields

4. **Feature Completeness**
   - Stage 1: Fully deployed ✅
   - Stage 2: Phases 1-5 complete, Phase 6 (testing) incomplete
   - Identify partial implementations

### 3.3 Refactoring Strategy

**Principles:**

1. **Behavior Preservation**
   - All existing functionality must work identically
   - No user-facing changes unless fixing bugs
   - Automated verification via linting and type checking

2. **Incremental Changes**
   - Small, focused commits
   - One concern per change
   - Easy to review and revert

3. **Safe Patterns**
   - Extract constants for magic numbers
   - Replace console statements with proper logging
   - Add types without changing logic
   - Simplify complex functions via decomposition

4. **Forbidden Changes**
   - Changing API contracts (HTTP routes, WebSocket events)
   - Modifying database schema
   - Rewriting core architecture
   - Removing features

**Allowed Refactorings:**

✅ **Type Safety**
- Add missing type annotations
- Replace `any` with proper types
- Fix TypeScript errors causing build issues
- Add interface definitions

✅ **Code Cleanup**
- Remove console statements (replace with logger if needed)
- Delete unused code
- Remove duplicate files
- Fix import paths

✅ **Constants Extraction**
```typescript
// Before
const cookTime = 420; // magic number

// After
const DEFAULT_COOK_TIME_SECONDS = 420;
const cookTime = DEFAULT_COOK_TIME_SECONDS;
```

✅ **Error Handling**
```typescript
// Before
const data = await api.fetch();

// After
try {
  const data = await api.fetch();
} catch (error) {
  logger.error('Failed to fetch data', error);
  throw error; // or handle gracefully
}
```

✅ **Function Decomposition**
- Break large functions into smaller, focused ones
- Extract repetitive logic
- Improve readability

✅ **Naming Consistency**
- Standardize on camelCase for TypeScript/JavaScript
- Use snake_case only for database columns
- Full names over abbreviations

## 4. Known Issues & Fixes

### 4.1 Critical Issues

#### Issue 1: TypeScript Build Errors

**Status**: ⚠️ Workaround (build uses `--ignore-ts-errors`)  
**Source**: DEPLOYMENT.md:148-151, menu_items_controller.ts  
**Impact**: Runtime errors possible, type safety compromised

**Investigation Plan:**
1. Run `cd api && npm run build` without --ignore-ts-errors flag
2. Identify all TypeScript errors
3. Categorize errors (type mismatches, missing types, etc.)
4. Fix errors one by one
5. Re-run build to ensure clean compilation

**Expected Fix:**
- Add missing type annotations
- Fix type mismatches in menu_items_controller.ts
- Update tsconfig.json if needed (but preserve strict mode)

#### Issue 2: Database Race Condition on Startup

**Status**: ⚠️ Acknowledged as "harmless"  
**Source**: DEPLOYMENT.md:153-157  
**Description**: "relation tickets does not exist" error on API startup

**Investigation Plan:**
1. Review API startup sequence in `/api/bin/server.ts`
2. Check WebSocket initialization timing in `/api/start/ws.ts`
3. Determine if migrations run before server starts

**Potential Fix:**
- Add database connection check before starting WebSocket
- Delay WebSocket server until migrations complete
- Add retry logic for database queries

**Risk**: May not be fixable without deployment process changes (out of scope)  
**Decision**: Document issue, propose solution for future work if in-scope fix not feasible

#### Issue 3: Socket Reconnect Flicker

**Status**: ❌ Open  
**Source**: web/README.md:113  
**Impact**: Brief UI flicker when WebSocket reconnects

**Investigation Plan:**
1. Review `/web/src/hooks/useSocket.ts` reconnection logic
2. Check state updates on `snapshot` event
3. Identify cause of flicker (full re-render? state reset?)

**Potential Fix:**
- Implement optimistic UI updates
- Preserve local state during reconnection
- Add reconnection indicator instead of flicker

#### Issue 4: Menu Manual Refresh Required

**Status**: ❌ Open  
**Source**: web/README.md:114  
**Description**: Menu screen needs manual refresh after bulk edits

**Investigation Plan:**
1. Review bulk edit implementation in `/api/app/controllers/menu_items_controller.ts`
2. Check if `menu_updated` WebSocket event is broadcasted
3. Review `/web/src/hooks/useMenu.ts` handling of `menu_updated`

**Potential Fix:**
- Ensure bulk edit operations broadcast `menu_updated` event
- Fix menu version increment logic
- Update frontend to handle menu_updated correctly

### 4.2 Code Quality Issues

#### Issue 5: Console Statements in Production Code

**Status**: ❌ Open  
**Source**: UPGRADE.md:255  
**Impact**: Performance, security (info leakage), log pollution

**Files Identified:**
- `/api/start/ws.ts:31`
- `/api/app/services/ws.ts:17`
- `/web/src/components/ScreenBOH.tsx:212, 222`
- `/web/src/components/ui/batch-toggle.tsx` (line TBD)

**Scripts (Acceptable):**
- `api/scripts/run-seed.ts`
- `api/scripts/verify-stage1-2.ts`
- `api/scripts/test-socket.ts`
- `api/scripts/apply_migration.ts`
- `api/scripts/run-migrations.ts`

**Fix Plan:**
1. Backend: Replace with AdonisJS logger
   ```typescript
   // Before
   console.log('WebSocket connected');
   
   // After
   import logger from '@adonisjs/core/services/logger'
   logger.info('WebSocket connected');
   ```

2. Frontend: Remove or replace with conditional logging
   ```typescript
   // Before
   console.error('Failed to fetch');
   
   // After (development only)
   if (import.meta.env.DEV) {
     console.error('Failed to fetch');
   }
   
   // Or remove entirely and rely on error handling
   ```

#### Issue 6: Duplicate Collapsible Components

**Status**: ⚠️ Confusion  
**Files:**
- `/web/src/components/ui/collapsable.tsx` (1.28 KB, actively used)
- `/web/src/components/ui/collapsible.tsx` (315 B, shadcn stub?)

**Investigation Plan:**
1. Check which component is imported in code
2. Compare implementations
3. Determine if both are needed

**Fix Plan:**
- Keep one canonical implementation
- Update all imports to use canonical file
- Delete unused file
- Standardize on correct spelling: "collapsible" (not "collapsable")

### 4.3 Infrastructure Issues

#### Issue 7: Incomplete .gitignore

**Status**: ❌ Open  
**Impact**: Git repo pollution, large repo size

**Missing Entries:**
- `build/` (API TypeScript output)
- `dist/` (frontend build output)
- `public/uploads/` (image uploads)
- `.cache/`
- `*.log`

**Fix Plan:**
1. Add missing entries to root `.gitignore`
2. Check if files already tracked: `git ls-files build/ dist/`
3. If tracked, remove: `git rm -r --cached build/ dist/`
4. Commit updated .gitignore

**Root .gitignore should include:**
```gitignore
# Env and secrets
.env
.env.local
!.env.example

# Dependencies
node_modules/
api/node_modules/
web/node_modules/

# Build outputs
build/
dist/
api/build/
web/dist/

# Uploads
public/uploads/
api/public/uploads/
web/public/uploads/

# Cache
.cache/
.vite/

# Logs
*.log
logs/
test-logs.txt

# OS
.DS_Store
Thumbs.db
```

### 4.4 Documentation Gaps

#### Issue 8: Undocumented API Endpoints

**Implemented but not in README.md:**
- `POST /api/menu/:id/image` - Upload image
- `DELETE /api/menu/:id/image` - Delete image
- `DELETE /api/tickets/:id` - Cancel ticket

**Fix Plan:**
- Add endpoints to README.md API section
- Document request/response formats
- Add examples

#### Issue 9: Undocumented WebSocket Events

**Implemented but not in README.md:**
- `ticket_cancelled` - Ticket cancelled event
- `ping` (emit) - Request server time
- `pong` (receive) - Server time response

**Fix Plan:**
- Add events to README.md WebSocket section
- Document event payloads
- Add usage examples

## 5. Source Code Structure

### 5.1 Backend Files

**Critical Files:**

```
/api/app/controllers/
  - menu_items_controller.ts      # Menu CRUD, image upload (TypeScript errors here)
  - tickets_controller.ts         # Ticket CRUD, timer logic (TIMER_LIMITS constant)
  - health_controller.ts          # Health check

/api/app/models/
  - menu_item.ts                  # MenuItem model (serialize() method)
  - ticket.ts                     # Ticket model (serialize() method)
  - menu_version.ts               # MenuVersion model

/api/app/services/
  - ws.ts                         # WebSocket event handlers (console.log here)
  - timer.ts                      # Timer service

/api/start/
  - ws.ts                         # WebSocket server initialization (console.log here)
  - routes.ts                     # HTTP route definitions
  - kernel.ts                     # Middleware registration
  - env.ts                        # Environment validation

/api/app/validators/
  - menu_item.ts                  # VineJS validation schemas
  - ticket.ts                     # VineJS validation schemas
```

### 5.2 Frontend Files

**Critical Files:**

```
/web/src/components/
  - ScreenFOH.tsx                 # Front of House screen
  - ScreenDriveThru.tsx           # Drive-Thru screen
  - ScreenBOH.tsx                 # Back of House screen (console.log here)
  - ScreenMenu.tsx                # Menu management screen
  - HiddenNav.tsx                 # Hidden navigation component

/web/src/hooks/
  - useSocket.ts                  # WebSocket connection hook
  - useMenu.ts                    # Menu data hook (menu_updated listener)
  - useServerTime.ts              # Server time sync hook
  - useRemainingSeconds.ts        # Timer countdown hook

/web/src/api/
  - menu.ts                       # Menu API client
  - tickets.ts                    # Tickets API client

/web/src/components/ui/
  - collapsable.tsx               # Active collapsible component (duplicate)
  - collapsible.tsx               # Shadcn stub (duplicate)
  - batch-toggle.tsx              # Batch size toggle (console.log here)
  - [other shadcn components]
```

## 6. Validation Strategy

### 6.1 Automated Checks

**Backend:**
```bash
cd api
npm run lint                      # ESLint check
npm run build                     # TypeScript compilation (remove --ignore-ts-errors flag)
# Expected outcome: Zero errors
```

**Frontend:**
```bash
cd web
npm run lint                      # ESLint check
tsc -b                            # TypeScript type check
npm run build                     # Vite production build
# Expected outcome: Zero errors
```

### 6.2 Manual Testing

**Critical User Flows:**

1. **Menu CRUD**
   - Create menu item
   - Edit menu item (change cook times, batch sizes, enabled status)
   - Upload image
   - Delete image
   - Delete menu item
   - Verify WebSocket `menu_updated` event broadcasts

2. **Ticket Flow**
   - Create ticket from FOH
   - Create ticket from Drive-Thru
   - Verify timer starts automatically
   - Complete ticket
   - Cancel ticket
   - Verify WebSocket events: `ticket_created`, `timer_started`, `ticket_completed`, `ticket_cancelled`

3. **Real-Time Sync**
   - Open BOH screen in browser 1
   - Open FOH screen in browser 2
   - Create ticket in browser 2
   - Verify ticket appears in browser 1 immediately

4. **Server Time Sync**
   - Open BOH screen
   - Verify timers count down accurately
   - Check `ping`/`pong` events in DevTools Network tab

### 6.3 Success Criteria

✅ **Build & Lint**
- `npm run build` succeeds without `--ignore-ts-errors` (API)
- `npm run build` succeeds without warnings (Web)
- `npm run lint` passes with 0 errors (both API and Web)

✅ **Code Quality**
- Zero console statements in production code (api/app/*, web/src/*)
- No duplicate files
- Consistent naming conventions
- No hardcoded magic numbers without constants

✅ **Documentation**
- README.md matches actual implementation
- All API endpoints documented
- All WebSocket events documented

✅ **Functionality**
- All manual test flows pass
- No regressions in existing features
- WebSocket real-time updates work

✅ **.gitignore**
- All build outputs ignored
- No tracked files in ignored directories

## 7. Deliverables

### 7.1 Audit Report (Markdown Document)

**File:** `.zenflow/tasks/new-task-856d/audit-report.md`

**Contents:**

1. **Executive Summary**
   - Total issues found
   - Issues fixed
   - Issues remaining
   - Risk assessment

2. **Bug Inventory**
   - Complete list of bugs (confirmed, suspected, potential)
   - Status: open/partial/resolved/invalid
   - Severity: critical/high/medium/low
   - Root cause analysis

3. **Requirements Compliance Matrix**
   - Feature vs Implementation mapping
   - API contracts validation
   - WebSocket events validation
   - Database schema validation
   - Gaps and discrepancies

4. **Code Quality Report**
   - Console statements catalog
   - TypeScript errors catalog
   - Code smells and anti-patterns
   - Refactoring recommendations

5. **Technical Debt Register**
   - Hardcoded values inventory
   - Magic numbers documentation
   - Duplicated code identification
   - Architecture improvement suggestions

6. **Fix Log**
   - Changes made
   - Files modified
   - Rationale for each fix
   - Validation results

7. **Remaining Work**
   - Issues not fixed (with reasons)
   - Out-of-scope items
   - Recommendations for future work

### 7.2 Code Changes

**Modified Files (Expected):**
- `.gitignore` - Add missing entries
- `api/start/ws.ts` - Remove console statements
- `api/app/services/ws.ts` - Remove console statements
- `api/app/controllers/menu_items_controller.ts` - Fix TypeScript errors
- `web/src/components/ScreenBOH.tsx` - Remove console statements
- `web/src/components/ui/batch-toggle.tsx` - Remove console statements
- `web/src/components/ui/collapsable.tsx` or `collapsible.tsx` - Resolve duplicate
- Various files - Extract constants for magic numbers
- Various files - Add missing types
- `README.md` - Document missing endpoints and events (if in scope)

**Deleted Files (Expected):**
- Duplicate collapsible component (one of the two)

### 7.3 Validation Results

**File:** `.zenflow/tasks/new-task-856d/validation-results.md`

**Contents:**
- Lint output (API and Web)
- TypeScript build output (API and Web)
- Manual testing checklist with results
- Screenshots or logs if needed

## 8. Risk Assessment

### 8.1 Low-Risk Changes

✅ **Safe to implement:**
- Adding .gitignore entries
- Removing console statements
- Fixing TypeScript errors by adding types
- Extracting constants
- Deleting duplicate files
- Documenting undocumented features

### 8.2 Medium-Risk Changes

⚠️ **Requires careful testing:**
- Fixing menu refresh bug (may affect state management)
- Fixing socket reconnect flicker (may affect user experience)
- Database race condition fix (may affect startup reliability)

### 8.3 High-Risk Changes

❌ **Avoid or defer:**
- Changing WebSocket event structure
- Modifying database schema
- Rewriting core architecture
- Changing API request/response formats

### 8.4 Mitigation Strategies

1. **Small Incremental Changes**: Fix one issue at a time
2. **Validation After Each Fix**: Run linters and manual tests
3. **Rollback Plan**: Git commits for each change
4. **Documentation**: Record rationale for each decision
5. **Defer Complex Fixes**: If fix requires architectural changes, document and defer

## 9. Implementation Phases

### Phase 1: Investigation & Documentation
**Duration:** ~2-3 hours  
**Tasks:**
- Scan all documentation files
- Search code for markers (TODO, FIXME, console.*)
- Catalog all issues
- Create comprehensive bug inventory
- Map requirements to implementation
- Create audit report skeleton

### Phase 2: Low-Hanging Fruit
**Duration:** ~1-2 hours  
**Tasks:**
- Fix .gitignore
- Remove console statements
- Delete duplicate collapsible component
- Extract constants for magic numbers
- Run linters to verify

### Phase 3: TypeScript Errors
**Duration:** ~2-3 hours  
**Tasks:**
- Identify all TypeScript errors (run build without --ignore-ts-errors)
- Fix type errors in menu_items_controller.ts
- Add missing type annotations
- Verify build succeeds cleanly

### Phase 4: Bug Fixes
**Duration:** ~2-4 hours  
**Tasks:**
- Fix menu refresh bug (if in scope)
- Fix socket reconnect flicker (if in scope)
- Improve error handling
- Validate fixes manually

### Phase 5: Documentation & Validation
**Duration:** ~1-2 hours  
**Tasks:**
- Update README.md (if in scope)
- Complete audit report
- Run all validation checks
- Create validation results document
- Summarize findings and recommendations

## 10. Tools & Commands

### 10.1 Development Commands

**API:**
```bash
cd api
npm run dev              # Dev server (port 3333)
npm run build            # TypeScript compilation
npm run lint             # ESLint
node ace migration:run   # Apply migrations
node ace db:seed         # Seed database
```

**Frontend:**
```bash
cd web
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint
```

### 10.2 Investigation Commands

**Find console statements:**
```bash
grep -rn "console\." api/app/ api/start/
grep -rn "console\." web/src/
```

**Find code markers:**
```bash
grep -rni "TODO\|FIXME\|HACK\|BUG" api/app/ api/start/
grep -rni "TODO\|FIXME\|HACK\|BUG" web/src/
```

**Find magic numbers (example):**
```bash
grep -rn "420\|600\|5000000" api/app/
```

**Check TypeScript errors:**
```bash
cd api && npm run build 2>&1 | grep -i error
cd web && tsc -b 2>&1 | grep -i error
```

### 10.3 Docker Commands

**Run full stack:**
```bash
docker-compose up -d
docker-compose logs -f api      # Watch API logs
docker-compose logs -f web      # Watch frontend logs
docker-compose exec api sh      # Shell into API container
```

**Database access:**
```bash
docker-compose exec postgres psql -U prg -d prg_batch
```

## 11. Success Metrics

### 11.1 Quantitative Metrics

- **Console Statements**: 0 in production code (api/app/, web/src/)
- **TypeScript Errors**: 0 when building without --ignore-ts-errors
- **Lint Errors**: 0 in both api/ and web/
- **Duplicate Files**: 0
- **Undocumented Features**: 0 (all implemented features documented)
- **.gitignore Coverage**: 100% (all build outputs ignored)

### 11.2 Qualitative Metrics

- **Code Quality**: Improved readability, consistent naming, extracted constants
- **Type Safety**: Strong typing, no `any` types, no type assertions
- **Error Handling**: Proper error handling, user-facing error messages
- **Documentation**: Accurate, complete, matches implementation
- **Architecture**: Core patterns preserved, no breaking changes
- **Functionality**: All existing features work identically, no regressions

### 11.3 Audit Report Completeness

✅ **Required Sections:**
- [x] Bug inventory with status and severity
- [x] Requirements compliance matrix
- [x] Code quality report
- [x] Technical debt register
- [x] Fix implementation log
- [x] Validation results
- [x] Remaining work and recommendations

## 12. Conclusion

This debugging and refactoring audit will systematically identify, analyze, and fix code quality issues, bugs, and inconsistencies in the PRG Batch System. The approach prioritizes:

1. **Thorough Investigation**: Comprehensive scan of documentation and code
2. **Safe Refactoring**: Behavior preservation, incremental changes, automated validation
3. **Type Safety**: Fixing TypeScript errors without compromising strictness
4. **Code Quality**: Removing anti-patterns, improving readability, extracting constants
5. **Documentation**: Accurate, complete documentation matching implementation

**Expected Outcome**: A cleaner, more maintainable codebase with improved type safety, zero build errors, comprehensive documentation, and preserved functionality.

**Risk Level**: Low to Medium (most changes are safe; complex bugs may require deferral)

**Timeline**: 8-14 hours of focused work across 5 phases

**Next Steps**: Proceed to Planning phase to create detailed implementation tasks
