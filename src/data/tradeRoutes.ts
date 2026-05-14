import type { TradeRouteRecord } from "../domain/types";
import { sourceCatalog } from "./sources";

const maritimeRefs = [
  sourceCatalog.unctadMaritimeTransport,
  sourceCatalog.wtoTradeStats,
  sourceCatalog.worldBankWits
];

export const tradeRoutes: TradeRouteRecord[] = [
  route("north-atlantic-steamship", "North Atlantic steamship corridor", "London", 51.5, -0.1, "New York", 40.7, -74, 1900, 1954, "steamship", [0.22, 0.38, 0.5, 0.42, 0.36, 0.3]),
  route("suez-indian-ocean", "Suez to Indian Ocean route", "Suez", 30, 32.5, "Mumbai", 19.1, 72.9, 1900, 1978, "steamship", [0.18, 0.3, 0.42, 0.58, 0.62, 0.55]),
  route("persian-gulf-oil", "Persian Gulf oil lane", "Ras Tanura", 26.6, 50.2, "Rotterdam", 51.9, 4.5, 1937, 1978, "oil", [0, 0.18, 0.46, 0.8, 0.76, 0.66]),
  route("panama-pacific", "Panama Pacific crossing", "Panama Canal", 9.1, -79.7, "Los Angeles", 34, -118.2, 1900, 1997, "container", [0.08, 0.16, 0.32, 0.58, 0.84, 0.9]),
  route("east-asia-container", "East Asia container arc", "Shanghai", 31.2, 121.5, "Singapore", 1.35, 103.82, 1978, 2024, "container", [0, 0, 0, 0.42, 0.78, 1]),
  route("pacific-container", "Pacific container bridge", "Shanghai", 31.2, 121.5, "Los Angeles", 34, -118.2, 1978, 2024, "container", [0, 0, 0, 0.48, 0.86, 1]),
  route("grain-atlantic", "Atlantic grain and food route", "Buenos Aires", -34.6, -58.4, "Lagos", 6.5, 3.4, 1954, 2020, "grain", [0, 0, 0.24, 0.42, 0.66, 0.78]),
  route("air-cargo-eurasia", "Eurasian air cargo corridor", "Frankfurt", 50.1, 8.7, "Tokyo", 35.7, 139.7, 1997, 2024, "air", [0, 0, 0, 0, 0.62, 0.82]),
  route("transpacific-data-cable", "Transpacific data cable corridor", "Singapore", 1.35, 103.82, "Los Angeles", 34, -118.2, 2000, 2024, "digital", [0, 0, 0, 0, 0, 0.78]),
  route("southern-resource", "Southern resource passage", "Perth", -31.9, 115.9, "Cape Town", -33.9, 18.4, 1978, 2020, "oil", [0, 0, 0, 0.28, 0.54, 0.74])
];

export function getRouteIntensityForYear(routeRecord: TradeRouteRecord, year: number) {
  if (year < routeRecord.firstYear) {
    return 0;
  }

  const samples = [...routeRecord.intensityByYear].sort((a, b) => a.year - b.year);
  const first = samples[0];
  const last = samples.at(-1)!;

  if (year <= first.year) {
    return first.intensity;
  }

  if (year >= last.year) {
    return last.intensity;
  }

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const next = samples[index];

    if (year <= next.year) {
      const progress = (year - previous.year) / (next.year - previous.year);
      return previous.intensity + (next.intensity - previous.intensity) * progress;
    }
  }

  return last.intensity;
}

function route(
  id: string,
  label: string,
  startLabel: string,
  startLat: number,
  startLon: number,
  endLabel: string,
  endLat: number,
  endLon: number,
  firstYear: number,
  peakYear: number,
  category: TradeRouteRecord["category"],
  intensities: number[]
): TradeRouteRecord {
  const years = [1900, 1937, 1954, 1978, 1997, 2024];

  return {
    id,
    label,
    start: { label: startLabel, lat: startLat, lon: startLon },
    end: { label: endLabel, lat: endLat, lon: endLon },
    firstYear,
    peakYear,
    category,
    intensityByYear: years.map((year, index) => ({
      year,
      intensity: year < firstYear ? 0 : intensities[index]
    })),
    sourceRefs:
      category === "container"
        ? [...maritimeRefs, sourceCatalog.oecdContainerTransport]
        : category === "digital"
          ? [sourceCatalog.teleGeographySubmarineCableMap, sourceCatalog.wtoTradeStats]
          : maritimeRefs
  };
}
