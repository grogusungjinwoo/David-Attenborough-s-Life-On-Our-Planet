import { Bug, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleDebug: () => void;
};

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleDebug
}: ZoomControlsProps) {
  return (
    <div className="zoom-controls" aria-label="Globe view controls">
      <button className="icon-button" type="button" aria-label="Zoom in" onClick={onZoomIn}>
        <ZoomIn aria-hidden="true" size={18} />
      </button>
      <button className="icon-button" type="button" aria-label="Zoom out" onClick={onZoomOut}>
        <ZoomOut aria-hidden="true" size={18} />
      </button>
      <button className="icon-button" type="button" aria-label="Reset view" onClick={onReset}>
        <RotateCcw aria-hidden="true" size={18} />
      </button>
      <button
        className="icon-button"
        type="button"
        aria-label="Toggle debug panel"
        onClick={onToggleDebug}
      >
        <Bug aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
