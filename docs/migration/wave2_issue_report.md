# VATSAL.LOL V4 — Phase 3A Wave 2 Issue Report

**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Wave**: Wave 2 (`emojis-2-movies`, `everything-is-progressing`, `flash-memory`, `focus`, `future-timeline`)  
**Date**: 2026-07-21  

---

## Wave 2 Audit & Proposed Fixes

### 1. `emojis-2-movies`
- **Issue**: Quiz card margins on smaller mobile viewports (<380px) cause minor horizontal padding overflow.
- **Proposed Fix**: Adjust flex container max-width to `calc(100vw - 24px)` with responsive emoji font clamp sizing.

### 2. `everything-is-progressing`
- **Issue**: Progress bar animation can stutter on low-power mobile GPUs during high frequency increments.
- **Proposed Fix**: Add `will-change: transform` and GPU compositing layers to progress bar elements.

### 3. `flash-memory`
- **Issue**: Difficulty selection buttons on the start screen lack clear `:focus-visible` outline for keyboard navigation.
- **Proposed Fix**: Add high-contrast focus outlines and keyboard navigation support.

### 4. `focus`
- **Issue**: Dark mode background contrast on high-brightness OLED screens can make target indicators faint.
- **Proposed Fix**: Increase border contrast ratio on target focus elements to meet WCAG AA standards.

### 5. `future-timeline`
- **Issue**: SVG element `earth-fall-dry-wrap` animation overflows lower viewport bounds on mobile portrait screens.
- **Proposed Fix**: Add responsive SVG viewBox scaling and mobile CSS bounds to keep animation contained within screen height.

---

## Regression Safety Guarantee
- Zero changes to game logic, scoring, time limits, or quiz answers.
- Tested against Phase 3A Regression Policy.
