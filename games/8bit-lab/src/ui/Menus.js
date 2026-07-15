/**
 * Purpose: Preset scene selector, F3 developer overlay, and Undo/Redo manager.
 * Dependencies: src/registry/SceneRegistry.js, src/core/Grid.js
 * Public API: window.Sandbox.Menus object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Menus = {
    undoStack: [],
    redoStack: [],
    maxHistory: 15,
    debugMode: false,

    init: function(engine, grid, scheduler, renderer) {
        this.engine = engine;
        this.grid = grid;
        this.scheduler = scheduler;
        this.renderer = renderer;

        // 1. Build Scene Selector Presets Dynamic List
        const scenesContainer = document.getElementById("scenePresets");
        if (scenesContainer) {
            scenesContainer.innerHTML = "";
            const scenes = window.Sandbox.SceneRegistry.getAll();
            
            scenes.forEach(scene => {
                const btn = document.createElement("button");
                btn.className = "scene-btn";
                btn.title = `${scene.description} (Difficulty: ${scene.difficulty})`;
                btn.innerText = scene.name;
                btn.addEventListener("click", () => {
                    this.pushHistoryState();
                    scene.generate(this.grid, this.engine);
                    this.renderer.render();
                });
                scenesContainer.appendChild(btn);
            });
        }

        // 2. Wire up Undo/Redo Buttons
        const undoBtn = document.getElementById("undoBtn");
        const redoBtn = document.getElementById("redoBtn");

        if (undoBtn) {
            undoBtn.addEventListener("click", () => this.undo());
        }
        if (redoBtn) {
            redoBtn.addEventListener("click", () => this.redo());
        }

        // Keyboard listener for Ctrl+Z and Ctrl+Y
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                this.undo();
            }
            if (e.ctrlKey && e.key === "y") {
                e.preventDefault();
                this.redo();
            }
            // F3 key toggles debug mode overlay
            if (e.key === "F3") {
                e.preventDefault();
                this.toggleDebug();
            }
        });

        // Toggle debug overlay btn
        const debugBtn = document.getElementById("debugBtn");
        if (debugBtn) {
            debugBtn.addEventListener("click", () => {
                this.toggleDebug();
            });
        }
    },

    pushHistoryState: function() {
        const snapshot = this.grid.copyState();
        this.undoStack.push(snapshot);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
    },

    undo: function() {
        if (this.undoStack.length === 0) return;
        const current = this.grid.copyState();
        this.redoStack.push(current);

        const prev = this.undoStack.pop();
        this.grid.restoreState(prev);
        
        // Wake all chunks
        this.engine.chunkActive.fill(1);
        this.engine.nextChunkActive.fill(1);

        this.renderer.render();
    },

    redo: function() {
        if (this.redoStack.length === 0) return;
        const current = this.grid.copyState();
        this.undoStack.push(current);

        const next = this.redoStack.pop();
        this.grid.restoreState(next);
        
        // Wake all chunks
        this.engine.chunkActive.fill(1);
        this.engine.nextChunkActive.fill(1);

        this.renderer.render();
    },

    toggleDebug: function() {
        this.debugMode = !this.debugMode;
        const overlay = document.getElementById("debugOverlay");
        const debugBtn = document.getElementById("debugBtn");

        if (overlay) {
            overlay.style.display = this.debugMode ? "block" : "none";
        }
        if (debugBtn) {
            if (this.debugMode) {
                debugBtn.classList.add("active");
            } else {
                debugBtn.classList.remove("active");
            }
        }
    },

    updateDebugOverlay: function(tickTime, renderTime) {
        if (!this.debugMode) return;
        
        const overlay = document.getElementById("debugOverlay");
        if (!overlay) return;

        // Calculate active and sleeping chunks count
        let activeChunks = 0;
        let sleepingChunks = 0;
        const count = this.engine.numChunks;
        for (let c = 0; c < count; c++) {
            if (this.engine.chunkActive[c] === 1) activeChunks++;
            else sleepingChunks++;
        }

        // Calculate dirty pixels count
        let dirtyPixels = 0;
        const size = this.grid.size;
        for (let i = 0; i < size; i++) {
            if (this.grid.dirty[i] === 1) dirtyPixels++;
        }

        overlay.innerHTML = `
            <div><strong>DEVELOPER METRICS</strong></div>
            <div>Grid Size: ${this.grid.width}x${this.grid.height}</div>
            <div>Active Chunks: ${activeChunks} / ${count}</div>
            <div>Sleeping Chunks: ${sleepingChunks} / ${count}</div>
            <div>Dirty Buffer Cells: ${dirtyPixels} / ${size}</div>
            <div>Tick Update Delta: ${tickTime.toFixed(1)} ms</div>
            <div>Render Frame Delta: ${renderTime.toFixed(1)} ms</div>
        `;
    }
};
