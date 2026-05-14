import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mediaAssets, scrollChapters, speciesProfiles } from "../../data";
import {
  getChapterForProgress,
  getNearestScrollChapter,
  TimeScrollController
} from "./TimeScrollController";
import { AnimalStoryScroller } from "./AnimalStoryScroller";

describe("TimeScrollController", () => {
  it("maps scroll progress to the expected chapter", () => {
    expect(getChapterForProgress(scrollChapters, 0)?.year).toBe(1770);
    expect(getChapterForProgress(scrollChapters, 0.12)?.year).toBe(1900);
    expect(getChapterForProgress(scrollChapters, 0.5)?.year).toBe(1972);
    expect(getChapterForProgress(scrollChapters, 0.62)?.year).toBe(1978);
    expect(getChapterForProgress(scrollChapters, 0.99)?.year).toBe(2024);
  });

  it("maps manual year changes to the nearest scroll chapter", () => {
    expect(getNearestScrollChapter(scrollChapters, 1769)?.year).toBe(1770);
    expect(getNearestScrollChapter(scrollChapters, 1960)?.year).toBe(1954);
    expect(getNearestScrollChapter(scrollChapters, 1969)?.year).toBe(1968);
    expect(getNearestScrollChapter(scrollChapters, 1973)?.year).toBe(1972);
    expect(getNearestScrollChapter(scrollChapters, 2025)?.year).toBe(2024);
  });

  it("renders chapter anchors with the active year and exposes a selectable chapter", () => {
    const onChapterSelect = vi.fn();

    render(
      <TimeScrollController
        chapters={scrollChapters}
        activeChapterId="trade-1900"
        onChapterSelect={onChapterSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /1937: A child meets/i }));

    expect(screen.getByTestId("timeline-current-year")).toHaveTextContent("1900");
    expect(onChapterSelect).toHaveBeenCalledWith(scrollChapters[2]);
  });
});

describe("AnimalStoryScroller", () => {
  it("renders species photos and syncs selected animals", () => {
    const onSelectSpecies = vi.fn();

    render(
      <AnimalStoryScroller
        species={speciesProfiles}
        mediaAssets={mediaAssets}
        activeSpeciesIds={["african-elephant", "bornean-orangutan"]}
        selectedSpeciesId="african-elephant"
        onSelectSpecies={onSelectSpecies}
      />
    );

    expect(screen.getByRole("heading", { name: "Animal witnesses" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /African bush elephant/i })).toBeInTheDocument();
    expect(screen.getByAltText(/African bush elephant/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Bornean orangutan/i }));

    expect(onSelectSpecies).toHaveBeenCalledWith("bornean-orangutan");
  });
});
