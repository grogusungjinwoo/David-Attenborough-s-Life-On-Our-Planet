import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { regions, speciesRecords, zooSites } from "../../data";
import { createWorldSnapshot } from "../../domain/timeline";
import { timelineAnchors } from "../../data/timeline";
import { MapViewport } from "./MapViewport";

const snapshot = createWorldSnapshot(timelineAnchors, 2024, {
  atmosphere: true,
  vegetation: true,
  oceans: true,
  mountains: true,
  settlements: true,
  wildSpace: true,
  population: true,
  species: true,
  zoos: true,
  climate: true,
  energy: true
});

describe("MapViewport", () => {
  it("renders the active basemap and selectable geographic markers", () => {
    const onSelectRegion = vi.fn();
    const onSelectSpecies = vi.fn();
    const onSelectZoo = vi.fn();

    render(
      <MapViewport
        basemap="topographic"
        snapshot={snapshot}
        mapViewport={{ center: [0, 12], zoom: 1.4 }}
        regions={regions}
        species={speciesRecords}
        zoos={zooSites}
        onSelectRegion={onSelectRegion}
        onSelectSpecies={onSelectSpecies}
        onSelectZoo={onSelectZoo}
      />
    );

    expect(screen.getByTestId("map-viewport")).toHaveAttribute(
      "data-basemap",
      "topographic"
    );
    expect(screen.getByText("2D Topographic")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /select amazon basin/i }));
    expect(onSelectRegion).toHaveBeenCalledWith("amazon-basin");
    expect(onSelectSpecies).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /select zsl london zoo/i }));
    expect(onSelectZoo).toHaveBeenCalledWith("london-zoo");
  });
});
