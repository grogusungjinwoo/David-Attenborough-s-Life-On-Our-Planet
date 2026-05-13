import { describe, expect, it } from "vitest";
import { getWorldSnapshot } from "../domain/storyModel";
import {
  buildGlobeMarkers,
  buildSurfacePoints,
  latLonToTuple
} from "./markerHelpers";

describe("globe marker helpers", () => {
  it("derives visible marker categories from the story snapshot year", () => {
    const snapshot = getWorldSnapshot(2020);
    const markers = buildGlobeMarkers(snapshot);
    const markerKinds = new Set(markers.map((marker) => marker.kind));

    expect(markerKinds.has("wild-space")).toBe(true);
    expect(markerKinds.has("city")).toBe(true);
    expect(markerKinds.has("species")).toBe(true);
    expect(markerKinds.has("zoo")).toBe(true);
    expect(markers.some((marker) => marker.label === "Northern white rhinoceros")).toBe(true);
    expect(markers.some((marker) => marker.label === "London Zoo")).toBe(true);
    expect(markers.every((marker) => marker.position.every(Number.isFinite))).toBe(true);
  });

  it("respects snapshot layer gates for marker generation", () => {
    const snapshot = getWorldSnapshot(2020);
    const hiddenSnapshot = {
      ...snapshot,
      layers: {
        ...snapshot.layers,
        wildSpace: false,
        population: false,
        species: false,
        zoos: false
      }
    };

    const markers = buildGlobeMarkers(hiddenSnapshot);
    const markerKinds = new Set(markers.map((marker) => marker.kind));

    expect(markerKinds.has("wild-space")).toBe(false);
    expect(markerKinds.has("city")).toBe(false);
    expect(markerKinds.has("species")).toBe(false);
    expect(markerKinds.has("zoo")).toBe(false);
  });

  it("scales procedural surface points with snapshot density", () => {
    const earlySnapshot = getWorldSnapshot(1937);
    const lateSnapshot = getWorldSnapshot(2020);

    const earlySurface = buildSurfacePoints(earlySnapshot);
    const lateSurface = buildSurfacePoints(lateSnapshot);

    expect(earlySurface.land.length).toBe(lateSurface.land.length);
    expect(earlySurface.wildSpace.length).toBeGreaterThan(lateSurface.wildSpace.length);
    expect(lateSurface.cities.length).toBeGreaterThan(earlySurface.cities.length);
  });

  it("projects latitude and longitude onto the requested radius", () => {
    const position = latLonToTuple(51.5353, -0.1534, 1.2);
    const radius = Math.hypot(...position);

    expect(radius).toBeCloseTo(1.2, 5);
  });
});
