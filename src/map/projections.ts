export type EquirectangularPoint = {
  lat: number;
  lon: number;
};

export type ProjectedPosition = {
  left: string;
  top: string;
};

export function clampLatitude(latitudeDeg: number) {
  return Math.min(90, Math.max(-90, latitudeDeg));
}

export function wrapLongitude(longitudeDeg: number) {
  return ((((longitudeDeg + 180) % 360) + 360) % 360) - 180;
}

export function projectEquirectangularWgs84({
  lat,
  lon
}: EquirectangularPoint): ProjectedPosition {
  const clampedLat = clampLatitude(lat);
  const wrappedLon = wrapLongitude(lon);

  return {
    left: `${((wrappedLon + 180) / 360) * 100}%`,
    top: `${((90 - clampedLat) / 180) * 100}%`
  };
}
