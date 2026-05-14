import { beforeEach, describe, expect, it } from "vitest";
import { usePlanetStore } from "./usePlanetStore";

describe("usePlanetStore year selection", () => {
  beforeEach(() => {
    usePlanetStore.setState(usePlanetStore.getInitialState(), true);
  });

  it("selects a year in the controlled globe state", () => {
    usePlanetStore.getState().setYear(1960);

    const state = usePlanetStore.getState();

    expect(state.currentYear).toBe(1960);
  });
});

describe("usePlanetStore layer toggles", () => {
  beforeEach(() => {
    usePlanetStore.setState(usePlanetStore.getInitialState(), true);
  });

  it("toggles layer state and supports explicit layer assignment", () => {
    expect(usePlanetStore.getState().layers.atmosphere).toBe(true);

    usePlanetStore.getState().toggleLayer("atmosphere");

    const disabledState = usePlanetStore.getState();

    expect(disabledState.layers.atmosphere).toBe(false);

    usePlanetStore.getState().setLayer("atmosphere", true);

    const enabledState = usePlanetStore.getState();

    expect(enabledState.layers.atmosphere).toBe(true);
  });
});

describe("usePlanetStore Earth view modes", () => {
  beforeEach(() => {
    usePlanetStore.setState(usePlanetStore.getInitialState(), true);
  });

  it("starts in the Earth from space globe preset", () => {
    const state = usePlanetStore.getState();

    expect(state.activeView).toBe("space");
    expect(state.earthView).toBe("space");
    expect(state.viewMode).toBe("globe3d");
    expect(state.globeView.longitudeDeg).toBe(-38);
    expect(state.globeView.latitudeDeg).toBe(12);
  });

  it("switches topographic and administrative globe views without clearing selections", () => {
    usePlanetStore.getState().selectSpecies("blue-whale");
    usePlanetStore.getState().setActiveView("topographic");

    const topoState = usePlanetStore.getState();

    expect(topoState.activeView).toBe("topographic");
    expect(topoState.globeView.activeView).toBe("topographic");
    expect(topoState.layers.topographicRelief).toBe(true);
    expect(topoState.selectedSpeciesId).toBe("blue-whale");

    topoState.setEarthView("admin-regions");

    const adminState = usePlanetStore.getState();

    expect(adminState.activeView).toBe("admin-regions");
    expect(adminState.layers.adminBoundaries).toBe(true);
    expect(adminState.selectedSpeciesId).toBe("blue-whale");
  });

  it("uses wrapped longitude, clamped latitude, zoom, and reset behavior", () => {
    usePlanetStore.getState().zoomIn();
    usePlanetStore.getState().panGlobeView(740, 150);

    const zoomedGlobe = usePlanetStore.getState();

    expect(zoomedGlobe.globeView.zoomScalar).toBeGreaterThan(0.48);
    expect(zoomedGlobe.globeView.longitudeDeg).toBe(-18);
    expect(zoomedGlobe.globeView.latitudeDeg).toBe(82);

    zoomedGlobe.zoomGlobeView(-4);
    expect(usePlanetStore.getState().globeView.zoomScalar).toBe(0);

    usePlanetStore.getState().resetView();

    const resetGlobe = usePlanetStore.getState();
    expect(resetGlobe.globeView.zoomScalar).toBe(0.48);
    expect(resetGlobe.globeView.longitudeDeg).toBe(-38);
    expect(resetGlobe.globeView.latitudeDeg).toBe(12);
  });

  it("tracks wild-space definition mode independently from the witness metric", () => {
    usePlanetStore.getState().setWildSpaceDefinition("low-human-footprint");

    expect(usePlanetStore.getState().wildSpaceDefinition).toBe("low-human-footprint");
    expect(usePlanetStore.getState().snapshot.metrics.remainingWildSpacePercent).toBeDefined();
  });

  it("preserves the selected geographic change layer across globe view changes", () => {
    usePlanetStore.getState().setActiveGeoChangeLayer("ocean-ice");
    usePlanetStore.getState().setActiveView("topographic");

    expect(usePlanetStore.getState().activeGeoChangeLayer).toBe("ocean-ice");

    usePlanetStore.getState().setActiveView("space");

    expect(usePlanetStore.getState().activeGeoChangeLayer).toBe("ocean-ice");
  });

  it("tracks editorial navigation, witness tabs, fullscreen, and search query", () => {
    const state = usePlanetStore.getState();

    expect(state.activePrimarySection).toBe("overview");
    expect(state.activeWitnessTab).toBe("witness");
    expect(state.isFullscreenRequested).toBe(false);
    expect(state.searchQuery).toBe("");

    state.setActivePrimarySection("stories");
    expect(usePlanetStore.getState().activePrimarySection).toBe("stories");
    expect(usePlanetStore.getState().activeWitnessTab).toBe("stories");

    usePlanetStore.getState().setActiveWitnessTab("insights");
    expect(usePlanetStore.getState().activeWitnessTab).toBe("insights");

    usePlanetStore.getState().setFullscreenRequested(true);
    expect(usePlanetStore.getState().isFullscreenRequested).toBe(true);

    usePlanetStore.getState().setSearchQuery("orangutan");
    expect(usePlanetStore.getState().searchQuery).toBe("orangutan");
    expect(usePlanetStore.getState().activePrimarySection).toBe("search");
  });

  it("tracks scroll atlas chapter state and applies chapter camera targets", () => {
    const state = usePlanetStore.getState();

    state.setScrollChapter("trade-1900", 1900, {
      lat: 22,
      lon: 35,
      zoomScalar: 0.58
    });

    const chapterState = usePlanetStore.getState();

    expect(chapterState.scrollMode).toBe("narrative");
    expect(chapterState.activeScrollChapterId).toBe("trade-1900");
    expect(chapterState.currentYear).toBe(1900);
    expect(chapterState.globeView.latitudeDeg).toBe(22);
    expect(chapterState.globeView.longitudeDeg).toBe(35);
    expect(chapterState.globeView.zoomScalar).toBe(0.58);

    chapterState.setScrollMode("manual");

    expect(usePlanetStore.getState().scrollMode).toBe("manual");
  });

  it("applies explicit globe view targets for selected story and search items", () => {
    const state = usePlanetStore.getState();

    state.setGlobeViewTarget({ lat: -2.3, lon: 34.8, zoomScalar: 0.78 });

    const targetState = usePlanetStore.getState();

    expect(targetState.globeView.latitudeDeg).toBe(-2.3);
    expect(targetState.globeView.longitudeDeg).toBeCloseTo(34.8);
    expect(targetState.globeView.zoomScalar).toBe(0.78);
    expect(targetState.scrollMode).toBe("manual");
  });

  it("switches between globe and 2D map mode with basemap selection", () => {
    const state = usePlanetStore.getState();

    state.setViewMode("map2d");
    state.setEarthBasemap("political");

    expect(usePlanetStore.getState().viewMode).toBe("map2d");
    expect(usePlanetStore.getState().earthBasemap).toBe("political");

    usePlanetStore.getState().setViewMode("globe3d");

    expect(usePlanetStore.getState().viewMode).toBe("globe3d");
  });
});
