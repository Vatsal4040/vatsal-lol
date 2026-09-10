/**
 * Purpose: Registration of powder elements.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: Registers elements dynamically on window.Sandbox.MaterialRegistry.
 */

window.Sandbox = window.Sandbox || {};

(function() {
    const reg = window.Sandbox.MaterialRegistry;

    reg.register({
        id: 1,
        name: "Sand",
        category: "Powders",
        state: "powder",
        color: ["#e0c068", "#d8b860", "#e8c870"],
        density: 80,
        flags: { hardness: 0.1 }
    });

    reg.register({
        id: 2,
        name: "Dirt",
        category: "Powders",
        state: "powder",
        color: ["#5c4033", "#50382b", "#66473a"],
        density: 90,
        flags: { hardness: 0.2 }
    });

    reg.register({
        id: 3,
        name: "Salt",
        category: "Powders",
        state: "powder",
        color: ["#f5f5f5", "#eeeeee", "#e0e0e0"],
        density: 75,
        flags: { hardness: 0.1 }
    });

    reg.register({
        id: 4,
        name: "Ash",
        category: "Powders",
        state: "powder",
        color: ["#7a7a7a", "#696969", "#8b8b8b"],
        density: 15,
        flags: { hardness: 0.0 }
    });

    reg.register({
        id: 5,
        name: "Gunpowder",
        category: "Powders",
        state: "powder",
        color: ["#333333", "#222222", "#444444"],
        density: 70,
        flags: {
            hardness: 0.0,
            flammable: {
                ignitionTemp: 100.0,
                burnTime: 5,
                spreadChance: 0.8,
                explode: true,
                explodeRadius: 8
            }
        }
    });
})();
