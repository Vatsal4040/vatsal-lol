/**
 * Purpose: Canvas 2D Renderer using direct memory Image Data buffering.
 * Dependencies: src/core/EngineConfig.js
 * Public API: window.Sandbox.CanvasRenderer class.
 */

window.Sandbox = window.Sandbox || {};

class CanvasRenderer {
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.grid = grid;
        this.ctx = canvas.getContext('2d', { alpha: false });

        this.width = grid.width;
        this.height = grid.height;

        // Force internal canvas resolution to match sandbox grid
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Allocating ImageData pixel buffers
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.buf = new Uint32Array(this.imageData.data.buffer);

        // Pan and Zoom properties (hardware-accelerated CSS style offsets)
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;

        this.setupTransforms();
    }

    setupTransforms() {
        const gameDiv = document.getElementById("gameDiv");
        if (!gameDiv) return;

        // Scroll over game container changes brush size, not zoom!
        gameDiv.addEventListener("wheel", (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                // Scroll Up: Increase brush size
                window.Sandbox.Toolbar.brushSize = Math.min(7, window.Sandbox.Toolbar.brushSize + 2);
            } else {
                // Scroll Down: Decrease brush size
                window.Sandbox.Toolbar.brushSize = Math.max(1, window.Sandbox.Toolbar.brushSize - 2);
            }
            // Update HUD text
            const label = window.Sandbox.Toolbar.brushSize <= 1 ? "S" : (window.Sandbox.Toolbar.brushSize <= 3 ? "M" : "L");
            const hudBrush = document.getElementById("hudBrush");
            if (hudBrush) {
                hudBrush.innerText = "Brush: " + label;
            }
        }, { passive: false });

        // Panning with Shift + Left click, or Middle mouse click
        gameDiv.addEventListener("mousedown", (e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                this.isPanning = true;
                this.startX = e.clientX - this.offsetX;
                this.startY = e.clientY - this.offsetY;
                gameDiv.style.cursor = "grabbing";
                e.preventDefault();
            }
        });

        window.addEventListener("mousemove", (e) => {
            if (this.isPanning) {
                this.offsetX = e.clientX - this.startX;
                this.offsetY = e.clientY - this.startY;
                this.updateTransform();
            }
        });

        window.addEventListener("mouseup", () => {
            if (this.isPanning) {
                this.isPanning = false;
                gameDiv.style.cursor = "crosshair";
            }
        });
    }

    updateTransform() {
        this.canvas.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.zoom})`;
        this.canvas.style.transformOrigin = "0 0";
    }

    resetViewport() {
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.updateTransform();
    }

    render() {
        const type = this.grid.type;
        const color = this.grid.color;
        const dirty = this.grid.dirty;
        const size = this.grid.size;

        const config = window.Sandbox.EngineConfig;
        const useDirty = config.FEATURES.dirtyRendering;

        if (useDirty) {
            // Optimised dirty check: only copy pixels modified in this tick
            for (let i = 0; i < size; i++) {
                if (dirty[i] === 1) {
                    this.buf[i] = color[i];
                    dirty[i] = 0; // Clear dirty status
                }
            }
        } else {
            // Fallback: full frame copy
            this.buf.set(color);
        }

        // Draw image data back onto the canvas at 0, 0
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}

window.Sandbox.CanvasRenderer = CanvasRenderer;
