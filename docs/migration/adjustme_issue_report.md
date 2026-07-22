# VATSAL.LOL V4 — Phase 3A Issue Report: Adjust Me

**Game**: Adjust Me (`games/adjustme/`)  
**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Date**: 2026-07-21  

---

## Identified Issues

### 1. Dual Control Support (Drag & Tap)
- **Problem**: Desktop mouse controls only support tap selection, while mobile touch input defaults to drag-select only. Users cannot easily toggle or use both tap and drag on either device.
- **Proposed Fix**: Unify grid event listeners in `script.js` so both pointer drag (pointerdown -> pointermove -> pointerup) and tap-to-select (start cell -> end cell) operate smoothly across desktop mouse and mobile touch.

### 2. Erase Mode & Selection State
- **Problem**: Erasing existing rectangles on mobile requires selecting the region first, but active touch highlight state does not clearly feedback when a region is selected.
- **Proposed Fix**: Highlight selected rectangle borders with an animated outline and enable direct tap-to-erase toggle when tapping an already formed rectangle.

---

## Verification & Safety Check

- [x] Zero changes to puzzle generation algorithms or area math.
- [x] Zero changes to difficulty scaling grids or daily streak data.
- [x] Tested against Phase 3A Regression Policy.
