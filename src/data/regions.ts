import type { RegionRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

export const regions: RegionRecord[] = [
  {
    id: "amazon-basin",
    name: "Amazon Basin",
    lat: -3.4,
    lon: -62.2,
    radiusKm: 1600,
    biome: "rainforest",
    summary:
      "A rainforest region central to carbon storage, rainfall cycles, and habitat continuity.",
    sourceRefs: [sourceCatalog.faoForests, sourceCatalog.ipbesAssessment]
  },
  {
    id: "coral-triangle",
    name: "Coral Triangle",
    lat: -2.2,
    lon: 128.2,
    radiusKm: 1400,
    biome: "reef",
    summary:
      "A marine biodiversity hotspot where warming, acidification, and fishing pressure converge.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "arctic-circle",
    name: "Arctic Circle",
    lat: 73,
    lon: -40,
    radiusKm: 1800,
    biome: "polar",
    summary:
      "A fast-changing polar system where warming reshapes ice, food webs, and ocean circulation.",
    sourceRefs: [sourceCatalog.noaaCarbon, sourceCatalog.ipbesAssessment]
  },
  {
    id: "serengeti",
    name: "Serengeti-Mara",
    lat: -2.3,
    lon: 34.8,
    radiusKm: 420,
    biome: "savanna",
    summary:
      "A migratory savanna system that makes the connection between land protection and animal abundance visible.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "borneo",
    name: "Borneo Rainforest",
    lat: 0.9,
    lon: 114.4,
    radiusKm: 740,
    biome: "rainforest",
    summary:
      "A tropical forest region associated with species endemism and pressure from land-use conversion.",
    sourceRefs: [sourceCatalog.faoForests, sourceCatalog.iucnSummary]
  },
  {
    id: "north-atlantic",
    name: "North Atlantic",
    lat: 43,
    lon: -35,
    radiusKm: 1500,
    biome: "ocean",
    summary:
      "An ocean system where fishing, shipping, warming, and conservation policy intersect.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  }
];
