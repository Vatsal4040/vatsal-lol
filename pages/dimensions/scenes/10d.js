window.scenes = window.scenes || {};
window.scenes['10d'] = {
    overlay: null,
    group: null,
    strings: [],
    galaxyPositions: [], // Start coordinates (spiral galaxy)
    stringPositions: [], // Target coordinates (parallel strings)
    progress: 0.0,      // GSAP-driven non-linear morph progress
    numPointsPerString: 30,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-10d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 10</h1>
            <h2>Vibrating Strings</h2>
            <p>Reality dissolves. Particles melt into threads of pure energy. Space becomes a symphony of strings, vibrating at different frequencies to compose the fabric of existence.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const zStart = -190;
        const zEnd = -218;
        
        const cols = 6;
        const rows = 5;
        const totalStrings = cols * rows; // 30 strings total

        // 1. Generate Start Positions (flat spiral galaxy centered at Z = -204)
        let seed = 99;
        function random() {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        for (let c = 0; c < totalStrings; c++) {
            const stringIdx = c;
            for (let i = 0; i < this.numPointsPerString; i++) {
                const vertexIdx = i;

                // Spiral Galaxy Math
                const r = (stringIdx / (totalStrings - 1)) * 3.0 + (vertexIdx / (this.numPointsPerString - 1)) * 0.5;
                const theta = r * 7.5 + (stringIdx * 0.1) + (vertexIdx * 0.04);
                const gx = Math.cos(theta) * r;
                const gy = Math.sin(theta) * r;
                // Add a small initial Z dispersion
                const gz = -196.0 + (random() - 0.5) * 1.5;

                this.galaxyPositions.push(new THREE.Vector3(gx, gy, gz));

                // 2. Generate Target Positions (parallel strings grid along Z)
                const sx = ((stringIdx % cols) - (cols - 1) / 2) * 1.1;
                const sy = (Math.floor(stringIdx / cols) - (rows - 1) / 2) * 0.9;
                const sz = zStart + (vertexIdx / (this.numPointsPerString - 1)) * (zEnd - zStart);

                this.stringPositions.push(new THREE.Vector3(sx, sy, sz));
            }
        }

        // Create the 30 Line meshes
        for (let c = 0; c < totalStrings; c++) {
            const points = [];
            // Load initial geometry points
            for (let i = 0; i < this.numPointsPerString; i++) {
                const idx = c * this.numPointsPerString + i;
                points.push(this.galaxyPositions[idx].clone());
            }

            const stringGeo = new THREE.BufferGeometry().setFromPoints(points);
            const color = c % 2 === 0 ? 0xff00ff : 0x00f2ff;
            const stringMat = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });

            const line = new THREE.Line(stringGeo, stringMat);
            this.group.add(line);

            this.strings.push({
                mesh: line,
                color: color,
                phaseOffset: Math.random() * Math.PI * 2,
                frequency: 8 + Math.random() * 8,
                amplitude: 0.08 + Math.random() * 0.12
            });
        }

        globalState.scene.add(this.group);
        globalState.stringsGroup10D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const webGroup = globalState.webGroup9D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        // Hide neural web
        if (webGroup) {
            const materials = [];
            webGroup.traverse(node => {
                if (node.material) materials.push(node.material);
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(webGroup, { visible: false }, 2);
        }

        // Non-linear collapse morph progress (starts slow, then snaps)
        tl.fromTo(this, 
            { progress: 0.0 }, 
            { progress: 1.0, duration: 10, ease: "power4.in" }, 
            0
        );

        // Camera flies down the string tunnel
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0,
            z: -216,
            duration: 10,
            ease: "none"
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        const totalStrings = this.strings.length;
        const pLen = this.numPointsPerString;

        // Slow galaxy rotation at start, stops as morph progress nears completion
        const rotAngle = time * 0.35 * (1.0 - this.progress);

        for (let c = 0; c < totalStrings; c++) {
            const string = this.strings[c];
            const posAttr = string.mesh.geometry.attributes.position;

            for (let i = 0; i < pLen; i++) {
                const idx = c * pLen + i;
                const gPos = this.galaxyPositions[idx];
                const sPos = this.stringPositions[idx];

                // 1. Rotate start coordinates representing the galaxy spin
                const rx = gPos.x * Math.cos(rotAngle) - gPos.y * Math.sin(rotAngle);
                const ry = gPos.x * Math.sin(rotAngle) + gPos.y * Math.cos(rotAngle);

                // 2. Interpolate from galaxy to parallel strings based on progress
                const px = THREE.MathUtils.lerp(rx, sPos.x, this.progress);
                const py = THREE.MathUtils.lerp(ry, sPos.y, this.progress);
                const pz = THREE.MathUtils.lerp(gPos.z, sPos.z, this.progress);

                // 3. Apply standing-wave sine ripple vibration (stronger as strings solidify)
                const phase = time * string.frequency + i * 0.4 + string.phaseOffset;
                const vibrationAmp = string.amplitude * this.progress;
                const wave = Math.sin(phase) * vibrationAmp;

                posAttr.setXYZ(i, px + wave, py + wave, pz);
            }
            posAttr.needsUpdate = true;

            // Trigger random audio plucks during collapse
            if (this.progress > 0.6 && Math.random() < 0.015) {
                const pitch = 110 * (Math.floor(Math.random() * 4) + 1);
                globalState.audio.triggerStringPluck(pitch);
            }
        }
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.strings.forEach(string => {
                string.mesh.geometry.dispose();
                string.mesh.material.dispose();
            });
        }
    }
};
