import { describe, expect, it } from "vitest";
import {
  clampLatitude,
  globeViewToCameraPosition,
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
    expect(position.length()).toBeCloseTo(2.3, 1);
  });
});
