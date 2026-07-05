/* ==========================================
SNAKE ULTIMATE — v2.5 MIGRATED
========================================== */

const canvas     = document.getElementById('c');
const ctx        = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const gameScreen  = document.getElementById('gameScreen');
const pauseScreen = document.getElementById('pauseScreen');
const overScreen  = document.getElementById('overScreen');
const overBody    = document.getElementById('overBody');

const hudScore   = document.getElementById('hudScore');
const hudHi      = document.getElementById('hudHi');
const hudTime    = document.getElementById('hudTime');

const fsEl       = document.getElementById('fs');
const ftEl       = document.getElementById('ft');
const fhEl       = document.getElementById('fh');

/* ==========================================
CANVAS SIZING — tall rectangle
========================================== */

const COLS = 20;   // horizontal cells
const ROWS = 30;   // vertical cells  (2:3 ratio)
let CELL   = 20;   // cell size in px — set by fitCanvas()

function fitCanvas() {
  // Available space: viewport minus header (~50px) minus hud (~52px) minus dpad on mobile
  const maxW = Math.min(window.innerWidth  - 16, 480);
  const dpadH = window.innerWidth <= 768 ? 180 : 0;
  const maxH  = window.innerHeight - 50 - 60 - dpadH - 32;

  // Cell size that fits both width and height constraints
  const byW = Math.floor(maxW / COLS);
  const byH = Math.floor(maxH / ROWS);
  CELL = Math.max(12, Math.min(byW, byH));

  canvas.width  = COLS * CELL;
  canvas.height = ROWS * CELL;
}

window.addEventListener('resize', () => {
  fitCanvas();
  if (state === 'play' || state === 'pause') drawFrame();
});

/* ==========================================
AUDIO
========================================== */

let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(f, d) {
  try {
    const a = getAudio();
    const o = a.createOscillator();
    const g = a.createGain();
    o.frequency.value = f;
    o.connect(g);
    g.connect(a.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d);
    o.stop(a.currentTime + d + .01);
  } catch(e) {}
}

/* ==========================================
GAME STATE
========================================== */

let state = 'start';   // 'start' | 'play' | 'pause' | 'over'
let score = 0;
let startTime = 0;
let hi = Number(localStorage.snakeHi) || 0;
let rafId = null;
let frameCount = 0;
let speed = 4;         // lower = faster (frames per move)

const snake = { x: 0, y: 0, dx: CELL, dy: 0, cells: [], max: 4 };
const apple = {
  x: 0,
  y: 0,
  type: "normal"
};

const FRUIT_TYPES = [
  {
    type: "normal",
    color: "#ff3030",
    score: 1,
    grow: 1,
    slow: false,
    chance: 65
  },
  {
    type: "slow",
    color: "#ffd400",
    score: 1,
    grow: 1,
    slow: true,
    chance: 15
  },
  {
    type: "bonus",
    color: "#00c8ff",
    score: 3,
    grow: 1,
    slow: false,
    chance: 10
  },
  {
    type: "grow",
    color: "#bb33ff",
    score: 2,
    grow: 3,
    slow: false,
    chance: 10
  }
];

function randCell() {
  return Math.floor(Math.random() * COLS) * CELL;
}

function randRow() {
  return Math.floor(Math.random() * ROWS) * CELL;
}

function placeApple() {
  apple.x = randCell();
  apple.y = randRow();

  const r = Math.random() * 100;
  let total = 0;

  for (const fruit of FRUIT_TYPES) {
    total += fruit.chance;
    if (r <= total) {
      apple.type = fruit.type;
      return;
    }
  }

  apple.type = "normal";
}

function resetGame() {
  fitCanvas();
  Object.assign(snake, {
    x:    Math.floor(COLS / 2) * CELL,
    y:    Math.floor(ROWS / 2) * CELL,
    dx:   CELL,
    dy:   0,
    cells: [],
    max:  4
  });
  placeApple();
  score      = 0;
  speed      = 4;
  frameCount = 0;
  startTime  = performance.now();
  updateHud();
}

/* ==========================================
SCREEN SWITCHING
========================================== */

function showScreen(s) {
  [startScreen, gameScreen, pauseScreen, overScreen].forEach(el => {
    el.classList.remove('active');
  });
  s.classList.add('active');
}

/* ==========================================
HUD
========================================== */

let hudInterval = null;

function updateHud() {
  hudScore.textContent = score;
  hudHi.textContent    = hi;
  hudTime.textContent  = Math.floor((performance.now() - startTime) / 1000) + 's';
}

function startHudClock() {
  clearInterval(hudInterval);
  hudInterval = setInterval(updateHud, 500);
}

function stopHudClock() {
  clearInterval(hudInterval);
}

/* ==========================================
GAME LOOP
========================================== */

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apple
 const fruit = FRUIT_TYPES.find(f => f.type === apple.type);

ctx.shadowBlur = 18;
ctx.shadowColor = fruit.color;
ctx.fillStyle = fruit.color;
ctx.fillRect(apple.x, apple.y, CELL - 2, CELL - 2);
ctx.shadowBlur = 0;

  // Snake
  snake.cells.forEach((cell, i) => {
    const brightness = Math.round(255 * (0.4 + 0.6 * (1 - i / snake.cells.length)));
    ctx.fillStyle = `rgb(0,${brightness},0)`;
    ctx.fillRect(cell.x + 1, cell.y + 1, CELL - 2, CELL - 2);
  });
}

function gameLoop() {
  rafId = requestAnimationFrame(gameLoop);

  if (state !== 'play') {
    drawFrame();
    return;
  }

  if (++frameCount < speed) return;
  frameCount = 0;

  // Move
  snake.x += snake.dx;
  snake.y += snake.dy;

  // Wrap
  if (snake.x < 0)               snake.x = (COLS - 1) * CELL;
  if (snake.x >= COLS * CELL)    snake.x = 0;
  if (snake.y < 0)               snake.y = (ROWS - 1) * CELL;
  if (snake.y >= ROWS * CELL)    snake.y = 0;

  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.max) snake.cells.pop();

  // Check apple
 if (snake.x === apple.x && snake.y === apple.y) {

    const fruit = FRUIT_TYPES.find(f => f.type === apple.type);

    snake.max += fruit.grow;
    score += fruit.score;

    if (fruit.slow) {
        speed = 6;

        setTimeout(() => {
            speed = Math.max(1, 4 - Math.floor(score / 5));
        }, 5000);
    } else {
        speed = Math.max(1, 4 - Math.floor(score / 5));
    }

    hi = Math.max(hi, score);
    localStorage.snakeHi = hi;

    beep(600,.1);

    placeApple();

    updateHud();
}

  // Check self collision
  for (let i = 1; i < snake.cells.length; i++) {
    if (snake.cells[0].x === snake.cells[i].x &&
        snake.cells[0].y === snake.cells[i].y) {
      endGame();
      return;
    }
  }

  drawFrame();
}

/* ==========================================
END GAME
========================================== */

function endGame() {
  state = 'over';
  beep(120, .5);
  stopHudClock();

  hi = Math.max(hi, score);
  localStorage.snakeHi = hi;

  fsEl.textContent = score;
  ftEl.textContent = Math.floor((performance.now() - startTime) / 1000) + 's';
  fhEl.textContent = hi;

  showScreen(overScreen);

  // Footer
  setTimeout(() => {
    const related = document.querySelector('.vatsal-related');
    if (related && !overBody.contains(related)) {
      overBody.appendChild(related);
    }
    window.VatsalLolGameComplete?.();
  }, 600);
}

/* ==========================================
START / RESTART
========================================== */

function startGame() {
  // Hide footer
  const related = document.querySelector('.vatsal-related');
  if (related && overBody.contains(related)) document.body.appendChild(related);
  related?.setAttribute('hidden', '');

  resetGame();
  state = 'play';
  showScreen(gameScreen);
  startHudClock();

  if (rafId) cancelAnimationFrame(rafId);
  gameLoop();
}

/* ==========================================
PAUSE
========================================== */

function togglePause() {
  if (state === 'play') {
    state = 'pause';
    beep(300, .1);
    stopHudClock();
    showScreen(pauseScreen);
  } else if (state === 'pause') {
    state = 'play';
    beep(500, .1);
    startHudClock();
    showScreen(gameScreen);
  }
}

/* ==========================================
DIRECTION HELPER
========================================== */

function setDir(dir) {
  if (state !== 'play') return;
  if (dir === 'left'  && snake.dx === 0) { snake.dx = -CELL; snake.dy = 0; }
  if (dir === 'right' && snake.dx === 0) { snake.dx =  CELL; snake.dy = 0; }
  if (dir === 'up'    && snake.dy === 0) { snake.dy = -CELL; snake.dx = 0; }
  if (dir === 'down'  && snake.dy === 0) { snake.dy =  CELL; snake.dx = 0; }
}

/* ==========================================
BUTTON WIRING
========================================== */

document.getElementById('startBtn').onclick    = startGame;
document.getElementById('pauseBtn').onclick    = togglePause;
document.getElementById('resumeBtn').onclick   = togglePause;
document.getElementById('restartBtn').onclick  = startGame;

document.getElementById('pauseMenuBtn').onclick = () => {
  state = 'start';
  stopHudClock();
  showScreen(startScreen);
};

document.getElementById('menuBtn').onclick = () => {
  state = 'start';
  // Hide footer
  const related = document.querySelector('.vatsal-related');
  if (related && overBody.contains(related)) document.body.appendChild(related);
  related?.setAttribute('hidden', '');
  showScreen(startScreen);
};

// D-pad buttons
document.querySelectorAll('.dpad-btn').forEach(btn => {
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    setDir(btn.dataset.dir);
  }, { passive: false });
  btn.addEventListener('mousedown', () => setDir(btn.dataset.dir));
});

/* ==========================================
KEYBOARD
========================================== */

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state === 'start' || state === 'over') startGame();
    return;
  }

  if (e.key === 'p' || e.key === 'P') {
    if (state === 'play' || state === 'pause') togglePause();
    return;
  }

  // Arrow keys + WASD
  if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') setDir('left');
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setDir('right');
  if (e.key === 'ArrowUp'    || e.key === 'w' || e.key === 'W') setDir('up');
  if (e.key === 'ArrowDown'  || e.key === 's' || e.key === 'S') setDir('down');
});

/* ==========================================
TOUCH SWIPE (canvas)
========================================== */

let touchStartX = 0;
let touchStartY = 0;

gameScreen.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  // Tap to start/restart
  if (state === 'start' || state === 'over') startGame();
}, { passive: true });

gameScreen.addEventListener('touchend', e => {
  if (state !== 'play') return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const threshold = 20;
  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return; // tap, not swipe
  if (Math.abs(dx) > Math.abs(dy)) {
    setDir(dx > 0 ? 'right' : 'left');
  } else {
    setDir(dy > 0 ? 'down' : 'up');
  }
}, { passive: true });

/* ==========================================
INIT
========================================== */

fitCanvas();
drawFrame();