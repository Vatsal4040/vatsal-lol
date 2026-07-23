# VATSAL.LOL V4 — Governing Master Specification (v1.0)

**Specification Version**: 1.0 (FROZEN & LOCKED)  
**Status**: Active  
**Last Updated**: 2026-07-23  

This is the **permanently frozen governing master specification** for **VATSAL.LOL V4**.

---

## Core Philosophy

Every game on VATSAL.LOL is intentionally different. V4 standardizes only the platform experience (branding, SDK, mobile responsiveness, accessibility, performance) without imposing a uniform visual style across games.

> *VATSAL.LOL is not trying to become a generic gaming platform. It is a curated collection of distinct interactive experiences that share a common platform foundation. V4 strengthens that foundation without reducing the individuality of the games themselves.*

---

## Immutable Rules (Frozen Sections)

### 1. Simplicity Rule
```
When multiple solutions exist,
prefer the simpler solution
unless measurable benefits justify additional complexity.
```

### 2. Platform Ownership Rule
Platform code (`vatsal-sdk.js`, `vatsal-v4.css`) must **never** know internal game logic or inspect game state.

### 3. SDK Public API
Exposes branding controls. `window.VatsalLolGameComplete()` is stubbed as a no-op to support compatibility with legacy game code.

### 4. Non-Goals
V4 will **NOT** introduce user accounts, login, favorites, cloud saves, achievements, framework migrations (React/Vue), or automatic game redesigns.

### 5. Thumbnail & Branding Policy
- **Full 16:9 Widescreen Composition**: All thumbnails in `assets/thumbnails/` must retain their full 16:9 uncropped composition (1672x941 / 1280x720) so game titles and artwork are fully visible without zooming or text cut-offs.
- **Transparent Typographic Branding**: Fixed top-left platform header logo `vatsal.lol` must render purely typographic (no background, border, blur, card background, shadows, or competitive styling).
- **Brand Fidelity**: Brand fidelity takes priority over file-size budgets. No compression or cropping may visibly degrade `assets/logo.png` or game thumbnails.

### 6. Performance Budgets
- Homepage JS: < 150 KB
- Homepage CSS: < 80 KB
- Thumbnail Image: < 50 KB (WebP, 16:9 aspect ratio preserved)
- Branding Logo: < 60 KB
- SDK (`vatsal-sdk.js`): < 10 KB

### 7. Footer Rule (Sunsetted in V4.0.1)
The recommendation footer has been completely terminated from all games to prioritize immersive, distraction-free gameplay.

### 8. Branding Rule
Branding identifies the platform subtly (`vatsal.lol`). It must **never** compete with the game's title, UI HUD, or primary artwork.

---

## Master Phased Roadmap

```
Phase 0: Platform Foundation
✅ Complete (vatsal-v4.css, vatsal-sdk.js, games.json)

↓

Phase 1: Repository Cleanup & Performance
✅ Complete (Waste removed, 38MB saved, Logo & 16:9 Thumbnails preserved)

↓

Phase 2: Platform Integration
✅ Completed across all games existing during migration.

↓

Phase 3A: Individual Game Polish & Bug Fixes (All Games)
✅ Complete (All 6 Waves verified 100% passed Definition of Done)

↓

Phase 3B: Platform Collection Cleanup
✅ Reduced active production collection to 36 games.

↓

Phase 4: Release Candidate Validation
✅ Complete (100% compliance on Go/No-Go Blocker tests passed)

↓

Phase 5A: V4.0.1 Maintenance Release
✅ Complete (Purged suggestion footer dependencies, stubbed callbacks, and tagged v4.0.1)

↓

Phase 5B: Post-Release Evolution
🔄 Active (Checklist redesign, Spend Bill Gates Money redesign, Sudoku redesign as V4.x feature updates)
```

---

## Phase 4 — Release Candidate Validation Checklist

- **Platform**: Verify SDK loading, transparent branding CSS, and `games.json` parsing.
- **Every Game**: Validate that each of the 36 games opens and plays correctly, and that there are zero console errors or broken assets.
- **Desktop**: Validate layouts on Chrome, Edge, and Firefox at standard resolutions.
- **Mobile**: Portrait first, landscape where applicable on 360×800, 390×844, and 412×915 viewports.
- **Lighthouse**: Measure Performance, Accessibility, Best Practices, and SEO targets for the homepage, redesign candidates, and representative games.
- **Accessibility**: Focus visibility, touch target sizing, keyboard support, reduced motion compliance.
- **Repository**: Final audit for duplicate/orphan assets, broken links, or legacy V2.5 dependencies.
- **PWA**: Verify service worker registration, offline page, manifest, and cache updates.

---

## Release Blockers (Go/No-Go List)

V4.0.1 cannot be released if any of these conditions are met:
- ❌ Any broken game or gameplay regression.
- ❌ Broken homepage link or layout overflow.
- ❌ Missing thumbnail or brand logo asset.
- ❌ Any console error or failed network request.
- ❌ Missing SDK integration.
- ❌ Broken SEO canonical links or description tags.
- ❌ Active V2.5 dependencies in live games.
- ❌ Broken PWA offline page or service worker registration.
- ❌ Lighthouse regression caused by V4 changes.
