import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import DayConfigurator, { type ExpSupplementTier } from "@/components/DayConfigurator";
import JsonLd from "@/components/JsonLd";
import GalleryMosaic from "@/components/GalleryMosaic";
import ValueStack from "@/components/ValueStack";
import ConsigliereSection from "@/components/ConsigliereSection";
import HeroShow, { type HeroShowItem } from "@/components/HeroShow";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ExperienceGrid from "@/components/ExperienceGrid";
import { DayCountProvider } from "@/components/DayCount";
import { reader } from "@/lib/keystatic-reader";
import { getFinalPriceMap } from "@/lib/pricing";
import { getSocialProof } from "@/lib/social-proof";
import { VALUE_LINES } from "@/lib/value-lines";
import styles from "./ConciergeDayPage.module.css";

export const metadata: Metadata = {
  title: "The Signature Concierge Day",
  description:
    "A private day in Luxor, timed before the crowds — your own Egyptologist, the Nile or the desert, and nothing for you to arrange. From €800.",
};

const EXPERIENCES = [
  {
    src: "/images/experiences/karnak-at-dawn-hero.jpg",
    h: "Karnak at dawn",
    p: "The great hypostyle hall before the crowds arrive — arranged privately.",
  },
  {
    src: "/images/experiences/valley-of-the-kings-hero.jpg",
    h: "Valley of the Kings",
    p: "The royal tombs, read for you by a licensed local guide.",
  },
  {
    src: "/images/experiences/felucca-sunset-sail-hero.jpg",
    h: "A private felucca at golden hour",
    p: "The river to yourself as the light turns — hosted by our local boatman.",
  },
  {
    src: "/images/experiences/private-desert-safari-hero.jpg",
    h: "A sunset picnic in the dunes",
    p: "A quiet table in the sand, set by our local host as the sun drops.",
  },
  {
    src: "/images/experiences/medinet-habu-hero.jpg",
    h: "Medinet Habu",
    p: "Our insider temple — colour still on the walls, almost nobody there. Yours from day one.",
  },
  {
    src: "/images/experiences/balloon-hero.jpg",
    h: "Hot-air balloon at dawn",
    p: "Float over Luxor at sunrise — we'll arrange it on request.",
  },
];

const BONUS_EXPERIENCES = [
  {
    src: "/images/experiences/deir-el-shelwit-hero.jpg",
    k: "Signature bonus ★",
    h: "Deir el-Shelwit — the hidden temple of Isis",
    p: "A near-secret Greco-Roman temple, its ceilings still deep with colour. On us.",
  },
  {
    src: "/images/experiences/luxor-by-night-hero.jpg",
    k: "After dark",
    h: "A night in Luxor city",
    p: "The souk, the lantern-lit Corniche, and hosts who actually know the place.",
  },
];

// Each concierge-day card is a real experience product. Keyed by the card's
// place name (survives reordering in Keystatic) so the card can show the
// product's poetic hero title + short description, link through to it, and play
// that product's signature hero clip on hover.
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
const SLUG_TO_CLIP: Record<string, { src: string; poster: string; position: string }> = {
  "karnak-at-dawn": cardClip("temple", "yoga", "50% 40%"),
  "valley-of-the-kings": cardClip("temple", "entering", "34% 45%"),
  "felucca-sunset-sail": cardClip("nile", "felucca", "30% 45%"),
  "private-desert-safari": cardClip("desert", "desert-camp", "36% 45%"),
  "medinet-habu": cardClip("temple", "table", "50% 50%"),
  "hot-air-balloon-luxor": cardClip("sky", "balloon", "68% 45%"),
  "deir-el-shelwit": cardClip("temple", "reading", "50% 45%"),
  "luxor-by-night": cardClip("nile", "dinner", "60% 45%"),
  "hatshepsut-temple": cardClip("temple", "entering", "34% 45%"),
  "nile-dinner-cruise": cardClip("nile", "dinner", "60% 45%"),
  "camel-bedouin-breakfast": cardClip("desert", "desert-stars", "46% 45%"),
};

// A custom line icon per experience, chosen to suit each one — shown on its card.
const ic = (children: ReactNode) => (
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const SLUG_TO_ICON: Record<string, ReactNode> = {
  // Karnak — a hypostyle temple facade
  "karnak-at-dawn": ic(
    <>
      <path d="M4 12 16 5l12 7" />
      <path d="M5 12h22" />
      <path d="M8.5 12v13M13.5 12v13M18.5 12v13M23.5 12v13" />
      <path d="M5 25h22" />
      <path d="M3 28h26" />
    </>,
  ),
  // Valley of the Kings — a tomb doorway cut into the mountain
  "valley-of-the-kings": ic(
    <>
      <path d="M3 27 16 7l13 20" />
      <path d="M13 27v-7h6v7" />
    </>,
  ),
  // Felucca — a lateen sail
  "felucca-sunset-sail": ic(
    <>
      <path d="M5 23h22l-3 4H8z" />
      <path d="M16 23V5" />
      <path d="M16 7 7 21h9z" />
    </>,
  ),
  // Desert safari — dunes under the stars
  "private-desert-safari": ic(
    <>
      <path d="M3 25c4-6 10-6 14 0" />
      <path d="M14 25c4-5 11-5 15 0" />
      <path d="M9 8.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" />
      <path d="M22 6l.75 1.7 1.7.75-1.7.75L22 10.9l-.75-1.7-1.7-.75 1.7-.75z" />
    </>,
  ),
  // Medinet Habu — a single ornate, painted column
  "medinet-habu": ic(
    <>
      <path d="M11 12q5-4 10 0" />
      <path d="M13 12v14M19 12v14" />
      <path d="M15.3 12v14M16.7 12v14" opacity="0.5" />
      <path d="M11 26h10" />
      <path d="M10 29h12" />
    </>,
  ),
  // Hot-air balloon
  "hot-air-balloon-luxor": ic(
    <>
      <ellipse cx="16" cy="12.5" rx="8" ry="9" />
      <path d="M16 3.5v18M11.2 5v14M20.8 5v14" opacity="0.5" />
      <path d="M11.5 19.5 13 24.5M20.5 19.5 19 24.5" />
      <path d="M13 24.5h6l-.7 3.4h-4.6z" />
    </>,
  ),
  // Deir el-Shelwit — a temple pylon gateway
  "deir-el-shelwit": ic(
    <>
      <path d="M4 27 6 10h4v17z" />
      <path d="M28 27 26 10h-4v17z" />
      <path d="M13 27V15h6v12" />
    </>,
  ),
  // Luxor by night — a crescent moon and a star
  "luxor-by-night": ic(
    <>
      <path d="M20 5a10 10 0 1 0 5 17 8 8 0 0 1-5-17z" />
      <path d="M9 8l.9 2.2 2.2.9-2.2.9L9 14.2l-.9-2.2-2.2-.9 2.2-.9z" />
    </>,
  ),
  // Hatshepsut — the terraced temple
  "hatshepsut-temple": ic(
    <>
      <path d="M3 28h26" />
      <path d="M6 28v-4h20M8.5 24v-4h15M11 20v-4h10" />
      <path d="M13.5 16v-3h5v3" />
    </>,
  ),
  // Nile dinner cruise — a decked boat on the water
  "nile-dinner-cruise": ic(
    <>
      <path d="M5 21h22l-3 4H8z" />
      <path d="M9 21v-6h14v6" />
      <path d="M12 15v-3h8v3" />
      <path d="M3 28c4-2 7-2 11 0s7 2 11 0" />
    </>,
  ),
  // Camel & Bedouin breakfast — a camel
  "camel-bedouin-breakfast": ic(
    <>
      <path d="M6 23c0-2 1.3-3.5 2.6-3.5S11 21 12.3 21s1.4-2.4 2.9-2.4 1.6 2 3 2l1.4-.3" />
      <path d="M19.6 20.3c1.7 0 2.4-1.5 2.4-3.7l1.9-1.6 1 1.4-1.7.9" />
      <path d="M6 23v4.5M10.5 22v5.5M15 22.5v5M19.6 20.3v7.2" />
    </>,
  ),
};

// Our signature experiences — marked with a seal on the card.
const SIGNATURE_SLUGS = new Set(["medinet-habu", "deir-el-shelwit"]);

const GALLERY = [
  { image: "/images/experiences/karnak-at-dawn-hero.jpg", caption: "Karnak, before the crowds" },
  { image: "/images/experiences/valley-of-the-kings-hero.jpg", caption: "Into the royal tombs" },
  { image: "/images/desert-stargazing-dune.jpg", caption: "The desert sky, far from everything" },
  { image: "/images/experiences/felucca-sunset-sail-hero.jpg", caption: "The Nile at golden hour" },
  { image: "/images/desert-dinner-table.jpg", caption: "A private table in the dunes" },
  { image: "/images/experiences/medinet-habu-hero.jpg", caption: "Colour still on the walls" },
  { image: "/images/experiences/balloon-hero.jpg", caption: "Dawn over Luxor" },
  { image: "/images/experiences/nile-dinner-cruise-hero.jpg", caption: "Dinner on the river" },
  { image: "/images/experiences/camel-bedouin-breakfast-hero.jpg", caption: "Breakfast at the desert's edge" },
];

const SECTION_FALLBACK = [
  "contrast",
  "mechanism",
  "dayFeel",
  "experiences",
  "consigliere",
  "builder",
  "valueStack",
  "socialProof",
  "guarantee",
  "scarcity",
  "gallery",
  "threshold",
  "finalCta",
  "multiDay",
  "faq",
];

export default async function ConciergeDayPage() {
  const [page, pricingRules, experiences, product, priceMap, socialProof, settings] = await Promise.all([
    reader.singletons.conciergeDayPage.read(),
    reader.singletons.pricingRules.read(),
    reader.collections.experiences.all(),
    reader.singletons.productPageSettings.read(),
    getFinalPriceMap(),
    getSocialProof(),
    reader.singletons.siteSettings.read(),
  ]);

  const FAQ_ITEMS = (page?.faq ?? []).map((f) => ({ q: f.question, a: f.answer }));

  // Reviews are shared with the product pages (edited once, in Keystatic). Shown
  // here too, gated the same way — sample reviews render with a note but emit no
  // structured data until reviewsVerified is switched on.
  const reviews = (product?.testimonials ?? []).filter((t) => t.quote && t.author);
  const reviewsVerified = product?.reviewsVerified ?? false;

  // Real single-experience prices, pulled from the live catalogue so the
  // "assemble it yourself" comparison always reflects what these actually cost.
  const priceBySlug = (slug: string) =>
    priceMap.get(slug) ?? experiences.find((e) => e.slug === slug)?.entry.basePrice ?? 0;

  // À-la-carte price map for the builder's "see full breakdown" — sourced from
  // the SAME live product prices, so the breakdown and the value-stack always
  // agree and update from Keystatic. Keys match the builder's plan wording
  // (substring match); order preserved. Pure services/add-ons that aren't
  // standalone catalogue products keep sensible fixed values.
  // Third element = estimate: not a standalone active à-la-carte product, so its
  // price is shown flagged "(estimate)" in the breakdown.
  const alaCartePrices: [string, number, boolean?][] = [
    ["Medinet", priceBySlug("medinet-habu")],
    ["Karnak", priceBySlug("karnak-at-dawn")],
    ["Hatshepsut", priceBySlug("hatshepsut-temple")],
    ["Luxor Temple", priceBySlug("luxor-temple")],
    ["Valley of the Kings", priceBySlug("valley-of-the-kings")],
    ["Deir el-Shelwit", priceBySlug("deir-el-shelwit")],
    ["Colossi", priceBySlug("colossi-of-memnon")],
    ["Valley of the Workers", priceBySlug("deir-el-medina")],
    ["felucca", priceBySlug("felucca-sunset-sail")],
    ["sail on the Nile", priceBySlug("felucca-sunset-sail")],
    ["Sunset sail", priceBySlug("felucca-sunset-sail")],
    ["picnic", priceBySlug("private-desert-safari")],
    ["choosing", priceBySlug("private-desert-safari")],
    ["Desert rally", priceBySlug("private-desert-safari")],
    ["night in Luxor", priceBySlug("luxor-by-night")],
    ["photoshoot", 120, true],
    ["balloon", priceBySlug("hot-air-balloon-luxor")],
    ["Sailing lesson", priceBySlug("sailing-lesson-nile")],
    // Egyptologist and private car/driver are deliberately NOT priced — they're
    // part of the "handled, priceless" layer, never a declared line-item cost.
    ["Hurghada", priceBySlug("hurghada-to-luxor-crossing")],
  ];

  // Brand titles for the signature experiences in the breakdown — the place name
  // stays the clear label, the poetic product title (e.g. "Begin where the world
  // began.") shows as a small italic subtitle. Services/add-ons stay plain.
  const brandBySlug = (slug: string) =>
    experiences.find((e) => e.slug === slug)?.entry.title ?? "";
  const alaCarteBrands: [string, string][] = [
    ["Medinet", brandBySlug("medinet-habu")],
    ["Karnak", brandBySlug("karnak-at-dawn")],
    ["Hatshepsut", brandBySlug("hatshepsut-temple")],
    ["Luxor Temple", brandBySlug("luxor-temple")],
    ["Valley of the Kings", brandBySlug("valley-of-the-kings")],
    ["Deir el-Shelwit", brandBySlug("deir-el-shelwit")],
    ["Valley of the Workers", brandBySlug("deir-el-medina")],
    ["Sunset sail", brandBySlug("felucca-sunset-sail")],
    ["sail on the Nile", brandBySlug("felucca-sunset-sail")],
    ["felucca", brandBySlug("felucca-sunset-sail")],
    ["night in Luxor", brandBySlug("luxor-by-night")],
    ["balloon", brandBySlug("hot-air-balloon-luxor")],
    ["Sailing lesson", brandBySlug("sailing-lesson-nile")],
  ];
  // Each experience's REAL per-guest supplement, from its own product — so the
  // à-la-carte breakdown prices the party exactly as the single-experience pages do.
  const supBySlug = (slug: string): ExpSupplementTier[] =>
    (experiences.find((e) => e.slug === slug)?.entry.groupSupplement ?? []).map((t) => ({
      minGuests: t.minGuests ?? 0,
      extraPerGuest: t.extraPerGuest ?? 0,
    }));
  const alaCarteSupplements: [string, ExpSupplementTier[]][] = [
    ["Medinet", supBySlug("medinet-habu")],
    ["Karnak", supBySlug("karnak-at-dawn")],
    ["Hatshepsut", supBySlug("hatshepsut-temple")],
    ["Luxor Temple", supBySlug("luxor-temple")],
    ["Valley of the Kings", supBySlug("valley-of-the-kings")],
    ["Deir el-Shelwit", supBySlug("deir-el-shelwit")],
    ["Colossi", supBySlug("colossi-of-memnon")],
    ["Valley of the Workers", supBySlug("deir-el-medina")],
    ["felucca", supBySlug("felucca-sunset-sail")],
    ["sail on the Nile", supBySlug("felucca-sunset-sail")],
    ["Sunset sail", supBySlug("felucca-sunset-sail")],
    ["picnic", supBySlug("private-desert-safari")],
    ["choosing", supBySlug("private-desert-safari")],
    ["Desert rally", supBySlug("private-desert-safari")],
    ["night in Luxor", supBySlug("luxor-by-night")],
    ["balloon", supBySlug("hot-air-balloon-luxor")],
    ["Sailing lesson", supBySlug("sailing-lesson-nile")],
    ["Hurghada", supBySlug("hurghada-to-luxor-crossing")],
  ];
  const named = (name: string, slug: string) => ({
    name,
    price: priceBySlug(slug),
    subtitle: brandBySlug(slug),
  });
  // A free signature bonus (counted like the builder: priced into the "assemble
  // it yourself" total, but not counted in the "N experiences" headline).
  const bonusOf = (name: string, slug: string) => ({ ...named(name, slug), bonus: true });
  // A counted experience with no standalone price (mirrors the builder's plan).
  const freeExp = (name: string, subtitle: string) => ({ name, price: 0, subtitle });
  // Mirrors the builder's "see full breakdown" (default Medinet journey) so the
  // price anchor and the checkout breakdown always compare the same products,
  // named the same and priced from the live catalogue.
  // [day 1, day-2 additions, day-3 additions, day-4 additions]
  const experiencePlan = [
    [
      named("Medinet Habu", "medinet-habu"),
      named("Hatshepsut Temple", "hatshepsut-temple"),
      named("Sunset sail on the Nile", "felucca-sunset-sail"),
    ],
    [
      named("Valley of the Kings", "valley-of-the-kings"),
      named("Karnak at dawn", "karnak-at-dawn"),
      named("Luxor Temple", "luxor-temple"),
      named("Desert sunset picnic", "private-desert-safari"),
    ],
    [
      named("Colossi of Memnon", "colossi-of-memnon"),
      named("A night in Luxor city", "luxor-by-night"),
      freeExp("Authentic local contacts", "Hosts, artisans & storytellers, introduced for you"),
      bonusOf("Deir el-Shelwit — hidden temple of Isis", "deir-el-shelwit"),
    ],
    [
      named("Valley of the Workers — Deir el-Medina", "deir-el-medina"),
      named("Hot-air balloon at dawn", "hot-air-balloon-luxor"),
      bonusOf("Sailing lesson on the Nile", "sailing-lesson-nile"),
    ],
  ];
  // "Everything handled for you" — shown as priceless/timeless value, never a
  // euro figure, so we never publish what a guide, guard or car actually costs.
  // The shared single-experience value lines lead, then the operational layer.
  const perDayServices = VALUE_LINES.map(([name, worth]) => ({ name, worth }));
  const oneOffServices = [
    { name: "A concierge managing every hour of it", worth: "priceless" },
    { name: "Temple guards opening doors a coach never gets", worth: "priceless" },
    { name: "Private air-conditioned car & driver", worth: "effortless" },
    { name: "Monument entries, timed before the crowds", worth: "seamless" },
    { name: "A licensed Egyptologist too, at the monuments", worth: "priceless" },
    { name: "Personal trip design & every reservation made", worth: "priceless" },
  ];

  // Images are CMS-editable via the Concierge Day page singleton, with the
  // original hardcoded sets kept as fallbacks so nothing breaks if a field is empty.
  const heroFromCms = (page?.heroImages ?? []).filter((s): s is string => !!s);
  const heroBgList =
    heroFromCms.length > 0
      ? heroFromCms
      : ["/images/nile-river-solo.jpg", "/images/west-bank-dawn.jpg", "/images/karnak-columns-detail.jpg"];
  const dreamImg = page?.dreamImage || "/images/karnak-columns-detail.jpg";

  // Cinematic hero: keep the static hero images in their order, but interleave
  // the brand film's short clips between them (same HeroShow logic, tint and
  // max-length playback as the individual product pages). Stargazing leads and
  // the stargazing/desert scenes recur; object-position centres each subject on
  // a tall mobile crop. A short run of clips tails the sequence before it loops.
  const dayClip = (src: string, poster: string, position: string) => ({
    type: "video" as const,
    src,
    poster,
    position,
  });
  const dayClips = {
    stargazing: dayClip("/videos/desert/desert-stars.mp4", "/videos/desert/desert-stars-poster.jpg", "46% 45%"),
    stargazing2: dayClip("/videos/desert/couple-stars.mp4", "/videos/desert/couple-stars-poster.jpg", "40% 46%"),
    desert: dayClip("/videos/desert/desert-camp.mp4", "/videos/desert/desert-camp-poster.jpg", "36% 45%"),
    felucca: dayClip("/videos/nile/felucca.mp4", "/videos/nile/felucca-poster.jpg", "30% 45%"),
    yoga: dayClip("/videos/temple/yoga.mp4", "/videos/temple/yoga-poster.jpg", "50% 40%"),
    table: dayClip("/videos/temple/table.mp4", "/videos/temple/table-poster.jpg", "50% 50%"),
    welcome: dayClip("/videos/temple/entering.mp4", "/videos/temple/entering-poster.jpg", "34% 45%"),
    drive: dayClip("/videos/temple/driven.mp4", "/videos/temple/driven-poster.jpg", "50% 45%"),
    desertPose: dayClip("/videos/desert/yoga.mp4", "/videos/desert/yoga-poster.jpg", "50% 40%"),
    balloon: dayClip("/videos/sky/balloon.mp4", "/videos/sky/balloon-poster.jpg", "68% 45%"),
    coupleBalloons: dayClip("/videos/sky/couple-balloons.mp4", "/videos/sky/couple-balloons-poster.jpg", "38% 45%"),
  };
  // One clip paired with each static image, leading on the stargazing scene;
  // any image past the list simply falls back to the desert yoga pose.
  // One clip per static image, strictly alternating image→clip so no two clips
  // ever play back-to-back — a run of clips overloads video decoding and the
  // last one freezes on its poster. The remaining motifs live in the gallery.
  const daySeq = [
    dayClips.stargazing,
    dayClips.felucca,
    dayClips.balloon,
    dayClips.desert,
    dayClips.yoga,
    dayClips.table,
    dayClips.welcome,
    dayClips.coupleBalloons,
  ];
  const heroMedia: HeroShowItem[] = [];
  heroBgList.forEach((src, i) => {
    heroMedia.push({ type: "image", src });
    heroMedia.push(daySeq[i] ?? dayClips.desertPose);
  });
  // Tail the remaining clips (the stargazing/desert repeats + the desert pose)
  // so every motif shows even when there are fewer images than clips.
  for (let j = heroBgList.length; j < daySeq.length; j++) heroMedia.push(daySeq[j]);
  const expEntryBySlug = new Map(experiences.map((e) => [e.slug, e.entry]));
  const expHref = (slug: string) => (slug === "medinet-habu" ? "/medinet-habu" : `/experiences/${slug}`);
  const rawExpCards =
    (page?.experiences ?? []).length > 0
      ? page!.experiences.map((e) => ({ src: e.image ?? "", h: e.title ?? "", p: e.description ?? "", k: e.badge || undefined }))
      : [...EXPERIENCES.map((e) => ({ ...e, k: undefined as string | undefined })), ...BONUS_EXPERIENCES];
  // Enrich each card with its product's poetic title, hook, link and hover clip.
  const expCards = rawExpCards.map((c) => {
    const slug = CARD_TO_SLUG[c.h];
    const entry = slug ? expEntryBySlug.get(slug) : undefined;
    const clip = slug ? SLUG_TO_CLIP[slug] : undefined;
    return {
      src: (entry?.heroImage as string | undefined) || c.src, // the product's own hero image
      h: (entry?.title as string | undefined) || c.h, // poetic hero title
      place: c.h, // place-name kicker
      p: (entry?.hook as string | undefined) || c.p, // brief description, from the product
      k: c.k,
      href: slug ? expHref(slug) : undefined,
      clip: clip?.src,
      clipPoster: clip?.poster,
      position: clip?.position,
      icon: slug ? SLUG_TO_ICON[slug] : undefined,
      signature: slug ? SIGNATURE_SLUGS.has(slug) : false,
    };
  });
  const baseGallery =
    (page?.gallery ?? []).length > 0
      ? page!.gallery.map((g) => ({ image: g.image ?? "", caption: g.caption }))
      : GALLERY;
  // All of the brand-film clips, spread through the photo mosaic as play-able
  // "Film" tiles — the gallery keeps every photo and adds every relevant clip,
  // so the fuller set shows once the mosaic is expanded.
  const galleryClips = [
    { video: "/videos/desert/desert-stars.mp4", poster: "/videos/desert/desert-stars-poster.jpg", caption: "Under the desert stars" },
    { video: "/videos/nile/felucca.mp4", poster: "/videos/nile/felucca-poster.jpg", caption: "Take the tiller on the Nile" },
    { video: "/videos/sky/balloon.mp4", poster: "/videos/sky/balloon-poster.jpg", caption: "Dawn over Luxor, from the air" },
    { video: "/videos/sky/couple-balloons.mp4", poster: "/videos/sky/couple-balloons-poster.jpg", caption: "The two of you, as the balloons rise" },
    { video: "/videos/desert/couple-stars.mp4", poster: "/videos/desert/couple-stars-poster.jpg", caption: "Two of you, under the Milky Way" },
    { video: "/videos/desert/desert-camp.mp4", poster: "/videos/desert/desert-camp-poster.jpg", caption: "A private table in the dunes" },
    { video: "/videos/temple/table.mp4", poster: "/videos/temple/table-poster.jpg", caption: "A hand-picked local table" },
    { video: "/videos/temple/yoga.mp4", poster: "/videos/temple/yoga-poster.jpg", caption: "Stillness, before the day begins" },
    { video: "/videos/temple/entering.mp4", poster: "/videos/temple/entering-poster.jpg", caption: "Walked in, before the crowds" },
    { video: "/videos/temple/driven.mp4", poster: "/videos/temple/driven-poster.jpg", caption: "The quiet drive out" },
    { video: "/videos/desert/yoga.mp4", poster: "/videos/desert/yoga-poster.jpg", caption: "A quiet moment in the sand" },
  ];
  const galleryItems: { image?: string; video?: string; poster?: string; caption?: string }[] = [];
  let gci = 0;
  baseGallery.forEach((img) => {
    galleryItems.push(img);
    if (gci < galleryClips.length) galleryItems.push(galleryClips[gci++]);
  });
  while (gci < galleryClips.length) galleryItems.push(galleryClips[gci++]);
  const builderImages = {
    journeyMedinet: page?.builderJourneyMedinetImage || undefined,
    journeyKarnak: page?.builderJourneyKarnakImage || undefined,
    journeyBalloon: page?.builderJourneyBalloonImage || undefined,
    sunsetNile: page?.builderSunsetNileImage || undefined,
    sunsetPicnic: page?.builderSunsetPicnicImage || undefined,
    sunsetCustom: page?.builderSunsetCustomImage || undefined,
  };

  // Section order + visibility come from Keystatic (drag to reorder there).
  const orderedFromCms = (page?.sections ?? [])
    .filter((s) => s.visible !== false && s.section)
    .map((s) => s.section as string);
  const orderedKeys = orderedFromCms.length > 0 ? orderedFromCms : SECTION_FALLBACK;

  const sectionMap: Record<string, ReactNode> = {
    contrast: (
      <section key="contrast" className={styles.problemDark}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">{page?.contrastEyebrow}</span>
          <h2 className="display">{page?.contrastTitle}</h2>
          {(page?.contrastLead ?? "")
            .split(/\n{2,}/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p className="lead" key={i} style={{ marginTop: i === 0 ? "1rem" : "0.9rem" }}>
                {para}
              </p>
            ))}
        </Reveal>
      </section>
    ),
    mechanism: (
      <section key="mechanism" className={styles.mech}>
        <Reveal className="wrap-narrow">
          <div className="center">
            <span className="eyebrow">{page?.mechanismEyebrow}</span>
            <h2 className="display">{page?.mechanismTitle}</h2>
          </div>
          <p className={styles.mechText}>{page?.mechanismText}</p>
          {page?.mechanismNote && <p className={styles.mechNote}>{page.mechanismNote}</p>}
        </Reveal>
      </section>
    ),
    dayShape: (
      <section key="dayShape" style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap-narrow">
          <div className="center" style={{ marginBottom: "1.4rem" }}>
            <span className="eyebrow">{page?.dayShapeEyebrow}</span>
            <h2 className="display">{page?.dayShapeTitle}</h2>
            <p className="lead" style={{ marginTop: ".9rem", maxWidth: "62ch", marginInline: "auto" }}>
              People can book the same temples and want completely different days. So instead of
              a timetable, Your concierge shapes the day around what you came for, and times each
              site to the hour it empties, until it feels, all day, like Luxor opened for you
              alone.
            </p>
          </div>
          <div className={styles.principles}>
            {(page?.dayShapeSteps ?? []).map((s, i) => (
              <div className={styles.prItem} key={s.time || i}>
                <h3 className={styles.prHead}>{s.time}</h3>
                <p className={styles.prBody}>{s.label}</p>
              </div>
            ))}
          </div>
          {page?.dayShapeNote && <p className={styles.tlNote}>{page.dayShapeNote}</p>}
        </Reveal>
      </section>
    ),
    // Merged "What your day feels like" (image) + "The feel of it" (phases) into
    // one graphic section — image on one side, the day's phases as a timeline on
    // the other. Less prose, more shape.
    dayFeel: (
      <section key="dayFeel" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <Reveal className={styles.dfGrid}>
            <div className={styles.dfImg}>
              <Image src={dreamImg} alt="" fill sizes="(max-width: 860px) 100vw, 46vw" />
            </div>
            <div className={styles.dfBody}>
              <span className="eyebrow">{page?.dayShapeEyebrow}</span>
              <h2 className="display">{page?.dayShapeTitle}</h2>
              <ol className={styles.timeline}>
                {(page?.dayShapeSteps ?? []).map((s, i) => (
                  <li className={styles.tlItem} key={s.time || i}>
                    <span className={styles.tlTime}>{s.time}</span>
                    <span className={styles.tlLabel}>{s.label}</span>
                  </li>
                ))}
              </ol>
              {page?.dayShapeNote && <p className={styles.tlNote}>{page.dayShapeNote}</p>}
            </div>
          </Reveal>
        </div>
      </section>
    ),
    // The person who runs the day — shared cover component with the product
    // pages, with the concierge-day "how it works" folded into the overlay.
    consigliere: (
      <ConsigliereSection
        key="consigliere"
        eyebrow={product?.consigliereEyebrow}
        title={product?.consigliereTitle ?? ""}
        lead={product?.consigliereLead}
        image={product?.consigliereImage || "/images/hosts/ahmed-nile-sunset.jpg"}
        points={(product?.consiglierePoints ?? []).map((p) => ({
          title: p.title,
          description: p.description,
        }))}
      />
    ),
    threshold: (
      <section key="threshold" className={styles.threshold}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">{page?.thresholdEyebrow}</span>
          <h2 className="display">{page?.thresholdTitle}</h2>
          <p className="lead" style={{ marginTop: ".9rem" }}>
            {page?.thresholdText}
          </p>
        </Reveal>
      </section>
    ),
    multiDay: (
      <section key="multiDay" className={styles.multiDay}>
        <div className={styles.multiDayBg}>
          <Image src="/images/experiences/felucca-sunset-sail-hero.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.multiDayScrim} />
        <Reveal className={`wrap-narrow center ${styles.multiDayIn}`}>
          <span className="eyebrow">{page?.multiDayEyebrow}</span>
          <h2 className="display">{page?.multiDayTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.multiDayText}
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link href={page?.multiDayCtaHref || "/private-guide"} className="btn btn-ghost btn-lg">
              {page?.multiDayCtaLabel || "Begin a conversation →"}
            </Link>
          </div>
        </Reveal>
      </section>
    ),
    // "What your day feels like" + "What your day can hold" merged into one:
    // the rewritten feel copy, then the experiences themselves as the proof of it.
    dream: (
      <section key="dream" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <Reveal className="center">
            <span className="eyebrow">What your Luxor Rising day can hold</span>
            <h2
              className="display"
              style={{ fontSize: "clamp(2.4rem, 5.2vw, 3.6rem)", lineHeight: 1.06, marginTop: ".5rem" }}
            >
              Unique experiences, woven into day you keep dreaming about
            </h2>
            <span className={styles.feelRule} aria-hidden />
            <p className={styles.feelLead}>
              More than a dozen experiences, composed in the one of the most magnetic and mystical
              places on earth. At the edge of the Sahara, in Luxor, Where the largest temple ever
              built still stands. It opens with the sunrise over the Nile, a car already waiting,
              and one concierge who holds the whole day from that first hour. You reach each place
              when it is best for You.
            </p>
            <p className="lead" style={{ marginTop: "1rem", maxWidth: "62ch", marginInline: "auto" }}>
              For many who come it becomes more than a trip: a homecoming, a quiet place to set a
              new direction, a way to mark an anniversary, a new chapter, a birthday that matters
              made into something you keep for a lifetime. These are the days we make for the people
              we love most. And if the first two hours don&apos;t feel different, the day is on us.
              But Luxor holds far more than one day can. Let us show you.
            </p>
          </Reveal>
        </div>
        <div className="wrap">
          <ExperienceGrid cards={expCards} initial={9} />
        </div>
      </section>
    ),
    howItWorks: (
      <section key="howItWorks" id="how">
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">How it works</span>
          <h2 className="display">You design it. We arrange everything.</h2>
          <div className="steps3">
            <div className="s3">
              <div className="num">01</div>
              <h4>You design your day</h4>
              <p>Tell us your date and shape your day — it takes a minute.</p>
            </div>
            <div className="s3">
              <div className="num">02</div>
              <h4>We arrange every detail</h4>
              <p>
                One concierge handles every hour — entries timed before the crowds, private
                transfer, and the temple guards who open doors a coach never gets. A licensed
                Egyptologist joins you at the monuments too.
              </p>
            </div>
            <div className="s3">
              <div className="num">03</div>
              <h4>You simply arrive</h4>
              <p>Your concierge is reachable all day. You experience Luxor; we handle the rest.</p>
            </div>
          </div>
          <div className="disclosure">
            Luxor Rising is your private concierge &amp; advisor. We arrange and coordinate;
            experiences, guiding and transfers are delivered by our licensed local partners. Each
            concierge day is a single day with no overnight stay.
          </div>
        </Reveal>
      </section>
    ),
    // Merged into the "dream" / "What your day feels like" position above.
    experiences: null,
    builder: (
      <section key="builder" id="design" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: "2.2rem" }}>
            <span className="eyebrow">Design your day</span>
            <h2 className="display">Shape it, see the price, reserve.</h2>
            <p className="lead" style={{ marginTop: ".6rem" }}>
              A minute to build. The more days you spend with us, the more we include — and the
              better the value.
            </p>
          </div>
          <DayConfigurator
            dayRate={pricingRules?.dayRate ?? 800}
            volumeDiscount={(pricingRules?.volumeDiscount ?? []).map((t) => ({
              minDays: t.minDays ?? 0,
              discountPercent: t.discountPercent ?? 0,
            }))}
            groupSupplement={(pricingRules?.groupSupplement ?? []).map((t) => ({
              minGuests: t.minGuests ?? 0,
              extraPerDay: t.extraPerDay ?? 0,
            }))}
            depositPercent={pricingRules?.depositPercent ?? 50}
            images={builderImages}
            priceTable={alaCartePrices}
            brandTable={alaCarteBrands}
            supplementTable={alaCarteSupplements}
            socialProof={socialProof}
            whatsappNumber={settings?.whatsappNumber || ""}
          />
        </div>
      </section>
    ),
    valueStack: (
      <section key="valueStack">
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">What&apos;s handled for you</span>
          <h2 className="display">
            A day that would cost you far more to assemble — if you even could.
          </h2>
          <p className="lead" style={{ marginTop: ".7rem" }}>
            Booked piece by piece — real prices from our own single experiences — a private
            journey like this adds up fast, and that&apos;s before the hours of planning, the
            language, and knowing who to trust. Choose how many days below and see it for yourself.
          </p>
        </Reveal>
        <ValueStack
          dayRate={pricingRules?.dayRate ?? 800}
          volumeDiscount={(pricingRules?.volumeDiscount ?? []).map((t) => ({
            minDays: t.minDays ?? 0,
            discountPercent: t.discountPercent ?? 0,
          }))}
          experiencePlan={experiencePlan}
          perDayServices={perDayServices}
          oneOffServices={oneOffServices}
        />
        <div className="center" style={{ marginTop: "2rem" }}>
          <Link href="#design" className="btn btn-primary btn-lg">
            Design your day →
          </Link>
        </div>
      </section>
    ),
    socialProof:
      reviews.length > 0 ? (
        <section key="socialProof" style={{ background: "var(--color-paper)" }}>
          <Reveal className="wrap center">
            <span className="eyebrow">From recent guests</span>
            <h2 className="display">The day they remember most.</h2>
            {!reviewsVerified && (
              <p className="muted" style={{ fontSize: ".74rem", marginTop: ".6rem" }}>
                Sample reviews — shown for layout only, to be replaced with real guest words.
              </p>
            )}
            <TestimonialsCarousel items={reviews} />
          </Reveal>
        </section>
      ) : null,
    guarantee: (
      <section key="guarantee" className={styles.guarantee}>
        <div className={styles.guaranteeBg}>
          <Image src="/images/medinet-habu-facade.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.guaranteeScrim} />
        <Reveal className={`wrap-narrow center ${styles.grInner}`}>
          <span className="eyebrow">The Luxor Rising promise</span>
          <h2 className="display">Your day, guaranteed — or we make it right.</h2>
          <div className={styles.grGrid}>
            <div className={styles.gr}>
              <h4>Love the first two hours, or it&apos;s free</h4>
              <p>Not different from any tour you&apos;ve taken? Say so before lunch, refunded in full.</p>
            </div>
            <div className={styles.gr}>
              <h4>Cancel freely</h4>
              <p>Full refund up to 7 days before. No questions, no fine print.</p>
            </div>
            <div className={styles.gr}>
              <h4>Pay your way</h4>
              <p>Pay in full, or a deposit now — the balance is charged automatically the day before.</p>
            </div>
          </div>
        </Reveal>
      </section>
    ),
    scarcity: (
      <section key="scarcity" className={styles.scarcity}>
        <div className="wrap-narrow">
          <div className={styles.scarBadge}>{page?.scarcityBadge}</div>
          <h2 className="display">{page?.scarcityTitle}</h2>
          <p className="lead" style={{ marginTop: ".9rem" }}>
            {page?.scarcityText}
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link href="#design" className="btn btn-primary btn-lg">
              Check your date →
            </Link>
          </div>
        </div>
      </section>
    ),
    gallery: (
      <section key="gallery">
        <div className="wrap center" style={{ marginBottom: ".5rem" }}>
          <span className="eyebrow">A glimpse of what waits</span>
          <h2 className="display">Moments from a Luxor Rising day</h2>
        </div>
        <div className="wrap">
          <GalleryMosaic items={galleryItems} />
        </div>
      </section>
    ),
    finalCta: (
      <section key="finalCta" className={styles.finalcta}>
        <div className={styles.finalBg}>
          <Image src="/images/experiences/karnak-at-dawn-hero.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.finalScrim} />
        <Reveal className={`wrap-narrow center ${styles.finalIn}`}>
          <span className="eyebrow">{page?.finalEyebrow}</span>
          <h2 className="display">{page?.finalTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.finalText}
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <Link href="#design" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
          </div>
          {/* The Luxor Rising promise, folded into the close as one guarantee section */}
          <div className={styles.finalGuarantee}>
            <span className={styles.finalGrEyebrow}>The Luxor Rising promise — or we make it right</span>
            <div className={styles.finalGrGrid}>
              <div className={styles.finalGr}>
                <h4>Love the first two hours, or it&apos;s free</h4>
                <p>Not different from any tour you&apos;ve taken? Say so before lunch, refunded in full.</p>
              </div>
              <div className={styles.finalGr}>
                <h4>Cancel freely</h4>
                <p>Full refund up to 7 days before. No questions, no fine print.</p>
              </div>
              <div className={styles.finalGr}>
                <h4>Pay your way</h4>
                <p>Pay in full, or a deposit now — the balance is charged automatically the day before.</p>
              </div>
            </div>
          </div>
          <p className={styles.finalFine}>
            7-day free cancellation · deposit or pay in full · a handful of days each week
          </p>
        </Reveal>
      </section>
    ),
    faq: (
      <section key="faq" id="faq">
        <div className="wrap-narrow center">
          <span className="eyebrow">Good to know</span>
          <h2 className="display">Questions, answered</h2>
        </div>
        <div className="wrap-narrow" style={{ paddingTop: 0 }}>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>
    ),
  };

  // Product/Service structured data for the money page. AggregateOffer carries
  // the honest "from €X" floor; no review markup here (see reviewsVerified).
  const conciergeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "The Signature Concierge Day",
    description:
      "A private day in Luxor, timed before the crowds — your own Egyptologist, the Nile or the desert, and nothing for you to arrange.",
    brand: { "@type": "Brand", name: "Luxor Rising" },
    image: "https://luxorrising.com/images/experiences/karnak-at-dawn-hero.jpg",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: page?.startingPrice ?? 800,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://luxorrising.com/concierge-day",
    },
  };

  return (
    <>
      <JsonLd data={conciergeJsonLd} />
      <Nav ctaHref="#design" ctaLabel="Design your day" />

      {/* HERO */}
      <section className={styles.phero}>
        <div className={styles.pheroBgs}>
          <HeroShow items={heroMedia} />
        </div>
        {/* HeroShow carries its own tint; this adds a light extra scrim on top
            for a middle darkness — darker than the tint alone, lighter than the
            old full scrim. */}
        <div className={styles.pheroScrim} style={{ opacity: 0.5 }} />
        <div className={`wrap ${styles.pheroContent}`}>
          <span className="eyebrow">{page?.heroEyebrow}</span>
          <h1 className="display">{page?.heroTitle}</h1>
          <div className={styles.oneline}>{page?.heroSubtitle}</div>
          <Link href="/reviews" className={styles.raterow} title="Read our reviews">
            <span className="stars">★ ★ ★ ★ ★</span> {socialProof} ↗
          </Link>
          <div className={styles.priceRow}>
            <span className="from">From</span>
            <span className="amt">€{page?.startingPrice ?? 800}</span>
            <span className="per">{page?.priceNote}</span>
          </div>
          <Link href="#design" className="btn btn-primary btn-lg">
            Design your day →
          </Link>
          <div className={styles.heroFacts}>
            <div className={styles.f}>
              <b>Zero</b>
              <span>Friction for you</span>
            </div>
            <div className={styles.f}>
              <b>≤4</b>
              <span>You &amp; your group</span>
            </div>
            <div className={styles.f}>
              <b>Local</b>
              <span>Licensed experts</span>
            </div>
            <div className={styles.f}>
              <b>7-day</b>
              <span>Free cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sections render in the order set in Keystatic. The builder and value
          stack both live inside one DayCountProvider so they share day count
          wherever they sit in the order. */}
      <DayCountProvider>{orderedKeys.map((k) => sectionMap[k]).filter(Boolean)}</DayCountProvider>

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
