# Full SDD workflow

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Workflow Steps

### [x] Step: Requirements
<!-- chat-id: 4d89abee-2daa-4076-8082-fc0c95608d5a -->

Create a Product Requirements Document (PRD) based on the feature description.

1. Review existing codebase to understand current architecture and patterns
2. Analyze the feature definition and identify unclear aspects
3. Ask the user for clarifications on aspects that significantly impact scope or user experience
4. Make reasonable decisions for minor details based on context and conventions
5. If user can't clarify, make a decision, state the assumption, and continue

Save the PRD to `{@artifacts_path}/requirements.md`.

### [x] Step: Technical Specification
<!-- chat-id: 6f494d19-9705-4359-b6c6-4196a0e81e3d -->

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
<!-- chat-id: 39f9d99b-e806-43c1-a88b-f57f719b50c3 -->

Create a detailed implementation plan based on `{@artifacts_path}/spec.md`.

**Plan created below with 5 phases and 23 implementation steps.**

---

## Implementation Plan

### Phase 1: Investigation & Documentation

### [x] Step: Scan documentation for bugs and requirements
<!-- chat-id: b0a71685-b73d-48ec-bd8f-a133bc3918f4 -->

- [ ] Read all .md files and extract bug mentions, requirements, and known issues
- [ ] Create structured list of documented bugs with status (open/resolved/partial)
- [ ] Extract API contracts, WebSocket events, database schema requirements
- [ ] Identify documentation gaps and inconsistencies
- [ ] Record findings in `.zenflow/tasks/new-task-856d/bug-inventory.md`

**Verification**: Bug inventory created with all documented issues catalogued

### [x] Step: Search codebase for console statements
<!-- chat-id: 86a4c1f6-8084-4530-9416-ab64ae502c8d -->

- [ ] Search all production code for `console.log`, `console.error`, `console.warn`, `console.info`
- [ ] Exclude scripts (acceptable): `api/scripts/**`
- [ ] Catalogue locations with file path and line numbers
- [ ] Distinguish between backend (should use logger) and frontend (should be removed or dev-only)
- [ ] Record findings in bug inventory

**Known locations from spec**:
- `/api/start/ws.ts:31`
- `/api/app/services/ws.ts:17`
- `/web/src/components/ScreenBOH.tsx:212, 222`
- `/web/src/components/ui/batch-toggle.tsx`

**Verification**: Complete catalogue of console statements created

### [x] Step: Search codebase for code markers
<!-- chat-id: 8c1c9186-daf9-44a3-921a-eec05d826e16 -->

- [x] Search for `TODO`, `FIXME`, `HACK`, `BUG`, `XXX`, `NOTE` comments
- [x] Catalogue all markers with context and severity
- [x] Determine which represent actual bugs vs development notes
- [x] Record findings in bug inventory

**Verification**: Code markers catalogued and categorized

### [x] Step: Search for TypeScript error suppressions
<!-- chat-id: 37d2b3fa-dd88-4d04-9a6e-cfe3865a1d57 -->

- [x] Search for `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` comments
- [x] Search for `any` types used inappropriately
- [x] Catalogue locations and reasons
- [x] Record findings in bug inventory

**Verification**: TypeScript suppression catalogue created

### [x] Step: Validate API contracts against implementation
<!-- chat-id: a9bd63a9-272b-4828-9b44-42712088b8b9 -->

- [x] Compare documented endpoints in README.md vs actual routes in `api/start/routes.ts`
- [x] Identify undocumented endpoints (image upload/delete, ticket cancel)
- [x] Verify request/response formats match documentation
- [x] Create requirements compliance matrix
- [x] Record findings in `.zenflow/tasks/new-task-856d/compliance-matrix.md`

**Verification**: All API endpoints validated and gaps documented

### [x] Step: Validate WebSocket events against implementation
<!-- chat-id: 881f39c3-255d-4724-b3e2-4fa6e647ed53 -->

- [x] Compare documented events in README.md vs implementation in `api/start/ws.ts` and `api/app/services/ws.ts`
- [x] Identify undocumented events (ticket_cancelled, ping, pong)
- [x] Verify event payloads match documentation
- [x] Update compliance matrix
- [x] Record findings

**Verification**: All WebSocket events validated and gaps documented

### [x] Step: Create comprehensive audit report skeleton
<!-- chat-id: 67444acf-c19d-4aef-ac8d-75e6d3fbd56a -->

- [x] Create `.zenflow/tasks/new-task-856d/audit-report.md`
- [x] Include sections: Executive Summary, Bug Inventory, Requirements Compliance, Code Quality, Technical Debt, Fix Log, Remaining Work
- [x] Populate with findings from investigation steps above
- [x] Prioritize issues: Critical > High > Medium > Low

**Verification**: Audit report skeleton created with all findings documented

---

### Phase 2: Low-Hanging Fruit (Safe Changes)

### [x] Step: Fix .gitignore
<!-- chat-id: 01e3bbc0-18e3-4461-bf1a-bd07b44e3da9 -->

- [ ] Review current `.gitignore` file
- [ ] Add missing entries: `build/`, `dist/`, `public/uploads/`, `.cache/`, `*.log`
- [ ] Check if any ignored files are already tracked: `git ls-files build/ dist/ public/uploads/`
- [ ] If tracked, remove from git: `git rm -r --cached <files>`
- [ ] Verify .gitignore is complete

**Verification**: Run `git status` to ensure build outputs are ignored

### [x] Step: Remove console statements from backend
<!-- chat-id: 571b1fd0-c58e-4d14-a4ed-b5b175960b15 -->

- [x] Replace console statements in `/api/start/ws.ts` with AdonisJS logger
- [x] Replace console statements in `/api/app/services/ws.ts` with AdonisJS logger
- [x] Import: `import logger from '@adonisjs/core/services/logger'`
- [x] Use: `logger.info()`, `logger.error()`, `logger.warn()` as appropriate
- [x] Verify no other production console statements in `api/app/**` and `api/start/**`

**Verification**: Run `grep -rn "console\." api/app/ api/start/` - should return 0 results

### [x] Step: Remove console statements from frontend
<!-- chat-id: ffd62faf-2f80-4edc-8e8a-081fe1bf4829 -->

- [x] Remove or make dev-only console statements in `/web/src/components/ScreenBOH.tsx`
- [x] Remove or make dev-only console statements in `/web/src/components/ui/batch-toggle.tsx`
- [x] Search for any other console statements in `web/src/**`
- [x] Use `if (import.meta.env.DEV)` wrapper if logging needed for development

**Verification**: Run `grep -rn "console\." web/src/` - should return 0 results (or only dev-wrapped)

### [x] Step: Resolve duplicate collapsible components
<!-- chat-id: 0fa33d39-e339-472c-8fd1-6a4185224f30 -->

- [x] Check imports: Which file is used - `collapsable.tsx` or `collapsible.tsx`?
- [x] Compare implementations: 1.28KB (active) vs 315B (stub)
- [x] Rename active file to correct spelling: `collapsible.tsx`
- [x] Update all imports to use canonical file
- [x] Delete unused file
- [x] Verify no import errors

**Files**: `/web/src/components/ui/collapsable.tsx`, `/web/src/components/ui/collapsible.tsx`

**Verification**: Run `grep -r "collapsable\|collapsible" web/src/` to verify consistent imports

### [x] Step: Extract constants for magic numbers
<!-- chat-id: 52cef898-2ce4-4d0c-8dea-2565305bbdf2 -->

- [x] Identify hardcoded values: 420 (default cook time), 600 (hold time), 5000000 (5MB upload limit)
- [x] Extract to constants in appropriate files:
  - `api/app/controllers/tickets_controller.ts`: `DEFAULT_COOK_TIME_SECONDS = 420`
  - `api/app/controllers/menu_items_controller.ts`: `DEFAULT_HOLD_TIME_SECONDS = 600`, `MAX_IMAGE_SIZE_BYTES = 5000000`
- [x] Replace all hardcoded occurrences with named constants
- [x] Add JSDoc comments explaining constants

**Verification**: Run `grep -rn "420\|600\|5000000" api/app/` - only constant definitions should remain

### [x] Step: Run linters on Phase 2 changes
<!-- chat-id: 78adf62b-a485-404f-98c0-2f56e693a9dd -->

- [x] Run `cd api && npm run lint` - ⚠️ Not configured (pre-existing)
- [x] Run `cd web && npm run lint` - ✅ Pre-existing errors only, no new errors from Phase 2
- [x] Fix any lint errors introduced by changes - ✅ No new errors introduced
- [x] Update audit report with Phase 2 results - ✅ Updated section 7.1

**Verification**: Phase 2 changes validated - no new lint errors introduced

---

### Phase 3: TypeScript Errors

### [x] Step: Identify all TypeScript build errors
<!-- chat-id: 285e1d2f-de56-4a73-a3c1-4aaaea522d97 -->

- [x] Modify build command to remove `--ignore-ts-errors` flag temporarily
- [x] Run `cd api && npm run build` and capture all errors
- [x] Categorize errors: type mismatches, missing types, unsafe assertions
- [x] Focus on errors in `menu_items_controller.ts` (mentioned in DEPLOYMENT.md)
- [x] Document all errors in audit report

**Verification**: Complete list of TypeScript errors created

**Results:**
- Backend: ✅ Zero errors (DEPLOYMENT.md was incorrect about --ignore-ts-errors flag)
- Frontend: ❌ 2 errors in CallFoodItem.tsx (unused import + invalid Badge variants)
- Documented in audit-report.md section 2.1 (BUG-001)

### [x] Step: Fix TypeScript errors in menu_items_controller.ts
<!-- chat-id: 73653ca7-3b57-4b96-b340-17978fd76dac -->

- [x] Review `api/app/controllers/menu_items_controller.ts`
- [x] Add missing type annotations for function parameters and return types
- [x] Fix type mismatches (e.g., nullable fields, response types)
- [x] Ensure proper typing for request validation
- [x] Run `cd api && npm run build` to verify fix

**Verification**: menu_items_controller.ts compiles without errors

**Results:**
- ✅ No TypeScript build errors found (DEPLOYMENT.md was incorrect)
- ✅ Improved type safety: replaced `any` type with `TransactionClientContract` in `bumpVersion` method
- ✅ Build passes successfully with proper type annotations

### [x] Step: Fix remaining TypeScript errors
<!-- chat-id: 68ae33ae-dff8-4997-8a4a-9cb18c215d93 -->

- [x] Fix TypeScript errors in other controller files - ✅ No errors found
- [x] Add missing type definitions for models (if needed) - ✅ Not needed
- [x] Fix any service layer type errors - ✅ No errors found
- [x] Ensure strict mode compliance - ✅ Verified with `npx tsc --noEmit --strict`

**Verification**: Run `cd api && npm run build` (without --ignore-ts-errors) - ✅ Succeeds

**Results:**
- ✅ Zero TypeScript errors in backend codebase
- ✅ Strict mode compliance achieved
- ✅ No TypeScript suppressions found
- ✅ No inappropriate `any` types found
- ✅ Build configuration clean (no `--ignore-ts-errors` flag exists)
- 📝 Documented in audit-report.md section 7.1 (FIX-003)

### [x] Step: Fix frontend TypeScript errors
<!-- chat-id: 052b93d9-769a-4088-a152-76825fe9a2ee -->

- [ ] Run `cd web && tsc -b` to check for errors
- [ ] Fix any type errors in components, hooks, API clients
- [ ] Add missing type imports from `types/screen.ts` or create new types
- [ ] Ensure strict mode compliance

**Verification**: Run `cd web && tsc -b` - should succeed with zero errors

### [ ] Step: Update build configuration

- [ ] Remove `--ignore-ts-errors` flag from package.json build script (if present)
- [ ] Update `api/package.json` build command to ensure TypeScript validation
- [ ] Verify builds succeed: `npm run build` in both api/ and web/
- [ ] Update audit report with TypeScript fix results

**Verification**: Both builds succeed without ignoring TypeScript errors

---

### Phase 4: Bug Fixes (if feasible)

### [ ] Step: Investigate and fix menu refresh bug

- [ ] Issue: Menu screen needs manual refresh after bulk edits (web/README.md:114)
- [ ] Review bulk edit flow in `api/app/controllers/menu_items_controller.ts`
- [ ] Check if `menu_updated` WebSocket event is broadcasted after bulk changes
- [ ] Review `web/src/hooks/useMenu.ts` - ensure it listens to `menu_updated`
- [ ] Fix: Ensure menu version increments and broadcast happens for bulk operations
- [ ] Test: Bulk edit menu items, verify other screens update automatically

**Verification**: Menu updates propagate to all screens without manual refresh

### [ ] Step: Investigate socket reconnect flicker

- [ ] Issue: Brief UI flicker when WebSocket reconnects (web/README.md:113)
- [ ] Review `/web/src/hooks/useSocket.ts` reconnection logic
- [ ] Check state updates on `snapshot` event - does it cause full re-render?
- [ ] Potential fix: Preserve local state during reconnection or add reconnection indicator
- [ ] If fix is complex, document in audit report and mark as deferred

**Verification**: If fixed, WebSocket reconnection should not cause UI flicker

### [ ] Step: Investigate database race condition

- [ ] Issue: "relation tickets does not exist" error on startup (DEPLOYMENT.md:153-157)
- [ ] Review API startup sequence in `api/bin/server.ts`
- [ ] Check WebSocket initialization timing in `api/start/ws.ts`
- [ ] Determine if migrations run before WebSocket queries database
- [ ] If fix requires deployment changes (out of scope), document and defer
- [ ] Otherwise, add database readiness check before WebSocket init

**Verification**: If fixed, API starts without database relation errors

---

### Phase 5: Documentation & Validation

### [ ] Step: Document undocumented API endpoints

- [ ] Add to README.md API section:
  - `POST /api/menu/:id/image` - Upload menu item image
  - `DELETE /api/menu/:id/image` - Delete menu item image
  - `DELETE /api/tickets/:id` - Cancel ticket
- [ ] Document request/response formats and examples
- [ ] Ensure consistency with existing documentation style

**Verification**: All implemented endpoints are documented in README.md

### [ ] Step: Document undocumented WebSocket events

- [ ] Add to README.md WebSocket section:
  - `ticket_cancelled` - Ticket cancelled event
  - `ping` (emit) - Request server time sync
  - `pong` (receive) - Server time response
- [ ] Document event payloads and usage examples
- [ ] Ensure consistency with existing documentation

**Verification**: All implemented WebSocket events are documented

### [ ] Step: Complete audit report

- [ ] Fill in Executive Summary with total issues found/fixed/remaining
- [ ] Complete Bug Inventory with final status of all issues
- [ ] Complete Requirements Compliance Matrix
- [ ] Complete Code Quality Report
- [ ] Complete Technical Debt Register
- [ ] Document all fixes in Fix Log with rationale
- [ ] List Remaining Work and recommendations for future

**Verification**: Audit report is comprehensive and accurate

### [ ] Step: Run final validation

- [ ] Backend validation:
  - [ ] `cd api && npm run lint` - should pass
  - [ ] `cd api && npm run build` - should succeed without --ignore-ts-errors
- [ ] Frontend validation:
  - [ ] `cd web && npm run lint` - should pass
  - [ ] `cd web && tsc -b` - should succeed
  - [ ] `cd web && npm run build` - should succeed
- [ ] Record validation results in `.zenflow/tasks/new-task-856d/validation-results.md`

**Verification**: All automated checks pass

### [ ] Step: Manual testing of critical flows

- [ ] Test Menu CRUD: create, edit, upload image, delete image, delete item
- [ ] Test Ticket Flow: create from FOH/DriveThru, timer starts, complete, cancel
- [ ] Test Real-Time Sync: open multiple screens, verify WebSocket updates
- [ ] Test Server Time Sync: verify timers count down accurately
- [ ] Document test results in validation-results.md

**Verification**: All manual tests pass, no regressions detected

### [ ] Step: Final audit report and summary

- [ ] Review all phases completed
- [ ] Summarize findings: total issues, fixes applied, remaining work
- [ ] Calculate success metrics: console statements removed, TS errors fixed, etc.
- [ ] Create final summary in audit-report.md
- [ ] Mark this planning step as complete in plan.md

**Verification**: Audit complete, all deliverables created
