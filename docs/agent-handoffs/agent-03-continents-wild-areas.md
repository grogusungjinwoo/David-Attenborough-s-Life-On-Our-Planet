# Agent 3 Brief: Continents And Wild Areas

## Mission

Own exactly seven continent records, wild-area records, first-visible years, and anti-duplicate Africa/Asia checks.

## Owned Files

- `src/data/continents.ts`
- `src/data/wildAreas.ts`
- `src/data/scrollAtlasData.test.ts` for continent and wild-area assertions

## Forbidden Edits

- Do not edit route rendering or scroll UI.
- Do not add duplicate continent records for visual scale tricks.

## Required Checks

- `node .\node_modules\vitest\vitest.mjs run src\data\scrollAtlasData.test.ts`
- `node .\node_modules\typescript\bin\tsc -b`

## Handoff Notes

Return the seven-continent count, wild-area source notes, and any historic-atlas sizing caveats.
