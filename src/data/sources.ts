import type { SourceRef } from "../domain/types";

export const sourceCatalog = {
  attenboroughExcerpt: {
    id: "attenborough-life-on-our-planet-excerpt",
    label: "David Attenborough: A Life on Our Planet timeline excerpt",
    publisher: "Local manuscript/PDF excerpt",
    note:
      "Primary-source placeholder for the supplied PDF excerpt. Replace with a local PDF path once the excerpt is committed."
  },
  unitedNationsPopulation: {
    id: "un-wpp-2024",
    label: "World Population Prospects 2024",
    publisher: "United Nations Department of Economic and Social Affairs",
    url: "https://www.un.org/en/global-issues/population",
    accessed: "2026-05-12"
  },
  noaaCarbon: {
    id: "noaa-global-co2-2024",
    label: "Climate change: atmospheric carbon dioxide",
    publisher: "NOAA Climate.gov",
    url: "https://www.climate.gov/news-features/understanding-climate/climate-change-atmospheric-carbon-dioxide",
    accessed: "2026-05-12"
  },
  noaaTrends: {
    id: "noaa-gml-co2-trends",
    label: "Trends in CO2",
    publisher: "NOAA Global Monitoring Laboratory",
    url: "https://gml.noaa.gov/ccgg/trends/data.html",
    accessed: "2026-05-12"
  },
  ipbesAssessment: {
    id: "ipbes-global-assessment-2019",
    label: "Global Assessment Report on Biodiversity and Ecosystem Services",
    publisher: "IPBES",
    url: "https://ipbes.net/global-assessment",
    accessed: "2026-05-12"
  },
  iucnSummary: {
    id: "iucn-red-list-summary-statistics",
    label: "IUCN Red List Summary Statistics",
    publisher: "International Union for Conservation of Nature",
    url: "https://nrl.iucnredlist.org/resources/summary-statistics",
    accessed: "2026-05-12"
  },
  faoForests: {
    id: "fao-fra-2020",
    label: "Global Forest Resources Assessment 2020",
    publisher: "Food and Agriculture Organization of the United Nations",
    url: "https://www.fao.org/interactive/forest-resources-assessment/2020/en",
    accessed: "2026-05-12"
  },
  wwfLivingPlanet: {
    id: "wwf-living-planet-2024",
    label: "Living Planet Report 2024",
    publisher: "World Wildlife Fund",
    url: "https://www.worldwildlife.org/publications/2024-living-planet-report",
    accessed: "2026-05-12"
  },
  ourWorldMammalBiomass: {
    id: "owid-wild-mammal-biomass",
    label: "Wild mammal biomass dominance",
    publisher: "Our World in Data",
    url: "https://ourworldindata.org/wild-mammal-biomass-dominance",
    accessed: "2026-05-12"
  },
  londonZoo: {
    id: "zsl-london-zoo-history",
    label: "10 things you may not know about London Zoo",
    publisher: "ZSL London Zoo",
    url: "https://www.londonzoo.org/zoo-stories/10-things-you-may-not-know-about-london-zoo",
    accessed: "2026-05-12"
  },
  smithsonianZoo: {
    id: "smithsonian-national-zoo-history",
    label: "History",
    publisher: "Smithsonian's National Zoo and Conservation Biology Institute",
    url: "https://nationalzoo.si.edu/about/history",
    accessed: "2026-05-12"
  },
  bronxZoo: {
    id: "bronx-zoo-about",
    label: "About Our Park",
    publisher: "Bronx Zoo",
    url: "https://bronxzoo.com/about",
    accessed: "2026-05-12"
  },
  sanDiegoZoo: {
    id: "san-diego-zoo-history",
    label: "San Diego Zoo Wildlife Alliance history timeline",
    publisher: "San Diego Zoo Wildlife Alliance Library",
    url: "https://library.sandiegozoo.org/sdzg-history-timeline/",
    accessed: "2026-05-12"
  },
  singaporeZoo: {
    id: "singapore-zoo-golden-jubilee",
    label: "Singapore Zoo celebrates its Golden Jubilee",
    publisher: "Mandai Wildlife Group",
    url: "https://www.mandai.com/en/about-mandai/media-centre/Singapore-Zoo-celebrates-its-golden-jubilee.html",
    accessed: "2026-05-12"
  },
  tarongaZoo: {
    id: "taronga-zoo-history",
    label: "Taronga Zoo Sydney historical timeline",
    publisher: "Taronga Conservation Society Australia",
    url: "https://taronga.org.au/about/history-and-culture/sydney",
    accessed: "2026-05-12"
  },
  google3dTiles: {
    id: "google-map-tiles-api",
    label: "Map Tiles API overview",
    publisher: "Google for Developers",
    url: "https://developers.google.com/maps/documentation/tile/overview",
    accessed: "2026-05-12"
  },
  google3dMaps: {
    id: "google-maps-3d-js",
    label: "3D Maps JavaScript API reference",
    publisher: "Google for Developers",
    url: "https://developers.google.com/maps/documentation/javascript/reference/3d-map",
    accessed: "2026-05-12"
  },
  neuralGcm: {
    id: "neuralgcm-github",
    label: "NeuralGCM",
    publisher: "neuralgcm GitHub project",
    url: "https://github.com/neuralgcm/neuralgcm",
    accessed: "2026-05-12"
  },
  aurora: {
    id: "microsoft-aurora",
    label: "Aurora: A Foundation Model for the Earth System",
    publisher: "Microsoft Research",
    url: "https://microsoft.github.io/aurora/intro.html",
    accessed: "2026-05-12"
  },
  pypsaEarth: {
    id: "pypsa-earth-docs",
    label: "PyPSA-Earth documentation",
    publisher: "PyPSA-Earth",
    url: "https://pypsa-earth.readthedocs.io/en/latest/",
    accessed: "2026-05-12"
  }
} satisfies Record<string, SourceRef>;

export const allSources = Object.values(sourceCatalog);
