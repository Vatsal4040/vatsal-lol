# V4 Recommendation Footer Architecture (`suggest-footer-v4`)

## Overview
`assets/suggest-footer-v4.js` and `assets/suggest-footer-v4.css` render a minimal, fast, non-intrusive 2-game recommendation section at the bottom of the game viewport.

## Data Source
Footer metadata is powered by `/assets/data/game-list.json`. Adding new games requires updating only `game-list.json`.

## Behavior Rules
1. Remains hidden during gameplay.
2. Appears **only after** `window.VatsalLolGameComplete()` is called.
3. Randomly selects exactly **2 games** (excluding active game).
4. Displays game thumbnail, title, and link.
