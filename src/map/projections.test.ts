import { describe, expect, it } from "vitest";
import {
  clampLatitude,
  projectEquirectangularWgs84,
  wrapLongitude
} from "./projections";

describe("map projections", () => {
  it("projects WGS84 latitude and longitude onto an equirectangular raster", () => {
    expect(projectEquirectangularWgs84({ lat: 0, lon: 0 })).toEqual({
      left: "50%",
      top: "50%"
    });
    expect(projectEquirectangularWgs84({ lat: 90, lon: -180 })).toEqual({
      left: "0%",
      top: "0%"
    });
  });

  it("wraps longitudes and clamps latitudes before projecting", () => {
    expect(wrapLongitude(190)).toBe(-170);
    expect(clampLatitude(94)).toBe(90);
    expect(projectEquirectangularWgs84({ lat: -100, lon: 540 })).toEqual({
      left: "0%",
      top: "100%"
    });
  });
});
