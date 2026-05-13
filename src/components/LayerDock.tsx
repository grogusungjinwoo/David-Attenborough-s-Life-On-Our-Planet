import { CloudSun, MapPin, PawPrint, Trees, Users } from "lucide-react";
import type { LayerState } from "../domain/storyModel";

export type LayerDockProps = {
  layers: LayerState;
  onLayerChange: (layer: keyof LayerState, enabled: boolean) => void;
  title?: string;
  className?: string;
};

const layerItems: Array<{
  key: keyof LayerState;
  label: string;
  detail: string;
  icon: typeof Trees;
}> = [
  {
    key: "wildSpace",
    label: "Wild space",
    detail: "Habitat cover",
    icon: Trees
  },
  {
    key: "population",
    label: "Population",
    detail: "Human pressure",
    icon: Users
  },
  {
    key: "species",
    label: "Species",
    detail: "Animal records",
    icon: PawPrint
  },
  {
    key: "zoos",
    label: "Zoos",
    detail: "Historic markers",
    icon: MapPin
  },
  {
    key: "climate",
    label: "Climate",
    detail: "Carbon stress",
    icon: CloudSun
  }
];

export function LayerDock({
  layers,
  onLayerChange,
  title = "Layers",
  className
}: LayerDockProps) {
  return (
    <aside
      className={["layer-dock", className].filter(Boolean).join(" ")}
      aria-label="Layer controls"
    >
      <div className="layer-dock__header panel-title">
        <span>{title}</span>
      </div>
      <div className="layer-dock__grid">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const enabled = layers[item.key];

          return (
            <button
              key={item.key}
              type="button"
              className={[
                "layer-dock__button",
                "layer-button",
                enabled ? "active" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={enabled}
              onClick={() => onLayerChange(item.key, !enabled)}
            >
              <Icon aria-hidden="true" size={17} />
              <span className="layer-dock__label">{item.label}</span>
              <small className="layer-dock__detail">{item.detail}</small>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
