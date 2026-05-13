import { BookOpen, ExternalLink, MapPinned, PawPrint } from "lucide-react";
import type {
  ReferenceOverlay,
  RegionRecord,
  SourceRef,
  SpeciesRecord,
  TimelineAnchor,
  ZooSite
} from "../domain/types";

type InsightDrawerProps = {
  activeAnchor: TimelineAnchor;
  regions: RegionRecord[];
  species: SpeciesRecord[];
  zoos: ZooSite[];
  overlays: ReferenceOverlay[];
  currentYear: number;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
};

export function InsightDrawer({
  activeAnchor,
  regions,
  species,
  zoos,
  overlays,
  currentYear,
  selectedRegionId,
  selectedSpeciesId,
  selectedZooId,
  onSelectSpecies,
  onSelectZoo
}: InsightDrawerProps) {
  const selectedRegion = regions.find((region) => region.id === selectedRegionId);
  const selectedSpecies = species.find((record) => record.id === selectedSpeciesId);
  const selectedZoo = zoos.find((zoo) => zoo.id === selectedZooId);
  const visibleZoos = zoos.filter(
    (zoo) => !zoo.openedYear || zoo.openedYear <= currentYear
  );

  return (
    <aside
      className="insight-drawer"
      aria-label="Species and provenance drawer"
      data-testid="species-drawer"
    >
      <div className="drawer-section drawer-lead">
        <div className="panel-title">
          <BookOpen aria-hidden="true" size={17} />
          <span>Story source</span>
        </div>
        <h1>Life On Our Planet</h1>
        <p>{activeAnchor.summary}</p>
        <SourceList sources={activeAnchor.sourceRefs} />
      </div>

      {selectedRegion ? (
        <div className="drawer-section selected-region">
          <span className="section-kicker">Selected region</span>
          <h2>{selectedRegion.name}</h2>
          <p>{selectedRegion.summary}</p>
        </div>
      ) : null}

      <div className="drawer-section">
        <div className="panel-title">
          <PawPrint aria-hidden="true" size={17} />
          <span>Species records</span>
        </div>
        <button
          className="drawer-trigger"
          type="button"
          data-testid="species-drawer-trigger"
          aria-expanded="true"
        >
          Species drawer
        </button>
        <div className="record-list">
          {species.map((record) => {
            const active = selectedSpecies?.id === record.id;
            const latestStatus =
              [...record.statusByYear]
                .reverse()
                .find((entry) => entry.year <= currentYear)?.status ?? record.status;

            return (
              <button
                key={record.id}
                type="button"
                className={active ? "record-card active" : "record-card"}
                onClick={() => onSelectSpecies(record.id)}
              >
                <span className={`status-dot ${latestStatus}`} />
                <span>
                  <strong>{record.name}</strong>
                  <small>{latestStatus}</small>
                </span>
              </button>
            );
          })}
        </div>
        {selectedSpecies ? (
          <div className="detail-block">
            <h2>{selectedSpecies.name}</h2>
            <p>{selectedSpecies.summary}</p>
            <SourceList sources={selectedSpecies.sourceRefs} compact />
          </div>
        ) : null}
      </div>

      <div className="drawer-section">
        <div className="panel-title">
          <MapPinned aria-hidden="true" size={17} />
          <span>Zoo markers</span>
        </div>
        <div className="record-list">
          {visibleZoos.map((zoo) => (
            <button
              key={zoo.id}
              type="button"
              className={selectedZoo?.id === zoo.id ? "record-card active" : "record-card"}
              onClick={() => onSelectZoo(zoo.id)}
            >
              <span className="status-dot zoo" />
              <span>
                <strong>{zoo.name}</strong>
                <small>{zoo.openedYear ? `opened ${zoo.openedYear}` : "historic site"}</small>
              </span>
            </button>
          ))}
        </div>
        {selectedZoo ? (
          <div className="detail-block">
            <h2>{selectedZoo.name}</h2>
            <p>{selectedZoo.notes}</p>
            <SourceList sources={selectedZoo.sourceRefs} compact />
          </div>
        ) : null}
      </div>

      <div className="drawer-section overlay-list">
        <span className="section-kicker">Future overlay adapters</span>
        {overlays.map((overlay) => (
          <div className="overlay-row" key={overlay.id}>
            <strong>{overlay.label}</strong>
            <p>{overlay.futureUse}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function SourceList({
  sources,
  compact = false
}: {
  sources: SourceRef[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "source-list compact" : "source-list"}>
      {sources.map((source) =>
        source.url ? (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            title={source.publisher}
          >
            <span>{source.label}</span>
            <ExternalLink aria-hidden="true" size={13} />
          </a>
        ) : (
          <span key={source.id} title={source.publisher}>
            {source.label}
          </span>
        )
      )}
    </div>
  );
}
