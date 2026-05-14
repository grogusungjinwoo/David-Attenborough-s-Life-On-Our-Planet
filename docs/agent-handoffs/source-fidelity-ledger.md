# Source Fidelity Ledger

## Accepted Sources

- Natural Earth and UN SALB: country labels, country metadata, and administrative boundary cross-checks.
- NASA/NOAA/ESA/HYDE/SedAC-style sources: Earth texture, historical land cover, climate, bathymetry, and human-pressure evidence.
- UNEP-WCMC/IUCN Protected Planet: protected-area evidence context only.
- UNCTAD, WTO, World Bank WITS, OECD/ITF, and TeleGeography: trade-route context and route category provenance.
- Existing `speciesProfiles`, `mediaAssets`, sources, stories, and witness content remain the animal/photo/story source baseline.

## Non-Accuracy References

- Herd Signal is used for rhythm and interaction feel.
- Rahul portfolio is used for scroll-reactive state presentation.
- mapsicon is used only as an organization idea for country slices. Its map assets are not treated as precise geography.

## Current Data Fidelity Notes

- `countryLabelSeedRecords` is a curated source-backed label seed, not a complete country polygon dataset.
- `countries` intentionally aliases `countryLabelSeedRecords` so downstream components share one label/boundary source.
- Wild-area labels are zoom/time-gated evidence labels, not protected-area polygon downloads.
- Trade routes are illustrative great-circle corridors backed by source metadata and interpolation rules from 1900 through 2024.
