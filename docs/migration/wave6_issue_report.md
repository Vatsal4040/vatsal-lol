# VATSAL.LOL V4 — Phase 3A Wave 6 (Final Wave) Issue Report

**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Wave**: Wave 6 (`would-you-press-the-button`, `xo`, `your-life-in-numbers`, `8bit-lab`, `can-you-guess-indian-mom`, `memory-tiles`, `spot`, `under-limit`)  
**Date**: 2026-07-21  

---

## Wave 6 Audit & Proposed Fixes

### 1. `would-you-press-the-button`
- **Issue**: Button container height on mobile screens causes vertical scroll when recommendation footer appears.
- **Proposed Fix**: Add flex layout container bounds (`min-height: calc(100dvh - 80px)`).

### 2. `xo`
- **Issue**: Tic-tac-toe grid cells have fixed pixel dimensions on narrow screens.
- **Proposed Fix**: Set grid cell size to responsive `min(22vw, 100px)`.

### 3. `your-life-in-numbers`
- **Issue**: High-frequency metric card pulse animation on mobile causes GPU battery draw.
- **Proposed Fix**: Calm animation frequency to 7s on touch viewports (`animation-duration: 7s !important`).

### 4. `8bit-lab`
- **Issue**: Canvas resolution on retina displays appears soft.
- **Proposed Fix**: Apply crisp pixelated canvas image-rendering (`image-rendering: pixelated`).

### 5. `can-you-guess-indian-mom`
- **Issue**: Card choice buttons lack safe-bottom padding on iPhone home indicator bar.
- **Proposed Fix**: Add `padding-bottom: calc(16px + var(--v3-safe-bottom))`.

### 6. `memory-tiles`
- **Issue**: Rapid double-tapping on tile flip can trigger mobile zoom gestures.
- **Proposed Fix**: Set `touch-action: manipulation` on tile grid buttons.

### 7. `spot`
- **Issue**: Canvas target circles need touch padding margin for finger precision.
- **Proposed Fix**: Expand pointer hit target padding.

### 8. `under-limit`
- **Issue**: Score progress bar lacks CSS transitions when updating score.
- **Proposed Fix**: Add smooth CSS width transition (`transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).

---

## Regression Safety Guarantee
- Zero changes to game logic, scoring, rules, or questions.
- Tested against Phase 3A Regression Policy.
