window.scenes = window.scenes || {};
window.scenes['5d'] = {
    overlay: null,
    group: null,
    branchesGroup: null,
    particles: [],
    branchPaths: [],

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-left';
        this.overlay.id = 'overlay-5d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 5</h1>
            <h2>Choices</h2>
            <p>Every choice branches reality. Infinite potential futures split from a single trunk, weaving a tree of alternative possibilities.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        // Create branches group and position it at the end of the 4D timeline (Z = -36)
        this.branchesGroup = new THREE.Group();
        this.branchesGroup.position.set(0, 0.8, -36);
        this.branchesGroup.scale.set(0.001, 0.001, 0.001); // start collapsed
        this.group.add(this.branchesGroup);

        this.validBranches = [];
        this.branchPaths = [];

        // Generate branches recursively starting from relative origin (0, 0, 0)
        const root = new THREE.Vector3(0, 0, 0);
        this.generateBranches(root, new THREE.Vector3(0, 0, -1), 6, 5, 0.45);

        // Position Choice Labels dynamically relative to the branches
        const choiceWords = [
            "Study", "Travel", "Stay", "Move", "Create", "Build", 
            "Help", "Ignore", "Accept", "Leave", "Discover", "Invent", 
            "Explore", "Risk", "Wait", "Change", "Return", "Learn", 
            "Teach", "Dream"
        ];

        let labelSeed = 42;
        function lRandom() {
            let x = Math.sin(labelSeed++) * 10000;
            return x - Math.floor(x);
        }

        // Gather branches of different depths
        const depth4 = this.validBranches.filter(b => b.depth === 4);
        const depth3 = this.validBranches.filter(b => b.depth === 3);
        const depth2 = this.validBranches.filter(b => b.depth === 2);
        const depth1 = this.validBranches.filter(b => b.depth === 1);

        // Select exactly 20 branches spread out
        const selectedBranches = [
            depth4[0 % depth4.length], depth4[2 % depth4.length],
            depth3[1 % depth3.length], depth3[3 % depth3.length], depth3[5 % depth3.length], depth3[7 % depth3.length],
            depth2[2 % depth2.length], depth2[6 % depth2.length], depth2[10 % depth2.length], depth2[14 % depth2.length], depth2[18 % depth2.length], depth2[22 % depth2.length], depth2[26 % depth2.length],
            depth1[4 % depth1.length], depth1[12 % depth1.length], depth1[20 % depth1.length], depth1[28 % depth1.length], depth1[36 % depth1.length], depth1[44 % depth1.length], depth1[52 % depth1.length]
        ].filter(Boolean);

        selectedBranches.forEach((branch, wordIdx) => {
            const word = choiceWords[wordIdx % choiceWords.length];
            const sprite = this.createTextSprite(word);
            
            // Get midpoint in local coordinates of branchesGroup
            const midpoint = new THREE.Vector3().addVectors(branch.start, branch.end).multiplyScalar(0.5);
            
            // Add a small random offset so it doesn't sit exactly on the line
            midpoint.x += (lRandom() - 0.5) * 0.45;
            midpoint.y += (lRandom() - 0.5) * 0.45;
            midpoint.z += (lRandom() - 0.5) * 0.15;
            
            sprite.position.copy(midpoint);
            sprite.material.opacity = 0; // starts invisible, animated in timeline
            
            // Add directly to branchesGroup so it grows/scales with the tree
            this.branchesGroup.add(sprite);
        });

        // Set up glowing choice particles
        const particleMultiplier = globalState.qualitySettings.particleMultiplier;
        const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        const numParticles = Math.floor(20 * particleMultiplier);
        for (let i = 0; i < numParticles; i++) {
            const particle = new THREE.Mesh(particleGeo, particleMat);
            particle.visible = false;
            this.group.add(particle);
            
            this.particles.push({
                mesh: particle,
                pathIndex: Math.floor(Math.random() * this.branchPaths.length),
                progress: Math.random(),
                speed: 0.15 + Math.random() * 0.15
            });
        }

        globalState.scene.add(this.group);
        globalState.treeGroup5D = this.group;
        globalState.treeBranches5D = this.branchesGroup;
    },

    generateBranches(start, dir, length, depth, spread) {
        if (depth === 0) {
            this.branchPaths.push([start.clone()]);
            return;
        }

        const end = start.clone().add(dir.clone().multiplyScalar(length));
        
        const points = [start, end];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: depth % 2 === 0 ? 0x00f2ff : 0xff00ff,
            transparent: true,
            opacity: 0.65
        });
        const branchLine = new THREE.Line(lineGeo, lineMat);
        this.branchesGroup.add(branchLine);

        // Save this branch segment details
        this.validBranches.push({
            start: start.clone(),
            end: end.clone(),
            depth: depth
        });

        this.branchPaths.push([start.clone(), end.clone()]);

        const numBranches = depth > 2 ? 3 : 2;
        for (let i = 0; i < numBranches; i++) {
            const angle = (i * (Math.PI * 2) / numBranches) + (depth * 0.5);
            
            let perp = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
            perp.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir));
            
            const nextDir = dir.clone().multiplyScalar(1 - spread).add(perp.multiplyScalar(spread)).normalize();
            this.generateBranches(end, nextDir, length * 0.75, depth - 1, spread * 1.1);
        }
    },

    createTextSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, 256, 64);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle neon glow to canvas text
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 10;
        ctx.fillText(text, 128, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
            map: texture, 
            transparent: true,
            opacity: 0.0 // starts invisible, animated via timeline
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2.0, 0.5, 1.0);
        return sprite;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const timelineGroup4D = globalState.timelineGroup4D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (timelineGroup4D) {
            tl.set(timelineGroup4D, { visible: false }, 0);
        }

        // Animate the tree branches growing out of the timeline point
        tl.fromTo(this.branchesGroup.scale, 
            { x: 0.001, y: 0.001, z: 0.001 }, 
            { x: 1, y: 1, z: 1, duration: 6, ease: "power2.out" }, 
            1
        );

        // Fade in choice text sprites early in the timeline
        const sprites = [];
        this.group.traverse(node => {
            if (node instanceof THREE.Sprite) {
                sprites.push(node.material);
            }
        });
        tl.to(sprites, { opacity: 0.85, duration: 2 }, 1);

        // Reset camera position and rotation at the start of 5D
        tl.set(globalState.camera.position, { x: 0, y: 0.8, z: -35.0 }, 0)
          .set(globalState.camera.rotation, { x: 0, y: 0, z: 0 }, 0);

        // Move camera down Z-axis past branches
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0.8,
            z: -56,
            duration: 10,
            ease: "none"
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        // Animate floating choice particles moving along paths
        this.particles.forEach(p => {
            p.mesh.visible = true;
            p.progress += p.speed * delta;
            if (p.progress >= 1.0) {
                p.progress = 0;
                p.pathIndex = Math.floor(Math.random() * this.branchPaths.length);
            }

            const path = this.branchPaths[p.pathIndex];
            if (path && path.length >= 2) {
                const globalRoot = new THREE.Vector3(0, 0.8, -36);
                const localStart = path[0];
                const localEnd = path[1];
                const currentPos = new THREE.Vector3().lerpVectors(localStart, localEnd, p.progress);
                
                // Add the tree's global position offset
                currentPos.add(globalRoot);
                p.mesh.position.copy(currentPos);
            }
        });
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.branchesGroup.traverse(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.material) node.material.dispose();
            });
            this.group.traverse(node => {
                if (node instanceof THREE.Sprite) {
                    node.material.map.dispose();
                    node.material.dispose();
                } else if (node.geometry) {
                    node.geometry.dispose();
                    if (node.material) node.material.dispose();
                }
            });
        }
    }
};
