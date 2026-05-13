import { useMemo } from "react";
import { AtlasConsole } from "./components/AtlasConsole";
import {
  BiomePressureMap,
  PopulationExpansionMap,
  SpeciesLossMatrix
} from "./infographics";
import {
  referenceOverlays,
  regions,
  speciesRecords,
  timelineAnchors,
  zooSites
} from "./data";
import {
  createWorldSnapshot,
  getActiveTimelineAnchor
} from "./domain/timeline";
import { GlobeViewport } from "./features/globe/GlobeViewport";
import { MapViewport } from "./features/map/MapViewport";
import { staticEarthProvider } from "./map/mapProviders";
import { usePlanetStore } from "./state/usePlanetStore";

export function App() {
  const currentYear = usePlanetStore((state) => state.currentYear);
  const layers = usePlanetStore((state) => state.layers);
  const zoomScalar = usePlanetStore((state) => state.zoomScalar);
  const selectedRegionId = usePlanetStore((state) => state.selectedRegionId);
  const selectedSpeciesId = usePlanetStore((state) => state.selectedSpeciesId);
  const selectedZooId = usePlanetStore((state) => state.selectedZooId);
  const debugOpen = usePlanetStore((state) => state.debugOpen);
  const earthView = usePlanetStore((state) => state.earthView);
  const viewMode = usePlanetStore((state) => state.viewMode);
  const earthBasemap = usePlanetStore((state) => state.earthBasemap);
  const mapViewport = usePlanetStore((state) => state.mapViewport);
  const setYear = usePlanetStore((state) => state.setYear);
  const selectRegion = usePlanetStore((state) => state.selectRegion);
  const selectSpecies = usePlanetStore((state) => state.selectSpecies);
  const selectZoo = usePlanetStore((state) => state.selectZoo);
  const toggleLayer = usePlanetStore((state) => state.toggleLayer);
  const setEarthView = usePlanetStore((state) => state.setEarthView);
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

  const earthSurface =
    viewMode === "map2d" ? (
      <MapViewport
        basemap={earthBasemap}
        snapshot={providerPayload.snapshot}
        mapViewport={mapViewport}
        regions={regions}
        species={speciesRecords}
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
        species={speciesRecords}
        zoos={zooSites}
        zoomScalar={zoomScalar}
        selectedRegionId={providerPayload.selectedRegionId}
        selectedSpeciesId={providerPayload.selectedSpeciesId}
        selectedZooId={providerPayload.selectedZooId}
        onSelectRegion={selectRegion}
        onSelectSpecies={selectSpecies}
        onSelectZoo={selectZoo}
      />
    );

  return (
    <>
      <AtlasConsole
        activeAnchor={activeAnchor}
        currentYear={currentYear}
        debugOpen={debugOpen}
        earthSurface={earthSurface}
        earthView={earthView}
        layers={layers}
        overlays={referenceOverlays}
        providerLabel={staticEarthProvider.descriptor.label}
        regions={regions}
        selectedSpeciesId={selectedSpeciesId}
        selectedZooId={selectedZooId}
        snapshot={snapshot}
        species={speciesRecords}
        timelineAnchors={timelineAnchors}
        zoos={zooSites}
        onLayerToggle={toggleLayer}
        onPlayTimeline={playTimeline}
        onResetView={resetView}
        onEarthViewChange={setEarthView}
        onSelectSpecies={selectSpecies}
        onToggleDebug={toggleDebug}
        onYearChange={setYear}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        bottomPanels={
          <>
            <BiomePressureMap year={currentYear} snapshot={snapshot} />
            <PopulationExpansionMap year={currentYear} snapshot={snapshot} />
            <SpeciesLossMatrix year={currentYear} snapshot={snapshot} />
          </>
        }
      />

      <section className="source-band" data-testid="source-section">
        <span className="section-kicker">Provenance</span>
        <h2>Every number keeps a trail.</h2>
        <p>
          The first manuscript anchor comes from the supplied excerpt. Later timeline
          gaps are supplemented with public data and marked as such, so the interface
          can grow without confusing memory, simulation, and source.
        </p>
      </section>
    </>
  );
}
