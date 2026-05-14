import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { Vector3 } from "three";
import type {
  ContinentRecord,
  CountryRecord,
  WildAreaRecord
} from "../../domain/types";
import { latLonToVector3 } from "./spherical";
import {
  isLatLonFrontFacing,
  isSurfacePointFrontFacing
} from "./surfaceVisibility";

type LabelRecord = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  kind: "continent" | "country" | "wild";
};

type GlobeLabelLayerProps = {
  continents: ContinentRecord[];
  countries: CountryRecord[];
  wildAreas: WildAreaRecord[];
  zoomScalar: number;
  currentYear: number;
  activeWildAreaIds?: string[];
  viewLat?: number;
  viewLon?: number;
  renderMode?: "dom" | "three";
};

export function selectCountryLabels(countries: CountryRecord[], zoomScalar: number) {
  if (zoomScalar < 0.72) {
    return [];
  }

  const rankLimit = zoomScalar > 0.92 ? 4 : zoomScalar > 0.84 ? 2 : 1;

  return countries
    .filter((country) => country.importanceRank <= rankLimit)
    .sort((first, second) => first.importanceRank - second.importanceRank);
}

export function selectWildAreaLabels(
  wildAreas: WildAreaRecord[],
  currentYear: number,
  activeWildAreaIds: string[],
  zoomScalar = 1
) {
  const activeIds = new Set(activeWildAreaIds);

  return wildAreas.filter(
    (area) =>
      activeIds.has(area.id) || (zoomScalar >= 0.66 && area.firstVisibleYear <= currentYear)
  );
}

export function isLabelFrontFacing(
  labelLat: number,
  labelLon: number,
  viewLat: number,
  viewLon: number,
  maxAngleDeg = 98
) {
  return isLatLonFrontFacing(
    { lat: labelLat, lon: labelLon },
    { lat: viewLat, lon: viewLon },
    maxAngleDeg
  );
}

export function GlobeLabelLayer({
  continents,
  countries,
  wildAreas,
  zoomScalar,
  currentYear,
  activeWildAreaIds = [],
  viewLat = 0,
  viewLon = 0,
  renderMode = "dom"
}: GlobeLabelLayerProps) {
  const labels: LabelRecord[] = [
    ...continents.map((continent) => ({
      id: continent.id,
      label: continent.name,
      lat: continent.labelLat,
      lon: continent.labelLon,
      kind: "continent" as const
    })),
    ...selectCountryLabels(countries, zoomScalar).map((country) => ({
      id: country.id,
      label: country.name,
      lat: country.labelLat,
      lon: country.labelLon,
      kind: "country" as const
    })),
    ...selectWildAreaLabels(wildAreas, currentYear, activeWildAreaIds, zoomScalar).map((area) => ({
      id: area.id,
      label: area.label,
      lat: area.lat,
      lon: area.lon,
      kind: "wild" as const
    }))
  ];

  if (renderMode === "three") {
    return (
      <group>
        {labels.map((label) => (
          <GlobeHtmlLabel
            key={`${label.kind}-${label.id}`}
            label={label}
          />
        ))}
      </group>
    );
  }

  const visibleDomLabels = labels.filter((label) =>
    isLabelFrontFacing(label.lat, label.lon, viewLat, viewLon)
  );

  return (
    <div className="globe-label-layer" data-testid="globe-label-layer">
      {visibleDomLabels.map((label) => (
        <span
          className={`globe-map-label ${label.kind}${label.kind === "country" ? " globe-admin-label" : ""}`}
          key={`${label.kind}-${label.id}`}
        >
          {label.label}
        </span>
      ))}
    </div>
  );
}

function GlobeHtmlLabel({ label }: { label: LabelRecord }) {
  const groupRef = useRef<Group>(null);
  const surfaceWorld = useMemo(() => new Vector3(), []);
  const cameraWorld = useMemo(() => new Vector3(), []);
  const position = useMemo(
    () => latLonToVector3(label.lat, label.lon, label.kind === "continent" ? 1.088 : 1.104),
    [label.kind, label.lat, label.lon]
  );
  const { camera } = useThree();

  useFrame(() => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    group.getWorldPosition(surfaceWorld);
    camera.getWorldPosition(cameraWorld);
    group.visible = isSurfacePointFrontFacing(surfaceWorld, cameraWorld);
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        className={`globe-map-label ${label.kind}${label.kind === "country" ? " globe-admin-label" : ""}`}
      >
        {label.label}
      </Html>
    </group>
  );
}
