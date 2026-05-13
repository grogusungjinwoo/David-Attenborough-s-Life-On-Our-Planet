import { describe, expect, it } from "vitest";
import { allSources, regions, timelineAnchors } from ".";
import { createWorldSnapshot } from "../domain/timeline";
import {
  deriveGeoChangeSnapshot,
  geoChangeLayerDefinitions,
  regionGeoChangeProfiles
} from "./geoChangeOverlays";

describe("geo change overlays", () => {
  it("exposes only the fixed public geographic change layers", () => {
    expect(geoChangeLayerDefinitions.map((layer) => layer.id)).toEqual([
      "wild-space",
      "human-footprint",
      "forest-cover",
      "ocean-ice",
      "urban-lights"
    ]);
  });

  it("derives finite layer intensities from every timeline anchor", () => {
    for (const anchor of timelineAnchors) {
      const snapshot = createWorldSnapshot(timelineAnchors, anchor.year);
      const geoChange = deriveGeoChangeSnapshot(anchor.year, snapshot, regions);

      expect(geoChange.year).toBe(anchor.year);
      expect(geoChange.layers).toHaveLength(geoChangeLayerDefinitions.length);

      for (const layer of geoChange.layers) {
        expect(Number.isFinite(layer.intensity)).toBe(true);
        expect(layer.intensity).toBeGreaterThanOrEqual(0);
        expect(layer.intensity).toBeLessThanOrEqual(1);
        expect(layer.confidence).toMatch(/^(reconstructed|observed|instrumental)$/);
        expect(layer.displayCaveat.length).toBeGreaterThan(20);
        expect(layer.sourceRefs.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps region change profiles tied to known regions and catalog sources", () => {
    const regionIds = new Set(regions.map((region) => region.id));
    const sourceIds = new Set(allSources.map((source) => source.id));
    const expectedProfiledRegions = [
      "amazon-basin",
      "arctic-circle",
      "borneo",
      "coral-triangle",
      "north-atlantic",
      "serengeti"
    ];

    expect(regionGeoChangeProfiles.map((profile) => profile.regionId).sort()).toEqual(
      expectedProfiledRegions
    );

    const geoChange = deriveGeoChangeSnapshot(
      2024,
      createWorldSnapshot(timelineAnchors, 2024),
      regions
    );

    expect(geoChange.regions.map((region) => region.regionId).sort()).toEqual(
      expectedProfiledRegions
    );

    for (const profile of regionGeoChangeProfiles) {
      expect(regionIds.has(profile.regionId)).toBe(true);

      for (const source of profile.sourceRefs) {
        expect(sourceIds.has(source.id)).toBe(true);
      }
    }
  });

  it("moves expected pressure layers in the right direction across 1937, 1978, and 2024", () => {
    const yearSnapshot = (year: number) =>
      deriveGeoChangeSnapshot(
        year,
        createWorldSnapshot(timelineAnchors, year),
        regions
      );

    const y1937 = yearSnapshot(1937);
    const y1978 = yearSnapshot(1978);
    const y2024 = yearSnapshot(2024);

    expect(layerIntensity(y1937, "human-footprint")).toBeLessThan(
      layerIntensity(y1978, "human-footprint")
    );
    expect(layerIntensity(y1978, "human-footprint")).toBeLessThan(
      layerIntensity(y2024, "human-footprint")
    );
    expect(layerIntensity(y1937, "wild-space")).toBeLessThan(
      layerIntensity(y2024, "wild-space")
    );
    expect(layerIntensity(y1937, "urban-lights")).toBeLessThan(
      layerIntensity(y2024, "urban-lights")
    );
    expect(regionIntensity(y1937, "amazon-basin", "forest-cover")).toBeLessThan(
      regionIntensity(y2024, "amazon-basin", "forest-cover")
    );
    expect(regionIntensity(y1937, "borneo", "forest-cover")).toBeLessThan(
      regionIntensity(y2024, "borneo", "forest-cover")
    );
  });
});

type DerivedGeoChangeSnapshot = ReturnType<typeof deriveGeoChangeSnapshot>;

function layerIntensity(
  snapshot: DerivedGeoChangeSnapshot,
  layerId: string
) {
  const layer = snapshot.layers.find((entry) => entry.id === layerId);

  expect(layer).toBeDefined();
  return layer?.intensity ?? 0;
}

function regionIntensity(
  snapshot: DerivedGeoChangeSnapshot,
  regionId: string,
  layerId: string
) {
  const region = snapshot.regions.find((entry) => entry.regionId === regionId);

  expect(region).toBeDefined();
  return region?.layerIntensities[layerId as keyof typeof region.layerIntensities] ?? 0;
}
