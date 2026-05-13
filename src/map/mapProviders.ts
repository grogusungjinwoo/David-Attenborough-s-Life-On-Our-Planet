import type {
  MapProviderCapabilities,
  MapProviderKind,
  WorldSnapshot
} from "../domain/types";
import { sourceCatalog } from "../data/sources";

export type MapProviderDescriptor = {
  kind: MapProviderKind;
  label: string;
  description: string;
  capabilities: MapProviderCapabilities;
  sourceRefs: Array<typeof sourceCatalog[keyof typeof sourceCatalog]>;
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
      supportsStaticHosting: true
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
    supportsStaticHosting: true
  },
  sourceRefs: [sourceCatalog.google3dMaps, sourceCatalog.google3dTiles]
};

export const availableMapProviders = [
  simulatedGlobeProvider.descriptor,
  google3dMapsProviderDescriptor
];
