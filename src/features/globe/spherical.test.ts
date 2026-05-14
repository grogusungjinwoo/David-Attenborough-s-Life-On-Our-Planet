import { describe, expect, it } from "vitest";
import {
  EARTH_TEXTURE_ALIGNMENT,
  GLOBE_ROOT_ROTATION,
  clampLatitude,
  greatCircleArc,
  globeViewToCameraPosition,
  latLonToVector3,
  wrapLongitude
} from "./spherical";

describe("globe spherical navigation helpers", () => {
  it("wraps longitude for display while allowing continuous stored rotation", () => {
    expect(wrapLongitude(181)).toBe(-179);
    expect(wrapLongitude(-181)).toBe(179);
    expect(wrapLongitude(740)).toBe(20);
  });

  it("clamps latitude away from camera inversion at the poles", () => {
    expect(clampLatitude(120)).toBe(82);
    expect(clampLatitude(-120)).toBe(-82);
  });

  it("returns finite camera positions across the dateline and zoom range", () => {
    const position = globeViewToCameraPosition({
      longitudeDeg: 725,
      latitudeDeg: 81,
      zoomScalar: 1,
      activeView: "admin-regions",
      quality: "high"
    });

    expect(Number.isFinite(position.x)).toBe(true);
    expect(Number.isFinite(position.y)).toBe(true);
    expect(Number.isFinite(position.z)).toBe(true);
    expect(position.length()).toBeCloseTo(3, 1);
  });

  it("keeps the Earth texture and WGS84 overlay contract unrotated by default", () => {
    expect(GLOBE_ROOT_ROTATION).toEqual([0, 0, 0]);
    expect(EARTH_TEXTURE_ALIGNMENT.longitudeOffsetDeg).toBe(0);
    expect(EARTH_TEXTURE_ALIGNMENT.flipX).toBe(false);
  });

  it("keeps canonical landmasses in distinct WGS84 positions", () => {
    const europe = latLonToVector3(50, 10, 1).normalize();
    const africa = latLonToVector3(0, 20, 1).normalize();
    const australia = latLonToVector3(-25, 135, 1).normalize();
    const southAmerica = latLonToVector3(-15, -60, 1).normalize();
    const antarctica = latLonToVector3(-75, 0, 1).normalize();

    expect((europe.angleTo(africa) * 180) / Math.PI).toBeLessThan(60);
    expect((europe.angleTo(australia) * 180) / Math.PI).toBeGreaterThan(85);
    expect((africa.angleTo(southAmerica) * 180) / Math.PI).toBeGreaterThan(55);
    expect(antarctica.y).toBeLessThan(-0.95);
  });

  it("converts London and Singapore to finite globe points at the requested radius", () => {
    for (const [lat, lon] of [
      [51.5074, -0.1278],
      [1.3521, 103.8198]
    ]) {
      const point = latLonToVector3(lat, lon, 1.07);
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(Number.isFinite(point.z)).toBe(true);
      expect(point.length()).toBeCloseTo(1.07, 5);
    }
  });

  it("creates finite great-circle arcs that preserve route endpoints", () => {
    const arc = greatCircleArc([-0.1278, 51.5074], [103.8198, 1.3521], 24, 1.04);

    expect(arc).toHaveLength(24);
    expect(arc[0].distanceTo(latLonToVector3(51.5074, -0.1278, 1.04))).toBeLessThan(0.0001);
    expect(arc.at(-1)!.distanceTo(latLonToVector3(1.3521, 103.8198, 1.04))).toBeLessThan(0.0001);
    expect(arc.every((point) => Number.isFinite(point.x + point.y + point.z))).toBe(true);
  });
});
