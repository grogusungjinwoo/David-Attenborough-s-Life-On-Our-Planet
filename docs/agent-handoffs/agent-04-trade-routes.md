# Agent 4 Brief: Trade Routes

## Mission

Own time-based trade route data, great-circle visibility rules, category coverage, and active-route emphasis.

## Owned Files

- `src/data/tradeRoutes.ts`
- `src/features/globe/TradeRouteLayer.tsx`
- `src/features/globe/globeLayers.test.tsx`
- `src/features/globe/spherical.test.ts`
- `src/data/scrollAtlasData.test.ts` for route assertions

## Forbidden Edits

- Avoid `src/App.tsx` and scroll shell integration unless the lead assigns it.
- Do not introduce paid API dependencies.

## Required Checks

- `node .\node_modules\vitest\vitest.mjs run src\data\scrollAtlasData.test.ts src\features\globe\globeLayers.test.tsx src\features\globe\spherical.test.ts`
- `node .\node_modules\typescript\bin\tsc -b`

## Handoff Notes

Report route categories, year interpolation behavior, and source/provenance coverage.
