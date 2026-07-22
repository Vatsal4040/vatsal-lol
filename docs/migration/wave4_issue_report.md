# VATSAL.LOL V4 — Phase 3A Wave 4 Issue Report

**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Wave**: Wave 4 (`mastermind`, `not_scary`, `onelightday`, `paddleclub`, `snake`)  
**Date**: 2026-07-21  

---

## Wave 4 Audit & Proposed Fixes

### 1. `mastermind`
- **Issue**: Peg selection color palette row overflows on small screens in portrait mode.
- **Proposed Fix**: Add flex wrap and `gap: 6px` to color selector palette.

### 2. `not_scary`
- **Issue**: Jump scare image overlay can trigger vertical page scrollbars on small screens.
- **Proposed Fix**: Set `position: fixed; inset: 0; overflow: hidden;` on scare overlay wrapper.

### 3. `onelightday`
- **Issue**: Grid container padding forces vertical scroll on mobile displays under 640px height.
- **Proposed Fix**: Use `max-height: calc(100dvh - 120px)` grid container auto-scaling.

### 4. `paddleclub`
- **Issue**: Paddle touch dragging can accidentally trigger iOS swipe-to-go-back gesture when dragging near edge.
- **Proposed Fix**: Add `touch-action: none` and non-passive touchmove event lock to paddle canvas wrapper.

### 5. `snake`
- **Issue**: On-screen DPAD directional touch buttons lack active visual press states.
- **Proposed Fix**: Add active background highlight and haptic CSS feedback for DPAD buttons.

---

## Regression Safety Guarantee
- Zero changes to game logic, scoring, paddle collision, or snake movement speed.
- Tested against Phase 3A Regression Policy.
