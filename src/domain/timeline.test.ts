import { describe, expect, it } from "vitest";
import { timelineAnchors } from "../data/timeline";
import {
  EARTH_LAND_ACRES,
  createWorldSnapshot,
  deriveWildSpaceAcres,
  getActiveTimelineAnchor,
  interpolateMetrics
} from "./timeline";

describe("timeline helpers", () => {
  it("derives wild-space acres from land acres", () => {
    expect(deriveWildSpaceAcres(50)).toBe(EARTH_LAND_ACRES / 2);
  });

  it("interpolates metrics between anchor years", () => {
    const metrics = interpolateMetrics(timelineAnchors, 2010);

    expect(metrics.worldPopulationBillion).toBeGreaterThan(5.9);
    expect(metrics.worldPopulationBillion).toBeLessThan(7.8);
    expect(metrics.remainingWildSpacePercent).toBeGreaterThan(35);
    expect(metrics.remainingWildSpacePercent).toBeLessThan(46);
    expect(metrics.wildSpaceAcres).toBeDefined();
    expect(metrics.speciesAtRiskCount).toBeUndefined();
  });

  it("clamps interpolation outside the known timeline", () => {
    const metrics = interpolateMetrics(timelineAnchors, 2500);

    expect(metrics.worldPopulationBillion).toBe(8.2);
    expect(metrics.atmosphericCarbonPpm).toBe(422.8);
  });

  it("derives procedural density from world pressure", () => {
    const early = createWorldSnapshot(timelineAnchors, 1937);
    const current = createWorldSnapshot(timelineAnchors, 2024);

    expect(current.proceduralDensity.buildings).toBeGreaterThan(
      early.proceduralDensity.buildings
    );
    expect(current.proceduralDensity.trees).toBeLessThan(
      early.proceduralDensity.trees
    );
    expect(current.proceduralDensity.waterStress).toBeGreaterThan(
      early.proceduralDensity.waterStress
    );
  });

  it("selects the nearest active anchor", () => {
    expect(getActiveTimelineAnchor(timelineAnchors, 1956).id).toBe("television-age");
  });
});
