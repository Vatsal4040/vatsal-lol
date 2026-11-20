import { useEffect, useMemo, useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { createSeededRandom } from '../../utils/webgl';
import { GraphicsQuality, worldState } from '../../utils/worldState';
import { getCelestialBodyById } from '../../data/celestialBodies';

interface AsteroidBeltProps {
  quality: GraphicsQuality;
  onSelect: (id: string) => void;
}

const _dummy = new THREE.Object3D();

export function AsteroidBelt({ quality, onSelect }: AsteroidBeltProps) {
  const count = quality === 'eco' ? 750 : quality === 'balanced' ? 1400 : 2200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const beltData = getCelestialBodyById('asteroid-belt')!;

  // Faceted low-poly rock geometry
  const rockGeometry = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(1.0, 0);
    const pos = geo.attributes.position;
    const rand = createSeededRandom(991);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const scale = 0.74 + rand() * 0.48;
      v.multiplyScalar(scale);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const asteroids = useMemo(() => {
    const rand = createSeededRandom(773);
    return Array.from({ length: count }, () => {
      const angle = rand() * Math.PI * 2;
      // Bell-curve radial concentration centered around r=5600 between Mars (3720) & Jupiter (8200)
      const radialBias = (rand() + rand() + rand()) / 3;
      const radius = 4850 + radialBias * 1550;
      const verticalBias = rand() + rand() - 1;
      const y = verticalBias * 240;

      // Realistic distribution of pebbles, boulders, and hero proto-asteroids
      const sizeRoll = rand();
      const baseSize =
        sizeRoll > 0.95
          ? 12 + rand() * 14
          : sizeRoll > 0.65
            ? 5.2 + rand() * 6.5
            : 2.0 + rand() * 3.2;

      const scaleX = baseSize * (0.75 + rand() * 0.55);
      const scaleY = baseSize * (0.62 + rand() * 0.45);
      const scaleZ = baseSize * (0.75 + rand() * 0.55);
      const rotX = rand() * Math.PI * 2;
      const rotY = rand() * Math.PI * 2;
      const rotZ = rand() * Math.PI * 2;

      const tint = 0.44 + rand() * 0.36;
      const mineral = rand();
      const color =
        mineral > 0.66
          ? new THREE.Color(tint + 0.1, tint + 0.05, tint - 0.04)
          : mineral > 0.33
            ? new THREE.Color(tint + 0.02, tint + 0.02, tint + 0.05)
            : new THREE.Color(tint + 0.07, tint + 0.04, tint + 0.01);

      return {
        angle,
        radius,
        y,
        scaleX,
        scaleY,
        scaleZ,
        rotX,
        rotY,
        rotZ,
        color,
      };
    });
  }, [count]);

  useEffect(() => {
    const inst = meshRef.current;
    if (!inst) return;
    asteroids.forEach((a, i) => {
      _dummy.position.set(
        Math.cos(a.angle) * a.radius,
        a.y,
        Math.sin(a.angle) * a.radius
      );
      _dummy.rotation.set(a.rotX, a.rotY, a.rotZ);
      _dummy.scale.set(a.scaleX, a.scaleY, a.scaleZ);
      _dummy.updateMatrix();
      inst.setMatrixAt(i, _dummy.matrix);
      inst.setColorAt(i, a.color);
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere();
  }, [asteroids]);

  useEffect(() => {
    return () => {
      rockGeometry.dispose();
    };
  }, [rockGeometry]);

  useFrame(() => {
    if (!groupRef.current) return;
    const angle = beltData.initialAngle + worldState.simTime * beltData.orbitSpeed;
    groupRef.current.rotation.y = worldState.simTime * beltData.orbitSpeed * 0.55;

    worldState.planetPositions['asteroid-belt'].set(
      Math.cos(angle) * beltData.orbitRadius,
      0,
      Math.sin(angle) * beltData.orbitRadius
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect('asteroid-belt');
  };

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[rockGeometry, undefined, count]}
        frustumCulled={false}
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          roughness={0.86}
          metalness={0.14}
          flatShading
        />
      </instancedMesh>
    </group>
  );
}
