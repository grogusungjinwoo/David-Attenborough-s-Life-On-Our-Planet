import { MapPin, Mountain, Satellite, Waves } from "lucide-react";
import type { CSSProperties } from "react";
import type { EarthBasemap, MapViewport as MapViewportState } from "../../state/usePlanetStore";
import type { RegionRecord, SpeciesRecord, WorldSnapshot, ZooSite } from "../../domain/types";
import { earthBasemapDescriptors, earthDomainWorkstreams } from "../../map/mapProviders";

type MapViewportProps = {
  basemap: EarthBasemap;
  snapshot: WorldSnapshot;
  mapViewport: MapViewportState;
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

  return (
    <section
      className="map-viewport"
      data-testid="map-viewport"
      data-basemap={basemap}
      aria-label={`${basemapDescriptor.label} map view`}
    >
      <div className="map-status-card">
        <span>{basemap === "satellite" ? <Satellite size={14} /> : <Mountain size={14} />}</span>
        <strong>{basemapDescriptor.label}</strong>
        <small>{basemapDescriptor.attribution}</small>
      </div>

      <div className="map-plane" style={{ "--map-scale": scale } as CSSProperties}>
        <WorldBackdrop basemap={basemap} />
        {countryLabels.map((label) => {
          const position = projectLatLon(label.lat, label.lon);

          return (
            <span className="country-label" style={position} key={label.label}>
              {label.label}
            </span>
          );
        })}

        {snapshot.layers.species
          ? regions.map((region) => {
              const position = projectLatLon(region.lat, region.lon);
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
                  <strong>{region.name}</strong>
                </button>
              );
            })
          : null}

        {snapshot.layers.zoos
          ? visibleZoos.map((zoo) => {
              const position = projectLatLon(zoo.lat, zoo.lon);

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

function WorldBackdrop({ basemap }: { basemap: EarthBasemap }) {
  return (
    <div className={`world-backdrop ${basemap}`} aria-hidden="true">
      <img className="world-raster day" src={earthDayUrl} alt="" />
      {basemap === "satellite" ? <img className="world-raster clouds" src={earthCloudsUrl} alt="" /> : null}
      {basemap === "political" ? <img className="world-raster night" src={earthNightUrl} alt="" /> : null}
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

function projectLatLon(lat: number, lon: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`
  };
}
