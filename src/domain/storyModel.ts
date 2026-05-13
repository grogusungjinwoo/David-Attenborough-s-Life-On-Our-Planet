export type SourceFamily = "manuscript" | "public-data" | "reference-repo";

export type SourceRecord = {
  id: string;
  family: SourceFamily;
  label: string;
  href?: string;
  note: string;
};

export type SourceRef = {
  sourceId: string;
  pdfPage?: number;
  printedPage?: number;
  detail?: string;
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
  locationLabel: string;
  summary: string;
  metrics: MetricSnapshot;
  sourceRefs: SourceRef[];
};

export type LayerState = {
  wildSpace: boolean;
  population: boolean;
  species: boolean;
  zoos: boolean;
  climate: boolean;
};

export type WorldSnapshot = {
  year: number;
  activeAnchor: TimelineAnchor;
  metrics: MetricSnapshot;
  layers: LayerState;
  proceduralDensity: {
    trees: number;
    buildings: number;
    waterStress: number;
    animalPresence: number;
  };
};

export type SpeciesStatus = "stable" | "threatened" | "endangered" | "extinct";

export type SpeciesRecord = {
  id: string;
  name: string;
  status: SpeciesStatus;
  regionIds: string[];
  visibleFromYear: number;
  summary: string;
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

export type SourceIntegrityReport = {
  unknownSourceRefs: string[];
  recordsWithoutSources: string[];
};

const EARTH_LAND_ACRES = 36_800_000_000;

export const sources: SourceRecord[] = [
  {
    id: "attenborough-excerpt",
    family: "manuscript",
    label: "A Life on Our Planet local PDF excerpt",
    note: "Local 27-page excerpt supplied in Downloads; used for the 1937 witness anchor and early-life framing."
  },
  {
    id: "our-world-in-data-population",
    family: "public-data",
    label: "Our World in Data population dataset",
    href: "https://ourworldindata.org/world-population-growth",
    note: "Public population history reference used for later timeline anchors."
  },
  {
    id: "noaa-global-monitoring-lab",
    family: "public-data",
    label: "NOAA Global Monitoring Laboratory carbon dioxide trends",
    href: "https://gml.noaa.gov/ccgg/trends/",
    note: "Public atmospheric carbon dioxide reference for recent anchors."
  },
  {
    id: "attenborough-film-metrics",
    family: "public-data",
    label: "David Attenborough: A Life on Our Planet published timeline metrics",
    href: "https://www.ourplanet.com/en/video/david-attenborough-a-life-on-our-planet",
    note: "Public presentation of the documentary's population, carbon, and remaining wilderness metric sequence."
  },
  {
    id: "iucn-red-list",
    family: "public-data",
    label: "IUCN Red List",
    href: "https://www.iucnredlist.org/",
    note: "Conservation status reference for species examples."
  },
  {
    id: "london-zoo",
    family: "public-data",
    label: "ZSL London Zoo history",
    href: "https://www.zsl.org/zsl-london-zoo",
    note: "Historic zoo location reference."
  },
  {
    id: "reference-repos",
    family: "reference-repo",
    label: "NeuralGCM, Aurora, and PyPSA-Earth reference repositories",
    href: "https://github.com/neuralgcm/neuralgcm",
    note: "Used as conceptual inspiration for future climate, forecasting, and energy overlays."
  }
];

export const timelineAnchors: TimelineAnchor[] = [
  {
    id: "witness-1937",
    year: 1937,
    title: "Leicester: the witness begins",
    locationLabel: "Leicester, England",
    summary:
      "An eleven-year-old David Attenborough rides beyond the city into fields that still feel limitless. The baseline is already changing, but the loss is easy to miss.",
    metrics: metrics(2.3, 280, 66, 1_000, 3),
    sourceRefs: [
      {
        sourceId: "attenborough-excerpt",
        pdfPage: 20,
        printedPage: 13,
        detail: "1937 population, carbon, and remaining wilderness snapshot."
      }
    ]
  },
  {
    id: "expedition-1954",
    year: 1954,
    title: "Broadcast journeys enter the wild",
    locationLabel: "Global expedition routes",
    summary:
      "Television carries distant ecosystems into living rooms while post-war growth accelerates demand for land, food, and energy.",
    metrics: metrics(2.7, 310, 64, 3_500, 5),
    sourceRefs: [
      { sourceId: "attenborough-film-metrics", detail: "Published documentary metric sequence." },
      { sourceId: "our-world-in-data-population", detail: "Population cross-check." }
    ]
  },
  {
    id: "population-1960",
    year: 1960,
    title: "The human curve steepens",
    locationLabel: "Global",
    summary:
      "Humanity passes roughly three billion people. Cities expand, roads stitch continents together, and untouched habitat begins to fragment visibly.",
    metrics: metrics(3.0, 315, 62, 6_000, 7),
    sourceRefs: [
      { sourceId: "attenborough-film-metrics", detail: "Published documentary metric sequence." },
      { sourceId: "noaa-global-monitoring-lab", detail: "CO2 trend reference." }
    ]
  },
  {
    id: "systems-1978",
    year: 1978,
    title: "The living planet becomes measurable",
    locationLabel: "Forests, oceans, grasslands",
    summary:
      "The planet's systems are now watched from satellites and research stations. The pattern is unmistakable: richer human systems, poorer wild systems.",
    metrics: metrics(4.3, 335, 55, 14_000, 18),
    sourceRefs: [
      { sourceId: "attenborough-film-metrics", detail: "Published documentary metric sequence." },
      { sourceId: "reference-repos", detail: "Future model overlay inspiration only." }
    ]
  },
  {
    id: "pressure-1997",
    year: 1997,
    title: "Pressure becomes planetary",
    locationLabel: "Global biodiversity hotspots",
    summary:
      "Nearly six billion people share a world where habitat conversion, overfishing, pollution, and carbon accumulation act together.",
    metrics: metrics(5.9, 360, 46, 22_000, 35),
    sourceRefs: [
      { sourceId: "attenborough-film-metrics", detail: "Published documentary metric sequence." },
      { sourceId: "iucn-red-list", detail: "Conservation-status context." }
    ]
  },
  {
    id: "witness-2020",
    year: 2020,
    title: "The witness statement becomes a warning",
    locationLabel: "A shared planet",
    summary:
      "The story turns from memory to choice: rebuild the living world, or keep simplifying the systems that keep people alive.",
    metrics: metrics(7.8, 415, 35, 37_400, 900),
    sourceRefs: [
      { sourceId: "attenborough-film-metrics", detail: "Published documentary metric sequence." },
      { sourceId: "noaa-global-monitoring-lab", detail: "CO2 trend reference." },
      { sourceId: "iucn-red-list", detail: "Conservation-status context." }
    ]
  }
];

export const animalRepository: SpeciesRecord[] = [
  {
    id: "mountain-gorilla",
    name: "Mountain gorilla",
    status: "endangered",
    regionIds: ["central-africa"],
    visibleFromYear: 1978,
    summary: "A recovery symbol still dependent on protected habitat and long-term conservation.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  },
  {
    id: "northern-white-rhinoceros",
    name: "Northern white rhinoceros",
    status: "endangered",
    regionIds: ["central-africa"],
    visibleFromYear: 1997,
    summary: "A living edge case for extinction, represented as a stark population-fragility marker.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  },
  {
    id: "amur-leopard",
    name: "Amur leopard",
    status: "endangered",
    regionIds: ["east-asia"],
    visibleFromYear: 1997,
    summary: "A forest-fragmentation signal for the northern temperate biome.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  },
  {
    id: "hawksbill-turtle",
    name: "Hawksbill turtle",
    status: "threatened",
    regionIds: ["tropical-oceans"],
    visibleFromYear: 1978,
    summary: "A reef-linked species that ties ocean health, trade, and coastal ecosystems together.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  },
  {
    id: "golden-toad",
    name: "Golden toad",
    status: "extinct",
    regionIds: ["central-america"],
    visibleFromYear: 1997,
    summary: "A compact extinction marker for amphibian vulnerability and cloud-forest disruption.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  },
  {
    id: "bengal-tiger",
    name: "Bengal tiger",
    status: "endangered",
    regionIds: ["south-asia"],
    visibleFromYear: 1960,
    summary: "A charismatic predator showing how wild corridors shrink as people and farms expand.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Species status reference." }]
  }
];

export const historicZooSites: ZooSite[] = [
  {
    id: "london-zoo",
    name: "London Zoo",
    lat: 51.5353,
    lon: -0.1534,
    openedYear: 1828,
    notes: "A historic institution tied to public natural-history education in Britain.",
    sourceRefs: [{ sourceId: "london-zoo", detail: "Institution history and location." }]
  },
  {
    id: "bronx-zoo",
    name: "Bronx Zoo",
    lat: 40.8506,
    lon: -73.8769,
    openedYear: 1899,
    notes: "A major conservation and public-education site in New York.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Conservation context." }]
  },
  {
    id: "berlin-zoo",
    name: "Berlin Zoological Garden",
    lat: 52.5086,
    lon: 13.3377,
    openedYear: 1844,
    notes: "One of Europe's long-running urban zoo sites.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Conservation context." }]
  },
  {
    id: "singapore-zoo",
    name: "Singapore Zoo",
    lat: 1.4043,
    lon: 103.793,
    openedYear: 1973,
    notes: "A tropical public-education node near Southeast Asian biodiversity hotspots.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Conservation context." }]
  },
  {
    id: "san-diego-zoo",
    name: "San Diego Zoo",
    lat: 32.7353,
    lon: -117.149,
    openedYear: 1916,
    notes: "A conservation institution with global species-program associations.",
    sourceRefs: [{ sourceId: "iucn-red-list", detail: "Conservation context." }]
  }
];

export function listSources() {
  return sources;
}

export function getTimelineAnchorByYear(year: number) {
  return nearestAnchor(year);
}

export function getSpeciesForYear(year: number) {
  return animalRepository.filter((species) => species.visibleFromYear <= year);
}

export function getWorldSnapshot(year: number): WorldSnapshot {
  const activeAnchor = nearestAnchor(year);
  const metrics = interpolateMetrics(year);
  const wildSpaceRatio = (metrics.remainingWildSpacePercent ?? 0) / 100;
  const populationRatio = Math.min((metrics.worldPopulationBillion ?? 0) / 8, 1);
  const carbonRatio = Math.min(((metrics.atmosphericCarbonPpm ?? 280) - 280) / 150, 1);

  return {
    year,
    activeAnchor,
    metrics,
    layers: {
      wildSpace: true,
      population: true,
      species: true,
      zoos: true,
      climate: true
    },
    proceduralDensity: {
      trees: round(clamp(wildSpaceRatio * 0.95 + 0.03)),
      buildings: round(clamp(populationRatio * 0.86)),
      waterStress: round(clamp(carbonRatio * 0.75 + populationRatio * 0.15)),
      animalPresence: round(clamp(wildSpaceRatio * 0.9))
    }
  };
}

export function sourceIntegrityReport(): SourceIntegrityReport {
  const sourceIds = new Set(sources.map((source) => source.id));
  const unknownSourceRefs = new Set<string>();
  const recordsWithoutSources: string[] = [];

  const inspect = (recordId: string, refs: SourceRef[]) => {
    if (refs.length === 0) {
      recordsWithoutSources.push(recordId);
    }

    for (const ref of refs) {
      if (!sourceIds.has(ref.sourceId)) {
        unknownSourceRefs.add(`${recordId}:${ref.sourceId}`);
      }
    }
  };

  for (const anchor of timelineAnchors) {
    inspect(anchor.id, anchor.sourceRefs);
  }

  for (const species of animalRepository) {
    inspect(species.id, species.sourceRefs);
  }

  for (const site of historicZooSites) {
    inspect(site.id, site.sourceRefs);
  }

  return {
    unknownSourceRefs: [...unknownSourceRefs],
    recordsWithoutSources
  };
}

function metrics(
  worldPopulationBillion: number,
  atmosphericCarbonPpm: number,
  remainingWildSpacePercent: number,
  speciesAtRiskCount: number,
  extinctSpeciesCount: number
): MetricSnapshot {
  return {
    worldPopulationBillion,
    atmosphericCarbonPpm,
    remainingWildSpacePercent,
    wildSpaceAcres: Math.round(EARTH_LAND_ACRES * (remainingWildSpacePercent / 100)),
    speciesAtRiskCount,
    extinctSpeciesCount
  };
}

function nearestAnchor(year: number) {
  return timelineAnchors.reduce((nearest, anchor) =>
    Math.abs(anchor.year - year) < Math.abs(nearest.year - year) ? anchor : nearest
  );
}

function interpolateMetrics(year: number): MetricSnapshot {
  const first = timelineAnchors[0];
  const last = timelineAnchors[timelineAnchors.length - 1];

  if (year <= first.year) {
    return first.metrics;
  }

  if (year >= last.year) {
    return last.metrics;
  }

  const upperIndex = timelineAnchors.findIndex((anchor) => anchor.year >= year);
  const upper = timelineAnchors[upperIndex];
  const lower = timelineAnchors[upperIndex - 1];
  const progress = (year - lower.year) / (upper.year - lower.year);

  return {
    worldPopulationBillion: round(lerp(lower.metrics.worldPopulationBillion, upper.metrics.worldPopulationBillion, progress)),
    atmosphericCarbonPpm: Math.round(lerp(lower.metrics.atmosphericCarbonPpm, upper.metrics.atmosphericCarbonPpm, progress)),
    remainingWildSpacePercent: Math.round(
      lerp(lower.metrics.remainingWildSpacePercent, upper.metrics.remainingWildSpacePercent, progress)
    ),
    wildSpaceAcres: Math.round(
      EARTH_LAND_ACRES *
        (lerp(lower.metrics.remainingWildSpacePercent, upper.metrics.remainingWildSpacePercent, progress) /
          100)
    ),
    speciesAtRiskCount: Math.round(lerp(lower.metrics.speciesAtRiskCount, upper.metrics.speciesAtRiskCount, progress)),
    extinctSpeciesCount: Math.round(lerp(lower.metrics.extinctSpeciesCount, upper.metrics.extinctSpeciesCount, progress))
  };
}

function lerp(start = 0, end = 0, progress: number) {
  return start + (end - start) * progress;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
