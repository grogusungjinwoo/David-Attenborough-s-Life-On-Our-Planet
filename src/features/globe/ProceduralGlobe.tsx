import { Html } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  SRGBColorSpace,
  TextureLoader
} from "three";
import type { Mesh } from "three";
import type { RegionRecord, SpeciesRecord, WorldSnapshot, ZooSite } from "../../domain/types";
import { SurfaceInstances } from "./SurfaceInstances";
import { latLonToVector3, makeClusteredSurfacePoints } from "./spherical";

type ProceduralGlobeProps = {
  snapshot: WorldSnapshot;
  regions: RegionRecord[];
  species: SpeciesRecord[];
  zoos: ZooSite[];
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
};

const forestClusters = [
  { lat: -4, lon: -62, latSpread: 18, lonSpread: 42 },
  { lat: -2, lon: 22, latSpread: 18, lonSpread: 34 },
  { lat: 1, lon: 113, latSpread: 16, lonSpread: 34 },
  { lat: 55, lon: 90, latSpread: 22, lonSpread: 70 },
  { lat: 48, lon: -85, latSpread: 18, lonSpread: 44 }
];

const settlementClusters = [
  { lat: 41, lon: -74, latSpread: 18, lonSpread: 28 },
  { lat: 50, lon: 8, latSpread: 18, lonSpread: 38 },
  { lat: 35, lon: 116, latSpread: 24, lonSpread: 42 },
  { lat: 22, lon: 78, latSpread: 22, lonSpread: 32 },
  { lat: -23, lon: -46, latSpread: 20, lonSpread: 34 }
];

const mountainClusters = [
  { lat: 31, lon: 82, latSpread: 12, lonSpread: 42 },
  { lat: -15, lon: -72, latSpread: 35, lonSpread: 16 },
  { lat: 40, lon: -110, latSpread: 20, lonSpread: 22 },
  { lat: 46, lon: 10, latSpread: 10, lonSpread: 20 }
];

const waterStressClusters = [
  { lat: 24, lon: 15, latSpread: 18, lonSpread: 40 },
  { lat: 30, lon: 45, latSpread: 16, lonSpread: 42 },
  { lat: -25, lon: 135, latSpread: 18, lonSpread: 38 },
  { lat: 36, lon: -115, latSpread: 14, lonSpread: 24 }
];

const earthDayUrl = new URL("../../assets/earth/earth-day-noclouds.jpg", import.meta.url).href;
const earthCloudsUrl = new URL("../../assets/earth/earth-day-clouds.jpg", import.meta.url).href;
const earthNightUrl = new URL("../../assets/earth/earth-night-lights.jpg", import.meta.url).href;

export function ProceduralGlobe({
  snapshot,
  regions,
  species,
  zoos,
  selectedRegionId,
  selectedSpeciesId,
  selectedZooId,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo
}: ProceduralGlobeProps) {
  const densities = snapshot.proceduralDensity;
  const cloudRef = useRef<Mesh>(null);
  const { gl } = useThree();
  const [dayTexture, cloudTexture, nightTexture] = useLoader(TextureLoader, [
    earthDayUrl,
    earthCloudsUrl,
    earthNightUrl
  ]);

  const treePoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 9173,
        count: Math.round(950 * densities.trees),
        clusters: forestClusters,
        minScale: 0.28,
        maxScale: 0.92
      }),
    [densities.trees]
  );

  const buildingPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 11279,
        count: Math.round(740 * densities.buildings),
        clusters: settlementClusters,
        minScale: 0.24,
        maxScale: 0.78
      }),
    [densities.buildings]
  );

  const mountainPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 8221,
        count: 170,
        clusters: mountainClusters,
        minScale: 0.34,
        maxScale: 0.98
      }),
    []
  );

  const waterStressPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 6203,
        count: Math.round(210 * densities.waterStress),
        clusters: waterStressClusters,
        minScale: 0.35,
        maxScale: 1
      }),
    [densities.waterStress]
  );

  useEffect(() => {
    for (const texture of [dayTexture, cloudTexture, nightTexture]) {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = Math.min(12, gl.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    }
  }, [cloudTexture, dayTexture, gl, nightTexture]);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.012;
    }
  });

  return (
    <group rotation={[0.06, -1.18, -0.035]}>
      <mesh>
        <sphereGeometry args={[1, 192, 192]} />
        <meshStandardMaterial
          color={new Color("#f8fbff")}
          map={dayTexture}
          bumpMap={dayTexture}
          bumpScale={0.008}
          roughness={0.88}
          metalness={0.03}
          emissive="#010b12"
          emissiveIntensity={0.08}
        />
      </mesh>

      {snapshot.layers.oceans ? (
        <mesh>
          <sphereGeometry args={[1.003, 192, 192]} />
          <meshStandardMaterial
            color="#55b7d8"
            transparent
            opacity={0.09}
            roughness={0.58}
            metalness={0.08}
          />
        </mesh>
      ) : null}

      {snapshot.layers.population || snapshot.layers.settlements ? (
        <mesh scale={1.006}>
          <sphereGeometry args={[1, 192, 192]} />
          <meshBasicMaterial
            map={nightTexture}
            color="#ffd89a"
            transparent
            opacity={0.72}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {snapshot.layers.atmosphere ? (
        <mesh ref={cloudRef} scale={1.011}>
          <sphereGeometry args={[1, 192, 192]} />
          <meshBasicMaterial
            map={cloudTexture}
            color="#ffffff"
            transparent
            opacity={0.2}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {snapshot.layers.vegetation ? (
        <SurfaceInstances points={treePoints} radius={1.018} scaleMultiplier={0.0026}>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial
            color="#78d180"
            emissive="#123c23"
            emissiveIntensity={0.2}
            roughness={0.8}
            transparent
            opacity={0.36}
          />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.mountains ? (
        <SurfaceInstances points={mountainPoints} radius={1.02} scaleMultiplier={0.0032}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial color="#e2d6ba" roughness={0.94} transparent opacity={0.3} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.settlements ? (
        <SurfaceInstances points={buildingPoints} radius={1.022} scaleMultiplier={0.0028}>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial
            color="#ffd17a"
            emissive="#b16f22"
            emissiveIntensity={0.42}
            roughness={0.74}
            metalness={0.06}
            transparent
            opacity={0.42}
          />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.atmosphere ? (
        <mesh scale={1.085}>
          <sphereGeometry args={[1, 128, 128]} />
          <meshBasicMaterial
            color="#7ad7ff"
            side={BackSide}
            transparent
            opacity={0.16}
            blending={AdditiveBlending}
          />
        </mesh>
      ) : null}

      {snapshot.layers.energy ? (
        <SurfaceInstances points={waterStressPoints} radius={1.028} scaleMultiplier={0.0038}>
          <torusGeometry args={[0.7, 0.08, 8, 18]} />
          <meshStandardMaterial color="#f2a35e" emissive="#ad4f2f" emissiveIntensity={0.24} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.species
        ? regions.map((region) => {
            const regionSpecies = species.filter((record) =>
              record.regionIds.includes(region.id)
            );
            const isSelected =
              selectedRegionId === region.id ||
              regionSpecies.some((record) => record.id === selectedSpeciesId);

            return (
              <GlobeMarker
                key={region.id}
                lat={region.lat}
                lon={region.lon}
                color={isSelected ? "#f4d35e" : "#89e6a2"}
                label={region.name}
                selected={isSelected}
                testId={`region-marker-${region.id}`}
                onClick={() => {
                  onSelectRegion(region.id);
                  onSelectSpecies(regionSpecies[0]?.id);
                }}
              />
            );
          })
        : null}

      {snapshot.layers.zoos
        ? zoos
            .filter((zoo) => !zoo.openedYear || zoo.openedYear <= snapshot.year)
            .map((zoo) => (
              <GlobeMarker
                key={zoo.id}
                lat={zoo.lat}
                lon={zoo.lon}
                color={selectedZooId === zoo.id ? "#ff8b7a" : "#f3c26b"}
                label={zoo.name}
                selected={selectedZooId === zoo.id}
                testId={`zoo-marker-${zoo.id}`}
                onClick={() => onSelectZoo(zoo.id)}
              />
            ))
        : null}
    </group>
  );
}

type GlobeMarkerProps = {
  lat: number;
  lon: number;
  label: string;
  color: string;
  selected: boolean;
  testId: string;
  onClick: () => void;
};

function GlobeMarker({
  lat,
  lon,
  label,
  color,
  selected,
  testId,
  onClick
}: GlobeMarkerProps) {
  const position = latLonToVector3(lat, lon, selected ? 1.125 : 1.105);

  return (
    <group position={position}>
      <mesh
        data-testid={testId}
        scale={selected ? 0.024 : 0.017}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={selected ? 0.48 : 0.22}
          roughness={0.35}
        />
      </mesh>
      {selected ? (
        <Html center distanceFactor={9.2} className="globe-marker-label">
          {label}
        </Html>
      ) : null}
    </group>
  );
}
