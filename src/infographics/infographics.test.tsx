import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BiomePressureMap,
  PopulationExpansionMap,
  ReferenceRepoHorizonPanel,
  SpeciesLossMatrix
} from "./index";
import { getWorldSnapshot } from "../domain/storyModel";

describe("infographic components", () => {
  it("renders a controlled biome pressure map from the story-model snapshot", () => {
    const snapshot = getWorldSnapshot(2020);

    render(<BiomePressureMap year={2020} snapshot={snapshot} />);

    const map = screen.getByRole("img", { name: /biome pressure map for 2020/i });

    expect(map.tagName.toLowerCase()).toBe("svg");
    expect(screen.getByText("Central Africa")).toBeInTheDocument();
    expect(screen.getByText(/Wild space 35%/i)).toBeInTheDocument();
  });

  it("renders a controlled population expansion map without map-library dependencies", () => {
    const snapshot = getWorldSnapshot(2020);

    render(<PopulationExpansionMap year={2020} snapshot={snapshot} />);

    const map = screen.getByRole("img", { name: /population expansion map for 2020/i });

    expect(map.tagName.toLowerCase()).toBe("svg");
    expect(screen.getByText("7.8B people")).toBeInTheDocument();
    expect(screen.getByText("San Diego Zoo")).toBeInTheDocument();
  });

  it("renders the species loss matrix against the timeline anchors", () => {
    const snapshot = getWorldSnapshot(2020);

    render(<SpeciesLossMatrix year={2020} snapshot={snapshot} />);

    const matrix = screen.getByRole("table", { name: /species loss matrix/i });
    expect(within(matrix).getByText("Golden toad")).toBeInTheDocument();
    expect(within(matrix).getByText("1937")).toBeInTheDocument();
    expect(within(matrix).getByText("2020")).toBeInTheDocument();
    expect(within(matrix).getAllByText(/extinct/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/900 documented extinctions/i)).toBeInTheDocument();
  });

  it("renders a reference-repo horizon panel from the reference source family", () => {
    const snapshot = getWorldSnapshot(2020);

    render(<ReferenceRepoHorizonPanel year={2020} snapshot={snapshot} />);

    expect(screen.getByText("Reference-repo horizon")).toBeInTheDocument();
    expect(screen.getByText("NeuralGCM")).toBeInTheDocument();
    expect(screen.getByText("PyPSA-Earth")).toBeInTheDocument();
    expect(
      screen.getByText(/Reference repository: NeuralGCM, Aurora, and PyPSA-Earth/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/415 ppm/i)).toBeInTheDocument();
  });

  it("uses the provided snapshot metrics instead of deriving hidden component state", () => {
    const snapshot = getWorldSnapshot(2020);
    const controlledSnapshot = {
      ...snapshot,
      metrics: {
        ...snapshot.metrics,
        worldPopulationBillion: 4.2,
        atmosphericCarbonPpm: 333,
        remainingWildSpacePercent: 51
      }
    };

    render(<PopulationExpansionMap year={1984} snapshot={controlledSnapshot} />);

    expect(screen.getByText("4.2B people")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /population expansion map for 1984/i })
    ).toBeInTheDocument();
  });
});
