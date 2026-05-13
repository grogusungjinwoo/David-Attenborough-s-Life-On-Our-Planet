import type { ReferenceOverlay } from "../domain/types";
import { sourceCatalog } from "./sources";

export const referenceOverlays: ReferenceOverlay[] = [
  {
    id: "neuralgcm-atmosphere",
    label: "Atmosphere model sketch",
    domain: "climate",
    inspiration:
      "NeuralGCM's hybrid physics and machine-learning framing for atmosphere simulation.",
    futureUse:
      "Drive educational wind, heat, and carbon anomaly overlays without adding the Python model to the client bundle.",
    sourceRefs: [sourceCatalog.neuralGcm]
  },
  {
    id: "aurora-forecasting",
    label: "Earth-system forecast sketch",
    domain: "weather",
    inspiration:
      "Aurora's foundation-model approach to weather, ocean wave, cyclone, and air-quality tasks.",
    futureUse:
      "Describe how a future server-side forecast feed might animate risk surfaces over the globe.",
    sourceRefs: [sourceCatalog.aurora]
  },
  {
    id: "pypsa-earth-energy",
    label: "Energy transition sketch",
    domain: "energy",
    inspiration:
      "PyPSA-Earth's open high-resolution energy-system modeling across regions.",
    futureUse:
      "Map future energy-production and demand overlays as static tiles or hosted scenario datasets.",
    sourceRefs: [sourceCatalog.pypsaEarth]
  }
];
