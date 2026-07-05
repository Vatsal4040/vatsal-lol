(() => {
  /* ═══════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════ */
  const ROWS_TOTAL  = 8;
  const SLOTS_TOTAL = 4;
  const COLORS      = ["red", "yellow", "green", "blue", "black"];
  const LABELS      = { red:"Red", yellow:"Yellow", green:"Green", blue:"Blue", black:"Black" };
  const EMOJIS      = { red:"🔴", yellow:"🟡", green:"🟢", blue:"🔵", black:"⚫" };
  const LS_DAILY    = "mastermindDailyPlayed";   // key → "YYYY-MM-DD" (legacy)
  const LS_DAILY_STATE = "mastermindDailyState"; // key → JSON {date, secret, guesses, activeRow, gameOver, won}
  const LS_INF      = "mastermindInfiniteStats"; // key → JSON

  /* ═══════════════════════════════════════
     DOM REFS (populated after section shown)
  ═══════════════════════════════════════ */
  let secretEl, rowsEl, controlsEl, paletteEl, statusEl, guessesCountEl;

  function initDOMRefs() {
    secretEl       = document.getElementById("secret");
    rowsEl         = document.getElementById("rows");
    controlsEl     = document.getElementById("controls");
    paletteEl      = document.getElementById("palette");
    guessesCountEl = document.getElementById("guessesCount");
  }

  /* ═══════════════════════════════════════
     STATE
  ═══════════════════════════════════════ */
  let secret      = [];
  let guesses     = [];
  let activeRow   = ROWS_TOTAL - 1;
  let gameOver    = false;
  let currentMode = "infinite"; // "daily" | "infinite"
  let countdownInterval = null;

  /* ═══════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════ */
  function make(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls)  el.className   = cls;
    if (text) el.textContent = text;
    return el;
  }

  function show(id)  { document.getElementById(id)?.removeAttribute("hidden"); }
  function hide(id)  { document.getElementById(id)?.setAttribute("hidden", ""); }

  /* ═══════════════════════════════════════
     IST DATE  (UTC+5:30)
  ═══════════════════════════════════════ */
  function getISTDate() {
    const now    = new Date();
    const istMs  = now.getTime() + (5.5 * 60 * 60 * 1000);
    const ist    = new Date(istMs);
    const y      = ist.getUTCFullYear();
    const m      = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const d      = String(ist.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /* ms until next IST midnight */
  function msUntilISTMidnight() {
    const now   = new Date();
    const istMs = now.getTime() + (5.5 * 60 * 60 * 1000);
    const ist   = new Date(istMs);
    const nextMidnight = new Date(Date.UTC(
      ist.getUTCFullYear(),
      ist.getUTCMonth(),
      ist.getUTCDate() + 1
    ));
    return nextMidnight.getTime() - (now.getTime() + 5.5 * 60 * 60 * 1000);
  }

  function formatCountdown(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h     = String(Math.floor(total / 3600)).padStart(2, "0");
    const m     = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s     = String(total % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  /* ═══════════════════════════════════════
     DAILY PUZZLE — deterministic seeded RNG
  ═══════════════════════════════════════ */

  /* Simple hash: date string → 32-bit integer */
  function hashDate(dateStr) {
    let h = 0;
    for (let i = 0; i < dateStr.length; i++) {
      h = Math.imul(31, h) + dateStr.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  }

  /* Mulberry32 seeded PRNG */
  function makePRNG(seed) {
    let s = seed >>> 0;
    return function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function dailyCode(dateStr) {
    const rng = makePRNG(hashDate(dateStr));
    return Array.from({ length: SLOTS_TOTAL }, () =>
      COLORS[Math.floor(rng() * COLORS.length)]
    );
  }

  /* Puzzle number: days since 2026-01-01 IST */
  function puzzleNumber(dateStr) {
    const epoch = new Date("2026-01-01T00:00:00Z").getTime();
    const day   = new Date(dateStr + "T00:00:00Z").getTime();
    return Math.floor((day - epoch) / 86400000) + 1;
  }

  /* ═══════════════════════════════════════
     DAILY STATE  (resume mid-game, lock once finished)
  ═══════════════════════════════════════ */
  function loadDailyState() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_DAILY_STATE));
      return s && s.date ? s : null;
    } catch { return null; }
  }

  function saveDailyState(state) {
    try { localStorage.setItem(LS_DAILY_STATE, JSON.stringify(state)); } catch {}
  }

  /* ═══════════════════════════════════════
     INFINITE STATS
  ═══════════════════════════════════════ */
  function loadInfStats() {
    try {
      return JSON.parse(localStorage.getItem(LS_INF)) || { played: 0, streak: 0 };
    } catch { return { played: 0, streak: 0 }; }
  }

  function saveInfStats(stats) {
    try { localStorage.setItem(LS_INF, JSON.stringify(stats)); } catch {}
  }

  /* ═══════════════════════════════════════
     START SCREEN SETUP
  ═══════════════════════════════════════ */
  function setupStartScreen() {
    const todayIST = getISTDate();
    const saved     = loadDailyState();
    const isToday   = saved && saved.date === todayIST;
    const isDone    = isToday && saved.gameOver;
    const inProgress = isToday && !saved.gameOver && saved.guesses.some(g => g.length === SLOTS_TOTAL);

    const dailyCard   = document.getElementById("dailyCard");
    const dailySub    = document.getElementById("dailySub");
    const dailyDetail = document.getElementById("dailyDetail");
    const infDetail   = document.getElementById("infiniteDetail");

    // Puzzle number
    const pNum = puzzleNumber(todayIST);
    dailySub.textContent = `Puzzle #${pNum}`;

   dailyCard.classList.remove("mode-card--done", "mode-card--done-tappable");
    if (isDone) {
      dailyCard.classList.add("mode-card--done-tappable");
      dailyDetail.textContent = saved.won ? "Completed ✔ — tap to view" : "Failed ✖ — tap to view";
      startCountdown(dailyDetail, true);
    } else if (inProgress) {
      const guessesUsed = saved.guesses.filter(g => g.length === SLOTS_TOTAL).length;
      dailyDetail.textContent = `Continue — ${guessesUsed}/${ROWS_TOTAL} guesses used`;
      startCountdownLabel(dailyDetail);
    } else {
      dailyDetail.textContent = "Same code for everyone";
      startCountdownLabel(dailyDetail);
    }

    // Infinite stats
    const stats = loadInfStats();
    if (stats.played > 0) {
      infDetail.textContent = `Best streak: ${stats.streak}  ·  Played: ${stats.played}`;
    } else {
      infDetail.textContent = "Play anytime";
    }

    // Mode card clicks
    dailyCard.addEventListener("click", () => {
      clearInterval(countdownInterval);
      if (isDone) {
        // Just view the already-completed puzzle's result — no replay possible.
        secret      = saved.secret;
        activeRow   = saved.activeRow;
        currentMode = "daily";
        hide("startScreen");
        showDailyResult(saved.won);
        return;
      }
      launchGame("daily");
    });
    document.getElementById("infiniteCard").addEventListener("click", () => {
      clearInterval(countdownInterval);
      launchGame("infinite");
    });
  }

  /* Live countdown shown inside the daily card */
  function startCountdown(el, prefixNext) {
    function tick() {
      const ms = msUntilISTMidnight();
      el.textContent = (prefixNext ? "Next puzzle in " : "") + formatCountdown(ms);
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  /* Show "Resets in HH:MM:SS" below the puzzle number before playing */
  function startCountdownLabel(el) {
    function tick() {
      const ms = msUntilISTMidnight();
      el.textContent = `Resets in ${formatCountdown(ms)}`;
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  /* ═══════════════════════════════════════
     LAUNCH GAME
  ═══════════════════════════════════════ */
  function launchGame(mode) {
    currentMode = mode;
    hide("startScreen");
    show("gameSection");
    initDOMRefs();
    buildControls();
    startGame();
  }

  /* ═══════════════════════════════════════
     GAME CORE
  ═══════════════════════════════════════ */
  function randomCode() {
    return Array.from({ length: SLOTS_TOTAL }, () =>
      COLORS[Math.floor(Math.random() * COLORS.length)]
    );
  }

  function startGame() {
   hide("rulesSection");
    hide("dailyResult");
    document.querySelector(".vatsal-related")?.setAttribute("hidden", "");
    document.body.style.overflow = "hidden";

    if (currentMode === "daily") {
      const todayIST = getISTDate();
      const saved = loadDailyState();
      if (saved && saved.date === todayIST) {
        secret    = saved.secret;
        guesses   = saved.guesses.map(g => g.slice());
        activeRow = saved.activeRow;
        gameOver  = saved.gameOver;
      } else {
        secret    = dailyCode(todayIST);
        guesses   = Array.from({ length: ROWS_TOTAL }, () => []);
        activeRow = ROWS_TOTAL - 1;
        gameOver  = false;
        saveDailyState({ date: todayIST, secret, guesses, activeRow, gameOver, won: false });
      }
    } else {
      secret    = randomCode();
      guesses   = Array.from({ length: ROWS_TOTAL }, () => []);
      activeRow = ROWS_TOTAL - 1;
      gameOver  = false;
    }

    // Mode badge
    const badge = document.getElementById("modeBadge");
    if (currentMode === "daily") {
      badge.textContent = `📅 Daily — Puzzle #${puzzleNumber(getISTDate())}`;
      badge.className = "mode-badge mode-badge--daily";
    } else {
      badge.textContent = "∞ Infinite";
      badge.className = "mode-badge mode-badge--infinite";
    }

    updateGuessesLeft();
    buildSecret();
    buildRows();
    replaySavedGuesses();
  }

 /* Re-fill slots + feedback for any guesses already submitted (resumed daily game) */
  function replaySavedGuesses() {
    for (let row = 0; row < ROWS_TOTAL; row++) {
      const guess = guesses[row];
      if (!guess || guess.length !== SLOTS_TOTAL) continue;
      const slots = Array.from(rowsEl.querySelectorAll(`.mm-row[data-row="${row}"] .slot`));
      guess.forEach((color, i) => {
        slots[i].classList.add("filled");
        slots[i].style.setProperty("--peg-color", color);
      });
      const score = scoreGuess(guess);
   const rowEl = rowsEl.querySelector(`.mm-row[data-row="${row}"]`);
      const exactEl = rowEl.querySelector(".fb-exact");
      const nearEl  = rowEl.querySelector(".fb-near");
      exactEl.textContent = score.exact;
      exactEl.style.color = score.exact > 0 ? "#30d158" : "#555";
      nearEl.textContent  = score.near;
      nearEl.style.color  = score.near > 0 ? "#f4d35e" : "#555";
    }
    if (gameOver) revealSecret();
  }

  function updateGuessesLeft() {
    if (guessesCountEl) guessesCountEl.textContent = activeRow + 1;
  }

  /* ═══════════════════════════════════════
     BUILD UI
  ═══════════════════════════════════════ */
  function buildSecret() {
    secretEl.replaceChildren();
    secret.forEach(color => {
      const dot = make("span", "secret-dot hidden");
      dot.style.setProperty("--peg-color", color);
      dot.setAttribute("aria-label", LABELS[color]);
      secretEl.appendChild(dot);
    });
  }

  function buildRows() {
    rowsEl.replaceChildren();
    for (let row = 0; row < ROWS_TOTAL; row++) {
  const rowEl = make("div", "mm-row");
      rowEl.dataset.row = row;
      if (row === activeRow) rowEl.classList.add("active");

      // 4 guess slots
      const slotsWrap = make("div", "slots-wrap");
      for (let s = 0; s < SLOTS_TOTAL; s++) {
        const cell = make("div", "guess-cell");
        const peg  = make("span", "slot");
        peg.setAttribute("aria-label", `Row ${ROWS_TOTAL - row}, slot ${s + 1}`);
        cell.appendChild(peg);
        slotsWrap.appendChild(cell);
      }
      rowEl.appendChild(slotsWrap);

      // Exact count
      const exactEl = make("span", "fb-exact", "–");
      rowEl.appendChild(exactEl);

      // Near count
      const nearEl = make("span", "fb-near", "–");
      rowEl.appendChild(nearEl);

      rowsEl.appendChild(rowEl);
    }
  }

  function buildControls() {
    // Palette
    paletteEl.replaceChildren();
    COLORS.forEach(color => {
      const btn = make("button", "color-choice");
      btn.type = "button";
      btn.dataset.color = color;
      btn.style.setProperty("--peg-color", color);
      btn.title = LABELS[color];
      btn.setAttribute("aria-label", LABELS[color]);
      btn.addEventListener("click", () => addColor(color));
      paletteEl.appendChild(btn);
    });

    // Action row: Clear + OK
    controlsEl.replaceChildren();

    const clearBtn = make("button", "action remove", "🗑 CLEAR");
    clearBtn.type = "button";
    clearBtn.addEventListener("click", removeColor);
    controlsEl.appendChild(clearBtn);

    const okBtn = make("button", "action submit", "✓ OK");
    okBtn.type = "button";
    okBtn.addEventListener("click", submitGuess);
    controlsEl.appendChild(okBtn);

    // New game / restart button in title row
    const ngBtn = document.getElementById("newGameBtn");
    // Remove previous listeners by cloning
    const fresh = ngBtn.cloneNode(true);
    ngBtn.parentNode.replaceChild(fresh, ngBtn);
    fresh.addEventListener("click", () => {
      if (currentMode === "infinite") {
        startGame();
      } else {
        // Daily: go back to start screen
        document.body.style.overflow = "";
        hide("gameSection");
        location.reload(); // simplest reset for daily
      }
    });
  }

  /* ═══════════════════════════════════════
     GAMEPLAY
  ═══════════════════════════════════════ */
 function currentSlots() {
    return Array.from(
      rowsEl.querySelectorAll(`.mm-row[data-row="${activeRow}"] .slot`)
    );
  }

  function addColor(color) {
    if (gameOver) return;
    const guess = guesses[activeRow];
    if (guess.length >= SLOTS_TOTAL) return;
    guess.push(color);
    const slot = currentSlots()[guess.length - 1];
    slot.classList.add("filled");
    slot.style.setProperty("--peg-color", color);
  }

  function removeColor() {
    if (gameOver) return;
    const guess = guesses[activeRow];
    if (!guess.length) return;
    const slot = currentSlots()[guess.length - 1];
    guess.pop();
    slot.classList.remove("filled");
    slot.style.removeProperty("--peg-color");
  }

  function scoreGuess(guess) {
    let exact = 0;
    const secretRem = [];
    const guessRem  = [];
    for (let i = 0; i < SLOTS_TOTAL; i++) {
      if (guess[i] === secret[i]) {
        exact++;
      } else {
        secretRem.push(secret[i]);
        guessRem.push(guess[i]);
      }
    }
    let near = 0;
    guessRem.forEach(c => {
      const idx = secretRem.indexOf(c);
      if (idx !== -1) { near++; secretRem.splice(idx, 1); }
    });
    return { exact, near };
  }

 function showFeedback(score) {
    const row   = rowsEl.querySelector(`.mm-row[data-row="${activeRow}"]`);
    const exact = row.querySelector(".fb-exact");
    const near  = row.querySelector(".fb-near");
    exact.textContent = score.exact;
    exact.style.color = score.exact > 0 ? "#30d158" : "#555";
    near.textContent  = score.near;
    near.style.color  = score.near > 0  ? "#f4d35e" : "#555";
  }

  function revealSecret() {
    secretEl.querySelectorAll(".secret-dot").forEach(d => d.classList.remove("hidden"));
  }

 function setActiveRow(row) {
    rowsEl.querySelectorAll(".mm-row").forEach(r =>
      r.classList.toggle("active", Number(r.dataset.row) === row)
    );
    updateGuessesLeft();
  }

  function submitGuess() {
    if (gameOver) return;
    const guess = guesses[activeRow];
    if (guess.length !== SLOTS_TOTAL) return;

    const score = scoreGuess(guess);
    showFeedback(score);

    if (score.exact === SLOTS_TOTAL) {
      gameOver = true;
      revealSecret();
      persistDailyIfNeeded(true, true);
      endGame(true, score);
      return;
    }
if (activeRow === 0) {
      gameOver = true;
      revealSecret();
      persistDailyIfNeeded(true, false);
      endGame(false, score);
      return;
    }

    activeRow--;
    setActiveRow(activeRow);
    persistDailyIfNeeded(false, false);
  }

  /* Save current daily progress to localStorage (no-op for infinite mode) */
  function persistDailyIfNeeded(finished, won) {
    if (currentMode !== "daily") return;
    saveDailyState({
      date: getISTDate(),
      secret,
      guesses,
      activeRow,
      gameOver: finished,
      won: finished ? !!won : false
    });
  }

  /* ═══════════════════════════════════════
     END GAME
  ═══════════════════════════════════════ */
  function endGame(won, score) {
    document.body.style.overflow = "";

    if (currentMode === "daily") {
      showDailyResult(won);
    } else {
      // Infinite stats
      const stats = loadInfStats();
      stats.played++;
      if (won) { stats.streak++; } else { stats.streak = 0; }
      saveInfStats(stats);
      // Show rules + footer
      show("rulesSection");
      document.querySelector(".vatsal-related")?.removeAttribute("hidden");
      setTimeout(() => window.VatsalLolGameComplete?.(), 100);
    }
  }

  function showDailyResult(won) {
    hide("gameSection");
    show("dailyResult");

    const title = document.getElementById("dailyResultTitle");
    const body  = document.getElementById("dailyResultBody");

    // Count fully-submitted rows
    const guessesUsed = guesses.filter(g => g.length === SLOTS_TOTAL).length;

    // Build colored dot display for the answer
    const codeDots = secret.map(c =>
      `<span class="result-dot" style="background:${c};"></span>`
    ).join("");
    const codeBlock = `<div class="result-code-dots">${codeDots}</div>`;

    if (won) {
      title.textContent = "✅ Daily Completed";
      title.style.color = "#30d158";
      body.innerHTML = `
        <p class="result-stat">Solved in <strong>${guessesUsed}</strong> guess${guessesUsed === 1 ? "" : "es"}</p>
        <p class="result-label">The code was</p>
        ${codeBlock}
        <p class="result-cta">Come back tomorrow.</p>
        <div class="result-countdown" id="resultCountdown"></div>
      `;
    } else {
      title.textContent = "❌ Daily Failed";
      title.style.color = "#ff453a";
      body.innerHTML = `
        <p class="result-label">The code was</p>
        ${codeBlock}
        <p class="result-cta">Next puzzle in</p>
        <div class="result-countdown" id="resultCountdown"></div>
      `;
    }

    // Start countdown inside result
    const cdEl = document.getElementById("resultCountdown");
    function tickResult() {
      cdEl.textContent = formatCountdown(msUntilISTMidnight());
    }
    tickResult();
    countdownInterval = setInterval(tickResult, 1000);

    // Show footer
    document.querySelector(".vatsal-related")?.removeAttribute("hidden");
    setTimeout(() => window.VatsalLolGameComplete?.(), 100);

    // Play Infinite from result
    document.getElementById("resultPlayInfinite")?.addEventListener("click", () => {
      clearInterval(countdownInterval);
      hide("dailyResult");
      show("gameSection");
      initDOMRefs();
      buildControls();
      currentMode = "infinite";
      startGame();
    });
  }

  /* ═══════════════════════════════════════
     BOOT
  ═══════════════════════════════════════ */
  setupStartScreen();

})();