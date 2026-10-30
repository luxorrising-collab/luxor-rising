"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DayConfigurator.module.css";
import StickyBar from "./StickyBar";
import { GIFTS, giftsForDays } from "./GiftMarks";
import { useDayCount } from "./DayCount";
import { trackBeginCheckout } from "@/lib/analytics";
import { dayTotal, lightTotal, LIGHT_DAY_RATE, ORIGINAL_DAY_RATE, PHOTO_PRO } from "@/lib/pricing-math";

type DayCount = 1 | 2 | 3 | 4;
type SignatureJourney = "medinet" | "karnak" | "balloon";
// "light" = concierge-only (Adventure Light). "reality" = Reality Hunting, the
// business/land/investment day — bespoke, so it routes to the enquiry path
// (never Stripe checkout), the same way 5+ groups and 5+ days do.
type Journey = SignatureJourney | "light" | "reality" | "original";
type Pay = "full" | "deposit";

export type VolumeDiscountTier = { minDays: number; discountPercent: number };
export type GroupSupplementTier = { minGuests: number; extraPerDay: number };
// Per-guest supplement, as the single-experience products define it.
export type ExpSupplementTier = { minGuests: number; extraPerGuest: number };

// The sunset is no longer picked in the builder — the guest chooses it with the
// concierge. The plan still lists both, so the breakdown prices them.
const SUNSET_FIRST = "Sunset sail on the Nile — or the desert, chosen with your concierge";
const SUNSET_SECOND = "Desert sunset picnic — or the Nile again, as you prefer";

const JOURNEY: Record<
  Journey,
  { name: string; temple: string; companion: string }
> = {
  medinet: {
    name: "Initiation to power",
    temple: "Medinet Habu — your first temple",
    companion: "Hatshepsut Temple at Deir el-Bahari",
  },
  karnak: {
    name: "The Ancient Journey",
    temple: "Karnak at dawn — your first temple",
    companion: "Luxor Temple",
  },
  balloon: {
    name: "Fly like an eagle",
    temple: "Hot-air balloon at dawn — if you wish to rise with them",
    companion: "Then any experience of the Luxor Rising day, chosen as you go",
  },
  light: {
    name: "Adventure",
    temple: "Your concierge, on the ground all day",
    companion: "Planned with you — paid locally as you go",
  },
  reality: {
    name: "Reality Hunting",
    temple: "A full day given to your business",
    companion: "Introductions, access & an honest local read",
  },
  original: {
    name: "Original",
    temple: "Everything Luxor has to offer, in one day",
    companion: "All the temples & tombs, a felucca and the desert — entries included",
  },
};

// Three Signature journeys (the feeling leads) and the Consigliere. A short,
// grounded-but-evocative intro per journey; the shared facts live below so the
// cards stay clean.
const SIGNATURE_CARDS: { key: SignatureJourney; intro: string }[] = [
  {
    key: "medinet",
    intro:
      "Step into the temples of a king and a queen and begin something new. Medinet Habu at dawn, Hatshepsut by late morning, the Nile at sunset — a day to feel your own power.",
  },
  {
    key: "karnak",
    intro:
      "Stand in the greatest temple ever built as the sun comes up, then Luxor Temple — and end under the stars, with a private desert safari and dinner. A day of stillness and awe.",
  },
  {
    key: "balloon",
    intro:
      "Rise over Luxor by balloon at sunrise — then the best of everything Luxor offers, in any order you like.",
  },
];
// Each Signature day is the same promise; stated once, under the cards.
const SIGNATURE_META = "Door-to-door from the coast · 3 signature experiences · insider access · a gift";
const JOURNEY_NOTE =
  "Every Signature day is the full trip, door to door: we collect you from Hurghada, Marsa Alam or the coast, the private car stays with you throughout, and you're brought home at the end. Three hand-picked experiences in any order you like — temples and tombs, a desert sunset picnic or a felucca on the Nile — with your own concierge end to end, insider access and insider knowledge, and introductions to local contacts and businesses a coach never gets. Venture into the desert one day and go anywhere in range the next; just tell your concierge. The full journey holds all ten; add days to unlock more, with signature bonuses and a gift along the way.";
const CONSIGLIERE_INTRO =
  "No fixed plan — just your own person on the ground: a trusted driver, translator and fixer who opens doors and sorts everything on the spot. Your advisor on WhatsApp before you arrive; then go with the flow.";
const CONSIGLIERE_META = "One temple & a Nile sail · concierge all day · more paid locally";

// Reality Hunting — the business, land & investment day. Bespoke by nature, so
// it always routes to the private-proposal form, anchored at €350/day. The copy
// leans on access + discretion + an honest local read (the exact levers the big
// operators charge a fortune for), always framed straight — never bribery, and
// never a cut of the deal.
const REALITY_RATE = 350;
// Title / subtitle for the card (title is the product name; the subtitle is what
// the concierge actually does).
const REALITY_TITLE = "Reality Hunting";
const REALITY_SUBTITLE =
  "Your concierge opens the doors, the local contacts and the private, off-market opportunities almost no one else can reach.";
const REALITY_META = "A full day for business · introductions & private access";
const REALITY_INCLUDED = [
  "Collected door-to-door from Hurghada or Marsa Alam — included, with the private car on hand all day",
  "Your whole day aimed at the deal — we clear everything else so you never lose an hour to logistics",
  "The access the big firms sell for a fortune — except here it's a real local who holds the keys, not a number in a far-off office",
  "Introductions in person — owners, officials, lawyers and the people who actually decide",
  "Private, off-market opportunities — land and property that never reaches a listing (we hold some ourselves)",
  "A straight local read on every deal — what's real, what's worth it, what to walk away from",
  "Translation, paperwork and negotiation, handled on your side of the table",
  "Total discretion — your plans stay yours, start to finish",
];
const REALITY_LOCAL = [
  "Legal, notary and official fees are paid directly to the providers, at cost — never through us",
  "We open doors and advise you straight; we never pay bribes, and we never take a cut of your deal",
  "Every opportunity is yours to verify independently before you commit — and we'll help you do exactly that",
];

// Original — the full sightseeing day. Everything under our bar is included: the
// inexpensive temples & tombs, a private felucca and a desert trip, with all
// entries in the price. Bookable at a flat rate per day (1–4 guests).
const ORIGINAL_RATE = ORIGINAL_DAY_RATE;
const ORIGINAL_SUBTITLE =
  "Everything Luxor has to offer in one unhurried day — the great temples and tombs, a private felucca and the desert, every entry ticket included.";
const ORIGINAL_META = "All the sites · entries included · private felucca & desert";
const ORIGINAL_INCLUDED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — included, the car stays with you all day",
  "Every entry ticket included — no queues, no cash, nothing to carry",
  "East bank — Karnak, Luxor Temple, and the Luxor & Mummification museums",
  "West bank — the Valley of the Kings (three tombs), Hatshepsut, Medinet Habu, the Ramesseum, Deir el-Medina, the Valley of the Queens and the Colossi of Memnon",
  "A private felucca on the Nile at golden hour",
  "A trip out into the desert",
  "Your concierge end to end — driver, planner, translator & fixer, all day",
  "In any order you like, at the quiet hour for each — just tell your concierge",
];
const ORIGINAL_MORE = [
  "The premium tombs — Nefertari, Seti I (KV17) and Tutankhamun — are special tickets, added on request",
  "Want a private Egyptologist, the balloon, signature gifts and insider access? That's the Signature day above",
];

// The Signature day, unpacked — shown when a Signature journey is selected, so
// its full value reads at a glance and never looks thinner than the
// concierge-only options below it.
const SIGNATURE_INCLUDED = [
  "Door-to-door transfer from Hurghada, Marsa Alam or the coast — included in the price, and the private car stays with you the whole trip",
  "Insider access & insider knowledge at the signature temples — doors opened, the real stories, and introductions to local contacts and businesses a coach never gets",
  "A hot-air balloon at dawn — included (best on day two)",
  "A signature desert sunset picnic or a felucca sail on the Nile — included",
  "Temples and tombs in any order you like — venture into the desert one day, go anywhere in range the next; just tell your concierge",
  "Your own licensed Egyptologist, at the monuments — every day",
  "Every monument entry ticket — nothing to buy, queue for or carry",
  "A full meal and hand-picked local food & coffee stops — where locals actually eat",
  "Tips and everything in between handled — nothing to think about, just a memorable stay start to finish",
  "Your day photographed on your phone — sent the same day, not in six weeks",
  "One concierge end to end — planner, translator & fixer, on WhatsApp before you arrive and all day",
  "A signature gift, hand-picked & locally made, from your first full day",
  "First two hours, or your money back",
];
const SIGNATURE_UNLOCKS = [
  "More experiences unlock as you add days — venture further, to Aswan and beyond",
  "Signature bonuses on us — the hidden temple of Isis (day 3), a Nile sailing lesson (day 4)",
  "A second and third gift — the full set of three",
  "A private photoshoot of your day, from three days",
  "A better per-day price the longer you stay",
];

// A few headline inclusions shown on each product card's face, so the cards read
// as detailed products at a glance (the full lists live in each expansion).
const SIGNATURE_POINTS = [
  "Door-to-door transfer from the coast — included",
  "Private Egyptologist & insider access, every day",
  "Temples, tombs, a felucca or the desert — your choice",
  "Hot-air balloon, food stops, tips & a gift — included",
];
const ORIGINAL_POINTS = [
  "Door-to-door transfer from the coast — included",
  "Every temple & tomb entry ticket — included",
  "A private felucca and a desert trip — included",
  "Your concierge end to end, in any order you like",
];
const LIGHT_POINTS = [
  "Door-to-door transfer from the coast — included",
  "One temple of your choice & a Nile sail — included",
  "Your concierge on the ground all day",
  "Anything more, paid locally as you go",
];
const REALITY_POINTS = [
  "Door-to-door transfer from the coast — included",
  "Introductions to owners, officials & lawyers",
  "Private, off-market land & property",
  "Honest local advice — we take no cut of your deal",
];

// ── Line icons for the brochure, so every included line carries a symbol ──
const bic = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.expIco}
    aria-hidden
  >
    {children}
  </svg>
);
const IC = {
  car: bic(
    <>
      <path d="M3 13l1.8-4.6A2 2 0 0 1 6.7 7h10.6a2 2 0 0 1 1.9 1.4L21 13" />
      <path d="M3 13h18v4H3z" />
      <circle cx="7" cy="18.5" r="1.3" />
      <circle cx="17" cy="18.5" r="1.3" />
    </>,
  ),
  guide: bic(
    <>
      <circle cx="12" cy="8" r="3.1" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>,
  ),
  key: bic(
    <>
      <circle cx="8" cy="12" r="3" />
      <path d="M11 12h10M17 12v3M20.5 12v2" />
    </>,
  ),
  ticket: bic(
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>,
  ),
  sail: bic(
    <>
      <path d="M4 19h16l-2 2.2H6z" />
      <path d="M12 19V3.5" />
      <path d="M12 5 5 17h7z" />
    </>,
  ),
  desert: bic(
    <>
      <path d="M3 18c3-4 7-4 10 0" />
      <path d="M10 18c3-3 8-3 11 0" />
      <circle cx="7" cy="7" r="2.3" />
    </>,
  ),
  balloon: bic(
    <>
      <ellipse cx="12" cy="9" rx="5.4" ry="6" />
      <path d="M9.6 14 11 18M14.4 14 13 18" />
      <path d="M10.4 18h3.2l-.4 2.3h-2.4z" />
    </>,
  ),
  food: bic(
    <>
      <path d="M5 8h11a3 3 0 0 1 0 6h-1" />
      <path d="M5 8v6a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8" />
      <path d="M8 3v2M11.5 3v2" />
    </>,
  ),
  tips: bic(
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>,
  ),
  camera: bic(
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.1" />
      <path d="M8.5 7 10 5h4l1.5 2" />
    </>,
  ),
  gift: bic(
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9S9.5 4.5 7.7 6.2 12 9 12 9z M12 9s2.5-4.5 4.3-2.8S12 9 12 9z" />
    </>,
  ),
  shield: bic(
    <>
      <path d="M12 3l7 3v5c0 4.4-3 7.4-7 8.9C8 18.4 5 15.4 5 11V6z" />
      <path d="M9 12l2 2 4-4" />
    </>,
  ),
  chat: bic(
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>,
  ),
  temple: bic(
    <>
      <path d="M4 10 12 5l8 5" />
      <path d="M5 10h14" />
      <path d="M7 10v8M11 10v8M13 10v8M17 10v8" />
      <path d="M4 20h16" />
    </>,
  ),
  doc: bic(
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 12h6M9.5 15h6M9.5 18h3.5" />
    </>,
  ),
  check: bic(<path d="M5 12l4 4 10-10" />),
} as const;

// Pick a symbol for any inclusion line by what it names.
const iconFor = (t: string): ReactNode => {
  const s = t.toLowerCase();
  if (/transfer|door-to-door|coast|\bcar\b|collected/.test(s)) return IC.car;
  if (/egyptologist/.test(s)) return IC.guide;
  if (/insider access|\bdoors\b|contacts|introduction/.test(s)) return IC.key;
  if (/entry|entries|ticket/.test(s)) return IC.ticket;
  if (/felucca|nile/.test(s)) return IC.sail;
  if (/desert|sahara|dune/.test(s)) return IC.desert;
  if (/balloon/.test(s)) return IC.balloon;
  if (/food|coffee|meal|table|eat/.test(s)) return IC.food;
  if (/\btip|baksheesh/.test(s)) return IC.tips;
  if (/photograph|photo/.test(s)) return IC.camera;
  if (/gift/.test(s)) return IC.gift;
  if (/money back|cancellation|refund|verify|bribe|cut of|straight|honest/.test(s)) return IC.shield;
  if (/whatsapp|concierge|planner|fixer|sorted|arrange|hiccup/.test(s)) return IC.chat;
  if (/temple|tomb|valley|karnak|hatshepsut|medinet|site|order you like/.test(s)) return IC.temple;
  if (/lawyer|paperwork|notary|legal|\bdeal|business|property|\bland\b|opportunit|discretion/.test(s))
    return IC.doc;
  return IC.check;
};

// The experiences shown in each day's brochure (icon + name + a line).
const SIGNATURE_EXPS = [
  {
    icon: IC.temple,
    name: "Karnak & the great temples",
    desc: "The greatest temple ever built, at the quiet hour — read for you by your Egyptologist.",
  },
  {
    icon: IC.ticket,
    name: "The Valley of the Kings",
    desc: "Three royal tombs, chosen and read for you where the valley is still empty.",
  },
  {
    icon: IC.temple,
    name: "Medinet Habu & Hatshepsut",
    desc: "Our signature temple with colour still on the walls, and the terraces of the queen who ruled as king.",
  },
  {
    icon: IC.sail,
    name: "A private felucca — or the desert",
    desc: "Golden hour on the Nile, or a sunset picnic in the dunes. Your choice.",
  },
  {
    icon: IC.balloon,
    name: "A hot-air balloon at dawn",
    desc: "Float over the valley and the temples in the first light. Best on day two.",
  },
  {
    icon: IC.sail,
    name: "Aswan, Philae & the islands",
    desc: "A venture further south — the island temple of Isis and the Nile at its gentlest.",
  },
  {
    icon: IC.temple,
    name: "Dendera & Abydos",
    desc: "The best-preserved temple ceiling in Egypt, and the temple of Osiris beyond Luxor.",
  },
];
const ORIGINAL_EXPS = [
  {
    icon: IC.temple,
    name: "Karnak & Luxor Temple",
    desc: "The two great temples of the east bank, with the Luxor & Mummification museums.",
  },
  {
    icon: IC.ticket,
    name: "The Valley of the Kings",
    desc: "The general ticket — three royal tombs.",
  },
  {
    icon: IC.temple,
    name: "Hatshepsut, Medinet Habu & the Ramesseum",
    desc: "The finest temples of the west bank.",
  },
  {
    icon: IC.temple,
    name: "Queens, Workers & the Colossi",
    desc: "The Valley of the Queens, Deir el-Medina and the Colossi of Memnon.",
  },
  { icon: IC.sail, name: "A private felucca on the Nile", desc: "Golden hour on the water." },
  { icon: IC.desert, name: "A trip into the desert", desc: "Out past the fields, into the sand." },
];
// Adventure includes just these two experiences — shown in the same icon + line
// style as Signature and Original. (The Nile sail is a shared felucca, not private.)
const ADVENTURE_EXPS = [
  {
    icon: IC.temple,
    name: "One temple of your choice",
    desc: "Any one of Luxor's great temples — entry included, chosen with your concierge on the day.",
  },
  {
    icon: IC.sail,
    name: "A sail on the Nile",
    desc: "An hour on the water as the light turns, aboard a felucca with a local boatman.",
  },
];

// Shown in the "Also included" list of every bookable card — the local-access
// layer, stated honestly (no guarantee, no commission).
const INSIDER_CONTACTS =
  "Local business contacts & off-market opportunities — land, property, projects, local knowledge and lifelong contacts, introduced friend to friend";

// Operational inclusions for the brochure — kept separate from the experiences
// above, so nothing is said twice.
const SIGNATURE_HANDLED = [
  "Door-to-door transfer from Hurghada, Marsa Alam or the coast — the car stays with you",
  "Your own licensed Egyptologist, at the monuments — every day",
  "Insider access & knowledge — the doors most never reach and the real stories behind the walls",
  "A venture past the monuments — hidden spots in the desert and a sunset few ever see",
  "Staged moments on request — a proposal, an anniversary, a surprise timed to the light",
  "Every monument entry ticket — nothing to buy, queue for or carry",
  "A full meal and hand-picked local food & coffee stops — where locals actually eat",
  "Tips and everything in between, handled — nothing to think about",
  "Your day photographed on your phone — sent the same day",
  "Your concierge end to end — planner, translator & fixer, on WhatsApp from booking",
  "A signature gift, hand-picked & locally made, from your first full day",
  INSIDER_CONTACTS,
  "First two hours, or your money back",
];
const ORIGINAL_HANDLED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — the car stays with you all day",
  "Every entry ticket, in the price — no queues, no cash, nothing to carry",
  "A private Egyptologist & insider access at the sites",
  "Tips and the logistics handled — nothing to break the spell",
  "Your concierge end to end — driver, planner, translator & fixer, in any order you like",
  INSIDER_CONTACTS,
];

// The executive summary at the top of each brochure — a detailed read of what
// the day actually is and who it's for. Never a repeat of the card's own line.
const SIGNATURE_LEAD =
  "The full Luxor Rising day, arranged end to end for a trip that's meant to matter — an anniversary, a honeymoon, a milestone. A private Egyptologist and real insider access, every temple and tomb at its quietest, plus ventures beyond them: hidden desert spots, and a staged moment if you want one — a proposal timed to the light. Tips and logistics are carried underneath, so you just arrive. And quiet local introductions are there too, whenever you want them.";
const ORIGINAL_LEAD =
  "The complete sightseeing day — every great temple and tomb of both banks, a private felucca and a trip into the desert, with every entry ticket already in the price. A private Egyptologist reads each site for you at the hour it's quietest, with insider access along the way, and tips and the logistics are handled so you never break the spell to sort anything out. Done in whatever order you like.";
const LIGHT_LEAD =
  "Your own trusted person on the ground for the day — a driver, translator and fixer who knows Luxor from the inside. Insider access and local contacts where they count, tips and the small frictions handled, and the day shaped around you. We plan it together before you arrive; then you go with the flow and pay the local costs as you go, so it stays light and flexible — and the more days you take, the more of Luxor you can fit in.";
const REALITY_LEAD =
  "A full day aimed at one thing: making something real in Egypt. We open the doors, make the introductions in person, and give you a straight local read on every opportunity.";

const MORE_DAYS_MSG =
  "Five days or more — slower still, and shaped entirely around you. Your concierge sends a private proposal.";

// Adventure Light — your own person on the ground. Said plainly, so nobody
// arrives expecting the Signature day.
const LIGHT_INCLUDED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — included in the price, and the car stays with you all day",
  "Your own person on the ground — a trusted driver, translator and fixer all day",
  "Your planner on WhatsApp from the moment you book — the trip mapped out with you before you arrive",
  "Authentic local introductions — hosts, artisans & storytellers you'd never find on your own",
  "A hand-picked local food & coffee stop, on us — where locals actually eat, not the tourist cafés",
  "Tips & baksheesh handled by your concierge — no haggling, no awkward moments (you cover the tips; he sorts the rest)",
  "Anything that comes up, sorted on the spot — bookings, timings and the little hiccups",
  "Someone who knows the place — and gets you in, from temple doors to the best tables",
  "Tickets, queues and timings handled as you go",
  INSIDER_CONTACTS,
  "Still reachable after you fly home",
  "A small gift from your concierge",
];
const LIGHT_LOCAL = [
  "No experiences are booked in advance — bring local cash and pay as you go",
  "Entry tickets, the experiences you choose and your tips are paid locally, on the day — your concierge handles the how, so it's always smooth and fair",
  "We'll arrange what we can ahead of time, but some things depend on the day and on availability",
];

const ALT: Record<
  Journey,
  { temple: string; tsig: boolean; companion: string }
> = {
  medinet: {
    temple: "Karnak Temple at dawn",
    tsig: false,
    companion: "Luxor Temple",
  },
  karnak: {
    temple: "Medinet Habu — temple of Ramesses III",
    tsig: true,
    companion: "Hatshepsut Temple at Deir el-Bahari",
  },
  balloon: {
    temple: "Karnak Temple at dawn",
    tsig: false,
    companion: "Medinet Habu — temple of Ramesses III",
  },
  light: {
    temple: "",
    tsig: false,
    companion: "",
  },
  reality: {
    temple: "",
    tsig: false,
    companion: "",
  },
  original: {
    temple: "",
    tsig: false,
    companion: "",
  },
};
const IBMSG: Record<DayCount, string> = {
  1: "One day, done properly — three places, unhurried. Most guests who add a second day decide that after the first, not before.",
  2: "Two days, still unhurried. The second one is mostly quieter places and more time in each.",
  3: "Three days — the shape we'd choose ourselves, with two things added we think you'll remember.",
  4: "Four days, deliberately slower. Fewer things per day, not more.",
};
// A short, persuasive "feel" line over the card's hero shot — tuned to each day
// count, since the shape (and the case for it) changes as the day grows.
const FEEL: Record<DayCount, string> = {
  1: "One day, done properly — three places at their quietest, and the first temple yours at dawn.",
  2: "Two unhurried days — the Egypt everyone sees, then the quiet one almost no one does.",
  3: "The three days we'd choose ourselves — with two signature moments, on us.",
  4: "Four slow days — fewer things, far more time, Egypt entirely at your pace.",
};
const PRICE_TABLE: [string, number][] = [
  ["Medinet", 170],
  ["Karnak", 170],
  ["Hatshepsut", 150],
  ["Luxor Temple", 150],
  ["Valley of the Kings", 190],
  ["Deir el-Shelwit", 120],
  ["Colossi", 60],
  ["Valley of the Workers", 120],
  ["felucca", 140],
  ["sail on the Nile", 140],
  ["Sunset sail", 140],
  ["picnic", 150],
  ["choosing", 150],
  ["Desert rally", 160],
  ["night in Luxor", 130],
  ["photographer", 290],
  ["balloon", 230],
  ["Sailing lesson", 140],
  ["Egyptologist", 140],
  ["air-conditioned transfers", 90],
  ["Hurghada", 150],
];

function euro(n: number) {
  return "€" + n.toLocaleString("en-US");
}
// Card-style choices are divs — let Enter / Space pick them too.
function pickKey(e: React.KeyboardEvent, pick: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    pick();
  }
}
// A small − n + counter for the 5+ guests / 5+ days paths — easier than typing
// into a number field on a phone.
function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className={styles.stepper}>
      <span className={styles.stepperLbl}>{label}</span>
      <div className={styles.stepperCtl}>
        <button
          type="button"
          aria-label={`Fewer — ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          aria-label={`More — ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

// The journey "filling up" — experiences unlock as days are added. Shown on the
// day step and, larger, as the graphic in the booking summary.
function JourneyProgress({
  days,
  expCount,
  giftCount,
  bonusCount,
  moreDays = false,
  hero = false,
}: {
  days: number;
  expCount: number;
  giftCount: number;
  bonusCount: number;
  moreDays?: boolean;
  hero?: boolean;
}) {
  const pct = moreDays ? 100 : (days / 4) * 100;
  return (
    <div className={`${styles.prog} ${hero ? styles.progHero : ""}`}>
      <div className={styles.progTop}>
        <span className={styles.progNum}>
          <b>{moreDays ? "All" : expCount}</b>{" "}
          {!moreDays && expCount === 1 ? "experience" : "experiences"}
        </span>
        <span className={styles.progMeta}>
          {giftCount > 0 && `${giftCount} gift${giftCount > 1 ? "s" : ""} to keep`}
          {bonusCount > 0 && ` · ★ ${bonusCount} bonus${bonusCount > 1 ? "es" : ""} free`}
        </span>
      </div>
      <div className={styles.progTrack}>
        <div className={styles.progFill} style={{ width: pct + "%" }} />
        {[1, 2, 3, 4].map((d) => (
          <span
            key={d}
            className={`${styles.progNode} ${moreDays || days >= d ? styles.progOn : ""}`}
            style={{ left: ((d - 0.5) / 4) * 100 + "%" }}
          >
            <span className={styles.progDot} />
            <span className={styles.progLbl}>{d === 4 && moreDays ? "4+" : `${d}d`}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
// dayTotal / extraPerDay / discountForDays are imported from lib/pricing-math —
// the SAME functions the server uses to compute the authoritative price, so the
// figure shown here and the figure charged at checkout can never drift.
// The Design Your Day product's own saving: what the volume discount takes off
// the full multi-day price. Used uniformly for the day tiles and the gold pill.
function daySaving(
  d: DayCount,
  g: number,
  dayRate: number,
  volumeDiscount: VolumeDiscountTier[],
  groupSupplement: GroupSupplementTier[]
) {
  return (
    dayTotal(1, g, dayRate, volumeDiscount, groupSupplement) * d -
    dayTotal(d, g, dayRate, volumeDiscount, groupSupplement)
  );
}
function fmtDate(iso: string) {
  if (!iso) return "";
  const dt = new Date(iso + "T12:00:00");
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
function cancelDeadline(iso: string) {
  const dt = new Date(iso + "T12:00:00");
  dt.setDate(dt.getDate() - 7);
  if (dt < new Date()) return null;
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

type PlanItem =
  | string
  | {
      t: string;
      sig?: boolean;
      follows?: boolean;
      auto?: boolean;
      night?: boolean;
      local?: boolean;
      bonus?: boolean;
    };

function itemText(it: PlanItem) {
  return typeof it === "string" ? it : it.t;
}
function itemClasses(it: PlanItem) {
  if (typeof it === "string") return "";
  const c: string[] = [];
  if (it.follows) c.push(styles.follows);
  else {
    if (it.sig) c.push(styles.sig);
    if (it.night) c.push(styles.night);
    if (it.local) c.push(styles.local);
  }
  if (it.auto) c.push(styles.auto);
  return c.join(" ");
}

export type DayConfiguratorImages = {
  journeyMedinet?: string;
  journeyKarnak?: string;
  journeyBalloon?: string;
  journeyLight?: string;
  journeyReality?: string;
  journeyOriginal?: string;
  sunsetNile?: string;
  sunsetPicnic?: string;
  sunsetCustom?: string;
};

type DayConfiguratorProps = {
  dayRate?: number;
  volumeDiscount?: VolumeDiscountTier[];
  groupSupplement?: GroupSupplementTier[];
  depositPercent?: number;
  /** Adventure Light (concierge only) — flat rate per day for the group. */
  lightDayRate?: number;
  images?: DayConfiguratorImages;
  /** À-la-carte price map (substring → price) sourced from the live experience
   *  catalogue, so the breakdown matches real product prices. Falls back to the
   *  built-in table if not supplied. */
  priceTable?: [string, number, boolean?][];
  /** Brand titles (substring → poetic product title) for signature experiences,
   *  shown as a small italic subtitle under the place name in the breakdown. */
  brandTable?: [string, string][];
  /** Each experience's real per-guest supplement (substring → its groupSupplement),
   *  so the à-la-carte breakdown prices the party exactly like the product pages. */
  supplementTable?: [string, ExpSupplementTier[]][];
  /** Main social-proof line (from Site settings), shown next to ★★★★★. */
  socialProof?: string;
  /** WhatsApp number (from Site settings) for the "ask us" link. Falls back to
   *  the enquiry form when unset, so the CTA is never a dead link. */
  whatsappNumber?: string;
};

export default function DayConfigurator({
  dayRate = 450,
  volumeDiscount = [
    { minDays: 2, discountPercent: 10 },
    { minDays: 3, discountPercent: 20 },
    { minDays: 4, discountPercent: 30 },
  ],
  groupSupplement = [
    { minGuests: 2, extraPerDay: 160 },
    { minGuests: 3, extraPerDay: 160 },
    { minGuests: 4, extraPerDay: 160 },
  ],
  depositPercent = 50,
  lightDayRate = LIGHT_DAY_RATE,
  images = {},
  priceTable,
  brandTable,
  supplementTable,
  socialProof = "4.9 · 28+ private days arranged",
  whatsappNumber = "",
}: DayConfiguratorProps) {
  // Build the WhatsApp link from the configured number (digits only, no leading
  // 00). If none is set, the CTA points at the enquiry form — never a dead link.
  const waDigits = whatsappNumber.replace(/\D/g, "").replace(/^00/, "");
  const askHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent("Hi, I have a question about a concierge day")}`
    : "/private-guide#request";
  // Prices come from the live catalogue when supplied (keeps the breakdown in
  // sync with real product prices); the built-in table is only a fallback.
  const table = priceTable && priceTable.length ? priceTable : PRICE_TABLE;
  const priceOf = (nm: string) => {
    for (const [k, v] of table) if (nm.indexOf(k) >= 0) return v;
    return 0;
  };
  // The matching experience's own per-guest supplement, and the extra it adds
  // for a party of `g` (same formula the single-experience pages use).
  const supplementOf = (nm: string): ExpSupplementTier[] => {
    if (supplementTable) for (const [k, s] of supplementTable) if (nm.indexOf(k) >= 0) return s;
    return [];
  };
  const perGuestExtra = (g: number, supp: ExpSupplementTier[]) => {
    let s = 0;
    for (let i = 2; i <= g; i++) {
      const tier = supp.find((t) => t.minGuests === i);
      if (tier) s += tier.extraPerGuest;
    }
    return s;
  };
  // A price is an estimate when it isn't a standalone active à-la-carte product
  // (e.g. the Egyptologist, generic transfers, the photo add-on, a bonus).
  const estimateOf = (nm: string) => {
    for (const t of table) if (nm.indexOf(t[0]) >= 0) return Boolean(t[2]);
    return false;
  };
  const brandOf = (nm: string) => {
    for (const [k, v] of brandTable ?? []) if (v && nm.indexOf(k) >= 0) return v;
    return "";
  };
  const img = {
    journeyMedinet: images.journeyMedinet || "/images/desert-stargazing-dune.jpg",
    journeyKarnak: images.journeyKarnak || "/images/nile-felucca-table.jpg",
    journeyBalloon: images.journeyBalloon || "/images/experiences/balloon-hero.jpg",
    journeyLight:
      images.journeyLight || "/images/concierge-day/concierge-nile.jpg",
    // Accommodation image from the villas gallery — a terrace/balcony over the
    // Nile for the Reality Hunting day.
    journeyReality: images.journeyReality || "/images/villas/luxor-nile-terrace.jpg",
    // The iconic sightseeing shot for Original — Karnak at dawn.
    journeyOriginal: images.journeyOriginal || "/images/experiences/karnak-at-dawn-hero.jpg",
  };
  const journeyImg = (j: Journey) =>
    j === "medinet"
      ? img.journeyMedinet
      : j === "karnak"
        ? img.journeyKarnak
        : j === "balloon"
          ? img.journeyBalloon
          : j === "reality"
            ? img.journeyReality
            : j === "original"
              ? img.journeyOriginal
              : img.journeyLight;
  const { days, setDays } = useDayCount();
  const [group, setGroup] = useState(2);
  const [journey, setJourney] = useState<Journey>("medinet");
  // Which card's detail panel is open. Nothing is expanded until the guest taps a
  // card; selecting (for the booking summary) and expanding happen on that tap.
  const [expanded, setExpanded] = useState<"signature" | "original" | "light" | "reality" | null>(
    null,
  );
  const isLight = journey === "light";
  const isReality = journey === "reality";
  const isOriginal = journey === "original";
  // The "simple-card" family — no Signature 3-journey pick, no gift set, a flat
  // per-day price and a single fixed inclusion list: Adventure Light, Reality
  // Hunting and Original all render this way (Original is still bookable).
  const conc = isLight || isReality || isOriginal;
  // One agreed display name per card, used everywhere (no shape variants).
  const dayName = isOriginal
    ? "Original"
    : isLight
      ? "Adventure"
      : isReality
        ? "Reality Hunting"
        : "Signature";
  // Tap a card → select it for the summary AND toggle its detail panel.
  const pickCard = (key: "signature" | "original" | "light" | "reality", j: Journey) => {
    setJourney(j);
    setExpanded((prev) => (prev === key ? null : key));
  };
  // 5+ guests or 5+ days → a private proposal. The checkout column keeps its
  // look but turns into a short request form instead of a payment. Reality
  // Hunting is bespoke, so it always takes that same proposal path.
  const [bigGroup, setBigGroup] = useState(false);
  const [bigGroupCount, setBigGroupCount] = useState(6);
  const [moreDays, setMoreDays] = useState(false);
  const [moreDaysCount, setMoreDaysCount] = useState(5);
  const proposal = bigGroup || moreDays || isReality;
  const [eq, setEq] = useState({ name: "", email: "", phone: "", message: "" });
  const [eqSent, setEqSent] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [pay, setPay] = useState<Pay>("deposit");
  const [tripDate, setTripDate] = useState("");
  const [dateError, setDateError] = useState(false);
  const [bdOpen, setBdOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Mobile-phone photography is always included and free; the paid finishing
  // touch is a professional photographer/videographer (PHOTO_PRO — a flat
  // premium package, imported from lib/pricing-math so the server agrees).

  // End-to-end concierge transfer (Marsa Alam / Hurghada) is now INCLUDED in the
  // price on every Design Your Day variant — no longer a paid add-on. The only
  // paid finishing touch left is the professional photographer/videographer.
  function addonsCost() {
    let c = 0;
    if (photo) c += PHOTO_PRO;
    return c;
  }
  // Signature days scale by guests and get the volume discount; Adventure Light
  // is a flat concierge rate per day for the group.
  const baseTotal = (d: number) =>
    isReality
      ? REALITY_RATE * d
      : isOriginal
        ? dayTotal(d, group, ORIGINAL_RATE, volumeDiscount, groupSupplement)
        : conc
          ? lightTotal(d, group, lightDayRate)
          : dayTotal(d, group, dayRate, volumeDiscount, groupSupplement);
  const total = baseTotal(days) + addonsCost();

  // Signature gifts: one per full concierge day, up to the set of three. The
  // configurator shows exactly what the current day count unlocks, and nudges
  // toward completing the set. Adventure Light carries a single small gift.
  const giftCount = conc ? 0 : moreDays ? 3 : giftsForDays(days);
  const giftsLabel = conc ? "A gift" : `${giftCount} gift${giftCount > 1 ? "s" : ""}`;
  const giftMsg =
    giftCount >= 3
      ? "The full set — all three signature gifts, hand-picked and yours to keep."
      : giftCount === 2
        ? "Two gifts so far. Add a third day to complete the set with the Crown."
        : "The Sistrum is yours. Add a second day to unlock the Sceptre.";
  // The gold "Save" badge shows the Design Your Day product's own saving (the
  // multi-day volume discount, scaling with days + guests) — not the à-la-carte
  // comparison, which stays below as a separate angle.
  const dydSaving = isOriginal
    ? daySaving(days, group, ORIGINAL_RATE, volumeDiscount, groupSupplement)
    : conc
      ? 0
      : daySaving(days, group, dayRate, volumeDiscount, groupSupplement);
  const perPerson = Math.round(total / group);
  const deposit = Math.round((total * depositPercent) / 100);

  // The balance is auto-charged the day before, so a deposit only makes sense
  // when the date is at least ~2 days out. Closer than that → full payment only.
  const depositAllowed = useMemo(() => {
    if (!tripDate) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trip = new Date(`${tripDate}T00:00:00`);
    return Math.round((trip.getTime() - today.getTime()) / 86400000) >= 2;
  }, [tripDate]);
  useEffect(() => {
    if (!depositAllowed && pay === "deposit") setPay("full");
  }, [depositAllowed, pay]);

  const plan = useMemo(() => {
    const j = JOURNEY[journey];
    const a = ALT[journey];
    const gl = group + (group > 1 ? " guests" : " guest");
    if (journey === "light") {
      const extras: PlanItem[] = [];
      if (photo) extras.push("Private photographer / videographer for your day");
      return {
        start: [] as PlanItem[],
        startTitle: "Adventure · concierge only",
        pool: [] as PlanItem[],
        bonus: [] as PlanItem[],
        handled: [...extras, ...LIGHT_INCLUDED] as PlanItem[],
      };
    }
    if (journey === "reality") {
      const extras: PlanItem[] = [];
      if (photo) extras.push("Private photographer / videographer for your day");
      return {
        start: [] as PlanItem[],
        startTitle: "Reality Hunting · business day",
        pool: [] as PlanItem[],
        bonus: [] as PlanItem[],
        handled: [...extras, ...REALITY_INCLUDED] as PlanItem[],
      };
    }
    if (journey === "original") {
      const extras: PlanItem[] = [];
      if (photo) extras.push("Private photographer / videographer for your day");
      return {
        start: [] as PlanItem[],
        startTitle: "Original · the full day",
        pool: [] as PlanItem[],
        bonus: [] as PlanItem[],
        handled: [...extras, ...ORIGINAL_INCLUDED] as PlanItem[],
      };
    }
    const start: PlanItem[] = [];
    start.push({ t: j.temple, sig: journey === "medinet" });
    start.push({ t: j.companion, follows: true });
    start.push({ t: SUNSET_FIRST });
    if (photo) start.push("Private photographer / videographer for your day");

    const pool: PlanItem[] = [];
    const bonus: PlanItem[] = [];
    if (days >= 2) {
      pool.push("Valley of the Kings");
      pool.push({ t: a.temple, auto: true, sig: a.tsig });
      pool.push({ t: a.companion, auto: true });
      pool.push({ t: SUNSET_SECOND, auto: true });
    }
    if (days >= 3) {
      pool.push("Colossi of Memnon");
      pool.push({
        t: "A night in Luxor city — the souk & the lantern-lit Corniche",
        night: true,
      });
      pool.push({
        t: "Authentic local contacts — hosts, artisans & storytellers, introduced for you",
        local: true,
      });
      bonus.push({
        t: "Deir el-Shelwit — the hidden temple of Isis (€120), included",
        sig: true,
        bonus: true,
      });
    }
    if (days >= 4) {
      pool.push("Valley of the Workers — Deir el-Medina");
      if (journey !== "balloon") pool.push("Hot-air balloon at dawn over Luxor");
      bonus.push({
        t: "Sailing lesson on the Nile — take the tiller yourself (€140), included",
        sig: true,
        bonus: true,
      });
    }
    const handled: PlanItem[] = [];
    handled.push(
      "Door-to-door transfer from Hurghada, Marsa Alam or the coast — included, and the car stays with you the whole trip"
    );
    handled.push(
      "Insider access & insider knowledge — doors, the real stories, and introductions to local contacts & businesses"
    );
    handled.push("Your own licensed Egyptologist — every day");
    handled.push("All monument entry tickets for " + gl);
    handled.push("Temples & tombs in any order you like — or into the desert; just tell your concierge");
    handled.push("Private, air-conditioned transfers throughout");
    handled.push("Every reservation, timing & fast-track entry, planned for you");
    handled.push(
      "Your day photographed on your own phone — you'll have them before dinner, not in six weeks"
    );
    handled.push(
      "A full meal and up to three hand-picked local food & coffee stops a day — where locals actually eat"
    );
    handled.push(
      "The guards know us: nobody follows you, sells you anything, or asks for a tip"
    );
    if (days >= 4) handled.push("Upgraded VIP transfers on your unhurried days");
    handled.push("Your concierge on WhatsApp — before you arrive & all day");
    handled.push("Free cancellation up to 7 days before");

    return {
      start,
      startTitle: "Day 1 · Signature",
      pool,
      bonus,
      handled,
    };
  }, [journey, group, photo, days]);

  // Counts shown in the progress bar are derived from the actual itinerary, so
  // they can never drift from what's really included. Experiences = the touring
  // items (start + pool); signature bonuses = the free extras (Deir el-Shelwit
  // from day 3, Sailing lesson added on day 4).
  const expCount = plan.start.length + plan.pool.length;
  const sigbCount = plan.bonus.length;

  const priced: { nm: string; pr: number; bonus: boolean; brand: string; estimate: boolean }[] = [];
  let sepTotal = 0;
  [plan.start, plan.pool, plan.bonus, plan.handled].forEach((arr) => {
    arr.forEach((it) => {
      const nm = itemText(it);
      const base = priceOf(nm);
      if (base > 0) {
        // Booked separately, each experience adds its own real per-guest
        // supplement (the same figure its product page charges for a party).
        const pr = base + perGuestExtra(group, supplementOf(nm));
        const place = nm.split(" — ")[0];
        const brand = brandOf(nm);
        priced.push({
          nm: place,
          pr,
          bonus: typeof it === "object" && !!it.bonus,
          // Don't repeat the brand title when it's already the place label.
          brand: brand && brand.replace(/[.]$/, "") !== place ? brand : "",
          estimate: estimateOf(nm),
        });
        sepTotal += pr;
      }
    });
  });
  const showSavings = !conc && sepTotal > total;

  const glabel = group + (group > 1 ? " guests" : " guest");

  const medS = JOURNEY[journey].temple.split(" — ")[0];
  const compS = JOURNEY[journey].companion.split(" at ")[0].split(" — ")[0];

  const cancelText = tripDate
    ? (() => {
        const dl = cancelDeadline(tripDate);
        return dl
          ? "Free cancellation until " + dl + " — refunded, less any non-refundable bookings"
          : "";
      })()
    : "";

  // Earliest bookable date (tomorrow) — set on the element once it mounts, so
  // server and client render the same markup.
  const setMinDate = (el: HTMLInputElement | null) => {
    if (el) el.min = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  };

  // What the guest chose, in one line — sent with a booking or a proposal request.
  function configSummary() {
    const g = bigGroup ? bigGroupCount : group;
    const d = moreDays ? moreDaysCount : days;
    return [
      `${d} day${d > 1 ? "s" : ""}`,
      `${g} guest${g > 1 ? "s" : ""}`,
      isReality
        ? "Reality Hunting (business · land · investment)"
        : isOriginal
          ? "Original (the full sightseeing day — entries, felucca & desert included)"
          : isLight
            ? "Adventure (concierge only)"
            : "Signature (full guided day — insider access, Egyptologist, balloon & a gift)",
      conc ? "" : "Sunset: Nile or desert, chosen with the concierge",
      "Door-to-door transfer from the coast (Hurghada / Marsa Alam): included",
      photo ? "Add-on: private photographer / videographer" : "",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  async function handleProposal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setError("");
    setLoading(true);
    const g = bigGroup ? bigGroupCount : group;
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eq.name,
          email: eq.email,
          dates: tripDate ? `From ${fmtDate(tripDate)}` : "",
          group: `${g} guests`,
          message: [
            eq.message,
            `Design Your Day: ${configSummary()}`,
            eq.phone ? `WhatsApp: ${eq.phone}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
          topic: "concierge-day",
          company: String(new FormData(form).get("company") ?? ""),
        }),
      });
      if (res.ok) {
        setEqSent(true);
      } else {
        setError("We couldn't send that just now. Please try again, or write to us on WhatsApp.");
      }
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    }
    setLoading(false);
  }

  async function handleReserve(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    if (!tripDate) {
      setDateError(true);
      dateFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => dateInputRef.current?.focus(), 420);
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms and Cancellation Policy to continue.");
      return;
    }
    const name = isLight
      ? `${days}-day Adventure`
      : isOriginal
        ? `${days}-day Original`
        : `${days}-day Concierge Journey`;
    const slug = isLight
      ? `concierge-light-${days}d`
      : isOriginal
        ? `concierge-original-${days}d`
        : `concierge-day-${days}d`;
    const preferences = configSummary();
    trackBeginCheckout({
      value: total,
      currency: "EUR",
      items: [{ item_id: slug, item_name: name, price: total, quantity: group }],
    });
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          mode: pay,
          guests: group,
          photo,
          date: tripDate,
          cancelPath: "/concierge-day#build",
          preferences,
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      setError(data.error || "We couldn't open secure checkout just now. Please try again.");
    } catch {
      setError("We couldn't reach checkout. Please check your connection and try again.");
    }
    setLoading(false);
  }

  // The expansion hero — the exact graphic & hero detail of the checkout
  // summary (image + scrim + eyebrow + title + the gift marks), shown at the top
  // of a card's expansion so it reads like the final summary from the first look.
  const renderExpHero = (opts: { img: string; eyebrow: string; title: string; sub?: string }) => (
    <div className={styles.expHero}>
      <Image src={opts.img} alt="" fill sizes="(max-width: 820px) 100vw, 860px" className={styles.visHeroImg} />
      <span className={styles.visHeroScrim} aria-hidden />
      <div className={styles.visHeroCap}>
        <span className={styles.visEyebrow}>{opts.eyebrow}</span>
        <h4 className={styles.visJourney}>{opts.title}</h4>
        {opts.sub && <p className={styles.expHeroSub}>{opts.sub}</p>}
      </div>
      <div className={styles.visGifts}>
        {conc ? (
          <div className={styles.visGiftOne}>
            <span className={styles.visGiftOneMark} aria-hidden>
              ✦
            </span>
            <span>A gift from your concierge</span>
          </div>
        ) : (
          GIFTS.map((g) => {
            const on = g.day <= giftCount;
            return (
              <div
                key={g.key}
                className={`${styles.giftNode} ${on ? styles.giftNodeOn : styles.giftNodeOff}`}
              >
                <span className={styles.giftNodeHalo} aria-hidden />
                <g.Icon className={styles.giftNodeIco} />
                <span className={styles.giftNodeLabel}>
                  {on ? g.name.replace(/^The /, "") : `Day ${g.day}`}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // A card's expansion — the brochure. No hero or title (the card above is the
  // header), so it reads as one continuous card: a lead line, the experiences
  // included, everything handled, and any honest caveats — each with a symbol.
  const renderBrochure = (opts: {
    lead: string;
    experiences?: { icon: ReactNode; name: string; desc: string }[];
    expLede?: string;
    included: string[];
    caveats?: { label: string; items: string[] };
    note?: string;
  }) => (
    <div className={styles.expCard}>
      <div className={styles.expInner}>
        <p className={styles.expLead}>{opts.lead}</p>
        {opts.experiences && opts.experiences.length > 0 && (
          <div className={styles.expBlock}>
            <span className={styles.expEyebrow}>Experiences included</span>
            {opts.expLede && <p className={styles.expLede}>{opts.expLede}</p>}
            <ul className={styles.expExps}>
              {opts.experiences.map((e) => (
                <li key={e.name}>
                  <span className={styles.expExpIco}>{e.icon}</span>
                  <span className={styles.expExpTxt}>
                    <b>{e.name}</b>
                    <span>{e.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className={styles.expBlock}>
          <span className={styles.expEyebrow}>Also included</span>
          <ul className={styles.expInc}>
            {opts.included.map((t) => (
              <li key={t}>
                <span className={styles.expIncIco}>{iconFor(t)}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        {opts.caveats && opts.caveats.items.length > 0 && (
          <div className={styles.expBlock}>
            <span className={styles.expEyebrow}>{opts.caveats.label}</span>
            <ul className={`${styles.expInc} ${styles.expMuted}`}>
              {opts.caveats.items.map((t) => (
                <li key={t}>
                  <span className={styles.expIncIco}>{iconFor(t)}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {opts.note && <p className={styles.expNote}>{opts.note}</p>}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.cfgGrid}>
        <div>
          {/* Step 1: the feel of the day — the dream first, the logistics after */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>1</div>
              <h3>What should your day feel like?</h3>
            </div>
            <p className={styles.prefNote}>
              Three ways to spend the day. Tap any card to open exactly what&apos;s included.
            </p>

            {/* 1 · Signature — one card, no shape variants. Tap to open its dark
                detail panel in the checkout-summary style. */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={!conc}
              aria-label="Signature — a full guided day"
              className={`${styles.sigCard} ${styles.sigCardWide} ${!conc ? styles.sigOn : ""} ${
                expanded === "signature" ? styles.sigOpen : ""
              }`}
              onClick={() => pickCard("signature", "medinet")}
              onKeyDown={(e) => pickKey(e, () => pickCard("signature", "medinet"))}
            >
              <Image
                src={img.journeyMedinet}
                alt=""
                fill
                sizes="(max-width: 560px) 100vw, 860px"
                className={styles.sigImg}
              />
              <span className={styles.sigShade} aria-hidden />
              <div className={styles.sigTop}>
                <span className={styles.sigTier}>Full day · insider access</span>
                {!conc ? (
                  <span className={styles.sigChosen}>✓ Selected</span>
                ) : (
                  <span className={styles.sigSave}>See details ↓</span>
                )}
              </div>
              <div className={styles.sigBody}>
                <span className={styles.sigKicker}>End-to-end to Luxor</span>
                <h4 className={styles.sigPlace}>Signature</h4>
                <p className={styles.sigHook}>
                  A full guided day with nothing to arrange: door-to-door from the coast, a private
                  Egyptologist and insider access, the temples and tombs in the order you like, a
                  hot-air balloon at dawn, local food stops, tips handled, and a signature gift to
                  keep.
                </p>
                <ul className={styles.sigPoints}>
                  {SIGNATURE_POINTS.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <span className={styles.sigMeta}>{SIGNATURE_META}</span>
                <div className={styles.sigFoot}>
                  <span className={styles.sigPrice}>
                    <small>from</small> {euro(dayRate)}
                    <small>/day</small>
                  </span>
                  <span className={styles.sigNote}>transfer from the coast included</span>
                </div>
              </div>
            </div>

            {expanded === "signature" &&
              renderBrochure({
                lead: SIGNATURE_LEAD,
                experiences: SIGNATURE_EXPS,
                expLede:
                  "The best of what Luxor has to offer — you choose which to do each day, and add days to fit in more. One day covers the highlights; the full set unlocks across three to four.",
                included: SIGNATURE_HANDLED,
                caveats: { label: "As you add days", items: SIGNATURE_UNLOCKS },
                note: "Every experience is private and licensed-guided, arranged end to end — nothing is shared or off the shelf.",
              })}

            {/* 2 · Original — the full sightseeing day, entries included. */}
            <div className={styles.cardsOr}>
              <span>or</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isOriginal}
              aria-label="Original — the full sightseeing day, entries included"
              className={`${styles.sigCard} ${styles.sigCardWide} ${isOriginal ? styles.sigOn : ""} ${
                expanded === "original" ? styles.sigOpen : ""
              }`}
              onClick={() => pickCard("original", "original")}
              onKeyDown={(e) => pickKey(e, () => pickCard("original", "original"))}
            >
              <Image
                src={img.journeyOriginal}
                alt=""
                fill
                sizes="(max-width: 560px) 100vw, 860px"
                className={styles.sigImg}
              />
              <span className={styles.sigShade} aria-hidden />
              <div className={styles.sigTop}>
                <span className={styles.sigTier}>Full day · all the sights</span>
                {isOriginal ? (
                  <span className={styles.sigChosen}>✓ Selected</span>
                ) : (
                  <span className={styles.sigSave}>See details ↓</span>
                )}
              </div>
              <div className={styles.sigBody}>
                <span className={styles.sigKicker}>Entries included</span>
                <h4 className={styles.sigPlace}>Original</h4>
                <p className={styles.sigHook}>{ORIGINAL_SUBTITLE}</p>
                <ul className={styles.sigPoints}>
                  {ORIGINAL_POINTS.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <span className={styles.sigMeta}>{ORIGINAL_META}</span>
                <div className={styles.sigFoot}>
                  <span className={styles.sigPrice}>
                    <small>from</small> {euro(ORIGINAL_RATE)}
                    <small>/day</small>
                  </span>
                  <span className={styles.sigNote}>transfer from the coast included</span>
                </div>
              </div>
            </div>

            {expanded === "original" &&
              renderBrochure({
                lead: ORIGINAL_LEAD,
                experiences: ORIGINAL_EXPS,
                expLede:
                  "The best of Luxor's temples and tombs, every entry in the price — you choose the order, and add days to go slower and see more.",
                included: ORIGINAL_HANDLED,
                caveats: { label: "Added on request", items: ORIGINAL_MORE },
                note: "In any order you like, at the quiet hour for each — just tell your concierge.",
              })}

            {/* 3 · Adventure Light — concierge only, pay as you go. */}
            <div className={styles.cardsOr}>
              <span>or</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isLight}
              aria-label="Adventure — concierge only"
              className={`${styles.sigCard} ${styles.sigCardWide} ${isLight ? styles.sigOn : ""} ${
                expanded === "light" ? styles.sigOpen : ""
              }`}
              onClick={() => pickCard("light", "light")}
              onKeyDown={(e) => pickKey(e, () => pickCard("light", "light"))}
            >
              <Image
                src={img.journeyLight}
                alt=""
                fill
                sizes="(max-width: 560px) 100vw, 860px"
                className={styles.sigImg}
              />
              <span className={styles.sigShade} aria-hidden />
              <div className={styles.sigTop}>
                <span className={styles.sigTier}>Concierge only</span>
                {isLight ? (
                  <span className={styles.sigChosen}>✓ Selected</span>
                ) : (
                  <span className={styles.sigSave}>See details ↓</span>
                )}
              </div>
              <div className={styles.sigBody}>
                <span className={styles.sigKicker}>Temple &amp; sail included</span>
                <h4 className={styles.sigPlace}>Adventure</h4>
                <p className={styles.sigHook}>{CONSIGLIERE_INTRO}</p>
                <ul className={styles.sigPoints}>
                  {LIGHT_POINTS.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <span className={styles.sigMeta}>{CONSIGLIERE_META}</span>
                <div className={styles.sigFoot}>
                  <span className={styles.sigPrice}>
                    <small>from</small> {euro(lightDayRate)}
                    <small>/day</small>
                  </span>
                  <span className={styles.sigNote}>1–4 guests · local costs extra</span>
                </div>
              </div>
            </div>

            {expanded === "light" &&
              renderBrochure({
                lead: LIGHT_LEAD,
                experiences: ADVENTURE_EXPS,
                included: LIGHT_INCLUDED,
                caveats: { label: "Paid locally, on the day", items: LIGHT_LOCAL },
                note: "Go with the flow — tell us what you need, and we'll arrange it.",
              })}

            {/* 4 · Reality Hunting — business, land & investment. Hidden for now
                (kept in place to re-enable later); Signature/Original/Adventure
                already carry the local-contacts layer. */}
            {false && (
            <>
            <div className={styles.cardsOr}>
              <span>or</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isReality}
              aria-label="Reality Hunting — business, land and investment"
              className={`${styles.sigCard} ${styles.sigCardWide} ${isReality ? styles.sigOn : ""} ${
                expanded === "reality" ? styles.sigOpen : ""
              }`}
              onClick={() => pickCard("reality", "reality")}
              onKeyDown={(e) => pickKey(e, () => pickCard("reality", "reality"))}
            >
              <Image
                src={img.journeyReality}
                alt=""
                fill
                sizes="(max-width: 560px) 100vw, 860px"
                className={styles.sigImg}
              />
              <span className={styles.sigShade} aria-hidden />
              <div className={styles.sigTop}>
                <span className={styles.sigTier}>Business &amp; investment</span>
                {isReality ? (
                  <span className={styles.sigChosen}>✓ Selected</span>
                ) : (
                  <span className={styles.sigSave}>See details ↓</span>
                )}
              </div>
              <div className={styles.sigBody}>
                <span className={styles.sigKicker}>Private access</span>
                <h4 className={styles.sigPlace}>{REALITY_TITLE}</h4>
                <p className={styles.sigHook}>{REALITY_SUBTITLE}</p>
                <ul className={styles.sigPoints}>
                  {REALITY_POINTS.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <span className={styles.sigMeta}>{REALITY_META}</span>
                <div className={styles.sigFoot}>
                  <span className={styles.sigPrice}>
                    <small>from</small> {euro(REALITY_RATE)}
                    <small>/day</small>
                  </span>
                  <span className={styles.sigNote}>land · property · introductions</span>
                </div>
              </div>
            </div>

            {expanded === "reality" &&
              renderBrochure({
                lead: REALITY_LEAD,
                included: REALITY_INCLUDED,
                caveats: { label: "How it works", items: REALITY_LOCAL },
                note: "Tell your concierge what you're hunting for — we reply with a plan and the people to meet.",
              })}
            </>
            )}
          </div>

          {/* Step 2: who's coming — 5+ turns the checkout into a proposal request */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>2</div>
              <h3>Who&apos;s coming?</h3>
            </div>
            <div className={styles.grpOpts}>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={!bigGroup && group === g}
                  className={`${styles.grp} ${!bigGroup && group === g ? styles.sel : ""}`}
                  onClick={() => {
                    setGroup(g);
                    setBigGroup(false);
                  }}
                >
                  {g === 1 ? "Just me" : g === 2 ? "Two of us" : `${g} of us`}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={bigGroup}
                className={`${styles.grp} ${bigGroup ? styles.sel : ""}`}
                onClick={() => setBigGroup(true)}
              >
                5 or more
              </button>
            </div>
            {bigGroup && (
              <Stepper
                label="How many of you?"
                value={bigGroupCount}
                min={5}
                max={60}
                onChange={setBigGroupCount}
              />
            )}
            <div className={styles.grpNote}>
              {bigGroup
                ? "Groups of five or more are arranged personally — your checkout becomes a short request, and your concierge replies within 24 hours with a private proposal."
                : isReality
                  ? "Coming alone, or with partners, advisors or family? Add them — we'll shape the day around who's at the table."
                  : group > 1
                    ? `${euro(perPerson)} per person — adding guests lowers the per-person rate.${isLight ? " Local costs are extra." : ""}`
                    : isLight
                      ? "Travelling with others? Add them — the per-person rate drops. Local costs are paid on the day."
                      : "Travelling with your partner or friends? Add them — the per-person price drops."}
            </div>
          </div>

          {/* Step 3: how many days — 5+ also becomes a proposal */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>3</div>
              <h3>How many days with us?</h3>
            </div>
            <div className={styles.daysGrid}>
              {([1, 2, 3, 4] as DayCount[]).map((d) => {
                const sv =
                  isLight || isReality
                    ? 0
                    : daySaving(
                        d,
                        group,
                        isOriginal ? ORIGINAL_RATE : dayRate,
                        volumeDiscount,
                        groupSupplement,
                      );
                const on = !moreDays && days === d;
                return (
                  <button
                    type="button"
                    key={d}
                    aria-pressed={on}
                    className={`${styles.dayTile} ${on ? styles.sel : ""}`}
                    onClick={() => {
                      setDays(d);
                      setMoreDays(false);
                    }}
                  >
                    {d === 3 && !conc && <span className={styles.pop}>Most popular</span>}
                    <div className={styles.dn}>
                      {d} {d > 1 ? "days" : "day"}
                    </div>
                    <div className={styles.dp}>{euro(baseTotal(d))}</div>
                    <div className={styles.dsave}>
                      {!isLight && !isReality && sv > 0 ? "save " + euro(sv) : " "}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={moreDays}
                className={`${styles.dayTile} ${styles.dayTileMore} ${moreDays ? styles.sel : ""}`}
                onClick={() => {
                  setMoreDays(true);
                  setDays(4);
                }}
              >
                <div className={styles.dn}>5+ days</div>
                <div className={`${styles.dp} ${styles.dpWord}`}>Tailored</div>
                <div className={styles.dsave}>a private proposal</div>
              </button>
            </div>
            {moreDays && (
              <Stepper
                label="How many days?"
                value={moreDaysCount}
                min={5}
                max={30}
                onChange={setMoreDaysCount}
              />
            )}
            {conc ? (
              <div className={styles.grpNote}>
                {isReality
                  ? moreDays
                    ? "A longer engagement — we'll scope it with you and send a plan and a price."
                    : "Each day is a full day given to your business — book as many as the deal needs."
                  : moreDays
                    ? "A longer trip with your concierge — we'll plan it with you and send a proposal."
                    : "Each day: your concierge from pickup to the end of the day. Book as many as your trip needs."}
              </div>
            ) : (
              <div className={styles.daySummary}>
                <JourneyProgress
                  days={days}
                  expCount={expCount}
                  giftCount={giftCount}
                  bonusCount={sigbCount}
                  moreDays={moreDays}
                />
                <p className={styles.dayNoteMsg}>{moreDays ? MORE_DAYS_MSG : IBMSG[days]}</p>
              </div>
            )}
          </div>

          {/* Step 4: finishing touches */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>4</div>
              <h3>Add the finishing touches</h3>
            </div>
            <div className={styles.pref}>
              {!conc && (
                <div className={`${styles.addon} ${styles.sel}`} style={{ cursor: "default", marginBottom: ".6rem" }}>
                  <span className={styles.chk}>✓</span>
                  <div>
                    <b style={{ fontWeight: 500 }}>
                      Photographed on your phone, throughout
                    </b>
                    <div className="muted" style={{ fontSize: ".76rem" }}>
                      We capture your private moments as they happen and never leave
                      your side — sent the same day, in full beauty, as timeless
                      memories.
                    </div>
                  </div>
                  <span className={styles.ax}>Included</span>
                </div>
              )}
              <div
                className={`${styles.addon} ${photo ? styles.sel : ""}`}
                onClick={() => setPhoto((p) => !p)}
              >
                <span className={styles.chk}>✓</span>
                <div>
                  <b style={{ fontWeight: 500 }}>Private photographer or videographer</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    A professional captures your day — a vlog or film for social,
                    marketing and promo, shot at the locations and moments you
                    choose.
                  </div>
                </div>
                <span className={styles.ax}>+€{PHOTO_PRO}</span>
              </div>
              <div
                className={`${styles.addon} ${styles.sel}`}
                style={{ cursor: "default", marginTop: ".6rem" }}
              >
                <span className={styles.chk}>✓</span>
                <div>
                  <b style={{ fontWeight: 500 }}>End-to-end transfer from the coast</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    Coming from the sea? Your concierge collects you in Marsa Alam
                    or Hurghada and delivers you back, door to door — and the
                    private car stays with you for the whole stay, wherever the
                    days go. Included in your price, on every Design Your Day.
                  </div>
                </div>
                <span className={styles.ax}>Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The day comes together — a cinematic, full-bleed close: the designed
          day on the left, the checkout (or form) on the right. */}
      <div id="book" className={styles.bookCol}>
        <div className={styles.bookColBg} aria-hidden>
          <Image src={journeyImg(journey)} alt="" fill sizes="100vw" />
        </div>
        <div className={styles.bookColScrim} aria-hidden />
        <div className={styles.bookColInner}>
          <div className={styles.bookLead}>
            <span className={styles.bookEyebrow}>Your day</span>
            <h3 className={styles.bookTitle}>
              {proposal ? "Let's shape it together" : "Here's what you've designed"}
            </h3>
          </div>
          <div className={styles.bookGrid}>
            <div className={styles.bookVisual}>
            {/* a bigger hero keeps the emotion — and carries the presents, over the image */}
            <div className={styles.visHero}>
              <Image
                src={journeyImg(journey)}
                alt={dayName}
                fill
                sizes="(max-width: 820px) 100vw, 460px"
                className={styles.visHeroImg}
              />
              <span className={styles.visHeroScrim} aria-hidden />
              <div className={styles.visHeroCap}>
                <span className={styles.visEyebrow}>
                  {isReality
                    ? "Luxor Rising · Reality Hunting"
                    : isOriginal
                      ? "Luxor Rising · Original"
                      : isLight
                        ? "Luxor Rising · Concierge"
                        : "Luxor Rising · Signature day"}
                </span>
                <h4 className={styles.visJourney}>
                  {dayName}
                </h4>
              </div>
              {/* the presents, glowing over the image */}
              <div className={styles.visGifts}>
                {conc ? (
                  <div className={styles.visGiftOne}>
                    <span className={styles.visGiftOneMark} aria-hidden>
                      ✦
                    </span>
                    <span>A gift from your concierge</span>
                  </div>
                ) : (
                  GIFTS.map((g) => {
                    const on = g.day <= giftCount;
                    return (
                      <div
                        key={g.key}
                        className={`${styles.giftNode} ${on ? styles.giftNodeOn : styles.giftNodeOff}`}
                      >
                        <span className={styles.giftNodeHalo} aria-hidden />
                        <g.Icon className={styles.giftNodeIco} />
                        <span className={styles.giftNodeLabel}>
                          {on ? g.name.replace(/^The /, "") : `Day ${g.day}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <p className={styles.visFeel}>
              {isReality
                ? "A full day given to what you came to build — the right people, the right doors, and an honest local read on every opportunity."
                : isOriginal
                  ? "Everything Luxor is famous for in one unhurried day — the great temples and tombs, a felucca and the desert, every entry handled."
                  : isLight
                    ? "A trusted driver, translator and friend on the ground — everything handled on the spot."
                    : proposal
                      ? "The same Signature day, made to measure — shaped around your group, at your pace."
                      : FEEL[days]}
            </p>
            <p className={styles.visGiftLine}>
              {isReality ? (
                <>
                  We open the doors and sit on your side of the table — never taking a cut of your
                  deal.{" "}
                  <a href="#gifts" className={styles.inclLink}>
                    A gift to keep too →
                  </a>
                </>
              ) : isOriginal ? (
                <>
                  Every entry ticket, a private felucca and the desert — all in the price.{" "}
                  <a href="#gifts" className={styles.inclLink}>
                    A gift to keep too →
                  </a>
                </>
              ) : isLight ? (
                <>
                  The three signature gifts come with the Signature days.{" "}
                  <a href="#gifts" className={styles.inclLink}>
                    See them →
                  </a>
                </>
              ) : (
                <>
                  {giftMsg}{" "}
                  <a href="#gifts" className={styles.inclLink}>
                    See the gifts →
                  </a>
                </>
              )}
            </p>

            {!conc && (
              <JourneyProgress
                days={days}
                expCount={expCount}
                giftCount={giftCount}
                bonusCount={sigbCount}
                moreDays={moreDays}
                hero
              />
            )}
            <div className={styles.sumDetails}>
              <div className={styles.sumSub}>What&apos;s included</div>
              {isReality ? (
                <ul className={styles.sumIncl}>
                  <li>
                    <b>A full day for business</b>
                    <span>land, property or a company — your whole day given to it</span>
                  </li>
                  <li>
                    <b>Doors opened</b>
                    <span>owners, officials &amp; lawyers — the people who actually decide, met in person</span>
                  </li>
                  <li>
                    <b>Our own network</b>
                    <span>trusted local contacts, built over years on the ground</span>
                  </li>
                  <li>
                    <b>Off-market opportunities</b>
                    <span>land &amp; property that never reaches a listing — we hold some ourselves</span>
                  </li>
                </ul>
              ) : isOriginal ? (
                <ul className={styles.sumIncl}>
                  <li>
                    <b>Every entry ticket included</b>
                    <span>the great temples &amp; tombs of both banks — no queues, no cash</span>
                  </li>
                  <li>
                    <b>A private felucca &amp; the desert</b>
                    <span>golden hour on the Nile and a trip out into the sand</span>
                  </li>
                  <li>
                    <b>Door-to-door from the coast</b>
                    <span>collected from Hurghada or Marsa Alam — the car stays all day</span>
                  </li>
                  <li>
                    <b>Your concierge end to end</b>
                    <span>driver, planner, translator &amp; fixer — in any order you like</span>
                  </li>
                </ul>
              ) : isLight ? (
                <ul className={styles.sumIncl}>
                  <li>
                    <b>Your own person on the ground</b>
                    <span>trusted driver, translator, negotiator &amp; problem-solver, all day</span>
                  </li>
                  <li>
                    <b>Your advisor on WhatsApp</b>
                    <span>from the moment you book — the trip planned with you</span>
                  </li>
                  <li>
                    <b>Food stops, contacts &amp; tips sorted</b>
                    <span>a local table on us, authentic introductions, and your concierge handles the tipping</span>
                  </li>
                  <li>
                    <b>Paid locally, in cash</b>
                    <span>entry tickets, the experiences you choose &amp; your tips</span>
                  </li>
                </ul>
              ) : (
              <ul className={styles.sumIncl}>
                <li>
                  <b>Your own concierge, end to end</b>
                  <span>
                    driver, planner, translator &amp; fixer — on WhatsApp from booking, with you
                    all day (everything the concierge-only day gives, and more)
                  </span>
                </li>
                <li>
                  <b>Day 1 · Signature</b>
                  <span>
                    {journey === "balloon"
                      ? "Dawn over Luxor, then any experience of the day"
                      : `${medS} & ${compS}`}
                  </span>
                </li>
                <li>
                  <b>{expCount} experiences</b>
                  <span>arranged in any order with your concierge</span>
                </li>
                <li>
                  <b>
                    {giftCount} signature gift{giftCount > 1 ? "s" : ""} — yours to keep
                  </b>
                  <span>
                    hand-picked &amp; locally made, one per full day.{" "}
                    <a href="#gifts" className={styles.inclLink}>
                      See the gifts →
                    </a>
                  </span>
                </li>
                {plan.bonus.length > 0 && (
                  <li>
                    <b>
                      {plan.bonus.length} signature bonus{plan.bonus.length > 1 ? "es" : ""}
                    </b>
                    <span>on us — yours free</span>
                  </li>
                )}
                <li>
                  <b>Everything handled</b>
                  <span>Egyptologist, entries, transfers &amp; timing</span>
                </li>
              </ul>
              )}
              <button className={styles.sumMore} onClick={() => setListOpen((o) => !o)}>
                {listOpen
                  ? conc
                    ? "Hide the details"
                    : "Hide full itinerary"
                  : conc
                    ? "See the details"
                    : "See full itinerary"}{" "}
                <span>{listOpen ? "▴" : "▾"}</span>
              </button>
              <ul className={`${styles.sumList} ${listOpen ? styles.open : ""}`}>
                {plan.start.length > 0 && <li className={styles.dh}>{plan.startTitle}</li>}
                {plan.start.map((it, i) => (
                  <li key={"s" + i} className={itemClasses(it)}>
                    {itemText(it)}
                  </li>
                ))}
                {plan.pool.length > 0 && (
                  <>
                    <li className={styles.dh}>Your experiences · in any order</li>
                    {plan.pool.map((it, i) => (
                      <li key={"p" + i} className={itemClasses(it)}>
                        {itemText(it)}
                      </li>
                    ))}
                  </>
                )}
                {plan.bonus.length > 0 && (
                  <>
                    <li className={`${styles.dh} ${styles.dhBonus}`}>Signature bonuses · on us</li>
                    {plan.bonus.map((it, i) => (
                      <li key={"b" + i} className={itemClasses(it)}>
                        {itemText(it)}
                        {typeof it === "object" && it.bonus && (
                          <span className={styles.bpill}>bonus</span>
                        )}
                      </li>
                    ))}
                  </>
                )}
                <li className={styles.dh}>
                  {isReality
                    ? "Reality Hunting · what the day opens"
                    : isOriginal
                      ? "Original · what's included"
                      : isLight
                        ? "Adventure · included"
                        : "Handled for you, throughout"}
                </li>
                {plan.handled.map((it, i) => (
                  <li key={"h" + i} className={itemClasses(it)}>
                    {itemText(it)}
                  </li>
                ))}
                {isOriginal && (
                  <>
                    <li className={styles.dh}>The only extras</li>
                    {ORIGINAL_MORE.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </>
                )}
                {isLight && (
                  <>
                    <li className={styles.dh}>Paid locally, on the day</li>
                    {LIGHT_LOCAL.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                    <li>Tell us what you need — and we&apos;ll arrange it</li>
                  </>
                )}
                {isReality && (
                  <>
                    <li className={styles.dh}>How it works, honestly</li>
                    {REALITY_LOCAL.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                    <li>Tell us what you&apos;re hunting for — and we&apos;ll arrange it</li>
                  </>
                )}
              </ul>
              <a
                className={styles.sumAsk}
                href={askHref}
                {...(waDigits ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {waDigits ? "Questions? Ask us on WhatsApp →" : "Questions? Send us a note →"}
              </a>
            </div>
            </div>
            <div className={styles.summary}>
            {/* social proof — a high-ticket day needs trust up front */}
            <div className={styles.sumStars}>
              <span className={styles.stars}>★★★★★</span> {socialProof}
            </div>

            {/* 5+ guests or 5+ days: same card, but a short proposal request
                instead of a payment — the dream stays on screen above it */}
            {proposal ? (
              <div className={styles.prop}>
                {eqSent ? (
                  <div className={styles.propSent} role="status">
                    <span className={styles.propEyebrow}>Request received</span>
                    <h4 className={styles.propTitle}>
                      Thank you{eq.name ? `, ${eq.name.trim().split(" ")[0]}` : ""}.
                    </h4>
                    <p className={styles.propText}>
                      Your concierge will read this personally and reply within 24 hours with a
                      proposal shaped around{" "}
                      {bigGroup ? `your group of ${bigGroupCount}` : "you"}
                      {moreDays ? ` and your ${moreDaysCount} days` : ""}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleProposal} noValidate>
                    <span className={styles.propEyebrow}>
                      {isReality ? "Your private plan" : "Your private proposal"}
                    </span>
                    <h4 className={styles.propTitle}>
                      {isReality && !bigGroup && !moreDays
                        ? "Let's make it real"
                        : bigGroup && moreDays
                          ? `${bigGroupCount} of you, ${moreDaysCount} days`
                          : bigGroup
                            ? `A day for ${bigGroupCount} of you`
                            : `${moreDaysCount} days in Luxor`}
                    </h4>
                    <p className={styles.propText}>
                      {isReality
                        ? "Reality Hunting is where our concierge earns his name. Tell us what you're here to do — buy land, open a business, close a deal — and you'll get a plan, the people to meet, and the private, off-market opportunities we're already holding. From €350 a day, and worth many times that in the right door opened."
                        : `Larger groups and longer journeys are shaped personally — ${
                            isLight ? "the same concierge" : `the same ${dayName} day`
                          }, arranged around you. Tell us where to reach you; your concierge replies with a proposal and a price.`}
                    </p>
                    {/* Honeypot: hidden from people, catches bots. */}
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
                    />
                    <div className={styles.propFields}>
                      <input
                        className={styles.propInput}
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        aria-label="Your name"
                        value={eq.name}
                        onChange={(e) => setEq({ ...eq, name: e.target.value })}
                      />
                      <input
                        className={styles.propInput}
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Email"
                        aria-label="Email"
                        value={eq.email}
                        onChange={(e) => setEq({ ...eq, email: e.target.value })}
                      />
                      <input
                        className={styles.propInput}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="WhatsApp (optional)"
                        aria-label="WhatsApp number (optional)"
                        value={eq.phone}
                        onChange={(e) => setEq({ ...eq, phone: e.target.value })}
                      />
                    </div>
                    <div className={styles.sumSubRow}>
                      <span className={styles.sumSub}>Your first day</span>
                      <span className={styles.sumScar}>Flexible is fine</span>
                    </div>
                    <div className={styles.sumDate}>
                      <input
                        type="date"
                        ref={setMinDate}
                        aria-label="Your first day"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                      />
                    </div>
                    <textarea
                      className={`${styles.propInput} ${styles.propMsg}`}
                      name="message"
                      rows={3}
                      placeholder="Anything we should know — an occasion, ages, how you like to travel"
                      aria-label="Anything we should know"
                      value={eq.message}
                      onChange={(e) => setEq({ ...eq, message: e.target.value })}
                    />
                    <button
                      type="submit"
                      className={`btn btn-primary ${styles.sumBtn}`}
                      aria-disabled={loading}
                    >
                      {loading ? "Sending…" : "Request my private proposal →"}
                    </button>
                    {error && (
                      <div role="alert" className={styles.sumCancel} style={{ color: "#9a2b2b" }}>
                        {error}
                      </div>
                    )}
                    <div className={styles.sumReassure2}>
                      <div className={styles.rrow}>
                        <span className={styles.ric} aria-hidden>✓</span>
                        <span>No payment now, and no obligation</span>
                      </div>
                      <div className={styles.rrow}>
                        <span className={styles.ric} aria-hidden>⏱</span>
                        <span>A personal reply within 24 hours</span>
                      </div>
                      <div className={`${styles.rrow} ${styles.rrowGuar}`}>
                        <span className={styles.ric} aria-hidden>🛡</span>
                        <span>
                          {isReality
                            ? "Honest advice and real access — and we never take a cut of your deal"
                            : isLight
                              ? "The same concierge, and the same care"
                              : "The same Signature day, gifts and promise — first two hours, or your money back"}
                        </span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : (
            <>
            {/* price — named so the figure always reads in context */}
            <div className={styles.sumForline}>
              {dayName} · {days === 1 ? "1 day" : `${days} days`} · {glabel}
            </div>
            <div className={styles.sumPriceblock}>
              <div className={styles.sumPrice}>{euro(total)}</div>
              {dydSaving > 0 && (
                <span className={styles.sumSavepill}>Save {euro(dydSaving)}</span>
              )}
            </div>
            <div className={styles.sumAllin}>
              {isLight
                ? "Transfer, concierge, one temple & a Nile sail included · more paid locally"
                : "All-in · no hidden extras"}
            </div>
            {group > 1 && (
              <div className={styles.sumPp}>
                {euro(perPerson)} per person · {glabel}
              </div>
            )}
            {showSavings && (
              <div className={styles.sumAnchor}>
                <s>{euro(sepTotal)}</s> if you booked each separately{" "}
                <button className={styles.bdToggle} onClick={() => setBdOpen((o) => !o)}>
                  {bdOpen ? "hide breakdown ▴" : "see breakdown ▾"}
                </button>
              </div>
            )}
            {showSavings && (
              <div className={`${styles.sumBd} ${bdOpen ? styles.open : ""}`}>
                {priced.map((x, i) => (
                  <div className={styles.bdRow} key={i}>
                    <span className={styles.bdName}>
                      <span>
                        {x.nm}
                        {x.bonus && <em>bonus</em>}
                      </span>
                      {x.brand && <span className={styles.bdBrand}>{x.brand}</span>}
                    </span>
                    <span>
                      {euro(x.pr)}
                      {x.estimate && (
                        <em style={{ marginLeft: ".35em", opacity: 0.6, fontStyle: "italic", fontWeight: 400 }}>
                          (estimate)
                        </em>
                      )}
                    </span>
                  </div>
                ))}
                <div className={`${styles.bdRow} ${styles.bdTot}`}>
                  <span>À la carte, separately</span>
                  <span>{euro(sepTotal)}</span>
                </div>
                <div className={`${styles.bdRow} ${styles.bdYou}`}>
                  <span>Your concierge day</span>
                  <span>{euro(total)}</span>
                </div>
              </div>
            )}

            {/* value stack — the scope of the offer, right at the price */}
            {isOriginal ? (
              <div className={styles.sumChips}>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>All entries — included</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>Coast transfer — included</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>Felucca &amp; desert</span>
                <span className={styles.sumChip}>Everything handled</span>
              </div>
            ) : isLight ? (
              <div className={styles.sumChips}>
                <span className={styles.sumChip}>Concierge all day</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>Coast transfer — included</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>A gift — to keep</span>
                <span className={styles.sumChip}>Entries paid locally</span>
              </div>
            ) : (
              <div className={styles.sumChips}>
                <span className={styles.sumChip}>{expCount} experiences</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>Coast transfer — included</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>
                  {giftCount} signature gift{giftCount > 1 ? "s" : ""} — to keep
                </span>
                {plan.bonus.length > 0 && (
                  <span className={`${styles.sumChip} ${styles.sumChipFree}`}>
                    {plan.bonus.length} signature bonus{plan.bonus.length > 1 ? "es" : ""} — free
                  </span>
                )}
                <span className={styles.sumChip}>Everything handled</span>
              </div>
            )}

            {/* date — moved into the card so checkout is self-contained */}
            <div className={styles.sumSubRow}>
              <span className={styles.sumSub}>Your date</span>
              <span className={styles.sumScar}>Only one group a day</span>
            </div>
            <div ref={dateFieldRef} className={`${styles.sumDate} ${dateError ? styles.err : ""}`}>
              <input
                ref={(el) => {
                  dateInputRef.current = el;
                  setMinDate(el);
                }}
                type="date"
                value={tripDate}
                onChange={(e) => {
                  setTripDate(e.target.value);
                  setDateError(false);
                  if (error) setError("");
                }}
              />
            </div>

            {/* pay + CTA — kept tight and high so the button never drops below the fold */}
            <div className={styles.sumSub}>How you&apos;d like to pay</div>
            <div className={styles.payOpts}>
              {depositAllowed && (
                <div
                  className={`${styles.pay} ${pay === "deposit" ? styles.sel : ""}`}
                  onClick={() => setPay("deposit")}
                >
                  <span className={styles.payRec}>Easiest</span>
                  <b>{euro(deposit)}</b>
                  <span>to reserve · balance the day before</span>
                </div>
              )}
              <div
                className={`${styles.pay} ${pay === "full" ? styles.sel : ""}`}
                onClick={() => setPay("full")}
              >
                <b>{euro(total)}</b>
                <span>Pay in full</span>
              </div>
            </div>
            {!depositAllowed && tripDate && (
              <div className={styles.sumSub} style={{ opacity: 0.7 }}>
                A deposit isn&apos;t available this close to your date — pay in full to confirm.
              </div>
            )}
            <label className={styles.sumConsent}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (error) setError("");
                }}
              />
              <span>
                I agree to the{" "}
                <Link href="/legal/terms" target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/legal/cancellation" target="_blank">
                  Cancellation Policy
                </Link>
                .
              </span>
            </label>
            <a
              href="#"
              className={`btn btn-primary ${styles.sumBtn}`}
              onClick={handleReserve}
              aria-disabled={loading}
            >
              {loading
                ? "Opening secure checkout…"
                : pay === "full"
                  ? `Reserve your journey · ${euro(total)} →`
                  : `Secure your date · ${euro(deposit)} today →`}
            </a>
            {error && (
              <div role="alert" className={styles.sumCancel} style={{ color: "#9a2b2b" }}>
                {error}
              </div>
            )}
            <div className={styles.sumReassure2}>
              {pay === "deposit" && (
                <div className={styles.rrow}>
                  <span className={styles.ric} aria-hidden>💳</span>
                  <span>Balance charged automatically the day before — or a secure link if your bank needs to confirm</span>
                </div>
              )}
              <div className={`${styles.rrow} ${styles.rrowGuar}`}>
                <span className={styles.ric} aria-hidden>🛡</span>
                <span>
                  <b>First two hours, or your money back.</b> If your day isn&apos;t what we
                  promised, tell us in the first two hours and we refund it — less any
                  non-refundable bookings.
                </span>
              </div>
              <div className={styles.rrow}>
                <span className={styles.ric} aria-hidden>🔒</span>
                <span>Secure checkout by Stripe — no account needed</span>
              </div>
              <div className={styles.rrow}>
                <span className={styles.ric} aria-hidden>↩</span>
                <span>{cancelText || "Free cancellation up to 7 days before"}</span>
              </div>
            </div>
            </>
            )}

            {/* what you get — below the CTA, so it reassures without pushing the button down */}
            </div>
          </div>
        </div>
      </div>

      <StickyBar
        name={isReality ? "Reality Hunting" : isOriginal ? "Original" : isLight ? "Adventure" : "Concierge Day"}
        meta={
          proposal
            ? "private proposal · reply in 24h"
            : `your ${isLight ? "day" : "journey"}: ${euro(total)}${tripDate ? " · " + fmtDate(tripDate) : ""} · 7-day free cancellation`
        }
        ctaHref="#book"
        ctaLabel={proposal ? "Request your proposal →" : "See your day & price →"}
        revealOnScroll={false}
        extra={
          conc ? (
            <span className={styles.stickyGifts}>
              <span className={styles.stickyGiftMin} aria-hidden>
                ✦
              </span>
              <span className={styles.stickyGiftTxt}>A gift included</span>
            </span>
          ) : (
          <a href="#gifts" className={styles.stickyGifts} aria-label={`${giftsLabel} included — see the gifts`}>
            <span className={styles.stickyGiftIcons} aria-hidden>
              {GIFTS.map((g) => (
                <g.Icon
                  key={g.key}
                  className={`${styles.stickyGiftIcon} ${g.day <= giftCount ? styles.stickyGiftOn : styles.stickyGiftOff}`}
                />
              ))}
            </span>
            <span className={styles.stickyGiftTxt}>
              {giftsLabel} included
            </span>
          </a>
          )
        }
      />
    </>
  );
}
