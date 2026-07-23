(function () {
  "use strict";

  const LEVEL_CONFIG = {
    easy:   { size: 4, boxRows: 2, boxCols: 2, cluesMin: 8,  cluesMax: 10, checkBox: true  },
    medium: { size: 6, boxRows: 2, boxCols: 3, cluesMin: 18, cluesMax: 22, checkBox: true  },
    hard:   { size: 9, boxRows: 3, boxCols: 3, cluesMin: 25, cluesMax: 28, checkBox: true  },
  };

  const LEVEL_LABELS = { easy: "Easy 4×4", medium: "Medium 6×6", hard: "Hard 9×9" };
  const MAX_HINTS = 3;

  let state = {
    level: "easy",
    size: 4,
    boxRows: 2, boxCols: 2,
    checkBox: false,
    solution: null, puzzle: null, given: null,
    selectedCell: null,
    startTime: null, timerId: null,
    cells: [],
    hintsLeft: MAX_HINTS,
    solved: false,   // true = auto-solved (loser)
  };

  /* ---- DOM refs ---- */
  const levelScreen   = document.getElementById("levelScreen");
  const gameScreen    = document.getElementById("gameScreen");
  const boardEl       = document.getElementById("board");
  const timerEl       = document.getElementById("timer");
  const levelBadge    = document.getElementById("levelBadge");
  const numberPadEl   = document.getElementById("numberPad");
  const winBanner     = document.getElementById("winBanner");
  const winMsgEl      = document.getElementById("winMsg");
  const winTimeEl     = document.getElementById("winTime");
  const hintBtn       = document.getElementById("hintBtn");
  const hintCountEl   = document.getElementById("hintCount");
  const solveBtn      = document.getElementById("solveBtn");
  const gameBody      = document.getElementById("gameBody");

  /* ==========================================
  SCREEN SWITCHING
  ========================================== */

  function showScreen(screen) {
    [levelScreen, gameScreen].forEach(s => s.classList.remove("active"));
    screen.classList.add("active");
    const hr = document.getElementById("headerRight");
    if (hr) {
      hr.style.display = (screen === gameScreen) ? "flex" : "none";
    }
  }

  /* ==========================================
  GRID LOGIC (unchanged)
  ========================================== */

  function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  function isValid(grid, row, col, num, size, boxRows, boxCols, checkBox) {
    for (let c = 0; c < size; c++) if (grid[row][c] === num) return false;
    for (let r = 0; r < size; r++) if (grid[r][col] === num) return false;
    if (checkBox && boxRows > 0 && boxCols > 0) {
      const br = Math.floor(row / boxRows) * boxRows;
      const bc = Math.floor(col / boxCols) * boxCols;
      for (let r = br; r < br + boxRows; r++)
        for (let c = bc; c < bc + boxCols; c++)
          if (grid[r][c] === num) return false;
    }
    return true;
  }

  function solve(grid, size, boxRows, boxCols, checkBox) {
    const nums = Array.from({ length: size }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== 0) continue;
        for (const num of nums) {
          if (!isValid(grid, r, c, num, size, boxRows, boxCols, checkBox)) continue;
          grid[r][c] = num;
          if (solve(grid, size, boxRows, boxCols, checkBox)) return true;
          grid[r][c] = 0;
        }
        return false;
      }
    }
    return true;
  }

  function generateFullGrid(size, boxRows, boxCols, checkBox) {
    const grid = createEmptyGrid(size);
    solve(grid, size, boxRows, boxCols, checkBox);
    return grid;
  }

  function getShuffledIndices(size) {
    const indices = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) indices.push({ r, c });
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  function createPuzzle(level) {
    const { size, boxRows, boxCols, cluesMin, cluesMax, checkBox } = LEVEL_CONFIG[level];
    const solution = generateFullGrid(size, boxRows, boxCols, checkBox);
    const cluesCount = cluesMin + Math.floor(Math.random() * (cluesMax - cluesMin + 1));
    const total = size * size;
    const toRemove = total - cluesCount;
    const puzzle = solution.map(row => row.slice());
    const given  = puzzle.map(row => row.map(() => false));
    const indices = getShuffledIndices(size);
    for (let k = 0; k < toRemove; k++) {
      const { r, c } = indices[k];
      puzzle[r][c] = null;
      given[r][c]  = false;
    }
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (puzzle[r][c] !== null) given[r][c] = true;
    return { solution, puzzle, given };
  }

  function flatIndex(r, c) { return r * state.size + c; }

  /* ==========================================
  CELL UI
  ========================================== */

  function updateCellUI(index, value, isError, isSameNumber) {
    const cell = state.cells[index];
    if (!cell) return;
    const r = Math.floor(index / state.size), c = index % state.size;
    const isGiven = state.given[r][c];
    cell.textContent = value !== null && value !== "" ? value : "";
    cell.classList.remove("user", "given", "error", "same-number");
    if (isGiven) cell.classList.add("given");
    else         cell.classList.add("user");
    if (isError)      cell.classList.add("error");
    if (isSameNumber) cell.classList.add("same-number");
  }

  function getCurrentGrid() {
    const grid = state.puzzle.map(row => row.slice());
    const total = state.size * state.size;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / state.size), c = i % state.size;
      if (state.given[r][c]) continue;
      const val = state.cells[i] && state.cells[i].textContent.trim();
      grid[r][c] = val === "" ? null : parseInt(val, 10);
    }
    return grid;
  }

  function getConflicts(grid, row, col) {
    const num = grid[row][col];
    const maxNum = state.size;
    if (num == null || isNaN(num) || num < 1 || num > maxNum) return { error: false, same: [] };
    const same = [];
    for (let c = 0; c < state.size; c++)
      if (c !== col && grid[row][c] === num) same.push(flatIndex(row, c));
    for (let r = 0; r < state.size; r++)
      if (r !== row && grid[r][col] === num) same.push(flatIndex(r, col));
    if (state.checkBox && state.boxRows > 0 && state.boxCols > 0) {
      const br = Math.floor(row / state.boxRows) * state.boxRows;
      const bc = Math.floor(col / state.boxCols) * state.boxCols;
      for (let r = br; r < br + state.boxRows; r++)
        for (let c = bc; c < bc + state.boxCols; c++)
          if ((r !== row || c !== col) && grid[r][c] === num)
            same.push(flatIndex(r, c));
    }
    return { error: same.length > 0, same };
  }

  function refreshBoardHighlights() {
    const grid = getCurrentGrid();
    const total = state.size * state.size;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / state.size), c = i % state.size;
      const { error, same } = getConflicts(grid, r, c);
      const val = grid[r][c];
      updateCellUI(i, val !== null ? String(val) : "", error, same.length > 0);
    }
  }

  function isComplete() {
    const grid = getCurrentGrid();
    for (let r = 0; r < state.size; r++)
      for (let c = 0; c < state.size; c++) {
        if (grid[r][c] == null) return false;
        const { error } = getConflicts(grid, r, c);
        if (error) return false;
      }
    return true;
  }

  /* ==========================================
  WIN
  ========================================== */

  function triggerWin(wasAutoSolved) {
    stopTimer();
    state.solved = wasAutoSolved;

    winMsgEl.textContent = wasAutoSolved ? "😅 Solved for you!" : "🎉 You solved it!";
    winTimeEl.textContent = timerEl.textContent;
    winBanner.classList.remove("hidden");

    // Disable number pad + action btns
    hintBtn.disabled  = true;
    solveBtn.disabled = true;

    // Scroll banner into view
    winBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Footer below
    setTimeout(() => {
      const related = document.querySelector(".vatsal-related");
      if (related && !gameBody.contains(related)) {
        gameBody.appendChild(related);
      }
      // window.VatsalLolGameComplete?.();
    }, 500);
  }

  function checkWin() {
    if (!isComplete()) return;
    triggerWin(false);
  }

  /* ==========================================
  BOARD BUILD
  ========================================== */

  function buildBoard() {
    const { size, boxRows, boxCols } = state;
    boardEl.innerHTML = "";
    boardEl.className = "board board-" + size;
    boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardEl.style.gridTemplateRows    = `repeat(${size}, 1fr)`;
    state.cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        if ((c + 1) % boxCols === 0) cell.classList.add("cell-edge-r");
        if ((r + 1) % boxRows === 0) cell.classList.add("cell-edge-b");
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.setAttribute("role", "gridcell");
        const val = state.puzzle[r][c];
        if (state.given[r][c]) {
          cell.textContent = val;
          cell.classList.add("given");
          cell.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, given value ${val}`);
        } else {
          cell.classList.add("user");
          cell.setAttribute("tabindex", "0");
          cell.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}, empty`);
          cell.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              selectCell(r, c);
            }
          });
        }
        cell.addEventListener("click", () => selectCell(r, c));
        boardEl.appendChild(cell);
        state.cells.push(cell);
      }
    }
  }

  function updateNumberPad() {
    const size = state.size;
    numberPadEl.querySelectorAll(".num-btn[data-num]").forEach(btn => {
      const num = parseInt(btn.dataset.num, 10);
      if (num === 0) { btn.style.display = ""; return; }
      btn.style.display = num <= size ? "" : "none";
    });
    numberPadEl.style.setProperty("--cols", size <= 4 ? "3" : "5");
  }

  /* ==========================================
  SELECTION + INPUT
  ========================================== */

  function selectCell(r, c) {
    if (state.given[r][c]) return;
    state.cells.forEach(cell => cell.classList.remove("selected"));
    state.selectedCell = { r, c };
    state.cells[flatIndex(r, c)].classList.add("selected");
  }

  function findNextSelectableCell(r, c, dir) {
    const size = state.size;
    if (dir === "up")    for (let nr = r-1; nr >= 0; nr--)    if (!state.given[nr][c])  return { r: nr, c };
    if (dir === "down")  for (let nr = r+1; nr < size; nr++)  if (!state.given[nr][c])  return { r: nr, c };
    if (dir === "left")  for (let nc = c-1; nc >= 0; nc--)    if (!state.given[r][nc])  return { r, c: nc };
    if (dir === "right") for (let nc = c+1; nc < size; nc++)  if (!state.given[r][nc])  return { r, c: nc };
    return null;
  }

  function setCellValue(r, c, num) {
    if (state.given[r][c]) return;
    const maxNum = state.size;
    if (num !== 0 && (num < 1 || num > maxNum)) return;
    const i = flatIndex(r, c);
    state.cells[i].textContent = num === 0 ? "" : num;
    state.cells[i].classList.remove("hint-cell", "solved-cell");
    refreshBoardHighlights();
    checkWin();
  }

  /* ==========================================
  HINT — fill one random empty cell
  ========================================== */

  function useHint() {
    if (state.hintsLeft <= 0) return;

    // Collect empty non-given cells
    const empty = [];
    for (let r = 0; r < state.size; r++)
      for (let c = 0; c < state.size; c++)
        if (!state.given[r][c]) {
          const i = flatIndex(r, c);
          if (!state.cells[i].textContent.trim()) empty.push({ r, c, i });
        }

    if (!empty.length) return;

    const pick = empty[Math.floor(Math.random() * empty.length)];
    const ans  = state.solution[pick.r][pick.c];

    state.cells[pick.i].textContent = ans;
    state.cells[pick.i].classList.add("hint-cell");

    state.hintsLeft--;
    hintCountEl.textContent = `(${state.hintsLeft})`;
    if (state.hintsLeft === 0) hintBtn.disabled = true;

    refreshBoardHighlights();
    checkWin();
  }

  /* ==========================================
  SOLVE IT — fill entire board (loser path)
  ========================================== */

  function solveAll() {
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
        if (state.given[r][c]) continue;
        const i = flatIndex(r, c);
        state.cells[i].textContent = state.solution[r][c];
        state.cells[i].classList.remove("hint-cell");
        state.cells[i].classList.add("solved-cell");
      }
    }
    refreshBoardHighlights();
    triggerWin(true);
  }

  /* ==========================================
  TIMER
  ========================================== */

  function startTimer() {
    state.startTime = Date.now();
    state.timerId = setInterval(() => {
      const sec = Math.floor((Date.now() - state.startTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      timerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  /* ==========================================
  START GAME
  ========================================== */

  function startGame(level) {
    state.level    = level;
    const config   = LEVEL_CONFIG[level];
    state.size     = config.size;
    state.boxRows  = config.boxRows;
    state.boxCols  = config.boxCols;
    state.checkBox = config.checkBox;
    state.hintsLeft = MAX_HINTS;
    state.solved   = false;

    const { solution, puzzle, given } = createPuzzle(level);
    state.solution = solution;
    state.puzzle   = puzzle;
    state.given    = given;
    state.selectedCell = null;

    stopTimer();
    timerEl.textContent = "0:00";
    levelBadge.textContent = LEVEL_LABELS[level];

    // Hide win banner
    winBanner.classList.add("hidden");

    // Reset hint/solve buttons
    hintBtn.disabled  = false;
    solveBtn.disabled = false;
    hintCountEl.textContent = `(${MAX_HINTS})`;

    // Hide footer
    const related = document.querySelector(".vatsal-related");
    if (related && gameBody.contains(related)) document.body.appendChild(related);
    related?.setAttribute("hidden", "");

    buildBoard();
    updateNumberPad();
    refreshBoardHighlights();
    startTimer();
    showScreen(gameScreen);
  }

  /* ==========================================
  BUTTON WIRING
  ========================================== */

  document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", () => startGame(btn.dataset.level));
  });

  document.getElementById("newGameBtn").addEventListener("click", () => {
    startGame(state.level);
  });

  document.getElementById("changeLevelBtn").addEventListener("click", () => {
    stopTimer();
    showScreen(levelScreen);
  });

  document.getElementById("playAgainBtn").addEventListener("click", () => {
    startGame(state.level);
  });

  hintBtn.addEventListener("click", useHint);
  solveBtn.addEventListener("click", solveAll);

  numberPadEl.addEventListener("click", e => {
    const btn = e.target.closest(".num-btn");
    if (!btn || !state.selectedCell) return;
    const num = parseInt(btn.dataset.num, 10);
    setCellValue(state.selectedCell.r, state.selectedCell.c, num);
  });

  document.addEventListener("keydown", e => {
    if (!state.selectedCell) return;
    const { r, c } = state.selectedCell;
    const maxNum = state.size;
    if (e.key >= "1" && e.key <= "9") {
      const n = parseInt(e.key, 10);
      if (n <= maxNum) setCellValue(r, c, n);
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      setCellValue(r, c, 0);
      e.preventDefault();
    } else if (e.key === "ArrowUp"    || e.key === "w" || e.key === "W") {
      const next = findNextSelectableCell(r, c, "up");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowDown"  || e.key === "s" || e.key === "S") {
      const next = findNextSelectableCell(r, c, "down");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") {
      const next = findNextSelectableCell(r, c, "left");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      const next = findNextSelectableCell(r, c, "right");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    }
  });

})();