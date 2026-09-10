/**
 * Purpose: Sandbox toolbar controller (Brush size, Pausing, Step ticks, Gravity selectors, Reset).
 * Dependencies: src/registry/ToolRegistry.js, src/core/EngineConfig.js
 * Public API: window.Sandbox.Toolbar object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Toolbar = {
    brushSize: 3,
    replaceMode: false,

    init: function(engine, grid, scheduler, renderer) {
        this.engine = engine;
        this.grid = grid;
        this.scheduler = scheduler;
        this.renderer = renderer;

        // Wire up play / pause toggle
        const playBtn = document.getElementById("playBtn");
        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (this.scheduler.paused) {
                    this.scheduler.resume();
                    playBtn.innerHTML = "PAUSE";
                    playBtn.classList.remove("danger");
                    playBtn.classList.add("accent");
                } else {
                    this.scheduler.pause();
                    playBtn.innerHTML = "PLAY";
                    playBtn.classList.remove("accent");
                    playBtn.classList.add("danger");
                }
            });
        }

        // Wire up step ticks
        const stepBtn = document.getElementById("stepBtn");
        if (stepBtn) {
            stepBtn.addEventListener("click", () => {
                this.scheduler.triggerStep();
            });
        }

        // Wire up brush size +/-
        const brushDec = document.getElementById("brushDec");
        const brushInc = document.getElementById("brushInc");

        const updateBrushText = () => {
            const label = this.brushSize <= 1 ? "S" : (this.brushSize <= 3 ? "M" : "L");
            const hudBrush = document.getElementById("hudBrush");
            if (hudBrush) {
                hudBrush.innerText = "Brush: " + label;
            }
        };

        if (brushDec) {
            brushDec.addEventListener("click", () => {
                this.brushSize = Math.max(1, this.brushSize - 2);
                updateBrushText();
            });
        }
        if (brushInc) {
            brushInc.addEventListener("click", () => {
                this.brushSize = Math.min(7, this.brushSize + 2);
                updateBrushText();
            });
        }

        // Wire up clear grid action
        const clearBtn = document.getElementById("clearBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (confirm("Reset current canvas?")) {
                    this.grid.clear();
                    this.engine.chunkActive.fill(1);
                    this.engine.nextChunkActive.fill(1);
                    this.renderer.resetViewport();
                }
            });
        }

        // Wire up replace mode check
        const replaceChk = document.getElementById("replaceChk");
        if (replaceChk) {
            replaceChk.addEventListener("change", (e) => {
                this.replaceMode = e.target.checked;
            });
        }

        // Wire up gravity vector directions
        const gravButtons = {
            gravDown: "down",
            gravUp: "up",
            gravLeft: "left",
            gravRight: "right",
            gravOff: "off"
        };

        Object.entries(gravButtons).forEach(([btnId, dir]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener("click", () => {
                    this.setGravity(dir);
                });
            }
        });

        // Initialize active cursor layout
        this.selectTool("brush");
    },

    setGravity: function(dir) {
        if (this.engine.gravity === dir) return;

        this.engine.gravity = dir;
        this.engine.gravityChangePause = 100.0; // 100ms CA physics pause

        // Update active highlight classes on buttons
        const gravButtons = ["gravDown", "gravUp", "gravLeft", "gravRight", "gravOff"];
        gravButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove("active");
        });

        const activeId = "grav" + dir.charAt(0).toUpperCase() + dir.slice(1);
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) activeBtn.classList.add("active");

        // CSS Shake effect on the container (avoiding canvas pan/zoom conflicts)
        const gameDiv = document.getElementById("gameDiv");
        if (gameDiv) {
            gameDiv.classList.remove("shake-canvas");
            void gameDiv.offsetWidth; // Force CSS reflow
            gameDiv.classList.add("shake-canvas");
            setTimeout(() => {
                gameDiv.classList.remove("shake-canvas");
            }, 200);
        }
    },

    selectTool: function(toolId) {
        window.Sandbox.ToolRegistry.currentTool = toolId;

        // Update active classes in HTML elements
        const tools = ["brush", "eraser", "fill", "line", "picker", "drag", "heat", "cool", "shock", "wind", "explosion", "rain", "lightning"];
        tools.forEach(id => {
            const btn = document.getElementById("tool_" + id);
            if (btn) btn.classList.remove("active");
        });

        const activeBtn = document.getElementById("tool_" + toolId);
        if (activeBtn) activeBtn.classList.add("active");

        // Set cursor style
        const canvas = document.getElementById("renderer");
        if (canvas) {
            const tool = window.Sandbox.ToolRegistry.get(toolId);
            canvas.style.cursor = tool ? tool.cursor : "crosshair";
        }
    }
};
