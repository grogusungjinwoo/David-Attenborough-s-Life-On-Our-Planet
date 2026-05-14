import { describe, expect, it } from "vitest";
import {
  editorialStories,
  manuscriptIndexStatus,
  solutionRecords,
  solutionSourceStatus
} from "./editorial";
import { mediaAssets } from "./media";

describe("editorial content layer", () => {
  it("keeps every story grounded to manuscript PDF page refs", () => {
    for (const story of editorialStories) {
      expect(story.manuscriptPageRefs.length).toBeGreaterThan(0);
      expect(story.sourceRefs.length).toBeGreaterThan(0);
      expect(story.summary).not.toMatch(/".{80,}"/);

      for (const pageRef of story.manuscriptPageRefs) {
        expect(pageRef.sourceId).toBe("attenborough-life-on-our-planet-excerpt");
        expect(pageRef.pdfPage).toBeGreaterThanOrEqual(1);
        expect(pageRef.pdfPage).toBeLessThanOrEqual(27);
        expect(pageRef.label.length).toBeGreaterThan(10);
      }
    }
  });

  it("blocks solution records because Part Three is unavailable in the excerpt", () => {
    expect(solutionRecords).toEqual([]);
    expect(manuscriptIndexStatus.hasPartThreeSolutions).toBe(false);
    expect(manuscriptIndexStatus.sourceNote).toMatch(/27-page excerpt/i);
    expect(solutionSourceStatus.blocked).toBe(true);
  });

  it("keeps media metadata commercial-compatible and source-backed", () => {
    const wikimediaAssets = mediaAssets.filter((asset) => asset.kind !== "earth");
    const earthReferenceAssets = mediaAssets.filter((asset) => asset.kind === "earth");

    expect(wikimediaAssets.length).toBeGreaterThanOrEqual(18);
    expect(earthReferenceAssets.length).toBeGreaterThanOrEqual(2);

    for (const asset of wikimediaAssets) {
      expect(asset.commercialUseCompatible).toBe(true);
      expect(asset.attribution.length).toBeGreaterThan(8);
      expect(asset.placeholderStatus).toBe("available");
      expect(asset.localPath).toMatch(/^\/media\/wikimedia\//);
      expect(asset.alt.length).toBeGreaterThan(12);
      expect(asset.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
      expect(asset.licenseUrl).toMatch(/^https?:\/\//);
      expect(asset.sourceRefs.length).toBeGreaterThan(0);
    }

    for (const asset of earthReferenceAssets) {
      expect(asset.commercialUseCompatible).toBe(true);
      expect(asset.placeholderStatus).toBe("available");
      expect(asset.sourceUrl).toMatch(/^https:\/\/www\.nasa\.gov\//);
      expect(asset.sourceRefs.some((source) => source.publisher === "NASA")).toBe(true);
      expect(asset.notes).toMatch(/space-view reference|not a literal photograph/i);
    }

    expect(
      mediaAssets.some(
        (asset) =>
          asset.kind === "portrait" &&
          asset.requiredForDisplay &&
          asset.placeholderStatus === "available" &&
          asset.subjectId === "david-attenborough"
      )
    ).toBe(true);
  });
});
