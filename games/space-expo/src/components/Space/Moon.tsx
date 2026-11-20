import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { getCelestialBodyById } from '../../data/celestialBodies';
import { createPlanetTexture } from '../../utils/webgl';
import { worldState } from '../../utils/worldState';

interface MoonProps {
  isSelected: boolean;
  showOrbit: boolean;
  onSelect: (id: string) => void;
}

export function Moon({
  isSelected,
  showOrbit,
  onSelect,
}: MoonProps) {
  const data = getCelestialBodyById('moon')!;
  const moonGroupRef = useRef<THREE.Group>(null);
  const orbitRingRef = useRef<THREE.LineLoop>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => createPlanetTexture('moon', 4), []);

  const orbitGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const inc = data.inclination ?? 4.2;
    for (let i = 0; i <= 84; i++) {
      const a = (i / 84) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * data.orbitRadius,
          Math.sin(a) * inc,
          Math.sin(a) * data.orbitRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [data.orbitRadius, data.inclination]);

  useEffect(() => {
    return () => {
      texture.dispose();
      orbitGeo.dispose();
    };
  }, [texture, orbitGeo]);

  useFrame((_, delta) => {
    const earthPos = worldState.planetPositions.earth;
    if (!earthPos) return;

    if (orbitRingRef.current) {
      orbitRingRef.current.position.copy(earthPos);
    }

    const angle = data.initialAngle + worldState.simTime * data.orbitSpeed;
    const inc = data.inclination ?? 4.2;
    const mx = earthPos.x + Math.cos(angle) * data.orbitRadius;
    const my = earthPos.y + Math.sin(angle) * inc;
    const mz = earthPos.z + Math.sin(angle) * data.orbitRadius;

    if (moonGroupRef.current) {
      moonGroupRef.current.position.set(mx, my, mz);
    }
    worldState.planetPositions.moon.set(mx, my, mz);

    if (meshRef.current && !worldState.isPaused) {
      meshRef.current.rotation.y += Math.min(delta, 0.05) * data.rotationSpeed;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect('moon');
  };

  return (
    <group>
      {showOrbit && (
        <lineLoop ref={orbitRingRef} geometry={orbitGeo}>
          <lineBasicMaterial
            color="#CBD5E1"
            transparent
            opacity={isSelected ? 0.5 : 0.2}
          />
        </lineLoop>
      )}

      <group
        ref={moonGroupRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh ref={meshRef} scale={hovered ? 1.08 : 1} castShadow receiveShadow>
          <icosahedronGeometry args={[data.radius, 3]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.92}
            metalness={0.02}
            flatShading
          />
        </mesh>

        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.38, data.radius * 1.5, 24]} />
            <meshBasicMaterial
              color={isSelected ? '#38BDF8' : '#F8FAFC'}
              transparent
              opacity={0.78}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
