# Agent 6 Brief: Regression And Parity

## Mission

Own tests that prove existing behavior remains reachable after the scroll atlas becomes primary.

## Owned Files

- Relevant `*.test.ts`, e2e tests, and visual smoke tests assigned by lead.
- Do not delete old assertions unless the behavior intentionally moved and the replacement assertion is present.

## Forbidden Edits

- Do not make production UI changes unless fixing a verified regression with lead approval.

## Required Checks

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- `npm run test:visual-smoke`
- `npm run content:verify-media`
- `npm run content:verify-search`

## Handoff Notes

List tests added or updated, unsupported legacy assumptions, and visual/browser gaps.
