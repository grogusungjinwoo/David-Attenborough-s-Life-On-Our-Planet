import { describe, expect, it } from "vitest";
import { buildSearchIndex, searchContent } from "./contentSearch";

describe("content search", () => {
  it("indexes species, places, zoos, stories, insights, and sources", () => {
    const types = new Set(buildSearchIndex().map((record) => record.type));

    expect(types).toEqual(
      new Set(["species", "place", "zoo", "story", "insight", "source"])
    );
  });

  it.each([
    ["orangutan", "species"],
    ["Pripyat", "story"],
    ["rewild", "story"],
    ["carbon", "insight"]
  ])("returns %s results", (query, expectedType) => {
    const results = searchContent(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((record) => record.type === expectedType)).toBe(true);
  });
});
