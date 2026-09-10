/**
 * Purpose: Centralized configuration parameters for the 8-Bit Pixel Sandbox Simulation.
 * Dependencies: None.
 * Public API: window.Sandbox.EngineConfig object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.EngineConfig = {
    // Grid settings
    GRID_WIDTH: 320,
    GRID_HEIGHT: 200,
    CHUNK_SIZE: 16,

    // Simulation loops defaults
    DEFAULT_TPS: 30,
    DEFAULT_GRAVITY: "down",
    DEFAULT_BRUSH_SIZE: 3,

    // Environmental physics constants
    AIR_TEMP: 20.0, // Ambient air temperature in °C
    ABS_ZERO: -273.15, // Absolute zero temperature limit

    // Feature optimization toggles
    FEATURES: {
        dirtyRendering: true,
        chunkSleeping: true,
        lighting: true,
        effects: true
    }
};
