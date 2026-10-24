window.scenes = window.scenes || {};
window.scenes['0d'] = {
    overlay: null,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-0d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 0</h1>
            <h2>Existence</h2>
            <p>A single point. No width. No height. No time.<br>Existence without direction. The first spark of being.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        // Retrieve dot singularity from intro or create one if missing
        if (!globalState.singularity) {
            const dot = globalState.scene.children.find(c => c.geometry && c.geometry.type === 'SphereGeometry' && c.position.x === 0);
            globalState.singularity = dot;
        }

        const dot = globalState.singularity;

        // Animate overlay, reset camera to center looking at dot
        tl.fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7)
          .set(globalState.camera.position, { x: 0, y: 0, z: 4 }, 0)
          .set(globalState.camera.rotation, { x: 0, y: 0, z: 0 }, 0);

        if (dot) {
            tl.set(dot, { visible: true }, 0);
            tl.set(dot.position, { x: 0, y: 0, z: 0 }, 0);
            tl.set(dot.scale, { x: 1, y: 1, z: 1 }, 0);
            tl.to(dot.material, { opacity: 1, duration: 1 }, 0);
        }

        return tl;
    },

    animate(time, delta, globalState) {
        // Subtle ambient wobble
        const dot = globalState.singularity;
        if (dot && dot.scale.x < 1.5) {
            const pulse = 1.0 + Math.sin(time * 4) * 0.1;
            dot.scale.set(pulse, pulse, pulse);
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
    }
};
