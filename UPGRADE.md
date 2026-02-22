# PRG Batch System - Stage 2: UI Optimization

> **Planning Document**: Stage 2 focuses on UI/UX improvements and iPad optimization.

## Stage 1 Status: ✅ Complete

**Deployed**: February 21, 2026  
**Live URL**: http://134.199.223.99:8080

### Stage 1 Deliverables (Completed)
- ✅ Multi-screen kitchen display system (FOH, Drive-Thru, BOH)
- ✅ Real-time ticket management with WebSocket
- ✅ Menu CRUD operations
- ✅ Cooking countdown timers
- ✅ Batch size tracking
- ✅ Station-specific filtering
- ✅ PostgreSQL database with migrations
- ✅ Docker deployment on DigitalOcean
- ✅ Comprehensive documentation

---

## Stage 2: UI/UX Requirements

### Primary Goal
Optimize all screens for **iPad displays** in landscape orientation (1194x834 resolution)

---

## 2.1 iPad Screen Optimization (1194x834)

### 2.1.1 Target Specification
**Priority**: Critical  
**Device**: iPad  
**Resolution**: 1194 x 834 pixels  
**Orientation**: Landscape (Horizontal)

**Affected Screens:**
- [ ] FOH (Front of House)
- [ ] Drive-Thru
- [ ] BOH - Stirfry Station
- [ ] BOH - Fryer Station
- [ ] BOH - Sides/Grill Station
- [ ] Menu Management

---

### 2.1.3 Hidden Slide-Down Navigation
**Priority**: High

**Requirements:**
- [ ] Navigation hidden by default (maximizes screen space)
- [ ] Toggle button at top of screen
- [ ] Button design: thin horizontal line with "menu" text in center
- [ ] Click/tap to slide navigation down from top
- [ ] Smooth slide animation
- [ ] Click outside or button again to hide navigation
- [ ] Persistent across all screens

**Button Design:**
```
────────────── menu ──────────────
```

---

### 2.1.2 Layout Requirements
**Priority**: High

**All Screens Must:**
- [ ] Fill entire 1194x834 viewport without scrolling
- [ ] Display maximum 4 cards per row
- [ ] Use touch-optimized controls (minimum 44x44px tap targets)
- [ ] Implement fixed viewport meta tag
- [ ] Remove desktop-specific hover states
- [ ] Test on actual iPad device

**Card Layout Rules:**
- Maximum 4 cards in one row
- Cards should be evenly spaced and sized
- Responsive grid layout (e.g., 4-column grid)

**CSS Setup:**
```css
/* Target iPad landscape viewport */
@media (width: 1194px) and (height: 834px) {
  /* iPad-specific styles */
  .card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}
```

---

## 2.2 Menu Management

### 2.2.1 Category Grouping by Station
**Priority**: High

**Requirements:**
- [ ] Group menu items by Station category
- [ ] Display sections: Stirfry, Fryer, Sides/Grill, etc.
- [ ] Collapsable/expandable station sections
- [ ] Visual separation between stations
- [ ] Sort items within each station

**Example UI:**
```
▼ Stirfry Station (6 items)
  [Menu items for Stirfry]

▼ Fryer Station (4 items)
  [Menu items for Fryer]

▼ Sides/Grill Station (3 items)
  [Menu items for Sides/Grill]
```

---

### 2.2.2 Batch-Specific Cooking Times
**Priority**: High

**Requirements:**
- [ ] Each batch size can have its own cooking time
- [ ] Batch sizes are numeric: 0.5, 1, 2, 3, 4, etc. (user-configurable)
- [ ] Edit interface: list of batch sizes with individual time inputs
- [ ] Validate times are positive numbers
- [ ] Support decimal batch sizes (e.g., 0.5 = half batch)
- [ ] Display batch-specific times in UI
- [ ] Default to shared time if not specified per batch

**Example UI:**
```
Batch Sizes & Cook Times:
- 0.5: [ 3 ] minutes
- 1:   [ 5 ] minutes
- 2:   [ 8 ] minutes  
- 3:   [ 12 ] minutes
```

---

### 2.2.3 Toggle for Enabled/Disabled
**Priority**: High

**Requirements:**
- [ ] Replace checkbox/text with toggle switch
- [ ] Visual states: ON (enabled) / OFF (disabled)
- [ ] Instant toggle without form submission
- [ ] Color-coded: green for ON, gray for OFF
- [ ] Touch-friendly toggle size (min 44x44px)

---

### 2.2.4 Color Assignment for Menu Items
**Priority**: High

**Requirements:**
- [ ] Add color field to menu items
- [ ] Color dropdown/picker in menu item edit form
- [ ] Pre-selected default color for each item
- [ ] Display color on menu item cards (border, badge, or background)
- [ ] Database: add color field to menu_items table
- [ ] Visual distinction on all screens (FOH, Drive-Thru, BOH)

**Color Options:**
- **Blue**: LTO (Limited Time Offer)
- **Red**: Slow items
- **Green**: Busy items
- **Orange**: Medium popular items

**Display Requirements:**
- [ ] Color indicator displayed under item code on FOH/Drive-Thru cards
- [ ] Color bar, badge, or background tint on cards
- [ ] Consistent color representation across all screens

**Example UI (Menu Edit):**
```
Menu Item: Orange Chicken
Color: [🔵 Blue - LTO] ▼
       [🔴 Red - Slow]
       [🟢 Green - Busy]
       [🟠 Orange - Medium]
```

**Example UI (FOH Card):**
```
┌─────────────────────┐
│  Orange Chicken     │
│  Code: CH-101       │
│  [🔵 Blue - LTO]    │ ← Color displayed here
│                     │
│  [Call] [1][2][3]   │
└─────────────────────┘
```

**Note**: Color system implementation will require database schema update and UI changes across multiple screens (FOH, Drive-Thru, BOH, Menu Management).

---

### 2.2.5 Picture Upload for Menu Items
**Priority**: High

**Requirements:**
- [ ] Add image upload button in menu item edit form
- [ ] Support drag-and-drop image upload
- [ ] Accept formats: JPEG, PNG, WebP
- [ ] Image preview before saving
- [ ] Ability to remove/replace existing image
- [ ] Backend: store images on server or cloud storage
- [ ] Database: add image_url field to menu_items table
- [ ] Display images on FOH/Drive-Thru cards when available
- [ ] **Placeholder when no image**: Show placeholder with text "Please upload picture for this item"
- [ ] Image optimization/resize on upload (e.g., max 800x800px)
- [ ] Validate file size (e.g., max 5MB)

**Example UI:**
```
Menu Item: Orange Chicken

Picture: [📷 Upload Image]
         or drag & drop here
         
         [Preview of uploaded image]
         [Remove]
```

---

## 2.3 FOH & Drive-Thru Screens

### 2.3.1 FOH Card Layout
**Priority**: High

**Requirements:**
- [ ] Redesign card layout with specific structure
- [ ] Top: Code - Title (e.g., "CH-101 - Orange Chicken")
- [ ] Middle: Picture (if available)
- [ ] Below picture: 3-position toggle for batch size
- [ ] Bottom: Call button
- [ ] Compact design fitting 4 cards per row

**Card Layout:**
```
With picture:
┌─────────────────────────┐
│ CH-101 - Orange Chicken │ ← Code - Title
│                         │
│   [   Picture   ]       │ ← Menu item image
│                         │
│  Batch: [1][2][3]       │ ← 3-position toggle
│                         │
│     [   Call   ]        │ ← Call button
└─────────────────────────┘

Without picture (placeholder):
┌─────────────────────────┐
│ CH-101 - Orange Chicken │
│                         │
│  ┌──────────────────┐   │
│  │  📷 Please upload│   │ ← Placeholder
│  │  picture for this│   │
│  │  item            │   │
│  └──────────────────┘   │
│  Batch: [1][2][3]       │
│     [   Call   ]        │
└─────────────────────────┘
```

---

### 2.3.2 Progress Bar Timer in Call Button
**Priority**: High

**Requirements:**
- [ ] Replace "Unavailable" text with remaining timer countdown
- [ ] Show format: "5:30" or "2:15" (minutes:seconds)
- [ ] Update countdown in real-time every second
- [ ] **Animated progress bar inside button**
- [ ] Color gradient based on cooking progress:
  - **0-33% (Red)**: Just started cooking
  - **34-66% (Orange/Yellow)**: Halfway through
  - **67-99% (Yellow-Green)**: Almost ready
  - **100% (Green)**: Ready / Quality check
- [ ] Progress bar fills from left to right as time counts down
- [ ] Button remains disabled until timer reaches 100%

**Visual Example:**
```
Just started (5:00 remaining, 0%):
┌─────────────────────────┐
│ ░░░░░░░░░░░░░░░░░ 5:00  │ ← Empty, Red background
└─────────────────────────┘

Halfway (2:30 remaining, 50%):
┌─────────────────────────┐
│ ████████░░░░░░░░ 2:30   │ ← Orange progress
└─────────────────────────┘

Almost done (0:30 remaining, 90%):
┌─────────────────────────┐
│ ██████████████░ 0:30    │ ← Yellow-green progress
└─────────────────────────┘

Ready (100%):
┌─────────────────────────┐
│ █████████████████ Call  │ ← Full green, enabled
└─────────────────────────┘
```

---

### 2.3.3 Batch Size Toggle (3 Positions)
**Priority**: High

**Requirements:**
- [ ] Replace batch size buttons with 3-position toggle switch
- [ ] Display numeric batch sizes (e.g., 1, 2, 3 or 0.5, 1, 2)
- [ ] Three positions based on menu item's configured batch sizes
- [ ] Visual indicator for selected batch size
- [ ] Touch-friendly toggle control
- [ ] Smooth transition animation between positions
- [ ] Color-coded states for quick identification

**Example UI:**
```
Batch Size: [ 1 ] [ 2 ] [ 3 ]
            ◄─────●─────►
            
or

Batch Size: [ 0.5 ] [ 1 ] [ 2 ]
            ◄───────●───────►
```

---

### 2.3.4 Collapsable Calls by Hour
**Priority**: High

**Requirements:**
- [ ] Group calls by hour (e.g., "10:00 AM - 11:00 AM")
- [ ] Collapsable/expandable sections for each hour
- [ ] Default state: current hour expanded, others collapsed
- [ ] Visual indicator for collapsed/expanded state
- [ ] Smooth expand/collapse animation
- [ ] Persist collapse state (optional)

**Example UI:**
```
▼ 10:00 AM - 11:00 AM (5 calls)
  [Call cards displayed here]
  
▶ 11:00 AM - 12:00 PM (8 calls)
  
▼ 12:00 PM - 1:00 PM (12 calls)
  [Call cards displayed here]
```

---

## 2.4 BOH Kitchen Screens

### 2.4.1 Collapsed Completed Items
**Priority**: High

**Requirements:**
- [ ] Group completed tickets into collapsable section
- [ ] Default state: collapsed
- [ ] Show count of completed items (e.g., "Completed (12)")
- [ ] Expandable to view completed tickets
- [ ] Visual separation from active tickets
- [ ] Auto-collapse after expansion timeout (optional)

**Example UI:**
```
[Active Tickets - 5 items displayed]

▶ Completed (12)
  [Click to expand and view completed tickets]
```

---

**Document Status**: Draft  
**Last Updated**: 2026-02-21  
**Next Review**: TBD  
**Owner**: Development Team
