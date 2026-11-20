import { useCallback, useEffect, useRef, useState } from 'react';
import { CELESTIAL_BODIES, getCelestialBodyById } from './data/celestialBodies';
import { UniverseScene } from './components/Space/UniverseScene';
import { MainMenu } from './components/UI/MainMenu';
import { NavigationHUD } from './components/UI/NavigationHUD';
import { TargetReticleOverlay } from './components/UI/TargetReticleOverlay';
import { CelestialLabelsOverlay } from './components/UI/CelestialLabelsOverlay';
import { PlanetInfoPanel } from './components/UI/PlanetInfoPanel';
import { UniverseMap } from './components/UI/UniverseMap';
import { DiscoveryJournal } from './components/UI/DiscoveryJournal';
import { MobileControls } from './components/UI/MobileControls';
import { PauseMenu } from './components/UI/PauseMenu';
import { LandscapeGate } from './components/UI/LandscapeGate';
import { useSpaceshipControls } from './hooks/useSpaceshipControls';
import { ExplorationScaleId } from './utils/cosmicScale';
import {
  isMobileDevice,
  isMobilePortrait,
  isTouchDevice,
  tryLockLandscape,
} from './utils/webgl';
import { spaceAudio } from './utils/sound';
import {
  CameraMode,
  GraphicsQuality,
  enterSurfaceExplore,
  exitSurfaceExplore,
  initiateScaleTransition,
  resetSpaceshipView,
  worldState,
} from './utils/worldState';

const STORAGE_KEY = 'mini-universe-explorer-discoveries-v1';

function loadSavedDiscoveries(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set<string>(parsed.filter((id) => typeof id === 'string'));
    }
  } catch {
    // Ignore storage access failures in private iframes
  }
  return new Set<string>();
}

function saveDiscoveries(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage write failures
  }
}

export default function App() {
  const [inMenu, setInMenu] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
  const [lockedTargetId, setLockedTargetId] = useState<string | null>(null);
  const [autopilotTargetId, setAutopilotTargetId] = useState<string | null>(null);
  const [surfaceExploreId, setSurfaceExploreId] = useState<string | null>(null);
  const [hudHidden, setHudHidden] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('third-person');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() =>
    isTouchDevice()
  );
  const [quality, setQuality] = useState<GraphicsQuality>(() =>
    isTouchDevice() ? 'balanced' : 'high'
  );
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(() =>
    loadSavedDiscoveries()
  );
  const [recentDiscoveryId, setRecentDiscoveryId] = useState<string | null>(null);
  const [recentArrivalId, setRecentArrivalId] = useState<string | null>(null);
  const [isPortraitBlocked, setIsPortraitBlocked] = useState<boolean>(() =>
    isMobilePortrait()
  );
  const toastTimerRef = useRef<number | null>(null);
  const arrivalTimerRef = useRef<number | null>(null);

  useEffect(() => {
    worldState.isMenuOpen = inMenu;
  }, [inMenu]);

  useEffect(() => {
    worldState.isPaused = isPaused || isPortraitBlocked;
  }, [isPaused, isPortraitBlocked]);

  useEffect(() => {
    worldState.cameraMode = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    worldState.lockedTargetId = lockedTargetId;
  }, [lockedTargetId]);

  useEffect(() => {
    spaceAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (arrivalTimerRef.current) window.clearTimeout(arrivalTimerRef.current);
      spaceAudio.stopSpeaking();
    };
  }, []);

  const recordDiscovery = useCallback((id: string) => {
    setDiscoveredIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveDiscoveries(next);
      spaceAudio.playDiscoveryChime();
      setRecentDiscoveryId(id);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => {
        setRecentDiscoveryId(null);
      }, 3600);
      return next;
    });
  }, []);

  const handleStartExploration = useCallback(
    (startBodyId?: string) => {
      if (isMobileDevice()) {
        void tryLockLandscape(false);
      }
      resetSpaceshipView();
      setSurfaceExploreId(null);
      setHudHidden(false);
      setInMenu(false);
      setIsPaused(false);
      if (startBodyId && startBodyId !== 'earth') {
        setSelectedBodyId(startBodyId);
        setLockedTargetId(startBodyId);
        setAutopilotTargetId(startBodyId);
        worldState.inspectTargetId = null;
        worldState.autopilotTargetId = startBodyId;
        recordDiscovery(startBodyId);
      } else {
        setLockedTargetId('earth');
        recordDiscovery('earth');
      }
    },
    [recordDiscovery]
  );

  const handleSelectBody = useCallback(
    (id: string) => {
      if (inMenu || isPaused) return;
      spaceAudio.playSelect();
      setSelectedBodyId(id);
      setLockedTargetId(id);
      setShowMap(false);
      setShowJournal(false);
      recordDiscovery(id);
    },
    [inMenu, isPaused, recordDiscovery]
  );

  const handleLockTarget = useCallback((id: string) => {
    setLockedTargetId(id);
  }, []);

  const handleUnlockTarget = useCallback(() => {
    setLockedTargetId(null);
  }, []);

  const handleFlyToBody = useCallback(
    (id: string) => {
      if (worldState.surfaceExploreId) {
        exitSurfaceExplore();
        setSurfaceExploreId(null);
      }
      setShowMap(false);
      setShowJournal(false);
      setIsPaused(false);
      setSelectedBodyId(id);
      setLockedTargetId(id);
      setAutopilotTargetId(id);
      worldState.scaleGlideTargetPos = null;
      worldState.scaleGlideLookPos = null;
      worldState.inspectTargetId = null;
      worldState.autopilotTargetId = id;
      recordDiscovery(id);
    },
    [recordDiscovery]
  );

  const handleCancelAutopilot = useCallback(() => {
    worldState.autopilotTargetId = null;
    worldState.inspectTargetId = null;
    worldState.scaleGlideTargetPos = null;
    worldState.scaleGlideLookPos = null;
    setAutopilotTargetId(null);
  }, []);

  const handleSelectScale = useCallback((scale: ExplorationScaleId) => {
    setSurfaceExploreId(null);
    setAutopilotTargetId(null);
    setShowMap(false);
    setShowJournal(false);
    initiateScaleTransition(scale);
  }, []);

  const handleEnterSurfaceExplore = useCallback(
    (id: string) => {
      setShowMap(false);
      setShowJournal(false);
      setIsPaused(false);
      setAutopilotTargetId(null);
      setLockedTargetId(id);
      setSelectedBodyId(null);
      enterSurfaceExplore(id);
      setSurfaceExploreId(id);
      recordDiscovery(id);
    },
    [recordDiscovery]
  );

  const handleExitSurfaceExplore = useCallback(() => {
    exitSurfaceExplore();
    setSurfaceExploreId(null);
  }, []);

  const handleAutopilotArrive = useCallback(
    (id: string) => {
      setAutopilotTargetId(null);
      setSelectedBodyId(id);
      setLockedTargetId(id);
      recordDiscovery(id);
      setRecentArrivalId(id);
      if (arrivalTimerRef.current) window.clearTimeout(arrivalTimerRef.current);
      arrivalTimerRef.current = window.setTimeout(() => {
        setRecentArrivalId(null);
      }, 2800);
    },
    [recordDiscovery]
  );

  const handleManualTakeover = useCallback(() => {
    worldState.scaleGlideTargetPos = null;
    worldState.scaleGlideLookPos = null;
    setAutopilotTargetId(null);
  }, []);

  const handleToggleHud = useCallback(() => {
    setHudHidden((h) => !h);
  }, []);

  const handleTogglePause = useCallback(() => {
    if (inMenu) return;
    if (showMap || showJournal) {
      setShowMap(false);
      setShowJournal(false);
      return;
    }
    setIsPaused((p) => !p);
  }, [inMenu, showMap, showJournal]);

  const handleToggleCameraMode = useCallback(() => {
    setCameraMode((m) => (m === 'third-person' ? 'first-person' : 'third-person'));
  }, []);

  const handleCloseInfoPanel = useCallback(() => {
    setSelectedBodyId(null);
    worldState.inspectTargetId = null;
    spaceAudio.stopSpeaking();
  }, []);

  const handleResetView = useCallback(() => {
    resetSpaceshipView();
    setSurfaceExploreId(null);
    setAutopilotTargetId(null);
    setSelectedBodyId(null);
    setLockedTargetId('earth');
  }, []);

  const handleResetProgress = useCallback(() => {
    const empty = new Set<string>();
    setDiscoveredIds(empty);
    saveDiscoveries(empty);
    setRecentDiscoveryId(null);
  }, []);

  useSpaceshipControls({
    enabled:
      !isPortraitBlocked && !inMenu && !isPaused && !showMap && !showJournal,
    onTogglePause: handleTogglePause,
    onToggleCameraMode: handleToggleCameraMode,
    onManualTakeover: handleManualTakeover,
    onExitSurfaceExplore: handleExitSurfaceExplore,
    onToggleHud: handleToggleHud,
  });

  const selectedBody = selectedBodyId
    ? getCelestialBodyById(selectedBodyId) ?? null
    : null;

  const activeSelectionId = selectedBodyId ?? surfaceExploreId ?? lockedTargetId;

  return (
    <main className="app-root">
      {/* Persistent Full-Viewport 3D Multi-Scale Low-Poly Universe */}
      <UniverseScene
        selectedId={activeSelectionId}
        quality={quality}
        showOrbits={showOrbits && !surfaceExploreId}
        onSelectBody={handleSelectBody}
        onDiscoverNear={recordDiscovery}
        onAutopilotArrive={handleAutopilotArrive}
      />

      {/* Welcome Main Menu over live rotating low-poly Earth */}
      {!isPortraitBlocked && inMenu && (
        <MainMenu
          discoveredCount={discoveredIds.size}
          totalCount={CELESTIAL_BODIES.length}
          quality={quality}
          onQualityChange={setQuality}
          onStart={handleStartExploration}
        />
      )}

      {/* Active Gameplay Cosmic HUD, 3D Labels, Target Reticle & Controls */}
      {!isPortraitBlocked && !inMenu && (
        <>
          {/* 60fps 3D-to-2D Projected Celestial Labels (zero @react-three/drei overhead) */}
          {showLabels &&
            !hudHidden &&
            !surfaceExploreId &&
            !showMap &&
            !showJournal &&
            !isPaused && (
              <CelestialLabelsOverlay
                selectedId={activeSelectionId}
                discoveredIds={discoveredIds}
                onSelectBody={handleSelectBody}
              />
            )}

          {/* 60fps 3D-to-2D Optical Target Lock Reticle & Off-Screen Edge Indicator */}
          {!hudHidden &&
            !surfaceExploreId &&
            !showMap &&
            !showJournal &&
            !isPaused && (
              <TargetReticleOverlay
                lockedTargetId={lockedTargetId}
                onFocusTarget={handleSelectBody}
              />
            )}

          <NavigationHUD
            discoveredIds={discoveredIds}
            totalCount={CELESTIAL_BODIES.length}
            cameraMode={cameraMode}
            soundEnabled={soundEnabled}
            selectedBodyId={selectedBodyId}
            lockedTargetId={lockedTargetId}
            autopilotTargetId={autopilotTargetId}
            surfaceExploreId={surfaceExploreId}
            recentDiscoveryId={recentDiscoveryId}
            recentArrivalId={recentArrivalId}
            hudHidden={hudHidden}
            onToggleHud={handleToggleHud}
            onSelectScale={handleSelectScale}
            onOpenMap={() => {
              setShowJournal(false);
              setShowMap(true);
            }}
            onOpenJournal={() => {
              setShowMap(false);
              setShowJournal(true);
            }}
            onToggleCameraMode={handleToggleCameraMode}
            onResetView={handleResetView}
            onToggleSound={() => setSoundEnabled((s) => !s)}
            onOpenPause={() => setIsPaused(true)}
            onSelectCompassBody={handleFlyToBody}
            onLockRadarBody={handleLockTarget}
            onUnlockTarget={handleUnlockTarget}
            onCancelAutopilot={handleCancelAutopilot}
            onInspectBodyFacts={handleSelectBody}
            onEnterSurfaceExplore={handleEnterSurfaceExplore}
            onExitSurfaceExplore={handleExitSurfaceExplore}
          />

          {showTouchControls &&
            !hudHidden &&
            !surfaceExploreId &&
            !isPaused &&
            !showMap &&
            !showJournal && (
              <MobileControls
                hideOnCompactSheet={Boolean(selectedBody)}
                onManualTakeover={handleManualTakeover}
              />
            )}

          {selectedBody && !hudHidden && !showMap && !showJournal && !isPaused && (
            <PlanetInfoPanel
              body={selectedBody}
              isDiscovered={discoveredIds.has(selectedBody.id)}
              discoveredCount={discoveredIds.size}
              totalCount={CELESTIAL_BODIES.length}
              isLocked={lockedTargetId === selectedBody.id}
              isAutopilotingToThis={autopilotTargetId === selectedBody.id}
              isSurfaceExploringThis={surfaceExploreId === selectedBody.id}
              onClose={handleCloseInfoPanel}
              onExplorePlanet={handleFlyToBody}
              onCancelAutopilot={handleCancelAutopilot}
              onLockTarget={handleLockTarget}
              onUnlockTarget={handleUnlockTarget}
              onSelectNearby={handleSelectBody}
              onEnterSurfaceExplore={handleEnterSurfaceExplore}
            />
          )}

          {showMap && (
            <UniverseMap
              discoveredIds={discoveredIds}
              selectedId={selectedBodyId}
              lockedTargetId={lockedTargetId}
              onClose={() => setShowMap(false)}
              onFlyTo={handleFlyToBody}
              onLockTarget={handleLockTarget}
              onEnterSurfaceExplore={handleEnterSurfaceExplore}
            />
          )}

          {showJournal && (
            <DiscoveryJournal
              discoveredIds={discoveredIds}
              onClose={() => setShowJournal(false)}
              onSelectFromJournal={handleFlyToBody}
              onEnterSurfaceExplore={handleEnterSurfaceExplore}
            />
          )}

          {isPaused && (
            <PauseMenu
              quality={quality}
              soundEnabled={soundEnabled}
              showOrbits={showOrbits}
              showLabels={showLabels}
              showTouchControls={showTouchControls}
              onQualityChange={setQuality}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              onToggleOrbits={() => setShowOrbits((o) => !o)}
              onToggleLabels={() => setShowLabels((l) => !l)}
              onToggleTouchControls={() => setShowTouchControls((t) => !t)}
              onResetProgress={handleResetProgress}
              onResume={() => setIsPaused(false)}
              onReturnToTitle={() => {
                setIsPaused(false);
                setSurfaceExploreId(null);
                worldState.surfaceExploreId = null;
                setSelectedBodyId(null);
                setShowMap(false);
                setShowJournal(false);
                setInMenu(true);
              }}
            />
          )}
        </>
      )}
      {/* Mobile Portrait Blocker — Enforces Landscape-Only View */}
      <LandscapeGate onBlockedChange={setIsPortraitBlocked} />
    </main>
  );
}
