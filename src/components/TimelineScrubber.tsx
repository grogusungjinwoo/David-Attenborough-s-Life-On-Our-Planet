import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { TimelineAnchor } from "../domain/types";
import { getActiveTimelineAnchor, sortTimelineAnchors } from "../domain/timeline";

type TimelineScrubberProps = {
  anchors: TimelineAnchor[];
  year: number;
  onYearChange: (year: number) => void;
};

export function TimelineScrubber({
  anchors,
  year,
  onYearChange
}: TimelineScrubberProps) {
  const sortedAnchors = useMemo(() => sortTimelineAnchors(anchors), [anchors]);
  const activeAnchor = getActiveTimelineAnchor(sortedAnchors, year);
  const firstYear = sortedAnchors[0].year;
  const lastYear = sortedAnchors[sortedAnchors.length - 1].year;
  const activeIndex = sortedAnchors.findIndex(
    (anchor) => anchor.id === activeAnchor.id
  );

  const stepTo = (direction: -1 | 1) => {
    const nextAnchor = sortedAnchors[Math.min(sortedAnchors.length - 1, Math.max(0, activeIndex + direction))];
    onYearChange(nextAnchor.year);
  };

  return (
    <footer className="timeline-panel" aria-label="History timeline" data-testid="timeline">
      <div className="timeline-copy">
        <span className="year-readout" data-testid="timeline-current-year">
          {year}
        </span>
        <div>
          <strong>{activeAnchor.title}</strong>
          <p>{activeAnchor.summary}</p>
        </div>
      </div>
      <div className="timeline-controls">
        <button
          className="icon-button"
          type="button"
          aria-label="Previous timeline anchor"
          onClick={() => stepTo(-1)}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <input
          aria-label="Timeline year"
          className="timeline-range"
          type="range"
          min={firstYear}
          max={lastYear}
          value={year}
          onChange={(event) => onYearChange(Number(event.currentTarget.value))}
        />
        <button
          className="icon-button"
          type="button"
          aria-label="Next timeline anchor"
          onClick={() => stepTo(1)}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>
      <div className="history-key" aria-label="Timeline anchors">
        {sortedAnchors.map((anchor) => (
          <button
            key={anchor.id}
            type="button"
            data-testid={`timeline-year-${anchor.year}`}
            className={anchor.id === activeAnchor.id ? "key-dot active" : "key-dot"}
            onClick={() => onYearChange(anchor.year)}
            aria-label={`${anchor.year}: ${anchor.title}`}
          >
            <span>{anchor.year}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}
