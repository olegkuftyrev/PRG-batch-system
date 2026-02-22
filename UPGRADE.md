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

## 2.2 Menu Items

### 2.2.1 Optional Pictures
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

### 2.3.1 Collapsable Calls by Hour
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

**Document Status**: Draft  
**Last Updated**: 2026-02-21  
**Next Review**: TBD  
**Owner**: Development Team
