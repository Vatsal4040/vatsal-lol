/**
 * Purpose: Pre-compiled bidirectional O(1) Chemical Reaction Registry.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.ReactionRegistry object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.ReactionRegistry = {
    reactionsList: [],
    reactionMatrix: null,

    register: function(elemA, elemB, productA, productB, chance = 1.0, minTemp = null) {
        this.reactionsList.push({
            elemA: elemA.toLowerCase(),
            elemB: elemB.toLowerCase(),
            productA: productA ? productA.toLowerCase() : "empty",
            productB: productB ? productB.toLowerCase() : "empty",
            chance: chance,
            minTemp: minTemp
        });
    },

    compile: function() {
        const matReg = window.Sandbox.MaterialRegistry;
        const allMats = matReg.getAll();
        
        // Find max ID to pre-allocate exact 2D matrix size
        let maxId = 0;
        allMats.forEach(m => {
            if (m.id > maxId) maxId = m.id;
        });

        const size = maxId + 1;
        this.reactionMatrix = new Array(size);
        for (let i = 0; i < size; i++) {
            this.reactionMatrix[i] = new Array(size).fill(null);
        }

        // Map textual entries into fast ID matrix indices
        this.reactionsList.forEach(rx => {
            const matA = matReg.getByName(rx.elemA);
            const matB = matReg.getByName(rx.elemB);

            if (!matA || !matB) {
                // If a reaction refers to missing elements, fail fast or warn
                console.warn(`Reaction compiler warning: missing material for "${rx.elemA}" or "${rx.elemB}"`);
                return;
            }

            const idA = matA.id;
            const idB = matB.id;

            const rxData = {
                idA: idA,
                idB: idB,
                productA: rx.productA,
                productB: rx.productB,
                chance: rx.chance,
                minTemp: rx.minTemp
            };

            // Bidirectional registration
            this.reactionMatrix[idA][idB] = rxData;
            
            // Mirror it so lookups are symmetric
            this.reactionMatrix[idB][idA] = {
                idA: idB,
                idB: idA,
                productA: rx.productB,
                productB: rx.productA,
                chance: rx.chance,
                minTemp: rx.minTemp
            };
        });
    },

    get: function(idA, idB) {
        if (!this.reactionMatrix) return null;
        if (idA >= this.reactionMatrix.length || idB >= this.reactionMatrix.length) return null;
        return this.reactionMatrix[idA][idB];
    }
};
