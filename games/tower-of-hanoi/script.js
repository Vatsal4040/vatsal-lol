// Game state
const pegs = [[], [], []];
let moves = 0;
let diskCount = 3;
const MIN_DISKS = 3;
const MAX_DISKS = 10;
let solving = false;
let selectedDisk = null;
let moveHistory = [];
let autoSolved = false;
let diskSpacing = 28;
let diskHeightPx = 24;

const colors = [
    '#FF5252', '#FF9800', '#FFEB3B',
    '#4CAF50', '#2196F3', '#9C27B0',
    '#E91E63', '#00BCD4', '#8BC34A', '#FF4081'
];

// DOM elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const playBtn = document.getElementById('play-btn');
const movesElement = document.getElementById('moves');
const diskCountElement = document.getElementById('diskCount');
const minMovesElement = document.getElementById('minMoves');
const statusElement = document.getElementById('status');
const diskDisplayElement = document.getElementById('disk-count-display');
const minStepsElement = document.getElementById('min-steps-value');
const newGameBtn = document.getElementById('new-game');
const autoSolveBtn = document.getElementById('auto-solve');
const undoBtn = document.getElementById('undo');
const diskDownBtn = document.getElementById('disk-down');
const diskUpBtn = document.getElementById('disk-up');

function computeDiskMetrics() {
    const pegContainerEl = document.querySelector('.peg-container');
    const pegEl = pegContainerEl ? pegContainerEl.querySelector('.peg') : null;
    const containerWidth = pegContainerEl ? pegContainerEl.offsetWidth : 100;
    const pegHeight = pegEl ? pegEl.offsetHeight : 200;

    const maxDiskWidth = Math.max(Math.min(containerWidth - 14, 150), 44);
    const minDiskWidth = 32;

    diskSpacing = Math.max(12, Math.min(28, (pegHeight - 20) / diskCount));
    diskHeightPx = Math.max(14, Math.min(26, diskSpacing - 4));

    return { maxDiskWidth, minDiskWidth };
}

function removeWatermark() {
    document.querySelector('.auto-solve-watermark')?.remove();
}

function showResultWatermark() {
    removeWatermark();
    const watermark = document.createElement('div');
    watermark.className = 'auto-solve-watermark';
    watermark.setAttribute('aria-hidden', 'true');
    watermark.textContent = 'AUTO SOLVE • AUTO SOLVE';
    document.querySelector('.game-area').appendChild(watermark);
}

function initGame() {
    // --- VATSAL FOOTER: hide on new game ---
    document.querySelector('.vatsal-related')?.setAttribute('hidden', '');

    pegs.forEach(peg => peg.length = 0);
    moves = 0;
    solving = false;
    selectedDisk = null;
    moveHistory = [];
    autoSolved = false;
    document.body.classList.remove('game-ended');
    removeWatermark();

    statusElement.textContent = 'Tap a disk to select it';
    statusElement.style.color = '#feb47b';

    movesElement.textContent = moves;
    diskCountElement.textContent = diskCount;
    diskDisplayElement.textContent = diskCount;
    minMovesElement.textContent = Math.pow(2, diskCount) - 1;
    minStepsElement.textContent = Math.pow(2, diskCount) - 1;

    document.querySelectorAll('.disk').forEach(disk => disk.remove());

    const { maxDiskWidth, minDiskWidth } = computeDiskMetrics();

    for (let i = 0; i < diskCount; i++) {
        const disk = document.createElement('div');
        disk.className = 'disk';
        disk.id = `disk-${i}`;

        const rank = diskCount - i; // 1 = smallest, diskCount = biggest
        const widthRatio = diskCount > 1 ? (rank - 1) / (diskCount - 1) : 1;
        const size = minDiskWidth + widthRatio * (maxDiskWidth - minDiskWidth);

        disk.style.width = `${size}px`;
        disk.style.height = `${diskHeightPx}px`;
        disk.style.fontSize = `${Math.max(9, Math.round(diskHeightPx * 0.42))}px`;
        disk.style.backgroundColor = colors[i % colors.length];
        disk.textContent = rank;
        disk.dataset.size = rank;
        disk.dataset.peg = "0";

        const bottomPosition = 6 + i * diskSpacing;
        disk.style.bottom = `${bottomPosition}px`;
        disk.style.left = '50%';

        document.querySelector('[data-peg-id="0"]').appendChild(disk);
        pegs[0].push({ element: disk, size: rank });
    }

    diskDownBtn.disabled = diskCount <= MIN_DISKS;
    diskUpBtn.disabled = diskCount >= MAX_DISKS;
}

function handleDiskClick(disk) {
    if (solving) return;

    const pegIndex = parseInt(disk.dataset.peg);

    if (pegs[pegIndex].length === 0 || pegs[pegIndex][pegs[pegIndex].length - 1].element !== disk) {
        statusElement.textContent = "Only the top disk can be moved!";
        statusElement.style.color = '#FF5252';
        setTimeout(() => {
            if (!selectedDisk) {
                statusElement.textContent = 'Tap a disk to select it';
                statusElement.style.color = '#feb47b';
            }
        }, 1800);
        return;
    }

    if (selectedDisk) selectedDisk.classList.remove('selected');
    selectedDisk = disk;
    disk.classList.add('selected');
    statusElement.textContent = `Disk ${disk.textContent} selected — tap a peg to move`;
    statusElement.style.color = '#4CAF50';
}

function handlePegClick(pegIndex) {
    if (solving || !selectedDisk) return;

    const currentPeg = parseInt(selectedDisk.dataset.peg);

    if (pegIndex === currentPeg) {
        selectedDisk.classList.remove('selected');
        selectedDisk = null;
        statusElement.textContent = 'Tap a disk to select it';
        statusElement.style.color = '#feb47b';
        return;
    }

    const targetPeg = pegs[pegIndex];

    if (targetPeg.length > 0) {
        const topDisk = targetPeg[targetPeg.length - 1];
        const selectedSize = parseInt(selectedDisk.dataset.size);

        if (topDisk.size < selectedSize) {
            statusElement.textContent = 'Invalid — larger disk cannot go on smaller!';
            statusElement.style.color = '#FF5252';
            selectedDisk.classList.remove('selected');
            selectedDisk = null;
            return;
        }
    }

    moveHistory.push({
        disk: selectedDisk,
        from: currentPeg,
        to: pegIndex,
        diskSize: parseInt(selectedDisk.dataset.size)
    });

    selectedDisk.classList.remove('selected');

    const diskIndex = pegs[currentPeg].findIndex(d => d.element === selectedDisk);
    const diskObj = pegs[currentPeg].splice(diskIndex, 1)[0];

    pegs[pegIndex].push(diskObj);
    selectedDisk.dataset.peg = pegIndex;

    const newBottom = 6 + (pegs[pegIndex].length - 1) * diskSpacing;
    selectedDisk.style.transition = 'bottom 0.5s ease';
    selectedDisk.style.bottom = `${newBottom}px`;
    selectedDisk.style.left = '50%';

    document.querySelector(`[data-peg-id="${pegIndex}"]`).appendChild(selectedDisk);

    moves++;
    movesElement.textContent = moves;
    selectedDisk = null;

    setTimeout(checkWin, 500);
}

function checkWin() {
    if (pegs[2].length === diskCount) {
        const minMoves = Math.pow(2, diskCount) - 1;
        const perfect = moves === minMoves ? ' Perfect solution! 🏆' : '';
        statusElement.textContent = `Solved in ${moves} moves!${perfect}`;
        statusElement.style.color = '#4CAF50';
        document.body.classList.remove('game-started');
        document.body.classList.add('game-ended');
        setTimeout(() => window.VatsalLolGameComplete?.(), 0);
    } else {
        statusElement.textContent = 'Tap a disk to continue';
        statusElement.style.color = '#feb47b';
    }
}

function undoMove() {
    if (solving || moveHistory.length === 0) return;

    const lastMove = moveHistory.pop();
    const disk = lastMove.disk;
    const fromPeg = lastMove.to;
    const toPeg = lastMove.from;

    disk.classList.remove('selected');

    const diskIndex = pegs[fromPeg].findIndex(d => d.element === disk);
    const diskObj = pegs[fromPeg].splice(diskIndex, 1)[0];

    pegs[toPeg].push(diskObj);
    disk.dataset.peg = toPeg;

    const newBottom = 6 + (pegs[toPeg].length - 1) * diskSpacing;
    disk.style.transition = 'bottom 0.5s ease';
    disk.style.bottom = `${newBottom}px`;
    disk.style.left = '50%';

    document.querySelector(`[data-peg-id="${toPeg}"]`).appendChild(disk);

    // Undo counts as a step, same as a regular move.
    moves++;
    movesElement.textContent = moves;

    if (selectedDisk === disk) selectedDisk = null;

    statusElement.textContent = 'Undo counted as a step — tap a disk to continue';
    statusElement.style.color = '#feb47b';
}

async function autoSolve() {
    if (solving) return;
    solving = true;

    newGameBtn.disabled = true;
    autoSolveBtn.disabled = true;
    undoBtn.disabled = true;

    // Hide footer if visible before resetting
    document.querySelector('.vatsal-related')?.setAttribute('hidden', '');

    initGame();
    autoSolved = true;
    document.body.classList.add('game-started');
    await new Promise(resolve => setTimeout(resolve, 500));

    await solve(diskCount, 0, 2, 1);

    finishAutoSolve();

    newGameBtn.disabled = false;
    autoSolveBtn.disabled = false;
    undoBtn.disabled = false;

    solving = false;
}

function finishAutoSolve() {
    statusElement.textContent = `Solved automatically in ${moves} moves (Auto Solve)`;
    statusElement.style.color = '#2196F3';
    showResultWatermark();
    document.body.classList.remove('game-started');
    document.body.classList.add('game-ended');
    setTimeout(() => window.VatsalLolGameComplete?.(), 0);
}

async function solve(n, source, target, auxiliary) {
    if (n > 0) {
        await solve(n - 1, source, auxiliary, target);

        const disk = pegs[source][pegs[source].length - 1].element;
        disk.classList.add('selected');
        statusElement.textContent = `Auto-solving: moving disk ${disk.textContent} → peg ${target + 1}`;
        statusElement.style.color = '#2196F3';
        await new Promise(resolve => setTimeout(resolve, 800));

        const diskObj = pegs[source].pop();
        pegs[target].push(diskObj);
        disk.dataset.peg = target;

        const newBottom = 6 + (pegs[target].length - 1) * diskSpacing;
        disk.style.transition = 'bottom 0.5s ease';
        disk.style.bottom = `${newBottom}px`;
        document.querySelector(`[data-peg-id="${target}"]`).appendChild(disk);

        moves++;
        movesElement.textContent = moves;

        disk.classList.remove('selected');
        await new Promise(resolve => setTimeout(resolve, 500));

        await solve(n - 1, auxiliary, target, source);
    }
}

function goToStartScreen() {
    document.body.classList.remove('game-started', 'game-ended');
    removeWatermark();
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    document.body.classList.remove('game-ended');
    document.body.classList.add('game-started');
    initGame(); // runs after screens swap, so peg dimensions are measurable
}

window.onload = function() {
    diskDownBtn.disabled = diskCount <= MIN_DISKS;
    diskUpBtn.disabled = diskCount >= MAX_DISKS;

    // Disk clicks (touch + mouse via click event)
    document.querySelector('.game-area').addEventListener('click', (e) => {
        if (e.target.classList.contains('disk')) {
            handleDiskClick(e.target);
        }
    });

    // Peg clicks (touch + mouse)
    document.querySelectorAll('.peg-container').forEach(container => {
        container.addEventListener('click', (e) => {
            if (
                e.target.classList.contains('peg') ||
                e.target.classList.contains('peg-container') ||
                e.target.classList.contains('peg-label')
            ) {
                handlePegClick(parseInt(container.dataset.pegId));
            }
        });
    });

    playBtn.addEventListener('click', startGame);
    newGameBtn.addEventListener('click', goToStartScreen);
    autoSolveBtn.addEventListener('click', autoSolve);
    undoBtn.addEventListener('click', undoMove);

    diskDownBtn.addEventListener('click', () => {
        if (diskCount > MIN_DISKS) {
            diskCount--;
            diskDisplayElement.textContent = diskCount;
            minStepsElement.textContent = Math.pow(2, diskCount) - 1;
            diskDownBtn.disabled = diskCount <= MIN_DISKS;
            diskUpBtn.disabled = diskCount >= MAX_DISKS;
        }
    });

    diskUpBtn.addEventListener('click', () => {
        if (diskCount < MAX_DISKS) {
            diskCount++;
            diskDisplayElement.textContent = diskCount;
            minStepsElement.textContent = Math.pow(2, diskCount) - 1;
            diskDownBtn.disabled = diskCount <= MIN_DISKS;
            diskUpBtn.disabled = diskCount >= MAX_DISKS;
        }
    });

    window.addEventListener('resize', () => {
        if (!gameScreen.classList.contains('hidden')) {
            const { maxDiskWidth, minDiskWidth } = computeDiskMetrics();
            document.querySelectorAll('.disk').forEach((diskEl) => {
                const rank = parseInt(diskEl.dataset.size);
                const widthRatio = diskCount > 1 ? (rank - 1) / (diskCount - 1) : 1;
                const size = minDiskWidth + widthRatio * (maxDiskWidth - minDiskWidth);
                diskEl.style.width = `${size}px`;
                diskEl.style.height = `${diskHeightPx}px`;
                const pegIndex = parseInt(diskEl.dataset.peg);
                const posInPeg = pegs[pegIndex].findIndex(d => d.element === diskEl);
                diskEl.style.bottom = `${6 + posInPeg * diskSpacing}px`;
            });
        }
    });
};