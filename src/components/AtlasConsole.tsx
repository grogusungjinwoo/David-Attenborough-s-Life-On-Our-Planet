import type { ReactNode } from "react";
import {
  AudioLines,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Crosshair,
  Download,
  ExternalLink,
  Globe2,
  Layers,
  Leaf,
  LineChart,
  MapPin,
  MessageSquare,
  PawPrint,
  Play,
  Search,
  Share2,
  Sprout,
  Trees,
  Users,
  Waves,
  X,
  Zap
} from "lucide-react";
import type {
  LayerState,
  ReferenceOverlay,
  RegionRecord,
  SpeciesRecord,
  TimelineAnchor,
  WorldSnapshot,
  ZooSite
} from "../domain/types";
import type { EarthView } from "../state/usePlanetStore";
import {
  formatAcres,
  formatCarbon,
  formatCount,
  formatPercent,
  formatPopulation
} from "../domain/formatters";

type AtlasConsoleProps = {
  activeAnchor: TimelineAnchor;
  bottomPanels: ReactNode;
  currentYear: number;
  debugOpen: boolean;
  earthSurface: ReactNode;
  earthView: EarthView;
  layers: LayerState;
  overlays: ReferenceOverlay[];
  providerLabel: string;
  regions: RegionRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  snapshot: WorldSnapshot;
  species: SpeciesRecord[];
  timelineAnchors: TimelineAnchor[];
  zoos: ZooSite[];
  onLayerToggle: (layer: keyof LayerState) => void;
  onPlayTimeline: () => void;
  onEarthViewChange: (earthView: EarthView) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onToggleDebug: () => void;
  onYearChange: (year: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

type MetricKey = keyof WorldSnapshot["metrics"];

const navItems = [
  { label: "Overview", icon: Globe2, active: true },
  { label: "Timeline", icon: LineChart },
  { label: "Places", icon: MapPin },
  { label: "Species", icon: PawPrint },
  { label: "Stories", icon: MessageSquare },
  { label: "Solutions", icon: Sprout },
  { label: "Search", icon: Search }
];

const layerItems: Array<{
  key: keyof LayerState;
  label: string;
  icon: typeof Layers;
}> = [
  { key: "vegetation", label: "Wild Space", icon: Trees },
  { key: "settlements", label: "Human Footprint", icon: Users },
  { key: "oceans", label: "Water Systems", icon: Waves },
  { key: "species", label: "Protected Areas", icon: Leaf },
  { key: "zoos", label: "Zoos & Aquariums", icon: PawPrint },
  { key: "energy", label: "Energy Stress", icon: Zap }
];

const routeLabels = [
  { label: "Calgary Zoo", place: "Canada", x: "38%", y: "21%" },
  { label: "London Zoo", place: "UK", x: "66%", y: "27%" },
  { label: "Beijing Zoo", place: "China", x: "82%", y: "38%" },
  { label: "Nairobi Safari Walk", place: "Kenya", x: "77%", y: "56%" },
  { label: "Sydney Zoo", place: "Australia", x: "88%", y: "74%" }
];

const spotlightLoss: Record<string, string> = {
  "bornean-orangutan": "50%",
  "black-rhinoceros": "66%",
  "blue-whale": "80%",
  "golden-toad": "100%",
  "polar-bear": "31%",
  "reef-manta-ray": "44%"
};

export function AtlasConsole({
  activeAnchor,
  bottomPanels,
  currentYear,
  debugOpen,
  earthSurface,
  earthView,
  layers,
  overlays,
  providerLabel,
  regions,
  selectedSpeciesId,
  selectedZooId,
  snapshot,
  species,
  timelineAnchors,
  zoos,
  onLayerToggle,
  onPlayTimeline,
  onEarthViewChange,
  onSelectSpecies,
  onToggleDebug,
  onYearChange,
  onZoomIn,
  onZoomOut,
  onResetView
}: AtlasConsoleProps) {
  const minYear = timelineAnchors[0]?.year ?? 1937;
  const maxYear = timelineAnchors[timelineAnchors.length - 1]?.year ?? 2024;
  const visibleZoos = zoos.filter((zoo) => !zoo.openedYear || zoo.openedYear <= currentYear);
  const firstSource = activeAnchor.sourceRefs[0];

  return (
    <main className="planet-app atlas-console" data-testid="app-shell">
      <NavigationRail />

      <section className="earth-stage" aria-label="David Attenborough Earth witness console">
        {earthSurface}
        <EarthRouteOverlay zoos={visibleZoos} />
        <div className="stage-toolbar" aria-label="Earth view controls">
          <label className="view-select">
            <span>View</span>
            <select
              aria-label="Earth view"
              value={earthView}
              onChange={(event) => onEarthViewChange(event.currentTarget.value as EarthView)}
            >
              <option value="globe-satellite">Earth from Space</option>
              <option value="map-topographic">2D Topographic</option>
              <option value="map-satellite">2D Satellite</option>
              <option value="map-political">Countries & Borders</option>
            </select>
            <ChevronDown aria-hidden="true" size={14} />
          </label>
          <div className="tool-cluster">
            <button type="button" aria-label="Zoom in" onClick={onZoomIn}>
              <Search aria-hidden="true" size={17} />
            </button>
            <button type="button" aria-label="Reset view" onClick={onResetView}>
              <Crosshair aria-hidden="true" size={17} />
            </button>
            <button type="button" aria-label="Zoom out" onClick={onZoomOut}>
              <CircleHelp aria-hidden="true" size={17} />
            </button>
            <button className="layers-pill" type="button" aria-label="Toggle debug panel" onClick={onToggleDebug}>
              <Layers aria-hidden="true" size={16} />
              <span>Layers</span>
            </button>
          </div>
        </div>

        <MetricDeck
          currentYear={currentYear}
          snapshot={snapshot}
          timelineAnchors={timelineAnchors}
        />
        <OverlayLegend layers={layers} onLayerToggle={onLayerToggle} />
        <TimelineConsole
          activeAnchor={activeAnchor}
          currentYear={currentYear}
          maxYear={maxYear}
          minYear={minYear}
          snapshot={snapshot}
          timelineAnchors={timelineAnchors}
          onPlayTimeline={onPlayTimeline}
          onYearChange={onYearChange}
        />
        <div className="provider-note">{providerLabel}</div>
        {debugOpen ? (
          <aside className="debug-panel" aria-label="Debug panel">
            <strong>Debug panel</strong>
            <span>{currentYear}</span>
            <span>{snapshot.proceduralDensity.buildings.toFixed(2)} human footprint</span>
            <span>{snapshot.proceduralDensity.trees.toFixed(2)} wild layer</span>
          </aside>
        ) : null}
      </section>

      <WitnessPanel
        activeAnchor={activeAnchor}
        currentYear={currentYear}
        firstSource={firstSource}
        overlays={overlays}
        regions={regions}
        selectedSpeciesId={selectedSpeciesId}
        selectedZooId={selectedZooId}
        species={species}
        zoos={visibleZoos}
        onSelectSpecies={onSelectSpecies}
      />

      <section className="intelligence-grid" aria-label="Infogeographic intelligence panels">
        {bottomPanels}
      </section>
    </main>
  );
}

function NavigationRail() {
  return (
    <aside className="navigation-rail" aria-label="Console navigation">
      <div className="console-brand">
        <span>David Attenborough</span>
        <strong>A Life On Our Planet</strong>
      </div>
      <nav className="nav-stack">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <a className={item.active ? "nav-item active" : "nav-item"} href={`#${item.label.toLowerCase()}`} key={item.label}>
              <Icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="nav-footer">
        <Share2 aria-hidden="true" size={16} />
        <Download aria-hidden="true" size={16} />
      </div>
    </aside>
  );
}

function MetricDeck({
  currentYear,
  snapshot,
  timelineAnchors
}: {
  currentYear: number;
  snapshot: WorldSnapshot;
  timelineAnchors: TimelineAnchor[];
}) {
  const metricCards: Array<{
    key: MetricKey;
    title: string;
    value: string;
    unit: string;
    icon: typeof Users;
    accent: string;
    invert?: boolean;
  }> = [
    {
      key: "worldPopulationBillion",
      title: "World population",
      value: formatPopulation(snapshot.metrics.worldPopulationBillion),
      unit: "billion",
      icon: Users,
      accent: "#e2a928"
    },
    {
      key: "remainingWildSpacePercent",
      title: "Remaining wild space",
      value: formatPercent(snapshot.metrics.remainingWildSpacePercent),
      unit: "of Earth's land",
      icon: Trees,
      accent: "#a7c85a",
      invert: true
    },
    {
      key: "atmosphericCarbonPpm",
      title: "Atmospheric carbon",
      value: formatCarbon(snapshot.metrics.atmosphericCarbonPpm).replace(" ppm", ""),
      unit: "ppm CO2",
      icon: Cloud,
      accent: "#eda62d"
    },
    {
      key: "wildSpaceAcres",
      title: "Wild acreage",
      value: formatAcres(snapshot.metrics.wildSpaceAcres).replace(" acres", ""),
      unit: "acres",
      icon: Leaf,
      accent: "#b5cf5d",
      invert: true
    }
  ];

  return (
    <aside className="metric-deck" aria-label="Planet metrics">
      <div className="panel-heading">Planet state</div>
      {metricCards.map((card) => {
        const Icon = card.icon;
        const values = timelineAnchors.map((anchor) => anchor.metrics[card.key] ?? 0);
        const baseline = timelineAnchors.find((anchor) => anchor.year >= 1978) ?? timelineAnchors[0];
        const baselineValue = baseline.metrics[card.key];
        const currentValue = snapshot.metrics[card.key];
        const delta = computeDelta(currentValue, baselineValue, card.key, card.invert);

        return (
          <article className="metric-card" key={card.key}>
            <header>
              <span>
                <Icon aria-hidden="true" size={17} />
                {card.title}
              </span>
              <ChevronDown aria-hidden="true" size={14} />
            </header>
            <div className="metric-value">
              <strong>{card.value}</strong>
              <span>{card.unit}</span>
            </div>
            <p className={delta.kind}>{delta.label} since 1970</p>
            <Sparkline values={values} accent={card.accent} invert={card.invert} />
            <small>{currentYear}</small>
          </article>
        );
      })}
    </aside>
  );
}

function OverlayLegend({
  layers,
  onLayerToggle
}: {
  layers: LayerState;
  onLayerToggle: (layer: keyof LayerState) => void;
}) {
  return (
    <aside className="overlay-legend" aria-label="Layer controls">
      <div className="panel-heading">Map overlays</div>
      <div className="overlay-list">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const enabled = layers[item.key];

          return (
            <button
              className={enabled ? "overlay-toggle active" : "overlay-toggle"}
              data-testid={`layer-toggle-${item.key}`}
              type="button"
              aria-pressed={enabled}
              key={item.key}
              onClick={() => onLayerToggle(item.key)}
            >
              <Icon aria-hidden="true" size={15} />
              <span>{item.label}</span>
              <i aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function TimelineConsole({
  activeAnchor,
  currentYear,
  maxYear,
  minYear,
  snapshot,
  timelineAnchors,
  onPlayTimeline,
  onYearChange
}: {
  activeAnchor: TimelineAnchor;
  currentYear: number;
  maxYear: number;
  minYear: number;
  snapshot: WorldSnapshot;
  timelineAnchors: TimelineAnchor[];
  onPlayTimeline: () => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <section className="console-timeline" data-testid="timeline" aria-label="Timeline">
      <div className="timeline-rail">
        <input
          aria-label="Timeline year"
          className="timeline-range"
          max={maxYear}
          min={minYear}
          type="range"
          value={currentYear}
          onChange={(event) => onYearChange(Number(event.currentTarget.value))}
        />
        <button className="play-timeline" type="button" onClick={onPlayTimeline}>
          <Play aria-hidden="true" size={18} />
          <span>Play Timeline</span>
        </button>
      </div>

      <div className="timeline-key" aria-label="History key">
        {timelineAnchors.map((anchor) => (
          <button
            className={anchor.year === activeAnchor.year ? "active" : ""}
            data-testid={`timeline-year-${anchor.year}`}
            type="button"
            aria-label={`${anchor.year}: ${anchor.title}`}
            key={anchor.id}
            onClick={() => onYearChange(anchor.year)}
          >
            {anchor.year === maxYear ? `${anchor.year}` : anchor.year}
          </button>
        ))}
      </div>

      <div className="timeline-brief">
        <div className="year-chip" data-testid="timeline-current-year">{currentYear}</div>
        <div>
          <strong>{activeAnchor.title}</strong>
          <p>{activeAnchor.summary}</p>
        </div>
      </div>

      <table className="timeline-metrics" aria-label="Timeline metric table">
        <tbody>
          <TimelineRow
            label="Population (B)"
            icon={<Users aria-hidden="true" size={13} />}
            metric="worldPopulationBillion"
            anchors={timelineAnchors}
            activeYear={activeAnchor.year}
          />
          <TimelineRow
            label="Wild Space (%)"
            icon={<Trees aria-hidden="true" size={13} />}
            metric="remainingWildSpacePercent"
            anchors={timelineAnchors}
            activeYear={activeAnchor.year}
          />
          <TimelineRow
            label="Atmos. Carbon (PPM)"
            icon={<Cloud aria-hidden="true" size={13} />}
            metric="atmosphericCarbonPpm"
            anchors={timelineAnchors}
            activeYear={activeAnchor.year}
          />
          <tr>
            <th scope="row">
              <Leaf aria-hidden="true" size={13} />
              Wild Acreage
            </th>
            {timelineAnchors.map((anchor) => (
              <td className={anchor.year === activeAnchor.year ? "active" : ""} key={anchor.id}>
                {anchor.year === activeAnchor.year
                  ? formatAcres(snapshot.metrics.wildSpaceAcres).replace(" acres", "")
                  : formatTimelineMetric(anchor.metrics.wildSpaceAcres, "wildSpaceAcres")}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="timeline-hint">Drag timeline or select an anchor to explore planetary change.</p>
    </section>
  );
}

function TimelineRow({
  activeYear,
  anchors,
  icon,
  label,
  metric
}: {
  activeYear: number;
  anchors: TimelineAnchor[];
  icon: ReactNode;
  label: string;
  metric: MetricKey;
}) {
  return (
    <tr>
      <th scope="row">
        {icon}
        {label}
      </th>
      {anchors.map((anchor) => (
        <td className={anchor.year === activeYear ? "active" : ""} key={anchor.id}>
          {formatTimelineMetric(anchor.metrics[metric], metric)}
        </td>
      ))}
    </tr>
  );
}

function WitnessPanel({
  activeAnchor,
  currentYear,
  firstSource,
  overlays,
  regions,
  selectedSpeciesId,
  selectedZooId,
  species,
  zoos,
  onSelectSpecies
}: {
  activeAnchor: TimelineAnchor;
  currentYear: number;
  firstSource?: TimelineAnchor["sourceRefs"][number];
  overlays: ReferenceOverlay[];
  regions: RegionRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  species: SpeciesRecord[];
  zoos: ZooSite[];
  onSelectSpecies: (speciesId?: string) => void;
}) {
  const selectedSpecies = species.find((record) => record.id === selectedSpeciesId);
  const selectedZoo = zoos.find((record) => record.id === selectedZooId);
  const extinctSpecies = species.find((record) => record.status === "extinct");
  const sourceHref = firstSource?.url;

  return (
    <aside className="witness-panel" aria-label="Species and provenance drawer" data-testid="species-drawer">
      <header className="witness-tabs">
        <button className="active" type="button">My Witness</button>
        <button type="button">Stories</button>
        <button type="button">Insights</button>
        <X aria-hidden="true" size={18} />
      </header>

      <section className="witness-card">
        <div className="portrait-frame" aria-hidden="true">
          <span>DA</span>
        </div>
        <blockquote>
          <p>The natural world is the greatest source of excitement.</p>
          <cite>David Attenborough</cite>
        </blockquote>
      </section>
      <p className="witness-copy">
        Since 1954, the story moves from a field naturalist's witness to a planetary
        dashboard. This view follows how population, carbon, wild space, and species
        pressure change through {currentYear}.
      </p>
      <button className="audio-button" type="button">
        <AudioLines aria-hidden="true" size={16} />
        Listen to David's message
      </button>

      <section className="species-section">
        <div className="section-row">
          <h2>Species Spotlight</h2>
          <button
            className="link-button"
            type="button"
            data-testid="species-drawer-trigger"
            aria-expanded="true"
          >
            View all
            <ChevronRight aria-hidden="true" size={15} />
          </button>
        </div>
        <div className="species-list">
          {species.slice(0, 3).map((record, index) => (
            <SpeciesSpotlightCard
              active={record.id === selectedSpeciesId}
              index={index}
              key={record.id}
              record={record}
              onSelect={() => onSelectSpecies(record.id)}
            />
          ))}
        </div>
      </section>

      {extinctSpecies ? (
        <section className="extinct-section">
          <div className="section-row">
            <h2>Recently Extinct</h2>
            <button className="link-button" type="button">
              View all
              <ChevronRight aria-hidden="true" size={15} />
            </button>
          </div>
          <button
            className="extinct-card"
            type="button"
            onClick={() => onSelectSpecies(extinctSpecies.id)}
          >
            <span className="species-thumb extinct" aria-hidden="true" />
            <span>
              <strong>{extinctSpecies.name}</strong>
              <small>Last seen: 1989</small>
            </span>
          </button>
        </section>
      ) : null}

      <section className="selection-detail" aria-live="polite">
        <h2>{selectedSpecies?.name ?? selectedZoo?.name ?? "Witness context"}</h2>
        <p>{selectedSpecies?.summary ?? selectedZoo?.notes ?? activeAnchor.summary}</p>
        <div className="detail-tags">
          <span>{regions.length} regions</span>
          <span>{zoos.length} zoos</span>
          <span>{overlays.length} future overlays</span>
        </div>
        {sourceHref ? (
          <a href={sourceHref} target="_blank" rel="noreferrer">
            {firstSource?.label}
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        ) : null}
      </section>
    </aside>
  );
}

function SpeciesSpotlightCard({
  active,
  index,
  record,
  onSelect
}: {
  active: boolean;
  index: number;
  record: SpeciesRecord;
  onSelect: () => void;
}) {
  return (
    <button
      className={active ? "species-spotlight active" : "species-spotlight"}
      type="button"
      onClick={onSelect}
    >
      <span className={`species-thumb species-thumb-${index}`} aria-hidden="true" />
      <span className="species-copy">
        <strong>{record.name}</strong>
        <small>{latinHint(record.name)}</small>
        <span className={`status-text ${record.status}`}>{record.status}</span>
      </span>
      <span className="loss-readout">
        <strong>{spotlightLoss[record.id] ?? "42%"}</strong>
        <small>since 1970</small>
      </span>
    </button>
  );
}

function EarthRouteOverlay({ zoos }: { zoos: ZooSite[] }) {
  return (
    <div className="earth-overlay" aria-hidden="true">
      <svg className="route-svg" viewBox="0 0 1000 620" preserveAspectRatio="none">
        <path className="route route-gold" d="M130 420C290 355 356 192 518 206C634 216 686 330 870 284" />
        <path className="route route-green" d="M200 478C394 400 452 304 628 376C738 421 804 496 934 420" />
        <path className="route route-ash" d="M170 264C314 186 446 168 574 236C679 292 724 376 890 360" />
        <path className="route route-gold" d="M260 146C394 110 542 124 648 180C732 224 808 238 930 184" />
        {Array.from({ length: 13 }).map((_, index) => {
          const x = 205 + index * 58;
          const y = 302 + Math.sin(index * 1.15) * 92;

          return (
            <g className="route-animal" key={index} transform={`translate(${x} ${y})`}>
              <path d="M0 5h18l8-7 6 6h12l6 8-4 3-5-5-4 18h-5l-1-12h-17l-3 12h-5l1-14-10 5Z" />
            </g>
          );
        })}
      </svg>
      {routeLabels.map((marker, index) => (
        <div className="map-pin-label" style={{ left: marker.x, top: marker.y }} key={marker.label}>
          <PawPrint aria-hidden="true" size={16} />
          <span>
            {zoos[index]?.name.replace("ZSL ", "") ?? marker.label}
            <small>{marker.place}</small>
          </span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({
  accent,
  invert,
  values
}: {
  accent: string;
  invert?: boolean;
  values: number[];
}) {
  const cleanValues = values.filter((value) => Number.isFinite(value));
  const min = Math.min(...cleanValues);
  const max = Math.max(...cleanValues);
  const points = cleanValues
    .map((value, index) => {
      const x = cleanValues.length === 1 ? 0 : (index / (cleanValues.length - 1)) * 100;
      const ratio = max === min ? 0.5 : (value - min) / (max - min);
      const y = invert ? 16 + ratio * 34 : 50 - ratio * 34;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className="sparkline" role="img" aria-label="Metric trend" viewBox="0 0 100 64" preserveAspectRatio="none">
      <path d="M0 54H100" />
      <polyline points={points} style={{ stroke: accent }} />
    </svg>
  );
}

function computeDelta(
  current?: number,
  baseline?: number,
  metric?: MetricKey,
  invert?: boolean
) {
  if (current === undefined || baseline === undefined) {
    return { kind: "neutral", label: "tracking" };
  }

  const delta = current - baseline;
  const sign = delta >= 0 ? "+" : "-";
  const absolute = Math.abs(delta);
  const suffix =
    metric === "worldPopulationBillion"
      ? "B"
      : metric === "atmosphericCarbonPpm"
        ? "%"
        : metric === "wildSpaceAcres"
          ? "B"
          : "%";
  const label =
    metric === "atmosphericCarbonPpm"
      ? `${sign} ${Math.round((absolute / baseline) * 100)}%`
      : metric === "wildSpaceAcres"
        ? `${sign} ${(absolute / 1_000_000_000).toFixed(1)}B`
        : `${sign} ${absolute.toFixed(metric === "worldPopulationBillion" ? 1 : 0)}${suffix}`;
  const good = invert ? delta < 0 : delta <= 0;

  return {
    kind: good ? "delta-positive" : "delta-negative",
    label
  };
}

function formatTimelineMetric(value: number | undefined, metric: MetricKey) {
  if (value === undefined) {
    return "-";
  }

  if (metric === "worldPopulationBillion") {
    return value.toFixed(1);
  }

  if (metric === "atmosphericCarbonPpm") {
    return Math.round(value).toString();
  }

  if (metric === "wildSpaceAcres") {
    return (value / 1_000_000_000).toFixed(1);
  }

  if (metric === "speciesAtRiskCount" || metric === "extinctSpeciesCount") {
    return formatCount(value);
  }

  return Math.round(value).toString();
}

function latinHint(name: string) {
  const latinByName: Record<string, string> = {
    "Bornean orangutan": "Pongo pygmaeus",
    "Black rhinoceros": "Diceros bicornis",
    "Blue whale": "Balaenoptera musculus",
    "Golden toad": "Incilius periglenes",
    "Polar bear": "Ursus maritimus",
    "Reef manta ray": "Mobula alfredi"
  };

  return latinByName[name] ?? "Species record";
}
