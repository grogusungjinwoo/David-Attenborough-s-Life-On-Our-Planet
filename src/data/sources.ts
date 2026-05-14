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
  wikimediaCommons: {
    id: "wikimedia-commons-media",
    label: "Wikimedia Commons media metadata",
    publisher: "Wikimedia Commons",
    url: "https://commons.wikimedia.org/",
    accessed: "2026-05-13",
    note:
      "Commercial-compatible CC/public-domain image candidates curated into the local media manifest."
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
  naturalEarth: {
    id: "natural-earth-vectors",
    label: "Natural Earth cultural and physical vectors",
    publisher: "Natural Earth",
    url: "https://www.naturalearthdata.com/downloads/",
    accessed: "2026-05-13",
    note:
      "Public-domain cartographic source for low and mid zoom countries, coastlines, rivers, lakes, and labels."
  },
  naturalEarthIdealized: {
    id: "natural-earth-ii-raster",
    label: "Natural Earth II raster",
    publisher: "Natural Earth",
    url: "https://www.naturalearthdata.com/downloads/10m-raster-data/10m-natural-earth-2/",
    accessed: "2026-05-13",
    note:
      "Public-domain idealized land-cover raster useful as a historical-looking world basemap."
  },
  nasaBlueMarble: {
    id: "nasa-blue-marble-next-generation",
    label: "Blue Marble Next Generation",
    publisher: "NASA Earth Observatory",
    url: "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/",
    accessed: "2026-05-13",
    note: "Open NASA global satellite basemap source for bundled static imagery."
  },
  nasaApollo8Earthrise: {
    id: "nasa-apollo-8-earthrise",
    label: "Apollo 8: Earthrise",
    publisher: "NASA",
    url: "https://www.nasa.gov/image-article/apollo-8-earthrise/",
    accessed: "2026-05-13",
    note:
      "Apollo-era Earth-from-space photograph used as space-view reference imagery, not as literal evidence for pre-spaceflight atlas years."
  },
  nasaApollo17BlueMarble: {
    id: "nasa-apollo-17-blue-marble",
    label: "Apollo 17: Blue Marble",
    publisher: "NASA",
    url: "https://www.nasa.gov/image-article/apollo-17-blue-marble/",
    accessed: "2026-05-13",
    note:
      "Apollo-era whole-Earth photograph used as visual context while historical Earth-state values remain reconstructed from data sources."
  },
  nasaImageMediaGuidelines: {
    id: "nasa-image-media-guidelines",
    label: "NASA Image and Media Guidelines",
    publisher: "NASA",
    url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    accessed: "2026-05-13",
    note:
      "NASA media-use guidance for educational and informational use with NASA acknowledged as source."
  },
  noaaHistoricalLandCover: {
    id: "noaa-historical-land-cover-1770-2010",
    label: "Historical Land-Cover Change and Land-Use Conversions Global Dataset",
    publisher: "NOAA National Centers for Environmental Information",
    url: "https://catalog.data.gov/dataset/historical-land-cover-change-and-land-use-conversions-global-dataset",
    accessed: "2026-05-13",
    note:
      "Global 0.5-degree WGS84 land-cover and land-use conversion estimates; longest reconstruction spans 1770-2010."
  },
  nasaAnthromes: {
    id: "nasa-sedac-anthromes-v2",
    label: "Anthropogenic Biomes of the World, Version 2",
    publisher: "NASA SEDAC",
    url: "https://www.earthdata.nasa.gov/data/catalog/sedac-ciesin-sedac-anthromes-v2-1700-2.0",
    accessed: "2026-05-13",
    note:
      "Global modeled anthrome classes for 1700, 1800, 1900, and 2000, openly shared through NASA Earthdata."
  },
  nasaIslscpHistoricLandcover: {
    id: "nasa-ornl-islscp-historic-landcover",
    label: "ISLSCP II Historical Land Cover and Land Use, 1700-1990",
    publisher: "NASA ORNL DAAC",
    url: "https://daac.ornl.gov/cgi-bin/dsviewer.pl?ds_id=967",
    accessed: "2026-05-13",
    note:
      "Open NASA Earthdata historical land-use estimates derived from HYDE for global change modeling."
  },
  hydeHistory: {
    id: "hyde-history-database",
    label: "HYDE History Database of the Global Environment",
    publisher: "PBL Netherlands Environmental Assessment Agency / Utrecht University",
    url: "https://www.pbl.nl/en/hyde-history-database-of-the-global-environment",
    accessed: "2026-05-13",
    note:
      "Historical gridded population, built-up area, cropland, pasture, and land-use reconstruction source."
  },
  noaa20cr: {
    id: "noaa-20cr-v3",
    label: "NOAA-CIRES-DOE Twentieth Century Reanalysis v3",
    publisher: "NOAA Physical Sciences Laboratory",
    url: "https://psl.noaa.gov/data/20thC_Rean/index.html",
    accessed: "2026-05-13",
    note:
      "Global historical weather reconstruction; v3 provides 8-times-daily estimates on about 75 km grids from 1836-2015."
  },
  noaaErsst: {
    id: "noaa-ersst-v5",
    label: "Extended Reconstructed Sea Surface Temperature",
    publisher: "NOAA National Centers for Environmental Information",
    url: "https://www.ncei.noaa.gov/products/extended-reconstructed-sst",
    accessed: "2026-05-13",
    note:
      "Global monthly 2-degree sea-surface temperature reconstruction from January 1854 to present."
  },
  noaaIcoads: {
    id: "noaa-icoads",
    label: "International Comprehensive Ocean-Atmosphere Data Set",
    publisher: "NOAA National Centers for Environmental Information",
    url: "https://www.ncei.noaa.gov/products/international-comprehensive-ocean-atmosphere-data-set",
    accessed: "2026-05-13",
    note:
      "Marine weather observations from 1662-present with monthly summaries from 1800 in later releases."
  },
  nasaGistemp: {
    id: "nasa-gistemp-v4",
    label: "GISS Surface Temperature Analysis v4",
    publisher: "NASA Goddard Institute for Space Studies",
    url: "https://data.giss.nasa.gov/gistemp/",
    accessed: "2026-05-13",
    note:
      "NASA global surface temperature analysis combining NOAA station and ERSST inputs; gridded products are available at 2-degree resolution."
  },
  nasaSipleCo2: {
    id: "nasa-siple-station-ice-core-co2",
    label: "Historic Carbon Dioxide Data from Siple Station Ice Core",
    publisher: "NASA eClips",
    url: "https://assets.science.nasa.gov/content/dam/science/cds/eclips/assets/documents/educator-guide-real-world-what-causes-global-climate-change.pdf",
    accessed: "2026-05-13",
    note:
      "NASA education table sourced to CDIAC with historic ice-core CO2 values from 1744-1943."
  },
  noaaEtopo: {
    id: "noaa-etopo-2022",
    label: "ETOPO 2022 Global Relief Model",
    publisher: "NOAA National Centers for Environmental Information",
    url: "https://www.ncei.noaa.gov/products/etopo-global-relief-model",
    accessed: "2026-05-13",
    note: "Global relief source for topographic and bathymetric shading."
  },
  gebcoBathymetry: {
    id: "gebco-global-bathymetry",
    label: "GEBCO gridded bathymetry data",
    publisher: "General Bathymetric Chart of the Oceans",
    url: "https://www.gebco.net/data-products/gridded-bathymetry-data",
    accessed: "2026-05-13",
    note: "Primary global ocean bathymetry and seafloor relief source."
  },
  esaWorldCover: {
    id: "esa-worldcover",
    label: "ESA WorldCover global land cover",
    publisher: "European Space Agency",
    url: "https://esa-worldcover.org/en/data-access",
    accessed: "2026-05-13",
    note:
      "Open land-cover source for vegetation, bare land, built-up, snow/ice, and water masks."
  },
  humanFootprint: {
    id: "global-human-footprint",
    label: "Annual global terrestrial Human Footprint dataset",
    publisher: "Scientific Data / figshare",
    url: "https://www.nature.com/articles/s41597-022-01284-8",
    accessed: "2026-05-13",
    note:
      "Public human-pressure dataset used as a derived evidence layer for low-human-footprint wild-space geography."
  },
  protectedPlanet: {
    id: "protected-planet-wdpa",
    label: "Protected Planet / WDPA protected and conserved areas",
    publisher: "UNEP-WCMC and IUCN",
    url: "https://www.protectedplanet.net/",
    accessed: "2026-05-13",
    note:
      "Protected-area source used only as licensed evidence context, not as a bundled raw polygon download."
  },
  unSalb: {
    id: "un-salb",
    label: "Second Administrative Level Boundaries",
    publisher: "United Nations Geospatial",
    url: "https://salb.un.org/en",
    accessed: "2026-05-13",
    note: "Authoritative boundary cross-check source where available."
  },
  pmtiles: {
    id: "pmtiles",
    label: "PMTiles archive format",
    publisher: "Protomaps",
    url: "https://docs.protomaps.com/pmtiles/",
    accessed: "2026-05-13",
    note: "Range-request-friendly tile archive format for static vector/raster delivery."
  },
  unctadMaritimeTransport: {
    id: "unctad-review-maritime-transport",
    label: "Review of Maritime Transport",
    publisher: "UN Trade and Development",
    url: "https://unctad.org/RMT",
    accessed: "2026-05-13",
    note:
      "Flagship maritime transport source for seaborne trade, ports, shipping networks, and route context."
  },
  wtoTradeStats: {
    id: "wto-world-trade-statistical-review",
    label: "World Trade Statistical Review",
    publisher: "World Trade Organization",
    url: "https://www.wto.org/english/res_e/statis_e/wts_e.htm",
    accessed: "2026-05-13",
    note: "Global merchandise and services trade context for modern trade-route intensity."
  },
  worldBankWits: {
    id: "world-bank-wits",
    label: "World Integrated Trade Solution",
    publisher: "World Bank",
    url: "https://wits.worldbank.org/",
    accessed: "2026-05-13",
    note:
      "Trade-data portal integrating UN COMTRADE, UNCTAD, WTO, and related trade datasets."
  },
  oecdContainerTransport: {
    id: "oecd-container-transport",
    label: "Container transport indicator",
    publisher: "OECD / International Transport Forum",
    url: "https://www.oecd.org/en/data/indicators/container-transport.html",
    accessed: "2026-05-13",
    note: "Container transport source for late twentieth-century and current shipping-route context."
  },
  teleGeographySubmarineCableMap: {
    id: "telegeography-submarine-cable-map",
    label: "Submarine Cable Map",
    publisher: "TeleGeography",
    url: "https://www.submarinecablemap.com/",
    accessed: "2026-05-13",
    note:
      "Public map reference for present-day submarine cable corridors; used only for route-context metadata."
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
