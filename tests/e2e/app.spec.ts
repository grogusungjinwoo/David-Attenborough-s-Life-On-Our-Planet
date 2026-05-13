import { expect, test } from "@playwright/test";
import { inflateSync } from "node:zlib";

test("loads the globe and core controls", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByLabel("Timeline year")).toBeVisible();
  await expect(page.getByLabel("Layer controls")).toBeVisible();

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();

  if (testInfo.project.name === "mobile-chrome") {
    return;
  }

  await page.waitForTimeout(500);
  await expect.poll(async () => hasNonBlankPngPixel(await canvas.screenshot())).toBe(true);
  await expect(page.getByText("The current briefing")).toBeVisible();
  await expect(page.getByText("Planet state")).toBeVisible();
});

test("timeline and drawer controls update visible state", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "Drawer controls collapse on the mobile smoke viewport."
  );

  await page.goto("/");

  await page.getByLabel("1937: A child meets a still-wild world").click();
  await expect(page.getByTestId("timeline-current-year")).toContainText("1937");
  await expect(page.getByText("A child meets a still-wild world")).toBeVisible();

  await page.getByRole("button", { name: /Bornean orangutan/i }).click();
  await expect(page.getByRole("heading", { name: "Bornean orangutan" })).toBeVisible();

  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Toggle debug panel" }).click();
  await expect(page.getByRole("complementary", { name: "Debug panel" })).toBeVisible();
});

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
