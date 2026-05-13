# Life On Our Planet Interactive Globe

A GitHub Pages-ready Vite, React, TypeScript, and React Three Fiber app for a simulated educational globe inspired by David Attenborough's account of accelerating planetary change.

The first release is intentionally static and client-only: timeline facts, species records, zoo sites, and source provenance are typed seed data so the site can deploy to GitHub Pages without a backend. The 3D globe is simulated with procedural land, water, mountains, trees, buildings, zoo markers, and species regions, with a provider boundary for a future Google 3D Maps or Photorealistic 3D Tiles upgrade.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` typechecks and builds the static site.
- `npm run test` runs Vitest unit and data-integrity tests.
- `npm run test:e2e` runs Playwright smoke tests.
- `npm run test:visual-smoke` builds the Pages bundle, previews it locally, checks the deployed Pages URL, and captures parity screenshots in `test-results/visual-smoke/`.
- `npm run verify:pages` builds with the GitHub Pages base path and waits for the deployed page to serve the latest hashed JS/CSS and Earth texture assets.
- `npm run lint` runs ESLint.

## GitHub Pages

The included workflow builds on pushes to `main` or `master` and deploys the Vite `dist` folder with GitHub Pages. During GitHub Actions, the Vite base path is inferred from `GITHUB_REPOSITORY`; locally it stays `/`.

If the repository is deployed under a custom path, set `GITHUB_PAGES_BASE` during the build.

Local development runs at `http://127.0.0.1:5173/` by default. The hosted GitHub Pages URL is `https://grogusungjinwoo.github.io/David-Attenborough-s-Life-On-Our-Planet/`.

To force a cache-busted deployed check, open the hosted URL with a unique query string, for example:

```text
https://grogusungjinwoo.github.io/David-Attenborough-s-Life-On-Our-Planet/?v=<commit-sha>
```

After the Pages workflow finishes, this command proves the live page points at the latest local Pages build:

```powershell
npm run verify:pages
```

For a local-vs-hosted rendered smoke check, run:

```powershell
npm run test:visual-smoke
```

## Source Notes

The seed dataset uses public source references where available. Manuscript/PDF-only Attenborough excerpt facts are represented as provenance records marked as local-source placeholders until the PDF excerpt is added to the repo.
