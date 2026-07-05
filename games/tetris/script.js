(function() {
    // ---------- 8-BIT RAINBOW THEME TETRIS ----------
    // Color changing theme: cycles through HSL
    let currentHue = 0;
    let themeInterval = null;

    function updateThemeColor(hue) {
      const color = `hsl(${hue}, 100%, 55%)`;
      document.documentElement.style.setProperty('--theme-color', color);
    }

    function startColorCycle() {
      if (themeInterval) clearInterval(themeInterval);
      themeInterval = setInterval(() => {
        currentHue = (currentHue + 3) % 360;
        updateThemeColor(currentHue);
      }, 80);
    }

    // ---------- GAME CONSTANTS ----------
    const COLS = 10;
    const ROWS = 20;
    const CELL_SIZE = 30;

    const TETROMINOS = [
      { name: "I", shape: [[1,1,1,1]], color: "#00ffff", neonEdge: "#0ffff0" },
      { name: "O", shape: [[1,1],[1,1]], color: "#ffff00", neonEdge: "#ffff80" },
      { name: "T", shape: [[0,1,0],[1,1,1]], color: "#cc44ff", neonEdge: "#e080ff" },
      { name: "S", shape: [[0,1,1],[1,1,0]], color: "#44ff44", neonEdge: "#8aff8a" },
      { name: "Z", shape: [[1,1,0],[0,1,1]], color: "#ff5555", neonEdge: "#ff8888" },
      { name: "L", shape: [[1,0,0],[1,1,1]], color: "#ffaa33", neonEdge: "#ffcc66" },
      { name: "J", shape: [[0,0,1],[1,1,1]], color: "#3399ff", neonEdge: "#88bbff" }
    ];
    const PIECES_COUNT = TETROMINOS.length;

    class SevenBag {
      constructor() { this.bag = []; this.refill(); }
      refill() {
        this.bag = [...Array(PIECES_COUNT).keys()];
        for (let i = this.bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
      }
      next() {
        if (this.bag.length === 0) this.refill();
        return this.bag.shift();
      }
    }

    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let activePiece = null;
    let nextQueue = [];
    let holdPiece = null;
    let canHold = true;
    let gameActive = true;
    let gameInterval = null;

    let score = 0;
    let totalLines = 0;
    let currentLevel = 0;
    let highScore = localStorage.getItem('rainbowTetris') ? parseInt(localStorage.getItem('rainbowTetris')) : 0;

    let bag = new SevenBag();

    const canvas = document.getElementById('tetrisCanvas');
    const ctx = canvas.getContext('2d');
    const holdCanvas = document.getElementById('holdCanvas');
    const holdCtx = holdCanvas.getContext('2d');
    const nextCanvas = document.getElementById('nextCanvas');
    const nextCtx = nextCanvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreVal');
    const linesSpan = document.getElementById('linesVal');
    const levelSpan = document.getElementById('levelVal');
    const highSpan = document.getElementById('highVal');
    const newGameBtn = document.getElementById('newGameBtn');
    const touchControls = document.querySelector('.touch-controls');
    const holdPanel = document.getElementById('holdPanel');
    const nextPanel = document.getElementById('nextPanel');
    const mainCabinet = document.getElementById('mainCabinet');
    function copyMatrix(matrix) {
      return matrix.map(row => [...row]);
    }

    function updateUI() {
      scoreSpan.innerText = score;
      linesSpan.innerText = totalLines;
      levelSpan.innerText = currentLevel;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('rainbowTetris', highScore);
      }
      highSpan.innerText = highScore;
    }

    function getFallDelay() {
      let delay = 480 - (currentLevel * 25);
      delay = Math.min(Math.max(delay, 70), 480);
      return delay;
    }

    function restartGameLoop() {
      if (gameInterval) clearInterval(gameInterval);
      if (!gameActive) return;
      gameInterval = setInterval(() => {
        if (gameActive) movePieceDown();
      }, getFallDelay());
    }

    function updateLevelAndSpeed() {
      const newLevel = Math.floor(totalLines / 10);
      if (newLevel !== currentLevel) {
        currentLevel = newLevel;
        updateUI();
        if (gameActive) restartGameLoop();
      } else updateUI();
    }

    function addScore(linesCleared) {
      const multipliers = [0, 100, 300, 500, 800];
      const added = multipliers[linesCleared] * (currentLevel + 1);
      score += added;
      totalLines += linesCleared;
      updateLevelAndSpeed();
    }

    function collides(matrix, x, y) {
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] !== 0) {
            const boardRow = y + r;
            const boardCol = x + c;
            if (boardRow >= ROWS || boardCol < 0 || boardCol >= COLS || boardRow < 0) return true;
            if (boardRow >= 0 && board[boardRow][boardCol] !== 0) return true;
          }
        }
      }
      return false;
    }

    function mergeAndSpawn() {
      if (!activePiece) return;
      for (let r = 0; r < activePiece.matrix.length; r++) {
        for (let c = 0; c < activePiece.matrix[0].length; c++) {
          if (activePiece.matrix[r][c]) {
            const row = activePiece.y + r;
            const col = activePiece.x + c;
            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
              board[row][col] = activePiece.color;
            }
          }
        }
      }
      let rowsCleared = 0;
      for (let row = ROWS - 1; row >= 0;) {
        let full = true;
        for (let col = 0; col < COLS; col++) {
          if (board[row][col] === 0) { full = false; break; }
        }
        if (full) {
          for (let r = row; r > 0; r--) board[r] = [...board[r - 1]];
          board[0] = Array(COLS).fill(0);
          rowsCleared++;
        } else {
          row--;
        }
      }
      if (rowsCleared > 0) addScore(rowsCleared);
      spawnNewPiece();
      drawAll();
    }

    function refillNextQueue() {
      while (nextQueue.length < 3) nextQueue.push(bag.next());
    }

    function spawnNewPiece() {
      if (!gameActive) return;
      if (nextQueue.length === 0) refillNextQueue();
      const nextType = nextQueue.shift();
      refillNextQueue();
      const pieceDef = TETROMINOS[nextType];
      const newMatrix = copyMatrix(pieceDef.shape);
      const spawnX = Math.floor((COLS - newMatrix[0].length) / 2);
      activePiece = {
        matrix: newMatrix,
        color: pieceDef.color,
        neonEdge: pieceDef.neonEdge,
        x: spawnX,
        y: 0,
        typeIdx: nextType
      };
     if (collides(activePiece.matrix, activePiece.x, activePiece.y)) {
        gameActive = false;
        document.body.classList.add('game-ended');
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = null;
        canHold = true;
        drawAll();
        setTimeout(() => window.VatsalLolGameComplete?.(), 0);
        return;
      }
      canHold = true;
      drawAll();
    }

    function initNewGame() {
      // --- VATSAL FOOTER: hide on new game ---
      document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
      document.body.classList.remove('game-ended');

      if (gameInterval) clearInterval(gameInterval);
      board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
      bag = new SevenBag();
      nextQueue = [];
      refillNextQueue();
      holdPiece = null;
      canHold = true;
      gameActive = true;
      score = 0;
      totalLines = 0;
      currentLevel = 0;
      updateUI();
      const firstType = nextQueue.shift();
      refillNextQueue();
      const firstDef = TETROMINOS[firstType];
      const startMatrix = copyMatrix(firstDef.shape);
      activePiece = {
        matrix: startMatrix,
        color: firstDef.color,
        neonEdge: firstDef.neonEdge,
        x: Math.floor((COLS - startMatrix[0].length) / 2),
        y: 0,
        typeIdx: firstType
      };
 if (collides(activePiece.matrix, activePiece.x, activePiece.y)) {
        gameActive = false;
        document.body.classList.add('game-ended');
        drawAll();
        setTimeout(() => window.VatsalLolGameComplete?.(), 0);
        return;
      }
      if (gameActive) restartGameLoop();
      drawAll();
    }

    function movePieceDown() {
      if (!gameActive || !activePiece) return;
      activePiece.y++;
      if (collides(activePiece.matrix, activePiece.x, activePiece.y)) {
        activePiece.y--;
        mergeAndSpawn();
        drawAll();
        if (!gameActive && gameInterval) {
          clearInterval(gameInterval);
          gameInterval = null;
        }
      }
      drawAll();
    }

    function moveHorizontal(dx) {
      if (!gameActive || !activePiece) return;
      activePiece.x += dx;
      if (collides(activePiece.matrix, activePiece.x, activePiece.y)) activePiece.x -= dx;
      drawAll();
    }

    function rotatePiece() {
      if (!gameActive || !activePiece) return;
      const matrix = activePiece.matrix;
      const rotated = matrix[0].map((_, idx) => matrix.map(row => row[idx]).reverse());
      const oldX = activePiece.x, oldY = activePiece.y;
      if (!collides(rotated, oldX, oldY)) {
        activePiece.matrix = rotated;
      } else {
        if (!collides(rotated, oldX - 1, oldY)) {
          activePiece.matrix = rotated; activePiece.x -= 1;
        } else if (!collides(rotated, oldX + 1, oldY)) {
          activePiece.matrix = rotated; activePiece.x += 1;
        } else if (!collides(rotated, oldX, oldY - 1)) {
          activePiece.matrix = rotated; activePiece.y -= 1;
        }
      }
      drawAll();
    }

    function hardDrop() {
      if (!gameActive || !activePiece) return;
      while (!collides(activePiece.matrix, activePiece.x, activePiece.y + 1)) {
        activePiece.y++;
      }
      mergeAndSpawn();
      drawAll();
    }

    function getGhostY() {
      if (!activePiece) return 0;
      let yTest = activePiece.y;
      while (!collides(activePiece.matrix, activePiece.x, yTest + 1)) yTest++;
      return yTest;
    }

    function holdCurrent() {
      if (!gameActive || !activePiece || !canHold) return;
      const currentCopy = {
        matrix: copyMatrix(activePiece.matrix),
        color: activePiece.color,
        neonEdge: activePiece.neonEdge,
        typeIdx: activePiece.typeIdx
      };
      if (holdPiece === null) {
        holdPiece = currentCopy;
        spawnNewPiece();
      } else {
        const swapped = holdPiece;
        holdPiece = currentCopy;
        const newMatrix = copyMatrix(swapped.matrix);
        const spawnX = Math.floor((COLS - newMatrix[0].length) / 2);
        activePiece = {
          matrix: newMatrix,
          color: swapped.color,
          neonEdge: swapped.neonEdge,
          x: spawnX,
          y: 0,
          typeIdx: swapped.typeIdx
        };
        if (collides(activePiece.matrix, activePiece.x, activePiece.y)) {
          gameActive = false;
          document.body.classList.add('game-ended');
          if (gameInterval) clearInterval(gameInterval);
          gameInterval = null;
          canHold = false;
          drawAll();
          setTimeout(() => window.VatsalLolGameComplete?.(), 0);
          return;
        }
      }
      canHold = false;
      drawAll();
    }

    // ---------- DRAWING ----------
    function drawBlock(x, y, color, neonEdge, isGhost = false) {
      if (isGhost) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        ctx.strokeStyle = neonEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        ctx.globalAlpha = 1;
        return;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
      ctx.strokeStyle = neonEdge;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1, y + 1, CELL_SIZE - 3, CELL_SIZE - 3);
      ctx.fillStyle = "#ffffff88";
      ctx.fillRect(x + 2, y + 2, 3, 2);
    }

    function drawBoardAndEverything() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const blockColor = board[row][col];
          if (blockColor !== 0) {
            let edge = "#0f0";
            for (let p of TETROMINOS) if (p.color === blockColor) { edge = p.neonEdge; break; }
            drawBlock(col * CELL_SIZE, row * CELL_SIZE, blockColor, edge, false);
          } else {
            ctx.fillStyle = "#000000";
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
            ctx.strokeStyle = "#1a1a2e";
            ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }

      if (activePiece && gameActive) {
        const ghostYpos = getGhostY();
        if (ghostYpos !== activePiece.y) {
          for (let r = 0; r < activePiece.matrix.length; r++) {
            for (let c = 0; c < activePiece.matrix[0].length; c++) {
              if (activePiece.matrix[r][c]) {
                const x = (activePiece.x + c) * CELL_SIZE;
                const y = (ghostYpos + r) * CELL_SIZE;
                ctx.globalAlpha = 0.28;
                ctx.fillStyle = activePiece.color;
                ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
                ctx.strokeStyle = activePiece.neonEdge;
                ctx.strokeRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
                ctx.globalAlpha = 1;
              }
            }
          }
        }
        for (let r = 0; r < activePiece.matrix.length; r++) {
          for (let c = 0; c < activePiece.matrix[0].length; c++) {
            if (activePiece.matrix[r][c]) {
              const x = (activePiece.x + c) * CELL_SIZE;
              const y = (activePiece.y + r) * CELL_SIZE;
              drawBlock(x, y, activePiece.color, activePiece.neonEdge, false);
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(x + 4, y + 4, 2, 2);
            }
          }
        }
      }

      if (!gameActive) {
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillStyle = "#ff66cc";
        ctx.fillText("GAME OVER", canvas.width / 2 - 70, canvas.height / 2 - 20);
        ctx.font = '12px monospace';
        ctx.fillStyle = "#ffaa66";
        ctx.fillText("PRESS [N] / NEW GAME", canvas.width / 2 - 80, canvas.height / 2 + 20);
      }
    }

    function drawMiniPiece(targetCtx, width, pieceMatrix, color, neonEdge) {
      targetCtx.clearRect(0, 0, width, width);
      targetCtx.fillStyle = "#000000";
      targetCtx.fillRect(0, 0, width, width);
      if (!pieceMatrix) return;
      const cells = width / 6;
      const rows = pieceMatrix.length;
      const cols = pieceMatrix[0].length;
      const offX = (width - (cols * cells)) / 2;
      const offY = (width - (rows * cells)) / 2;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (pieceMatrix[i][j]) {
            targetCtx.fillStyle = color;
            targetCtx.fillRect(offX + j * cells, offY + i * cells, cells - 1, cells - 1);
            targetCtx.strokeStyle = neonEdge;
            targetCtx.lineWidth = 1;
            targetCtx.strokeRect(offX + j * cells, offY + i * cells, cells - 1, cells - 1);
          }
        }
      }
    }

    function updatePreviews() {
      if (holdPiece && holdPiece.matrix) {
        drawMiniPiece(holdCtx, 120, holdPiece.matrix, holdPiece.color, holdPiece.neonEdge);
      } else {
        holdCtx.clearRect(0, 0, 120, 120);
        holdCtx.fillStyle = "#000000";
        holdCtx.fillRect(0, 0, 120, 120);
        holdCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || "#0f0";
        holdCtx.strokeRect(2, 2, 116, 116);
        holdCtx.fillStyle = "#aaa";
        holdCtx.font = "bold 10px monospace";
        holdCtx.fillText("---", 52, 66);
      }
      if (nextQueue.length > 0) {
        const nxt = TETROMINOS[nextQueue[0]];
        drawMiniPiece(nextCtx, 120, nxt.shape, nxt.color, nxt.neonEdge);
      } else {
        nextCtx.clearRect(0, 0, 120, 120);
        nextCtx.fillStyle = "#000000";
        nextCtx.fillRect(0, 0, 120, 120);
        nextCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim() || "#0f0";
        nextCtx.strokeRect(2, 2, 116, 116);
      }
    }

    function drawAll() {
      drawBoardAndEverything();
      updatePreviews();
    }

    // ----- KEYBOARD CONTROLS -----
    function keyHandler(e) {
      const key = e.key;
      if (key === 'n' || key === 'N') {
        e.preventDefault();
        initNewGame();
        return;
      }
      if (!gameActive) return;
      switch (key) {
        case 'ArrowLeft':  e.preventDefault(); moveHorizontal(-1); break;
        case 'ArrowRight': e.preventDefault(); moveHorizontal(1);  break;
        case 'ArrowDown':  e.preventDefault(); movePieceDown();    break;
        case 'ArrowUp':    e.preventDefault(); rotatePiece();      break;
        case 'r': case 'R': e.preventDefault(); rotatePiece();     break;
        case 'c': case 'C': e.preventDefault(); holdCurrent();     break;
        case ' ': case 'Space': e.preventDefault(); hardDrop();    break;
        default: break;
      }
    }

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keydown', function(e) {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Space','r','R','c','C','n','N'].includes(e.key)) {
        if (e.target === document.body || e.target.tagName !== 'INPUT') e.preventDefault();
      }
    });

    // ----- TOUCH BUTTON CONTROLS (hold/rotate/drop/left/down/right) -----
    const repeatableTouchActions = new Set(['left', 'right', 'down']);
    let touchRepeatDelay = null;
    let touchRepeatInterval = null;
    let activeTouchButton = null;

    function runTouchAction(action) {
      switch (action) {
        case 'left':      moveHorizontal(-1); break;
        case 'right':     moveHorizontal(1);  break;
        case 'down':      movePieceDown();    break;
        case 'rotate':    rotatePiece();      break;
        case 'hold':      holdCurrent();      break;
        case 'hard-drop': hardDrop();         break;
        default: break;
      }
    }

    function stopTouchRepeat() {
      if (touchRepeatDelay) clearTimeout(touchRepeatDelay);
      if (touchRepeatInterval) clearInterval(touchRepeatInterval);
      touchRepeatDelay = null;
      touchRepeatInterval = null;
      if (activeTouchButton) activeTouchButton.classList.remove('is-pressed');
      activeTouchButton = null;
    }

    function startTouchAction(action, button) {
      stopTouchRepeat();
      activeTouchButton = button;
      activeTouchButton.classList.add('is-pressed');
      runTouchAction(action);
      if (!repeatableTouchActions.has(action)) return;
      const repeatMs = action === 'down' ? 65 : 95;
      touchRepeatDelay = setTimeout(() => {
        runTouchAction(action);
        touchRepeatInterval = setInterval(() => runTouchAction(action), repeatMs);
      }, 180);
    }

    if (touchControls) {
      touchControls.addEventListener('pointerdown', function(e) {
        const button = e.target.closest('[data-action]');
        if (!button || !touchControls.contains(button)) return;
        e.preventDefault();
        try { if (button.setPointerCapture) button.setPointerCapture(e.pointerId); } catch (err) {}
        startTouchAction(button.dataset.action, button);
      });
      touchControls.addEventListener('pointerup', stopTouchRepeat);
      touchControls.addEventListener('pointercancel', stopTouchRepeat);
      touchControls.addEventListener('pointerleave', stopTouchRepeat);
      touchControls.addEventListener('lostpointercapture', stopTouchRepeat);
      touchControls.addEventListener('contextmenu', e => e.preventDefault());
      touchControls.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    }

    // ----- CANVAS SWIPE + TAP CONTROLS -----
    // Swipe left/right/down = move, swipe up = rotate, tap = rotate
    // Tap on HOLD or NEXT panel = holdCurrent()
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeMoved = false;
    const SWIPE_THRESHOLD = 18; // px

    function isControlTarget(target) {
      return !!target.closest('.touch-controls, .hold-panel, .next-panel, #newGameBtn');
    }

    mainCabinet.addEventListener('touchstart', function(e) {
      if (isControlTarget(e.target)) return;
      e.preventDefault();
      const t = e.touches[0];
      swipeStartX = t.clientX;
      swipeStartY = t.clientY;
      swipeMoved = false;
    }, { passive: false });

    mainCabinet.addEventListener('touchmove', function(e) {
      if (isControlTarget(e.target)) return;
      e.preventDefault();
      if (!gameActive) return;
      const t = e.touches[0];
      const dx = t.clientX - swipeStartX;
      const dy = t.clientY - swipeStartY;

      if (!swipeMoved) {
        if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          swipeMoved = true;
          moveHorizontal(dx > 0 ? 1 : -1);
          swipeStartX = t.clientX;
          swipeStartY = t.clientY;
        } else if (dy >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
          swipeMoved = true;
          movePieceDown();
          swipeStartX = t.clientX;
          swipeStartY = t.clientY;
        } else if (dy <= -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
          swipeMoved = true;
          rotatePiece();
          swipeStartX = t.clientX;
          swipeStartY = t.clientY;
        }
      } else {
        // continuous horizontal slide
        if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          moveHorizontal(dx > 0 ? 1 : -1);
          swipeStartX = t.clientX;
          swipeStartY = t.clientY;
        } else if (dy >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
          movePieceDown();
          swipeStartX = t.clientX;
          swipeStartY = t.clientY;
        }
      }
    }, { passive: false });

   mainCabinet.addEventListener('touchend', function(e) {
      if (isControlTarget(e.target)) return;
      e.preventDefault();
      // tap (no swipe) = rotate
      if (!swipeMoved && gameActive) {
        rotatePiece();
      }
    }, { passive: false });

    // Tap HOLD panel or NEXT panel = holdCurrent
    function addHoldTapListener(panel) {
      if (!panel) return;
      let panelTouchMoved = false;
      panel.addEventListener('touchstart', function(e) {
        e.preventDefault();
        panelTouchMoved = false;
      }, { passive: false });
      panel.addEventListener('touchmove', function(e) {
        e.preventDefault();
        panelTouchMoved = true;
      }, { passive: false });
      panel.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!panelTouchMoved) holdCurrent();
      }, { passive: false });
    }

    addHoldTapListener(holdPanel);
    addHoldTapListener(nextPanel);

    newGameBtn.addEventListener('click', () => initNewGame());

    startColorCycle();
    initNewGame();
})();
