import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import type { TimelineAnchor } from "../domain/storyModel";

export type TimelineControlProps = {
  anchors: TimelineAnchor[];
  year: number;
  onYearChange: (year: number) => void;
  title?: string;
  className?: string;
};

export function TimelineControl({
  anchors,
  year,
  onYearChange,
  title = "History timeline",
  className
}: TimelineControlProps) {
  const sortedAnchors = useMemo(
    () => [...anchors].sort((left, right) => left.year - right.year),
    [anchors]
  );
  const activeAnchor = findNearestAnchor(sortedAnchors, year);
  const activeIndex = activeAnchor
    ? sortedAnchors.findIndex((anchor) => anchor.id === activeAnchor.id)
    : -1;
  const firstYear = sortedAnchors[0]?.year ?? year;
  const lastYear = sortedAnchors[sortedAnchors.length - 1]?.year ?? year;
  const rangeValue = Math.min(lastYear, Math.max(firstYear, year));

  const stepToAnchor = (direction: -1 | 1) => {
    if (activeIndex === -1) {
      return;
    }

    const nextIndex = Math.min(
      sortedAnchors.length - 1,
      Math.max(0, activeIndex + direction)
    );
    onYearChange(sortedAnchors[nextIndex].year);
  };

  return (
    <footer
      className={["timeline-control", className].filter(Boolean).join(" ")}
      aria-label={title}
    >
      <div className="timeline-control__copy">
        <span className="timeline-control__year">{year}</span>
        <div>
          <span className="timeline-control__location">
            {activeAnchor?.locationLabel ?? "Unknown location"}
          </span>
          <strong>{activeAnchor?.title ?? "No timeline anchor"}</strong>
          <p>{activeAnchor?.summary ?? "Add timeline anchors to control the story."}</p>
        </div>
      </div>

      <div className="timeline-control__controls">
        <button
          className="timeline-control__button icon-button"
          type="button"
          aria-label="Previous timeline anchor"
          disabled={activeIndex <= 0}
          onClick={() => stepToAnchor(-1)}
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <input
          aria-label="Timeline year"
          className="timeline-control__range"
          type="range"
          min={firstYear}
          max={lastYear}
          value={rangeValue}
          onChange={(event) => onYearChange(Number(event.currentTarget.value))}
        />
        <button
          className="timeline-control__button icon-button"
          type="button"
          aria-label="Next timeline anchor"
          disabled={activeIndex === -1 || activeIndex >= sortedAnchors.length - 1}
          onClick={() => stepToAnchor(1)}
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="timeline-control__anchors" aria-label="Timeline anchors">
        {sortedAnchors.map((anchor) => (
          <button
            key={anchor.id}
            type="button"
            className={[
              "timeline-control__anchor",
              anchor.id === activeAnchor?.id ? "active" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onYearChange(anchor.year)}
            aria-label={`${anchor.year}: ${anchor.title}`}
            aria-current={anchor.id === activeAnchor?.id ? "step" : undefined}
          >
            <span>{anchor.year}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}

function findNearestAnchor(anchors: TimelineAnchor[], year: number) {
  return anchors.reduce<TimelineAnchor | undefined>((nearest, anchor) => {
    if (!nearest) {
      return anchor;
    }

    return Math.abs(anchor.year - year) < Math.abs(nearest.year - year)
      ? anchor
      : nearest;
  }, undefined);
}
