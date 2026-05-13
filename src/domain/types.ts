export type SourceRef = {
  id: string;
  label: string;
  publisher: string;
  url?: string;
  accessed?: string;
  note?: string;
};

export type LayerState = {
  atmosphere: boolean;
  vegetation: boolean;
  oceans: boolean;
  mountains: boolean;
  settlements: boolean;
  wildSpace: boolean;
  population: boolean;
  species: boolean;
  zoos: boolean;
  climate: boolean;
  energy: boolean;
};

export type MetricSnapshot = {
  worldPopulationBillion?: number;
  atmosphericCarbonPpm?: number;
  remainingWildSpacePercent?: number;
  wildSpaceAcres?: number;
  speciesAtRiskCount?: number;
  extinctSpeciesCount?: number;
};

export type TimelineAnchor = {
  id: string;
  year: number;
  title: string;
  summary: string;
  metrics: MetricSnapshot;
  sourceRefs: SourceRef[];
  metricSourceRefs?: Partial<Record<keyof MetricSnapshot, SourceRef[]>>;
};

export type WorldSnapshot = {
  year: number;
  metrics: MetricSnapshot;
  layers: LayerState;
  proceduralDensity: {
    trees: number;
    buildings: number;
    waterStress: number;
    animalPresence: number;
  };
};

export type SpeciesRecord = {
  id: string;
  name: string;
  status: "stable" | "threatened" | "endangered" | "extinct";
  regionIds: string[];
  summary: string;
  statusByYear: Array<{
    year: number;
    status: SpeciesRecord["status"];
    note: string;
    sourceRefs?: SourceRef[];
  }>;
  sourceRefs: SourceRef[];
};

export type ZooSite = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  openedYear?: number;
  notes: string;
  sourceRefs: SourceRef[];
};

export type RegionRecord = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  biome:
    | "rainforest"
    | "savanna"
    | "ocean"
    | "polar"
    | "reef"
    | "temperate"
    | "mixed";
  summary: string;
  sourceRefs: SourceRef[];
};

export type ReferenceOverlay = {
  id: string;
  label: string;
  domain: "climate" | "weather" | "energy";
  inspiration: string;
  futureUse: string;
  sourceRefs: SourceRef[];
};

export type MapProviderKind = "simulated-globe" | "google-3d-maps";

export type MapProviderCapabilities = {
  supportsPhotorealisticTiles: boolean;
  supportsProceduralLayers: boolean;
  requiresApiKey: boolean;
  supportsStaticHosting: boolean;
};
