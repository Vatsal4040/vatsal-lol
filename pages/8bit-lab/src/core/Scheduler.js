/**
 * Purpose: Decoupled Scheduler loops. Drives simulation updates (TPS) separately from rendering rates (FPS).
 * Dependencies: src/core/EngineConfig.js
 * Public API: window.Sandbox.Scheduler class.
 */

window.Sandbox = window.Sandbox || {};

class Scheduler {
    constructor() {
        const config = window.Sandbox.EngineConfig;
        this.tps = config.DEFAULT_TPS;
        this.paused = false;
        
        this.lastTickTime = performance.now();
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        
        this.tickCallback = null;
        this.renderCallback = null;
    }

    start(tickCallback, renderCallback) {
        this.tickCallback = tickCallback;
        this.renderCallback = renderCallback;
        this.paused = false;

        this.lastTickTime = performance.now();
        this.lastFrameTime = performance.now();

        const loop = (now) => {
            this.updateFPS(now);

            // 1. Simulation ticking (TPS delta)
            if (!this.paused && this.tickCallback) {
                const tickInterval = 1000.0 / this.tps;
                let elapsed = now - this.lastTickTime;
                
                // Allow catch-up updates if lag occurs, capped at 3 steps to prevent spiral of death
                let steps = 0;
                while (elapsed >= tickInterval && steps < 3) {
                    this.tickCallback();
                    elapsed -= tickInterval;
                    this.lastTickTime += tickInterval;
                    steps++;
                }
                
                if (steps > 0) {
                    this.lastTickTime = now - elapsed; // Align remainder
                }
            }

            // 2. Display Rendering (requestAnimationFrame 60 FPS)
            if (this.renderCallback) {
                this.renderCallback();
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    updateFPS(now) {
        this.frameCount++;
        if (now - this.lastFrameTime >= 1000.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }

    triggerStep() {
        // Step exactly one tick (forces a pause first)
        this.paused = true;
        if (this.tickCallback) {
            this.tickCallback();
        }
        if (this.renderCallback) {
            this.renderCallback();
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this.lastTickTime = performance.now();
    }
}

window.Sandbox.Scheduler = Scheduler;
