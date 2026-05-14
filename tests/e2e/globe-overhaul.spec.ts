import { expect, test } from "@playwright/test";

test("globe detail overhaul is wired end to end", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "The overhaul regression uses desktop drag geometry and the full console layout."
  );

  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !isIgnorableDevServerConsoleMessage(message.text())) {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await revealGlobeControls(page);

  const viewport = page.getByTestId("globe-viewport");
  const canvas = page.locator("canvas").first();
  const viewSelect = page.getByLabel("Earth view");
  const lens = page.getByTestId("change-lens");

  await expect(viewport).toBeVisible();
  await expect(canvas).toBeVisible();
  const canvasBox = await canvas.boundingBox();
  expect(canvasBox?.width ?? 0).toBeGreaterThan(0);
  expect(canvasBox?.height ?? 0).toBeGreaterThan(0);
  await expect(viewSelect).toHaveValue("space");

  const beforeLongitude = Number(await viewport.getAttribute("data-longitude"));
  const beforeLatitude = Number(await viewport.getAttribute("data-latitude"));
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width * 0.54, box!.y + box!.height * 0.38);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.36, box!.y + box!.height * 0.58, {
    steps: 8
  });
  await page.mouse.up();

  await expect
    .poll(async () => Number(await viewport.getAttribute("data-longitude")))
    .not.toBe(beforeLongitude);
  await expect
    .poll(async () => Number(await viewport.getAttribute("data-latitude")))
    .not.toBe(beforeLatitude);

  const beforeZoom = Number(await viewport.getAttribute("data-zoom"));
  await page.mouse.move(box!.x + box!.width * 0.54, box!.y + box!.height * 0.38);
  await page.mouse.wheel(0, -320);
  await expect
    .poll(async () => Number(await viewport.getAttribute("data-zoom")))
    .toBeGreaterThan(beforeZoom);

  await viewSelect.selectOption("topographic");
  await expect(viewport).toHaveAttribute("data-active-view", "topographic");
  await expect(page.getByTestId("layer-toggle-topographicRelief")).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  await viewSelect.selectOption("admin-regions");
  await expect(viewport).toHaveAttribute("data-active-view", "admin-regions");
  await expect(page.getByTestId("layer-toggle-adminBoundaries")).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.getByRole("button", { name: "Zoom in" }).dispatchEvent("click");
  await page.getByRole("button", { name: "Zoom in" }).dispatchEvent("click");
  await expect.poll(async () => page.locator(".globe-admin-label").count()).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Low human footprint" }).click();
  await expect(
    page.getByLabel("Wild space definition").getByText(/Derived from public human-pressure datasets/i)
  ).toBeVisible();

  await viewSelect.selectOption("wild-evidence");
  await expect(viewport).toHaveAttribute("data-active-view", "wild-evidence");

  await expect(lens).toHaveAttribute("data-active-layer", "wild-space");
  await page.getByLabel("Geographic change layer").selectOption("forest-cover");
  await expect(lens).toHaveAttribute("data-active-layer", "forest-cover");
  await expect(lens.locator(".change-lens-summary")).toContainText(/Forest-cover stress/i);

  await page.getByLabel("1937: A child meets a still-wild world").click();
  await expect(page.getByTestId("timeline-current-year")).toContainText("1937");
  await expect(lens.locator(".change-compare strong")).toContainText("1937");

  const evidenceBadges = page
    .getByLabel("Species and provenance drawer")
    .getByLabel("Evidence badges");
  for (const badge of ["narrative", "derived", "measured", "simulated"]) {
    await expect(evidenceBadges.getByText(badge)).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});

async function revealGlobeControls(page: import("@playwright/test").Page) {
  const showControls = page.getByRole("button", { name: "Show globe controls" });

  if (await showControls.count()) {
    await showControls.click();
  }
}

function isIgnorableDevServerConsoleMessage(message: string) {
  return /WebSocket connection to 'ws:\/\/127\.0\.0\.1:\d+\/' failed: Error in connection establishment: net::ERR_NETWORK_IO_SUSPENDED/i.test(
    message
  );
}
