import type { ChapterVisualRecord, ScrollChapterRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

export const scrollChapters: ScrollChapterRecord[] = [
  {
    id: "baseline-1770",
    year: 1770,
    title: "A mostly wild baseline",
    body: "The atlas opens before industrial acceleration, with the globe held wide so continent scale and intact wild systems are legible.",
    globeTarget: { lat: 10, lon: 18, zoomScalar: 0.38 },
    activeSpeciesIds: ["blue-whale", "gray-wolf"],
    activeRouteIds: [],
    activeLayerIds: ["vegetation", "wildSpace", "oceans"]
  },
  {
    id: "trade-1900",
    year: 1900,
    title: "Trade begins to draw bright lines",
    body: "Steamship lanes and early industrial ports become visible as the first trade routes cross the Atlantic, Suez, and Panama-era corridors.",
    globeTarget: { lat: 22, lon: 35, zoomScalar: 0.48 },
    activeSpeciesIds: ["blue-whale", "sea-turtle"],
    activeRouteIds: ["north-atlantic-steamship", "suez-indian-ocean", "panama-pacific"],
    activeLayerIds: ["population", "settlements", "oceans"]
  },
  {
    id: "childhood-1937",
    year: 1937,
    title: "A child meets a still-wild world",
    body: "The camera turns toward Africa and Asia, holding wild places and early pressure together without duplicating landmasses or hiding country context.",
    globeTarget: { lat: 4, lon: 43, zoomScalar: 0.58 },
    activeSpeciesIds: ["african-elephant", "black-rhinoceros", "gorilla"],
    activeRouteIds: ["north-atlantic-steamship", "suez-indian-ocean", "persian-gulf-oil"],
    activeLayerIds: ["wildSpace", "vegetation", "species"]
  },
  {
    id: "television-1954",
    year: 1954,
    title: "The televised planet arrives",
    body: "A wider public sees remote habitats for the first time as trade, cities, and carbon continue to climb.",
    globeTarget: { lat: 18, lon: 78, zoomScalar: 0.62 },
    activeSpeciesIds: ["bengal-tiger", "pangolin"],
    activeRouteIds: ["suez-indian-ocean", "persian-gulf-oil", "grain-atlantic"],
    activeLayerIds: ["population", "settlements", "species"]
  },
  {
    id: "earthrise-1968",
    year: 1968,
    title: "Earthrise changes the frame",
    body: "Apollo 8 returns the first whole-Earth color icon from lunar orbit, so the atlas can now use space photography as historical media rather than reconstruction.",
    globeTarget: { lat: 12, lon: -96, zoomScalar: 0.56 },
    activeSpeciesIds: ["blue-whale", "gray-wolf"],
    activeRouteIds: ["north-atlantic-steamship", "suez-indian-ocean", "persian-gulf-oil"],
    activeLayerIds: ["oceans", "atmosphere", "population"]
  },
  {
    id: "blue-marble-1972",
    year: 1972,
    title: "Blue Marble makes one planet legible",
    body: "Apollo 17's full-disk photograph gives the modern environmental movement a visual shorthand for a finite, connected Earth.",
    globeTarget: { lat: -18, lon: 38, zoomScalar: 0.58 },
    activeSpeciesIds: ["sea-turtle", "penguin", "coral"],
    activeRouteIds: ["suez-indian-ocean", "persian-gulf-oil", "grain-atlantic"],
    activeLayerIds: ["oceans", "climate", "wildSpace"]
  },
  {
    id: "globalisation-1978",
    year: 1978,
    title: "Global systems tighten",
    body: "Container routes, oil lanes, land conversion, and species pressure begin to stack into one connected planetary pattern.",
    globeTarget: { lat: 7, lon: 112, zoomScalar: 0.68 },
    activeSpeciesIds: ["bornean-orangutan", "reef-manta-ray", "coral"],
    activeRouteIds: ["east-asia-container", "pacific-container", "persian-gulf-oil"],
    activeLayerIds: ["population", "wildSpace", "species", "oceans"]
  },
  {
    id: "digital-1997",
    year: 1997,
    title: "A connected Earth, a fragmented wild",
    body: "Digital maps make the planet visible while habitats become smaller, warmer, and more isolated along the same routes that connect markets.",
    globeTarget: { lat: 34, lon: 121, zoomScalar: 0.72 },
    activeSpeciesIds: ["sea-turtle", "great-white-shark"],
    activeRouteIds: ["pacific-container", "east-asia-container", "air-cargo-eurasia"],
    activeLayerIds: ["population", "settlements", "climate", "species"]
  },
  {
    id: "witness-2020",
    year: 2020,
    title: "The witness statement",
    body: "The scroll reaches the critical decade: carbon exceeds 400 ppm, wilderness is much reduced, and biodiversity risk becomes global.",
    globeTarget: { lat: -4, lon: -62, zoomScalar: 0.76 },
    activeSpeciesIds: ["golden-toad", "gorilla", "leopard"],
    activeRouteIds: ["grain-atlantic", "southern-resource", "pacific-container"],
    activeLayerIds: ["wildSpace", "climate", "species"]
  },
  {
    id: "briefing-2024",
    year: 2024,
    title: "The current briefing",
    body: "The modern atlas shows the routes, labels, animals, and pressure layers together so recovery choices can be read in context.",
    globeTarget: { lat: 12, lon: -38, zoomScalar: 0.64 },
    activeSpeciesIds: ["african-elephant", "bornean-orangutan", "blue-whale", "polar-bear"],
    activeRouteIds: [
      "pacific-container",
      "east-asia-container",
      "air-cargo-eurasia",
      "transpacific-data-cable"
    ],
    activeLayerIds: ["population", "wildSpace", "climate", "species", "zoos"]
  }
];

export const chapterVisuals: ChapterVisualRecord[] = [
  {
    id: "visual-baseline-1770",
    chapterId: "baseline-1770",
    kind: "evidence-map",
    title: "Reconstructed baseline for a mostly wild Earth",
    caption:
      "The 1770 wild-space baseline is reconstructed from historical land-cover, HYDE-family, and NASA Earthdata sources; no photographed whole-Earth media is attached to this chapter.",
    sourceRefs: [
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.hydeHistory,
      sourceCatalog.nasaIslscpHistoricLandcover
    ],
    relatedSpeciesIds: ["blue-whale", "gray-wolf"],
    evidencePanelIds: ["biome-pressure"]
  },
  {
    id: "visual-trade-1900",
    chapterId: "trade-1900",
    kind: "change-overlay",
    title: "Trade routes begin to mark the planet",
    caption:
      "The 1900 settlement, population, and route changes are reconstructed from trade, HYDE, and land-cover evidence; the chapter avoids later Apollo photography.",
    sourceRefs: [
      sourceCatalog.unctadMaritimeTransport,
      sourceCatalog.hydeHistory,
      sourceCatalog.nasaAnthromes
    ],
    relatedSpeciesIds: ["blue-whale", "sea-turtle"],
    evidencePanelIds: ["population-expansion"]
  },
  {
    id: "visual-childhood-1937",
    chapterId: "childhood-1937",
    kind: "animal-focus",
    title: "Wild places still hold the frame",
    caption:
      "The 1937 view pairs reconstructed habitat pressure with animal witnesses so continent-scale change stays attached to living species.",
    mediaAssetId: "media-african-elephant",
    sourceRefs: [
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.nasaIslscpHistoricLandcover,
      sourceCatalog.ipbesAssessment
    ],
    relatedSpeciesIds: ["african-elephant", "black-rhinoceros", "gorilla"],
    evidencePanelIds: []
  },
  {
    id: "visual-television-1954",
    chapterId: "television-1954",
    kind: "change-overlay",
    title: "Television expands the reconstructed atlas",
    caption:
      "The 1954 land, population, and habitat signals are reconstructed from atlas metrics and historical datasets; Apollo-era whole-Earth photographs do not appear before 1968.",
    sourceRefs: [
      sourceCatalog.hydeHistory,
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.unitedNationsPopulation
    ],
    relatedSpeciesIds: ["bengal-tiger", "pangolin"],
    evidencePanelIds: ["population-expansion"]
  },
  {
    id: "visual-earthrise-1968",
    chapterId: "earthrise-1968",
    kind: "space-reference",
    title: "Apollo 8 Earthrise",
    caption:
      "Earthrise is attached only to the 1968 chapter, where Apollo 8 makes photographed whole-Earth context historically accurate.",
    mediaAssetId: "media-apollo-8-earthrise",
    sourceRefs: [
      sourceCatalog.nasaApollo8Earthrise,
      sourceCatalog.nasaImageMediaGuidelines
    ],
    relatedSpeciesIds: ["blue-whale", "gray-wolf"],
    evidencePanelIds: []
  },
  {
    id: "visual-blue-marble-1972",
    chapterId: "blue-marble-1972",
    kind: "space-reference",
    title: "Apollo 17 Blue Marble",
    caption:
      "Blue Marble is attached to the 1972 chapter, matching Apollo 17's full-disk Earth photograph rather than using it as a stand-in for earlier reconstructed states.",
    mediaAssetId: "media-apollo-17-blue-marble",
    sourceRefs: [
      sourceCatalog.nasaApollo17BlueMarble,
      sourceCatalog.nasaImageMediaGuidelines
    ],
    relatedSpeciesIds: ["sea-turtle", "penguin", "coral"],
    evidencePanelIds: []
  },
  {
    id: "visual-globalisation-1978",
    chapterId: "globalisation-1978",
    kind: "evidence-map",
    title: "A tighter route network meets fragile habitats",
    caption:
      "Containerization, oil routes, and settlement pressure are shown alongside reef and rainforest witnesses as the global system tightens.",
    mediaAssetId: "media-bornean-orangutan",
    sourceRefs: [
      sourceCatalog.unctadMaritimeTransport,
      sourceCatalog.oecdContainerTransport,
      sourceCatalog.ipbesAssessment
    ],
    relatedSpeciesIds: ["bornean-orangutan", "reef-manta-ray", "coral"],
    evidencePanelIds: []
  },
  {
    id: "visual-digital-1997",
    chapterId: "digital-1997",
    kind: "change-overlay",
    title: "Visible maps, fragmented wild systems",
    caption:
      "Digital-era map visibility is paired with population and climate pressure so the chapter reads as evidence, not decorative context.",
    mediaAssetId: "media-sea-turtle",
    sourceRefs: [
      sourceCatalog.teleGeographySubmarineCableMap,
      sourceCatalog.wtoTradeStats,
      sourceCatalog.noaaErsst
    ],
    relatedSpeciesIds: ["sea-turtle", "great-white-shark"],
    evidencePanelIds: []
  },
  {
    id: "visual-witness-2020",
    chapterId: "witness-2020",
    kind: "animal-focus",
    title: "The witness decade",
    caption:
      "Species loss, climate pressure, and remaining wild-space evidence converge in the chapter that turns the atlas into a witness statement.",
    mediaAssetId: "media-gorilla",
    sourceRefs: [
      sourceCatalog.iucnSummary,
      sourceCatalog.wwfLivingPlanet,
      sourceCatalog.nasaGistemp
    ],
    relatedSpeciesIds: ["golden-toad", "gorilla", "leopard"],
    evidencePanelIds: []
  },
  {
    id: "visual-briefing-2024",
    chapterId: "briefing-2024",
    kind: "evidence-map",
    title: "The current briefing, stitched together",
    caption:
      "The present-day chapter brings routes, population, wild-space, species, and zoo evidence into one readable briefing rather than a late supporting-map dump.",
    mediaAssetId: "media-polar-bear",
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.noaaCarbon,
      sourceCatalog.ipbesAssessment,
      sourceCatalog.wwfLivingPlanet
    ],
    relatedSpeciesIds: ["african-elephant", "bornean-orangutan", "blue-whale", "polar-bear"],
    evidencePanelIds: ["geo-change"]
  }
];
