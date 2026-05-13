import { Html, Line } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BackSide,
  Color,
  MathUtils,
  SRGBColorSpace,
  TextureLoader
} from "three";
import type { Mesh } from "three";
import type {
  GeoChangeLayerId,
  GeoChangeSnapshot,
  GlobeViewState,
  RegionRecord,
  SpeciesRecord,
  WorldSnapshot,
  ZooSite
} from "../../domain/types";
import { SurfaceInstances } from "./SurfaceInstances";
import { latLonToVector3, makeClusteredSurfacePoints } from "./spherical";

type ProceduralGlobeProps = {
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
  globeView,
  activeGeoChangeLayer,
  geoChangeSnapshot,
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
  const surface = snapshot.earthSurface;
  const activeView = globeView.activeView;
  const closeLabels = globeView.zoomScalar > 0.64 || activeView === "admin-regions";
  const cloudRef = useRef<Mesh>(null);
  const { gl } = useThree();
  const [dayTexture, cloudTexture, nightTexture] = useLoader(TextureLoader, [
    earthDayUrl,
    earthCloudsUrl,
    earthNightUrl
  ]);

  const surfacePalette = useMemo(() => {
    const vegetation = clamp01(surface.vegetationIndex);
    const heat = clamp01(surface.oceanHeatIndex);
    const human = clamp01(surface.humanExposureIndex);
    const landColor = new Color(activeView === "topographic" ? "#f4e7c6" : "#d6c394");
    landColor.lerp(new Color("#72b96e"), activeView === "topographic" ? vegetation * 0.35 : vegetation);
    landColor.lerp(new Color("#b68e63"), human * 0.34);

    return {
      landColor,
      oceanColor: new Color("#2c7fa5").lerp(new Color("#5fb8dd"), 1 - heat),
      agricultureColor: new Color("#d3b76b").lerp(new Color("#c68f54"), human),
      forestColor: new Color("#6ec36d").lerp(new Color("#355f3c"), 1 - vegetation),
      nightOpacity: MathUtils.lerp(0.1, 0.78, clamp01(surface.nightLightIndex)),
      cloudOpacity: MathUtils.lerp(0.12, 0.34, clamp01(surface.cloudOpacity)),
      waterOpacity: MathUtils.lerp(0.06, 0.2, heat),
      agricultureOpacity: MathUtils.lerp(0.02, 0.18, human),
      atmosphereOpacity: MathUtils.lerp(0.12, 0.22, clamp01(surface.weatherEnergyIndex)),
      forestOpacity: MathUtils.lerp(0.05, 0.2, vegetation)
    };
  }, [activeView, surface]);

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
    <group rotation={[0.02, -0.08, -0.015]}>
      <mesh>
        <sphereGeometry args={[1, 192, 192]} />
        <meshStandardMaterial
          color={surfacePalette.landColor}
          map={dayTexture}
          bumpMap={dayTexture}
          bumpScale={
            activeView === "topographic"
              ? 0.022
              : MathUtils.lerp(0.006, 0.012, clamp01(surface.vegetationIndex))
          }
          roughness={activeView === "topographic" ? 0.96 : 0.88}
          metalness={0.03}
          emissive={activeView === "wild-evidence" ? "#03170e" : "#010b12"}
          emissiveIntensity={activeView === "wild-evidence" ? 0.16 : 0.08}
        />
      </mesh>

      {snapshot.layers.oceans ? (
        <mesh>
          <sphereGeometry args={[1.003, 192, 192]} />
          <meshStandardMaterial
            color={surfacePalette.oceanColor}
            transparent
            opacity={surfacePalette.waterOpacity}
            roughness={0.58}
            metalness={0.08}
          />
        </mesh>
      ) : null}

      {snapshot.layers.vegetation || snapshot.layers.wildSpace ? (
        <mesh scale={1.007}>
          <sphereGeometry args={[1, 192, 192]} />
          <meshBasicMaterial
            color={surfacePalette.forestColor}
            transparent
            opacity={surfacePalette.forestOpacity}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {snapshot.layers.population || snapshot.layers.settlements ? (
        <mesh scale={1.008}>
          <sphereGeometry args={[1, 192, 192]} />
          <meshBasicMaterial
            color={surfacePalette.agricultureColor}
            transparent
            opacity={surfacePalette.agricultureOpacity}
            depthWrite={false}
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
            opacity={surfacePalette.nightOpacity}
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
            opacity={surfacePalette.cloudOpacity}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      {snapshot.layers.topographicRelief || activeView === "topographic" ? (
        <TopographicReliefLines />
      ) : null}

      {snapshot.layers.adminBoundaries || activeView === "admin-regions" ? (
        <AdminBoundaryLines showLabels={closeLabels} />
      ) : null}

      {activeView === "wild-evidence" || snapshot.layers.wildSpace ? (
        <WildEvidenceRings activeView={activeView} />
      ) : null}

      {activeGeoChangeLayer && geoChangeSnapshot ? (
        <GeoChangeGlobeOverlay
          activeLayerId={activeGeoChangeLayer}
          geoChangeSnapshot={geoChangeSnapshot}
        />
      ) : null}

      {snapshot.layers.vegetation ? (
        <SurfaceInstances points={treePoints} radius={1.018} scaleMultiplier={0.0026}>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshStandardMaterial
            color={surfacePalette.forestColor}
            emissive="#123c23"
            emissiveIntensity={0.2}
            roughness={0.8}
            transparent
            opacity={MathUtils.lerp(0.22, 0.44, clamp01(surface.vegetationIndex))}
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
            opacity={surfacePalette.atmosphereOpacity}
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

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

const adminBoundaryPaths = [
  {
    id: "north-america-admin1",
    color: "#f3dfaa",
    points: [
      [49, -124],
      [49, -95],
      [49, -67],
      [42, -82],
      [37, -102],
      [32, -114],
      [26, -99]
    ]
  },
  {
    id: "south-america-admin1",
    color: "#e7d49c",
    points: [
      [5, -75],
      [-5, -66],
      [-16, -64],
      [-23, -58],
      [-34, -65],
      [-46, -72]
    ]
  },
  {
    id: "europe-admin1",
    color: "#f2d99a",
    points: [
      [59, -8],
      [52, 5],
      [49, 15],
      [45, 9],
      [42, 22],
      [39, 33]
    ]
  },
  {
    id: "asia-admin1",
    color: "#e6c984",
    points: [
      [55, 62],
      [44, 78],
      [35, 88],
      [29, 101],
      [24, 116],
      [13, 122]
    ]
  },
  {
    id: "australia-admin1",
    color: "#f0d08b",
    points: [
      [-12, 130],
      [-20, 135],
      [-27, 143],
      [-35, 148],
      [-32, 116]
    ]
  },
  {
    id: "africa-admin1",
    color: "#f1d9a3",
    points: [
      [31, -7],
      [20, 16],
      [10, 24],
      [1, 32],
      [-12, 28],
      [-27, 31],
      [-34, 19]
    ]
  }
] satisfies Array<{ id: string; color: string; points: Array<[number, number]> }>;

const adminLabels = [
  { id: "california", label: "California", lat: 36.7, lon: -119.4 },
  { id: "quebec", label: "Quebec", lat: 52.6, lon: -71.9 },
  { id: "amazonas", label: "Amazonas", lat: -4.2, lon: -63.2 },
  { id: "patagonia", label: "Patagonia", lat: -45.5, lon: -70.8 },
  { id: "rajasthan", label: "Rajasthan", lat: 27.1, lon: 73.4 },
  { id: "sichuan", label: "Sichuan", lat: 30.6, lon: 102.9 },
  { id: "new-south-wales", label: "New South Wales", lat: -32.2, lon: 147.0 },
  { id: "serengeti", label: "Serengeti", lat: -2.3, lon: 34.8 }
];

const topographicPaths = [
  [
    [35, 70],
    [31, 82],
    [29, 91],
    [31, 101],
    [34, 111]
  ],
  [
    [45, -124],
    [39, -116],
    [35, -106],
    [31, -101]
  ],
  [
    [8, -78],
    [-8, -75],
    [-18, -71],
    [-32, -70],
    [-48, -72]
  ],
  [
    [45, 6],
    [46, 11],
    [47, 17],
    [45, 24]
  ],
  [
    [-4, 29],
    [-14, 34],
    [-25, 29],
    [-31, 25]
  ]
] satisfies Array<Array<[number, number]>>;

const wildEvidenceRegions = [
  { label: "Amazon low human footprint", lat: -4, lon: -62, radius: 14, color: "#72d582" },
  { label: "Congo forest core", lat: -1.2, lon: 21.5, radius: 12, color: "#64c799" },
  { label: "Borneo land-cover context", lat: 0.9, lon: 114.4, radius: 9, color: "#a7c85a" },
  { label: "Boreal intact forest", lat: 58, lon: 92, radius: 18, color: "#8fd7c3" },
  { label: "Arctic protected context", lat: 72, lon: -42, radius: 13, color: "#9fd8ff" }
];

function AdminBoundaryLines({ showLabels }: { showLabels: boolean }) {
  return (
    <group>
      {adminBoundaryPaths.map((path) => (
        <Line
          key={path.id}
          points={path.points.map(([lat, lon]) => latLonToVector3(lat, lon, 1.035))}
          color={path.color}
          lineWidth={1.1}
          transparent
          opacity={0.66}
        />
      ))}
      {showLabels
        ? adminLabels.map((label) => (
            <Html
              center
              distanceFactor={8.8}
              className="globe-admin-label"
              key={label.id}
              position={latLonToVector3(label.lat, label.lon, 1.09)}
            >
              {label.label}
            </Html>
          ))
        : null}
    </group>
  );
}

function TopographicReliefLines() {
  return (
    <group>
      {topographicPaths.map((points, index) => (
        <Line
          key={`relief-${index}`}
          points={points.map(([lat, lon]) => latLonToVector3(lat, lon, 1.04))}
          color="#e9cf86"
          lineWidth={1}
          transparent
          opacity={0.46}
        />
      ))}
    </group>
  );
}

function WildEvidenceRings({ activeView }: { activeView: GlobeViewState["activeView"] }) {
  const opacity = activeView === "wild-evidence" ? 0.82 : 0.24;

  return (
    <group>
      {wildEvidenceRegions.map((region) => (
        <Line
          key={region.label}
          points={makeLatLonRing(region.lat, region.lon, region.radius).map(([lat, lon]) =>
            latLonToVector3(lat, lon, 1.048)
          )}
          color={region.color}
          lineWidth={activeView === "wild-evidence" ? 1.8 : 0.8}
          transparent
          opacity={opacity}
        />
      ))}
    </group>
  );
}

function GeoChangeGlobeOverlay({
  activeLayerId,
  geoChangeSnapshot
}: {
  activeLayerId: GeoChangeLayerId;
  geoChangeSnapshot: GeoChangeSnapshot;
}) {
  const activeLayer = geoChangeSnapshot.layers.find((layer) => layer.id === activeLayerId);

  if (!activeLayer) {
    return null;
  }

  const color = new Color(activeLayer.color);
  const haloRegions = [...geoChangeSnapshot.regions]
    .sort(
      (first, second) =>
        second.layerIntensities[activeLayerId] - first.layerIntensities[activeLayerId]
    )
    .slice(0, 6);

  return (
    <group>
      <mesh scale={1.014}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={MathUtils.lerp(0.035, 0.13, activeLayer.intensity)}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {haloRegions.map((region) => {
        const intensity = region.layerIntensities[activeLayerId];
        const radiusDeg = Math.max(5, Math.min(18, region.radiusKm / 110));

        return (
          <Line
            key={`${activeLayerId}-${region.regionId}`}
            points={makeLatLonRing(region.lat, region.lon, radiusDeg).map(([lat, lon]) =>
              latLonToVector3(lat, lon, 1.056)
            )}
            color={activeLayer.color}
            lineWidth={MathUtils.lerp(0.7, 2.15, intensity)}
            transparent
            opacity={MathUtils.lerp(0.24, 0.84, intensity)}
          />
        );
      })}
    </group>
  );
}

function makeLatLonRing(lat: number, lon: number, radiusDeg: number) {
  const points: Array<[number, number]> = [];

  for (let index = 0; index <= 48; index += 1) {
    const angle = (index / 48) * Math.PI * 2;
    points.push([
      lat + Math.sin(angle) * radiusDeg * 0.55,
      lon + Math.cos(angle) * radiusDeg
    ]);
  }

  return points;
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
