/**
 * Purpose: Cellular automata electricity propagation engine.
 * Dependencies: src/core/Grid.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.Electricity object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Electricity = {
    update: function(grid, engine, i, x, y, mat) {
        const cond = mat.flags && mat.flags.conductive;
        if (!cond) return;

        // 1. Generator logic (Battery supplies constant charge)
        if (cond.generator) {
            grid.charge[i] = 255;
        }

        const myCharge = grid.charge[i];
        if (myCharge > 0) {
            // 2. Propagate charge to neighboring conductive elements
            this.propagate(grid, engine, x, y, myCharge);

            // 3. LED lamp glowing visual update
            if (cond.lamp) {
                grid.color[i] = 0xFF50C8FF; // Glowing yellow-amber in ABGR format
                grid.dirty[i] = 1;
            }

            // 4. Conductor pulse decay
            if (!cond.generator) {
                grid.charge[i] = Math.max(0, myCharge - 50);
                grid.dirty[i] = 1;
            }
        } else {
            // LED deactivated state
            if (cond.lamp) {
                grid.color[i] = 0xFF4A4A4A; // Default gray off LED
                grid.dirty[i] = 1;
            }
        }
    },

    propagate: function(grid, engine, x, y, charge) {
        const neighbors = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];

        for (let k = 0; k < neighbors.length; k++) {
            const tx = x + neighbors[k][0];
            const ty = y + neighbors[k][1];

            if (!grid.outOfBounds(tx, ty)) {
                const targetI = ty * grid.width + tx;
                const targetType = grid.type[targetI];
                if (targetType === 0) continue;

                const targetMat = window.Sandbox.MaterialRegistry.get(targetType);
                if (targetMat && targetMat.flags && targetMat.flags.conductive && !targetMat.flags.conductive.generator) {
                    const resistance = targetMat.flags.conductive.resistance || 0.0;
                    const newCharge = Math.max(0, charge - Math.floor(resistance * 255) - 10);
                    if (newCharge > grid.charge[targetI]) {
                        grid.charge[targetI] = newCharge;
                        grid.dirty[targetI] = 1;
                        
                        // Wake target cell chunk in simulation
                        engine.activateCellAndNeighbors(tx, ty);
                    }
                }
            }
        }
    }
};
