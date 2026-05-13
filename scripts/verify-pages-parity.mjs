/* global console, process, setTimeout, fetch, URL */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const defaultBase = "/David-Attenborough-s-Life-On-Our-Planet/";
const defaultLiveUrl = "https://grogusungjinwoo.github.io/David-Attenborough-s-Life-On-Our-Planet/";
const distIndexPath = path.resolve("dist", "index.html");
const earthAssetPattern = /["'`](\/?[^"'`]*assets\/earth-(?:day-noclouds|day-clouds|night-lights)[^"'`]*\.jpg)["'`]/g;

export function normalizeBasePath(value = defaultBase) {
  if (!value || value === "/") {
    return "/";
  }

  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

export function normalizeLiveUrl(value = defaultLiveUrl) {
  const url = new URL(value);
  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return url.toString();
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    liveUrl: process.env.PAGES_LIVE_URL ?? defaultLiveUrl,
    base: process.env.GITHUB_PAGES_BASE ?? defaultBase,
    timeoutMs: Number(process.env.PAGES_VERIFY_TIMEOUT_MS ?? 180_000),
    intervalMs: Number(process.env.PAGES_VERIFY_INTERVAL_MS ?? 5_000),
    skipBuild: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--skip-build") {
      options.skipBuild = true;
      continue;
    }

    const nextValue = argv[index + 1];
    if (nextValue === undefined) {
      throw new Error(`${arg} requires a value`);
    }

    if (arg === "--live-url") {
      options.liveUrl = nextValue;
    } else if (arg === "--base") {
      options.base = nextValue;
    } else if (arg === "--timeout-ms") {
      options.timeoutMs = Number(nextValue);
    } else if (arg === "--interval-ms") {
      options.intervalMs = Number(nextValue);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
    throw new Error("--timeout-ms must be a positive number");
  }

  if (!Number.isFinite(options.intervalMs) || options.intervalMs <= 0) {
    throw new Error("--interval-ms must be a positive number");
  }

  return {
    ...options,
    base: normalizeBasePath(options.base),
    liveUrl: normalizeLiveUrl(options.liveUrl)
  };
}

export function extractDocumentRefs(html) {
  const scripts = extractTagRefs(html, /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi);
  const modulePreloads = extractTagRefs(
    html,
    /<link\b(?=[^>]*\brel=["']modulepreload["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
  );
  const stylesheets = extractTagRefs(
    html,
    /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi
  );

  return unique([...scripts, ...modulePreloads, ...stylesheets]).filter((ref) =>
    /\.(?:js|css)(?:\?|$)/.test(ref)
  );
}

export function collectAssetUrls(text) {
  return unique([...text.matchAll(earthAssetPattern)].map((match) => match[1]));
}

export function createCacheBustUrl(url, value = Date.now().toString()) {
  const nextUrl = new URL(url);
  nextUrl.searchParams.set("v", value);
  return nextUrl.toString();
}

export async function waitForLiveParity({
  liveUrl,
  localRefs,
  timeoutMs,
  intervalMs,
  fetchHtml = fetchLiveHtml
}) {
  const startedAt = Date.now();
  let attempts = 0;
  let lastLiveRefs = [];

  while (Date.now() - startedAt <= timeoutMs) {
    attempts += 1;
    const cacheBustUrl = createCacheBustUrl(liveUrl, `${Date.now()}-${attempts}`);
    const liveHtml = await fetchHtml(cacheBustUrl);
    const liveRefs = extractDocumentRefs(liveHtml);
    lastLiveRefs = liveRefs;

    if (sameRefs(liveRefs, localRefs)) {
      return { attempts, liveRefs };
    }

    await delay(intervalMs);
  }

  throw new Error(
    [
      `Timed out after ${attempts} attempts waiting for GitHub Pages to serve the latest bundle refs.`,
      `Local refs: ${formatRefs(localRefs)}`,
      `Live refs: ${formatRefs(lastLiveRefs)}`
    ].join("\n")
  );
}

async function main() {
  const options = parseArgs();

  if (!options.skipBuild) {
    runBuild(options.base);
  }

  const localHtml = await readFile(distIndexPath, "utf8");
  const localRefs = extractDocumentRefs(localHtml);
  if (localRefs.length === 0) {
    throw new Error(`No JS/CSS bundle refs found in ${distIndexPath}`);
  }

  console.log(`Local bundle refs:\n${formatRefs(localRefs)}`);
  const parityResult = await waitForLiveParity({
    liveUrl: options.liveUrl,
    localRefs,
    timeoutMs: options.timeoutMs,
    intervalMs: options.intervalMs
  });

  console.log(`Live bundle refs matched after ${parityResult.attempts} attempt(s).`);
  await verifyLiveAssets(options.liveUrl, parityResult.liveRefs);
}

function runBuild(base) {
  const env = { ...process.env, GITHUB_PAGES_BASE: base };

  runNodeCommand(["./node_modules/typescript/bin/tsc", "-b"], env);
  runNodeCommand(["./node_modules/vite/bin/vite.js", "build"], env);
}

function runNodeCommand(args, env) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: node ${args.join(" ")}`);
  }
}

async function verifyLiveAssets(liveUrl, refs) {
  const bundleTexts = [];

  for (const ref of refs) {
    const assetUrl = new URL(ref, liveUrl).toString();
    await assertOk(assetUrl);

    if (/\.js(?:\?|$)/.test(ref)) {
      bundleTexts.push(await fetchText(assetUrl));
    }
  }

  const earthUrls = unique(bundleTexts.flatMap((text) => collectAssetUrls(text)));
  if (earthUrls.length === 0) {
    throw new Error("No Earth JPG asset URLs were found in the live JavaScript bundles.");
  }

  for (const earthUrl of earthUrls) {
    await assertOk(new URL(earthUrl, liveUrl).toString());
  }

  console.log(`Verified ${refs.length} JS/CSS ref(s) and ${earthUrls.length} Earth JPG asset ref(s).`);
}

async function fetchLiveHtml(url) {
  return fetchText(url);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: noCacheHeaders()
  });

  if (!response.ok) {
    throw new Error(`GET ${url} returned ${response.status}`);
  }

  return response.text();
}

async function assertOk(url) {
  const response = await fetch(url, {
    method: "HEAD",
    headers: noCacheHeaders()
  });

  if (response.ok) {
    return;
  }

  const getResponse = await fetch(url, {
    headers: noCacheHeaders()
  });

  if (!getResponse.ok) {
    throw new Error(`${url} returned ${getResponse.status}`);
  }
}

function noCacheHeaders() {
  return {
    "cache-control": "no-cache",
    pragma: "no-cache"
  };
}

function extractTagRefs(html, pattern) {
  return [...html.matchAll(pattern)].map((match) => match[1]);
}

function sameRefs(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function unique(values) {
  return [...new Set(values)];
}

function formatRefs(refs) {
  return refs.length === 0 ? "(none)" : refs.map((ref) => `  - ${ref}`).join("\n");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
