/**
 * Purpose: Cellular automata chemical reaction tick engine.
 * Dependencies: src/core/Grid.js, src/registry/ReactionRegistry.js
 * Public API: window.Sandbox.Reactions object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Reactions = {
    update: function(grid, engine, i, x, y, mat) {
        // Orthogonal neighbor directions
        const neighbors = [
            [0, 1], [0, -1], [1, 0], [-1, 0]
        ];
        const dir = neighbors[Math.floor(Math.random() * neighbors.length)];
        const tx = x + dir[0];
        const ty = y + dir[1];

        if (grid.outOfBounds(tx, ty)) return false;

        const targetI = ty * grid.width + tx;
        const targetType = grid.type[targetI];
        if (targetType === 0) return false; // Skip empty space

        // Fetch compiled reaction from O(1) Reaction matrix
        const rx = window.Sandbox.ReactionRegistry.get(mat.id, targetType);
        if (rx) {
            // Validate chance
            if (rx.chance < 1.0 && Math.random() > rx.chance) {
                return false;
            }

            // Validate temperature requirement
            if (rx.minTemp !== null && grid.temp[i] < rx.minTemp) {
                return false;
            }

            // Transform cells
            this.setProduct(grid, engine, i, rx.productA);
            this.setProduct(grid, engine, targetI, rx.productB);
            return true;
        }

        return false;
    },

    setProduct: function(grid, engine, index, productName) {
        if (productName === "empty") {
            grid.setCell(index, 0);
        } else if (productName === "fire") {
            grid.setCell(index, 25, 600, Math.floor(Math.random() * 30 + 15));
        } else {
            const mat = window.Sandbox.MaterialRegistry.getByName(productName);
            if (mat) {
                // Pre-fetch defaults
                const defaultTemp = mat.flags && mat.flags.temp !== undefined ? mat.flags.temp : grid.airTemp;
                const defaultLife = mat.flags && mat.flags.life !== undefined ? mat.flags.life : 0;
                grid.setCell(index, mat.id, grid.temp[index] || defaultTemp, defaultLife);
            } else {
                grid.setCell(index, 0);
            }
        }

        // Wake cell chunk in simulation
        const coords = grid.getCoords(index);
        engine.activateCellAndNeighbors(coords.x, coords.y);
    }
};
