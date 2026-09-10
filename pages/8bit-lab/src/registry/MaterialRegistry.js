/**
 * Purpose: Material Registry validating element schemas on boot.
 * Dependencies: None
 * Public API: window.Sandbox.MaterialRegistry object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.MaterialRegistry = {
    registry: {},
    nameMap: {},
    ids: new Set(),
    names: new Set(),

    register: function(mat) {
        // Validate required fields
        if (mat.id === undefined || typeof mat.id !== "number") {
            throw new Error(`Material Validation Error: ID must be a number (got ${mat.id})`);
        }
        if (!mat.name || typeof mat.name !== "string") {
            throw new Error(`Material Validation Error: name must be a string (got ${mat.name})`);
        }
        if (!mat.category || typeof mat.category !== "string") {
            throw new Error(`Material Validation Error: category must be a string for ${mat.name}`);
        }
        if (!mat.state || !["solid", "powder", "liquid", "gas", "energy"].includes(mat.state)) {
            throw new Error(`Material Validation Error: invalid state "${mat.state}" for ${mat.name}`);
        }
        if (!mat.color || (typeof mat.color !== "string" && !Array.isArray(mat.color))) {
            throw new Error(`Material Validation Error: color must be a hex string or array for ${mat.name}`);
        }
        if (mat.density === undefined || typeof mat.density !== "number") {
            throw new Error(`Material Validation Error: density must be a number for ${mat.name}`);
        }

        // Validate duplicates
        if (this.ids.has(mat.id)) {
            throw new Error(`Material Validation Error: Duplicate Material ID registered: ${mat.id} (${mat.name})`);
        }
        if (this.names.has(mat.name.toLowerCase())) {
            throw new Error(`Material Validation Error: Duplicate Material Name registered: "${mat.name}"`);
        }

        // Validate colors are hex strings
        const checkHex = (hex) => {
            if (typeof hex !== "string" || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) {
                throw new Error(`Material Validation Error: invalid color hex format "${hex}" for ${mat.name}`);
            }
        };
        if (Array.isArray(mat.color)) {
            mat.color.forEach(checkHex);
        } else {
            checkHex(mat.color);
        }

        // Save registration maps
        this.registry[mat.id] = mat;
        this.nameMap[mat.name.toLowerCase()] = mat;
        this.ids.add(mat.id);
        this.names.add(mat.name.toLowerCase());
    },

    get: function(id) {
        return this.registry[id] || null;
    },

    getByName: function(name) {
        if (!name) return null;
        return this.nameMap[name.toLowerCase()] || null;
    },

    getAll: function() {
        return Object.values(this.registry);
    }
};
