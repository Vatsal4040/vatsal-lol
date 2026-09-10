# CHAOS Roadmap & Checklist

---

## 🚀 Version 1.0 (Current Scope)
* **Core Sandbox**
  - [x] Configure all 30 sounds in `json/sounds.json` and presets in `json/presets.json`.
  - [x] Create a responsive grid layout of 30 wobbly cards (4-cols desktop, 3-cols tablet, 2-cols mobile).
* **Audio Engine**
  - [x] Implement Web Audio API Engine (`AudioContext`).
  - [x] Route playing sounds to individual `GainNodes` and then to a `MasterGainNode`.
  - [x] Apply linear $250\text{ms}$ volume fades on start, stop, and volume tweaks.
  - [x] Loop tracks dynamically with loop variation cycling (no back-to-back repeats).
* **UI & Interactions**
  - [x] Implement active sound list (Now Playing) appending elements dynamically.
  - [x] Create hand-drawn, wobbly volume sliders (breathing knob animation, thicker on drag).
  - [x] Build wobbly Chaos Meter wiggling dynamically based on total active weight.
  - [x] Add 10-second post-first-interaction delay before fading in the Presets shelf.
* **Secret & Dynamic Mixes**
  - [x] Track active combination to unlock secret hidden presets.
  - [x] Render sticker-style toast notifications for unlocks, saving state to `localStorage`.
  - [x] Build `🎲 Surprise Me` (3-8 random sounds, random volumes).
  - [x] Removed `Daily Chaos` based on final scope.
* **Polish & Budgets**
  - [x] Add card hover bounces and active particle effects.
  - [x] Adhere to the strict Animation and Performance budgets.

---

## 🌟 Version 1.1 (Planned)
- [ ] **Favorites:** Save and reload custom sound mixes locally.
- [ ] **Search:** Quick filter bar to scan the grid.
- [ ] **Keyboard Shortcuts:** Trigger sounds via keybindings.

---

## 🌟 Version 1.2 (Planned)
- [ ] **Seasonal Packs:** Winter, Space, and Ocean sound pack extensions via JSON.
- [ ] **Unlock Animations:** Juicy sticker peel animations when unlocking presets.
- [ ] **Secret Achievements:** Earn badges for weird sound combinations.

---

## 🌟 Version 2.0 (Planned)
- [ ] **Community Mixes:** Share custom soundscapes with friends.
- [ ] **Share Links:** URL parameter encoding for active sound states.
- [ ] **Import / Export:** Share preset configurations via JSON.
