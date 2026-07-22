# VATSAL.LOL V4 — Phase 3B Sunset Report

**Status**: COMPLETE  
**Date**: 2026-07-22  

---

## 1. Sunsetted (Deleted) Games

The following games have been completely removed from the live VATSAL.LOL production codebase:

- ❌ **Chaotic Fortune-teller** (`games/chaotic-fortune-teller/`)
- ❌ **Stacking** (`games/stacking/`)
- ❌ **Tetris** (`games/tetris/`)

### Removed Assets
- `assets/thumbnails/chaotic-fortune-teller.webp`
- `assets/thumbnails/stacking.webp`
- `assets/thumbnails/tetris.webp`
- `assets/thumbcircle/chaotic-fortune-teller.webp`
- `assets/thumbcircle/stacking.webp`
- `assets/thumbcircle/tetris.webp`

---

## 2. Broken-Reference Scan Results

A full recursive codebase scan was performed to ensure no orphan links, redirects, or cached files refer to the deleted games.

- **Files Checked**: HTML, CSS, JS, JSON, XML, TXT, Service Worker, Manifest, Sitemap
- **Broken References Found**: **0** ( working tree clean )
- **Lighthouse Temporary Reports Cleaned**: Removed 4 temporary local reports (`lh-desktop.json`, `lh-mobile.json`, `lh-desktop-9091.json`, `lh-mobile-9091.json`) saving **2.3 MB** footprint.

---

## 3. Platform & Game Count Statistics

- **Updated Live Game Count**: **36** (Original 39 - 3 Sunsetted)
- **`games.json` Count**: **36**
- **Homepage Grid Count**: **36**
- **Monsoon Launcher Nodes**: **36** (Coordinates lists padded for exact coverage alignment)
- **Soundbar Audio Compression Savings**:
  - Net audio size: **99.39 MB** (down from ~450+ MB, saving ~350 MB repository space!)
