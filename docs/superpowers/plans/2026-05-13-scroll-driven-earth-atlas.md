# Scroll Driven Earth Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the crowded box-in-box dashboard with a scroll-driven atlas where time advances as the user scrolls, the globe rotates through eras, countries and wild areas are labeled directly on the globe at zoom, trade routes appear from the 1900s to today, and animal/photo stories unfold without losing existing functionality.

**Architecture:** Keep React, Vite, TypeScript, Zustand, Three.js, React Three Fiber, and the current static data model. Add a scroll narrative layer that drives `currentYear`, camera target, active story section, route visibility, and animal content while the globe stays as the main sticky stage. Split work across seven agents with disjoint ownership: map-detail rendering, country placement data, continent/landmass correction, trade routes, scroll/animal UI, regression preservation, and context offload.

**Tech Stack:** React 19, Vite, TypeScript, Zustand, Three.js, React Three Fiber, Drei, Vitest, Playwright, static Natural Earth/NASA/NOAA/ESA-style Earth assets, existing Wikimedia species media.

---

## Reference Direction

- Herd Signal: use the page rhythm of a primary map section plus scroll content, without making the map a separate boxed widget.
- Rahul portfolio: use scroll progress to change active messages; in this app the changing value is time/year, camera target, and route/animal emphasis.
- djaiss/mapsicon: use the per-country slice organization idea only. Do not use it as the accuracy source because the repository itself says the icons are placeholders/illustrations and not extremely precise maps.

## Scope Decision

This plan supersedes the current "uber detail planet UI" box-heavy direction. The old metric cards, witness drawer, bottom panels, map controls, search, layers, and timeline functionality stay in the product, but they move into scroll-native sections, sticky tool rails, and compact overlays instead of nested panels inside nested panels.

---

## Current Code Anchors

- Main composition: `src/App.tsx`
- Current shell and crowded panels: `src/components/AtlasConsole.tsx`
- Primary styles: `src/styles.css`
- 3D globe: `src/features/globe/GlobeViewport.tsx`, `src/features/globe/ProceduralGlobe.tsx`, `src/features/globe/spherical.ts`
- 2D map: `src/features/map/MapViewport.tsx`
- Store: `src/state/usePlanetStore.ts`
- Existing year data: `src/data/timeline.ts`
- Existing region/species/media data: `src/data/regions.ts`, `src/data/species.ts`, `src/data/media.ts`
- Existing source integrity tests: `src/data/dataIntegrity.test.ts`
- Existing e2e coverage: `tests/e2e/globe-overhaul.spec.ts`, `tests/e2e/app.spec.ts`, `tests/e2e/smoke.spec.ts`

---

## Shared Data Contracts

Add or extend these types in `src/domain/types.ts`:

```ts
export type ContinentId =
  | "africa"
  | "antarctica"
  | "asia"
  | "europe"
  | "north-america"
  | "south-america"
  | "oceania";

export type CountryRecord = {
  id: string;
  isoA2: string;
  isoA3: string;
  name: string;
  continentId: ContinentId;
  labelLat: number;
  labelLon: number;
  bbox: [number, number, number, number];
  importanceRank: number;
  sourceRefs: SourceRef[];
};

export type ContinentRecord = {
  id: ContinentId;
  name: string;
  labelLat: number;
  labelLon: number;
  bbox: [number, number, number, number];
  sourceRefs: SourceRef[];
};

export type WildAreaRecord = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  radiusKm: number;
  biome: RegionRecord["biome"];
  firstVisibleYear: number;
  sourceRefs: SourceRef[];
};

export type TradeRouteRecord = {
  id: string;
  label: string;
  start: { label: string; lat: number; lon: number };
  end: { label: string; lat: number; lon: number };
  firstYear: number;
  peakYear: number;
  category: "steamship" | "oil" | "grain" | "container" | "air" | "digital";
  intensityByYear: Array<{ year: number; intensity: number }>;
  sourceRefs: SourceRef[];
};

export type ScrollChapterRecord = {
  id: string;
  year: number;
  title: string;
  body: string;
  globeTarget: { lat: number; lon: number; zoomScalar: number };
  activeSpeciesIds: string[];
  activeRouteIds: string[];
  activeLayerIds: Array<keyof LayerState>;
};
```

Add files:

- `src/data/continents.ts`
- `src/data/countries.ts`
- `src/data/wildAreas.ts`
- `src/data/tradeRoutes.ts`
- `src/data/scrollChapters.ts`
- `src/features/globe/CountryBoundaryLayer.tsx`
- `src/features/globe/GlobeLabelLayer.tsx`
- `src/features/globe/TradeRouteLayer.tsx`
- `src/components/scroll/ScrollAtlas.tsx`
- `src/components/scroll/TimeScrollController.tsx`
- `src/components/scroll/AnimalStoryScroller.tsx`
- `src/components/scroll/StickyAtlasStage.tsx`
- `src/components/scroll/ScrollChapterPanel.tsx`
- `src/components/scroll/LegacyContentRail.tsx`
- `docs/agent-handoffs/`

---

## Agent Ownership Matrix

| Agent | Mission | Owns | Avoids |
| --- | --- | --- | --- |
| Agent 1 | Increase globe detail, labels, zoom-level clarity | `src/features/globe/*`, globe tests | Scroll layout and country data authoring |
| Agent 2 | Assign country records, labels, and source-backed country positions | `src/data/countries.ts`, `src/data/countries.test.ts`, `src/map/projections.ts` tests | Globe rendering internals |
| Agent 3 | Correct continents/landmass model to a seven-continent accurate world | `src/data/continents.ts`, `src/data/wildAreas.ts`, boundary asset notes, continent tests | UI shell |
| Agent 4 | Add time-based trade routes from 1900-present | `src/data/tradeRoutes.ts`, `src/features/globe/TradeRouteLayer.tsx`, route tests | Country assignment |
| Agent 5 | Build scroll UI and animal/photo storytelling | `src/components/scroll/*`, `src/components/AtlasConsole.tsx`, `src/styles.css`, scroll tests | Globe math/data internals |
| Agent 6 | Preserve content/functionality through regression tests | `tests/e2e/*`, `tests/visual-smoke/*`, `scripts/verify-*.mjs`, QA docs | Feature implementation unless fixing assigned test gaps |
| Agent 7 | Offload context windows and integration state | `docs/agent-handoffs/*`, plan checklists, source/fidelity ledgers | Production UI/runtime code |

Integration lead owns `src/App.tsx`, `src/data/index.ts`, and cross-agent prop wiring.

---

## Phase 0: Baseline And Context Offload

**Agent 7 owns this phase.**

- [ ] Create `docs/agent-handoffs/scroll-atlas-overview.md` with:
  - product goal
  - seven-agent ownership matrix
  - current branch and current dirty-state summary
  - test commands
  - user non-negotiables from this request
- [ ] Create one handoff file per agent:
  - `docs/agent-handoffs/agent-01-globe-detail.md`
  - `docs/agent-handoffs/agent-02-countries.md`
  - `docs/agent-handoffs/agent-03-continents.md`
  - `docs/agent-handoffs/agent-04-trade-routes.md`
  - `docs/agent-handoffs/agent-05-scroll-animals.md`
  - `docs/agent-handoffs/agent-06-regression.md`
  - `docs/agent-handoffs/agent-07-context.md`
- [ ] Record the reference links and what each one is allowed to influence.
- [ ] Record that mapsicon is not the boundary accuracy source.
- [ ] Record the existing functionality inventory:
  - timeline year selection
  - layer toggles
  - globe pan/zoom/reset
  - species selection
  - zoo selection
  - search
  - witness/story/insight tabs
  - map 2D mode
  - source provenance section
- [ ] Start or reuse Vite and capture baseline screenshots before implementation:

```powershell
npm run dev -- --port 5199
node .\node_modules\@playwright\test\cli.js test tests\e2e\globe-overhaul.spec.ts --project=chromium
```

Expected result: existing tests pass or known current failures are logged in `docs/agent-handoffs/regression-ledger.md`.

---

## Phase 1: Country And Continent Data Foundation

### Agent 2: Countries

- [ ] Create `src/data/countries.ts` with source-backed `CountryRecord[]`.
- [ ] Use Natural Earth admin/map-unit data as the intended source. For the first browser-safe milestone, store simplified generated records with label points, bbox, ISO codes, continent IDs, rank, and sources.
- [ ] Include enough country records for global label coverage. The first complete pass target is 240 or more records. If the first PR uses a curated subset, it must contain at least the G20, all countries connected to existing species/zoos/routes, and every continent label region; the subset must be named `countryLabelSeedRecords` so it cannot be mistaken for complete country geometry.
- [ ] Add `src/data/countries.test.ts` with assertions:
  - country IDs are unique
  - ISO A2 and A3 codes are non-empty for sovereign/admin records that have official ISO codes
  - label lat/lon are finite and within valid WGS84 bounds
  - bbox values are ordered `[west, south, east, north]`
  - every country has a valid `continentId`
  - every source ref exists in `sourceCatalog`
- [ ] Add projection tests in `src/map/projections.test.ts`:
  - London, Singapore, Nairobi, Brasilia, Canberra, and the antimeridian project to finite CSS positions
  - longitude wrapping is stable
  - latitude clamping is stable

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\data\countries.test.ts src\map\projections.test.ts
npm run typecheck
```

### Agent 3: Continents And Wild Areas

- [ ] Create `src/data/continents.ts` with exactly seven `ContinentRecord` entries:
  - Africa
  - Antarctica
  - Asia
  - Europe
  - North America
  - South America
  - Oceania
- [ ] Create `src/data/wildAreas.ts` by converting existing `regions` plus any broader wilderness label areas into visible map-label records.
- [ ] Add tests in `src/data/continents.test.ts` and `src/data/wildAreas.test.ts`:
  - exactly seven continent IDs exist
  - no duplicate Africa or duplicate Asia labels exist
  - each continent has valid label coordinates and bbox
  - every country points to one valid continent
  - every wild area has source refs and valid coordinates
- [ ] Write `docs/earth-assets/continent-correction.md` explaining:
  - no procedural duplicate landmasses
  - globe uses spherical WGS84 placement, not Web Mercator sizing
  - western/eastern hemisphere framing is a camera choice, not a map projection source
  - any historical atlas treatment must be visual styling over accurate geography, not distorted land size

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\data\continents.test.ts src\data\wildAreas.test.ts src\data\countries.test.ts
npm run typecheck
```

---

## Phase 2: High-Detail Globe Rendering

**Agent 1 owns this phase.**

- [ ] Add `src/features/globe/CountryBoundaryLayer.tsx`.
  - It consumes simplified country boundary coordinates or generated line paths.
  - It renders country outlines on the sphere with `Line`.
  - It gates detail by zoom level so the globe does not become cluttered at default distance.
- [ ] Add `src/features/globe/GlobeLabelLayer.tsx`.
  - Continent labels show at far/default zoom.
  - Country labels show at medium/near zoom.
  - Wild area labels show when their layer is active or when the scroll chapter focuses them.
  - Labels are direct on-globe labels, not hover-only messages.
- [ ] Modify `src/features/globe/ProceduralGlobe.tsx`.
  - Remove remaining fake landmass/extra-continent impressions from procedural overlays.
  - Keep NASA-style raster texture as the base surface.
  - Add `CountryBoundaryLayer`, `GlobeLabelLayer`, and extension point for `TradeRouteLayer`.
  - Keep existing zoo and region marker click callbacks.
- [ ] Modify `src/features/globe/GlobeViewport.tsx`.
  - Make zoom thresholds stable and expose `data-zoom`.
  - Keep manual pan/zoom/reset.
  - Add scroll-controlled camera targets without breaking manual controls.
- [ ] Extend `src/features/globe/spherical.ts`.
  - Re-export or consume shared WGS84 helpers from `src/map/projections.ts`.
  - Add `greatCircleArc(start, end, segments, radius)`.
- [ ] Add tests:
  - `src/features/globe/spherical.test.ts`: great-circle and lat/lon vector safety.
  - `src/features/globe/globeLayers.test.tsx`: label layer renders continent/country/wild labels at the expected zoom gates.
  - update `tests/e2e/globe-overhaul.spec.ts`: zoom in, verify a country label and a wild-area label become visible.
- [ ] Acceptance criteria:
  - no extra Africa label
  - no extra Asia label
  - exactly seven continent labels exist in data
  - country and wild-area labels are visible on the globe at zoom, not only in hover popovers
  - default view is not cluttered
  - zoom-in makes real detail appear

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\features\globe src\map src\data
node .\node_modules\@playwright\test\cli.js test tests\e2e\globe-overhaul.spec.ts --project=chromium
npm run typecheck
```

---

## Phase 3: Trade Routes From 1900 To Today

**Agent 4 owns this phase.**

- [ ] Create `src/data/tradeRoutes.ts` with `TradeRouteRecord[]`.
- [ ] Include route categories:
  - 1900s steamship/ocean trade
  - oil and resource routes
  - post-1950 grain/food routes
  - post-1970 container routes
  - post-1990 air/high-speed routes
  - post-2000 digital/undersea cable inspired routes if used as a visual metaphor
- [ ] Each route must have:
  - start/end labels and coordinates
  - first year
  - peak year
  - intensity by year
  - source refs
- [ ] Add `src/features/globe/TradeRouteLayer.tsx`.
  - It consumes `currentYear` and `tradeRoutes`.
  - It renders only routes whose `firstYear <= currentYear`.
  - It interpolates opacity/width from `intensityByYear`.
  - It uses great-circle arcs, not flat straight lines.
  - It keeps labels sparse at default zoom and richer at near zoom.
- [ ] Integrate the route layer into `ProceduralGlobe.tsx`.
- [ ] Add `src/data/tradeRoutes.test.ts`:
  - every route has valid coordinates
  - every route has a first year between 1900 and 2024
  - intensity values are 0 through 1
  - every source ref exists
- [ ] Add e2e route checks in `tests/e2e/scroll-atlas.spec.ts`:
  - routes are absent or faint before 1900
  - routes appear by 1937
  - more/intense routes appear by 2024

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\data\tradeRoutes.test.ts src\features\globe
node .\node_modules\@playwright\test\cli.js test tests\e2e\scroll-atlas.spec.ts --project=chromium
npm run typecheck
```

---

## Phase 4: Scroll-Driven Time And Globe Spin UI

**Agent 5 owns this phase.**

- [ ] Create `src/data/scrollChapters.ts`.
  - Chapters map scroll positions to years already present in `timelineAnchors`.
  - Each chapter defines a camera target, active species, active routes, active layer IDs, and concise text.
  - Required chapters:
    - 1770 baseline
    - 1900 trade acceleration
    - 1937 Attenborough childhood
    - 1954 televised planet
    - 1978 globalisation/loss
    - 1997 connected Earth
    - 2020 witness statement
    - 2024 current briefing
- [ ] Create `src/components/scroll/TimeScrollController.tsx`.
  - Uses `IntersectionObserver` and measured scroll progress.
  - Calls `onYearChange` with interpolated/nearest timeline year.
  - Calls `onGlobeTargetChange` or store action with lat/lon/zoom targets.
  - Uses `requestAnimationFrame` for smooth updates.
  - Respects `prefers-reduced-motion` by snapping per chapter.
- [ ] Extend `src/state/usePlanetStore.ts`.
  - Add `scrollMode: "narrative" | "manual"`.
  - Add `activeScrollChapterId?: string`.
  - Add `setScrollChapter`, `setGlobeViewTarget`, and `setScrollMode`.
  - Manual timeline/layer/search interactions switch to `manual` until the next chapter activation.
- [ ] Create `src/components/scroll/StickyAtlasStage.tsx`.
  - The globe stage is sticky or pinned while story panels scroll.
  - No nested dashboard cards inside cards.
  - Controls remain available as slim rails and overlays.
- [ ] Create `src/components/scroll/ScrollAtlas.tsx`.
  - Replaces the box-in-box main layout in `App.tsx`.
  - Uses the existing `earthSurface`, `timelineAnchors`, `species`, `mediaAssets`, `insightCards`, `geoLayers`, and source data.
  - Keeps search/layers/timeline accessible through compact controls.
- [ ] Modify `src/components/AtlasConsole.tsx`.
  - Either reduce it to reusable legacy sections or keep it behind a compatibility route/section until migration is complete.
  - Do not duplicate core content in two divergent UI trees.
- [ ] Modify `src/styles.css`.
  - Add scroll-atlas layout classes.
  - Remove visual reliance on nested panels for the main story.
  - Keep desktop, tablet, and mobile scroll usable.
  - Use stable dimensions so labels/buttons do not jump.
- [ ] Add tests:
  - `src/components/scroll/TimeScrollController.test.tsx`: scroll chapter changes call year/camera callbacks.
  - `tests/e2e/scroll-atlas.spec.ts`: scrolling moves 1770 -> 1900 -> 1937 -> 2024 and rotates globe longitude.
  - mobile viewport e2e: no horizontal overflow and first three chapters are reachable.

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\components\scroll src\state\usePlanetStore.test.ts
node .\node_modules\@playwright\test\cli.js test tests\e2e\scroll-atlas.spec.ts --project=chromium
npm run typecheck
```

---

## Phase 5: Animal And Photo Scroll Story

**Agent 5 owns implementation; Agent 6 verifies preservation.**

- [ ] Create `src/components/scroll/AnimalStoryScroller.tsx`.
  - Uses existing `speciesProfiles` and `mediaAssets`.
  - Shows species image, common name, scientific name, status, habitat, conservation note, and linked year/region.
  - Synchronizes selected species with the globe marker layer.
  - Never hides photos in a tiny nested card inside another panel.
- [ ] Create `src/components/scroll/AnimalStoryScroller.test.tsx`.
  - renders at least one species with a real local image
  - selecting a species calls `onSelectSpecies`
  - extinct/threatened/endangered status text is visible
  - image alt text comes from `mediaAssets`
- [ ] Update `scripts/verify-media.mjs` or add a focused test so every displayed species image exists.
- [ ] Add e2e:
  - scroll to animal section
  - click African bush elephant
  - globe selected state changes
  - photo remains visible on mobile

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\components\scroll\AnimalStoryScroller.test.tsx
node scripts\verify-media.mjs
node .\node_modules\@playwright\test\cli.js test tests\e2e\scroll-atlas.spec.ts --project=chromium
```

---

## Phase 6: Preserve Existing Content And Functionality

**Agent 6 owns this phase and reviews every merge.**

- [ ] Create `tests/e2e/functionality-parity.spec.ts`.
- [ ] Parity coverage:
  - timeline buttons still set the year
  - scroll sets the year
  - layer toggles still change aria state
  - search still reveals search results
  - species selection still updates selected species
  - zoo selection still updates selected zoo
  - map 2D mode still renders
  - source/provenance section remains reachable
  - reduced motion mode can still navigate all chapters
- [ ] Update existing tests only when the UI structure intentionally changes; do not delete assertions that represent user-visible functionality.
- [ ] Add visual smoke assertions:
  - `globe-canvas` exists and has nonblank pixels
  - no horizontal overflow at `390x844`
  - no major overlap at `1440x900`
  - country label appears after zoom
  - animal image appears in the scroll section
- [ ] Create `docs/qa/scroll-atlas-regression.md` with:
  - commands run
  - pass/fail
  - screenshot paths
  - known residual risks

Run full verification:

```powershell
npm run test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:visual-smoke
npm run content:verify-media
npm run content:verify-search
```

---

## Phase 7: Integration Order

1. Merge Agent 7 baseline handoffs.
2. Merge Agent 2 country records and projection tests.
3. Merge Agent 3 continent/wild-area correction.
4. Merge Agent 1 globe label/detail layers.
5. Merge Agent 4 trade route data and route layer.
6. Merge Agent 5 scroll UI and animal scroller.
7. Merge Agent 6 parity tests and fixes.
8. Run full verification and Browser/IAB visual QA.

After each merge:

```powershell
npm run typecheck
npm run test
```

After the final merge:

```powershell
npm run lint
npm run build
npm run test:e2e
npm run test:visual-smoke
```

---

## Browser QA Checklist

Use the in-app Browser first.

- [ ] Desktop `1440x900`: default scroll atlas opens with globe dominant and no crowded nested panels.
- [ ] Scroll down: current year changes and globe rotates.
- [ ] Scroll to 1900: early trade routes appear.
- [ ] Scroll to 1937: Attenborough-era copy and species content appears.
- [ ] Scroll to 2024: modern trade routes, human pressure, and current briefing appear.
- [ ] Zoom in: country labels and wild-area labels appear directly on the globe.
- [ ] Verify seven continent labels and no duplicate Africa/Asia.
- [ ] Click an animal card/photo: globe selection updates.
- [ ] Click a zoo marker: witness/content selection updates.
- [ ] Toggle layers: labels/routes respond without breaking scroll.
- [ ] Mobile `390x844`: no horizontal overflow, scroll chapters and photos remain readable.
- [ ] Reduced motion: chapters snap cleanly and all content remains reachable.

---

## Final Acceptance

- [ ] The first viewport is a scroll atlas, not a dashboard of boxes inside boxes.
- [ ] Time passes as the user scrolls.
- [ ] The world visibly spins or reorients as scroll chapters change.
- [ ] Countries and wild areas are labeled on the globe itself at zoom.
- [ ] Country placement is source-backed and tested.
- [ ] The world is a seven-continent model with no extra Africa or extra Asia artifacts.
- [ ] Trade routes appear over time from the 1900s to today.
- [ ] Animal stories and photos are part of the scroll experience.
- [ ] Existing content and functionality are preserved.
- [ ] Agent handoff docs exist so future context windows can resume without rediscovering the whole project.
- [ ] Unit tests pass.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] Playwright e2e passes.
- [ ] Visual smoke passes.

