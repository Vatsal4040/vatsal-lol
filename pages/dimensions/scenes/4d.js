window.scenes = window.scenes || {};
window.scenes['4d'] = {
    overlay: null,
    group: null,
    islands: [],
    timelineLine: null,

    init(globalState) {
        // Create HTML Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'poster layout-center';
        this.overlay.id = 'overlay-4d';
        this.overlay.innerHTML = `
            <h1>DIMENSION 4</h1>
            <h2>Time</h2>
            <p>Time becomes a spatial axis. See the past, present, and future existing simultaneously. The camera tracks through slices of history.</p>
        `;
        globalState.hudContainer.appendChild(this.overlay);

        this.group = new THREE.Group();
        this.group.visible = false;

        // Create the 4D timeline axis line
        const linePoints = [
            new THREE.Vector3(0, 0.8, 10),
            new THREE.Vector3(0, 0.8, -40)
        ];
        const timelineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const timelineMat = new THREE.LineBasicMaterial({ 
            color: 0xff00ff,
            transparent: true,
            opacity: 0.6
        });
        this.timelineLine = new THREE.Line(timelineGeo, timelineMat);
        this.group.add(this.timelineLine);

        // Add exactly 3 islands along the Z-axis representing Past, Present, Future
        const islandZPositions = [0, -12, -24];
        const seasons = ["birth", "peak", "future"];

        islandZPositions.forEach((z, index) => {
            const tempIsland = window.createIsland({ 
                season: seasons[index], 
                opacity: 0.65, // translucent ghost appearance
                clouds: true,
                water: true,
                life: true
            });
            tempIsland.position.set(0, 0, z);
            tempIsland.scale.set(0.001, 0.001, 0.001); // start collapsed
            
            this.group.add(tempIsland);
            this.islands.push(tempIsland);
        });

        globalState.scene.add(this.group);
        globalState.timelineGroup4D = this.group;
    },

    getTimeline(globalState) {
        const tl = gsap.timeline({
            defaults: { duration: 10, ease: "power1.inOut" }
        });

        const islandGroup3D = globalState.islandGroup3D;

        tl.set(this.group, { visible: true }, 0)
          .fromTo(this.overlay, { opacity: 0, y: 0 }, { opacity: 1, y: 0, duration: 3 }, 0)
          .to(this.overlay, { opacity: 0, y: -30, duration: 3 }, 7);

        // Fade out previous 3D island group if present
        if (islandGroup3D) {
            tl.set(islandGroup3D, { visible: false }, 0);
        }

        // Turn the lights and audio synthesizer back on at the start of 4D
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

        // Animate the 4D temporal slices popping into view sequentially
        this.islands.forEach((island, index) => {
            tl.to(island.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 2.5,
                ease: "back.out(1.2)"
            }, 0.5 + index * 1.2);
        });

        // Setup initial camera position/rotation (original path, zoomed out using fov)
        tl.set(globalState.camera.position, { x: 0, y: 0.8, z: 10 }, 0)
          .set(globalState.camera.rotation, { x: 0, y: 0, z: 0 }, 0)
          .set(globalState.camera, { fov: 55 }, 0)
          .call(() => globalState.camera.updateProjectionMatrix(), null, 0);

        // Fly the camera straight down the Z-axis, passing through the temporal slices
        tl.to(globalState.camera.position, {
            x: 0,
            y: 0.8,
            z: -35,
            duration: 10,
            ease: "none"
        }, 0);

        // Reset camera rotations to face straight ahead along Z
        tl.to(globalState.camera.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 5
        }, 0);

        return tl;
    },

    animate(time, delta, globalState) {
        if (!this.group || !this.group.visible) return;

        this.islands.forEach((island, index) => {
            // Calm rotation
            island.rotation.y = time * 0.05;
            
            if (island.cloudsList) {
                island.cloudsList.forEach((cloud, cIdx) => {
                    const angle = time * (0.04 + index * 0.01) + (cIdx * Math.PI / 3);
                    const radius = 2.4 + Math.sin(time * 0.5 + index) * 0.3;
                    cloud.position.x = Math.sin(angle) * radius;
                    cloud.position.z = Math.cos(angle) * radius;
                });
            }
        });
    },

    cleanup(globalState) {
        if (this.overlay) this.overlay.remove();
        if (this.group) {
            globalState.scene.remove(this.group);
            this.islands.forEach(island => {
                island.traverse(node => {
                    if (node.geometry) node.geometry.dispose();
                    if (node.material) {
                        if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
                        else node.material.dispose();
                    }
                });
            });
        }
    }
};
