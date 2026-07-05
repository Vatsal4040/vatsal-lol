const beer        = document.getElementById("beer");
const targetEl    = document.getElementById("target");
const resultLine  = document.getElementById("resultLine");
const message     = document.getElementById("message");
const mug         = document.getElementById("mug");
const stack       = document.getElementById("stack");

const startScreen = document.getElementById("startScreen");
const gameScreen   = document.getElementById("gameScreen");
const startBtn     = document.getElementById("startBtn");
const backBtn      = document.getElementById("backBtn");
const mugWrap      = document.getElementById("mugWrap");
const mugHandle    = document.getElementById("mugHandle");

const statStreak  = document.getElementById("statStreak");
const statBest    = document.getElementById("statBest");
const statPlayed  = document.getElementById("statPlayed");
const liveStreak  = document.getElementById("liveStreak");
const liveBest    = document.getElementById("liveBest");

const STORE_KEY = "fillTheMug.v1";

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { streak: 0, best: 0, played: 0 };
  } catch (e) {
    return { streak: 0, best: 0, played: 0 };
  }
}

function saveStats(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
}

let stats = loadStats();

function renderStats() {
  statStreak.textContent = stats.streak;
  statBest.textContent   = stats.best;
  statPlayed.textContent = stats.played;
  liveStreak.textContent = stats.streak;
  liveBest.textContent   = stats.best;
}

renderStats();

const TOLERANCE = 3; // "close enough" window — fixed now that shape+speed carry the difficulty
let pourSpeed  = 0.2; // % per animation frame, re-rolled every round
let target    = 0;
let filling   = false;
let raf;
let revealTimer = null;

// ---- randomize beaker shape per round; scales handle to match ----
function applyVessel() {
  const w = 6 + Math.random() * 6.5;    // 6em - 12.5em
  const h = 7 + Math.random() * 11;     // 7em - 18em
  mugWrap.style.width = w + "em";
  mug.style.width = w + "em";
  mug.style.height = h + "em";
  mugHandle.style.top = (h * 0.16).toFixed(2) + "em";
  mugHandle.style.height = (h * 0.5).toFixed(2) + "em";
  mugHandle.style.width = (w * 0.19).toFixed(2) + "em";
  mugHandle.style.right = (-(w * 0.17)).toFixed(2) + "em";
}

// ---- randomize pour rate per round ----
function applyPourSpeed() {
  pourSpeed = 0.12 + Math.random() * 0.28; // 0.12 - 0.4 %/frame
}

// ---- screen switching ----
function showStart() {
  gameScreen.hidden = true;
  startScreen.hidden = false;
  renderStats();
}

function showGame() {
  startScreen.hidden = true;
  gameScreen.hidden = false;
  reset();
}

startBtn.addEventListener("click", showGame);
backBtn.addEventListener("click", showStart);

// ---- game logic ----
function reset() {
  document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
  if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; }

  target = Math.floor(Math.random() * 81) + 10;
  targetEl.textContent = target;
  applyVessel();
  applyPourSpeed();
  beer.style.height = "0%";
  resultLine.textContent = "";
  message.textContent = "Tap to pour";
  filling = false;
  stack.classList.remove("pouring");
  cancelAnimationFrame(raf);
}

function start() {
  filling = true;
  message.textContent = "";
  resultLine.textContent = "";
  stack.classList.add("pouring");
  loop();
}

function stop() {
  filling = false;
  stack.classList.remove("pouring");
  cancelAnimationFrame(raf);

  const filled = Math.round(parseFloat(beer.style.height));
  resultLine.textContent = filled + "%";

  const diff = Math.abs(filled - target);
  let scored = false;

  if (diff === 0) {
    message.textContent = "Perfect.";
    scored = true;
  } else if (diff <= TOLERANCE) {
    message.textContent = "Close enough.";
    scored = true;
  } else {
    message.textContent = "Missed it.";
  }

  stats.played += 1;
  if (scored) {
    stats.streak += 1;
    if (stats.streak > stats.best) stats.best = stats.streak;
  } else {
    stats.streak = 0;
  }
  saveStats(stats);
  renderStats();

  if (navigator.vibrate) navigator.vibrate(scored ? 30 : [20, 40, 20]);

  revealTimer = setTimeout(() => {
    window.VatsalLolGameComplete?.();
    revealTimer = null;
  }, 30000);
}

function loop() {
  if (!filling) return;
  let h = parseFloat(beer.style.height) || 0;
  if (h >= 100) return stop();
  beer.style.height = (h + pourSpeed) + "%";
  raf = requestAnimationFrame(loop);
}

// Global tap inside game screen: start or stop
gameScreen.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".link-row")) return;
  if (!filling) start();
  else stop();
});

// Tap mug = reset (stopPropagation so it doesn't also trigger start)
mug.addEventListener("pointerdown", e => {
  e.stopPropagation();
  reset();
});
