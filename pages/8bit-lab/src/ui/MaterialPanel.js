/**
 * Purpose: Dynamic Material Selection Panel with search filters and colored indicator blocks.
 * Dependencies: src/registry/MaterialRegistry.js
 * Public API: window.Sandbox.MaterialPanel object.
 */

window.Sandbox = window.Sandbox || {};

window.Sandbox.MaterialPanel = {
    activeMaterialId: 1, // Default Sand
    activeCategory: "Powders",
    searchTerm: "",

    init: function() {
        const categoriesContainer = document.getElementById("categoryTabs");
        const materialsContainer = document.getElementById("materialButtons");
        const searchInput = document.getElementById("materialSearch");

        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchTerm = e.target.value.toLowerCase().trim();
                this.render();
            });
        }

        // Click handler delegation for tabs
        if (categoriesContainer) {
            categoriesContainer.addEventListener("click", (e) => {
                const tab = e.target.closest(".cat-tab");
                if (tab) {
                    this.activeCategory = tab.dataset.category;
                    this.searchTerm = ""; // Clear search on tab switch
                    if (searchInput) searchInput.value = "";
                    this.render();
                }
            });
        }

        this.render();
    },

    selectElement: function(name) {
        const mat = window.Sandbox.MaterialRegistry.getByName(name);
        if (mat) {
            this.activeMaterialId = mat.id;
            this.activeCategory = mat.category;
            this.render();

            // Auto-switch cursor back to brush tool
            window.Sandbox.Toolbar.selectTool("brush");
        }
    },

    render: function() {
        const registry = window.Sandbox.MaterialRegistry;
        const allMats = registry.getAll();

        const categoriesContainer = document.getElementById("categoryTabs");
        const materialsContainer = document.getElementById("materialButtons");
        if (!materialsContainer) return;

        // 1. Build list of unique categories
        const categories = new Set();
        allMats.forEach(m => {
            if (m.id !== 0) categories.add(m.category); // Exclude Empty
        });

        // 2. Render category tabs
        if (categoriesContainer) {
            categoriesContainer.innerHTML = "";
            categories.forEach(cat => {
                const isActive = (cat === this.activeCategory && !this.searchTerm);
                const btn = document.createElement("button");
                btn.className = `cat-tab ${isActive ? "active" : ""}`;
                btn.dataset.category = cat;
                
                let borderCol = "#7FA8D8"; // Blue
                if (cat === "Powders") borderCol = "#C9A76A"; // Orange
                if (cat === "Nature") borderCol = "#8ABF88"; // Green
                if (cat === "Technology") borderCol = "#9C88C7"; // Purple
                if (cat === "Fire & Energy") borderCol = "#C56A6A"; // Danger Red

                btn.style.setProperty("--accent-tab", borderCol);
                btn.innerText = cat;
                categoriesContainer.appendChild(btn);
            });
        }

        // 3. Render material buttons
        materialsContainer.innerHTML = "";

        const filtered = allMats.filter(m => {
            if (m.id === 0) return false;
            if (this.searchTerm) {
                return m.name.toLowerCase().includes(this.searchTerm);
            }
            return m.category === this.activeCategory;
        });

        filtered.forEach(m => {
            const btn = document.createElement("button");
            btn.className = `element-btn`;
            btn.onclick = () => {
                this.activeMaterialId = m.id;
                this.render();
                window.Sandbox.Toolbar.selectTool("brush");
            };

            const baseColor = Array.isArray(m.color) ? m.color[0] : m.color;
            let textColor = "#ffffff";
            try {
                const hex = baseColor.startsWith('#') ? baseColor.substring(1) : baseColor;
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                textColor = luminance > 0.5 ? "#000000" : "#ffffff";
            } catch (err) {}

            btn.style.backgroundColor = baseColor;
            btn.style.color = textColor;

            if (m.id === this.activeMaterialId) {
                btn.style.border = "1px solid #ffffff";
                btn.style.boxShadow = "0 0 4px rgba(255, 255, 255, 0.8)";
            } else {
                btn.style.border = "1px solid transparent";
            }

            btn.innerText = m.name;
            materialsContainer.appendChild(btn);
        });
    }
};
