import { Vector3 } from "three";
import type { GlobeViewState } from "../../domain/types";

const DEG_TO_RAD = Math.PI / 180;

export const GLOBE_ROOT_ROTATION = [0, 0, 0] as const;

export const EARTH_TEXTURE_ALIGNMENT = {
  longitudeOffsetDeg: 0,
  flipX: false
} as const;

export type SurfacePoint = {
  id: string;
  lat: number;
  lon: number;
  scale: number;
  color?: string;
};

export type LonLat = [number, number];

export function latLonToVector3(lat: number, lon: number, radius = 1) {
  const phi = (90 - lat) * DEG_TO_RAD;
  const theta = (lon + 180) * DEG_TO_RAD;

  return new Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export function greatCircleArc(
  start: LonLat,
  end: LonLat,
  segments = 32,
  radius = 1
) {
  const pointCount = Math.max(2, Math.round(segments));
  const startVector = latLonToVector3(start[1], start[0], 1).normalize();
  const endVector = latLonToVector3(end[1], end[0], 1).normalize();
  const angle = startVector.angleTo(endVector);

  if (angle === 0) {
    return Array.from({ length: pointCount }, () => startVector.clone().multiplyScalar(radius));
  }

  const sinAngle = Math.sin(angle);

  return Array.from({ length: pointCount }, (_, index) => {
    const t = index / (pointCount - 1);
    const startWeight = Math.sin((1 - t) * angle) / sinAngle;
    const endWeight = Math.sin(t * angle) / sinAngle;

    return startVector
      .clone()
      .multiplyScalar(startWeight)
      .add(endVector.clone().multiplyScalar(endWeight))
      .normalize()
      .multiplyScalar(radius);
  });
}

export function clampLatitude(latitudeDeg: number) {
  return clamp(latitudeDeg, -82, 82);
}

export function wrapLongitude(longitudeDeg: number) {
  return ((((longitudeDeg + 180) % 360) + 360) % 360) - 180;
}

export function globeViewToCameraPosition(view: GlobeViewState) {
  const zoom = clamp(view.zoomScalar, 0, 1);
  const distance = 5.2 - Math.pow(zoom, 1.8) * 2.2;

  return latLonToVector3(clampLatitude(view.latitudeDeg), view.longitudeDeg, distance);
}

export function seededRandom(seed: number) {
  let value = seed % 2_147_483_647;
  if (value <= 0) {
    value += 2_147_483_646;
  }

  return () => {
    value = (value * 16_807) % 2_147_483_647;
    return (value - 1) / 2_147_483_646;
  };
}

export function makeClusteredSurfacePoints(options: {
  seed: number;
  count: number;
  clusters: Array<{ lat: number; lon: number; latSpread: number; lonSpread: number }>;
  minScale: number;
  maxScale: number;
}) {
  const random = seededRandom(options.seed);
  const points: SurfacePoint[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const cluster = options.clusters[index % options.clusters.length];
    const latOffset = (random() - 0.5) * cluster.latSpread;
    const lonOffset = (random() - 0.5) * cluster.lonSpread;
    const scale =
      options.minScale + random() * (options.maxScale - options.minScale);

    points.push({
      id: `${options.seed}-${index}`,
      lat: clamp(cluster.lat + latOffset, -82, 82),
      lon: wrapLongitude(cluster.lon + lonOffset),
      scale
    });
  }

  return points;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
