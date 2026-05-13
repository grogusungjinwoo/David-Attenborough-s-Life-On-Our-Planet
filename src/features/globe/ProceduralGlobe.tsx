import { Html } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  SRGBColorSpace
} from "three";
import type { RegionRecord, SpeciesRecord, WorldSnapshot, ZooSite } from "../../domain/types";
import { SurfaceInstances } from "./SurfaceInstances";
import { latLonToVector3, makeClusteredSurfacePoints, seededRandom } from "./spherical";

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
        count: 880,
        clusters: continentClusters,
        minScale: 0.3,
        maxScale: 0.86
      }),
    []
  );

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

  const earthTexture = useMemo(
    () => createEarthTexture(snapshot, landPoints, treePoints, buildingPoints, waterStressPoints),
    [buildingPoints, landPoints, snapshot, treePoints, waterStressPoints]
  );

  useEffect(() => () => earthTexture.dispose(), [earthTexture]);

  return (
    <group rotation={[0.07, -0.34, -0.04]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial
          color={new Color("#f8fbff")}
          map={earthTexture}
          roughness={0.92}
          metalness={0.03}
          emissive="#021623"
          emissiveIntensity={0.18}
        />
      </mesh>

      <SurfaceInstances points={landPoints} radius={1.007} scaleMultiplier={0.006}>
        <cylinderGeometry args={[1.4, 1.55, 0.12, 8]} />
        <meshStandardMaterial color="#7fa158" roughness={0.98} transparent opacity={0.46} />
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
        <SurfaceInstances points={treePoints} radius={1.024} scaleMultiplier={0.0047}>
          <coneGeometry args={[0.55, 1.18, 7]} />
          <meshStandardMaterial color="#69b56f" roughness={0.84} transparent opacity={0.72} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.mountains ? (
        <SurfaceInstances points={mountainPoints} radius={1.026} scaleMultiplier={0.0068}>
          <coneGeometry args={[0.88, 1.55, 4]} />
          <meshStandardMaterial color="#b4ad9d" roughness={0.94} transparent opacity={0.66} />
        </SurfaceInstances>
      ) : null}

      {snapshot.layers.settlements ? (
        <SurfaceInstances points={buildingPoints} radius={1.027} scaleMultiplier={0.0045}>
          <boxGeometry args={[0.7, 1.35, 0.7]} />
          <meshStandardMaterial
            color="#e4c777"
            emissive="#b16f22"
            emissiveIntensity={0.12}
            roughness={0.74}
            metalness={0.06}
            transparent
            opacity={0.7}
          />
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
        <SurfaceInstances points={waterStressPoints} radius={1.034} scaleMultiplier={0.0048}>
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

function createEarthTexture(
  snapshot: WorldSnapshot,
  landPoints: ReturnType<typeof makeClusteredSurfacePoints>,
  treePoints: ReturnType<typeof makeClusteredSurfacePoints>,
  buildingPoints: ReturnType<typeof makeClusteredSurfacePoints>,
  waterStressPoints: ReturnType<typeof makeClusteredSurfacePoints>
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;

  const context = canvas.getContext("2d");

  if (!context) {
    return new CanvasTexture(canvas);
  }

  const ocean = context.createLinearGradient(0, 0, 0, canvas.height);
  ocean.addColorStop(0, "#061b31");
  ocean.addColorStop(0.34, "#0a3d58");
  ocean.addColorStop(0.66, "#0b536c");
  ocean.addColorStop(1, "#061827");
  context.fillStyle = ocean;
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawBathymetry(context, canvas.width, canvas.height);
  drawContinents(context, canvas.width, canvas.height);
  drawSurfacePoints(context, landPoints, "rgba(126, 157, 81, 0.55)", 1.8, canvas.width, canvas.height);
  drawSurfacePoints(context, landPoints, "rgba(221, 191, 122, 0.22)", 0.75, canvas.width, canvas.height);

  if (snapshot.layers.vegetation) {
    drawSurfacePoints(
      context,
      treePoints,
      `rgba(88, 184, 101, ${0.28 + snapshot.proceduralDensity.trees * 0.28})`,
      1.45,
      canvas.width,
      canvas.height
    );
  }

  if (snapshot.layers.settlements) {
    drawSurfacePoints(
      context,
      buildingPoints,
      `rgba(255, 205, 105, ${0.24 + snapshot.proceduralDensity.buildings * 0.34})`,
      1.1,
      canvas.width,
      canvas.height
    );
  }

  if (snapshot.layers.energy) {
    drawSurfacePoints(
      context,
      waterStressPoints,
      "rgba(238, 126, 46, 0.32)",
      1.35,
      canvas.width,
      canvas.height
    );
  }

  if (snapshot.layers.atmosphere) {
    drawCloudBands(context, canvas.width, canvas.height, snapshot.year);
  }

  const vignette = context.createRadialGradient(
    canvas.width * 0.45,
    canvas.height * 0.44,
    canvas.width * 0.08,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.62
  );
  vignette.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  vignette.addColorStop(0.62, "rgba(255, 255, 255, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.46)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
}

function drawBathymetry(context: CanvasRenderingContext2D, width: number, height: number) {
  const random = seededRandom(9182);

  context.save();
  context.globalAlpha = 0.26;
  context.strokeStyle = "rgba(125, 209, 223, 0.2)";
  context.lineWidth = 1;

  for (let index = 0; index < 46; index += 1) {
    const y = height * (0.12 + random() * 0.76);
    context.beginPath();
    context.moveTo(0, y);

    for (let x = 0; x <= width; x += 90) {
      context.lineTo(x, y + Math.sin(x * 0.012 + index) * (7 + random() * 13));
    }

    context.stroke();
  }

  context.restore();
}

function drawContinents(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save();
  context.globalCompositeOperation = "source-over";
  drawContinentPolygons(context, width, height);

  for (const cluster of continentClusters) {
    const position = projectLatLon(cluster.lat, cluster.lon, width, height);
    const landGradient = context.createRadialGradient(
      position.x,
      position.y,
      4,
      position.x,
      position.y,
      Math.max(cluster.lonSpread, cluster.latSpread) * 3.7
    );
    landGradient.addColorStop(0, "rgba(126, 147, 84, 0.94)");
    landGradient.addColorStop(0.54, "rgba(71, 116, 71, 0.82)");
    landGradient.addColorStop(1, "rgba(42, 82, 58, 0)");

    context.fillStyle = landGradient;
    context.beginPath();
    context.ellipse(
      position.x,
      position.y,
      (cluster.lonSpread / 360) * width * 0.9,
      (cluster.latSpread / 180) * height * 0.94,
      -0.18,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.restore();
}

function drawContinentPolygons(context: CanvasRenderingContext2D, width: number, height: number) {
  const continents = [
    [
      [72, -164],
      [62, -142],
      [50, -126],
      [31, -118],
      [18, -99],
      [9, -82],
      [18, -72],
      [35, -76],
      [48, -64],
      [59, -80],
      [71, -106]
    ],
    [
      [12, -80],
      [5, -64],
      [-8, -56],
      [-20, -48],
      [-35, -58],
      [-55, -70],
      [-38, -74],
      [-12, -77]
    ],
    [
      [36, -10],
      [32, 14],
      [12, 31],
      [-8, 41],
      [-35, 29],
      [-34, 15],
      [-18, 8],
      [3, -8],
      [22, -16]
    ],
    [
      [58, -10],
      [64, 28],
      [51, 56],
      [38, 42],
      [35, 14],
      [43, -6]
    ],
    [
      [61, 38],
      [54, 82],
      [48, 121],
      [28, 139],
      [8, 118],
      [7, 79],
      [22, 57],
      [36, 44]
    ],
    [
      [-10, 110],
      [-20, 146],
      [-42, 153],
      [-45, 116],
      [-26, 112]
    ],
    [
      [72, -44],
      [80, -20],
      [73, 16],
      [64, -20]
    ]
  ];

  for (const polygon of continents) {
    const first = polygon[0];
    const start = projectLatLon(first[0], first[1], width, height);

    context.beginPath();
    context.moveTo(start.x, start.y);

    for (const point of polygon.slice(1)) {
      const projected = projectLatLon(point[0], point[1], width, height);
      context.lineTo(projected.x, projected.y);
    }

    context.closePath();
    context.fillStyle = "rgba(73, 116, 72, 0.76)";
    context.fill();
    context.strokeStyle = "rgba(205, 180, 125, 0.22)";
    context.lineWidth = 2.2;
    context.stroke();
  }
}

function drawSurfacePoints(
  context: CanvasRenderingContext2D,
  points: ReturnType<typeof makeClusteredSurfacePoints>,
  color: string,
  radius: number,
  width: number,
  height: number
) {
  context.save();
  context.fillStyle = color;

  for (const point of points) {
    const position = projectLatLon(point.lat, point.lon, width, height);
    context.beginPath();
    context.ellipse(
      position.x,
      position.y,
      radius * point.scale * 1.7,
      radius * point.scale,
      0,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  context.restore();
}

function drawCloudBands(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  year: number
) {
  const random = seededRandom(year + 1337);

  context.save();
  context.globalAlpha = 0.24;
  context.strokeStyle = "rgba(255, 255, 255, 0.72)";
  context.lineWidth = 9;
  context.lineCap = "round";

  for (let index = 0; index < 28; index += 1) {
    const y = height * (0.18 + random() * 0.62);
    const startX = width * random();

    context.beginPath();
    context.moveTo(startX - width * 0.12, y);

    for (let step = 0; step < 5; step += 1) {
      const x = startX + step * 92;
      context.quadraticCurveTo(
        x + 46,
        y + (random() - 0.5) * 54,
        x + 92,
        y + (random() - 0.5) * 34
      );
    }

    context.stroke();
  }

  context.restore();
}

function projectLatLon(lat: number, lon: number, width: number, height: number) {
  return {
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height
  };
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
