import { editorialStories, insightCards, speciesProfiles } from "../data/editorial";
import { regions } from "../data/regions";
import { allSources } from "../data/sources";
import { zooSites } from "../data/zoos";
import type {
  EditorialStory,
  InsightCard,
  RegionRecord,
  SearchRecord,
  SourceRef,
  SpeciesProfile,
  ZooSite
} from "./types";

export type SearchCorpus = {
  species: SpeciesProfile[];
  regions: RegionRecord[];
  zoos: ZooSite[];
  stories: EditorialStory[];
  insights: InsightCard[];
  sources: SourceRef[];
};

export function buildSearchIndex(corpus: SearchCorpus = defaultCorpus()): SearchRecord[] {
  return [
    ...corpus.species.map(indexSpecies),
    ...corpus.regions.map(indexRegion),
    ...corpus.zoos.map(indexZoo),
    ...corpus.stories.map(indexStory),
    ...corpus.insights.map(indexInsight),
    ...corpus.sources.map(indexSource)
  ];
}

export function searchContent(query: string, index = buildSearchIndex()) {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return [];
  }

  return index
    .map((record) => ({
      record,
      score: scoreRecord(record, queryTokens)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .map((entry) => entry.record);
}

function defaultCorpus(): SearchCorpus {
  return {
    species: speciesProfiles,
    regions,
    zoos: zooSites,
    stories: editorialStories,
    insights: insightCards,
    sources: allSources
  };
}

function indexSpecies(species: SpeciesProfile): SearchRecord {
  return createRecord({
    id: species.id,
    type: "species",
    title: species.name,
    summary: `${species.summary} ${species.conservationNotes}`,
    targetSection: "species",
    targetId: species.id,
    sourceIds: species.sourceRefs.map((source) => source.id),
    text: [
      species.name,
      species.scientificName,
      species.status,
      species.summary,
      species.habitat,
      species.conservationNotes,
      ...species.regionIds,
      ...species.statusByYear.map((status) => status.note)
    ]
  });
}

function indexRegion(region: RegionRecord): SearchRecord {
  return createRecord({
    id: region.id,
    type: "place",
    title: region.name,
    summary: region.summary,
    targetSection: "places",
    targetId: region.id,
    sourceIds: region.sourceRefs.map((source) => source.id),
    text: [region.name, region.biome, region.summary]
  });
}

function indexZoo(zoo: ZooSite): SearchRecord {
  return createRecord({
    id: zoo.id,
    type: "zoo",
    title: zoo.name,
    summary: zoo.notes,
    targetSection: "places",
    targetId: zoo.id,
    sourceIds: zoo.sourceRefs.map((source) => source.id),
    text: [zoo.name, zoo.notes, zoo.openedYear?.toString() ?? ""]
  });
}

function indexStory(story: EditorialStory): SearchRecord {
  return createRecord({
    id: story.id,
    type: "story",
    title: story.title,
    summary: story.summary,
    targetSection: story.kind === "solution" ? "solutions" : "stories",
    targetId: story.id,
    sourceIds: story.sourceRefs.map((source) => source.id),
    text: [
      story.title,
      story.summary,
      story.kind,
      ...story.keywords,
      ...story.relatedYears.map(String),
      ...story.relatedRegionIds,
      ...story.relatedSpeciesIds,
      ...story.manuscriptPageRefs.map((pageRef) => pageRef.label)
    ]
  });
}

function indexInsight(insight: InsightCard): SearchRecord {
  return createRecord({
    id: insight.id,
    type: "insight",
    title: insight.title,
    summary: insight.body,
    targetSection: "overview",
    targetId: insight.id,
    sourceIds: insight.sourceRefs.map((source) => source.id),
    text: [
      insight.title,
      insight.body,
      insight.severity,
      insight.relatedMetric ?? ""
    ]
  });
}

function indexSource(source: SourceRef): SearchRecord {
  return createRecord({
    id: source.id,
    type: "source",
    title: source.label,
    summary: [source.publisher, source.note].filter(Boolean).join(" "),
    targetSection: "search",
    targetId: source.id,
    sourceIds: [source.id],
    href: source.url,
    text: [source.id, source.label, source.publisher, source.note ?? ""]
  });
}

function createRecord(
  record: Omit<SearchRecord, "tokens"> & { text: Array<string | undefined> }
): SearchRecord {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    summary: record.summary,
    targetSection: record.targetSection,
    targetId: record.targetId,
    sourceIds: record.sourceIds,
    href: record.href,
    tokens: tokenize(record.text.filter(Boolean).join(" "))
  };
}

function scoreRecord(record: SearchRecord, queryTokens: string[]) {
  const tokenSet = new Set(record.tokens);

  return queryTokens.reduce((score, token) => {
    if (tokenSet.has(token)) {
      return score + 3;
    }

    if (record.tokens.some((recordToken) => recordToken.includes(token))) {
      return score + 1;
    }

    return score;
  }, 0);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
