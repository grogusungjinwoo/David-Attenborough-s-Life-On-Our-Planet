import { Vector3 } from "three";
import { latLonToVector3 } from "./spherical";

export type LatLonPoint = {
  lat: number;
  lon: number;
};

export function isLatLonFrontFacing(
  point: LatLonPoint,
  view: LatLonPoint,
  maxAngleDeg = 98
) {
  const surfacePoint = latLonToVector3(point.lat, point.lon, 1).normalize();
  const cameraPoint = latLonToVector3(view.lat, view.lon, 1).normalize();
  const angleDeg = (surfacePoint.angleTo(cameraPoint) * 180) / Math.PI;

  return angleDeg <= maxAngleDeg;
}

export function isSurfacePointFrontFacing(
  surfacePoint: Vector3,
  cameraPoint: Vector3,
  threshold = 0.1
) {
  return surfacePoint.clone().normalize().dot(cameraPoint.clone().normalize()) > threshold;
}
