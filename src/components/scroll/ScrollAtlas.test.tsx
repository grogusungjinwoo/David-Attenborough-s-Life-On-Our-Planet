import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  geoLayers,
  chapterVisuals,
  mediaAssets,
  regions,
  scrollChapters,
  editorialStories,
  speciesProfiles,
  timelineAnchors,
  wildSpaceDefinitionCaveats,
  wildSpaceDefinitionLabels,
  zooSites
} from "../../data";
import { buildSearchIndex, searchContent } from "../../domain/contentSearch";
import { createWorldSnapshot, getActiveTimelineAnchor } from "../../domain/timeline";
import { defaultLayers } from "../../domain/timeline";
import { ScrollAtlas } from "./ScrollAtlas";

describe("ScrollAtlas", () => {
  it("renders the scroll-first shell while preserving controls and animal selection", () => {
    const onChapterSelect = vi.fn();
    const onLayerToggle = vi.fn();
    const onSearchQueryChange = vi.fn();
    const onSelectSpecies = vi.fn();
    const onViewModeChange = vi.fn();
    const onYearChange = vi.fn();
    const scrollTo = vi.fn();
    const observers: Array<{ options?: IntersectionObserverInit; observe: ReturnType<typeof vi.fn> }> = [];
    const currentYear = 2024;
    const snapshot = createWorldSnapshot(timelineAnchors, currentYear, defaultLayers);
    const activeAnchor = getActiveTimelineAnchor(timelineAnchors, currentYear);
    const searchIndex = buildSearchIndex({
      species: speciesProfiles,
      regions,
      zoos: zooSites,
      stories: [],
      insights: [],
      sources: []
    });
    const evidencePanels = {
      "biome-pressure": <article>Biome pressure map for test</article>,
      "population-expansion": <article>Population expansion map for test</article>,
      "species-loss": <article>Species loss matrix for test</article>,
      "geo-change": <article>Geo change cards for test</article>
    };
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo
    });
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn((_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
        const observer = {
          observe: vi.fn(),
          disconnect: vi.fn(),
          unobserve: vi.fn(),
          takeRecords: vi.fn(() => []),
          root: options?.root ?? null,
          rootMargin: options?.rootMargin ?? "",
          thresholds: Array.isArray(options?.threshold)
            ? options.threshold
            : [options?.threshold ?? 0]
        };
        observers.push({ options, observe: observer.observe });

        return observer;
      })
    );

    render(
      <ScrollAtlas
        activeAnchor={activeAnchor}
        activePrimarySection="overview"
        activeScrollChapterId="briefing-2024"
        activeView="space"
        bottomPanels={<div>Infographic parity</div>}
        chapterVisuals={chapterVisuals}
        currentYear={currentYear}
        debugOpen={false}
        earthSurface={<div data-testid="globe-viewport">Globe placeholder</div>}
        evidencePanels={evidencePanels}
        editorialStories={editorialStories}
        geoLayers={geoLayers}
        insightCards={[]}
        isFullscreenRequested={false}
        layers={defaultLayers}
        mediaAssets={mediaAssets}
        scrollChapters={scrollChapters}
        searchQuery=""
        searchResults={searchContent("", searchIndex)}
        selectedSpeciesId="african-elephant"
        selectedZooId={undefined}
        snapshot={snapshot}
        regions={regions}
        species={speciesProfiles}
        timelineAnchors={timelineAnchors}
        viewMode="globe3d"
        wildSpaceDefinition="witness-story"
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveats["witness-story"]}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        zoos={zooSites}
        stageDrawerContent={<div data-testid="change-lens-proxy">Change lens proxy</div>}
        onActivePrimarySectionChange={vi.fn()}
        onActiveViewChange={vi.fn()}
        onFullscreenRequestedChange={vi.fn()}
        onPlayTimeline={vi.fn()}
        onScrollChapterSelect={onChapterSelect}
        onLayerToggle={onLayerToggle}
        onResetView={vi.fn()}
        onSearchQueryChange={onSearchQueryChange}
        onSelectRegion={vi.fn()}
        onSelectSpecies={onSelectSpecies}
        onSelectZoo={vi.fn()}
        onToggleDebug={vi.fn()}
        onViewModeChange={onViewModeChange}
        onWildSpaceDefinitionChange={vi.fn()}
        onYearChange={onYearChange}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
      />
    );

    expect(screen.getByTestId("app-shell")).toHaveClass("scroll-atlas");
    expect(observers[0]?.options?.root).toBe(
      screen.getByRole("region", { name: "Time scroll narrative" })
    );
    expect(screen.getByRole("button", { name: "Show globe controls" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show globe controls" }));
    expect(screen.getByLabelText("Timeline year")).toBeInTheDocument();
    const drawer = screen.getByTestId("atlas-control-drawer");
    expect(within(drawer).getByLabelText("Layer controls")).toBeInTheDocument();
    expect(within(drawer).getByTestId("change-lens-proxy")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The current briefing" })).toBeInTheDocument();
    expect(within(screen.getByTestId("scroll-chapter-baseline-1770")).getByTestId("chapter-visual-baseline-1770")).toBeInTheDocument();
    expect(within(screen.getByTestId("scroll-chapter-briefing-2024")).getByLabelText("2024 animal highlights")).toBeInTheDocument();
    expect(within(screen.getByTestId("scroll-chapter-trade-1900")).getByText("Population expansion map for test")).toBeInTheDocument();
    expect(within(screen.getByTestId("scroll-chapter-television-1954")).getByText("Population expansion map for test")).toBeInTheDocument();
    expect(screen.getByTestId("species-drawer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /1937: A child meets/i }));
    expect(scrollTo).toHaveBeenCalled();
    scrollTo.mockClear();
    onChapterSelect.mockClear();
    fireEvent.change(screen.getByLabelText("Timeline scrubber"), {
      target: { value: "1969" }
    });
    fireEvent.click(screen.getByTestId("layer-toggle-species"));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search atlas content" }), {
      target: { value: "orangutan" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Map mode" }));
    fireEvent.click(
      within(screen.getByTestId("scroll-chapter-briefing-2024")).getByRole("button", {
        name: /Bornean orangutan/i
      })
    );

    expect(onYearChange).toHaveBeenCalledWith(1969);
    expect(onChapterSelect).toHaveBeenCalledWith(
      expect.objectContaining({ year: 1968 })
    );
    expect(scrollTo).toHaveBeenCalled();
    expect(onLayerToggle).toHaveBeenCalledWith("species");
    expect(onSearchQueryChange).toHaveBeenCalledWith("orangutan");
    expect(onViewModeChange).toHaveBeenCalledWith("map2d");
    expect(onSelectSpecies).toHaveBeenCalledWith("bornean-orangutan");

    vi.unstubAllGlobals();
  });

  it("renders chapter evidence for the chapter year and consolidates repeated reference content", () => {
    const currentYear = 2024;
    const snapshot = createWorldSnapshot(timelineAnchors, currentYear, defaultLayers);
    const activeAnchor = getActiveTimelineAnchor(timelineAnchors, currentYear);
    const searchIndex = buildSearchIndex({
      species: speciesProfiles,
      regions,
      zoos: zooSites,
      stories: [],
      insights: [],
      sources: []
    });
    const renderEvidencePanel = vi.fn((panelId: string, year: number) => (
      <article>{`${panelId} evidence for ${year}`}</article>
    ));

    render(
      <ScrollAtlas
        activeAnchor={activeAnchor}
        activePrimarySection="overview"
        activeScrollChapterId="briefing-2024"
        activeView="space"
        bottomPanels={<div>Detailed archive tables</div>}
        chapterVisuals={chapterVisuals}
        currentYear={currentYear}
        debugOpen={false}
        earthSurface={<div data-testid="globe-viewport">Globe placeholder</div>}
        renderEvidencePanel={renderEvidencePanel}
        editorialStories={editorialStories}
        geoLayers={geoLayers}
        insightCards={[]}
        isFullscreenRequested={false}
        layers={defaultLayers}
        mediaAssets={mediaAssets}
        scrollChapters={scrollChapters}
        searchQuery=""
        searchResults={searchContent("", searchIndex)}
        selectedSpeciesId={undefined}
        selectedZooId={undefined}
        snapshot={snapshot}
        regions={regions}
        species={speciesProfiles}
        timelineAnchors={timelineAnchors}
        viewMode="globe3d"
        wildSpaceDefinition="witness-story"
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveats["witness-story"]}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        zoos={zooSites}
        onActivePrimarySectionChange={vi.fn()}
        onActiveViewChange={vi.fn()}
        onFullscreenRequestedChange={vi.fn()}
        onPlayTimeline={vi.fn()}
        onScrollChapterSelect={vi.fn()}
        onLayerToggle={vi.fn()}
        onResetView={vi.fn()}
        onSearchQueryChange={vi.fn()}
        onSelectRegion={vi.fn()}
        onSelectSpecies={vi.fn()}
        onSelectZoo={vi.fn()}
        onToggleDebug={vi.fn()}
        onViewModeChange={vi.fn()}
        onWildSpaceDefinitionChange={vi.fn()}
        onYearChange={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
      />
    );

    expect(
      within(screen.getByTestId("scroll-chapter-trade-1900")).getByText(
        "population-expansion evidence for 1900"
      )
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("scroll-chapter-briefing-2024")).getByText(
        "geo-change evidence for 2024"
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Animal witnesses" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Explore the evidence" })).toBeInTheDocument();
    expect(screen.getByText("Detailed archive tables")).toBeInTheDocument();
  });
});
