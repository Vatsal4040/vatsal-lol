/**
 * Purpose: Registration of gas elements.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: Registers elements dynamically on window.Sandbox.MaterialRegistry.
 */

window.Sandbox = window.Sandbox || {};

(function() {
    const reg = window.Sandbox.MaterialRegistry;

    reg.register({
        id: 11,
        name: "Smoke",
        category: "Gases",
        state: "gas",
        color: ["#555555", "#444444", "#666666"],
        density: 2,
        flags: {
            hardness: 0.0,
            life: 100
        }
    });

    reg.register({
        id: 12,
        name: "Steam",
        category: "Gases",
        state: "gas",
        color: ["#d0d8e8", "#c8d0e0", "#e0e8f8"],
        density: 3,
        flags: {
            hardness: 0.0,
            life: 150,
            temp: 110.0,
            freezingPoint: 100.0 // condenses at < 100C
        }
    });

    reg.register({
        id: 13,
        name: "Gas",
        category: "Gases",
        state: "gas",
        color: ["#4a3f2a", "#3e3523", "#564931"],
        density: 4,
        flags: {
            hardness: 0.0,
            flammable: {
                ignitionTemp: 50.0,
                burnTime: 10,
                spreadChance: 0.9,
                explode: true,
                explodeRadius: 4
            }
        }
    });

    reg.register({
        id: 14,
        name: "Hydrogen Gas",
        category: "Gases",
        state: "gas",
        color: ["#d8e0ff", "#ccd8ff", "#e8efff"],
        density: 1,
        flags: {
            hardness: 0.0,
            flammable: {
                ignitionTemp: 40.0,
                burnTime: 8,
                spreadChance: 0.95,
                explode: true,
                explodeRadius: 5
            }
        }
    });
})();
