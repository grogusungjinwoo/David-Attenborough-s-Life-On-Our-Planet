import { describe, expect, it } from "vitest";
import {
  earthBasemapDescriptors,
  earthDomainWorkstreams,
  earthTextureManifest,
  staticEarthProvider
} from "./mapProviders";

describe("static Earth provider", () => {
  it("advertises a static open-data Earth path with no API key", () => {
    expect(staticEarthProvider.descriptor.kind).toBe("static-earth");
    expect(staticEarthProvider.descriptor.capabilities.requiresApiKey).toBe(false);
    expect(staticEarthProvider.descriptor.capabilities.supportsStaticHosting).toBe(true);
    expect(staticEarthProvider.descriptor.capabilities.supportsTopographicMode).toBe(true);
    expect(staticEarthProvider.descriptor.capabilities.supportsSatelliteMode).toBe(true);
  });

  it("exposes basemap descriptors for agent-selectable Earth modes", () => {
    expect(earthBasemapDescriptors.map((descriptor) => descriptor.id)).toEqual([
      "satellite",
      "topographic",
      "political"
    ]);

    for (const descriptor of earthBasemapDescriptors) {
      expect(descriptor.sourceIds.length).toBeGreaterThan(0);
      expect(descriptor.attribution.length).toBeGreaterThan(0);
    }
  });

  it("splits world refinement into eight domain workstreams", () => {
    expect(earthDomainWorkstreams).toHaveLength(8);
    expect(earthDomainWorkstreams.map((workstream) => workstream.id)).toEqual([
      "africa",
      "antarctica",
      "asia",
      "europe",
      "north-america",
      "south-america",
      "oceania-australia",
      "oceans-islands"
    ]);
  });

  it("resolves bundled Earth textures through Vite asset URLs", () => {
    const textureUrls = [
      ...Object.values(earthTextureManifest.albedo),
      ...Object.values(earthTextureManifest.normal)
    ];

    expect(textureUrls).toHaveLength(5);
    for (const url of textureUrls) {
      expect(url).toContain("earth-day-noclouds");
      expect(url).not.toMatch(/^\/assets\//);
    }
  });
});
