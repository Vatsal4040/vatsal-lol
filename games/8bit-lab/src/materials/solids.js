/**
 * Purpose: Registration of solid, technology, energy, and special elements.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: Registers elements dynamically on window.Sandbox.MaterialRegistry.
 */

window.Sandbox = window.Sandbox || {};

(function() {
    const reg = window.Sandbox.MaterialRegistry;

    reg.register({
        id: 15,
        name: "Stone",
        category: "Solids",
        state: "solid",
        color: ["#808080", "#737373", "#8c8c8c"],
        density: 100, // dense solid
        flags: {
            meltingPoint: 1200.0,
            hardness: 0.9
        }
    });

    reg.register({
        id: 16,
        name: "Wood",
        category: "Solids",
        state: "solid",
        color: ["#8b5a2b", "#704822", "#9e6631"],
        density: 50,
        flags: {
            hardness: 0.5,
            flammable: {
                ignitionTemp: 250.0,
                burnTime: 200,
                spreadChance: 0.1,
                ashChance: 0.4
            }
        }
    });

    reg.register({
        id: 17,
        name: "Metal",
        category: "Solids",
        state: "solid",
        color: ["#b0c4de", "#a1b2c9", "#c0d4ed"],
        density: 150,
        flags: {
            meltingPoint: 1500.0,
            conductive: { conductivity: 0.9, resistance: 0.01 },
            hardness: 0.95
        }
    });

    reg.register({
        id: 18,
        name: "Glass",
        category: "Solids",
        state: "solid",
        color: ["#e0f7fa", "#b2ebf2", "#e0f2f1"],
        density: 110,
        flags: {
            meltingPoint: 1000.0,
            hardness: 0.4
        }
    });

    reg.register({
        id: 19,
        name: "Plant",
        category: "Nature",
        state: "solid",
        color: ["#2e8b57", "#228b22", "#3cb371"],
        density: 20,
        flags: {
            hardness: 0.2,
            flammable: {
                ignitionTemp: 180.0,
                burnTime: 80,
                spreadChance: 0.3,
                ashChance: 0.3
            }
        }
    });

    reg.register({
        id: 20,
        name: "Seed",
        category: "Nature",
        state: "powder",
        color: ["#d2b48c", "#cd853f", "#8b4513"],
        density: 65,
        flags: {
            hardness: 0.1,
            flammable: {
                ignitionTemp: 150.0,
                burnTime: 40,
                spreadChance: 0.2
            }
        }
    });

    reg.register({
        id: 21,
        name: "Ice",
        category: "Solids",
        state: "solid",
        color: ["#e3f2fd", "#bbdefb", "#e1f5fe"],
        density: 38, // floats on water
        flags: {
            meltingPoint: 0.0,
            temp: -10.0,
            hardness: 0.3
        }
    });

    reg.register({
        id: 22,
        name: "Battery",
        category: "Technology",
        state: "solid",
        color: ["#cca300", "#b38f00", "#e6b800"],
        density: 160,
        flags: {
            conductive: { generator: true, charge: 255 },
            hardness: 0.8
        }
    });

    reg.register({
        id: 23,
        name: "LED",
        category: "Technology",
        state: "solid",
        color: ["#4a4a4a", "#404040", "#545454"],
        density: 140,
        flags: {
            conductive: { lamp: true },
            hardness: 0.7
        }
    });

    reg.register({
        id: 24,
        name: "Wall",
        category: "Solids",
        state: "solid",
        color: ["#555555", "#4a4a4a", "#606060"],
        density: 999, // indestructible solid
        flags: {
            indestructible: true,
            hardness: 1.0
        }
    });

    reg.register({
        id: 25,
        name: "Fire",
        category: "Fire & Energy",
        state: "energy",
        color: ["#ff4500", "#ff8c00", "#ff0000", "#ffa500"],
        density: 0,
        flags: {
            temp: 600.0,
            life: 25,
            hardness: 0.0
        }
    });
})();
