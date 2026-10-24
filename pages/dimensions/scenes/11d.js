window.scenes = window.scenes || {};
window.scenes['11d'] = {
    overlay: null,
    group: null,
    topBrane: null,
    bottomBrane: null,
    flashSphere: null,
    topY: 2.2,
    bottomY: -2.2,
    braneWidth: 15,
    braneLength: 30,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-right';
        this.overlay.id = 'overlay-11d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 11</h1>
            <h2>Membranes</h2>
            <p>Universes float on giant, undulating sheets called membranes, drifting in a higher-dimensional Bulk. When these branes collide, they spark a new Big Bang.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        const planeGeo = new THREE.PlaneGeometry(this.braneWidth, this.braneLength, 15, 30);
        planeGeo.rotateX(-Math.PI / 2);

        const topMat = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        this.topBrane = new THREE.Mesh(planeGeo, topMat);
        this.topBrane.position.set(0, this.topY, -240);
        this.group.add(this.topBrane);

        const bottomMat = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        this.bottomBrane = new THREE.Mesh(planeGeo, bottomMat);
        this.bottomBrane.position.set(0, this.bottomY, -240);
        this.group.add(this.bottomBrane);

        const miniUniGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const uniMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = 0; i < 10; i++) {
            const mUni = new THREE.Mesh(miniUniGeo, uniMat);
            const x = (Math.random() - 0.5) * (this.braneWidth - 2);
            const z = (Math.random() - 0.5) * (this.braneLength - 2);
            mUni.position.set(x, 0.05, z);
            this.topBrane.add(mUni);
        }

        for (let i = 0; i < 10; i++) {
            const mUni = new THREE.Mesh(miniUniGeo, uniMat);
            const x = (Math.random() - 0.5) * (this.braneWidth - 2);
            const z = (Math.random() - 0.5) * (this.braneLength - 2);
            mUni.position.set(x, -0.05, z);
            this.bottomBrane.add(mUni);
        }

        const flashGeo = new THREE.SphereGeometry(0.1, 32, 32);
        const flashMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0
        });
        this.flashSphere = new THREE.Mesh(flashGeo, flashMat);
        this.flashSphere.position.set(0, 0, -245);
        this.group.add(this.flashSphere);

        globalState.scene.add(this.group);
        globalState.braneGroup11D = this.group;
        globalState.flashSphere11D = this.flashSphere;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const stringsGroup = globalState.stringsGroup10D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        if (stringsGroup) {
            const materials = [];
            stringsGroup.traverse(node => {
                if (node.material) materials.push(node.material);
            });
            tl.to(materials, { opacity: 0, duration: 2 }, 0)
              .set(stringsGroup, { visible: false }, 2);
        }

        tl.to(globalState.camera.position, {
            x: 0,
            y: 0,
            z: -245,
            duration: 10,
            ease: "none"
        }, 0);

        tl.to(globalState.camera.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 10
        }, 0);

        tl.to(this, { topY: 0.05, duration: 8.5, ease: "power1.in" }, 0)
          .to(this, { bottomY: -0.05, duration: 8.5, ease: "power1.in" }, 0);

        tl.to(this.flashSphere.material, { 
            opacity: 1, 
            duration: 1.5, 
            ease: "power2.in" 
        }, 8.2)
        .to(this.flashSphere.scale, { 
            x: 400, 
            y: 400, 
            z: 400, 
            duration: 1.8, 
            ease: "power3.in" 
        }, 8.2)
        .to(globalState.bloomPass, { 
            strength: 15, 
            radius: 1.5, 
            duration: 1.8, 
            ease: "power2.in" 
        }, 8.2);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        if (this.topBrane) this.topBrane.position.y = this.topY;
        if (this.bottomBrane) this.bottomBrane.position.y = this.bottomY;

        const undulateBrane = (planeMesh, sign) => {
            const posAttr = planeMesh.geometry.attributes.position;
            const w = this.braneWidth;
            const l = this.braneLength;
            
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i);
                const z = posAttr.getZ(i);
                
                const ripple = Math.sin(x * 0.4 + time * 3) * Math.cos(z * 0.3 + time * 2) * 0.12;
                posAttr.setY(i, ripple);
            }
            posAttr.needsUpdate = true;
        };

        undulateBrane(this.topBrane, 1);
        undulateBrane(this.bottomBrane, -1);
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.topBrane.geometry.dispose();
            this.topBrane.material.dispose();
            this.bottomBrane.geometry.dispose();
            this.bottomBrane.material.dispose();
            this.flashSphere.geometry.dispose();
            this.flashSphere.material.dispose();
        }
    }
};
