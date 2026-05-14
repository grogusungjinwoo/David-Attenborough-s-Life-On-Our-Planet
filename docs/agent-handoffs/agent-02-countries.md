# Agent 2 Brief: Countries

## Mission

Own country seed records, ISO metadata, label coordinates, source references, and coordinate validation coverage.

## Owned Files

- `src/data/countries.ts`
- `src/data/scrollAtlasData.test.ts` for country-only assertions

## Forbidden Edits

- Do not change continent IDs or scroll chapters.
- Do not use mapsicon as an accuracy source.

## Required Checks

- `node .\node_modules\vitest\vitest.mjs run src\data\scrollAtlasData.test.ts`
- `node .\node_modules\typescript\bin\tsc -b`

## Handoff Notes

Report whether records are complete global coverage or a curated label seed, and list any missing countries intentionally deferred.
