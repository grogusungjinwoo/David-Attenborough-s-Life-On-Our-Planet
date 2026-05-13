import { defineConfig, devices } from "@playwright/test";

const localUrl =
  process.env.VISUAL_SMOKE_LOCAL_URL ??
  "http://127.0.0.1:5199/David-Attenborough-s-Life-On-Our-Planet/";
const liveUrl =
  process.env.VISUAL_SMOKE_LIVE_URL ??
  "https://grogusungjinwoo.github.io/David-Attenborough-s-Life-On-Our-Planet/";

export default defineConfig({
  testDir: "./tests/visual-smoke",
  testMatch: /.*\.pw\.ts/,
  timeout: 60_000,
  workers: 1,
  outputDir: "test-results/visual-smoke",
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 950 }
  },
  projects: [
    {
      name: "local-preview",
      metadata: { targetUrl: localUrl },
      use: { ...devices["Desktop Chrome"], baseURL: localUrl }
    },
    {
      name: "deployed-pages",
      metadata: { targetUrl: liveUrl },
      use: { ...devices["Desktop Chrome"], baseURL: liveUrl }
    }
  ]
});
