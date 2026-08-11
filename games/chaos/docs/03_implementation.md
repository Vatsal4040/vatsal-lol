# CHAOS: The Internet's Most Beautiful Sound Playground
## 03. Technical Implementation Specification

---

## 3.1 Folder & Code Structure
```text
/
├── index.html            # Main markup & entry point
├── css/
│   └── style.css         # Styling (hand-drawn card layout, custom sliders, wiggles)
├── js/
│   ├── audio-manager.js  # Audio loop variation engine & Web Audio API routing
│   └── app.js            # Main application runtime, state, UI, preset unlocks
└── json/
    ├── sounds.json       # Sound metadata, file collection lists, chaos weights (No categories)
    └── presets.json      # Standard preset definitions & hidden unlock formulas
```

---

## 3.2 Data Specifications & Schemas

### `json/sounds.json`
Contains metadata for all 30 sounds. **No category keys** are included in the schema; sounds are kept flat and independent.
```json
[
  {
    "id": "rain",
    "name": "Rain",
    "icon": "rain.png",
    "files": ["rain_01.opus", "rain_02.opus", "rain_03.opus", "rain_04.opus"],
    "chaosWeight": 4,
    "particleColor": "#7ea6e0",
    "particleType": "drop"
  }
  // ... and remaining 29 sounds
]
```

### `json/presets.json`
Defines standard presets and the unlock conditions (recipes) for hidden presets:
```json
{
  "standard": [
    {
      "id": "night_shift",
      "title": "Night Shift",
      "cover": "night_shift.png",
      "sounds": [
        { "id": "office", "volume": 0.5 },
        { "id": "lofi", "volume": 0.6 },
        { "id": "coffee", "volume": 0.4 },
        { "id": "rain", "volume": 0.3 }
      ]
    }
  ],
  "hidden": [
    {
      "id": "storm_watch",
      "title": "Storm Watch",
      "cover": "camp_night.png",
      "recipe": ["rain", "wind", "waves"],
      "sounds": [
        { "id": "rain", "volume": 0.7 },
        { "id": "wind", "volume": 0.6 },
        { "id": "waves", "volume": 0.5 }
      ]
    }
  ]
}
```

---

## 3.3 Intentional Display Order (Non-Alphabetical)
To make discovery fun and keep the sandbox playful, the grid order is hardcoded in the HTML / JS rendering stack. The order intentionally mixes cozy, everyday, and fantasy sounds:
1. Rain (`rain`)
2. Coffee Shop (`coffee`)
3. Volcano (`volcano`)
4. Forest (`forest`)
5. Hospital (`hospital`)
6. Campfire (`campfire`)
7. Construction (`construction`)
8. Waves (`waves`)
9. Alien Ship (`alien`)
10. Office (`office`)
11. Casino (`casino`)
12. Wind (`wind`)
13. Zombie Invasion (`zombie`)
14. Train Station (`train`)
15. Dentist (`dentist`)
16. Barn Animals (`barn`)
17. Lofi Beats (`lofi`)
18. Fireworks (`fireworks`)
19. Highway (`highway`)
20. Carnival (`carnival`)
21. Medieval Battle (`battle`)
22. Beehive (`bee`)
23. Playground (`playground`)
24. Couple Arguing (`couple`)
25. Church Bells (`church`)
26. Crime Scene (`crime`)
27. Lawnmower (`lawnmower`)
28. Haunted Dungeon (`haunted`)
29. Nuclear Siren (`nuclear`)
30. Marching Band (`marching`)

---

## 3.4 Chaos Meter Calculation
The Chaos Meter calculates the total audacity of the mix:
$$\text{Chaos Score} = \sum_{\text{active sounds}} \text{chaosWeight}$$
$$\text{Chaos \%} = \min\left(100, \text{Chaos Score}\right)$$

* **Wiggle Mapping:**
  The meter container applies CSS wiggle animation classes depending on the active percentage:
  * `0 - 15%`: **Peaceful** $\rightarrow$ No wiggle.
  * `16 - 35%`: **Calm** $\rightarrow$ Extremely minor translational float.
  * `36 - 60%`: **Busy** $\rightarrow$ Gentle wiggle (amplitude: $0.5\text{deg}$ rotation, frequency: $1.5\text{s}$ loop).
  * `61 - 85%`: **Chaotic** $\rightarrow$ Moderate wiggle (amplitude: $1.2\text{deg}$ rotation, frequency: $0.6\text{s}$ loop).
  * `86 - 100%`: **Maximum Chaos** $\rightarrow$ Intensive hand-drawn rattle wiggles (amplitude: $2.5\text{deg}$ rotation, frequency: $0.15\text{s}$ loop).

---

## 3.5 Local Storage Rules
* **Store in `localStorage`:**
  * Unlocked hidden preset IDs (`chaos_unlocked_presets` as a stringified JSON array).
  * Current Master Volume setting (`chaos_master_volume` as a float).
  * Last active Master Volume setting before mute (`chaos_last_master_volume` as a float).
* **Do NOT store in `localStorage`:**
  * Currently playing sounds (the application must always start in a silent state).
  * Individual volume overrides of sounds.
  * Audio playback position or elapsed time offsets.

---

## 3.6 Dynamic Chaos Features

### Random Chaos (Surprise Me)
* **Trigger:** Click the `🎲 Surprise Me` button in the UI.
* **Rules:**
  1. Fade out and stop all currently playing sounds.
  2. Select between `3` and `8` sounds.
  3. **No Duplicates:** Every sound in the mix must be unique.
  4. Assign each selected sound a random volume level between `0.3` and `0.9`.
  5. Fade in the selected sounds.
  6. Append cards to the Now Playing panel in order of selection.
  7. Recalculate and animate the Chaos Meter.

### Daily Chaos
* **Trigger:** Click the "Daily Chaos" preset.
* **Algorithm:**
  1. Get the current date string (`YYYY-MM-DD`).
  2. Hash the date string to generate a numeric seed value (e.g. `20260806`).
  3. Instantiate a seeded LCG (Linear Congruential Generator) helper:
     ```javascript
     function seededRandom(seed) {
       let x = Math.sin(seed++) * 10000;
       return x - Math.floor(x);
     }
     ```
  4. Use this seeded generator to deterministically choose a count (between 3 and 6) and a unique subset of sounds and volumes.
  5. Because the seed is tied to the date, every visitor to the site receives the exact same "Daily Chaos" mix for that calendar day.
  6. No server coordination is required.

---

## 3.7 Preset & Unlocking Engine
1. Whenever the user alters the active sound list, get a list of active sound IDs.
2. Intersect the active sound IDs list with the `recipe` array of each locked hidden preset.
3. If an active set includes *all* the required recipe items (e.g. active includes `rain`, `wind`, and `waves` for `storm_watch`):
   * Check if this preset ID is already present in `localStorage`.
   * **Only unlock once:** If it is already unlocked, do nothing.
   * If newly unlocked:
     * Add preset ID to the unlocked list in `localStorage`.
     * Spawn a sticker-like hand-drawn toast notification:
       *"✨ Hidden Preset Unlocked! 'Storm Watch' has been added to your collection."*
     * Append the new card dynamically into the Presets shelf at the bottom.

---

## 3.8 Robust Error Handling
* **Audio Load Failures:** If a loop variation file (e.g., `rain_02.opus`) fails to load due to network interruptions, file corruption, or missing assets:
  * The audio manager catches the error event.
  * It immediately falls back to variation index `0` (e.g., `rain_01.opus`) which is guaranteed to be available or cached.
  * The application must never crash, stall playback, or disable the sound card interface because of a single variation failure.

---

## 3.9 Future Architectural Expansion: Sound Packs
To make the application modular and easily expandable in the future:
* The core JS code relies on relative path mappings.
* To add new worlds (e.g., Winter Pack, Space Pack, Ocean Pack), a developer simply drops in a new pack JSON file (e.g. `packs/winter.json`) containing:
  * Pack-specific sounds and file paths.
  * Pack-specific mascot icons.
  * Pack-specific presets.
* The JS loader loops through configured pack JSON entries. No core application logic, audio engine code, or UI handling files need to be modified.

---

## 3.10 Product-Focused Acceptance Criteria (AC)
The application is complete when:
- [ ] **✓ Simultaneous Layering:** Every sound in the sound library can play concurrently without breaking or causing browser lag.
- [ ] **✓ Independent Control:** Every sound has an active controller card in Now Playing with individual volume adjustment and mute toggles.
- [ ] **✓ Playful Aesthetics:** Layout and interactions feel like an interactive sketch/toy box rather than a boring utility app.
- [ ] **✓ Inaudible Transitions:** Audio loops crossfade smoothly on start, stop, and preset changes with zero popping or sudden silences.
- [ ] **✓ Instant Presets:** Presets load immediately, updating the Now Playing stack and wiggling the Chaos Meter instantly.
- [ ] **✓ High Performance:** The interface remains smooth and interactive even when 20+ sounds play at the same time.
- [ ] **✓ Clutter-Free Space:** The right-hand column dynamically manages active cards, avoiding UI overcrowding.
- [ ] **✓ Intuitively Understandable:** A first-time visitor understands how to interact, trigger sounds, and mix elements within 5 seconds without instructions.
- [ ] **✓ Toy-Box Feel:** The overall atmosphere, animations, and sound combinations feel like an organic toy rather than formal utility software.
