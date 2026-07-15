/**
 * Purpose: Cosmetic visual shaders/effects processor (fire animation, water shimmers, temperature glows).
 * Dependencies: src/core/EngineConfig.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.EffectsRenderer object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.EffectsRenderer = {
    apply: function(grid) {
        const config = window.Sandbox.EngineConfig;
        if (!config.FEATURES.effects) return;

        const size = grid.size;
        const type = grid.type;
        const temp = grid.temp;
        const life = grid.life;
        const color = grid.color;
        const dirty = grid.dirty;

        const registry = window.Sandbox.MaterialRegistry;

        for (let i = 0; i < size; i++) {
            const typeId = type[i];
            if (typeId === 0) continue; // Skip empty space

            const mat = registry.get(typeId);
            if (!mat) continue;

            let baseColor = color[i];
            let r = baseColor & 0xFF;
            let g = (baseColor >> 8) & 0xFF;
            let b = (baseColor >> 16) & 0xFF;
            let a = 255;

            let changed = false;

            // 1. Water and Salt Water Shimmers
            if (typeId === 6 || typeId === 7) { // Water or Salt Water
                if (Math.random() < 0.04) {
                    b = Math.max(200, Math.min(255, b + (Math.random() < 0.5 ? 6 : -6)));
                    changed = true;
                }
            }

            // 2. Smoke transparency decay
            if (typeId === 11) { // Smoke
                const lifePct = life[i] / 100.0;
                a = Math.floor(lifePct * 180) + 40;
                changed = true;
            }

            // 3. Fire color cycle (flicker animation)
            if (typeId === 25) { // Fire
                const colors = mat.color;
                const hex = colors[Math.floor(Math.random() * colors.length)];
                color[i] = grid.hexToUint32(hex);
                dirty[i] = 1;
                continue;
            }

            // 4. Heat Glow (Red glow overlay on hot materials)
            const cellTemp = temp[i];
            if (cellTemp > 150.0) {
                const glow = Math.min(1.0, (cellTemp - 150.0) / 1000.0);
                r = Math.floor(r * (1 - glow) + 255 * glow);
                g = Math.floor(g * (1 - glow) + 60 * glow);
                b = Math.floor(b * (1 - glow) + 15 * glow);
                changed = true;
            }

            if (changed) {
                color[i] = (a << 24) | (b << 16) | (g << 8) | r;
                dirty[i] = 1; // Mark dirty so it gets updated in the CanvasRenderer buffer
            }
        }
    }
};
