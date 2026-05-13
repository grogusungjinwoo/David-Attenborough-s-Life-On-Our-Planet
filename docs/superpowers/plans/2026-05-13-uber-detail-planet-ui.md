# Uber Detail Planet UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current prototype globe/dashboard into the second PNG concept: an ultra-detailed David Attenborough "A Life On Our Planet" interface with a photoreal Earth, useful zoom, accurate geography, dense panels, 2D/3D Earth modes, and no placeholder cones/circles/squares.

**Architecture:** Three agents work in parallel with strict file ownership. Agent 3 builds the Earth data/assets contract, Agent 1 consumes that contract to replace the placeholder 3D globe, and Agent 2 brings the shell/layout to concept-level fidelity. Integration runs in the order Data/Assets -> Globe -> UI shell, with full verification after each merge.

**Tech Stack:** React 19, Vite, TypeScript, Zustand, Three.js, React Three Fiber, Drei, Vitest, Playwright, Browser/IAB, static open-data Earth assets.

---

## Target Concept

Use the second attached PNG as the visual north star. The rendered app should read as:

- A cinematic satellite Earth from space, large enough to dominate the center stage.
- Realistic continents, oceans, clouds, night lights, atmosphere, rim lighting, stars, and geographically anchored route arcs.
- Left rail with David Attenborough brand, icon navigation, active gold state, and footer controls.
- Floating left metric cards with sparklines and compact data hierarchy.
- Floating overlay legend with layer toggles.
- Bottom timeline with year rail, metric table, and round play button.
- Right witness panel with tabs, portrait/quote area, species rows, recent extinct section, and selected-detail state.
- Bottom intelligence panels that look map/data-driven, not abstract bubble placeholders.

The current first screenshot is the failure state: the globe cannot meaningfully zoom and visible cones/circles/squares make the Earth feel like a toy prototype.

## Global Rules For All Agents

- Do not introduce paid API requirements. The default path must work from bundled/static open-source or public-domain assets.
- Do not ship a screenshot as UI. App text, controls, panels, markers, timeline, and interaction must remain code-native.
- Do not use visible cone/cube/cylinder/torus primitive geometry as Earth detail.
- Existing untracked candidates in `src/assets/earth/` (`earth-day-clouds.jpg`, `earth-day-noclouds.jpg`, `earth-night-lights.jpg`) may be evaluated by Agent 3, but do not import them into the JS bundle by default. Confirm provenance, optimize/compress, then place approved browser assets under `public/earth/`.
- Do not edit another agent's owned files unless the integration lead explicitly asks.
- Do not move unrelated code or refactor broadly.
- Keep first-load performance in mind. Large raw rasters and GeoJSON do not belong in the JavaScript bundle.
- Use TDD: write failing tests first, run them, implement, run focused tests, then run full verification.
- Preserve existing state behavior unless this plan explicitly changes it.
- Every active data/source layer must have visible attribution before the work is considered done.

## Local Commands

Run from:

```powershell
cd "C:\Users\patri\OneDrive\Documents\New project 15"
```

If `npm` is unavailable in PowerShell, use the bundled Node runtime:

```powershell
$env:PATH = "C:\Users\patri\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;" + $env:PATH
```

Verification commands:

```powershell
node .\node_modules\vitest\vitest.mjs run
node .\node_modules\typescript\bin\tsc -b
node .\node_modules\eslint\bin\eslint.js .
node .\node_modules\vite\bin\vite.js build
node .\node_modules\@playwright\test\cli.js test
```

Browser QA target:

```text
http://127.0.0.1:5198/
```

If that server is unavailable, start Vite on a free port and use the displayed local URL.

---

## Ownership Matrix

| Agent | Owns | Avoids |
| --- | --- | --- |
| Agent 1: Globe Engine + Zoom | `src/features/globe/*`, `src/state/usePlanetStore.ts`, globe tests, `public/earth/*` texture consumption | `src/components/AtlasConsole.tsx`, `src/styles.css` except globe-specific selectors |
| Agent 2: Uber Detail UI Fidelity | `src/components/AtlasConsole.tsx`, UI component splits under `src/components/atlas/*`, `src/styles.css`, e2e layout tests | Globe rendering internals, source manifest structure |
| Agent 3: Earth Assets + Data Layers | `src/map/*`, `src/data/sources.ts`, new country/layer/projection data, `src/features/map/MapViewport.tsx`, asset pipeline docs/tests | UI shell layout, Three.js camera behavior |

Integration lead owns `src/App.tsx` if two agents need the same prop or shared contract.

---

## Shared Interface Contracts

These contracts let agents work independently.

### Earth Assets

Agent 3 defines the asset manifest. Agent 1 consumes it.

Create:

```text
src/map/earthAssets.ts
```

Minimum exported shape:

```ts
export type EarthTextureId = "day" | "night" | "clouds" | "bump";

export type EarthTextureAsset = {
  id: EarthTextureId;
  label: string;
  url: string;
  sourceIds: string[];
  attributionIds: string[];
  requiresApiKey: false;
};

export const earthTextureAssets: EarthTextureAsset[] = [
  {
    id: "day",
    label: "NASA Blue Marble day texture",
    url: "/earth/blue-marble-day-4096.webp",
    sourceIds: ["nasa-blue-marble"],
    attributionIds: ["nasa-blue-marble"],
    requiresApiKey: false
  },
  {
    id: "clouds",
    label: "Global cloud alpha texture",
    url: "/earth/clouds-alpha-2048.webp",
    sourceIds: ["nasa-blue-marble"],
    attributionIds: ["nasa-blue-marble"],
    requiresApiKey: false
  }
];
```

Agent 1 can add a procedural fallback for missing files, but the primary contract must point at local static URLs.

### Projection Helpers

Agent 3 creates a shared projection module. Agent 1 either moves existing `spherical.ts` helpers into it or re-exports from it.

Create:

```text
src/map/projections.ts
```

Minimum exported helpers:

```ts
export type LonLat = [number, number];

export function normalizeLon(lon: number): number;
export function clampLat(lat: number): number;
export function projectEquirectangular(lat: number, lon: number): { left: string; top: string };
export function latLonToVector3(lat: number, lon: number, radius?: number): import("three").Vector3;
export function greatCircleArc(start: LonLat, end: LonLat, segments?: number, radius?: number): import("three").Vector3[];
```

### Attribution

Agent 3 defines attribution helpers. Agents 1 and 2 surface them.

Create:

```text
src/map/earthAttribution.ts
```

Minimum exported helpers:

```ts
export type AttributionItem = {
  id: string;
  label: string;
  href: string;
  license?: string;
};

export function getAttributionsForLayerIds(layerIds: string[]): AttributionItem[];
```

---

## Agent 1 Instructions: Globe Engine + Zoom Fidelity

### Mission

Replace the current placeholder 3D globe with a believable Earth-from-space render matching the second PNG. Fix zoom so one click visibly changes scale and close zoom reaches near-surface detail without clipping.

### File Ownership

Own:

- `src/features/globe/GlobeViewport.tsx`
- `src/features/globe/ProceduralGlobe.tsx`
- `src/features/globe/SurfaceInstances.tsx`
- `src/features/globe/spherical.ts`
- `src/state/usePlanetStore.ts`
- `src/features/globe/*.test.ts`
- `src/features/globe/*.test.tsx`

Coordinate with Agent 3 for:

- `src/map/earthAssets.ts`
- `src/map/projections.ts`
- `public/earth/*`

Do not edit:

- `src/components/AtlasConsole.tsx`
- `src/styles.css` beyond selectors directly needed by globe canvas/marker labels.

### Task 1: Write Globe Math And Zoom Tests

- [ ] Add tests for projection and great-circle behavior.

Create or modify:

```text
src/features/globe/spherical.test.ts
src/state/usePlanetStore.test.ts
```

Required test coverage:

- `latLonToVector3()` returns finite coordinates at requested radius.
- London, Singapore, and antimeridian points are finite.
- `greatCircleArc()` returns the requested number of points and preserves endpoints approximately.
- Repeated `zoomIn()` in globe mode reaches the close clamp.
- Repeated `zoomOut()` reaches the far clamp.
- `resetView()` restores the default globe zoom.
- Existing map zoom behavior still passes.

Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\features\globe\spherical.test.ts src\state\usePlanetStore.test.ts
```

Expected before implementation: fail on missing helpers or old zoom clamp.

### Task 2: Replace Placeholder Surface Geometry

- [ ] In `src/features/globe/ProceduralGlobe.tsx`, remove the visible primitive overlay system:
  - land cylinders
  - tree cones
  - mountain cones
  - settlement boxes
  - energy torus rings
- [ ] Keep point/marker rendering only for meaningful selectable story markers.
- [ ] Rename or replace `ProceduralGlobe` with an internally real-Earth composition while preserving its public props to minimize `App.tsx` churn.

Add components inside `ProceduralGlobe.tsx` or focused sibling files:

- `EarthSphere`
- `CloudShell`
- `AtmosphereShell`
- `GlobeMarkers`
- `GlobeRoutes`

Acceptance for this task:

- No default rendered Earth detail uses `coneGeometry`, `boxGeometry`, `cylinderGeometry`, or `torusGeometry`.
- The globe still renders region and zoo markers.
- Existing marker selection callbacks still work.

### Task 3: Consume Real Texture Assets With Fallback

- [ ] Import `earthTextureAssets` from `src/map/earthAssets.ts`.
- [ ] Load day/cloud/night/bump textures through Drei/Three loaders.
- [ ] Set color textures to `SRGBColorSpace`.
- [ ] Use renderer anisotropy for day texture sharpness where available.
- [ ] Add a muted fallback canvas texture only for missing asset loads.

Primary static URLs:

```text
/earth/blue-marble-day-4096.webp
/earth/blue-marble-night-4096.webp
/earth/clouds-alpha-2048.webp
/earth/earth-bump-2048.webp
```

If the exact files are not available yet, Agent 1 may create generated placeholder texture files only if they look like satellite-style raster maps, not primitives. Agent 3 remains responsible for replacing them with source-backed assets.

### Task 4: Implement Cinematic Earth Lighting

- [ ] Update `GlobeViewport.tsx` camera defaults:

```ts
camera={{ position: [0.25, 0.14, 2.75], fov: 36, near: 0.025, far: 100 }}
```

- [ ] Update `OrbitControls`:

```ts
enableZoom
zoomSpeed={0.55}
minDistance={1.22}
maxDistance={5.2}
enablePan={false}
enableDamping
dampingFactor={0.075}
```

- [ ] Auto-rotate only when the globe is not close-zoomed and no marker is selected.
- [ ] Use warm key light, cool rim light, low ambient, and dense subtle star field.
- [ ] Add atmosphere shell with additive rim/Fresnel effect.
- [ ] Add slow-rotating cloud shell at radius `1.012` to `1.018`.

Acceptance:

- The globe visually fills about 70-85% of the center stage height on desktop.
- Clouds, rim light, and stars render with 0 console errors.

### Task 5: Implement Real Zoom And Focus

- [ ] Update `usePlanetStore.ts` so globe zoom maps to a useful close range.
- [ ] Map `zoomScalar` to camera distance around `3.15 -> 1.35`, not `4.95 -> 2.7`.
- [ ] Make one zoom button click visibly change the globe scale.
- [ ] Ensure mouse wheel zoom works through `OrbitControls`.
- [ ] Reset returns the globe to the default framing.
- [ ] When a marker is selected, animate camera orientation toward that latitude/longitude and close to about `1.65-1.95` distance.

Acceptance:

- Zoom-in button changes framing within one click.
- Wheel zoom does not get overridden every frame by `CameraRig`.
- Selecting a zoo/region focuses the marker on the front hemisphere.

### Task 6: Browser QA

- [ ] Load the app in Browser/IAB.
- [ ] Verify the default Earth from Space view.
- [ ] Click zoom in/out/reset.
- [ ] Use mouse wheel zoom.
- [ ] Select a region and a zoo marker.
- [ ] Capture desktop and mobile screenshots.

Agent 1 is done when a screenshot can no longer be described as "cones, circles, and squares."

---

## Agent 2 Instructions: Uber Detail Dashboard/UI Fidelity

### Mission

Make the shell match the second PNG concept: dense, cinematic, data-rich, and readable. This agent frames the globe, builds the panels, fixes responsive layout, and verifies visual fidelity.

### File Ownership

Own:

- `src/components/AtlasConsole.tsx`
- new components under `src/components/atlas/*`
- `src/styles.css`
- `tests/e2e/app.spec.ts`
- `tests/e2e/smoke.spec.ts`
- optional component tests under `src/components/*.test.tsx`

Coordinate with integration lead for:

- `src/App.tsx`

Do not edit:

- `src/features/globe/ProceduralGlobe.tsx`
- `src/features/globe/GlobeViewport.tsx`
- `src/map/earthManifest.ts`

### Task 1: Write Layout/Fidelity Tests

- [ ] Add Playwright tests at `1440x900` for core shell visibility:
  - nav rail
  - toolbar
  - metric deck
  - overlay legend
  - timeline
  - witness panel
  - bottom grid
- [ ] Add an overlap guard using bounding boxes:
  - toolbar must not cover metric deck
  - witness panel must not cover the center stage
  - timeline must not cover right panel
  - metric deck and legend may both overlay the stage but not obscure the same primary globe center area.
- [ ] Add view selector stability test for all Earth modes.
- [ ] Add mobile `390x844` smoke test for no horizontal overflow and reachable primary controls.

Run:

```powershell
node .\node_modules\@playwright\test\cli.js test tests\e2e\app.spec.ts
```

Expected before implementation: fail on layout/overlap/fidelity checks.

### Task 2: Split AtlasConsole Into Focused Components

- [ ] Keep `AtlasConsole.tsx` as composition or create `src/components/atlas/AtlasConsole.tsx`.
- [ ] Extract:
  - `AtlasShell`
  - `NavigationRail`
  - `StageToolbar`
  - `MetricDeck`
  - `MetricCard`
  - `MapOverlayLegend`
  - `TimelineConsole`
  - `WitnessPanel`
  - `EarthRouteOverlay`
  - `BottomIntelligenceGrid`
- [ ] Keep props explicit; do not reach into Zustand from leaf components.
- [ ] Preserve existing data flow from `App.tsx`.

Acceptance:

- `App.tsx` stays composition/state wiring only.
- Repeated UI blocks share components instead of copied markup.

### Task 3: Lock Desktop Grid To Concept Proportions

- [ ] Implement desktop grid:

```css
.atlas-console {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 214px minmax(760px, 1fr) 382px;
  grid-template-rows: minmax(640px, 67vh) minmax(300px, 33vh);
}
```

- [ ] Left nav spans both rows.
- [ ] Earth stage occupies top center.
- [ ] Witness panel occupies top right.
- [ ] Bottom panels span center/right or the full area to match the concept.
- [ ] Ensure the first viewport is readable without vertical scroll at `1440x900` and `1920x1080`.

Acceptance:

- Globe dominates center stage.
- Bottom panels are visible in the first viewport on desktop.
- No incoherent overlaps down to `1220px`.

### Task 4: Apply Concept Tokens

- [ ] Use near-black teal backgrounds.
- [ ] Use translucent deep teal panels.
- [ ] Use muted gold borders and gold active states.
- [ ] Use ivory/muted text.
- [ ] Use serif uppercase for brand/section headings.
- [ ] Use deliberate UI label sizes with no browser defaults.
- [ ] No negative letter spacing.

Primary palette:

```css
:root {
  --atlas-bg: #02070a;
  --atlas-bg-soft: #031116;
  --atlas-panel: rgba(4, 17, 19, 0.9);
  --atlas-border: rgba(221, 182, 112, 0.28);
  --atlas-gold: #d6a84e;
  --atlas-gold-bright: #f0c46a;
  --atlas-text: #f5eedc;
  --atlas-muted: #b8ae96;
  --atlas-green: #9bc45b;
  --atlas-mint: #64c799;
  --atlas-warning: #df9525;
  --atlas-danger: #b24b33;
}
```

### Task 5: Match Panel Details

- [ ] Nav rail:
  - stacked serif brand
  - icon + label rows
  - active gold state and pointer notch
  - footer share/download/audio/settings controls
- [ ] Metric cards:
  - four equal-height cards
  - icon/title/chevron header
  - large serif value
  - delta line
  - sparkline
- [ ] Overlay legend:
  - compact floating panel
  - no more than six rows
  - icon/label/status toggle
- [ ] Timeline:
  - gold range rail
  - aligned year ticks
  - metric table with active year column
  - round play button on right
- [ ] Witness panel:
  - tabs
  - portrait/quote block
  - species rows with thumbnail/name/latin/status/loss
  - recent extinct row
  - selected detail state
- [ ] Bottom panels:
  - biome pressure map
  - population expansion map
  - species loss matrix
  - no abstract bubble-only placeholder look.

### Task 6: Responsive Cleanup

- [ ] Desktop `>=1220px`: full three-column dashboard.
- [ ] Tablet `761px-1219px`: collapse left nav labels, narrow witness panel, preserve stage/timeline.
- [ ] Mobile `<=760px`: stacked normal document flow:
  - stage
  - metrics
  - legend
  - timeline
  - witness
  - bottom panels
- [ ] Avoid giant absolute-position mobile stacks.
- [ ] No horizontal overflow except intentional tables/nav scrollers.

### Task 7: Browser Fidelity Ledger

Capture screenshots in Browser/IAB:

- desktop `1440x900`
- wide desktop `1920x1080`
- tablet `1024x768`
- mobile `390x844`

Compare against the second PNG on:

- shell proportions
- globe dominance
- left nav fidelity
- metric card density
- timeline/table fidelity
- right witness panel fidelity
- bottom panel fidelity
- typography/color match
- overlap/clipping

Agent 2 is done only when the first viewport unmistakably reads like the second PNG concept.

---

## Agent 3 Instructions: Earth Assets, Data Layers, And Map Detail

### Mission

Replace placeholder geography with a source-backed Earth asset/data foundation that supports accurate 2D maps, a photoreal 3D globe, countries, labels, terrain, bathymetry, satellite/topographic/political modes, attributions, and shared projections.

### File Ownership

Own:

- `src/map/earthManifest.ts`
- `src/map/mapProviders.ts`
- `src/data/sources.ts`
- `src/domain/types.ts`
- `src/features/map/MapViewport.tsx`
- new `src/map/earthAssets.ts`
- new `src/map/earthLayers.ts`
- new `src/map/earthAttribution.ts`
- new `src/map/projections.ts`
- new `src/data/countries.ts`
- tests under `src/map/*.test.ts` and `src/data/*.test.ts`
- asset pipeline notes under `docs/earth-assets/*`

Coordinate with Agent 1 for:

- `public/earth/*`

Do not edit:

- `src/components/AtlasConsole.tsx`
- `src/styles.css` except selectors required by MapViewport if unavoidable.

### Task 1: Expand Source Metadata

- [ ] Update `src/data/sources.ts` so every Earth source has:
  - `id`
  - `label`
  - `url`
  - `license`
  - `licenseUrl`
  - `attributionText`
  - `accessed`
  - optional `citation`
  - optional `commercialUseNote`

Required sources:

- Natural Earth
- NASA Blue Marble
- NOAA ETOPO
- GEBCO
- ESA WorldCover
- UN SALB
- geoBoundaries
- GBIF
- PMTiles/Protomaps documentation source if PMTiles is used
- MapLibre documentation source if MapLibre is used

Write tests:

```text
src/data/sources.test.ts
```

Assertions:

- every source has license and attribution text
- every source has accessed date
- no enabled default source has unknown license

### Task 2: Define Executable Earth Layer Manifest

- [ ] Expand `src/map/earthManifest.ts` from descriptive basemaps into executable layer metadata.
- [ ] Add `src/map/earthLayers.ts`.

Layer kind union:

```ts
export type EarthLayerKind =
  | "rasterTile"
  | "vectorTile"
  | "terrainRaster"
  | "geojson"
  | "pointSet"
  | "routeSet";
```

Each layer must include:

```ts
export type EarthLayerDescriptor = {
  id: string;
  label: string;
  kind: EarthLayerKind;
  sourceIds: string[];
  assetPath?: string;
  minZoom: number;
  maxZoom: number;
  projection: "wgs84" | "webMercator" | "globe";
  attributionIds: string[];
  legend: {
    color?: string;
    ramp?: string[];
    label: string;
  };
  enabledByDefault: boolean;
};
```

Required layer groups:

- satellite raster
- topographic relief
- bathymetry
- countries
- coastlines
- admin boundaries
- country labels
- populated places
- rivers
- lakes
- land cover
- species ranges
- zoo sites
- migration/story routes

Tests:

```text
src/map/earthManifest.test.ts
src/map/earthLayers.test.ts
```

Assertions:

- every layer source ID exists
- every attribution ID exists
- zoom ranges are valid
- enabled static assets have a declared local path
- no default layer requires an API key.

### Task 3: Create Shared Projection Helpers

- [ ] Create `src/map/projections.ts`.
- [ ] Move or re-export globe math from `src/features/globe/spherical.ts`.
- [ ] Remove duplicated equirectangular projection logic from `MapViewport.tsx`.

Tests:

```text
src/map/projections.test.ts
```

Assertions:

- London projects to finite CSS coordinates and vector coordinates.
- Singapore projects to finite CSS coordinates and vector coordinates.
- antimeridian longitudes normalize predictably.
- pole latitudes clamp safely.
- great-circle arcs have finite points.

### Task 4: Country And Label Data

- [ ] Create `src/data/countries.ts`.
- [ ] Use Natural Earth 1:10m admin/map-unit data as the intended source.
- [ ] For this iteration, a curated static generated file is acceptable if full tile generation is too large.
- [ ] Records must include:

```ts
export type CountryRecord = {
  id: string;
  isoA3: string;
  name: string;
  labelLat: number;
  labelLon: number;
  bbox: [number, number, number, number];
  continent: string;
  sourceIds: string[];
};
```

Acceptance:

- At least 240 admin/map-unit records when full source-backed generation is complete.
- If the first implementation uses a smaller curated sample, it must be explicitly marked as temporary and hidden behind a test expectation for the current milestone.

Tests:

```text
src/data/countries.test.ts
```

Assertions:

- unique IDs
- valid ISO/name fields
- valid centroid/label coordinates
- valid bbox order
- source IDs exist.

### Task 5: Replace Hard-Coded MapViewport Geography

- [ ] Remove `countryLabels` hard-coded inside `MapViewport.tsx`.
- [ ] Use `countries.ts` and shared `projectEquirectangular()`.
- [ ] Replace simplified SVG land blobs with either:
  - real static raster basemap assets, or
  - source-backed GeoJSON/vector layer shapes.
- [ ] Keep current 2D mode functional while preparing for MapLibre/PMTiles lazy-loading.
- [ ] Add active attribution rendering for visible basemap/layers.

Tests:

```text
src/features/map/MapViewport.test.tsx
```

Assertions:

- active basemap renders attribution
- country labels come from data
- selecting Amazon Basin still calls region/species callbacks
- selecting London Zoo still calls zoo callback
- topographic/satellite/political modes render distinct surface states.

### Task 6: Static Asset Pipeline Notes

- [ ] Create:

```text
docs/earth-assets/README.md
docs/earth-assets/open-data-sources.md
```

- [ ] Document:
  - raw download path: `assets/earth/raw/`
  - generated browser asset path: `public/earth/`
  - no raw data in JS bundle
  - preferred PMTiles path: `public/earth/pmtiles/`
  - attribution requirements
  - first-load budget target: 8-12 MB
  - future higher-detail tile path for zoom levels.

Agent 3 is done when real source-backed layer manifests and shared projections exist, and the UI no longer depends on hard-coded fake geography for default Earth modes.

---

## Integration Order

### Phase 1: Data Contract Merge

- [ ] Merge Agent 3 projection helpers, source metadata, assets manifest, and layer manifest first.
- [ ] Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\map src\data
node .\node_modules\typescript\bin\tsc -b
```

- [ ] Fix any TypeScript import contract issues before starting globe integration.

### Phase 2: Globe Merge

- [ ] Merge Agent 1 globe rendering and zoom changes.
- [ ] Resolve projection imports so globe and map use the same helpers.
- [ ] Run:

```powershell
node .\node_modules\vitest\vitest.mjs run src\features\globe src\state\usePlanetStore.test.ts
node .\node_modules\typescript\bin\tsc -b
```

- [ ] Browser check: default Earth view shows no placeholder primitives.

### Phase 3: UI Shell Merge

- [ ] Merge Agent 2 component split and CSS changes.
- [ ] Resolve `App.tsx` prop wiring.
- [ ] Run:

```powershell
node .\node_modules\vitest\vitest.mjs run
node .\node_modules\typescript\bin\tsc -b
node .\node_modules\eslint\bin\eslint.js .
node .\node_modules\vite\bin\vite.js build
node .\node_modules\@playwright\test\cli.js test
```

- [ ] Browser/IAB screenshot QA at desktop, wide, tablet, and mobile.

---

## Copy-Paste Agent Prompts

### Prompt For Agent 1

```text
You are Agent 1: Globe Engine + Zoom Fidelity for C:\Users\patri\OneDrive\Documents\New project 15.

Read docs/superpowers/plans/2026-05-13-uber-detail-planet-ui.md, then execute only the Agent 1 section. You own src/features/globe/*, src/state/usePlanetStore.ts, and globe tests. Do not edit AtlasConsole, app shell CSS, or map/data manifests except to consume the shared contracts from Agent 3.

Goal: replace the placeholder 3D globe with a photoreal Earth-from-space render, remove cones/cubes/cylinders/torus surface detail, implement useful zoom and marker focus, add atmosphere/clouds/rim/stars, and keep selection callbacks working.

Write failing tests first, then implement. Return changed file paths, verification commands/results, and any remaining visual deviations from the second PNG concept.
```

### Prompt For Agent 2

```text
You are Agent 2: Uber Detail Dashboard/UI Fidelity for C:\Users\patri\OneDrive\Documents\New project 15.

Read docs/superpowers/plans/2026-05-13-uber-detail-planet-ui.md, then execute only the Agent 2 section. You own AtlasConsole, atlas UI components, styles.css, and e2e layout/fidelity tests. Do not edit globe rendering internals or Earth data manifests.

Goal: make the app shell match the second PNG concept: dense David Attenborough dashboard, left rail, metric cards, overlay legend, timeline table, right witness panel, and bottom intelligence panels. Desktop first. No incoherent overlap. Mobile must be usable.

Write failing Playwright/component tests first, then implement. Use Browser/IAB screenshots for QA. Return changed file paths, verification commands/results, screenshot paths, and a fidelity ledger against the second PNG.
```

### Prompt For Agent 3

```text
You are Agent 3: Earth Assets, Data Layers, and Map Detail for C:\Users\patri\OneDrive\Documents\New project 15.

Read docs/superpowers/plans/2026-05-13-uber-detail-planet-ui.md, then execute only the Agent 3 section. You own src/map/*, source metadata, Earth layer/asset/projection helpers, MapViewport geography, country data, and map/data tests. Do not edit AtlasConsole layout or Three.js camera behavior.

Goal: replace placeholder geography with source-backed Earth data and asset contracts: NASA Blue Marble satellite textures, Natural Earth countries/coastlines/labels, NOAA/GEBCO topography/bathymetry, ESA WorldCover land cover, shared WGS84 projection helpers, and dynamic attribution.

Write failing manifest/source/projection/map tests first, then implement. Return changed file paths, source/license notes, verification commands/results, and any data that remains temporary for the next tile-generation milestone.
```

---

## Final Acceptance Checklist

- [ ] Default Earth from Space view resembles the second PNG concept.
- [ ] No visible cone/cube/cylinder/torus placeholder geography remains.
- [ ] Globe zoom works by button and wheel.
- [ ] Marker selection updates witness/species state and focuses globe geography.
- [ ] 2D map modes use source-backed labels/layers, not hard-coded fake blobs.
- [ ] Satellite, topographic, and political modes have distinct data-backed manifests.
- [ ] Active attributions render for NASA/Natural Earth/NOAA/GEBCO/ESA/etc. as applicable.
- [ ] Desktop `1440x900` and `1920x1080` fit the concept without incoherent overlap.
- [ ] Mobile `390x844` has no horizontal overflow and primary controls are reachable.
- [ ] Unit tests pass.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Vite build passes.
- [ ] Playwright e2e passes.
- [ ] Browser/IAB screenshots pass a visual fidelity ledger against the second PNG.

## Source Links For Earth Data Planning

- Natural Earth terms: https://www.naturalearthdata.com/about/terms-of-use
- NASA Blue Marble Next Generation: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map
- NOAA ETOPO Global Relief Model: https://www.ncei.noaa.gov/products/etopo-global-relief-model
- GEBCO gridded bathymetry: https://www.gebco.net/data-products/gridded-bathymetry-data
- ESA WorldCover data access: https://esa-worldcover.org/en/data-access
- MapLibre GL JS docs: https://maplibre.org/maplibre-gl-js/docs
- PMTiles MapLibre docs: https://docs.protomaps.com/pmtiles/maplibre
- GBIF API downloads: https://techdocs.gbif.org/en/data-use/api-downloads
