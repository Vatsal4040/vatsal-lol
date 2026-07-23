/* ═══════════════════════════════════════════════════════════════
   FOCUS V1.1 — focus.js
   VATSAL.LOL V2.5 Compliant
   Modular vanilla JS. No frameworks. No dependencies.
   ═══════════════════════════════════════════════════════════════

   ARCHITECTURE
   ────────────
   CONTENT    — Passages, questions, reading titles, motivational messages
   CONFIG     — Mode definitions (WPM levels, level count, content pool)
   AUDIO      — Web Audio API sound effects
   STATE      — Single mutable game state object
   UI         — DOM reads/writes, section transitions
   GAME       — Core gameplay logic (mode-agnostic)
   DAILY      — Deterministic daily seed generation
   INIT       — Event bindings and startup

   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════
   CONTENT
   ══════════════════════════════════════════════════════════════ */

const READING_TITLES = {
  50:  'School Dictation Speed',
  100: 'Careful Reader',
  150: 'Steady Reader',
  200: 'Normal Reading Speed',
  250: 'Comfortable Reader',
  300: 'Focused Reader',
  400: 'Fast Reader',
  450: 'Rapid Reader',
  500: 'Advanced Reader',
  600: 'Elite Reader',
  700: 'Speed Reader',
  800: 'Eagle Eye',
};

const MOTIVATIONAL_MESSAGES = [
  'Stay focused.',
  'Every word matters.',
  'Blink and you\'ll miss it.',
  'Trust your memory.',
  'Focus beats speed.',
  'Read carefully.',
  'One word at a time.',
  'Don\'t look away.',
  'You\'ve got this.',
  'Concentration is a skill.',
];

const SPECIAL_800_MESSAGE = 'YOU ARE A BOT!\nJust kidding.\nFOCUS MASTER ACHIEVED.';

/* ── CLASSIC / DAILY / EAGLE EYE PASSAGES ───────────────────── */
/* Longer passages with finer detail recall for Eagle Eye.        */

const PASSAGES_STANDARD = [
  {
    text: "The old lighthouse stood at the edge of the rocky cliff and its beam swept across the dark water every ten seconds.",
    question: "How often did the lighthouse beam sweep?",
    correct: "Every ten seconds",
    wrong: ["Every five seconds", "Every thirty seconds", "Every minute"]
  },
  {
    text: "Maya packed her blue backpack with three apples a water bottle and her favourite mystery novel before heading to the train station.",
    question: "What colour was Maya's backpack?",
    correct: "Blue",
    wrong: ["Red", "Green", "Yellow"]
  },
  {
    text: "The farmer planted rows of sunflowers along the southern fence and watered them every morning at six.",
    question: "When did the farmer water the sunflowers?",
    correct: "Every morning at six",
    wrong: ["Every evening at six", "Twice a day", "Once a week"]
  },
  {
    text: "Three dolphins leaped over the bow of the sailboat as it crossed the turquoise bay near the small island.",
    question: "How many dolphins leaped over the sailboat?",
    correct: "Three",
    wrong: ["Two", "Four", "Five"]
  },
  {
    text: "The chef added a pinch of sea salt and two cloves of garlic to the pot before turning the heat down to low.",
    question: "How many cloves of garlic did the chef add?",
    correct: "Two",
    wrong: ["One", "Three", "Four"]
  },
  {
    text: "During the science fair Emma won first place with her project about how plants grow faster under blue light.",
    question: "What colour of light did Emma's project focus on?",
    correct: "Blue",
    wrong: ["Red", "Green", "Yellow"]
  },
  {
    text: "The postal worker delivered seventeen packages to the apartment building on Cedar Street before noon.",
    question: "How many packages were delivered?",
    correct: "Seventeen",
    wrong: ["Twelve", "Twenty", "Fifteen"]
  },
  {
    text: "After crossing the wooden bridge the hikers stopped to rest beside a small waterfall that fed into a clear stream.",
    question: "What did the hikers cross before resting?",
    correct: "A wooden bridge",
    wrong: ["A stone arch", "A rope bridge", "A metal gate"]
  },
  {
    text: "The library opened a new reading room on the second floor with floor-to-ceiling windows and twelve long tables.",
    question: "How many long tables were in the new reading room?",
    correct: "Twelve",
    wrong: ["Eight", "Ten", "Sixteen"]
  },
  {
    text: "Lucas trained for six months before his first marathon and crossed the finish line in just under four hours.",
    question: "How long did Lucas train before his marathon?",
    correct: "Six months",
    wrong: ["Three months", "One year", "Eight months"]
  },
  {
    text: "The bakery on Fifth Avenue sold out of cinnamon rolls by eight in the morning every single day last week.",
    question: "What did the bakery sell out of every day?",
    correct: "Cinnamon rolls",
    wrong: ["Croissants", "Blueberry muffins", "Sourdough loaves"]
  },
  {
    text: "A red fox appeared at the edge of the garden just after sunset and watched the house for several minutes.",
    question: "When did the red fox appear?",
    correct: "Just after sunset",
    wrong: ["At noon", "Just before sunrise", "Late at night"]
  },
  {
    text: "The astronaut spent two hundred and fifteen days on the space station before returning safely to Earth.",
    question: "How many days did the astronaut spend on the station?",
    correct: "Two hundred and fifteen",
    wrong: ["One hundred and ninety", "Two hundred and fifty", "Three hundred"]
  },
  {
    text: "The coral reef stretched for forty kilometres along the coast and was home to over three hundred species of fish.",
    question: "How long did the coral reef stretch along the coast?",
    correct: "Forty kilometres",
    wrong: ["Twenty kilometres", "Sixty kilometres", "Eighty kilometres"]
  },
  {
    text: "Sophia found an old silver coin dated eighteen forty-two buried beneath the roots of an oak tree in her garden.",
    question: "What was the date on the silver coin?",
    correct: "Eighteen forty-two",
    wrong: ["Eighteen ninety", "Nineteen twelve", "Seventeen ninety-six"]
  },
  {
    text: "The northbound train departed at quarter past seven and was expected to arrive at Central Station in fifty minutes.",
    question: "How long was the train journey expected to take?",
    correct: "Fifty minutes",
    wrong: ["Thirty minutes", "One hour", "Twenty minutes"]
  },
  {
    text: "A team of four researchers discovered a cave network beneath the desert that stretched for over two kilometres underground.",
    question: "How many researchers found the cave network?",
    correct: "Four",
    wrong: ["Two", "Six", "Eight"]
  },
  {
    text: "The annual kite festival drew over ten thousand visitors to the beach park on a sunny Saturday morning.",
    question: "When was the kite festival held?",
    correct: "On a sunny Saturday morning",
    wrong: ["On a rainy Sunday afternoon", "On a Friday evening", "On a cloudy Tuesday"]
  },
  {
    text: "The mountain goat climbed to the top of the ridge in less than four minutes surprising the watching hikers below.",
    question: "How quickly did the mountain goat reach the ridge?",
    correct: "In less than four minutes",
    wrong: ["In about ten minutes", "In less than two minutes", "In about seven minutes"]
  },
  {
    text: "Oliver packed his camping gear into a green duffel bag and drove two hours north to reach the pine forest.",
    question: "How long did Oliver drive to reach the forest?",
    correct: "Two hours",
    wrong: ["One hour", "Three hours", "Four hours"]
  }
];

/* ── KIDS PASSAGES ───────────────────────────────────────────── */
/* Short, simple vocabulary, direct recall questions.             */

const PASSAGES_KIDS = [
  {
    text: "Tom has a big red ball he plays with his dog in the park every afternoon.",
    question: "What colour is Tom's ball?",
    correct: "Red",
    wrong: ["Blue", "Green", "Yellow"]
  },
  {
    text: "Sara got a new yellow pencil case for her birthday with five colourful pens inside.",
    question: "How many pens were inside the pencil case?",
    correct: "Five",
    wrong: ["Three", "Seven", "Two"]
  },
  {
    text: "The little cat sat on the warm mat next to the window and watched the birds outside.",
    question: "Where did the cat sit?",
    correct: "On the mat next to the window",
    wrong: ["On the chair", "Under the table", "On the sofa"]
  },
  {
    text: "Ben ate two slices of toast with honey for breakfast before going to school.",
    question: "What did Ben put on his toast?",
    correct: "Honey",
    wrong: ["Jam", "Butter", "Peanut butter"]
  },
  {
    text: "The class planted bean seeds in small pots and put them on the sunny windowsill.",
    question: "Where did the class put their pots?",
    correct: "On the sunny windowsill",
    wrong: ["In the cupboard", "On their desks", "In the garden"]
  },
  {
    text: "Lily found three shiny stones on the beach and put them in her coat pocket.",
    question: "How many shiny stones did Lily find?",
    correct: "Three",
    wrong: ["Two", "Four", "Five"]
  },
  {
    text: "The dog buried his favourite blue toy under the big tree in the garden.",
    question: "What colour was the dog's toy?",
    correct: "Blue",
    wrong: ["Red", "Green", "Yellow"]
  },
  {
    text: "Mia drank a glass of cold orange juice and ate a banana before her swimming lesson.",
    question: "What did Mia drink before her lesson?",
    correct: "Cold orange juice",
    wrong: ["Milk", "Water", "Apple juice"]
  },
  {
    text: "Dad made a sandcastle with four towers and a flag on top at the beach.",
    question: "How many towers did the sandcastle have?",
    correct: "Four",
    wrong: ["Two", "Three", "Six"]
  },
  {
    text: "The rabbit hopped across the green field and stopped to eat a carrot near the fence.",
    question: "What did the rabbit eat?",
    correct: "A carrot",
    wrong: ["A leaf", "Some grass", "A berry"]
  },
  {
    text: "Jake counted eight birds sitting on the telephone wire outside his bedroom window.",
    question: "How many birds did Jake count?",
    correct: "Eight",
    wrong: ["Six", "Ten", "Four"]
  },
  {
    text: "The teacher wrote the spelling words in purple chalk on the big blackboard.",
    question: "What colour chalk did the teacher use?",
    correct: "Purple",
    wrong: ["White", "Yellow", "Blue"]
  }
];

/* ── EAGLE EYE PASSAGES ──────────────────────────────────────── */
/* Longer passages, multiple details, harder recall questions.    */

const PASSAGES_EAGLE = [
  {
    text: "Dr Chen arrived at the research station at five forty-five in the morning carrying a thermos of green tea and a leather notebook with her initials stamped in gold on the cover. She signed in at the front desk told the night guard she expected to be there until at least eleven and headed directly to Lab Three on the basement level.",
    question: "What time did Dr Chen arrive at the research station?",
    correct: "Five forty-five in the morning",
    wrong: ["Six fifteen in the morning", "Four thirty in the morning", "Seven o'clock in the morning"]
  },
  {
    text: "The cargo ship departed from Port Albrecht on the fourteenth of March carrying two hundred and thirty crates of machine parts bound for a manufacturing plant nine hundred kilometres south. The vessel was expected to reach its destination in four days provided the weather along the eastern route remained calm.",
    question: "How many crates was the cargo ship carrying?",
    correct: "Two hundred and thirty",
    wrong: ["Two hundred and fifty", "One hundred and ninety", "Three hundred and twelve"]
  },
  {
    text: "Professor Kimani had been studying the migration patterns of Arctic terns for eleven years when her team recorded the longest single flight ever documented: a bird that travelled fourteen thousand kilometres without stopping from its nesting ground in Iceland to its wintering ground off the coast of South Africa.",
    question: "How many years had Professor Kimani been studying Arctic terns?",
    correct: "Eleven years",
    wrong: ["Seven years", "Fifteen years", "Nine years"]
  },
  {
    text: "The old hotel had been built in eighteen ninety-one and had hosted three sitting prime ministers before being converted into a museum in two thousand and three. During renovation workers discovered a sealed room behind the east staircase containing forty-seven letters that had never been delivered.",
    question: "In what year was the hotel converted into a museum?",
    correct: "Two thousand and three",
    wrong: ["Nineteen ninety-eight", "Two thousand and seven", "Two thousand and eleven"]
  },
  {
    text: "Clara reviewed the data three times before she was confident: the temperature in the deep-water trench had dropped by two point six degrees Celsius over the past eighteen months while the salinity had increased by a factor of one point four compared to readings taken in the same location five years earlier.",
    question: "By how many degrees had the temperature in the trench dropped?",
    correct: "Two point six degrees Celsius",
    wrong: ["One point eight degrees Celsius", "Three point two degrees Celsius", "Four degrees Celsius"]
  },
  {
    text: "The relay team had trained together for two and a half years. In the final race the first runner completed her leg in forty-eight seconds passed the baton cleanly and watched her teammates finish the remaining three legs without a single error to win by a margin of less than one tenth of a second.",
    question: "How long had the relay team trained together?",
    correct: "Two and a half years",
    wrong: ["Three years", "One year", "Eighteen months"]
  },
  {
    text: "Amara kept a logbook of every book she had finished since she turned twelve. By the time she reached university she had recorded two hundred and sixty-one titles spanning thirty-one different countries of origin with Japan and Nigeria appearing most frequently in her list.",
    question: "How many titles had Amara recorded in her logbook?",
    correct: "Two hundred and sixty-one",
    wrong: ["Three hundred and twelve", "One hundred and ninety", "Two hundred and forty-four"]
  },
  {
    text: "The storm hit the island at eleven minutes past midnight. Within the first thirty minutes it had knocked out power to six of the island's nine districts uprooted more than two hundred trees and brought sixty-three millimetres of rain — more than the island typically receives in the entire month of November.",
    question: "How many of the island's districts lost power?",
    correct: "Six",
    wrong: ["Four", "Seven", "Nine"]
  }
];

/* ══════════════════════════════════════════════════════════════
   CONFIG — Mode definitions
   ══════════════════════════════════════════════════════════════ */

const MODES = {
  classic: {
    label:      'Classic',
    wpmLevels:  [100, 200, 300, 400, 500, 600, 700, 800],
    pool:       PASSAGES_STANDARD,
    icon:       '📖',
  },
  kids: {
    label:      'Kids',
    wpmLevels:  [50, 100, 150, 200, 250, 300],
    pool:       PASSAGES_KIDS,
    icon:       '🌟',
  },
  eagle: {
    label:      'Eagle Eye',
    wpmLevels:  [150, 300, 450, 600, 700, 800],
    pool:       PASSAGES_EAGLE,
    icon:       '🦅',
  },
  daily: {
    label:      'Daily',
    wpmLevels:  [100, 200, 300, 400, 500, 600],
    pool:       PASSAGES_STANDARD,
    icon:       '📅',
  },
};

/* ══════════════════════════════════════════════════════════════
   DAILY — Deterministic daily seed
   ══════════════════════════════════════════════════════════════ */

const Daily = (() => {
  /**
   * Returns an integer seed based on today's UTC date.
   * Same day → same seed → same passage sequence for all players.
   */
  function getTodaySeed() {
    const now = new Date();
    return now.getUTCFullYear() * 10000
           + (now.getUTCMonth() + 1) * 100
           + now.getUTCDate();
  }

  /** Simple seeded pseudo-random (mulberry32). */
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Returns an array of passage indexes (length = levelCount)
   * that is deterministic for today but unique each calendar day.
   */
  function getDailySequence(pool, levelCount) {
    const seed  = getTodaySeed();
    const rng   = makeRng(seed);
    const indexes = Array.from({ length: pool.length }, (_, i) => i);

    // Fisher-Yates with seeded rng
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    return indexes.slice(0, levelCount);
  }

  return { getDailySequence };
})();

/* ══════════════════════════════════════════════════════════════
   AUDIO
   ══════════════════════════════════════════════════════════════ */

const Audio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, duration, type = 'sine', volume = 0.28) {
    try {
      const c    = getCtx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type            = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.start();
      osc.stop(c.currentTime + duration);
    } catch (_) { /* audio not available */ }
  }

  function correct() {
    tone(523, 0.11);
    setTimeout(() => tone(659, 0.11), 95);
    setTimeout(() => tone(784, 0.17), 190);
  }

  function wrong() {
    tone(220, 0.14, 'sawtooth');
    setTimeout(() => tone(175, 0.18, 'sawtooth'), 120);
  }

  function levelComplete() {
    [440, 550, 660, 880].forEach((f, i) => setTimeout(() => tone(f, 0.1), i * 75));
  }

  function victory() {
    [440, 494, 523, 587, 659, 784, 880].forEach((f, i) =>
      setTimeout(() => tone(f, 0.16), i * 85)
    );
  }

  return { correct, wrong, levelComplete, victory };
})();

/* ══════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════ */

/**
 * Single source of truth for the current game run.
 * Reset completely at the start of each new game.
 */
let State = {};

function resetState(modeKey) {
  const mode = MODES[modeKey];
  State = {
    mode:           modeKey,
    modeLabel:      mode.label,
    wpmLevels:      mode.wpmLevels,
    pool:           mode.pool,
    levelIndex:     0,          // 0-based index into wpmLevels
    lives:          3,
    reReadUsed:     false,
    correctCount:   0,
    highestWpm:     0,
    usedPoolIndexes:[],         // pool indexes used this run
    dailySequence:  [],         // only populated for daily mode
    currentPassage: null,
    wordTimer:      null,
  };

  if (modeKey === 'daily') {
    State.dailySequence = Daily.getDailySequence(mode.pool, mode.wpmLevels.length);
  }
}

/* ══════════════════════════════════════════════════════════════
   UI — DOM helpers, section transitions
   ══════════════════════════════════════════════════════════════ */

const UI = (() => {
  const sections = {};

  function init() {
    document.querySelectorAll('.focus-section').forEach(el => {
      sections[el.id] = el;
    });
  }

  /**
   * Show one section, hide all others.
   * Scrolls to top of page so content is always visible.
   */
  function show(sectionId) {
    Object.values(sections).forEach(el => el.classList.remove('active'));
    const target = sections[sectionId];
    if (target) {
      target.classList.add('active');
      updateHeaderVisibility(sectionId);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function html(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function addClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.add(cls);
  }

  function removeClass(id, cls) {
    const el = document.getElementById(id);
    if (el) el.classList.remove(cls);
  }

  function setClass(id, cls, condition) {
    condition ? addClass(id, cls) : removeClass(id, cls);
  }

  function disable(id) {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
  }

  function enable(id) {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
  }

  return { init, show, text, html, addClass, removeClass, setClass, disable, enable };
})();

/* ══════════════════════════════════════════════════════════════
   GAME — Core gameplay logic
   ══════════════════════════════════════════════════════════════ */

const Game = (() => {

  /* ── Passage selection ────────────────────────────────────── */

  function pickPassageIndex() {
    if (State.mode === 'daily') {
      return State.dailySequence[State.levelIndex];
    }
    const available = State.pool
      .map((_, i) => i)
      .filter(i => !State.usedPoolIndexes.includes(i));

    if (available.length === 0) {
      // Pool exhausted (shouldn't happen with sufficient content)
      State.usedPoolIndexes = [];
      return Math.floor(Math.random() * State.pool.length);
    }
    return available[Math.floor(Math.random() * available.length)];
  }

  /* ── HUD ──────────────────────────────────────────────────── */

  function updateHud() {
    const wpm   = State.wpmLevels[State.levelIndex];
    const level = State.levelIndex + 1;

    UI.text('js-hud-level', level);
    UI.text('js-hud-wpm',   wpm);

    const heartsEl = document.getElementById('js-hud-lives');
    if (heartsEl) {
      heartsEl.querySelectorAll('.heart').forEach((h, i) => {
        h.classList.toggle('lost', i >= State.lives);
      });
      heartsEl.setAttribute('aria-label', `${State.lives} lives remaining`);
    }

    UI.setClass('js-hud-reread', 'used', State.reReadUsed);
    document.getElementById('js-hud-reread').setAttribute(
      'aria-label', State.reReadUsed ? 'Re-Read used' : 'Re-Read available'
    );
  }

  /* ── Ambient background (start screen) ───────────────────── */

  function buildStartAmbient() {
    const container = document.getElementById('js-start-ambient');
    if (!container) return;
    container.innerHTML = '';
    const words = ['READ', 'FOCUS', 'SHARP', 'NOW', 'FAST', 'THINK', 'SEE'];
    for (let i = 0; i < 20; i++) {
      const span = document.createElement('span');
      span.textContent = words[i % words.length];
      const size = 14 + Math.random() * 40;
      span.style.cssText = [
        `font-size:${size}px`,
        `left:${Math.random() * 100}%`,
        `animation-duration:${20 + Math.random() * 20}s`,
        `animation-delay:${-Math.random() * 22}s`,
        `opacity:${0.3 + Math.random() * 0.7}`,
      ].join(';');
      container.appendChild(span);
    }
  }

  /* ── Section: Level Intro ─────────────────────────────────── */

  function showLevelIntro() {
    const level  = State.levelIndex + 1;
    const wpm    = State.wpmLevels[State.levelIndex];
    const title  = READING_TITLES[wpm] || `${wpm} WPM`;
    const motiv  = MOTIVATIONAL_MESSAGES[
      Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
    ];

    UI.text('js-level-eyebrow', `LEVEL ${level}`);
    UI.text('js-level-number',  level);
    UI.text('js-level-wpm',     `${wpm} WPM`);
    UI.text('js-level-title',   title);
    UI.text('js-level-motivate', motiv);

    // Restart level number animation
    const numEl = document.getElementById('js-level-number');
    if (numEl) {
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
    }

    UI.show('section-level');
    updateHud();
    setTimeout(() => startCountdown(), 1800);
  }

  /* ── Section: Countdown ───────────────────────────────────── */

  function startCountdown() {
    UI.show('section-countdown');
    let n = 3;
    const el = document.getElementById('js-countdown');

    function tick() {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'countIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      el.textContent = n;
      if (n === 0) {
        setTimeout(startPassage, 600);
      } else {
        n--;
        setTimeout(tick, 900);
      }
    }
    tick();
  }

  /* ── Section: Reading ─────────────────────────────────────── */

  function startPassage() {
    const idx = pickPassageIndex();
    if (!State.usedPoolIndexes.includes(idx)) {
      State.usedPoolIndexes.push(idx);
    }
    State.currentPassage = State.pool[idx];
    playPassage();
  }

  function playPassage() {
    const wpm      = State.wpmLevels[State.levelIndex];
    const msPerWord = Math.round(60000 / wpm);
    const words    = State.currentPassage.text.split(' ');
    const wordEl   = document.getElementById('js-word-display');
    const barEl    = document.getElementById('js-progress-bar');

    clearTimeout(State.wordTimer);
    wordEl.textContent = '';
    wordEl.className   = 'word-display';
    barEl.style.width  = '0%';

    UI.show('section-reading');
    updateHud();

    let i = 0;

    function showNext() {
      if (i >= words.length) {
        wordEl.textContent = '';
        wordEl.classList.remove('visible');
        barEl.style.width = '100%';
        setTimeout(showQuestion, 320);
        return;
      }
      wordEl.classList.remove('visible');
      // Force reflow so transition re-fires on each word
      void wordEl.offsetWidth;
      wordEl.textContent = words[i];
      wordEl.classList.add('visible');
      barEl.style.width = `${((i + 1) / words.length) * 100}%`;
      i++;
      State.wordTimer = setTimeout(showNext, msPerWord);
    }

    showNext();
  }

  /* ── Section: Question ────────────────────────────────────── */

  function showQuestion() {
    const passage = State.currentPassage;
    const level   = State.levelIndex + 1;
    const wpm     = State.wpmLevels[State.levelIndex];

    UI.text('js-q-level', level);
    UI.text('js-q-wpm',   wpm);
    UI.text('js-question-text', passage.question);

    // Re-Read button state
    const rrBtn = document.getElementById('js-btn-reread');
    if (rrBtn) {
      rrBtn.disabled    = State.reReadUsed;
      rrBtn.textContent = State.reReadUsed ? '👁️ Re-Read Used' : '👁️ Re-Read Passage';
    }

    // Build shuffled answers
    const answers = shuffle([
      { text: passage.correct, isCorrect: true },
      ...passage.wrong.map(w => ({ text: w, isCorrect: false })),
    ]);

    const grid = document.getElementById('js-answers-grid');
    grid.innerHTML = '';
    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className   = 'answer-btn';
      btn.textContent = ans.text;
      btn.setAttribute('role', 'listitem');
      btn.onclick = () => handleAnswer(btn, ans.isCorrect);
      grid.appendChild(btn);
    });

    UI.show('section-question');
  }

  /* ── Answer handling ──────────────────────────────────────── */

  function handleAnswer(btn, isCorrect) {
    // Lock all buttons immediately
    document.querySelectorAll('.answer-btn').forEach(b => (b.disabled = true));

    btn.classList.add(isCorrect ? 'state-correct' : 'state-wrong');

    if (!isCorrect) {
      // Reveal the correct answer
      document.querySelectorAll('.answer-btn').forEach(b => {
        if (b.textContent === State.currentPassage.correct) {
          b.classList.add('state-correct');
        }
      });
      State.lives--;
      Audio.wrong();
    } else {
      State.correctCount++;
      Audio.correct();
    }

    State.highestWpm = Math.max(State.highestWpm, State.wpmLevels[State.levelIndex]);

    setTimeout(() => {
      const isLastLevel = State.levelIndex >= State.wpmLevels.length - 1;

      if (isCorrect) {
        if (isLastLevel) {
          showFeedback(true, 'CORRECT', 'Final level cleared!');
          setTimeout(() => showResults(true), 1500);
        } else {
          showFeedback(true, 'CORRECT', 'Keep reading!');
          State.levelIndex++;
          setTimeout(showLevelIntro, 1500);
          Audio.levelComplete();
        }
      } else {
        if (State.lives <= 0) {
          showFeedback(false, 'WRONG', 'No lives remaining');
          setTimeout(() => showResults(false), 1500);
        } else {
          showFeedback(
            false,
            'WRONG',
            `${State.lives} ${State.lives === 1 ? 'life' : 'lives'} remaining`
          );
          if (isLastLevel) {
            setTimeout(() => showResults(false), 1500);
          } else {
            State.levelIndex++;
            setTimeout(showLevelIntro, 1500);
          }
        }
      }
    }, 650);
  }

  /* ── Re-Read ──────────────────────────────────────────────── */

  function useReRead() {
    if (State.reReadUsed) return;
    State.reReadUsed = true;

    const rrBtn = document.getElementById('js-btn-reread');
    if (rrBtn) {
      rrBtn.disabled    = true;
      rrBtn.textContent = '👁️ Re-Read Used';
    }

    playPassage();
  }

  /* ── Section: Feedback ────────────────────────────────────── */

  function showFeedback(isCorrect, title, sub) {
    const iconEl  = document.getElementById('js-fb-icon');
    const titleEl = document.getElementById('js-fb-title');

    iconEl.textContent  = isCorrect ? '✅' : '❌';
    titleEl.textContent = title;
    titleEl.className   = `feedback-title ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    UI.text('js-fb-sub', sub);

    // Re-trigger pop animation
    iconEl.style.animation = 'none';
    void iconEl.offsetWidth;
    iconEl.style.animation = 'feedbackPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    UI.show('section-feedback');
  }

  /* ── Scoring ──────────────────────────────────────────────── */

  function calcScore() {
    const totalLevels = State.wpmLevels.length;
    // Levels completed: up to 40 pts
    const levelPts   = (Math.min(State.levelIndex, totalLevels) / totalLevels) * 40;
    // Correct answers: up to 30 pts
    const correctPts = (State.correctCount / totalLevels) * 30;
    // Lives remaining: up to 20 pts
    const livePts    = (Math.max(0, State.lives) / 3) * 20;
    // Re-Read not used: 10 bonus pts
    const rrPts      = State.reReadUsed ? 0 : 10;
    return Math.min(100, Math.round(levelPts + correctPts + livePts + rrPts));
  }

  function getRank(score) {
    if (score >= 96) return { label: 'FOCUS MASTER', cls: 'rank-master' };
    if (score >= 81) return { label: 'EXPERT',       cls: 'rank-expert' };
    if (score >= 61) return { label: 'SHARP',        cls: 'rank-sharp' };
    if (score >= 41) return { label: 'FOCUSED',      cls: 'rank-focused' };
    if (score >= 21) return { label: 'ATTENTIVE',    cls: 'rank-attentive' };
    return              { label: 'DISTRACTED',    cls: 'rank-distracted' };
  }

  /* ── Section: Results ─────────────────────────────────────── */

  function showResults(isVictory) {
    if (isVictory) Audio.victory();

    const score = calcScore();
    const rank  = getRank(score);
    const totalLevels = State.wpmLevels.length;
    const reached800  = isVictory && State.wpmLevels.includes(800)
                        && State.levelIndex >= State.wpmLevels.length - 1;

    // Outcome heading
    const outcomeEl = document.getElementById('js-results-outcome');
    outcomeEl.textContent = isVictory ? 'VICTORY' : 'GAME OVER';
    outcomeEl.className   = `results-outcome ${isVictory ? 'is-victory' : 'is-gameover'}`;

    UI.text('js-results-headline',
      isVictory ? 'All levels completed' : 'Your focus broke'
    );

    // Special 800 WPM message
    const specialEl = document.getElementById('js-results-special');
    specialEl.textContent = reached800 ? SPECIAL_800_MESSAGE : '';
    specialEl.style.display = reached800 ? 'block' : 'none';

    // Score
    UI.text('js-results-score', score);

    // Rank badge
    const rankEl = document.getElementById('js-results-rank');
    rankEl.textContent = rank.label;
    rankEl.className   = `results-rank-badge ${rank.cls}`;

    // Stats
    UI.text('js-stat-mode',    State.modeLabel);
    UI.text('js-stat-wpm',     State.highestWpm);
    UI.text('js-stat-correct', `${State.correctCount}/${totalLevels}`);
    UI.text('js-stat-lives',   Math.max(0, State.lives));
    UI.text('js-stat-level',   State.levelIndex + (isVictory ? 0 : 1));
    UI.text('js-stat-reread',  State.reReadUsed ? 'Yes' : 'No');

    UI.show('section-results');
    // window.VatsalLolGameComplete?.();
  }

  /* ── Public API ───────────────────────────────────────────── */
  return {
    buildStartAmbient,
    showLevelIntro,
    showQuestion,
    handleAnswer,
    useReRead,
    showResults,
  };
})();

/* ══════════════════════════════════════════════════════════════
   UTILITY
   ══════════════════════════════════════════════════════════════ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ══════════════════════════════════════════════════════════════
   INIT — Event bindings and startup
   ══════════════════════════════════════════════════════════════ */

function startModeGame(modeKey) {
  resetState(modeKey);
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
  Game.showLevelIntro();
}

document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  Game.buildStartAmbient();


  // Mode select — mode buttons
  document.querySelectorAll('.mode-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const modeKey = btn.getAttribute('data-mode');
      if (MODES[modeKey]) startModeGame(modeKey);
    });
  });


  // Question screen — Re-Read button
  document.getElementById('js-btn-reread').addEventListener('click', () => {
    Game.useReRead();
  });

  // Results screen — Play Again
  document.getElementById('js-btn-play-again').addEventListener('click', () => {
    // Replay same mode
    startModeGame(State.mode);
  });

  // Results screen — Home
  document.getElementById('js-btn-home').addEventListener('click', () => {
    UI.show('section-start');
    Game.buildStartAmbient();
    document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
  });
});
function updateHeaderVisibility(sectionId){

    const header=document.querySelector('.vatsal-header');

    if(!header) return;

    const gameplaySections=[
        'section-reading',
        'section-question',
        'section-feedback',
        'section-countdown'
    ];

    header.classList.toggle(
        'hidden',
        gameplaySections.includes(sectionId)
    );

}