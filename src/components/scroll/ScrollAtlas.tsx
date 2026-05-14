import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bug,
  ChevronRight,
  Globe2,
  Layers,
  Leaf,
  LineChart,
  MapPin,
  Maximize2,
  Minimize2,
  PawPrint,
  Play,
  Search,
  Sprout,
  Trees,
  Users,
  Waves,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type {
  EditorialStory,
  ChapterEvidencePanelId,
  ChapterVisualRecord,
  GeoLayerRecord,
  GlobeActiveView,
  InsightCard,
  LayerState,
  MediaAsset,
  PrimarySection,
  RegionRecord,
  ScrollChapterRecord,
  SearchRecord,
  SpeciesProfile,
  TimelineAnchor,
  WildSpaceDefinition,
  WorldSnapshot,
  ZooSite
} from "../../domain/types";
import type { EarthViewMode } from "../../state/usePlanetStore";
import {
  formatAcres,
  formatCarbon,
  formatPercent,
  formatPopulation
} from "../../domain/formatters";
import { mediaPath } from "../../data/media";
import {
  getNearestScrollChapter,
  TimeScrollController
} from "./TimeScrollController";

type ScrollAtlasProps = {
  activeAnchor: TimelineAnchor;
  activePrimarySection: PrimarySection;
  activeScrollChapterId?: string;
  activeView: GlobeActiveView;
  bottomPanels: ReactNode;
  chapterVisuals: ChapterVisualRecord[];
  currentYear: number;
  debugOpen: boolean;
  earthSurface: ReactNode;
  evidencePanels?: Partial<Record<ChapterEvidencePanelId, ReactNode>>;
  renderEvidencePanel?: (panelId: ChapterEvidencePanelId, year: number) => ReactNode;
  editorialStories: EditorialStory[];
  geoLayers: GeoLayerRecord[];
  insightCards: InsightCard[];
  isFullscreenRequested: boolean;
  layers: LayerState;
  mediaAssets: MediaAsset[];
  scrollChapters: ScrollChapterRecord[];
  searchQuery: string;
  searchResults: SearchRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  sourcePanel?: ReactNode;
  snapshot: WorldSnapshot;
  regions: RegionRecord[];
  species: SpeciesProfile[];
  timelineAnchors: TimelineAnchor[];
  viewMode: EarthViewMode;
  wildSpaceDefinition: WildSpaceDefinition;
  wildSpaceDefinitionCaveat: string;
  wildSpaceDefinitionLabels: Record<WildSpaceDefinition, string>;
  zoos: ZooSite[];
  stageDrawerContent?: ReactNode;
  onActivePrimarySectionChange: (section: PrimarySection) => void;
  onActiveViewChange: (activeView: GlobeActiveView) => void;
  onFullscreenRequestedChange: (requested: boolean) => void;
  onLayerToggle: (layer: keyof LayerState) => void;
  onPlayTimeline: () => void;
  onScrollChapterSelect: (chapter: ScrollChapterRecord) => void;
  onSearchQueryChange: (query: string) => void;
  onViewModeChange: (viewMode: EarthViewMode) => void;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
  onToggleDebug: () => void;
  onWildSpaceDefinitionChange: (definition: WildSpaceDefinition) => void;
  onYearChange: (year: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
};

const navItems: Array<{ id: PrimarySection; label: string; icon: typeof Globe2 }> = [
  { id: "overview", label: "Overview", icon: Globe2 },
  { id: "timeline", label: "Timeline", icon: LineChart },
  { id: "places", label: "Places", icon: MapPin },
  { id: "species", label: "Species", icon: PawPrint },
  { id: "stories", label: "Stories", icon: Leaf },
  { id: "solutions", label: "Solutions", icon: Sprout },
  { id: "search", label: "Search", icon: Search }
];

const layerItems: Array<{ key: keyof LayerState; label: string; icon: typeof Layers }> = [
  { key: "vegetation", label: "Wild Space", icon: Trees },
  { key: "settlements", label: "Human Footprint", icon: Users },
  { key: "topographicRelief", label: "Topographic Relief", icon: Waves },
  { key: "adminBoundaries", label: "Admin Boundaries", icon: MapPin },
  { key: "oceans", label: "Water Systems", icon: Waves },
  { key: "species", label: "Species", icon: PawPrint },
  { key: "zoos", label: "Zoos", icon: MapPin },
  { key: "energy", label: "Energy Stress", icon: Layers }
];

export function ScrollAtlas({
  activeAnchor,
  activePrimarySection,
  activeScrollChapterId,
  activeView,
  bottomPanels,
  chapterVisuals,
  currentYear,
  debugOpen,
  earthSurface,
  evidencePanels = {},
  renderEvidencePanel,
  editorialStories,
  geoLayers,
  insightCards,
  isFullscreenRequested,
  layers,
  mediaAssets,
  scrollChapters,
  searchQuery,
  searchResults,
  selectedSpeciesId,
  selectedZooId,
  sourcePanel,
  snapshot,
  regions,
  species,
  timelineAnchors,
  viewMode,
  wildSpaceDefinition,
  wildSpaceDefinitionCaveat,
  wildSpaceDefinitionLabels,
  zoos,
  stageDrawerContent,
  onActivePrimarySectionChange,
  onActiveViewChange,
  onFullscreenRequestedChange,
  onLayerToggle,
  onPlayTimeline,
  onScrollChapterSelect,
  onSearchQueryChange,
  onViewModeChange,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo,
  onToggleDebug,
  onWildSpaceDefinitionChange,
  onYearChange,
  onZoomIn,
  onZoomOut,
  onResetView
}: ScrollAtlasProps) {
  const [stageUiMinimized, setStageUiMinimized] = useState(true);
  const chapterScrollerRef = useRef<HTMLElement | null>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollRafRef = useRef<number | null>(null);
  const activeChapter =
    scrollChapters.find((chapter) => chapter.id === activeScrollChapterId) ??
    scrollChapters.find((chapter) => chapter.year === currentYear) ??
    scrollChapters.at(-1);
  const selectedZoo = zoos.find((zoo) => zoo.id === selectedZooId);
  const selectedSpecies = species.find((record) => record.id === selectedSpeciesId);
  const portrait = mediaAssets.find((asset) => asset.subjectId === "david-attenborough");
  const visibleZoos = zoos.filter((zoo) => !zoo.openedYear || zoo.openedYear <= currentYear);
  const sourceSummary = activeAnchor.sourceRefs.slice(0, 3).map((source) => source.label);
  const rootClassName = [
    "scroll-atlas",
    isFullscreenRequested ? "fullscreen-requested" : "",
    stageUiMinimized ? "stage-ui-minimized" : "stage-ui-expanded"
  ]
    .filter(Boolean)
    .join(" ");

  const scrollChapterIntoView = (chapter: ScrollChapterRecord) => {
    const index = scrollChapters.findIndex((record) => record.id === chapter.id);
    const scroller = chapterScrollerRef.current;
    const chapterNode = index >= 0 ? chapterRefs.current[index] : undefined;

    if (!scroller || !chapterNode) {
      return;
    }

    scroller.scrollTo({
      top: Math.max(0, chapterNode.offsetTop - scroller.clientHeight * 0.16),
      behavior: "smooth"
    });
  };

  const handleTimelineChapterSelect = (chapter: ScrollChapterRecord) => {
    onScrollChapterSelect(chapter);
    scrollChapterIntoView(chapter);
  };

  const handleManualYearChange = (year: number) => {
    onYearChange(year);

    const nearestChapter = getNearestScrollChapter(scrollChapters, year);

    if (nearestChapter) {
      onScrollChapterSelect(nearestChapter);
      scrollChapterIntoView(nearestChapter);
    }
  };
  const selectChapterFromRailPosition = () => {
    const scroller = chapterScrollerRef.current;

    if (!scroller || !isScrollableRail(scroller)) {
      return;
    }

    const readingLine = scroller.scrollTop + scroller.clientHeight * 0.42;
    let closestChapter: ScrollChapterRecord | undefined;
    let closestDistance = Number.POSITIVE_INFINITY;

    chapterRefs.current.forEach((node, index) => {
      if (!node) {
        return;
      }

      const nodeAnchor = node.offsetTop + Math.min(node.offsetHeight * 0.4, scroller.clientHeight * 0.34);
      const distance = Math.abs(nodeAnchor - readingLine);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestChapter = scrollChapters[index];
      }
    });

    if (closestChapter && closestChapter.id !== activeScrollChapterId) {
      onScrollChapterSelect(closestChapter);
    }
  };
  const handleChapterRailScroll = () => {
    if (scrollRafRef.current !== null) {
      return;
    }

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      selectChapterFromRailPosition();
    });
  };
  const handleSearchResultSelect = (result: SearchRecord) => {
    onActivePrimarySectionChange(result.targetSection);

    if (!result.targetId) {
      return;
    }

    if (result.type === "species") {
      onSelectSpecies(result.targetId);
    } else if (result.type === "place") {
      onSelectRegion(result.targetId);
    } else if (result.type === "zoo") {
      onSelectZoo(result.targetId);
    }
  };

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const scroller = chapterScrollerRef.current;

    if (!scroller) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!isScrollableRail(scroller)) {
          return;
        }

        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        const index = activeEntry
          ? Number((activeEntry.target as HTMLElement).dataset.chapterIndex)
          : -1;
        const chapter = scrollChapters[index];

        if (chapter && chapter.id !== activeScrollChapterId) {
          onScrollChapterSelect(chapter);
        }
      },
      {
        root: scroller,
        rootMargin: "-34% 0px -46% 0px",
        threshold: [0.28, 0.55, 0.82]
      }
    );

    for (const node of chapterRefs.current) {
      if (node) {
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [activeScrollChapterId, onScrollChapterSelect, scrollChapters]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreenRequested) {
        onFullscreenRequestedChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreenRequested, onFullscreenRequestedChange]);

  useEffect(
    () => () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    },
    []
  );

  const timelineMin = timelineAnchors[0]?.year ?? 1770;
  const timelineMax = timelineAnchors.at(-1)?.year ?? 2024;
  const yearPercent = ((currentYear - timelineMin) / (timelineMax - timelineMin)) * 100;
  const metricCards = useMemo(
    () => [
      {
        label: "World population",
        value: formatPopulation(snapshot.metrics.worldPopulationBillion),
        detail: "people"
      },
      {
        label: "Atmospheric carbon",
        value: formatCarbon(snapshot.metrics.atmosphericCarbonPpm),
        detail: "ppm CO2"
      },
      {
        label: "Remaining wild space",
        value: formatPercent(snapshot.metrics.remainingWildSpacePercent),
        detail: "of Earth's land"
      },
      {
        label: "Wild acreage",
        value: formatAcres(snapshot.metrics.wildSpaceAcres).replace(" acres", ""),
        detail: "acres"
      }
    ],
    [snapshot.metrics]
  );

  return (
    <section className={rootClassName} data-testid="app-shell">
      <aside className="scroll-atlas-nav" aria-label="Console navigation">
        <div className="scroll-atlas-brand">
          <span>David Attenborough</span>
          <strong>A Life On Our Planet</strong>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              data-testid={item.id === "species" ? "species-drawer-trigger" : undefined}
              aria-expanded={item.id === "species" ? true : undefined}
              className={activePrimarySection === item.id ? "active" : ""}
              onClick={() => onActivePrimarySectionChange(item.id)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </aside>

      <main className="scroll-atlas-main">
        <section className="sticky-atlas-stage" aria-label="Scroll-driven globe atlas">
          <button
            type="button"
            className="atlas-stage-focus-toggle"
            aria-label={stageUiMinimized ? "Show globe controls" : "Hide globe controls"}
            aria-pressed={!stageUiMinimized}
            onClick={() => setStageUiMinimized((minimized) => !minimized)}
          >
            {stageUiMinimized ? <Layers size={18} /> : <Minimize2 size={18} />}
          </button>

          <div className="atlas-metric-strip" aria-label="Planet metrics">
            <strong>Planet state</strong>
            {metricCards.map((card) => (
              <span key={card.label}>
                <b>{card.value}</b>
                <small>{card.label}</small>
              </span>
            ))}
          </div>

          {!stageUiMinimized ? (
            <>
              <div className="atlas-stage-toolbar">
                <label>
                  <span>View</span>
                  <select
                    aria-label="Earth view"
                    value={activeView}
                    onChange={(event) => onActiveViewChange(event.target.value as GlobeActiveView)}
                  >
                    <option value="space">Earth from Space</option>
                    <option value="topographic">Topographic</option>
                    <option value="wild-evidence">Wild evidence</option>
                    <option value="admin-regions">Countries</option>
                  </select>
                </label>
                <button type="button" aria-label="Zoom in" onClick={onZoomIn}>
                  <ZoomIn size={17} />
                </button>
                <button type="button" aria-label="Zoom out" onClick={onZoomOut}>
                  <ZoomOut size={17} />
                </button>
                <button type="button" aria-label="Reset view" onClick={onResetView}>
                  <Globe2 size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Map mode"
                  className={viewMode === "map2d" ? "active" : ""}
                  onClick={() => onViewModeChange(viewMode === "map2d" ? "globe3d" : "map2d")}
                >
                  <MapPin size={17} />
                </button>
                <button type="button" aria-label="Toggle debug panel" onClick={onToggleDebug}>
                  <Bug size={17} />
                </button>
                <button
                  type="button"
                  aria-label={isFullscreenRequested ? "Exit fullscreen" : "Enter fullscreen"}
                  onClick={() => onFullscreenRequestedChange(!isFullscreenRequested)}
                >
                  {isFullscreenRequested ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>
              </div>

              <TimeScrollController
                chapters={scrollChapters}
                activeChapterId={activeChapter?.id}
                onChapterSelect={handleTimelineChapterSelect}
              />

              <div className="atlas-control-drawer" data-testid="atlas-control-drawer">
                <aside className="atlas-layer-strip" aria-label="Layer controls">
                  <header>
                    <Layers size={15} />
                    <span>Layers</span>
                  </header>
                  <div className="atlas-layer-chip-grid">
                    {layerItems.map((item) => {
                      const Icon = item.icon;
                      const enabled = layers[item.key];

                      return (
                        <button
                          key={item.key}
                          type="button"
                          data-testid={`layer-toggle-${item.key}`}
                          aria-pressed={enabled}
                          className={enabled ? "active" : ""}
                          onClick={() => onLayerToggle(item.key)}
                        >
                          <Icon size={14} aria-hidden="true" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </aside>
                {stageDrawerContent ? (
                  <div className="atlas-drawer-lens">{stageDrawerContent}</div>
                ) : null}
              </div>

              <div className="atlas-timeline-range">
                <input
                  aria-label="Timeline scrubber"
                  type="range"
                  min={timelineMin}
                  max={timelineMax}
                  value={currentYear}
                  onChange={(event) => handleManualYearChange(Number(event.target.value))}
                />
                <span style={{ width: `${yearPercent}%` }} />
                <button type="button" aria-label="Play timeline" onClick={onPlayTimeline}>
                  <Play size={16} />
                </button>
              </div>
            </>
          ) : null}

          <div className="atlas-stage-earth">{earthSurface}</div>
        </section>

        <section
          className="scroll-chapter-stack"
          aria-label="Time scroll narrative"
          ref={chapterScrollerRef}
          onScroll={handleChapterRailScroll}
        >
          {scrollChapters.map((chapter, index) => {
            const visual = chapterVisuals.find((record) => record.chapterId === chapter.id);

            return (
              <article
                key={chapter.id}
                className={chapter.id === activeChapter?.id ? "scroll-chapter active" : "scroll-chapter"}
                data-chapter-index={index}
                data-testid={`scroll-chapter-${chapter.id}`}
                ref={(node) => {
                  chapterRefs.current[index] = node;
                }}
                onMouseEnter={() => onScrollChapterSelect(chapter)}
                onFocus={() => onScrollChapterSelect(chapter)}
                tabIndex={0}
              >
                <div className="scroll-chapter-copy">
                  <span>{chapter.year}</span>
                  <h1>{chapter.title}</h1>
                  <p>{chapter.body}</p>
                  <dl>
                    <div>
                      <dt>Routes</dt>
                      <dd>{chapter.activeRouteIds.length || "baseline"}</dd>
                    </div>
                    <div>
                      <dt>Animals</dt>
                      <dd>{chapter.activeSpeciesIds.length}</dd>
                    </div>
                  </dl>
                </div>
                <div className="chapter-story-column">
                  {visual ? (
                    <ChapterVisualPanel
                      visual={visual}
                      mediaAssets={mediaAssets}
                      chapterId={chapter.id}
                    />
                  ) : null}
                  <ChapterAnimalHighlights
                    chapter={chapter}
                    species={species}
                    mediaAssets={mediaAssets}
                    selectedSpeciesId={selectedSpeciesId}
                    onSelectSpecies={onSelectSpecies}
                  />
                  {visual ? (
                    <ChapterEvidenceStrip
                      chapterId={chapter.id}
                      chapterYear={chapter.year}
                      visual={visual}
                      evidencePanels={evidencePanels}
                      renderEvidencePanel={renderEvidencePanel}
                    />
                  ) : null}
                </div>
              </article>
            );
          })}

          <section className="scroll-content-panel atlas-explore-panel" aria-label="Explore the evidence">
            <header>
              <span>Explore</span>
              <h2>Explore the evidence</h2>
              <p>
                The deeper species, place, source, and archive views stay available here without
                repeating every map after the main story.
              </p>
            </header>
            <div className="atlas-explore-grid">
              <section className="explore-card" aria-label="Wild space definition">
                <span>Map definition</span>
                <h3>Wild-area definitions</h3>
                <div className="definition-buttons">
                  {Object.entries(wildSpaceDefinitionLabels).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={wildSpaceDefinition === id ? "active" : ""}
                      onClick={() => onWildSpaceDefinitionChange(id as WildSpaceDefinition)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p>{wildSpaceDefinitionCaveat}</p>
                <ul>
                  {geoLayers.slice(0, 5).map((layer) => (
                    <li key={layer.id}>{layer.label}</li>
                  ))}
                </ul>
              </section>

              <section className="explore-card species-directory" aria-label="Species directory">
                <span>Species</span>
                <h3>Species directory</h3>
                <div className="species-profile-grid">
                  {species.slice(0, 9).map((record) => {
                    const media = mediaAssets.find((asset) => asset.id === record.imageAssetId);

                    return (
                      <button
                        key={record.id}
                        type="button"
                        className="species-profile-card"
                        onClick={() => onSelectSpecies(record.id)}
                      >
                        {media?.localPath ? <img src={mediaPath(media.localPath)} alt={media.alt} /> : null}
                        <strong>{record.name}</strong>
                        <small>{record.scientificName}</small>
                        <span>{record.status}</span>
                        <p>{record.summary}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="explore-card witness-drawer"
                aria-label="Species and provenance drawer"
                data-testid="species-drawer"
              >
                <span>Witness</span>
                <h3>{selectedSpecies?.name ?? selectedZoo?.name ?? activeAnchor.title}</h3>
                <div className="witness-tabs">
                  <button type="button">My witness</button>
                  <button type="button">Stories</button>
                  <button type="button">Insights</button>
                </div>
                {portrait?.localPath ? <img className="witness-portrait" src={mediaPath(portrait.localPath)} alt={portrait.alt} /> : null}
                <p>{selectedSpecies?.summary ?? selectedZoo?.notes ?? activeAnchor.summary}</p>
                <div className="evidence-badges" aria-label="Evidence badges">
                  <span>narrative</span>
                  <span>derived</span>
                  <span>measured</span>
                  <span>simulated</span>
                </div>
                <div className="witness-source-list">
                  {sourceSummary.map((source) => (
                    <span key={source}>{source}</span>
                  ))}
                </div>
                <div className="story-list">
                  {editorialStories.slice(0, 2).map((story) => (
                    <article key={story.id}>
                      <h3>{story.title}</h3>
                      <p>{story.summary}</p>
                    </article>
                  ))}
                </div>
                <div className="insight-list">
                  {insightCards.slice(0, 2).map((insight) => (
                    <article key={insight.id}>
                      <strong>{insight.title}</strong>
                      <p>{insight.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="explore-card" aria-label="Places directory">
                <span>Places</span>
                <h3>Places and zoos</h3>
                <div className="place-grid">
                  {regions.map((region) => (
                    <button key={region.id} type="button" onClick={() => onSelectRegion(region.id)}>
                      <MapPin size={15} />
                      <span>{region.name}</span>
                    </button>
                  ))}
                  {visibleZoos.map((zoo) => (
                    <button key={zoo.id} type="button" onClick={() => onSelectZoo(zoo.id)}>
                      <MapPin size={15} />
                      <span>{zoo.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="explore-card search-section">
                <span>Search</span>
                <h3>Find sources and stories</h3>
                <input
                  type="search"
                  role="searchbox"
                  aria-label="Search atlas content"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  placeholder="Search species, places, stories, sources"
                />
                <div className="search-results">
                  {searchResults.slice(0, 8).map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      aria-label={`${result.type} ${result.title}`}
                      onClick={() => handleSearchResultSelect(result)}
                    >
                      <span>{result.type}</span>
                      <strong>{result.title}</strong>
                      <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </section>

              <section className="explore-card evidence-archive" aria-label="Evidence archive">
                <span>Archive</span>
                <h3>Detailed tables</h3>
                <div className="scroll-bottom-grid">{bottomPanels}</div>
              </section>

              <section className="explore-card solutions-summary" aria-label="Solutions notes">
                <span>Solutions</span>
                <h3>Source gaps stay visible</h3>
                <p>Solutions require the missing Part Three pages before they can be quoted directly.</p>
              </section>
            </div>
          </section>
          {sourcePanel}
        </section>
      </main>

      {debugOpen ? (
        <aside className="debug-panel" role="complementary" aria-label="Debug panel">
          <strong>Debug panel</strong>
          <span>Year {currentYear}</span>
          <span>Chapter {activeChapter?.id}</span>
          <span>Selected {selectedSpeciesId ?? selectedZooId ?? "none"}</span>
        </aside>
      ) : null}
    </section>
  );
}

function isScrollableRail(scroller: HTMLElement) {
  return scroller.scrollHeight > scroller.clientHeight + 1;
}

function ChapterVisualPanel({
  visual,
  mediaAssets,
  chapterId
}: {
  visual: ChapterVisualRecord;
  mediaAssets: MediaAsset[];
  chapterId: string;
}) {
  const media = mediaAssets.find((asset) => asset.id === visual.mediaAssetId);
  const mediaSource = media?.localPath ? mediaPath(media.localPath) : media?.sourceUrl;

  return (
    <figure
      className={`chapter-visual ${visual.kind}`}
      data-testid={`chapter-visual-${chapterId}`}
    >
      {mediaSource ? <img src={mediaSource} alt={media?.alt ?? visual.title} /> : null}
      <figcaption>
        <span>{visual.kind.replace("-", " ")}</span>
        <strong>{visual.title}</strong>
        <p>{visual.caption}</p>
        <small>{visual.sourceRefs.slice(0, 2).map((source) => source.label).join(" + ")}</small>
      </figcaption>
    </figure>
  );
}

function ChapterAnimalHighlights({
  chapter,
  species,
  mediaAssets,
  selectedSpeciesId,
  onSelectSpecies
}: {
  chapter: ScrollChapterRecord;
  species: SpeciesProfile[];
  mediaAssets: MediaAsset[];
  selectedSpeciesId?: string;
  onSelectSpecies: (speciesId?: string) => void;
}) {
  const highlightedSpecies = chapter.activeSpeciesIds
    .map((speciesId) => species.find((record) => record.id === speciesId))
    .filter((record): record is SpeciesProfile => Boolean(record))
    .slice(0, 2);

  if (highlightedSpecies.length === 0) {
    return null;
  }

  return (
    <section
      className="chapter-animal-strip"
      aria-label={`${chapter.year} animal highlights`}
    >
      {highlightedSpecies.map((record) => {
        const media = mediaAssets.find((asset) => asset.id === record.imageAssetId);
        const selected = selectedSpeciesId === record.id;

        return (
          <button
            key={record.id}
            type="button"
            className={selected ? "chapter-animal-card selected" : "chapter-animal-card"}
            aria-label={`Select ${record.name} for ${chapter.year}`}
            onClick={() => onSelectSpecies(record.id)}
          >
            {media?.localPath ? (
              <img src={mediaPath(media.localPath)} alt={`${record.name}: ${media.alt}`} />
            ) : (
              <span className="animal-story-placeholder" aria-hidden="true" />
            )}
            <span>
              <strong>{record.name}</strong>
              <small>{record.status}</small>
              <em>{record.habitat}</em>
            </span>
          </button>
        );
      })}
    </section>
  );
}

function ChapterEvidenceStrip({
  chapterId,
  chapterYear,
  visual,
  evidencePanels,
  renderEvidencePanel
}: {
  chapterId: string;
  chapterYear: number;
  visual: ChapterVisualRecord;
  evidencePanels: Partial<Record<ChapterEvidencePanelId, ReactNode>>;
  renderEvidencePanel?: (panelId: ChapterEvidencePanelId, year: number) => ReactNode;
}) {
  const panels = (visual.evidencePanelIds ?? [])
    .map((panelId) => ({
      id: panelId,
      node: renderEvidencePanel ? renderEvidencePanel(panelId, chapterYear) : evidencePanels[panelId]
    }))
    .filter((panel): panel is { id: ChapterEvidencePanelId; node: ReactNode } =>
      Boolean(panel.node)
    )
    .slice(0, 1);

  if (panels.length === 0) {
    return null;
  }

  return (
    <section
      className="chapter-evidence-strip"
      data-testid={`chapter-evidence-${chapterId}`}
      aria-label={`${chapterId} evidence highlights`}
    >
      {panels.map((panel) => (
        <div className="chapter-evidence-card" key={`${chapterId}-${panel.id}`}>
          {panel.node}
        </div>
      ))}
    </section>
  );
}
