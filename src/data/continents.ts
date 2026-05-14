import type { ContinentRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

const continentSourceRefs = [sourceCatalog.naturalEarth];

export const continents: ContinentRecord[] = [
  {
    id: "africa",
    name: "Africa",
    labelLat: 2.5,
    labelLon: 21,
    bbox: [-18, -35, 52, 38],
    sourceRefs: continentSourceRefs
  },
  {
    id: "antarctica",
    name: "Antarctica",
    labelLat: -76,
    labelLon: 22,
    bbox: [-180, -90, 180, -60],
    sourceRefs: continentSourceRefs
  },
  {
    id: "asia",
    name: "Asia",
    labelLat: 37,
    labelLon: 88,
    bbox: [26, -11, 180, 82],
    sourceRefs: continentSourceRefs
  },
  {
    id: "europe",
    name: "Europe",
    labelLat: 51,
    labelLon: 15,
    bbox: [-25, 35, 45, 72],
    sourceRefs: continentSourceRefs
  },
  {
    id: "north-america",
    name: "North America",
    labelLat: 49,
    labelLon: -103,
    bbox: [-170, 7, -12, 84],
    sourceRefs: continentSourceRefs
  },
  {
    id: "south-america",
    name: "South America",
    labelLat: -17,
    labelLon: -61,
    bbox: [-82, -56, -34, 13],
    sourceRefs: continentSourceRefs
  },
  {
    id: "oceania",
    name: "Oceania",
    labelLat: -24,
    labelLon: 135,
    bbox: [110, -48, 180, 0],
    sourceRefs: continentSourceRefs
  }
];
