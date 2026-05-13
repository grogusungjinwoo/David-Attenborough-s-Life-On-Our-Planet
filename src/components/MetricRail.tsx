import { Activity, Cloud, Footprints, Sprout, Trees } from "lucide-react";
import type { MetricSnapshot } from "../domain/types";
import {
  formatAcres,
  formatCarbon,
  formatCount,
  formatPercent,
  formatPopulation
} from "../domain/formatters";

export type MetricRailProps = {
  metrics: MetricSnapshot;
  title?: string;
  className?: string;
};

export function MetricRail({
  metrics,
  title = "Planet state",
  className
}: MetricRailProps) {
  const items = [
    {
      label: "Population",
      value: formatPopulation(metrics.worldPopulationBillion),
      detail: "world population",
      icon: Footprints
    },
    {
      label: "Carbon",
      value: formatCarbon(metrics.atmosphericCarbonPpm),
      detail: "atmospheric CO2",
      icon: Cloud
    },
    {
      label: "Wild space",
      value: formatPercent(metrics.remainingWildSpacePercent),
      detail: "remaining wild area",
      icon: Trees
    },
    {
      label: "Wild acres",
      value: formatAcres(metrics.wildSpaceAcres),
      detail: "derived land estimate",
      icon: Sprout
    },
    {
      label: "At risk",
      value: formatCount(metrics.speciesAtRiskCount),
      detail: "species pressure",
      icon: Activity
    },
    {
      label: "Extinctions",
      value: formatCount(metrics.extinctSpeciesCount),
      detail: "recorded losses",
      icon: Sprout
    }
  ];

  return (
    <aside
      className={["metric-rail", className].filter(Boolean).join(" ")}
      aria-label="Planet metrics"
    >
      <div className="panel-title">
        <span>{title}</span>
      </div>
      <div className="metric-list">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div className="metric-item" key={item.label}>
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <div>
                <span className="metric-label">{item.label}</span>
                <strong>{item.value}</strong>
                <span className="metric-detail">{item.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
