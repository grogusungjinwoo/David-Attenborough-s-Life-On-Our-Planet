import { expect, test, type Locator } from "@playwright/test";

const testIds = {
  appShell: "app-shell",
  globeCanvas: "globe-canvas",
  timeline: "timeline",
  timelineCurrentYear: "timeline-current-year",
  timelineYear2020: "timeline-year-2020",
  layerToggleSpecies: "layer-toggle-species",
  speciesDrawerTrigger: "species-drawer-trigger",
  speciesDrawer: "species-drawer",
  sourceSection: "source-section"
} as const;

type ToggleState = {
  attribute: "aria-pressed" | "aria-checked";
  value: "true" | "false";
};

test.describe("planned globe smoke flow", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Smoke spec targets the full desktop drawer and layer dock."
    );

    await page.goto("/");
  });

  test("loads the app shell", async ({ page }) => {
    await expect(page.getByTestId(testIds.appShell)).toBeVisible();
  });

  test("shows the WebGL globe canvas", async ({ page }) => {
    const globeCanvas = page.getByTestId(testIds.globeCanvas);

    await expect(globeCanvas).toBeVisible();
    await expectCanvasElement(globeCanvas);
  });

  test("selects the 2020 timeline anchor", async ({ page }) => {
    await expect(page.getByTestId(testIds.timeline)).toBeVisible();

    await page.getByTestId(testIds.timelineYear2020).click();

    await expect(page.getByTestId(testIds.timelineCurrentYear)).toContainText("2020");
  });

  test("toggles the species layer aria state", async ({ page }) => {
    const speciesLayerToggle = page.getByTestId(testIds.layerToggleSpecies);

    await expect(speciesLayerToggle).toBeVisible();

    const initialState = await readAriaToggleState(speciesLayerToggle);
    const expectedValue = initialState.value === "true" ? "false" : "true";

    await speciesLayerToggle.click();

    await expect
      .poll(
        async () => {
          const nextState = await readAriaToggleState(speciesLayerToggle);
          return `${nextState.attribute}:${nextState.value}`;
        },
        {
          message: `${testIds.layerToggleSpecies} should update its aria toggle state`
        }
      )
      .toBe(`${initialState.attribute}:${expectedValue}`);
  });

  test("opens the species drawer", async ({ page }) => {
    const drawerTrigger = page.getByTestId(testIds.speciesDrawerTrigger);

    await expect(drawerTrigger).toBeVisible();

    await drawerTrigger.click();

    await expect(drawerTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId(testIds.speciesDrawer)).toBeVisible();
  });

  test("shows the source section", async ({ page }) => {
    await expect(page.getByTestId(testIds.sourceSection)).toBeVisible();
  });
});

async function expectCanvasElement(locator: Locator) {
  const hasCanvas = await locator.evaluate((element) => {
    return element.tagName.toLowerCase() === "canvas" || element.querySelector("canvas") !== null;
  });

  expect(hasCanvas, `${testIds.globeCanvas} should be a canvas or contain a canvas`).toBe(true);
}

async function readAriaToggleState(locator: Locator): Promise<ToggleState> {
  const state = await locator.evaluate((element) => {
    const ariaPressed = element.getAttribute("aria-pressed");
    if (ariaPressed === "true" || ariaPressed === "false") {
      return { attribute: "aria-pressed", value: ariaPressed };
    }

    const ariaChecked = element.getAttribute("aria-checked");
    if (ariaChecked === "true" || ariaChecked === "false") {
      return { attribute: "aria-checked", value: ariaChecked };
    }

    return null;
  });

  expect(
    state,
    "Expected toggle to expose aria-pressed or aria-checked with a true/false value"
  ).not.toBeNull();

  return state as ToggleState;
}
