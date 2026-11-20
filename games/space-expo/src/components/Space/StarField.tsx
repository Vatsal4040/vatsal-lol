import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createSeededRandom } from '../../utils/webgl';
import { GraphicsQuality } from '../../utils/worldState';

interface StarFieldProps {
  quality: GraphicsQuality;
}

/**
 * Deep pure-black space starfield dome.
 * Removes foreground nebula haze so space feels genuinely pitch-black (#000000)
 * with razor-sharp, naturally spectral-tinted stars twinkling across the sky.
 */
export function StarField({ quality }: StarFieldProps) {
  const starCount =
    quality === 'eco' ? 1800 : quality === 'balanced' ? 3200 : 4800;
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const domeRef = useRef<THREE.Group>(null);

  const starGeometry = useMemo(() => {
    const rand = createSeededRandom(4042);
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const phases = new Float32Array(starCount);

    // Realistic astronomical spectral tints (mostly crisp white, subtle blue-white & warm gold)
    const palette = [
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#F8FAFC'),
      new THREE.Color('#E0F2FE'),
      new THREE.Color('#FEF9C3'),
      new THREE.Color('#BAE6FD'),
      new THREE.Color('#FED7AA'),
    ];

    for (let i = 0; i < starCount; i++) {
      // Vast sky sphere following the camera at 720,000..940,000u (always behind all galaxies)
      const r = 720000 + rand() * 220000;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[Math.floor(rand() * palette.length)];
      const dim = 0.45 + Math.pow(rand(), 1.4) * 0.55;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;

      // Natural magnitude distribution: many faint pinpricks, a few bright navigational stars
      sizes[i] = 1.2 + Math.pow(rand(), 3.2) * 4.6;
      phases[i] = rand() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [starCount]);

  const starMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aPhase;
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          float twinkle = 0.84 + 0.16 * sin(uTime * 1.4 + aPhase);
          vAlpha = twinkle;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(aSize * twinkle, 1.1, 5.4);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float core = smoothstep(0.5, 0.08, dist);
          gl_FragColor = vec4(vColor, core * core * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useEffect(() => {
    return () => {
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [starGeometry, starMaterial]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (domeRef.current) {
      domeRef.current.position.copy(state.camera.position);
    }
  });

  return (
    <group ref={domeRef}>
      <points geometry={starGeometry} frustumCulled={false}>
        <primitive object={starMaterial} ref={materialRef} attach="material" />
      </points>
    </group>
  );
}
