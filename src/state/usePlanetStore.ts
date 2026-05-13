import { create } from "zustand";
import { defaultLayers } from "../domain/timeline";
import type { LayerState as AppLayerState } from "../domain/types";
import {
  getWorldSnapshot,
  type LayerState as StoryLayerState,
  type WorldSnapshot
} from "../domain/storyModel";

type AppLayerKey = keyof AppLayerState;
type StoryLayerKey = keyof StoryLayerState;

export type PlanetLayerKey = AppLayerKey | StoryLayerKey;
export type PlanetLayerState = AppLayerState & StoryLayerState;
export type ZoomIntent = "idle" | "in" | "out" | "reset";
export type EarthView = "globe-satellite" | "map-satellite" | "map-topographic" | "map-political";
export type EarthViewMode = "globe3d" | "map2d";
export type EarthBasemap = "satellite" | "topographic" | "political";

export type MapViewport = {
  zoom: number;
  center: [number, number];
};

export type PlanetAction =
  | { type: "yearSelected"; year: number }
  | { type: "regionSelected"; regionId?: string }
  | { type: "speciesSelected"; speciesId?: string }
  | { type: "zooSelected"; zooId?: string }
  | { type: "layerToggled"; layer: PlanetLayerKey }
  | { type: "layerSet"; layer: PlanetLayerKey; enabled: boolean }
  | { type: "earthViewSelected"; earthView: EarthView }
  | { type: "zoomed"; intent: Exclude<ZoomIntent, "idle"> }
  | { type: "debugToggled" };

export type PlanetActions = {
  selectYear: (year: number) => void;
  selectRegion: (regionId?: string) => void;
  selectSpecies: (speciesId?: string) => void;
  selectZoo: (zooId?: string) => void;
  toggleLayer: (layer: PlanetLayerKey) => void;
  setLayer: (layer: PlanetLayerKey, enabled: boolean) => void;
  setEarthView: (earthView: EarthView) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleDebug: () => void;
};

export type PlanetState = {
  selectedYear: number;
  currentYear: number;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  earthView: EarthView;
  viewMode: EarthViewMode;
  earthBasemap: EarthBasemap;
  mapViewport: MapViewport;
  layers: PlanetLayerState;
  layerToggles: StoryLayerState;
  snapshot: WorldSnapshot;
  zoomIntent: ZoomIntent;
  zoomScalar: number;
  debugOpen: boolean;
  actions: PlanetActions;
  dispatch: (action: PlanetAction) => void;
  setYear: (year: number) => void;
  selectRegion: (regionId?: string) => void;
  selectSpecies: (speciesId?: string) => void;
  selectZoo: (zooId?: string) => void;
  toggleLayer: (layer: PlanetLayerKey) => void;
  setLayer: (layer: PlanetLayerKey, enabled: boolean) => void;
  setEarthView: (earthView: EarthView) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleDebug: () => void;
};

const initialYear = 2024;
const initialZoomScalar = 0.48;
const initialMapViewport: MapViewport = { zoom: 1.4, center: [0, 12] };
const zoomStep = 0.14;
const mapZoomStep = 0.32;

const layerCounterparts: Partial<Record<PlanetLayerKey, PlanetLayerKey[]>> = {
  atmosphere: ["climate"],
  climate: ["atmosphere"],
  vegetation: ["wildSpace"],
  wildSpace: ["vegetation"],
  settlements: ["population"],
  population: ["settlements"]
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function createInitialLayers(): PlanetLayerState {
  return {
    ...defaultLayers,
    ...getWorldSnapshot(initialYear).layers
  } as PlanetLayerState;
}

function pickStoryLayers(layers: PlanetLayerState): StoryLayerState {
  return {
    wildSpace: layers.wildSpace,
    population: layers.population,
    species: layers.species,
    zoos: layers.zoos,
    climate: layers.climate
  };
}

function deriveSnapshot(year: number, layerToggles: StoryLayerState): WorldSnapshot {
  return {
    ...getWorldSnapshot(year),
    layers: { ...layerToggles }
  };
}

function withLayerValue(
  layers: PlanetLayerState,
  layer: PlanetLayerKey,
  enabled: boolean
): PlanetLayerState {
  const nextLayers = { ...layers } as Record<PlanetLayerKey, boolean>;
  nextLayers[layer] = enabled;

  for (const counterpart of layerCounterparts[layer] ?? []) {
    nextLayers[counterpart] = enabled;
  }

  return nextLayers as PlanetLayerState;
}

function layerUpdate(
  state: PlanetState,
  layer: PlanetLayerKey,
  enabled: boolean
): Pick<PlanetState, "layers" | "layerToggles" | "snapshot"> {
  const layers = withLayerValue(state.layers, layer, enabled);
  const layerToggles = pickStoryLayers(layers);

  return {
    layers,
    layerToggles,
    snapshot: deriveSnapshot(state.selectedYear, layerToggles)
  };
}

function earthViewState(earthView: EarthView): Pick<PlanetState, "earthView" | "viewMode" | "earthBasemap"> {
  const [mode, basemap] = earthView.split("-") as ["globe" | "map", EarthBasemap];

  return {
    earthView,
    viewMode: mode === "globe" ? "globe3d" : "map2d",
    earthBasemap: basemap
  };
}

function reducePlanetState(
  state: PlanetState,
  action: PlanetAction
): Partial<PlanetState> {
  switch (action.type) {
    case "yearSelected": {
      const selectedYear = Math.round(action.year);

      return {
        selectedYear,
        currentYear: selectedYear,
        snapshot: deriveSnapshot(selectedYear, state.layerToggles)
      };
    }
    case "regionSelected":
      return {
        selectedRegionId: action.regionId,
        selectedSpeciesId: undefined,
        selectedZooId: undefined
      };
    case "speciesSelected":
      return {
        selectedSpeciesId:
          state.selectedSpeciesId === action.speciesId ? undefined : action.speciesId,
        selectedZooId: undefined
      };
    case "zooSelected":
      return {
        selectedZooId: state.selectedZooId === action.zooId ? undefined : action.zooId,
        selectedSpeciesId: undefined
      };
    case "layerToggled":
      return layerUpdate(
        state,
        action.layer,
        !((state.layers as Record<PlanetLayerKey, boolean>)[action.layer] ?? false)
      );
    case "layerSet":
      return layerUpdate(state, action.layer, action.enabled);
    case "earthViewSelected":
      return earthViewState(action.earthView);
    case "zoomed":
      if (state.viewMode === "map2d") {
        return {
          zoomIntent: action.intent,
          mapViewport:
            action.intent === "reset"
              ? initialMapViewport
              : {
                  ...state.mapViewport,
                  zoom: clamp(
                    state.mapViewport.zoom +
                      (action.intent === "in" ? mapZoomStep : -mapZoomStep),
                    0.6,
                    6
                  )
                }
        };
      }

      return {
        zoomIntent: action.intent,
        zoomScalar:
          action.intent === "reset"
            ? initialZoomScalar
            : clamp(
                state.zoomScalar + (action.intent === "in" ? zoomStep : -zoomStep),
                0,
                1
              )
      };
    case "debugToggled":
      return { debugOpen: !state.debugOpen };
  }
}

export const usePlanetStore = create<PlanetState>((set) => {
  const layers = createInitialLayers();
  const layerToggles = pickStoryLayers(layers);
  const dispatch = (action: PlanetAction) => {
    set((state) => reducePlanetState(state, action));
  };
  const actions: PlanetActions = {
    selectYear: (year) => dispatch({ type: "yearSelected", year }),
    selectRegion: (regionId) => dispatch({ type: "regionSelected", regionId }),
    selectSpecies: (speciesId) => dispatch({ type: "speciesSelected", speciesId }),
    selectZoo: (zooId) => dispatch({ type: "zooSelected", zooId }),
    toggleLayer: (layer) => dispatch({ type: "layerToggled", layer }),
    setLayer: (layer, enabled) => dispatch({ type: "layerSet", layer, enabled }),
    setEarthView: (earthView) => dispatch({ type: "earthViewSelected", earthView }),
    zoomIn: () => dispatch({ type: "zoomed", intent: "in" }),
    zoomOut: () => dispatch({ type: "zoomed", intent: "out" }),
    resetView: () => dispatch({ type: "zoomed", intent: "reset" }),
    toggleDebug: () => dispatch({ type: "debugToggled" })
  };

  return {
    selectedYear: initialYear,
    currentYear: initialYear,
    selectedRegionId: undefined,
    selectedSpeciesId: undefined,
    selectedZooId: undefined,
    earthView: "globe-satellite",
    viewMode: "globe3d",
    earthBasemap: "satellite",
    mapViewport: initialMapViewport,
    layers,
    layerToggles,
    snapshot: deriveSnapshot(initialYear, layerToggles),
    zoomIntent: "idle",
    zoomScalar: initialZoomScalar,
    debugOpen: false,
    actions,
    dispatch,
    setYear: actions.selectYear,
    selectRegion: actions.selectRegion,
    selectSpecies: actions.selectSpecies,
    selectZoo: actions.selectZoo,
    toggleLayer: actions.toggleLayer,
    setLayer: actions.setLayer,
    setEarthView: actions.setEarthView,
    zoomIn: actions.zoomIn,
    zoomOut: actions.zoomOut,
    resetView: actions.resetView,
    toggleDebug: actions.toggleDebug
  };
});
