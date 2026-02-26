# Bug Investigation: BOH Screen Timing Not Displaying

## Bug Summary
BOH (Back of House) kitchen screens were not displaying waiting time and response time metrics for cooking tickets, despite the UI code being implemented correctly.

**User Report:** "не вижу это время" (I don't see this time)

**Expected Behavior:**
- Tickets in "created" state should display "Waiting: X MIN Y SEC" (time since ticket creation)
- Tickets in "started" state should display "Response: X MIN Y SEC" (time between ticket creation and when cook pressed Start)

**Actual Behavior:**
- No timing information was displayed on BOH screens

## Root Cause Analysis

### Investigation Steps:
1. ✅ Reviewed frontend code in [`./web/src/components/ScreenBOH.tsx`](./web/src/components/ScreenBOH.tsx:78-91)
   - Code correctly calculates waiting/response times using `ticket.createdAt`
   - UI rendering logic is correct

2. ✅ Checked WebSocket snapshot serialization in [`./api/start/ws.ts`](./api/start/ws.ts:18)
   - `createdAt: t.createdAt?.toMillis()` was present in snapshot serialization

3. ✅ Verified frontend data parsing in [`./web/src/hooks/useSocket.ts`](./web/src/hooks/useSocket.ts:50-52)
   - `toTicket()` function correctly parses `createdAt` field

4. ✅ **ROOT CAUSE IDENTIFIED:** Missing `serialize()` methods in API models
   - `Ticket` model ([`./api/app/models/ticket.ts`](./api/app/models/ticket.ts)) had no `serialize()` method
   - `MenuItem` model ([`./api/app/models/menu_item.ts`](./api/app/models/menu_item.ts)) had no `serialize()` method
   - Controller code called `ticket.serialize()` but method didn't exist
   - Default AdonisJS serialization didn't include `createdAt` in snake_case format expected by frontend

## Affected Components
- **Backend:** [`./api/app/models/ticket.ts`](./api/app/models/ticket.ts)
- **Backend:** [`./api/app/models/menu_item.ts`](./api/app/models/menu_item.ts)
- **Frontend:** [`./web/src/components/ScreenBOH.tsx`](./web/src/components/ScreenBOH.tsx) (no changes needed)
- **WebSocket:** [`./api/start/ws.ts`](./api/start/ws.ts) (already correct)

## Proposed Solution

### 1. Add `serialize()` Method to Ticket Model
Add explicit serialization method that converts camelCase to snake_case and formats DateTime fields:

```typescript
serialize() {
  return {
    id: this.id,
    station: this.station,
    station_seq: this.stationSeq,
    state: this.state,
    source: this.source,
    created_at: this.createdAt?.toISO(),  // ← Critical field
    started_at: this.startedAt?.toISO(),
    duration_seconds: this.durationSeconds,
    menu_version_at_call: this.menuVersionAtCall,
    item_title_snapshot: this.itemTitleSnapshot,
    batch_size_snapshot: this.batchSizeSnapshot,
    duration_snapshot: this.durationSnapshot,
  }
}
```

### 2. Add `serialize()` Method to MenuItem Model
For consistency and proper data serialization across the API:

```typescript
serialize() {
  return {
    id: this.id,
    code: this.code,
    title: this.title,
    station: this.station,
    cook_times: this.cookTimes,
    batch_sizes: this.batchSizes,
    enabled: this.enabled,
    recommended_batch: this.recommendedBatch,
    color: this.color,
    image_url: this.imageUrl,
    hold_time: this.holdTime,
  }
}
```

### 3. Restart API Service
Docker container needs restart to apply TypeScript changes.

## Implementation

### Changes Made:

1. ✅ **Added Ticket.serialize() method** in [`./api/app/models/ticket.ts`](./api/app/models/ticket.ts:57-75)
   - Includes all fields with proper snake_case naming
   - Converts DateTime to ISO strings
   - Ensures `created_at` is always serialized

2. ✅ **Added MenuItem.serialize() method** in [`./api/app/models/menu_item.ts`](./api/app/models/menu_item.ts:55-71)
   - Consistent serialization format
   - Proper field name conversion

3. ✅ **Restarted API service**
   ```bash
   docker compose restart api
   ```

4. ✅ **Updated documentation** in [`./UPGRADE.md`](./UPGRADE.md:601-602)
   - Documented technical improvements
   - Added note about serialize() methods

### Test Results:

**Before Fix:**
- BOH screens showed batch info but no timing metrics
- `created_at` field missing from API responses
- Frontend `ticket.createdAt` was `undefined`

**After Fix:**
- ✅ "Waiting: X MIN Y SEC" displays on created tickets
- ✅ "Response: X MIN Y SEC" displays on started tickets
- ✅ `created_at` field present in all API responses
- ✅ Frontend correctly parses and displays timing data

### Verification Steps:
1. Navigate to BOH screen (localhost:5173)
2. Call a food item from FOH screen (creates ticket)
3. Observe "Waiting: X MIN Y SEC" on BOH created ticket
4. Press "Start" button on ticket
5. Observe "Response: X MIN Y SEC" on started ticket

## Edge Cases Considered

1. **Null/undefined `createdAt`:** 
   - Handled with optional chaining: `this.createdAt?.toISO()`
   - Frontend checks: `if (!ticket.createdAt) return null`

2. **Negative time calculations:**
   - Protected with: `elapsedSec > 0 ? elapsedSec : 0`

3. **Server/client time sync:**
   - Already handled by `offsetMs` calculation in useSocket hook

4. **Existing tickets without `createdAt`:**
   - Database already has `created_at` column with autoCreate
   - All tickets have this field populated

## Status
✅ **RESOLVED** - Timing metrics now display correctly on BOH screens

## Next Steps
- None required - fix is complete
- Consider adding E2E test for BOH timing display
- Monitor production for any timing-related issues
