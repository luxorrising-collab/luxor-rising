// The review carousel, filmed: each guest quote sits on a real, colour-graded clip
// from our own days (one without speech or subtitles, matched to what the quote is
// about), and our subtitled films are mixed in between the quotes. Daniela Hall's
// words about her guide sit on real photos from the gallery instead.
import { REAL, type RealClip } from "./real-clips";

export type ReviewMedia = { video?: string; poster?: string; film?: RealClip };

const R = REAL;
// matched on a phrase of the quote (lower case) → the clip behind it
const BY_QUOTE: [string, RealClip][] = [
  ["arranged my whole trip", R.desertRoad],
  ["met at the airport", R.nightDrive],
  ["tranquil and powerful", R.karnakLight],
  ["never any friction", R.sunOverNile],
  ["most powerful hours", R.medinetReliefs],
  ["scale of karnak", R.karnakHall],
  ["most moving chambers", R.tombsRoad],
  ["sailing the nile", R.feluccaSunset],
  ["morning coffee", R.rooftopTerrace],
  ["flowed naturally", R.villageDrive],
  ["year later", R.deckSunset],
  ["privately, unhurried", R.sailingBank],
  ["karnak", R.karnakHall],
  ["medinet", R.medinetReliefs],
  ["felucca", R.feluccaSunset],
  ["nile", R.sunOverNile],
  ["desert", R.desertHills],
  ["balloon", R.villagePalms],
];
// when nothing in the quote matches: a calm rotation of the day's clips
const FALLBACK = [R.karnakLight, R.sunOverNile, R.villagePalms, R.medinetCourtyard, R.feluccaBank, R.sailingBank];

// Daniela Hall: real photographs from the gallery (her guide, the temples, the table)
const DANIELA = [
  "/images/experiences/real/nile-01.jpg",
  "/images/experiences/real/luxor-life-01.jpg",
  "/images/experiences/real/medinet-habu-02.jpg",
  "/images/experiences/real/karnak-02.jpg",
];

/** All our subtitled films, mixed in between the quotes. */
export const REVIEW_FILMS: RealClip[] = [
  R.dawnBalloons,
  R.keyOfLife,
  R.rooftopSunset,
  R.hurghadaSunrise,
  R.nightTerrace,
  R.bikeVillage,
  R.terraceSunrise,
  R.dawnDrive,
];

type Base = { quote?: string | null; author?: string | null; image?: string | null };

export function withReviewClips<T extends Base>(items: T[], every = 2): (T & ReviewMedia)[] {
  let d = 0;
  let f = 0;
  const used = new Set<string>();
  const dressed = items.map((t) => {
    if (/daniela hall/i.test(t.author ?? "")) {
      const image = DANIELA[d++ % DANIELA.length];
      return { ...t, image } as T & ReviewMedia;
    }
    const q = (t.quote ?? "").toLowerCase();
    let clip = BY_QUOTE.find(([k, c]) => q.includes(k) && !used.has(c.video))?.[1];
    if (!clip) clip = FALLBACK.find((c) => !used.has(c.video)) ?? FALLBACK[f++ % FALLBACK.length];
    used.add(clip.video);
    return { ...t, video: clip.video, poster: clip.poster, image: clip.poster } as T & ReviewMedia;
  });
  // a film after every `every` quotes, until all films are in; the rest at the end
  const out: (T & ReviewMedia)[] = [];
  let k = 0;
  dressed.forEach((t, i) => {
    out.push(t);
    if ((i + 1) % every === 0 && k < REVIEW_FILMS.length) out.push({ film: REVIEW_FILMS[k++] } as T & ReviewMedia);
  });
  while (k < REVIEW_FILMS.length) out.push({ film: REVIEW_FILMS[k++] } as T & ReviewMedia);
  return out;
}
