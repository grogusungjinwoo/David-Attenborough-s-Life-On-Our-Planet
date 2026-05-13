import type {
  EarthSurfaceState,
  LayerState,
  MetricSnapshot,
  SourceRef,
  TimelineAnchor,
  WorldSnapshot
} from "./types";

export const EARTH_LAND_ACRES = 36_800_000_000;

export const defaultLayers: LayerState = {
  atmosphere: true,
  vegetation: true,
  oceans: true,
  mountains: true,
  topographicRelief: true,
  adminBoundaries: true,
  settlements: true,
  wildSpace: true,
  population: true,
  species: true,
  zoos: true,
  climate: true,
  energy: false
};

const metricKeys = [
  "worldPopulationBillion",
  "atmosphericCarbonPpm",
  "remainingWildSpacePercent",
  "wildSpaceAcres",
  "speciesAtRiskCount",
  "extinctSpeciesCount"
] satisfies Array<keyof MetricSnapshot>;

const earthSurfaceKeys = [
  "forestGreenCoveragePercent",
  "cropPastureCoveragePercent",
  "vegetationIndex",
  "oceanHeatIndex",
  "weatherEnergyIndex",
  "humanExposureIndex",
  "nightLightIndex",
  "cloudOpacity"
] satisfies Array<
  Exclude<
    keyof EarthSurfaceState,
    "confidence" | "projection" | "summary" | "sourceRefs"
  >
>;

export function deriveWildSpaceAcres(
  remainingWildSpacePercent?: number,
  landAcres = EARTH_LAND_ACRES
) {
  if (remainingWildSpacePercent === undefined) {
    return undefined;
  }

  return Math.round(landAcres * (remainingWildSpacePercent / 100));
}

export function enrichMetrics(metrics: MetricSnapshot): MetricSnapshot {
  return {
    ...metrics,
    wildSpaceAcres:
      metrics.wildSpaceAcres ??
      deriveWildSpaceAcres(metrics.remainingWildSpacePercent)
  };
}

export function sortTimelineAnchors(anchors: TimelineAnchor[]) {
  return [...anchors].sort((a, b) => a.year - b.year);
}

export function findTimelineBounds(anchors: TimelineAnchor[], year: number) {
  const sorted = sortTimelineAnchors(anchors);

  if (sorted.length === 0) {
    throw new Error("Timeline requires at least one anchor.");
  }

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (year <= first.year) {
    return { previous: first, next: first };
  }

  if (year >= last.year) {
    return { previous: last, next: last };
  }

  const nextIndex = sorted.findIndex((anchor) => anchor.year >= year);
  return {
    previous: sorted[nextIndex - 1],
    next: sorted[nextIndex]
  };
}

export function interpolateMetrics(
  anchors: TimelineAnchor[],
  year: number
): MetricSnapshot {
  const { previous, next } = findTimelineBounds(anchors, year);

  if (previous.year === next.year) {
    return enrichMetrics(previous.metrics);
  }

  const span = next.year - previous.year;
  const progress = (year - previous.year) / span;
  const metrics: MetricSnapshot = {};

  for (const key of metricKeys) {
    const previousValue = previous.metrics[key];
    const nextValue = next.metrics[key];

    if (previousValue === undefined && nextValue === undefined) {
      continue;
    }

    if (previousValue === undefined) {
      if (year === next.year) {
        metrics[key] = nextValue;
      }
      continue;
    }

    if (nextValue === undefined) {
      metrics[key] = previousValue;
      continue;
    }

    metrics[key] = previousValue + (nextValue - previousValue) * progress;
  }

  return enrichMetrics(metrics);
}

export function deriveEarthSurfaceFromMetrics(
  metrics: MetricSnapshot,
  sourceRefs: SourceRef[] = []
): EarthSurfaceState {
  const wildSpace = clamp((metrics.remainingWildSpacePercent ?? 50) / 100, 0, 1);
  const population = clamp((metrics.worldPopulationBillion ?? 0) / 8.2, 0, 1);
  const carbonPressure = clamp(((metrics.atmosphericCarbonPpm ?? 280) - 280) / 150, 0, 1);
  const humanExposure = clamp(population * 0.68 + (1 - wildSpace) * 0.32, 0, 1);

  return {
    forestGreenCoveragePercent: roundTo(24 + wildSpace * 34, 1),
    cropPastureCoveragePercent: roundTo(6 + humanExposure * 32, 1),
    vegetationIndex: roundTo(clamp(wildSpace * 0.92 + 0.03, 0.05, 0.95), 3),
    oceanHeatIndex: roundTo(clamp(carbonPressure * 0.82 + population * 0.12, 0, 1), 3),
    weatherEnergyIndex: roundTo(clamp(carbonPressure * 0.76 + population * 0.16, 0, 1), 3),
    humanExposureIndex: roundTo(humanExposure, 3),
    nightLightIndex: roundTo(clamp(population ** 1.5, 0, 1), 3),
    cloudOpacity: roundTo(clamp(0.18 + carbonPressure * 0.18 + population * 0.05, 0.14, 0.42), 3),
    confidence: "observed",
    projection: "equirectangular-wgs84",
    summary:
      "Derived from interpolated population, carbon, and wilderness metrics where no gridded Earth-state stop is available.",
    sourceRefs
  };
}

export function interpolateEarthSurface(
  anchors: TimelineAnchor[],
  year: number,
  metrics = interpolateMetrics(anchors, year)
): EarthSurfaceState {
  const surfaceAnchors = sortTimelineAnchors(anchors).filter(
    (anchor): anchor is TimelineAnchor & { earthSurface: EarthSurfaceState } =>
      Boolean(anchor.earthSurface)
  );

  if (surfaceAnchors.length === 0) {
    return deriveEarthSurfaceFromMetrics(metrics);
  }

  const first = surfaceAnchors[0];
  const last = surfaceAnchors[surfaceAnchors.length - 1];

  if (year <= first.year) {
    return first.earthSurface;
  }

  if (year >= last.year) {
    return {
      ...deriveEarthSurfaceFromMetrics(metrics, last.earthSurface.sourceRefs),
      confidence: last.earthSurface.confidence,
      summary: last.earthSurface.summary
    };
  }

  const nextIndex = surfaceAnchors.findIndex((anchor) => anchor.year >= year);
  const previous = surfaceAnchors[nextIndex - 1];
  const next = surfaceAnchors[nextIndex];

  if (previous.year === next.year) {
    return previous.earthSurface;
  }

  const progress = (year - previous.year) / (next.year - previous.year);
  const surface: Record<string, number | string | SourceRef[]> = {
    confidence: progress < 0.5 ? previous.earthSurface.confidence : next.earthSurface.confidence,
    projection: "equirectangular-wgs84",
    summary:
      progress < 0.5 ? previous.earthSurface.summary : next.earthSurface.summary,
    sourceRefs: uniqueSourceRefs([
      ...previous.earthSurface.sourceRefs,
      ...next.earthSurface.sourceRefs
    ])
  };

  for (const key of earthSurfaceKeys) {
    surface[key] = roundTo(
      previous.earthSurface[key] +
        (next.earthSurface[key] - previous.earthSurface[key]) * progress,
      key.endsWith("Percent") ? 1 : 3
    );
  }

  return surface as EarthSurfaceState;
}

export function createWorldSnapshot(
  anchors: TimelineAnchor[],
  year: number,
  layers: LayerState = defaultLayers
): WorldSnapshot {
  const metrics = interpolateMetrics(anchors, year);
  const earthSurface = interpolateEarthSurface(anchors, year, metrics);
  const population = metrics.worldPopulationBillion ?? 0;
  const wildSpace = metrics.remainingWildSpacePercent ?? 50;
  const carbon = metrics.atmosphericCarbonPpm ?? 280;

  const settlementPressure = clamp(population / 8.5, 0.08, 1);
  const wildFraction = clamp(wildSpace / 100, 0, 1);
  const carbonPressure = clamp((carbon - 280) / 160, 0, 1);

  return {
    year,
    metrics,
    layers,
    earthSurface,
    proceduralDensity: {
      trees: roundTo(clamp(earthSurface.vegetationIndex, 0.12, 0.95), 3),
      buildings: roundTo(clamp(earthSurface.humanExposureIndex || settlementPressure, 0.04, 1), 3),
      waterStress: roundTo(clamp(earthSurface.weatherEnergyIndex || carbonPressure, 0, 1), 3),
      animalPresence: roundTo(clamp(wildFraction * (1 - carbonPressure * 0.35), 0.05, 1), 3)
    }
  };
}

export function getActiveTimelineAnchor(
  anchors: TimelineAnchor[],
  year: number
) {
  const sorted = sortTimelineAnchors(anchors);
  return sorted.reduce((active, anchor) => {
    const currentDistance = Math.abs(anchor.year - year);
    const activeDistance = Math.abs(active.year - year);
    return currentDistance < activeDistance ? anchor : active;
  }, sorted[0]);
}

export function collectSourceIds(sourceRefs: SourceRef[]) {
  return new Set(sourceRefs.map((sourceRef) => sourceRef.id));
}

export function validateSourceRefs(records: Array<{ sourceRefs: SourceRef[] }>) {
  return records.flatMap((record, index) => {
    if (!record.sourceRefs || record.sourceRefs.length === 0) {
      return [`record:${index} has no source references`];
    }

    return record.sourceRefs.flatMap((sourceRef) => {
      const issues: string[] = [];

      if (!sourceRef.id) {
        issues.push(`record:${index} has a source without an id`);
      }

      if (!sourceRef.label) {
        issues.push(`record:${index} source:${sourceRef.id} has no label`);
      }

      if (!sourceRef.publisher) {
        issues.push(`record:${index} source:${sourceRef.id} has no publisher`);
      }

      return issues;
    });
  });
}

export function validateCatalogSourceRefs(
  records: Array<{
    id?: string;
    sourceRefs: SourceRef[];
    metricSourceRefs?: Partial<Record<keyof MetricSnapshot, SourceRef[]>>;
  }>,
  catalogSources: SourceRef[]
) {
  const catalogIds = new Set(catalogSources.map((source) => source.id));
  const issues: string[] = [];

  records.forEach((record, index) => {
    const recordId = record.id ?? `record:${index}`;
    const refs = [
      ...record.sourceRefs,
      ...Object.values(record.metricSourceRefs ?? {}).flat()
    ];

    for (const sourceRef of refs) {
      if (!catalogIds.has(sourceRef.id)) {
        issues.push(`${recordId} references unknown source:${sourceRef.id}`);
      }
    }
  });

  return issues;
}

export function validateMetricSourceRefs(anchors: TimelineAnchor[]) {
  return anchors.flatMap((anchor) => {
    const metricSourceRefs = anchor.metricSourceRefs ?? {};

    return (Object.keys(anchor.metrics) as Array<keyof MetricSnapshot>).flatMap(
      (metricKey) => {
        if (metricKey === "wildSpaceAcres") {
          return [];
        }

        const refs = metricSourceRefs[metricKey];
        return refs && refs.length > 0
          ? []
          : [`${anchor.id} metric:${metricKey} has no metric source references`];
      }
    );
  });
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, places: number) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}
