/* ==========================================================================
   VATSAL.LOL animated title
   Vanilla JS only. Local woff2 fonts only. No CDN, no external libraries.

   Usage:
     <h1 data-vatsal-title data-font-base="assets/fontsource/" aria-label="VATSAL.LOL">VATSAL.LOL</h1>
     <script src="assets/vatsal-title.js" defer></script>
   ========================================================================== */
(() => {
  'use strict';

  function initTitle() {
    const root = document.querySelector('[data-vatsal-title]');
    if (!root || root.dataset.vtInitialized) return;
    root.dataset.vtInitialized = 'true';

    /* ---------- config ---------- */
    const TEXT = 'VATSAL.LOL';
    const rawBase = root.getAttribute('data-font-base') || 'assets/fontsource/';
    const BASE = rawBase.replace(/\/?$/, '/');
    const HOLD_LOGO = 4200;   // ms the logo font rests (keeps title still most of the time)
    const HOLD_FONT = 1800;   // ms each personality font rests

    // fx = entrance effects to pick from (random one each time)
    const FONTS = [
      { file: 'vatsal-logo-font.woff2',                    logo: true },
      { file: 'Oxanium-VariableFont_wght.woff2',           fx: ['wipe', 'flip'],            w: '800' },
      { file: 'JetBrainsMono-Bold.woff2',                  fx: ['type'] },
      { file: 'PixelifySans-VariableFont_wght (1).woff2',  fx: ['pixel'],                   w: '700' },
      { file: 'Syne-VariableFont_wght.woff2',              fx: ['stretch', 'flip'],         w: '800' },
      { file: 'BankGothic Bold.woff2',                     fx: ['flip', 'wipe'] },
      { file: 'BigParty4Blue.woff2',                       fx: ['bounce'] },
      { file: 'Crackman.woff2',                            fx: ['pixel', 'bounce'] },
      { file: 'Deliberate Projection Demo.woff2',          fx: ['blur'],                    noDot: true },
      { file: 'Deliberate Projection Demo-2.woff2',        fx: ['blur', 'flicker'],         noDot: true },
      { file: 'MIDELTANK_Demo.woff2',                      fx: ['slam'] },
      { file: 'modernline bold.woff2',                     fx: ['flip', 'stretch'] },
      { file: 'MysteryQuest-Regular.woff2',                fx: ['blur', 'flicker'] },
      { file: 'OperationNapalm-Italic.woff2',              fx: ['slam'] },
      { file: 'Pricedown Bl.woff2',                        fx: ['slam', 'bounce'] },
      { file: 'Priestacy.woff2',                           fx: ['blur', 'wipe'] },
      { file: 'ROGENZ.woff2',                              fx: ['glitch'] },
      { file: 'Rostex-Oblique.woff2',                      fx: ['wipe', 'glitch'] },
      { file: 'RusticRoadway.woff2',                       fx: ['slam', 'stretch'] },
      { file: 'SDCyberPunkCityDemo.woff2',                 fx: ['glitch', 'flicker'],       noDot: true },
      { file: 'TerminalVision.woff2',                      fx: ['type', 'flicker'] },
      { file: 'TypoWriter Bold Demo.woff2',                fx: ['type'],                    noDot: true },
      { file: 'TypoWriter Regular Demo.woff2',             fx: ['type'],                    noDot: true },
      { file: 'Whimsy Pops Regular.woff2',                 fx: ['bounce'] },
      { file: 'Whimsy Pops Slant.woff2',                   fx: ['bounce', 'flip'] },
    ];
    FONTS.forEach((f, i) => { f.fam = 'vt-font-' + i; });
    let activeLogo = FONTS[0];

    /* ---------- styles (injected, scoped to the component) ---------- */
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
  transition: color .28s ease, text-shadow .5s ease;
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
    const style = document.createElement('style');
    style.id = 'vt-title-styles';
    style.textContent = css;
    document.head.appendChild(style);

    /* ---------- helpers ---------- */
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = arr => (arr && arr.length ? arr[(Math.random() * arr.length) | 0] : null);
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const sleep = ms => new Promise(r => {
      const id = setTimeout(r, ms);
      cursorTimers.push(id);
    });

    // Pause when tab is hidden, reduced motion is requested, or title is scrolled out of view
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

    /* ---------- fonts: load + measure ---------- */
    const cv = document.createElement('canvas').getContext('2d');
    const mc = new Map();
    function measure(font, str) {
      const f = font || activeLogo;
      const key = (f.fam || 'sans-serif') + '|' + (f.w || '400') + '|' + str;
      if (!mc.has(key)) {
        cv.font = `${f.w || 400} 100px "${f.fam}", sans-serif`;
        mc.set(key, cv.measureText(str));
      }
      return mc.get(key);
    }

    function calibrate(font, reference) {
      const ref = reference || activeLogo || font;
      const V = measure(font, 'V');
      font.tw = measure(font, TEXT).width || 300;
      font.cap = V.actualBoundingBoxAscent || 70;
      const asc = V.fontBoundingBoxAscent || V.actualBoundingBoxAscent || 70;
      const desc = V.fontBoundingBoxDescent || V.actualBoundingBoxDescent || 20;
      font.bl = (100 - (asc + desc)) / 2 + asc;
      font.dy = 50 - (font.bl - font.cap / 2);
      if (isNaN(font.dy)) font.dy = 0;
    }

    function normalise(font, reference) {
      const ref = reference || activeLogo || font;
      const refTw = ref.tw || 300;
      const refCap = ref.cap || 70;
      const kw = refTw / (font.tw || refTw);
      const kh = (refCap / (font.cap || refCap)) * 1.15;
      font.k = font.logo ? 1 : clamp(Math.min(kw, kh), 0.65, 1.35);
      if (isNaN(font.k) || font.k <= 0) font.k = 1;
    }

    const ready = []; // fonts that loaded OK
    async function loadFont(font) {
      const url = BASE + encodeURI(font.file);
      const ff = new FontFace(font.fam, `url("${url}") format("woff2")`, font.w ? { weight: font.w } : {});
      await ff.load();
      document.fonts.add(ff);
      return font;
    }

    /* ---------- letters ---------- */
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

    function applyFont(l, font) {
      const f = font || activeLogo;
      const targetFont = (f.noDot && l.textContent === '.') ? activeLogo : f;
      if (targetFont.fam) {
        l.style.fontFamily = `"${targetFont.fam}", sans-serif`;
      }
      l.style.fontWeight = targetFont.w || '400';
      l.style.fontSize = (targetFont.k || 1) + 'em';
      l.style.top = ((targetFont.dy || 0) / 100) + 'em';
    }

    const cursorTimers = [];
    function resetLetters() {
      cursorTimers.forEach(clearTimeout);
      cursorTimers.length = 0;
      letters.forEach(l => {
        l.getAnimations().forEach(a => a.cancel());
        l.classList.remove('cur', 'lock');
        l.style.removeProperty('width');
        l.style.removeProperty('--fit');
        l.style.removeProperty('transform-origin');
      });
      root.getAnimations().forEach(a => a.cancel());
    }

    /* ---------- scramble -> logo ---------- */
    async function scrambleToLogo() {
      resetLetters();
      const fsBase = parseFloat(getComputedStyle(root).fontSize) || 44;
      const pool = ready.filter(f => !f.logo);
      if (!pool.length) pool.push(activeLogo);

      const slotW = letters.map((l, i) => (measure(activeLogo, TEXT[i]).width || 30) * fsBase / 100);
      letters.forEach((l, i) => { l.style.width = Math.ceil(slotW[i]) + 'px'; });

      const lockAt = i => 380 + i * 90;
      const locked = letters.map(() => false);
      const t0 = performance.now();

      for (;;) {
        await vis();
        const t = performance.now() - t0;
        let all = true;
        letters.forEach((l, i) => {
          if (locked[i]) return;
          if (t >= lockAt(i)) {
            locked[i] = true;
            applyFont(l, activeLogo);
            l.style.removeProperty('--fit');
            l.classList.add('lock');
            const timer = setTimeout(() => l.classList.remove('lock'), 380);
            cursorTimers.push(timer);
          } else {
            all = false;
            let f = pick(pool) || activeLogo;
            let guard = 0;
            while (f.noDot && TEXT[i] === '.' && guard < 8 && pool.length > 1) {
              f = pick(pool) || activeLogo;
              guard++;
            }
            applyFont(l, f);
            const cw = (measure(f, TEXT[i]).width || 30) * fsBase / 100 * (f.k || 1);
            l.style.setProperty('--fit', Math.min(1, (slotW[i] * 1.2) / (cw || 1)).toFixed(3));
          }
        });
        if (all) break;
        await sleep(58);
      }
      await sleep(380); // let the amber lock settled
      letters.forEach(l => { l.style.removeProperty('width'); });
    }

    /* ---------- entrance effects ---------- */
    const A = (l, kf, dur, delay, easing) =>
      l.animate(kf, { duration: dur, delay: delay || 0, easing: easing || 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });

    const FX = {
      slam(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'scale(2.2) translateY(-0.6em)', filter: 'blur(8px)' },
          { opacity: 1, transform: 'scale(.92)', filter: 'blur(0)', offset: .62 },
          { transform: 'scale(1)' }], 380, i * 55, 'cubic-bezier(.2,.9,.3,1)'));
        root.animate([
          { transform: 'translate(0,0)' }, { transform: 'translate(-4px,2px)' },
          { transform: 'translate(4px,-2px)' }, { transform: 'translate(-1px,1px)' }, { transform: 'translate(0,0)' }],
          { duration: 260, delay: L.length * 55 * .55 });
        return 380 + L.length * 55;
      },
      bounce(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'translateY(-1.2em) scale(.85,1.2)' },
          { opacity: 1, transform: 'translateY(0) scale(1.18,.82)', offset: .5 },
          { transform: 'translateY(-0.25em) scale(.97,1.04)', offset: .72 },
          { transform: 'translateY(0) scale(1)' }], 680, i * 70, 'cubic-bezier(.3,.7,.4,1)'));
        return 680 + L.length * 70;
      },
      flip(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'perspective(500px) rotateX(-95deg) translateY(.2em)' },
          { opacity: 1, transform: 'perspective(500px) rotateX(0) translateY(0)' }], 460, i * 60));
        return 460 + L.length * 60;
      },
      blur(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, filter: 'blur(16px)', transform: 'scale(1.25)' },
          { opacity: 1, filter: 'blur(0)', transform: 'scale(1)' }], 720, i * 45));
        return 720 + L.length * 45;
      },
      stretch(L) {
        L.forEach((l, i) => {
          l.style.transformOrigin = '50% 100%';
          A(l, [
            { opacity: 0, transform: 'scaleY(0)' },
            { opacity: 1, transform: 'scaleY(1.22)', offset: .7 },
            { transform: 'scaleY(1)' }], 520, i * 50, 'cubic-bezier(.3,.8,.3,1)');
        });
        return 520 + L.length * 50;
      },
      wipe(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-.25em)' },
          { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' }], 420, i * 65));
        return 420 + L.length * 65;
      },
      pixel(L) {
        const order = L.map((_, i) => i).sort(() => Math.random() - .5);
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'scale(.4)' },
          { opacity: 1, transform: 'scale(1.25)', offset: .25 },
          { opacity: 0, transform: 'scale(.8)', offset: .45 },
          { opacity: 1, transform: 'scale(1.1)', offset: .65 },
          { opacity: 1, transform: 'scale(1)' }], 480, order.indexOf(i) * 55, 'steps(5, jump-none)'));
        return 480 + L.length * 55;
      },
      glitch(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, transform: 'translateX(-.3em) skewX(28deg)', textShadow: '.06em 0 #2ee6ff, -.06em 0 #DDA135' },
          { opacity: 1, transform: 'translateX(.14em) skewX(-14deg)', textShadow: '-.06em 0 #2ee6ff, .06em 0 #DDA135', offset: .2 },
          { opacity: .25, transform: 'translateX(-.08em)', textShadow: '.08em 0 #2ee6ff, -.08em 0 #DDA135', offset: .38 },
          { opacity: 1, transform: 'translateX(.05em) skewX(6deg)', textShadow: '-.04em 0 #2ee6ff, .04em 0 #DDA135', offset: .6 },
          { opacity: 1, transform: 'none', textShadow: '0 0 0 transparent' }], 560, i * 42 + rand(0, 60), 'linear'));
        return 560 + L.length * 42 + 60;
      },
      flicker(L) {
        L.forEach((l, i) => A(l, [
          { opacity: 0, textShadow: '0 0 0 transparent' },
          { opacity: 1, textShadow: '0 0 .5em #DDA135', offset: .12 },
          { opacity: .15, textShadow: '0 0 0 transparent', offset: .22 },
          { opacity: 1, textShadow: '0 0 .45em #DDA135', offset: .4 },
          { opacity: .3, textShadow: '0 0 .2em #DDA135', offset: .52 },
          { opacity: 1, textShadow: '0 0 .35em #DDA135', offset: .7 },
          { opacity: 1, textShadow: '0 0 0 transparent' }], 800, i * 80, 'linear'));
        return 800 + L.length * 80;
      },
      type(L) {
        const step = 82;
        L.forEach((l, i) => {
          A(l, [{ opacity: 0 }, { opacity: 1 }], 1, i * step, 'steps(1)');
          cursorTimers.push(setTimeout(() => {
            L.forEach(x => x.classList.remove('cur'));
            l.classList.add('cur');
          }, i * step));
        });
        cursorTimers.push(setTimeout(() => {
          L.forEach(x => x.classList.remove('cur'));
        }, L.length * step + 450));
        return L.length * step + 200;
      },
    };

    function exitAll() {
      letters.forEach((l, i) => l.animate(
        [{ opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
         { opacity: 0, filter: 'blur(5px)', transform: 'translateY(-.12em)' }],
        { duration: 170, delay: i * 10, easing: 'ease-in', fill: 'forwards' }));
      return sleep(170 + letters.length * 10);
    }

    /* ---------- non-repeating personality queue ---------- */
    let queue = [];
    let lastFont = null;
    function getNextPersonalityFont() {
      const pool = ready.filter(f => !f.logo);
      if (!pool.length) return null;
      if (!queue.length) {
        queue = [...pool].sort(() => Math.random() - 0.5);
        if (queue.length > 1 && queue[0] === lastFont) {
          queue.push(queue.shift());
        }
      }
      const f = queue.shift();
      lastFont = f;
      return f;
    }

    /* ---------- main loop ---------- */
    let isLooping = false;
    async function loop() {
      if (isLooping) return;
      isLooping = true;
      try {
        while (!reduceMotion) {
          await vis();
          // 1. Scramble and resolve to the recognizable logo
          await scrambleToLogo();
          root.classList.add('vt-glow');
          await vis();
          await sleep(HOLD_LOGO);
          root.classList.remove('vt-glow');

          // 2. Occasionally introduce one personality font
          const nextFont = getNextPersonalityFont();
          if (nextFont && !reduceMotion) {
            await vis();
            await exitAll();
            resetLetters();
            letters.forEach(l => applyFont(l, nextFont));
            const fxList = (nextFont.fx && nextFont.fx.length) ? nextFont.fx : ['type', 'bounce', 'wipe', 'flip', 'blur'];
            const fxName = pick(fxList) || 'wipe';
            const fxFn = FX[fxName] || FX.wipe;
            const animDuration = fxFn(letters);
            await sleep(animDuration + HOLD_FONT);
            await vis();
            await exitAll();
          }
        }
      } catch (e) {
        // Safe exit
      } finally {
        isLooping = false;
      }
    }

    /* ---------- boot ---------- */
    buildLetters();

    let reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.matchMedia) {
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = e => {
        reduceMotion = e.matches;
        if (reduceMotion) {
          resetLetters();
          letters.forEach(l => applyFont(l, activeLogo));
        } else if (!isLooping && ready.length >= 2) {
          loop();
        }
      };
      if (mq.addEventListener) {
        mq.addEventListener('change', handleMotionChange);
      } else if (mq.addListener) {
        mq.addListener(handleMotionChange);
      }
    }

    (async () => {
      // 1. Load logo font
      let logoLoaded = false;
      try {
        await loadFont(FONTS[0]);
        logoLoaded = true;
      } catch (err) {
        console.warn('[VATSAL.LOL Title] Primary logo font failed to load. Falling back to alternative.', err);
      }

      // 2. Load remaining fonts
      const rest = FONTS.slice(1);
      const loads = rest.map(f =>
        loadFont(f).then(
          () => { ready.push(f); },
          () => { /* Exclude unavailable font safely */ }
        )
      );

      // Give quick fonts up to 1200ms to arrive
      await Promise.race([Promise.all(loads), sleep(1200)]);

      if (logoLoaded) {
        activeLogo = FONTS[0];
        ready.unshift(activeLogo);
      } else if (ready.length > 0) {
        // Fallback to first verified available font
        activeLogo = ready[0];
        activeLogo.logo = true;
      } else {
        // System fallback
        activeLogo = { fam: 'sans-serif', w: '700', logo: true };
      }

      // Calibrate and normalize all ready fonts against activeLogo
      ready.forEach(f => {
        calibrate(f, activeLogo);
        normalise(f, activeLogo);
      });

      // Apply initial logo font
      letters.forEach(l => applyFont(l, activeLogo));

      if (reduceMotion) return; // Keep static on reduced motion
      if (ready.length < 2) return; // Need at least 2 fonts to animate

      loop();
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTitle);
  } else {
    initTitle();
  }
})();
