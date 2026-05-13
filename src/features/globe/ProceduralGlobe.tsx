import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { AdditiveBlending, BackSide, Color } from "three";
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

const continentClusters = [
  { lat: 45, lon: -100, latSpread: 34, lonSpread: 70 },
  { lat: -15, lon: -60, latSpread: 46, lonSpread: 42 },
  { lat: 8, lon: 20, latSpread: 55, lonSpread: 44 },
  { lat: 48, lon: 65, latSpread: 38, lonSpread: 95 },
  { lat: 24, lon: 105, latSpread: 34, lonSpread: 55 },
  { lat: -25, lon: 134, latSpread: 24, lonSpread: 34 }
];

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

  const landPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 4000,
        count: 520,
        clusters: continentClusters,
        minScale: 0.55,
        maxScale: 1.35
      }),
    []
  );

  const treePoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: snapshot.year * 17,
        count: Math.round(420 * densities.trees),
        clusters: forestClusters,
        minScale: 0.65,
        maxScale: 1.6
      }),
    [densities.trees, snapshot.year]
  );

  const buildingPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: snapshot.year * 23,
        count: Math.round(300 * densities.buildings),
        clusters: settlementClusters,
        minScale: 0.5,
        maxScale: 1.25
      }),
    [densities.buildings, snapshot.year]
  );

  const mountainPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: 8221,
        count: 86,
        clusters: mountainClusters,
        minScale: 0.8,
        maxScale: 1.7
      }),
    []
  );

  const waterStressPoints = useMemo(
    () =>
      makeClusteredSurfacePoints({
        seed: snapshot.year * 31,
        count: Math.round(130 * densities.waterStress),
        clusters: waterStressClusters,
        minScale: 0.75,
        maxScale: 1.9
      }),
    [densities.waterStress, snapshot.year]
  );

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          color={new Color("#0c4162")}
          roughness={0.88}
          metalness={0.04}
          emissive="#031626"
          emissiveIntensity={0.24}
        />
      </mesh>

      <SurfaceInstances points={landPoints} radius={1.006} scaleMultiplier={0.018}>
        <cylinderGeometry args={[1.3, 1.45, 0.34, 8]} />
        <meshStandardMaterial color="#5c7d47" roughness={0.95} />
      </SurfaceInstances>

      {snapshot.layers.oceans ? (
        <mesh>
          <sphereGeometry args={[1.012, 96, 96]} />
          <meshStandardMaterial
            color="#0d5c80"
            transparent
            opacity={0.34}
            roughness={0.58}
            metalness={0.08}
          />
        </mesh>
      ) : null}

      {snapshot.layers.vegetation ? (
        <SurfaceInstances points={treePoints} radius={1.045} scaleMultiplier={0.014}>
          <coneGeometry args={[0.75, 2.2, 7]} />
          <meshStandardMaterial color="#54a264" roughness={0.8} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.mountains ? (
        <SurfaceInstances points={mountainPoints} radius={1.05} scaleMultiplier={0.022}>
          <coneGeometry args={[0.95, 2.4, 4]} />
          <meshStandardMaterial color="#9a9385" roughness={0.92} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.settlements ? (
        <SurfaceInstances points={buildingPoints} radius={1.052} scaleMultiplier={0.016}>
          <boxGeometry args={[0.85, 2.35, 0.85]} />
          <meshStandardMaterial color="#d7bd78" roughness={0.72} metalness={0.08} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.atmosphere ? (
        <mesh scale={1.085}>
          <sphereGeometry args={[1, 96, 96]} />
          <meshBasicMaterial
            color="#7ad7ff"
            side={BackSide}
            transparent
            opacity={0.14}
            blending={AdditiveBlending}
          />
        </mesh>
      ) : null}

      {snapshot.layers.energy ? (
        <SurfaceInstances points={waterStressPoints} radius={1.073} scaleMultiplier={0.013}>
          <torusGeometry args={[0.7, 0.08, 8, 18]} />
          <meshStandardMaterial color="#f2a35e" emissive="#ad4f2f" emissiveIntensity={0.2} />
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
  const position = latLonToVector3(lat, lon, selected ? 1.17 : 1.13);

  return (
    <group position={position}>
      <mesh
        data-testid={testId}
        scale={selected ? 0.052 : 0.037}
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
        <Html center distanceFactor={7.4} className="globe-marker-label">
          {label}
        </Html>
      ) : null}
    </group>
  );
}
