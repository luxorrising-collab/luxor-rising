import type { ReactNode } from "react";
import type { ExperienceCardData } from "@/components/ExperienceGrid";
import { FEAT } from "@/lib/experience-cards";

// "How your day flows" on Design Your Day: the journey's stops as cards in the
// same dark, drifting slideshow the experience pages use (DayHoldSlideshow),
// each on one of our own photographs. A card shows its step number, the
// headline, feature chips (e.g. "Up to 24 h before", "About 4 h drive") and a
// short sentence under "Read more". The icon drives the progress rail.

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const fic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const CHAT = "M5 18.5V6.8A1.8 1.8 0 0 1 6.8 5h10.4A1.8 1.8 0 0 1 19 6.8v7.4a1.8 1.8 0 0 1-1.8 1.8H8.6L5 18.5ZM8.5 9.2h7M8.5 12h4.6";
const CAR = "M4 15.5v-3.2l1.8-4.1A1.7 1.7 0 0 1 7.4 7h9.2a1.7 1.7 0 0 1 1.6 1.2l1.8 4.1v3.2M4 15.5h16M4 15.5V18h2.4v-2.5M20 15.5V18h-2.4v-2.5M7.2 12.3h.1M16.7 12.3h.1";
const HOME = "M4.5 11 12 4.8l7.5 6.2M6.5 9.5V19h11V9.5M10.2 19v-4.6h3.6V19";
const PIN_PATH = "M12 20.5s-6-5.6-6-10.2a6 6 0 0 1 12 0c0 4.6-6 10.2-6 10.2ZM12 12.3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z";
const CAL = "M5 6.5h14v13H5zM5 10.5h14M9 4v4M15 4v4";

// Rail icons, matched on the stop's headline.
const ICONS: [RegExp, ReactNode][] = [
  [/book|whatsapp|concierge, from/i, ic(CHAT)],
  [/collect|pick ?up/i, ic(CAR)],
  [/road|drive/i, ic("M8.5 20 11 4M15.5 20 13 4M12 7.4v1.2M12 11.4v1.2M12 15.4v1.2")],
  [/temple|tomb/i, ic("M4 8.5 12 4.5l8 4M5 8.5h14M6.8 8.5v8M10.3 8.5v8M13.7 8.5v8M17.2 8.5v8M4.5 19.5h15M5.5 16.5h13")],
  [/unhurried|your way|anything/i, ic("M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z")],
  [/golden|evening|sunset/i, ic("M6.5 16a5.5 5.5 0 0 1 11 0M3.5 16h17M5.5 19h13M12 5.5v2M5.2 8.7l1.4 1.4M18.8 8.7l-1.4 1.4")],
  [/home|door to door/i, ic(HOME)],
  [/stay|longer|more/i, ic("M15.8 14.6A6.6 6.6 0 0 1 9.4 5a6.6 6.6 0 1 0 6.4 9.6ZM17.5 4.5v3M16 6h3")],
];

// Feature-chip icons, matched on the chip's label (same style as the
// experience cards' chips).
const FEATURE_ICONS: [RegExp, ReactNode][] = [
  [/whatsapp|chat/i, fic(CHAT)],
  [/\d+\s*h\b|hour/i, FEAT.crowd],
  [/hurghada|marsa/i, fic(PIN_PATH)],
  [/hotel|door/i, fic(HOME)],
  [/car|drive/i, fic(CAR)],
  [/food|eat|lunch/i, FEAT.food],
  [/golden|sunset|dawn/i, FEAT.dawn],
  [/felucca|nile|desert/i, FEAT.nile],
  [/pace|quiet/i, FEAT.temple],
  [/day|plan/i, fic(CAL)],
];
const featureIcon = (label: string) => FEATURE_ICONS.find(([re]) => re.test(label))?.[1] ?? FEAT.onus;

const PEOPLE = "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a5.5 5.5 0 0 1 11 0M16 11a2.5 2.5 0 1 0 0-5M16.5 14a4.5 4.5 0 0 1 4 5";
const CHECK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.2 12.3l2.6 2.6 5-5.4";

/** The day's key facts, as icon chips under the band's title. */
export const journeyFacts = (fromPrice: number) => [
  { icon: FEAT.onus, label: `From €${fromPrice} / day` },
  { icon: fic(PIN_PATH), label: "Door to door from Hurghada & Marsa Alam" },
  { icon: fic(PEOPLE), label: "Private · up to 4 guests" },
  { icon: FEAT.crowd, label: "Pickup & return up to 24 h either side" },
  { icon: fic(CHECK), label: "Confirmed within 24 h" },
];

export function buildJourneyCards(
  steps: readonly {
    time: string;
    label: string;
    subtitle?: string | null;
    image?: string | null;
    features?: readonly string[] | null;
  }[],
): ExperienceCardData[] {
  return steps
    .filter((s) => s.image)
    .map((s, i) => ({
      src: s.image as string,
      h: s.time,
      sub: s.subtitle || undefined,
      p: s.label,
      oneLine: true,
      num: String(i + 1).padStart(2, "0"),
      icon: ICONS.find(([re]) => re.test(s.time))?.[1],
      features: (s.features ?? []).filter(Boolean).map((label) => ({ icon: featureIcon(label), label })),
    }));
}
