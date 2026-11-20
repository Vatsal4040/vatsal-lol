import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { CelestialBodyData } from '../../data/celestialBodies';
import {
  createPlanetTexture,
  createSeededRandom,
  createSoftGlowTexture,
  fbm3D,
} from '../../utils/webgl';
import { worldState } from '../../utils/worldState';
import { SaturnRings } from './SaturnRings';

interface PlanetProps {
  data: CelestialBodyData;
  isSelected: boolean;
  showOrbit: boolean;
  onSelect: (id: string) => void;
}

/** Delicate Fresnel atmospheric rim that keeps faceted planet colors crisp & saturated */
function AtmosphereHalo({
  radius,
  color,
  intensity = 0.45,
}: {
  radius: number;
  color: string;
  intensity?: number;
}) {
  const mat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mvPos.xyz;
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
          float glow = pow(rim, 3.6) * uIntensity;
          gl_FragColor = vec4(uColor, glow);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }, [color, intensity]);

  useEffect(() => {
    return () => mat.dispose();
  }, [mat]);

  return (
    <mesh renderOrder={3}>
      <sphereGeometry args={[radius * 1.075, 28, 28]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** Stylized low-poly faceted Sun with animated plasma shader & warm golden corona */
function SunVisual({ radius }: { radius: number }) {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vPos = position;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec3 vPos;
        varying vec3 vNormal;
        varying vec3 vViewDir;

        float wave(vec3 p) {
          return sin(p.x * 1.6 + uTime * 0.85) * cos(p.y * 1.5 - uTime * 0.65)
               + sin(p.z * 1.9 + uTime * 0.55) * cos(p.x * 1.2 + p.y * 1.1);
        }

        void main() {
          vec3 p = normalize(vPos) * 3.6;
          float n = wave(p) * 0.5 + wave(p * 2.1 + vec3(1.4)) * 0.28;
          float t = clamp(n * 0.5 + 0.55, 0.0, 1.0);

          vec3 deepOrange = vec3(0.98, 0.42, 0.08);
          vec3 warmGold = vec3(1.0, 0.78, 0.16);
          vec3 brightCore = vec3(1.0, 0.97, 0.78);

          vec3 col = mix(deepOrange, warmGold, smoothstep(0.15, 0.65, t));
          col = mix(col, brightCore, smoothstep(0.65, 0.98, t));

          float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
          col += vec3(1.0, 0.86, 0.35) * pow(rim, 2.2) * 0.65;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);

  const coronaTexture = useMemo(
    () =>
      createSoftGlowTexture(
        'rgba(255, 245, 190, 0.94)',
        'rgba(251, 146, 60, 0.36)',
        'rgba(251, 146, 60, 0)'
      ),
    []
  );

  useEffect(() => {
    return () => {
      sunMaterial.dispose();
      coronaTexture.dispose();
    };
  }, [sunMaterial, coronaTexture]);

  useFrame((state) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[radius, 3]} />
        <primitive object={sunMaterial} ref={shaderRef} attach="material" />
      </mesh>
      <sprite scale={[radius * 4.4, radius * 4.4, 1]} renderOrder={1}>
        <spriteMaterial
          map={coronaTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.82}
        />
      </sprite>
    </group>
  );
}

/**
 * Hero Storybook Low-Poly Miniature Earth (proportionally scaled to radius):
 * - Saturated faceted cobalt/turquoise ocean triangles
 * - Chunky raised low-poly continents with warm tan desert biomes, vibrant emerald forests,
 *   lush lime meadows & crisp snowy polar ice caps
 * - Dense instanced clusters of two-tier stylized low-poly pine trees & snow-capped peaks
 * - Sculpted flat-shaded puffy white clouds floating around the globe catching warm sunshine
 */
function MiniatureEarth({ radius }: { radius: number }) {
  const cloudsRef = useRef<THREE.Group>(null);
  const treeFoliageLowerRef = useRef<THREE.InstancedMesh>(null);
  const treeFoliageUpperRef = useRef<THREE.InstancedMesh>(null);
  const treeTrunkRef = useRef<THREE.InstancedMesh>(null);
  const mountainRef = useRef<THREE.InstancedMesh>(null);
  const snowPeakRef = useRef<THREE.InstancedMesh>(null);

  const unitScale = radius / 6.4;

  const { terrainGeo, treePlacements, mountainPlacements, cloudClusters } =
    useMemo(() => {
      const geo = new THREE.IcosahedronGeometry(radius, 4);
      const pos = geo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const v = new THREE.Vector3();
      const dir = new THREE.Vector3();

      const oceanDeep = new THREE.Color('#0B4F8A');
      const oceanMid = new THREE.Color('#0284C7');
      const oceanCoast = new THREE.Color('#14B8D4');
      const desertSand = new THREE.Color('#D4A36A');
      const desertWarm = new THREE.Color('#C08A52');
      const meadowLime = new THREE.Color('#65B93A');
      const forestGreen = new THREE.Color('#27943A');
      const highlandRock = new THREE.Color('#8C99A8');
      const snowWhite = new THREE.Color('#F8FAFC');

      const trees: {
        pos: THREE.Vector3;
        normal: THREE.Vector3;
        scale: number;
        color: THREE.Color;
      }[] = [];
      const mountains: {
        pos: THREE.Vector3;
        normal: THREE.Vector3;
        scale: number;
      }[] = [];
      const rand = createSeededRandom(2028);
      const seenKeys = new Set<string>();

      const treePalette = [
        new THREE.Color('#16A34A'),
        new THREE.Color('#22C55E'),
        new THREE.Color('#15803D'),
        new THREE.Color('#4ADE80'),
      ];

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        dir.copy(v).normalize();

        const n = fbm3D(dir.x * 1.38, dir.y * 1.38, dir.z * 1.38, 3.6);
        const biomeNoise = fbm3D(dir.x * 2.1, dir.y * 2.1, dir.z * 2.1, 11.4);
        const lat = Math.abs(dir.y);
        const col = new THREE.Color();

        let elev = radius;
        if (lat > 0.8 + n * 0.12) {
          elev = radius * 1.038;
          col.copy(snowWhite);
        } else if (n > 0.02) {
          const landHeight = Math.min(0.11, (n - 0.02) * 0.22);
          elev = radius * (1.028 + landHeight);

          const isDesertBelt = lat < 0.42 && biomeNoise > 0.05;
          if (isDesertBelt) {
            col.copy(biomeNoise > 0.22 ? desertWarm : desertSand);
          } else if (n < 0.14) {
            col.copy(meadowLime);
          } else if (n < 0.34) {
            col.copy(forestGreen);
          } else {
            col.copy(highlandRock);
          }

          const key = `${Math.round(dir.x * 16)}_${Math.round(dir.y * 16)}_${Math.round(dir.z * 16)}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            if (n > 0.33 && mountains.length < 44 && rand() > 0.32) {
              mountains.push({
                pos: dir.clone().multiplyScalar(elev - 0.06 * unitScale),
                normal: dir.clone(),
                scale: (0.72 + rand() * 0.65) * unitScale,
              });
            } else if (
              !isDesertBelt &&
              n > 0.08 &&
              n <= 0.34 &&
              trees.length < 130 &&
              rand() > 0.3
            ) {
              trees.push({
                pos: dir.clone().multiplyScalar(elev - 0.03 * unitScale),
                normal: dir.clone(),
                scale: (0.72 + rand() * 0.62) * unitScale,
                color: treePalette[Math.floor(rand() * treePalette.length)],
              });
            }
          }
        } else {
          elev = radius * 0.992;
          if (n > -0.04) {
            col.copy(oceanCoast);
          } else if (n > -0.22) {
            col.copy(oceanMid);
          } else {
            col.copy(oceanDeep);
          }
        }

        v.copy(dir).multiplyScalar(elev);
        pos.setXYZ(i, v.x, v.y, v.z);
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }

      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const clouds: {
        pos: [number, number, number];
        rot: [number, number, number];
        scale: number;
      }[] = [];
      for (let c = 0; c < 18; c++) {
        const theta = (c / 18) * Math.PI * 2 + (rand() - 0.5) * 0.4;
        const phi = 0.35 + rand() * (Math.PI - 0.7);
        const r = radius * (1.11 + rand() * 0.045);
        const cx = r * Math.sin(phi) * Math.cos(theta);
        const cy = r * Math.cos(phi);
        const cz = r * Math.sin(phi) * Math.sin(theta);
        const normal = new THREE.Vector3(cx, cy, cz).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          normal
        );
        const e = new THREE.Euler().setFromQuaternion(q);
        clouds.push({
          pos: [cx, cy, cz],
          rot: [e.x, e.y, e.z],
          scale: (0.52 + rand() * 0.34) * unitScale,
        });
      }

      return {
        terrainGeo: geo,
        treePlacements: trees,
        mountainPlacements: mountains,
        cloudClusters: clouds,
      };
    }, [radius, unitScale]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion();

    if (
      treeFoliageLowerRef.current &&
      treeFoliageUpperRef.current &&
      treeTrunkRef.current
    ) {
      treePlacements.forEach((t, idx) => {
        q.setFromUnitVectors(up, t.normal);

        dummy.position.copy(t.pos).addScaledVector(t.normal, 0.14 * t.scale);
        dummy.quaternion.copy(q);
        dummy.scale.setScalar(t.scale);
        dummy.updateMatrix();
        treeTrunkRef.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.copy(t.pos).addScaledVector(t.normal, 0.4 * t.scale);
        dummy.updateMatrix();
        treeFoliageLowerRef.current!.setMatrixAt(idx, dummy.matrix);
        treeFoliageLowerRef.current!.setColorAt(idx, t.color);

        dummy.position.copy(t.pos).addScaledVector(t.normal, 0.64 * t.scale);
        dummy.scale.setScalar(t.scale * 0.74);
        dummy.updateMatrix();
        treeFoliageUpperRef.current!.setMatrixAt(idx, dummy.matrix);
        treeFoliageUpperRef.current!.setColorAt(idx, t.color);
      });

      treeTrunkRef.current.instanceMatrix.needsUpdate = true;
      treeFoliageLowerRef.current.instanceMatrix.needsUpdate = true;
      treeFoliageUpperRef.current.instanceMatrix.needsUpdate = true;
      if (treeFoliageLowerRef.current.instanceColor) {
        treeFoliageLowerRef.current.instanceColor.needsUpdate = true;
      }
      if (treeFoliageUpperRef.current.instanceColor) {
        treeFoliageUpperRef.current.instanceColor.needsUpdate = true;
      }
      treeTrunkRef.current.computeBoundingSphere();
      treeFoliageLowerRef.current.computeBoundingSphere();
      treeFoliageUpperRef.current.computeBoundingSphere();
    }

    if (mountainRef.current && snowPeakRef.current) {
      mountainPlacements.forEach((m, idx) => {
        q.setFromUnitVectors(up, m.normal);
        dummy.position.copy(m.pos).addScaledVector(m.normal, 0.34 * m.scale);
        dummy.quaternion.copy(q);
        dummy.scale.set(m.scale, m.scale * 1.15, m.scale);
        dummy.updateMatrix();
        mountainRef.current!.setMatrixAt(idx, dummy.matrix);

        dummy.position.copy(m.pos).addScaledVector(m.normal, 0.62 * m.scale);
        dummy.scale.set(m.scale * 0.46, m.scale * 0.48, m.scale * 0.46);
        dummy.updateMatrix();
        snowPeakRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      mountainRef.current.instanceMatrix.needsUpdate = true;
      snowPeakRef.current.instanceMatrix.needsUpdate = true;
      mountainRef.current.computeBoundingSphere();
      snowPeakRef.current.computeBoundingSphere();
    }
  }, [treePlacements, mountainPlacements]);

  useEffect(() => {
    return () => {
      terrainGeo.dispose();
    };
  }, [terrainGeo]);

  useFrame((_, delta) => {
    if (cloudsRef.current && !worldState.isPaused) {
      cloudsRef.current.rotation.y += Math.min(delta, 0.05) * 0.09;
      cloudsRef.current.rotation.x += Math.min(delta, 0.05) * 0.015;
    }
  });

  return (
    <group>
      <mesh geometry={terrainGeo} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.74}
          metalness={0.04}
        />
      </mesh>

      {treePlacements.length > 0 && (
        <>
          <instancedMesh
            ref={treeTrunkRef}
            args={[undefined, undefined, treePlacements.length]}
          >
            <cylinderGeometry args={[0.055, 0.085, 0.28, 5]} />
            <meshStandardMaterial color="#78350F" roughness={0.92} flatShading />
          </instancedMesh>
          <instancedMesh
            ref={treeFoliageLowerRef}
            args={[undefined, undefined, treePlacements.length]}
          >
            <coneGeometry args={[0.24, 0.48, 5]} />
            <meshStandardMaterial roughness={0.78} flatShading />
          </instancedMesh>
          <instancedMesh
            ref={treeFoliageUpperRef}
            args={[undefined, undefined, treePlacements.length]}
          >
            <coneGeometry args={[0.2, 0.42, 5]} />
            <meshStandardMaterial roughness={0.75} flatShading />
          </instancedMesh>
        </>
      )}

      {mountainPlacements.length > 0 && (
        <>
          <instancedMesh
            ref={mountainRef}
            args={[undefined, undefined, mountainPlacements.length]}
          >
            <coneGeometry args={[0.48, 0.72, 5]} />
            <meshStandardMaterial color="#64748B" roughness={0.88} flatShading />
          </instancedMesh>
          <instancedMesh
            ref={snowPeakRef}
            args={[undefined, undefined, mountainPlacements.length]}
          >
            <coneGeometry args={[0.46, 0.72, 5]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.82} flatShading />
          </instancedMesh>
        </>
      )}

      <group ref={cloudsRef}>
        {cloudClusters.map((c, idx) => (
          <group key={idx} position={c.pos} rotation={c.rot} scale={c.scale}>
            <mesh position={[0, 0, 0]} scale={[1.25, 0.55, 0.92]}>
              <dodecahedronGeometry args={[0.85, 0]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.86} flatShading />
            </mesh>
            <mesh position={[0.72, -0.06, 0.2]} scale={[0.92, 0.48, 0.75]}>
              <dodecahedronGeometry args={[0.76, 0]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.86} flatShading />
            </mesh>
            <mesh position={[-0.68, -0.08, -0.14]} scale={[0.86, 0.44, 0.72]}>
              <dodecahedronGeometry args={[0.72, 0]} />
              <meshStandardMaterial color="#F1F5F9" roughness={0.86} flatShading />
            </mesh>
          </group>
        ))}
      </group>

      <AtmosphereHalo radius={radius} color="#38BDF8" intensity={0.44} />
    </group>
  );
}

/** Low-poly sculpted Red Planet Mars with polar caps, canyons & Olympus Mons */
function MiniatureMars({ radius }: { radius: number }) {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(radius, 3);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const rustLight = new THREE.Color('#F97316');
    const rustMid = new THREE.Color('#EA580C');
    const rustDark = new THREE.Color('#9A3412');
    const ice = new THREE.Color('#F8FAFC');

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      dir.copy(v).normalize();
      const n = fbm3D(dir.x * 2.0, dir.y * 2.0, dir.z * 2.0, 9.1);
      const lat = Math.abs(dir.y);
      const col = new THREE.Color();

      let elev = radius * (1 + n * 0.065);
      if (lat > 0.86) {
        col.copy(ice);
        elev = radius * 1.035;
      } else if (n > 0.2) {
        col.copy(rustLight);
        elev = radius * 1.07;
      } else if (n > -0.15) {
        col.copy(rustMid);
      } else {
        col.copy(rustDark);
      }

      v.copy(dir).multiplyScalar(elev);
      pos.setXYZ(i, v.x, v.y, v.z);
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [radius]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.86}
          metalness={0.04}
        />
      </mesh>
      <mesh
        position={[radius * 0.9, radius * 0.32, 0]}
        rotation={[0, 0, -1.25]}
      >
        <coneGeometry args={[radius * 0.24, radius * 0.34, 6]} />
        <meshStandardMaterial color="#C2410C" flatShading roughness={0.88} />
      </mesh>
      {[
        { pos: [-radius * 0.72, radius * 0.42, radius * 0.56], rot: [-0.45, -0.9, 0.2], r: 0.2 },
        { pos: [radius * 0.24, -radius * 0.58, radius * 0.79], rot: [0.65, 0.3, 0], r: 0.17 },
        { pos: [-radius * 0.54, -radius * 0.34, -radius * 0.77], rot: [0.4, 2.5, 0], r: 0.22 },
        { pos: [radius * 0.65, radius * 0.12, -radius * 0.76], rot: [-0.15, 2.4, 0], r: 0.15 },
      ].map((c, idx) => (
        <mesh
          key={idx}
          position={c.pos as [number, number, number]}
          rotation={c.rot as [number, number, number]}
        >
          <torusGeometry args={[radius * c.r, radius * 0.048, 5, 7]} />
          <meshStandardMaterial color="#9A3412" flatShading roughness={0.9} />
        </mesh>
      ))}
      <AtmosphereHalo radius={radius} color="#FB923C" intensity={0.36} />
    </group>
  );
}

/** Orbiting faceted low-poly ice chunks sparkling inside Saturn's rings */
function SaturnRingCrystals({
  innerRadius,
  outerRadius,
}: {
  innerRadius: number;
  outerRadius: number;
}) {
  const count = 120;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const inst = meshRef.current;
    if (!inst) return;
    const rand = createSeededRandom(551);
    const dummy = new THREE.Object3D();
    const c1 = new THREE.Color('#FEF3C7');
    const c2 = new THREE.Color('#FDE68A');
    const c3 = new THREE.Color('#E0F2FE');
    const bandWidth = outerRadius - innerRadius;
    const chunkBase = Math.max(0.25, bandWidth * 0.016);

    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = innerRadius + rand() * bandWidth;
      if (
        r > innerRadius + bandWidth * 0.59 &&
        r < innerRadius + bandWidth * 0.68
      ) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
        continue;
      }
      dummy.position.set(
        Math.cos(a) * r,
        (rand() - 0.5) * chunkBase * 1.4,
        Math.sin(a) * r
      );
      dummy.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
      const s = chunkBase * (0.55 + rand() * 0.95);
      dummy.scale.set(s, s * 0.7, s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, i % 3 === 0 ? c3 : i % 2 === 0 ? c1 : c2);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    inst.computeBoundingSphere();
  }, [innerRadius, outerRadius]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.45} metalness={0.15} flatShading />
    </instancedMesh>
  );
}

/** Faceted stylized low-poly textured planet for all remaining solar worlds */
function ProceduralTexturedPlanet({ data }: { data: CelestialBodyData }) {
  const texture = useMemo(() => createPlanetTexture(data.id, 4), [data.id]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  const isRocky = data.id === 'mercury' || data.id === 'pluto';

  return (
    <group>
      <mesh castShadow receiveShadow>
        {isRocky ? (
          <icosahedronGeometry args={[data.radius, 3]} />
        ) : (
          <sphereGeometry args={[data.radius, 24, 16]} />
        )}
        <meshStandardMaterial
          map={texture}
          roughness={isRocky ? 0.88 : 0.74}
          metalness={0.04}
          flatShading
        />
      </mesh>

      {data.atmosphereColor && (
        <AtmosphereHalo
          radius={data.radius}
          color={data.atmosphereColor}
          intensity={data.id === 'venus' ? 0.45 : 0.36}
        />
      )}

      {data.hasRings && data.ringInner && data.ringOuter && (
        <>
          <SaturnRings
            innerRadius={data.ringInner}
            outerRadius={data.ringOuter}
            variant={data.id === 'uranus' ? 'uranus' : 'saturn'}
          />
          {data.id === 'saturn' && (
            <SaturnRingCrystals
              innerRadius={data.ringInner}
              outerRadius={data.ringOuter}
            />
          )}
        </>
      )}
    </group>
  );
}

export function Planet({
  data,
  isSelected,
  showOrbit,
  onSelect,
}: PlanetProps) {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const orbitLineGeometry = useMemo(() => {
    if (data.orbitRadius <= 0) return null;
    const pts: THREE.Vector3[] = [];
    const segs = 220;
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const y = data.inclination ? Math.sin(a) * data.inclination : 0;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * data.orbitRadius,
          y,
          Math.sin(a) * data.orbitRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [data.orbitRadius, data.inclination]);

  useEffect(() => {
    return () => {
      orbitLineGeometry?.dispose();
    };
  }, [orbitLineGeometry]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const angle = data.initialAngle + worldState.simTime * data.orbitSpeed;
    const x = Math.cos(angle) * data.orbitRadius;
    const z = Math.sin(angle) * data.orbitRadius;
    const y = data.inclination ? Math.sin(angle) * data.inclination : 0;

    if (orbitGroupRef.current) {
      orbitGroupRef.current.position.set(x, y, z);
    }

    if (worldState.planetPositions[data.id]) {
      worldState.planetPositions[data.id].set(x, y, z);
    }

    if (spinGroupRef.current && !worldState.isPaused) {
      spinGroupRef.current.rotation.y += dt * data.rotationSpeed;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  return (
    <group>
      {showOrbit && orbitLineGeometry && (
        <lineLoop geometry={orbitLineGeometry}>
          <lineBasicMaterial
            color={isSelected ? data.color : '#64748B'}
            transparent
            opacity={isSelected ? 0.52 : 0.16}
          />
        </lineLoop>
      )}

      <group
        ref={orbitGroupRef}
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
        <group
          ref={spinGroupRef}
          rotation={[0, 0, data.tilt]}
          scale={hovered ? 1.03 : 1}
        >
          {data.id === 'sun' ? (
            <SunVisual radius={data.radius} />
          ) : data.id === 'earth' ? (
            <MiniatureEarth radius={data.radius} />
          ) : data.id === 'mars' ? (
            <MiniatureMars radius={data.radius} />
          ) : (
            <ProceduralTexturedPlanet data={data} />
          )}
        </group>

        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.28, data.radius * 1.36, 36]} />
            <meshBasicMaterial
              color={isSelected ? '#38BDF8' : '#F8FAFC'}
              transparent
              opacity={isSelected ? 0.85 : 0.52}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}
