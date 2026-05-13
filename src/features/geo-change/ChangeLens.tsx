import type { CSSProperties } from "react";
import type {
  GeoChangeLayerId,
  GeoChangeLayerSnapshot,
  GeoChangeSnapshot
} from "../../domain/types";

type ChangeLensProps = {
  activeLayerId: GeoChangeLayerId;
  snapshot: GeoChangeSnapshot;
  onActiveLayerChange: (layerId: GeoChangeLayerId) => void;
};

export function ChangeLens({
  activeLayerId,
  snapshot,
  onActiveLayerChange
}: ChangeLensProps) {
  const activeLayer = findActiveLayer(snapshot.layers, activeLayerId);
  const topRegions = [...snapshot.regions]
    .sort(
      (first, second) =>
        second.layerIntensities[activeLayer.id] - first.layerIntensities[activeLayer.id]
    )
    .slice(0, 3);

  return (
    <aside
      className="change-lens"
      data-active-layer={activeLayer.id}
      data-testid="change-lens"
      role="complementary"
      aria-label="Change Lens"
    >
      <div className="change-lens-header">
        <span className="panel-heading">Change Lens</span>
        <label>
          <span>Layer</span>
          <select
            aria-label="Geographic change layer"
            value={activeLayer.id}
            onChange={(event) =>
              onActiveLayerChange(event.currentTarget.value as GeoChangeLayerId)
            }
          >
            {snapshot.layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="change-lens-summary">{activeLayer.summary}</p>

      <div className="change-compare" aria-label="Before and current comparison">
        <span>{activeLayer.beforeLabel}</span>
        <strong>{snapshot.year}</strong>
        <span>{activeLayer.currentLabel}</span>
      </div>

      <div className="change-legend" aria-label={`${activeLayer.label} legend`}>
        <div className="change-legend-track">
          <i
            style={
              {
                "--change-color": activeLayer.color,
                "--change-intensity": `${Math.round(activeLayer.intensity * 100)}%`
              } as CSSProperties
            }
          />
        </div>
        <div className="change-legend-labels">
          {activeLayer.legendStops.map((stop) => (
            <span key={stop.label}>{stop.label}</span>
          ))}
        </div>
      </div>

      <div className="change-confidence">
        <span>Confidence</span>
        <strong>{activeLayer.confidence}</strong>
      </div>

      <p className="change-caveat">{activeLayer.displayCaveat}</p>

      <div className="change-region-list" aria-label="Regional change stories">
        {topRegions.map((region) => (
          <article key={region.regionId}>
            <strong>{region.name}</strong>
            <span>{Math.round(region.layerIntensities[activeLayer.id] * 100)}%</span>
            <p>
              {region.beforeLabel} to {region.currentLabel}
            </p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function findActiveLayer(
  layers: GeoChangeLayerSnapshot[],
  activeLayerId: GeoChangeLayerId
) {
  return layers.find((layer) => layer.id === activeLayerId) ?? layers[0];
}
