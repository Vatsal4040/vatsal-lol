window.scenes = window.scenes || {};
window.scenes['9d'] = {
    overlay: null,
    group: null,
    nodes: [],
    lines: [],
    pulses: [],
    adjacency: [],
    nodeGlows: null,
    shakeIntensity: 0,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-left';
        this.overlay.id = 'overlay-9d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 9</h1>
            <h2>The Cosmic Web</h2>
            <p>Macro-structures connect. Billions of glowing links bridge the clusters, forming a colossal neural network of all possible realities. The individual universes dissolve into the web.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const particleMultiplier = globalState.qualitySettings.particleMultiplier;
        const numNodes = Math.floor(40 * particleMultiplier);
        
        this.nodeGlows = new Float32Array(numNodes);
        this.adjacency = Array.from({ length: numNodes }, () => []);

        const nodePositions = [];
        const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);

        // Generate node grid locations
        for (let i = 0; i < numNodes; i++) {
            const x = (Math.sin(i * 0.9) * 4.5) + (Math.random() - 0.5) * 0.8;
            const y = (Math.cos(i * 1.1) * 3.0) + (Math.random() - 0.5) * 0.6;
            const z = -170 - (i / (numNodes - 1)) * 22; // distribute from -170 to -192
            const pos = new THREE.Vector3(x, y, z);
            nodePositions.push(pos);

            // Separate material per node to support individual glow fading
            const nodeMat = new THREE.MeshBasicMaterial({ 
                color: 0x00f2ff,
                transparent: true,
                opacity: 0.8
            });
            const mesh = new THREE.Mesh(nodeGeo, nodeMat);
            mesh.position.copy(pos);
            mesh.nodeMaterial = nodeMat;

            this.group.add(mesh);
            this.nodes.push(mesh);
        }

        // Connect each node to its 2 nearest neighbors
        const lineMat = new THREE.LineBasicMaterial({ 
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.35
        });

        for (let i = 0; i < numNodes; i++) {
            const p1 = nodePositions[i];
            const distances = [];
            for (let j = 0; j < numNodes; j++) {
                if (i === j) continue;
                distances.push({
                    index: j,
                    dist: p1.distanceTo(nodePositions[j])
                });
            }
            distances.sort((a, b) => a.dist - b.dist);

            // Connect nearest 2 neighbors
            for (let k = 0; k < 2; k++) {
                const neighborIdx = distances[k].index;
                
                // Add adjacency list entries (avoiding duplicates)
                if (!this.adjacency[i].includes(neighborIdx)) {
                    this.adjacency[i].push(neighborIdx);
                }
                if (!this.adjacency[neighborIdx].includes(i)) {
                    this.adjacency[neighborIdx].push(i);
                }

                // Check to prevent drawing duplicate line geometry
                if (i < neighborIdx) {
                    const p2 = nodePositions[neighborIdx];
                    const linePoints = [p1, p2];
                    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
                    const line = new THREE.Line(lineGeo, lineMat);
                    
                    this.group.add(line);
                    this.lines.push(line);
                }
            }
        }

        // Setup sequential neural pulses
        const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const numPulses = Math.floor(15 * particleMultiplier);

        for (let i = 0; i < numPulses; i++) {
            const p = new THREE.Mesh(pulseGeo, pulseMat);
            p.visible = false;
            this.group.add(p);
            
            // Select random starting node and choose one of its neighbors
            const startNode = Math.floor(Math.random() * numNodes);
            const neighbors = this.adjacency[startNode];
            const nextNode = neighbors.length > 0 ? neighbors[Math.floor(Math.random() * neighbors.length)] : startNode;

            this.pulses.push({
                mesh: p,
                currentNode: startNode,
                nextNode: nextNode,
                progress: Math.random(),
                speed: 1.0 + Math.random() * 1.5 // travel speed
            });
        }

        globalState.scene.add(this.group);
        globalState.webGroup9D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const clustersGroup = globalState.clustersGroup8D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (clustersGroup) {
            const materials = [];
            clustersGroup.traverse(node => {
                if (node.material) materials.push(node.material);
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(clustersGroup, { visible: false }, 2);
        }

        // Camera travels into the web
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0,
            z: -190,
            duration: 10,
            ease: "none"
        }, 0);

        // Shake web at the end (vibration starts building up for 10D)
        tl.to(this, {
            shakeIntensity: 0.12,
            duration: 3,
            ease: "power2.in"
        }, 7);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        const numNodes = this.nodes.length;

        // 1. Decelerate/fade active node glows
        for (let i = 0; i < numNodes; i++) {
            if (this.nodeGlows[i] > 0.0) {
                this.nodeGlows[i] -= 2.2 * delta; // Glow decays exponentially
                if (this.nodeGlows[i] < 0.0) this.nodeGlows[i] = 0.0;
            }

            const node = this.nodes[i];
            const glow = this.nodeGlows[i];
            
            // Expand node scale slightly on pulse hit
            const targetScale = 1.0 + glow * 1.5;
            node.scale.set(targetScale, targetScale, targetScale);

            // Shift node color to hot-white cyan on impact
            if (node.nodeMaterial) {
                node.nodeMaterial.color.setRGB(
                    0.0 + glow * 1.0, 
                    0.95 + glow * 0.05, 
                    1.0
                );
            }
        }

        // 2. Animate neural pulses moving from node to node
        this.pulses.forEach(p => {
            p.mesh.visible = true;
            p.progress += p.speed * delta;
            
            const startPos = this.nodes[p.currentNode].position;
            const endPos = this.nodes[p.nextNode].position;
            
            // Linearly interpolate current position
            p.mesh.position.lerpVectors(startPos, endPos, p.progress);
            
            if (p.progress >= 1.0) {
                // Flash destination node
                this.nodeGlows[p.nextNode] = 1.0;
                
                // Route to a random neighbor of nextNode (preventing immediate backtrack)
                const current = p.nextNode;
                const neighbors = this.adjacency[current];
                let next = current;
                if (neighbors.length > 0) {
                    const filtered = neighbors.filter(n => n !== p.currentNode);
                    const list = filtered.length > 0 ? filtered : neighbors;
                    next = list[Math.floor(Math.random() * list.length)];
                }

                p.currentNode = current;
                p.nextNode = next;
                p.progress = 0.0;
            }
        });

        // Apply visual shaking at the end of Act III
        if (this.shakeIntensity > 0) {
            this.nodes.forEach((node, index) => {
                node.position.x += (Math.sin(time * 30 + index) * this.shakeIntensity * delta);
                node.position.y += (Math.cos(time * 25 + index) * this.shakeIntensity * delta);
            });
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.nodes.forEach(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.nodeMaterial) node.nodeMaterial.dispose();
            });
            this.group.traverse(node => {
                if (node.geometry) node.geometry.dispose();
                if (node.material) node.material.dispose();
            });
        }
    }
};
