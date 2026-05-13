import { expect, test } from "@playwright/test";

test("loads the globe and core controls", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByLabel("Timeline year")).toBeVisible();
  await expect(page.getByLabel("Layer controls")).toBeVisible();

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();

  if (testInfo.project.name === "mobile-chrome") {
    return;
  }

  await expect(page.getByTestId("globe-viewport")).toHaveAttribute("data-active-view", "space");
  await expect(page.getByText("The current briefing")).toBeVisible();
  await expect(page.getByText("Planet state")).toBeVisible();
});

test("timeline and drawer controls update visible state", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "Drawer controls collapse on the mobile smoke viewport."
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.getByLabel("1937: A child meets a still-wild world").click();
  await expect(page.getByTestId("timeline-current-year")).toContainText("1937");
  await expect(page.getByText("A child meets a still-wild world")).toBeVisible();

  await page.getByRole("button", { name: /Bornean orangutan/i }).click();
  await expect(page.getByRole("heading", { name: "Bornean orangutan" })).toBeVisible();

  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Toggle debug panel" }).click();
  await expect(page.getByRole("complementary", { name: "Debug panel" })).toBeVisible();
});

test("globe navigation supports diagonal pan, wheel zoom, reset, and admin-region view", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "Desktop pointer geometry is used for diagonal drag assertions."
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const viewport = page.getByTestId("globe-viewport");
  await expect(viewport).toBeVisible();

  const beforeLongitude = Number(await viewport.getAttribute("data-longitude"));
  const beforeLatitude = Number(await viewport.getAttribute("data-latitude"));

  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width * 0.52, box!.y + box!.height * 0.42);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width * 0.38, box!.y + box!.height * 0.56, {
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
  await page.mouse.move(box!.x + box!.width * 0.52, box!.y + box!.height * 0.42);
  await page.mouse.wheel(0, -320);
  await expect
    .poll(async () => Number(await viewport.getAttribute("data-zoom")))
    .toBeGreaterThan(beforeZoom);

  await page.getByLabel("Earth view").selectOption("admin-regions");
  await expect(viewport).toHaveAttribute("data-active-view", "admin-regions");

  await page.getByRole("button", { name: "Zoom in" }).dispatchEvent("click");
  await expect(page.locator(".globe-admin-label").first()).toBeVisible();

  await page.getByRole("button", { name: "Reset view" }).dispatchEvent("click");
  await expect(viewport).toHaveAttribute("data-zoom", "0.48");
});

test("wild-space definition switch exposes source caveats", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.getByLabel("Wild space definition")).toBeVisible();
  await page.getByRole("button", { name: "Low human footprint" }).click();

  await expect(
    page.getByLabel("Wild space definition").getByText(/Derived from public human-pressure datasets/i)
  ).toBeVisible();
  await page.getByLabel("Earth view").selectOption("wild-evidence");
  await expect(page.getByTestId("globe-viewport")).toHaveAttribute(
    "data-active-view",
    "wild-evidence"
  );
});

test("change lens tracks timeline year and selected geography layer", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const lens = page.getByTestId("change-lens");
  await expect(lens).toBeVisible();
  await expect(lens).toHaveAttribute("data-active-layer", "wild-space");
  await expect(lens.getByText("2024")).toBeVisible();

  const layerSelect = page.getByLabel("Geographic change layer");
  await layerSelect.selectOption("forest-cover");
  await expect(lens).toHaveAttribute("data-active-layer", "forest-cover");
  await expect(lens.locator(".change-lens-summary")).toContainText(/Forest-cover stress/i);

  await page.getByLabel("1937: A child meets a still-wild world").click();
  await expect(page.getByTestId("timeline-current-year")).toContainText("1937");
  await expect(lens.locator(".change-compare strong", { hasText: "1937" })).toBeVisible();

  for (const layerId of [
    "wild-space",
    "human-footprint",
    "forest-cover",
    "ocean-ice",
    "urban-lights"
  ]) {
    await layerSelect.selectOption(layerId);
    await expect(lens).toHaveAttribute("data-active-layer", layerId);
  }

  expect(consoleErrors).toEqual([]);
});

test("editorial navigation, tabs, search, images, and fullscreen work", async ({ page }, testInfo) => {
  testInfo.setTimeout(testInfo.project.name === "mobile-chrome" ? 180_000 : 90_000);

  await page.goto("/", { waitUntil: "domcontentloaded" });

  const navigation = page.getByLabel("Console navigation");
  const witnessDrawer = page.getByLabel("Species and provenance drawer");

  await witnessDrawer.getByRole("button", { name: "Stories" }).click();
  await expect(page.getByRole("heading", { name: /Pripyat turns absence/i })).toBeVisible();

  await witnessDrawer.getByRole("button", { name: "Insights" }).click();
  await expect(page.getByText(/species profiles broaden/i)).toBeVisible();

  await navigation.getByRole("button", { name: "Species" }).click();
  await expect(page.getByRole("heading", { name: "Species" })).toBeVisible();
  await expect(
    page.locator(".species-profile-card").filter({ hasText: "African bush elephant" }).first()
  ).toBeVisible();

  const speciesImage = page.locator(".species-profile-card img").first();
  await expect(speciesImage).toBeVisible();
  await expect
    .poll(async () => speciesImage.evaluate((image) => (image as HTMLImageElement).naturalWidth), {
      timeout: 15_000
    })
    .toBeGreaterThan(0);

  await navigation.getByRole("button", { name: "Places" }).click();
  await expect(page.getByRole("heading", { name: "Places" })).toBeVisible();
  await expect(
    page.getByLabel("Places directory").getByRole("button", { name: /Borneo Rainforest/i })
  ).toBeVisible();

  await navigation.getByRole("button", { name: "Solutions" }).click();
  await expect(page.getByText(/Solutions require the missing Part Three pages/i)).toBeVisible();

  await navigation.getByRole("button", { name: "Search" }).click();
  const searchBox = page.getByRole("searchbox", { name: "Search atlas content" });
  await searchBox.fill("orangutan");
  await expect(page.getByRole("button", { name: /species Bornean orangutan/i })).toBeVisible();

  if (testInfo.project.name === "mobile-chrome") {
    return;
  }

  await searchBox.fill("Pripyat");
  await expect(page.getByRole("button", { name: /story Pripyat turns absence/i })).toBeVisible();

  await searchBox.fill("rewild");
  await expect(page.getByRole("button", { name: /story Pripyat turns absence/i })).toBeVisible();

  await searchBox.fill("carbon");
  await expect(page.getByRole("button", { name: /insight 2024 reads as a pressure snapshot/i })).toBeVisible();

  await page.getByRole("button", { name: "Enter fullscreen" }).click();
  await expect(page.getByRole("button", { name: "Exit fullscreen" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();
});
