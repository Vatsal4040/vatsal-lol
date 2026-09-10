# CHAOS: The Internet's Most Beautiful Sound Playground
## 05. Design & Decision Principles

This document serves as the ultimate tie-breaker for design and engineering trade-offs. When faced with multiple implementation paths, use these principles to make the decision.

---

## 1. Simplicity Wins
If two implementations achieve the same user-facing result, **always choose the simpler one.**
* Never add architectural complexity to support hypothetical future needs.
* Build for today, expand tomorrow. Keep code readable, flat, and maintainable.

---

## 2. Audio Comes First
Everything in CHAOS exists to support the auditory experience.
* If a visual style, layout element, or animation reduces frame rates or compromises audio thread stability, **remove or simplify the visual component.**
* Pure, pop-free audio always wins.

---

## 3. One Click
Every core interaction must be resolved in a single click.
* No nested menus.
* No confirmation popups.
* No configuration dialog boxes.

---

## 4. Discoverability
Features must reveal themselves naturally through play.
* The user should discover presets, secret mixes, and controls by clicking and interacting.
* Never force onboarding tutorials or instruction overlays onto the user.

---

## 5. Playfulness
CHAOS is an interactive indie toy, not a business utility.
* Never make the app feel like a productivity suite, sound settings panel, or spreadsheet.
* Add organic, cozy, hand-drawn touches that evoke delight.

---

## 6. Performance
A stable `60fps` animation loop is mandatory.
* Smooth frame rates are essential for the toy-box feel.
* If an animation causes dropped frames or layout reflow thrashing, simplify or remove it immediately.

---

## 7. Aesthetic Consistency
Every card, icon, slider, button, and text block must belong to the same hand-sketched family.
* Never mix clean, sterile geometric shapes with wobbly hand-drawn boundaries.

---

## 8. Assets are Final
Never modify, recolor, crop, or regenerate the artist-provided icons and preset illustrations.
* Treat the provided art pack as a read-only, sacred constraint.

---

## 9. Less UI
If a control or button is not strictly necessary for the core playful experience, **remove it.**
* Keep the interface minimal, allowing the mascot characters and the audio to take center stage.

---

## 10. Users Experiment
Design for curiosity, not efficiency.
* The goal is to make the user think, *"I wonder what happens if I click this..."* rather than enabling them to navigate the page quickly.
