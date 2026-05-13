import type { SpeciesProfile, SpeciesRecord, SourceRef } from "../domain/types";
import { sourceCatalog } from "./sources";

type Status = SpeciesRecord["status"];

const defaultSourceRefs = [
  sourceCatalog.iucnSummary,
  sourceCatalog.ipbesAssessment,
  sourceCatalog.wwfLivingPlanet
];

export const speciesRecords: SpeciesProfile[] = [
  species("african-elephant", "African bush elephant", "Loxodonta africana", "endangered", ["serengeti"], "A keystone savanna giant whose movements make protected corridors and land-sharing pressure visible.", "Savannas, woodlands, and dry-season water corridors across sub-Saharan Africa.", "Recovery depends on anti-poaching work, connected habitat, and reducing conflict around farms and water.", 1, "media-african-elephant", "stable", "threatened"),
  species("bengal-tiger", "Tiger", "Panthera tigris", "endangered", ["south-asia", "borneo"], "A forest predator used to show how corridors shrink when roads, farms, and settlements divide habitat.", "Tropical forest, mangrove, grassland, and foothill habitats across Asia.", "Strong reserves help, but long-term recovery needs prey, corridors, and protection beyond park edges.", 2, "media-bengal-tiger", "stable", "threatened"),
  species("bornean-orangutan", "Bornean orangutan", "Pongo pygmaeus", "endangered", ["borneo"], "A forest-dependent great ape used here to make habitat fragmentation tangible on the globe.", "Lowland and peat-swamp rainforests on Borneo.", "Forest continuity, fire prevention, and land-use choices shape whether populations can reconnect.", 3, "media-bornean-orangutan", "stable", "threatened", [sourceCatalog.iucnSummary, sourceCatalog.faoForests]),
  species("black-rhinoceros", "Black rhinoceros", "Diceros bicornis", "endangered", ["serengeti"], "A conservation-recovery story that still carries severe poaching and habitat risk.", "Scrub, savanna, and dry woodland where browsing cover remains connected.", "Populations can grow under strong protection, but poaching pressure keeps recovery fragile.", 4, "media-black-rhinoceros", "stable", "threatened"),
  species("blue-whale", "Blue whale", "Balaenoptera musculus", "endangered", ["north-atlantic", "global-oceans"], "A marine giant connecting industrial extraction history to modern recovery and ship-strike risk.", "Open-ocean feeding grounds, migration corridors, and productive polar-to-temperate waters.", "Ship speed, noise, entanglement, krill availability, and climate shifts shape recovery.", 5, "media-blue-whale", "threatened", "endangered"),
  species("polar-bear", "Polar bear", "Ursus maritimus", "threatened", ["arctic-circle"], "A climate-linked species marker for shrinking sea ice and changing Arctic food webs.", "Sea-ice hunting platforms, Arctic coasts, and seasonal denning areas.", "The main pressure is loss of sea-ice habitat as warming changes hunting seasons and prey access.", 6, "media-polar-bear"),
  species("sea-turtle", "Sea turtle", "Chelonioidea", "threatened", ["coral-triangle", "global-oceans"], "A long-lived ocean traveler linking beaches, reefs, fisheries, plastic, and warming seas.", "Nesting beaches, seagrass beds, reefs, and oceanic migration routes.", "Nest protection, bycatch reduction, and cooler nesting beaches all matter for survival.", 7, "media-sea-turtle"),
  species("reef-manta-ray", "Reef manta ray", "Mobula alfredi", "threatened", ["coral-triangle", "global-oceans"], "A graceful reef-ocean connector used to show marine protected area and fishing-pressure layers.", "Warm reef edges, cleaning stations, and plankton-rich coastal waters.", "Protection varies sharply by region; targeted fishing and bycatch remain persistent risks.", 8, "media-reef-manta-ray"),
  species("gorilla", "Gorilla", "Gorilla", "endangered", ["central-africa"], "A forest great ape that makes long-term protection, disease risk, and community conservation concrete.", "Central African lowland and mountain forests.", "Careful tourism, disease prevention, anti-poaching patrols, and forest protection support recovery.", 9, "media-gorilla", "stable", "threatened"),
  species("leopard", "Leopard", "Panthera pardus", "threatened", ["serengeti", "temperate-north"], "A wide-ranging predator that shows how adaptable species still lose ground when habitat is fragmented.", "Savanna, forest, mountain, and scrub habitats where prey and cover remain.", "Reducing conflict, protecting prey, and preserving corridors are key to keeping ranges connected.", 10, "media-leopard"),
  species("pangolin", "Pangolin", "Pholidota", "endangered", ["central-africa", "borneo"], "A shy insect-eater whose story links biodiversity loss to illegal trade and overlooked species.", "Forests, savannas, and grasslands across parts of Africa and Asia.", "Trade enforcement and habitat protection are both needed because slow reproduction limits recovery.", 11, "media-pangolin", "stable", "threatened"),
  species("honey-bee", "Western honey bee", "Apis mellifera", "stable", ["pollinator-belts"], "A familiar pollinator used as a gateway into the wider decline of insects and plant partnerships.", "Flower-rich farmland, meadows, orchards, gardens, and managed hives.", "The broader pollinator story depends on pesticide reduction, floral diversity, and habitat patches.", 12, "media-honey-bee", "stable", "stable", [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]),
  species("coral", "Reef-building coral", "Scleractinia", "threatened", ["coral-triangle"], "A living reef architect that makes warming, acidification, and biodiversity dependence visible.", "Clear, warm, shallow reef systems and deeper refuges where conditions remain suitable.", "Cutting emissions is central; local protection can reduce pollution, sediment, and overfishing stress.", 13, "media-coral"),
  species("golden-toad", "Golden toad", "Incilius periglenes", "extinct", ["central-america"], "A small amphibian marker for the abruptness of localized extinction in a changing climate.", "Formerly known from cloud-forest habitat in Costa Rica.", "Its absence is a warning about narrow ranges, disease, climate shifts, and amphibian vulnerability.", 14, "media-golden-toad", "stable", "extinct"),
  species("amphibian", "Fire salamander", "Salamandra salamandra", "threatened", ["central-america", "temperate-north"], "A recognizable amphibian profile that keeps the catalog's amphibian theme visible beyond the extinct golden toad.", "Damp forests, shaded streams, and leaf-litter habitat where moisture and temperature remain suitable.", "Amphibian protection depends on clean water, disease monitoring, habitat continuity, and climate refuges.", 15, "media-amphibian"),
  species("great-white-shark", "Great white shark", "Carcharodon carcharias", "threatened", ["global-oceans", "north-atlantic"], "An apex marine predator used to connect food webs, fisheries, and fear-driven conservation politics.", "Temperate coastal waters, seal colonies, shelves, and long ocean migrations.", "Protection from targeted killing and bycatch helps preserve marine food-web balance.", 16, "media-great-white-shark"),
  species("gray-wolf", "Gray wolf", "Canis lupus", "stable", ["temperate-north"], "A rewilding symbol that shows how predators can reshape behavior, politics, and landscapes.", "Forests, tundra, grasslands, and mountain systems across the Northern Hemisphere.", "Coexistence policy and connected habitat determine whether recovery lasts beyond protected cores.", 17, "media-gray-wolf", "stable", "stable", [sourceCatalog.ipbesAssessment, sourceCatalog.wwfLivingPlanet]),
  species("penguin", "Penguin", "Spheniscidae", "threatened", ["southern-ocean"], "A cold-ocean bird family that makes sea-ice, fisheries, krill, and warming legible at the edge of the map.", "Southern Ocean coasts, islands, sea ice, and productive cold-water feeding grounds.", "Krill management, marine reserves, and climate action shape the future of several penguin colonies.", 18, "media-penguin")
];

function species(
  id: string,
  name: string,
  scientificName: string,
  status: Status,
  regionIds: string[],
  summary: string,
  habitat: string,
  conservationNotes: string,
  displayPriority: number,
  imageAssetId: string,
  earlyStatus: Status = "stable",
  middleStatus: Status = status,
  sourceRefs: SourceRef[] = defaultSourceRefs
): SpeciesProfile {
  return {
    id,
    name,
    scientificName,
    status,
    regionIds,
    summary,
    habitat,
    conservationNotes,
    displayPriority,
    imageAssetId,
    statusByYear: [
      {
        year: 1937,
        status: earlyStatus,
        note: "Used as an early witness baseline for the editorial catalog.",
        sourceRefs
      },
      {
        year: 1978,
        status: middleStatus,
        note: "Pressure becomes visible in the modern conservation record.",
        sourceRefs
      },
      {
        year: 2024,
        status,
        note: "Latest app catalog status for the current dashboard.",
        sourceRefs
      }
    ],
    sourceRefs
  };
}
