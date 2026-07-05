/* =========================================
   FLASH MEMORY — SCRIPT.JS
   3 modes (3/4/5 digit)
   5 lives · speed up every 5 correct
========================================= */

const MAX_LIVES = 5;

let digits = 4;
let flash, minFlash, reduce, nextDelay;
let score = 0, correct = 0, wrong = 0, total = 0;
let streak = 0, lives = MAX_LIVES;
let current = '';
let gameActive = false;
let lastDigits = 4;

/* --- DOM --- */
const menuScreen   = document.getElementById('menuScreen');
const playScreen   = document.getElementById('playScreen');
const resultScreen = document.getElementById('resultScreen');
const siteHeader   = document.getElementById('siteHeader');

const numEl        = document.getElementById('number');
const inputEl      = document.getElementById('input');
const inputBox     = document.getElementById('inputBox');
const answerDisplay = document.getElementById('answerDisplay');
let typedAnswer = '';
const hudScore     = document.getElementById('hudScore');
const livesDisplay = document.getElementById('livesDisplay');
const speedDisplay = document.getElementById('speedDisplay');
const metaEl       = document.getElementById('meta');

const resultScore  = document.getElementById('resultScore');
const resultMeta   = document.getElementById('resultMeta');
const resultRemark = document.getElementById('resultRemark');
const footerSlot   = document.getElementById('footerSlot');

document.getElementById('replayBtn').addEventListener('click', () => startGame(lastDigits));
document.getElementById('modeBtn').addEventListener('click', showMenu);

inputEl.addEventListener('paste', e => e.preventDefault());
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') submit();
  if (e.key === 'Backspace') { typedAnswer = typedAnswer.slice(0, -1); syncDisplay(); return; }
  if (/^[0-9]$/.test(e.key)) { appendDigit(e.key); }
  if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
});

inputEl.addEventListener('input', () => {
  inputEl.value = inputEl.value.replace(/\D/g, '').slice(0, digits);
  if (inputEl.value.length === digits) submit();
});

document.querySelectorAll('.np-btn[data-digit]').forEach(btn => {
  btn.addEventListener('click', () => appendDigit(btn.dataset.digit));
});
document.getElementById('np-del').addEventListener('click', () => {
  typedAnswer = typedAnswer.slice(0, -1);
  syncDisplay();
});

function appendDigit(d) {
  if (!gameActive) return;
  if (typedAnswer.length >= digits) return;
  typedAnswer += d;
  syncDisplay();
  if (typedAnswer.length === digits) submit();
}

function syncDisplay() {
  const filled = typedAnswer;
  const dots = '·'.repeat(Math.max(0, digits - filled.length));
  answerDisplay.textContent = filled + dots;
}

/* --- configure speed per digit count --- */
function configure() {
  if (digits === 3) {
    flash = 380; minFlash = 120; reduce = 55; nextDelay = 160;
  } else if (digits === 4) {
    flash = 320; minFlash = 140; reduce = 60; nextDelay = 170;
  } else {
    flash = 420; minFlash = 180; reduce = 50; nextDelay = 190;
  }
}

/* --- number generator --- */
function generate() {
  /* first digit is always 1-9 so the number always shows full width */
  const firstDigit = () => Math.floor(Math.random() * 9) + 1;
  const anyDigit   = () => Math.floor(Math.random() * 10);

  const r = Math.random();

  if (r < 0.35) {
    /* repeated-digit pattern: starts with a non-zero digit pair */
    const d = firstDigit();
    let s = '' + d + d;
    while (s.length < digits) s += anyDigit();
    return s;
  }

  if (r < 0.65) {
    /* palindrome pattern: ensure enough chars for all digit counts */
    const a = firstDigit();
    const b = anyDigit();
    const c = anyDigit();
    const full = '' + a + b + c + b + a;   /* 5 chars, works for 3/4/5 */
    return full.slice(0, digits);
  }

  /* fully random: just guarantee no leading zero */
  let s = '' + firstDigit();
  while (s.length < digits) s += anyDigit();
  return s;
}

/* --- HUD update --- */
function updateHUD() {
  hudScore.textContent = score;
  speedDisplay.textContent = flash + 'ms';

  let hearts = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    hearts += `<span class="heart ${i < lives ? 'alive' : 'dead'}">♥</span>`;
  }
  livesDisplay.innerHTML = hearts;
  metaEl.textContent = `Q: ${total} · R: ${correct} · W: ${wrong}`;
}

/* --- one round --- */
function round() {
  if (!gameActive) return;
  typedAnswer = '';
  inputEl.value = '';
  answerDisplay.textContent = '·'.repeat(digits);
  inputBox.style.display = 'none';
  numEl.className = '';
  current = generate();
  numEl.textContent = current;

  const baseSize = digits === 3 ? 140 : digits === 4 ? 120 : 100;
  const size = Math.max(72, baseSize - (400 - flash) / 9);
  numEl.style.fontSize = size + 'px';
  numEl.style.opacity = '1';

  setTimeout(() => {
    numEl.style.opacity = '0';
    setTimeout(() => {
      if (!gameActive) return;
      typedAnswer = '';
      answerDisplay.textContent = '·'.repeat(digits);
      inputBox.style.display = 'block';
      inputEl.focus({ preventScroll: true });
    }, 80);
  }, flash);
}

/* --- submit answer --- */
function submit() {
  if (!gameActive) return;
  if (typedAnswer.length !== digits) return;

  total++;
  inputBox.style.display = 'none';

  if (typedAnswer === current) {
    score++;
    correct++;
    streak++;
    hudScore.classList.add('pop');
    setTimeout(() => hudScore.classList.remove('pop'), 200);

    /* speed up every 5 correct */
    if (correct % 5 === 0) {
      flash = Math.max(minFlash, flash - reduce);
    }
  } else {
    wrong++;
    lives--;
    streak = 0;

    /* show correct answer briefly */
    numEl.textContent = current;
    numEl.className = 'error-flash';
    numEl.style.opacity = '1';
    setTimeout(() => { numEl.style.opacity = '0'; numEl.className = ''; }, 600);

    /* shake input area */
    inputBox.classList.add('shake');
    setTimeout(() => inputBox.classList.remove('shake'), 400);

    if (lives <= 0) {
      gameActive = false;
      setTimeout(showResult, 700);
      updateHUD();
      return;
    }
  }

  updateHUD();
  setTimeout(round, nextDelay);
}

/* --- screens --- */
function startGame(d) {
  lastDigits = d;
  digits = d;
  score = correct = wrong = total = streak = 0;
  lives = MAX_LIVES;
  configure();
  gameActive = true;

  inputEl.maxLength = digits;

  menuScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  playScreen.classList.remove('hidden');
  siteHeader.style.display = 'none';
  document.body.style.overflow = 'hidden';

  /* hide footer */
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');

  updateHUD();
  round();
}

function showMenu() {
  gameActive = false;
  playScreen.classList.add('hidden');
  resultScreen.classList.add('hidden');
  menuScreen.classList.remove('hidden');
  siteHeader.style.display = 'flex';
  document.body.style.overflow = '';
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
}

function showResult() {
  playScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');
  siteHeader.style.display = 'flex';
  document.body.style.overflow = '';

  resultScore.textContent = score;
  resultMeta.textContent = `Q: ${total} · R: ${correct} · W: ${wrong}`;

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  let remark = '';
  if (pct >= 90) remark = '🧠 Photographic memory.';
  else if (pct >= 75) remark = '⚡ Sharp and fast.';
  else if (pct >= 50) remark = '📈 Getting there.';
  else if (pct >= 25) remark = '🔁 Keep training.';
  else remark = '👁 Your brain needs coffee.';
  resultRemark.textContent = remark;

  /* move footer inside result */
  const related = document.querySelector('.vatsal-related');
  if (related) {
    related.removeAttribute('hidden');
    footerSlot.appendChild(related);
  }

  window.VatsalLolGameComplete?.();
}

/* on replay, move footer back to body */
document.getElementById('replayBtn').addEventListener('click', () => {
  const related = document.querySelector('.vatsal-related');
  if (related) {
    related.setAttribute('hidden', '');
    document.body.appendChild(related);
  }
}, true);

document.getElementById('modeBtn').addEventListener('click', () => {
  const related = document.querySelector('.vatsal-related');
  if (related) {
    related.setAttribute('hidden', '');
    document.body.appendChild(related);
  }
}, true);
