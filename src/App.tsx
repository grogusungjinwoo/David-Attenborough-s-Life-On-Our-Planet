import { useMemo } from "react";
import { DebugPanel } from "./components/DebugPanel";
import { InsightDrawer } from "./components/InsightDrawer";
import { LayerControls } from "./components/LayerControls";
import { MetricRail } from "./components/MetricRail";
import { TimelineScrubber } from "./components/TimelineScrubber";
import { ZoomControls } from "./components/ZoomControls";
import {
  BiomePressureMap,
  PopulationExpansionMap,
  ReferenceRepoHorizonPanel,
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
import { simulatedGlobeProvider } from "./map/mapProviders";
import { usePlanetStore } from "./state/usePlanetStore";

export function App() {
  const currentYear = usePlanetStore((state) => state.currentYear);
  const layers = usePlanetStore((state) => state.layers);
  const zoomScalar = usePlanetStore((state) => state.zoomScalar);
  const selectedRegionId = usePlanetStore((state) => state.selectedRegionId);
  const selectedSpeciesId = usePlanetStore((state) => state.selectedSpeciesId);
  const selectedZooId = usePlanetStore((state) => state.selectedZooId);
  const debugOpen = usePlanetStore((state) => state.debugOpen);
  const setYear = usePlanetStore((state) => state.setYear);
  const selectRegion = usePlanetStore((state) => state.selectRegion);
  const selectSpecies = usePlanetStore((state) => state.selectSpecies);
  const selectZoo = usePlanetStore((state) => state.selectZoo);
  const toggleLayer = usePlanetStore((state) => state.toggleLayer);
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
  const providerPayload = simulatedGlobeProvider.prepareLayers({
    snapshot,
    selectedRegionId,
    selectedSpeciesId,
    selectedZooId
  });

  return (
    <main className="planet-app" data-testid="app-shell">
      <section className="experience-stage" aria-label="Interactive witness globe">
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
        <div className="top-bar">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true" />
            <span>Life On Our Planet</span>
          </div>
          <span className="provider-pill">{simulatedGlobeProvider.descriptor.label}</span>
        </div>
        <MetricRail metrics={snapshot.metrics} />
        <LayerControls layers={layers} onToggleLayer={toggleLayer} />
        <ZoomControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onToggleDebug={toggleDebug}
        />
        <InsightDrawer
          activeAnchor={activeAnchor}
          regions={regions}
          species={speciesRecords}
          zoos={zooSites}
          overlays={referenceOverlays}
          currentYear={currentYear}
          selectedRegionId={selectedRegionId}
          selectedSpeciesId={selectedSpeciesId}
          selectedZooId={selectedZooId}
          onSelectSpecies={selectSpecies}
          onSelectZoo={selectZoo}
        />
        <TimelineScrubber
          anchors={timelineAnchors}
          year={currentYear}
          onYearChange={setYear}
        />
        <DebugPanel
          open={debugOpen}
          snapshot={snapshot}
          selectedRegionId={selectedRegionId}
          selectedSpeciesId={selectedSpeciesId}
          selectedZooId={selectedZooId}
        />
      </section>

      <section className="story-scroll" aria-label="Infogeographic story panels">
        <div className="story-band intro-band">
          <div>
            <span className="section-kicker">Witness statement</span>
            <h2>His lifetime becomes the measuring instrument.</h2>
          </div>
          <p>
            The globe above turns Attenborough's story into a traversable model:
            population brightens into city webs, wild space thins into scattered
            green, species records pull the viewer toward living systems under pressure.
          </p>
        </div>
        <div className="infographic-grid">
          <BiomePressureMap year={currentYear} snapshot={snapshot} />
          <PopulationExpansionMap year={currentYear} snapshot={snapshot} />
          <SpeciesLossMatrix year={currentYear} snapshot={snapshot} />
          <ReferenceRepoHorizonPanel year={currentYear} snapshot={snapshot} />
        </div>
        <section className="source-band" data-testid="source-section">
          <span className="section-kicker">Provenance</span>
          <h2>Every number keeps a trail.</h2>
          <p>
            The first manuscript anchor comes from the supplied excerpt. Later
            timeline gaps are supplemented with public data and marked as such,
            so the interface can grow without confusing memory, simulation, and source.
          </p>
        </section>
      </section>
    </main>
  );
}
