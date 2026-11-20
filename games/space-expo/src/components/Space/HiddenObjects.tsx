import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getCelestialBodyById } from '../../data/celestialBodies';
import { createSoftGlowTexture } from '../../utils/webgl';
import { worldState } from '../../utils/worldState';

interface HiddenObjectsProps {
  onSelect: (id: string) => void;
}

const _awayFromSun = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();

/**
 * Renders two secret celestial wonders for players to discover while exploring:
 * 1) Halley's Comet (icy nucleus + glowing solar-wind tail pointing away from the Sun)
 * 2) Voyager Star Probe (composite 7-part golden spacecraft + beacon)
 */
export function HiddenObjects({ onSelect }: HiddenObjectsProps) {
  const cometData = getCelestialBodyById('halley-comet')!;
  const voyagerData = getCelestialBodyById('voyager-probe')!;

  const cometGroupRef = useRef<THREE.Group>(null);
  const cometTailRef = useRef<THREE.Group>(null);
  const cometCoreRef = useRef<THREE.Mesh>(null);
  const voyagerGroupRef = useRef<THREE.Group>(null);
  const voyagerSpinRef = useRef<THREE.Group>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const cometGlowTex = useMemo(
    () =>
      createSoftGlowTexture(
        'rgba(224, 242, 254, 0.95)',
        'rgba(56, 189, 248, 0.45)',
        'rgba(56, 189, 248, 0)'
      ),
    []
  );

  const voyagerBeaconTex = useMemo(
    () =>
      createSoftGlowTexture(
        'rgba(254, 240, 138, 0.95)',
        'rgba(251, 191, 36, 0.35)',
        'rgba(251, 191, 36, 0)'
      ),
    []
  );

  useEffect(() => {
    return () => {
      cometGlowTex.dispose();
      voyagerBeaconTex.dispose();
    };
  }, [cometGlowTex, voyagerBeaconTex]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. Halley's Comet inclined orbit
    const cAngle = cometData.initialAngle + worldState.simTime * cometData.orbitSpeed;
    const cx = Math.cos(cAngle) * cometData.orbitRadius;
    const cz = Math.sin(cAngle) * (cometData.orbitRadius * 0.85);
    const cy = Math.sin(cAngle * 1.15) * (cometData.inclination ?? 1850);

    if (cometGroupRef.current) {
      cometGroupRef.current.position.set(cx, cy, cz);
    }
    worldState.planetPositions['halley-comet'].set(cx, cy, cz);

    // Point comet tail dynamically AWAY from the Sun
    if (cometTailRef.current) {
      _awayFromSun.set(cx, cy, cz).normalize();
      _quat.setFromUnitVectors(_up, _awayFromSun);
      cometTailRef.current.quaternion.copy(_quat);
    }
    if (cometCoreRef.current && !worldState.isPaused) {
      cometCoreRef.current.rotation.x += dt * 0.4;
      cometCoreRef.current.rotation.y += dt * 0.6;
    }

    // 2. Voyager Star Probe outer orbit
    const vAngle = voyagerData.initialAngle + worldState.simTime * voyagerData.orbitSpeed;
    const vx = Math.cos(vAngle) * voyagerData.orbitRadius;
    const vz = Math.sin(vAngle) * voyagerData.orbitRadius;
    const vy = (voyagerData.inclination ?? -1200) + Math.cos(vAngle) * 140;

    if (voyagerGroupRef.current) {
      voyagerGroupRef.current.position.set(vx, vy, vz);
    }
    worldState.planetPositions['voyager-probe'].set(vx, vy, vz);

    if (voyagerSpinRef.current && !worldState.isPaused) {
      voyagerSpinRef.current.rotation.y += dt * 0.32;
    }
  });

  const handleSelect = (id: string) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <group>
      {/* Hidden Wonder 1: Halley's Comet */}
      <group
        ref={cometGroupRef}
        onClick={handleSelect('halley-comet')}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredId('halley-comet');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredId(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh ref={cometCoreRef} scale={hoveredId === 'halley-comet' ? 1.15 : 1}>
          <dodecahedronGeometry args={[7.5, 0]} />
          <meshStandardMaterial
            color="#E0F2FE"
            emissive="#38BDF8"
            emissiveIntensity={0.45}
            roughness={0.5}
            flatShading
          />
        </mesh>

        {/* Icy Coma Halo */}
        <sprite scale={[52, 52, 1]}>
          <spriteMaterial
            map={cometGlowTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.9}
          />
        </sprite>

        {/* Sweeping Solar-Wind Ion & Dust Tail */}
        <group ref={cometTailRef}>
          <mesh position={[0, 72, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[20, 145, 12, 1, true]} />
            <meshBasicMaterial
              color="#7DD3FC"
              transparent
              opacity={0.34}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh position={[0, 52, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[9.5, 102, 10, 1, true]} />
            <meshBasicMaterial
              color="#E0F2FE"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* Hidden Wonder 2: Composite 7-part Voyager Star Probe */}
      <group
        ref={voyagerGroupRef}
        onClick={handleSelect('voyager-probe')}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredId('voyager-probe');
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredId(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <group
          ref={voyagerSpinRef}
          scale={hoveredId === 'voyager-probe' ? 5.2 : 4.6}
        >
          {/* 1. Parabolic High-Gain Dish */}
          <mesh position={[0, 0.55, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[1.35, 0.5, 14, 1, true]} />
            <meshStandardMaterial
              color="#F8FAFC"
              roughness={0.35}
              metalness={0.25}
              flatShading
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* 2. Dish receiver feed horn */}
          <mesh position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.08, 0.14, 0.65, 8]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* 3. Decagonal Golden Body Bus */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 0.55, 8]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.85} roughness={0.22} flatShading />
          </mesh>
          {/* 4. Famous Golden Record Plaque mounted on side */}
          <mesh position={[0.63, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.24, 0.24, 0.05, 16]} />
            <meshStandardMaterial
              color="#FDE047"
              emissive="#F59E0B"
              emissiveIntensity={0.35}
              metalness={0.95}
              roughness={0.12}
            />
          </mesh>
          {/* 5. Magnetometer Boom */}
          <mesh position={[0, -0.1, 1.75]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 2.6, 6]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.75} roughness={0.35} />
          </mesh>
          {/* 6. Science Instrument Arm */}
          <mesh position={[-1.25, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.06, 1.5, 6]} />
            <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* 7. Camera & Sensor Head */}
          <mesh position={[-2.05, -0.2, 0]}>
            <boxGeometry args={[0.38, 0.34, 0.42]} />
            <meshStandardMaterial color="#38BDF8" metalness={0.6} roughness={0.25} />
          </mesh>
        </group>

        {/* Soft Golden Beacon Glow so explorers can spot it in outer space */}
        <sprite scale={[44, 44, 1]}>
          <spriteMaterial
            map={voyagerBeaconTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.72}
          />
        </sprite>
      </group>
    </group>
  );
}
