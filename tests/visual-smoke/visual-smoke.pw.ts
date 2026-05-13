import { expect, test, type Locator, type Page } from "@playwright/test";
import { inflateSync } from "node:zlib";

const earthAssetNames = [
  "earth-day-noclouds",
  "earth-day-clouds",
  "earth-night-lights"
] as const;

test("renders the hosted parity smoke surface", async ({ page }, testInfo) => {
  const consoleFailures: string[] = [];
  const failedRequests: string[] = [];
  const earthResponses = new Map<string, number>();

  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error") {
      consoleFailures.push(text);
    }

    if (message.type() === "warning" && /404|asset|base path|failed|not found/i.test(text)) {
      consoleFailures.push(text);
    }
  });

  page.on("pageerror", (error) => {
    consoleFailures.push(error.message);
  });

  page.on("requestfailed", (request) => {
    if (["document", "image", "script", "stylesheet"].includes(request.resourceType())) {
      failedRequests.push(`${request.resourceType()} ${request.url()} ${request.failure()?.errorText}`);
    }
  });

  page.on("response", (response) => {
    const url = response.url();
    const assetName = earthAssetNames.find((name) => url.includes(name) && url.endsWith(".jpg"));
    if (assetName) {
      earthResponses.set(assetName, response.status());
    }
  });

  const targetUrl = String(testInfo.project.metadata.targetUrl ?? testInfo.project.use.baseURL ?? "./");
  const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  expect(response?.ok(), "page document should load").toBe(true);

  const metricDeck = page.getByLabel("Planet metrics");

  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("globe-canvas")).toBeVisible();
  await expect(metricDeck).toBeVisible();
  await expect(metricDeck.getByText("World population", { exact: true })).toBeVisible();
  await expect(metricDeck.getByText("Remaining wild space", { exact: true })).toBeVisible();
  await expect(metricDeck.getByText("Atmospheric carbon", { exact: true })).toBeVisible();
  await expect(metricDeck.getByText("Wild acreage", { exact: true })).toBeVisible();

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(4_000);
  expect(
    hasNonBlankPngPixel(await screenshotCanvasArea(page, canvas)),
    "globe canvas should contain bright rendered pixels"
  ).toBe(true);

  await page.screenshot({
    path: testInfo.outputPath(`${testInfo.project.name}.png`),
    fullPage: false
  });

  for (const assetName of earthAssetNames) {
    expect(earthResponses.get(assetName), `${assetName} should load with HTTP 200`).toBe(200);
  }

  expect(failedRequests, "no document/script/stylesheet/image requests should fail").toEqual([]);
  expect(consoleFailures, "no asset/base-path console failures should be emitted").toEqual([]);
});

async function screenshotCanvasArea(page: Page, canvas: Locator) {
  const box = await canvas.boundingBox();
  if (!box) {
    return Buffer.alloc(0);
  }

  return page.screenshot({
    clip: {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: Math.max(1, box.width),
      height: Math.max(1, box.height)
    }
  });
}

function hasNonBlankPngPixel(png: Buffer) {
  const chunks = readPngChunks(png);
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR");
  const idat = Buffer.concat(
    chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data)
  );

  if (!ihdr || idat.length === 0) {
    return false;
  }

  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);
  const bitDepth = ihdr.data[8];
  const colorType = ihdr.data[9];
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;

  if (bitDepth !== 8 || bytesPerPixel === 0 || width === 0 || height === 0) {
    return false;
  }

  const inflated = inflateSync(idat);
  const rowLength = width * bytesPerPixel;
  let offset = 0;
  let previous = Buffer.alloc(rowLength);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[offset];
    const scanline = Buffer.from(inflated.subarray(offset + 1, offset + 1 + rowLength));
    const row = unfilterPngRow(scanline, previous, filter, bytesPerPixel);

    for (let x = 0; x < row.length; x += bytesPerPixel * 4) {
      const alpha = bytesPerPixel === 4 ? row[x + 3] : 255;
      const brightness = row[x] + row[x + 1] + row[x + 2];

      if (alpha > 0 && brightness > 45) {
        return true;
      }
    }

    previous = row;
    offset += rowLength + 1;
  }

  return false;
}

function readPngChunks(png: Buffer) {
  const chunks: Array<{ type: string; data: Buffer }> = [];
  let offset = 8;

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const data = png.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += length + 12;

    if (type === "IEND") {
      break;
    }
  }

  return chunks;
}

function unfilterPngRow(
  row: Buffer,
  previous: Buffer,
  filter: number,
  bytesPerPixel: number
) {
  const result = Buffer.alloc(row.length);

  for (let index = 0; index < row.length; index += 1) {
    const left = index >= bytesPerPixel ? result[index - bytesPerPixel] : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0;
    const predictor =
      filter === 1
        ? left
        : filter === 2
          ? up
          : filter === 3
            ? Math.floor((left + up) / 2)
            : filter === 4
              ? paeth(left, up, upLeft)
              : 0;

    result[index] = (row[index] + predictor) & 0xff;
  }

  return result;
}

function paeth(left: number, up: number, upLeft: number) {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left;
  }

  return upDistance <= upLeftDistance ? up : upLeft;
}
