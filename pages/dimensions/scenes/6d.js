window.scenes = window.scenes || {};
window.scenes['6d'] = {
    overlay: null,
    group: null,
    universes: [],

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-right';
        this.overlay.id = 'overlay-6d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 6</h1>
            <h2>Parallel Universes</h2>
            <p>Every decision branch expands into an entire pocket universe. Countless bubbles, each harboring distinct galaxies, colors, and histories.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const usePhysical = globalState.qualitySettings.usePhysicalMaterial;
        const particleMultiplier = globalState.qualitySettings.particleMultiplier;

        // Big bubble geometry
        const bubbleGeo = new THREE.SphereGeometry(1.2, 24, 24);
        
        // Define colors: 10 neutrals (greys/whites), 1 gold, 1 purple
        const colors = [
            new THREE.Color(0xefefef), new THREE.Color(0xf5f5f5), new THREE.Color(0xe0e0e0),
            new THREE.Color(0xffffff), new THREE.Color(0xdadada), new THREE.Color(0xebebeb),
            new THREE.Color(0xffd700), // Gold (Index 6)
            new THREE.Color(0xefefef), new THREE.Color(0xf0f0f0), new THREE.Color(0xbf55ec), // Purple (Index 9)
            new THREE.Color(0xe3e3e3), new THREE.Color(0xf7f7f7)
        ];

        // 30 bubbles distributed in layered depth (5 large, 10 medium, 15 small)
        let bubbleSeed = 99;
        function bRandom() {
            let x = Math.sin(bubbleSeed++) * 10000;
            return x - Math.floor(x);
        }

        const numBubbles = 30;
        for (let i = 0; i < numBubbles; i++) {
            let sizeCategory, scale, rotSpeed, driftSpeed, uniGroupRotSpeed;
            
            // Distribute sizes: 5 large, 10 medium, 15 small
            if (i < 5) {
                sizeCategory = "large";
                scale = 1.4 + bRandom() * 0.4; // 1.4 to 1.8
                rotSpeed = 0.02 + bRandom() * 0.02;
                driftSpeed = 0.0003;
                uniGroupRotSpeed = 0.003;
            } else if (i < 15) {
                sizeCategory = "medium";
                scale = 0.8 + bRandom() * 0.3; // 0.8 to 1.1
                rotSpeed = 0.05 + bRandom() * 0.04;
                driftSpeed = 0.0008;
                uniGroupRotSpeed = 0.008;
            } else {
                sizeCategory = "small";
                scale = 0.25 + bRandom() * 0.35; // 0.25 to 0.6
                rotSpeed = 0.08 + bRandom() * 0.06;
                driftSpeed = 0.0012;
                uniGroupRotSpeed = 0.012;
            }

            // Distribute along Z from -53 to -93 (camera travels from -56 to -82)
            const z = -53 - (i / numBubbles) * 40 + (bRandom() - 0.5) * 2;

            // Generate X and Y, checking for camera collision
            let x = 0, y = 0.8;
            let collision = true;
            let attempts = 0;
            
            while (collision && attempts < 100) {
                attempts++;
                // Generate based on Z depth to keep within viewport
                const depthFactor = Math.abs(z - (-56)); // distance from camera start
                const maxX = 1.2 + depthFactor * 0.16;
                const maxY = 0.8 + depthFactor * 0.08;
                
                x = (bRandom() - 0.5) * 2 * maxX;
                y = 0.8 + (bRandom() - 0.5) * 2 * maxY;

                // Check distance from camera line (0, 0.8)
                const distToCameraPath = Math.sqrt(x * x + (y - 0.8) * (y - 0.8));
                const minDistance = scale * 1.2 + 0.4; // bubble radius + buffer
                
                if (distToCameraPath > minDistance) {
                    collision = false;
                }
            }

            const uniGroup = new THREE.Group();
            uniGroup.position.set(x, y, z);
            uniGroup.scale.set(scale, scale, scale);

            // Define colors: 2 gold (i = 6, 18), 1 purple (i = 12), others shades of white/grey
            const bubbleColor = (i === 6 || i === 18) ? new THREE.Color(0xffd700) : // Gold
                                (i === 12) ? new THREE.Color(0xbf55ec) : // Purple
                                new THREE.Color(0xefefef).lerp(new THREE.Color(0xffffff), bRandom());
            
            // Use advanced physical material for glass soap-bubble refraction
            let bubbleMat;
            if (usePhysical) {
                bubbleMat = new THREE.MeshPhysicalMaterial({ 
                    color: bubbleColor,
                    transparent: true,
                    opacity: 0.16,
                    roughness: 0.05,
                    metalness: 0.1,
                    transmission: 0.9,
                    ior: 1.33,
                    thickness: 0.5,
                    side: THREE.DoubleSide
                });
            } else {
                bubbleMat = new THREE.MeshStandardMaterial({ 
                    color: bubbleColor,
                    transparent: true,
                    opacity: 0.35,
                    roughness: 0.25,
                    metalness: 0.7,
                    flatShading: true
                });
            }

            const shell = new THREE.Mesh(bubbleGeo, bubbleMat);
            uniGroup.add(shell);

            // Generate detailed mini galaxy (star count proportional to size category)
            const baseStars = sizeCategory === "large" ? 400 :
                              sizeCategory === "medium" ? 200 : 80;
            const numStars = Math.floor(baseStars * particleMultiplier);
            const galaxy = this.createMiniGalaxy(bubbleColor, numStars);
            uniGroup.add(galaxy);

            this.group.add(uniGroup);
            this.universes.push({
                group: uniGroup,
                galaxy: galaxy,
                rotSpeed: rotSpeed,
                uniGroupRotSpeed: uniGroupRotSpeed,
                driftSpeed: driftSpeed,
                hoverOffset: bRandom() * Math.PI * 2
            });
        }

        globalState.scene.add(this.group);
        globalState.universeGroup6D = this.group;
    },

    createMiniGalaxy(color, numStars) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(numStars * 3);
        const colors = new Float32Array(numStars * 3);
        
        for (let i = 0; i < numStars; i++) {
            // Spiral arms math
            const r = Math.random() * 0.95;
            const theta = r * 14 + Math.random() * 0.6;
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = (Math.random() - 0.5) * 0.08;
            
            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
            
            // Core is brighter, arms take bubble color
            const factor = Math.random();
            const starColor = color.clone().lerp(new THREE.Color(0xffffff), 1.0 - factor * 0.8);
            colors[i*3] = starColor.r;
            colors[i*3+1] = starColor.g;
            colors[i*3+2] = starColor.b;
        }
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const mat = new THREE.PointsMaterial({
            size: 0.045,
            vertexColors: true,
            transparent: true,
            opacity: 0.95
        });
        return new THREE.Points(geom, mat);
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const treeGroup = globalState.treeGroup5D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (treeGroup) {
            const materials = [];
            treeGroup.traverse(node => {
                if (node.material) materials.push(node.material);
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(treeGroup, { visible: false }, 2);
        }

        // Reset camera position and rotation at the start of 6D
        tl.set(globalState.camera.position, { x: 0, y: 0.8, z: -56.0 }, 0)
          .set(globalState.camera.rotation, { x: 0, y: 0, z: 0 }, 0);

        // Camera flies past the 12 large soap bubble universes
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0.8,
            z: -82,
            duration: 10,
            ease: "none"
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // Slow, beautiful rotation of the universes and their galaxies based on size category
        this.universes.forEach(uni => {
            uni.group.rotation.y = time * uni.uniGroupRotSpeed;
            uni.galaxy.rotation.y += uni.rotSpeed * delta;
            
            // Apply drift/hovering translation if applicable
            if (uni.driftSpeed > 0) {
                uni.group.position.y += Math.sin(time * 1.5 + uni.hoverOffset) * uni.driftSpeed;
            }
        });
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.universes.forEach(uni => {
                uni.group.traverse(node => {
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) node.material.dispose();
                });
            });
        }
    }
};
