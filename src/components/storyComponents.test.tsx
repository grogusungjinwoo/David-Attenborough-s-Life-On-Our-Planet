import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  LayerDock,
  MetricRail,
  SourceStrip,
  StoryDrawer,
  TimelineControl
} from "./index";
import type {
  LayerState,
  SourceRecord,
  SpeciesRecord,
  TimelineAnchor,
  ZooSite
} from "../domain/storyModel";

const sources: SourceRecord[] = [
  {
    id: "attenborough-excerpt",
    family: "manuscript",
    label: "A Life on Our Planet excerpt",
    note: "Local manuscript excerpt."
  },
  {
    id: "noaa-global-monitoring-lab",
    family: "public-data",
    label: "NOAA carbon trends",
    href: "https://gml.noaa.gov/ccgg/trends/",
    note: "Atmospheric carbon reference."
  }
];

const anchors: TimelineAnchor[] = [
  {
    id: "future-2020",
    year: 2020,
    title: "The witness statement",
    locationLabel: "A shared planet",
    summary: "A warning becomes a choice.",
    metrics: {
      worldPopulationBillion: 7.8,
      atmosphericCarbonPpm: 415,
      remainingWildSpacePercent: 35,
      wildSpaceAcres: 12_880_000_000,
      speciesAtRiskCount: 37_400,
      extinctSpeciesCount: 900
    },
    sourceRefs: [{ sourceId: "noaa-global-monitoring-lab", detail: "CO2 reference." }]
  },
  {
    id: "witness-1937",
    year: 1937,
    title: "The witness begins",
    locationLabel: "Leicester, England",
    summary: "A baseline that still feels limitless.",
    metrics: {
      worldPopulationBillion: 2.3,
      atmosphericCarbonPpm: 280,
      remainingWildSpacePercent: 66,
      wildSpaceAcres: 24_288_000_000,
      speciesAtRiskCount: 1_000,
      extinctSpeciesCount: 3
    },
    sourceRefs: [
      {
        sourceId: "attenborough-excerpt",
        pdfPage: 20,
        printedPage: 13,
        detail: "Witness baseline."
      }
    ]
  }
];

const layers: LayerState = {
  wildSpace: true,
  population: true,
  species: true,
  zoos: false,
  climate: true
};

const species: SpeciesRecord[] = [
  {
    id: "bengal-tiger",
    name: "Bengal tiger",
    status: "endangered",
    regionIds: ["south-asia"],
    visibleFromYear: 1960,
    summary: "A predator tied to shrinking corridors.",
    sourceRefs: [{ sourceId: "attenborough-excerpt" }]
  },
  {
    id: "golden-toad",
    name: "Golden toad",
    status: "extinct",
    regionIds: ["central-america"],
    visibleFromYear: 1997,
    summary: "A compact extinction marker.",
    sourceRefs: [{ sourceId: "noaa-global-monitoring-lab" }]
  }
];

const zoos: ZooSite[] = [
  {
    id: "london-zoo",
    name: "London Zoo",
    lat: 51.5353,
    lon: -0.1534,
    openedYear: 1828,
    notes: "A historic natural-history education site.",
    sourceRefs: [{ sourceId: "attenborough-excerpt" }]
  }
];

describe("Life On Our Planet component exports", () => {
  it("exports the presentational story components from the barrel", () => {
    expect(MetricRail).toBeTypeOf("function");
    expect(TimelineControl).toBeTypeOf("function");
    expect(StoryDrawer).toBeTypeOf("function");
    expect(LayerDock).toBeTypeOf("function");
    expect(SourceStrip).toBeTypeOf("function");
  });
});

describe("MetricRail", () => {
  it("renders a semantic metric rail from story model metrics", () => {
    render(<MetricRail metrics={anchors[0].metrics} />);

    expect(screen.getByLabelText("Planet metrics")).toHaveClass("metric-rail");
    expect(screen.getByText("7.8B")).toBeInTheDocument();
    expect(screen.getByText("415 ppm")).toBeInTheDocument();
    expect(screen.getByText("35%")).toBeInTheDocument();
    expect(screen.getByText("900")).toBeInTheDocument();
  });
});

describe("TimelineControl", () => {
  it("keeps the year controlled while exposing range and anchor navigation", () => {
    const onYearChange = vi.fn();

    render(<TimelineControl anchors={anchors} year={1954} onYearChange={onYearChange} />);

    expect(screen.getByRole("slider", { name: "Timeline year" })).toHaveAttribute("min", "1937");
    expect(screen.getByRole("slider", { name: "Timeline year" })).toHaveAttribute("max", "2020");

    fireEvent.click(screen.getByRole("button", { name: /next timeline anchor/i }));
    expect(onYearChange).toHaveBeenCalledWith(2020);

    fireEvent.change(screen.getByRole("slider", { name: "Timeline year" }), {
      target: { value: "1960" }
    });
    expect(onYearChange).toHaveBeenCalledWith(1960);
  });
});

describe("LayerDock", () => {
  it("reports the next layer value without mutating the controlled layer state", () => {
    const onLayerChange = vi.fn();

    render(<LayerDock layers={layers} onLayerChange={onLayerChange} />);

    const zoosButton = screen.getByRole("button", { name: /zoos/i });
    expect(zoosButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(zoosButton);
    expect(onLayerChange).toHaveBeenCalledWith("zoos", true);
  });
});

describe("StoryDrawer", () => {
  it("renders the active story, visible records, selected detail, and source provenance", () => {
    const onSelectSpecies = vi.fn();
    const onSelectZoo = vi.fn();

    render(
      <StoryDrawer
        open
        activeAnchor={anchors[0]}
        currentYear={2020}
        species={species}
        zoos={zoos}
        sources={sources}
        selectedSpeciesId="golden-toad"
        selectedZooId="london-zoo"
        onSelectSpecies={onSelectSpecies}
        onSelectZoo={onSelectZoo}
      />
    );

    expect(screen.getByLabelText("Story drawer")).toHaveClass("story-drawer");
    expect(screen.getByText("A warning becomes a choice.")).toBeInTheDocument();
    expect(screen.getAllByText("Golden toad").length).toBeGreaterThan(0);
    expect(screen.getByText("A compact extinction marker.")).toBeInTheDocument();
    expect(screen.getAllByText("London Zoo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NOAA carbon trends").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /select bengal tiger/i }));
    expect(onSelectSpecies).toHaveBeenCalledWith("bengal-tiger");

    fireEvent.click(screen.getByRole("button", { name: /select london zoo/i }));
    expect(onSelectZoo).toHaveBeenCalledWith("london-zoo");
  });
});

describe("SourceStrip", () => {
  it("resolves source refs against source records and preserves page details", () => {
    render(<SourceStrip sourceRefs={anchors[1].sourceRefs} sources={sources} />);

    expect(screen.getByLabelText("Sources")).toHaveClass("source-strip");
    expect(screen.getByText("A Life on Our Planet excerpt")).toBeInTheDocument();
    expect(screen.getByText(/PDF p. 20/)).toBeInTheDocument();
    expect(screen.getByText(/printed p. 13/)).toBeInTheDocument();
  });
});
