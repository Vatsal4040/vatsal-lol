window.scenes = window.scenes || {};

// Reusable global helper to create the low-poly floating island
window.createIsland = function({
    season = "peak", // "birth", "growth", "peak", "decay", "memory"
    opacity = 1.0,
    clouds = true,
    water = true,
    life = true
} = {}) {
    const island = new THREE.Group();
    const isTransparent = opacity < 1.0;

    // Rock Base (Inverted Cone)
    const rockGeo = new THREE.ConeGeometry(2, 2.5, 6);
    rockGeo.rotateX(Math.PI);
    
    // Seed-based random noise to ensure exactly identical rock shape
    const pos = rockGeo.attributes.position;
    let seed = 42;
    function random() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
            pos.setX(i, pos.getX(i) + (random() - 0.5) * 0.3);
            pos.setZ(i, pos.getZ(i) + (random() - 0.5) * 0.3);
        }
    }
    rockGeo.computeVertexNormals();

    // Determine colors based on stage/season
    let rockColor = 0x18181c;
    let grassColor = 0x052d3a;
    let waterColor = 0xff00ff;
    let leafColor = 0x00f2ff;
    let leafEmissive = 0x00f2ff;
    let leafIntensity = 0.2;
    let isDecayed = false;
    let isSprout = false;
    let isGrowth = false;
    let isFuture = false;

    if (season === "birth") { 
        grassColor = 0x0c4c47; // Fresh green-teal
        waterColor = 0x00f2ff; // Cyan clear
        leafColor = 0x00f2ff;
        isSprout = true;
    } else if (season === "growth") {
        grassColor = 0x063e48; // Active teal
        waterColor = 0xff00ff; // Glowing magenta
        leafColor = 0x00ffaa; // Vibrant growth green
        isGrowth = true;
    } else if (season === "peak") { // Mature (Bloom)
        grassColor = 0x052d3a; // Deep lush teal
        waterColor = 0xff00ff; // Glowing magenta pool
        leafColor = 0x00f2ff; // Bright neon cyan
    } else if (season === "decay") { // Decay
        grassColor = 0x221d15; // Golden brown/yellow grass
        waterColor = 0xaa00aa; // Deep violet pool
        leafColor = 0xffaa00; // Autumn gold foliage
        leafEmissive = 0xffaa00;
        leafIntensity = 0.1;
    } else if (season === "memory") { // Winter/Void/Death
        rockColor = 0x0c0c0e; // Dark charcoal rock
        grassColor = 0x08080a; // Empty ash
        isDecayed = true;
    } else if (season === "future") { // Decayed future
        rockColor = 0x141416; // Darker rock base
        grassColor = 0x2c251e; // Dried ash/dry land
        isDecayed = false;
        isFuture = true;
    }

    // 1. Rock Base Mesh
    const rockMat = new THREE.MeshStandardMaterial({ 
        color: rockColor, 
        flatShading: true,
        roughness: 0.9,
        transparent: isTransparent,
        opacity: opacity * (isDecayed ? 0.35 : 0.8)
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    rockMesh.position.y = -1.25;
    island.add(rockMesh);

    // 2. Grass Surface
    if (!isDecayed) {
        const grassGeo = new THREE.CylinderGeometry(2, 2, 0.1, 6);
        const grassMat = new THREE.MeshStandardMaterial({ 
            color: grassColor, 
            flatShading: true,
            roughness: 0.8,
            transparent: isTransparent,
            opacity: opacity
        });
        const grassMesh = new THREE.Mesh(grassGeo, grassMat);
        grassMesh.position.y = 0;
        island.add(grassMesh);
    }

    // 3. Stylized Tree
    if (life) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(0.5, 0.05, 0.5);

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 5);
        const trunkMat = new THREE.MeshStandardMaterial({ 
            color: (isDecayed || isFuture) ? 0x1a1a1a : 0x2b1e15, 
            flatShading: true,
            transparent: isTransparent,
            opacity: opacity * ((isDecayed || isFuture) ? 0.65 : 0.8)
        });
        const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
        trunkMesh.position.y = 0.4;
        treeGroup.add(trunkMesh);

        // Foliage (stacked cones) depending on time
        if (!isDecayed && !isFuture) {
            const leafMat = new THREE.MeshStandardMaterial({ 
                color: leafColor, 
                flatShading: true,
                emissive: leafEmissive,
                emissiveIntensity: leafIntensity,
                transparent: isTransparent,
                opacity: opacity * 0.9
            });

            if (isSprout) {
                // Birth: Only 1 small cone (sapling)
                const leafGeo = new THREE.ConeGeometry(0.18, 0.3, 5);
                const leaves = new THREE.Mesh(leafGeo, leafMat);
                leaves.position.y = 0.6;
                treeGroup.add(leaves);
            } else if (isGrowth) {
                // Growth: 2 levels of foliage
                for (let i = 0; i < 2; i++) {
                    const leafGeo = new THREE.ConeGeometry(0.35 - i * 0.08, 0.5, 5);
                    const leaves = new THREE.Mesh(leafGeo, leafMat);
                    leaves.position.y = 0.65 + (i * 0.3);
                    treeGroup.add(leaves);
                }
            } else {
                // Peak & Decay: Full 3 levels of foliage cones
                for (let i = 0; i < 3; i++) {
                    const leafGeo = new THREE.ConeGeometry(0.4 - i * 0.08, 0.6, 5);
                    const leaves = new THREE.Mesh(leafGeo, leafMat);
                    leaves.position.y = 0.7 + (i * 0.35);
                    treeGroup.add(leaves);
                }
            }
        }
        island.add(treeGroup);
    }

    // 4. Low-Poly Mountains
    if (!isDecayed) {
        const mountMat = new THREE.MeshStandardMaterial({ 
            color: 0x0c1e28, 
            flatShading: true,
            transparent: isTransparent,
            opacity: opacity
        });
        const mount1 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 4), mountMat);
        mount1.position.set(-0.8, 0.7, -0.6);
        island.add(mount1);
        
        const mount2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 4), mountMat);
        mount2.position.set(-0.4, 0.45, -1.0);
        island.add(mount2);
    }

    // 5. Water pool
    if (water && !isDecayed && !isFuture) {
        const waterGeo = new THREE.CircleGeometry(0.6, 6);
        const waterMat = new THREE.MeshStandardMaterial({ 
            color: waterColor, 
            roughness: 0.1, 
            metalness: 0.8,
            emissive: waterColor,
            emissiveIntensity: 0.15,
            transparent: isTransparent,
            opacity: opacity * 0.8
        });
        const waterMesh = new THREE.Mesh(waterGeo, waterMat);
        waterMesh.rotation.x = -Math.PI / 2;
        waterMesh.position.set(0.6, 0.06, -0.4);
        island.add(waterMesh);
    }

    // 6. Floating Clouds
    island.cloudsList = [];
    if (clouds && !isDecayed && !isFuture) {
        const cloudMat = new THREE.MeshBasicMaterial({ 
            color: season === "decay" ? 0x888888 : 0xffffff,
            transparent: true,
            opacity: opacity * 0.65
        });
        const cloudGeo = new THREE.DodecahedronGeometry(0.2, 1);
        
        let cloudSeed = 88;
        function cRandom() {
            let x = Math.sin(cloudSeed++) * 10000;
            return x - Math.floor(x);
        }
        for (let i = 0; i < (season === "birth" ? 1 : 3); i++) { 
            const cloud = new THREE.Group();
            cloud.position.set((cRandom() - 0.5) * 3, 1.2 + cRandom() * 0.4, (cRandom() - 0.5) * 3);
            
            for (let j = 0; j < 3; j++) {
                const puff = new THREE.Mesh(cloudGeo, cloudMat);
                puff.position.set(j * 0.15 - 0.15, (cRandom() - 0.5) * 0.05, (cRandom() - 0.5) * 0.05);
                puff.scale.set(1 - j * 0.2, 1 - j * 0.2, 1 - j * 0.2);
                cloud.add(puff);
            }
            island.add(cloud);
            island.cloudsList.push(cloud);
        }
    }

    return island;
};

window.scenes['3d'] = {
    overlay: null,
    group: null,
    island: null,
    worldParticle: null,

    init(globalState) {
        // Create HTML Overlay with two layered sections: narrative and silent pause
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-scene3d';
        this.overlay.innerHTML = `
            <div id="narrative-3d-volume" style="opacity: 1; transition: opacity 0.5s ease;">
                <h1>DIMENSION 3</h1>
                <h2>Volume</h2>
                <p>Depth is unlocked. Height, width, and length. A three-dimensional reality where forms solidify into space.</p>
            </div>
            <div id="narrative-3d-pause" style="opacity: 0; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; width: 80vw; transition: opacity 0.5s ease; pointer-events: none;">
                <h2 style="font-size: 2.2rem; font-weight: 300; letter-spacing: 0.05em; color: #fff;">"Why can't you walk through a wall?"</h2>
            </div>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        // Build the island model at Peak capacity
        this.island = window.createIsland({ season: "peak", opacity: 1.0 });
        this.island.scale.set(0.001, 0.001, 0.001); // Start flat
        this.group.add(this.island);

        // Create the traveler particle as a local glowing firefly orbiting the tree
        const particleGeo = new THREE.SphereGeometry(0.035, 16, 16);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.worldParticle = new THREE.Mesh(particleGeo, particleMat);
        this.worldParticle.position.set(0.5, 0.8, 0.5); // position near tree branches
        this.group.add(this.worldParticle);

        globalState.scene.add(this.group);
        
        globalState.islandGroup3D = this.group;
        globalState.islandModel3D = this.island;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const gridGroup = globalState.gridGroup2D;
        const volumeOverlay = this.overlay.querySelector('#narrative-3d-volume');
        const pauseOverlay = this.overlay.querySelector('#narrative-3d-pause');

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0);

        if (gridGroup) {
            const materials = [];
            gridGroup.traverse((node) => {
                if (node.material) {
                    materials.push(node.material);
                }
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(gridGroup, { visible: false }, 2);
        }

        // Extrude: grow the 3D island out of the center
        tl.to(this.island.scale, { 
            x: 1, 
            y: 1, 
            z: 1, 
            duration: 4, 
            ease: "back.out(1.2)" 
        }, 0.5);

        // Set camera position and rotation at the start of 3D and hold it still
        tl.set(globalState.camera.position, { x: 5, y: 3.5, z: 6.5 }, 0)
          .set(globalState.camera.rotation, { x: -0.4, y: 0.6, z: 0.25 }, 0);

        // Ensure lights and audio are at correct levels throughout
        tl.to(globalState.lights.ambient, { intensity: 0.2, duration: 1.0 }, 0)
          .to(globalState.lights.directional, { intensity: 1.2, duration: 1.0 }, 0)
          .to(globalState.lights.point, { intensity: 0.8, duration: 1.0 }, 0)
          .to(globalState.audio, {
              volume: 0.8,
              duration: 1.0,
              onUpdate: () => {
                  globalState.audio.setVolume(globalState.audio.volume);
              }
          }, 0);

        // --- EMOTIONAL PACING ---
        // 1. Fade out Volume narrative card
        tl.to(volumeOverlay, { opacity: 0, duration: 1.0 }, 3.5);

        // 2. Fade in the silent pause question
        tl.to(pauseOverlay, { opacity: 1, duration: 1.0 }, 4.5);

        // 3. Fade out the silent pause question
        tl.to(pauseOverlay, { opacity: 0, duration: 1.0 }, 7.0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        if (this.island) {
            // Calm, slow rotation and slight bobbing
            this.island.rotation.y = time * 0.03;
            this.island.position.y = Math.sin(time * 0.6) * 0.05;

            // Water shimmer effect: modulate emissiveIntensity of CircleGeometry
            const waterMesh = this.island.children.find(c => c.geometry && c.geometry.type === 'CircleGeometry');
            if (waterMesh && waterMesh.material) {
                waterMesh.material.emissiveIntensity = 0.1 + Math.sin(time * 1.5) * 0.06;
            }
        }

        // Make traveler particle drift around the tree branches gently
        if (this.worldParticle) {
            this.worldParticle.position.x = 0.5 + Math.sin(time * 2.0) * 0.55;
            this.worldParticle.position.y = 0.75 + Math.sin(time * 3.0) * 0.18;
            this.worldParticle.position.z = 0.5 + Math.cos(time * 2.0) * 0.55;
        }

        // Animate clouds orbiting the island slowly
        if (this.island && this.island.cloudsList) {
            this.island.cloudsList.forEach((cloud, index) => {
                const angle = time * 0.04 + (index * Math.PI / 3);
                const radius = 2.4 + Math.sin(time * 0.5) * 0.3;
                cloud.position.x = Math.sin(angle) * radius;
                cloud.position.z = Math.cos(angle) * radius;
            });
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
