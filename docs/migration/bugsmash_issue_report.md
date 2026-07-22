# VATSAL.LOL V4 — Phase 3A Issue Report: Bug Smash

**Game**: Bug Smash (`games/bugsmash/`)  
**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Date**: 2026-07-21  

---

## Identified Issues

### 1. High Refresh Rate Display Frame-Pacing (Game Running Too Fast)
- **Problem**: On 120Hz/144Hz monitors and high refresh rate mobile screens, bugs move twice as fast because movement logic is tied directly to `requestAnimationFrame` ticks without delta time calculation.
- **Root Cause**: `bug.x += bug.speed` executes per frame instead of per millisecond.
- **Proposed Fix**: Introduce frame delta time (`dt = currentTime - lastTime`) in `main.js` game loop so bug movement speed remains identical across 60Hz, 120Hz, and 144Hz displays.

---

## Verification & Safety Check

- [x] Zero changes to bug spawn rates, score points, or squish hitboxes.
- [x] Tested against Phase 3A Regression Policy.
