import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createRingTexture } from '../../utils/webgl';

interface SaturnRingsProps {
  innerRadius: number;
  outerRadius: number;
  variant?: 'saturn' | 'uranus';
}

/**
 * Custom radial-UV ring geometry so Saturn's rings show rich concentric icy bands
 * and the Cassini division clearly from every camera angle.
 */
export function SaturnRings({
  innerRadius,
  outerRadius,
  variant = 'saturn',
}: SaturnRingsProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 72, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const r = v3.length();
      const u = (r - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, THREE.MathUtils.clamp(u, 0, 1), 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  const texture = useMemo(() => createRingTexture(variant), [variant]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      texture.dispose();
    };
  }, [geometry, texture]);

  return (
    <mesh
      geometry={geometry}
      rotation={[Math.PI / 2, 0, 0]}
      receiveShadow
      renderOrder={2}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        roughness={0.75}
        metalness={0.05}
        depthWrite={false}
        opacity={variant === 'saturn' ? 0.95 : 0.55}
      />
    </mesh>
  );
}
