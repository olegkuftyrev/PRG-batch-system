# API Contracts Compliance Matrix

**Generated:** 2026-02-26  
**Project:** PRG Batch System  
**Version:** 1.0.0

---

## Executive Summary

### API Endpoints

**Total Endpoints:** 13  
**Documented:** 9 (69%)  
**Undocumented:** 4 (31%)  
**Compliant:** 9 (100% of documented)  
**Non-Compliant:** 0  

**Key Findings:**
- All documented endpoints are correctly implemented
- 4 endpoints exist but are not documented in README.md
- No breaking changes or deviations from documented contracts
- Request/response formats match documentation where specified
- Documentation lacks detailed request/response examples

### WebSocket Events

**Total Events:** 8 (5 documented, 3 undocumented)  
**Server → Client:** 7 events (5 documented, 2 undocumented)  
**Client → Server:** 2 events (1 documented, 1 undocumented)  
**Compliant:** 5 (100% of documented)  
**Payload Mismatches:** 0

**Key Findings:**
- All documented events are correctly implemented
- 3 critical events are undocumented: `ticket_cancelled`, `ping`, `pong`
- Time synchronization mechanism (`ping`/`pong`) is completely undocumented but essential
- Event payloads match between frontend and backend
- Room-based routing is not documented
- Perfect alignment between implementation and usage

---

## 1. Health Endpoint

### 1.1 GET /health

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `GET /health` | ✅ `GET /health` | ✅ COMPLIANT |
| **Response (success)** | `{"ok":true,"database":"connected"}` | `{"ok":true,"database":"connected"}` | ✅ COMPLIANT |
| **Response (failure)** | Not documented | `503: {"ok":false,"error":"Database unavailable"}` | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [health_controller.ts:5-12](../../../api/app/controllers/health_controller.ts) | - |

**Notes:**
- Endpoint is also available at `/api/health` (not documented)
- Failure response format not documented but implemented correctly
- Uses database ping to verify connectivity

---

## 2. Menu Endpoints

### 2.1 GET /api/menu

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `GET /api/menu` | ✅ `GET /api/menu` | ✅ COMPLIANT |
| **Description** | List items + current version | List items + current version | ✅ COMPLIANT |
| **Response format** | Not detailed | `{"items": MenuItem[], "menuVersion": number}` | ⚠️ INCOMPLETE DOC |
| **Implementation** | - | [menu_items_controller.ts:16-25](../../../api/app/controllers/menu_items_controller.ts) | - |

**Response Schema:**
```json
{
  "items": [
    {
      "id": 1,
      "code": "BE1",
      "title": "Orange Chicken",
      "station": "stirfry",
      "cook_times": {"1": 480, "2": 480, "3": 480},
      "batch_sizes": ["1", "2", "3"],
      "enabled": true,
      "recommended_batch": {},
      "color": "orange",
      "image_url": "/uploads/xxx.jpg",
      "hold_time": 600,
      "created_at": "2026-02-26T12:00:00.000Z",
      "updated_at": "2026-02-26T12:00:00.000Z"
    }
  ],
  "menuVersion": 1
}
```

**Notes:**
- Response format not detailed in README.md
- Implementation uses snake_case for JSON keys
- Returns full menu item details including holdTime, color, imageUrl

---

### 2.2 POST /api/menu

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `POST /api/menu` | ✅ `POST /api/menu` | ✅ COMPLIANT |
| **Description** | Create item | Create item + bump version | ✅ COMPLIANT |
| **Request format** | Not detailed | See schema below | ⚠️ INCOMPLETE DOC |
| **Response** | Not documented | `201: MenuItem` | ⚠️ UNDOCUMENTED |
| **Side effects** | Not documented | Broadcasts `menu_updated` event | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [menu_items_controller.ts:27-55](../../../api/app/controllers/menu_items_controller.ts) | - |

**Request Schema:**
```json
{
  "code": "BE1",                          // required, 1-20 chars
  "title": "Orange Chicken",              // required, 1-100 chars
  "station": "stirfry",                   // required, enum: stirfry|fryer|sides|grill
  "batchSizes": ["1", "2", "3"],          // required, array of strings
  "cookTimes": {"1": 480, "2": 480},      // required, object with unknown keys
  "enabled": true,                        // optional, default: true
  "recommendedBatch": {},                 // optional, object with unknown keys
  "color": "orange",                      // optional, enum: blue|red|green|orange|null
  "imageUrl": "/uploads/xxx.jpg",         // optional, max 500 chars
  "holdTime": 600                         // optional, number >= 0, default: 600
}
```

**Response:** 201 Created with MenuItem object (same as GET response)

**Notes:**
- Uses database transaction for atomicity
- Bumps menu version and broadcasts WebSocket event
- Default holdTime is 600 seconds if not provided

---

### 2.3 PATCH /api/menu/:id

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `PATCH /api/menu/:id` | ✅ `PATCH /api/menu/:id` | ✅ COMPLIANT |
| **Description** | Update item | Update item + bump version | ✅ COMPLIANT |
| **Request format** | Not detailed | All fields optional | ⚠️ INCOMPLETE DOC |
| **Response** | Not documented | `200: MenuItem` | ⚠️ UNDOCUMENTED |
| **Side effects** | Not documented | Broadcasts `menu_updated` event | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [menu_items_controller.ts:57-87](../../../api/app/controllers/menu_items_controller.ts) | - |

**Request Schema:** Same as POST but all fields optional

**Response:** 200 OK with updated MenuItem object

**Notes:**
- Returns 404 if menu item not found
- Uses database transaction
- Only updates provided fields (partial update)

---

### 2.4 DELETE /api/menu/:id

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `DELETE /api/menu/:id` | ✅ `DELETE /api/menu/:id` | ✅ COMPLIANT |
| **Description** | Delete item | Delete item + bump version | ✅ COMPLIANT |
| **Response** | Not documented | `204 No Content` | ⚠️ UNDOCUMENTED |
| **Side effects** | Not documented | Broadcasts `menu_updated` event | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [menu_items_controller.ts:89-103](../../../api/app/controllers/menu_items_controller.ts) | - |

**Response:** 204 No Content

**Notes:**
- Returns 404 if menu item not found
- Uses database transaction
- Does not delete associated image file (potential orphaned files)

---

### 2.5 POST /api/menu/:id/image ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ❌ Not documented | ✅ `POST /api/menu/:id/image` | ❌ UNDOCUMENTED |
| **Description** | - | Upload menu item image | ❌ UNDOCUMENTED |
| **Request format** | - | Multipart form with `image` field | ❌ UNDOCUMENTED |
| **Response** | - | `{"imageUrl": "/uploads/xxx.jpg"}` | ❌ UNDOCUMENTED |
| **Implementation** | - | [menu_items_controller.ts:105-147](../../../api/app/controllers/menu_items_controller.ts) | - |

**Request:** Multipart form data
- **Field:** `image` (file)
- **Allowed formats:** jpg, jpeg, png, webp
- **Max size:** 5MB (5000000 bytes)

**Response:** 200 OK
```json
{
  "imageUrl": "/uploads/{cuid}.{ext}"
}
```

**Error Responses:**
- `400: {"error": "Image file is required"}` - No file provided
- `400: {"errors": [...]}` - Validation errors (size/format)
- `404` - Menu item not found

**Side Effects:**
- Saves image to `public/uploads/` directory
- Deletes old image if exists
- Updates menu item `imageUrl` field
- Bumps menu version
- Broadcasts `menu_updated` WebSocket event

**Notes:**
- This is a critical endpoint used by the menu configuration UI
- Should be documented in README.md
- Uses CUID for unique filenames

---

### 2.6 DELETE /api/menu/:id/image ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ❌ Not documented | ✅ `DELETE /api/menu/:id/image` | ❌ UNDOCUMENTED |
| **Description** | - | Remove menu item image | ❌ UNDOCUMENTED |
| **Response** | - | `204 No Content` | ❌ UNDOCUMENTED |
| **Implementation** | - | [menu_items_controller.ts:149-174](../../../api/app/controllers/menu_items_controller.ts) | - |

**Response:** 204 No Content

**Error Responses:**
- `404: {"error": "No image to delete"}` - Menu item has no image
- `404` - Menu item not found

**Side Effects:**
- Deletes image file from disk (if exists)
- Sets menu item `imageUrl` to null
- Bumps menu version
- Broadcasts `menu_updated` WebSocket event

**Notes:**
- Should be documented in README.md
- Fails gracefully if file doesn't exist on disk

---

## 3. Tickets Endpoints

### 3.1 GET /api/tickets

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `GET /api/tickets` | ✅ `GET /api/tickets` | ✅ COMPLIANT |
| **Description** | List all | List by station (required query param) | ⚠️ INCOMPLETE DOC |
| **Query params** | Not documented | `station` (required) | ⚠️ UNDOCUMENTED |
| **Response** | Not documented | Array of Ticket objects | ⚠️ INCOMPLETE DOC |
| **Implementation** | - | [tickets_controller.ts:47-59](../../../api/app/controllers/tickets_controller.ts) | - |

**Request:** `GET /api/tickets?station={station}`

**Query Parameters:**
- `station` (required): stirfry | fryer | sides | grill

**Response:** 200 OK
```json
[
  {
    "id": 1,
    "menu_item_id": 5,
    "station": "stirfry",
    "station_seq": 1,
    "station_day": "2026-02-26",
    "state": "completed",
    "source": "foh",
    "created_at": "2026-02-26T12:00:00.000Z",
    "started_at": "2026-02-26T12:00:30.000Z",
    "duration_seconds": 480,
    "menu_version_at_call": 1,
    "item_title_snapshot": "Orange Chicken (BE1)",
    "batch_size_snapshot": "2",
    "duration_snapshot": 480,
    "updated_at": "2026-02-26T12:08:30.000Z"
  }
]
```

**Error Responses:**
- `400: {"error": "station query required"}` - Missing station parameter

**Notes:**
- Documentation says "List all" but implementation requires station filter
- Returns tickets ordered by date desc, seq desc (newest first)
- Preloads menuItem relation but doesn't include it in serialized response

---

### 3.2 POST /api/tickets

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `POST /api/tickets` | ✅ `POST /api/tickets` | ✅ COMPLIANT |
| **Description** | Create | Create ticket + broadcast | ✅ COMPLIANT |
| **Request format** | `menuItemId`, `batchSize`, `source` | `menuItemId`, `batchSize`, `source` | ✅ COMPLIANT |
| **Response** | Not documented | `201: Ticket` | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [tickets_controller.ts:11-45](../../../api/app/controllers/tickets_controller.ts) | - |

**Request Schema:**
```json
{
  "menuItemId": 5,           // required, number
  "batchSize": "2",          // required, string (must be in menu item's batch_sizes)
  "source": "foh"            // required, enum: foh|drive_thru
}
```

**Response:** 201 Created with Ticket object

**Error Responses:**
- `404` - Menu item not found
- `400: {"error": "Menu item is disabled"}` - Menu item disabled

**Side Effects:**
- Auto-increments station sequence number
- Snapshots menu item data at creation time
- Sets default cook time from menu item (or 420 seconds if not found)
- Broadcasts `ticket_created` to station and source channels

**Notes:**
- Documentation is accurate but lacks detail
- Creates ticket in 'created' state (not auto-started)
- Station sequence resets daily per station

---

### 3.3 POST /api/tickets/:id/start

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `POST /api/tickets/:id/start` | ✅ `POST /api/tickets/:id/start` | ✅ COMPLIANT |
| **Description** | Start timer | Start timer + enforce limits | ✅ COMPLIANT |
| **Response** | Not documented | `200: Ticket` | ⚠️ UNDOCUMENTED |
| **Timer limits** | Not documented | Fryer=∞, Stirfry=2, Sides=1, Grill=1 | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [tickets_controller.ts:69-93](../../../api/app/controllers/tickets_controller.ts) | - |

**Response:** 200 OK with Ticket object

**Error Responses:**
- `404` - Ticket not found
- `400: {"error": "Ticket already started or completed"}` - Invalid state
- `400: {"error": "Max {N} timer(s) for {station}"}` - Timer limit reached

**Timer Limits:**
- Fryer: 999 (unlimited)
- Stirfry: 2
- Sides: 1
- Grill: 1

**Side Effects:**
- Sets ticket state to 'started'
- Records startedAt timestamp
- Broadcasts `timer_started` to station and source
- Schedules automatic completion (background process)

**Notes:**
- Timer limits are business logic not documented in README
- Uses WebSocket for real-time timer sync

---

### 3.4 POST /api/tickets/:id/complete

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ✅ `POST /api/tickets/:id/complete` | ✅ `POST /api/tickets/:id/complete` | ✅ COMPLIANT |
| **Description** | Mark done | Mark done + broadcast | ✅ COMPLIANT |
| **Response** | Not documented | `200: Ticket` | ⚠️ UNDOCUMENTED |
| **Implementation** | - | [tickets_controller.ts:95-106](../../../api/app/controllers/tickets_controller.ts) | - |

**Response:** 200 OK with Ticket object

**Error Responses:**
- `404` - Ticket not found
- `400: {"error": "Ticket already completed"}` - Already completed

**Side Effects:**
- Sets ticket state to 'completed'
- Broadcasts `ticket_completed` to station and source

**Notes:**
- Can complete ticket even if not started (valid use case)

---

### 3.5 DELETE /api/tickets/:id ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Endpoint** | ❌ Not documented | ✅ `DELETE /api/tickets/:id` | ❌ UNDOCUMENTED |
| **Description** | - | Cancel/delete ticket | ❌ UNDOCUMENTED |
| **Response** | - | `204 No Content` | ❌ UNDOCUMENTED |
| **Implementation** | - | [tickets_controller.ts:108-121](../../../api/app/controllers/tickets_controller.ts) | - |

**Response:** 204 No Content

**Error Responses:**
- `404` - Ticket not found
- `400: {"error": "Cannot cancel completed ticket"}` - Ticket already completed

**Side Effects:**
- Deletes ticket from database
- Broadcasts `ticket_cancelled` to station and source
- Does NOT cancel scheduled timer (potential issue)

**Notes:**
- This is a critical endpoint for error correction
- Should be documented in README.md
- `ticket_cancelled` event is also undocumented (see WebSocket section)

---

## 4. Additional Routes

### 4.1 GET /api/health

| Aspect | Details |
|--------|---------|
| **Status** | ⚠️ UNDOCUMENTED ALIAS |
| **Implementation** | Same as `GET /health` |
| **Location** | [routes.ts:8](../../../api/start/routes.ts) |

**Notes:**
- Convenience alias for API health check
- Should be documented as alternative endpoint

---

### 4.2 GET /uploads/*

| Aspect | Details |
|--------|---------|
| **Status** | ⚠️ INFRASTRUCTURE (not API) |
| **Purpose** | Serve uploaded menu item images |
| **Implementation** | [routes.ts:10-13](../../../api/start/routes.ts) |

**Notes:**
- Infrastructure route for static file serving
- Required for menu item images
- Not an API endpoint per se, but critical for functionality

---

## 5. Documentation Gaps

### 5.1 Request/Response Examples

**Missing for all endpoints:**
- Detailed request body examples
- Complete response schemas
- Error response formats
- HTTP status codes

**Recommendation:** Add comprehensive examples to README.md API section

---

### 5.2 Business Logic

**Undocumented behaviors:**
- Timer limits per station
- Station sequence numbering (daily reset)
- Menu version bumping on changes
- WebSocket event broadcasting on mutations
- Default values (holdTime: 600, cookTime: 420)
- Image upload constraints (5MB, formats)

**Recommendation:** Document business rules and constraints

---

### 5.3 Error Handling

**Missing documentation:**
- 400 Bad Request scenarios
- 404 Not Found scenarios
- 503 Service Unavailable (health check)
- Validation error formats

**Recommendation:** Add error response section to README.md

---

## 6. Compliance Summary

### 6.1 Endpoints by Status

| Status | Count | Endpoints |
|--------|-------|-----------|
| ✅ Documented & Compliant | 9 | GET /health, GET /api/menu, POST /api/menu, PATCH /api/menu/:id, DELETE /api/menu/:id, GET /api/tickets, POST /api/tickets, POST /api/tickets/:id/start, POST /api/tickets/:id/complete |
| ❌ Undocumented | 4 | POST /api/menu/:id/image, DELETE /api/menu/:id/image, DELETE /api/tickets/:id, GET /api/health |

### 6.2 Documentation Quality

| Category | Status |
|----------|--------|
| Endpoint paths | ✅ Accurate (for documented endpoints) |
| HTTP methods | ✅ Accurate |
| High-level descriptions | ✅ Adequate |
| Request schemas | ❌ Missing or incomplete |
| Response schemas | ❌ Missing |
| Error responses | ❌ Missing |
| Side effects | ❌ Missing |
| Business rules | ❌ Missing |

### 6.3 Implementation Quality

| Category | Status |
|----------|--------|
| Route definitions | ✅ Clean and organized |
| Validation | ✅ Using VineJS validators |
| Error handling | ✅ Proper HTTP status codes |
| Database transactions | ✅ Used for critical operations |
| WebSocket integration | ✅ Consistent broadcasting |
| Code organization | ✅ Good separation of concerns |

---

## 7. Recommended Actions

### 7.1 High Priority

1. **Document undocumented endpoints** in README.md:
   - `POST /api/menu/:id/image`
   - `DELETE /api/menu/:id/image`
   - `DELETE /api/tickets/:id`
   - `GET /api/health` (alias)

2. **Add request/response examples** for all endpoints

3. **Document WebSocket events** triggered by API mutations

### 7.2 Medium Priority

4. **Document error responses** and HTTP status codes

5. **Document business rules**:
   - Timer limits per station
   - Station sequence logic
   - Menu version management

6. **Document validation rules** for request bodies

### 7.3 Low Priority

7. **Add OpenAPI/Swagger specification** for API documentation

8. **Create Postman/Insomnia collection** for testing

9. **Document authentication/authorization** (if implemented in future)

---

## 8. Validation Results

**Date:** 2026-02-26  
**Validator:** Automated compliance check

**Summary:**
- ✅ All documented endpoints are correctly implemented
- ✅ No breaking changes or deviations found
- ⚠️ 4 endpoints implemented but not documented
- ⚠️ Documentation lacks detail on request/response formats
- ⚠️ Business logic and side effects not documented

**Conclusion:** The API implementation is solid and consistent. The main issue is incomplete documentation, not incorrect implementation. Undocumented endpoints should be added to README.md to improve developer experience.

---

## 9. WebSocket Events Compliance

**Validation Date:** 2026-02-26  
**Sources:**
- **Documentation:** [README.md:174-176](../../../README.md)
- **Backend Implementation:** [api/start/ws.ts](../../../api/start/ws.ts), [api/app/services/ws.ts](../../../api/app/services/ws.ts)
- **Frontend Implementation:** [web/src/hooks/useSocket.ts](../../../web/src/hooks/useSocket.ts), [web/src/hooks/useServerTime.ts](../../../web/src/hooks/useServerTime.ts)

### 9.1 Executive Summary

**Total Events:** 8 (5 documented, 3 undocumented)  
**Server → Client Events:** 7  
**Client → Server Events:** 2  
**Documented Events:** 5 (62.5%)  
**Undocumented Events:** 3 (37.5%)  
**Compliant:** 5 (100% of documented)  
**Payload Mismatches:** 0

**Key Findings:**
- All documented events are correctly implemented
- 3 critical events are undocumented: `ticket_cancelled`, `ping`, `pong`
- Event payloads match between documentation and implementation
- Frontend correctly handles all events including undocumented ones
- No breaking changes or deviations from documented contracts

---

### 9.2 Server → Client Events (Server Emits)

#### 9.2.1 snapshot ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `snapshot` | ✅ `snapshot` | ✅ COMPLIANT |
| **Description** | Initial state on join | Initial state on join | ✅ COMPLIANT |
| **Trigger** | Client emits `join` | Client emits `join` | ✅ COMPLIANT |
| **Implementation** | - | [api/start/ws.ts:93](../../../api/start/ws.ts) | - |
| **Client Handler** | - | [web/src/hooks/useSocket.ts:107](../../../web/src/hooks/useSocket.ts) | - |

**Payload Schema:**
```typescript
{
  tickets: SnapshotTicket[],          // Active tickets for requested rooms
  completedTickets: SnapshotTicket[], // Last 20 completed (if source rooms)
  menuVersion: number,                // Current menu version
  serverNowMs: number                 // Server timestamp for time sync
}

type SnapshotTicket = {
  id: number
  station: string
  seq: number                         // Station sequence number
  state: string                       // "created" | "started" | "completed"
  source?: string                     // "foh" | "drive_thru"
  createdAt?: number                  // Timestamp (ms)
  startedAt?: number                  // Timestamp (ms)
  durationSeconds?: number
  menuVersionAtCall?: number
  itemTitleSnapshot?: string          // e.g., "Orange Chicken (BE1)"
  batchSizeSnapshot?: string          // e.g., "2"
  durationSnapshot?: number
}
```

**Notes:**
- Sent immediately after client joins rooms
- Provides full initial state for the subscribed rooms
- Frontend correctly deserializes both camelCase and snake_case fields

---

#### 9.2.2 ticket_created ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `ticket_created` | ✅ `ticket_created` | ✅ COMPLIANT |
| **Description** | New ticket created | New ticket created | ✅ COMPLIANT |
| **Trigger** | `POST /api/tickets` | `POST /api/tickets` | ✅ COMPLIANT |
| **Broadcast Target** | Not documented | Station + source rooms | ⚠️ INCOMPLETE DOC |
| **Implementation** | - | [tickets_controller.ts:42-43](../../../api/app/controllers/tickets_controller.ts) | - |
| **Client Handler** | - | [web/src/hooks/useSocket.ts:129](../../../web/src/hooks/useSocket.ts) | - |

**Payload:** Full Ticket object (same as `SnapshotTicket`)

**Broadcast Logic:**
```typescript
Ws.toStation(ticket.station, 'ticket_created', ticket.serialize())
Ws.toStation(ticket.source, 'ticket_created', ticket.serialize())
```

**Notes:**
- Broadcasts to both station room (e.g., "stirfry") and source room (e.g., "foh")
- Frontend filters based on current room subscriptions
- Adds ticket to active tickets list

---

#### 9.2.3 timer_started ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `timer_started` | ✅ `timer_started` | ✅ COMPLIANT |
| **Description** | Timer started for ticket | Timer started for ticket | ✅ COMPLIANT |
| **Trigger** | `POST /api/tickets/:id/start` | `POST /api/tickets/:id/start` | ✅ COMPLIANT |
| **Broadcast Target** | Not documented | Station + source rooms | ⚠️ INCOMPLETE DOC |
| **Implementation** | - | [tickets_controller.ts:89-90](../../../api/app/controllers/tickets_controller.ts) | - |
| **Client Handler** | - | [web/src/hooks/useSocket.ts:140](../../../web/src/hooks/useSocket.ts) | - |

**Payload Schema:**
```typescript
{
  ticketId: number,
  startedAt: number,       // Timestamp (ms)
  durationSeconds: number  // Cook time in seconds
}
```

**Notes:**
- Lightweight payload (no full ticket object)
- Frontend updates existing ticket in state
- Used for real-time timer synchronization across screens

---

#### 9.2.4 ticket_completed ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `ticket_completed` | ✅ `ticket_completed` | ✅ COMPLIANT |
| **Description** | Ticket marked complete | Ticket marked complete | ✅ COMPLIANT |
| **Trigger** | `POST /api/tickets/:id/complete` | `POST /api/tickets/:id/complete` | ✅ COMPLIANT |
| **Broadcast Target** | Not documented | Station + source rooms | ⚠️ INCOMPLETE DOC |
| **Implementation** | - | [tickets_controller.ts:103-104](../../../api/app/controllers/tickets_controller.ts) | - |
| **Client Handler** | - | [web/src/hooks/useSocket.ts:151](../../../web/src/hooks/useSocket.ts) | - |

**Payload:** Full Ticket object (same as `SnapshotTicket`)

**Frontend Behavior:**
- Removes ticket from active tickets list
- Adds to completed tickets list (max 50)
- Only applies if ticket matches current room subscriptions

---

#### 9.2.5 menu_updated ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `menu_updated` | ✅ `menu_updated` | ✅ COMPLIANT |
| **Description** | Menu changed | Menu changed | ✅ COMPLIANT |
| **Trigger** | Menu mutations | Menu mutations | ✅ COMPLIANT |
| **Broadcast Target** | Not documented | All connected clients | ⚠️ INCOMPLETE DOC |
| **Client Handler** | - | [web/src/hooks/useSocket.ts:122](../../../web/src/hooks/useSocket.ts) | - |

**Payload Schema:**
```typescript
{
  version: number  // New menu version
}
```

**Triggers:**
- `POST /api/menu` - Create menu item ([menu_items_controller.ts:49](../../../api/app/controllers/menu_items_controller.ts))
- `PATCH /api/menu/:id` - Update menu item ([menu_items_controller.ts:81](../../../api/app/controllers/menu_items_controller.ts))
- `DELETE /api/menu/:id` - Delete menu item ([menu_items_controller.ts:97](../../../api/app/controllers/menu_items_controller.ts))
- `POST /api/menu/:id/image` - Upload image ([menu_items_controller.ts:140](../../../api/app/controllers/menu_items_controller.ts))
- `DELETE /api/menu/:id/image` - Delete image ([menu_items_controller.ts:167](../../../api/app/controllers/menu_items_controller.ts))

**Broadcast Logic:**
```typescript
Ws.broadcast('menu_updated', { version })
```

**Frontend Behavior:**
- Updates menu version in state
- Triggers menu data refetch (via useMenu hook)

**Notes:**
- Global broadcast to all clients (not room-specific)
- Critical for keeping menu configuration in sync across all screens

---

#### 9.2.6 ticket_cancelled ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ❌ Not documented | ✅ `ticket_cancelled` | ❌ UNDOCUMENTED |
| **Description** | - | Ticket cancelled/deleted | ❌ UNDOCUMENTED |
| **Trigger** | - | `DELETE /api/tickets/:id` | ❌ UNDOCUMENTED |
| **Broadcast Target** | - | Station + source rooms | ❌ UNDOCUMENTED |
| **Implementation** | - | [tickets_controller.ts:118-119](../../../api/app/controllers/tickets_controller.ts) | - |
| **Client Handler** | ✅ Implemented | [web/src/hooks/useSocket.ts:163](../../../web/src/hooks/useSocket.ts) | ⚠️ CLIENT ONLY |

**Payload:** Full Ticket object (same as `SnapshotTicket`)

**Broadcast Logic:**
```typescript
Ws.toStation(station, 'ticket_cancelled', serialized)
Ws.toStation(source, 'ticket_cancelled', serialized)
```

**Frontend Behavior:**
- Removes ticket from active tickets list
- Removes ticket from completed tickets list (if present)
- Only applies if ticket matches current room subscriptions

**Notes:**
- **CRITICAL:** This event is fully implemented in both backend and frontend
- Used when staff cancels a ticket via `DELETE /api/tickets/:id`
- Essential for error correction workflow (e.g., ticket created by mistake)
- Should be documented in README.md WebSocket section

---

#### 9.2.7 pong ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ❌ Not documented | ✅ `pong` | ❌ UNDOCUMENTED |
| **Description** | - | Server time sync response | ❌ UNDOCUMENTED |
| **Trigger** | - | Client emits `ping` | ❌ UNDOCUMENTED |
| **Broadcast Target** | - | Requesting client only | ❌ UNDOCUMENTED |
| **Implementation** | - | [api/start/ws.ts:96-98](../../../api/start/ws.ts) | - |
| **Client Handler** | ✅ Implemented | [web/src/hooks/useServerTime.ts:14](../../../web/src/hooks/useServerTime.ts) | ⚠️ CLIENT ONLY |

**Payload Schema:**
```typescript
{
  serverNowMs: number  // Current server timestamp (ms)
}
```

**Implementation:**
```typescript
socket.on('ping', () => {
  socket.emit('pong', { serverNowMs: Date.now() })
})
```

**Client Usage:**
- Measures round-trip time (RTT) for time synchronization
- Calculates client-server time offset
- Enables accurate countdown timers on frontend
- Calibrates every 30 seconds ([useServerTime.ts:35](../../../web/src/hooks/useServerTime.ts))

**Notes:**
- **CRITICAL:** Essential for accurate timer display across screens
- Without this, timer countdowns would drift due to client clock skew
- Should be documented as part of time synchronization mechanism

---

### 9.3 Client → Server Events (Client Emits)

#### 9.3.1 join ✅ DOCUMENTED & COMPLIANT

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ✅ `join` | ✅ `join` | ✅ COMPLIANT |
| **Description** | Subscribe to station updates | Subscribe to room updates | ✅ COMPLIANT |
| **Server Handler** | - | [api/start/ws.ts:83](../../../api/start/ws.ts) | - |
| **Client Emit** | - | [web/src/hooks/useSocket.ts:193](../../../web/src/hooks/useSocket.ts) | - |

**Payload Schema:**
```typescript
string[]  // Array of room names to join
```

**Valid Rooms:**
- **Stations:** `"stirfry"`, `"fryer"`, `"sides"`, `"grill"`
- **Sources:** `"foh"`, `"drive_thru"`

**Server Behavior:**
1. Leaves all previous rooms
2. Joins only valid rooms from the provided array
3. Builds and sends `snapshot` for the requested rooms

**Client Room Mapping:**
```typescript
const ROOMS_BY_SCREEN: Record<ScreenId, string[]> = {
  1: ['foh'],              // FOH screen
  2: ['drive_thru'],       // Drive-Thru screen
  3: ['stirfry'],          // BOH Stirfry
  4: ['fryer'],            // BOH Fryer
  5: ['sides', 'grill'],   // BOH Sides/Grill
  menu: [],                // Menu config (no rooms)
}
```

**Notes:**
- Client emits on initial connection and when screen changes
- Invalid room names are silently filtered out
- Documentation only mentions "subscribe to station-specific updates" but doesn't detail room concept

---

#### 9.3.2 ping ❌ UNDOCUMENTED

| Aspect | Documented | Implementation | Status |
|--------|------------|----------------|--------|
| **Event Name** | ❌ Not documented | ✅ `ping` | ❌ UNDOCUMENTED |
| **Description** | - | Request server time sync | ❌ UNDOCUMENTED |
| **Server Handler** | - | [api/start/ws.ts:96](../../../api/start/ws.ts) | - |
| **Client Emit** | ✅ Implemented | [web/src/hooks/useServerTime.ts:30](../../../web/src/hooks/useServerTime.ts) | ⚠️ CLIENT ONLY |

**Payload:** None (event has no data)

**Server Response:** Emits `pong` with `{ serverNowMs: number }`

**Client Logic:**
```typescript
const measureOffset = () => {
  const clientSendTime = Date.now()
  
  socket.once('pong', (data: { serverNowMs: number }) => {
    const clientReceiveTime = Date.now()
    const rtt = clientReceiveTime - clientSendTime
    const serverTime = data.serverNowMs
    const estimatedServerNow = serverTime + rtt / 2
    const newOffset = estimatedServerNow - clientReceiveTime
    
    // Running average of last 5 measurements
    measurementsRef.current.push(newOffset)
    if (measurementsRef.current.length > 5) {
      measurementsRef.current.shift()
    }
    
    const avg = measurementsRef.current.reduce((a, b) => a + b, 0) / measurementsRef.current.length
    setOffsetMs((prev) => (prev === 0 ? avg : 0.7 * prev + 0.3 * avg))
  })
  
  socket.emit('ping')
}
```

**Timing:**
- Emitted on connection
- Re-emitted every 30 seconds

**Notes:**
- **CRITICAL:** Core time synchronization mechanism
- Enables accurate countdown timers across screens with different system clocks
- Uses exponential smoothing to reduce noise from network jitter
- Should be documented alongside `pong` event

---

### 9.4 Event Payload Validation

All event payloads were validated against implementation:

| Event | Documented Payload | Actual Payload | Match |
|-------|-------------------|----------------|-------|
| `snapshot` | Not detailed | `{tickets, completedTickets, menuVersion, serverNowMs}` | ⚠️ N/A (not detailed) |
| `ticket_created` | Not detailed | Full Ticket object | ⚠️ N/A (not detailed) |
| `timer_started` | Not detailed | `{ticketId, startedAt, durationSeconds}` | ⚠️ N/A (not detailed) |
| `ticket_completed` | Not detailed | Full Ticket object | ⚠️ N/A (not detailed) |
| `menu_updated` | Not detailed | `{version}` | ⚠️ N/A (not detailed) |
| `ticket_cancelled` | ❌ Undocumented | Full Ticket object | ❌ N/A |
| `pong` | ❌ Undocumented | `{serverNowMs}` | ❌ N/A |
| `join` | Not detailed | `string[]` (room names) | ⚠️ N/A (not detailed) |
| `ping` | ❌ Undocumented | None | ❌ N/A |

**Conclusion:** No payload mismatches found. Documentation simply lacks detail on payload schemas.

---

### 9.5 Documentation Gaps

#### 9.5.1 Undocumented Events

**Critical undocumented events:**
1. **`ticket_cancelled`** - Essential for ticket cancellation workflow
2. **`ping`** - Client request for time sync
3. **`pong`** - Server time sync response

**Impact:**
- High - These events are actively used by the frontend
- Developers integrating with WebSocket API would miss critical functionality
- Time sync mechanism is completely undocumented but essential for timer accuracy

#### 9.5.2 Missing Payload Documentation

**README.md mentions events but lacks:**
- Payload schemas for all events
- Type definitions
- Example payloads
- Error scenarios (e.g., invalid room names)

#### 9.5.3 Missing Room Documentation

**Room-based routing is undocumented:**
- Available rooms: `stirfry`, `fryer`, `sides`, `grill`, `foh`, `drive_thru`
- How events are routed to specific rooms
- Which events are broadcast globally vs. room-specific
- Screen-to-room mappings

#### 9.5.4 Missing Connection Documentation

**Not documented:**
- WebSocket connection URL (implied as `{API_URL}/socket.io`)
- Socket.io client configuration (path, transports, etc.)
- Reconnection behavior
- Initial handshake flow (connect → join → snapshot)

---

### 9.6 Compliance Summary

#### Events by Status

| Status | Count | Events |
|--------|-------|--------|
| ✅ Documented & Compliant | 5 | `snapshot`, `ticket_created`, `timer_started`, `ticket_completed`, `menu_updated` |
| ❌ Undocumented (Server Emits) | 2 | `ticket_cancelled`, `pong` |
| ❌ Undocumented (Client Emits) | 1 | `ping` |

#### Documentation Quality

| Category | Status |
|----------|--------|
| Event names | ✅ Accurate (for documented events) |
| Event purposes | ✅ Briefly described |
| Payload schemas | ❌ Missing |
| Example payloads | ❌ Missing |
| Room routing | ❌ Missing |
| Time sync mechanism | ❌ Completely undocumented |
| Connection details | ❌ Missing |

#### Implementation Quality

| Category | Status |
|----------|--------|
| Event naming | ✅ Consistent and descriptive |
| Payload consistency | ✅ Uniform ticket serialization |
| Room isolation | ✅ Proper room-based broadcasting |
| Error handling | ⚠️ Silent filtering (invalid rooms) |
| Type safety | ✅ Strong typing in implementation |
| Frontend-backend match | ✅ Perfect alignment |

---

### 9.7 Recommended Actions

#### High Priority

1. **Document undocumented events:**
   - Add `ticket_cancelled` to README.md WebSocket section
   - Document `ping`/`pong` time synchronization mechanism
   - Explain use cases for each event

2. **Add payload schemas:**
   - Document exact payload structure for each event
   - Include TypeScript type definitions
   - Provide example JSON for each event

3. **Document room-based routing:**
   - List available rooms
   - Explain which events are room-specific vs. global
   - Document screen-to-room mappings

#### Medium Priority

4. **Add connection documentation:**
   - WebSocket URL format
   - Socket.io configuration
   - Connection lifecycle (connect → join → snapshot)

5. **Add sequence diagrams:**
   - Ticket creation flow with WebSocket events
   - Timer start/complete flow
   - Menu update propagation
   - Time synchronization flow

6. **Document error scenarios:**
   - Invalid room names
   - Connection failures
   - Reconnection behavior

#### Low Priority

7. **Create WebSocket API reference:**
   - Separate section or document for WebSocket API
   - Similar structure to REST API documentation
   - Interactive examples (e.g., Socket.io client examples)

---

### 9.8 Validation Results

**Date:** 2026-02-26  
**Validator:** Manual code inspection + cross-reference

**Summary:**
- ✅ All documented events are correctly implemented
- ✅ Perfect alignment between frontend and backend implementations
- ✅ No payload mismatches or breaking changes
- ❌ 3 critical events are undocumented (`ticket_cancelled`, `ping`, `pong`)
- ⚠️ Payload schemas are not detailed in documentation
- ⚠️ Room-based routing is not explained
- ⚠️ Time synchronization mechanism is completely undocumented

**Critical Finding:** The time synchronization mechanism (`ping`/`pong`) is **completely undocumented** but **essential for system functionality**. Without it, timer countdowns would be inaccurate due to client clock skew. This is a high-priority documentation gap.

**Conclusion:** WebSocket implementation is **robust and well-designed** but **severely under-documented**. The actual implementation is more feature-rich than the documentation suggests. Priority should be given to documenting the time sync mechanism and `ticket_cancelled` event.
