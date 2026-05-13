import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase =
  process.env.GITHUB_PAGES_BASE ??
  (process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : "/");

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "zustand"],
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: [...configDefaults.exclude, "tests/e2e/**"]
  }
});
