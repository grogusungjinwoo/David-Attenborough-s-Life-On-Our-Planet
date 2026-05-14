# Agent 1 Brief: Globe Detail

## Mission

Own globe layers: remove fake/procedural geography artifacts, render country boundary rings, on-globe labels, wild-area labels, zoom gates, and route emphasis integration.

## Owned Files

- `src/features/globe/ProceduralGlobe.tsx`
- `src/features/globe/GlobeLabelLayer.tsx`
- `src/features/globe/CountryBoundaryLayer.tsx`
- `src/features/globe/TradeRouteLayer.tsx`
- `src/features/globe/globeLayers.test.tsx`
- `src/features/globe/spherical.ts`
- `src/features/globe/spherical.test.ts`

## Forbidden Edits

- Do not change shared types or store actions without lead coordination.
- Do not replace source-backed data with procedural landmass guesses.

## Required Checks

- `node .\node_modules\vitest\vitest.mjs run src\features\globe\globeLayers.test.tsx src\features\globe\spherical.test.ts`
- `node .\node_modules\typescript\bin\tsc -b`

## Handoff Notes

Return label visibility thresholds, route emphasis behavior, and any remaining geometry fidelity limitations.
