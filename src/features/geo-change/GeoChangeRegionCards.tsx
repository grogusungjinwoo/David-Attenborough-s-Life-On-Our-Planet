import type { GeoChangeLayerId, GeoChangeSnapshot } from "../../domain/types";

type GeoChangeRegionCardsProps = {
  activeLayerId: GeoChangeLayerId;
  snapshot: GeoChangeSnapshot;
};

export function GeoChangeRegionCards({
  activeLayerId,
  snapshot
}: GeoChangeRegionCardsProps) {
  const activeLayer =
    snapshot.layers.find((layer) => layer.id === activeLayerId) ?? snapshot.layers[0];
  const regions = [...snapshot.regions].sort(
    (first, second) =>
      second.layerIntensities[activeLayer.id] - first.layerIntensities[activeLayer.id]
  );

  return (
    <article className="infographic-card geo-change-region-card">
      <div className="section-kicker">Geographic layer</div>
      <h2>{activeLayer.label}</h2>
      <p>{activeLayer.summary}</p>
      <div className="geo-region-grid" aria-label={`${activeLayer.label} regional change cards`}>
        {regions.map((region) => (
          <section key={region.regionId}>
            <strong>{region.name}</strong>
            <span>{Math.round(region.layerIntensities[activeLayer.id] * 100)}%</span>
            <p>{region.summary}</p>
          </section>
        ))}
      </div>
      <p className="geo-change-region-caveat">{activeLayer.displayCaveat}</p>
    </article>
  );
}
