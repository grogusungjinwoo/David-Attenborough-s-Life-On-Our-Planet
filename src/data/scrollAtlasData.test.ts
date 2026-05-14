import { describe, expect, it } from "vitest";
import { sourceCatalog } from "./sources";
import { continents } from "./continents";
import { countries, countryLabelSeedRecords } from "./countries";
import { wildAreas } from "./wildAreas";
import { tradeRoutes, getRouteIntensityForYear } from "./tradeRoutes";
import { chapterVisuals, scrollChapters } from "./scrollChapters";
import { mediaAssets } from "./media";

const sourceIds = new Set(Object.values(sourceCatalog).map((source) => source.id));
const validContinentIds = new Set([
  "africa",
  "antarctica",
  "asia",
  "europe",
  "north-america",
  "south-america",
  "oceania"
]);

describe("scroll atlas geographic data", () => {
  it("defines exactly seven continent labels without duplicate Africa or Asia artifacts", () => {
    expect(continents).toHaveLength(7);
    expect(new Set(continents.map((continent) => continent.id))).toEqual(validContinentIds);
    expect(continents.filter((continent) => continent.name === "Africa")).toHaveLength(1);
    expect(continents.filter((continent) => continent.name === "Asia")).toHaveLength(1);
  });

  it("keeps country records source-backed and safely positioned on WGS84", () => {
    expect(countries.length).toBeGreaterThanOrEqual(36);
    expect(countries).toBe(countryLabelSeedRecords);
    expect(countries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "south-korea", isoA2: "KR", isoA3: "KOR" })
      ])
    );

    const ids = new Set<string>();
    for (const country of countries) {
      expect(ids.has(country.id), `${country.id} should be unique`).toBe(false);
      ids.add(country.id);
      expect(country.isoA2).toMatch(/^[A-Z]{2}$/);
      expect(country.isoA3).toMatch(/^[A-Z]{3}$/);
      expect(validContinentIds.has(country.continentId)).toBe(true);
      expect(country.labelLat).toBeGreaterThanOrEqual(-90);
      expect(country.labelLat).toBeLessThanOrEqual(90);
      expect(country.labelLon).toBeGreaterThanOrEqual(-180);
      expect(country.labelLon).toBeLessThanOrEqual(180);
      expect(country.bbox[0]).toBeLessThanOrEqual(country.bbox[2]);
      expect(country.bbox[1]).toBeLessThanOrEqual(country.bbox[3]);
      expect(country.sourceRefs.every((source) => sourceIds.has(source.id))).toBe(true);
    }
  });

  it("defines wild area labels from existing evidence layers with valid visibility years", () => {
    expect(wildAreas.length).toBeGreaterThanOrEqual(8);

    for (const area of wildAreas) {
      expect(area.label.length).toBeGreaterThan(4);
      expect(area.lat).toBeGreaterThanOrEqual(-90);
      expect(area.lat).toBeLessThanOrEqual(90);
      expect(area.lon).toBeGreaterThanOrEqual(-180);
      expect(area.lon).toBeLessThanOrEqual(180);
      expect(area.radiusKm).toBeGreaterThan(0);
      expect(area.firstVisibleYear).toBeGreaterThanOrEqual(1770);
      expect(area.sourceRefs.every((source) => sourceIds.has(source.id))).toBe(true);
    }
  });
});

describe("scroll atlas route and chapter data", () => {
  it("keeps trade routes time-gated and source-backed from 1900 to today", () => {
    expect(tradeRoutes.length).toBeGreaterThanOrEqual(8);

    for (const route of tradeRoutes) {
      expect(route.firstYear).toBeGreaterThanOrEqual(1900);
      expect(route.firstYear).toBeLessThanOrEqual(2024);
      expect(route.peakYear).toBeGreaterThanOrEqual(route.firstYear);
      expect(route.sourceRefs.every((source) => sourceIds.has(source.id))).toBe(true);
      expect(getRouteIntensityForYear(route, route.firstYear - 1)).toBe(0);
      expect(getRouteIntensityForYear(route, route.peakYear)).toBeGreaterThan(0);

      for (const endpoint of [route.start, route.end]) {
        expect(endpoint.lat).toBeGreaterThanOrEqual(-90);
        expect(endpoint.lat).toBeLessThanOrEqual(90);
        expect(endpoint.lon).toBeGreaterThanOrEqual(-180);
        expect(endpoint.lon).toBeLessThanOrEqual(180);
      }
      for (const sample of route.intensityByYear) {
        expect(sample.intensity).toBeGreaterThanOrEqual(0);
        expect(sample.intensity).toBeLessThanOrEqual(1);
      }
    }

    expect(Array.from(new Set(tradeRoutes.map((route) => route.category)))).toEqual(
      expect.arrayContaining(["steamship", "oil", "grain", "container", "air", "digital"])
    );
  });

  it("maps required scroll years to camera targets, animals, and route emphasis", () => {
    const routeIds = new Set(tradeRoutes.map((route) => route.id));

    expect(scrollChapters.map((chapter) => chapter.year)).toEqual([
      1770,
      1900,
      1937,
      1954,
      1968,
      1972,
      1978,
      1997,
      2020,
      2024
    ]);

    for (const chapter of scrollChapters) {
      expect(chapter.title.length).toBeGreaterThan(3);
      expect(chapter.body.length).toBeGreaterThan(20);
      expect(chapter.globeTarget.lat).toBeGreaterThanOrEqual(-82);
      expect(chapter.globeTarget.lat).toBeLessThanOrEqual(82);
      expect(chapter.globeTarget.lon).toBeGreaterThanOrEqual(-180);
      expect(chapter.globeTarget.lon).toBeLessThanOrEqual(180);
      expect(chapter.globeTarget.zoomScalar).toBeGreaterThanOrEqual(0);
      expect(chapter.globeTarget.zoomScalar).toBeLessThanOrEqual(1);
      expect(chapter.activeRouteIds.every((routeId) => routeIds.has(routeId))).toBe(true);
    }

    expect(scrollChapters.find((chapter) => chapter.id === "briefing-2024")?.activeRouteIds).toContain(
      "transpacific-data-cable"
    );
  });

  it("keeps chapter visuals source-backed and limits Apollo media to its historical chapters", () => {
    const chapterIds = new Set(scrollChapters.map((chapter) => chapter.id));
    const chapterYears = new Map(scrollChapters.map((chapter) => [chapter.id, chapter.year]));
    const mediaIds = new Set(mediaAssets.map((asset) => asset.id));
    const apolloMediaIds = new Set([
      "media-apollo-8-earthrise",
      "media-apollo-17-blue-marble"
    ]);

    for (const chapter of scrollChapters) {
      expect(
        chapterVisuals.some((visual) => visual.chapterId === chapter.id),
        `${chapter.id} should have a chapter visual`
      ).toBe(true);
    }

    for (const visual of chapterVisuals) {
      expect(chapterIds.has(visual.chapterId)).toBe(true);
      expect(visual.title.length).toBeGreaterThan(3);
      expect(visual.caption.length).toBeGreaterThan(24);
      expect(visual.sourceRefs.every((source) => sourceIds.has(source.id))).toBe(true);
      if (visual.mediaAssetId) {
        expect(mediaIds.has(visual.mediaAssetId)).toBe(true);
      }
    }

    const preApolloVisuals = chapterVisuals.filter(
      (visual) => (chapterYears.get(visual.chapterId) ?? 0) < 1968
    );
    expect(
      preApolloVisuals.every((visual) => !apolloMediaIds.has(visual.mediaAssetId ?? ""))
    ).toBe(true);
    expect(preApolloVisuals.every((visual) => /reconstructed/i.test(visual.caption))).toBe(true);
    expect(
      chapterVisuals
        .filter((visual) => apolloMediaIds.has(visual.mediaAssetId ?? ""))
        .map((visual) => ({
          year: chapterYears.get(visual.chapterId),
          mediaAssetId: visual.mediaAssetId
        }))
    ).toEqual([
      { year: 1968, mediaAssetId: "media-apollo-8-earthrise" },
      { year: 1972, mediaAssetId: "media-apollo-17-blue-marble" }
    ]);

    expect(chapterVisuals.find((record) => record.chapterId === "baseline-1770")?.evidencePanelIds).toEqual([
      "biome-pressure"
    ]);
    expect(chapterVisuals.find((record) => record.chapterId === "trade-1900")?.evidencePanelIds).toEqual([
      "population-expansion"
    ]);
    expect(chapterVisuals.find((record) => record.chapterId === "television-1954")?.evidencePanelIds).toEqual([
      "population-expansion"
    ]);
    expect(chapterVisuals.find((record) => record.chapterId === "briefing-2024")?.evidencePanelIds).toEqual([
      "geo-change"
    ]);
    expect(chapterVisuals.every((record) => (record.evidencePanelIds?.length ?? 0) <= 1)).toBe(true);
  });
});
