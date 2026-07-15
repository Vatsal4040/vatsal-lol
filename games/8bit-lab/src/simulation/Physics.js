/**
 * Purpose: Cellular automata physics movement simulator supporting directional gravity fields.
 * Dependencies: src/core/Grid.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.Physics object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Physics = {
    update: function(grid, engine, i, x, y, mat) {
        const state = mat.state;
        const gravity = engine.gravity;

        if (gravity === "off") {
            if (state === "gas") {
                this.updateGasAmbient(grid, engine, i, x, y, mat);
            }
            return;
        }

        if (state === "powder") {
            this.updatePowder(grid, engine, i, x, y, mat, gravity);
        } else if (state === "liquid") {
            this.updateLiquid(grid, engine, i, x, y, mat, gravity);
        } else if (state === "gas") {
            this.updateGas(grid, engine, i, x, y, mat, gravity);
        }
    },

    updatePowder: function(grid, engine, i, x, y, mat, gravity) {
        const dir = this.getGravityVectors(gravity);

        // 1. Fall directly along gravity direction
        if (this.tryMoveOrSwap(grid, engine, i, x + dir.fallX, y + dir.fallY, mat.density)) return;

        // 2. Fall diagonally
        const leftFirst = Math.random() < 0.5;
        const dx1 = leftFirst ? dir.diag1X : dir.diag2X;
        const dy1 = leftFirst ? dir.diag1Y : dir.diag2Y;
        const dx2 = leftFirst ? dir.diag2X : dir.diag1X;
        const dy2 = leftFirst ? dir.diag2Y : dir.diag1Y;

        if (this.tryMoveOrSwap(grid, engine, i, x + dx1, y + dy1, mat.density)) return;
        if (this.tryMoveOrSwap(grid, engine, i, x + dx2, y + dy2, mat.density)) return;
    },

    updateLiquid: function(grid, engine, i, x, y, mat, gravity) {
        const dir = this.getGravityVectors(gravity);

        // 1. Fall directly along gravity
        if (this.tryMoveOrSwap(grid, engine, i, x + dir.fallX, y + dir.fallY, mat.density)) return;

        // 2. Fall diagonally
        const leftFirst = Math.random() < 0.5;
        const dx1 = leftFirst ? dir.diag1X : dir.diag2X;
        const dy1 = leftFirst ? dir.diag1Y : dir.diag2Y;
        const dx2 = leftFirst ? dir.diag2X : dir.diag1X;
        const dy2 = leftFirst ? dir.diag2Y : dir.diag1Y;

        if (this.tryMoveOrSwap(grid, engine, i, x + dx1, y + dy1, mat.density)) return;
        if (this.tryMoveOrSwap(grid, engine, i, x + dx2, y + dy2, mat.density)) return;

        // 3. Flow horizontally (sideways relative to gravity)
        const flowLimit = mat.flags && mat.flags.viscosity !== undefined ? Math.max(1, 4 - mat.flags.viscosity) : 3;
        
        const side1X = dir.side1X;
        const side1Y = dir.side1Y;
        const side2X = dir.side2X;
        const side2Y = dir.side2Y;

        const flowSide1 = Math.random() < 0.5;
        const fx = flowSide1 ? side1X : side2X;
        const fy = flowSide1 ? side1Y : side2Y;
        const ox = flowSide1 ? side2X : side1X;
        const oy = flowSide1 ? side2Y : side1Y;

        // Try flowing outward step by step
        for (let d = 1; d <= flowLimit; d++) {
            if (this.tryMoveOrSwap(grid, engine, i, x + fx * d, y + fy * d, mat.density)) return;
        }
        for (let d = 1; d <= flowLimit; d++) {
            if (this.tryMoveOrSwap(grid, engine, i, x + ox * d, y + oy * d, mat.density)) return;
        }
    },

    updateGas: function(grid, engine, i, x, y, mat, gravity) {
        // Gas floats opposite of the gravity pull
        const dir = this.getGravityVectors(gravity);
        const floatX = -dir.fallX;
        const floatY = -dir.fallY;
        const diag1X = -dir.diag1X;
        const diag1Y = -dir.diag1Y;
        const diag2X = -dir.diag2X;
        const diag2Y = -dir.diag2Y;

        // 1. Float directly upwards (opposite of gravity)
        if (this.tryMoveOrSwapGas(grid, engine, i, x + floatX, y + floatY, mat.density)) return;

        // 2. Float diagonally
        const leftFirst = Math.random() < 0.5;
        const dx1 = leftFirst ? diag1X : diag2X;
        const dy1 = leftFirst ? diag1Y : diag2Y;
        const dx2 = leftFirst ? diag2X : diag1X;
        const dy2 = leftFirst ? diag2Y : diag1Y;

        if (this.tryMoveOrSwapGas(grid, engine, i, x + dx1, y + dy1, mat.density)) return;
        if (this.tryMoveOrSwapGas(grid, engine, i, x + dx2, y + dy2, mat.density)) return;

        // 3. Expand sideways relative to gravity (Brownian noise)
        const side1X = dir.side1X;
        const side1Y = dir.side1Y;
        const side2X = dir.side2X;
        const side2Y = dir.side2Y;

        const expandSide1 = Math.random() < 0.5;
        const ex = expandSide1 ? side1X : side2X;
        const ey = expandSide1 ? side1Y : side2Y;

        this.tryMoveOrSwapGas(grid, engine, i, x + ex, y + ey, mat.density);
    },

    updateGasAmbient: function(grid, engine, i, x, y, mat) {
        // Gravity OFF: gases move randomly in 4 directions
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        this.tryMoveOrSwapGas(grid, engine, i, x + d[0], y + d[1], mat.density);
    },

    getGravityVectors: function(gravity) {
        if (gravity === "up") {
            return {
                fallX: 0, fallY: -1,
                diag1X: -1, diag1Y: -1, diag2X: 1, diag2Y: -1,
                side1X: -1, side1Y: 0, side2X: 1, side2Y: 0
            };
        } else if (gravity === "left") {
            return {
                fallX: -1, fallY: 0,
                diag1X: -1, diag1Y: -1, diag2X: -1, diag2Y: 1,
                side1X: 0, side1Y: -1, side2X: 0, side2Y: 1
            };
        } else if (gravity === "right") {
            return {
                fallX: 1, fallY: 0,
                diag1X: 1, diag1Y: -1, diag2X: 1, diag2Y: 1,
                side1X: 0, side1Y: -1, side2X: 0, side2Y: 1
            };
        } else {
            // Default "down"
            return {
                fallX: 0, fallY: 1,
                diag1X: -1, diag1Y: 1, diag2X: 1, diag2Y: 1,
                side1X: -1, side1Y: 0, side2X: 1, side2Y: 0
            };
        }
    },

    tryMoveOrSwap: function(grid, engine, i, tx, ty, density) {
        if (grid.outOfBounds(tx, ty)) return false;

        const targetI = ty * grid.width + tx;
        const targetType = grid.type[targetI];

        if (targetType === 0) {
            grid.swap(i, targetI);
            grid.visited[targetI] = 1; // Prevent multiple updates in same tick
            engine.activateCellAndNeighbors(tx, ty);
            return true;
        }

        // Density check (buoyancy)
        const targetMat = window.Sandbox.MaterialRegistry.get(targetType);
        if (targetMat && targetMat.state !== "solid" && density > targetMat.density) {
            grid.swap(i, targetI);
            grid.visited[targetI] = 1; // Prevent multiple updates in same tick
            engine.activateCellAndNeighbors(tx, ty);
            return true;
        }

        return false;
    },

    tryMoveOrSwapGas: function(grid, engine, i, tx, ty, density) {
        if (grid.outOfBounds(tx, ty)) return false;

        const targetI = ty * grid.width + tx;
        const targetType = grid.type[targetI];

        if (targetType === 0) {
            grid.swap(i, targetI);
            grid.visited[targetI] = 1; // Prevent multiple updates in same tick
            engine.activateCellAndNeighbors(tx, ty);
            return true;
        }

        // Gas float density check
        const targetMat = window.Sandbox.MaterialRegistry.get(targetType);
        if (targetMat && targetMat.state !== "solid" && density < targetMat.density) {
            grid.swap(i, targetI);
            grid.visited[targetI] = 1; // Prevent multiple updates in same tick
            engine.activateCellAndNeighbors(tx, ty);
            return true;
        }

        return false;
    }
};
