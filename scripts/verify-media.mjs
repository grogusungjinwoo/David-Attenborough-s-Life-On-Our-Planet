/* global console, process */
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaPath = path.join(root, "src", "data", "media.ts");
const mediaSource = await readFile(mediaPath, "utf8");

const allowedLicenses = [
  "CC0",
  "Public Domain",
  "CC BY 2.0",
  "CC BY 2.5",
  "CC BY 3.0",
  "CC BY 4.0",
  "CC BY-SA 3.0",
  "CC BY-SA 4.0"
];

const issues = [];

for (const licenseMatch of mediaSource.matchAll(/license:\s*"([^"]+)"/g)) {
  if (!allowedLicenses.includes(licenseMatch[1])) {
    issues.push(`Unsupported media license: ${licenseMatch[1]}`);
  }
}

if (/commercialUseCompatible:\s*false/.test(mediaSource)) {
  issues.push("All media assets must be commercial-use compatible.");
}

if (!mediaSource.includes('"david-attenborough"') || !mediaSource.includes('"portrait"')) {
  issues.push("David portrait slot should be curated and marked as a portrait.");
}

const localPaths = [...mediaSource.matchAll(/"([a-z0-9-]+\.(?:jpg|png|webp))"/g)]
  .map((match) => `/media/wikimedia/${match[1]}`)
  .filter((value, index, list) => list.indexOf(value) === index);

for (const helperField of [
  "retrievedAt",
  "attribution",
  "sourceRefs",
  "commercialUseCompatible: true"
]) {
if (!mediaSource.includes(helperField)) {
    issues.push(`Media helper is missing ${helperField}.`);
  }
}

if (localPaths.length < 18) {
  issues.push(`Expected at least 18 local media files, found ${localPaths.length}.`);
}

for (const localPath of localPaths) {
  const absolutePath = path.join(root, "public", localPath.replace(/^\//, ""));

  try {
    await access(absolutePath);
    const fileStat = await stat(absolutePath);
    if (fileStat.size <= 0) {
      issues.push(`Media file is empty: ${localPath}`);
    }
  } catch {
    issues.push(`Media file is missing: ${localPath}`);
  }
}

if (issues.length > 0) {
  console.error(issues.join("\n"));
  process.exit(1);
}

console.log(`Media manifest policy checks passed for ${localPaths.length} local assets.`);
