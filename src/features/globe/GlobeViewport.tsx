import { Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { KeyboardEvent, MouseEvent, PointerEvent, TouchEvent, WheelEvent } from "react";
import { Suspense, useMemo, useRef } from "react";
import type {
  GeoChangeLayerId,
  GeoChangeSnapshot,
  GlobeViewState,
  RegionRecord,
  SpeciesRecord,
  WorldSnapshot,
  ZooSite
} from "../../domain/types";
import { ProceduralGlobe } from "./ProceduralGlobe";
import { globeViewToCameraPosition, wrapLongitude } from "./spherical";

type GlobeViewportProps = {
  snapshot: WorldSnapshot;
  regions: RegionRecord[];
  species: SpeciesRecord[];
  zoos: ZooSite[];
  globeView: GlobeViewState;
  activeGeoChangeLayer?: GeoChangeLayerId;
  geoChangeSnapshot?: GeoChangeSnapshot;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onPanGlobeView: (longitudeDeltaDeg: number, latitudeDeltaDeg: number) => void;
  onZoomGlobeView: (delta: number) => void;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
};

export function GlobeViewport(props: GlobeViewportProps) {
  const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const pinchRef = useRef<number | null>(null);
  const dpr = useMemo(() => resolveDpr(props.globeView.quality), [props.globeView.quality]);
  const displayLongitude = wrapLongitude(props.globeView.longitudeDeg).toFixed(1);
  const displayLatitude = props.globeView.latitudeDeg.toFixed(1);
  const displayZoom = props.globeView.zoomScalar.toFixed(2);

  const panFromPointer = (event: PointerEvent<HTMLElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    props.onPanGlobeView(-deltaX * 0.18, deltaY * 0.12);
  };
  const panFromMouse = (event: MouseEvent<HTMLElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== -1) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY, pointerId: -1 };
    props.onPanGlobeView(-deltaX * 0.18, deltaY * 0.12);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keyActions: Record<string, () => void> = {
      ArrowLeft: () => props.onPanGlobeView(-4, 0),
      ArrowRight: () => props.onPanGlobeView(4, 0),
      ArrowUp: () => props.onPanGlobeView(0, 3),
      ArrowDown: () => props.onPanGlobeView(0, -3),
      "+": () => props.onZoomGlobeView(0.08),
      "=": () => props.onZoomGlobeView(0.08),
      "-": () => props.onZoomGlobeView(-0.08)
    };
    const action = keyActions[event.key];

    if (action) {
      event.preventDefault();
      action();
    }
  };

  const handleTouchMove = (event: TouchEvent<HTMLElement>) => {
    if (event.touches.length !== 2) {
      pinchRef.current = null;
      return;
    }

    const [first, second] = [event.touches[0], event.touches[1]];
    const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

    if (pinchRef.current !== null) {
      props.onZoomGlobeView((distance - pinchRef.current) * 0.002);
    }

    pinchRef.current = distance;
  };

  return (
    <section
      className="globe-viewport"
      data-testid="globe-viewport"
      data-active-view={props.globeView.activeView}
      data-longitude={displayLongitude}
      data-latitude={displayLatitude}
      data-zoom={displayZoom}
      aria-label="Interactive simulated globe"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Canvas
        data-testid="globe-canvas"
        camera={{ position: [0.34, 0.18, 3.9], fov: 39, near: 0.1, far: 100 }}
        dpr={dpr}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        fallback={
          <div className="globe-fallback" role="status">
            3D globe unavailable in this browser. Timeline and source panels remain available.
          </div>
        }
      >
        <color attach="background" args={["#05070d"]} />
        <fog attach="fog" args={["#05070d", 4.8, 8.5]} />
        <ambientLight intensity={0.32} />
        <directionalLight position={[4.2, 2.8, 3.4]} intensity={2.85} color="#fff3d7" />
        <pointLight position={[-3.4, -2.1, -1.2]} intensity={0.82} color="#7ad7ff" />
        <Stars radius={54} depth={38} count={3600} factor={2.25} saturation={0.45} fade />
        <Suspense fallback={null}>
          <ProceduralGlobe {...props} />
        </Suspense>
        <CameraRig globeView={props.globeView} />
      </Canvas>
      <div
        className="globe-input-layer"
        aria-hidden="true"
        onPointerDown={(event) => {
          event.preventDefault();
          dragRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={panFromPointer}
        onPointerUp={(event) => {
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          dragRef.current = { x: event.clientX, y: event.clientY, pointerId: -1 };
        }}
        onMouseMove={panFromMouse}
        onMouseUp={() => {
          dragRef.current = null;
        }}
        onMouseLeave={() => {
          dragRef.current = null;
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          pinchRef.current = null;
        }}
        onWheel={(event: WheelEvent<HTMLElement>) => {
          props.onZoomGlobeView(event.deltaY < 0 ? 0.08 : -0.08);
        }}
      />
    </section>
  );
}

type CameraRigProps = {
  globeView: GlobeViewState;
};

function CameraRig({ globeView }: CameraRigProps) {
  const { camera } = useThree();

  useFrame(() => {
    const targetPosition = globeViewToCameraPosition(globeView);

    camera.position.lerp(targetPosition, 0.12);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function resolveDpr(quality: GlobeViewState["quality"]): [number, number] {
  if (quality === "performance") {
    return [1, 1.35];
  }

  if (quality === "high") {
    return [1, 2.25];
  }

  const coarsePointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(pointer: coarse)").matches;

  return coarsePointer ? [1, 1.5] : [1, 2];
}
