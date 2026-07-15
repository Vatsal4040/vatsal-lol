/**
 * Purpose: Flat memory-buffer Grid system for cellular automata storage.
 * Dependencies: src/core/EngineConfig.js
 * Public API: window.Sandbox.Grid class.
 */

window.Sandbox = window.Sandbox || {};

class Grid {
    constructor() {
        const config = window.Sandbox.EngineConfig;
        this.width = config.GRID_WIDTH;
        this.height = config.GRID_HEIGHT;
        this.size = this.width * this.height;
        this.airTemp = config.AIR_TEMP;

        // Core cellular data arrays
        this.type = new Uint8Array(this.size);
        this.temp = new Float32Array(this.size);
        this.life = new Uint16Array(this.size);
        this.charge = new Uint8Array(this.size);
        this.visited = new Uint8Array(this.size);

        // Rendering buffer (ABGR color values)
        this.color = new Uint32Array(this.size);

        // Optimization dirty bits array
        this.dirty = new Uint8Array(this.size);

        this.clear();
    }

    clear() {
        this.type.fill(0);
        this.temp.fill(this.airTemp);
        this.life.fill(0);
        this.charge.fill(0);
        this.visited.fill(0);
        this.color.fill(0xFF1B1B1B); // Transparent panel back
        this.dirty.fill(1); // Force redraw on clear
    }

    outOfBounds(x, y) {
        // Retain a 1-pixel buffer margin around outer grid boundaries
        return x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1;
    }

    getIndex(x, y) {
        return y * this.width + x;
    }

    getCoords(i) {
        return {
            x: i % this.width,
            y: Math.floor(i / this.width)
        };
    }

    swap(i, j) {
        // Swap core arrays
        const tempType = this.type[i];
        this.type[i] = this.type[j];
        this.type[j] = tempType;

        const tempTemp = this.temp[i];
        this.temp[i] = this.temp[j];
        this.temp[j] = tempTemp;

        const tempLife = this.life[i];
        this.life[i] = this.life[j];
        this.life[j] = tempLife;

        const tempCharge = this.charge[i];
        this.charge[i] = this.charge[j];
        this.charge[j] = tempCharge;

        const tempColor = this.color[i];
        this.color[i] = this.color[j];
        this.color[j] = tempColor;

        // Mark both cells as dirty (modified)
        this.dirty[i] = 1;
        this.dirty[j] = 1;
    }

    setCell(i, typeId, temp = this.airTemp, life = 0) {
        this.type[i] = typeId;
        this.temp[i] = temp;
        this.life[i] = life;
        this.charge[i] = 0;
        this.visited[i] = 0;
        this.dirty[i] = 1;

        // Fetch display color from Registry
        const mat = window.Sandbox.MaterialRegistry.get(typeId);
        if (mat) {
            const colors = mat.color;
            const hex = Array.isArray(colors) ? colors[Math.floor(Math.random() * colors.length)] : colors;
            this.color[i] = this.hexToUint32(hex);
        } else {
            this.color[i] = 0xFF1B1B1B; // Empty space background
        }
    }

    hexToUint32(hex) {
        if (hex.startsWith('#')) hex = hex.substring(1);
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        return 0xFF000000 | (b << 16) | (g << 8) | r; // ABGR format
    }

    applyRadius(x, y, radius, callback) {
        let r2 = radius * radius;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx * dx + dy * dy <= r2) {
                    let tx = x + dx;
                    let ty = y + dy;
                    if (!this.outOfBounds(tx, ty)) {
                        callback(ty * this.width + tx);
                    }
                }
            }
        }
    }

    copyState() {
        return {
            type: new Uint8Array(this.type),
            temp: new Float32Array(this.temp),
            life: new Uint16Array(this.life),
            charge: new Uint8Array(this.charge),
            color: new Uint32Array(this.color)
        };
    }

    restoreState(snapshot) {
        if (!snapshot) return;
        this.type.set(snapshot.type);
        this.temp.set(snapshot.temp);
        this.life.set(snapshot.life);
        this.charge.set(snapshot.charge);
        this.color.set(snapshot.color);
        this.dirty.fill(1); // Redraw entire canvas on snapshot load
    }
}

window.Sandbox.Grid = Grid;
