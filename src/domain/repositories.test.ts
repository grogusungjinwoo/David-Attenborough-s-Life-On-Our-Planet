import { describe, expect, it } from "vitest";
import {
  animalRepository,
  getSpeciesForYear,
  historicZooSites,
  sourceIntegrityReport
} from "./storyModel";

describe("animal repository", () => {
  it("contains status records for endangered, threatened, and extinct species", () => {
    const statuses = new Set(animalRepository.map((species) => species.status));

    expect(statuses.has("endangered")).toBe(true);
    expect(statuses.has("threatened")).toBe(true);
    expect(statuses.has("extinct")).toBe(true);
  });

  it("filters species visibility by selected year", () => {
    const beforeModernPressure = getSpeciesForYear(1937);
    const currentPressure = getSpeciesForYear(2020);

    expect(beforeModernPressure.length).toBeLessThan(currentPressure.length);
    expect(currentPressure.some((species) => species.name === "Northern white rhinoceros")).toBe(true);
  });
});

describe("zoo repository", () => {
  it("contains historic zoo markers with coordinates and source refs", () => {
    expect(historicZooSites.length).toBeGreaterThanOrEqual(5);
    expect(
      historicZooSites.every(
        (site) =>
          Number.isFinite(site.lat) &&
          Number.isFinite(site.lon) &&
          site.sourceRefs.length > 0
      )
    ).toBe(true);
  });
});

describe("repository source integrity", () => {
  it("requires every animal and zoo record to carry source references", () => {
    const report = sourceIntegrityReport();

    expect(report.recordsWithoutSources).toEqual([]);
  });
});
