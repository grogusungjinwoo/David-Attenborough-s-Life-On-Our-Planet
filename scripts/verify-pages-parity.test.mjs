import { describe, expect, it, vi } from "vitest";

import {
  collectAssetUrls,
  createCacheBustUrl,
  extractDocumentRefs,
  normalizeBasePath,
  parseArgs,
  waitForLiveParity
} from "./verify-pages-parity.mjs";

describe("verify-pages-parity helpers", () => {
  it("extracts hashed script and stylesheet refs from HTML", () => {
    const refs = extractDocumentRefs(`
      <link rel="modulepreload" href="/repo/assets/react-abc123.js">
      <script type="module" crossorigin src="/repo/assets/index-def456.js"></script>
      <link rel="stylesheet" crossorigin href="/repo/assets/index-ghi789.css">
      <link rel="icon" href="/favicon.svg">
    `);

    expect(refs).toEqual([
      "/repo/assets/index-def456.js",
      "/repo/assets/react-abc123.js",
      "/repo/assets/index-ghi789.css"
    ]);
  });

  it("collects Earth jpg asset URLs from built JavaScript", () => {
    const bundle = `
      new URL("/repo/assets/earth-day-noclouds-C8eFB4TX.jpg", import.meta.url);
      new URL("/repo/assets/earth-day-clouds-C0--iK_R.jpg", import.meta.url);
      new URL("/repo/assets/earth-night-lights-NjS93Ed1.jpg", import.meta.url);
    `;

    expect(collectAssetUrls(bundle)).toEqual([
      "/repo/assets/earth-day-noclouds-C8eFB4TX.jpg",
      "/repo/assets/earth-day-clouds-C0--iK_R.jpg",
      "/repo/assets/earth-night-lights-NjS93Ed1.jpg"
    ]);
  });

  it("normalizes CLI options for Pages verification", () => {
    const options = parseArgs([
      "--live-url",
      "https://example.github.io/repo",
      "--base",
      "repo",
      "--timeout-ms",
      "1000",
      "--interval-ms",
      "25",
      "--skip-build"
    ]);

    expect(options).toMatchObject({
      liveUrl: "https://example.github.io/repo/",
      base: "/repo/",
      timeoutMs: 1000,
      intervalMs: 25,
      skipBuild: true
    });
  });

  it("polls live HTML until bundle refs match local refs", async () => {
    const fetchHtml = vi
      .fn()
      .mockResolvedValueOnce('<script type="module" src="/repo/assets/index-old.js"></script>')
      .mockResolvedValueOnce('<script type="module" src="/repo/assets/index-new.js"></script>');

    await expect(
      waitForLiveParity({
        liveUrl: "https://example.github.io/repo/",
        localRefs: ["/repo/assets/index-new.js"],
        timeoutMs: 500,
        intervalMs: 1,
        fetchHtml
      })
    ).resolves.toMatchObject({
      attempts: 2,
      liveRefs: ["/repo/assets/index-new.js"]
    });
  });

  it("adds cache-bust parameters without dropping existing query params", () => {
    expect(createCacheBustUrl("https://example.github.io/repo/?x=1", "abc")).toBe(
      "https://example.github.io/repo/?x=1&v=abc"
    );
  });

  it("formats base paths with leading and trailing slashes", () => {
    expect(normalizeBasePath("repo")).toBe("/repo/");
    expect(normalizeBasePath("/repo/")).toBe("/repo/");
    expect(normalizeBasePath("/")).toBe("/");
  });
});
