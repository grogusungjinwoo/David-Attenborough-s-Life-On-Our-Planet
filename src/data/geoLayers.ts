import type { GeoLayerRecord, WildSpaceDefinition } from "../domain/types";
import { sourceCatalog } from "./sources";

export const wildSpaceDefinitionLabels: Record<WildSpaceDefinition, string> = {
  "witness-story": "Witness story",
  "low-human-footprint": "Low human footprint",
  "forest-land-cover": "Forest / land cover",
  "protected-conserved": "Protected / conserved"
};

export const wildSpaceDefinitionCaveats: Record<WildSpaceDefinition, string> = {
  "witness-story":
    "Attenborough's timeline percentage is a narrative witness metric, not a mapped polygon product.",
  "low-human-footprint":
    "Derived from public human-pressure datasets; thresholds are evidence overlays, not legal wilderness designations.",
  "forest-land-cover":
    "Forest and land-cover classes show habitat context, but forest extent is not the same thing as wild space.",
  "protected-conserved":
    "Protected-area coverage shows conservation status and governance, not untouched wilderness."
};

export const geoLayers: GeoLayerRecord[] = [
  {
    id: "attenborough-witness-wildspace",
    label: "Attenborough remaining wild space",
    evidenceKind: "narrative-metric",
    geometryKind: "raster-derived",
    definition:
      "Timeline percentages used as the story baseline for remaining wild space across Attenborough's lifetime.",
    sourceRefs: [sourceCatalog.attenboroughExcerpt, sourceCatalog.wwfLivingPlanet],
    displayCaveat: wildSpaceDefinitionCaveats["witness-story"]
  },
  {
    id: "low-human-footprint-hotspots",
    label: "Low human footprint hotspots",
    evidenceKind: "derived-raster-stat",
    geometryKind: "raster-derived",
    year: 2018,
    definition:
      "Static evidence rings for regions with low mapped human pressure, used to orient the wild-evidence view.",
    sourceRefs: [sourceCatalog.humanFootprint, sourceCatalog.ipbesAssessment],
    displayCaveat: wildSpaceDefinitionCaveats["low-human-footprint"]
  },
  {
    id: "forest-land-cover-context",
    label: "Forest and land-cover context",
    evidenceKind: "measured-global-stat",
    geometryKind: "raster-derived",
    year: 2021,
    definition:
      "Land-cover evidence for forest, water, built-up, ice, and bare surfaces used as geographic context.",
    sourceRefs: [sourceCatalog.esaWorldCover, sourceCatalog.faoForests],
    displayCaveat: wildSpaceDefinitionCaveats["forest-land-cover"]
  },
  {
    id: "historical-land-cover-1770-1937",
    label: "Historical forest and land-use reconstruction",
    evidenceKind: "derived-raster-stat",
    geometryKind: "raster-derived",
    year: 1770,
    definition:
      "Coarse global reconstruction for forest green, cropland, pasture, and human exposure transitions across 1770, 1800, 1850, 1900, and 1937.",
    sourceRefs: [
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.nasaAnthromes,
      sourceCatalog.nasaIslscpHistoricLandcover,
      sourceCatalog.hydeHistory
    ],
    displayCaveat:
      "Early years are model reconstructions, so the UI uses broad color transitions rather than pretending to show measured satellite pixels."
  },
  {
    id: "historical-weather-ocean-1770-1937",
    label: "Historical weather and ocean reconstruction",
    evidenceKind: "derived-raster-stat",
    geometryKind: "raster-derived",
    year: 1850,
    definition:
      "Weather, cloud, and ocean heat tinting driven by sparse marine records before 1850 and stronger NOAA/NASA products after the instrument era begins.",
    sourceRefs: [
      sourceCatalog.noaaIcoads,
      sourceCatalog.noaa20cr,
      sourceCatalog.noaaErsst,
      sourceCatalog.nasaGistemp
    ],
    displayCaveat:
      "Weather before the mid-1800s is sparse and maritime-biased; the animation intentionally stays coarse until reanalysis and SST products become usable."
  },
  {
    id: "protected-conserved-context",
    label: "Protected and conserved context",
    evidenceKind: "licensed-polygon",
    geometryKind: "multipolygon",
    year: 2024,
    definition:
      "Protected Planet / WDPA context for conserved areas; raw licensed polygons are not bundled in the static site.",
    sourceRefs: [sourceCatalog.protectedPlanet],
    displayCaveat: wildSpaceDefinitionCaveats["protected-conserved"]
  },
  {
    id: "procedural-visual-response",
    label: "Procedural visual response",
    evidenceKind: "simulated-visual",
    geometryKind: "point",
    definition:
      "Trees, lights, route arcs, and animal markers are visual responses to source-backed metrics and records.",
    sourceRefs: [sourceCatalog.nasaBlueMarble, sourceCatalog.naturalEarth],
    displayCaveat:
      "Simulated visual density helps tell the story; it should not be read as measured tree, road, or animal counts."
  }
];
