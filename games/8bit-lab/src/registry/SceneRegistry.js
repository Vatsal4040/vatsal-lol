/**
 * Purpose: Sandbox Scene Presets Registry.
 * Dependencies: src/core/Grid.js, src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.SceneRegistry object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.SceneRegistry = {
    registry: {},

    register: function(scene) {
        if (!scene.id || !scene.name || !scene.generate) {
            throw new Error("Scene Validation Error: scene must register 'id', 'name', and 'generate()'");
        }
        this.registry[scene.id] = scene;
    },

    get: function(id) {
        return this.registry[id] || null;
    },

    getAll: function() {
        return Object.values(this.registry);
    },

    init: function() {
        // Preset 1: Empty Canvas
        this.register({
            id: "empty",
            name: "Empty Laboratory",
            description: "A blank slate container ready for custom designs.",
            difficulty: "Beginner",
            generate: function(grid, engine) {
                grid.clear();
                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });

        // Preset 2: Volcano
        this.register({
            id: "volcano",
            name: "Lava Volcano",
            description: "A hollow stone mountain containing lava channels.",
            difficulty: "Intermediate",
            generate: function(grid, engine) {
                grid.clear();
                const w = grid.width;
                const h = grid.height;

                // Draw solid volcanic mountain
                for (let y = Math.floor(h * 0.4); y < h - 1; y++) {
                    const rowPct = (y - h * 0.4) / (h * 0.6);
                    const halfWidth = Math.floor(w * 0.35 * rowPct);
                    const cx = Math.floor(w / 2);

                    const leftBound = cx - halfWidth;
                    const rightBound = cx + halfWidth;

                    for (let x = 1; x < w - 1; x++) {
                        if (x >= leftBound && x <= rightBound) {
                            // Leave hollow shaft in the center
                            const shaftRadius = Math.max(8, Math.floor(18 * (1 - rowPct)));
                            if (x > cx - shaftRadius && x < cx + shaftRadius) {
                                // Fill hollow shaft with Lava
                                grid.setCell(y * w + x, 9, 800); // Lava (ID 9)
                            } else {
                                grid.setCell(y * w + x, 15); // Stone (ID 15)
                            }
                        }
                    }
                }

                // Fill bottom rows with stone base
                for (let y = h - 5; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        grid.setCell(y * w + x, 15); // Stone
                    }
                }

                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });

        // Preset 3: Caves
        this.register({
            id: "cave",
            name: "Subterranean Caves",
            description: "Deep stone caverns containing underground water and acid pools.",
            difficulty: "Expert",
            generate: function(grid, engine) {
                grid.clear();
                const w = grid.width;
                const h = grid.height;

                // Fill bottom 75% with Stone
                for (let y = Math.floor(h * 0.3); y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        grid.setCell(y * w + x, 15); // Stone
                    }
                }

                // Carve cave pockets using circle overlays
                const numCaves = 12;
                const caveCenters = [];
                for (let c = 0; c < numCaves; c++) {
                    const cx = Math.floor(Math.random() * (w - 40) + 20);
                    const cy = Math.floor(Math.random() * (h * 0.5) + h * 0.38);
                    const radius = Math.floor(Math.random() * 12 + 10);
                    caveCenters.push({ x: cx, y: cy, r: radius });

                    grid.applyRadius(cx, cy, radius, (i) => {
                        grid.setCell(i, 0); // Empty
                    });
                }

                // Place liquid pools in the bottom of carved caves
                caveCenters.forEach((cave, index) => {
                    const fillType = index % 3 === 0 ? 10 : 6; // Acid (10) or Water (6)
                    const fillY = cave.y + Math.floor(cave.r * 0.4);

                    for (let y = fillY; y < cave.y + cave.r; y++) {
                        for (let x = cave.x - cave.r; x <= cave.x + cave.r; x++) {
                            if (grid.outOfBounds(x, y)) continue;
                            const idx = y * w + x;
                            if (grid.type[idx] === 0) { // Empty cave floor
                                // Verify there is solid stone underneath
                                if (grid.type[(y + 1) * w + x] === 15) {
                                    grid.setCell(idx, fillType);
                                }
                            }
                        }
                    }
                });

                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });

        // Preset 4: Ocean Reef
        this.register({
            id: "ocean",
            name: "Ocean Reef",
            description: "Deep sea layout with sandy bottom, coral wood, and floating ice.",
            difficulty: "Beginner",
            generate: function(grid, engine) {
                grid.clear();
                const w = grid.width;
                const h = grid.height;

                // Fills bottom 60% with Water
                for (let y = Math.floor(h * 0.4); y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        grid.setCell(y * w + x, 6); // Water (ID 6)
                    }
                }

                // Place Sandy ocean bed at the bottom
                for (let y = h - 8; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        grid.setCell(y * w + x, 1); // Sand (ID 1)
                    }
                }

                // Place some Wood pillars representing reefs
                const pillars = [Math.floor(w * 0.25), Math.floor(w * 0.5), Math.floor(w * 0.75)];
                pillars.forEach(px => {
                    const height = Math.floor(Math.random() * 20 + 15);
                    for (let y = h - 25; y > h - 25 - height; y--) {
                        grid.applyRadius(px, y, 2, (idx) => {
                            grid.setCell(idx, 16); // Wood (ID 16)
                        });
                    }
                });

                // Float a block of Ice at the top left surface
                for (let y = Math.floor(h * 0.35); y <= Math.floor(h * 0.42); y++) {
                    for (let x = 20; x < 90; x++) {
                        grid.setCell(y * w + x, 21); // Ice (ID 21)
                    }
                }

                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });

        // Preset 5: Physics Laboratory
        this.register({
            id: "laboratory",
            name: "Physics Lab Containers",
            description: "Double bordered metal test tubes containing lava, water, and acid.",
            difficulty: "Intermediate",
            generate: function(grid, engine) {
                grid.clear();
                const w = grid.width;
                const h = grid.height;

                // Draw three metal boxes with glass panes
                const containerWidth = Math.floor(w * 0.22);
                const containerHeight = Math.floor(h * 0.5);
                const positions = [
                    Math.floor(w * 0.15),
                    Math.floor(w * 0.5) - Math.floor(containerWidth / 2),
                    Math.floor(w * 0.85) - containerWidth
                ];

                const contents = [9, 6, 10]; // Lava, Water, Acid

                positions.forEach((px, index) => {
                    const liquidType = contents[index];

                    // Draw container bottom and walls
                    for (let y = Math.floor(h * 0.3); y <= Math.floor(h * 0.3) + containerHeight; y++) {
                        for (let x = px; x <= px + containerWidth; x++) {
                            const isWall = (x === px || x === px + containerWidth || y === Math.floor(h * 0.3) + containerHeight);
                            if (isWall) {
                                grid.setCell(y * w + x, 17); // Metal container (ID 17)
                            } else {
                                // Fill container bottom half with liquid
                                if (y > Math.floor(h * 0.3) + Math.floor(containerHeight * 0.4)) {
                                    grid.setCell(y * w + x, liquidType);
                                }
                            }
                        }
                    }

                    // Place a glass lid to seal them
                    for (let x = px; x <= px + containerWidth; x++) {
                        grid.setCell(Math.floor(h * 0.3) * w + x, 18); // Glass (ID 18)
                    }
                });

                // Place a permanent wire running below containers
                for (let x = 10; x < w - 10; x++) {
                    grid.setCell(Math.floor(h * 0.9) * w + x, 17); // Metal wire
                }
                grid.setCell(Math.floor(h * 0.9) * w + 10, 22); // Supply Battery

                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });

        // Preset 6: Chaotic Random Layout
        this.register({
            id: "random",
            name: "Chaotic Random Sandbox",
            description: "Chaotic soup of elements filling the container.",
            difficulty: "Expert",
            generate: function(grid, engine) {
                grid.clear();
                const w = grid.width;
                const h = grid.height;

                const choices = [0, 0, 0, 0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 15, 16, 17, 21];

                for (let y = 1; y < h - 1; y++) {
                    for (let x = 1; x < w - 1; x++) {
                        if (Math.random() < 0.38) {
                            const cid = choices[Math.floor(Math.random() * choices.length)];
                            if (cid !== 0) {
                                grid.setCell(y * w + x, cid);
                            }
                        }
                    }
                }

                engine.chunkActive.fill(1);
                engine.nextChunkActive.fill(1);
            }
        });
    }
};

window.Sandbox.SceneRegistry.init();
