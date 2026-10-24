import { PERCEPTION_PROFILES } from './profiles/perceptionProfiles';
import { PerceptionEngine } from './engine/PerceptionEngine';
import { PerceptionProfile, EnvironmentState } from './types';

// App State
let engine: PerceptionEngine | null = null;
let activeProfile: PerceptionProfile = PERCEPTION_PROFILES[1]; // Default Dog
let renderMode: 'full' | 'split' = 'split';
let showEnvironment = false;
let searchQuery = '';
let isDraggingSlider = false;
let currentLoadId = 0;
let isCustomImage = false;

const mobileQuery = window.matchMedia('(max-width: 768px) and (orientation: portrait)');
let lastWasMobile: boolean = mobileQuery.matches;

function isMobile(): boolean {
  return mobileQuery.matches;
}

let environment: EnvironmentState = {
  lighting: 'daylight',
  distanceMeters: 10,
  motionSpeed: 0,
  showUVGuides: false,
};

// Initial DOM Setup
document.addEventListener('DOMContentLoaded', () => {
  initEngine();
  renderProfileList();
  renderBiologyInspector();
  attachEventListeners();
});

function showCanvasError(msg: string) {
  const canvas = document.getElementById('perception-render-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  canvas.width = canvas.width || 1280;
  canvas.height = canvas.height || 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚠️ ' + msg, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

function loadPreset(imageNum: string) {
  const loadId = ++currentLoadId;
  const num = parseInt(imageNum, 10);
  const filename = isMobile() ? `m${num}.png` : `${imageNum}.png`;
  const primaryPath = `public/presets/${filename}`;
  const fallbackPath = `presets/${filename}`;

  const img = new Image();
  img.onload = () => {
    if (loadId !== currentLoadId) return;
    engine?.setSource(img);
    const canvas = document.getElementById('perception-render-canvas');
    if (canvas) canvas.setAttribute('data-loaded-preset', filename);
  };
  img.onerror = () => {
    if (loadId !== currentLoadId) return;
    const fallbackImg = new Image();
    fallbackImg.onload = () => {
      if (loadId !== currentLoadId) return;
      engine?.setSource(fallbackImg);
      const canvas = document.getElementById('perception-render-canvas');
      if (canvas) canvas.setAttribute('data-loaded-preset', filename);
    };
    fallbackImg.onerror = () => {
      if (loadId !== currentLoadId) return;
      showCanvasError(`Failed to load preset ${imageNum}`);
    };
    fallbackImg.src = fallbackPath;
  };
  img.src = primaryPath;
}

function handleScreenChange() {
  const currentMobile = isMobile();
  if (currentMobile !== lastWasMobile) {
    lastWasMobile = currentMobile;
    if (!isCustomImage) {
      const selector = document.getElementById('preset-image-selector') as HTMLSelectElement | null;
      const currentVal = selector?.value || '01';
      loadPreset(currentVal);
    }
  }
}

async function initEngine() {
  const canvasElement = document.getElementById('perception-render-canvas') as HTMLCanvasElement;
  if (!canvasElement) return;

  try {
    engine = new PerceptionEngine(canvasElement);
    engine.setProfile(activeProfile);
    engine.setRenderMode(renderMode);
    engine.setEnvironment(environment);

    const selector = document.getElementById('preset-image-selector') as HTMLSelectElement | null;
    const initialNum = selector?.value || '01';
    loadPreset(initialNum);
  } catch (err) {
    console.error('Failed to initialize Perception Engine:', err);
  }
}

// -------------------------------------------------------------
// Render Helpers
// -------------------------------------------------------------

function renderProfileList() {
  const listContainer = document.getElementById('profile-list');
  const countFooter = document.getElementById('profile-count');
  if (!listContainer) return;

  const filtered = PERCEPTION_PROFILES.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.visionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.latinName && p.latinName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (countFooter) {
    countFooter.remove();
  }

  if (filtered.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; padding: 24px 0; font-size: 0.75rem; color: var(--text-muted);">No vision modes match "${searchQuery}"</div>`;
    return;
  }

  listContainer.innerHTML = filtered.map((p) => {
    const isSelected = activeProfile.id === p.id;

    return `
      <button
        data-profile-id="${p.id}"
        class="profile-card ${isSelected ? 'selected' : ''}"
      >
        <span class="profile-icon">${p.icon}</span>
        <h3 class="profile-name">
          ${p.name}
        </h3>
      </button>
    `;
  }).join('');
}

function getConfidenceBadgeHtml(confidence: PerceptionProfile['confidence']) {
  const baseStyle = "display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px;";
  switch (confidence) {
    case 'High':
      return `<span style="${baseStyle} background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);">🛡️ High Confidence Model</span>`;
    case 'Medium':
      return `<span style="${baseStyle} background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3);">🛡️ Medium Confidence</span>`;
    case 'Approximation':
      return `<span style="${baseStyle} background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3);">✨ Scientific Approximation</span>`;
    case 'Inspired':
      return `<span style="${baseStyle} background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3);">⚠️ Inspired Perception Model</span>`;
    case 'Physics-Based':
      return `<span style="${baseStyle} background: rgba(6, 182, 212, 0.1); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3);">🌌 Physics-Based Model</span>`;
  }
}

function renderBiologyInspector() {
  const panel = document.getElementById('biology-inspector-panel');
  if (!panel) return;

  const profile = activeProfile;
  const fovPct = Math.min(100, (profile.fovDegrees / 360) * 100);
  const fpsPct = Math.min(100, (profile.flickerFusionHz / 250) * 100);

  panel.innerHTML = `
    <!-- Header Banner -->
    <div class="inspector-header">
      <div class="inspector-title-group">
        <span class="inspector-icon">${profile.icon}</span>
        <div>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
            <h2 style="font-size: 1.5rem; font-weight: 900; color: #ffffff;">${profile.name}</h2>
            <span class="acuity-pill">${profile.acuity} Acuity</span>
            ${getConfidenceBadgeHtml(profile.confidence)}
          </div>
          ${profile.latinName ? `<p style="font-size: 0.75rem; font-style: italic; color: var(--text-secondary); margin-top: 2px;">${profile.latinName}</p>` : ''}
          <p style="font-size: 0.75rem; font-weight: 700; color: var(--accent-sky); margin-top: 4px;">${profile.visionType}</p>
        </div>
      </div>
      <div class="validation-card">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 2px;">Scientific Validation:</strong>
        ${profile.confidenceReason}
      </div>
    </div>

    <!-- 3 Columns Optics Breakdown -->
    <div class="inspector-grid">
      <!-- Col 1: Summary & Evolution -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="inspector-card">
          <h3 class="inspector-card-title">👁️ Visual System Summary</h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">${profile.summary}</p>
        </div>
        <div class="inspector-card">
          <h3 class="inspector-card-title" style="color: #fbbf24;">🧭 Evolutionary Adaptation</h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.6;">${profile.evolutionaryContext}</p>
        </div>
      </div>

      <!-- Col 2: Photoreceptors -->
      <div class="inspector-card">
        <h3 class="inspector-card-title" style="color: #818cf8;">🧬 Photoreceptors & Retinal Structure</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div class="receptor-box">
            <span style="color: var(--text-muted); display: block; font-size: 11px;">Cones (Color Discrimination):</span>
            <strong style="color: var(--text-primary); font-weight: 600;">${profile.receptors.cones}</strong>
          </div>
          <div class="receptor-box">
            <span style="color: var(--text-muted); display: block; font-size: 11px;">Rods (Low-Light & Motion):</span>
            <strong style="color: var(--text-primary); font-weight: 600;">${profile.receptors.rods}</strong>
          </div>
          ${profile.receptors.specialized ? `
            <div class="receptor-box">
              <span style="color: var(--text-muted); display: block; font-size: 11px;">Specialized Optical System:</span>
              <strong style="color: var(--accent-sky); font-weight: 600;">${profile.receptors.specialized}</strong>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Col 3: Physical Optics Metrics -->
      <div class="inspector-card">
        <h3 class="inspector-card-title" style="color: #34d399;">⚡ Physical Optics Specs</h3>
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Field of View (FOV):</span>
            <strong style="color: var(--text-primary);">${profile.fovDegrees}° (Binocular: ${profile.binocularFOV}°)</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${fovPct}%; background-color: var(--accent-sky);"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Wavelength Range:</span>
            <strong style="color: var(--text-primary);">${profile.wavelengthRange}</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: 85%; background: linear-gradient(to right, #a855f7, #34d399, #f43f5e);"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
            <span style="color: var(--text-secondary);">Flicker Fusion Speed:</span>
            <strong style="color: var(--text-primary);">${profile.flickerFusionHz} Hz (FPS)</strong>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${fpsPct}%; background-color: #f59e0b;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Event Handlers
// -------------------------------------------------------------

function attachEventListeners() {
  // Preset Image Selector
  const presetSelect = document.getElementById('preset-image-selector');
  presetSelect?.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    if (target.value) {
      isCustomImage = false;
      loadPreset(target.value);
    }
  });

  // Upload Custom Image Button
  const uploadBtn = document.getElementById('upload-custom-image-btn');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  uploadBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0] && engine) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          isCustomImage = true;
          engine?.setSource(img);
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(target.files[0]);
    }
  });

  // Screen change listeners (mobile vs desktop breakpoint / rotation / resize)
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', handleScreenChange);
  } else if ((mobileQuery as any).addListener) {
    (mobileQuery as any).addListener(handleScreenChange);
  }
  window.addEventListener('resize', () => {
    handleScreenChange();
    engine?.render();
  });
  window.addEventListener('orientationchange', handleScreenChange);

  // View Mode Buttons
  const splitBtn = document.getElementById('view-mode-split-btn');
  const fullBtn = document.getElementById('view-mode-full-btn');
  const splitHint = document.getElementById('split-hint');

  splitBtn?.addEventListener('click', () => {
    renderMode = 'split';
    engine?.setRenderMode('split');
    splitBtn.classList.add('active');
    fullBtn?.classList.remove('active');
    splitHint?.classList.remove('hidden');
  });

  fullBtn?.addEventListener('click', () => {
    renderMode = 'full';
    engine?.setRenderMode('full');
    fullBtn.classList.add('active');
    splitBtn?.classList.remove('active');
    splitHint?.classList.add('hidden');
  });

  // Toggle Environment Drawer
  const toggleEnvBtn = document.getElementById('toggle-environment-btn');
  const envPanel = document.getElementById('environment-controls-panel');

  toggleEnvBtn?.addEventListener('click', () => {
    showEnvironment = !showEnvironment;
    if (showEnvironment) {
      envPanel?.classList.remove('hidden');
      toggleEnvBtn.style.borderColor = '#f59e0b';
      toggleEnvBtn.style.color = '#fbbf24';
    } else {
      envPanel?.classList.add('hidden');
      toggleEnvBtn.style.borderColor = 'var(--border-color)';
      toggleEnvBtn.style.color = 'var(--text-primary)';
    }
  });

  // Lighting Buttons
  const lightingButtons = document.querySelectorAll('#lighting-buttons button');
  lightingButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-lighting') as EnvironmentState['lighting'];
      environment.lighting = mode;
      engine?.setEnvironment(environment);

      lightingButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Distance Slider
  const distanceSlider = document.getElementById('distance-slider') as HTMLInputElement;
  const distanceDisplay = document.getElementById('distance-display');

  distanceSlider?.addEventListener('input', (e) => {
    const val = Number((e.target as HTMLInputElement).value);
    environment.distanceMeters = val;
    if (distanceDisplay) distanceDisplay.textContent = `${val} meters`;
    engine?.setEnvironment(environment);
  });

  // UV Spectrum Overlay Toggle
  const toggleUvBtn = document.getElementById('toggle-uv-btn');
  toggleUvBtn?.addEventListener('click', () => {
    environment.showUVGuides = !environment.showUVGuides;
    engine?.setEnvironment(environment);

    if (environment.showUVGuides) {
      toggleUvBtn.style.borderColor = '#a855f7';
      toggleUvBtn.style.color = '#c084fc';
    } else {
      toggleUvBtn.style.borderColor = 'var(--border-color)';
      toggleUvBtn.style.color = 'var(--text-primary)';
    }
  });

  // Search Input Filter
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value;
    renderProfileList();
    attachProfileClickListeners();
  });

  // Profile Selection Clicks
  attachProfileClickListeners();

  // Pointer Interaction for Canvas Split Slider
  const canvasContainer = document.getElementById('vision-canvas-container');
  const resetSliderBtn = document.getElementById('reset-slider-btn');

  const updateSlider = (clientX: number) => {
    if (!canvasContainer || !engine) return;
    const rect = canvasContainer.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    engine.setSliderPosition(ratio);
  };

  canvasContainer?.addEventListener('pointerdown', (e) => {
    if (renderMode !== 'split') return;
    isDraggingSlider = true;
    try {
      canvasContainer.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    updateSlider(e.clientX);
  });

  canvasContainer?.addEventListener('pointermove', (e) => {
    if (isDraggingSlider && renderMode === 'split') {
      updateSlider(e.clientX);
    }
  });

  const stopDragging = (e?: PointerEvent) => {
    if (isDraggingSlider) {
      isDraggingSlider = false;
      if (e && canvasContainer) {
        try {
          if (canvasContainer.hasPointerCapture(e.pointerId)) {
            canvasContainer.releasePointerCapture(e.pointerId);
          }
        } catch {
          // ignore
        }
      }
    }
  };

  window.addEventListener('pointerup', stopDragging);
  window.addEventListener('pointercancel', stopDragging);

  resetSliderBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (engine) engine.setSliderPosition(0.5);
  });
}

function attachProfileClickListeners() {
  const profileButtons = document.querySelectorAll('#profile-list button[data-profile-id]');
  profileButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const profileId = btn.getAttribute('data-profile-id');
      const found = PERCEPTION_PROFILES.find((p) => p.id === profileId);
      if (found) {
        activeProfile = found;
        engine?.setProfile(found);
        renderProfileList();
        attachProfileClickListeners();
        renderBiologyInspector();
      }
    });
  });
}
