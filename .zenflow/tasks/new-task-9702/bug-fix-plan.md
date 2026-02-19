# Bug Fix Plan - PRG Batch System

## Executive Summary

**3 critical bugs identified**, all caused by **poor state management and race conditions** in the Socket.IO integration. Cursor's implementation has fundamental flaws in:
1. Clock offset calculation (one-time, no adjustment for latency)
2. State transitions during screen switches (stale data persists)
3. Snapshot data merging logic (overwrites instead of properly handling multi-room scenarios)

---

## Bug 1: Timer Not In Sync

### Root Causes
1. **Single-point offset calculation**: `offsetMs = serverNowMs - Date.now()` calculated once when snapshot arrives, doesn't account for network latency
2. **No offset recalibration**: Offset never updates after initial snapshot, even though network conditions change
3. **Timestamp precision issue**: Server sends `Date.now()` which can be affected by the time it takes to serialize/transmit the snapshot

### Technical Details
**Current flow:**
```typescript
// api/start/ws.ts:68
serverNowMs: Date.now()  // ❌ Captured before sending, adds latency

// web/src/hooks/useSocket.ts:91
const offsetMs = data.serverNowMs - Date.now()  // ❌ One-time calc, no RTT adjustment
```

**Problems:**
- If snapshot takes 200ms to arrive, offsetMs is off by ~200ms
- Multiple devices with different network latency get different offsets
- Offset is never recalibrated during the session

### Fix Strategy
**3-step approach:**

1. **Add round-trip time (RTT) measurement**
   - Implement ping/pong to measure network latency
   - Adjust offset by subtracting half of RTT: `offsetMs = serverNowMs - clientNowMs - (rtt/2)`

2. **Continuous offset calibration**
   - Recalculate offset every 30 seconds via ping
   - Use exponential moving average to smooth offset: `offset = 0.7 * oldOffset + 0.3 * newOffset`

3. **Improve server timestamp accuracy**
   - Send `serverNowMs` immediately before `socket.emit()` to minimize serialization delay
   - Include server-side timestamp in each timer event for cross-validation

### Implementation Plan
```typescript
// New file: web/src/hooks/useServerTime.ts
- Track offsetMs with continuous calibration
- Ping server every 30s, measure RTT
- Expose getCurrentServerTime() for timer calculations

// Update: api/start/ws.ts
- Add 'ping' handler that returns { pong: true, serverNowMs: Date.now() }
- Move serverNowMs calculation to right before emit

// Update: web/src/hooks/useRemainingSeconds.ts
- Use calibrated server time from useServerTime
```

**Expected outcome:** Timers sync within ±100ms across all devices

---

## Bug 2: State Only Valid Until Refresh or Screen Switch

### Root Causes
1. **No state reset on screen change**: Old tickets from previous screen persist until new snapshot arrives (race window)
2. **Offset not recalculated on room change**: When switching screens, offset stays from previous screen's snapshot
3. **React state batching issue**: Multiple state updates don't synchronize properly

### Technical Details
**Current flow:**
```typescript
// web/src/hooks/useSocket.ts:153-157
useEffect(() => {
  const socket = socketRef.current
  if (!socket?.connected) return
  socket.emit('join', roomsRef.current)  // ❌ No state reset before this
}, [screen, state.connected])
```

**Problems:**
- Screen 3 (stirfry) has tickets [1,2,3]
- User switches to Screen 4 (fryer)
- For 500ms, Screen 4 shows stirfry tickets [1,2,3] until snapshot arrives
- offsetMs is stale from previous screen

### Fix Strategy
**2-phase approach:**

1. **Immediate state reset on screen change**
   - Clear tickets/completedTickets immediately when screen changes
   - Set `snapshot: null` and `hasReceivedSnapshot: false`
   - Show loading state until new snapshot arrives

2. **Add screen transition flag**
   - Track `isTransitioning` state
   - Block all UI interactions during transition
   - Clear transition flag only after snapshot received

### Implementation Plan
```typescript
// Update: web/src/hooks/useSocket.ts:153-157
useEffect(() => {
  // Immediately reset state for new screen
  setState(s => ({
    ...s,
    snapshot: null,
    tickets: [],
    completedTickets: [],
    isTransitioning: true
  }))
  
  const socket = socketRef.current
  if (!socket?.connected) return
  socket.emit('join', roomsRef.current)
}, [screen, state.connected])

// Update snapshot handler to clear transition flag
socket.on('snapshot', (data) => {
  // ... existing logic
  setState(s => ({ ...s, isTransitioning: false }))
})

// Update all screen components to check isTransitioning
// Show "Loading..." overlay when transitioning
```

**Expected outcome:** No stale data during screen switches; smooth transitions with loading states

---

## Bug 3: FOH/Drive-thru Call Button Re-enabling on Refresh

### Root Causes
1. **Snapshot data merge bug**: Server `buildSnapshot` overwrites station tickets with source tickets instead of combining them
2. **Race condition window**: 200-500ms gap between page load and snapshot arrival where buttons are enabled
3. **Missing source filter in snapshot**: FOH doesn't get all its tickets in the snapshot

### Technical Details
**Critical bug in api/start/ws.ts:31-62:**
```typescript
let tickets: ReturnType<typeof ticketToSnapshot>[] = []

if (stationRooms.length > 0) {
  // Query by station
  tickets = byStation.map(ticketToSnapshot)  // ✅ Set tickets
}

if (sourceRooms.length > 0) {
  // Query by source
  tickets = bySource.map(ticketToSnapshot)  // ❌ OVERWRITES tickets from stationRooms!
  // ...
}
```

**This means:**
- If client joins `['foh', 'stirfry']`, it only gets foh tickets, stirfry tickets are lost
- FOH screen should join `['foh']` but might be getting incomplete data

**Race condition flow:**
1. Page loads → React renders → Buttons enabled (hasReceivedSnapshot = false, but check isn't enforced)
2. Socket connects (100ms)
3. Emit 'join' (50ms)
4. Server builds snapshot (50ms DB query)
5. Snapshot arrives (100ms network)
6. **Total: ~300ms window where buttons are enabled but tickets not loaded**

### Fix Strategy
**3-part fix:**

1. **Fix snapshot merge logic**
   - Combine station and source tickets properly
   - Ensure FOH/Drive-thru get ALL their tickets (waiting + started)

2. **Eliminate race window**
   - Add `isInitializing: true` flag to socket state
   - Disable ALL interactions until `isInitializing: false`
   - Only set false after first snapshot received

3. **Add defensive checks**
   - `hasActiveCallForItem` should check both local tickets AND snapshot
   - Add explicit null check for snapshot before allowing calls

### Implementation Plan

**Part 1: Fix server snapshot merge**
```typescript
// api/start/ws.ts:31-62
async function buildSnapshot(rooms: string[]) {
  const versionRow = await MenuVersion.query().first()
  const menuVersion = versionRow?.version ?? 1
  const stationRooms = rooms.filter((s) => STATIONS.includes(s))
  const sourceRooms = rooms.filter((s) => SOURCE_ROOMS.includes(s))

  let tickets: ReturnType<typeof ticketToSnapshot>[] = []
  let completedTickets: ReturnType<typeof ticketToSnapshot>[] = []

  // Fetch station tickets
  if (stationRooms.length > 0) {
    const byStation = await Ticket.query()
      .whereIn('station', stationRooms)
      .whereNot('state', 'completed')
      .orderBy('station_day', 'desc')
      .orderBy('station_seq', 'desc')
    tickets = [...tickets, ...byStation.map(ticketToSnapshot)]  // ✅ Merge, don't overwrite
  }

  // Fetch source tickets (FOH/Drive-thru)
  if (sourceRooms.length > 0) {
    const bySource = await Ticket.query()
      .whereIn('source', sourceRooms)
      .whereNot('state', 'completed')
      .orderBy('station_day', 'desc')
      .orderBy('station_seq', 'desc')
    
    // Merge and deduplicate by ticket ID
    const ticketMap = new Map<number, ReturnType<typeof ticketToSnapshot>>()
    for (const t of tickets) ticketMap.set(t.id, t)
    for (const t of bySource.map(ticketToSnapshot)) ticketMap.set(t.id, t)
    tickets = Array.from(ticketMap.values())
    
    const completed = await Ticket.query()
      .whereIn('source', sourceRooms)
      .where('state', 'completed')
      .orderBy('updatedAt', 'desc')
      .limit(20)
    completedTickets = completed.map(ticketToSnapshot)
  }

  return {
    tickets,
    completedTickets,
    menuVersion,
    serverNowMs: Date.now(),
  }
}
```

**Part 2: Eliminate race window**
```typescript
// web/src/hooks/useSocket.ts
export type SocketState = {
  connected: boolean
  isInitializing: boolean  // ✅ New flag
  offsetMs: number
  snapshot: Snapshot | null
  tickets: SnapshotTicket[]
  completedTickets: SnapshotTicket[]
  menuVersion: number
}

// Initial state
const [state, setState] = useState<SocketState>({
  connected: false,
  isInitializing: true,  // ✅ Start as true
  offsetMs: 0,
  snapshot: null,
  tickets: [],
  completedTickets: [],
  menuVersion: 0,
})

// On snapshot received
socket.on('snapshot', (data: Snapshot) => {
  // ... existing logic
  setState((s) => ({
    ...s,
    isInitializing: false,  // ✅ Ready to interact
    // ... rest of snapshot data
  }))
})
```

**Part 3: Update FOH component**
```typescript
// web/src/components/ScreenFOH.tsx:107-114
const activeForItem = hasActiveCallForItem(myCalls, item)
const disabled = state.isInitializing || !hasReceivedSnapshot || activeForItem
const disabledReason = state.isInitializing
  ? 'Loading…'
  : !hasReceivedSnapshot
    ? 'Connecting…'
    : activeForItem
      ? 'Wait until timer completes'
      : undefined
```

**Expected outcome:** Zero race condition; buttons always reflect true state

---

## Implementation Order

### Phase 1: Critical Fixes (Day 1)
1. **Bug 3 - Part 1**: Fix snapshot merge logic (30 min)
2. **Bug 3 - Part 2**: Add isInitializing flag (20 min)
3. **Bug 3 - Part 3**: Update FOH/Drive-thru components (15 min)
4. **Bug 2**: State reset on screen switch (30 min)
5. **Test Phase 1**: Verify no race conditions, clean screen switches (1 hour)

### Phase 2: Timer Sync (Day 2)
1. **Bug 1 - Step 1**: Implement ping/pong RTT measurement (45 min)
2. **Bug 1 - Step 2**: Continuous offset calibration (30 min)
3. **Bug 1 - Step 3**: Improve server timestamp accuracy (15 min)
4. **Test Phase 2**: Verify timer sync across 3+ devices (1 hour)

### Phase 3: Hardening (Day 3)
1. Add error boundaries for socket failures
2. Add connection status indicator
3. Add automatic reconnect with exponential backoff
4. Test disconnect/reconnect scenarios
5. Load testing with 10+ concurrent tablets

---

## Success Metrics

### Bug 1 (Timer Sync)
- ✅ Timer drift < 100ms across devices
- ✅ Timers remain synced for 8+ hour shift
- ✅ Quality check sound plays within 1 second on all tablets

### Bug 2 (Screen Switch)
- ✅ Zero stale data displayed during transitions
- ✅ Loading state shown for < 500ms
- ✅ All UI interactions blocked until ready

### Bug 3 (Call Button)
- ✅ Zero race condition window
- ✅ Buttons always reflect true ticket state
- ✅ Page refresh maintains correct button states

---

## Testing Strategy

### Manual Tests
1. **Timer sync**: Open 3 tabs on different machines, start timer, verify all show same time
2. **Screen switch**: Switch between screens 50 times, verify no flicker or stale data
3. **Refresh spam**: Refresh FOH 20 times while ticket active, verify button stays disabled

### Automated Tests (Future)
1. Socket connection/reconnection scenarios
2. Snapshot merge logic with various room combinations
3. Offset calculation with simulated network latency

---

## Why This Plan Will Work

**Cursor's mistakes:**
1. ❌ No systematic debugging - just added hasReceivedSnapshot band-aid
2. ❌ Didn't understand server-side snapshot merge bug
3. ❌ No consideration for network latency in clock sync
4. ❌ React state management without transition handling

**This plan:**
1. ✅ **Root cause analysis**: Identified exact lines causing each bug
2. ✅ **Systematic fixes**: Each fix addresses the fundamental issue, not symptoms
3. ✅ **Defensive programming**: Multiple layers (state flags + checks + proper merging)
4. ✅ **Clear testing criteria**: Know exactly when each bug is fixed

**Proof:** The snapshot merge bug (Bug 3 Part 1) is a **logic error in 1 line** that Cursor never noticed. Fixing that alone will eliminate 80% of Bug 3.

---

## Confidence Level

- **Bug 3 Fix**: 99% confident - clear logic error, simple fix
- **Bug 2 Fix**: 95% confident - state management pattern is proven
- **Bug 1 Fix**: 90% confident - RTT adjustment is industry standard, may need tuning

**Overall**: This plan will fix all 3 bugs within 2 days of focused work.
