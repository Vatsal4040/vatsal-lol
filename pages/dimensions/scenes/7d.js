window.scenes = window.scenes || {};
window.scenes['7d'] = {
    overlay: null,
    group: null,
    chamber1: null,
    chamber2: null,
    chamber3: null,
    c1Particles: [],
    c2Cubes: [],
    c3GridPoints: null,
    c3PointsData: [],

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-left';
        this.overlay.id = 'overlay-7d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 7</h1>
            <h2>Different Laws</h2>
            <p>Physics is rewritten. One universe has sideways gravity. Another is entirely cubic, devoid of spheres. A third flows like a neon liquid. Fundamental rules differ from bubble to bubble.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const particleMultiplier = globalState.qualitySettings.particleMultiplier;

        // --- CHAMBER 1: SIDEWAYS GRAVITY (At Z = -90) ---
        this.chamber1 = new THREE.Group();
        this.chamber1.position.set(0, 0, -90);
        
        // Large outer boundary ring
        const boundaryGeo = new THREE.RingGeometry(2.5, 2.56, 32);
        const boundaryMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
        const ring = new THREE.Mesh(boundaryGeo, boundaryMat);
        this.chamber1.add(ring);

        // Horizontal neon rain cylinder streaks (aligned along X axis)
        const rainGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4);
        rainGeo.rotateZ(Math.PI / 2); // rotate horizontally
        const rainMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0.8 });
        
        for (let i = 0; i < 45; i++) {
            const rain = new THREE.Mesh(rainGeo, rainMat);
            // Scatter
            rain.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 2
            );
            this.chamber1.add(rain);
            this.c1Particles.push({
                mesh: rain,
                speed: 6.0 + Math.random() * 8.0 // Rapid sideways speed
            });
        }
        this.group.add(this.chamber1);

        // --- CHAMBER 2: CUBIC WORLD (devoid of spheres, At Z = -100) ---
        this.chamber2 = new THREE.Group();
        this.chamber2.position.set(0, 2.2, -102);

        // Giant rotating wireframe outer cubic cage
        const cageGeo = new THREE.BoxGeometry(4.0, 4.0, 4.0);
        const cageMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, transparent: true, opacity: 0.25 });
        const cage = new THREE.Mesh(cageGeo, cageMat);
        this.chamber2.add(cage);
        this.cage = cage;

        // Multiple interlocking floating cubes
        const cubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const numCubes = 18;
        
        for (let i = 0; i < numCubes; i++) {
            const color = i % 2 === 0 ? 0xff00ff : 0x00f2ff;
            const cubeMat = new THREE.MeshStandardMaterial({ 
                color: color, 
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.7,
                flatShading: true,
                emissive: color,
                emissiveIntensity: 0.1
            });
            const cube = new THREE.Mesh(cubeGeo, cubeMat);
            cube.position.set(
                (Math.random() - 0.5) * 2.8,
                (Math.random() - 0.5) * 2.8,
                (Math.random() - 0.5) * 2.8
            );
            const scale = 0.6 + Math.random() * 2.0;
            cube.scale.set(scale, scale, scale);
            
            this.chamber2.add(cube);
            this.c2Cubes.push({
                mesh: cube,
                rotX: (Math.random() - 0.5) * 1.2,
                rotY: (Math.random() - 0.5) * 1.2
            });
        }
        this.group.add(this.chamber2);

        // --- CHAMBER 3: LIQUID UNIVERSE (At Z = -114) ---
        this.chamber3 = new THREE.Group();
        this.chamber3.position.set(2, -1.0, -114);

        // Undulating neon liquid sheet
        const cols = Math.floor(40 * Math.sqrt(particleMultiplier));
        const rows = Math.floor(30 * Math.sqrt(particleMultiplier));
        const totalPoints = cols * rows;
        
        const waveGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(totalPoints * 3);
        
        let pIdx = 0;
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const lx = ((c / (cols - 1)) - 0.5) * 5.0;
                const lz = ((r / (rows - 1)) - 0.5) * 5.0;
                positions[pIdx * 3] = lx;
                positions[pIdx * 3 + 1] = 0; // Y modulated in loop
                positions[pIdx * 3 + 2] = lz;
                
                this.c3PointsData.push({
                    x: lx,
                    z: lz,
                    vertIndex: pIdx
                });
                pIdx++;
            }
        }
        
        waveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const waveMat = new THREE.PointsMaterial({
            color: 0x00ffaa,
            size: 0.05,
            transparent: true,
            opacity: 0.9
        });
        this.c3GridPoints = new THREE.Points(waveGeo, waveMat);
        this.chamber3.add(this.c3GridPoints);
        this.group.add(this.chamber3);

        globalState.scene.add(this.group);
        globalState.lawsGroup7D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const universeGroup = globalState.universeGroup6D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (universeGroup) {
            const materials = [];
            universeGroup.traverse(node => {
                if (node.material) materials.push(node.material);
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(universeGroup, { visible: false }, 2);
        }

        // Camera flies past the three distinct physics exhibitions
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0.8,
            z: -112,
            duration: 10,
            ease: "none"
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // 1. Sideways rain animation
        this.c1Particles.forEach(p => {
            p.mesh.position.x -= p.speed * delta; // falling sideways (leftwards)
            if (p.mesh.position.x < -3.0) {
                p.mesh.position.x = 3.0; // wrap around
                p.mesh.position.y = (Math.random() - 0.5) * 4;
            }
        });

        // 2. Interlocking cubic world rotation
        if (this.cage) {
            this.cage.rotation.y = time * 0.15;
            this.cage.rotation.z = time * 0.08;
        }
        this.c2Cubes.forEach(cube => {
            cube.mesh.rotation.x += cube.rotX * delta;
            cube.mesh.rotation.y += cube.rotY * delta;
        });

        // 3. Waving neon liquid (double-sine wave function)
        if (this.c3GridPoints) {
            const posAttr = this.c3GridPoints.geometry.attributes.position;
            this.c3PointsData.forEach(p => {
                // Wave formula: y = sin(x * 1.5 + time * 3.5) * cos(z * 1.5 + time * 2.5) * 0.35
                const y = Math.sin(p.x * 1.5 + time * 3.5) * Math.cos(p.z * 1.5 + time * 2.5) * 0.35;
                posAttr.setY(p.vertIndex, y);
            });
            posAttr.needsUpdate = true;
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.group.traverse(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.material) node.material.dispose();
            });
        }
    }
};
