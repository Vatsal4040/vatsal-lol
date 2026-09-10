/**
 * Purpose: Cellular Automata physics orchestrator implementing the 16x16 chunk-based sleep system.
 * Dependencies: src/core/EngineConfig.js, src/registry/MaterialRegistry.js, src/registry/ReactionRegistry.js
 * Public API: window.Sandbox.Engine class.
 */

window.Sandbox = window.Sandbox || {};

class Engine {
    constructor(grid) {
        this.grid = grid;
        this.gravityChangePause = 0;
        this.activePixelsCount = 0;

        // Decouple gravity direction
        this.gravity = "down"; // down, up, left, right, off

        // Chunked sleeping configurations
        const config = window.Sandbox.EngineConfig;
        this.chunkSize = config.CHUNK_SIZE;
        this.chunkWidth = Math.ceil(grid.width / this.chunkSize);
        this.chunkHeight = Math.ceil(grid.height / this.chunkSize);
        this.numChunks = this.chunkWidth * this.chunkHeight;

        // Double buffer arrays to track active chunks
        this.chunkActive = new Uint8Array(this.numChunks);
        this.nextChunkActive = new Uint8Array(this.numChunks);
        
        // Initial state: wake up all chunks on boot
        this.chunkActive.fill(1);
        this.nextChunkActive.fill(1);

        // Pre-allocate chunk columns indices
        this.chunkColIndices = new Int32Array(this.chunkWidth);
        for (let x = 0; x < this.chunkWidth; x++) {
            this.chunkColIndices[x] = x;
        }

        // Pre-allocate cell columns scan indexes inside a single chunk
        this.cellColIndices = new Int32Array(this.chunkSize);
        for (let x = 0; x < this.chunkSize; x++) {
            this.cellColIndices[x] = x;
        }
    }

    activateCell(x, y) {
        const cx = Math.floor(x / this.chunkSize);
        const cy = Math.floor(y / this.chunkSize);
        if (cx >= 0 && cx < this.chunkWidth && cy >= 0 && cy < this.chunkHeight) {
            const idx = cy * this.chunkWidth + cx;
            this.nextChunkActive[idx] = 1;
        }
    }

    activateCellAndNeighbors(x, y) {
        const cx = Math.floor(x / this.chunkSize);
        const cy = Math.floor(y / this.chunkSize);

        this.activateCell(x, y);

        // Activate neighbor chunks if coordinates lie on borders
        const rx = x % this.chunkSize;
        const ry = y % this.chunkSize;

        if (rx === 0) this.activateCell(x - 1, y);
        if (rx === this.chunkSize - 1) this.activateCell(x + 1, y);
        if (ry === 0) this.activateCell(x, y - 1);
        if (ry === this.chunkSize - 1) this.activateCell(x, y + 1);
    }

    shuffleArray(array, length) {
        for (let i = length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    tick() {
        // 1. Handle gravity change delay pause (satisfying user feedback)
        if (this.gravityChangePause > 0) {
            this.gravityChangePause -= 33.3; // Subtract simulation step delta (~30 TPS)
            return;
        }

        // Swap active chunk buffers
        this.chunkActive.set(this.nextChunkActive);
        this.nextChunkActive.fill(0); // Set chunks to sleep unless they wake up in this tick

        // Reset grid visited flags
        this.grid.visited.fill(0);
        this.activePixelsCount = 0;

        const w = this.grid.width;
        const h = this.grid.height;
        const registry = window.Sandbox.MaterialRegistry;

        // Loop chunks from bottom to top (gravity scan order)
        for (let cy = this.chunkHeight - 1; cy >= 0; cy--) {
            this.shuffleArray(this.chunkColIndices, this.chunkWidth);

            for (let cxi = 0; cxi < this.chunkWidth; cxi++) {
                const cx = this.chunkColIndices[cxi];
                const chunkIndex = cy * this.chunkWidth + cx;

                // Skip ticks completely for sleeping chunks (massive optimization)
                const config = window.Sandbox.EngineConfig;
                if (config.FEATURES.chunkSleeping && this.chunkActive[chunkIndex] === 0) {
                    continue;
                }

                // Scan cells inside chunk
                const startY = Math.min(h - 1, (cy + 1) * this.chunkSize - 1);
                const endY = cy * this.chunkSize;

                for (let y = startY; y >= endY; y--) {
                    this.shuffleArray(this.cellColIndices, this.chunkSize);

                    for (let xi = 0; xi < this.chunkSize; xi++) {
                        const x = cx * this.chunkSize + this.cellColIndices[xi];
                        if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue; // Static margin bounds

                        const i = y * w + x;
                        const typeId = this.grid.type[i];

                        if (typeId === 0) continue; // Empty space

                        this.activePixelsCount++;

                        if (this.grid.visited[i] === 1) continue; // Already updated in this frame

                        const mat = registry.get(typeId);
                        if (!mat) continue;

                        this.grid.visited[i] = 1;

                        // Execute pipeline scan order
                        this.processPipeline(i, x, y, mat);
                    }
                }
            }
        }
    }

    processPipeline(i, x, y, mat) {
        // Ensure current chunk is kept active for next tick cycle
        this.activateCellAndNeighbors(x, y);

        // 1. Particle Lifetime / Decay
        if (mat.life && this.grid.life[i] > 0) {
            this.grid.life[i]--;
            if (this.grid.life[i] === 0) {
                // Decay target
                if (mat.id === 11) { // Smoke
                    this.grid.setCell(i, 0); // Decays to empty
                    return;
                }
                if (mat.id === 25) { // Fire
                    this.grid.setCell(i, 11, 200, Math.floor(Math.random() * 50 + 20)); // Turns to smoke
                    return;
                }
            }
        }

        // 2. Chemical Reactions
        if (window.Sandbox.Reactions && window.Sandbox.Reactions.update) {
            const reacted = window.Sandbox.Reactions.update(this.grid, this, i, x, y, mat);
            if (reacted) return;
        }

        // Refresh elements in case of state updates
        const nextTypeId = this.grid.type[i];
        if (nextTypeId === 0) return;
        const nextMat = window.Sandbox.MaterialRegistry.get(nextTypeId);

        // 3. Electricity transmission
        if (window.Sandbox.Electricity && window.Sandbox.Electricity.update) {
            window.Sandbox.Electricity.update(this.grid, this, i, x, y, nextMat);
        }

        // 4. Thermodynamics / Combustion
        if (window.Sandbox.Temperature && window.Sandbox.Temperature.update) {
            const changed = window.Sandbox.Temperature.update(this.grid, this, i, x, y, nextMat);
            if (changed) return;
        }

        // 5. Physics kinematics (gravity falling, sliding, flowing)
        if (window.Sandbox.Physics && window.Sandbox.Physics.update) {
            window.Sandbox.Physics.update(this.grid, this, i, x, y, nextMat);
        }
    }
}

window.Sandbox.Engine = Engine;
