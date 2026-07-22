# VATSAL.LOL V4 — Phase 3A Wave 5 Issue Report

**Phase**: Phase 3A — Individual Game Polish & Bug Fixes  
**Wave**: Wave 5 (`soundbar`, `standing`, `tower-of-hanoi`, `which-number`, `wordle`)  
**Date**: 2026-07-21  

---

## Wave 5 Audit & Proposed Fixes

### 1. `soundbar`
- **Issue**: Sound tile buttons on mobile screens lack clear active press states when tapped quickly.
- **Proposed Fix**: Add `:active` transform scale (`scale(0.96)`) and active glowing border feedback.

### 2. `standing`
- **Issue**: Character balance gauge text overlaps with restart button on short mobile screens (<560px height).
- **Proposed Fix**: Adjust vertical flex gap and safe-area padding for standing balance HUD.

### 3. `tower-of-hanoi`
- **Issue**: Disk dragging touch events do not lock canvas bounds, causing occasional scroll jitter during drag.
- **Proposed Fix**: Add `{ passive: false }` touchmove handlers to disk canvas container.

### 4. `which-number`
- **Issue**: Number grid selection tiles do not scale down on extra narrow screens (<340px).
- **Proposed Fix**: Set grid template columns to `repeat(auto-fit, minmax(60px, 1fr))` with fluid typography.

### 5. `wordle`
- **Issue**: On-screen keyboard keys have tight margins on mobile, making edge keys (Q, P, Enter, Backspace) easy to mis-tap.
- **Proposed Fix**: Adjust keyboard key padding, touch target height (`min-height: 48px`), and gap spacing.

---

## Regression Safety Guarantee
- Zero changes to game rules, sound audio files, Hanoi move validation, or Wordle dictionary validation.
- Tested against Phase 3A Regression Policy.
