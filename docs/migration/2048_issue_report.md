# VATSAL.LOL V4 — Phase 3A Issue Report: 2048

**Game**: 2048 (`games/2048/`)  
**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Date**: 2026-07-21  

---

## Identified Issues

### 1. Mobile Swipe Disruption & Accidental Touch Actions
- **Problem**: Swiping rapidly on mobile viewports can trigger vertical page scrolls or back/forward gestures, disrupting active gameplay or causing accidental resets.
- **Root Cause**: Touch event listeners on `.game-container` do not consistently call `e.preventDefault()` on touchmove when `game-started` is active.
- **Proposed Fix**: Add explicit `{ passive: false }` touchmove handlers to `.game-container` while game is active, locking vertical scrolling during gameplay while keeping `New Game` button easily accessible.

### 2. Desktop Score Container Alignment
- **Problem**: Score and Best score badges on desktop screens slightly misalign relative to the main 2048 title when fonts scale.
- **Proposed Fix**: Adjust flexbox alignment and padding on `.heading .scores-container` to maintain crisp alignment with `.title` across all desktop window widths.

---

## Verification & Safety Check

- [x] Zero changes to 2048 math/cupcake tile merge algorithms.
- [x] Zero changes to score calculation or high score persistence.
- [x] Preserves both Maths & Cupcake modes.
- [x] Tested against Phase 3A Regression Policy.
