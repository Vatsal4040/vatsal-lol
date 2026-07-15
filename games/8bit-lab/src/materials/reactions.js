/**
 * Purpose: Registration of element reaction behaviors.
 * Dependencies: src/registry/ReactionRegistry.js
 * Public API: Registers reactions dynamically on window.Sandbox.ReactionRegistry.
 */

window.Sandbox = window.Sandbox || {};

(function() {
    const rx = window.Sandbox.ReactionRegistry;

    // 1. Water + Lava -> Steam + Stone
    rx.register("water", "lava", "steam", "stone", 0.9);
    rx.register("salt water", "lava", "steam", "stone", 0.9);

    // 2. Water + Fire -> Steam + Empty (Extinguishes fire)
    rx.register("water", "fire", "steam", "empty", 0.85);
    rx.register("salt water", "fire", "steam", "empty", 0.85);

    // 3. Acid reactions (Dissolve solid elements)
    rx.register("acid", "metal", "empty", "empty", 0.15);
    rx.register("acid", "wood", "empty", "empty", 0.3);
    rx.register("acid", "stone", "empty", "empty", 0.1);
    rx.register("acid", "plant", "empty", "empty", 0.45);
    rx.register("acid", "seed", "empty", "empty", 0.5);

    // 4. Seed germination (Water + Seed -> Plant)
    rx.register("water", "seed", "water", "plant", 0.12);
    rx.register("salt water", "seed", "salt water", "empty", 0.05); // salt water kills seeds

    // 5. Fire ignition (Fire + Flammables -> Fire + Fire)
    rx.register("fire", "wood", "fire", "fire", 0.05);
    rx.register("fire", "plant", "fire", "fire", 0.18);
    rx.register("fire", "oil", "fire", "fire", 0.35);
    rx.register("fire", "gas", "fire", "fire", 0.8);
    rx.register("fire", "hydrogen gas", "fire", "fire", 0.9);

    // 6. Thermal contact melting
    rx.register("fire", "ice", "empty", "water", 0.95);
    rx.register("lava", "ice", "stone", "water", 0.99);
    rx.register("lava", "water", "stone", "steam", 0.99);

    // 7. Gunpowder ignition (Fire + Gunpowder -> Fire + Explosion)
    rx.register("fire", "gunpowder", "fire", "empty", 1.0); // triggers explosion via flammable config
})();
