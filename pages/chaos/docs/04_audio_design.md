# CHAOS: The Internet's Most Beautiful Sound Playground
## 04. Audio Engine & Sound Design Specification

---

## 4.1 Core Audio Philosophy
In CHAOS, **Audio is the product**. The user experience is defined by the richness, smoothness, and organic feel of the soundscapes. The audio system must act as an invisible, flawless conductor. 

---

## 4.2 Web Audio API Routing Architecture
To support 20-30 simultaneous playing loops smoothly without causing dropouts, low-performance frame rates, or audio distortion, the engine routes all sound sources through the native browser Web Audio API:

```
                  ┌──────────────────────┐
                  │     AudioContext     │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │   Master GainNode    │
                  │   (Master Volume)    │
                  └──────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐
  │  GainNode   │     │  GainNode   │     │  GainNode   │
  │   (Rain)    │     │  (Forest)   │     │  (Coffee)   │
  └──────▲──────┘     └──────▲──────┘     └──────▲──────┘
         │                   │                   │
  ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐
  │ MediaSource │     │ MediaSource │     │ MediaSource │
  │ (rain.opus) │     │(forest.opus)│     │(coffee.opus)│
  └─────────────┘     └─────────────┘     └─────────────┘
```

* **AudioContext Initialization:** Instantiated on the first user interaction to comply with modern browser autoplay policies.
* **Master GainNode:** Connected directly to the `AudioContext.destination` to govern overall output volume.
* **Individual GainNodes:** Every sound card possesses a dedicated `GainNode` linked to the `Master GainNode`. Volumes are adjusted at the individual level and scaled cleanly.

---

## 4.3 Loop Handling & Gapless Selection
Standard HTML5 `<audio>` loop tags often suffer from a short silence or "gap" when restarting, which ruins immersion.
* **Audio Element Sources:** The Web Audio engine wraps HTML5 `Audio` elements using `AudioContext.createMediaElementSource(audio)`. This preserves streaming benefits (low startup latency) while providing precision volume gain nodes.
* **Loop Monitoring:** Loop cycling is driven by listening to the `'ended'` event of the wrapped `Audio` element.
* **Variation Cycling:** When a file terminates, the loop cycles. To keep the soundscape alive, the engine must select a *different* file variation from the sound's variation collection (e.g. `rain_01` $\rightarrow$ `rain_03`), never repeating the previous file.

---

## 4.4 Anti-Pop & Fade Engine
Sudden volume changes generate sharp waveforms that manifest as physical speaker pops or clicks.
* **Linear Gain Ramps:** The engine utilizes the Web Audio API parameter scheduler (`gainNode.gain.linearRampToValueAtTime`) to fade audio:
  * **Fade In:** Starts at `0.0` gain. On play, ramps up to target gain (e.g. `0.8`) over `250ms`.
  * **Fade Out:** Ramps from current gain down to `0.0` over `250ms`. Once the ramp completes, the underlying `Audio` source is paused and reset.
* **Crossfading:** When shifting preset states, the exit group's gain nodes ramp down to `0.0` while the entrance group's gain nodes ramp up concurrently.

---

## 4.5 Volume Scaling & Normalization
* **Audio Normalization:** All source files (OPUS and WAV) in `assets/sound/` are normalized to approximately `-16 LUFS` to ensure equal baseline volume levels.
* **Gain Calculation:**
  $$\text{Gain}_{\text{final}} = \text{Individual Slider Volume} \times \text{Master Volume}$$
* **Master Scaler:** Changing the master volume slider instantly schedules a gain adjustment on the Master GainNode without changing individual sound gain values.

---

## 4.6 Preload Strategy & Memory Management
* **Lazy Loading:** Do not preload all 120+ audio files on startup. This would choke network bandwidth.
* **Trigger Loading:** An `Audio` element is created, routed through a new `GainNode`, and loaded *only* when the user clicks the corresponding sound card for the first time.
* **Object Pooling:** Keep a map of active sound nodes. If a user turns a sound off and on again, reuse the existing `Audio` and `GainNode` routing chain instead of spawning a new one.
* **Garbage Collection:** If a sound remains inactive for a long period, or the active list grows excessively, release unused resources to prevent browser memory leaks.

---

## 4.7 Future Layering Support
To prepare the audio engine for advanced layering (e.g., adding intermittent sounds):
* **Layer Types:**
  * **Continuous Loops:** Constant ambient hum (e.g. Rain, Lofi Beats).
  * **One-Shot Sprites:** Random, intermittent occurrences (e.g. occasional thunder cracks in Rain, a bird chirp in Forest, a cup clink in Coffee Shop).
* **Implementation Prep:** The audio engine API exposes a `playOneShot(soundId, fileIndex, volume)` interface. This allows introducing spontaneous, low-probability sounds that layer on top of continuous loops without altering the main loop cycle code.
