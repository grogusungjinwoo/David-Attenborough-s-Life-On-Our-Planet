# Agent 5 Brief: Scroll UI And Animal Stories

## Mission

Own the scroll atlas shell, sticky globe stage, compact controls, animal/photo story scroller, and parity reachability for timeline, search, layers, species, zoos, map mode, and sources.

## Owned Files

- `src/components/scroll/ScrollAtlas.tsx`
- `src/components/scroll/TimeScrollController.tsx`
- `src/components/scroll/AnimalStoryScroller.tsx`
- `src/components/scroll/*.test.tsx`
- `src/styles.css` only for scroll shell sections assigned by lead

## Forbidden Edits

- Do not edit globe layer internals.
- Do not remove existing content paths; move or surface them in the scroll atlas.

## Required Checks

- `node .\node_modules\vitest\vitest.mjs run src\components\scroll\ScrollAtlas.test.tsx src\components\scroll\scrollComponents.test.tsx`
- Browser QA at desktop and mobile sizes.

## Handoff Notes

Report preserved dashboard capabilities, mobile overflow status, and animal selection sync behavior.
