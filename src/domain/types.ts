export type SourceRef = {
  id: string;
  label: string;
  publisher: string;
  url?: string;
  accessed?: string;
  note?: string;
  pdfPage?: number;
  printedPage?: number;
  detail?: string;
};

export type LayerState = {
  atmosphere: boolean;
  vegetation: boolean;
  oceans: boolean;
  mountains: boolean;
  topographicRelief: boolean;
  adminBoundaries: boolean;
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

export type EarthSurfaceConfidence = "reconstructed" | "instrumental" | "observed";

export type EarthSurfaceState = {
  forestGreenCoveragePercent: number;
  cropPastureCoveragePercent: number;
  vegetationIndex: number;
  oceanHeatIndex: number;
  weatherEnergyIndex: number;
  humanExposureIndex: number;
  nightLightIndex: number;
  cloudOpacity: number;
  confidence: EarthSurfaceConfidence;
  projection: "equirectangular-wgs84";
  summary: string;
  sourceRefs: SourceRef[];
};

export type TimelineAnchor = {
  id: string;
  year: number;
  title: string;
  summary: string;
  metrics: MetricSnapshot;
  earthSurface?: EarthSurfaceState;
  sourceRefs: SourceRef[];
  metricSourceRefs?: Partial<Record<keyof MetricSnapshot, SourceRef[]>>;
};

export type WorldSnapshot = {
  year: number;
  metrics: MetricSnapshot;
  layers: LayerState;
  earthSurface: EarthSurfaceState;
  proceduralDensity: {
    trees: number;
    buildings: number;
    waterStress: number;
    animalPresence: number;
  };
};

export type GeoChangeLegendStop = {
  label: string;
  value: number;
  color: string;
};

export type GeoChangeLayerSnapshot = {
  id: GeoChangeLayerId;
  label: string;
  summary: string;
  intensity: number;
  color: string;
  confidence: EarthSurfaceConfidence;
  beforeLabel: string;
  currentLabel: string;
  sourceRefs: SourceRef[];
  displayCaveat: string;
  legendStops: GeoChangeLegendStop[];
};

export type GeoChangeRegionSnapshot = {
  regionId: string;
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
  biome: RegionRecord["biome"];
  layerIntensities: Record<GeoChangeLayerId, number>;
  beforeLabel: string;
  currentLabel: string;
  summary: string;
  sourceRefs: SourceRef[];
};

export type GeoChangeSnapshot = {
  year: number;
  layers: GeoChangeLayerSnapshot[];
  regions: GeoChangeRegionSnapshot[];
  sourceRefs: SourceRef[];
  displayCaveat: string;
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

export type PrimarySection =
  | "overview"
  | "timeline"
  | "places"
  | "species"
  | "stories"
  | "solutions"
  | "search";

export type WitnessTab = "witness" | "stories" | "insights";

export type PageRef = {
  sourceId: string;
  pdfPage: number;
  printedPage?: number;
  label: string;
};

export type EditorialStory = {
  id: string;
  kind: "story" | "solution";
  title: string;
  summary: string;
  manuscriptPageRefs: PageRef[];
  relatedYears: number[];
  relatedRegionIds: string[];
  relatedSpeciesIds: string[];
  sourceRefs: SourceRef[];
  keywords: string[];
  unavailableReason?: string;
};

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  severity: "notice" | "watch" | "critical" | "hope";
  relatedMetric?: keyof MetricSnapshot | "layers" | "geography";
  sourceRefs: SourceRef[];
};

export type SpeciesProfile = SpeciesRecord & {
  scientificName: string;
  imageAssetId?: string;
  habitat: string;
  conservationNotes: string;
  displayPriority: number;
};

export type MediaLicense =
  | "CC0"
  | "Public Domain"
  | "CC BY 2.0"
  | "CC BY 2.5"
  | "CC BY 3.0"
  | "CC BY 4.0"
  | "CC BY-SA 3.0"
  | "CC BY-SA 4.0";

export type MediaPlaceholderStatus = "available" | "unavailable" | "metadata-only";

export type MediaAsset = {
  id: string;
  title: string;
  kind: "portrait" | "place" | "species" | "habitat" | "document";
  subjectId: string;
  requiredForDisplay: boolean;
  placeholderStatus: MediaPlaceholderStatus;
  localPath?: string;
  sourceUrl?: string;
  creator: string;
  credit: string;
  license: MediaLicense;
  licenseUrl?: string;
  attribution: string;
  alt: string;
  retrievedAt: string;
  width?: number;
  height?: number;
  mimeType?: string;
  commercialUseCompatible: boolean;
  notes?: string;
  tags: string[];
  sourceRefs: SourceRef[];
};

export type SearchRecord = {
  id: string;
  type: "species" | "place" | "zoo" | "story" | "insight" | "source";
  title: string;
  summary: string;
  targetSection: PrimarySection;
  targetId?: string;
  tokens: string[];
  sourceIds: string[];
  href?: string;
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

export type GlobeActiveView = "space" | "topographic" | "wild-evidence" | "admin-regions";

export type GlobeQuality = "auto" | "performance" | "high";

export type GlobeViewState = {
  longitudeDeg: number;
  latitudeDeg: number;
  zoomScalar: number;
  activeView: GlobeActiveView;
  quality: GlobeQuality;
};

export type WildSpaceDefinition =
  | "witness-story"
  | "low-human-footprint"
  | "forest-land-cover"
  | "protected-conserved";

export type GeoEvidenceKind =
  | "narrative-metric"
  | "measured-global-stat"
  | "derived-raster-stat"
  | "licensed-polygon"
  | "simulated-visual";

export type GeoChangeLayerId =
  | "wild-space"
  | "human-footprint"
  | "forest-cover"
  | "ocean-ice"
  | "urban-lights";

export type GeoLayerRecord = {
  id: string;
  label: string;
  evidenceKind: GeoEvidenceKind;
  geometryKind: "point" | "line" | "polygon" | "multipolygon" | "raster-derived";
  year?: number;
  definition: string;
  sourceRefs: SourceRef[];
  displayCaveat: string;
};

export type EarthTextureManifest = {
  id: string;
  label: string;
  projection: "equirectangular-wgs84";
  lonRange: readonly [-180, 180];
  latRange: readonly [-90, 90];
  seamLongitude: 180 | -180;
  centralMeridian: 0;
  albedo: { mobile: string; desktop: string; high?: string };
  normal: { desktop: string; high?: string };
  sourceRefs: SourceRef[];
};

export type MapProviderKind =
  | "simulated-globe"
  | "static-earth"
  | "online-earth"
  | "google-3d-maps";

export type MapProviderCapabilities = {
  supportsPhotorealisticTiles: boolean;
  supportsProceduralLayers: boolean;
  requiresApiKey: boolean;
  supportsStaticHosting: boolean;
  supports2DMode: boolean;
  supportsPoliticalMode: boolean;
  supportsTopographicMode: boolean;
  supportsSatelliteMode: boolean;
};
