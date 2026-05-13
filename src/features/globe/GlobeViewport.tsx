import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { MathUtils } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { RegionRecord, SpeciesRecord, WorldSnapshot, ZooSite } from "../../domain/types";
import { ProceduralGlobe } from "./ProceduralGlobe";

type GlobeViewportProps = {
  snapshot: WorldSnapshot;
  regions: RegionRecord[];
  species: SpeciesRecord[];
  zoos: ZooSite[];
  zoomScalar: number;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
};

export function GlobeViewport(props: GlobeViewportProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <section className="globe-viewport" aria-label="Interactive simulated globe">
      <Canvas
        data-testid="globe-canvas"
        camera={{ position: [0.34, 0.18, 3.9], fov: 39, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
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
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.23}
          minDistance={2.8}
          maxDistance={6.1}
        />
        <CameraRig controlsRef={controlsRef} zoomScalar={props.zoomScalar} />
      </Canvas>
    </section>
  );
}

type CameraRigProps = {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  zoomScalar: number;
};

function CameraRig({ controlsRef, zoomScalar }: CameraRigProps) {
  const { camera } = useThree();

  useFrame(() => {
    const targetDistance = MathUtils.lerp(3.82, 2.28, zoomScalar);
    const currentDistance = camera.position.length();
    const nextDistance = MathUtils.lerp(currentDistance, targetDistance, 0.08);

    camera.position.setLength(nextDistance);
    controlsRef.current?.update();
  });

  return null;
}
