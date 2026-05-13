import type { MediaAsset, MediaLicense } from "../domain/types";
import { sourceCatalog } from "./sources";

type Row = readonly [
  subjectId: string,
  title: string,
  fileName: string,
  alt: string,
  credit: string,
  license: MediaLicense,
  licenseUrl: string,
  sourceUrl: string,
  width: number,
  height: number,
  mimeType: string,
  kind?: MediaAsset["kind"]
];

const rows: Row[] = [
  [
    "david-attenborough",
    "David Attenborough portrait",
    "david-attenborough.jpg",
    "David Attenborough speaking at the 2018 Berekraftsprisen event.",
    "BergenChamber",
    "CC BY-SA 4.0",
    "https://creativecommons.org/licenses/by-sa/4.0",
    "https://commons.wikimedia.org/wiki/File:B%C3%A6rekraftsprisen_2018_(cropped).jpg",
    960,
    1212,
    "image/jpeg",
    "portrait"
  ],
  ["african-elephant", "African bush elephant", "african-elephant.jpg", "Male African bush elephant in Etosha National Park.", "Giles Laurent", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:178_Male_African_bush_elephant_in_Etosha_National_Park_Photo_by_Giles_Laurent.jpg", 960, 640, "image/jpeg"],
  ["bengal-tiger", "Tiger", "bengal-tiger.jpg", "Adult male Royal Bengal tiger.", "Seemaleena", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Adult_male_Royal_Bengal_tiger.jpg", 960, 720, "image/jpeg"],
  ["bornean-orangutan", "Bornean orangutan", "bornean-orangutan.jpg", "Bornean orangutan climbing on a tree.", "Ltshears", "Public Domain", "https://commons.wikimedia.org/wiki/File:OrangutanP1.jpg", "https://commons.wikimedia.org/wiki/File:OrangutanP1.jpg", 960, 1243, "image/jpeg"],
  ["black-rhinoceros", "Black rhinoceros", "black-rhinoceros.jpg", "Black rhinoceros standing in dry grassland.", "Yathin S Krishnappa", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0", "https://commons.wikimedia.org/wiki/File:2012_Black_Rhinoceros_Gemsbokvlakte.jpg", 960, 640, "image/jpeg"],
  ["blue-whale", "Blue whale", "blue-whale.jpg", "Blue whale near the ocean surface.", "NOAA Photo Library", "Public Domain", "https://commons.wikimedia.org/wiki/File:Anim1755_-_Flickr_-_NOAA_Photo_Library.jpg", "https://commons.wikimedia.org/wiki/File:Anim1755_-_Flickr_-_NOAA_Photo_Library.jpg", 960, 640, "image/jpeg"],
  ["polar-bear", "Polar bear", "polar-bear.jpg", "Polar bear portrait in Alaska.", "Alan Wilson", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0", "https://commons.wikimedia.org/wiki/File:Polar_Bear_-_Alaska_(cropped).jpg", 960, 963, "image/jpeg"],
  ["sea-turtle", "Sea turtle", "sea-turtle.jpg", "Olive ridley sea turtle underwater.", "Thierry Caro", "CC BY-SA 3.0", "http://creativecommons.org/licenses/by-sa/3.0/", "https://commons.wikimedia.org/wiki/File:Lepidochelys-olivacea-K%C3%A9lonia-1.JPG", 960, 640, "image/jpeg"],
  ["reef-manta-ray", "Reef manta ray", "reef-manta-ray.png", "Reef manta ray cruising through open water.", "Jaine FRA, Couturier LIE, Weeks SJ, Townsend KA, Bennett MB, et al. (2012)", "CC BY 2.5", "https://creativecommons.org/licenses/by/2.5", "https://commons.wikimedia.org/wiki/File:Manta_alfredi_cruising_-_journal.pone.0046170.g002A.png", 960, 692, "image/png"],
  ["gorilla", "Gorilla", "gorilla.jpg", "Lowland gorilla seated in green vegetation.", "Rennett Stowe", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0", "https://commons.wikimedia.org/wiki/File:Lowland_Gorilla_(8973697544).jpg", 960, 1037, "image/jpeg"],
  ["leopard", "Leopard", "leopard.jpg", "Male leopard in the Mara.", "Sumeet Moghe", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Male_leopard_-_Mara.jpg", 960, 540, "image/jpeg"],
  ["pangolin", "Pangolin", "pangolin.jpg", "Pangolin image collage from Wikimedia Commons.", "The Explaner", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Eupholidota.jpg", 960, 1465, "image/jpeg"],
  ["honey-bee", "Western honey bee", "honey-bee.jpg", "Western honey bee on flowers.", "Didier Descouens", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:(MHNT)_Apis_mellifera_(female)_-_on_viburnum_tinus_flowers.jpg", 960, 751, "image/jpeg"],
  ["coral", "Reef-building coral", "coral.jpg", "Coral outcrop at Flynn Reef.", "Toby Hudson", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0", "https://commons.wikimedia.org/wiki/File:Coral_Outcrop_Flynn_Reef.jpg", 960, 720, "image/jpeg"],
  ["golden-toad", "Golden toad", "golden-toad.jpg", "Golden toad specimen image.", "Charles H. Smith, Aglarech, and Purpy Pupple", "Public Domain", "https://commons.wikimedia.org/wiki/File:Bufo_periglenes2.jpg", "https://commons.wikimedia.org/wiki/File:Bufo_periglenes2.jpg", 960, 640, "image/jpeg"],
  ["amphibian", "Fire salamander", "amphibian.jpg", "Fire salamander on damp forest ground.", "Petar Milosevic", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Fire_salamander_(Salamandra_Salamandra).jpg", 960, 622, "image/jpeg"],
  ["great-white-shark", "Great white shark", "great-white-shark.jpg", "Great white shark swimming underwater.", "Sharkdiver.com", "Public Domain", "https://commons.wikimedia.org/wiki/File:Carcharodon_carcharias.jpg", "https://commons.wikimedia.org/wiki/File:Carcharodon_carcharias.jpg", 960, 720, "image/jpeg"],
  ["gray-wolf", "Gray wolf", "gray-wolf.jpg", "Eurasian gray wolf standing outdoors.", "Mas3cf", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0", "https://commons.wikimedia.org/wiki/File:Eurasian_wolf_2.jpg", 960, 743, "image/jpeg"],
  ["penguin", "Penguin", "penguin.jpg", "Penguins standing together on coastal rocks.", "Sander Spek", "Public Domain", "https://commons.wikimedia.org/wiki/File:Sander-pinguins.jpg", "https://commons.wikimedia.org/wiki/File:Sander-pinguins.jpg", 960, 626, "image/jpeg"]
];

export const mediaAssets: MediaAsset[] = rows.map(
  ([
    subjectId,
    title,
    fileName,
    alt,
    credit,
    license,
    licenseUrl,
    sourceUrl,
    width,
    height,
    mimeType,
    kind
  ]) => ({
    id: `media-${subjectId}`,
    kind: kind ?? "species",
    subjectId,
    title,
    requiredForDisplay: true,
    placeholderStatus: "available",
    localPath: `/media/wikimedia/${fileName}`,
    sourceUrl,
    creator: credit,
    credit,
    license,
    licenseUrl,
    attribution: `${credit}, ${title}, ${license}, via Wikimedia Commons`,
    alt,
    retrievedAt: "2026-05-13",
    width,
    height,
    mimeType,
    commercialUseCompatible: true,
    tags: [subjectId, title, license, "Wikimedia Commons"],
    sourceRefs: [sourceCatalog.wikimediaCommons]
  })
);

export function getMediaAsset(assetId?: string) {
  return mediaAssets.find((asset) => asset.id === assetId);
}

export function mediaPath(localPath: string) {
  return `${import.meta.env.BASE_URL}${localPath.replace(/^\//, "")}`;
}
