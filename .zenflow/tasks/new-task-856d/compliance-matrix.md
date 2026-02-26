# API Contracts Compliance Matrix

**Generated:** 2026-02-26  
**Project:** PRG Batch System  
**Version:** 1.0.0

---

## Executive Summary

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
