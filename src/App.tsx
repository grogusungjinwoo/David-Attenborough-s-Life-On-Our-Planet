import { useMemo } from "react";
import { AtlasConsole } from "./components/AtlasConsole";
import {
  BiomePressureMap,
  PopulationExpansionMap,
  SpeciesLossMatrix
} from "./infographics";
import {
  allSources,
  createInsightCards,
  geoLayers,
  editorialStories,
  mediaAssets,
  referenceOverlays,
  regions,
  speciesProfiles,
  solutionSourceStatus,
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
  const activeWitnessTab = usePlanetStore((state) => state.activeWitnessTab);
  const isFullscreenRequested = usePlanetStore((state) => state.isFullscreenRequested);
  const searchQuery = usePlanetStore((state) => state.searchQuery);
  const selectedRegionId = usePlanetStore((state) => state.selectedRegionId);
  const selectedSpeciesId = usePlanetStore((state) => state.selectedSpeciesId);
  const selectedZooId = usePlanetStore((state) => state.selectedZooId);
  const debugOpen = usePlanetStore((state) => state.debugOpen);
  const setYear = usePlanetStore((state) => state.setYear);
  const selectRegion = usePlanetStore((state) => state.selectRegion);
  const selectSpecies = usePlanetStore((state) => state.selectSpecies);
  const selectZoo = usePlanetStore((state) => state.selectZoo);
  const toggleLayer = usePlanetStore((state) => state.toggleLayer);
  const setActiveView = usePlanetStore((state) => state.setActiveView);
  const setActiveGeoChangeLayer = usePlanetStore((state) => state.setActiveGeoChangeLayer);
  const setActivePrimarySection = usePlanetStore((state) => state.setActivePrimarySection);
  const setActiveWitnessTab = usePlanetStore((state) => state.setActiveWitnessTab);
  const setFullscreenRequested = usePlanetStore((state) => state.setFullscreenRequested);
  const setSearchQuery = usePlanetStore((state) => state.setSearchQuery);
  const setWildSpaceDefinition = usePlanetStore((state) => state.setWildSpaceDefinition);
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
          onSelectRegion={selectRegion}
          onSelectSpecies={selectSpecies}
          onSelectZoo={selectZoo}
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
          onSelectRegion={selectRegion}
          onSelectSpecies={selectSpecies}
          onSelectZoo={selectZoo}
        />
      )}
      <ChangeLens
        activeLayerId={activeGeoChangeLayer}
        snapshot={geoChangeSnapshot}
        onActiveLayerChange={setActiveGeoChangeLayer}
      />
    </>
  );

  return (
    <>
      <AtlasConsole
        activeAnchor={activeAnchor}
        activePrimarySection={activePrimarySection}
        activeWitnessTab={activeWitnessTab}
        currentYear={currentYear}
        debugOpen={debugOpen}
        earthSurface={earthSurface}
        activeView={activeView}
        geoLayers={geoLayers}
        editorialStories={editorialStories}
        insightCards={insightCards}
        isFullscreenRequested={isFullscreenRequested}
        layers={layers}
        mediaAssets={mediaAssets}
        overlays={referenceOverlays}
        providerLabel={staticEarthProvider.descriptor.label}
        regions={regions}
        searchQuery={searchQuery}
        searchResults={searchResults}
        selectedSpeciesId={selectedSpeciesId}
        selectedZooId={selectedZooId}
        snapshot={snapshot}
        species={speciesProfiles}
        solutionBlocked={solutionSourceStatus}
        timelineAnchors={timelineAnchors}
        wildSpaceDefinition={wildSpaceDefinition}
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveats[wildSpaceDefinition]}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        zoos={zooSites}
        onLayerToggle={toggleLayer}
        onPlayTimeline={playTimeline}
        onResetView={resetView}
        onActiveViewChange={setActiveView}
        onActivePrimarySectionChange={setActivePrimarySection}
        onActiveWitnessTabChange={setActiveWitnessTab}
        onFullscreenRequestedChange={setFullscreenRequested}
        onPanGlobeView={panGlobeView}
        onSearchQueryChange={setSearchQuery}
        onWildSpaceDefinitionChange={setWildSpaceDefinition}
        onSelectRegion={selectRegion}
        onSelectSpecies={selectSpecies}
        onSelectZoo={selectZoo}
        onToggleDebug={toggleDebug}
        onYearChange={setYear}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        bottomPanels={
          <>
            <BiomePressureMap year={currentYear} snapshot={snapshot} />
            <PopulationExpansionMap year={currentYear} snapshot={snapshot} />
            <SpeciesLossMatrix year={currentYear} snapshot={snapshot} />
            <GeoChangeRegionCards
              activeLayerId={activeGeoChangeLayer}
              snapshot={geoChangeSnapshot}
            />
          </>
        }
      />

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
    </>
  );
}
