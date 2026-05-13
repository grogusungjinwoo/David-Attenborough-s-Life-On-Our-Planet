import {
  Building2,
  CloudSun,
  Layers,
  Leaf,
  MapPin,
  Mountain,
  PawPrint,
  Waves,
  Zap
} from "lucide-react";
import type { LayerState } from "../domain/types";

type LayerControlsProps = {
  layers: LayerState;
  onToggleLayer: (layer: keyof LayerState) => void;
};

const layerItems: Array<{
  key: keyof LayerState;
  label: string;
  icon: typeof Layers;
}> = [
  { key: "atmosphere", label: "Air", icon: CloudSun },
  { key: "vegetation", label: "Trees", icon: Leaf },
  { key: "oceans", label: "Water", icon: Waves },
  { key: "mountains", label: "Peaks", icon: Mountain },
  { key: "settlements", label: "Cities", icon: Building2 },
  { key: "species", label: "Species", icon: PawPrint },
  { key: "zoos", label: "Zoos", icon: MapPin },
  { key: "energy", label: "Energy", icon: Zap }
];

export function LayerControls({ layers, onToggleLayer }: LayerControlsProps) {
  return (
    <aside className="layer-controls" aria-label="Layer controls">
      <div className="panel-title">
        <Layers aria-hidden="true" size={17} />
        <span>Layers</span>
      </div>
      <div className="layer-grid">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const enabled = layers[item.key];

          return (
            <button
              key={item.key}
              type="button"
              data-testid={`layer-toggle-${item.key}`}
              className={enabled ? "layer-button active" : "layer-button"}
              aria-pressed={enabled}
              aria-label={item.label}
              title={item.label}
              onClick={() => onToggleLayer(item.key)}
            >
              <Icon aria-hidden="true" size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
