import type { ZooSite } from "../domain/types";
import { sourceCatalog } from "./sources";

export const zooSites: ZooSite[] = [
  {
    id: "london-zoo",
    name: "ZSL London Zoo",
    lat: 51.5353,
    lon: -0.1534,
    openedYear: 1828,
    notes:
      "The world's oldest scientific zoo, useful as the opening marker for modern zoological collections.",
    sourceRefs: [sourceCatalog.londonZoo]
  },
  {
    id: "smithsonian-national-zoo",
    name: "Smithsonian National Zoo",
    lat: 38.9296,
    lon: -77.0498,
    openedYear: 1889,
    notes:
      "Created by act of Congress for science, instruction, and public recreation.",
    sourceRefs: [sourceCatalog.smithsonianZoo]
  },
  {
    id: "bronx-zoo",
    name: "Bronx Zoo",
    lat: 40.8506,
    lon: -73.8769,
    openedYear: 1899,
    notes:
      "A major metropolitan zoo and Wildlife Conservation Society flagship site.",
    sourceRefs: [sourceCatalog.bronxZoo]
  },
  {
    id: "san-diego-zoo",
    name: "San Diego Zoo",
    lat: 32.7353,
    lon: -117.149,
    openedYear: 1916,
    notes:
      "A major conservation and public education site with a long archive of zoological milestones.",
    sourceRefs: [sourceCatalog.sanDiegoZoo]
  },
  {
    id: "singapore-zoo",
    name: "Singapore Zoo",
    lat: 1.4043,
    lon: 103.793,
    openedYear: 1973,
    notes:
      "Placed as a later tropical-education marker in the first static dataset.",
    sourceRefs: [sourceCatalog.singaporeZoo]
  },
  {
    id: "taronga-zoo",
    name: "Taronga Zoo Sydney",
    lat: -33.8431,
    lon: 151.241,
    openedYear: 1916,
    notes:
      "Included to balance Southern Hemisphere conservation storytelling.",
    sourceRefs: [sourceCatalog.tarongaZoo]
  }
];
