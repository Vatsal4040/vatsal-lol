/**
 * Purpose: Conduction networks charge indicators rendering overlay (cyan sparks).
 * Dependencies: src/core/Grid.js
 * Public API: window.Sandbox.Lighting object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.Lighting = {
    apply: function(grid) {
        const size = grid.size;
        const charge = grid.charge;
        const color = grid.color;
        const dirty = grid.dirty;

        for (let i = 0; i < size; i++) {
            const myCharge = charge[i];
            if (myCharge > 0) {
                let baseColor = color[i];
                let r = baseColor & 0xFF;
                let g = (baseColor >> 8) & 0xFF;
                let b = (baseColor >> 16) & 0xFF;
                let a = (baseColor >> 24) & 0xFF;

                // Add a bright cyan charge glow
                const glowPct = myCharge / 255.0;
                r = Math.floor(r * (1 - glowPct) + 180 * glowPct);
                g = Math.floor(g * (1 - glowPct) + 240 * glowPct);
                b = Math.floor(b * (1 - glowPct) + 255 * glowPct);

                color[i] = (a << 24) | (b << 16) | (g << 8) | r;
                dirty[i] = 1;
            }
        }
    }
};
