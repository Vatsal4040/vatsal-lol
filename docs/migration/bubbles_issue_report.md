# VATSAL.LOL V4 — Phase 3A Issue Report: Bubbles

**Game**: Bubbles (`games/bubbles/`)  
**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Date**: 2026-07-21  

---

## Identified Issues

### 1. Dual-Font Flash on Page Refresh
- **Problem**: When refreshing the game, the title and UI buttons briefly flash with system fallback fonts before loading custom Google fonts, causing visual layout shifting (CLS).
- **Root Cause**: `@import` font calls inside `style.css` execute asynchronously during render.
- **Proposed Fix**: Add `<link rel="preload">` and `font-display: swap;` in `index.html` to eliminate font flash shift during page initial paint.

### 2. Canvas & UI Polish
- **Problem**: High-DPI screens on mobile show minor blurriness around bubble edges.
- **Proposed Fix**: Scale canvas backing store by `window.devicePixelRatio` for sharp rendering across Retina/High-Hz displays.

---

## Verification & Safety Check

- [x] Zero changes to bubble physics, collision detection, or pop sound triggers.
- [x] Tested against Phase 3A Regression Policy.
