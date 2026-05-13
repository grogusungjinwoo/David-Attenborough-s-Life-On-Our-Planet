import type { WorldSnapshot } from "../domain/types";
import { availableMapProviders } from "../map/mapProviders";

type DebugPanelProps = {
  open: boolean;
  snapshot: WorldSnapshot;
  selectedRegionId?: string;
  selectedSpeciesId?: string;
  selectedZooId?: string;
};

export function DebugPanel({
  open,
  snapshot,
  selectedRegionId,
  selectedSpeciesId,
  selectedZooId
}: DebugPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <aside className="debug-panel" aria-label="Debug panel">
      <strong>Debug</strong>
      <dl>
        <div>
          <dt>Year</dt>
          <dd>{snapshot.year}</dd>
        </div>
        <div>
          <dt>Region</dt>
          <dd>{selectedRegionId ?? "none"}</dd>
        </div>
        <div>
          <dt>Species</dt>
          <dd>{selectedSpeciesId ?? "none"}</dd>
        </div>
        <div>
          <dt>Zoo</dt>
          <dd>{selectedZooId ?? "none"}</dd>
        </div>
        <div>
          <dt>Provider</dt>
          <dd>{availableMapProviders[0].label}</dd>
        </div>
      </dl>
      <pre>{JSON.stringify(snapshot.proceduralDensity, null, 2)}</pre>
    </aside>
  );
}
