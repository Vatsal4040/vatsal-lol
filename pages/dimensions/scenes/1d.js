window.scenes = window.scenes || {};
window.scenes['1d'] = {
    overlay: null,
    group: null,
    line: null,
    markers: [],

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-left';
        this.overlay.id = 'overlay-1d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 1</h1>
            <h2>Movement</h2>
            <p>Direction is born. Movement is possible, but only forward or backward. A single axis of infinity.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        // Group to hold all 1D visual actors
        this.group = new THREE.Group();
        this.group.visible = false;

        // Create a bright neon line along the X axis
        const points = [];
        points.push(new THREE.Vector3(-100, 0, 0));
        points.push(new THREE.Vector3(100, 0, 0));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.8
        });
        this.line = new THREE.Line(lineGeo, lineMat);
        this.group.add(this.line);

        // Create glowing dots/markers along the line to show motion reference
        const markerGeo = new THREE.SphereGeometry(0.02, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        for (let i = -40; i <= 40; i += 2) {
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(i, 0, 0);
            this.group.add(marker);
            this.markers.push(marker);
        }

        globalState.scene.add(this.group);
        globalState.lineGroup1D = this.group; // Save reference
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const singularity = globalState.singularity;

        // Setup morph: fade out singularity, show 1D group
        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (singularity) {
            tl.to(singularity.material, { opacity: 0, duration: 2 }, 0)
              .set(singularity, { visible: false }, 2);
        }

        // Camera flies along the line from X = -5 to X = 15
        tl.fromTo(globalState.camera.position, 
            { x: -5, y: 0, z: 4 },
            { x: 15, y: 0, z: 4, duration: 10 },
            0
        );

        return tl;
    },

    animate(time, delta, globalState) {
        // Ambient movement: Pulse the line color intensity
        if (this.group && this.group.visible && this.line) {
            const glow = 0.5 + Math.sin(time * 6) * 0.3;
            this.line.material.opacity = glow;
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.line.geometry.dispose();
            this.line.material.dispose();
            this.markers.forEach(m => {
                m.geometry.dispose();
                m.material.dispose();
            });
        }
    }
};
