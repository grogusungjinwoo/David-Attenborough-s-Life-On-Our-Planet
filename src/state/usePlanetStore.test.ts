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

  it("starts in the satellite globe preset", () => {
    const state = usePlanetStore.getState();

    expect(state.earthView).toBe("globe-satellite");
    expect(state.viewMode).toBe("globe3d");
    expect(state.earthBasemap).toBe("satellite");
  });

  it("switches topographic and satellite presets into 2D map mode", () => {
    usePlanetStore.getState().selectSpecies("blue-whale");
    usePlanetStore.getState().setEarthView("map-topographic");

    const topoState = usePlanetStore.getState();

    expect(topoState.viewMode).toBe("map2d");
    expect(topoState.earthBasemap).toBe("topographic");
    expect(topoState.selectedSpeciesId).toBe("blue-whale");

    topoState.setEarthView("map-satellite");

    const satelliteState = usePlanetStore.getState();

    expect(satelliteState.viewMode).toBe("map2d");
    expect(satelliteState.earthBasemap).toBe("satellite");
    expect(satelliteState.selectedSpeciesId).toBe("blue-whale");
  });

  it("uses mode-aware zoom and reset behavior", () => {
    usePlanetStore.getState().setEarthView("map-topographic");
    usePlanetStore.getState().zoomIn();

    const zoomedMap = usePlanetStore.getState();

    expect(zoomedMap.mapViewport.zoom).toBeGreaterThan(1.4);
    expect(zoomedMap.zoomScalar).toBe(0.48);

    zoomedMap.resetView();

    const resetMap = usePlanetStore.getState();

    expect(resetMap.mapViewport.zoom).toBe(1.4);

    resetMap.setEarthView("globe-satellite");
    resetMap.zoomIn();

    expect(usePlanetStore.getState().zoomScalar).toBeGreaterThan(0.48);
  });
});
