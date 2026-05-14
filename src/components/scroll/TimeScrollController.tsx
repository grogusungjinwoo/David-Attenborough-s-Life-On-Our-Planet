import type { ScrollChapterRecord } from "../../domain/types";

type TimeScrollControllerProps = {
  chapters: ScrollChapterRecord[];
  activeChapterId?: string;
  onChapterSelect: (chapter: ScrollChapterRecord) => void;
};

export function getChapterForProgress(
  chapters: ScrollChapterRecord[],
  progress: number
) {
  if (chapters.length === 0) {
    return undefined;
  }

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const index = Math.min(
    chapters.length - 1,
    Math.round(clampedProgress * (chapters.length - 1))
  );

  return chapters[index];
}

export function getNearestScrollChapter(
  chapters: ScrollChapterRecord[],
  year: number
) {
  return chapters.reduce<ScrollChapterRecord | undefined>((nearest, chapter) => {
    if (!nearest) {
      return chapter;
    }

    const chapterDistance = Math.abs(chapter.year - year);
    const nearestDistance = Math.abs(nearest.year - year);

    return chapterDistance < nearestDistance ? chapter : nearest;
  }, undefined);
}

export function TimeScrollController({
  chapters,
  activeChapterId,
  onChapterSelect
}: TimeScrollControllerProps) {
  const activeChapter =
    chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters.at(-1);

  return (
    <nav className="scroll-time-controller" aria-label="Timeline year" data-testid="timeline">
      <div className="scroll-time-current">
        <span>Year</span>
        <strong data-testid="timeline-current-year">{activeChapter?.year}</strong>
      </div>
      <div className="scroll-time-rail">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            data-testid={`timeline-year-${chapter.year}`}
            className={chapter.id === activeChapter?.id ? "active" : ""}
            aria-label={`${chapter.year}: ${chapter.title}`}
            onClick={() => onChapterSelect(chapter)}
          >
            <span>{chapter.year}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
