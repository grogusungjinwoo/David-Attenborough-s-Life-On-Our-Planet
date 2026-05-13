import type { SpeciesRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

export const speciesRecords: SpeciesRecord[] = [
  {
    id: "bornean-orangutan",
    name: "Bornean orangutan",
    status: "endangered",
    regionIds: ["borneo"],
    summary:
      "A forest-dependent great ape used here to make habitat fragmentation tangible on the globe.",
    statusByYear: [
      {
        year: 1937,
        status: "stable",
        note: "Large forest ranges remain.",
        sourceRefs: [sourceCatalog.faoForests]
      },
      {
        year: 1997,
        status: "threatened",
        note: "Land-use pressure intensifies.",
        sourceRefs: [sourceCatalog.faoForests]
      },
      {
        year: 2024,
        status: "endangered",
        note: "Habitat loss remains a major pressure.",
        sourceRefs: [sourceCatalog.iucnSummary]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.faoForests]
  },
  {
    id: "black-rhinoceros",
    name: "Black rhinoceros",
    status: "endangered",
    regionIds: ["serengeti"],
    summary:
      "A conservation-recovery story that still carries severe poaching and habitat risk.",
    statusByYear: [
      {
        year: 1937,
        status: "stable",
        note: "Species still widespread in parts of Africa.",
        sourceRefs: [sourceCatalog.wwfLivingPlanet]
      },
      {
        year: 1978,
        status: "threatened",
        note: "Hunting pressure becomes visible.",
        sourceRefs: [sourceCatalog.wwfLivingPlanet]
      },
      {
        year: 2024,
        status: "endangered",
        note: "Conservation gains remain fragile.",
        sourceRefs: [sourceCatalog.iucnSummary]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.wwfLivingPlanet]
  },
  {
    id: "blue-whale",
    name: "Blue whale",
    status: "endangered",
    regionIds: ["north-atlantic"],
    summary:
      "A marine giant connecting industrial extraction history to modern recovery and ship-strike risk.",
    statusByYear: [
      {
        year: 1937,
        status: "threatened",
        note: "Industrial whaling has transformed abundance.",
        sourceRefs: [sourceCatalog.ipbesAssessment]
      },
      {
        year: 1978,
        status: "endangered",
        note: "International protections begin to matter.",
        sourceRefs: [sourceCatalog.ipbesAssessment]
      },
      {
        year: 2024,
        status: "endangered",
        note: "Recovery is uneven across ocean basins.",
        sourceRefs: [sourceCatalog.iucnSummary]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.ipbesAssessment]
  },
  {
    id: "golden-toad",
    name: "Golden toad",
    status: "extinct",
    regionIds: ["amazon-basin"],
    summary:
      "A small amphibian marker for the abruptness of localized extinction in a changing climate.",
    statusByYear: [
      {
        year: 1978,
        status: "stable",
        note: "Known from a narrow mountain range.",
        sourceRefs: [sourceCatalog.iucnSummary]
      },
      {
        year: 1997,
        status: "extinct",
        note: "No longer observed after the late 1980s.",
        sourceRefs: [sourceCatalog.iucnSummary]
      },
      {
        year: 2024,
        status: "extinct",
        note: "Extinction remains a biodiversity warning signal.",
        sourceRefs: [sourceCatalog.ipbesAssessment]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.ipbesAssessment]
  },
  {
    id: "polar-bear",
    name: "Polar bear",
    status: "threatened",
    regionIds: ["arctic-circle"],
    summary:
      "A climate-linked species marker for shrinking sea ice and changing Arctic food webs.",
    statusByYear: [
      {
        year: 1954,
        status: "stable",
        note: "Sea-ice habitat is extensive.",
        sourceRefs: [sourceCatalog.noaaCarbon]
      },
      {
        year: 1997,
        status: "threatened",
        note: "Warming signal strengthens.",
        sourceRefs: [sourceCatalog.noaaCarbon]
      },
      {
        year: 2024,
        status: "threatened",
        note: "Sea-ice trends keep risk elevated.",
        sourceRefs: [sourceCatalog.iucnSummary]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.noaaCarbon]
  },
  {
    id: "reef-manta-ray",
    name: "Reef manta ray",
    status: "threatened",
    regionIds: ["coral-triangle"],
    summary:
      "A graceful reef-ocean connector used to show marine protected area and fishing-pressure layers.",
    statusByYear: [
      {
        year: 1978,
        status: "stable",
        note: "Marine megafauna pressures are growing.",
        sourceRefs: [sourceCatalog.wwfLivingPlanet]
      },
      {
        year: 2020,
        status: "threatened",
        note: "Fishing and habitat changes drive concern.",
        sourceRefs: [sourceCatalog.iucnSummary]
      },
      {
        year: 2024,
        status: "threatened",
        note: "Protection varies sharply by region.",
        sourceRefs: [sourceCatalog.iucnSummary]
      }
    ],
    sourceRefs: [sourceCatalog.iucnSummary, sourceCatalog.wwfLivingPlanet]
  }
];
