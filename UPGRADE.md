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
- [ ] Edit interface: list of batch sizes with individual time inputs
- [ ] Example: Small (5 min), Medium (8 min), Large (12 min)
- [ ] Validate times are positive numbers
- [ ] Display batch-specific times in UI
- [ ] Default to shared time if not specified per batch

**Example UI:**
```
Batch Sizes & Cook Times:
- Small:  [ 5 ] minutes
- Medium: [ 8 ] minutes  
- Large:  [ 12 ] minutes
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

### 2.2.4 Optional Pictures
**Priority**: Medium

**Requirements:**
- [ ] Add optional image field to menu items
- [ ] Support image upload in Menu Management
- [ ] Display images on cards when available
- [ ] Fallback to text-only when no image
- [ ] Image optimization for performance
- [ ] Recommended image size/format (e.g., 300x300px, WebP/JPEG)

---

## 2.3 FOH & Drive-Thru Screens

### 2.3.1 Timer Display on Buttons
**Priority**: High

**Requirements:**
- [ ] Replace "Unavailable" text with remaining timer countdown
- [ ] Show format: "5:30" or "2:15" (minutes:seconds)
- [ ] Update countdown in real-time every second
- [ ] Button remains disabled but shows time remaining
- [ ] Visual styling to indicate cooking in progress
- [ ] When timer reaches 0:00, change to "Call" state

**Example:**
```
Before: [Unavailable] (grayed out)
After:  [3:45] (shows remaining time)
```

---

### 2.3.2 Batch Size Toggle (3 Positions)
**Priority**: High

**Requirements:**
- [ ] Replace batch size buttons with 3-position toggle switch
- [ ] Three positions: Small / Medium / Large (or Half / Full / Double)
- [ ] Visual indicator for selected batch size
- [ ] Touch-friendly toggle control
- [ ] Smooth transition animation between positions
- [ ] Color-coded states for quick identification

**Example UI:**
```
Batch Size: [ S ] [ M ] [ L ]
            ◄─────●─────►
```

---

### 2.3.3 Collapsable Calls by Hour
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
