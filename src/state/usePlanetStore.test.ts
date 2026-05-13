import { beforeEach, describe, expect, it } from "vitest";
import { usePlanetStore } from "./usePlanetStore";

describe("usePlanetStore year selection", () => {
  beforeEach(() => {
    usePlanetStore.setState(usePlanetStore.getInitialState(), true);
  });

  it("selects a year in the controlled globe state", () => {
    usePlanetStore.getState().setYear(1960);

    const state = usePlanetStore.getState();

    expect(state.currentYear).toBe(1960);
  });
});

describe("usePlanetStore layer toggles", () => {
  beforeEach(() => {
    usePlanetStore.setState(usePlanetStore.getInitialState(), true);
  });

  it("toggles layer state and supports explicit layer assignment", () => {
    expect(usePlanetStore.getState().layers.atmosphere).toBe(true);

    usePlanetStore.getState().toggleLayer("atmosphere");

    const disabledState = usePlanetStore.getState();

    expect(disabledState.layers.atmosphere).toBe(false);

    usePlanetStore.getState().setLayer("atmosphere", true);

    const enabledState = usePlanetStore.getState();

    expect(enabledState.layers.atmosphere).toBe(true);
  });
});
