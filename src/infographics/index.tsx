import "./infographics.css";
import type {
  MetricSnapshot,
  SpeciesRecord,
  SpeciesStatus
} from "../domain/storyModel";
import {
  animalRepository,
  getSpeciesForYear,
  historicZooSites,
  sources,
  timelineAnchors
} from "../domain/storyModel";

export type InfographicSnapshot = Pick<
  {
    metrics: MetricSnapshot;
    proceduralDensity: {
      trees?: number;
      buildings: number;
      waterStress: number;
      animalPresence?: number;
    };
  },
  "metrics" | "proceduralDensity"
>;

export type SnapshotGraphicProps = {
  year: number;
  snapshot: InfographicSnapshot;
  className?: string;
};

type MapPoint = {
  x: number;
  y: number;
};

type SnapshotRatios = {
  carbon: number;
  population: number;
  wildLoss: number;
};

type HorizonMetric = "carbon" | "population" | "waterStress";

type HorizonRepo = {
  name: string;
  domain: string;
  driver: string;
  metric: HorizonMetric;
};

const MAP_WIDTH = 340;
const MAP_HEIGHT = 190;

const referenceHorizons: HorizonRepo[] = [
  {
    name: "NeuralGCM",
    domain: "climate",
    driver: "Atmosphere model sketch",
    metric: "carbon"
  },
  {
    name: "Aurora",
    domain: "weather",
    driver: "Earth-system forecast sketch",
    metric: "waterStress"
  },
  {
    name: "PyPSA-Earth",
    domain: "energy",
    driver: "Energy transition sketch",
    metric: "population"
  }
];

export function BiomePressureMap({ year, snapshot, className }: SnapshotGraphicProps) {
  const wildSpace = snapshot.metrics.remainingWildSpacePercent ?? 0;
  const pressure = 100 - wildSpace;
  const ratios = snapshotRatios(snapshot);
  const visibleSpecies = getSpeciesForYear(year);
  const pressureScore = Math.round(
    clamp(
      ratios.wildLoss * 0.54 +
        ratios.population * 0.24 +
        snapshot.proceduralDensity.waterStress * 0.14 +
        visibleSpecies.length * 0.015
    ) * 100
  );

  return (
    <article className={cardClass("infographic-card biome-card", className)}>
      <div className="section-kicker">Biome pressure</div>
      <svg
        className="mini-map biome-map"
        role="img"
        aria-label={`Biome pressure map for ${year}`}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      >
        <title>{`Biome pressure map for ${year}`}</title>
        <MapBackdrop />
        <circle className="map-pressure map-pressure--green" cx="92" cy="112" r={22 + ratios.wildLoss * 10} />
        <circle
          className="map-pressure"
          cx="171"
          cy="97"
          r={24 + snapshot.proceduralDensity.waterStress * 9}
          style={{ fill: pressureColor(pressureScore) }}
        />
        <circle className="map-pressure map-pressure--red" cx="244" cy="118" r={21 + ratios.population * 12} />
        <circle className="map-pressure map-pressure--blue" cx="263" cy="69" r={16 + ratios.carbon * 8} />
        <text x="66" y="151">Amazon Basin</text>
        <text x="139" y="134">Central Africa</text>
        <text x="225" y="153">Borneo</text>
        <text x="238" y="55">Coral Triangle</text>
      </svg>
      <div className="infographic-stat-grid">
        <div className="infographic-stat">
          <strong>Wild space {Math.round(wildSpace)}%</strong>
          <span>remaining habitat</span>
        </div>
        <div className="infographic-stat">
          <strong>Human pressure {Math.round(pressure)}%</strong>
          <span>inverse wilderness signal</span>
        </div>
        <div className="infographic-stat">
          <strong>{visibleSpecies.length} species</strong>
          <span>visible records by year</span>
        </div>
      </div>
    </article>
  );
}

export function PopulationExpansionMap({ year, snapshot, className }: SnapshotGraphicProps) {
  const population = snapshot.metrics.worldPopulationBillion ?? 0;
  const ratios = snapshotRatios(snapshot);
  const visibleZoos = historicZooSites.filter(
    (site) => !site.openedYear || site.openedYear <= year
  );
  const routePath = visibleZoos
    .map((site, index) => {
      const point = project(site.lat, site.lon);

      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <article className={cardClass("infographic-card population-card", className)}>
      <div className="section-kicker">Population expansion</div>
      <svg
        className="mini-map population-map"
        role="img"
        aria-label={`Population expansion map for ${year}`}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      >
        <title>{`Population expansion map for ${year}`}</title>
        <MapBackdrop />
        {routePath ? <path className="population-route" d={routePath} /> : null}
        {visibleZoos.map((site, index) => {
          const point = project(site.lat, site.lon);
          const labelX = site.lon > 80 ? point.x - 88 : point.x + 9;
          const labelY = Math.max(20, Math.min(MAP_HEIGHT - 10, point.y - 7 + (index % 2) * 12));

          return (
            <g key={site.id}>
              <circle
                className="pulse"
                cx={point.x}
                cy={point.y}
                r={11 + ratios.population * 20}
              />
              <circle className="zoo-dot" cx={point.x} cy={point.y} r="3.8" />
              <text className="zoo-pin" x={labelX} y={labelY}>
                {site.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="infographic-stat-grid">
        <div className="infographic-stat">
          <strong>{population.toFixed(1)}B people</strong>
          <span>global population</span>
        </div>
        <div className="infographic-stat">
          <strong>{Math.round(snapshot.proceduralDensity.buildings * 100)}% density</strong>
          <span>procedural settlement signal</span>
        </div>
        <div className="infographic-stat">
          <strong>{visibleZoos.length} markers</strong>
          <span>historic zoo records</span>
        </div>
      </div>
    </article>
  );
}

export function SpeciesLossMatrix({ year, snapshot, className }: SnapshotGraphicProps) {
  const extinctSpecies = snapshot.metrics.extinctSpeciesCount ?? 0;
  const atRiskSpecies = snapshot.metrics.speciesAtRiskCount ?? 0;
  const activeAnchor = nearestTimelineAnchor(year);
  const visibleSpecies = getSpeciesForYear(year);

  return (
    <article className={cardClass("infographic-card matrix-card", className)}>
      <div className="section-kicker">Species loss matrix</div>
      <div className="matrix-scroll" role="region" aria-label="Species status timeline">
        <table aria-label="Species loss matrix" className="species-matrix">
          <thead>
            <tr>
              <th scope="col">Species</th>
              {timelineAnchors.map((anchor) => (
                <th
                  className={anchor.id === activeAnchor.id ? "active-column" : undefined}
                  key={anchor.id}
                  scope="col"
                >
                  {anchor.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {animalRepository.map((species) => (
              <tr key={species.id}>
                <th scope="row">
                  <span>{species.name}</span>
                  <small>{species.summary}</small>
                </th>
                {timelineAnchors.map((anchor) => {
                  const status = statusForSpeciesAtAnchor(species, anchor.year);

                  return (
                    <td
                      className={`matrix-cell ${status} ${
                        anchor.id === activeAnchor.id ? "active-column" : ""
                      }`}
                      key={`${species.id}-${anchor.id}`}
                    >
                      <span>{statusLabel(status)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="infographic-stat-grid">
        <div className="infographic-stat">
          <strong>{visibleSpecies.length} visible</strong>
          <span>species records in {year}</span>
        </div>
        <div className="infographic-stat">
          <strong>{atRiskSpecies.toLocaleString()} at risk</strong>
          <span>snapshot pressure count</span>
        </div>
        <div className="infographic-stat">
          <strong>{extinctSpecies.toLocaleString()} documented extinctions</strong>
          <span>snapshot extinction count</span>
        </div>
      </div>
    </article>
  );
}

export function ReferenceRepoHorizonPanel({ year, snapshot, className }: SnapshotGraphicProps) {
  const carbon = Math.round(snapshot.metrics.atmosphericCarbonPpm ?? 0);
  const referenceSource = sources.find((source) => source.family === "reference-repo");
  const linkedAnchor = timelineAnchors.find((anchor) =>
    anchor.sourceRefs.some((ref) => ref.sourceId === referenceSource?.id)
  );
  const ratios = snapshotRatios(snapshot);
  const horizonValues: Record<HorizonMetric, number> = {
    carbon: ratios.carbon,
    population: ratios.population,
    waterStress: snapshot.proceduralDensity.waterStress
  };

  return (
    <article className={cardClass("infographic-card reference-card", className)}>
      <div className="section-kicker">Future systems layer</div>
      <h2>Reference-repo horizon</h2>
      <p>
        These repositories stay outside the client bundle for v1, but shape the
        next layer of scientific overlays.
      </p>
      <p className="reference-source">
        Reference repository: {referenceSource?.label ?? "NeuralGCM, Aurora, and PyPSA-Earth reference repositories"}
      </p>
      <div className="reference-grid">
        {referenceHorizons.map((repo) => {
          const value = Math.round(horizonValues[repo.metric] * 100);

          return (
            <div className="reference-lane" key={repo.name}>
              <strong>{repo.name}</strong>
              <span>{repo.domain}</span>
              <p>{repo.driver}</p>
              <div className="horizon-track" aria-label={`${repo.name} horizon ${value}%`}>
                <i style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="infographic-stat-grid">
        <div className="infographic-stat">
          <strong>{carbon} ppm atmospheric carbon context</strong>
          <span>snapshot for {year}</span>
        </div>
        <div className="infographic-stat">
          <strong>{linkedAnchor ? `${linkedAnchor.year} anchor` : "source linked"}</strong>
          <span>first story-model reference</span>
        </div>
      </div>
    </article>
  );
}

function MapBackdrop() {
  return (
    <>
      <rect className="map-water" width={MAP_WIDTH} height={MAP_HEIGHT} rx="14" />
      <path
        className="map-outline"
        d="M26 92c40-62 109-69 164-44 31 14 70 2 100 19 31 18 35 69 6 91-35 27-84 2-122 2-42 0-81 22-119 1-25-14-43-47-29-69Z"
      />
      <path className="map-grid" d="M0 48h340M0 95h340M0 142h340M85 0v190M170 0v190M255 0v190" />
    </>
  );
}

function snapshotRatios(snapshot: InfographicSnapshot): SnapshotRatios {
  const population = snapshot.metrics.worldPopulationBillion ?? 0;
  const carbon = snapshot.metrics.atmosphericCarbonPpm ?? 0;
  const wildSpace = snapshot.metrics.remainingWildSpacePercent ?? 0;

  return {
    carbon: ratioFromRange(carbon, "atmosphericCarbonPpm"),
    population: ratioFromRange(population, "worldPopulationBillion"),
    wildLoss: clamp(1 - ratioFromRange(wildSpace, "remainingWildSpacePercent"))
  };
}

function ratioFromRange(value: number, metric: keyof MetricSnapshot) {
  const values = timelineAnchors
    .map((anchor) => anchor.metrics[metric])
    .filter((entry): entry is number => typeof entry === "number");
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) {
    return 0;
  }

  return clamp((value - min) / (max - min));
}

function project(lat: number, lon: number): MapPoint {
  return {
    x: ((lon + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * MAP_HEIGHT
  };
}

function nearestTimelineAnchor(year: number) {
  return timelineAnchors.reduce((nearest, anchor) =>
    Math.abs(anchor.year - year) < Math.abs(nearest.year - year) ? anchor : nearest
  );
}

function statusForSpeciesAtAnchor(
  species: SpeciesRecord,
  anchorYear: number
): SpeciesStatus | "untracked" {
  if (anchorYear < species.visibleFromYear) {
    return "untracked";
  }

  return species.status;
}

function statusLabel(status: SpeciesStatus | "untracked") {
  return status === "untracked" ? "not tracked" : status;
}

function pressureColor(score: number) {
  if (score >= 78) {
    return "#b94a37";
  }

  if (score >= 58) {
    return "#d47b3e";
  }

  if (score >= 38) {
    return "#cda340";
  }

  return "#3f8d68";
}

function cardClass(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}
