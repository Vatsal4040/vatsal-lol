window.scenes = window.scenes || {};
window.scenes.ending = {
    overlay: null,
    group: null,
    galaxy: null,
    solarSystem: null,
    earth: null,
    cells: null,
    atom: null,
    quarks: null,
    finalPointHolder: null,
    finalPoint: null,

    init(globalState) {
        // Create HTML Overlay for the "BEYOND" Speculation Scene and Final Credits
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-ending';
        this.overlay.innerHTML = `
            <div id="narrative-ending" style="opacity: 1; transition: opacity 0.5s ease;">
                <h1>BEYOND</h1>
                <h2>The Unknown</h2>
                <p style="max-width: 600px; font-size: 1.2rem; line-height: 1.7;">
                    "Mathematics can describe possibilities beyond our everyday experience. Whether reality contains additional dimensions remains an open question."
                </p>
            </div>
            <div id="credits-ending" class="credits-container" style="opacity: 0;">
                <h2 class="credits-main">Every end is a point. Every point is a beginning.</h2>
                <p class="credits-sub">A VATSAL.LOL experience</p>
                <div class="credits-link-wrap">
                    <a href="https://vatsal.lol" target="_blank" rel="noopener noreferrer" class="credits-link">Play more games at VATSAL.LOL</a>
                </div>
            </div>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const baseZ = -275;

        // 1. Galaxy Mesh
        this.galaxy = this.createSpiralGalaxy();
        this.galaxy.position.set(0, 0, baseZ);
        this.galaxy.scale.set(0.001, 0.001, 0.001);
        this.group.add(this.galaxy);

        // 2. Solar System
        this.solarSystem = new THREE.Group();
        this.solarSystem.position.set(0, 0, baseZ);
        this.solarSystem.scale.set(0.001, 0.001, 0.001);
        
        const sun = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        this.solarSystem.add(sun);
        
        for (let i = 1; i <= 4; i++) {
            const r = i * 0.8;
            const orbitGeo = new THREE.RingGeometry(r, r + 0.02, 32);
            orbitGeo.rotateX(-Math.PI / 2);
            const orbit = new THREE.Mesh(orbitGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 }));
            this.solarSystem.add(orbit);
            
            const planet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f2ff }));
            planet.position.x = r;
            planet.name = `planet_${i}`;
            this.solarSystem.add(planet);
        }
        this.group.add(this.solarSystem);

        // 3. Earth
        const earthGeo = new THREE.SphereGeometry(0.8, 16, 16);
        const earthMat = new THREE.MeshBasicMaterial({ 
            color: 0x00f2ff, 
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.earth = new THREE.Mesh(earthGeo, earthMat);
        this.earth.position.set(0, 0, baseZ);
        this.earth.scale.set(0.001, 0.001, 0.001);
        this.group.add(this.earth);

        // 4. Cells
        this.cells = new THREE.Group();
        this.cells.position.set(0, 0, baseZ);
        this.cells.scale.set(0.001, 0.001, 0.001);
        const cellGeo = new THREE.RingGeometry(0.2, 0.23, 6);
        const cellMat = new THREE.MeshBasicMaterial({ color: 0x00ffaa, side: THREE.DoubleSide });
        for (let i = -3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                const c = new THREE.Mesh(cellGeo, cellMat);
                const xOffset = j % 2 === 0 ? 0 : 0.2;
                c.position.set(i * 0.5 + xOffset, j * 0.43, 0);
                this.cells.add(c);
            }
        }
        this.group.add(this.cells);

        // 5. Bohr Model Atom
        this.atom = new THREE.Group();
        this.atom.position.set(0, 0, baseZ);
        this.atom.scale.set(0.001, 0.001, 0.001);
        
        const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff00ff }));
        this.atom.add(nucleus);
        
        const shell1 = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.41, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
        shell1.rotateX(Math.PI / 3);
        const shell2 = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.71, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
        shell2.rotateY(Math.PI / 4);
        
        this.atom.add(shell1);
        this.atom.add(shell2);
        this.group.add(this.atom);

        // 6. Quarks
        this.quarks = new THREE.Group();
        this.quarks.position.set(0, 0, baseZ);
        this.quarks.scale.set(0.001, 0.001, 0.001);
        const qGeo = new THREE.SphereGeometry(0.07, 8, 8);
        const qMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 3; i++) {
            const q = new THREE.Mesh(qGeo, qMat);
            const angle = (i * Math.PI * 2) / 3;
            q.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
            this.quarks.add(q);
        }
        this.group.add(this.quarks);

        // 7. Local Final Point mesh (singularity loop dot, matching INTRO and 0D)
        this.finalPointHolder = new THREE.Group();
        this.finalPointHolder.position.set(0, 0, baseZ);
        this.finalPointHolder.scale.set(0.001, 0.001, 0.001);

        this.finalPoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 32, 32), 
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
        );
        this.finalPoint.position.set(0, 0, 0);
        this.finalPointHolder.add(this.finalPoint);
        this.group.add(this.finalPointHolder);

        globalState.scene.add(this.group);
        globalState.infinityGroup = this.group;
    },

    createSpiralGalaxy() {
        const numStars = 600;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(numStars * 3);
        const colors = new Float32Array(numStars * 3);
        const color = new THREE.Color(0xffaa00);
        
        for (let i = 0; i < numStars; i++) {
            const r = Math.random() * 4.0;
            const theta = r * 3.5 + Math.random() * 0.6;
            
            positions[i*3] = Math.cos(theta) * r;
            positions[i*3+1] = (Math.random() - 0.5) * 0.3;
            positions[i*3+2] = Math.sin(theta) * r;
            
            const blendedColor = color.clone().lerp(new THREE.Color(0xff00ff), r / 4);
            colors[i*3] = blendedColor.r;
            colors[i*3+1] = blendedColor.g;
            colors[i*3+2] = blendedColor.b;
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const mat = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });
        return new THREE.Points(geom, mat);
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const braneGroup = globalState.braneGroup11D;
        const endingOverlay = this.overlay.querySelector('#narrative-ending');
        const creditsOverlay = this.overlay.querySelector('#credits-ending');

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0.5);

        if (braneGroup) {
            tl.set(braneGroup, { visible: false }, 0);
        }

        // Restore bloom settings
        tl.to(globalState.bloomPass, { strength: globalState.qualitySettings.bloomStrength, radius: globalState.qualitySettings.bloomRadius, duration: 3, ease: "power2.out" }, 0);

        // Zoom camera forward down the baseZ axis to -274 by 9.0s and stay pinned there
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0,
            z: -274,
            duration: 9,
            ease: "none"
        }, 0);

        const baseZ = -275;

        // Galaxy flight past
        tl.to(this.galaxy.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power1.out" }, 0.5)
          .to(this.galaxy.position, { z: baseZ + 15, duration: 2, ease: "power1.in" }, 0.5)
          .to(this.galaxy.material, { opacity: 0, duration: 0.5 }, 2.0);

        // Solar System flight past
        tl.to(this.solarSystem.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1.5, ease: "power1.out" }, 2.0)
          .to(this.solarSystem.position, { z: baseZ + 15, duration: 2, ease: "power1.in" }, 2.0);

        // Earth flight past
        tl.to(this.earth.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power1.out" }, 3.5)
          .to(this.earth.position, { z: baseZ + 15, duration: 2, ease: "power1.in" }, 3.5)
          .to(this.earth.material, { opacity: 0, duration: 0.5 }, 5.0);

        // Cells flight past
        tl.to(this.cells.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.5, ease: "power1.out" }, 5.0)
          .to(this.cells.position, { z: baseZ + 15, duration: 2, ease: "power1.in" }, 5.0)
          .to(this.cells.children.map(c => c.material), { opacity: 0, duration: 0.5 }, 6.5);

        // Atom flight past
        tl.to(this.atom.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power1.out" }, 6.5)
          .to(this.atom.position, { z: baseZ + 15, duration: 2, ease: "power1.in" }, 6.5)
          .to(this.atom.children.map(c => c.material), { opacity: 0, duration: 0.5 }, 7.8);

        // Quarks flight past
        tl.to(this.quarks.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power1.out" }, 7.8)
          .to(this.quarks.position, { z: baseZ + 15, duration: 1.8, ease: "power1.in" }, 7.8)
          .to(this.quarks.children.map(c => c.material), { opacity: 0, duration: 0.4 }, 9.2);

        // --- BEYOND ENDING SEQUENCE ---
        // 1. Fade out the text overlay
        tl.to(endingOverlay, { opacity: 0, duration: 1.5 }, 7.5);

        // 2. Fade lights and audio out into absolute quiet darkness
        tl.to(globalState.lights.ambient, { intensity: 0.0, duration: 1.5 }, 8.0)
          .to(globalState.lights.directional, { intensity: 0.0, duration: 1.5 }, 8.0)
          .to(globalState.lights.point, { intensity: 0.0, duration: 1.5 }, 8.0)
          .to(globalState.audio, {
              volume: 0.0001,
              duration: 2.0,
              onUpdate: () => {
                  globalState.audio.setVolume(globalState.audio.volume);
              }
          }, 8.0);

        // 3. Make the singularity loop particle glow and become visible in the dark viewport
        tl.to(this.finalPointHolder.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 1.2, ease: "power2.out" }, 8.0)
          .to(this.finalPoint.material, { opacity: 1.0, duration: 1.0 }, 8.0);

        // 4. HOLD ON THE LONE DOT FOR A BEAT (about 3 timeline seconds of scroll from ~9.2s to 12.2s, with no other text)

        // 5. Fade in centered HTML credits overlay (at 12.2s, duration 1.5s)
        tl.to(creditsOverlay, { opacity: 1.0, duration: 1.5, ease: "power1.inOut" }, 12.2);

        // 6. Hold credits and dot pinned until end of timeline (16.0s total, nothing disappears)
        tl.to({}, { duration: 2.3 }, 13.7);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // Ambient pulse of the singularity final point (matching INTRO and 0D)
        if (this.finalPoint && this.finalPoint.material && this.finalPoint.material.opacity > 0) {
            const pulse = 1.0 + Math.sin(time * 4) * 0.12;
            this.finalPoint.scale.set(pulse, pulse, pulse);
        }

        if (this.galaxy) {
            this.galaxy.rotation.y += 0.4 * delta;
        }

        if (this.solarSystem) {
            this.solarSystem.rotation.y += 0.2 * delta;
            for (let i = 1; i <= 4; i++) {
                const planet = this.solarSystem.getObjectByName(`planet_${i}`);
                if (planet) {
                    const speed = (5 - i) * 1.5;
                    const angle = time * speed;
                    const r = i * 0.8;
                    planet.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                }
            }
        }

        if (this.earth) {
            this.earth.rotation.y += 0.3 * delta;
            this.earth.rotation.x += 0.15 * delta;
        }

        if (this.cells) {
            this.cells.children.forEach((c, idx) => {
                const scale = 1.0 + Math.sin(time * 4 + idx) * 0.1;
                c.scale.set(scale, scale, scale);
            });
        }

        if (this.atom) {
            this.atom.rotation.x += 0.5 * delta;
            this.atom.rotation.y += 0.4 * delta;
        }

        if (this.quarks) {
            this.quarks.rotation.z += 2.0 * delta;
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.group.traverse(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.material) {
                    if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
                    else node.material.dispose();
                }
            });
        }
    }
};
