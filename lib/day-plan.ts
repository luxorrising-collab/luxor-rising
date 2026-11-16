// How many days a set of experiences needs, day by day. Shared by the "Your day"
// basket (client) and the cards that mark multi-day experiences (server).
//
// Up to four experiences fill a day at the right pace (3–4 a day). The temples
// on the road south are half-days; Aswan's sights share their own day(s); some
// products are a whole day, or several, on their own. Transfers take no day.

const ROAD = new Set(["esna-temple-ceiling", "el-kab-nekhbet", "edfu-temple-of-horus", "kom-ombo-temple"]);
const ASWAN = new Set([
  "philae-temple-aswan",
  "unfinished-obelisk-nubian-museum",
  "elephantine-island-satet-aswan",
  "nubian-village-aswan-boat",
  "tombs-of-the-nobles-aswan-st-simeon",
]);
// The coast: its own days (it can't share a day with Luxor or Aswan).
const COAST = new Set([
  "giftun-island-private-boat",
  "abu-dabbab-turtles-marsa-alam",
  "hurghada-museum-souq-evening",
  "horse-ride-beach-hurghada",
]);
const WHOLE_DAYS: Record<string, number> = {
  "coast-road-trip-egypt": 1,
  "dendera-abydos": 1,
  "luxor-to-aswan-temples-private": 1,
  "abu-simbel-private-road-trip": 1,
  "el-quseir-wadi-el-gemal": 1,
  "goddess-route-egypt": 4,
};
const NO_DAY = new Set(["private-airport-pickup", "hurghada-to-luxor-crossing"]);
// Only on the Signature day.
const SIGNATURE_ONLY = new Set([
  "private-desert-safari",
  "dendera-abydos",
  "sailing-lesson-nile",
  "elephantine-island-satet-aswan",
  "nubian-village-aswan-boat",
  "tombs-of-the-nobles-aswan-st-simeon",
  "abu-simbel-private-road-trip",
  "goddess-route-egypt",
  "el-quseir-wadi-el-gemal",
  "giftun-island-private-boat",
  "horse-ride-beach-hurghada",
  "horse-ride-luxor-west-bank",
]);
const PER_DAY = 4;

/** "A full day" / "4 days" for experiences that are a day or more on their own. */
export function dayLength(slug: string): string | undefined {
  const d = WHOLE_DAYS[slug];
  if (!d) return undefined;
  return d === 1 ? "A full day" : `${d} days`;
}

/** One day of the plan: where, how full (0–1), and what fills it. */
export type DaySegment = { where: string; fill: number; count: number; whole?: boolean };

export function planDays(slugs: string[]) {
  const luxor: string[] = [];
  const aswan: string[] = [];
  const road: string[] = [];
  const coast: string[] = [];
  const segments: DaySegment[] = [];
  for (const s of slugs) {
    if (NO_DAY.has(s)) continue;
    if (WHOLE_DAYS[s]) continue;
    if (ROAD.has(s)) road.push(s);
    else if (COAST.has(s)) coast.push(s);
    else if (ASWAN.has(s)) aswan.push(s);
    else luxor.push(s);
  }
  // Split a bucket into days of `cap` experiences.
  const fillDays = (items: string[], cap: number, where: string) => {
    for (let i = 0; i < items.length; i += cap) {
      const count = Math.min(cap, items.length - i);
      segments.push({ where, count, fill: count / cap });
    }
  };
  fillDays(luxor, PER_DAY, "Luxor");
  fillDays(road, 2, "The road south");
  fillDays(aswan, PER_DAY, "Aswan");
  fillDays(coast, PER_DAY, "The coast");
  for (const s of slugs) {
    const d = WHOLE_DAYS[s];
    if (!d) continue;
    for (let i = 0; i < d; i++) segments.push({ where: s, count: 1, fill: 1, whole: true });
  }
  const counted = slugs.filter((s) => !NO_DAY.has(s)).length;
  return {
    days: counted ? Math.max(1, segments.length) : 0,
    segments,
    needsSignature: slugs.some((s) => SIGNATURE_ONLY.has(s)),
  };
}
