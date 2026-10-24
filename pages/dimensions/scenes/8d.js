window.scenes = window.scenes || {};
window.scenes['8d'] = {
    overlay: null,
    group: null,
    clusters: [],

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-8d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 8</h1>
            <h2>Universe Clusters</h2>
            <p>Pocket universes gather. Infinite bubbles pull together under macro-gravitational forces, structuring themselves into colossal celestial clusters of reality.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        // Position coordinates for 6 macro universe clusters
        const clusterCenters = [
            new THREE.Vector3(0.0, 1.0, -148),
            new THREE.Vector3(-4.0, 2.5, -154),
            new THREE.Vector3(4.0, -2.0, -154),
            new THREE.Vector3(-3.0, -3.0, -162),
            new THREE.Vector3(3.0, 3.5, -162),
            new THREE.Vector3(0.0, -4.0, -168)
        ];

        const miniBubbleGeo = new THREE.SphereGeometry(0.15, 8, 8);

        clusterCenters.forEach((center, cIdx) => {
            const cluster = new THREE.Group();
            cluster.position.copy(center);

            // Populate each cluster with 18 mini rotating bubble universes
            const numUniverses = 18;
            for (let i = 0; i < numUniverses; i++) {
                const r = 0.5 + Math.random() * 0.85;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                
                const bx = Math.sin(phi) * Math.cos(theta) * r;
                const by = Math.sin(phi) * Math.sin(theta) * r;
                const bz = Math.cos(phi) * r;

                const color = new THREE.Color().setHSL((cIdx * 0.16 + i * 0.02) % 1.0, 0.9, 0.65);
                const mat = new THREE.MeshBasicMaterial({ 
                    color: color,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.25 
                });
                
                const bubble = new THREE.Mesh(miniBubbleGeo, mat);
                bubble.position.set(bx, by, bz);
                cluster.add(bubble);
            }

            this.group.add(cluster);
            this.clusters.push({
                group: cluster,
                rotSpeedX: 0.12 + Math.random() * 0.15,
                rotSpeedY: 0.12 + Math.random() * 0.15
            });
        });

        globalState.scene.add(this.group);
        globalState.clustersGroup8D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const lawsGroup = globalState.lawsGroup7D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0.5)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        // Hide physics chambers from 7D
        if (lawsGroup) {
            const colorNodes = [];
            lawsGroup.traverse(node => {
                if (node.material) colorNodes.push(node.material);
            });
            tl.to(colorNodes, { opacity: 0, duration: 2 }, 0)
              .set(lawsGroup, { visible: false }, 2);
        }

        // --- DRONE FLYBY PHYSICS (Multi-step Camera Path) ---
        // Step 1: Accelerate out of 7D, diving close to left cluster (C1)
        tl.to(globalState.camera.position, {
            x: -2.5,
            y: 1.5,
            z: -148,
            duration: 4.0,
            ease: "power2.inOut"
        }, 0);

        // Step 2: Slow down and weave right/down near right cluster (C2)
        tl.to(globalState.camera.position, {
            x: 3.0,
            y: -1.0,
            z: -158,
            duration: 3.5,
            ease: "power1.inOut"
        }, 4.0);

        // Step 3: Accelerate again, zooming past remaining clusters to center
        tl.to(globalState.camera.position, {
            x: 0.0,
            y: 0.0,
            z: -172,
            duration: 2.5,
            ease: "power2.in"
        }, 7.5);

        // --- CAMERA PANS (Tracking rotation matching drone path) ---
        tl.to(globalState.camera.rotation, {
            x: -0.2,
            y: 0.25,
            z: 0.0,
            duration: 4.0
        }, 0)
        .to(globalState.camera.rotation, {
            x: 0.1,
            y: -0.25,
            z: 0.0,
            duration: 3.5
        }, 4.0)
        .to(globalState.camera.rotation, {
            x: 0.0,
            y: 0.0,
            z: 0.0,
            duration: 2.5
        }, 7.5);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // Animate individual clusters rotating on multiple axes
        this.clusters.forEach(c => {
            c.group.rotation.y += c.rotSpeedY * delta;
            c.group.rotation.x += c.rotSpeedX * delta;
        });
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.clusters.forEach(c => {
                c.group.traverse(node => {
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) node.material.dispose();
                });
            });
        }
    }
};
