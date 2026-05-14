# Scroll Atlas Agent Handoff Overview

Primary build spec: `docs/superpowers/plans/2026-05-13-scroll-driven-earth-atlas.md`.

This folder is the coordinator operating record for the scroll-driven Earth Atlas implementation. The lead agent owns shared contracts, sequencing, integration reviews, and final QA. Subagents should own narrow files, avoid shared integration files unless explicitly assigned, and return handoffs in the format below.

## Frozen Shared Contracts

- `ContinentRecord`, `CountryRecord`, `WildAreaRecord`, `TradeRouteRecord`, and `ScrollChapterRecord` live in `src/domain/types.ts`.
- Scroll store actions include chapter selection, scroll/manual mode, globe view targeting, 3D/2D view mode, and basemap selection in `src/state/usePlanetStore.ts`.
- Required test IDs include `app-shell`, `timeline`, `timeline-year-{year}`, `timeline-current-year`, `layer-toggle-{layer}`, `species-drawer`, `globe-label-layer`, `globe-viewport`, and `map-viewport`.

## Reference Interpretation

- Herd Signal: map-plus-scroll rhythm and conservation story pacing.
- Rahul portfolio: scroll-reactive state/message changes.
- mapsicon: country-slice organization inspiration only; not boundary or geography accuracy.

## Handoff Format

- `status`: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`
- files changed
- tests run
- remaining risks
- source/provenance notes

## Current Baseline Note

The repo began with a dirty worktree and an untracked plan at `docs/superpowers/plans/2026-05-13-scroll-driven-earth-atlas.md`. Preserve unrelated user changes and record integration assumptions in the ledgers.
