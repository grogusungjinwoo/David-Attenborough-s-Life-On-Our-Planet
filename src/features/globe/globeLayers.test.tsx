import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { continents, countries, tradeRoutes, wildAreas } from "../../data";
import {
  GlobeLabelLayer,
  isLabelFrontFacing,
  selectCountryLabels,
  selectWildAreaLabels
} from "./GlobeLabelLayer";
import { buildVisibleTradeRoutes } from "./TradeRouteLayer";

describe("globe atlas label helpers", () => {
  it("keeps default country labels sparse and reveals them at close zoom", () => {
    expect(selectCountryLabels(countries, 0.55)).toHaveLength(0);
    expect(selectCountryLabels(countries, 0.66)).toHaveLength(0);
    expect(selectCountryLabels(countries, 0.78).length).toBeGreaterThan(4);

    render(
      <GlobeLabelLayer
        continents={continents}
        countries={countries}
        wildAreas={wildAreas}
        zoomScalar={0.78}
        currentYear={2024}
        activeWildAreaIds={["amazon-basin"]}
        viewLat={0}
        viewLon={0}
      />
    );

    expect(screen.getByText("Africa")).toBeInTheDocument();
    expect(screen.getByText("Asia")).toBeInTheDocument();
    expect(screen.getByText("Brazil")).toBeInTheDocument();
    expect(screen.getByText("Amazon Basin")).toBeInTheDocument();
  });

  it("gates wild-area labels by focus and close zoom", () => {
    expect(selectWildAreaLabels(wildAreas, 1900, [], 0.55)).toHaveLength(0);
    expect(selectWildAreaLabels(wildAreas, 1900, [], 0.72)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Amazon Basin" }),
        expect.objectContaining({ label: "Central African Forests" })
      ])
    );
    expect(selectWildAreaLabels(wildAreas, 1900, [], 0.72)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Borneo Rainforest" })])
    );
    expect(selectWildAreaLabels(wildAreas, 1900, ["borneo"], 0.55)).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Borneo Rainforest" })])
    );
  });

  it("classifies label points against the visible globe hemisphere", () => {
    expect(isLabelFrontFacing(0, 0, 0, 0)).toBe(true);
    expect(isLabelFrontFacing(8, 20, 10, 18)).toBe(true);
    expect(isLabelFrontFacing(0, 180, 0, 0)).toBe(false);
    expect(isLabelFrontFacing(-35, -70, 45, 110)).toBe(false);
  });
});

describe("trade route visibility helpers", () => {
  it("keeps routes hidden before 1900 and increases modern visibility", () => {
    expect(buildVisibleTradeRoutes(tradeRoutes, 1850)).toHaveLength(0);

    const routes1937 = buildVisibleTradeRoutes(tradeRoutes, 1937);
    const routes2024 = buildVisibleTradeRoutes(tradeRoutes, 2024);

    expect(routes1937.length).toBeGreaterThan(1);
    expect(routes2024.length).toBeGreaterThan(routes1937.length);
    expect(routes2024.some((route) => route.id === "east-asia-container")).toBe(true);
    expect(routes2024.every((route) => route.intensity > 0)).toBe(true);
  });

  it("marks chapter-selected trade routes for globe emphasis", () => {
    const routes2024 = buildVisibleTradeRoutes(tradeRoutes, 2024, [
      "transpacific-data-cable",
      "air-cargo-eurasia"
    ]);

    expect(routes2024).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "transpacific-data-cable", active: true }),
        expect.objectContaining({ id: "air-cargo-eurasia", active: true })
      ])
    );
    expect(routes2024.find((route) => route.id === "grain-atlantic")?.active).toBe(false);
  });
});
