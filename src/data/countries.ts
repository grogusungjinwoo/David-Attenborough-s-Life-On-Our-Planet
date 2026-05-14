import type { ContinentId, CountryRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

type CountrySeed = [
  string,
  string,
  string,
  string,
  ContinentId,
  number,
  number,
  [number, number, number, number],
  number
];

const naturalEarthRefs = [sourceCatalog.naturalEarth, sourceCatalog.unSalb];

const rows: CountrySeed[] = [
  ["canada", "CA", "CAN", "Canada", "north-america", 56, -106, [-141, 42, -52, 84], 1],
  ["united-states", "US", "USA", "United States", "north-america", 39, -98, [-125, 24, -66, 49], 1],
  ["mexico", "MX", "MEX", "Mexico", "north-america", 23, -102, [-118, 14, -86, 33], 2],
  ["greenland", "GL", "GRL", "Greenland", "north-america", 72, -42, [-74, 59, -12, 84], 2],
  ["costa-rica", "CR", "CRI", "Costa Rica", "north-america", 9.8, -84.1, [-86, 8, -82, 11], 3],
  ["brazil", "BR", "BRA", "Brazil", "south-america", -10, -52, [-74, -34, -34, 5], 1],
  ["argentina", "AR", "ARG", "Argentina", "south-america", -35, -64, [-73, -55, -53, -21], 2],
  ["chile", "CL", "CHL", "Chile", "south-america", -30, -71, [-76, -56, -66, -17], 2],
  ["peru", "PE", "PER", "Peru", "south-america", -9, -75, [-82, -18, -68, 0], 3],
  ["colombia", "CO", "COL", "Colombia", "south-america", 4.5, -74, [-79, -4, -66, 13], 3],
  ["united-kingdom", "GB", "GBR", "United Kingdom", "europe", 55, -3, [-8, 50, 2, 59], 1],
  ["france", "FR", "FRA", "France", "europe", 46.5, 2, [-5, 41, 9, 51], 1],
  ["germany", "DE", "DEU", "Germany", "europe", 51, 10, [5, 47, 15, 55], 1],
  ["italy", "IT", "ITA", "Italy", "europe", 42.8, 12.5, [6, 36, 19, 47], 2],
  ["spain", "ES", "ESP", "Spain", "europe", 40.3, -3.7, [-10, 36, 4, 44], 2],
  ["norway", "NO", "NOR", "Norway", "europe", 61, 8, [4, 58, 31, 71], 3],
  ["egypt", "EG", "EGY", "Egypt", "africa", 26.5, 30, [25, 22, 36, 32], 2],
  ["kenya", "KE", "KEN", "Kenya", "africa", 0.2, 37.8, [34, -5, 42, 5], 2],
  ["south-africa", "ZA", "ZAF", "South Africa", "africa", -29, 24, [16, -35, 33, -22], 2],
  ["nigeria", "NG", "NGA", "Nigeria", "africa", 9, 8, [3, 4, 15, 14], 2],
  ["democratic-republic-congo", "CD", "COD", "DR Congo", "africa", -2.5, 23.5, [12, -14, 31, 6], 3],
  ["madagascar", "MG", "MDG", "Madagascar", "africa", -19, 47, [43, -26, 51, -12], 3],
  ["india", "IN", "IND", "India", "asia", 22.8, 79, [68, 6, 97, 36], 1],
  ["china", "CN", "CHN", "China", "asia", 35, 103, [73, 18, 135, 54], 1],
  ["russia", "RU", "RUS", "Russia", "asia", 60, 95, [27, 41, 180, 82], 1],
  ["japan", "JP", "JPN", "Japan", "asia", 37, 138, [129, 31, 146, 46], 2],
  ["south-korea", "KR", "KOR", "South Korea", "asia", 36.3, 127.8, [124, 33, 132, 39], 2],
  ["indonesia", "ID", "IDN", "Indonesia", "asia", -2, 118, [95, -11, 141, 6], 2],
  ["singapore", "SG", "SGP", "Singapore", "asia", 1.35, 103.82, [103.6, 1.16, 104.1, 1.48], 3],
  ["saudi-arabia", "SA", "SAU", "Saudi Arabia", "asia", 24, 45, [34, 16, 56, 33], 2],
  ["australia", "AU", "AUS", "Australia", "oceania", -25, 134, [113, -44, 154, -10], 1],
  ["new-zealand", "NZ", "NZL", "New Zealand", "oceania", -41, 173, [166, -47, 179, -34], 2],
  ["papua-new-guinea", "PG", "PNG", "Papua New Guinea", "oceania", -6, 145, [141, -12, 155, 0], 3],
  ["fiji", "FJ", "FJI", "Fiji", "oceania", -17.8, 178, [176, -20, 180, -16], 4],
  ["antarctica", "AQ", "ATA", "Antarctica", "antarctica", -76, 22, [-180, -90, 180, -60], 1],
  ["morocco", "MA", "MAR", "Morocco", "africa", 31.8, -7.1, [-13, 27, -1, 36], 3],
  ["turkey", "TR", "TUR", "Turkiye", "asia", 39, 35, [26, 36, 45, 42], 2],
  ["thailand", "TH", "THA", "Thailand", "asia", 15.5, 101, [97, 5, 106, 21], 3],
  ["vietnam", "VN", "VNM", "Vietnam", "asia", 16, 108, [102, 8, 110, 24], 3],
  ["netherlands", "NL", "NLD", "Netherlands", "europe", 52.1, 5.3, [3, 50, 7, 54], 2],
  ["panama", "PA", "PAN", "Panama", "north-america", 8.5, -80, [-83, 7, -77, 10], 3]
];

export const countryLabelSeedRecords: CountryRecord[] = rows.map(
  ([id, isoA2, isoA3, name, continentId, labelLat, labelLon, bbox, importanceRank]) => ({
    id,
    isoA2,
    isoA3,
    name,
    continentId,
    labelLat,
    labelLon,
    bbox,
    importanceRank,
    sourceRefs: naturalEarthRefs
  })
);

export const countries = countryLabelSeedRecords;
