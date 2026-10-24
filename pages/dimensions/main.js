// main.js - The Cinematic Orchestrator for DIMENSIONS

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global experience state
const globalState = {
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    bloomPass: null,
    hudContainer: document.getElementById('narrative-container'),
    audio: new window.AudioEngine(),
    width: window.innerWidth,
    height: window.innerHeight,
    activeSceneIndex: 0,
    masterTimeline: null,
    lights: {}
};

// Scene array mapping to our stages
const scenes = [
    window.scenes.intro,
    window.scenes['0d'],
    window.scenes['1d'],
    window.scenes['2d'],
    window.scenes['3d'],
    window.scenes['4d'],
    window.scenes['5d'],
    window.scenes['6d'],
    window.scenes['7d'],
    window.scenes['8d'],
    window.scenes['9d'],
    window.scenes['10d'],
    window.scenes['11d'],
    window.scenes.ending
];

// UI element mappings
const elements = {
    loader: document.getElementById('loader'),
    btnEnter: document.getElementById('btn-enter'),
    btnAudio: document.getElementById('btn-audio-toggle'),
    audioStatusText: document.getElementById('audio-status-text'),
    audioIconMuted: document.getElementById('audio-icon-muted'),
    audioIconUnmuted: document.getElementById('audio-icon-unmuted'),
    progressBar: document.getElementById('hud-progress-bar'),
    dimNum: document.getElementById('active-dimension-num'),
    dimName: document.getElementById('active-dimension-name'),
    actName: document.getElementById('active-act-name')
};

// Start initialization on window load
window.addEventListener('DOMContentLoaded', init);

function detectQuality() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let isLowEnd = false;
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
                if (renderer.toLowerCase().includes('intel') || 
                    renderer.toLowerCase().includes('swiftshader') || 
                    renderer.toLowerCase().includes('basic render')) {
                    isLowEnd = true;
                }
            }
        }
    } catch(e) {}
    return (isMobile || isLowEnd) ? 'standard' : 'ultra';
}

function init() {
    globalState.quality = detectQuality();
    globalState.qualitySettings = {
        particleMultiplier: globalState.quality === 'standard' ? 0.35 : 1.0,
        usePhysicalMaterial: globalState.quality === 'standard' ? false : true,
        bloomStrength: globalState.quality === 'standard' ? 0.8 : 1.5,
        bloomRadius: globalState.quality === 'standard' ? 0.25 : 0.4
    };

    setupThree();
    setupLights();
    setupScenes();
    setupOrchestration();
    setupEvents();
    
    // Start rendering loop
    requestAnimationFrame(render);
}

function setupThree() {
    const canvas = document.getElementById('webgl-canvas');
    
    // Renderer
    globalState.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        powerPreference: "high-performance",
        alpha: false
    });
    // Smoothness: cap renderer pixel ratio at 1.5 on mobile (keep 2 on desktop)
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const maxPixelRatio = isMobileDevice ? 1.5 : 2.0;
    globalState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    globalState.renderer.setSize(globalState.width, globalState.height);
    globalState.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    globalState.renderer.toneMappingExposure = 1.0;
    
    // Scene
    globalState.scene = new THREE.Scene();
    globalState.scene.fog = new THREE.FogExp2(0x000000, 0.015);
    
    // Camera
    globalState.camera = new THREE.PerspectiveCamera(45, globalState.width / globalState.height, 0.1, 1000);
    globalState.camera.position.set(0, 0, 10);
    globalState.scene.add(globalState.camera); // Add camera to scene
    
    // Post-processing Effect Composer
    const renderPass = new THREE.RenderPass(globalState.scene, globalState.camera);
    
    // Cyberpunk Neon Glow Bloom (uses quality settings)
    globalState.bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(globalState.width, globalState.height),
        globalState.qualitySettings.bloomStrength,   // Strength
        globalState.qualitySettings.bloomRadius,     // Radius
        0.85   // Threshold
    );
    
    globalState.composer = new THREE.EffectComposer(globalState.renderer);
    globalState.composer.addPass(renderPass);
    globalState.composer.addPass(globalState.bloomPass);
}

function setupLights() {
    // Ambient light for general soft illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    globalState.scene.add(ambientLight);
    globalState.lights.ambient = ambientLight;
    
    // Key directional light for shadows/islands
    const dirLight = new THREE.DirectionalLight(0x00f2ff, 1.2);
    dirLight.position.set(5, 15, 10);
    globalState.scene.add(dirLight);
    globalState.lights.directional = dirLight;
    
    // Soft point light for neon color mixing
    const pointLight = new THREE.PointLight(0xff00ff, 0.8, 100);
    pointLight.position.set(-10, 5, -15);
    globalState.scene.add(pointLight);
    globalState.lights.point = pointLight;
}

function setupScenes() {
    // Initialize each scene module. They will append their dynamically created HTML overlays,
    // generate Three.js meshes, and set up state.
    scenes.forEach((sceneModule) => {
        sceneModule.init(globalState);
    });
}

function setupOrchestration() {
    // Chained GSAP master timeline driven by ScrollTrigger
    const masterTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: '#scroll-engine',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
            onUpdate: (self) => {
                const progress = self.progress;
                
                // Update HUD Progress bar
                elements.progressBar.style.width = (progress * 100) + '%';
                
                // Calculate current timeline time:
                // Earlier 13 scenes each have duration 10 (0 - 130), ending scene is 130 - 146
                const totalDuration = masterTimeline.totalDuration() || 146;
                const currentTime = progress * totalDuration;
                
                const numScenes = scenes.length;
                const activeIndex = currentTime < 130 
                    ? Math.min(Math.floor(currentTime / 10), numScenes - 2)
                    : numScenes - 1;
                
                if (activeIndex !== globalState.activeSceneIndex) {
                    updateActiveSceneUI(activeIndex);
                }
                
                // Update HUD for ending scene credits:
                // Credits fade in at ending timeline t = 12.2s (master timeline t = 142.2s)
                if (activeIndex === 13) {
                    if (currentTime >= 142.2) {
                        elements.dimNum.textContent = "∞";
                        elements.dimName.textContent = "THE LOOP";
                    } else {
                        elements.dimNum.textContent = "BEYOND";
                        elements.dimName.textContent = "THE UNKNOWN";
                    }
                }
                
                // Tell audio engine to update synthesis parameters
                // For earlier scenes (0-12), audioProgress matches original 1/14th per scene
                const audioProgress = Math.min(currentTime / 140, 1.0);
                globalState.audio.setScrollProgress(audioProgress, activeIndex);
            }
        }
    });

    // Add each scene's timeline sequentially.
    // Scenes 0-12 have duration 10, ending scene has duration 16.
    scenes.forEach((sceneModule) => {
        const sceneTl = sceneModule.getTimeline(globalState);
        masterTimeline.add(sceneTl);
    });

    globalState.masterTimeline = masterTimeline;
}

function updateActiveSceneUI(index) {
    globalState.activeSceneIndex = index;
    
    // Update Act Name
    let actText = "ACT I: THE PHYSICAL REALMS";
    if (index >= 5 && index <= 7) {
        actText = "ACT II: TIME & POSSIBILITY";
    } else if (index >= 8 && index <= 10) {
        actText = "ACT III: THE MULTIVERSE";
    } else if (index >= 11) {
        actText = "ACT IV: THE QUANTUM STRINGS";
    }
    elements.actName.textContent = actText;
    
    // Update header labels
    const stageTitles = [
        { num: 'INTRO', name: 'THE VOID' },
        { num: '0D', name: 'EXISTENCE' },
        { num: '1D', name: 'MOVEMENT' },
        { num: '2D', name: 'AREA' },
        { num: '3D', name: 'VOLUME' },
        { num: '4D', name: 'TIME' },
        { num: '5D', name: 'CHOICES' },
        { num: '6D', name: 'PARALLEL UNIVERSES' },
        { num: '7D', name: 'DIFFERENT LAWS' },
        { num: '8D', name: 'CLUSTERS' },
        { num: '9D', name: 'CONNECTIONS' },
        { num: '10D', name: 'VIBRATIONS' },
        { num: '11D', name: 'MEMBRANES' },
        { num: 'BEYOND', name: 'THE UNKNOWN' }
    ];
    
    const activeTitle = stageTitles[index] || { num: 'N/A', name: 'UNKNOWN' };
    elements.dimNum.textContent = activeTitle.num;
    elements.dimName.textContent = activeTitle.name;
    
}

function setupEvents() {
    // 1. Enter Experience Button
    elements.btnEnter.addEventListener('click', () => {
        // Initialize Audio context on interaction
        globalState.audio.init();
        globalState.audio.unmute();
        
        // Update audio UI
        elements.audioIconMuted.classList.add('hidden');
        elements.audioIconUnmuted.classList.remove('hidden');
        elements.audioStatusText.textContent = "AUDIO ON";
        elements.btnAudio.classList.remove('muted');
        
        // Fade out loader
        elements.loader.classList.remove('active');
        
        // Reset scroll position to top
        window.scrollTo(0, 0);
        
        // Initial UI sync
        updateActiveSceneUI(0);
    });

    // 2. Audio Toggle Button
    elements.btnAudio.addEventListener('click', () => {
        if (globalState.audio.isMuted) {
            globalState.audio.unmute();
            elements.audioIconMuted.classList.add('hidden');
            elements.audioIconUnmuted.classList.remove('hidden');
            elements.audioStatusText.textContent = "AUDIO ON";
            elements.btnAudio.classList.remove('muted');
        } else {
            globalState.audio.mute();
            elements.audioIconUnmuted.classList.add('hidden');
            elements.audioIconMuted.classList.remove('hidden');
            elements.audioStatusText.textContent = "AUDIO MUTED";
            elements.btnAudio.classList.add('muted');
        }
    });

    // 3. Resize handler
    window.addEventListener('resize', onWindowResize);

    // 4. Touch device check for loader hint
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window) {
        const hintDesktop = document.querySelector('.hint-desktop');
        const hintTouch = document.querySelector('.hint-touch');
        if (hintDesktop && hintTouch) {
            hintDesktop.style.display = 'none';
            hintTouch.style.display = 'inline';
        }
    }
}

function onWindowResize() {
    globalState.width = window.innerWidth;
    globalState.height = window.innerHeight;
    
    globalState.camera.aspect = globalState.width / globalState.height;
    globalState.camera.updateProjectionMatrix();

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    const maxPixelRatio = isMobileDevice ? 1.5 : 2.0;
    globalState.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    
    globalState.renderer.setSize(globalState.width, globalState.height);
    globalState.composer.setSize(globalState.width, globalState.height);
}

// Render loop variables
let clock = new THREE.Clock();

function render() {
    requestAnimationFrame(render);
    
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // Call animate method for all scene modules to run their ambient effects
    scenes.forEach((sceneModule) => {
        if (sceneModule.animate) {
            sceneModule.animate(time, delta, globalState);
        }
    });
    
    // Render scene via composer for UnrealBloom glow
    globalState.composer.render();
}
