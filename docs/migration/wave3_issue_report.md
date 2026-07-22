# VATSAL.LOL V4 — Phase 3A Wave 3 Issue Report

**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Wave**: Wave 3 (`guess-the-lie`, `hardword`, `jokes-if-you-handle`, `lets-settle`, `luckorpredict`)  
**Date**: 2026-07-21  

---

## Wave 3 Audit & Proposed Fixes

### 1. `guess-the-lie`
- **Issue**: Option cards on mobile screens have narrow touch target heights (<40px).
- **Proposed Fix**: Enforce `min-height: 44px` with responsive touch padding on all option buttons.

### 2. `hardword`
- **Issue**: Keyboard key tiles on narrow screens (<360px) slightly overflow container width during row animations.
- **Proposed Fix**: Adjust flexbox key basis (`flex: 1 1 0`) and gap sizing (`gap: 3px`) for tight mobile screens.

### 3. `jokes-if-you-handle`
- **Issue**: Text container lines do not wrap smoothly on short landscape mobile viewports.
- **Proposed Fix**: Add `overflow-wrap: anywhere;` and responsive max-height scrolling wrapper.

### 4. `lets-settle`
- **Issue**: Button tap feedback states are missing active scale animations.
- **Proposed Fix**: Add subtle CSS `:active` scale transform (`transform: scale(0.98)`) for responsive feedback.

### 5. `luckorpredict`
- **Issue**: Prediction card flip transition can trigger vertical scrollbar flickering during 3D flip animation.
- **Proposed Fix**: Apply `backface-visibility: hidden` and `perspective` containment to prediction card wrappers.

---

## Regression Safety Guarantee
- Zero changes to game logic, scoring, words, or probability calculations.
- Tested against Phase 3A Regression Policy.
