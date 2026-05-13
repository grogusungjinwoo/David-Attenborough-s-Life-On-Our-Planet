import type { TimelineAnchor } from "../domain/types";
import { sourceCatalog } from "./sources";

const attenboroughMetricRefs = {
  worldPopulationBillion: [sourceCatalog.unitedNationsPopulation],
  atmosphericCarbonPpm: [sourceCatalog.noaaTrends],
  remainingWildSpacePercent: [sourceCatalog.attenboroughExcerpt]
} satisfies TimelineAnchor["metricSourceRefs"];

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
      sourceCatalog.noaaTrends,
      sourceCatalog.attenboroughExcerpt
    ],
    metricSourceRefs: attenboroughMetricRefs
  },
  {
    id: "attenborough-childhood",
    year: 1937,
    title: "A child meets a still-wild world",
    summary:
      "Attenborough's lifetime opens with wilderness still covering most of Earth, while population and carbon begin their sharp climb.",
    metrics: {
      worldPopulationBillion: 2.3,
      atmosphericCarbonPpm: 280,
      remainingWildSpacePercent: 66
    },
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.unitedNationsPopulation,
      sourceCatalog.noaaTrends
    ],
    metricSourceRefs: attenboroughMetricRefs
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
