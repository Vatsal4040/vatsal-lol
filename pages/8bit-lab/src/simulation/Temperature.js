/**
 * Purpose: Cellular automata thermodynamics engine (conduction, combustion, phase changes).
 * Dependencies: src/core/Grid.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.Temperature object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Temperature = {
    update: function(grid, engine, i, x, y, mat) {
        // 1. Heat Conduction (Spread temperature to adjacent cells)
        this.conduct(grid, engine, i, x, y);

        // 2. Combustion checking (Ignite flammable materials)
        if (mat.flags && mat.flags.flammable) {
            this.checkCombustion(grid, engine, i, mat.flags.flammable);
        }

        // 3. Phase Transitions (Boiling, melting, freezing)
        const transitioned = this.checkPhaseChange(grid, engine, i, x, y, mat);
        return transitioned;
    },

    conduct: function(grid, engine, i, x, y) {
        const myTemp = grid.temp[i];

        // Pick one random neighbor to exchange heat
        const dx = Math.random() < 0.5 ? (Math.random() < 0.5 ? 1 : -1) : 0;
        const dy = dx === 0 ? (Math.random() < 0.5 ? 1 : -1) : 0;

        const tx = x + dx;
        const ty = y + dy;

        if (!grid.outOfBounds(tx, ty)) {
            const targetI = ty * grid.width + tx;
            const targetTemp = grid.temp[targetI];

            const diff = (targetTemp - myTemp) * 0.1; // Conduction factor
            if (Math.abs(diff) > 0.05) {
                grid.temp[i] += diff;
                grid.temp[targetI] -= diff;
                grid.dirty[i] = 1;
                grid.dirty[targetI] = 1;

                engine.activateCellAndNeighbors(tx, ty);
            }
        }

        // Dissipate temperature slowly towards standard ambient air temp
        const airDiff = (grid.airTemp - myTemp) * 0.01;
        if (Math.abs(airDiff) > 0.05) {
            grid.temp[i] += airDiff;
            grid.dirty[i] = 1;
        }
    },

    checkCombustion: function(grid, engine, i, config) {
        if (grid.temp[i] >= config.ignitionTemp) {
            this.ignite(grid, engine, i, config);
        }
    },

    ignite: function(grid, engine, i, config) {
        const coords = grid.getCoords(i);
        if (config.explode) {
            // Gunpowder explosion
            grid.setCell(i, 0); // Empty
            if (window.Sandbox.tools && window.Sandbox.tools.explosion) {
                window.Sandbox.tools.explosion.action(grid, coords.x, coords.y, config.explodeRadius);
            }
        } else {
            // Wood, oil, plant ignites
            grid.setCell(i, 25, Math.max(grid.temp[i], 600.0), Math.floor(Math.random() * config.burnTime + 10)); // Fire
        }
        engine.activateCellAndNeighbors(coords.x, coords.y);
    },

    checkPhaseChange: function(grid, engine, i, x, y, mat) {
        const t = grid.temp[i];
        const flags = mat.flags || {};

        // 1. Ice -> Water (Melts at > 0°C)
        if (mat.id === 21 && t > 0.0) {
            grid.setCell(i, 6, t); // Water
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        // 2. Water -> Ice (Freezes at <= 0°C)
        if (mat.id === 6 && t <= 0.0) {
            grid.setCell(i, 21, t); // Ice
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        // 3. Water -> Steam (Boils at >= 100°C)
        if (mat.id === 6 && t >= 100.0) {
            grid.setCell(i, 12, t, 150); // Steam
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        // 4. Salt Water phase boundaries
        if (mat.id === 7) {
            if (t <= -4.0) {
                grid.setCell(i, 21, t); // Freeze to pure Ice
                engine.activateCellAndNeighbors(x, y);
                return true;
            } else if (t >= 105.0) {
                grid.setCell(i, 12, t, 150); // Boil to Steam
                engine.activateCellAndNeighbors(x, y);
                return true;
            }
        }

        // 5. Steam -> Water (Condenses at < 100°C)
        if (mat.id === 12 && t < 100.0) {
            grid.setCell(i, 6, t); // Water
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        // 6. Solids melting to Lava
        if (flags.meltingPoint !== undefined && t >= flags.meltingPoint) {
            grid.setCell(i, 9, t); // Lava
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        // 7. Lava cooling to Stone
        if (mat.id === 9 && t < 450.0) {
            grid.setCell(i, 15, t); // Stone
            engine.activateCellAndNeighbors(x, y);
            return true;
        }

        return false;
    }
};
