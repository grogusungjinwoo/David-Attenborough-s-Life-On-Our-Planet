import type { MouseEvent, PointerEvent, ReactNode, Ref, WheelEvent } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Cloud,
  Crosshair,
  Download,
  ExternalLink,
  Globe2,
  Layers,
  Leaf,
  LineChart,
  Maximize2,
  Minimize2,
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
  Zap,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type {
  EditorialStory,
  GeoLayerRecord,
  GlobeActiveView,
  InsightCard,
  LayerState,
  MediaAsset,
  PrimarySection,
  ReferenceOverlay,
  RegionRecord,
  SearchRecord,
  SpeciesRecord,
  TimelineAnchor,
  WitnessTab,
  WildSpaceDefinition,
  WorldSnapshot,
  ZooSite
} from "../domain/types";
import { mediaPath } from "../data/media";
import { getRandomPlatoQuote } from "../data/philosophyQuotes";
import {
  formatAcres,
  formatCarbon,
  formatCount,
  formatPercent,
  formatPopulation
} from "../domain/formatters";

type AtlasConsoleProps = {
  activeAnchor: TimelineAnchor;
  activePrimarySection: PrimarySection;
  activeWitnessTab: WitnessTab;
  bottomPanels: ReactNode;
  currentYear: number;
  debugOpen: boolean;
  earthSurface: ReactNode;
  activeView: GlobeActiveView;
  geoLayers: GeoLayerRecord[];
  editorialStories: EditorialStory[];
  insightCards: InsightCard[];
  isFullscreenRequested: boolean;
  layers: LayerState;
  mediaAssets: MediaAsset[];
  overlays: ReferenceOverlay[];
  providerLabel: string;
  regions: RegionRecord[];
  searchQuery: string;
  searchResults: SearchRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  snapshot: WorldSnapshot;
  species: SpeciesRecord[];
  solutionBlocked: {
    title: string;
    summary: string;
  };
  timelineAnchors: TimelineAnchor[];
  wildSpaceDefinition: WildSpaceDefinition;
  wildSpaceDefinitionCaveat: string;
  wildSpaceDefinitionLabels: Record<WildSpaceDefinition, string>;
  zoos: ZooSite[];
  onLayerToggle: (layer: keyof LayerState) => void;
  onPlayTimeline: () => void;
  onActiveViewChange: (activeView: GlobeActiveView) => void;
  onActivePrimarySectionChange: (section: PrimarySection) => void;
  onActiveWitnessTabChange: (tab: WitnessTab) => void;
  onFullscreenRequestedChange: (requested: boolean) => void;
  onPanGlobeView: (longitudeDeltaDeg: number, latitudeDeltaDeg: number) => void;
  onSearchQueryChange: (query: string) => void;
  onWildSpaceDefinitionChange: (definition: WildSpaceDefinition) => void;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
  onToggleDebug: () => void;
  onYearChange: (year: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

type MetricKey = keyof WorldSnapshot["metrics"];

const navItems: Array<{ id: PrimarySection; label: string; icon: typeof Globe2 }> = [
  { id: "overview", label: "Overview", icon: Globe2 },
  { id: "timeline", label: "Timeline", icon: LineChart },
  { id: "places", label: "Places", icon: MapPin },
  { id: "species", label: "Species", icon: PawPrint },
  { id: "stories", label: "Stories", icon: MessageSquare },
  { id: "solutions", label: "Solutions", icon: Sprout },
  { id: "search", label: "Search", icon: Search }
];

const layerItems: Array<{
  key: keyof LayerState;
  label: string;
  icon: typeof Layers;
}> = [
  { key: "vegetation", label: "Wild Space", icon: Trees },
  { key: "settlements", label: "Human Footprint", icon: Users },
  { key: "topographicRelief", label: "Topographic Relief", icon: Waves },
  { key: "adminBoundaries", label: "Admin Boundaries", icon: MapPin },
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

function shouldSkipStagePan(target: EventTarget) {
  return target instanceof Element && Boolean(target.closest("input, select, .console-timeline"));
}

export function AtlasConsole({
  activeAnchor,
  activePrimarySection,
  activeWitnessTab,
  bottomPanels,
  currentYear,
  debugOpen,
  earthSurface,
  activeView,
  geoLayers,
  editorialStories,
  insightCards,
  isFullscreenRequested,
  layers,
  mediaAssets,
  overlays,
  providerLabel,
  regions,
  searchQuery,
  searchResults,
  selectedSpeciesId,
  selectedZooId,
  snapshot,
  species,
  solutionBlocked,
  timelineAnchors,
  wildSpaceDefinition,
  wildSpaceDefinitionCaveat,
  wildSpaceDefinitionLabels,
  zoos,
  onLayerToggle,
  onPlayTimeline,
  onActiveViewChange,
  onActivePrimarySectionChange,
  onActiveWitnessTabChange,
  onFullscreenRequestedChange,
  onPanGlobeView,
  onSearchQueryChange,
  onWildSpaceDefinitionChange,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo,
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
  const shellRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const stageDragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const fullscreenSupported =
    typeof document !== "undefined" && Boolean(document.fullscreenEnabled);
  const panStageDrag = (clientX: number, clientY: number, pointerId: number) => {
    if (!stageDragRef.current || stageDragRef.current.pointerId !== pointerId) {
      return;
    }

    const deltaX = clientX - stageDragRef.current.x;
    const deltaY = clientY - stageDragRef.current.y;
    stageDragRef.current = { x: clientX, y: clientY, pointerId };

    if (Math.abs(deltaX) + Math.abs(deltaY) > 0) {
      onPanGlobeView(-deltaX * 0.18, deltaY * 0.12);
    }
  };
  const handleStagePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || shouldSkipStagePan(event.target)) {
      return;
    }

    stageDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId
    };
  };
  const handleStagePointerMove = (event: PointerEvent<HTMLElement>) => {
    panStageDrag(event.clientX, event.clientY, event.pointerId);
  };
  const handleStageMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || shouldSkipStagePan(event.target)) {
      return;
    }

    stageDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: -1
    };
  };
  const handleStageMouseMove = (event: MouseEvent<HTMLElement>) => {
    panStageDrag(event.clientX, event.clientY, -1);
  };
  const handleStageWheel = (event: WheelEvent<HTMLElement>) => {
    if (shouldSkipStagePan(event.target)) {
      return;
    }

    if (event.deltaY < 0) {
      onZoomIn();
    } else {
      onZoomOut();
    }
  };

  useEffect(() => {
    if (activePrimarySection !== "timeline") {
      return;
    }

    timelineRef.current?.focus({ preventScroll: true });
    timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activePrimarySection]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleFullscreenChange = () => {
      onFullscreenRequestedChange(document.fullscreenElement === shellRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [onFullscreenRequestedChange]);

  useEffect(() => {
    if (!fullscreenSupported || !shellRef.current) {
      return;
    }

    if (isFullscreenRequested && document.fullscreenElement !== shellRef.current) {
      shellRef.current.requestFullscreen().catch(() => onFullscreenRequestedChange(false));
    }

    if (!isFullscreenRequested && document.fullscreenElement === shellRef.current) {
      document.exitFullscreen().catch(() => undefined);
    }
  }, [fullscreenSupported, isFullscreenRequested, onFullscreenRequestedChange]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleFullscreenEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (document.fullscreenElement === shellRef.current || (!fullscreenSupported && isFullscreenRequested)) {
        onFullscreenRequestedChange(false);
      }
    };

    document.addEventListener("keydown", handleFullscreenEscape, true);

    return () => document.removeEventListener("keydown", handleFullscreenEscape, true);
  }, [fullscreenSupported, isFullscreenRequested, onFullscreenRequestedChange]);

  return (
    <main
      className={[
        "planet-app",
        "atlas-console",
        activePrimarySection !== "overview" ? "section-active" : "",
        isFullscreenRequested && !fullscreenSupported ? "fullscreen-fallback" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-active-section={activePrimarySection}
      data-testid="app-shell"
      ref={shellRef}
    >
      <NavigationRail
        activeSection={activePrimarySection}
        onSectionChange={onActivePrimarySectionChange}
      />

      <section
        className="earth-stage"
        aria-label="David Attenborough Earth witness console"
        onPointerDownCapture={handleStagePointerDown}
        onPointerMoveCapture={handleStagePointerMove}
        onPointerUpCapture={() => {
          stageDragRef.current = null;
        }}
        onPointerCancelCapture={() => {
          stageDragRef.current = null;
        }}
        onMouseDownCapture={handleStageMouseDown}
        onMouseMoveCapture={handleStageMouseMove}
        onMouseUpCapture={() => {
          stageDragRef.current = null;
        }}
        onMouseLeave={() => {
          stageDragRef.current = null;
        }}
        onWheelCapture={handleStageWheel}
      >
        {earthSurface}
        <EarthRouteOverlay zoos={visibleZoos} />
        <div className="stage-toolbar" aria-label="Earth camera controls">
          <label className="view-select">
            <span>View</span>
            <select
              aria-label="Earth view"
              value={activeView}
              onChange={(event) =>
                onActiveViewChange(event.currentTarget.value as GlobeActiveView)
              }
            >
              <option value="space">Earth from Space</option>
              <option value="topographic">Topographic</option>
              <option value="wild-evidence">Wild Space Evidence</option>
              <option value="admin-regions">Administrative Regions</option>
            </select>
            <ChevronDown aria-hidden="true" size={14} />
          </label>
          <div className="tool-cluster">
            <button type="button" aria-label="Pan west" onClick={() => onPanGlobeView(-6, 0)}>
              <ArrowLeft aria-hidden="true" size={15} />
            </button>
            <button type="button" aria-label="Pan north" onClick={() => onPanGlobeView(0, 5)}>
              <ArrowUp aria-hidden="true" size={15} />
            </button>
            <button type="button" aria-label="Pan south" onClick={() => onPanGlobeView(0, -5)}>
              <ArrowDown aria-hidden="true" size={15} />
            </button>
            <button type="button" aria-label="Pan east" onClick={() => onPanGlobeView(6, 0)}>
              <ArrowRight aria-hidden="true" size={15} />
            </button>
            <button type="button" aria-label="Zoom in" onClick={onZoomIn}>
              <ZoomIn aria-hidden="true" size={17} />
            </button>
            <button type="button" aria-label="Reset view" onClick={onResetView}>
              <Crosshair aria-hidden="true" size={17} />
            </button>
            <button type="button" aria-label="Zoom out" onClick={onZoomOut}>
              <ZoomOut aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              aria-label={isFullscreenRequested ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={() => onFullscreenRequestedChange(!isFullscreenRequested)}
            >
              {isFullscreenRequested ? (
                <Minimize2 aria-hidden="true" size={17} />
              ) : (
                <Maximize2 aria-hidden="true" size={17} />
              )}
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
          wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveat}
        />
        <WildSpaceDefinitionSwitch
          caveat={wildSpaceDefinitionCaveat}
          labels={wildSpaceDefinitionLabels}
          value={wildSpaceDefinition}
          onChange={onWildSpaceDefinitionChange}
        />
        <OverlayLegend layers={layers} onLayerToggle={onLayerToggle} />
        <TimelineConsole
          activeAnchor={activeAnchor}
          currentYear={currentYear}
          maxYear={maxYear}
          minYear={minYear}
          panelRef={timelineRef}
          highlighted={activePrimarySection === "timeline"}
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
        activePrimarySection={activePrimarySection}
        activeWitnessTab={activeWitnessTab}
        currentYear={currentYear}
        editorialStories={editorialStories}
        firstSource={firstSource}
        overlays={overlays}
        geoLayers={geoLayers}
        insightCards={insightCards}
        mediaAssets={mediaAssets}
        regions={regions}
        searchQuery={searchQuery}
        searchResults={searchResults}
        solutionBlocked={solutionBlocked}
        wildSpaceDefinition={wildSpaceDefinition}
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveat}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        selectedSpeciesId={selectedSpeciesId}
        selectedZooId={selectedZooId}
        species={species}
        zoos={visibleZoos}
        onActivePrimarySectionChange={onActivePrimarySectionChange}
        onActiveWitnessTabChange={onActiveWitnessTabChange}
        onSearchQueryChange={onSearchQueryChange}
        onSelectRegion={onSelectRegion}
        onSelectSpecies={onSelectSpecies}
        onSelectZoo={onSelectZoo}
      />

      <section className="intelligence-grid" aria-label="Infogeographic intelligence panels">
        {bottomPanels}
      </section>
    </main>
  );
}

function NavigationRail({
  activeSection,
  onSectionChange
}: {
  activeSection: PrimarySection;
  onSectionChange: (section: PrimarySection) => void;
}) {
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
            <button
              className={item.id === activeSection ? "nav-item active" : "nav-item"}
              type="button"
              aria-label={item.label}
              aria-current={item.id === activeSection ? "page" : undefined}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </button>
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
  timelineAnchors,
  wildSpaceDefinitionCaveat
}: {
  currentYear: number;
  snapshot: WorldSnapshot;
  timelineAnchors: TimelineAnchor[];
  wildSpaceDefinitionCaveat: string;
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
      <section className="surface-readout" aria-label="Historical Earth surface state">
        <header>
          <strong>{snapshot.earthSurface.confidence}</strong>
          <span>{snapshot.earthSurface.projection}</span>
        </header>
        <dl>
          <div>
            <dt>Forest green</dt>
            <dd>{snapshot.earthSurface.forestGreenCoveragePercent.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Crop/pasture</dt>
            <dd>{snapshot.earthSurface.cropPastureCoveragePercent.toFixed(1)}%</dd>
          </div>
          <div>
            <dt>Weather</dt>
            <dd>{formatIndex(snapshot.earthSurface.weatherEnergyIndex)}</dd>
          </div>
          <div>
            <dt>Ocean heat</dt>
            <dd>{formatIndex(snapshot.earthSurface.oceanHeatIndex)}</dd>
          </div>
        </dl>
        <p>{snapshot.earthSurface.summary}</p>
      </section>
      <p className="metric-caveat">{wildSpaceDefinitionCaveat}</p>
    </aside>
  );
}

function WildSpaceDefinitionSwitch({
  caveat,
  labels,
  value,
  onChange
}: {
  caveat: string;
  labels: Record<WildSpaceDefinition, string>;
  value: WildSpaceDefinition;
  onChange: (definition: WildSpaceDefinition) => void;
}) {
  const options = Object.entries(labels) as Array<[WildSpaceDefinition, string]>;

  return (
    <aside className="definition-switch" aria-label="Wild space definition">
      <div className="panel-heading">Wild space definition</div>
      <div className="definition-buttons">
        {options.map(([id, label]) => (
          <button
            type="button"
            className={value === id ? "active" : ""}
            aria-pressed={value === id}
            key={id}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <p>{caveat}</p>
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
  highlighted,
  maxYear,
  minYear,
  panelRef,
  snapshot,
  timelineAnchors,
  onPlayTimeline,
  onYearChange
}: {
  activeAnchor: TimelineAnchor;
  currentYear: number;
  highlighted: boolean;
  maxYear: number;
  minYear: number;
  panelRef: Ref<HTMLElement>;
  snapshot: WorldSnapshot;
  timelineAnchors: TimelineAnchor[];
  onPlayTimeline: () => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <section
      className={highlighted ? "console-timeline highlighted" : "console-timeline"}
      data-testid="timeline"
      aria-label="Timeline"
      ref={panelRef}
      tabIndex={-1}
    >
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
  activePrimarySection,
  activeWitnessTab,
  currentYear,
  editorialStories,
  firstSource,
  geoLayers,
  insightCards,
  mediaAssets,
  overlays,
  regions,
  searchQuery,
  searchResults,
  selectedSpeciesId,
  selectedZooId,
  species,
  solutionBlocked,
  wildSpaceDefinition,
  wildSpaceDefinitionCaveat,
  wildSpaceDefinitionLabels,
  zoos,
  onActivePrimarySectionChange,
  onActiveWitnessTabChange,
  onSearchQueryChange,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo
}: {
  activeAnchor: TimelineAnchor;
  activePrimarySection: PrimarySection;
  activeWitnessTab: WitnessTab;
  currentYear: number;
  editorialStories: EditorialStory[];
  firstSource?: TimelineAnchor["sourceRefs"][number];
  geoLayers: GeoLayerRecord[];
  insightCards: InsightCard[];
  mediaAssets: MediaAsset[];
  overlays: ReferenceOverlay[];
  regions: RegionRecord[];
  searchQuery: string;
  searchResults: SearchRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  species: SpeciesRecord[];
  solutionBlocked: {
    title: string;
    summary: string;
  };
  wildSpaceDefinition: WildSpaceDefinition;
  wildSpaceDefinitionCaveat: string;
  wildSpaceDefinitionLabels: Record<WildSpaceDefinition, string>;
  zoos: ZooSite[];
  onActivePrimarySectionChange: (section: PrimarySection) => void;
  onActiveWitnessTabChange: (tab: WitnessTab) => void;
  onSearchQueryChange: (query: string) => void;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
}) {
  const selectedSpecies = species.find((record) => record.id === selectedSpeciesId);
  const selectedZoo = zoos.find((record) => record.id === selectedZooId);
  const extinctSpecies = species.find((record) => record.status === "extinct");
  const sourceHref = firstSource?.url;
  const portrait = mediaAssets.find((asset) => asset.subjectId === "david-attenborough");
  const topSpecies = [...species].sort((a, b) => getDisplayPriority(a) - getDisplayPriority(b));
  const panelMode = activePrimarySection === "overview" || activePrimarySection === "timeline"
    ? "tabs"
    : "section";
  const [platoQuote, setPlatoQuote] = useState(() => getRandomPlatoQuote());

  useEffect(() => {
    const quoteTimer = window.setInterval(() => {
      setPlatoQuote((currentQuote) => getRandomPlatoQuote(currentQuote.id));
    }, 12_000);

    return () => window.clearInterval(quoteTimer);
  }, []);

  return (
    <aside className="witness-panel" aria-label="Species and provenance drawer" data-testid="species-drawer">
      <header className="witness-tabs">
        <button
          className={panelMode === "tabs" && activeWitnessTab === "witness" ? "active" : ""}
          type="button"
          onClick={() => {
            onActivePrimarySectionChange("overview");
            onActiveWitnessTabChange("witness");
          }}
        >
          My Witness
        </button>
        <button
          className={panelMode === "tabs" && activeWitnessTab === "stories" ? "active" : ""}
          type="button"
          onClick={() => {
            onActivePrimarySectionChange("overview");
            onActiveWitnessTabChange("stories");
          }}
        >
          Stories
        </button>
        <button
          className={panelMode === "tabs" && activeWitnessTab === "insights" ? "active" : ""}
          type="button"
          onClick={() => {
            onActivePrimarySectionChange("overview");
            onActiveWitnessTabChange("insights");
          }}
        >
          Insights
        </button>
        <X aria-hidden="true" size={18} />
      </header>

      {panelMode === "section" ? (
        <PrimarySectionPanel
          activeSection={activePrimarySection}
          editorialStories={editorialStories}
          insightCards={insightCards}
          mediaAssets={mediaAssets}
          regions={regions}
          searchQuery={searchQuery}
          searchResults={searchResults}
          solutionBlocked={solutionBlocked}
          species={topSpecies}
          zoos={zoos}
          onSearchQueryChange={onSearchQueryChange}
          onSectionChange={onActivePrimarySectionChange}
          onSelectRegion={onSelectRegion}
          onSelectSpecies={onSelectSpecies}
          onSelectZoo={onSelectZoo}
        />
      ) : activeWitnessTab === "stories" ? (
        <StoryList stories={editorialStories} species={species} />
      ) : activeWitnessTab === "insights" ? (
        <InsightList insightCards={insightCards} />
      ) : (
        <>
          <section className="witness-card">
            {portrait?.localPath ? (
              <figure className="portrait-frame">
                <img src={mediaPath(portrait.localPath)} alt={portrait.alt} />
              </figure>
            ) : (
              <div className="portrait-frame" aria-hidden="true">
                <span>DA</span>
              </div>
            )}
            <blockquote>
              <p>
                A lifetime of looking closely becomes a dashboard of choices: what remains wild,
                what is under pressure, and what can still recover.
              </p>
              <cite>David Attenborough witness layer</cite>
            </blockquote>
          </section>
          {portrait ? <p className="media-credit">{portrait.attribution}</p> : null}
          <p className="witness-copy">
            The current year is {currentYear}. This view follows how population, carbon,
            wild space, and species pressure change around the manuscript's witness story.
            Manuscript-derived cards are paraphrased and page-referenced.
          </p>
          <button className="audio-button" type="button">
            <AudioLines aria-hidden="true" size={16} />
            Listen to David's message
          </button>

          <aside className="philosophy-pop" aria-label="Random Plato philosophy note">
            <span>Philosophy note</span>
            <p>{platoQuote.text}</p>
            <cite>
              {platoQuote.author}
              <small>{platoQuote.context}</small>
            </cite>
          </aside>

          <section className="species-section">
            <div className="section-row">
              <h2>Species Spotlight</h2>
              <button
                className="link-button"
                type="button"
                data-testid="species-drawer-trigger"
                aria-expanded={activePrimarySection === "species"}
                onClick={() => onActivePrimarySectionChange("species")}
              >
                View all
                <ChevronRight aria-hidden="true" size={15} />
              </button>
            </div>
            <div className="species-list">
              {topSpecies.slice(0, 4).map((record, index) => (
                <SpeciesSpotlightCard
                  active={record.id === selectedSpeciesId}
                  index={index}
                  key={record.id}
                  media={mediaAssets.find((asset) => asset.id === getSpeciesImageAssetId(record))}
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
                <button
                  className="link-button"
                  type="button"
                  onClick={() => onActivePrimarySectionChange("species")}
                >
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
            <div className="evidence-badges" aria-label="Evidence badges">
              <span>narrative</span>
              <span>derived</span>
              <span>measured</span>
              <span>simulated</span>
            </div>
            <p className="definition-caveat">
              <strong>{wildSpaceDefinitionLabels[wildSpaceDefinition]}</strong>
              {wildSpaceDefinitionCaveat}
            </p>
            <div className="detail-tags">
              <span>{regions.length} regions</span>
              <span>{zoos.length} zoos</span>
              <span>{overlays.length} future overlays</span>
              <span>{geoLayers.length} evidence layers</span>
            </div>
            {sourceHref ? (
              <a href={sourceHref} target="_blank" rel="noreferrer">
                {firstSource?.label}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            ) : null}
          </section>
        </>
      )}
    </aside>
  );
}

function PrimarySectionPanel({
  activeSection,
  editorialStories,
  insightCards,
  mediaAssets,
  regions,
  searchQuery,
  searchResults,
  solutionBlocked,
  species,
  zoos,
  onSearchQueryChange,
  onSectionChange,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo
}: {
  activeSection: PrimarySection;
  editorialStories: EditorialStory[];
  insightCards: InsightCard[];
  mediaAssets: MediaAsset[];
  regions: RegionRecord[];
  searchQuery: string;
  searchResults: SearchRecord[];
  solutionBlocked: { title: string; summary: string };
  species: SpeciesRecord[];
  zoos: ZooSite[];
  onSearchQueryChange: (query: string) => void;
  onSectionChange: (section: PrimarySection) => void;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
}) {
  if (activeSection === "places") {
    return (
      <section className="primary-panel" aria-label="Places directory">
        <PanelHeader title="Places" summary="Regions, zoos, and story locations connected to the atlas." />
        <div className="directory-list">
          {regions.map((region) => (
            <button
              className="directory-card"
              type="button"
              key={region.id}
              onClick={() => onSelectRegion(region.id)}
            >
              <MapPin aria-hidden="true" size={16} />
              <span>
                <strong>{region.name}</strong>
                <small>{region.biome} / {region.summary}</small>
              </span>
            </button>
          ))}
          {zoos.map((zoo) => (
            <button
              className="directory-card"
              type="button"
              key={zoo.id}
              onClick={() => onSelectZoo(zoo.id)}
            >
              <PawPrint aria-hidden="true" size={16} />
              <span>
                <strong>{zoo.name}</strong>
                <small>{zoo.openedYear ? `Opened ${zoo.openedYear}` : "Conservation site"} / {zoo.notes}</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (activeSection === "species") {
    return (
      <section className="primary-panel" aria-label="Species catalog">
        <PanelHeader title="Species" summary="Recognizable species with status, habitat, imagery, and source trails." />
        <div className="catalog-grid">
          {species.map((record) => {
            const media = mediaAssets.find((asset) => asset.id === getSpeciesImageAssetId(record));

            return (
              <button
                className="species-profile-card"
                type="button"
                key={record.id}
                onClick={() => onSelectSpecies(record.id)}
              >
                {media?.localPath ? <img src={mediaPath(media.localPath)} alt={media.alt} /> : null}
                <span>
                  <strong>{record.name}</strong>
                  <small>{getScientificName(record)}</small>
                  <em>{record.status}</em>
                </span>
                <p>{record.summary}</p>
                {media ? <small className="media-credit">{media.credit} / {media.license}</small> : null}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (activeSection === "stories") {
    return (
      <section className="primary-panel" aria-label="Story browser">
        <PanelHeader title="Stories" summary="Paraphrased manuscript-grounded story cards from the supplied excerpt." />
        <StoryList stories={editorialStories} species={species} />
      </section>
    );
  }

  if (activeSection === "solutions") {
    return (
      <section className="primary-panel" aria-label="Solutions">
        <PanelHeader title="Solutions" summary="The section is ready, but its manuscript source pages are not in the local excerpt." />
        <article className="blocked-card">
          <Sprout aria-hidden="true" size={20} />
          <h2>{solutionBlocked.title}</h2>
          <p>{solutionBlocked.summary}</p>
          <small>No Part Three solution cards are shipped until source pages are supplied.</small>
        </article>
      </section>
    );
  }

  if (activeSection === "search") {
    return (
      <section className="primary-panel" aria-label="Global search">
        <PanelHeader title="Search" summary="Search species, places, manuscript stories, insights, and source records." />
        <label className="search-box">
          <Search aria-hidden="true" size={16} />
          <input
            type="search"
            value={searchQuery}
            placeholder="Search orangutan, Pripyat, rewild, carbon..."
            aria-label="Search atlas content"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <button
                className="search-result"
                type="button"
                key={`${result.type}-${result.id}`}
                onClick={() => onSectionChange(result.targetSection)}
              >
                <span>{result.type}</span>
                <strong>{result.title}</strong>
                <small>{result.summary}</small>
              </button>
            ))
          ) : (
            <p className="empty-note">Enter a search term to explore the atlas index.</p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="primary-panel" aria-label="Overview insights">
      <PanelHeader title="Insights" summary="Computed observations from the current dashboard snapshot." />
      <InsightList insightCards={insightCards} />
    </section>
  );
}

function PanelHeader({ title, summary }: { title: string; summary: string }) {
  return (
    <header className="primary-panel-header">
      <h2>{title}</h2>
      <p>{summary}</p>
    </header>
  );
}

function StoryList({ stories, species }: { stories: EditorialStory[]; species: SpeciesRecord[] }) {
  return (
    <div className="story-card-list">
      {stories.map((story) => (
        <article className="story-card" key={story.id}>
          <h2>{story.title}</h2>
          <p>{story.summary}</p>
          <div className="detail-tags">
            {story.manuscriptPageRefs.map((pageRef) => (
              <span key={`${story.id}-${pageRef.pdfPage}`}>
                PDF p. {pageRef.pdfPage}
                {pageRef.printedPage ? ` / printed p. ${pageRef.printedPage}` : ""}
              </span>
            ))}
          </div>
          <small>
            Species links:{" "}
            {story.relatedSpeciesIds
              .map((speciesId) => species.find((record) => record.id === speciesId)?.name)
              .filter(Boolean)
              .join(", ") || "contextual"}
          </small>
        </article>
      ))}
    </div>
  );
}

function InsightList({ insightCards }: { insightCards: InsightCard[] }) {
  return (
    <div className="insight-card-list">
      {insightCards.map((insight) => (
        <article className={`insight-card severity-${insight.severity}`} key={insight.id}>
          <h2>{insight.title}</h2>
          <p>{insight.body}</p>
          <small>{insight.relatedMetric ?? "editorial"}</small>
        </article>
      ))}
    </div>
  );
}

function SpeciesSpotlightCard({
  active,
  index,
  media,
  record,
  onSelect
}: {
  active: boolean;
  index: number;
  media?: MediaAsset;
  record: SpeciesRecord;
  onSelect: () => void;
}) {
  return (
    <button
      className={active ? "species-spotlight active" : "species-spotlight"}
      type="button"
      onClick={onSelect}
    >
      {media?.localPath ? (
        <img className="species-thumb" src={mediaPath(media.localPath)} alt={media.alt} />
      ) : (
        <span className={`species-thumb species-thumb-${index}`} aria-hidden="true" />
      )}
      <span className="species-copy">
        <strong>{record.name}</strong>
        <small>{getScientificName(record)}</small>
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

function formatIndex(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getSpeciesImageAssetId(record: SpeciesRecord) {
  return (record as Partial<{ imageAssetId: string }>).imageAssetId;
}

function getScientificName(record: SpeciesRecord) {
  return (record as Partial<{ scientificName: string }>).scientificName ?? "Species record";
}

function getDisplayPriority(record: SpeciesRecord) {
  return (record as Partial<{ displayPriority: number }>).displayPriority ?? 99;
}
