import type {
  GeoChangeLayerId,
  GeoChangeLayerSnapshot,
  GeoChangeRegionSnapshot,
  GeoChangeSnapshot,
  RegionRecord,
  SourceRef,
  WorldSnapshot
} from "../domain/types";
import { sourceCatalog } from "./sources";

export type GeoChangeLayerDefinition = {
  id: GeoChangeLayerId;
  label: string;
  summary: string;
  legend: string;
  displayCaveat: string;
  sourceRefs: SourceRef[];
};

export type DerivedGeoChangeLayer = GeoChangeLayerSnapshot & {
  legend: string;
};

export type RegionGeoChangeProfile = {
  regionId: string;
  multipliers: Record<GeoChangeLayerId, number>;
  sourceRefs: SourceRef[];
};

export type DerivedRegionGeoChange = GeoChangeRegionSnapshot;

export type DerivedGeoChangeSnapshot = GeoChangeSnapshot & {
  layers: DerivedGeoChangeLayer[];
  regions: DerivedRegionGeoChange[];
};

export const geoChangeLayerDefinitions: GeoChangeLayerDefinition[] = [
  {
    id: "wild-space",
    label: "Wild space",
    summary:
      "Wild-space contraction rises as the timeline moves from reconstructed baselines into the modern pressure era.",
    legend: "Low contraction to high contraction",
    displayCaveat:
      "This is a blended storytelling layer, not a parcel-level map of legal wilderness or ownership.",
    sourceRefs: [
      sourceCatalog.attenboroughExcerpt,
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.hydeHistory
    ]
  },
  {
    id: "human-footprint",
    label: "Human Footprint",
    summary:
      "Human exposure combines population, agriculture, urban lights, and settlement pressure.",
    legend: "Sparse exposure to dense exposure",
    displayCaveat:
      "This is not a parcel-level map; it summarizes global pressure signals at timeline scale.",
    sourceRefs: [sourceCatalog.hydeHistory, sourceCatalog.nasaAnthromes, sourceCatalog.humanFootprint]
  },
  {
    id: "forest-cover",
    label: "Forest stress",
    summary:
      "Forest-cover stress increases where green surface and intact wild-space signals fall over time.",
    legend: "Lower stress to higher stress",
    displayCaveat:
      "Forest-cover stress is derived from reconstructed and observed land-cover sources, not direct tree counts.",
    sourceRefs: [
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.nasaIslscpHistoricLandcover,
      sourceCatalog.esaWorldCover,
      sourceCatalog.faoForests
    ]
  },
  {
    id: "ocean-ice",
    label: "Ocean / ice",
    summary:
      "Ocean and ice stress becomes stronger once instrumental and reconstructed ocean/weather products are available.",
    legend: "Cooler/stabler to warmer/stressed",
    displayCaveat:
      "Early ocean and ice signals are instrumental and reconstructed blends, with sparse pre-1850 observations.",
    sourceRefs: [
      sourceCatalog.noaaIcoads,
      sourceCatalog.noaaErsst,
      sourceCatalog.noaa20cr,
      sourceCatalog.nasaGistemp
    ]
  },
  {
    id: "urban-lights",
    label: "Urban lights",
    summary:
      "Urban lights approximate human electrification and settlement visibility as the timeline approaches the present.",
    legend: "Dim human signal to bright human signal",
    displayCaveat:
      "Night lights are a modern visual metaphor for historical settlement pressure, not observed 18th-century lighting.",
    sourceRefs: [sourceCatalog.nasaBlueMarble, sourceCatalog.nasaAnthromes, sourceCatalog.hydeHistory]
  }
];

export const regionGeoChangeProfiles: RegionGeoChangeProfile[] = [
  profile("amazon-basin", {
    "wild-space": 1.12,
    "human-footprint": 0.82,
    "forest-cover": 1.24,
    "ocean-ice": 0.36,
    "urban-lights": 0.42
  }),
  profile("coral-triangle", {
    "wild-space": 0.88,
    "human-footprint": 0.92,
    "forest-cover": 0.72,
    "ocean-ice": 1.22,
    "urban-lights": 0.62
  }),
  profile("arctic-circle", {
    "wild-space": 0.7,
    "human-footprint": 0.38,
    "forest-cover": 0.42,
    "ocean-ice": 1.4,
    "urban-lights": 0.28
  }),
  profile("serengeti", {
    "wild-space": 0.98,
    "human-footprint": 0.74,
    "forest-cover": 0.58,
    "ocean-ice": 0.34,
    "urban-lights": 0.3
  }),
  profile("borneo", {
    "wild-space": 1.18,
    "human-footprint": 0.9,
    "forest-cover": 1.32,
    "ocean-ice": 0.52,
    "urban-lights": 0.58
  }),
  profile("north-atlantic", {
    "wild-space": 0.64,
    "human-footprint": 0.72,
    "forest-cover": 0.26,
    "ocean-ice": 1.28,
    "urban-lights": 0.86
  })
];

export function deriveGeoChangeSnapshot(
  year: number,
  snapshot: WorldSnapshot,
  regions: RegionRecord[]
): DerivedGeoChangeSnapshot {
  const surface = snapshot.earthSurface;
  const regionById = new Map(regions.map((region) => [region.id, region]));
  const wildLoss = clamp01(1 - (snapshot.metrics.remainingWildSpacePercent ?? 100) / 100);
  const forestStress = clamp01(1 - surface.vegetationIndex);
  const intensities: Record<GeoChangeLayerId, number> = {
    "wild-space": wildLoss,
    "human-footprint": surface.humanExposureIndex,
    "forest-cover": forestStress,
    "ocean-ice": clamp01(surface.oceanHeatIndex * 0.62 + surface.weatherEnergyIndex * 0.38),
    "urban-lights": surface.nightLightIndex
  };

  return {
    year,
    layers: geoChangeLayerDefinitions.map((definition) => ({
      ...definition,
      intensity: intensities[definition.id],
      color: colorForLayer(definition.id),
      confidence: surface.confidence,
      beforeLabel: beforeLabelForLayer(definition.id),
      currentLabel: currentLabelForLayer(definition.id, intensities[definition.id]),
      legendStops: legendStopsForLayer(definition.id)
    })),
    regions: regionGeoChangeProfiles.flatMap((profileRecord) => {
      const region = regionById.get(profileRecord.regionId);

      if (!region) {
        return [];
      }

      return {
        regionId: region.id,
        name: region.name,
        lat: region.lat,
        lon: region.lon,
        radiusKm: region.radiusKm,
        biome: region.biome,
        layerIntensities: Object.fromEntries(
          geoChangeLayerDefinitions.map((definition) => [
            definition.id,
            clamp01(intensities[definition.id] * profileRecord.multipliers[definition.id])
          ])
        ) as Record<GeoChangeLayerId, number>,
        beforeLabel: "1937 baseline",
        currentLabel: "current pressure",
        summary: `${region.name} is shown as a coarse regional evidence lens, not a detailed land parcel layer.`,
        sourceRefs: uniqueSourceRefs([...region.sourceRefs, ...profileRecord.sourceRefs])
      };
    }),
    sourceRefs: uniqueSourceRefs(geoChangeLayerDefinitions.flatMap((definition) => definition.sourceRefs)),
    displayCaveat:
      "Geographic change overlays are coarse public-data and narrative evidence layers, not street-level or parcel-level maps."
  };
}

function profile(
  regionId: string,
  multipliers: Record<GeoChangeLayerId, number>
): RegionGeoChangeProfile {
  return {
    regionId,
    multipliers,
    sourceRefs: [
      sourceCatalog.noaaHistoricalLandCover,
      sourceCatalog.hydeHistory,
      sourceCatalog.ipbesAssessment
    ]
  };
}

function colorForLayer(layerId: GeoChangeLayerId) {
  const colors: Record<GeoChangeLayerId, string> = {
    "wild-space": "#9bc45b",
    "human-footprint": "#df9525",
    "forest-cover": "#64c799",
    "ocean-ice": "#7bb7d8",
    "urban-lights": "#f0c46a"
  };

  return colors[layerId];
}

function beforeLabelForLayer(layerId: GeoChangeLayerId) {
  return layerId === "wild-space" ? "less fragmented baseline" : "lower pressure";
}

function currentLabelForLayer(layerId: GeoChangeLayerId, intensity: number) {
  const percent = Math.round(intensity * 100);
  return layerId === "wild-space" ? `${percent}% contraction` : `${percent}% pressure`;
}

function legendStopsForLayer(layerId: GeoChangeLayerId) {
  return [
    { label: "Low", value: 0, color: "#203c2d" },
    { label: "Medium", value: 0.5, color: layerId === "ocean-ice" ? "#7bb7d8" : "#d6a84e" },
    { label: "High", value: 1, color: layerId === "wild-space" ? "#b24b33" : colorForLayer(layerId) }
  ];
}

function uniqueSourceRefs(sourceRefs: SourceRef[]) {
  const seen = new Set<string>();

  return sourceRefs.filter((sourceRef) => {
    if (seen.has(sourceRef.id)) {
      return false;
    }

    seen.add(sourceRef.id);
    return true;
  });
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}
