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
  },
  {
    id: "south-asia",
    name: "South Asian Forests",
    lat: 22,
    lon: 82,
    radiusKm: 900,
    biome: "rainforest",
    summary:
      "A tiger and corridor region where reserves, farms, roads, and growing towns meet.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.iucnSummary]
  },
  {
    id: "central-africa",
    name: "Central African Forests",
    lat: -0.6,
    lon: 19.6,
    radiusKm: 1200,
    biome: "rainforest",
    summary:
      "A forest region connecting great apes, pangolins, carbon storage, and community conservation.",
    sourceRefs: [sourceCatalog.faoForests, sourceCatalog.ipbesAssessment]
  },
  {
    id: "central-america",
    name: "Central American Cloud Forests",
    lat: 10.1,
    lon: -84.1,
    radiusKm: 360,
    biome: "rainforest",
    summary:
      "A narrow-range amphibian region where climate, disease, and habitat shifts can act abruptly.",
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.ipbesAssessment]
  },
  {
    id: "global-oceans",
    name: "Global Ocean Routes",
    lat: -8,
    lon: -150,
    radiusKm: 2200,
    biome: "ocean",
    summary:
      "A wide marine corridor for migratory species, fisheries pressure, shipping, and warming seas.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "temperate-north",
    name: "Northern Temperate Corridors",
    lat: 48,
    lon: 15,
    radiusKm: 1300,
    biome: "temperate",
    summary:
      "A mixed forest and mountain corridor where predator recovery depends on coexistence and connectivity.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "pollinator-belts",
    name: "Pollinator Belts",
    lat: 46,
    lon: -95,
    radiusKm: 1000,
    biome: "temperate",
    summary:
      "A farmland and meadow region for pollinator habitat, pesticide pressure, and flowering diversity.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "southern-ocean",
    name: "Southern Ocean",
    lat: -62,
    lon: 55,
    radiusKm: 1700,
    biome: "polar",
    summary:
      "A cold-ocean system where sea ice, krill, fisheries, and penguin colonies are tightly linked.",
    sourceRefs: [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]
  }
];
