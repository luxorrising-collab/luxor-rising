import { LIGHT_DAY_RATE, ORIGINAL_DAY_RATE } from "@/lib/pricing-math";
import type { ReactNode } from "react";
import type { ExperienceCardData } from "@/components/ExperienceGrid";

// ── Shared Design-Your-Day experience-card data ─────────────────────────────
// Used by the concierge-day gallery AND by the experience pages (each one now
// funnels into Design Your Day). Keyed by experience slug.

export type Tier = "Signature" | "Original" | "Adventure";

// Which Design-Your-Day packages include each experience — shown as the "Included"
// label plus (for the signature experiences) a "Signature experience" label.
const ALL: Tier[] = ["Signature", "Original", "Adventure"];
const ORIG: Tier[] = ["Signature", "Original"];
const SIG: Tier[] = ["Signature"];
export const SLUG_TO_TIERS: Record<string, Tier[]> = {
  // from Adventure (€330): in every day
  "karnak-at-dawn": ALL,
  "luxor-temple": ALL,
  "medinet-habu": ALL,
  "hatshepsut-temple": ALL,
  "felucca-sunset-sail": ALL,
  "hurghada-to-luxor-crossing": ALL,
  "deir-el-medina": ALL,
  "deir-el-shelwit": ALL,
  "ramesseum-valley-of-queens": ALL,
  "valley-of-the-kings": ALL,
  "camel-bedouin-breakfast": ALL,
  "reality-hunting": ALL,
  // from Original (€450)
  "luxor-by-night": ORIG,
  "banana-island-felucca": ORIG,
  "hot-air-balloon-luxor": ORIG,
  "nile-dinner-cruise": ORIG,
  "desert-astronomy-night": ORIG,
  // Signature only (€800)
  "private-desert-safari": SIG,
  "dendera-abydos": SIG,
  "sailing-lesson-nile": SIG,
};

/** The day rate each tier starts from (Adventure, Original, Signature). */
export const TIER_FROM: Record<Tier, number> = {
  Adventure: LIGHT_DAY_RATE,
  Original: ORIGINAL_DAY_RATE,
  Signature: 800,
};

/** The lowest day tier that includes this experience, and its "from" price. */
export function experienceFrom(slug: string): { tier: Tier; price: number } {
  const tiers = SLUG_TO_TIERS[slug] ?? ORIG;
  const tier: Tier = tiers.includes("Adventure") ? "Adventure" : tiers.includes("Original") ? "Original" : "Signature";
  return { tier, price: TIER_FROM[tier] };
}

// The signature experiences — marked with a "Signature experience" label.
export const SIGNATURE_SLUGS = new Set([
  "karnak-at-dawn",
  "private-desert-safari",
  "medinet-habu",
  "deir-el-shelwit",
  "felucca-sunset-sail",
  "hatshepsut-temple",
]);

// Small selling-point icons for the cards — a common one on every card (insider
// access) plus two to four picked per experience, so each card sells itself.
const fic = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const FEAT = {
  insider: fic(
    <>
      <circle cx="9" cy="12" r="3" />
      <path d="M12 12h9M18 12v3M21 12v2.5" />
    </>,
  ),
  dawn: fic(
    <>
      <circle cx="12" cy="13" r="3.4" />
      <path d="M12 4.5v2M4.5 13H2.5M21.5 13h-2M6 7 4.7 5.7M18 7l1.3-1.3M3 20h18" />
    </>,
  ),
  nile: fic(<path d="M3 8c3 2 6 2 9 0s6-2 9 0M3 13c3 2 6 2 9 0s6-2 9 0M3 18c3 2 6 2 9 0s6-2 9 0" />),
  desert: fic(
    <>
      <path d="M3 18c3-5 6-7 9-7s6 2 9 7" />
      <circle cx="8" cy="8" r="2" />
    </>,
  ),
  balloon: fic(
    <>
      <path d="M12 3a6 6 0 0 1 6 6c0 4-6 8-6 8s-6-4-6-8a6 6 0 0 1 6-6Z" />
      <path d="M10.5 20h3M11 17l-.6 3M13 17l.6 3" />
    </>,
  ),
  night: fic(<path d="M20 14a8 8 0 1 1-9-9 7 7 0 0 0 9 9Z" />),
  ticket: fic(
    <>
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M8 7v10" />
    </>,
  ),
  guide: fic(
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </>,
  ),
  temple: fic(
    <>
      <path d="M4 10 12 5l8 5" />
      <path d="M5 10h14M7 10v9M12 10v9M17 10v9M4 19h16" />
    </>,
  ),
  food: fic(<path d="M6 3v8M9 3v8M7.5 11v10M16 3c-1.8 1-3 4-3 7h3v11" />),
  crowd: fic(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>,
  ),
  onus: fic(<path d="M12 3l2.5 6.3 6.5.4-5 4.2 1.7 6.4L12 17l-5.7 3.5L8 14.1l-5-4.2 6.5-.4Z" />),
};
export type Feat = { icon: ReactNode; label: string };
const f = (icon: ReactNode, label: string): Feat => ({ icon, label });
const INSIDER = f(FEAT.insider, "Insider access");
export const SLUG_TO_FEATURES: Record<string, Feat[]> = {
  "karnak-at-dawn": [INSIDER, f(FEAT.dawn, "At dawn"), f(FEAT.guide, "Licensed guide"), f(FEAT.temple, "The great hall")],
  "valley-of-the-kings": [INSIDER, f(FEAT.ticket, "3 royal tombs"), f(FEAT.crowd, "Before the crowds"), f(FEAT.guide, "Licensed guide")],
  "felucca-sunset-sail": [INSIDER, f(FEAT.dawn, "Golden hour"), f(FEAT.nile, "On the Nile"), f(FEAT.guide, "Local boatman")],
  "private-desert-safari": [INSIDER, f(FEAT.food, "Sunset picnic"), f(FEAT.desert, "The dunes")],
  "medinet-habu": [INSIDER, f(FEAT.temple, "Colour on the walls"), f(FEAT.crowd, "Near-empty"), f(FEAT.guide, "Licensed guide")],
  "hot-air-balloon-luxor": [INSIDER, f(FEAT.dawn, "At dawn"), f(FEAT.balloon, "Aerial view")],
  "deir-el-shelwit": [INSIDER, f(FEAT.temple, "Near-secret temple"), f(FEAT.onus, "On us")],
  "luxor-by-night": [INSIDER, f(FEAT.night, "After dark"), f(FEAT.guide, "Local hosts")],
  "hatshepsut-temple": [INSIDER, f(FEAT.dawn, "First light"), f(FEAT.temple, "Cliff terraces"), f(FEAT.guide, "Licensed guide")],
  "nile-dinner-cruise": [INSIDER, f(FEAT.night, "After dark"), f(FEAT.food, "Private table"), f(FEAT.nile, "On the river")],
  "camel-bedouin-breakfast": [INSIDER, f(FEAT.dawn, "First light"), f(FEAT.food, "Bedouin breakfast"), f(FEAT.desert, "In the sand")],
};

// True when an experience is a Red-Sea / Hurghada (private-boat) product — these
// keep their own single-experience checkout and are left out of the Luxor funnel.
export const isRedSeaExperience = (slug: string, heroEyebrow?: string | null): boolean =>
  /hurghada|red[- ]?sea/i.test(`${heroEyebrow ?? ""} ${slug}`);

type ExpInput = {
  slug: string;
  entry: {
    heroImage?: unknown;
    title?: string | null;
    hook?: string | null;
    heroEyebrow?: string | null;
    isActive?: boolean | null;
  };
};

// ── The canonical Design-Your-Day gallery ───────────────────────────────────
// The curated set of experiences the funnel showcases, in order. Each card is
// enriched with the product's own hero image + poetic title + hook, a hover
// clip, a line icon, tier labels and selling-point chips. This exact builder is
// used by the concierge-day gallery AND by every experience page's slideshow,
// so the two always look identical.

// Where each experience links. Medinet has its own top-level page; the rest
// live under /experiences. (Kept here so every page funnels the same way.)
export const dydExpHref = (slug: string) =>
  slug === "medinet-habu" ? "/medinet-habu" : `/experiences/${slug}`;

// The curated cards, keyed by place name so a card survives reordering and maps
// to its product via CARD_TO_SLUG. Used only as the fallback when the Concierge
// Day page singleton has no experiences of its own.
const EXPERIENCES = [
  { src: "/images/experiences/karnak-at-dawn-hero.jpg", h: "Karnak at dawn", p: "The great hypostyle hall before the crowds arrive — arranged privately." },
  { src: "/images/experiences/valley-of-the-kings-hero.jpg", h: "Valley of the Kings", p: "The royal tombs, read for you by a licensed local guide." },
  { src: "/images/experiences/felucca-sunset-sail-hero.jpg", h: "A private felucca at golden hour", p: "The river to yourself as the light turns — hosted by our local boatman." },
  { src: "/images/experiences/private-desert-safari-hero.jpg", h: "A sunset picnic in the dunes", p: "A quiet table in the sand, set by our local host as the sun drops." },
  { src: "/images/experiences/medinet-habu-hero.jpg", h: "Medinet Habu", p: "Our insider temple — colour still on the walls, almost nobody there. Yours from day one." },
  { src: "/images/experiences/balloon-hero.jpg", h: "Hot-air balloon at dawn", p: "Float over Luxor at sunrise — we'll arrange it on request." },
];

const BONUS_EXPERIENCES = [
  { src: "/images/experiences/deir-el-shelwit-hero.jpg", k: "Signature bonus ★", h: "Deir el-Shelwit — the hidden temple of Isis", p: "A near-secret Greco-Roman temple, its ceilings still deep with colour. On us." },
  { src: "/images/experiences/luxor-by-night-hero.jpg", k: "After dark", h: "A night in Luxor city", p: "The souk, the lantern-lit Corniche, and hosts who actually know the place." },
];

type CmsExpCard = {
  image?: string | null;
  title?: string | null;
  description?: string | null;
  badge?: string | null;
};

// Place name → experience slug, so each card can pull its product's real hero
// image, poetic title, hook, link, hover clip and icon.
const CARD_TO_SLUG: Record<string, string> = {
  "Karnak at dawn": "karnak-at-dawn",
  "Valley of the Kings": "valley-of-the-kings",
  "A private felucca at golden hour": "felucca-sunset-sail",
  "A sunset picnic in the dunes": "private-desert-safari",
  "Medinet Habu": "medinet-habu",
  "Hot-air balloon at dawn": "hot-air-balloon-luxor",
  "Deir el-Shelwit — the hidden temple of Isis": "deir-el-shelwit",
  "A night in Luxor city": "luxor-by-night",
  "Hatshepsut at Deir el-Bahari": "hatshepsut-temple",
  "A private Nile dinner cruise": "nile-dinner-cruise",
  "Dawn camel ride & Bedouin breakfast": "camel-bedouin-breakfast",
};

const cardClip = (dir: string, name: string, position: string) => ({
  src: `/videos/${dir}/${name}.mp4`,
  poster: `/videos/${dir}/${name}-poster.jpg`,
  position,
});
// The single hero clip that plays when a card is hovered (cut from the brand film).
export const SLUG_TO_CLIP: Record<string, { src: string; poster: string; position: string }> = {
  "karnak-at-dawn": cardClip("temple", "yoga", "50% 40%"),
  "valley-of-the-kings": cardClip("temple", "entering", "34% 45%"),
  "felucca-sunset-sail": cardClip("nile", "felucca", "30% 45%"),
  "private-desert-safari": cardClip("desert", "desert-stars", "46% 45%"),
  "medinet-habu": cardClip("temple", "table", "50% 50%"),
  "hot-air-balloon-luxor": cardClip("sky", "balloon", "68% 45%"),
  "deir-el-shelwit": cardClip("temple", "reading", "50% 45%"),
  "luxor-by-night": cardClip("nile", "dinner", "60% 45%"),
  "hatshepsut-temple": cardClip("temple", "entering", "34% 45%"),
  "nile-dinner-cruise": cardClip("nile", "dinner", "60% 45%"),
  "camel-bedouin-breakfast": cardClip("desert", "desert-camp", "36% 45%"),
};

// A custom line icon per experience, chosen to suit each one — shown on its card.
const ic = (children: ReactNode) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const SLUG_TO_ICON: Record<string, ReactNode> = {
  "karnak-at-dawn": ic(
    <>
      <path d="M4 12 16 5l12 7" />
      <path d="M5 12h22" />
      <path d="M8.5 12v13M13.5 12v13M18.5 12v13M23.5 12v13" />
      <path d="M5 25h22" />
      <path d="M3 28h26" />
    </>,
  ),
  "valley-of-the-kings": ic(
    <>
      <path d="M3 27 16 7l13 20" />
      <path d="M13 27v-7h6v7" />
    </>,
  ),
  "felucca-sunset-sail": ic(
    <>
      <path d="M5 23h22l-3 4H8z" />
      <path d="M16 23V5" />
      <path d="M16 7 7 21h9z" />
    </>,
  ),
  "private-desert-safari": ic(
    <>
      <path d="M3 25c4-6 10-6 14 0" />
      <path d="M14 25c4-5 11-5 15 0" />
      <path d="M9 8.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" />
      <path d="M22 6l.75 1.7 1.7.75-1.7.75L22 10.9l-.75-1.7-1.7-.75 1.7-.75z" />
    </>,
  ),
  "medinet-habu": ic(
    <>
      <path d="M11 12q5-4 10 0" />
      <path d="M13 12v14M19 12v14" />
      <path d="M15.3 12v14M16.7 12v14" opacity="0.5" />
      <path d="M11 26h10" />
      <path d="M10 29h12" />
    </>,
  ),
  "hot-air-balloon-luxor": ic(
    <>
      <ellipse cx="16" cy="12.5" rx="8" ry="9" />
      <path d="M16 3.5v18M11.2 5v14M20.8 5v14" opacity="0.5" />
      <path d="M11.5 19.5 13 24.5M20.5 19.5 19 24.5" />
      <path d="M13 24.5h6l-.7 3.4h-4.6z" />
    </>,
  ),
  "deir-el-shelwit": ic(
    <>
      <path d="M4 27 6 10h4v17z" />
      <path d="M28 27 26 10h-4v17z" />
      <path d="M13 27V15h6v12" />
    </>,
  ),
  "luxor-by-night": ic(
    <>
      <path d="M20 5a10 10 0 1 0 5 17 8 8 0 0 1-5-17z" />
      <path d="M9 8l.9 2.2 2.2.9-2.2.9L9 14.2l-.9-2.2-2.2-.9 2.2-.9z" />
    </>,
  ),
  "hatshepsut-temple": ic(
    <>
      <path d="M3 28h26" />
      <path d="M6 28v-4h20M8.5 24v-4h15M11 20v-4h10" />
      <path d="M13.5 16v-3h5v3" />
    </>,
  ),
  "nile-dinner-cruise": ic(
    <>
      <path d="M5 21h22l-3 4H8z" />
      <path d="M9 21v-6h14v6" />
      <path d="M12 15v-3h8v3" />
      <path d="M3 28c4-2 7-2 11 0s7 2 11 0" />
    </>,
  ),
  "camel-bedouin-breakfast": ic(
    <>
      <path d="M6 23c0-2 1.3-3.5 2.6-3.5S11 21 12.3 21s1.4-2.4 2.9-2.4 1.6 2 3 2l1.4-.3" />
      <path d="M19.6 20.3c1.7 0 2.4-1.5 2.4-3.7l1.9-1.6 1 1.4-1.7.9" />
      <path d="M6 23v4.5M10.5 22v5.5M15 22.5v5M19.6 20.3v7.2" />
    </>,
  ),
};

/**
 * Build the canonical Design-Your-Day gallery cards. Pass the Concierge Day
 * page singleton's `experiences` (CMS-edited) to mirror exactly what that page
 * shows; when absent, the curated EXPERIENCES + BONUS fallback is used. Each
 * card is enriched from its live product (hero image, poetic title, hook) and
 * carries its hover clip, icon, tier labels and selling-point chips.
 */
export function buildConciergeDayCards(opts: {
  cmsExperiences?: readonly CmsExpCard[] | null;
  experiences: ExpInput[];
  expHref?: (slug: string) => string;
}): ExperienceCardData[] {
  const { cmsExperiences, experiences, expHref = dydExpHref } = opts;
  const expEntryBySlug = new Map(experiences.map((e) => [e.slug, e.entry]));
  const rawExpCards =
    (cmsExperiences ?? []).length > 0
      ? cmsExperiences!.map((e) => ({ src: e.image ?? "", h: e.title ?? "", p: e.description ?? "", k: e.badge || undefined }))
      : [...EXPERIENCES.map((e) => ({ ...e, k: undefined as string | undefined })), ...BONUS_EXPERIENCES];
  return rawExpCards.map((c) => {
    const slug = CARD_TO_SLUG[c.h];
    const entry = slug ? expEntryBySlug.get(slug) : undefined;
    const clip = slug ? SLUG_TO_CLIP[slug] : undefined;
    return {
      src: (entry?.heroImage as string | undefined) || c.src,
      h: (entry?.title as string | undefined) || c.h,
      place: c.h,
      p: (entry?.hook as string | undefined) || c.p,
      k: c.k,
      href: slug ? expHref(slug) : undefined,
      clip: clip?.src,
      clipPoster: clip?.poster,
      position: clip?.position,
      icon: slug ? SLUG_TO_ICON[slug] : undefined,
      signature: slug ? SIGNATURE_SLUGS.has(slug) : false,
      tiers: slug ? SLUG_TO_TIERS[slug] : undefined,
      features: slug ? SLUG_TO_FEATURES[slug] : undefined,
    };
  });
}

// Where each experience happens: a short, searchable location for cards and heroes.
const WEST_BANK_SLUGS = new Set([
  "medinet-habu",
  "hatshepsut-temple",
  "deir-el-medina",
  "deir-el-shelwit",
  "ramesseum-valley-of-queens",
  "valley-of-the-kings",
  "hot-air-balloon-luxor",
]);
const NILE_SLUGS = new Set(["felucca-sunset-sail", "banana-island-felucca", "nile-dinner-cruise", "sailing-lesson-nile"]);
const DESERT_SLUGS = new Set(["private-desert-safari", "desert-astronomy-night", "camel-bedouin-breakfast"]);
export function experienceWhere(slug: string): string {
  if (slug === "dendera-abydos") return "Dendera & Abydos, Egypt";
  if (slug === "hurghada-to-luxor-crossing") return "Hurghada to Luxor, Egypt";
  if (slug === "thirty-days-in-the-desert") return "Egyptian desert";
  if (WEST_BANK_SLUGS.has(slug)) return "Luxor's West Bank, Egypt";
  if (NILE_SLUGS.has(slug)) return "On the Nile, Luxor";
  if (DESERT_SLUGS.has(slug)) return "Luxor desert, Egypt";
  return "Luxor, Egypt";
}
