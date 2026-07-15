/**
 * Purpose: Main rendering orchestrator combining screen buffer draws and shaders.
 * Dependencies: src/rendering/CanvasRenderer.js, src/rendering/EffectsRenderer.js
 * Public API: window.Sandbox.Renderer class.
 */

window.Sandbox = window.Sandbox || {};

class Renderer {
    constructor(canvas, grid) {
        this.canvasRenderer = new window.Sandbox.CanvasRenderer(canvas, grid);
        this.grid = grid;
    }

    render() {
        // 1. Process cosmetic effects (flickering, transparency)
        window.Sandbox.EffectsRenderer.apply(this.grid);

        // 2. Process conductive wire/fire lighting overlay glows
        if (window.Sandbox.Lighting && window.Sandbox.Lighting.apply) {
            window.Sandbox.Lighting.apply(this.grid);
        }

        // 3. Draw dirty cells buffer onto screen
        this.canvasRenderer.render();
    }

    resetViewport() {
        this.canvasRenderer.resetViewport();
    }
}

window.Sandbox.Renderer = Renderer;
