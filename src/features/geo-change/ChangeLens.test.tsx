import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { regions, timelineAnchors } from "../../data";
import { createWorldSnapshot } from "../../domain/timeline";
import { deriveGeoChangeSnapshot } from "../../data/geoChangeOverlays";
import type { GeoChangeLayerId } from "../../domain/types";
import { ChangeLens } from "./ChangeLens";

describe("ChangeLens", () => {
  it("renders the active layer, year, legend, and caveat", () => {
    const geoChange = deriveGeoChangeSnapshot(
      2024,
      createWorldSnapshot(timelineAnchors, 2024),
      regions
    );

    render(
      <ChangeLens
        activeLayerId="human-footprint"
        snapshot={geoChange}
        onActiveLayerChange={() => undefined}
      />
    );

    expect(screen.getByRole("complementary", { name: /change lens/i })).toHaveAttribute(
      "data-active-layer",
      "human-footprint"
    );
    expect(screen.getByLabelText(/geographic change layer/i)).toHaveValue("human-footprint");
    expect(screen.getAllByText(/2024/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Human Footprint/i)).toBeInTheDocument();
    expect(screen.getByText(/not a parcel-level map/i)).toBeInTheDocument();
  });

  it("changes legend and summary copy when the active layer changes", () => {
    function Harness() {
      const [activeLayerId, setActiveLayerId] =
        useState<GeoChangeLayerId>("wild-space");
      const geoChange = deriveGeoChangeSnapshot(
        1937,
        createWorldSnapshot(timelineAnchors, 1937),
        regions
      );

      return (
        <ChangeLens
          activeLayerId={activeLayerId}
          snapshot={geoChange}
          onActiveLayerChange={setActiveLayerId}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByText(/wild-space contraction rises/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/geographic change layer/i), {
      target: { value: "ocean-ice" }
    });

    expect(screen.getByLabelText(/geographic change layer/i)).toHaveValue("ocean-ice");
    expect(screen.getByText(/ocean and ice stress/i)).toBeInTheDocument();
    expect(screen.getAllByText(/instrumental and reconstructed/i).length).toBeGreaterThan(0);
  });
});
