// Real footage from our own days in Luxor and on the coast, filmed on the phone,
// in the Luxor Rising grade, as tall 9:16 clips for the galleries. Where we speak,
// the clip carries English subtitles (and its own sound, for the lightbox).
// public/videos/real/v/<name>.mp4 + <name>-poster.jpg — built by .assets/real-clips-web.mjs.

export type RealClip = {
  video: string;
  poster: string;
  caption: string;
  /** a tall 9:16 clip: the galleries give it a tall tile */
  vertical: true;
  /** spoken, with burned-in English subtitles: opens with sound in the lightbox */
  sound?: boolean;
};

const clip = (name: string, caption: string, sound = false): RealClip => ({
  video: `/videos/real/v/${name}.mp4`,
  poster: `/videos/real/v/${name}-poster.jpg`,
  caption,
  vertical: true,
  ...(sound ? { sound: true } : {}),
});

export const REAL = {
  // spoken, subtitled
  dawnBalloons: clip("dawn-balloons", "Morning on the roof: balloons over the Valley of the Kings", true),
  terraceSunrise: clip("terrace-sunrise", "Sunrise from the terrace, balloons over the valley", true),
  nightTerrace: clip("night-terrace", "The Nile at night, under a full moon", true),
  rooftopSunset: clip("rooftop-sunset", "Sunset over the Nile, from the roof", true),
  hurghadaSunrise: clip("hurghada-sunrise", "Sunrise over the Red Sea, from a Hurghada rooftop", true),
  dawnDrive: clip("dawn-drive", "The drive out at dawn, the story told on the way", true),
  keyOfLife: clip("key-of-life", "The key of life, on a painted temple ceiling", true),
  bikeVillage: clip("bike-village", "By bike through the village, with friends", true),
  // graded, no speech
  desertRoad: clip("desert-road", "The desert road between the coast and Luxor"),
  redSeaBeach: clip("red-sea-beach", "Turquoise water on the Red Sea coast"),
  rooftopTerrace: clip("rooftop-terrace", "A rooftop terrace as the sun goes down"),
  redSeaSunrise: clip("red-sea-sunrise", "First light over the Red Sea"),
  redSeaShallows: clip("red-sea-shallows", "Shallow water and shade on the beach"),
  valleyRoad: clip("valley-road", "The straight road through the Nile valley"),
  fields: clip("fields-window", "Green fields from the car window"),
  villageDrive: clip("village-drive", "The dusty road through the palms"),
  busyStreet: clip("busy-street", "A busy street in town"),
  villagePalms: clip("village-palms", "A village street under the palms"),
  nightDrive: clip("night-drive", "An evening drive through Luxor"),
  medinetCourtyard: clip("medinet-courtyard", "Arriving in the courtyard at Medinet Habu"),
  medinetReliefs: clip("medinet-reliefs", "Painted reliefs and ceilings at Medinet Habu"),
  guideReliefs: clip("guide-reliefs", "Your guide, at the reliefs"),
  medinetHall: clip("medinet-hall", "Walking through the hall at Medinet Habu"),
  nileBoat: clip("nile-boat", "Our boat on the Nile"),
  deckSunset: clip("deck-sunset", "On deck as the sun goes down"),
  sunOverNile: clip("sun-over-nile", "The sun low over the Nile"),
  sailingBank: clip("sailing-bank", "Sailing past the river bank"),
  mastWater: clip("mast-water", "Mast, sail and water"),
  feluccaSunset: clip("felucca-sunset", "A felucca at sunset"),
  feluccaBank: clip("felucca-bank", "A felucca off the Luxor bank"),
  karnakHall: clip("karnak-hall", "The Great Hypostyle Hall at Karnak"),
  karnakRuins: clip("karnak-ruins", "Walking the ruins at Karnak"),
  karnakLight: clip("karnak-light", "Columns, and light in the doorway"),
  templeNiche: clip("temple-niche", "Carved stone, up close"),
  tombsRoad: clip("tombs-road", "The road out to the tombs"),
  desertHills: clip("desert-hills", "Desert and the Theban hills at sunset"),
} satisfies Record<string, RealClip>;

const R = REAL;
const balloon = [R.dawnBalloons, R.terraceSunrise, R.dawnDrive, R.rooftopSunset];
const nile = [R.feluccaSunset, R.sunOverNile, R.deckSunset, R.sailingBank, R.nileBoat, R.mastWater, R.feluccaBank];
const medinet = [R.keyOfLife, R.medinetReliefs, R.medinetCourtyard, R.medinetHall, R.guideReliefs];
const karnak = [R.karnakHall, R.karnakLight, R.karnakRuins, R.templeNiche];
const coast = [R.hurghadaSunrise, R.redSeaSunrise, R.desertRoad, R.valleyRoad, R.fields];
const sea = [R.redSeaBeach, R.redSeaShallows, R.redSeaSunrise, R.hurghadaSunrise];
const tombs = [R.tombsRoad, R.dawnDrive, R.dawnBalloons];
const village = [R.bikeVillage, R.villagePalms, R.villageDrive, R.rooftopSunset];
const desert = [R.desertHills, R.nightTerrace, R.desertRoad];

/** Real clips per experience page (by slug), most relevant first. */
export const REAL_BY_EXPERIENCE: Record<string, RealClip[]> = {
  "hot-air-balloon-luxor": balloon,
  "hot-air-balloon-private-vip": balloon,
  "balloon-valley-of-the-kings": [R.dawnBalloons, R.terraceSunrise, R.tombsRoad, R.dawnDrive],
  "medinet-habu": medinet,
  "karnak-at-dawn": karnak,
  "luxor-temple": [R.templeNiche, R.feluccaBank, R.karnakLight],
  "luxor-by-night": [R.nightTerrace, R.nightDrive, R.feluccaBank],
  "felucca-sunset-sail": nile,
  "banana-island-felucca": [R.nileBoat, R.deckSunset, R.sunOverNile, R.sailingBank, R.feluccaSunset],
  "sailing-lesson-nile": [R.feluccaSunset, R.sailingBank, R.mastWater, R.sunOverNile],
  "nile-dinner-cruise": [R.sunOverNile, R.nileBoat, R.feluccaBank, R.nightTerrace],
  "valley-of-the-kings": tombs,
  "tutankhamun-tomb": tombs,
  "nefertari-tomb": [R.tombsRoad, R.dawnDrive],
  "ramesseum-valley-of-queens": [R.tombsRoad, R.dawnDrive],
  "colossi-of-memnon": [R.tombsRoad, R.dawnDrive, R.villagePalms],
  "hatshepsut-temple": [R.dawnBalloons, R.tombsRoad],
  "deir-el-medina": [R.tombsRoad, R.villagePalms],
  "horse-ride-luxor-west-bank": [R.rooftopSunset, R.villagePalms, R.bikeVillage, R.villageDrive],
  "reality-hunting": [R.bikeVillage, R.busyStreet, R.villagePalms, R.villageDrive],
  "private-desert-safari": desert,
  "desert-astronomy-night": [R.nightTerrace, R.desertHills],
  "camel-bedouin-breakfast": [R.desertHills, R.redSeaSunrise],
  "hurghada-to-luxor-crossing": coast,
  "private-airport-pickup": [R.desertRoad, R.hurghadaSunrise, R.dawnDrive, R.valleyRoad],
  "luxor-to-aswan-temples-private": [R.valleyRoad, R.fields, R.karnakHall],
  "red-sea-boat-snorkelling": sea,
  "private-yacht-red-sea": sea,
  "giftun-island-private-boat": sea,
  "abu-dabbab-turtles-marsa-alam": [R.redSeaShallows, R.redSeaBeach, R.redSeaSunrise],
  "coast-road-trip-egypt": [R.desertRoad, R.redSeaSunrise, R.hurghadaSunrise, R.valleyRoad],
  "horse-ride-beach-hurghada": [R.redSeaSunrise, R.redSeaBeach],
  "hurghada-museum-souq-evening": [R.hurghadaSunrise, R.busyStreet],
};

/** Home page: one clip from each part of a day, mixed in among the photos. */
export const REAL_HOME: RealClip[] = [R.dawnBalloons, R.karnakHall, R.feluccaSunset, R.rooftopSunset, R.keyOfLife, R.bikeVillage];

/** Design Your Day: the whole day, start to finish, door to door from the coast. */
export const REAL_DAY: RealClip[] = [
  R.terraceSunrise,
  R.hurghadaSunrise,
  R.karnakHall,
  R.keyOfLife,
  R.dawnDrive,
  R.medinetReliefs,
  R.feluccaSunset,
  R.bikeVillage,
  R.desertRoad,
  R.karnakLight,
  R.rooftopSunset,
  R.medinetCourtyard,
  R.villagePalms,
  R.dawnBalloons,
];

/** Private villas: the terraces and the views from them. */
export const REAL_VILLAS: RealClip[] = [R.rooftopTerrace, R.nightTerrace, R.terraceSunrise, R.rooftopSunset];

/**
 * Mix real clips in among photos so neither crowds the other: a clip leads, then
 * a photo, a clip, two photos, a clip… — the clips come first, the photos fill
 * around them, and whatever is left of either follows.
 */
export function mixIn<P, C>(photos: P[], clips: C[], gap = 2): (P | C)[] {
  const out: (P | C)[] = [];
  let p = 0;
  let c = 0;
  if (clips[c]) out.push(clips[c++]);
  if (photos[p]) out.push(photos[p++]);
  while (c < clips.length || p < photos.length) {
    if (c < clips.length) out.push(clips[c++]);
    for (let k = 0; k < gap && p < photos.length; k++) out.push(photos[p++]);
    if (p >= photos.length) while (c < clips.length) out.push(clips[c++]);
  }
  return out;
}
