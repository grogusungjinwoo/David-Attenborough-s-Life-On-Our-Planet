import { describe, expect, it } from "vitest";
import {
  allSources,
  referenceOverlays,
  regions,
  speciesRecords,
  timelineAnchors,
  zooSites
} from ".";
import {
  validateCatalogSourceRefs,
  validateMetricSourceRefs,
  validateSourceRefs
} from "../domain/timeline";

describe("seed data integrity", () => {
  it("keeps every timeline anchor source-backed", () => {
    expect(validateSourceRefs(timelineAnchors)).toEqual([]);
    expect(validateMetricSourceRefs(timelineAnchors)).toEqual([]);
  });

  it("keeps every region, species, zoo, and overlay source-backed", () => {
    expect(
      validateSourceRefs([
        ...regions,
        ...speciesRecords,
        ...zooSites,
        ...referenceOverlays
      ])
    ).toEqual([]);
  });

  it("requires every record source to resolve to the catalog", () => {
    const records = [
      ...timelineAnchors,
      ...regions,
      ...speciesRecords,
      ...zooSites,
      ...referenceOverlays
    ];

    expect(validateCatalogSourceRefs(records, allSources)).toEqual([]);
    expect(
      validateCatalogSourceRefs(
        [{ id: "fake", sourceRefs: [{ id: "made-up", label: "Fake", publisher: "Fake" }] }],
        allSources
      )
    ).toEqual(["fake references unknown source:made-up"]);
  });

  it("keeps source ids unique", () => {
    const ids = allSources.map((source) => source.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("binds species only to known regions", () => {
    const regionIds = new Set(regions.map((region) => region.id));
    const missing = speciesRecords.flatMap((record) =>
      record.regionIds.filter((regionId) => !regionIds.has(regionId))
    );

    expect(missing).toEqual([]);
  });

  it("keeps species status histories source-backed, sorted, and aligned to latest status", () => {
    const missingStatusSources = speciesRecords.flatMap((record) =>
      record.statusByYear
        .filter((entry) => !entry.sourceRefs || entry.sourceRefs.length === 0)
        .map((entry) => `${record.id}:${entry.year}`)
    );
    const unsorted = speciesRecords.filter((record) => {
      const years = record.statusByYear.map((entry) => entry.year);
      return years.some((year, index) => index > 0 && year < years[index - 1]);
    });
    const latestMismatches = speciesRecords.filter((record) => {
      const latest = record.statusByYear[record.statusByYear.length - 1];
      return latest?.status !== record.status;
    });

    expect(missingStatusSources).toEqual([]);
    expect(unsorted).toEqual([]);
    expect(latestMismatches).toEqual([]);
  });

  it("uses plausible coordinates for zoo markers", () => {
    for (const zoo of zooSites) {
      expect(zoo.lat).toBeGreaterThanOrEqual(-90);
      expect(zoo.lat).toBeLessThanOrEqual(90);
      expect(zoo.lon).toBeGreaterThanOrEqual(-180);
      expect(zoo.lon).toBeLessThanOrEqual(180);
    }
  });
});
