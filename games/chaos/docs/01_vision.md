# CHAOS: The Internet's Most Beautiful Sound Playground
## 01. Product Vision & Non-Negotiables

---

## 1.1 Non-Negotiables
These core technical and design rules are absolute constraints. Under no circumstances may they be breached:
* **Pure HTML, CSS, and Vanilla JavaScript only.**
* **No frameworks:** No React, Vue, Svelte, Angular, solid, or Qwik.
* **No CSS frameworks:** No Tailwind CSS, Bootstrap, Bulma, or Foundation.
* **No JS utility libraries:** No jQuery, Lodash, Axios, or external UI libraries.
* **No build tools:** No NPM, Webpack, Vite, Parcel, Rollup, or compiler scripts.
* **Zero npm dependencies:** No installation of third-party packages. Everything must run natively in the browser.
* **Offline capability:** The application must load and function completely offline once assets are fetched.
* **Provided assets only:** Never regenerate, modify, or replace the artist-provided icons, preset illustrations, or audio recordings. Use them exactly as they are.
* **Performance first:** Playability and stable 60fps animations are higher priority than heavy visual filters or complex rendering.
* **Audio is the hero:** Sound quality, seamless looping, and click-free crossfades are the absolute highest priorities.

---

## 1.2 Core Vision
Most ambient sound websites focus on productivity, meditation, sleep, focus, or study. They look and feel like utility software—sterile, clean, structured, and corporate.

**CHAOS is the complete opposite.**

CHAOS exists because playing with sounds is fun. It is digital LEGO for your ears. It is an interactive indie toy box.
* **No goals:** There are no pomodoro timers, progress goals, or user onboarding wizards.
* **No barriers:** No login prompts, no registration, and no settings menus.
* **No notifications:** No notification badges, no gamified badges, and no AI chatbots.
* **Pure Play:** The only interactions are to click sounds, create audio worlds, and experiment.

---

## 1.3 Page Flow

```
User opens page
       │
       ▼
Logo animates slightly (entrance bounce)
       │
       ▼
Sound grid is immediately visible (idle state)
       │
       ▼
Nothing is playing (silence)
       │
       ▼
User clicks mascot icon (e.g. Rain)
       │
       ▼
Rain starts (fades in cleanly over 250ms)
       │
       ▼
Rain card appears in Now Playing list (on the right)
       │
       ▼
Chaos Meter animates (wiggles slightly, indicating low chaos)
       │
       ▼
10 seconds of interaction pass
       │
       ▼
Chaos Presets shelf gently fades in at the bottom
       │
       ▼
User continues clicking, layering, and experimenting
```

---

## 1.4 Emotional Target
The application must feel like loading an old Nintendo cartridge or opening a hand-illustrated storybook. Everything should feel cute, warm, and rich with personality.
* **Immersion first:** The user immediately understands they can interact with the grid.
* **The "Accidental Chaos" Hook:** The user starts clicking cozy sounds—*Rain*, *Coffee Shop*, *Campfire*. But as they scan the grid, they see unexpected entries—*Dentist*, *Construction*, *Alien Ship*, *Nuclear Siren*. Curious, they click them. Suddenly, they've accidentally mixed a cozy coffee shop with a screaming nuclear apocalypse. That moment—the instant transition from tranquility to complete auditory absurdity—is the product.

---

## 1.5 Artistic Vibe & Vibe References
* **Inspirations:** *Animal Crossing*, *Untitled Goose Game*, *Tiny Glade*, *Paper Mario*, *Little Kitty Big City*, indie web toys, storybooks, and cute sticker packs.
* **Style:** Warm, cozy, hand-drawn, illustrated. Cards should look like sticker decals, and text should look handwritten.
* **Anti-Patterns:** Absolutely no default Tailwind grids, no Bootstrap, no Material design, no clean vector shapes, no flat corporate borders, no glassmorphism, and no OS-like settings widgets.

---

## 1.6 Strict Asset Naming Convention
All assets are structured in strict directories. File names must be `snake_case` with no spaces or capital letters:
* **Mascot Icons (`assets/icons/`):** Contains the PNG mascot files for all 30 sounds (e.g., `rain.png`, `volcano.png`, `lofi.png`).
* **Preset Covers (`assets/icons/`):** Contains the illustrated preset card covers (e.g., `night_shift.png`, `the_end.png`, `monday_morning.png`).
* **Sound Loops (`assets/sound/`):** Contains multi-variation `.opus` and `.wav` audio files (e.g., `rain_01.opus` through `rain_04.opus`).
