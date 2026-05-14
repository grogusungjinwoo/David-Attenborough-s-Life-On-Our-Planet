import { Line } from "@react-three/drei";
import { Color } from "three";
import type { TradeRouteRecord } from "../../domain/types";
import { getRouteIntensityForYear } from "../../data";
import { greatCircleArc } from "./spherical";

type TradeRouteLayerProps = {
  routes: TradeRouteRecord[];
  currentYear: number;
  activeRouteIds?: string[];
};

const categoryColors: Record<TradeRouteRecord["category"], string> = {
  steamship: "#e5c16e",
  oil: "#df8a45",
  grain: "#bdd56d",
  container: "#65d0c3",
  air: "#8bbdff",
  digital: "#c6a6ff"
};

export function buildVisibleTradeRoutes(
  routes: TradeRouteRecord[],
  currentYear: number,
  activeRouteIds: string[] = []
) {
  const activeIds = new Set(activeRouteIds);

  return routes
    .map((route) => ({
      ...route,
      active: activeIds.has(route.id),
      intensity: getRouteIntensityForYear(route, currentYear)
    }))
    .filter((route) => route.intensity > 0.02);
}

export function TradeRouteLayer({
  routes,
  currentYear,
  activeRouteIds = []
}: TradeRouteLayerProps) {
  return (
    <group>
      {buildVisibleTradeRoutes(routes, currentYear, activeRouteIds).map((route) => {
        const color = new Color(categoryColors[route.category]);
        const emphasis = route.active ? 1.32 : 1;

        return (
          <Line
            key={route.id}
            points={greatCircleArc(
              [route.start.lon, route.start.lat],
              [route.end.lon, route.end.lat],
              48,
              1.072 + route.intensity * 0.025
            )}
            color={color}
            lineWidth={(0.6 + route.intensity * 2.2) * emphasis}
            transparent
            opacity={Math.min(0.94, 0.2 + route.intensity * 0.62 * emphasis)}
          />
        );
      })}
    </group>
  );
}
