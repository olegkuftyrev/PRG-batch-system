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

## Additional Requirements

_To be specified..._

---

**Document Status**: Draft  
**Last Updated**: 2026-02-21  
**Next Review**: TBD  
**Owner**: Development Team
