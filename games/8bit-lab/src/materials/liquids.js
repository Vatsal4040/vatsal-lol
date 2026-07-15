/**
 * Purpose: Registration of liquid elements.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: Registers elements dynamically on window.Sandbox.MaterialRegistry.
 */

window.Sandbox = window.Sandbox || {};

(function() {
    const reg = window.Sandbox.MaterialRegistry;

    reg.register({
        id: 6,
        name: "Water",
        category: "Liquids",
        state: "liquid",
        color: ["#4080ff", "#3070ef", "#4888ff"],
        density: 40,
        flags: {
            viscosity: 1,
            boilingPoint: 100.0,
            freezingPoint: 0.0,
            hardness: 0.1
        }
    });

    reg.register({
        id: 7,
        name: "Salt Water",
        category: "Liquids",
        state: "liquid",
        color: ["#5090ff", "#4080ef", "#5898ff"],
        density: 42,
        flags: {
            viscosity: 1,
            boilingPoint: 105.0,
            freezingPoint: -4.0,
            conductive: { conductivity: 0.3 },
            hardness: 0.1
        }
    });

    reg.register({
        id: 8,
        name: "Oil",
        category: "Liquids",
        state: "liquid",
        color: ["#6b583d", "#5c4b33", "#776345"],
        density: 30,
        flags: {
            viscosity: 3,
            flammable: {
                ignitionTemp: 80.0,
                burnTime: 300,
                spreadChance: 0.4
            },
            hardness: 0.1
        }
    });

    reg.register({
        id: 9,
        name: "Lava",
        category: "Liquids",
        state: "liquid",
        color: ["#d93800", "#c43200", "#ed4a00"],
        density: 95,
        flags: {
            viscosity: 8,
            temp: 800.0,
            hardness: 0.8
        }
    });

    reg.register({
        id: 10,
        name: "Acid",
        category: "Liquids",
        state: "liquid",
        color: ["#00ff00", "#11ee11", "#05dd05"],
        density: 45,
        flags: {
            viscosity: 2,
            hardness: 0.1
        }
    });
})();
