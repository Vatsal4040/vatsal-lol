/**
 * Purpose: Application bootstrapping, event listener maps, and scheduler tick/render bindings.
 * Dependencies: src/core/Grid.js, src/core/Engine.js, src/core/Scheduler.js, src/rendering/Renderer.js
 * Public API: App bootstrapper window.Sandbox.init.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.init = function() {
    console.log("Bootstrapping 8-Bit Pixel Sandbox Simulation...");

    // Prevent browser shortcuts and gestures for zooming
    window.Sandbox.zoomBlockedListener = (e) => {
        if (e.ctrlKey) e.preventDefault();
    };
    window.addEventListener("wheel", window.Sandbox.zoomBlockedListener, { passive: false });

    window.Sandbox.gestureBlocker = (e) => e.preventDefault();
    document.addEventListener("gesturestart", window.Sandbox.gestureBlocker);
    document.addEventListener("gesturechange", window.Sandbox.gestureBlocker);
    document.addEventListener("gestureend", window.Sandbox.gestureBlocker);

    // 1. Compile chemical reactions database
    window.Sandbox.ReactionRegistry.compile();

    // 2. Perform elements validation on startup (fail fast!)
    const allMats = window.Sandbox.MaterialRegistry.getAll();
    allMats.forEach(mat => {
        if (!mat.name || mat.id === undefined) {
            throw new Error(`Bootstrap Error: invalid material registered.`);
        }
    });

    // 3. Initialize Core components
    const grid = new window.Sandbox.Grid();
    const engine = new window.Sandbox.Engine(grid);
    const canvas = document.getElementById("renderer");
    const renderer = new window.Sandbox.Renderer(canvas, grid);
    const scheduler = new window.Sandbox.Scheduler();

    // Load dynamic scene presets
    window.Sandbox.SceneRegistry.get("laboratory").generate(grid, engine);

    // 4. Initialize UI modules
    window.Sandbox.Toolbar.init(engine, grid, scheduler, renderer);
    window.Sandbox.MaterialPanel.init();
    window.Sandbox.Menus.init(engine, grid, scheduler, renderer);

    // 5. Wire up Canvas Draw Input handlers
    let isDrawing = false;
    let lastCellX = -1;
    let lastCellY = -1;

    const getGridCoords = (e) => {
        const rect = canvas.getBoundingClientRect();
        // Convert client coordinates to matching grid index bounds
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = Math.floor(((clientX - rect.left) / rect.width) * grid.width);
        const y = Math.floor(((clientY - rect.top) / rect.height) * grid.height);

        return { x, y };
    };

    const handleStart = (e) => {
        // Only trigger paint inputs on normal left mouse click or touch screen taps
        if (!e.touches && e.button !== 0) return;
        if (e.shiftKey) return; // Ignore if user is panning

        const coords = getGridCoords(e);
        if (grid.outOfBounds(coords.x, coords.y)) return;

        isDrawing = true;
        lastCellX = coords.x;
        lastCellY = coords.y;

        // Push grid state onto undo stack before action
        window.Sandbox.Menus.pushHistoryState();

        const tool = window.Sandbox.ToolRegistry.getActive();
        const activeMaterialId = window.Sandbox.MaterialPanel.activeMaterialId;
        const brushSize = window.Sandbox.Toolbar.brushSize;

        if (tool && tool.mouseDown) {
            tool.mouseDown(grid, engine, coords.x, coords.y, brushSize, activeMaterialId);
        }
    };

    const handleMove = (e) => {
        const coords = getGridCoords(e);
        const hudCoords = document.getElementById("hudCoords");
        if (hudCoords) {
            if (!grid.outOfBounds(coords.x, coords.y)) {
                hudCoords.innerText = `x: ${coords.x}, y: ${coords.y}`;
            } else {
                hudCoords.innerText = `x: -, y: -`;
            }
        }

        if (!isDrawing) return;
        if (grid.outOfBounds(coords.x, coords.y)) return;
        if (coords.x === lastCellX && coords.y === lastCellY) return;

        const tool = window.Sandbox.ToolRegistry.getActive();
        const activeMaterialId = window.Sandbox.MaterialPanel.activeMaterialId;
        const brushSize = window.Sandbox.Toolbar.brushSize;

        if (tool && tool.mouseMove) {
            tool.mouseMove(grid, engine, coords.x, coords.y, brushSize, activeMaterialId, lastCellX, lastCellY);
        }

        lastCellX = coords.x;
        lastCellY = coords.y;
    };

    const handleEnd = (e) => {
        if (!isDrawing) return;
        isDrawing = false;

        const tool = window.Sandbox.ToolRegistry.getActive();
        const activeMaterialId = window.Sandbox.MaterialPanel.activeMaterialId;
        const brushSize = window.Sandbox.Toolbar.brushSize;

        if (tool && tool.mouseUp) {
            tool.mouseUp(grid, engine, lastCellX, lastCellY, brushSize, activeMaterialId);
        }

        lastCellX = -1;
        lastCellY = -1;
    };

    // Mouse Listeners
    canvas.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Touch Screen Listeners (Mobile compatibility)
    canvas.addEventListener("touchstart", handleStart, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleEnd, { passive: true });

    // 6. Bind Scheduler updates
    let lastTickDuration = 0;
    let lastRenderDuration = 0;

    const tickCallback = () => {
        const start = performance.now();
        engine.tick();
        lastTickDuration = performance.now() - start;
    };

    const renderCallback = () => {
        const start = performance.now();
        renderer.render();
        lastRenderDuration = performance.now() - start;

        // Update HUD stats bar (matching Sandboxels original look)
        const hudParticles = document.getElementById("hudParticles");
        if (hudParticles) hudParticles.innerText = engine.activePixelsCount + " pxls";

        const hudTPS = document.getElementById("hudTPS");
        if (hudTPS) hudTPS.innerText = scheduler.fps + " tps";

        const gravIcons = { down: "↓", up: "↑", left: "←", right: "→", off: "○" };
        const hudGravity = document.getElementById("hudGravity");
        if (hudGravity) hudGravity.innerText = "Gravity: " + (gravIcons[engine.gravity] || "↓");

        const brushSizeLabel = window.Sandbox.Toolbar.brushSize <= 1 ? "S" : (window.Sandbox.Toolbar.brushSize <= 3 ? "M" : "L");
        const hudBrush = document.getElementById("hudBrush");
        if (hudBrush) hudBrush.innerText = "Brush: " + brushSizeLabel;

        // Push metrics to development F3 overlay
        window.Sandbox.Menus.updateDebugOverlay(lastTickDuration, lastRenderDuration);
    };

    scheduler.start(tickCallback, renderCallback);
    
    // Hide startup loading screen and reveal simulation container
    document.getElementById("loadingP").style.display = "none";
    document.getElementById("canvasDiv").style.display = "block";
};

window.addEventListener("DOMContentLoaded", window.Sandbox.init);
