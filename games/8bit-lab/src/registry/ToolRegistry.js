/**
 * Purpose: Interactive Sandbox Tools Registry with brush events and Bresenham interpolation.
 * Dependencies: src/core/Grid.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.ToolRegistry object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.ToolRegistry = {
    registry: {},
    currentTool: "brush",
    dragStartX: null,
    dragStartY: null,

    register: function(tool) {
        if (!tool.id || !tool.name) {
            throw new Error("Tool Validation Error: tool must register 'id' and 'name'");
        }
        this.registry[tool.id] = tool;
    },

    get: function(id) {
        return this.registry[id] || null;
    },

    getActive: function() {
        return this.get(this.currentTool);
    },

    init: function() {
        // Register Brush
        this.register({
            id: "brush",
            name: "Brush",
            cursor: "crosshair",
            mouseDown: function(grid, engine, x, y, size, typeId) {
                this.paintCell(grid, engine, x, y, size, typeId);
            },
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                // Continuous painting using Bresenham's line algorithm to prevent gaps
                this.drawBresenham(grid, engine, lastX, lastY, x, y, size, typeId);
            },
            mouseUp: function() {},
            paintCell: function(grid, engine, x, y, size, typeId) {
                const mat = window.Sandbox.MaterialRegistry.get(typeId);
                if (!mat) return;
                grid.applyRadius(x, y, size, (i) => {
                    if (window.Sandbox.Toolbar.replaceMode || grid.type[i] === 0) {
                        grid.setCell(i, typeId, mat.flags && mat.flags.temp !== undefined ? mat.flags.temp : grid.airTemp, mat.flags && mat.flags.life !== undefined ? mat.flags.life : 0);
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            drawBresenham: function(grid, engine, x0, y0, x1, y1, size, typeId) {
                let dx = Math.abs(x1 - x0);
                let dy = Math.abs(y1 - y0);
                let sx = (x0 < x1) ? 1 : -1;
                let sy = (y0 < y1) ? 1 : -1;
                let err = dx - dy;

                while (true) {
                    this.paintCell(grid, engine, x0, y0, size, typeId);
                    if (x0 === x1 && y0 === y1) break;
                    let e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        x0 += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y0 += sy;
                    }
                }
            }
        });

        // Register Eraser
        this.register({
            id: "eraser",
            name: "Eraser",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                this.erase(grid, engine, x, y, size);
            },
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                this.drawBresenhamEraser(grid, engine, lastX, lastY, x, y, size);
            },
            mouseUp: function() {},
            erase: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    grid.type[i] = 0;
                    grid.life[i] = 0;
                    grid.charge[i] = 0;
                    grid.temp[i] = grid.airTemp;
                    grid.color[i] = 0xFF1B1B1B; // Reset background color
                    grid.dirty[i] = 1;
                    engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                });
            },
            drawBresenhamEraser: function(grid, engine, x0, y0, x1, y1, size) {
                let dx = Math.abs(x1 - x0);
                let dy = Math.abs(y1 - y0);
                let sx = (x0 < x1) ? 1 : -1;
                let sy = (y0 < y1) ? 1 : -1;
                let err = dx - dy;

                while (true) {
                    this.erase(grid, engine, x0, y0, size);
                    if (x0 === x1 && y0 === y1) break;
                    let e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        x0 += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y0 += sy;
                    }
                }
            }
        });

        // Register Flood Fill
        this.register({
            id: "fill",
            name: "Flood Fill",
            cursor: "copy",
            mouseDown: function(grid, engine, x, y, size, typeId) {
                const targetIdx = y * grid.width + x;
                const originType = grid.type[targetIdx];
                if (originType === typeId) return;

                // Queue-based flood fill algorithm
                const queue = [[x, y]];
                const visitedSet = new Uint8Array(grid.size);
                visitedSet[targetIdx] = 1;

                let fillCount = 0;
                const maxFillLimit = 3500; // usability guard boundary to prevent locking CPU

                while (queue.length > 0 && fillCount < maxFillLimit) {
                    const cell = queue.shift();
                    const cx = cell[0];
                    const cy = cell[1];
                    const idx = cy * grid.width + cx;

                    grid.setCell(idx, typeId);
                    engine.activateCellAndNeighbors(cx, cy);
                    fillCount++;

                    // Check 4 adjacent directions
                    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    for (let d = 0; d < dirs.length; d++) {
                        const nx = cx + dirs[d][0];
                        const ny = cy + dirs[d][1];

                        if (!grid.outOfBounds(nx, ny)) {
                            const nidx = ny * grid.width + nx;
                            if (grid.type[nidx] === originType && visitedSet[nidx] === 0) {
                                visitedSet[nidx] = 1;
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
            },
            mouseMove: function() {},
            mouseUp: function() {}
        });

        // Register Line Drawing
        this.register({
            id: "line",
            name: "Line",
            cursor: "crosshair",
            mouseDown: function(grid, engine, x, y) {
                window.Sandbox.ToolRegistry.dragStartX = x;
                window.Sandbox.ToolRegistry.dragStartY = y;
            },
            mouseMove: function() {
                // Main.js handles rendering the line preview
            },
            mouseUp: function(grid, engine, x, y, size, typeId) {
                const startX = window.Sandbox.ToolRegistry.dragStartX;
                const startY = window.Sandbox.ToolRegistry.dragStartY;
                if (startX !== null && startY !== null) {
                    // Draw cells along Bresenham's line
                    window.Sandbox.ToolRegistry.get("brush").drawBresenham(grid, engine, startX, startY, x, y, size, typeId);
                }
                window.Sandbox.ToolRegistry.dragStartX = null;
                window.Sandbox.ToolRegistry.dragStartY = null;
            }
        });

        // Register Picker (Eyedropper)
        this.register({
            id: "picker",
            name: "Picker",
            cursor: "copy",
            mouseDown: function(grid, engine, x, y) {
                const idx = y * grid.width + x;
                const pickedType = grid.type[idx];
                const mat = window.Sandbox.MaterialRegistry.get(pickedType);
                if (mat && mat.id !== 0) {
                    window.Sandbox.MaterialPanel.selectElement(mat.name.toLowerCase());
                }
            },
            mouseMove: function() {},
            mouseUp: function() {}
        });

        // Register Drag Tool
        this.register({
            id: "drag",
            name: "Drag",
            cursor: "grab",
            mouseDown: function() {},
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                const srcIdx = lastY * grid.width + lastX;
                const destIdx = y * grid.width + x;
                if (grid.type[srcIdx] !== 0 && grid.type[destIdx] === 0) {
                    grid.swap(srcIdx, destIdx);
                    engine.activateCellAndNeighbors(x, y);
                    engine.activateCellAndNeighbors(lastX, lastY);
                }
            },
            mouseUp: function() {}
        });

        // Register Environmental modification brushes: Heat
        this.register({
            id: "heat",
            name: "Heat",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.temp[i] = Math.min(2000, grid.temp[i] + 100);
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.temp[i] = Math.min(2000, grid.temp[i] + 20);
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseUp: function() {}
        });

        // Register Cool
        this.register({
            id: "cool",
            name: "Cool",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.temp[i] = Math.max(-273, grid.temp[i] - 80);
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.temp[i] = Math.max(-273, grid.temp[i] - 15);
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseUp: function() {}
        });

        // Register Electric Shock
        this.register({
            id: "shock",
            name: "Shock",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.charge[i] = 255;
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseMove: function(grid, engine, x, y, size, typeId, lastX, lastY) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0) {
                        grid.charge[i] = 255;
                        grid.dirty[i] = 1;
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseUp: function() {}
        });

        // Register Wind
        this.register({
            id: "wind",
            name: "Wind",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                this.blow(grid, engine, x, y, size);
            },
            mouseMove: function(grid, engine, x, y, size) {
                this.blow(grid, engine, x, y, size);
            },
            mouseUp: function() {},
            blow: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    if (grid.type[i] !== 0 && grid.type[i] !== 24) {
                        let tx = (i % grid.width) + (Math.random() < 0.5 ? 1 : -1) * Math.floor(Math.random() * 2 + 1);
                        let ty = Math.floor(i / grid.width) + (Math.random() < 0.5 ? 0 : -1);
                        if (!grid.outOfBounds(tx, ty)) {
                            let targetI = ty * grid.width + tx;
                            if (grid.type[targetI] === 0) {
                                grid.swap(i, targetI);
                                engine.activateCellAndNeighbors(tx, ty);
                            }
                        }
                    }
                });
            }
        });

        // Register Explosion
        this.register({
            id: "explosion",
            name: "Explosion",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                const radius = Math.max(4, size * 2);
                grid.applyRadius(x, y, radius, (i) => {
                    if (grid.type[i] === 24) return; // Indestructible Wall
                    let dist = Math.sqrt(Math.pow((i % grid.width) - x, 2) + Math.pow(Math.floor(i / grid.width) - y, 2));
                    let force = (radius - dist) / radius;
                    if (Math.random() < force) {
                        if (Math.random() < 0.3) {
                            grid.setCell(i, 25, 800, Math.floor(Math.random() * 15 + 5)); // Fire
                        } else {
                            grid.setCell(i, 0); // Destroyed to empty
                        }
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            },
            mouseMove: function() {},
            mouseUp: function() {}
        });

        // Register Rain
        this.register({
            id: "rain",
            name: "Rain",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y, size) {
                this.drop(grid, engine, x, y, size);
            },
            mouseMove: function(grid, engine, x, y, size) {
                this.drop(grid, engine, x, y, size);
            },
            mouseUp: function() {},
            drop: function(grid, engine, x, y, size) {
                grid.applyRadius(x, y, size, (i) => {
                    if (Math.random() < 0.15 && grid.type[i] === 0) {
                        grid.setCell(i, 6); // Water
                        engine.activateCellAndNeighbors(i % grid.width, Math.floor(i / grid.width));
                    }
                });
            }
        });

        // Register Lightning Strike
        this.register({
            id: "lightning",
            name: "Lightning",
            cursor: "cell",
            mouseDown: function(grid, engine, x, y) {
                let curX = x + Math.floor(Math.random() * 5 - 2);
                let curY = 1;
                const path = [];
                while (curY < y && curY < grid.height - 1) {
                    path.push(curY * grid.width + curX);
                    curX += Math.random() < 0.5 ? (Math.random() < 0.5 ? 1 : -1) : 0;
                    curX = Math.max(1, Math.min(grid.width - 2, curX));
                    curY++;
                }
                path.push(curY * grid.width + curX);

                path.forEach(idx => {
                    if (grid.type[idx] !== 24) {
                        grid.setCell(idx, 25, 1500, Math.floor(Math.random() * 6 + 3)); // Fire (Temp 1500C)
                        grid.charge[idx] = 255;
                        engine.activateCellAndNeighbors(idx % grid.width, Math.floor(idx / grid.width));
                    }
                });
            },
            mouseMove: function() {},
            mouseUp: function() {}
        });
    }
};

window.Sandbox.ToolRegistry.init();
