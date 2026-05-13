import { BookOpen, MapPinned, PawPrint, X } from "lucide-react";
import type {
  SourceRecord,
  SpeciesRecord,
  TimelineAnchor,
  ZooSite
} from "../domain/storyModel";
import { SourceStrip } from "./SourceStrip";

export type StoryDrawerProps = {
  open: boolean;
  activeAnchor: TimelineAnchor;
  currentYear: number;
  species: SpeciesRecord[];
  zoos: ZooSite[];
  sources: SourceRecord[];
  selectedSpeciesId?: string;
  selectedZooId?: string;
  onSelectSpecies: (speciesId?: string) => void;
  onSelectZoo: (zooId?: string) => void;
  onClose?: () => void;
  className?: string;
};

export function StoryDrawer({
  open,
  activeAnchor,
  currentYear,
  species,
  zoos,
  sources,
  selectedSpeciesId,
  selectedZooId,
  onSelectSpecies,
  onSelectZoo,
  onClose,
  className
}: StoryDrawerProps) {
  if (!open) {
    return null;
  }

  const visibleSpecies = species.filter(
    (record) => record.visibleFromYear <= currentYear
  );
  const visibleZoos = zoos.filter(
    (zoo) => !zoo.openedYear || zoo.openedYear <= currentYear
  );
  const selectedSpecies = visibleSpecies.find(
    (record) => record.id === selectedSpeciesId
  );
  const selectedZoo = visibleZoos.find((zoo) => zoo.id === selectedZooId);

  return (
    <aside
      className={["story-drawer", className].filter(Boolean).join(" ")}
      aria-label="Story drawer"
    >
      <section className="story-drawer__lead drawer-section">
        <div className="story-drawer__header">
          <div className="panel-title">
            <BookOpen aria-hidden="true" size={17} />
            <span>Story source</span>
          </div>
          {onClose ? (
            <button
              className="story-drawer__close icon-button"
              type="button"
              aria-label="Close story drawer"
              onClick={onClose}
            >
              <X aria-hidden="true" size={17} />
            </button>
          ) : null}
        </div>
        <span className="story-drawer__kicker">
          {activeAnchor.year} / {activeAnchor.locationLabel}
        </span>
        <h2>{activeAnchor.title}</h2>
        <p>{activeAnchor.summary}</p>
        <SourceStrip
          compact
          sourceRefs={activeAnchor.sourceRefs}
          sources={sources}
          title="Anchor sources"
        />
      </section>

      <section className="story-drawer__section drawer-section">
        <div className="panel-title">
          <PawPrint aria-hidden="true" size={17} />
          <span>Species records</span>
        </div>
        <div className="story-drawer__record-list record-list">
          {visibleSpecies.map((record) => (
            <button
              key={record.id}
              type="button"
              className={[
                "story-drawer__record",
                "record-card",
                record.id === selectedSpeciesId ? "active" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Select ${record.name}`}
              aria-pressed={record.id === selectedSpeciesId}
              onClick={() => onSelectSpecies(record.id)}
            >
              <span
                className={`status-dot status-dot--${record.status} ${record.status}`}
                aria-hidden="true"
              />
              <span>
                <strong>{record.name}</strong>
                <small>{formatStatus(record.status)}</small>
              </span>
            </button>
          ))}
        </div>
        {selectedSpecies ? (
          <article className="story-drawer__detail detail-block">
            <h3>{selectedSpecies.name}</h3>
            <p>{selectedSpecies.summary}</p>
            <SourceStrip
              compact
              sourceRefs={selectedSpecies.sourceRefs}
              sources={sources}
              title={`${selectedSpecies.name} sources`}
            />
          </article>
        ) : null}
      </section>

      <section className="story-drawer__section drawer-section">
        <div className="panel-title">
          <MapPinned aria-hidden="true" size={17} />
          <span>Zoo markers</span>
        </div>
        <div className="story-drawer__record-list record-list">
          {visibleZoos.map((zoo) => (
            <button
              key={zoo.id}
              type="button"
              className={[
                "story-drawer__record",
                "record-card",
                zoo.id === selectedZooId ? "active" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Select ${zoo.name}`}
              aria-pressed={zoo.id === selectedZooId}
              onClick={() => onSelectZoo(zoo.id)}
            >
              <span className="status-dot status-dot--zoo zoo" aria-hidden="true" />
              <span>
                <strong>{zoo.name}</strong>
                <small>{zoo.openedYear ? `Opened ${zoo.openedYear}` : "Historic site"}</small>
              </span>
            </button>
          ))}
        </div>
        {selectedZoo ? (
          <article className="story-drawer__detail detail-block">
            <h3>{selectedZoo.name}</h3>
            <p>{selectedZoo.notes}</p>
            <SourceStrip
              compact
              sourceRefs={selectedZoo.sourceRefs}
              sources={sources}
              title={`${selectedZoo.name} sources`}
            />
          </article>
        ) : null}
      </section>
    </aside>
  );
}

function formatStatus(status: SpeciesRecord["status"]) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
