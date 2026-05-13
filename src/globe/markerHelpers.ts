import {
  getSpeciesForYear,
  historicZooSites,
  type WorldSnapshot
} from "../domain/storyModel";

export type GlobeMarkerKind = "wild-space" | "city" | "species" | "zoo";

export type GlobeMarker = {
  id: string;
  kind: GlobeMarkerKind;
  label: string;
  position: [number, number, number];
};

export type SurfaceTuple = [number, number, number];

export type SurfacePointGroups = {
  land: SurfaceTuple[];
  wildSpace: SurfaceTuple[];
  cities: SurfaceTuple[];
  waterStress: SurfaceTuple[];
};

const wildSpaceRegions = [
  { id: "amazon", label: "Amazon wild-space reserve", lat: -3.4, lon: -62.2 },
  { id: "congo", label: "Central Africa", lat: -1.5, lon: 21.7 },
  { id: "borneo", label: "Borneo rainforest", lat: 0.9, lon: 114.4 }
];

const cityRegions = [
  { id: "north-america", label: "North American city web", lat: 40.7, lon: -74 },
  { id: "europe", label: "European city web", lat: 50.1, lon: 8.6 },
  { id: "south-asia", label: "South Asian city web", lat: 22.6, lon: 78.9 },
  { id: "east-asia", label: "East Asian city web", lat: 35.8, lon: 116.4 }
];

const speciesPositions: Record<string, { lat: number; lon: number }> = {
  "mountain-gorilla": { lat: -1.4, lon: 29.6 },
  "northern-white-rhinoceros": { lat: 0.2, lon: 32.5 },
  "amur-leopard": { lat: 44.5, lon: 134.6 },
  "hawksbill-turtle": { lat: -7.2, lon: 130.1 },
  "golden-toad": { lat: 10.3, lon: -84.8 },
  "bengal-tiger": { lat: 22.0, lon: 88.8 }
};

export function buildGlobeMarkers(snapshot: WorldSnapshot): GlobeMarker[] {
  const markers: GlobeMarker[] = [];

  if (snapshot.layers.wildSpace) {
    for (const region of wildSpaceRegions) {
      markers.push({
        id: `wild-${region.id}`,
        kind: "wild-space",
        label: region.label,
        position: latLonToTuple(region.lat, region.lon, 1.08)
      });
    }
  }

  if (snapshot.layers.population) {
    for (const city of cityRegions) {
      markers.push({
        id: `city-${city.id}`,
        kind: "city",
        label: city.label,
        position: latLonToTuple(city.lat, city.lon, 1.1)
      });
    }
  }

  if (snapshot.layers.species) {
    for (const species of getSpeciesForYear(snapshot.year)) {
      const location = speciesPositions[species.id] ?? { lat: 0, lon: 0 };
      markers.push({
        id: `species-${species.id}`,
        kind: "species",
        label: species.name,
        position: latLonToTuple(location.lat, location.lon, 1.14)
      });
    }
  }

  if (snapshot.layers.zoos) {
    for (const site of historicZooSites.filter(
      (zoo) => !zoo.openedYear || zoo.openedYear <= snapshot.year
    )) {
      markers.push({
        id: `zoo-${site.id}`,
        kind: "zoo",
        label: site.name,
        position: latLonToTuple(site.lat, site.lon, 1.16)
      });
    }
  }

  return markers;
}

export function buildSurfacePoints(snapshot: WorldSnapshot): SurfacePointGroups {
  const land = makeSurfaceSeries(64, 1.01, 7);
  const wildSpaceCount = Math.max(4, Math.round(54 * snapshot.proceduralDensity.trees));
  const cityCount = Math.max(3, Math.round(42 * snapshot.proceduralDensity.buildings));
  const waterStressCount = Math.round(28 * snapshot.proceduralDensity.waterStress);

  return {
    land,
    wildSpace: snapshot.layers.wildSpace
      ? makeSurfaceSeries(wildSpaceCount, 1.045, snapshot.year)
      : [],
    cities: snapshot.layers.population
      ? makeSurfaceSeries(cityCount, 1.07, snapshot.year + 31)
      : [],
    waterStress: snapshot.layers.climate
      ? makeSurfaceSeries(waterStressCount, 1.075, snapshot.year + 67)
      : []
  };
}

export function latLonToTuple(
  lat: number,
  lon: number,
  radius = 1
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
}

function makeSurfaceSeries(count: number, radius: number, seed: number): SurfaceTuple[] {
  return Array.from({ length: count }, (_, index) => {
    const lat = pseudoRandom(seed + index * 19, -58, 68);
    const lon = pseudoRandom(seed + index * 31, -175, 175);
    return latLonToTuple(lat, lon, radius);
  });
}

function pseudoRandom(seed: number, min: number, max: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return min + (value - Math.floor(value)) * (max - min);
}
