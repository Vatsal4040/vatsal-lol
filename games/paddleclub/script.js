const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuScreen    = document.getElementById("menuScreen");
const difficultyScreen = document.getElementById("difficultyScreen");
const gameScreen    = document.getElementById("gameScreen");
const pauseScreen   = document.getElementById("pauseScreen");
const winScreen     = document.getElementById("winScreen");

const scoreDisplay  = document.getElementById("scoreDisplay");
const winnerText    = document.getElementById("winnerText");
const finalScoreEl  = document.getElementById("finalScore");
const controlsInfo  = document.getElementById("controlsInfo");
const hudLeft       = document.getElementById("hudLeft");
const hudRight      = document.getElementById("hudRight");

let gameMode   = "ai";
let difficulty = "medium";
let running    = false;
let paused     = false;
let animationId;
let isMobile   = false;
const trail    = [];
const WIN_SCORE = 10;
const keys     = {};

/* ==========================================
MOBILE DETECTION + CANVAS RESIZE
========================================== */

function checkMobile() {
  isMobile = window.innerWidth <= 768;
  if (isMobile) {
    // Portrait canvas: narrow and tall
    canvas.width  = 340;
canvas.height = 520;
    // Paddles become horizontal bars (top/bottom)
    paddle.width  = 80;
    paddle.height = 14;
    paddle.speed  = 6;
  } else {
    // Desktop: original landscape
    canvas.width  = 900;
    canvas.height = 520;
    paddle.width  = 16;
    paddle.height = 100;
    paddle.speed  = 7;
  }
  resetPositions();
}

window.addEventListener("resize", () => {
  const wasMobile = isMobile;
  checkMobile();
  if (wasMobile !== isMobile && running) {
    // Layout changed mid-game — restart positions
    resetPositions();
  }
});

/* ==========================================
GAME STATE
========================================== */

const paddle = { width: 16, height: 100, speed: 7 };

// On desktop: left/right paddles (vertical bars)
// On mobile:  top/bottom paddles (horizontal bars)
// "left" = Player 1 (desktop left, mobile bottom)
// "right" = Player 2 / AI (desktop right, mobile top)

const left  = { x: 0, y: 0, score: 0 };
const right = { x: 0, y: 0, score: 0 };

const ball = { size: 12, x: 0, y: 0, vx: 0, vy: 0, speed: 6 };

function resetPositions() {
  if (isMobile) {
    // Bottom paddle (Player 1)
    left.x  = canvas.width / 2 - paddle.width / 2;
    left.y  = canvas.height - 30 - paddle.height;
    // Top paddle (Player 2 / AI)
    right.x = canvas.width / 2 - paddle.width / 2;
    right.y = 30;
  } else {
    left.x  = 30;
    left.y  = canvas.height / 2 - paddle.height / 2;
    right.x = canvas.width - 30 - paddle.width;
    right.y = canvas.height / 2 - paddle.height / 2;
  }
}

function resetBall(direction = 1) {
  ball.x     = canvas.width / 2;
  ball.y     = canvas.height / 2;
  ball.speed = isMobile ? 5 : 6;

  if (isMobile) {
    // Mobile: ball moves up/down
    const angle = (Math.random() - 0.5) * 1.0;
    ball.vy = Math.cos(angle) * ball.speed * direction;
    ball.vx = Math.sin(angle) * ball.speed;
  } else {
    const angle = (Math.random() - 0.5) * 1.2;
    ball.vx = Math.cos(angle) * ball.speed * direction;
    ball.vy = Math.sin(angle) * ball.speed;
  }
}

/* ==========================================
SCREEN SWITCHING
========================================== */

const ALL_SCREENS = [menuScreen, difficultyScreen, gameScreen, pauseScreen, winScreen];

function switchScreen(screen) {
  ALL_SCREENS.forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
}

/* ==========================================
TOUCH CONTROLS
========================================== */

// Track active touches per player zone
const touches = { bottom: null, top: null };

document.addEventListener("touchstart", e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    const y = t.clientY - canvas.getBoundingClientRect().top;
    const canvasH = canvas.getBoundingClientRect().height;
    if (y > canvasH / 2) {
      touches.bottom = t.identifier;
    } else {
      touches.top = t.identifier;
    }
  }
}, { passive: false });

document.addEventListener("touchmove", e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;

  for (const t of e.changedTouches) {
    const cx = (t.clientX - rect.left) * scaleX;

    if (t.identifier === touches.bottom) {
      // Player 1 (bottom paddle) — clamp within canvas
      left.x = cx - paddle.width / 2;
      left.x = Math.max(0, Math.min(canvas.width - paddle.width, left.x));
    }
    if (t.identifier === touches.top && gameMode === "multi") {
      // Player 2 (top paddle) — only in 2-player
      right.x = cx - paddle.width / 2;
      right.x = Math.max(0, Math.min(canvas.width - paddle.width, right.x));
    }
  }
}, { passive: false });

document.addEventListener("touchend", e => {
  for (const t of e.changedTouches) {
    if (t.identifier === touches.bottom) touches.bottom = null;
    if (t.identifier === touches.top)    touches.top    = null;
  }
}, { passive: false });

/* ==========================================
KEYBOARD
========================================== */

document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === "Escape" && running) togglePause();
});

document.addEventListener("keyup", e => { keys[e.key] = false; });

/* ==========================================
BUTTON WIRING
========================================== */

document.getElementById("onePlayerBtn").onclick = () => switchScreen(difficultyScreen);

document.getElementById("twoPlayerBtn").onclick = () => {
  gameMode = "multi";
  startGame();
};

document.getElementById("backBtn").onclick = () => switchScreen(menuScreen);

document.querySelectorAll(".difficulty-btn").forEach(btn => {
  btn.onclick = () => {
    difficulty = btn.dataset.level;
    gameMode   = "ai";
    startGame();
  };
});

document.getElementById("pauseBtn").onclick = () => togglePause();
document.getElementById("resumeBtn").onclick = () => resumeGame();
document.getElementById("restartBtn").onclick = () => startGame();

document.getElementById("menuBtn").onclick = () => {
  running = false;
  switchScreen(menuScreen);
};

document.getElementById("playAgainBtn").onclick = () => startGame();

document.getElementById("winMenuBtn").onclick = () => {
  // Move footer back to body and hide
  const related = document.querySelector(".vatsal-related");
  if (related && winScreen.contains(related)) document.body.appendChild(related);
  related?.setAttribute("hidden", "");
  switchScreen(menuScreen);
};

/* ==========================================
GAME START / PAUSE
========================================== */

function startGame() {
  checkMobile();

  left.score  = 0;
  right.score = 0;
  resetPositions();
  updateScore();
  resetBall(Math.random() > .5 ? 1 : -1);

  // HUD labels
  if (isMobile) {
    hudLeft.textContent  = gameMode === "ai" ? "YOU" : "P1 ↓";
    hudRight.textContent = gameMode === "ai" ? "AI"  : "P2 ↑";
  } else {
    hudLeft.textContent  = "PLAYER 1";
    hudRight.textContent = gameMode === "ai" ? "AI" : "PLAYER 2";
    controlsInfo.innerHTML = gameMode === "multi"
      ? "Player 1: W/S &nbsp;&nbsp; | &nbsp;&nbsp; Player 2: ↑/↓"
      : "Player 1: W/S";
  }

  // Hide footer
  const related = document.querySelector(".vatsal-related");
  if (related && winScreen.contains(related)) document.body.appendChild(related);
  related?.setAttribute("hidden", "");

  trail.length = 0;
  running = true;
  paused  = false;

  cancelAnimationFrame(animationId);
  switchScreen(gameScreen);
  loop();
}

function togglePause() {
  paused = !paused;
  if (paused) {
    switchScreen(pauseScreen);
  } else {
    switchScreen(gameScreen);
  }
}

function resumeGame() {
  paused = false;
  switchScreen(gameScreen);
}

/* ==========================================
SCORE
========================================== */

function updateScore() {
  scoreDisplay.textContent =
    `${String(left.score).padStart(2,"0")} : ${String(right.score).padStart(2,"0")}`;
  scoreDisplay.classList.add("pop");
  setTimeout(() => scoreDisplay.classList.remove("pop"), 200);
}

/* ==========================================
PLAYER CONTROLS (KEYBOARD)
========================================== */

function playerControls() {
  if (isMobile) return; // mobile uses touch only

  if (keys["w"] || keys["W"]) left.y  -= paddle.speed;
  if (keys["s"] || keys["S"]) left.y  += paddle.speed;

  if (gameMode === "multi") {
    if (keys["ArrowUp"])   right.y -= paddle.speed;
    if (keys["ArrowDown"]) right.y += paddle.speed;
  }
}

/* ==========================================
CLAMP PADDLES
========================================== */

function clampPaddles() {
  if (isMobile) {
    // Horizontal clamp (x-axis)
    left.x  = Math.max(0, Math.min(canvas.width  - paddle.width, left.x));
    right.x = Math.max(0, Math.min(canvas.width  - paddle.width, right.x));
  } else {
    // Vertical clamp (y-axis)
    left.y  = Math.max(0, Math.min(canvas.height - paddle.height, left.y));
    right.y = Math.max(0, Math.min(canvas.height - paddle.height, right.y));
  }
}

/* ==========================================
AI
========================================== */

function aiMove() {
  if (isMobile) {
    // Mobile AI: top paddle tracks ball horizontally
    const centerX = right.x + paddle.width / 2;
    if (difficulty === "easy") {
      if (Math.random() < 0.03) return;
      if (ball.x > centerX + 15) right.x += 3;
      if (ball.x < centerX - 15) right.x -= 3;
    } else if (difficulty === "medium") {
      if (ball.x > centerX + 8) right.x += 5;
      if (ball.x < centerX - 8) right.x -= 5;
    } else {
     const predict = ball.x + ball.vx * 14;
const diff = predict - centerX;

if (Math.abs(diff) > 8) {
  right.x += Math.sign(diff) * 5.5;
}
    }
  } else {
    // Desktop AI: right paddle tracks ball vertically
    const center = right.y + paddle.height / 2;
    if (difficulty === "easy") {
      if (Math.random() < 0.03) return;
      if (ball.y > center + 20) right.y += 4;
      if (ball.y < center - 20) right.y -= 4;
    } else if (difficulty === "medium") {
      if (ball.y > center + 10) right.y += 5.5;
      if (ball.y < center - 10) right.y -= 5.5;
    } else {
      const predict = ball.y + ball.vy * 18;
const diff = predict - center;

if (Math.abs(diff) > 8) {
  right.y += Math.sign(diff) * 6.5;
}
    }
  }
}

/* ==========================================
COLLISION
========================================== */

function paddleCollision(p) {
  return (
    ball.x < p.x + paddle.width  &&
    ball.x + ball.size > p.x     &&
    ball.y < p.y + paddle.height &&
    ball.y + ball.size > p.y
  );
}

/* ==========================================
REFLECT
========================================== */

function reflect(p, isPlayerSide) {
  if (isMobile) {
    // Mobile: bounce on Y axis, angle from X position on paddle
    const relative   = (ball.x + ball.size / 2) - (p.x + paddle.width / 2);
    const normalized = Math.max(-1, Math.min(1, relative / (paddle.width / 2)));
    const bounceAngle = normalized * 1.1;
    ball.speed = Math.min(ball.speed + .2, 9);
    ball.vy = (isPlayerSide ? -1 : 1) * Math.cos(bounceAngle) * ball.speed;
    ball.vx = Math.sin(bounceAngle) * ball.speed;
  } else {
    // Desktop: bounce on X axis
    const relative   = (ball.y + ball.size / 2) - (p.y + paddle.height / 2);
    const normalized = Math.max(-1, Math.min(1, relative / (paddle.height / 2)));
    const bounceAngle = normalized * 1.1;
    ball.speed = Math.min(ball.speed + .25, 11);
    ball.vx = (isPlayerSide ? 1 : -1) * Math.cos(bounceAngle) * ball.speed;
    ball.vy = Math.sin(bounceAngle) * ball.speed;
  }
  playTone(650, .05);
}

/* ==========================================
UPDATE
========================================== */

function update() {
  playerControls();
  if (gameMode === "ai") aiMove();
  clampPaddles();

  ball.x += ball.vx;
  ball.y += ball.vy;

  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > 8) trail.shift();

  if (isMobile) {
    // Mobile: left/right walls bounce
    if (ball.x <= 0 || ball.x + ball.size >= canvas.width) {
      ball.x = Math.max(0, Math.min(canvas.width - ball.size, ball.x));
      ball.vx *= -1;
      playTone(420, .04);
    }

    // Mobile: top = right/AI scores, bottom = left/player scores
    if (ball.y < 0) {
      // Ball went past AI (top) — Player 1 scores
      left.score++;
      playTone(220, .12);
      updateScore();
      checkWinner();
      resetBall(1); // going downward toward player
    }

    if (ball.y > canvas.height) {
      // Ball went past Player (bottom) — AI/P2 scores
      right.score++;
      playTone(220, .12);
      updateScore();
      checkWinner();
      resetBall(-1); // going upward toward AI
    }

    if (paddleCollision(left))  reflect(left,  true);   // bottom = player side
    if (paddleCollision(right)) reflect(right, false);  // top = opponent side

  } else {
    // Desktop: top/bottom walls bounce
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
      ball.y = Math.max(0, Math.min(canvas.height - ball.size, ball.y));
      ball.vy *= -1;
      playTone(420, .04);
    }

    if (ball.x < 0) {
      right.score++;
      playTone(220, .12);
      updateScore();
      checkWinner();
      resetBall(1);
    }

    if (ball.x > canvas.width) {
      left.score++;
      playTone(220, .12);
      updateScore();
      checkWinner();
      resetBall(-1);
    }

    if (paddleCollision(left)) {
  if (isMobile) {
    ball.y = left.y - ball.size - 1;
  } else {
    ball.x = left.x + paddle.width + 1;
  }
  reflect(left, true);
}

if (paddleCollision(right)) {
  if (isMobile) {
    ball.y = right.y + paddle.height + 1;
  } else {
    ball.x = right.x - ball.size - 1;
  }
  reflect(right, false);
}
  }
}

/* ==========================================
WIN
========================================== */

function checkWinner() {
  if (left.score >= WIN_SCORE || right.score >= WIN_SCORE) {
    running = false;

    winnerText.textContent = left.score > right.score
      ? (gameMode === "ai" ? "YOU WIN! 🎉" : "PLAYER 1 WINS")
      : (gameMode === "ai" ? "AI WINS 🤖"  : "PLAYER 2 WINS");

    finalScoreEl.textContent = `${left.score} – ${right.score}`;

    playTone(900, .3);

    // Footer
    setTimeout(() => {
      const related = document.querySelector(".vatsal-related");
      if (related && !winScreen.contains(related)) {
        winScreen.querySelector(".screen-body").appendChild(related);
      }
      window.VatsalLolGameComplete?.();
    }, 600);

    switchScreen(winScreen);
  }
}

/* ==========================================
AUDIO
========================================== */

let sharedAudioCtx = null;

function getAudioCtx() {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return sharedAudioCtx;
}

function playTone(freq, duration) {
  try {
    const audio = getAudioCtx();
    const osc   = audio.createOscillator();
    const gain  = audio.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    gain.gain.setValueAtTime(.06, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
    osc.stop(audio.currentTime + duration);
  } catch(e) {}
}

/* ==========================================
DRAW
========================================== */

function drawCourt() {
  ctx.fillStyle = "#FDF6E6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#E6DCC7";

  if (isMobile) {
    // Horizontal centre line
    for (let x = 10; x < canvas.width; x += 26) {
      ctx.fillRect(x, canvas.height / 2 - 2, 12, 4);
    }
  } else {
    // Vertical centre line
    for (let y = 10; y < canvas.height; y += 26) {
      ctx.fillRect(canvas.width / 2 - 2, y, 4, 12);
    }
  }
}

function drawPaddle(p) {
  ctx.save();
  ctx.shadowColor    = "rgba(0,0,0,0.12)";
  ctx.shadowBlur     = 12;
  ctx.shadowOffsetY  = 4;
  ctx.fillStyle = p === left ? "#4FA8FF" : "#FF7A00";
  roundRect(p.x, p.y, paddle.width, paddle.height, isMobile ? 6 : 12);
  ctx.restore();
}

function drawTrail() {
  trail.forEach((point, index) => {
    const alpha = (index / trail.length) * 0.25;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(point.x, point.y, ball.size, ball.size);
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
  ctx.fill();
}

function drawBall() {
  ctx.save();
  ctx.shadowColor  = "rgba(0,0,0,0.18)";
  ctx.shadowBlur   = 10;
  ctx.fillStyle    = "#000000";
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
  ctx.strokeStyle  = "rgba(0,0,0,0.12)";
  ctx.lineWidth    = 1;
  ctx.strokeRect(ball.x, ball.y, ball.size, ball.size);
  ctx.restore();
}

function render() {
  drawCourt();
  drawPaddle(left);
  drawPaddle(right);
  drawTrail();
  drawBall();
}

/* ==========================================
LOOP
========================================== */

function loop() {
  animationId = requestAnimationFrame(loop);
  if (!running || paused) { render(); return; }
  update();
  render();
}

/* ==========================================
INIT
========================================== */

checkMobile();
resetBall();
