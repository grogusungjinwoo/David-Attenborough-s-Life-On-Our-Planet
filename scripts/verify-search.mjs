/* global process */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vitestBin = path.join(root, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(
  process.execPath,
  [vitestBin, "run", "src/domain/contentSearch.test.ts"],
  {
    stdio: "inherit",
    shell: false
  }
);

process.exit(result.status ?? 1);
