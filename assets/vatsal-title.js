/* ==========================================================================
   VATSAL.LOL — Living Title System V2: Shape-Shifting Logo Personalities
   Vanilla JS only. Local woff2 fonts only. No CDN, no external libraries.

   Usage:
     <h1 data-vatsal-title data-font-base="assets/fontsource/" aria-label="VATSAL.LOL">VATSAL.LOL</h1>
     <script src="assets/vatsal-title.js" defer></script>
   ========================================================================== */
(() => {
  'use strict';

  function initLivingTitle() {
    const root = document.querySelector('[data-vatsal-title]');
    if (!root || root.dataset.vtInitialized) return;
    root.dataset.vtInitialized = 'true';

    /* ---------- Configuration ---------- */
    const TEXT = 'VATSAL.LOL';
    const rawBase = root.getAttribute('data-font-base') || 'assets/fontsource/';
    const BASE = rawBase.replace(/\/?$/, '/');

    // Display & transition timing (ms)
    const testHold = (typeof window !== 'undefined' && window.__VT_TEST_HOLD__);
    const DISPLAY_HOLD_MIN = testHold || 4500;
    const DISPLAY_HOLD_MAX = testHold || 5500;
    const EXTENDED_REST_MS = testHold ? testHold * 1.5 : 8500;
    const EXTENDED_REST_EVERY_N = 4; // Take a longer breath every N cycles

    /* ---------- Personality Registry ---------- */
    // 25 local WOFF2 fonts with visual categories and compatible animation families
    const PERSONALITIES = [
      {
        id: 'logo',
        name: 'Vatsal Classic Logo',
        file: 'vatsal-logo-font.woff2',
        category: 'brand',
        w: '400',
        ls: '0.04em',
        transitions: ['blur_sharp', 'erase', 'flip', 'roulette', 'dissolve']
      },
      {
        id: 'oxanium',
        name: 'Oxanium Bold',
        file: 'Oxanium-VariableFont_wght.woff2',
        category: 'geometric',
        w: '800',
        ls: '0.03em',
        transitions: ['scanline', 'flip', 'flash_cut', 'erase']
      },
      {
        id: 'jetbrains',
        name: 'JetBrains Mono',
        file: 'JetBrainsMono-Bold.woff2',
        category: 'monospaced',
        w: '700',
        ls: '0.01em',
        transitions: ['typewriter', 'scanline', 'erase']
      },
      {
        id: 'pixelify',
        name: 'Pixelify Sans',
        file: 'PixelifySans-VariableFont_wght (1).woff2',
        category: 'pixel',
        w: '700',
        ls: '0.02em',
        transitions: ['pixel_dissolve', 'scanline', 'typewriter', 'fall']
      },
      {
        id: 'syne',
        name: 'Syne ExtraBold',
        file: 'Syne-VariableFont_wght.woff2',
        category: 'geometric',
        w: '800',
        ls: '-0.02em',
        transitions: ['stretch_snap', 'flip', 'erase', 'dissolve']
      },
      {
        id: 'bankgothic',
        name: 'BankGothic Bold',
        file: 'BankGothic Bold.woff2',
        category: 'geometric',
        w: '700',
        ls: '0.05em',
        transitions: ['flip', 'erase', 'scanline', 'flash_cut']
      },
      {
        id: 'bigparty',
        name: 'BigParty 4 Blue',
        file: 'BigParty4Blue.woff2',
        category: 'playful',
        w: '400',
        ls: '0.04em',
        transitions: ['fall', 'stretch_snap', 'tilt_rebound']
      },
      {
        id: 'crackman',
        name: 'Crackman Arcade',
        file: 'Crackman.woff2',
        category: 'pixel',
        w: '400',
        ls: '0.02em',
        transitions: ['pixel_dissolve', 'fall', 'flash_cut']
      },
      {
        id: 'deliberate',
        name: 'Deliberate Projection Demo',
        file: 'Deliberate Projection Demo.woff2',
        category: 'decorative',
        w: '400',
        noDot: true,
        ls: '0.02em',
        transitions: ['blur_sharp', 'flip', 'dissolve']
      },
      {
        id: 'deliberate2',
        name: 'Deliberate Projection 2',
        file: 'Deliberate Projection Demo-2.woff2',
        category: 'decorative',
        w: '400',
        noDot: true,
        ls: '0.02em',
        transitions: ['blur_sharp', 'scanline', 'flip']
      },
      {
        id: 'mideltank',
        name: 'MIDELTANK Display',
        file: 'MIDELTANK_Demo.woff2',
        category: 'display',
        w: '400',
        ls: '0.03em',
        transitions: ['fall', 'stretch_snap', 'dissolve']
      },
      {
        id: 'modernline',
        name: 'Modernline Signature',
        file: 'modernline bold.woff2',
        category: 'handwritten',
        w: '700',
        ls: '0.01em',
        transitions: ['tilt_rebound', 'erase', 'blur_sharp']
      },
      {
        id: 'mysteryquest',
        name: 'Mystery Quest',
        file: 'MysteryQuest-Regular.woff2',
        category: 'decorative',
        w: '400',
        ls: '0.02em',
        transitions: ['blur_sharp', 'tilt_rebound', 'dissolve']
      },
      {
        id: 'opnapalm',
        name: 'Operation Napalm',
        file: 'OperationNapalm-Italic.woff2',
        category: 'slanted',
        w: '400',
        ls: '0.02em',
        transitions: ['fall', 'stretch_snap', 'flash_cut']
      },
      {
        id: 'pricedown',
        name: 'Pricedown Heavy',
        file: 'Pricedown Bl.woff2',
        category: 'display',
        w: '400',
        ls: '0.02em',
        transitions: ['fall', 'stretch_snap', 'dissolve']
      },
      {
        id: 'priestacy',
        name: 'Priestacy Gothic',
        file: 'Priestacy.woff2',
        category: 'decorative',
        w: '400',
        ls: '0.03em',
        transitions: ['blur_sharp', 'dissolve', 'erase']
      },
      {
        id: 'rogenz',
        name: 'ROGENZ Cyber',
        file: 'ROGENZ.woff2',
        category: 'display',
        w: '400',
        ls: '0.04em',
        transitions: ['flash_cut', 'scanline', 'dissolve']
      },
      {
        id: 'rostex',
        name: 'Rostex Oblique',
        file: 'Rostex-Oblique.woff2',
        category: 'slanted',
        w: '400',
        ls: '0.02em',
        transitions: ['scanline', 'flip', 'stretch_snap']
      },
      {
        id: 'rusticroad',
        name: 'Rustic Roadway',
        file: 'RusticRoadway.woff2',
        category: 'handwritten',
        w: '400',
        ls: '0.02em',
        transitions: ['tilt_rebound', 'fall', 'stretch_snap']
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk City',
        file: 'SDCyberPunkCityDemo.woff2',
        category: 'display',
        w: '400',
        noDot: true,
        ls: '0.03em',
        transitions: ['scanline', 'flash_cut', 'pixel_dissolve']
      },
      {
        id: 'terminal',
        name: 'Terminal Vision',
        file: 'TerminalVision.woff2',
        category: 'monospaced',
        w: '400',
        ls: '0.02em',
        transitions: ['typewriter', 'scanline', 'pixel_dissolve']
      },
      {
        id: 'typowriter_b',
        name: 'TypoWriter Bold',
        file: 'TypoWriter Bold Demo.woff2',
        category: 'monospaced',
        w: '700',
        noDot: true,
        ls: '0.01em',
        transitions: ['typewriter', 'erase', 'flash_cut']
      },
      {
        id: 'typowriter_r',
        name: 'TypoWriter Regular',
        file: 'TypoWriter Regular Demo.woff2',
        category: 'monospaced',
        w: '400',
        noDot: true,
        ls: '0.01em',
        transitions: ['typewriter', 'erase', 'blur_sharp']
      },
      {
        id: 'whimsy',
        name: 'Whimsy Pops',
        file: 'Whimsy Pops Regular.woff2',
        category: 'playful',
        w: '400',
        ls: '0.03em',
        transitions: ['fall', 'tilt_rebound', 'stretch_snap']
      },
      {
        id: 'whimsyslant',
        name: 'Whimsy Pops Slant',
        file: 'Whimsy Pops Slant.woff2',
        category: 'playful',
        w: '400',
        ls: '0.03em',
        transitions: ['tilt_rebound', 'flip', 'fall']
      }
    ];

    PERSONALITIES.forEach((f, i) => { f.fam = 'vt-font-' + i; });
    let anchorLogo = PERSONALITIES[0]; // fallback anchor for borrowed dots or missing fonts

    /* ---------- Scoped Component Styles ---------- */
    const css = `
[data-vatsal-title] {
  --vt-fg: #EDEDF0;
  --vt-accent: #DDA135;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: 44px;
  line-height: 1.1;
  height: 1.25em;
  margin: 0;
  padding: 0;
  color: var(--vt-fg);
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  font-weight: 400;
  letter-spacing: normal;
  max-width: 100%;
}
.vt-ch {
  display: inline-flex;
  justify-content: center;
  position: relative;
  line-height: 1;
  transition: color .25s ease, text-shadow .4s ease;
  transform: scale(var(--fit, 1));
}
.vt-ch.lock {
  color: var(--vt-accent);
  text-shadow: 0 0 .4em rgba(221, 161, 53, .55);
}
.vt-glow .vt-ch {
  text-shadow: 0 0 .5em rgba(221, 161, 53, .28);
}
.vt-ch.cur::after {
  content: "";
  position: absolute;
  right: -.09em;
  top: .14em;
  bottom: .14em;
  width: .07em;
  background: var(--vt-accent);
  animation: vt-blink .7s steps(1) infinite;
}
@keyframes vt-blink { 50% { opacity: 0; } }

@media (max-width: 768px) {
  [data-vatsal-title] { font-size: 26px; }
}
@media (max-width: 600px) {
  [data-vatsal-title] { font-size: 24px; }
}
@media (max-width: 380px) {
  [data-vatsal-title] { font-size: 20px; }
}
`;
    const styleEl = document.createElement('style');
    styleEl.id = 'vt-living-title-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ---------- Helpers & State ---------- */
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = arr => (arr && arr.length ? arr[(Math.random() * arr.length) | 0] : null);
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    const activeTimers = [];
    const sleep = ms => new Promise(r => {
      const id = setTimeout(r, ms);
      activeTimers.push(id);
    });

    // Pause when tab hidden or title scrolled out of view
    let inView = true;
    let isDocVisible = !document.hidden;
    const waiters = [];
    const wake = () => { while (waiters.length) waiters.pop()(); };

    document.addEventListener('visibilitychange', () => {
      isDocVisible = !document.hidden;
      wake();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0]) {
          inView = entries[0].isIntersecting;
          wake();
        }
      }).observe(root);
    }

    async function vis() {
      while (document.hidden || !inView) {
        await new Promise(r => waiters.push(r));
      }
    }

    /* ---------- Fonts: Load + Measure ---------- */
    const cv = document.createElement('canvas').getContext('2d');
    const mc = new Map();
    function measure(font, str) {
      const f = font || anchorLogo;
      const key = (f.fam || 'sans-serif') + '|' + (f.w || '400') + '|' + str;
      if (!mc.has(key)) {
        cv.font = `${f.w || 400} 100px "${f.fam}", sans-serif`;
        mc.set(key, cv.measureText(str));
      }
      return mc.get(key);
    }

    function calibrate(font) {
      const V = measure(font, 'V');
      font.tw = measure(font, TEXT).width || 600;
      font.cap = V.actualBoundingBoxAscent || 70;
      const asc = V.fontBoundingBoxAscent || V.actualBoundingBoxAscent || 70;
      const desc = V.fontBoundingBoxDescent || V.actualBoundingBoxDescent || 20;
      font.bl = (100 - (asc + desc)) / 2 + asc;
      font.dy = 50 - (font.bl - font.cap / 2);
      if (isNaN(font.dy)) font.dy = 0;

      // Normalization scale factor k
      // Target word width ~620 at 100px font-size
      const targetTw = 620;
      const kw = targetTw / (font.tw || targetTw);
      const kh = (70 / (font.cap || 70)) * 1.12;
      font.k = clamp(Math.min(kw, kh), 0.65, 1.38);
      if (isNaN(font.k) || font.k <= 0) font.k = 1;
    }

    const readyPersonalities = [];
    async function loadFont(font) {
      const url = BASE + encodeURI(font.file);
      const ff = new FontFace(font.fam, `url("${url}") format("woff2")`, font.w ? { weight: font.w } : {});
      await ff.load();
      document.fonts.add(ff);
      calibrate(font);
      return font;
    }

    /* ---------- Letters Management ---------- */
    const letters = [];
    function buildLetters() {
      root.textContent = '';
      TEXT.split('').forEach(ch => {
        const s = document.createElement('span');
        s.className = 'vt-ch';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        root.appendChild(s);
        letters.push(s);
      });
    }

    function applyPersonality(font) {
      const f = font || anchorLogo;
      letters.forEach(l => {
        const isDot = l.textContent === '.';
        const targetFont = (f.noDot && isDot) ? anchorLogo : f;
        if (targetFont.fam) {
          l.style.fontFamily = `"${targetFont.fam}", sans-serif`;
        }
        l.style.fontWeight = targetFont.w || '400';
        l.style.fontSize = (f.k || 1) + 'em';
        l.style.top = ((f.dy || 0) / 100) + 'em';
        l.style.letterSpacing = f.ls || 'normal';
      });
    }

    function resetLetterAnimations() {
      activeTimers.forEach(clearTimeout);
      activeTimers.length = 0;
      letters.forEach(l => {
        l.getAnimations().forEach(a => a.cancel());
        l.classList.remove('cur', 'lock');
        l.style.removeProperty('opacity');
        l.style.removeProperty('transform');
        l.style.removeProperty('filter');
        l.style.removeProperty('clip-path');
        l.style.removeProperty('width');
        l.style.removeProperty('--fit');
        l.style.removeProperty('transform-origin');
      });
      root.getAnimations().forEach(a => a.cancel());
      root.style.removeProperty('filter');
      root.style.removeProperty('transform');
    }

    const A = (el, kf, dur, delay, easing, fill) =>
      el.animate(kf, {
        duration: dur,
        delay: delay || 0,
        easing: easing || 'cubic-bezier(.2,.8,.2,1)',
        fill: fill || 'none'
      });

    /* ==========================================================================
       Diverse Transition Engine (12 Families)
       ========================================================================== */
    const TRANSITIONS = {
      // Family A: Erase -> New Font (horizontal mask wipe, brief breath, incoming reveal)
      async erase(L, outFont, inFont) {
        // Outgoing wipe-out
        const outAnim = L.map((l, i) => A(l, [
          { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'translateX(0)' },
          { clipPath: 'inset(0 100% 0 0)', opacity: 0.1, transform: 'translateX(-0.15em)' }
        ], 280, i * 20, 'ease-in', 'forwards'));
        await sleep(280 + L.length * 20 + 80);
        outAnim.forEach(a => a.cancel());

        // Apply new personality
        applyPersonality(inFont);

        // Incoming wipe-in
        L.forEach((l, i) => A(l, [
          { clipPath: 'inset(0 0 0 100%)', opacity: 0, transform: 'translateX(0.15em)' },
          { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'translateX(0)' }
        ], 380, i * 32, 'cubic-bezier(.16,1,.3,1)'));
        await sleep(380 + L.length * 32);
      },

      // Family B: Fall From Above (descend with restrained bounce)
      async fall(L, outFont, inFont) {
        // Outgoing quick dip
        const outAnim = L.map((l, i) => A(l, [
          { transform: 'translateY(0)', opacity: 1 },
          { transform: 'translateY(0.3em) scale(0.96)', opacity: 0 }
        ], 180, i * 15, 'ease-in', 'forwards'));
        await sleep(180 + L.length * 15 + 40);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        // Incoming fall with restrained squash/stretch bounce
        L.forEach((l, i) => A(l, [
          { transform: 'translateY(-1.2em) scale(0.88, 1.16)', opacity: 0 },
          { transform: 'translateY(0) scale(1.12, 0.88)', opacity: 1, offset: 0.55 },
          { transform: 'translateY(-0.16em) scale(0.98, 1.02)', offset: 0.76 },
          { transform: 'translateY(0) scale(1)', offset: 1.0 }
        ], 620, i * 48, 'cubic-bezier(.3,.7,.4,1)'));
        await sleep(620 + L.length * 48);
      },

      // Family C: Dissolve -> Reassemble (break into soft dissolve, reassemble)
      async dissolve(L, outFont, inFont) {
        // Outgoing dissolve
        const outAnim = L.map((l, i) => A(l, [
          { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
          { opacity: 0, filter: 'blur(10px)', transform: 'scale(0.92)' }
        ], 220, i * 18, 'ease-in', 'forwards'));
        await sleep(220 + L.length * 18 + 60);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        // Incoming reassemble
        const order = L.map((_, i) => i).sort(() => Math.random() - 0.5);
        L.forEach((l, i) => A(l, [
          { opacity: 0, filter: 'blur(10px)', transform: 'scale(1.18)' },
          { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }
        ], 480, order.indexOf(i) * 36, 'cubic-bezier(.2,.9,.3,1)'));
        await sleep(480 + L.length * 36);
      },

      // Family D: Stretch -> Snap (vertical stretch and elastic settle)
      async stretch_snap(L, outFont, inFont) {
        // Outgoing stretch
        L.forEach(l => { l.style.transformOrigin = '50% 100%'; });
        const outAnim = L.map((l, i) => A(l, [
          { transform: 'scaleY(1)', opacity: 1 },
          { transform: 'scaleY(1.35) scaleX(0.85)', opacity: 0 }
        ], 210, i * 16, 'ease-in', 'forwards'));
        await sleep(210 + L.length * 16 + 50);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        // Incoming snap
        L.forEach((l, i) => {
          l.style.transformOrigin = '50% 100%';
          A(l, [
            { transform: 'scaleY(0) scaleX(1.3)', opacity: 0 },
            { transform: 'scaleY(1.22) scaleX(0.88)', opacity: 1, offset: 0.65 },
            { transform: 'scaleY(0.96) scaleX(1.02)', offset: 0.82 },
            { transform: 'scaleY(1) scaleX(1)', offset: 1.0 }
          ], 480, i * 40, 'cubic-bezier(.3,.8,.3,1)');
        });
        await sleep(480 + L.length * 40);
        L.forEach(l => l.style.removeProperty('transform-origin'));
      },

      // Family E: Blur -> Sharp (brief blur transition to crisp focus)
      async blur_sharp(L, outFont, inFont) {
        const outAnim = L.map((l, i) => A(l, [
          { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
          { opacity: 0, filter: 'blur(14px)', transform: 'scale(1.06)' }
        ], 220, i * 15, 'ease-in', 'forwards'));
        await sleep(220 + L.length * 15 + 40);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        L.forEach((l, i) => A(l, [
          { opacity: 0, filter: 'blur(16px)', transform: 'scale(1.2)' },
          { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }
        ], 580, i * 35, 'cubic-bezier(.16,1,.3,1)'));
        await sleep(580 + L.length * 35);
      },

      // Family F: Scanline Reveal (smooth moving horizontal mask)
      async scanline(L, outFont, inFont) {
        const outAnim = L.map(l => A(l, [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-0.14em)' }
        ], 180, 0, 'ease-in', 'forwards'));
        await sleep(220);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        // Wipe with a subtle luminous leading edge
        A(root, [
          { filter: 'brightness(1)' },
          { filter: 'brightness(1.35)', offset: 0.4 },
          { filter: 'brightness(1)' }
        ], 480, 0, 'ease-out');

        L.forEach((l, i) => A(l, [
          { clipPath: 'inset(0 100% 0 0)', opacity: 0, transform: 'translateX(-0.2em)' },
          { clipPath: 'inset(0 0 0 0)', opacity: 1, transform: 'translateX(0)' }
        ], 420, i * 50, 'cubic-bezier(.2,.8,.2,1)'));
        await sleep(420 + L.length * 50);
      },

      // Family G: Tilt -> Rebound (playful rotation with elastic settling)
      async tilt_rebound(L, outFont, inFont) {
        const outAnim = L.map((l, i) => A(l, [
          { opacity: 1, transform: 'rotate(0deg) translateY(0)' },
          { opacity: 0, transform: `rotate(${i % 2 === 0 ? -12 : 12}deg) translateY(0.25em)` }
        ], 200, i * 16, 'ease-in', 'forwards'));
        await sleep(200 + L.length * 16 + 50);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        L.forEach((l, i) => {
          const deg = i % 2 === 0 ? -16 : 16;
          A(l, [
            { opacity: 0, transform: `rotate(${deg}deg) translateY(-0.4em) scale(0.85)` },
            { opacity: 1, transform: `rotate(${-deg * 0.3}deg) translateY(0.06em) scale(1.05)`, offset: 0.65 },
            { transform: 'rotate(0deg) translateY(0) scale(1)', offset: 1.0 }
          ], 520, i * 42, 'cubic-bezier(.34,1.56,.64,1)');
        });
        await sleep(520 + L.length * 42);
      },

      // Family H: Pixel Dissolve (retro block mask / stepped scale pop)
      async pixel_dissolve(L, outFont, inFont) {
        const orderOut = L.map((_, i) => i).sort(() => Math.random() - 0.5);
        const outAnim = L.map((l, i) => A(l, [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0.2, transform: 'scale(0.8)', offset: 0.5 },
          { opacity: 0, transform: 'scale(0.4)' }
        ], 240, orderOut.indexOf(i) * 20, 'steps(4, jump-none)', 'forwards'));
        await sleep(240 + L.length * 20 + 50);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        const orderIn = L.map((_, i) => i).sort(() => Math.random() - 0.5);
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'scale(0.35)' },
          { opacity: 1, transform: 'scale(1.22)', offset: 0.35 },
          { opacity: 0.6, transform: 'scale(0.88)', offset: 0.6 },
          { opacity: 1, transform: 'scale(1)' }
        ], 440, orderIn.indexOf(i) * 44, 'steps(4, jump-none)'));
        await sleep(440 + L.length * 44);
      },

      // Family I: Flash-Cut (punchy micro visual cut, zero strobing)
      async flash_cut(L, outFont, inFont) {
        // Micro flash bloom on root
        A(root, [
          { filter: 'brightness(1) scale(1)', opacity: 1 },
          { filter: 'brightness(1.5) scale(1.03)', opacity: 0.9, offset: 0.4 },
          { filter: 'brightness(1) scale(1)', opacity: 1 }
        ], 220, 0, 'cubic-bezier(.2,.9,.3,1)');

        await sleep(90);
        applyPersonality(inFont);

        L.forEach((l, i) => A(l, [
          { opacity: 0.4, transform: 'scale(1.08)' },
          { opacity: 1, transform: 'scale(1)' }
        ], 240, i * 14, 'cubic-bezier(.2,.9,.3,1)'));
        await sleep(240 + L.length * 14);
      },

      // Family J: Font Roulette (controlled brief shuffle through 3-4 styles before settling)
      async roulette(L, outFont, inFont) {
        const pool = readyPersonalities.filter(p => p.id !== inFont.id);
        const steps = 3;
        const fsBase = parseFloat(getComputedStyle(root).fontSize) || 44;
        const slotW = L.map((l, i) => (measure(inFont, TEXT[i]).width || 30) * fsBase / 100);
        L.forEach((l, i) => { l.style.width = Math.ceil(slotW[i]) + 'px'; });

        for (let s = 0; s < steps; s++) {
          await vis();
          L.forEach(l => {
            const randFont = pick(pool) || inFont;
            const target = (randFont.noDot && l.textContent === '.') ? anchorLogo : randFont;
            l.style.fontFamily = `"${target.fam}", sans-serif`;
            l.style.fontWeight = target.w || '400';
            l.style.fontSize = (randFont.k || 1) + 'em';
            l.style.top = ((randFont.dy || 0) / 100) + 'em';
          });
          await sleep(90);
        }

        // Lock onto incoming font with amber flash
        applyPersonality(inFont);
        L.forEach((l, i) => {
          l.classList.add('lock');
          const tid = setTimeout(() => l.classList.remove('lock'), 350);
          activeTimers.push(tid);
        });
        await sleep(350);
        L.forEach(l => l.style.removeProperty('width'));
      },

      // Family K: Typewriter Reveal (sequential reveal with tracking cursor)
      async typewriter(L, outFont, inFont) {
        // Outgoing fast blur fade
        const outAnim = L.map(l => A(l, [
          { opacity: 1 },
          { opacity: 0 }
        ], 140, 0, 'ease-in', 'forwards'));
        await sleep(160);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);
        L.forEach(l => { l.style.opacity = '0'; });

        const step = 68;
        L.forEach((l, i) => {
          activeTimers.push(setTimeout(() => {
            l.style.opacity = '1';
            L.forEach(x => x.classList.remove('cur'));
            l.classList.add('cur');
          }, i * step));
        });

        const totalTyping = L.length * step;
        await sleep(totalTyping);
        activeTimers.push(setTimeout(() => {
          L.forEach(x => x.classList.remove('cur'));
        }, 400));
        await sleep(400);
        L.forEach(l => l.style.removeProperty('opacity'));
      },

      // Family L: Flip / Layered Transformation (3D perspective card flip)
      async flip(L, outFont, inFont) {
        const outAnim = L.map((l, i) => A(l, [
          { opacity: 1, transform: 'perspective(500px) rotateX(0deg) translateY(0)' },
          { opacity: 0, transform: 'perspective(500px) rotateX(85deg) translateY(-0.15em)' }
        ], 200, i * 22, 'ease-in', 'forwards'));
        await sleep(200 + L.length * 22 + 40);
        outAnim.forEach(a => a.cancel());

        applyPersonality(inFont);

        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'perspective(500px) rotateX(-85deg) translateY(0.15em)' },
          { opacity: 1, transform: 'perspective(500px) rotateX(0deg) translateY(0)' }
        ], 440, i * 40, 'cubic-bezier(.2,.8,.2,1)'));
        await sleep(440 + L.length * 40);
      }
    };

    /* ==========================================================================
       Non-Repeating Queue & Intelligent Pairing
       ========================================================================== */
    let personalityQueue = [];
    let lastPersonality = null;
    let lastTransition = null;
    const recentPairs = []; // window of 'fontId:transition' to avoid repetition

    function getNextPersonality() {
      if (!readyPersonalities.length) return null;
      if (!personalityQueue.length) {
        // Re-shuffle all ready personalities
        personalityQueue = [...readyPersonalities].sort(() => Math.random() - 0.5);
        // Avoid starting the new round with the exact same personality
        if (personalityQueue.length > 1 && personalityQueue[0].id === (lastPersonality && lastPersonality.id)) {
          personalityQueue.push(personalityQueue.shift());
        }
      }
      const next = personalityQueue.shift();
      return next;
    }

    function pickTransition(nextFont) {
      const allowed = (nextFont.transitions && nextFont.transitions.length)
        ? nextFont.transitions
        : Object.keys(TRANSITIONS);

      // Filter out immediate previous transition if possible
      let candidates = allowed.filter(t => t !== lastTransition && TRANSITIONS[t]);
      if (!candidates.length) candidates = allowed.filter(t => TRANSITIONS[t]);
      if (!candidates.length) candidates = ['erase', 'blur_sharp', 'fall'];

      // Prefer pairs not seen recently in memory
      const freshCandidates = candidates.filter(t => !recentPairs.includes(`${nextFont.id}:${t}`));
      const chosen = pick(freshCandidates.length ? freshCandidates : candidates) || 'erase';

      // Update memory window (keep last 6 pairs)
      recentPairs.push(`${nextFont.id}:${chosen}`);
      if (recentPairs.length > 6) recentPairs.shift();

      lastTransition = chosen;
      return chosen;
    }

    /* ==========================================================================
       Living Title Animation Lifecycle
       ========================================================================== */
    let isLooping = false;
    let cycleCount = 0;

    async function runCycle() {
      const nextFont = getNextPersonality();
      if (!nextFont) return;

      const transitionName = pickTransition(nextFont);
      const transitionFn = TRANSITIONS[transitionName] || TRANSITIONS.erase;

      // 1. Execute expressive transition
      await vis();
      resetLetterAnimations();
      try {
        await transitionFn(letters, lastPersonality || nextFont, nextFont);
      } catch (e) {
        // Fallback safety
        applyPersonality(nextFont);
      }
      resetLetterAnimations();
      applyPersonality(nextFont);
      lastPersonality = nextFont;
      cycleCount++;

      // 2. Settle completely & hold still (readable and distinct brand presence)
      await vis();
      const isExtended = (cycleCount % EXTENDED_REST_EVERY_N === 0);
      const holdTime = isExtended ? EXTENDED_REST_MS : rand(DISPLAY_HOLD_MIN, DISPLAY_HOLD_MAX);
      await sleep(holdTime);
    }

    async function startLivingCycle() {
      if (isLooping) return;
      isLooping = true;
      try {
        while (!reduceMotion) {
          await vis();
          await runCycle();
        }
      } catch (err) {
        // Safe exit
      } finally {
        isLooping = false;
      }
    }

    /* ==========================================================================
       Boot & Reduced Motion Handling
       ========================================================================== */
    buildLetters();

    let reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.matchMedia) {
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = e => {
        reduceMotion = e.matches;
        if (reduceMotion) {
          resetLetterAnimations();
          applyPersonality(anchorLogo);
        } else if (!isLooping && readyPersonalities.length >= 2) {
          startLivingCycle();
        }
      };
      if (mq.addEventListener) {
        mq.addEventListener('change', handleMotionChange);
      } else if (mq.addListener) {
        mq.addListener(handleMotionChange);
      }
    }

    (async () => {
      // 1. Preload primary anchor logo font
      try {
        await loadFont(PERSONALITIES[0]);
        readyPersonalities.push(PERSONALITIES[0]);
        anchorLogo = PERSONALITIES[0];
      } catch (err) {
        console.warn('[VATSAL.LOL] Primary logo font failed to load, falling back to alternative.', err);
      }

      // 2. Load remaining personalities in parallel
      const rest = PERSONALITIES.slice(1);
      const loads = rest.map(p =>
        loadFont(p).then(
          () => { readyPersonalities.push(p); },
          () => { /* Exclude unavailable font safely */ }
        )
      );

      // Fast-boot: give fast fonts up to 1000ms, then begin experience
      await Promise.race([Promise.all(loads), sleep(1000)]);

      if (!readyPersonalities.includes(anchorLogo) && readyPersonalities.length > 0) {
        anchorLogo = readyPersonalities[0];
      }

      // Display initial personality
      const initialFont = readyPersonalities[0] || anchorLogo;
      lastPersonality = initialFont;
      applyPersonality(initialFont);

      // If user prefers reduced motion, remain static
      if (reduceMotion) return;

      // Initial expressive entrance on page opening
      try {
        await TRANSITIONS.fall(letters, initialFont, initialFont);
      } catch (e) {
        applyPersonality(initialFont);
      }
      resetLetterAnimations();
      applyPersonality(initialFont);

      // Settle on initial personality
      await sleep(DISPLAY_HOLD_MIN);

      // Begin perpetual living title cycle
      if (readyPersonalities.length >= 2) {
        startLivingCycle();
      }
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLivingTitle);
  } else {
    initLivingTitle();
  }
})();
