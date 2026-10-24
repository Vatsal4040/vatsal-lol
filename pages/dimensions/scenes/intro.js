window.scenes = window.scenes || {};
window.scenes.intro = {
    overlay: null,
    dot: null,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center active'; // Active by default
        this.overlay.id = 'overlay-intro';
        this.overlay.innerHTML = `
            <h1>INTRO</h1>
            <h2>The Void</h2>
            <p>Before existence, there was nothing. No space. No time. A silent, empty canvas of pure potential.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        // Create 3D dot (representing the singularity of 0D) in global coordinate space
        const geometry = new THREE.SphereGeometry(0.04, 32, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });
        this.dot = new THREE.Mesh(geometry, material);
        this.dot.position.set(0, 0, 0);
        globalState.scene.add(this.dot);
        globalState.singularity = this.dot;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        // Scene timeline animations (total duration 10)
        tl.fromTo(this.overlay, 
            { opacity: 1, y: 0 },
            { opacity: 0, y: -30, duration: 6 }, 
            0
        );

        if (this.dot) {
            tl.set(this.dot, { visible: true }, 0)
              .to(this.dot.material, { 
                opacity: 1, 
                duration: 6 
            }, 4)
            .to(this.dot.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 6,
                ease: "back.out(1.5)"
            }, 4);
        }

        // Zoom camera in slightly towards the singularity
        tl.to(globalState.camera.position, { 
            z: 5, 
            duration: 10 
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        // Ambient pulse of the singularity
        if (this.dot && this.dot.material.opacity > 0) {
            const pulse = 1.0 + Math.sin(time * 4) * 0.12;
            this.dot.scale.set(pulse, pulse, pulse);
        }
    },

    cleanup(globalState) {
        if (this.overlay) {
            this.overlay.remove();
        }
        // Do NOT dispose or remove this.dot yet, as Dimension 0 and 1 will reuse/stretch it.
    }
};
