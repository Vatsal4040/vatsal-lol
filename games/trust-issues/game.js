/* ============================================================
   TRUST ISSUES — Neo-Retro 8-Bit HD Engine
   1920x1080 High-Density Pixel Art & 4-Play Progression
   ============================================================ */
"use strict";

const W = 1920, H = 1080;
const cv = document.getElementById("game");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

// ---------------------------------------------------------------- helpers
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const aabb = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const R = (x, y, w, h) => ({ x, y, w, h });

// ---------------------------------------------------------------- STAGE SPECIFICATIONS
const STAGES = [
  {
    id: 1,
    name: "Stage 1: Trust",
    shortName: "TRUST",
    // Map colors
    voidBg: "#2B0B04",
    nebula: "rgba(140, 40, 10, 0.22)",
    land: "#9B6800",
    landLight: "#C48812",
    landDark: "#6E4400",
    cliff: "#5A200B",
    cliffShadow: "#1E0A04",
    path: "#D49B38",
    pathBorder: "#3E1808",
    pathDot: "#FFE299",
    // In-game level colors
    gameGround: "#9B6800",
    gameSky: "#FFAE34",
    gameFrame: "#8A5800",
    gameDoor: "#F8FAFC",
  },
  {
    id: 2,
    name: "Stage 2: Trusting",
    shortName: "TRUSTING",
    voidBg: "#1C0A04",
    nebula: "rgba(160, 52, 18, 0.22)",
    land: "#B3541E",
    landLight: "#D97436",
    landDark: "#7A2E0C",
    cliff: "#6E2A08",
    cliffShadow: "#1F0802",
    path: "#E09060",
    pathBorder: "#3A1206",
    pathDot: "#FFD4B8",
    gameGround: "#B3541E",
    gameSky: "#78C0A8",
    gameFrame: "#6B7B1E",
    gameDoor: "#F8FAFC",
  },
  {
    id: 3,
    name: "Stage 3: Trusted",
    shortName: "TRUSTED",
    voidBg: "#120622",
    nebula: "rgba(110, 50, 160, 0.25)",
    land: "#A594F9",
    landLight: "#C4B8FF",
    landDark: "#6652C4",
    cliff: "#5A49B0",
    cliffShadow: "#180F36",
    path: "#C8BEFF",
    pathBorder: "#2E2460",
    pathDot: "#F0ECFF",
    gameGround: "#A594F9",
    gameSky: "#473C6E",
    gameFrame: "#2A1C44",
    gameDoor: "#F8FAFC",
  },
];

// Pre-generated 3-layer parallax starfield & cosmic nebula
const COSMIC_NEBULA = [];
for (let i = 0; i < 16; i++) {
  COSMIC_NEBULA.push({
    x: (i * 240 + 70) % 1920,
    y: (i * 150 + 90) % 1080,
    rx: 150 + (i % 4) * 45,
    ry: 85 + (i % 3) * 35,
    speed: 0.15 + (i % 3) * 0.08,
  });
}

const MICRO_STARS = [];
for (let i = 0; i < 140; i++) {
  MICRO_STARS.push({
    x: (i * 137.5 + 43) % 1920,
    y: (i * 89.3 + 17) % 1080,
    size: (i % 7 === 0) ? 3 : 2,
    baseAlpha: 0.3 + (i % 5) * 0.15,
    freq: 1.5 + (i % 4) * 1.2,
    phase: i * 0.7,
    color: (i % 8 === 0) ? "#FDE047" : ((i % 9 === 0) ? "#93C5FD" : ((i % 11 === 0) ? "#F472B6" : "#F8FAFC")),
  });
}

const CROSS_STARS = [];
for (let i = 0; i < 30; i++) {
  CROSS_STARS.push({
    x: (i * 277 + 110) % 1860 + 30,
    y: (i * 193 + 60) % 1000 + 40,
    freq: 2.0 + (i % 3) * 1.5,
    phase: i * 1.3,
    color: (i % 2 === 0) ? "#FFE066" : "#67E8F9",
  });
}

function drawCosmicBackdrop(stage, time) {
  // Base void background
  ctx.fillStyle = stage.voidBg;
  ctx.fillRect(0, 0, W, H);

  // Layer 1: Cosmic Nebula Dust / Dithering Clouds
  for (let i = 0; i < COSMIC_NEBULA.length; i++) {
    const neb = COSMIC_NEBULA[i];
    const nx = (neb.x + time * neb.speed * 8) % (W + 200) - 100;
    const grad = ctx.createRadialGradient(nx, neb.y, 10, nx, neb.y, neb.rx);
    grad.addColorStop(0, stage.nebula || "rgba(140, 40, 10, 0.22)");
    grad.addColorStop(0.6, "rgba(26, 8, 3, 0.12)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(nx, neb.y, neb.rx, neb.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer 2: Distant Dim Micro-Stars
  for (let i = 0; i < MICRO_STARS.length; i++) {
    const s = MICRO_STARS[i];
    const alpha = s.baseAlpha * (0.45 + 0.55 * Math.sin(time * s.freq + s.phase));
    ctx.fillStyle = s.color;
    ctx.globalAlpha = clamp(alpha, 0.15, 0.95);
    ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
  }
  ctx.globalAlpha = 1.0;

  // Layer 3: Medium Retro Cross-Stars (4-pixel glints)
  for (let i = 0; i < CROSS_STARS.length; i++) {
    const cs = CROSS_STARS[i];
    const pulse = 0.5 + 0.5 * Math.sin(time * cs.freq + cs.phase);
    if (pulse < 0.25) continue;
    const sz = pulse > 0.85 ? 4 : 2;
    const cx = Math.round(cs.x);
    const cy = Math.round(cs.y);

    // Center glint
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cx - 1, cy - 1, 3, 3);

    // Cross arms
    ctx.fillStyle = cs.color;
    ctx.fillRect(cx - sz - 1, cy, sz, 1);
    ctx.fillRect(cx + 2, cy, sz, 1);
    ctx.fillRect(cx, cy - sz - 1, 1, sz);
    ctx.fillRect(cx, cy + 2, 1, sz);
  }
}

// Overworld Map 10-node winding pathway coordinates (1920x1080)
const MAP_NODES = [
  { id: 1,  x: 460, y: 780 },
  { id: 2,  x: 680, y: 810 },
  { id: 3,  x: 900, y: 760 },
  { id: 4,  x: 1120, y: 800 },
  { id: 5,  x: 1340, y: 750 },
  { id: 6,  x: 1540, y: 620 },
  { id: 7,  x: 1440, y: 440 },
  { id: 8,  x: 1180, y: 380 },
  { id: 9,  x: 920, y: 360 },
  { id: 10, x: 620, y: 350, isBoss: true },
];

const WARP_GATE = { x: 1580, y: 880, w: 120, h: 96 };
const TOMBSTONE = { x: 180,  y: 690, w: 84,  h: 92 };

const MAIN_ISLAND_PTS = [
  { x: 380, y: 520 }, { x: 440, y: 400 }, { x: 560, y: 300 },
  { x: 740, y: 260 }, { x: 980, y: 240 }, { x: 1260, y: 260 },
  { x: 1500, y: 320 }, { x: 1680, y: 440 }, { x: 1760, y: 620 },
  { x: 1720, y: 820 }, { x: 1540, y: 940 }, { x: 1280, y: 970 },
  { x: 1000, y: 950 }, { x: 740, y: 970 }, { x: 520, y: 930 },
  { x: 360, y: 820 }, { x: 330, y: 660 }
];

const DETACHED_ISLAND = {
  cliff: { x: 96, y: 720, w: 230, h: 54 },
  land:  { x: 80, y: 690, w: 250, h: 42 }
};

// ---------------------------------------------------------------- AUDIO (Web Audio API Retro Chiptune)
const AudioFX = (() => {
  let ac = null, muted = false;
  const ensure = () => {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  };

  function tone(freq, dur, type = "square", vol = 0.12, slide = 0) {
    if (muted) return;
    try {
      const a = ensure();
      const o = a.createOscillator(), g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, a.currentTime);
      if (slide) {
        o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), a.currentTime + dur);
      }
      g.gain.setValueAtTime(vol, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
      o.connect(g).connect(a.destination);
      o.start();
      o.stop(a.currentTime + dur + 0.02);
    } catch {}
  }

  function noise(dur, vol = 0.18, lp = 800) {
    if (muted) return;
    try {
      const a = ensure();
      const len = Math.floor(a.sampleRate * dur);
      const buf = a.createBuffer(1, len, a.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = a.createBufferSource();
      src.buffer = buf;
      const f = a.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = lp;
      const g = a.createGain(); g.gain.value = vol;
      src.connect(f).connect(g).connect(a.destination);
      src.start();
    } catch {}
  }

  return {
    init: ensure,
    jump: () => tone(520, 0.08, "square", 0.10, -260),
    death: () => {
      noise(0.08, 0.22, 600);
      tone(140, 0.14, "square", 0.15, -100);
    },
    winPlay: () => {
      tone(587, 0.08, "square", 0.10);
      setTimeout(() => tone(880, 0.12, "square", 0.11), 60);
    },
    winLevel: () => {
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.14, "square", 0.11), i * 85);
      });
    },
    mapMove: () => tone(460, 0.05, "square", 0.07, 180),
    mapEnter: () => {
      tone(350, 0.06, "square", 0.08, 200);
      setTimeout(() => tone(700, 0.1, "square", 0.09), 60);
    },
    warp: () => {
      tone(220, 0.18, "sawtooth", 0.10, 600);
    },
    pop: () => tone(620, 0.05, "square", 0.08, -200),
    rumble: () => noise(0.2, 0.14, 250),
    slam: () => { noise(0.12, 0.2, 350); tone(85, 0.14, "square", 0.15, -35); },
    poof: () => tone(450, 0.1, "square", 0.08, -250),
    bounce: () => tone(280, 0.14, "square", 0.12, 450),
    zap: () => { tone(1100, 0.1, "sawtooth", 0.08, -600); noise(0.05, 0.1, 1400); },
    toggleMute: () => { muted = !muted; return muted; },
  };
})();

// ---------------------------------------------------------------- INPUT SYSTEM
const keys = {};
let jumpBuffered = 0;
let mouseX = -1, mouseY = -1;

addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space", "Enter"].includes(e.key)) {
    e.preventDefault();
  }

  if (!keys[e.code]) {
    if (["Space", "ArrowUp", "KeyW"].includes(e.code)) jumpBuffered = 0.08;

    // --- Title Screen Keys ---
    if (Game.state === "TITLE_SCREEN") {
      if (e.code === "Space" || e.code === "Enter") {
        Game.startFromTitle();
        return;
      }
    }

    // --- Paused Keys ---
    if (Game.isPaused) {
      if (e.code === "KeyP" || e.code === "Escape") {
        Game.isPaused = false;
        return;
      }
      if (e.code === "KeyM") {
        Game.returnToMap();
        return;
      }
      if (e.code === "KeyT") {
        Game.returnToTitle();
        return;
      }
    }

    // --- Map Navigation Keys ---
    if (Game.state === "MAP") {
      if (e.code === "ArrowLeft" || e.code === "KeyA") Game.mapMove(-1);
      if (e.code === "ArrowRight" || e.code === "KeyD") Game.mapMove(1);
      if (e.code === "Space" || e.code === "Enter") Game.mapEnterCurrent();
      if (e.code === "KeyW") Game.warpStage();
      if (e.code === "KeyT" || e.code === "Escape") Game.returnToTitle();
    }
  }
  keys[e.code] = true;

  if (e.code === "KeyR" && Game.state === "PLAYING") Game.restartPlay(true);
  if (e.code === "KeyP" || e.code === "Escape") {
    if (Game.state === "PLAYING") Game.togglePause();
  }
  if (e.code === "KeyM") {
    if (Game.state === "PLAYING") Game.returnToMap();
  }
  AudioFX.init();
});

addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Mobile touch input
const touch = { left: false, right: false, jump: false };
const IS_TOUCH = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

const heldLeft = () => keys["ArrowLeft"] || keys["KeyA"] || touch.left;
const heldRight = () => keys["ArrowRight"] || keys["KeyD"] || touch.right;
const heldJump = () => keys["Space"] || keys["ArrowUp"] || keys["KeyW"] || touch.jump;

function setupTouch() {
  const touchEl = document.getElementById("touch-controls");
  if (!touchEl) return;
  if (IS_TOUCH) touchEl.classList.remove("hidden");

  const bind = (id, on, off) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); AudioFX.init(); on(); });
    el.addEventListener("pointerup", (e) => { e.preventDefault(); off(); });
    el.addEventListener("pointercancel", (e) => { e.preventDefault(); off(); });
    el.addEventListener("pointerleave", (e) => { e.preventDefault(); off(); });
  };

  bind("tc-left", () => {
    touch.left = true;
    if (Game.state === "MAP") Game.mapMove(-1);
  }, () => (touch.left = false));

  bind("tc-right", () => {
    touch.right = true;
    if (Game.state === "MAP") Game.mapMove(1);
  }, () => (touch.right = false));

  bind("tc-jump", () => {
    touch.jump = true;
    jumpBuffered = 0.08;
    if (Game.state === "TITLE_SCREEN") Game.startFromTitle();
    else if (Game.state === "MAP") Game.mapEnterCurrent();
  }, () => (touch.jump = false));

  const rBtn = document.getElementById("tc-restart");
  if (rBtn) {
    rBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      AudioFX.init();
      if (Game.state === "PLAYING") Game.restartPlay(true);
      else if (Game.state === "MAP") Game.warpStage();
      else if (Game.state === "TITLE_SCREEN") Game.startFromTitle();
    });
  }
}

// Track mouse hover position for interactive buttons
cv.addEventListener("pointermove", (e) => {
  const rect = cv.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  mouseX = (e.clientX - rect.left) * scaleX;
  mouseY = (e.clientY - rect.top) * scaleY;

  if (Game.state === "TITLE_SCREEN") {
    const onStart = (mouseX >= 740 && mouseX <= 1180 && mouseY >= 680 && mouseY <= 756);
    cv.style.cursor = onStart ? "pointer" : "default";
  } else if (Game.isPaused) {
    const bw = 440, bh = 64;
    const bx = W / 2 - bw / 2;
    const onBtn = (mouseX >= bx && mouseX <= bx + bw && mouseY >= 420 && mouseY <= 660);
    cv.style.cursor = onBtn ? "pointer" : "default";
  } else if (Game.state === "MAP") {
    const onTitleBtn = (mouseX >= 1730 && mouseX <= 1880 && mouseY >= 24 && mouseY <= 78);
    const onWarp = (mouseX >= WARP_GATE.x && mouseX <= WARP_GATE.x + WARP_GATE.w && mouseY >= WARP_GATE.y && mouseY <= WARP_GATE.y + WARP_GATE.h);
    let onNode = false;
    for (const n of MAP_NODES) {
      const nw = n.isBoss ? 120 : 68;
      const nh = n.isBoss ? 130 : 78;
      if (Math.hypot(mouseX - (n.x + nw / 2), mouseY - (n.y + nh / 2)) < 52) { onNode = true; break; }
    }
    cv.style.cursor = (onTitleBtn || onWarp || onNode) ? "pointer" : "default";
  } else if (Game.state === "PLAYING") {
    const onBar = (mouseY <= 72 && mouseX <= 260);
    cv.style.cursor = onBar ? "pointer" : "default";
  } else {
    cv.style.cursor = "default";
  }
});

// Canvas click / pointer interaction
cv.addEventListener("pointerdown", (e) => {
  AudioFX.init();
  const rect = cv.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  // --- 1. TITLE SCREEN CLICKS ---
  if (Game.state === "TITLE_SCREEN") {
    Game.startFromTitle();
    return;
  }

  // --- 2. PAUSED OVERLAY CLICKS ---
  if (Game.isPaused) {
    const bw = 440, bh = 64;
    const bx = W / 2 - bw / 2;
    // Resume button
    if (mx >= bx && mx <= bx + bw && my >= 420 && my <= 484) {
      Game.isPaused = false;
      return;
    }
    // Overworld Map button
    if (mx >= bx && mx <= bx + bw && my >= 504 && my <= 568) {
      Game.returnToMap();
      return;
    }
    // Exit to Title button
    if (mx >= bx && mx <= bx + bw && my >= 588 && my <= 652) {
      Game.returnToTitle();
      return;
    }
    // Clicking elsewhere unpauses
    Game.isPaused = false;
    return;
  }

  // --- 3. MAP MODE CLICKS ---
  if (Game.state === "MAP") {
    // Check title button in top-right: x: 1730..1880, y: 24..78
    if (mx >= 1730 && mx <= 1880 && my >= 24 && my <= 78) {
      Game.returnToTitle();
      return;
    }

    // Check warp gate click
    if (mx >= WARP_GATE.x && mx <= WARP_GATE.x + WARP_GATE.w &&
        my >= WARP_GATE.y && my <= WARP_GATE.y + WARP_GATE.h) {
      Game.warpStage();
      return;
    }

    // Check tombstone click
    if (mx >= TOMBSTONE.x - 20 && mx <= TOMBSTONE.x + TOMBSTONE.w + 20 &&
        my >= TOMBSTONE.y - 20 && my <= TOMBSTONE.y + TOMBSTONE.h + 20) {
      AudioFX.death();
      return;
    }

    // Check node clicks
    for (let i = 0; i < MAP_NODES.length; i++) {
      const n = MAP_NODES[i];
      const nw = n.isBoss ? 120 : 68;
      const nh = n.isBoss ? 130 : 78;
      if (Math.hypot(mx - (n.x + nw / 2), my - (n.y + nh / 2)) < 52) {
        if (i === Game.mapSelectedNode) {
          Game.mapEnterCurrent();
        } else if (Game.isNodeUnlocked(i)) {
          Game.mapSelectNode(i);
        }
        return;
      }
    }
    return;
  }

  // --- 4. IN-GAME STATUS BAR CLICKS ---
  if (Game.state === "PLAYING") {
    // Pause button: x: 24..80, y: 14..58
    if (mx >= 24 && mx <= 80 && my >= 14 && my <= 58) {
      Game.togglePause();
      return;
    }
    // Restart button: x: 92..148, y: 14..58
    if (mx >= 92 && mx <= 148 && my >= 14 && my <= 58) {
      Game.restartPlay(true);
      return;
    }
    // Map button: x: 160..244, y: 14..58
    if (mx >= 160 && mx <= 244 && my >= 14 && my <= 58) {
      Game.returnToMap();
      return;
    }
  }
});

// ---------------------------------------------------------------- PARTICLES
const particles = [];
function spawnDeathPixels(x, y) {
  for (let i = 0; i < 20; i++) {
    const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
    const s = rand(100, 360);
    particles.push({
      x: x + rand(-4, 4),
      y: y + rand(-8, 8),
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      w: 4, h: 4,
      life: rand(0.35, 0.7),
      t: 0
    });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.t += dt;
    if (p.t > p.life) { particles.splice(i, 1); continue; }
    p.vy += 2600 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}
function drawParticles() {
  ctx.fillStyle = "#000000";
  for (const p of particles) {
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h);
  }
}

// ================================================================ TRAPS & OBJECTS
// Physical falling slabs, zero-seam floor integration, proximity triggers.

class CollapseFloor {
  constructor(rect, trigger, opts = {}) {
    this.rect = { ...rect };
    this.trigger = trigger;
    this.proximity = opts.proximity ?? 88;
    this.reset();
  }
  reset() {
    this.x = this.rect.x;
    this.y = this.rect.y;
    this.w = this.rect.w;
    this.h = this.rect.h;
    this.state = "idle";
    this.vy = 0;
  }
  update(dt, g) {
    if (this.state === "idle") {
      const p = g.player;
      const distToFront = this.x - (p.x + p.w);
      const isNearX = (distToFront <= this.proximity && p.x <= this.x + this.w);
      const isNearY = (p.y + p.h >= this.y - 60 && p.y <= this.y + this.h + 20);
      const hitTrigger = this.trigger ? aabb(p, this.trigger) : false;

      if ((isNearX && isNearY) || hitTrigger) {
        this.state = "fall";
        this.vy = 80;
        AudioFX.rumble();
      }
    } else if (this.state === "fall") {
      this.vy += 2200 * dt;
      this.y += this.vy * dt;
    }
  }
  solids() {
    return this.state === "idle" ? [R(this.x, this.y, this.w, this.h)] : [];
  }
  kills() { return []; }
  draw(theme) {
    if (this.y > H + 80) return;
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.x), Math.round(this.y), Math.round(this.w), Math.round(this.h));
  }
}

class PopSpikes {
  constructor(x, y, w, trigger, opts = {}) {
    this.x = x; this.y = y; this.w = w;
    this.dir = opts.dir ?? "up";
    this.size = opts.size ?? 24;
    this.delay = opts.delay ?? 0;
    this.trigger = trigger;
    this.proximity = opts.proximity ?? 85;
    this.period = opts.period ?? 0;
    this.phase = opts.phase ?? 0;
    this.holdOut = opts.holdOut ?? 0.8;
    this.speed = opts.speed ?? 22;
    this.reset();
  }
  reset() {
    this.out = 0;
    this.state = this.trigger || this.proximity ? "idle" : "cycle";
    this.t = -this.delay;
    this.ct = this.phase;
  }
  update(dt, g) {
    if (this.state === "idle") {
      const p = g.player;
      const distToFront = this.x - (p.x + p.w);
      const isNearX = (distToFront <= this.proximity && p.x <= this.x + this.w);
      const isNearY = (p.y + p.h >= this.y - 60 && p.y <= this.y + 40);
      const hitTrigger = this.trigger ? aabb(p, this.trigger) : false;

      if ((isNearX && isNearY) || hitTrigger) {
        this.state = "popping";
        this.t = -this.delay;
      }
    } else if (this.state === "popping") {
      this.t += dt;
      if (this.t >= 0) {
        if (this.out === 0) AudioFX.pop();
        this.out = clamp(this.out + this.speed * dt, 0, 1);
      }
    } else if (this.state === "cycle") {
      this.ct += dt;
      const cyc = this.ct % this.period;
      if (cyc < this.holdOut) {
        if (this.out < 0.1) AudioFX.pop();
        this.out = clamp(this.out + this.speed * dt, 0, 1);
      } else {
        this.out = clamp(this.out - this.speed * 0.7 * dt, 0, 1);
      }
    }
  }
  solids() { return []; }
  kills() {
    if (this.out < 0.35) return [];
    const h = this.size * this.out - 4;
    if (this.dir === "up") return [R(this.x + 3, this.y - h, this.w - 6, h)];
    return [R(this.x + 3, this.y, this.w - 6, h)];
  }
  draw(theme) {
    if (this.out <= 0.01) return;
    const h = Math.round(this.size * this.out);
    const n = Math.max(2, Math.round(this.w / 18));
    const sw = this.w / n;
    ctx.fillStyle = theme.gameGround;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const bx = this.x + i * sw;
      if (this.dir === "up") {
        ctx.moveTo(Math.round(bx), Math.round(this.y));
        ctx.lineTo(Math.round(bx + sw / 2), Math.round(this.y - h));
        ctx.lineTo(Math.round(bx + sw), Math.round(this.y));
      } else {
        ctx.moveTo(Math.round(bx), Math.round(this.y));
        ctx.lineTo(Math.round(bx + sw / 2), Math.round(this.y + h));
        ctx.lineTo(Math.round(bx + sw), Math.round(this.y));
      }
    }
    ctx.fill();
  }
}

class FallBlock {
  constructor(rect, trigger, opts = {}) {
    this.home = { ...rect };
    this.trigger = trigger;
    this.floorY = opts.floorY ?? 480;
    this.reset();
  }
  reset() { this.rect = { ...this.home }; this.state = "idle"; this.vy = 0; }
  update(dt, g) {
    if (this.state === "idle" && aabb(g.player, this.trigger)) {
      this.state = "fall";
      AudioFX.rumble();
    } else if (this.state === "fall") {
      this.vy += 3200 * dt;
      this.rect.y += this.vy * dt;
      if (this.rect.y + this.rect.h >= this.floorY) {
        this.rect.y = this.floorY - this.rect.h;
        this.state = "landed";
        AudioFX.slam();
        g.shake(5, 0.15);
      }
    }
  }
  solids() { return this.state === "fall" ? [] : [this.rect]; }
  kills() { return this.state === "fall" ? [R(this.rect.x + 2, this.rect.y + 4, this.rect.w - 4, this.rect.h - 4)] : []; }
  draw(theme) {
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.rect.x), Math.round(this.rect.y), Math.round(this.rect.w), Math.round(this.rect.h));
  }
}

class Crusher {
  constructor(x, w, opts = {}) {
    this.x = x; this.w = w;
    this.topY = opts.topY ?? 0;
    this.headH = opts.headH ?? 46;
    this.floorY = opts.floorY ?? 480;
    this.period = opts.period ?? 0;
    this.phase = opts.phase ?? 0;
    this.trigger = opts.trigger ?? null;
    this.slamSpeed = opts.slamSpeed ?? 1600;
    this.upSpeed = opts.upSpeed ?? 240;
    this.holdT = opts.hold ?? 0.32;
    this.reset();
  }
  reset() {
    this.y = this.topY;
    this.state = this.trigger ? "armed" : "waiting";
    this.t = this.phase;
    this.slammed = false;
  }
  update(dt, g) {
    const maxY = this.floorY - this.headH;
    if (this.state === "armed") {
      if (aabb(g.player, this.trigger)) { this.state = "slam"; }
    } else if (this.state === "waiting") {
      this.t += dt;
      if (this.t >= this.period) { this.t = 0; this.state = "slam"; }
    } else if (this.state === "slam") {
      this.y += this.slamSpeed * dt;
      if (this.y >= maxY) {
        this.y = maxY;
        this.state = "hold"; this.t = 0;
        if (!this.slammed) { AudioFX.slam(); g.shake(5, 0.15); }
        this.slammed = true;
      }
    } else if (this.state === "hold") {
      this.t += dt;
      if (this.t >= this.holdT) this.state = "rise";
    } else if (this.state === "rise") {
      this.y -= this.upSpeed * dt;
      if (this.y <= this.topY) {
        this.y = this.topY;
        this.slammed = false;
        this.state = this.trigger ? "spent" : "waiting";
        this.t = 0;
      }
    }
  }
  headRect() { return R(this.x, this.y, this.w, this.headH); }
  solids() { return [this.headRect()]; }
  kills() {
    if (this.state === "slam") return [R(this.x + 2, this.y + this.headH - 12, this.w - 4, 14)];
    return [];
  }
  draw(theme) {
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.x + this.w / 2 - 8), Math.round(this.topY), 16, Math.round(this.y - this.topY + 4));
    const h = this.headRect();
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(h.x), Math.round(h.y), Math.round(h.w), Math.round(h.h));
  }
}

class CrumblePlatform {
  constructor(rect, opts = {}) {
    this.home = { ...rect };
    this.delay = opts.delay ?? 0.35;
    this.reset();
  }
  reset() { this.rect = { ...this.home }; this.state = "idle"; this.t = 0; this.vy = 0; }
  update(dt, g) {
    if (this.state === "idle") {
      const p = g.player;
      const standing = p.grounded &&
        Math.abs(p.y + p.h - this.rect.y) < 3 &&
        p.x + p.w > this.rect.x && p.x < this.rect.x + this.rect.w;
      if (standing) { this.state = "wait"; this.t = 0; AudioFX.rumble(); }
    } else if (this.state === "wait") {
      this.t += dt;
      if (this.t >= this.delay) this.state = "fall";
    } else if (this.state === "fall") {
      this.vy += 2600 * dt;
      this.rect.y += this.vy * dt;
    }
  }
  solids() { return this.state === "fall" ? [] : [this.rect]; }
  kills() { return []; }
  draw(theme) {
    if (this.rect.y > H + 40) return;
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.rect.x), Math.round(this.rect.y), Math.round(this.rect.w), Math.round(this.rect.h));
  }
}

class MovingPlatform {
  constructor(rect, opts = {}) {
    this.w = rect.w; this.h = rect.h;
    this.ax = rect.x; this.ay = rect.y;
    this.bx = opts.toX ?? rect.x; this.by = opts.toY ?? rect.y;
    this.speed = opts.speed ?? 85;
    this.phase = opts.phase ?? 0;
    this.pause = opts.pause ?? 0;
    this.reset();
  }
  reset() {
    const dist = Math.hypot(this.bx - this.ax, this.by - this.ay) || 1;
    this.travel = dist / this.speed;
    this.cycle = this.travel * 2 + this.pause * 2;
    this.t = this.phase * this.cycle;
    const p = this._posAt(this.t);
    this.px = p.x; this.py = p.y; this.dx = 0; this.dy = 0;
  }
  _posAt(t) {
    let u = ((t % this.cycle) + this.cycle) % this.cycle;
    let f;
    if (u < this.travel) f = u / this.travel;
    else if (u < this.travel + this.pause) f = 1;
    else if (u < this.travel * 2 + this.pause) f = 1 - (u - this.travel - this.pause) / this.travel;
    else f = 0;
    const e = easeInOut(f);
    return { x: lerp(this.ax, this.bx, e), y: lerp(this.ay, this.by, e) };
  }
  update(dt, g) {
    const prevx = this.px, prevy = this.py;
    this.t += dt;
    const p = this._posAt(this.t);
    this.px = p.x; this.py = p.y;
    this.dx = this.px - prevx; this.dy = this.py - prevy;
    const pl = g.player;
    const onTop = pl.vy >= -1 &&
      pl.x + pl.w > prevx + 2 && pl.x < prevx + this.w - 2 &&
      Math.abs((pl.y + pl.h) - prevy) <= 8;
    if (onTop) { pl.x += this.dx; pl.y += this.dy; }
  }
  solids() { return [R(this.px, this.py, this.w, this.h)]; }
  kills() { return []; }
  draw(theme) {
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.px), Math.round(this.py), Math.round(this.w), Math.round(this.h));
  }
}

class Conveyor {
  constructor(rect, opts = {}) {
    this.rect = { ...rect };
    this.dir = opts.dir ?? 1;
    this.force = opts.force ?? 160;
    this.reset();
  }
  reset() { this.t = 0; }
  update(dt, g) {
    this.t += dt * this.dir;
    const p = g.player, r = this.rect;
    const standing = p.grounded && Math.abs((p.y + p.h) - r.y) < 4 &&
      p.x + p.w > r.x && p.x < r.x + r.w;
    if (standing) p.x += this.dir * this.force * dt;
  }
  solids() { return [this.rect]; }
  kills() { return []; }
  draw(theme) {
    const r = this.rect;
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h));
    ctx.save();
    ctx.beginPath();
    ctx.rect(Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h));
    ctx.clip();
    ctx.strokeStyle = theme.gameSky;
    ctx.lineWidth = 2.5;
    const off = (this.t * 60) % 30;
    for (let x = r.x - 30 + off; x < r.x + r.w; x += 30) {
      ctx.beginPath();
      if (this.dir > 0) {
        ctx.moveTo(x, r.y + 6); ctx.lineTo(x + 8, r.y + r.h / 2); ctx.lineTo(x, r.y + r.h - 6);
      } else {
        ctx.moveTo(x + 8, r.y + 6); ctx.lineTo(x, r.y + r.h / 2); ctx.lineTo(x + 8, r.y + r.h - 6);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

class Spring {
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y; this.w = opts.w ?? 50; this.h = opts.h ?? 14;
    this.power = opts.power ?? -980;
    this.reset();
  }
  reset() { this.c = 0; }
  update(dt, g) {
    this.c = Math.max(0, this.c - dt * 5);
    const p = g.player;
    const overX = p.x + p.w > this.x + 3 && p.x < this.x + this.w - 3;
    const bottom = p.y + p.h;
    if (overX && p.vy >= 0 && bottom >= this.y - 6 && bottom <= this.y + 40) {
      p.y = this.y - p.h;
      p.vy = this.power;
      p.grounded = false;
      this.c = 1;
      AudioFX.bounce();
    }
  }
  solids() { return []; }
  kills() { return []; }
  draw(theme) {
    const comp = this.c * 6;
    const top = this.y + comp;
    ctx.save();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const coils = 3;
    for (let i = 0; i <= coils; i++) {
      const yy = lerp(this.y + this.h + 4, top + 4, i / coils);
      const xx = this.x + (i % 2 === 0 ? 6 : this.w - 6);
      if (i === 0) ctx.moveTo(this.x + 6, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
    ctx.fillStyle = theme.gameGround;
    ctx.fillRect(Math.round(this.x), Math.round(top), Math.round(this.w), 8);
    ctx.restore();
  }
}

class Saw {
  constructor(path, opts = {}) {
    this.path = path.map((p) => ({ ...p }));
    this.r = opts.r ?? 22;
    this.speed = opts.speed ?? 140;
    this.reset();
  }
  reset() {
    this.seg = 0; this.dir = 1; this.f = 0; this.spin = 0;
    this.x = this.path[0].x; this.y = this.path[0].y;
  }
  update(dt) {
    this.spin += dt * 10;
    if (this.path.length < 2) return;
    const a = this.path[this.seg];
    const b = this.path[this.seg + this.dir];
    if (!b) { this.dir *= -1; return; }
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    this.f += (this.speed * dt) / len;
    while (this.f >= 1) {
      this.f -= 1;
      this.seg += this.dir;
      if (this.seg + this.dir < 0 || this.seg + this.dir >= this.path.length) {
        this.dir *= -1;
      }
    }
    const a2 = this.path[this.seg], b2 = this.path[this.seg + this.dir] || a2;
    this.x = lerp(a2.x, b2.x, this.f);
    this.y = lerp(a2.y, b2.y, this.f);
  }
  solids() { return []; }
  kills() { return [R(this.x - this.r * 0.7, this.y - this.r * 0.7, this.r * 1.4, this.r * 1.4)]; }
  draw() {
    ctx.save();
    ctx.translate(Math.round(this.x), Math.round(this.y));
    ctx.rotate(this.spin);
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    const teeth = 8;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.5) / teeth) * Math.PI * 2;
      ctx.lineTo(Math.cos(a0) * this.r, Math.sin(a0) * this.r);
      ctx.lineTo(Math.cos(a1) * this.r * 0.68, Math.sin(a1) * this.r * 0.68);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// ---------------------------------------------------------------- Exit Door Component
function drawDoorShape(x, y, w, h, theme) {
  const r = w / 2;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(Math.round(x), Math.round(y + h));
  ctx.lineTo(Math.round(x), Math.round(y + r));
  ctx.arc(Math.round(x + r), Math.round(y + r), r, Math.PI, 0, false);
  ctx.lineTo(Math.round(x + w), Math.round(y + h));
  ctx.closePath();
  ctx.fillStyle = theme ? (theme.gameDoor || "#F8FAFC") : "#F8FAFC";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();
}

class Door {
  constructor(positions, opts = {}) {
    this.positions = positions.map((p) => ({ ...p }));
    this.fleeDist = opts.fleeDist ?? 110;
    this.w = 38; this.h = 64;
    this.reset();
  }
  reset() { this.i = 0; }
  get pos() { return this.positions[this.i]; }
  update(dt, g) {
    if (this.i < this.positions.length - 1) {
      const p = g.player;
      const dx = (p.x + p.w / 2) - (this.pos.x + this.w / 2);
      const dy = (p.y + p.h / 2) - (this.pos.y + this.h / 2);
      if (Math.hypot(dx, dy) < this.fleeDist) {
        this.i++;
        AudioFX.poof();
      }
    }
  }
  playerWins(p) {
    const r = R(this.pos.x + 4, this.pos.y + 4, this.w - 8, this.h - 4);
    return this.i === this.positions.length - 1 && aabb(p, r);
  }
  draw(theme) {
    drawDoorShape(this.pos.x, this.pos.y, this.w, this.h, theme);
  }
}

// ---------------------------------------------------------------- MICRO-STAGE GENERATOR (4-Play Architecture)
const floorSeg = (x0, x1, y = 480) => R(x0, y, x1 - x0, H - y);
const wallL = () => R(-40, -200, 80, H + 400);
const wallR = () => R(920, -200, 80, H + 400);
const roof = (h = 48) => R(0, 0, W, h);

function buildMicroPlay(stageIdx, levelIdx, playIdx) {
  const isBossLevel = (levelIdx === 9);

  // --- SPECIAL BOSS LEVEL 10 ---
  if (isBossLevel) {
    if (playIdx === 0) {
      // 10.1: Rapid multi-trap gauntlet: floor drops while ceiling blocks collapse
      return {
        spawn: { x: 55, y: 448 },
        door: new Door([{ x: 880, y: 416 }]),
        solids: [floorSeg(0, 320), floorSeg(460, 640), floorSeg(780, 960), roof(48), wallL(), wallR()],
        traps: [
          new CollapseFloor(R(320, 480, 140, 60)),
          new CollapseFloor(R(640, 480, 140, 60)),
          new FallBlock(R(490, 48, 70, 44), R(470, 200, 100, 280)),
          new FallBlock(R(800, 48, 70, 44), R(780, 200, 50, 280)),
        ],
      };
    } else if (playIdx === 1) {
      // 10.2: Dual crushers pounding fast over crumbling platforms
      return {
        spawn: { x: 60, y: 448 },
        door: new Door([{ x: 880, y: 416 }]),
        solids: [floorSeg(0, 220), floorSeg(780, 960), roof(48), wallL(), wallR()],
        traps: [
          new CrumblePlatform(R(260, 430, 110, 16), { delay: 0.28 }),
          new Crusher(380, 96, { topY: 48, period: 1.6, phase: 0.0 }),
          new CrumblePlatform(R(480, 410, 110, 16), { delay: 0.28 }),
          new Crusher(600, 96, { topY: 48, period: 1.6, phase: 0.8 }),
          new CrumblePlatform(R(700, 430, 80, 16), { delay: 0.24 }),
          new PopSpikes(810, 480, 60, null, { proximity: 80 }),
        ],
      };
    } else if (playIdx === 2) {
      // 10.3: High-speed saw blades weaving with moving platforms and drop slabs
      return {
        spawn: { x: 60, y: 448 },
        door: new Door([{ x: 880, y: 416 }]),
        solids: [floorSeg(0, 250), floorSeg(760, 960), roof(48), wallL(), wallR()],
        traps: [
          new MovingPlatform(R(280, 440, 110, 16), { toX: 440, speed: 120, pause: 0.3 }),
          new Saw([{ x: 440, y: 220 }, { x: 440, y: 420 }], { r: 24, speed: 220 }),
          new MovingPlatform(R(480, 400, 110, 16), { toX: 660, speed: 120, pause: 0.3, phase: 0.5 }),
          new Saw([{ x: 640, y: 150 }, { x: 640, y: 380 }], { r: 24, speed: 200 }),
          new PopSpikes(810, 480, 60, null, { proximity: 80 }),
        ],
      };
    } else {
      // 10.4: FINAL BOSS TROLL PLAY: The horned exit door itself actively runs away across breaking floors!
      return {
        spawn: { x: 55, y: 448 },
        door: new Door(
          [
            { x: 860, y: 416 },
            { x: 480, y: 416 },
            { x: 120, y: 240 },
            { x: 870, y: 220 },
          ],
          { fleeDist: 115 }
        ),
        solids: [
          floorSeg(0, 300), floorSeg(450, 660), floorSeg(800, 960),
          R(40, 300, 200, 16), R(740, 280, 180, 16), roof(48), wallL(), wallR()
        ],
        traps: [
          new CollapseFloor(R(300, 480, 150, 60)),
          new CollapseFloor(R(660, 480, 140, 60)),
          new FallBlock(R(500, 48, 80, 42), R(480, 200, 60, 280)),
          new Spring(180, 480, { power: -1100 }),
          new PopSpikes(810, 280, 60, null, { proximity: 80 }),
        ],
      };
    }
  }

  // --- STANDARD LEVELS 1 to 9 (4 Plays Each) ---
  const trapGaps = [
    [R(400, 480, 100, 60)],
    [R(300, 480, 110, 60), R(550, 480, 110, 60)],
    [R(360, 480, 140, 60)],
    [R(250, 480, 100, 60), R(600, 480, 120, 60)],
    [R(420, 480, 120, 60)],
  ];

  if (playIdx === 0) {
    const gap = trapGaps[levelIdx % trapGaps.length][0];
    return {
      spawn: { x: 60, y: 448 },
      door: new Door([{ x: 876, y: 416 }]),
      solids: [floorSeg(0, gap.x), floorSeg(gap.x + gap.w, 960), wallL(), wallR()],
      traps: [
        new CollapseFloor(gap),
        new PopSpikes(780, 480, 70, null, { proximity: 80 }),
      ],
    };
  } else if (playIdx === 1) {
    const midX = 350 + (levelIdx % 4) * 40;
    return {
      spawn: { x: 60, y: 448 },
      door: new Door([{ x: 880, y: 416 }]),
      solids: [floorSeg(0, 240), floorSeg(720, 960), wallL(), wallR()],
      traps: [
        new CrumblePlatform(R(290, 420, 100, 16), { delay: 0.32 }),
        new MovingPlatform(R(midX, 420, 100, 16), { toX: midX + 160, speed: 90, pause: 0.4 }),
        new FallBlock(R(780, 48, 70, 42), R(750, 200, 50, 280)),
        new PopSpikes(790, 480, 64, null, { proximity: 80 }),
      ],
    };
  } else if (playIdx === 2) {
    if (levelIdx % 2 === 0) {
      return {
        spawn: { x: 60, y: 448 },
        door: new Door([{ x: 880, y: 416 }]),
        solids: [floorSeg(0, 960), wallL(), wallR()],
        traps: [
          new PopSpikes(260, 480, 64, null, { period: 1.6, phase: 0.0, holdOut: 0.7 }),
          new PopSpikes(420, 480, 64, null, { period: 1.6, phase: 0.4, holdOut: 0.7 }),
          new PopSpikes(580, 480, 64, null, { period: 1.6, phase: 0.8, holdOut: 0.7 }),
          new PopSpikes(790, 480, 64, null, { proximity: 80 }),
        ],
      };
    } else {
      return {
        spawn: { x: 120, y: 448 },
        door: new Door([{ x: 880, y: 416 }]),
        solids: [floorSeg(80, 960), wallL(), wallR()],
        traps: [
          new Conveyor(R(260, 480, 360, 60), { dir: -1, force: 160 }),
          new Crusher(500, 90, { topY: 48, period: 1.7, phase: 0.3 }),
          new PopSpikes(800, 480, 66, null, { proximity: 80 }),
        ],
      };
    }
  } else {
    return {
      spawn: { x: 60, y: 448 },
      door: new Door(
        [
          { x: 870, y: 416 },
          { x: 500, y: 416 },
          { x: 860, y: 320 },
        ],
        { fleeDist: 100 }
      ),
      solids: [floorSeg(0, 420), floorSeg(580, 960), R(760, 384, 160, 16), wallL(), wallR()],
      traps: [
        new CollapseFloor(R(420, 480, 160, 60)),
        new FallBlock(R(640, 48, 70, 42), R(610, 200, 60, 280)),
        new PopSpikes(800, 480, 64, null, { proximity: 80 }),
      ],
    };
  }
}

// ================================================================ MAIN GAME STATE MACHINE
const Game = {
  state: "TITLE_SCREEN", // "TITLE_SCREEN", "MAP", "PLAYING", "PLAY_WIN", "LEVEL_WIN", "DEAD"
  currentStage: 0, // 0: Trust, 1: Trusting, 2: Trusted
  selectedLevel: 0, // 0..9
  currentPlay: 0, // 0..3 (4-play loop)
  level: null,
  player: null,
  deaths: 0,
  isPaused: false,
  shakeAmt: 0,
  shakeT: 0,
  time: 0,

  // Map state
  mapSelectedNode: 0,
  mapAvatarX: MAP_NODES[0].x,
  mapAvatarY: MAP_NODES[0].y,
  mapMoving: false,

  init() {
    this.loadProgress();
    this.mapSelectedNode = 0;
    this.mapAvatarX = MAP_NODES[0].x;
    this.mapAvatarY = MAP_NODES[0].y;
    // Initial boot state is TITLE_SCREEN
    this.state = "TITLE_SCREEN";
  },

  loadProgress() {
    try {
      this.deaths = parseInt(localStorage.getItem("ld_total_deaths")) || 0;
      this.currentStage = parseInt(localStorage.getItem("ld_current_stage")) || 0;
    } catch {}
  },

  saveProgress() {
    try {
      localStorage.setItem("ld_total_deaths", this.deaths);
      localStorage.setItem("ld_current_stage", this.currentStage);
    } catch {}
  },

  isNodeUnlocked(nodeIdx) {
    if (nodeIdx === 0) return true;
    try {
      return localStorage.getItem(`ld_s${this.currentStage}_n${nodeIdx}_unlocked`) === "true";
    } catch { return false; }
  },

  unlockNode(nodeIdx) {
    try {
      localStorage.setItem(`ld_s${this.currentStage}_n${nodeIdx}_unlocked`, "true");
    } catch {}
  },

  isLevelCleared(nodeIdx) {
    try {
      return localStorage.getItem(`ld_s${this.currentStage}_n${nodeIdx}_cleared`) === "true";
    } catch { return false; }
  },

  markLevelCleared(nodeIdx) {
    try {
      localStorage.setItem(`ld_s${this.currentStage}_n${nodeIdx}_cleared`, "true");
      this.unlockNode(nodeIdx + 1);
    } catch {}
  },

  shake(amt, t) {
    this.shakeAmt = Math.max(this.shakeAmt, amt);
    this.shakeT = Math.max(this.shakeT, t);
  },

  togglePause() {
    this.isPaused = !this.isPaused;
  },

  // ---------------------------------------------------------------- Title Screen Flow
  startFromTitle() {
    AudioFX.mapEnter();
    this.state = "MAP";
  },

  returnToTitle() {
    AudioFX.mapMove();
    this.state = "TITLE_SCREEN";
    this.isPaused = false;
  },

  // ---------------------------------------------------------------- Overworld Map Logic
  mapMove(dir) {
    const next = this.mapSelectedNode + dir;
    if (next < 0 || next >= MAP_NODES.length) return;
    if (dir > 0 && !this.isNodeUnlocked(next)) return;
    this.mapSelectedNode = next;
    AudioFX.mapMove();
  },

  mapSelectNode(idx) {
    if (this.isNodeUnlocked(idx)) {
      this.mapSelectedNode = idx;
      AudioFX.mapMove();
    }
  },

  mapEnterCurrent() {
    if (!this.isNodeUnlocked(this.mapSelectedNode)) return;
    AudioFX.mapEnter();
    this.startLevel(this.mapSelectedNode);
  },

  warpStage() {
    this.currentStage = (this.currentStage + 1) % STAGES.length;
    this.mapSelectedNode = 0;
    this.mapAvatarX = MAP_NODES[0].x;
    this.mapAvatarY = MAP_NODES[0].y;
    this.saveProgress();
    AudioFX.warp();
  },

  returnToMap() {
    this.state = "MAP";
    this.isPaused = false;
  },

  // ---------------------------------------------------------------- 4-Play Level Progression
  startLevel(nodeIdx) {
    this.selectedLevel = nodeIdx;
    this.currentPlay = 0;
    this.loadPlay(this.currentPlay);
    this.state = "PLAYING";
  },

  loadPlay(playIdx) {
    this.currentPlay = playIdx;
    this.level = buildMicroPlay(this.currentStage, this.selectedLevel, playIdx);
    this.spawnPlayer();
    particles.length = 0;
  },

  spawnPlayer() {
    const s = this.level.spawn;
    this.player = {
      x: s.x,
      y: s.y,
      w: 18,
      h: 32,
      vx: 0,
      vy: 0,
      grounded: false,
      coyote: 0,
      face: 1,
      runAnimTime: 0,
    };
  },

  restartPlay(manual = false) {
    if (manual) {
      this.deaths++;
      this.saveProgress();
    }
    this.loadPlay(this.currentPlay);
    this.state = "PLAYING";
  },

  die(x, y) {
    if (this.state !== "PLAYING") return;
    this.deaths++;
    this.saveProgress();
    AudioFX.death();
    spawnDeathPixels(x, y);
    this.shake(5, 0.12);
    this.state = "DEAD";
    this.deathT = 0;
  },

  winPlay() {
    if (this.state !== "PLAYING") return;

    if (this.currentPlay < 3) {
      // Cleared one play -> quick 100ms transition to next play
      this.state = "PLAY_WIN";
      this.winT = 0;
      AudioFX.winPlay();
    } else {
      // Cleared all 4 plays -> Level Complete!
      this.state = "LEVEL_WIN";
      this.winT = 0;
      this.markLevelCleared(this.selectedLevel);
      AudioFX.winLevel();
    }
  },

  collectSolids() {
    const out = [...this.level.solids];
    for (const t of this.level.traps) out.push(...t.solids());
    return out;
  },

  // ---------------------------------------------------------------- Game Loop Update
  update(dt) {
    this.time += dt;
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.shakeT <= 0) this.shakeAmt = 0;
    updateParticles(dt);

    if (this.state === "TITLE_SCREEN") {
      return;
    }

    if (this.state === "MAP") {
      this.updateMap(dt);
      return;
    }

    if (this.isPaused) return;

    if (this.state === "PLAYING") {
      this.updatePlay(dt);
    } else if (this.state === "DEAD") {
      this.deathT += dt;
      for (const t of this.level.traps) t.update(dt, this);
      if (this.deathT > 0.08) {
        this.restartPlay(false);
      }
    } else if (this.state === "PLAY_WIN") {
      this.winT += dt;
      if (this.winT > 0.10) {
        this.loadPlay(this.currentPlay + 1);
        this.state = "PLAYING";
      }
    } else if (this.state === "LEVEL_WIN") {
      this.winT += dt;
      if (this.winT > 0.65) {
        this.returnToMap();
        if (this.selectedLevel + 1 < MAP_NODES.length) {
          this.mapSelectedNode = this.selectedLevel + 1;
        }
      }
    }
  },

  updateMap(dt) {
    const target = MAP_NODES[this.mapSelectedNode];
    const dx = target.x - this.mapAvatarX;
    const dy = target.y - this.mapAvatarY;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      this.mapMoving = true;
      const speed = 640;
      this.mapAvatarX += (dx / dist) * Math.min(speed * dt, dist);
      this.mapAvatarY += (dy / dist) * Math.min(speed * dt, dist);
    } else {
      this.mapAvatarX = target.x;
      this.mapAvatarY = target.y;
      this.mapMoving = false;
    }
  },

  updatePlay(dt) {
    const p = this.player;
    for (const t of this.level.traps) t.update(dt, this);
    this.level.door.update(dt, this);

    let dir = 0;
    if (heldLeft()) dir -= 1;
    if (heldRight()) dir += 1;
    if (dir !== 0) p.face = dir;

    p.vx = dir * 280;
    if (Math.abs(p.vx) > 20 && p.grounded) {
      p.runAnimTime += dt;
    } else {
      p.runAnimTime = 0;
    }

    jumpBuffered = Math.max(0, jumpBuffered - dt);
    p.coyote = p.grounded ? 0.08 : Math.max(0, p.coyote - dt);

    if (jumpBuffered > 0 && p.coyote > 0) {
      p.vy = -660;
      p.grounded = false;
      p.coyote = 0;
      p.jumping = true;
      jumpBuffered = 0;
      AudioFX.jump();
    }

    if (p.vy >= 0) p.jumping = false;
    if (!heldJump() && p.jumping && p.vy < -220) {
      p.vy = -220;
      p.jumping = false;
    }

    p.vy = Math.min(p.vy + 2600 * dt, 1100);

    const solids = this.collectSolids();

    // X collision
    p.x += p.vx * dt;
    for (const s of solids) {
      if (aabb(p, s)) {
        if (p.vx > 0) p.x = s.x - p.w;
        else if (p.vx < 0) p.x = s.x + s.w;
        p.vx = 0;
      }
    }

    // Y collision
    p.y += p.vy * dt;
    p.grounded = false;
    for (const s of solids) {
      if (aabb(p, s)) {
        if (p.vy > 0) {
          p.y = s.y - p.h;
          p.grounded = true;
          p.vy = 0;
        } else if (p.vy < 0) {
          p.y = s.y + s.h;
          p.vy = 0;
        }
      }
    }

    // Crush detection
    for (const s of solids) {
      if (aabb(R(p.x + 3, p.y + 3, p.w - 6, p.h - 6), s)) {
        this.die(p.x + p.w / 2, p.y + p.h / 2);
        return;
      }
    }

    // Trap kill detection
    for (const t of this.level.traps) {
      for (const k of t.kills()) {
        if (aabb(p, k)) {
          this.die(p.x + p.w / 2, p.y + p.h / 2);
          return;
        }
      }
    }

    // Pit fall detection
    if (p.y > H - 10) {
      this.die(p.x + p.w / 2, H - 20);
      return;
    }

    // Door reached
    if (this.level.door.playerWins(p)) {
      this.winPlay();
    }
  },

  // ============================================================== RENDERING
  draw() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);

    if (this.shakeAmt > 0) {
      ctx.translate(
        Math.round(rand(-this.shakeAmt, this.shakeAmt)),
        Math.round(rand(-this.shakeAmt, this.shakeAmt))
      );
    }

    if (this.state === "TITLE_SCREEN") {
      this.drawTitleScreen();
    } else {
      const stage = STAGES[this.currentStage];
      if (this.state === "MAP") {
        this.drawOverworldMap(stage);
      } else {
        this.drawGamePlay(stage);
      }
    }

    ctx.restore();
  },

  // ---------------------------------------------------------------- TITLE SCREEN RENDERER (Neo-Retro HD)
  drawTitleScreen() {
    // 1. Cosmic Void Backdrop with 3 Parallax Layers
    drawCosmicBackdrop(STAGES[0], this.time);

    // Ambient floating glowing dust particles drifting slowly upward
    ctx.fillStyle = "#FFD166";
    for (let i = 0; i < 40; i++) {
      const px = (i * 97 + this.time * 16) % W;
      const py = (H - ((i * 53 + this.time * 28) % H));
      const alpha = 0.2 + 0.3 * Math.sin(this.time * 2 + i);
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.round(px), Math.round(py), 3, 3);
    }
    ctx.globalAlpha = 1.0;

    // 2. TITLE LOGO: Chunky, layered 3D pixel typography with orange-to-gold gradient
    ctx.save();
    const tx = W / 2, ty = 210;

    // Layer 1: Dark 6px hard drop-shadow
    ctx.fillStyle = "#100301";
    ctx.font = "bold 64px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("TRUST ISSUES", tx + 6, ty + 10);

    // Layer 2: Extruded 3D bevel layers
    ctx.fillStyle = "#6B1E05";
    ctx.fillText("TRUST ISSUES", tx + 4, ty + 6);
    ctx.fillStyle = "#A63A0A";
    ctx.fillText("TRUST ISSUES", tx + 2, ty + 3);

    // Layer 3: Vertical gradient face from warm orange to radiant gold
    const titleGrad = ctx.createLinearGradient(0, ty - 60, 0, ty + 10);
    titleGrad.addColorStop(0, "#FF4500");
    titleGrad.addColorStop(0.5, "#FF8C00");
    titleGrad.addColorStop(1, "#FFD166");
    ctx.fillStyle = titleGrad;
    ctx.fillText("TRUST ISSUES", tx, ty);

    // Specular glints twinkling across letters
    const glintPulse = Math.sin(this.time * 5);
    if (glintPulse > 0.6) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(tx - 280, ty - 42, 6, 6);
      ctx.fillRect(tx + 190, ty - 42, 6, 6);
    }

    // Subtitle Badge
    ctx.fillStyle = "#FFE4A0";
    ctx.font = "bold 15px 'Press Start 2P', monospace";
    ctx.fillText("★ A GAME ABOUT TRUST ★", tx, ty + 56);

    // Playful Tagline
    ctx.fillStyle = "#FF8080";
    ctx.font = "14px 'Silkscreen', monospace";
    ctx.fillText("Just walk to the door :)", tx, ty + 88);
    ctx.restore();

    // 3. ANIMATED MINI-DIORAMA IN THE CENTER
    // Floating rock island slab
    const slabX = 660, slabY = 500, slabW = 600, slabH = 64;

    // Island shadow drop into void
    ctx.fillStyle = "#1A0602";
    ctx.fillRect(slabX + 10, slabY + 36, slabW - 20, 48);
    // Stalactites hanging into the void
    for (let st = 0; st < 6; st++) {
      const sx = slabX + 60 + st * 90;
      ctx.beginPath();
      ctx.moveTo(sx, slabY + 60);
      ctx.lineTo(sx + 14, slabY + 95);
      ctx.lineTo(sx + 28, slabY + 60);
      ctx.closePath();
      ctx.fill();
    }

    // Vertical cliff facade
    ctx.fillStyle = "#5A200B";
    ctx.fillRect(slabX, slabY + 16, slabW, slabH - 16);

    // Dark dirt rim & grassy top
    ctx.fillStyle = "#2B1004";
    ctx.fillRect(slabX - 4, slabY + 6, slabW + 8, 14);
    ctx.fillStyle = "#9B6800";
    ctx.fillRect(slabX - 6, slabY, slabW + 12, 12);
    ctx.fillStyle = "#B87C00";
    ctx.fillRect(slabX - 6, slabY, slabW + 12, 4);

    // RIGHT SIDE OF SLAB: Arched Stone Entrance Door
    const doorX = slabX + slabW - 120, doorY = slabY - 88, doorW = 64, doorH = 88;
    ctx.fillStyle = "#334155";
    ctx.fillRect(doorX, doorY + 20, doorW, doorH - 20);
    ctx.beginPath();
    ctx.arc(doorX + doorW / 2, doorY + 20, doorW / 2, Math.PI, 0, false);
    ctx.fill();
    const dGrad = ctx.createLinearGradient(doorX, doorY, doorX, doorY + doorH);
    dGrad.addColorStop(0, "#FEF08A");
    dGrad.addColorStop(0.5, "#F59E0B");
    dGrad.addColorStop(1, "#1E293B");
    ctx.fillStyle = dGrad;
    ctx.fillRect(doorX + 8, doorY + 24, doorW - 16, doorH - 24);
    ctx.beginPath();
    ctx.arc(doorX + doorW / 2, doorY + 24, (doorW - 16) / 2, Math.PI, 0, false);
    ctx.fill();

    // CENTER OF SLAB: Cozy Animated Campfire
    const fireX = slabX + 270, fireY = slabY;
    const fireGlow = ctx.createRadialGradient(fireX, fireY - 14, 4, fireX, fireY - 14, 70);
    fireGlow.addColorStop(0, "rgba(255, 174, 52, 0.45)");
    fireGlow.addColorStop(0.5, "rgba(239, 68, 68, 0.2)");
    fireGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(fireX, fireY - 14, 70, 0, Math.PI * 2);
    ctx.fill();

    // Campfire logs
    ctx.fillStyle = "#2D150B";
    ctx.fillRect(fireX - 16, fireY - 4, 32, 6);
    ctx.fillRect(fireX - 12, fireY - 8, 24, 5);

    // Animated 3-frame pixel fire
    const fPhase = Math.floor(this.time * 9) % 3;
    ctx.fillStyle = "#DC2626";
    ctx.fillRect(fireX - 10, fireY - 22, 20, 18);
    ctx.fillStyle = "#F97316";
    ctx.fillRect(fireX - 7, fireY - 26 - (fPhase === 1 ? 4 : 0), 14, 20);
    ctx.fillStyle = "#FDE047";
    ctx.fillRect(fireX - 4, fireY - 20 - (fPhase === 2 ? 3 : 0), 8, 14);

    // Rising fire sparks/embers
    ctx.fillStyle = "#FDE047";
    const sparkY1 = (fireY - 28 - ((this.time * 50) % 35));
    const sparkY2 = (fireY - 28 - (((this.time * 50) + 18) % 35));
    ctx.fillRect(fireX - 4 + Math.sin(this.time * 6) * 6, sparkY1, 3, 3);
    ctx.fillRect(fireX + 3 + Math.cos(this.time * 8) * 6, sparkY2, 2, 2);

    // BESIDE CAMPFIRE: 8-bit Black Stickman Silhouette Sitting & Warming Hands
    const smX = slabX + 170, smY = slabY;
    const breath = Math.sin(this.time * 4) > 0 ? 1 : 0;
    ctx.fillStyle = "#000000";
    ctx.fillRect(smX - 6, smY - 40 - breath, 12, 12);
    ctx.fillRect(smX - 8, smY - 28 - breath, 16, 20);
    ctx.fillRect(smX, smY - 8, 22, 8);
    ctx.fillRect(smX + 8, smY - 20 - breath, 16, 5);

    // 4. START BUTTON: Glowing Arcade Button with Pulsating Border & Flashing Arrows
    const btnX = 740, btnY = 680, btnW = 440, btnH = 74;
    const isHover = (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH);
    const depress = isHover ? 3 : 0;

    const pulse = 0.5 + 0.5 * Math.sin(this.time * 6);
    ctx.save();
    ctx.shadowColor = `rgba(255, 209, 102, ${0.4 + 0.5 * pulse})`;
    ctx.shadowBlur = 18;

    ctx.fillStyle = "#120224";
    ctx.fillRect(btnX, btnY + 8, btnW, btnH);

    ctx.fillStyle = isHover ? "#D97706" : "#B45309";
    ctx.fillRect(btnX, btnY + depress, btnW, btnH - depress);

    ctx.fillStyle = isHover ? "#FDE047" : "#FBBF24";
    ctx.fillRect(btnX, btnY + depress, btnW, 4);
    ctx.fillRect(btnX, btnY + depress, 4, btnH - depress);

    ctx.strokeStyle = `rgba(255, 209, 102, ${0.6 + 0.4 * pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(btnX, btnY + depress, btnW, btnH - depress);
    ctx.restore();

    // Flashing Animated Pixel Arrows: ► START GAME ◄
    const arrowBob = Math.sin(this.time * 8) * 6;
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("START GAME", W / 2, btnY + 44 + depress);

    // Left arrow
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    const laX = btnX + 44 - arrowBob;
    ctx.moveTo(laX + 12, btnY + btnH / 2 + depress);
    ctx.lineTo(laX, btnY + btnH / 2 - 10 + depress);
    ctx.lineTo(laX, btnY + btnH / 2 + 10 + depress);
    ctx.closePath();
    ctx.fill();

    // Right arrow
    ctx.beginPath();
    const raX = btnX + btnW - 44 + arrowBob;
    ctx.moveTo(raX - 12, btnY + btnH / 2 + depress);
    ctx.lineTo(raX, btnY + btnH / 2 - 10 + depress);
    ctx.lineTo(raX, btnY + btnH / 2 + 10 + depress);
    ctx.closePath();
    ctx.fill();

    // Flashing prompt beneath button
    const flashAlpha = 0.45 + 0.55 * Math.sin(this.time * 4);
    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText("OR PRESS SPACE / ENTER", W / 2, btnY + 118);
  },

  // ---------------------------------------------------------------- OVERWORLD MAP RENDERER (Neo-Retro HD)
  drawOverworldMap(stage) {
    // 1. Cosmic Void Backdrop with 3 Parallax Layers
    drawCosmicBackdrop(stage, this.time);

    // 2. Detached Island (Death Counter Monument)
    this.drawDetachedIsland(stage);

    // 3. Main Floating Island Landmass with Layered 3D Elevation & Cliffs
    this.drawMainIsland(stage);

    // 4. Winding Dirt/Gravel Pathway with Stone Trail Markers
    this.drawWindingPath(stage);

    // 5. Obsidian Warp Gate Monolith
    this.drawWarpGate(stage);

    // 6. Level Nodes (Caverns 1 to 9 & Boss Mouth Archway 10)
    for (let i = 0; i < MAP_NODES.length; i++) {
      this.drawMapNode(MAP_NODES[i], i, stage);
    }

    // 7. Player Avatar on Map
    this.drawMapAvatar(stage);

    // 8. Modern Arcade HUD & Stage Banner
    this.drawMapHeader(stage);
  },

  drawMainIsland(stage) {
    const pts = MAIN_ISLAND_PTS;

    ctx.save();
    // 1. Deep cliff shadow drop (#1E0A04 base underneath #5A200B rock wall)
    ctx.fillStyle = stage.cliffShadow || "#1E0A04";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y + 56);
    for (let i = 1; i < pts.length; i++) {
      const tooth = (i % 2 === 0) ? 6 : -4;
      ctx.lineTo(pts[i].x, pts[i].y + 56 + tooth);
    }
    ctx.closePath();
    ctx.fill();

    // 2. Vertical rock wall facade
    ctx.fillStyle = stage.cliff || "#5A200B";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y + 36);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + 36);
    ctx.closePath();
    ctx.fill();

    // Horizontal rock strata lines across cliff face
    ctx.strokeStyle = stage.cliffShadow || "#1E0A04";
    ctx.lineWidth = 4;
    for (let s = 12; s <= 28; s += 8) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x + 10, pts[0].y + s);
      for (let i = 1; i < pts.length; i += 2) {
        ctx.lineTo(pts[i].x, pts[i].y + s);
      }
      ctx.stroke();
    }

    // 3. Dark dirt rim / border
    ctx.fillStyle = stage.pathBorder || "#2B1004";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y + 6);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y + 6);
    ctx.closePath();
    ctx.fill();

    // 4. Top Land surface
    ctx.fillStyle = stage.land;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    // 5. Stepped terrain: elevated north plateau (nodes 7, 8, 9, 10 area)
    const plateauPts = [
      { x: 500, y: 380 }, { x: 740, y: 280 }, { x: 980, y: 260 },
      { x: 1260, y: 280 }, { x: 1520, y: 380 }, { x: 1400, y: 480 },
      { x: 1160, y: 440 }, { x: 880, y: 420 }, { x: 580, y: 420 }
    ];
    ctx.fillStyle = stage.cliffShadow || "#1E0A04";
    ctx.beginPath();
    ctx.moveTo(plateauPts[0].x, plateauPts[0].y + 10);
    for (let i = 1; i < plateauPts.length; i++) ctx.lineTo(plateauPts[i].x, plateauPts[i].y + 10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = stage.landLight || "#B87C00";
    ctx.beginPath();
    ctx.moveTo(plateauPts[0].x, plateauPts[0].y);
    for (let i = 1; i < plateauPts.length; i++) ctx.lineTo(plateauPts[i].x, plateauPts[i].y);
    ctx.closePath();
    ctx.fill();

    // 6. Surface gravel texturing (dithered clusters)
    ctx.fillStyle = stage.landDark || "#6E4400";
    for (let gx = 420; gx < 1680; gx += 48) {
      for (let gy = 320; gy < 920; gy += 44) {
        const seed = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
        const frac = seed - Math.floor(seed);
        if (frac > 0.65) {
          ctx.fillRect(gx, gy, 6, 6);
          ctx.fillRect(gx + 6, gy + 6, 6, 6);
        }
      }
    }

    ctx.restore();
  },

  drawDetachedIsland(stage) {
    ctx.save();
    const di = DETACHED_ISLAND;

    // 1. Cliff shadow drop underneath
    ctx.fillStyle = stage.cliffShadow || "#1E0A04";
    ctx.fillRect(di.cliff.x, di.cliff.y + 14, di.cliff.w, di.cliff.h);
    ctx.fillStyle = stage.cliff || "#5A200B";
    ctx.fillRect(di.cliff.x, di.cliff.y, di.cliff.w, di.cliff.h);

    // 2. Dark dirt border & Land top
    ctx.fillStyle = stage.pathBorder || "#2B1004";
    ctx.fillRect(di.land.x, di.land.y + 6, di.land.w, di.land.h);
    ctx.fillStyle = stage.land;
    ctx.fillRect(di.land.x, di.land.y, di.land.w, di.land.h);

    // 3. Weathered Mossy Pixel Tombstone
    const tx = TOMBSTONE.x, ty = TOMBSTONE.y;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(tx + 6, ty + 12, 76, 82);

    ctx.fillStyle = "#334155";
    ctx.fillRect(tx + 4, ty + 20, 72, 70);
    ctx.beginPath();
    ctx.arc(tx + 40, ty + 22, 36, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = "#475569";
    ctx.fillRect(tx + 8, ty + 20, 4, 68);
    ctx.beginPath();
    ctx.arc(tx + 40, ty + 22, 32, Math.PI, 0, false);
    ctx.fill();

    ctx.fillStyle = "#1E293B";
    ctx.fillRect(tx + 12, ty + 24, 56, 62);

    // Moss patches
    ctx.fillStyle = "#15803D";
    ctx.fillRect(tx + 4, ty + 74, 18, 14);
    ctx.fillRect(tx + 18, ty + 80, 12, 8);
    ctx.fillRect(tx + 60, ty + 72, 16, 16);
    ctx.fillStyle = "#22C55E";
    ctx.fillRect(tx + 6, ty + 76, 8, 6);
    ctx.fillRect(tx + 62, ty + 74, 8, 6);

    // Engraved Skull Badge (16x16 pixel skull)
    const sx = tx + 32, sy = ty + 14;
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(sx, sy, 16, 10);
    ctx.fillRect(sx + 3, sy + 10, 10, 5);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(sx + 2, sy + 4, 4, 4);
    ctx.fillRect(sx + 10, sy + 4, 4, 4);
    ctx.fillRect(sx + 7, sy + 8, 2, 2);

    // Numerical etching: "DEATHS" banner
    ctx.fillStyle = "#94A3B8";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("DEATHS", tx + 40, ty + 46);

    // High-contrast numerical etching
    ctx.fillStyle = "#EF4444";
    ctx.font = "bold 15px 'Press Start 2P', monospace";
    ctx.fillText(`${this.deaths}`.padStart(4, "0"), tx + 40, ty + 68);

    // Memorial candles flickering beside tombstone
    const c1x = tx - 14, c1y = ty + 64;
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(c1x, c1y, 6, 18);
    const flame1 = Math.sin(this.time * 10) * 2;
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(c1x + 1 + flame1 * 0.5, c1y - 8, 4, 7);
    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(c1x + 2, c1y - 6, 2, 4);

    const c2x = tx + 88, c2y = ty + 66;
    ctx.fillStyle = "#E2E8F0";
    ctx.fillRect(c2x, c2y, 6, 16);
    const flame2 = Math.sin(this.time * 12 + 1) * 2;
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(c2x + 1 + flame2 * 0.5, c2y - 8, 4, 7);
    ctx.fillStyle = "#FEF08A";
    ctx.fillRect(c2x + 2, c2y - 6, 2, 4);

    ctx.restore();
  },

  drawWindingPath(stage) {
    ctx.save();
    // 1. Path outline / dark border (width: 36px)
    ctx.strokeStyle = stage.pathBorder || "#2B1004";
    ctx.lineWidth = 36;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(MAP_NODES[0].x + 34, MAP_NODES[0].y + 40);
    for (let i = 1; i < MAP_NODES.length; i++) {
      const prev = MAP_NODES[i - 1];
      const curr = MAP_NODES[i];
      const mx = (prev.x + curr.x) / 2 + 34;
      const my = (prev.y + curr.y) / 2 + 40 + ((i % 2 === 0) ? 18 : -18);
      ctx.quadraticCurveTo(mx, my, curr.x + 34, curr.y + 40);
    }
    ctx.stroke();

    // 2. Path inner gravel fill (width: 28px)
    ctx.strokeStyle = stage.path || "#D49B38";
    ctx.lineWidth = 28;
    ctx.beginPath();
    ctx.moveTo(MAP_NODES[0].x + 34, MAP_NODES[0].y + 40);
    for (let i = 1; i < MAP_NODES.length; i++) {
      const prev = MAP_NODES[i - 1];
      const curr = MAP_NODES[i];
      const mx = (prev.x + curr.x) / 2 + 34;
      const my = (prev.y + curr.y) / 2 + 40 + ((i % 2 === 0) ? 18 : -18);
      ctx.quadraticCurveTo(mx, my, curr.x + 34, curr.y + 40);
    }
    ctx.stroke();

    // 3. Pixelated cobblestones / gravel variations along path
    ctx.fillStyle = stage.pathBorder || "#3E1808";
    for (let i = 0; i < MAP_NODES.length - 1; i++) {
      const a = MAP_NODES[i];
      const b = MAP_NODES[i + 1];
      const count = 5;
      for (let c = 1; c < count; c++) {
        const t = c / count;
        const px = lerp(a.x + 34, b.x + 34, t) + ((c % 2 === 0) ? 4 : -4);
        const py = lerp(a.y + 40, b.y + 40, t) + ((c % 2 === 0) ? -4 : 4);
        ctx.fillRect(Math.round(px) - 2, Math.round(py) - 2, 4, 4);
      }
    }

    // 4. Stone Trail Markers (carved stone milestone posts) between nodes
    for (let i = 0; i < MAP_NODES.length - 1; i++) {
      const a = MAP_NODES[i];
      const b = MAP_NODES[i + 1];
      const mx = Math.round((a.x + b.x) / 2 + 34 + ((i % 2 === 0) ? 24 : -24));
      const my = Math.round((a.y + b.y) / 2 + 40 + ((i % 2 === 0) ? -16 : 16));

      ctx.fillStyle = "#1E0A04";
      ctx.fillRect(mx - 8, my + 8, 16, 6);
      ctx.fillStyle = "#4A5568";
      ctx.fillRect(mx - 7, my - 10, 14, 20);
      ctx.fillStyle = "#718096";
      ctx.fillRect(mx - 7, my - 10, 14, 4);
      ctx.fillRect(mx - 7, my - 10, 3, 20);
      ctx.fillStyle = "#2D3748";
      ctx.fillRect(mx - 2, my - 4, 4, 8);
    }

    ctx.restore();
  },

  drawWarpGate(stage) {
    const g = WARP_GATE;
    ctx.save();

    // Stone base steps
    ctx.fillStyle = "#0A0910";
    ctx.fillRect(g.x - 8, g.y + g.h - 10, g.w + 16, 18);
    ctx.fillStyle = "#1A1624";
    ctx.fillRect(g.x - 4, g.y + g.h - 18, g.w + 8, 10);

    // Left Obsidian Pillar
    ctx.fillStyle = "#121018";
    ctx.fillRect(g.x, g.y, 22, g.h - 14);
    ctx.fillStyle = "#262234";
    ctx.fillRect(g.x, g.y, 4, g.h - 14);

    // Right Obsidian Pillar
    ctx.fillStyle = "#121018";
    ctx.fillRect(g.x + g.w - 22, g.y, 22, g.h - 14);
    ctx.fillStyle = "#262234";
    ctx.fillRect(g.x + g.w - 22, g.y, 4, g.h - 14);

    // Top Lintel Monolith
    ctx.fillStyle = "#1A1626";
    ctx.fillRect(g.x - 4, g.y - 12, g.w + 8, 16);
    ctx.fillStyle = "#2E2840";
    ctx.fillRect(g.x - 4, g.y - 12, g.w + 8, 4);

    // Glowing cyan / purple runic hieroglyphs on the pillars
    const runePulse = 0.6 + 0.4 * Math.sin(this.time * 5);
    ctx.fillStyle = stage.id === 3 ? `rgba(192, 132, 252, ${runePulse})` : `rgba(56, 189, 248, ${runePulse})`;
    ctx.fillRect(g.x + 8, g.y + 14, 6, 3);
    ctx.fillRect(g.x + 6, g.y + 24, 10, 3);
    ctx.fillRect(g.x + 8, g.y + 36, 6, 4);
    ctx.fillRect(g.x + 6, g.y + 48, 10, 3);
    ctx.fillRect(g.x + g.w - 14, g.y + 14, 6, 3);
    ctx.fillRect(g.x + g.w - 16, g.y + 24, 10, 3);
    ctx.fillRect(g.x + g.w - 14, g.y + 36, 6, 4);
    ctx.fillRect(g.x + g.w - 16, g.y + 48, 10, 3);

    // Center Swirling Portal Vortex
    const vx = g.x + g.w / 2, vy = g.y + (g.h - 14) / 2;
    const vr = 28;
    const vGrad = ctx.createRadialGradient(vx, vy, 4, vx, vy, vr);
    if (stage.id === 3) {
      vGrad.addColorStop(0, "#FAF5FF");
      vGrad.addColorStop(0.3, "#C084FC");
      vGrad.addColorStop(0.7, "#581C87");
      vGrad.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    } else {
      vGrad.addColorStop(0, "#F0FDF4");
      vGrad.addColorStop(0.3, "#38BDF8");
      vGrad.addColorStop(0.7, "#0369A1");
      vGrad.addColorStop(1, "rgba(0, 0, 0, 0.9)");
    }
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(vx, vy, vr, 0, Math.PI * 2);
    ctx.fill();

    // Rotating energy ring motes
    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < 4; i++) {
      const angle = this.time * 4 + (i * Math.PI) / 2;
      const px = vx + Math.cos(angle) * (vr * 0.65);
      const py = vy + Math.sin(angle) * (vr * 0.65);
      ctx.fillRect(Math.round(px) - 2, Math.round(py) - 2, 4, 4);
    }

    // Label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "9px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("WARP", vx, g.y + g.h + 20);
    ctx.fillStyle = "#FDE047";
    ctx.fillText("[W]", vx, g.y + g.h + 34);

    ctx.restore();
  },

  drawMapNode(node, idx, stage) {
    const unlocked = this.isNodeUnlocked(idx);
    const cleared = this.isLevelCleared(idx);
    const isBoss = !!node.isBoss;
    const isSelected = (this.mapSelectedNode === idx);

    ctx.save();

    if (isBoss) {
      // --- NODE 10: BOSS DEMON GARGOYLE MOUTH ENTRANCE ---
      const bx = node.x - 26, by = node.y - 30;
      const bw = 120, bh = 130;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(bx + 6, by + 16, bw, bh);

      // Carved stone demon horns curling from brow
      ctx.fillStyle = "#1C0A0E";
      ctx.beginPath();
      ctx.moveTo(bx + 14, by + 40);
      ctx.quadraticCurveTo(bx - 36, by - 10, bx - 26, by - 36);
      ctx.quadraticCurveTo(bx - 8, by - 16, bx + 32, by + 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#3F1820";
      ctx.fillRect(bx - 20, by - 24, 6, 12);

      ctx.fillStyle = "#1C0A0E";
      ctx.beginPath();
      ctx.moveTo(bx + bw - 14, by + 40);
      ctx.quadraticCurveTo(bx + bw + 36, by - 10, bx + bw + 26, by - 36);
      ctx.quadraticCurveTo(bx + bw + 8, by - 16, bx + bw - 32, by + 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#3F1820";
      ctx.fillRect(bx + bw + 14, by - 24, 6, 12);

      // Demon head stone skull face
      ctx.fillStyle = unlocked ? "#2D1016" : "#14070A";
      ctx.fillRect(bx + 10, by + 26, bw - 20, bh - 26);
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by + 28, (bw - 20) / 2, Math.PI, 0, false);
      ctx.fill();

      // Cracked runes on forehead glowing crimson
      const runePulse = 0.5 + 0.5 * Math.sin(this.time * 3);
      ctx.fillStyle = unlocked ? `rgba(239, 68, 68, ${runePulse})` : "#4A1820";
      ctx.fillRect(bx + bw / 2 - 12, by + 8, 24, 4);
      ctx.fillRect(bx + bw / 2 - 4, by + 14, 8, 10);
      ctx.fillRect(bx + bw / 2 - 16, by + 18, 32, 3);

      // Gaping Maw / Mouth Archway
      const mawX = bx + 22, mawY = by + 46, mawW = bw - 44, mawH = bh - 46;
      ctx.fillStyle = "#000000";
      ctx.fillRect(mawX, mawY, mawW, mawH);
      ctx.beginPath();
      ctx.arc(mawX + mawW / 2, mawY, mawW / 2, Math.PI, 0, false);
      ctx.fill();

      // Sharp pixelated stone fangs
      ctx.fillStyle = "#F8FAFC";
      for (let f = 0; f < 4; f++) {
        const fx = mawX + 6 + f * 16;
        ctx.beginPath();
        ctx.moveTo(fx, mawY);
        ctx.lineTo(fx + 6, mawY + 14);
        ctx.lineTo(fx + 12, mawY);
        ctx.closePath();
        ctx.fill();
      }
      for (let f = 0; f < 4; f++) {
        const fx = mawX + 6 + f * 16;
        ctx.beginPath();
        ctx.moveTo(fx, mawY + mawH);
        ctx.lineTo(fx + 6, mawY + mawH - 12);
        ctx.lineTo(fx + 12, mawY + mawH);
        ctx.closePath();
        ctx.fill();
      }

      // PULSING RED INTERIOR EYES
      if (unlocked) {
        const eyeGlow = 0.6 + 0.4 * Math.sin(this.time * 4);
        const ex1 = mawX + mawW / 2 - 18;
        const ex2 = mawX + mawW / 2 + 10;
        const ey = mawY + 22;

        ctx.fillStyle = `rgba(239, 68, 68, ${eyeGlow * 0.4})`;
        ctx.beginPath();
        ctx.arc(ex1 + 4, ey + 3, 10, 0, Math.PI * 2);
        ctx.arc(ex2 + 4, ey + 3, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 30, 30, ${eyeGlow})`;
        ctx.fillRect(ex1, ey, 8, 6);
        ctx.fillRect(ex2, ey, 8, 6);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(ex1 + 2, ey + 2, 4, 2);
        ctx.fillRect(ex2 + 2, ey + 2, 4, 2);
      }

      ctx.fillStyle = unlocked ? "#EF4444" : "#64748B";
      ctx.font = "bold 13px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("BOSS", bx + bw / 2, by - 16);

    } else {
      // --- STANDARD ARCHED NODES 1 to 9 ---
      const w = 68, h = 78;
      const x = node.x, y = node.y;

      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(x + 4, y + 10, w, h);

      // Active/Selected Torch Glow
      if (isSelected || unlocked) {
        const torchGlow = ctx.createRadialGradient(x - 4, y + 36, 6, x - 4, y + 36, 60);
        torchGlow.addColorStop(0, "rgba(255, 174, 52, 0.35)");
        torchGlow.addColorStop(0.5, "rgba(255, 120, 20, 0.15)");
        torchGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = torchGlow;
        ctx.beginPath();
        ctx.arc(x - 4, y + 36, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = unlocked ? "#334155" : "#1E293B";
      ctx.fillRect(x, y + 20, w, h - 20);
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 20, w / 2, Math.PI, 0, false);
      ctx.fill();

      ctx.strokeStyle = unlocked ? "#475569" : "#0F172A";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y + 20, w, h - 20);

      // Stone Keystone at apex of arch with specular highlight
      const kw = 20, kh = 16;
      ctx.fillStyle = unlocked ? "#64748B" : "#334155";
      ctx.fillRect(x + w / 2 - kw / 2, y - 4, kw, kh);
      ctx.fillStyle = "#94A3B8";
      ctx.fillRect(x + w / 2 - kw / 2, y - 4, kw, 3);

      // Deep Cave Interior
      const cavX = x + 10, cavY = y + 24, cavW = w - 20, cavH = h - 24;
      const cavGrad = ctx.createRadialGradient(
        cavX + cavW / 2, cavY + cavH, 4,
        cavX + cavW / 2, cavY + cavH / 2, cavW / 2
      );
      if (unlocked) {
        cavGrad.addColorStop(0, "#000000");
        cavGrad.addColorStop(0.6, "#140A04");
        cavGrad.addColorStop(1, "#281206");
      } else {
        cavGrad.addColorStop(0, "#000000");
        cavGrad.addColorStop(1, "#0A0D14");
      }
      ctx.fillStyle = cavGrad;
      ctx.fillRect(cavX, cavY, cavW, cavH);
      ctx.beginPath();
      ctx.arc(cavX + cavW / 2, cavY, cavW / 2, Math.PI, 0, false);
      ctx.fill();

      // Portcullis / Iron Bars
      if (!unlocked) {
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cavX + 8, cavY);  ctx.lineTo(cavX + 8, cavY + cavH);
        ctx.moveTo(cavX + 18, cavY); ctx.lineTo(cavX + 18, cavY + cavH);
        ctx.moveTo(cavX + 28, cavY); ctx.lineTo(cavX + 28, cavY + cavH);
        ctx.moveTo(cavX + 38, cavY); ctx.lineTo(cavX + 38, cavY + cavH);
        ctx.stroke();
      } else {
        // Torch bracket and flickering flame
        const tx = x - 6, ty = y + 32;
        ctx.fillStyle = "#1E293B";
        ctx.fillRect(tx + 2, ty + 10, 8, 3);
        ctx.fillRect(tx + 2, ty + 2, 4, 10);
        const flm = Math.floor(this.time * 8) % 3;
        ctx.fillStyle = "#DC2626";
        ctx.fillRect(tx + 1, ty - 6, 6, 8);
        ctx.fillStyle = "#F97316";
        ctx.fillRect(tx + 2, ty - 5 - (flm === 1 ? 2 : 0), 4, 6);
        ctx.fillStyle = "#FDE047";
        ctx.fillRect(tx + 3, ty - 3, 2, 4);
      }

      ctx.fillStyle = unlocked ? "#F8FAFC" : "#64748B";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${idx + 1}`, x + w / 2, y + h - 14);

      if (cleared) {
        ctx.fillStyle = "#FDE047";
        ctx.font = "16px 'Press Start 2P', monospace";
        ctx.fillText("★", x + w / 2, y - 12);
      }
    }

    // Yellow Animated Indicator Arrow for Selected Node
    if (isSelected) {
      const bob = Math.sin(this.time * 7) * 6;
      const ax = isBoss ? node.x + 34 : node.x + 34;
      const ay = (isBoss ? node.y - 52 : node.y - 32) + bob;

      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 12, ay - 14);
      ctx.lineTo(ax + 12, ay - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPACE TO ENTER", ax, ay - 24);
    }

    ctx.restore();
  },

  drawMapAvatar(stage) {
    const ax = this.mapAvatarX + 34;
    const ay = this.mapAvatarY + 62;

    ctx.save();
    ctx.fillStyle = "#000000";

    ctx.fillRect(Math.round(ax - 6), Math.round(ay - 44), 12, 12);
    ctx.fillRect(Math.round(ax - 8), Math.round(ay - 32), 16, 20);

    if (this.mapMoving) {
      const frame = Math.floor(this.time * 12) % 2;
      if (frame === 0) {
        ctx.fillRect(Math.round(ax - 10), Math.round(ay - 12), 6, 16);
        ctx.fillRect(Math.round(ax + 4), Math.round(ay - 12), 6, 16);
      } else {
        ctx.fillRect(Math.round(ax - 4), Math.round(ay - 12), 6, 16);
        ctx.fillRect(Math.round(ax + 8), Math.round(ay - 12), 6, 16);
      }
    } else {
      ctx.fillRect(Math.round(ax - 7), Math.round(ay - 12), 5, 16);
      ctx.fillRect(Math.round(ax + 2), Math.round(ay - 12), 5, 16);
    }

    ctx.restore();
  },

  drawMapHeader(stage) {
    ctx.save();

    // 1. STAGE BANNER (Top Left)
    const sbX = 36, sbY = 24, sbW = 480, sbH = 58;
    ctx.fillStyle = "#0C0403";
    ctx.fillRect(sbX + 4, sbY + 6, sbW, sbH);

    ctx.fillStyle = "#5A2810";
    ctx.fillRect(sbX, sbY, sbW, sbH);
    ctx.fillStyle = "#8E4416";
    ctx.fillRect(sbX, sbY, sbW, 3);
    ctx.fillRect(sbX, sbY, 3, sbH);

    ctx.fillStyle = "#281006";
    ctx.fillRect(sbX + 4, sbY + 4, sbW - 8, sbH - 8);

    ctx.fillStyle = "#D49B38";
    ctx.fillRect(sbX + 8, sbY + 8, 4, 4);
    ctx.fillRect(sbX + sbW - 12, sbY + 8, 4, 4);
    ctx.fillRect(sbX + 8, sbY + sbH - 12, 4, 4);
    ctx.fillRect(sbX + sbW - 12, sbY + sbH - 12, 4, 4);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`◆ ${stage.id} ◆`, sbX + 22, sbY + 36);

    ctx.font = "bold 15px 'Press Start 2P', monospace";
    ctx.strokeStyle = "#1A0A04";
    ctx.lineWidth = 4;
    ctx.strokeText(stage.name.toUpperCase(), sbX + 96, sbY + 36);
    ctx.fillStyle = "#FFD166";
    ctx.fillText(stage.name.toUpperCase(), sbX + 96, sbY + 36);

    // 2. KEYBIND LEGEND (Top Center-Right)
    const kbX = 1120, kbY = 32;
    const drawKeyCap = (x, y, w, text) => {
      ctx.fillStyle = "#120F1A";
      ctx.fillRect(x, y + 4, w, 28);
      ctx.fillStyle = "#2D263D";
      ctx.fillRect(x, y, w, 28);
      ctx.fillStyle = "#51466B";
      ctx.fillRect(x, y, w, 3);
      ctx.fillRect(x, y, 3, 28);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "10px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText(text, x + w / 2, y + 18);
    };

    drawKeyCap(kbX, kbY, 28, "◄");
    drawKeyCap(kbX + 32, kbY, 28, "►");
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = "left";
    ctx.fillText("MOVE", kbX + 66, kbY + 18);

    drawKeyCap(kbX + 130, kbY, 74, "SPACE");
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("ENTER", kbX + 212, kbY + 18);

    drawKeyCap(kbX + 286, kbY, 28, "W");
    ctx.fillStyle = "#E2E8F0";
    ctx.fillText("WARP", kbX + 322, kbY + 18);

    // 3. TITLE / BACK BUTTON (Top Right)
    const tbX = 1730, tbY = 24, tbW = 150, tbH = 54;
    const isHover = (mouseX >= tbX && mouseX <= tbX + tbW && mouseY >= tbY && mouseY <= tbY + tbH);
    const depress = isHover ? 3 : 0;

    ctx.fillStyle = "#120224";
    ctx.fillRect(tbX, tbY + 6, tbW, tbH);

    ctx.fillStyle = isHover ? "#6A18B0" : "#3F0E6D";
    ctx.fillRect(tbX, tbY + depress, tbW, tbH - depress);

    ctx.fillStyle = isHover ? "#A855F7" : "#5C189A";
    ctx.fillRect(tbX, tbY + depress, tbW, 4);
    ctx.fillRect(tbX, tbY + depress, 4, tbH - depress);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 12px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("TITLE ⌂", tbX + tbW / 2, tbY + 34 + depress);

    ctx.restore();
  },

  // ---------------------------------------------------------------- IN-GAME 4-PLAY RENDERER (Neo-Retro HD)
  drawGamePlay(stage) {
    ctx.save();
    ctx.scale(2, 2);

    // 1. Outer Frame
    ctx.fillStyle = stage.gameFrame;
    ctx.fillRect(0, 0, 960, 540);

    // 2. Stage Background extending to canvas bottom for pit abyss
    ctx.fillStyle = stage.gameSky;
    ctx.fillRect(40, 48, 880, 540 - 48);

    // Subtle dithered horizontal horizon strip
    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(40, 460, 880, 20);

    if (this.level) {
      // 3. Goal Door
      this.level.door.draw(stage);

      // 4. Solid Floor Segments & Platforms
      ctx.fillStyle = stage.gameGround;
      for (const s of this.level.solids) {
        ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.w), Math.round(s.h));
      }

      // 5. Dynamic Traps & Falling Slabs
      for (const t of this.level.traps) {
        t.draw(stage);
      }

      // 6. Outer Border Walls
      ctx.fillStyle = stage.gameFrame;
      ctx.fillRect(0, 0, 40, 540);
      ctx.fillRect(920, 0, 40, 540);

      // 7. Pitch Black Astronaut Silhouette (#000000)
      if (this.state === "PLAYING" || this.state === "PLAY_WIN" || this.state === "LEVEL_WIN") {
        this.drawPlayer();
      }

      // 8. Death particles
      drawParticles();
    }

    ctx.restore();

    // 9. Modern Arcade Top Status Bar at native 1920x1080!
    this.drawGameStatusBar(stage);

    // 10. Pause Overlay
    if (this.isPaused) {
      this.drawPauseOverlay();
    }

    // 11. Level Complete Celebration
    if (this.state === "LEVEL_WIN") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(80, 96, 1760, 888);
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 44px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("LEVEL CLEARED!", W / 2, H / 2 - 20);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "18px 'Press Start 2P', monospace";
      ctx.fillText("RETURNING TO OVERWORLD MAP...", W / 2, H / 2 + 35);
    }
  },

  drawGameStatusBar(stage) {
    ctx.fillStyle = stage.gameFrame;
    ctx.fillRect(0, 0, W, 72);

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 68, W, 4);

    // Left 1: Pause button (x: 24, y: 14, w: 56, h: 44)
    const isHoverPause = (mouseX >= 24 && mouseX <= 80 && mouseY >= 14 && mouseY <= 58);
    ctx.fillStyle = isHoverPause ? "#3E127A" : "#280654";
    ctx.fillRect(24, 14, 56, 44);
    ctx.strokeStyle = "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 14, 56, 44);
    ctx.fillStyle = "#FFD166";
    ctx.fillRect(40, 24, 6, 24);
    ctx.fillRect(54, 24, 6, 24);

    // Left 2: Quick-Restart button (x: 92, y: 14, w: 56, h: 44)
    const isHoverRestart = (mouseX >= 92 && mouseX <= 148 && mouseY >= 14 && mouseY <= 58);
    ctx.fillStyle = isHoverRestart ? "#3E127A" : "#280654";
    ctx.fillRect(92, 14, 56, 44);
    ctx.strokeStyle = "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(92, 14, 56, 44);
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(120, 36, 11, 0.25 * Math.PI, 1.8 * Math.PI, false);
    ctx.stroke();
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.moveTo(129, 29); ctx.lineTo(123, 21); ctx.lineTo(120, 30);
    ctx.closePath();
    ctx.fill();

    // Left 3: Map Exit Button (x: 160, y: 14, w: 84, h: 44)
    const isHoverMap = (mouseX >= 160 && mouseX <= 244 && mouseY >= 14 && mouseY <= 58);
    ctx.fillStyle = isHoverMap ? "#3E127A" : "#280654";
    ctx.fillRect(160, 14, 84, 44);
    ctx.strokeStyle = "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(160, 14, 84, 44);
    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 13px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("MAP", 202, 41);

    // Center: EXACTLY 4 PROGRESS MEDALLIONS
    const startX = Math.round(W / 2 - (4 * 28 + 3 * 16) / 2);
    const blockY = 22;

    for (let p = 0; p < 4; p++) {
      const bx = startX + p * 44;
      ctx.fillStyle = "#120224";
      ctx.fillRect(bx, blockY, 28, 28);
      ctx.strokeStyle = "#4D128A";
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, blockY, 28, 28);

      if (p <= this.currentPlay) {
        ctx.fillStyle = p < this.currentPlay ? "#FDE047" : "#FF6B35";
        ctx.fillRect(bx + 4, blockY + 4, 20, 20);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(bx + 6, blockY + 6, 6, 6);
      }
    }

    // Right: Stage & Level indicator
    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.textAlign = "right";
    const levelLabel = this.selectedLevel === 9 ? "BOSS" : `LVL ${this.selectedLevel + 1}`;
    ctx.fillText(`${stage.shortName} • ${levelLabel} (PLAY ${this.currentPlay + 1}/4)`, W - 48, 42);
  },

  drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
    ctx.fillRect(80, 96, 1760, 888);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 44px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", W / 2, 340);

    const bw = 440, bh = 64;
    const bx = W / 2 - bw / 2;

    // Button 1: Resume
    const isHoverResume = (mouseX >= bx && mouseX <= bx + bw && mouseY >= 420 && mouseY <= 484);
    ctx.fillStyle = isHoverResume ? "#4C1D95" : "#280654";
    ctx.fillRect(bx, 420, bw, bh);
    ctx.strokeStyle = isHoverResume ? "#FDE047" : "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, 420, bw, bh);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px 'Press Start 2P', monospace";
    ctx.fillText("[ RESUME ]", W / 2, 458);

    // Button 2: Overworld Map
    const isHoverMap = (mouseX >= bx && mouseX <= bx + bw && mouseY >= 504 && mouseY <= 568);
    ctx.fillStyle = isHoverMap ? "#4C1D95" : "#280654";
    ctx.fillRect(bx, 504, bw, bh);
    ctx.strokeStyle = isHoverMap ? "#FDE047" : "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, 504, bw, bh);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("[ OVERWORLD MAP ]", W / 2, 542);

    // Button 3: Exit to Title
    const isHoverTitle = (mouseX >= bx && mouseX <= bx + bw && mouseY >= 588 && mouseY <= 652);
    ctx.fillStyle = isHoverTitle ? "#4C1D95" : "#280654";
    ctx.fillRect(bx, 588, bw, bh);
    ctx.strokeStyle = isHoverTitle ? "#FDE047" : "#5C189A";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, 588, bw, bh);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("[ EXIT TO TITLE ]", W / 2, 626);

    // Keyboard hints
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.fillText("P / ESC: RESUME   •   M: MAP   •   T: TITLE", W / 2, 720);

    ctx.restore();
  },

  drawPlayer() {
    const p = this.player;
    const cx = Math.round(p.x + p.w / 2);
    const by = Math.round(p.y + p.h);
    const py = by - 32;

    ctx.save();
    ctx.fillStyle = "#000000";

    // 1. Head: 8x8 square centered
    ctx.fillRect(cx - 4, py, 8, 8);

    // 2. Torso: 12x13 rectangle
    ctx.fillRect(cx - 6, py + 7, 12, 13);

    // 3. Legs: 12px tall, flush with floor at py + 32
    const isMoving = Math.abs(p.vx) > 20 && p.grounded;
    if (!p.grounded) {
      ctx.fillRect(cx - 6, py + 20, 4, 12);
      ctx.fillRect(cx + 2, py + 20, 4, 12);
    } else if (isMoving) {
      const frame = Math.floor(p.runAnimTime * 10) % 2;
      if (frame === 0) {
        ctx.fillRect(cx - 7, py + 20, 4, 12);
        ctx.fillRect(cx + 1, py + 20, 4, 12);
      } else {
        ctx.fillRect(cx - 3, py + 20, 4, 12);
        ctx.fillRect(cx + 4, py + 20, 4, 12);
      }
    } else {
      ctx.fillRect(cx - 5, py + 20, 3.5, 12);
      ctx.fillRect(cx + 1.5, py + 20, 3.5, 12);
    }

    ctx.restore();
  },
};

// ---------------------------------------------------------------- LAYOUT & RESIZING
function fit() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / H);
  const cw = Math.round(W * scale);
  const ch = Math.round(H * scale);
  cv.style.width = cw + "px";
  cv.style.height = ch + "px";
}

addEventListener("resize", fit);
if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);

// ---------------------------------------------------------------- BOOT
(function initGame() {
  fit();
  setupTouch();
  Game.init();
})();

// ---------------------------------------------------------------- MAIN GAME LOOP
let lastTime = performance.now();
function loop(now) {
  let dt = (now - lastTime) / 1000;
  lastTime = now;
  dt = Math.min(dt, 1 / 30);

  Game.update(dt);
  Game.draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
