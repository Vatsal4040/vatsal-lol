import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CELESTIAL_BODIES } from '../../data/celestialBodies';
import { isSoftwareGl, isWebGLSupported } from '../../utils/webgl';
import { GraphicsQuality } from '../../utils/worldState';
import { StarField } from './StarField';
import { Planet } from './Planet';
import { Moon } from './Moon';
import { Satellites } from './Satellites';
import { AsteroidBelt } from './AsteroidBelt';
import { HiddenObjects } from './HiddenObjects';
import { CosmicRealm } from './CosmicRealm';
import { Spaceship } from './Spaceship';

interface UniverseSceneProps {
  selectedId: string | null;
  quality: GraphicsQuality;
  showOrbits: boolean;
  onSelectBody: (id: string) => void;
  onDiscoverNear: (id: string) => void;
  onAutopilotArrive: (id: string) => void;
}

/**
 * Populates a zero-dependency RoomEnvironment PMREM texture so metallic spacecraft
 * nacelles, artificial satellites, and glossy canopy glass have crisp studio highlights.
 */
function EnvironmentSetup() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.36;
    roomEnv.dispose();
    pmrem.dispose();

    return () => {
      envTex.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  return null;
}

export function UniverseScene({
  selectedId,
  quality,
  showOrbits,
  onSelectBody,
  onDiscoverNear,
  onAutopilotArrive,
}: UniverseSceneProps) {
  const webglAvailable = useMemo(() => isWebGLSupported(), []);
  const [contextLost, setContextLost] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const mainPlanets = useMemo(
    () =>
      CELESTIAL_BODIES.filter(
        (b) =>
          (!b.scaleTier || b.scaleTier === 'solar') &&
          !b.parentId &&
          b.id !== 'asteroid-belt' &&
          !b.isHidden
      ),
    []
  );

  const maxDpr = isSoftwareGl
    ? 1
    : quality === 'eco'
      ? 1
      : quality === 'balanced'
        ? 1.5
        : 2;

  if (!webglAvailable || contextLost) {
    return (
      <div className="webgl-fallback">
        <div className="webgl-fallback__card">
          <h2 className="webgl-fallback__title">
            {webglAvailable ? 'Space Viewport Paused' : 'WebGL 3D Required'}
          </h2>
          <p className="webgl-fallback__text">
            {webglAvailable
              ? 'Your graphics context was temporarily interrupted. Select below to resume the 3D universe.'
              : 'Your browser or device does not currently have WebGL hardware acceleration enabled. Enable WebGL in browser settings or try Chrome, Edge, Firefox, or Safari.'}
          </p>
          {webglAvailable && (
            <button
              type="button"
              onClick={() => setContextLost(false)}
              className="btn btn--primary"
            >
              Resume 3D Space
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="universe-canvas-wrap canvas-touch-lock">
      <Canvas
        shadows={!isSoftwareGl && quality === 'high'}
        dpr={[1, maxDpr]}
        camera={{ fov: 50, near: 0.5, far: 1800000, position: [2480, 32, 1020] }}
        gl={{
          antialias: !isSoftwareGl && quality !== 'eco',
          logarithmicDepthBuffer: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          cleanupRef.current?.();
          const dom = gl.domElement;
          const handleLost = (e: Event) => {
            e.preventDefault();
            setContextLost(true);
          };
          const handleRestored = () => {
            setContextLost(false);
          };
          dom.addEventListener('webglcontextlost', handleLost, false);
          dom.addEventListener('webglcontextrestored', handleRestored, false);
          cleanupRef.current = () => {
            dom.removeEventListener('webglcontextlost', handleLost, false);
            dom.removeEventListener('webglcontextrestored', handleRestored, false);
          };
        }}
      >
        {/* Pure deep black space */}
        <color attach="background" args={['#000000']} />

        <EnvironmentSetup />

        {/* Subtle space fill so night sides keep faceted contour readability against pure black */}
        <hemisphereLight args={['#93C5FD', '#050814', 0.24]} />

        {/* Primary golden Sun omnidirectional illumination reaching across the 25x solar system */}
        <pointLight
          position={[0, 0, 0]}
          color="#FFF2CC"
          intensity={3.0}
          distance={55000}
          decay={0.04}
        />

        {/* Subtle warm key bounce for sunlit diorama crispness */}
        <directionalLight
          position={[-2000, 1100, -1500]}
          color="#FDE68A"
          intensity={0.34}
        />

        {/* Deep black sky crisp twinkling stars */}
        <StarField quality={quality} />

        {/* Sun & Main Solar System Planets */}
        {mainPlanets.map((body) => (
          <Planet
            key={body.id}
            data={body}
            isSelected={selectedId === body.id}
            showOrbit={showOrbits}
            onSelect={onSelectBody}
          />
        ))}

        {/* Earth's Moon orbiting Earth */}
        <Moon
          isSelected={selectedId === 'moon'}
          showOrbit={showOrbits}
          onSelect={onSelectBody}
        />

        {/* Orbital Satellites: ISS, Hubble, GPS, Europa & Titan */}
        <Satellites
          selectedId={selectedId}
          showOrbits={showOrbits}
          onSelect={onSelectBody}
        />

        {/* Instanced Asteroid Belt between Mars & Jupiter */}
        <AsteroidBelt quality={quality} onSelect={onSelectBody} />

        {/* Secret Cosmic Wonders: Halley's Comet & Voyager Star Probe */}
        <HiddenObjects onSelect={onSelectBody} />

        {/* Levels 3-5: Deep Space Star Systems, Milky Way Galaxy & Distant Galaxies */}
        <CosmicRealm
          selectedId={selectedId}
          quality={quality}
          showOrbits={showOrbits}
          onSelect={onSelectBody}
        />

        {/* Playable Futuristic Explorer Spaceship & Smooth Camera Controller */}
        <Spaceship
          onDiscoverNear={onDiscoverNear}
          onAutopilotArrive={onAutopilotArrive}
        />
      </Canvas>
    </div>
  );
}
