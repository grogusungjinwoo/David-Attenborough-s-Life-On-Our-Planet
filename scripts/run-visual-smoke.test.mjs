import { describe, expect, it } from "vitest";

import {
  createLocalPreviewUrl,
  parseVisualSmokeArgs
} from "./run-visual-smoke.mjs";

describe("run-visual-smoke helpers", () => {
  it("normalizes live URL, base path, and skip-build options", () => {
    const options = parseVisualSmokeArgs([
      "--live-url",
      "https://example.github.io/repo",
      "--base",
      "repo",
      "--port",
      "5200",
      "--skip-build"
    ]);

    expect(options).toMatchObject({
      liveUrl: "https://example.github.io/repo/",
      base: "/repo/",
      preferredPort: 5200,
      skipBuild: true
    });
  });

  it("creates a local preview URL that includes the Pages base path", () => {
    expect(createLocalPreviewUrl(5199, "/repo/")).toBe("http://127.0.0.1:5199/repo/");
  });
});
