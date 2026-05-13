import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createInsightCards,
  editorialStories,
  geoLayers,
  mediaAssets,
  referenceOverlays,
  regions,
  solutionSourceStatus,
  speciesProfiles,
  timelineAnchors,
  wildSpaceDefinitionCaveats,
  wildSpaceDefinitionLabels,
  zooSites
} from "../data";
import { createWorldSnapshot, getActiveTimelineAnchor } from "../domain/timeline";
import { defaultLayers } from "../domain/timeline";
import { AtlasConsole } from "./AtlasConsole";

describe("AtlasConsole", () => {
  it("renders a compact Plato philosophy note in the witness panel", () => {
    const currentYear = 2024;
    const activeAnchor = getActiveTimelineAnchor(timelineAnchors, currentYear);
    const snapshot = createWorldSnapshot(timelineAnchors, currentYear, defaultLayers);
    const insightCards = createInsightCards(snapshot, speciesProfiles, defaultLayers);
    const noop = vi.fn();

    render(
      <AtlasConsole
        activeAnchor={activeAnchor}
        activePrimarySection="overview"
        activeWitnessTab="witness"
        bottomPanels={<div />}
        currentYear={currentYear}
        debugOpen={false}
        earthSurface={<div />}
        activeView="space"
        geoLayers={geoLayers}
        editorialStories={editorialStories}
        insightCards={insightCards}
        isFullscreenRequested={false}
        layers={defaultLayers}
        mediaAssets={mediaAssets}
        overlays={referenceOverlays}
        providerLabel="Static test provider"
        regions={regions}
        searchQuery=""
        searchResults={[]}
        snapshot={snapshot}
        solutionBlocked={solutionSourceStatus}
        species={speciesProfiles}
        timelineAnchors={timelineAnchors}
        wildSpaceDefinition="witness-story"
        wildSpaceDefinitionCaveat={wildSpaceDefinitionCaveats["witness-story"]}
        wildSpaceDefinitionLabels={wildSpaceDefinitionLabels}
        zoos={zooSites}
        onLayerToggle={noop}
        onPlayTimeline={noop}
        onResetView={noop}
        onActiveViewChange={noop}
        onActivePrimarySectionChange={noop}
        onActiveWitnessTabChange={noop}
        onFullscreenRequestedChange={noop}
        onPanGlobeView={noop}
        onSearchQueryChange={noop}
        onWildSpaceDefinitionChange={noop}
        onSelectRegion={noop}
        onSelectSpecies={noop}
        onSelectZoo={noop}
        onToggleDebug={noop}
        onYearChange={noop}
        onZoomIn={noop}
        onZoomOut={noop}
      />
    );

    expect(screen.getByText("Philosophy note")).toBeInTheDocument();
    expect(screen.getByText("Plato")).toBeInTheDocument();
  });
});
