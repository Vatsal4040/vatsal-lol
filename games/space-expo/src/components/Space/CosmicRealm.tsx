import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  CELESTIAL_BODIES,
  CelestialBodyData,
  ExoplanetSeed,
} from '../../data/celestialBodies';
import { createSeededRandom, createSoftGlowTexture } from '../../utils/webgl';
import { GraphicsQuality, worldState } from '../../utils/worldState';

interface CosmicRealmProps {
  selectedId: string | null;
  quality: GraphicsQuality;
  showOrbits: boolean;
  onSelect: (id: string) => void;
}

/** Builds a procedural spiral galaxy BufferGeometry with arms, core bulge, and color gradient */
function buildSpiralGalaxyGeometry(
  starCount: number,
  radius: number,
  arms: number,
  spin: number,
  seed: number,
  coreHex: string,
  armHexA: string,
  armHexB: string,
  thickness = 0.08
): THREE.BufferGeometry {
  const rand = createSeededRandom(seed);
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  const coreColor = new THREE.Color(coreHex);
  const armA = new THREE.Color(armHexA);
  const armB = new THREE.Color(armHexB);
  const c = new THREE.Color();

  for (let i = 0; i < starCount; i++) {
    const rNorm = Math.pow(rand(), 1.55);
    const r = rNorm * radius;
    const armIndex = i % arms;
    const baseAngle = (armIndex / arms) * Math.PI * 2;
    const swirl = rNorm * spin;
    const spread = (rand() - 0.5) * (0.45 + rNorm * 0.95);
    const angle = baseAngle + swirl + spread;

    const bulge = Math.exp(-rNorm * 4.5) * radius * thickness * 2.2;
    const diskY =
      (rand() - 0.5) * (radius * thickness * (1 - rNorm * 0.65) + bulge);

    positions[i * 3] = Math.cos(angle) * r;
    positions[i * 3 + 1] = diskY;
    positions[i * 3 + 2] = Math.sin(angle) * r;

    const armCol = armIndex % 2 === 0 ? armA : armB;
    c.copy(coreColor).lerp(armCol, Math.min(1, Math.pow(rNorm, 0.72)));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = (1.6 + Math.pow(rand(), 2.2) * 5.2) * (1.25 - rNorm * 0.45);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  return geo;
}

/** Shared soft-glow galaxy star shader with dynamic opacity for smooth scale transitions */
function createGalaxyPointsMaterial(basePointScale: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0.85 },
      uPointScale: { value: basePointScale },
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uPointScale;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * (uPointScale / max(1200.0, -mvPos.z)), 1.4, 9.0);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = smoothstep(0.5, 0.05, d);
        gl_FragColor = vec4(vColor, glow * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Single procedural low-poly exoplanet orbiting a neighboring Deep Space star */
function ExoplanetOrbiter({
  exo,
  index,
  showOrbit,
}: {
  exo: ExoplanetSeed;
  index: number;
  showOrbit: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const orbitGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 84; i++) {
      const a = (i / 84) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * exo.orbitRadius,
          0,
          Math.sin(a) * exo.orbitRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [exo.orbitRadius]);

  useEffect(() => () => orbitGeo.dispose(), [orbitGeo]);

  useFrame((_, delta) => {
    const a = index * 2.1 + worldState.simTime * exo.orbitSpeed;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(a) * exo.orbitRadius,
        0,
        Math.sin(a) * exo.orbitRadius
      );
    }
    if (meshRef.current && !worldState.isPaused) {
      meshRef.current.rotation.y += Math.min(delta, 0.05) * 0.35;
    }
  });

  return (
    <group>
      {showOrbit && (
        <lineLoop geometry={orbitGeo}>
          <lineBasicMaterial color="#64748B" transparent opacity={0.25} />
        </lineLoop>
      )}
      <group ref={groupRef}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[exo.radius, 2]} />
          <meshStandardMaterial
            color={exo.color}
            roughness={0.72}
            metalness={0.08}
            flatShading
          />
        </mesh>
        {exo.hasRings && (
          <mesh rotation={[Math.PI / 2.3, 0.25, 0]}>
            <ringGeometry args={[exo.radius * 1.45, exo.radius * 2.25, 24]} />
            <meshBasicMaterial
              color="#E0F2FE"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/** Level 3: Neighboring Procedural Star System with LOD exoplanets & starlight halo */
function NeighborStarSystem({
  data,
  isSelected,
  showOrbits,
  onSelect,
}: {
  data: CelestialBodyData;
  isSelected: boolean;
  showOrbits: boolean;
  onSelect: (id: string) => void;
}) {
  const pos = data.cosmicPos ?? [42000, 0, 0];
  const exoGroupRef = useRef<THREE.Group>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const glowTex = useMemo(
    () =>
      createSoftGlowTexture('#FFFFFF', `${data.color}AA`, `${data.color}00`),
    [data.color]
  );

  useEffect(() => () => glowTex.dispose(), [glowTex]);

  useFrame((state, delta) => {
    if (starRef.current && !worldState.isPaused) {
      starRef.current.rotation.y += Math.min(delta, 0.05) * data.rotationSpeed;
    }
    if (exoGroupRef.current && worldState.planetPositions[data.id]) {
      const dist = state.camera.position.distanceTo(
        worldState.planetPositions[data.id]
      );
      exoGroupRef.current.visible = dist < 78000;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  return (
    <group position={pos}>
      <group
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
        <mesh ref={starRef} scale={hovered ? 1.08 : 1}>
          <icosahedronGeometry args={[data.radius, 2]} />
          <meshBasicMaterial color={data.color} />
        </mesh>

        <sprite scale={[data.radius * 7.5, data.radius * 7.5, 1]}>
          <spriteMaterial
            map={glowTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.92}
          />
        </sprite>

        <pointLight color={data.color} intensity={2.4} distance={4800} decay={0.2} />

        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.5, data.radius * 1.66, 32]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {data.exoplanets && data.exoplanets.length > 0 && (
        <group ref={exoGroupRef}>
          {data.exoplanets.map((exo, idx) => (
            <ExoplanetOrbiter
              key={exo.name}
              exo={exo}
              index={idx}
              showOrbit={showOrbits}
            />
          ))}
        </group>
      )}
    </group>
  );
}

/** Level 5: Clickable Distant 3D Spiral Galaxy (Andromeda & Whirlpool) */
function DistantSpiralGalaxy({
  data,
  quality,
  isSelected,
  onSelect,
  armColorA,
  armColorB,
  seed,
}: {
  data: CelestialBodyData;
  quality: GraphicsQuality;
  isSelected: boolean;
  onSelect: (id: string) => void;
  armColorA: string;
  armColorB: string;
  seed: number;
}) {
  const pos = data.cosmicPos ?? [255000, 42000, -195000];
  const spinRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const count = quality === 'eco' ? 950 : quality === 'balanced' ? 1850 : 2900;

  const { geo, mat, coreTex } = useMemo(() => {
    const g = buildSpiralGalaxyGeometry(
      count,
      data.radius * 2.5,
      2,
      4.4,
      seed,
      '#FEF9C3',
      armColorA,
      armColorB,
      0.065
    );
    const m = createGalaxyPointsMaterial(68000);
    const tex = createSoftGlowTexture(
      'rgba(254, 249, 195, 0.96)',
      `${data.color}66`,
      `${data.color}00`
    );
    return { geo: g, mat: m, coreTex: tex };
  }, [count, data.radius, data.color, armColorA, armColorB, seed]);

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
      coreTex.dispose();
    };
  }, [geo, mat, coreTex]);

  useFrame((_, delta) => {
    if (spinRef.current && !worldState.isPaused) {
      spinRef.current.rotation.y += Math.min(delta, 0.05) * data.rotationSpeed;
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  return (
    <group position={pos} rotation={[data.tilt, 0.35, 0.25]}>
      <group
        ref={spinRef}
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
        <points geometry={geo} material={mat} frustumCulled={false} />
        <mesh visible={false}>
          <sphereGeometry args={[data.radius * 0.95, 10, 10]} />
          <meshBasicMaterial />
        </mesh>
        <sprite scale={[data.radius * 2.1, data.radius * 2.1, 1]}>
          <spriteMaterial
            map={coreTex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.86}
          />
        </sprite>

        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.radius * 1.42, data.radius * 1.54, 36]} />
            <meshBasicMaterial
              color="#38BDF8"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * CosmicRealm extends Mini Universe Explorer across Levels 3, 4, and 5 at 25x real-feeling scale:
 * - Level 3 (Deep Space): 4 clickable low-poly neighboring star systems + distant subtle nebulae
 * - Level 4 (Galactic): Our Milky Way 4-arm spiral galaxy + clickable Core
 * - Level 5 (Universe): Andromeda, Whirlpool, and a 160-galaxy deep cosmic cluster web
 */
export function CosmicRealm({
  selectedId,
  quality,
  showOrbits,
  onSelect,
}: CosmicRealmProps) {
  const milkyWayMatRef = useRef<THREE.ShaderMaterial>(null);
  const milkyWayGroupRef = useRef<THREE.Group>(null);
  const coreDiscRef = useRef<THREE.Mesh>(null);
  const [coreHovered, setCoreHovered] = useState(false);

  const starSystems = useMemo(
    () => CELESTIAL_BODIES.filter((b) => b.scaleTier === 'interstellar'),
    []
  );
  const milkyWayCore = useMemo(
    () => CELESTIAL_BODIES.find((b) => b.id === 'milky-way-core')!,
    []
  );
  const andromeda = useMemo(
    () => CELESTIAL_BODIES.find((b) => b.id === 'andromeda-galaxy')!,
    []
  );
  const whirlpool = useMemo(
    () => CELESTIAL_BODIES.find((b) => b.id === 'whirlpool-galaxy')!,
    []
  );

  const mwCount = quality === 'eco' ? 4500 : quality === 'balanced' ? 9000 : 14500;

  const { mwGeo, mwMat, coreGlowTex, clusterGeo, clusterMat, deepNebulae } =
    useMemo(() => {
      const g = buildSpiralGalaxyGeometry(
        mwCount,
        185000,
        4,
        5.2,
        8812,
        '#FEF3C7',
        '#38BDF8',
        '#A78BFA',
        0.055
      );
      const m = createGalaxyPointsMaterial(52000);
      m.uniforms.uOpacity.value = 0.06;

      const cTex = createSoftGlowTexture(
        'rgba(255, 250, 215, 0.98)',
        'rgba(251, 191, 36, 0.45)',
        'rgba(245, 158, 11, 0)'
      );

      // 160 distant background cosmic galaxies shimmering across outer intergalactic space
      const rand = createSeededRandom(31415);
      const clusterCount = quality === 'eco' ? 90 : 160;
      const cPos = new Float32Array(clusterCount * 3);
      const cCol = new Float32Array(clusterCount * 3);
      const cSize = new Float32Array(clusterCount);
      const gPalette = [
        new THREE.Color('#C4B5FD'),
        new THREE.Color('#7DD3FC'),
        new THREE.Color('#FDE68A'),
        new THREE.Color('#F9A8D4'),
        new THREE.Color('#99F6E4'),
      ];
      for (let i = 0; i < clusterCount; i++) {
        const r = 340000 + rand() * 340000;
        const theta = rand() * Math.PI * 2;
        const phi = Math.acos(2 * rand() - 1);
        cPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        cPos[i * 3 + 1] = r * Math.cos(phi);
        cPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        const col = gPalette[Math.floor(rand() * gPalette.length)];
        cCol[i * 3] = col.r;
        cCol[i * 3 + 1] = col.g;
        cCol[i * 3 + 2] = col.b;
        cSize[i] = 4.2 + rand() * 6.8;
      }
      const cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.BufferAttribute(cPos, 3));
      cg.setAttribute('aColor', new THREE.BufferAttribute(cCol, 3));
      cg.setAttribute('aSize', new THREE.BufferAttribute(cSize, 1));
      const cm = createGalaxyPointsMaterial(165000);
      cm.uniforms.uOpacity.value = 0.52;

      // Subtle distant interstellar nebulae positioned far beyond the Solar System
      // so inner solar space remains pure deep black (#000000)
      const nebSpecs = [
        {
          pos: [52000, 12000, 14000] as [number, number, number],
          scale: 24000,
          tex: createSoftGlowTexture(
            'rgba(244, 114, 182, 0.24)',
            'rgba(139, 92, 246, 0.08)'
          ),
        },
        {
          pos: [-54000, -10000, 9500] as [number, number, number],
          scale: 26000,
          tex: createSoftGlowTexture(
            'rgba(56, 189, 248, 0.22)',
            'rgba(14, 165, 233, 0.07)'
          ),
        },
        {
          pos: [4500, 14000, -62000] as [number, number, number],
          scale: 28000,
          tex: createSoftGlowTexture(
            'rgba(251, 191, 36, 0.2)',
            'rgba(249, 115, 22, 0.06)'
          ),
        },
      ];

      return {
        mwGeo: g,
        mwMat: m,
        coreGlowTex: cTex,
        clusterGeo: cg,
        clusterMat: cm,
        deepNebulae: nebSpecs,
      };
    }, [mwCount, quality]);

  useEffect(() => {
    return () => {
      mwGeo.dispose();
      mwMat.dispose();
      coreGlowTex.dispose();
      clusterGeo.dispose();
      clusterMat.dispose();
      deepNebulae.forEach((n) => n.tex.dispose());
    };
  }, [mwGeo, mwMat, coreGlowTex, clusterGeo, clusterMat, deepNebulae]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const camDist = state.camera.position.length();

    if (milkyWayMatRef.current) {
      const targetOpacity = THREE.MathUtils.clamp(
        0.08 + (camDist - 16000) / 69000,
        0.08,
        0.92
      );
      milkyWayMatRef.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
        milkyWayMatRef.current.uniforms.uOpacity.value,
        targetOpacity,
        4,
        dt
      );
    }

    if (milkyWayGroupRef.current && !worldState.isPaused) {
      milkyWayGroupRef.current.rotation.y += dt * 0.004;
    }

    if (coreDiscRef.current && !worldState.isPaused) {
      coreDiscRef.current.rotation.z += dt * 0.32;
    }
  });

  const corePos = milkyWayCore.cosmicPos ?? [0, 3000, -125000];

  return (
    <group>
      {starSystems.map((sys) => (
        <NeighborStarSystem
          key={sys.id}
          data={sys}
          isSelected={selectedId === sys.id}
          showOrbits={showOrbits}
          onSelect={onSelect}
        />
      ))}

      {deepNebulae.map((neb, idx) => (
        <sprite
          key={idx}
          position={neb.pos}
          scale={[neb.scale, neb.scale * 0.72, 1]}
        >
          <spriteMaterial
            map={neb.tex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.42}
          />
        </sprite>
      ))}

      {/* Level 4: Milky Way 4-Arm Spiral Galaxy & Clickable Galactic Core */}
      <group position={corePos}>
        <group ref={milkyWayGroupRef} rotation={[0.14, 0, -0.08]}>
          <points geometry={mwGeo} frustumCulled={false}>
            <primitive object={mwMat} ref={milkyWayMatRef} attach="material" />
          </points>
        </group>

        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelect('milky-way-core');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setCoreHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setCoreHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh>
            <icosahedronGeometry args={[1250, 2]} />
            <meshBasicMaterial color="#FEF9C3" />
          </mesh>
          <mesh ref={coreDiscRef} rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[1800, 4200, 32]} />
            <meshBasicMaterial
              color="#FBBF24"
              transparent
              opacity={0.42}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <sprite scale={[24000, 24000, 1]}>
            <spriteMaterial
              map={coreGlowTex}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              opacity={0.9}
            />
          </sprite>

          {(coreHovered || selectedId === 'milky-way-core') && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[4600, 5200, 36]} />
              <meshBasicMaterial
                color="#38BDF8"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      </group>

      <DistantSpiralGalaxy
        data={andromeda}
        quality={quality}
        isSelected={selectedId === 'andromeda-galaxy'}
        onSelect={onSelect}
        armColorA="#A78BFA"
        armColorB="#38BDF8"
        seed={9021}
      />

      <DistantSpiralGalaxy
        data={whirlpool}
        quality={quality}
        isSelected={selectedId === 'whirlpool-galaxy'}
        onSelect={onSelect}
        armColorA="#F472B6"
        armColorB="#38BDF8"
        seed={7419}
      />

      <points geometry={clusterGeo} material={clusterMat} frustumCulled={false} />
    </group>
  );
}
