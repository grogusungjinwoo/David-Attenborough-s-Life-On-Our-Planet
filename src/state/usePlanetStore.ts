import { create } from "zustand";
import { defaultLayers } from "../domain/timeline";
import type {
  GlobeActiveView,
  GeoChangeLayerId,
  GlobeQuality,
  GlobeViewState,
  LayerState as AppLayerState,
  PrimarySection,
  WitnessTab,
  WildSpaceDefinition
} from "../domain/types";
import { clampLatitude, wrapLongitude } from "../features/globe/spherical";
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
export type EarthView = GlobeActiveView;
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
  | { type: "activeViewSelected"; activeView: GlobeActiveView }
  | { type: "geoChangeLayerSelected"; layerId: GeoChangeLayerId }
  | { type: "qualitySelected"; quality: GlobeQuality }
  | { type: "wildSpaceDefinitionSelected"; definition: WildSpaceDefinition }
  | { type: "primarySectionSelected"; section: PrimarySection }
  | { type: "witnessTabSelected"; tab: WitnessTab }
  | { type: "fullscreenRequested"; requested: boolean }
  | { type: "searchQueryChanged"; query: string }
  | { type: "globePanned"; longitudeDeltaDeg: number; latitudeDeltaDeg: number }
  | { type: "globeZoomed"; delta: number }
  | { type: "zoomed"; intent: Exclude<ZoomIntent, "idle"> }
  | { type: "debugToggled" };

export type PlanetActions = {
  selectYear: (year: number) => void;
  selectRegion: (regionId?: string) => void;
  selectSpecies: (speciesId?: string) => void;
  selectZoo: (zooId?: string) => void;
  toggleLayer: (layer: PlanetLayerKey) => void;
  setLayer: (layer: PlanetLayerKey, enabled: boolean) => void;
  setActiveView: (activeView: GlobeActiveView) => void;
  setActiveGeoChangeLayer: (layerId: GeoChangeLayerId) => void;
  setEarthView: (earthView: EarthView) => void;
  setQuality: (quality: GlobeQuality) => void;
  setWildSpaceDefinition: (definition: WildSpaceDefinition) => void;
  setActivePrimarySection: (section: PrimarySection) => void;
  setActiveWitnessTab: (tab: WitnessTab) => void;
  setFullscreenRequested: (requested: boolean) => void;
  setSearchQuery: (query: string) => void;
  panGlobeView: (longitudeDeltaDeg: number, latitudeDeltaDeg: number) => void;
  zoomGlobeView: (delta: number) => void;
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
  globeView: GlobeViewState;
  activeView: GlobeActiveView;
  activeGeoChangeLayer: GeoChangeLayerId;
  wildSpaceDefinition: WildSpaceDefinition;
  activePrimarySection: PrimarySection;
  activeWitnessTab: WitnessTab;
  isFullscreenRequested: boolean;
  searchQuery: string;
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
  setActiveView: (activeView: GlobeActiveView) => void;
  setActiveGeoChangeLayer: (layerId: GeoChangeLayerId) => void;
  setEarthView: (earthView: EarthView) => void;
  setQuality: (quality: GlobeQuality) => void;
  setWildSpaceDefinition: (definition: WildSpaceDefinition) => void;
  setActivePrimarySection: (section: PrimarySection) => void;
  setActiveWitnessTab: (tab: WitnessTab) => void;
  setFullscreenRequested: (requested: boolean) => void;
  setSearchQuery: (query: string) => void;
  panGlobeView: (longitudeDeltaDeg: number, latitudeDeltaDeg: number) => void;
  zoomGlobeView: (delta: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleDebug: () => void;
};

const initialYear = 2024;
const initialZoomScalar = 0.48;
const initialGlobeView: GlobeViewState = {
  longitudeDeg: -38,
  latitudeDeg: 12,
  zoomScalar: initialZoomScalar,
  activeView: "space",
  quality: "auto"
};
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

function activeViewLayerUpdate(
  state: PlanetState,
  activeView: GlobeActiveView
): Pick<PlanetState, "activeView" | "earthView" | "globeView" | "layers" | "layerToggles" | "snapshot"> {
  const layers = {
    ...state.layers,
    topographicRelief: activeView === "topographic" || state.layers.topographicRelief,
    adminBoundaries: activeView === "admin-regions" || state.layers.adminBoundaries,
    wildSpace: activeView === "wild-evidence" || state.layers.wildSpace,
    vegetation: activeView === "wild-evidence" || state.layers.vegetation
  };
  const layerToggles = pickStoryLayers(layers);

  return {
    activeView,
    earthView: activeView,
    globeView: { ...state.globeView, activeView },
    layers,
    layerToggles,
    snapshot: deriveSnapshot(state.selectedYear, layerToggles)
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
    case "activeViewSelected":
      return activeViewLayerUpdate(state, action.activeView);
    case "geoChangeLayerSelected":
      return {
        activeGeoChangeLayer: action.layerId
      };
    case "qualitySelected":
      return {
        globeView: { ...state.globeView, quality: action.quality }
      };
    case "wildSpaceDefinitionSelected":
      return {
        wildSpaceDefinition: action.definition
      };
    case "primarySectionSelected":
      return {
        activePrimarySection: action.section,
        activeWitnessTab:
          action.section === "stories"
            ? "stories"
            : action.section === "overview"
              ? "witness"
              : state.activeWitnessTab
      };
    case "witnessTabSelected":
      return {
        activeWitnessTab: action.tab
      };
    case "fullscreenRequested":
      return {
        isFullscreenRequested: action.requested
      };
    case "searchQueryChanged":
      return {
        searchQuery: action.query,
        activePrimarySection: action.query.trim() ? "search" : state.activePrimarySection
      };
    case "globePanned":
      return {
        globeView: {
          ...state.globeView,
          longitudeDeg: wrapLongitude(state.globeView.longitudeDeg + action.longitudeDeltaDeg),
          latitudeDeg: clampLatitude(state.globeView.latitudeDeg + action.latitudeDeltaDeg)
        }
      };
    case "globeZoomed": {
      const zoomScalar = clamp(state.globeView.zoomScalar + action.delta, 0, 1);

      return {
        zoomScalar,
        globeView: {
          ...state.globeView,
          zoomScalar
        }
      };
    }
    case "zoomed":
      if (action.intent === "reset") {
        return {
          zoomIntent: action.intent,
          zoomScalar: initialZoomScalar,
          globeView: {
            ...initialGlobeView,
            activeView: state.globeView.activeView,
            quality: state.globeView.quality
          },
          mapViewport: initialMapViewport
        };
      }

      {
        const zoomScalar = clamp(
          state.globeView.zoomScalar + (action.intent === "in" ? zoomStep : -zoomStep),
          0,
          1
        );

        return {
          zoomIntent: action.intent,
          zoomScalar,
          globeView: {
            ...state.globeView,
            zoomScalar
          },
          mapViewport: {
            ...state.mapViewport,
            zoom: clamp(
              state.mapViewport.zoom + (action.intent === "in" ? mapZoomStep : -mapZoomStep),
              0.6,
              6
            )
          }
        };
      }
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
    setActiveView: (activeView) => dispatch({ type: "activeViewSelected", activeView }),
    setActiveGeoChangeLayer: (layerId) =>
      dispatch({ type: "geoChangeLayerSelected", layerId }),
    setEarthView: (earthView) => dispatch({ type: "activeViewSelected", activeView: earthView }),
    setQuality: (quality) => dispatch({ type: "qualitySelected", quality }),
    setWildSpaceDefinition: (definition) =>
      dispatch({ type: "wildSpaceDefinitionSelected", definition }),
    setActivePrimarySection: (section) =>
      dispatch({ type: "primarySectionSelected", section }),
    setActiveWitnessTab: (tab) => dispatch({ type: "witnessTabSelected", tab }),
    setFullscreenRequested: (requested) =>
      dispatch({ type: "fullscreenRequested", requested }),
    setSearchQuery: (query) => dispatch({ type: "searchQueryChanged", query }),
    panGlobeView: (longitudeDeltaDeg, latitudeDeltaDeg) =>
      dispatch({ type: "globePanned", longitudeDeltaDeg, latitudeDeltaDeg }),
    zoomGlobeView: (delta) => dispatch({ type: "globeZoomed", delta }),
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
    globeView: initialGlobeView,
    activeView: "space",
    wildSpaceDefinition: "witness-story",
    activeGeoChangeLayer: "wild-space",
    activePrimarySection: "overview",
    activeWitnessTab: "witness",
    isFullscreenRequested: false,
    searchQuery: "",
    earthView: "space",
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
    setActiveView: actions.setActiveView,
    setActiveGeoChangeLayer: actions.setActiveGeoChangeLayer,
    setEarthView: actions.setEarthView,
    setQuality: actions.setQuality,
    setWildSpaceDefinition: actions.setWildSpaceDefinition,
    setActivePrimarySection: actions.setActivePrimarySection,
    setActiveWitnessTab: actions.setActiveWitnessTab,
    setFullscreenRequested: actions.setFullscreenRequested,
    setSearchQuery: actions.setSearchQuery,
    panGlobeView: actions.panGlobeView,
    zoomGlobeView: actions.zoomGlobeView,
    zoomIn: actions.zoomIn,
    zoomOut: actions.zoomOut,
    resetView: actions.resetView,
    toggleDebug: actions.toggleDebug
  };
});
