import type { WildAreaRecord } from "../domain/types";
import { regions } from "./regions";
import { sourceCatalog } from "./sources";

const firstVisibleByRegion: Record<string, number> = {
  "amazon-basin": 1770,
  "central-africa": 1770,
  serengeti: 1937,
  borneo: 1937,
  "arctic-circle": 1954,
  "coral-triangle": 1978,
  "south-asia": 1978,
  "southern-ocean": 1997
};

const preferredRegionIds = new Set(Object.keys(firstVisibleByRegion));

export const wildAreas: WildAreaRecord[] = regions
  .filter((region) => preferredRegionIds.has(region.id))
  .map((region) => ({
    id: region.id,
    label: region.name,
    lat: region.lat,
    lon: region.lon,
    radiusKm: region.radiusKm,
    biome: region.biome,
    firstVisibleYear: firstVisibleByRegion[region.id],
    sourceRefs: [...region.sourceRefs, sourceCatalog.humanFootprint]
  }));
