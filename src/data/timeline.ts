import type { TimelineAnchor } from "../domain/types";
import { sourceCatalog } from "./sources";

type EarthSurfaceInput = {
  forestGreenCoveragePercent: number;
  cropPastureCoveragePercent: number;
  vegetationIndex: number;
  oceanHeatIndex: number;
  weatherEnergyIndex: number;
  humanExposureIndex: number;
  nightLightIndex: number;
  cloudOpacity: number;
  confidence: NonNullable<TimelineAnchor["earthSurface"]>["confidence"];
  summary: string;
};

const historicalEarthRefs = [
  sourceCatalog.noaaHistoricalLandCover,
  sourceCatalog.nasaAnthromes,
  sourceCatalog.nasaIslscpHistoricLandcover,
  sourceCatalog.hydeHistory,
  sourceCatalog.naturalEarth,
  sourceCatalog.nasaBlueMarble
];

const earlyWeatherRefs = [
  sourceCatalog.noaaIcoads,
  sourceCatalog.noaa20cr,
  sourceCatalog.noaaErsst,
  sourceCatalog.nasaGistemp
];

const attenboroughMetricRefs = {
  worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
  atmosphericCarbonPpm: [sourceCatalog.noaaTrends, sourceCatalog.nasaSipleCo2],
  remainingWildSpacePercent: [sourceCatalog.attenboroughExcerpt]
} satisfies TimelineAnchor["metricSourceRefs"];

function earthSurface(input: EarthSurfaceInput): NonNullable<TimelineAnchor["earthSurface"]> {
  return {
    ...input,
    projection: "equirectangular-wgs84",
    sourceRefs: [...historicalEarthRefs, ...earlyWeatherRefs]
  };
}

export const timelineAnchors: TimelineAnchor[] = [
  {
    id: "pre-industrial-threshold",
    year: 1770,
    title: "Before the great acceleration",
    summary:
      "Most land and ocean systems remain outside industrial pressure, setting the baseline for the story that follows.",
    metrics: {
      worldPopulationBillion: 0.79,
      atmosphericCarbonPpm: 280,
      remainingWildSpacePercent: 90
    },
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.nasaSipleCo2,
      sourceCatalog.attenboroughExcerpt,
      ...historicalEarthRefs,
      sourceCatalog.noaaIcoads
    ],
    metricSourceRefs: attenboroughMetricRefs,
    earthSurface: earthSurface({
      forestGreenCoveragePercent: 54,
      cropPastureCoveragePercent: 8,
      vegetationIndex: 0.91,
      oceanHeatIndex: 0.08,
      weatherEnergyIndex: 0.12,
      humanExposureIndex: 0.09,
      nightLightIndex: 0.01,
      cloudOpacity: 0.2,
      confidence: "reconstructed",
      summary:
        "Land cover is reconstructed from HYDE-family and NASA/NOAA historical land-use layers; weather is sparse ship-log and ocean observation context."
    })
  },
  {
    id: "early-industrial-coasts",
    year: 1800,
    title: "Ports and fields widen",
    summary:
      "Agriculture, shipping, and early industrial cities expand, but most global land-cover change remains regional and reconstructed.",
    metrics: {
      worldPopulationBillion: 0.99,
      atmosphericCarbonPpm: 283,
      remainingWildSpacePercent: 88
    },
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.nasaSipleCo2,
      ...historicalEarthRefs,
      sourceCatalog.noaaIcoads
    ],
    metricSourceRefs: {
      ...attenboroughMetricRefs,
      remainingWildSpacePercent: [
        sourceCatalog.attenboroughExcerpt,
        sourceCatalog.noaaHistoricalLandCover,
        sourceCatalog.hydeHistory
      ]
    },
    earthSurface: earthSurface({
      forestGreenCoveragePercent: 52,
      cropPastureCoveragePercent: 9.5,
      vegetationIndex: 0.88,
      oceanHeatIndex: 0.1,
      weatherEnergyIndex: 0.14,
      humanExposureIndex: 0.12,
      nightLightIndex: 0.015,
      cloudOpacity: 0.21,
      confidence: "reconstructed",
      summary:
        "Anthrome and land-use reconstructions support the agriculture tint; weather remains sparse and observation-biased."
    })
  },
  {
    id: "industrial-archive-line",
    year: 1850,
    title: "The archive gains weather",
    summary:
      "Global land-use reconstructions can be paired with early reanalysis and sea-surface records, so oceans and weather gain a coarser but data-backed transition.",
    metrics: {
      worldPopulationBillion: 1.26,
      atmosphericCarbonPpm: 285,
      remainingWildSpacePercent: 82
    },
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.nasaSipleCo2,
      ...historicalEarthRefs,
      ...earlyWeatherRefs
    ],
    metricSourceRefs: {
      ...attenboroughMetricRefs,
      remainingWildSpacePercent: [
        sourceCatalog.noaaHistoricalLandCover,
        sourceCatalog.nasaIslscpHistoricLandcover,
        sourceCatalog.hydeHistory
      ]
    },
    earthSurface: earthSurface({
      forestGreenCoveragePercent: 49,
      cropPastureCoveragePercent: 12,
      vegetationIndex: 0.82,
      oceanHeatIndex: 0.18,
      weatherEnergyIndex: 0.22,
      humanExposureIndex: 0.18,
      nightLightIndex: 0.025,
      cloudOpacity: 0.23,
      confidence: "instrumental",
      summary:
        "Land-use estimates remain reconstructed; NOAA 20CR, ERSST, GISTEMP-adjacent inputs, and ICOADS make weather and ocean tinting plausible after the mid-1800s."
    })
  },
  {
    id: "machine-age-earth",
    year: 1900,
    title: "Machine-age Earth becomes gridded",
    summary:
      "By 1900, reanalysis and temperature products can support stronger weather, ocean, and human footprint changes over a still-modern static basemap.",
    metrics: {
      worldPopulationBillion: 1.65,
      atmosphericCarbonPpm: 296,
      remainingWildSpacePercent: 74
    },
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.nasaSipleCo2,
      ...historicalEarthRefs,
      ...earlyWeatherRefs
    ],
    metricSourceRefs: {
      worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
      atmosphericCarbonPpm: [sourceCatalog.nasaSipleCo2, sourceCatalog.noaaTrends],
      remainingWildSpacePercent: [
        sourceCatalog.noaaHistoricalLandCover,
        sourceCatalog.nasaAnthromes,
        sourceCatalog.hydeHistory
      ]
    },
    earthSurface: earthSurface({
      forestGreenCoveragePercent: 44,
      cropPastureCoveragePercent: 16,
      vegetationIndex: 0.73,
      oceanHeatIndex: 0.32,
      weatherEnergyIndex: 0.38,
      humanExposureIndex: 0.29,
      nightLightIndex: 0.08,
      cloudOpacity: 0.26,
      confidence: "instrumental",
      summary:
        "Anthrome classes, HYDE-style land-use, 20CR, ERSST, and GISTEMP support a visibly warmer and more human-shaped turn of the century."
    })
  },
  {
    id: "attenborough-childhood",
    year: 1937,
    title: "A child meets a still-wild world",
    summary:
      "Attenborough's lifetime opens with wilderness still covering most of Earth, while population and carbon begin their sharp climb.",
    metrics: {
      worldPopulationBillion: 2.3,
      atmosphericCarbonPpm: 310,
      remainingWildSpacePercent: 66
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.nasaSipleCo2,
      ...historicalEarthRefs,
      ...earlyWeatherRefs
    ],
    metricSourceRefs: {
      worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
      atmosphericCarbonPpm: [sourceCatalog.nasaSipleCo2, sourceCatalog.noaaTrends],
      remainingWildSpacePercent: [
        sourceCatalog.attenboroughExcerpt,
        sourceCatalog.noaaHistoricalLandCover,
        sourceCatalog.hydeHistory
      ]
    },
    earthSurface: earthSurface({
      forestGreenCoveragePercent: 39,
      cropPastureCoveragePercent: 20,
      vegetationIndex: 0.66,
      oceanHeatIndex: 0.45,
      weatherEnergyIndex: 0.48,
      humanExposureIndex: 0.39,
      nightLightIndex: 0.16,
      cloudOpacity: 0.29,
      confidence: "instrumental",
      summary:
        "The childhood anchor blends Attenborough's wilderness metric with NASA/NOAA/HYDE land-use reconstruction and instrument-era weather products."
    })
  },
  {
    id: "television-age",
    year: 1954,
    title: "The televised planet arrives",
    summary:
      "Post-war growth brings distant ecosystems into living rooms while industrial carbon and land conversion accelerate.",
    metrics: {
      worldPopulationBillion: 2.7,
      atmosphericCarbonPpm: 310,
      remainingWildSpacePercent: 64
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.noaaTrends
    ],
    metricSourceRefs: attenboroughMetricRefs
  },
  {
    id: "globalisation-and-loss",
    year: 1978,
    title: "Global systems tighten",
    summary:
      "Agriculture, transport, fishing, and energy demand press into the biosphere as monitored wildlife begins a long decline.",
    metrics: {
      worldPopulationBillion: 4.3,
      atmosphericCarbonPpm: 335,
      remainingWildSpacePercent: 55
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.wwfLivingPlanet,
      sourceCatalog.noaaTrends
    ],
    metricSourceRefs: {
      ...attenboroughMetricRefs,
      speciesAtRiskCount: [sourceCatalog.wwfLivingPlanet]
    }
  },
  {
    id: "digital-earth",
    year: 1997,
    title: "A connected Earth, a fragmented wild",
    summary:
      "Digital maps make the whole planet visible, but habitats become smaller, warmer, and more isolated.",
    metrics: {
      worldPopulationBillion: 5.9,
      atmosphericCarbonPpm: 360,
      remainingWildSpacePercent: 46
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.noaaTrends
    ],
    metricSourceRefs: attenboroughMetricRefs
  },
  {
    id: "witness-statement",
    year: 2020,
    title: "The witness statement",
    summary:
      "The living world enters a critical decade: wilderness is much reduced, carbon is above 400 ppm, and biodiversity risk is global.",
    metrics: {
      worldPopulationBillion: 7.8,
      atmosphericCarbonPpm: 415,
      remainingWildSpacePercent: 35,
      speciesAtRiskCount: 1_000_000
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.ipbesAssessment,
      sourceCatalog.noaaCarbon,
      sourceCatalog.unitedNationsPopulation
    ],
    metricSourceRefs: {
      worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
      atmosphericCarbonPpm: [sourceCatalog.noaaCarbon],
      remainingWildSpacePercent: [sourceCatalog.attenboroughExcerpt],
      speciesAtRiskCount: [sourceCatalog.ipbesAssessment]
    }
  },
  {
    id: "current-briefing",
    year: 2024,
    title: "The current briefing",
    summary:
      "Population is about 8.2 billion, carbon dioxide reaches another record, and conservation data keeps the pressure visible.",
    metrics: {
      worldPopulationBillion: 8.2,
      atmosphericCarbonPpm: 422.8,
      remainingWildSpacePercent: 34,
      speciesAtRiskCount: 1_000_000
    },
    sourceRefs: [
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.noaaCarbon,
      sourceCatalog.iucnSummary,
      sourceCatalog.wwfLivingPlanet
    ],
    metricSourceRefs: {
      worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
      atmosphericCarbonPpm: [sourceCatalog.noaaCarbon],
      remainingWildSpacePercent: [sourceCatalog.wwfLivingPlanet],
      speciesAtRiskCount: [sourceCatalog.iucnSummary, sourceCatalog.ipbesAssessment]
    }
  }
];
