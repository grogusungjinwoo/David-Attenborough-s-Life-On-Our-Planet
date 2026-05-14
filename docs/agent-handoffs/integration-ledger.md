# Scroll Atlas Integration Ledger

## Lead-Owned Shared Files

- `src/domain/types.ts`: shared atlas data contracts.
- `src/state/usePlanetStore.ts`: timeline, scroll chapter, globe target, view mode, and basemap state.
- `src/App.tsx`: final shell composition and source/provenance rail.
- `src/data/index.ts`: public data exports.
- `src/styles.css`: final responsive atlas reconciliation.

## Integration Order

1. Freeze shared contracts and tests.
2. Integrate country, continent, wild-area, and route data.
3. Wire globe boundaries, labels, and routes.
4. Replace first-screen dashboard with scroll atlas shell.
5. Run parity/regression, browser QA, and final build checks.

## Merge Gates

- Spec review: compare agent result to the scroll-atlas plan.
- Code-quality review: shared contracts, naming, file ownership, and no unrelated reversions.
- Focused tests: subsystem vitest files first.
- Integration tests: `npm run test`, `npm run lint`, `npm run build`, then browser/e2e checks where available.

## Known Integration Risks

- Country boundary rendering currently uses curated WGS84 bounding rings rather than full Natural Earth polygons.
- The route layer has source-backed route metadata and great-circle arcs, but not a full historical trade dataset.
- Existing dashboard parity must remain reachable through scroll panels and supporting sections.
