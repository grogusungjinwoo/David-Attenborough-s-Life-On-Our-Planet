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
    <svg
      className={`world-backdrop ${basemap}`}
      viewBox="0 0 1000 500"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="graticule" width="100" height="50" patternUnits="userSpaceOnUse">
          <path d="M100 0H0V50" />
        </pattern>
      </defs>
      <rect className="ocean-field" width="1000" height="500" />
      <rect className="graticule" width="1000" height="500" fill="url(#graticule)" />
      <path
        className="landmass north-america"
        d="M95 112L166 72L257 82L302 139L278 211L230 241L218 302L156 298L118 236L69 210Z"
      />
      <path
        className="landmass south-america"
        d="M282 277L336 304L353 372L331 458L284 489L254 420L230 358L244 304Z"
      />
      <path
        className="landmass europe-africa"
        d="M458 115L530 98L602 126L583 182L532 193L548 263L520 374L465 368L423 286L444 206L403 168Z"
      />
      <path
        className="landmass asia"
        d="M560 111L680 78L805 104L872 174L848 242L766 257L705 225L630 252L581 204L610 151Z"
      />
      <path className="landmass australia" d="M750 328L832 312L891 350L866 405L779 400L731 362Z" />
      <path className="landmass antarctica" d="M130 457L332 438L548 455L744 438L932 462L904 500H115Z" />
      <path className="relief-line" d="M130 142C210 104 280 120 330 184" />
      <path className="relief-line" d="M490 151C540 129 608 146 650 194" />
      <path className="relief-line" d="M596 140C654 126 718 129 786 166" />
      <path className="relief-line" d="M292 292C318 340 330 388 304 448" />
    </svg>
  );
}

function projectLatLon(lat: number, lon: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`
  };
}
