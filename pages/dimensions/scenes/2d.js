window.scenes = window.scenes || {};
window.scenes['2d'] = {
    overlay: null,
    group: null,
    grid: null,
    traveler: null,
    sphere: null,
    intersectCircle: null,
    sphereY: -3, // Target for animation

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-right';
        this.overlay.id = 'overlay-2d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 2</h1>
            <h2>Flatland</h2>
            <p>The line unfolds into a plane. A world of shapes. A sphere passing through appears as a circle growing and shrinking. They cannot see the depth that surrounds them.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        // Custom Neon Grid in XZ Plane
        const size = 30;
        const divisions = 30;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00f2ff, 0x224466);
        gridHelper.position.set(0, 0, 0);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.5;
        this.grid = gridHelper;
        this.group.add(gridHelper);

        // Flat traveler (glowing triangle on the plane)
        const trGeo = new THREE.ConeGeometry(0.12, 0.35, 3);
        trGeo.rotateX(Math.PI / 2); // Make it lie flat
        const trMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        this.traveler = new THREE.Mesh(trGeo, trMat);
        this.traveler.position.set(-2, 0, -2);
        this.group.add(this.traveler);

        // Wireframe 3D sphere crossing the plane
        const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        this.sphere = new THREE.Mesh(sphereGeo, sphereMat);
        this.sphere.position.set(0, this.sphereY, 0);
        this.group.add(this.sphere);

        // Flat intersection circle on the plane
        const circleGeo = new THREE.RingGeometry(0, 1.2, 32);
        circleGeo.rotateX(-Math.PI / 2); // Lying on XZ plane
        const circleMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.intersectCircle = new THREE.Mesh(circleGeo, circleMat);
        this.intersectCircle.position.set(0, 0.01, 0); // slightly above grid to prevent z-fighting
        this.group.add(this.intersectCircle);

        globalState.scene.add(this.group);
        globalState.gridGroup2D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const lineGroup = globalState.lineGroup1D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        // Fade out previous 1D line group
        if (lineGroup) {
            tl.to(lineGroup.children.map(c => c.material).filter(Boolean), { 
                opacity: 0, 
                duration: 2 
            }, 0)
            .set(lineGroup, { visible: false }, 2);
        }

        // Camera transitions to high angled view of the plane (zoomed out)
        tl.to(globalState.camera.position, {
            x: 0,
            y: 7.5,
            z: 10.5,
            duration: 10
        }, 0);

        // Camera looks at center
        tl.to(globalState.camera.rotation, {
            x: -Math.PI / 4,
            y: 0,
            z: 0,
            duration: 10
        }, 0);

        // Animate the sphere moving vertically through the plane
        tl.fromTo(this, 
            { sphereY: -2.5 },
            { sphereY: 2.5, duration: 8, ease: "power1.inOut" },
            1
        );

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // Sync sphere position
        if (this.sphere) {
            this.sphere.position.y = this.sphereY;
        }

        // Calculate intersection circle radius mathematically: r = sqrt(R^2 - y^2)
        const R = 1.2;
        const y = this.sphereY;
        if (this.intersectCircle) {
            if (Math.abs(y) < R) {
                const r = Math.sqrt(R * R - y * y);
                this.intersectCircle.scale.set(r, r, r);
                this.intersectCircle.visible = true;
                this.intersectCircle.material.opacity = 0.5 + Math.sin(time * 10) * 0.2;
            } else {
                this.intersectCircle.visible = false;
            }
        }

        // Move the 2D traveler in a square path on the plane
        if (this.traveler) {
            const speed = 1.5;
            const size = 2.5;
            const t = time * speed;
            const x = Math.sin(t) * size;
            const z = Math.cos(t) * size;
            
            this.traveler.position.set(x, 0, z);
            
            const angle = Math.atan2(Math.cos(t), -Math.sin(t));
            this.traveler.rotation.y = angle;
        }

        // Rotate the wireframe sphere slowly
        if (this.sphere) {
            this.sphere.rotation.y += 0.01;
            this.sphere.rotation.x += 0.005;
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.grid.geometry.dispose();
            this.grid.material.dispose();
            this.traveler.geometry.dispose();
            this.traveler.material.dispose();
            this.sphere.geometry.dispose();
            this.sphere.material.dispose();
            this.intersectCircle.geometry.dispose();
            this.intersectCircle.material.dispose();
        }
    }
};
