import { sourceCatalog } from "../data/sources";

export type EarthBasemapId = "satellite" | "topographic" | "political";

export type EarthBasemapDescriptor = {
  id: EarthBasemapId;
  label: string;
  summary: string;
  sourceIds: string[];
  attribution: string;
  pipeline: string[];
};

export type EarthDomainWorkstream = {
  id:
    | "africa"
    | "antarctica"
    | "asia"
    | "europe"
    | "north-america"
    | "south-america"
    | "oceania-australia"
    | "oceans-islands";
  label: string;
  focus: string;
  sourceIds: string[];
  requiredLayers: string[];
  qaChecks: string[];
};

const sourceId = (key: keyof typeof sourceCatalog) => sourceCatalog[key].id;

export const earthBasemapDescriptors: EarthBasemapDescriptor[] = [
  {
    id: "satellite",
    label: "Earth from Space",
    summary:
      "A static-first global satellite view seeded by NASA Blue Marble and ready for future cloud-free mosaics.",
    sourceIds: [sourceId("nasaBlueMarble"), sourceId("naturalEarth")],
    attribution: "NASA Blue Marble Next Generation; Natural Earth public-domain vectors.",
    pipeline: [
      "Tile NASA Blue Marble into compressed WebP or AVIF pyramids.",
      "Add Natural Earth coastlines and label anchors above the imagery.",
      "Keep optional NASA GIBS live imagery outside the bundled default path."
    ]
  },
  {
    id: "topographic",
    label: "2D Topographic",
    summary:
      "A relief-first 2D map mode using open terrain, bathymetry, water, and land-cover layers.",
    sourceIds: [
      sourceId("noaaEtopo"),
      sourceId("gebcoBathymetry"),
      sourceId("esaWorldCover"),
      sourceId("naturalEarth")
    ],
    attribution: "NOAA ETOPO, GEBCO, ESA WorldCover, and Natural Earth.",
    pipeline: [
      "Generate shaded relief and hillshade rasters from ETOPO and GEBCO.",
      "Pre-aggregate ESA WorldCover into low-zoom biome and settlement masks.",
      "Render terrain, water, coastlines, labels, and story overlays from the same manifest."
    ]
  },
  {
    id: "political",
    label: "Countries & Borders",
    summary:
      "A boundary-forward atlas mode for countries, coastlines, disputed-area metadata, and label QA.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("pmtiles")],
    attribution: "Natural Earth, UN SALB where available, and self-hosted PMTiles outputs.",
    pipeline: [
      "Normalize worldview-sensitive boundaries into explicit source policies.",
      "Generate country, coastline, river, lake, and populated-place vector tiles.",
      "Expose disputed or cross-checked regions as metadata, not hidden assumptions."
    ]
  }
];

export const earthDomainWorkstreams: EarthDomainWorkstream[] = [
  {
    id: "africa",
    label: "Africa",
    focus:
      "Countries, coastlines, Sahara/Sahel transitions, major rivers, mountains, islands, and protected areas.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("esaWorldCover")],
    requiredLayers: ["admin", "coastline", "hydrology", "biomes", "terrain", "cities"],
    qaChecks: [
      "Western Sahara and Somaliland policy",
      "Madagascar and Indian Ocean islands",
      "Nile/Congo/Niger/Zambezi continuity"
    ]
  },
  {
    id: "antarctica",
    label: "Antarctica",
    focus:
      "Ice coastline, shelves, grounding lines, polar topography, research stations, and sea ice context.",
    sourceIds: [sourceId("gebcoBathymetry"), sourceId("noaaEtopo")],
    requiredLayers: ["ice-coastline", "terrain", "bathymetry", "sea-ice", "stations"],
    qaChecks: ["EPSG:3031 normalization", "ice shelf topology", "seasonal imagery date tagging"]
  },
  {
    id: "asia",
    label: "Asia",
    focus:
      "Dense political geography, Himalaya/Tibetan Plateau, monsoon imagery, archipelagos, and river basins.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("esaWorldCover")],
    requiredLayers: ["admin", "coastline", "mountains", "hydrology", "cities", "islands"],
    qaChecks: [
      "Kashmir/Taiwan/South China Sea metadata",
      "Himalaya DEM artifact review",
      "Indonesia/Japan/Philippines coastline retention"
    ]
  },
  {
    id: "europe",
    label: "Europe",
    focus:
      "High-density borders, labels, mountains, fjords, archipelagos, rivers, and protected-area overlap.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("esaWorldCover")],
    requiredLayers: ["admin", "coastline", "hydrology", "terrain", "labels", "protected-areas"],
    qaChecks: ["Microstate visibility", "Alps/Carpathians/Scandes alignment", "overseas territory policy"]
  },
  {
    id: "north-america",
    label: "North America",
    focus:
      "U.S./Canada/Mexico national detail, Greenland/Arctic handling, Great Lakes, Caribbean, and Central America.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("gebcoBathymetry")],
    requiredLayers: ["admin", "coastline", "great-lakes", "terrain", "arctic", "cities"],
    qaChecks: [
      "Greenland as a separate reporting unit",
      "Great Lakes bathymetry sign convention",
      "Alaska/Aleutians antimeridian"
    ]
  },
  {
    id: "south-america",
    label: "South America",
    focus:
      "Andes, Amazon/Orinoco/Parana systems, Patagonia, deserts, pampas, and disputed island policy.",
    sourceIds: [sourceId("naturalEarth"), sourceId("unSalb"), sourceId("esaWorldCover")],
    requiredLayers: ["admin", "coastline", "terrain", "hydrology", "biomes", "cities"],
    qaChecks: ["Amazon drains east", "Andes stay continuous", "Falkland/Malvinas and Essequibo metadata"]
  },
  {
    id: "oceania-australia",
    label: "Oceania & Australia",
    focus:
      "Australia, New Zealand, Papua New Guinea, Pacific island nations, atolls, reefs, and maritime context.",
    sourceIds: [sourceId("naturalEarth"), sourceId("gebcoBathymetry"), sourceId("esaWorldCover")],
    requiredLayers: ["admin", "coastline", "reefs", "bathymetry", "terrain", "islands"],
    qaChecks: ["Antimeridian-safe atolls", "Great Barrier Reef reconciliation", "low-island DEM risk"]
  },
  {
    id: "oceans-islands",
    label: "Oceans & Offshore Islands",
    focus:
      "Bathymetry, reefs, currents, sea ice, offshore islands, ocean labels, and optional EEZ context.",
    sourceIds: [sourceId("gebcoBathymetry"), sourceId("noaaEtopo"), sourceId("naturalEarth")],
    requiredLayers: ["bathymetry", "coastline", "islands", "reefs", "sea-ice", "labels"],
    qaChecks: [
      "GEBCO confidence review",
      "remote island label coverage",
      "EEZ layers marked non-navigational"
    ]
  }
];

export const staticEarthManifest = {
  id: "static-earth-open-v1",
  label: "Static Open Earth Atlas",
  basemaps: earthBasemapDescriptors,
  workstreams: earthDomainWorkstreams
} as const;
