import { describe, expect, it } from "vitest";
import {
  getTimelineAnchorByYear,
  getWorldSnapshot,
  listSources,
  sourceIntegrityReport,
  timelineAnchors
} from "./storyModel";

describe("storyModel timeline", () => {
  it("contains Attenborough's 1937 witness anchor from the manuscript excerpt", () => {
    const anchor = getTimelineAnchorByYear(1937);

    expect(anchor.title).toContain("Leicester");
    expect(anchor.metrics.worldPopulationBillion).toBe(2.3);
    expect(anchor.metrics.remainingWildSpacePercent).toBe(66);
    expect(anchor.metrics.atmosphericCarbonPpm).toBe(280);
    expect(anchor.sourceRefs[0]).toMatchObject({
      sourceId: "attenborough-excerpt",
      pdfPage: 20,
      printedPage: 13
    });
  });

  it("derives a world snapshot with procedural density values for the globe", () => {
    const snapshot = getWorldSnapshot(2020);

    expect(snapshot.year).toBe(2020);
    expect(snapshot.metrics.worldPopulationBillion).toBeGreaterThan(7);
    expect(snapshot.proceduralDensity.trees).toBeLessThan(0.5);
    expect(snapshot.proceduralDensity.buildings).toBeGreaterThan(0.65);
    expect(snapshot.layers.wildSpace).toBe(true);
    expect(snapshot.activeAnchor.title).toMatch(/witness/i);
  });

  it("keeps timeline anchors chronologically sorted", () => {
    const years = timelineAnchors.map((anchor) => anchor.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });
});

describe("storyModel source integrity", () => {
  it("requires every timeline anchor to resolve to a known source", () => {
    const report = sourceIntegrityReport();

    expect(report.unknownSourceRefs).toEqual([]);
    expect(report.recordsWithoutSources).toEqual([]);
  });

  it("exposes both manuscript and public-data source families", () => {
    const sourceFamilies = new Set(listSources().map((source) => source.family));

    expect(sourceFamilies.has("manuscript")).toBe(true);
    expect(sourceFamilies.has("public-data")).toBe(true);
  });
});
