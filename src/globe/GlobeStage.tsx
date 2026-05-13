import { Html, OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type ReactNode
} from "react";
import {
  AdditiveBlending,
  BackSide,
  InstancedMesh,
  MathUtils,
  Object3D,
  Vector3,
  type Group
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getWorldSnapshot, type WorldSnapshot } from "../domain/storyModel";
import {
  buildGlobeMarkers,
  buildSurfacePoints,
  type GlobeMarker,
  type SurfaceTuple
} from "./markerHelpers";

export type GlobeStageProps = {
  year?: number;
  snapshot?: WorldSnapshot;
  zoomScalar?: number;
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  fallbackLabel?: string;
};

const DEFAULT_YEAR = 2020;
const UP = new Vector3(0, 1, 0);

const stageStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  minHeight: 420,
  overflow: "hidden",
  background: "#05070d"
};

const canvasStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%"
};

const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0
};

const fallbackStyle: CSSProperties = {
  display: "grid",
  minHeight: 420,
  placeItems: "center",
  padding: 24,
  color: "#dceeff",
  background: "#05070d",
  font: "600 0.95rem/1.4 system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  textAlign: "center"
};

const markerLabelStyle: CSSProperties = {
  padding: "3px 6px",
  border: "1px solid rgba(210, 232, 255, 0.32)",
  borderRadius: 4,
  color: "#eff8ff",
  background: "rgba(5, 8, 14, 0.74)",
  boxShadow: "0 8px 18px rgba(0, 0, 0, 0.28)",
  font: "600 10px/1.2 system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  pointerEvents: "none",
  whiteSpace: "nowrap"
};

const markerStyles: Record<
  GlobeMarker["kind"],
  { color: string; emissive: string; scale: number; label: boolean }
> = {
  "wild-space": {
    color: "#6eea7f",
    emissive: "#1f7f47",
    scale: 0.032,
    label: false
  },
  city: {
    color: "#f2c36d",
    emissive: "#9c5d1c",
    scale: 0.032,
    label: false
  },
  species: {
    color: "#ff8b63",
    emissive: "#9c301c",
    scale: 0.04,
    label: true
  },
  zoo: {
    color: "#8fdcff",
    emissive: "#1d5e85",
    scale: 0.036,
    label: true
  }
};

export function GlobeStage({
  year = DEFAULT_YEAR,
  snapshot,
  zoomScalar = 0.18,
  animate = true,
  className,
  style,
  ariaLabel,
  fallbackLabel
}: GlobeStageProps) {
  const labelId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const resolvedSnapshot = useMemo(
    () => snapshot ?? getWorldSnapshot(year),
    [snapshot, year]
  );
  const shouldAnimate = animate && !prefersReducedMotion;
  const accessibleLabel =
    ariaLabel ??
    `Interactive simulated Earth for ${resolvedSnapshot.year} with ocean, land, wild-space, city, species, and zoo markers.`;

  return (
    <section
      className={className}
      style={{ ...stageStyle, ...style }}
      aria-labelledby={labelId}
    >
      <span id={labelId} style={visuallyHiddenStyle}>
        {accessibleLabel}
      </span>
      <Canvas
        data-testid="globe-stage-canvas"
        aria-describedby={labelId}
        camera={{ position: [0.35, 0.24, 3.4], fov: 43, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        style={canvasStyle}
        fallback={<div style={fallbackStyle}>{fallbackLabel ?? accessibleLabel}</div>}
      >
        <color attach="background" args={["#05070d"]} />
        <fog attach="fog" args={["#05070d", 4.4, 8.2]} />
        <ambientLight intensity={0.52} />
        <directionalLight position={[4, 2.8, 3.2]} intensity={2.1} color="#fff1d0" />
        <pointLight position={[-3, -2, -1]} intensity={0.85} color="#7ad7ff" />
        <Stars radius={44} depth={34} count={1500} factor={2.6} saturation={0.38} fade />
        <Suspense fallback={null}>
          <GlobeScene snapshot={resolvedSnapshot} animate={shouldAnimate} />
        </Suspense>
        <OrbitController animate={shouldAnimate} zoomScalar={zoomScalar} />
      </Canvas>
    </section>
  );
}

type GlobeSceneProps = {
  snapshot: WorldSnapshot;
  animate: boolean;
};

function GlobeScene({ snapshot, animate }: GlobeSceneProps) {
  const groupRef = useRef<Group>(null);
  const surfaces = useMemo(() => buildSurfacePoints(snapshot), [snapshot]);
  const markers = useMemo(() => buildGlobeMarkers(snapshot), [snapshot]);
  const carbonPressure = MathUtils.clamp(
    ((snapshot.metrics.atmosphericCarbonPpm ?? 280) - 280) / 150,
    0,
    1
  );

  useFrame((state, delta) => {
    if (!animate || !groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * 0.045;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.014;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          color="#0c4265"
          roughness={0.88}
          metalness={0.04}
          emissive="#031626"
          emissiveIntensity={0.24 + carbonPressure * 0.08}
        />
      </mesh>

      <SurfaceInstances points={surfaces.land} scaleMultiplier={0.018}>
        <cylinderGeometry args={[1.28, 1.45, 0.32, 8]} />
        <meshStandardMaterial color="#5c7d47" roughness={0.95} />
      </SurfaceInstances>

      <mesh scale={1.012}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          color="#0d5c80"
          transparent
          opacity={0.34}
          roughness={0.58}
          metalness={0.08}
        />
      </mesh>

      <SurfaceInstances points={surfaces.wildSpace} scaleMultiplier={0.014}>
        <coneGeometry args={[0.75, 2.2, 7]} />
        <meshStandardMaterial color="#54a264" roughness={0.8} />
      </SurfaceInstances>

      <SurfaceInstances points={surfaces.cities} scaleMultiplier={0.016}>
        <boxGeometry args={[0.85, 2.35, 0.85]} />
        <meshStandardMaterial color="#d7bd78" roughness={0.72} metalness={0.08} />
      </SurfaceInstances>

      <SurfaceInstances points={surfaces.waterStress} scaleMultiplier={0.013}>
        <torusGeometry args={[0.7, 0.08, 8, 18]} />
        <meshStandardMaterial color="#f2a35e" emissive="#ad4f2f" emissiveIntensity={0.2} />
      </SurfaceInstances>

      <mesh scale={1.085}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshBasicMaterial
          color="#7ad7ff"
          side={BackSide}
          transparent
          opacity={0.13 + carbonPressure * 0.08}
          blending={AdditiveBlending}
        />
      </mesh>

      {markers.map((marker) => (
        <MarkerPin key={marker.id} marker={marker} />
      ))}
    </group>
  );
}

type SurfaceInstancesProps = {
  points: SurfaceTuple[];
  scaleMultiplier: number;
  children: ReactNode;
};

function SurfaceInstances({ points, scaleMultiplier, children }: SurfaceInstancesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    points.forEach((point, index) => {
      const position = new Vector3(...point);
      const normal = position.clone().normalize();

      dummy.position.copy(position);
      dummy.quaternion.setFromUnitVectors(UP, normal);
      dummy.scale.setScalar(scaleMultiplier);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [dummy, points, scaleMultiplier]);

  if (points.length === 0) {
    return null;
  }

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, points.length]}>
      {children}
    </instancedMesh>
  );
}

function MarkerPin({ marker }: { marker: GlobeMarker }) {
  const style = markerStyles[marker.kind];

  return (
    <group position={marker.position}>
      <mesh scale={style.scale}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissive}
          emissiveIntensity={marker.kind === "species" ? 0.52 : 0.34}
          roughness={0.35}
        />
      </mesh>
      {style.label ? (
        <Html center distanceFactor={7.2} style={markerLabelStyle}>
          {marker.label}
        </Html>
      ) : null}
    </group>
  );
}

type OrbitControllerProps = {
  animate: boolean;
  zoomScalar: number;
};

function OrbitController({ animate, zoomScalar }: OrbitControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={animate}
        autoRotateSpeed={0.18}
        minDistance={1.9}
        maxDistance={5.2}
      />
      <CameraRig controlsRef={controlsRef} zoomScalar={zoomScalar} />
    </>
  );
}

type CameraRigProps = {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  zoomScalar: number;
};

function CameraRig({ controlsRef, zoomScalar }: CameraRigProps) {
  const { camera } = useThree();

  useFrame(() => {
    const clampedZoom = MathUtils.clamp(zoomScalar, 0, 1);
    const targetDistance = MathUtils.lerp(4.65, 2.15, clampedZoom);
    const currentDistance = camera.position.length();
    const nextDistance = MathUtils.lerp(currentDistance, targetDistance, 0.08);

    camera.position.setLength(nextDistance);
    controlsRef.current?.update();
  });

  return null;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);

    updatePreference();
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}
