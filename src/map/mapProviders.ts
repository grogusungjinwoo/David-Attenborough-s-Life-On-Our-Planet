import { sourceCatalog } from "../data/sources";
import type {
  MapProviderCapabilities,
  MapProviderKind,
  WorldSnapshot
} from "../domain/types";
export {
  earthBasemapDescriptors,
  earthDomainWorkstreams,
  staticEarthManifest,
  type EarthBasemapDescriptor,
  type EarthBasemapId,
  type EarthDomainWorkstream
} from "./earthManifest";

export type MapProviderDescriptor = {
  kind: MapProviderKind;
  label: string;
  description: string;
  capabilities: MapProviderCapabilities;
  sourceRefs: Array<(typeof sourceCatalog)[keyof typeof sourceCatalog]>;
};

export type PlanetLayerPayload = {
  snapshot: WorldSnapshot;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
};

export interface PlanetMapProvider {
  descriptor: MapProviderDescriptor;
  prepareLayers(payload: PlanetLayerPayload): PlanetLayerPayload;
}

export const staticEarthProvider: PlanetMapProvider = {
  descriptor: {
    kind: "static-earth",
    label: "Static open Earth atlas",
    description:
      "Open/rehostable Earth provider scaffold for accurate countries, topography, bathymetry, satellite basemaps, and regional QA workstreams.",
    capabilities: {
      supportsPhotorealisticTiles: false,
      supportsProceduralLayers: true,
      requiresApiKey: false,
      supportsStaticHosting: true,
      supports2DMode: true,
      supportsPoliticalMode: true,
      supportsTopographicMode: true,
      supportsSatelliteMode: true
    },
    sourceRefs: [
      sourceCatalog.naturalEarth,
      sourceCatalog.nasaBlueMarble,
      sourceCatalog.noaaEtopo,
      sourceCatalog.gebcoBathymetry,
      sourceCatalog.esaWorldCover
    ]
  },
  prepareLayers(payload) {
    return payload;
  }
};

export const simulatedGlobeProvider: PlanetMapProvider = {
  descriptor: {
    kind: "simulated-globe",
    label: "Simulated procedural globe",
    description:
      "A static-hosting-friendly Three.js globe with generated terrain and marker layers.",
    capabilities: {
      supportsPhotorealisticTiles: false,
      supportsProceduralLayers: true,
      requiresApiKey: false,
      supportsStaticHosting: true,
      supports2DMode: false,
      supportsPoliticalMode: false,
      supportsTopographicMode: false,
      supportsSatelliteMode: false
    },
    sourceRefs: []
  },
  prepareLayers(payload) {
    return payload;
  }
};

export const google3dMapsProviderDescriptor: MapProviderDescriptor = {
  kind: "google-3d-maps",
  label: "Future Google 3D Maps provider",
  description:
    "Adapter placeholder for Maps JavaScript 3D or Photorealistic 3D Tiles once an API key, billing, and usage policy review exist.",
  capabilities: {
    supportsPhotorealisticTiles: true,
    supportsProceduralLayers: true,
    requiresApiKey: true,
    supportsStaticHosting: true,
    supports2DMode: false,
    supportsPoliticalMode: false,
    supportsTopographicMode: true,
    supportsSatelliteMode: true
  },
  sourceRefs: [sourceCatalog.google3dMaps, sourceCatalog.google3dTiles]
};

export const availableMapProviders = [
  staticEarthProvider.descriptor,
  simulatedGlobeProvider.descriptor,
  google3dMapsProviderDescriptor
];
