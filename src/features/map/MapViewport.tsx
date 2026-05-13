import { MapPin, Mountain, Satellite, Waves } from "lucide-react";
import type { CSSProperties } from "react";
import type { EarthBasemap, MapViewport as MapViewportState } from "../../state/usePlanetStore";
import type {
  GeoChangeLayerId,
  GeoChangeSnapshot,
  RegionRecord,
  SpeciesRecord,
  WorldSnapshot,
  ZooSite
} from "../../domain/types";
import { earthBasemapDescriptors, earthDomainWorkstreams } from "../../map/mapProviders";
import { projectEquirectangularWgs84 } from "../../map/projections";

type MapViewportProps = {
  basemap: EarthBasemap;
  snapshot: WorldSnapshot;
  mapViewport: MapViewportState;
  activeGeoChangeLayer?: GeoChangeLayerId;
  geoChangeSnapshot?: GeoChangeSnapshot;
  regions: RegionRecord[];
  species: SpeciesRecord[];
  zoos: ZooSite[];
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onSelectRegion: (regionId?: string) => void;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
};

const countryLabels = [
  { label: "Canada", lat: 56, lon: -106 },
  { label: "Brazil", lat: -10, lon: -52 },
  { label: "United Kingdom", lat: 55, lon: -3 },
  { label: "Kenya", lat: 0.2, lon: 37.8 },
  { label: "India", lat: 22.8, lon: 79 },
  { label: "China", lat: 35, lon: 103 },
  { label: "Australia", lat: -25, lon: 134 },
  { label: "Antarctica", lat: -75, lon: 10 }
];

const earthDayUrl = new URL("../../assets/earth/earth-day-noclouds.jpg", import.meta.url).href;
const earthCloudsUrl = new URL("../../assets/earth/earth-day-clouds.jpg", import.meta.url).href;
const earthNightUrl = new URL("../../assets/earth/earth-night-lights.jpg", import.meta.url).href;

export function MapViewport({
  basemap,
  snapshot,
  mapViewport,
  activeGeoChangeLayer,
  geoChangeSnapshot,
  regions,
  species,
  zoos,
  selectedRegionId,
  selectedSpeciesId,
  selectedZooId,
  onSelectRegion,
  onSelectSpecies,
  onSelectZoo
}: MapViewportProps) {
  const basemapDescriptor =
    earthBasemapDescriptors.find((descriptor) => descriptor.id === basemap) ??
    earthBasemapDescriptors[0];
  const visibleZoos = zoos.filter((zoo) => !zoo.openedYear || zoo.openedYear <= snapshot.year);
  const scale = Math.max(0.86, Math.min(1.45, mapViewport.zoom / 1.4));
  const activeChangeLayer =
    geoChangeSnapshot?.layers.find((layer) => layer.id === activeGeoChangeLayer) ??
    geoChangeSnapshot?.layers[0];

  return (
    <section
      className="map-viewport"
      data-testid="map-viewport"
      data-basemap={basemap}
      data-active-change-layer={activeChangeLayer?.id}
      aria-label={`${basemapDescriptor.label} map view`}
    >
      <div className="map-status-card">
        <span>{basemap === "satellite" ? <Satellite size={14} /> : <Mountain size={14} />}</span>
        <strong>{basemapDescriptor.label}</strong>
        <small>{basemapDescriptor.attribution}</small>
      </div>

      <div
        className="map-plane"
        data-surface-confidence={snapshot.earthSurface.confidence}
        style={
          {
            "--map-scale": scale,
            "--map-vegetation": snapshot.earthSurface.vegetationIndex,
            "--map-human-exposure": snapshot.earthSurface.humanExposureIndex,
            "--map-ocean-heat": snapshot.earthSurface.oceanHeatIndex,
            "--map-weather-energy": snapshot.earthSurface.weatherEnergyIndex,
            "--map-night-lights": snapshot.earthSurface.nightLightIndex
          } as CSSProperties
        }
      >
        <WorldBackdrop basemap={basemap} snapshot={snapshot} />
        {activeChangeLayer && geoChangeSnapshot ? (
          <GeoChangeMapOverlay
            activeLayerId={activeChangeLayer.id}
            geoChangeSnapshot={geoChangeSnapshot}
          />
        ) : null}
        {countryLabels.map((label) => {
          const position = projectEquirectangularWgs84(label);

          return (
            <span className="country-label" style={position} key={label.label}>
              {label.label}
            </span>
          );
        })}

        {snapshot.layers.species
          ? regions.map((region) => {
              const position = projectEquirectangularWgs84(region);
              const regionSpecies = species.filter((record) =>
                record.regionIds.includes(region.id)
              );
              const isSelected =
                selectedRegionId === region.id ||
                regionSpecies.some((record) => record.id === selectedSpeciesId);

              return (
                <button
                  className={isSelected ? "map-marker region selected" : "map-marker region"}
                  style={position}
                  type="button"
                  aria-label={`Select ${region.name}`}
                  key={region.id}
                  onClick={() => {
                    onSelectRegion(region.id);
                    onSelectSpecies(regionSpecies[0]?.id);
                  }}
                >
                  <span />
                  {activeChangeLayer ? null : <strong>{region.name}</strong>}
                </button>
              );
            })
          : null}

        {snapshot.layers.zoos
          ? visibleZoos.map((zoo) => {
              const position = projectEquirectangularWgs84(zoo);

              return (
                <button
                  className={selectedZooId === zoo.id ? "map-marker zoo selected" : "map-marker zoo"}
                  style={position}
                  type="button"
                  aria-label={`Select ${zoo.name}`}
                  key={zoo.id}
                  onClick={() => onSelectZoo(zoo.id)}
                >
                  <MapPin aria-hidden="true" size={13} />
                  <strong>{zoo.name}</strong>
                </button>
              );
            })
          : null}
      </div>

      <aside className="map-agent-strip" aria-label="Earth refinement workstreams">
        <header>
          <Waves aria-hidden="true" size={14} />
          Domain agents
        </header>
        <div>
          {earthDomainWorkstreams.map((workstream) => (
            <span key={workstream.id}>{workstream.label}</span>
          ))}
        </div>
      </aside>
    </section>
  );
}

function GeoChangeMapOverlay({
  activeLayerId,
  geoChangeSnapshot
}: {
  activeLayerId: GeoChangeLayerId;
  geoChangeSnapshot: GeoChangeSnapshot;
}) {
  const activeLayer = geoChangeSnapshot.layers.find((layer) => layer.id === activeLayerId);

  if (!activeLayer) {
    return null;
  }

  const hotRegions = [...geoChangeSnapshot.regions]
    .sort(
      (first, second) =>
        second.layerIntensities[activeLayerId] - first.layerIntensities[activeLayerId]
    )
    .slice(0, 6);

  return (
    <div
      className="geo-change-map-overlay"
      aria-label={`${activeLayer.label} geographic change overlay`}
      style={
        {
          "--geo-change-color": activeLayer.color,
          "--geo-change-intensity": activeLayer.intensity
        } as CSSProperties
      }
    >
      <span className="geo-change-raster" aria-hidden="true" />
      {hotRegions.map((region) => {
        const position = projectEquirectangularWgs84(region);
        const intensity = region.layerIntensities[activeLayerId];

        return (
          <span
            className="geo-change-hotspot"
            style={
              {
                ...position,
                "--hotspot-intensity": intensity,
                "--hotspot-radius": `${Math.max(22, Math.min(74, region.radiusKm / 34))}px`
              } as CSSProperties
            }
            key={region.regionId}
          >
            <strong>{region.name}</strong>
          </span>
        );
      })}
    </div>
  );
}

function WorldBackdrop({ basemap, snapshot }: { basemap: EarthBasemap; snapshot: WorldSnapshot }) {
  return (
    <div className={`world-backdrop ${basemap}`} aria-hidden="true">
      <img className="world-raster day" src={earthDayUrl} alt="" />
      {basemap === "satellite" ? <img className="world-raster clouds" src={earthCloudsUrl} alt="" /> : null}
      {basemap === "political" ? <img className="world-raster night" src={earthNightUrl} alt="" /> : null}
      {snapshot.layers.vegetation || snapshot.layers.wildSpace ? (
        <span className="historical-surface-tint vegetation" />
      ) : null}
      {snapshot.layers.population || snapshot.layers.settlements ? (
        <span className="historical-surface-tint human" />
      ) : null}
      {snapshot.layers.oceans ? <span className="historical-surface-tint ocean" /> : null}
      {snapshot.layers.atmosphere ? <span className="historical-surface-tint weather" /> : null}
      {snapshot.layers.population || snapshot.layers.settlements ? (
        <span className="historical-surface-tint light" />
      ) : null}
      <span className="raster-graticule" />
      <svg className="world-detail-lines" viewBox="0 0 1000 500" preserveAspectRatio="none">
        <path className="relief-line" d="M76 151C185 78 286 107 345 183" />
        <path className="relief-line" d="M270 286C316 342 323 406 288 470" />
        <path className="relief-line" d="M449 125C514 103 594 134 646 202" />
        <path className="relief-line" d="M583 142C656 116 753 124 842 188" />
        <path className="relief-line" d="M732 340C786 318 855 330 905 374" />
        <path className="boundary-line" d="M496 122L508 178L485 232L514 302L493 378" />
        <path className="boundary-line" d="M584 116L626 168L675 196L727 229L783 221" />
        <path className="boundary-line" d="M117 121L173 166L229 207L259 268" />
        <path className="boundary-line" d="M254 300L304 348L310 421" />
      </svg>
    </div>
  );
}
