import type { MediaAsset, SpeciesProfile } from "../../domain/types";
import { mediaPath } from "../../data/media";

type AnimalStoryScrollerProps = {
  species: SpeciesProfile[];
  mediaAssets: MediaAsset[];
  activeSpeciesIds: string[];
  selectedSpeciesId?: string;
  onSelectSpecies: (speciesId?: string) => void;
};

export function AnimalStoryScroller({
  species,
  mediaAssets,
  activeSpeciesIds,
  selectedSpeciesId,
  onSelectSpecies
}: AnimalStoryScrollerProps) {
  const activeIds = new Set(activeSpeciesIds);
  const visibleSpecies = species
    .filter((record) => activeIds.size === 0 || activeIds.has(record.id))
    .slice(0, 6);

  return (
    <section className="animal-story-scroller" aria-label="Animal witnesses">
      <header>
        <span>Species story</span>
        <h2>Animal witnesses</h2>
      </header>
      <div className="animal-story-list">
        {visibleSpecies.map((record) => {
          const media = mediaAssets.find((asset) => asset.id === record.imageAssetId);
          const selected = selectedSpeciesId === record.id;

          return (
            <button
              key={record.id}
              type="button"
              className={selected ? "animal-story-card selected" : "animal-story-card"}
              aria-label={`Select ${record.name}`}
              onClick={() => onSelectSpecies(record.id)}
            >
              {media?.localPath ? (
                <img src={mediaPath(media.localPath)} alt={`${record.name}: ${media.alt}`} />
              ) : (
                <span className="animal-story-placeholder" aria-hidden="true" />
              )}
              <span className="animal-story-copy">
                <strong>{record.name}</strong>
                <em>{record.scientificName}</em>
                <small>{record.status}</small>
                <span>{record.habitat}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
