/* global console, process, fetch, setTimeout */
import { spawn, spawnSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeBasePath, normalizeLiveUrl } from "./verify-pages-parity.mjs";

const defaultBase = "/David-Attenborough-s-Life-On-Our-Planet/";
const defaultLiveUrl = "https://grogusungjinwoo.github.io/David-Attenborough-s-Life-On-Our-Planet/";

export function parseVisualSmokeArgs(argv = process.argv.slice(2)) {
  const options = {
    liveUrl: process.env.VISUAL_SMOKE_LIVE_URL ?? process.env.PAGES_LIVE_URL ?? defaultLiveUrl,
    base: process.env.GITHUB_PAGES_BASE ?? defaultBase,
    preferredPort: Number(process.env.VISUAL_SMOKE_PORT ?? 5199),
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
    } else if (arg === "--port") {
      options.preferredPort = Number(nextValue);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (!Number.isFinite(options.preferredPort) || options.preferredPort <= 0) {
    throw new Error("--port must be a positive number");
  }

  return {
    ...options,
    liveUrl: normalizeLiveUrl(options.liveUrl),
    base: normalizeBasePath(options.base)
  };
}

export function createLocalPreviewUrl(port, base) {
  return `http://127.0.0.1:${port}${normalizeBasePath(base)}`;
}

async function main() {
  const options = parseVisualSmokeArgs();

  if (!options.skipBuild) {
    runPagesBuild(options.base);
  }

  const port = await findAvailablePort(options.preferredPort);
  const localUrl = createLocalPreviewUrl(port, options.base);
  const preview = startPreview(port, options.base);

  try {
    await waitForUrl(localUrl, preview);
    runPlaywright(localUrl, options.liveUrl);
  } finally {
    preview.kill();
  }
}

function runPagesBuild(base) {
  const env = { ...process.env, GITHUB_PAGES_BASE: base };
  runNodeCommand(["./node_modules/typescript/bin/tsc", "-b"], env);
  runNodeCommand(["./node_modules/vite/bin/vite.js", "build"], env);
}

function startPreview(port, base) {
  const preview = spawn(
    process.execPath,
    [
      "./node_modules/vite/bin/vite.js",
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort"
    ],
    {
      cwd: process.cwd(),
      env: { ...process.env, GITHUB_PAGES_BASE: base },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  preview.stdout.on("data", (chunk) => {
    console.log(chunk.toString().trimEnd());
  });
  preview.stderr.on("data", (chunk) => {
    console.error(chunk.toString().trimEnd());
  });

  return preview;
}

function runPlaywright(localUrl, liveUrl) {
  const result = spawnSync(
    process.execPath,
    ["./node_modules/@playwright/test/cli.js", "test", "--config", "playwright.visual-smoke.config.ts"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        VISUAL_SMOKE_LOCAL_URL: localUrl,
        VISUAL_SMOKE_LIVE_URL: liveUrl
      },
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    throw new Error("Visual smoke Playwright run failed.");
  }
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

async function waitForUrl(url, preview) {
  let previewExit;
  preview.once("exit", (code, signal) => {
    previewExit = { code, signal };
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 30_000) {
    if (previewExit) {
      throw new Error(`Vite preview exited early with code ${previewExit.code ?? previewExit.signal}`);
    }

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        return;
      }
    } catch {
      // Preview is still starting.
    }

    await delay(250);
  }

  throw new Error(`Timed out waiting for local preview at ${url}`);
}

async function findAvailablePort(preferredPort) {
  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    if (await canListen(port)) {
      return port;
    }
  }

  throw new Error(`No available preview port found from ${preferredPort} to ${preferredPort + 19}`);
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => {
      resolve(false);
    });
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
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
