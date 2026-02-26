# Stage 2: UI Optimization

Stage 1 (deployed Feb 21, 2026): http://134.199.223.99:8080

**Stage 1 shipped:**
- Multi-screen display (FOH, Drive-Thru, BOH)
- Real-time tickets via WebSocket
- Menu CRUD
- Timers, batch sizes, station filters
- PostgreSQL + Docker

**Stage 2 goal:** Optimize for iPad landscape (1194x834)

---

## 2.1 iPad Layout

### 2.1.1 Target: iPad Landscape
- Resolution: 1194 x 834 px
- Orientation: Horizontal only
- Screens: FOH, Drive-Thru, BOH (all stations), Menu

### 2.1.2 Layout Rules

- [ ] Viewport: 1194x834, no scrolling
- [ ] Max 4 cards per row
- [ ] Touch targets: min 44x44px
- [ ] Viewport meta tag: `width=device-width, initial-scale=1, user-scalable=no`
- [ ] No hover states (touch only)
- [ ] Test on physical iPad

CSS:
```css
@media (width: 1194px) and (height: 834px) {
  .card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}
```

### 2.1.3 Hidden Navigation

- [ ] Nav hidden by default
- [ ] Toggle button: thin line at top with "menu" text
- [ ] Click → slide down from top
- [ ] Click outside or button → slide up
- [ ] Apply to all screens

## 2.2 Menu Management

### 2.2.1 Group by Station

- [ ] Group items by station: Stirfry, Fryer, Sides/Grill
- [ ] Collapsible sections
- [ ] Sort items within station
- [ ] Show item count per station

Example:
```
▼ Stirfry Station (6)
  [items]
▼ Fryer Station (4)
  [items]
```

### 2.2.2 Cook Time per Batch Size

- [ ] Each batch size has its own cook time
- [ ] Batch sizes: 0.5, 1, 2, 3, 4 (user-defined)
- [ ] Input fields: one per batch size
- [ ] Validation: positive numbers only
- [ ] UI shows all batch/time pairs

Example:
```
Batch → Cook Time:
0.5 → [3] min
1   → [5] min
2   → [8] min
```

### 2.2.3 Toggle Switch for Enabled

- [ ] Replace checkbox with toggle
- [ ] States: ON (green) / OFF (gray)
- [ ] No form submit, instant save
- [ ] Min size: 44x44px

### 2.2.4 Color Labels

- [ ] Add `color` field to `menu_items` table (enum: blue, red, green, orange)
- [ ] Dropdown in edit form
- [ ] Colors: Blue (LTO), Red (Slow), Green (Busy), Orange (Medium)
- [ ] Display on FOH/Drive-Thru/BOH cards
- [ ] Show under item code

### 2.2.5 Image Upload

- [ ] Upload button + drag-and-drop
- [ ] Formats: JPEG, PNG, WebP (max 5MB)
- [ ] Preview before save
- [ ] Remove/replace image
- [ ] Backend: store on server or cloud
- [ ] DB: add `image_url` field (nullable)
- [ ] Resize on upload: max 800x800px
- [ ] Placeholder if no image: "Please upload picture for this item"

## 2.3 FOH & Drive-Thru

### 2.3.1 FOH Card Layout

- [ ] Layout (top→bottom): Code-Title, Picture, Batch toggle, Call button
- [ ] Code-Title: "CH-101 - Orange Chicken"
- [ ] Picture: Show image or placeholder
- [ ] Batch toggle: 3-position switch (values from menu data)
- [ ] Fit 4 cards per row

### 2.3.2 Progress Bar Timer

- [ ] Show countdown in button: "5:30" (MM:SS)
- [ ] Update every second
- [ ] Progress bar fills left→right
- [ ] Color by progress: 0-33% Red, 34-66% Orange, 67-99% Yellow-Green, 100% Green
- [ ] Button disabled until 100%

Progress states:
- 0%: Empty red bar, "5:00"
- 50%: Half orange, "2:30"
- 90%: Almost full yellow-green, "0:30"
- 100%: Full green, "Call"

### 2.3.3 Batch Size Toggle (3-Position)

- [ ] Replace buttons with 3-position toggle
- [ ] Show batch sizes from menu data (e.g., 1, 2, 3 or 0.5, 1, 2)
- [ ] Visual indicator on selected position
- [ ] Touch-friendly (min 44x44px)
- [ ] Smooth animation between positions

### 2.3.4 Group Calls by Hour

- [ ] Group by hour: "10:00 AM - 11:00 AM"
- [ ] Collapsible sections
- [ ] Default: current hour expanded, rest collapsed
- [ ] Show call count per hour

Example:
```
▼ 10:00 AM - 11:00 AM (5)
  [calls]
▶ 11:00 AM - 12:00 PM (8)
```

### 2.3.5 Quality Hold Timer

- [ ] After 100%, start 10-min hold countdown (configurable per item)
- [ ] 0-5 min: No alert
- [ ] 5-10 min: Pulsing red border
- [ ] 10+ min: Solid red border + red bg + "DISCARD - EXPIRED"

### 2.3.6 Cancel Button

- [ ] Show below Call button when cooking
- [ ] Only for active tickets
- [ ] Click → shadcn Alert Dialog
- [ ] Dialog: "Cancel Order?" / "This will cancel the cooking ticket. This action cannot be undone." / "Go Back" | "Cancel Order"
- [ ] Confirm → remove ticket, reset timer
- [ ] Style: subtle/secondary, smaller than Call

## 2.4 BOH Kitchen

### 2.4.1 Collapse Completed Tickets

- [ ] Group completed tickets in collapsible section
- [ ] Default: collapsed
- [ ] Show count: "Completed (12)"
- [ ] Expandable to view
- [ ] Separate from active tickets

---

## Implementation Plan

### Phase 1: Database & Backend

1. **DB Schema**
   - Add `color` (enum: blue/red/green/orange)
   - Add `image_url` (nullable)
   - Add `hold_time` (int, default 600 seconds)
   - Migration for existing data

2. **API**
   - `POST /api/menu-items/:id/image` (upload)
   - Store images (local or cloud)
   - Resize on upload (max 800x800)
   - Update menu CRUD for color + image_url
   - Support batch-specific cook times

3. **Cook Times per Batch**
   - Update `cook_times` field to nested structure
   - API support for batch-specific times

### Phase 2: Shared Components

4. **Navigation**
   - Hidden slide-down nav
   - Thin "menu" toggle button
   - Slide animation
   - Apply to all screens
   - Viewport meta: 1194x834

5. **Reusable Components**
   - Toggle Switch (enabled/disabled, batch sizes)
   - Progress Bar (timer viz)
   - Image Placeholder ("Please upload picture")
   - Color Badge (display indicators)
   - Collapsible Section (hourly calls, completed items)
   - shadcn Alert Dialog (cancel confirm)

### Phase 3: Menu Screen

6. Station grouping
7. Batch-specific cook times UI
8. Toggle switch for enabled
9. Color dropdown
10. Picture upload + preview

### Phase 4: FOH & Drive-Thru

11. FOH card redesign (Code-Title, Picture, Toggle, Button)
12. 3-position batch toggle
13. Progress bar timer (MM:SS, color gradient)
14. Quality hold timer (10 min, red border pulse)
15. Cancel button + dialog
16. Collapsible hourly calls

### Phase 5: BOH ✅ COMPLETE

17. ✅ Collapsed completed items
18. ✅ Color system on BOH cards
19. ✅ Hidden nav on BOH

**Added features:**
- Quality badges (A <5min, B 10-15min, Call Now >15min)
- Pulse effect on "Call Now"
- Last called timestamp
- BOH sort by age (oldest first)
- Waiting time: "Waiting: X MIN Y SEC"
- Response time: "Response: X MIN Y SEC"

**Tech fixes:**
- Use shadcn Collapsible
- Remove console.logs
- Fix imports
- Add serialize() methods to models
- Fix createdAt serialization

### Phase 6: Testing

20. iPad test (1194x834, 4 cards/row, 44x44px targets, no hover)
21. Cross-screen consistency (colors, nav, images)
22. Real-time updates (timers, progress, alerts)
23. Performance (50+ items, 20+ tickets, animations, images)

---

## Timeline

- Weeks 1-2: Phase 1 (DB, API)
- Week 3: Phase 2 (Components)
- Weeks 4-5: Phase 3 (Menu)
- Weeks 6-8: Phase 4 (FOH/Drive)
- Week 9: Phase 5 (BOH) ✅
- Week 10: Phase 6 (Testing)

---

## Status

**Completed:** Phases 1-5  
**Remaining:** Phase 6 (Testing)  
**Updated:** 2026-02-26
