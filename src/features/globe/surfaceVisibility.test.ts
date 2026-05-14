import { describe, expect, it } from "vitest";
import {
  isLatLonFrontFacing,
  isSurfacePointFrontFacing
} from "./surfaceVisibility";
import { latLonToVector3 } from "./spherical";

describe("globe surface visibility helpers", () => {
  it("classifies latitude and longitude points against the visible hemisphere", () => {
    expect(isLatLonFrontFacing({ lat: 0, lon: 0 }, { lat: 0, lon: 0 })).toBe(true);
    expect(isLatLonFrontFacing({ lat: 8, lon: 20 }, { lat: 10, lon: 18 })).toBe(true);
    expect(isLatLonFrontFacing({ lat: 0, lon: 180 }, { lat: 0, lon: 0 })).toBe(false);
    expect(isLatLonFrontFacing({ lat: -35, lon: -70 }, { lat: 45, lon: 110 })).toBe(false);
  });

  it("uses the same world-space front-facing rule for markers and labels", () => {
    const camera = latLonToVector3(0, 0, 4);
    const frontMarker = latLonToVector3(0, 0, 1.1);
    const hiddenMarker = latLonToVector3(0, 180, 1.1);

    expect(isSurfacePointFrontFacing(frontMarker, camera)).toBe(true);
    expect(isSurfacePointFrontFacing(hiddenMarker, camera)).toBe(false);
  });
});
