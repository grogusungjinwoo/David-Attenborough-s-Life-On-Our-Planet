import type {
  EditorialStory,
  InsightCard,
  LayerState,
  SourceRef,
  SpeciesProfile,
  WorldSnapshot
} from "../domain/types";
import { formatCarbon, formatPercent, formatPopulation } from "../domain/formatters";
import { geoLayers } from "./geoLayers";
import { sourceCatalog } from "./sources";
import { speciesRecords } from "./species";

const manuscriptSource = sourceCatalog.attenboroughExcerpt;

export const manuscriptIndexStatus = {
  pdfPath: "C:\\Users\\patri\\Downloads\\9781529108279.pdf",
  extractedPageCount: 27,
  hasPartThreeSolutions: false,
  sourceNote:
    "The supplied PDF is a 27-page excerpt. It contains the introduction, Pripyat framing, fossil/1937 witness pages, and the contents entry for Part Three, but not the Part Three solution chapters."
} as const;

export const editorialExcerptStatus = {
  ...manuscriptIndexStatus,
  status: "part-three-unavailable",
  note: manuscriptIndexStatus.sourceNote
} as const;

export const editorialStories: EditorialStory[] = [
  {
    id: "story-pripyat-return",
    kind: "story",
    title: "Pripyat turns absence into a witness",
    summary:
      "The opening uses Pripyat to contrast a place built for modern life with the silence that followed evacuation, setting up the question of how quickly nature can return when human pressure drops.",
    manuscriptPageRefs: [
      { sourceId: manuscriptSource.id, pdfPage: 10, printedPage: 3, label: "Pripyat town and human-built habitat" },
      { sourceId: manuscriptSource.id, pdfPage: 11, printedPage: 4, label: "Empty city details and absence of people" },
      { sourceId: manuscriptSource.id, pdfPage: 14, printedPage: 6, label: "Biodiversity decline as the wider warning" }
    ],
    relatedYears: [1986, 2020],
    relatedRegionIds: ["temperate-north"],
    relatedSpeciesIds: ["gray-wolf", "leopard"],
    sourceRefs: [
      sourceWithPages(10, 3, "Pripyat introduction paraphrased from the supplied manuscript excerpt."),
      sourceWithPages(14, 6, "Biodiversity warning paraphrased from the supplied manuscript excerpt.")
    ],
    keywords: ["Pripyat", "Chernobyl", "rewild", "biodiversity", "absence", "recovery"]
  },
  {
    id: "story-fossil-long-view",
    kind: "story",
    title: "Fossils make extinction readable",
    summary:
      "The childhood fossil passages widen the atlas from memory to deep time: vanished worlds leave evidence, and modern species pressure becomes part of that longer record.",
    manuscriptPageRefs: [
      { sourceId: manuscriptSource.id, pdfPage: 21, printedPage: 14, label: "Fossil collecting near Leicester" },
      { sourceId: manuscriptSource.id, pdfPage: 23, printedPage: 16, label: "The history of life as a readable story" },
      { sourceId: manuscriptSource.id, pdfPage: 25, printedPage: 18, label: "Nature reconstructing diversity after extinction" }
    ],
    relatedYears: [1937],
    relatedRegionIds: ["central-america"],
    relatedSpeciesIds: ["golden-toad", "coral"],
    sourceRefs: [
      sourceWithPages(21, 14, "Fossil witness material paraphrased from the supplied manuscript excerpt."),
      sourceWithPages(25, 18, "Deep-time recovery material paraphrased from the supplied manuscript excerpt.")
    ],
    keywords: ["fossil", "extinction", "deep time", "species", "amphibian"]
  },
  {
    id: "story-1937-baseline",
    kind: "story",
    title: "1937 becomes a personal baseline",
    summary:
      "The 1937 pages connect an eleven-year-old naturalist's local curiosity with the app's baseline metrics for population, atmospheric carbon, and remaining wilderness.",
    manuscriptPageRefs: [
      { sourceId: manuscriptSource.id, pdfPage: 20, printedPage: 13, label: "1937 population, carbon, and wilderness baseline" },
      { sourceId: manuscriptSource.id, pdfPage: 21, printedPage: 14, label: "Leicester childhood field witness" },
      { sourceId: manuscriptSource.id, pdfPage: 27, printedPage: 20, label: "Human vulnerability in changing climates" }
    ],
    relatedYears: [1937],
    relatedRegionIds: ["temperate-north"],
    relatedSpeciesIds: ["honey-bee", "gray-wolf"],
    sourceRefs: [
      sourceWithPages(20, 13, "1937 baseline metrics and childhood witness paraphrased from the supplied manuscript excerpt."),
      sourceWithPages(27, 20, "Climate vulnerability context paraphrased from the supplied manuscript excerpt.")
    ],
    keywords: ["1937", "carbon", "wilderness", "population", "Leicester", "baseline"]
  }
];

export const solutionRecords: EditorialStory[] = [];

export const solutionSourceStatus = {
  blocked: true,
  title: "Solutions require the missing Part Three pages",
  summary:
    "This section is wired into navigation and search, but no solution cards are shipped because the local excerpt does not include the Part Three chapters.",
  sourceRefs: [sourceWithPages(6, undefined, "Contents page shows Part Three begins outside the supplied excerpt.")]
} as const;

const speciesProfileDetails: Record<
  string,
  Pick<SpeciesProfile, "scientificName" | "habitat" | "conservationNotes" | "displayPriority">
> = {
  "bornean-orangutan": {
    scientificName: "Pongo pygmaeus",
    habitat: "Lowland and peat-swamp rainforest",
    conservationNotes: "Forest continuity and land-use pressure shape the regional story.",
    displayPriority: 1
  },
  "black-rhinoceros": {
    scientificName: "Diceros bicornis",
    habitat: "Savanna, shrubland, and protected reserves",
    conservationNotes: "Recovery depends on habitat protection and anti-poaching work.",
    displayPriority: 2
  },
  "blue-whale": {
    scientificName: "Balaenoptera musculus",
    habitat: "Open ocean feeding and migration corridors",
    conservationNotes: "Ocean noise, ship strikes, and recovery from industrial whaling remain visible pressures.",
    displayPriority: 3
  },
  "golden-toad": {
    scientificName: "Incilius periglenes",
    habitat: "Montane cloud forest",
    conservationNotes: "A compact extinction marker for climate and habitat vulnerability.",
    displayPriority: 4
  },
  "polar-bear": {
    scientificName: "Ursus maritimus",
    habitat: "Arctic sea-ice and coastal systems",
    conservationNotes: "Sea-ice loss ties species pressure directly to climate layers.",
    displayPriority: 5
  },
  "reef-manta-ray": {
    scientificName: "Mobula alfredi",
    habitat: "Tropical reefs and pelagic corridors",
    conservationNotes: "Fishing pressure and reef health shape the marine layer story.",
    displayPriority: 6
  }
};

export const speciesProfiles: SpeciesProfile[] = speciesRecords.map((species) => ({
  ...species,
  scientificName:
    speciesProfileDetails[species.id]?.scientificName ?? species.scientificName ?? species.name,
  habitat: speciesProfileDetails[species.id]?.habitat ?? species.habitat,
  conservationNotes:
    speciesProfileDetails[species.id]?.conservationNotes ?? species.conservationNotes,
  displayPriority: speciesProfileDetails[species.id]?.displayPriority ?? species.displayPriority
}));

export function createInsightCards(
  snapshot: WorldSnapshot,
  species: SpeciesProfile[] = speciesProfiles,
  layers: LayerState = snapshot.layers
): InsightCard[] {
  const activeLayerCount = Object.values(layers).filter(Boolean).length;
  const endangeredCount = species.filter((record) => record.status === "endangered").length;
  const threatenedCount = species.filter((record) => record.status === "threatened").length;
  const extinctCount = species.filter((record) => record.status === "extinct").length;

  return [
    {
      id: "insight-current-snapshot",
      title: `${snapshot.year} reads as a pressure snapshot`,
      body: `${formatPopulation(snapshot.metrics.worldPopulationBillion)} people, ${formatCarbon(snapshot.metrics.atmosphericCarbonPpm)}, and ${formatPercent(snapshot.metrics.remainingWildSpacePercent)} remaining wild space are shown together so the current year is not read as one metric in isolation.`,
      severity: "watch",
      relatedMetric: "atmosphericCarbonPpm",
      sourceRefs: [
        sourceCatalog.unitedNationsPopulation,
        sourceCatalog.noaaCarbon,
        sourceCatalog.attenboroughExcerpt
      ]
    },
    {
      id: "insight-species-catalog",
      title: `${species.length} species profiles broaden the witness layer`,
      body: `${endangeredCount} endangered, ${threatenedCount} threatened, and ${extinctCount} extinct records connect beloved animals to regions, habitats, and source-backed conservation notes.`,
      severity: endangeredCount > threatenedCount ? "critical" : "watch",
      relatedMetric: "speciesAtRiskCount",
      sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.ipbesAssessment]
    },
    {
      id: "insight-active-layers",
      title: `${activeLayerCount} evidence layers are active`,
      body:
        "The dashboard keeps layer state separate from editorial copy, so map evidence can change without rewriting the manuscript-grounded stories.",
      severity: "notice",
      relatedMetric: "layers",
      sourceRefs: geoLayers.flatMap((layer) => layer.sourceRefs).slice(0, 3)
    }
  ];
}

export const insightCards: InsightCard[] = createInsightCards({
  year: 2024,
  metrics: {
    worldPopulationBillion: 8.2,
    atmosphericCarbonPpm: 422.8,
    remainingWildSpacePercent: 34
  },
  layers: {
    atmosphere: true,
    vegetation: true,
    oceans: true,
    mountains: true,
    topographicRelief: true,
    adminBoundaries: true,
    settlements: true,
    wildSpace: true,
    population: true,
    species: true,
    zoos: true,
    climate: true,
    energy: false
  },
  earthSurface: {
    forestGreenCoveragePercent: 35.6,
    cropPastureCoveragePercent: 34.5,
    vegetationIndex: 0.42,
    oceanHeatIndex: 0.92,
    weatherEnergyIndex: 0.88,
    humanExposureIndex: 0.89,
    nightLightIndex: 0.98,
    cloudOpacity: 0.38,
    confidence: "observed",
    projection: "equirectangular-wgs84",
    summary: "Editorial default insight snapshot.",
    sourceRefs: [sourceCatalog.unitedNationsPopulation, sourceCatalog.noaaCarbon]
  },
  proceduralDensity: {
    trees: 0.42,
    buildings: 0.89,
    waterStress: 0.9,
    animalPresence: 0.31
  }
});

function sourceWithPages(pdfPage: number, printedPage?: number, detail?: string): SourceRef {
  return {
    ...manuscriptSource,
    pdfPage,
    printedPage,
    detail
  };
}
