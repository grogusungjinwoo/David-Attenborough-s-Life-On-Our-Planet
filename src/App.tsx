import { useMemo } from "react";
import { ScrollAtlas } from "./components/scroll/ScrollAtlas";
import {
  BiomePressureMap,
  PopulationExpansionMap,
  SpeciesLossMatrix
} from "./infographics";
import {
  allSources,
  createInsightCards,
  geoLayers,
  chapterVisuals,
  editorialStories,
  mediaAssets,
  regions,
  scrollChapters,
  speciesProfiles,
  timelineAnchors,
  wildSpaceDefinitionCaveats,
  wildSpaceDefinitionLabels,
  zooSites
} from "./data";
import { deriveGeoChangeSnapshot } from "./data/geoChangeOverlays";
import {
  createWorldSnapshot,
  getActiveTimelineAnchor
} from "./domain/timeline";
import { buildSearchIndex, searchContent } from "./domain/contentSearch";
import { ChangeLens } from "./features/geo-change/ChangeLens";
import { GeoChangeRegionCards } from "./features/geo-change/GeoChangeRegionCards";
import { GlobeViewport } from "./features/globe/GlobeViewport";
import { MapViewport } from "./features/map/MapViewport";
import { staticEarthProvider } from "./map/mapProviders";
import { usePlanetStore } from "./state/usePlanetStore";
import type { ChapterEvidencePanelId } from "./domain/types";

export function App() {
  const currentYear = usePlanetStore((state) => state.currentYear);
  const layers = usePlanetStore((state) => state.layers);
  const globeView = usePlanetStore((state) => state.globeView);
  const activeView = usePlanetStore((state) => state.activeView);
  const activeGeoChangeLayer = usePlanetStore((state) => state.activeGeoChangeLayer);
  const viewMode = usePlanetStore((state) => state.viewMode);
  const earthBasemap = usePlanetStore((state) => state.earthBasemap);
  const mapViewport = usePlanetStore((state) => state.mapViewport);
  const wildSpaceDefinition = usePlanetStore((state) => state.wildSpaceDefinition);
  const activePrimarySection = usePlanetStore((state) => state.activePrimarySection);
  const isFullscreenRequested = usePlanetStore((state) => state.isFullscreenRequested);
  const searchQuery = usePlanetStore((state) => state.searchQuery);
  const selectedRegionId = usePlanetStore((state) => state.selectedRegionId);
  const selectedSpeciesId = usePlanetStore((state) => state.selectedSpeciesId);
  const selectedZooId = usePlanetStore((state) => state.selectedZooId);
  const activeScrollChapterId = usePlanetStore((state) => state.activeScrollChapterId);
  const debugOpen = usePlanetStore((state) => state.debugOpen);
  const setYear = usePlanetStore((state) => state.setYear);
  const selectRegion = usePlanetStore((state) => state.selectRegion);
  const selectSpecies = usePlanetStore((state) => state.selectSpecies);
  const selectZoo = usePlanetStore((state) => state.selectZoo);
  const toggleLayer = usePlanetStore((state) => state.toggleLayer);
  const setActiveView = usePlanetStore((state) => state.setActiveView);
  const setViewMode = usePlanetStore((state) => state.setViewMode);
  const setActiveGeoChangeLayer = usePlanetStore((state) => state.setActiveGeoChangeLayer);
  const setActivePrimarySection = usePlanetStore((state) => state.setActivePrimarySection);
  const setFullscreenRequested = usePlanetStore((state) => state.setFullscreenRequested);
  const setSearchQuery = usePlanetStore((state) => state.setSearchQuery);
  const setWildSpaceDefinition = usePlanetStore((state) => state.setWildSpaceDefinition);
  const setScrollChapter = usePlanetStore((state) => state.setScrollChapter);
  const setGlobeViewTarget = usePlanetStore((state) => state.setGlobeViewTarget);
  const panGlobeView = usePlanetStore((state) => state.panGlobeView);
  const zoomGlobeView = usePlanetStore((state) => state.zoomGlobeView);
  const zoomIn = usePlanetStore((state) => state.zoomIn);
  const zoomOut = usePlanetStore((state) => state.zoomOut);
  const resetView = usePlanetStore((state) => state.resetView);
  const toggleDebug = usePlanetStore((state) => state.toggleDebug);

  const snapshot = useMemo(
    () => createWorldSnapshot(timelineAnchors, currentYear, layers),
    [currentYear, layers]
  );
  const activeAnchor = useMemo(
    () => getActiveTimelineAnchor(timelineAnchors, currentYear),
    [currentYear]
  );
  const insightCards = useMemo(
    () => createInsightCards(snapshot, speciesProfiles, layers),
    [snapshot, layers]
  );
  const searchIndex = useMemo(
    () =>
      buildSearchIndex({
        species: speciesProfiles,
        regions,
        zoos: zooSites,
        stories: editorialStories,
        insights: insightCards,
        sources: allSources
      }),
    [insightCards]
  );
  const searchResults = useMemo(
    () => searchContent(searchQuery, searchIndex),
    [searchIndex, searchQuery]
  );
  const geoChangeSnapshot = useMemo(
    () => deriveGeoChangeSnapshot(currentYear, snapshot, regions),
    [currentYear, snapshot]
  );
  const providerPayload = staticEarthProvider.prepareLayers({
    snapshot,
    selectedRegionId,
    selectedSpeciesId,
    selectedZooId
  });

  const playTimeline = () => {
    const currentIndex = timelineAnchors.findIndex((anchor) => anchor.year === activeAnchor.year);
    const nextAnchor = timelineAnchors[(currentIndex + 1) % timelineAnchors.length];
    setYear(nextAnchor.year);
  };

  const handleScrollChapterSelect = (chapter: (typeof scrollChapters)[number]) => {
    setScrollChapter(
      chapter.id,
      chapter.year,
      chapter.globeTarget,
      chapter.activeLayerIds
    );
  };
  const handleSelectRegion = (regionId?: string) => {
    selectRegion(regionId);

    const region = regions.find((record) => record.id === regionId);

    if (region) {
      setGlobeViewTarget({ lat: region.lat, lon: region.lon, zoomScalar: 0.74 });
    }
  };
  const handleSelectSpecies = (speciesId?: string) => {
    selectSpecies(speciesId);

    const profile = speciesProfiles.find((record) => record.id === speciesId);
    const region = profile
      ? regions.find((record) => profile.regionIds.includes(record.id))
      : undefined;

    if (region) {
      setGlobeViewTarget({ lat: region.lat, lon: region.lon, zoomScalar: 0.78 });
    }
  };
  const handleSelectZoo = (zooId?: string) => {
    selectZoo(zooId);

    const zoo = zooSites.find((record) => record.id === zooId);

    if (zoo) {
      setGlobeViewTarget({ lat: zoo.lat, lon: zoo.lon, zoomScalar: 0.78 });
    }
  };

  const earthSurface = (
    <>
      {viewMode === "map2d" ? (
        <MapViewport
          basemap={earthBasemap}
          snapshot={providerPayload.snapshot}
          mapViewport={mapViewport}
          activeGeoChangeLayer={activeGeoChangeLayer}
          geoChangeSnapshot={geoChangeSnapshot}
          regions={regions}
          species={speciesProfiles}
          zoos={zooSites}
          selectedRegionId={providerPayload.selectedRegionId}
          selectedSpeciesId={providerPayload.selectedSpeciesId}
          selectedZooId={providerPayload.selectedZooId}
          onSelectRegion={handleSelectRegion}
          onSelectSpecies={handleSelectSpecies}
          onSelectZoo={handleSelectZoo}
        />
      ) : (
        <GlobeViewport
          snapshot={providerPayload.snapshot}
          regions={regions}
          species={speciesProfiles}
          zoos={zooSites}
          globeView={globeView}
          activeGeoChangeLayer={activeGeoChangeLayer}
          geoChangeSnapshot={geoChangeSnapshot}
          selectedRegionId={providerPayload.selectedRegionId}
          selectedSpeciesId={providerPayload.selectedSpeciesId}
          selectedZooId={providerPayload.selectedZooId}
          onPanGlobeView={panGlobeView}
          onZoomGlobeView={zoomGlobeView}
          onSelectRegion={handleSelectRegion}
          onSelectSpecies={handleSelectSpecies}
          onSelectZoo={handleSelectZoo}
        />
      )}
    </>
  );

  const changeLensPanel = (
    <ChangeLens
      activeLayerId={activeGeoChangeLayer}
      snapshot={geoChangeSnapshot}
      onActiveLayerChange={setActiveGeoChangeLayer}
    />
  );

  const renderEvidencePanel = (panelId: ChapterEvidencePanelId, year: number) => {
    const panelSnapshot = createWorldSnapshot(timelineAnchors, year, layers);
    const panelGeoChangeSnapshot = deriveGeoChangeSnapshot(year, panelSnapshot, regions);

    switch (panelId) {
      case "biome-pressure":
        return <BiomePressureMap year={year} snapshot={panelSnapshot} />;
      case "population-expansion":
        return <PopulationExpansionMap year={year} snapshot={panelSnapshot} />;
      case "species-loss":
        return <SpeciesLossMatrix year={year} snapshot={panelSnapshot} />;
      case "geo-change":
        return (
          <GeoChangeRegionCards
            activeLayerId={activeGeoChangeLayer}
            snapshot={panelGeoChangeSnapshot}
          />
        );
    }
  };

  return (
    <>
      <ScrollAtlas
        activeAnchor={activeAnchor}
        activePrimarySection={activePrimarySection}
        activeScrollChapterId={activeScrollChapterId}
        currentYear={currentYear}
        debugOpen={debugOpen}
        earthSurface={earthSurface}
        activeView={activeView}
        geoLayers={geoLayers}
        chapterVisuals={chapterVisuals}
        renderEvidencePanel={renderEvidencePanel}
        editorialStories={editorialStories}
        insightCards={insightCards}
        isFullscreenRequested={isFullscreenRequested}
        layers={layers}
        mediaAssets={mediaAssets}
        scrollChapters={scrollChapters}
        searchQuery={searchQuery}
        searchResults={searchResults}
        selectedSpeciesId={selectedSpeciesId}
        selectedZooId={selectedZooId}
        sourcePanel={
          <section className="source-band" data-testid="source-section">
            <span className="section-kicker">Provenance</span>
            <h2>Every number keeps a trail.</h2>
            <p>
              The witness anchors are kept separate from the Earth-state overlays.
              The 1770-1937 surface transitions use NASA, NOAA, HYDE-family,
              Natural Earth, and public climate archives where available, with sparse
              years marked as reconstructed rather than observed.
            </p>
          </section>
        }
        snapshot={snapshot}
        species={speciesProfiles}
        timelineAnchors={timelineAnchors}
        viewMode={viewMode}
        wildSpaceDefinition={wildSpaceDefinition}
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveats[wildSpaceDefinition]}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        regions={regions}
        zoos={zooSites}
        stageDrawerContent={changeLensPanel}
        onLayerToggle={toggleLayer}
        onPlayTimeline={playTimeline}
        onResetView={resetView}
        onActiveViewChange={setActiveView}
        onActivePrimarySectionChange={setActivePrimarySection}
        onFullscreenRequestedChange={setFullscreenRequested}
        onScrollChapterSelect={handleScrollChapterSelect}
        onSearchQueryChange={setSearchQuery}
        onViewModeChange={setViewMode}
        onWildSpaceDefinitionChange={setWildSpaceDefinition}
        onSelectSpecies={handleSelectSpecies}
        onSelectRegion={handleSelectRegion}
        onSelectZoo={handleSelectZoo}
        onToggleDebug={toggleDebug}
        onYearChange={setYear}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        bottomPanels={
          <>
            <SpeciesLossMatrix year={currentYear} snapshot={snapshot} />
            <GeoChangeRegionCards
              activeLayerId={activeGeoChangeLayer}
              snapshot={geoChangeSnapshot}
            />
          </>
        }
      />
    </>
  );
}
