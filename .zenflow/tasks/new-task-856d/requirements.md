# PRG Batch System - Debugging & Refactoring Audit

## Project Overview

**Project**: PRG Batch System - Kitchen display system for batch cooking and prep tickets  
**Tech Stack**: AdonisJS 6 (API) + React 19 (Frontend) + PostgreSQL 16  
**Live**: http://134.199.223.99:8080  
**Status**: Stage 1 deployed (Feb 21, 2026), Stage 2 partially complete (Phase 5/6)

## Audit Objectives

This is a **debugging and refactoring audit** - NOT feature development. The goal is to:

1. **Identify** all bugs, issues, and inconsistencies mentioned in documentation
2. **Verify** current status of each issue (open/resolved/partial)
3. **Validate** code implementation against documented requirements
4. **Detect** code quality issues, architectural risks, and technical debt
5. **Fix** bugs and refactor problematic code while preserving architecture
6. **Document** all findings, decisions, and remaining work

## Scope of Investigation

### 1. Documentation Sources

- [x] `README.md` - Project overview and setup
- [x] `UPGRADE.md` - Stage 2 requirements and status
- [x] `DEPLOYMENT.md` - Production deployment info
- [x] `deploy-droplet.md` - Deployment guide
- [x] `web/README.md` - Frontend documentation
- [x] `web/SHADCN_AUDIT.md` - UI component audit
- [ ] Code comments (TODO, FIXME, HACK, BUG, NOTE)

### 2. Codebase Areas

**Backend (`/api`):**
- Controllers: health, menu_items, tickets
- Models: MenuItem, Ticket, MenuVersion
- Services: WebSocket (ws.ts), Timer
- Routes and middleware
- Validators
- Database migrations and seeders

**Frontend (`/web/src`):**
- Screens: FOH, DriveThru, BOH, Menu
- Hooks: useSocket, useMenu, useServerTime, useRemainingSeconds
- API clients: menu.ts, tickets.ts
- UI components: 20+ shadcn/ui components + custom components

**Infrastructure:**
- Docker configuration
- Environment variables
- Build and deployment scripts

## Known Issues from Documentation

### Critical Issues

#### 1. TypeScript Build Errors
- **Source**: DEPLOYMENT.md:148-151
- **Description**: TypeScript validation errors during build
- **Current Fix**: Build uses `--ignore-ts-errors` flag
- **Status**: ⚠️ Workaround applied, root cause not fixed
- **Location**: Mentioned in `menu_items_controller.ts`
- **Impact**: Runtime errors possible, type safety compromised

#### 2. Database Race Condition on Startup
- **Source**: DEPLOYMENT.md:153-157
- **Description**: "relation tickets does not exist" error on API startup
- **Cause**: API starts before migrations complete
- **Status**: ⚠️ Acknowledged as "harmless", server recovers automatically
- **Impact**: Brief initialization errors in logs

#### 3. Socket Reconnect Flicker
- **Source**: web/README.md:113
- **Description**: Brief UI flicker when WebSocket reconnects
- **Status**: ❌ Open
- **Impact**: Poor UX during connection loss

#### 4. Menu Manual Refresh Required
- **Source**: web/README.md:114
- **Description**: Menu screen needs manual refresh after bulk edits
- **Status**: ❌ Open
- **Impact**: Real-time sync broken for bulk operations

### Code Quality Issues

#### 5. Console Statements in Production Code
- **Source**: UPGRADE.md:255
- **Description**: console.log/error/warn statements throughout codebase
- **Locations Found**:
  - `web/src/components/ScreenBOH.tsx:212, 222`
  - `api/start/ws.ts:31`
  - `api/app/services/ws.ts:17`
  - Multiple build scripts (acceptable for scripts)
- **Status**: ❌ Open
- **Impact**: Performance, security (potential info leakage)

#### 6. Duplicate Collapsible Components
- **Locations**: 
  - `web/src/components/ui/collapsable.tsx` (1.28 KB, actively used)
  - `web/src/components/ui/collapsible.tsx` (315 B, shadcn stub?)
- **Status**: ⚠️ Confusion, potential import errors
- **Impact**: Code maintainability

### Missing Features (Stage 2)

#### 7. Phase 6 Testing Not Complete
- **Source**: UPGRADE.md:260-266
- **Status**: ❌ Incomplete
- **Missing Tests**:
  - iPad viewport testing (1194x834, 4 cards/row, 44x44px touch targets)
  - Cross-screen consistency (colors, nav, images)
  - Real-time updates (timers, progress, alerts)
  - Performance (50+ items, 20+ tickets, animations, images)

#### 8. Stage 2 Features Partially Implemented
- **Completed**: Phase 5 (BOH improvements)
- **Incomplete**: Phases 1-4, 6
  - iPad layout optimization (2.1)
  - Menu management improvements (2.2)
  - FOH/Drive-Thru enhancements (2.3)
  - Testing suite (2.6)

### Missing Infrastructure

#### 9. Incomplete .gitignore
- **Root .gitignore** missing:
  - `build/` directory (API build output)
  - `dist/` directory
  - `public/uploads/` (image uploads)
  - `.cache/`
  - `*.log` files
- **Impact**: Potential git pollution, large repo size

#### 10. No Offline Support
- **Source**: web/README.md:115
- **Status**: ❌ Not implemented
- **Impact**: App unusable during network issues

## Requirements vs Implementation Validation

### Feature Completeness Checks

#### ✅ Core Functionality (Stage 1)
- [x] Multi-screen display (FOH, Drive-Thru, BOH)
- [x] Real-time tickets via WebSocket
- [x] Menu CRUD operations
- [x] Timers and batch sizes
- [x] Station filtering
- [x] PostgreSQL + Docker deployment

#### ⚠️ Stage 2 Features (Partial)
- [x] BOH collapsed completed tickets (Phase 5)
- [x] BOH color system
- [x] BOH hidden navigation
- [x] Quality badges (A, B, Call Now)
- [x] Waiting/response time tracking
- [ ] iPad viewport optimization (2.1.1-2.1.2)
- [ ] Hidden navigation (all screens) - only BOH done
- [ ] Menu grouping by station (2.2.1)
- [ ] Cook time per batch size UI (2.2.2)
- [ ] Toggle switch for enabled (2.2.3)
- [ ] Color labels (2.2.4) - backend ready, UI partial
- [ ] Image upload (2.2.5) - backend ready, UI incomplete
- [ ] FOH card layout redesign (2.3.1)
- [ ] Progress bar timer (2.3.2)
- [ ] 3-position batch toggle (2.3.3)
- [ ] Group calls by hour (2.3.4) - implemented
- [ ] Quality hold timer (2.3.5)
- [ ] Cancel button (2.3.6) - backend ready, UI incomplete

### API Contract Validation

#### ✅ Documented Endpoints Match Implementation
- [x] `GET /api/menu` - List items + version
- [x] `POST /api/menu` - Create item
- [x] `PATCH /api/menu/:id` - Update item
- [x] `DELETE /api/menu/:id` - Delete item
- [x] `POST /api/menu/:id/image` - Upload image ✅ **Implemented but undocumented in README**
- [x] `DELETE /api/menu/:id/image` - Delete image ✅ **Implemented but undocumented in README**
- [x] `GET /api/tickets` - List tickets
- [x] `POST /api/tickets` - Create ticket
- [x] `POST /api/tickets/:id/start` - Start timer
- [x] `POST /api/tickets/:id/complete` - Complete ticket
- [x] `DELETE /api/tickets/:id` - Cancel ticket ✅ **Implemented but undocumented in README**
- [x] `GET /health` - Health check

**Finding**: Image upload/delete and ticket cancellation endpoints exist in code but missing from main documentation.

### WebSocket Events Validation

#### ✅ Documented Events Match Implementation
- [x] `snapshot` - Full state on connect
- [x] `ticket_created` - New ticket broadcast
- [x] `timer_started` - Timer started
- [x] `ticket_completed` - Ticket completed
- [x] `ticket_cancelled` - Ticket cancelled ✅ **Implemented but undocumented in README**
- [x] `menu_updated` - Menu version changed
- [x] `join` (emit) - Subscribe to rooms
- [x] `ping` (emit) - Server time sync ✅ **Implemented but undocumented in README**
- [x] `pong` (receive) - Server time response ✅ **Implemented but undocumented in README**

**Finding**: `ticket_cancelled`, `ping`, and `pong` events exist but not documented in main README.

### Database Schema Validation

#### ✅ Tables Match Documentation
- [x] `menu_items` - Menu configuration
- [x] `menu_versions` - Menu change tracking
- [x] `tickets` - Cooking tickets
- [x] `adonis_schema` - Migration tracking

#### ⚠️ Schema Extensions
- [x] `menu_items.color` - Added in migration `1740354400000` ✅
- [x] `menu_items.image_url` - Added in migration `1740354400000` ✅
- [x] `menu_items.hold_time` - Added in migration `1740354400000` ✅

**Finding**: Stage 2 database fields added correctly. Need to verify they're used properly in code.

## Code Quality & Architecture Risks

### Architectural Integrity

#### ✅ Preserved Patterns
- Clean separation: API (AdonisJS) ↔ Frontend (React)
- WebSocket real-time architecture
- Lucid ORM models with serialize() methods
- shadcn/ui component library
- React hooks for state management

#### ⚠️ Potential Risks
1. **Type Safety**: Build ignoring TypeScript errors
2. **Error Handling**: Some console.error without user feedback
3. **State Sync**: Menu refresh issue suggests state management problem
4. **Race Conditions**: Startup race condition with migrations

### Code Smells

1. **Hardcoded Values**
   - Timer limits in `TicketsController.TIMER_LIMITS`
   - Station names scattered across files
   - Room names duplicated in multiple locations

2. **Magic Numbers**
   - Default cook time: 420 seconds (tickets_controller.ts:19)
   - Hold time default: 600 seconds (menu_items_controller.ts:43)
   - Completed ticket limit: 20, 50 (different values in different files)

3. **Inconsistent Naming**
   - `collapsable.tsx` vs `collapsible.tsx`
   - `batchSizes` (camelCase) vs `batch_sizes` (snake_case)
   - `stationSeq` vs `station_seq`

4. **Missing Validation**
   - Image upload size validation exists (5MB)
   - No validation for cook time ranges
   - No validation for batch size format

## Testing Requirements

### Current State
- ❌ No test files found in codebase
- ❌ No test scripts in package.json
- ❌ No CI/CD pipeline

### Required Testing (Per UPGRADE.md Phase 6)

1. **iPad Viewport Testing**
   - Resolution: 1194 x 834 px
   - 4 cards per row
   - Touch targets: min 44x44px
   - No scrolling
   - No hover states

2. **Cross-Screen Consistency**
   - Color system works on all screens
   - Hidden nav works on all screens
   - Images display correctly
   - Timers sync across screens

3. **Real-Time Updates**
   - Timers count down accurately
   - Progress bars update smoothly
   - Quality alerts trigger correctly
   - Menu changes propagate

4. **Performance Testing**
   - 50+ menu items
   - 20+ active tickets
   - Animation performance
   - Image loading
   - WebSocket message throughput

## Security & Best Practices

### Current Security Posture
- ✅ APP_KEY properly generated and not in git
- ✅ DB credentials not in git
- ✅ CORS configured (allows all origins - acceptable for internal tool)
- ❌ HTTP only (no SSL) - acceptable for internal IP
- ❌ No authentication/authorization
- ❌ No rate limiting
- ❌ File upload without virus scanning

### Best Practice Violations
1. Console statements in production code
2. TypeScript errors ignored at build time
3. No error tracking/monitoring
4. No graceful WebSocket reconnection UX
5. Hardcoded URLs and magic numbers

## Deliverables

### 1. Bug Inventory
- Complete list of all bugs (confirmed, suspected, potential)
- Status: open/partial/resolved/invalid
- Severity: critical/high/medium/low
- Root cause analysis

### 2. Requirements Compliance Matrix
- Feature vs Implementation mapping
- Gaps and discrepancies
- Documentation vs code mismatches

### 3. Code Quality Report
- Console statements locations
- Type errors catalog
- Code smells and anti-patterns
- Refactoring recommendations

### 4. Technical Debt Register
- Hardcoded values inventory
- Magic numbers documentation
- Duplicated code identification
- Architecture improvement suggestions

### 5. Fix Implementation
- Bug fixes (preserve behavior)
- Code refactoring (improve quality)
- Documentation updates
- .gitignore improvements

### 6. Validation
- Run linters (npm run lint in api/ and web/)
- Run type checks (tsc --noEmit)
- Test critical user flows manually
- Verify WebSocket real-time updates

## Success Criteria

✅ All documented bugs reviewed and catalogued  
✅ All console.log/error/warn removed or justified  
✅ TypeScript builds without --ignore-ts-errors flag  
✅ Documentation matches actual implementation  
✅ .gitignore properly configured  
✅ No regression in existing functionality  
✅ Code quality improved without architectural changes  
✅ All findings documented in this requirements file

## Out of Scope

❌ New feature development (Stage 2 incomplete features)  
❌ UI/UX redesign  
❌ Performance optimization beyond bug fixes  
❌ Security enhancements beyond best practices  
❌ Test suite creation (unless fixing existing tests)  
❌ CI/CD pipeline setup  
❌ Database schema changes  
❌ Deployment process changes

## Constraints

1. **Preserve Behavior**: All fixes must maintain current functionality
2. **No Breaking Changes**: Public API contracts cannot change
3. **Backward Compatibility**: Database migrations must not break existing data
4. **Zero Downtime**: Fixes should not require service interruption
5. **Architecture Integrity**: Core patterns must remain unchanged

## Next Steps

1. Review this requirements document with team
2. Proceed to Technical Specification phase
3. Create detailed implementation plan
4. Execute debugging and refactoring work
5. Validate and document results
