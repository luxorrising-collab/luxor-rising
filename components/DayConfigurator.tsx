"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DayConfigurator.module.css";
import StickyBar from "./StickyBar";
import AvailabilityDate from "./AvailabilityDate";
import { GIFTS, giftsForDays } from "./GiftMarks";
import { useDayCount } from "./DayCount";
import { MyDayPicks } from "./MyDay";
import PaymentChoice, { PaymentReassure, payCta, todayEur } from "@/components/PaymentChoice";
import { DEFAULT_DEPOSIT_PERCENT, payModeAllowed, type PayMode } from "@/lib/payment-policy";
import { DAY_PICKS_EVENT, planDays as estimateDays, readDayPicks, useMyDay } from "@/lib/my-day";
import { dayLength } from "@/lib/day-plan";
import { trackBeginCheckout, trackLead } from "@/lib/analytics";
import { dayTotal, discountForDays, lightTotal, LIGHT_DAY_RATE, ORIGINAL_DAY_RATE, PHOTO_PRO } from "@/lib/pricing-math";

type DayCount = 1 | 2 | 3 | 4 | 5;
type SignatureJourney = "medinet" | "karnak" | "balloon";
// "light" = concierge-only (Adventure Light). "reality" = Reality Hunting, the
// business/land/investment day — bespoke, so it routes to the enquiry path
// (never Stripe checkout), the same way 5+ groups and 5+ days do.
type Journey = SignatureJourney | "light" | "reality" | "original";
type Pay = PayMode;

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
    temple: "Medinet Habu — temple of Ramesses III",
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
const SIGNATURE_META = "Door-to-door from the coast · the best of Luxor, your choice · insider access · a signature gift";
const JOURNEY_NOTE =
  "Every Signature day is the full trip, door to door: we collect you from Hurghada, Marsa Alam or the coast, the private car stays with you throughout, and you're brought home at the end. Three hand-picked experiences in any order you like — temples and tombs, a desert sunset picnic or a felucca on the Nile — with your own concierge end to end, insider access and insider knowledge, and introductions to local contacts and businesses a bus never gets. Venture into the desert one day and go anywhere in range the next; just tell your concierge. The full journey holds all ten; add days to unlock more, with a signature gift along the way.";
const CONSIGLIERE_INTRO =
  "No fixed plan — just your own person on the ground: a trusted driver, translator and fixer who opens doors and sorts everything on the spot. Your advisor on WhatsApp before you arrive; then go with the flow.";
const CONSIGLIERE_META = "The must-sees & a Nile sail · concierge all day · more on request";

// Reality Hunting — the business, land & investment day. Bespoke by nature, so
// it always routes to the private-proposal form, anchored at the €330 day. The copy
// leans on access + discretion + an honest local read (the exact levers the big
// operators charge a fortune for), always framed straight — never bribery, and
// never a cut of the deal.
const REALITY_RATE = LIGHT_DAY_RATE;
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
  "Everything Luxor has to offer in one unhurried day — the great temples and tombs, a private felucca and the desert, with entry to every site you visit included.";
const ORIGINAL_META = "All the sites · entries included · private felucca & desert";
const ORIGINAL_INCLUDED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — included, the car stays with you all day",
  "Entry to every temple and experience you visit — no queues, nothing to buy at the gate",
  "East bank — Karnak, Luxor Temple, and the Luxor & Mummification museums",
  "West bank — the Valley of the Kings (three tombs), Hatshepsut, Medinet Habu, the Ramesseum, Deir el-Medina, the Valley of the Queens and the Colossi of Memnon",
  "A private felucca on the Nile at golden hour",
  "A trip out into the desert",
  "Your concierge end to end — driver, planner, translator & fixer, all day",
  "In any order you like, at the quiet hour for each — just tell your concierge",
];
// The three days side by side (Adventure, Original, Signature): the heart of
// each day first, then every line of the Signature day's "Your day, start to
// finish" and "Also included", marked for all three. Adventure is the must-sees
// of Luxor; Original and Signature the best of Luxor; Signature adds depth,
// insider access and private time in the temples. "✓" included, "–" not.
export type CompareRow = { group: string } | [string, string, string, string];
export const COMPARE_ROWS: CompareRow[] = [
  { group: "The heart of each day" },
  ["The depth of the day", "The must-sees, at your pace", "Luxor without compromise, in depth", "As deep as Luxor goes"],
  [
    "What you see",
    "The must-sees of Luxor, included",
    "The best of Luxor · the must-sees of Aswan",
    "The best of Luxor & its hidden gems · the best of Aswan & Hurghada",
  ],
  [
    "Temples & tombs",
    "Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut, Medinet Habu & Deir el-Shelwit",
    "All the great temples & tombs of both banks",
    "All of them, with insider access — and off the beaten path",
  ],
  ["Time in the temples", "At the quiet hour", "At the quiet hour, with private moments", "Private space & time — as private as it gets"],
  { group: "Also included" },
  ["Door-to-door transfer from the coast — the car stays with you", "✓", "✓", "✓"],
  ["Airport pickup at Hurghada or Marsa Alam, up to 24 h before", "✓", "✓", "✓"],
  ["Every monument entry ticket", "The must-sees", "✓", "✓"],
  ["Your own licensed Egyptologist", "Request locally", "On request, arranged locally", "✓ When you wish"],
  ["Insider access & knowledge — the doors most never reach", "Request locally", "On request, arranged locally", "✓"],
  ["A quiet space, not only a quiet hour — as private as Luxor allows", "–", "Private moments", "✓"],
  ["Moments staged to the light — a proposal, an anniversary", "Request locally", "Request locally", "✓"],
  ["Signature-only experiences", "–", "–", "✓"],
  ["Fully hosted — local food & coffee stops", "Paid locally", "✓", "✓"],
  ["Tips", "Handled by your concierge, paid locally", "Handled by your concierge, paid locally", "Settled — nothing to carry"],
  ["Your day photographed, on your phone", "✓", "✓", "✓"],
  ["Your concierge end to end — planner, translator & fixer", "✓", "✓", "✓"],
  ["A gift to keep", "A small gift", "A gift from your concierge", "The Signature gift collection"],
  ["Made for the occasion — a honeymoon, a birthday, a milestone", "On request", "On request", "✓"],
  ["Anything else you wish for — just tell us", "Arranged locally, paid locally", "Arranged locally, paid locally", "✓ We make it happen"],
  ["Flexible rescheduling — we do our best to move your day", "✓", "✓", "✓"],
  ["The first two hours, or we refund the rest", "✓", "✓", "✓"],
  { group: "Your day, start to finish" },
  ["From the day you book — your concierge on WhatsApp", "✓", "✓", "✓"],
  ["Pickup at your hotel — Hurghada or Marsa Alam", "✓", "✓", "✓"],
  ["The road to Luxor — a private car, at your pace", "✓", "✓", "✓"],
  ["Temples and tombs — each at its quietest hour", "The must-sees", "✓", "✓ + your Egyptologist, if you wish"],
  ["An unhurried day — food stops, a slow afternoon or the desert", "A food stop · the rest on request", "Local food stops · the desert", "✓"],
  ["A flexible schedule — stay longer when a place speaks to you", "Within the day's plan", "Within the day's plan", "✓"],
  ["Home, door to door", "✓", "✓", "✓"],
];
const ORIGINAL_MORE = [
  "The premium tombs — Nefertari, Seti I (KV17) and Tutankhamun — are special tickets, added on request",
  "Want the balloon, signature gifts and insider access? That's the Signature day above",
];

// The Signature day, unpacked — shown when a Signature journey is selected, so
// its full value reads at a glance and never looks thinner than the
// concierge-only options below it.
const SIGNATURE_INCLUDED = [
  "Door-to-door transfer from Hurghada, Marsa Alam or the coast — included in the price, and the private car stays with you the whole trip",
  "Insider access & insider knowledge at the signature temples — doors opened, the real stories, and introductions to local contacts and businesses a bus never gets",
  "A hot-air balloon at dawn — included (best on day two)",
  "A signature desert sunset picnic or a felucca sail on the Nile — included",
  "Temples and tombs in any order you like — venture into the desert one day, go anywhere in range the next; just tell your concierge",
  "Your own licensed Egyptologist, at the monuments — every day",
  "Every monument entry ticket — nothing to buy, queue for or carry",
  "A full meal and hand-picked local food & coffee stops — where locals actually eat",
  "Tips and everything in between handled — nothing to think about, just a memorable stay start to finish",
  "Your day photographed — on your phone from the first moment, not in six weeks",
  "One concierge end to end — planner, translator & fixer, on WhatsApp before you arrive and all day",
  "Properly hosted and welcomed — met in person and looked after like a guest in someone's home",
  "Anything else you wish for — just ask your concierge, and we make it happen",
  "A signature gift, hand-picked & locally made, from your first full day",
  "The first two hours, or we refund the rest",
];
const SIGNATURE_UNLOCKS = [
  "More experiences unlock as you add days — venture further, to Aswan and beyond",
  "Signature experiences included — learn to sail the Nile yourself, or a fire and a feast under the desert stars",
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
  "Entry to every temple & experience you visit — included",
  "A private felucca and a desert trip — included",
  "Your concierge end to end, in any order you like",
];
const LIGHT_POINTS = [
  "Door-to-door transfer from the coast — included",
  "The must-sees: Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut & Medinet Habu — included",
  "Your concierge on the ground all day",
  "Anything more, requested and paid locally",
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
// Adventure includes the must-sees of Luxor and a Nile sail — shown in the same
// icon + line style as Signature and Original. (The sail is a shared felucca.)
const ADVENTURE_EXPS = [
  {
    icon: IC.temple,
    name: "The must-sees of Luxor",
    desc: "Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut and Medinet Habu — entries included.",
  },
  {
    icon: IC.sail,
    name: "A sail on the Nile",
    desc: "An hour on the water as the light turns, aboard a felucca with a local boatman.",
  },
];

// Operational inclusions for the brochure — kept separate from the experiences
// above, so nothing is said twice.
const SIGNATURE_HANDLED = [
  "Door-to-door transfer from Hurghada, Marsa Alam or the coast — the car stays with you",
  "Your own licensed Egyptologist, at the monuments — every day",
  "Not only a quiet hour, a quiet space — room to sit in silence with yourself, kept as private as Luxor allows",
  "Insider access & knowledge — the doors most never reach and the real stories behind the walls",
  "A venture past the monuments — hidden spots in the desert and a sunset few ever see",
  "Staged moments on request — a proposal, an anniversary, a surprise timed to the light",
  "Every monument entry ticket — nothing to buy, queue for or carry",
  "A full meal and hand-picked local food & coffee stops — where locals actually eat",
  "Tips already settled — the quiet gestures that open doors a little wider, nothing to carry",
  "Your day photographed — on your phone from the first moment",
  "Your concierge end to end — planner, translator & fixer, on WhatsApp from booking",
  "A signature gift, hand-picked & locally made, from your first full day",
  "The first two hours, or we refund the rest",
];
const ORIGINAL_HANDLED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — the car stays with you all day",
  "Entry to every temple and experience you visit, in the price — no queues, nothing to buy at the gate",
  "Tips and the logistics handled — nothing to break the spell",
  "Your concierge end to end — driver, planner, translator & fixer, in any order you like",
];

// The executive summary at the top of each brochure — a detailed read of what
// the day actually is and who it's for. Never a repeat of the card's own line.
const SIGNATURE_LEAD =
  "The full Luxor Rising day, arranged end to end for a trip that's meant to matter: an anniversary, a honeymoon, a milestone. One concierge, your own Egyptologist and real insider access, with every temple and tomb at its quietest, and a space to sit in silence with yourself, as private as Luxor allows. Then venture beyond them: hidden desert spots, a fire and a feast under the stars, the Nile sailed by your own hand, and a staged moment if you want one, even a proposal timed to the light. Meals where locals eat, quiet local introductions whenever you want them, and every tip and detail carried underneath. You simply arrive.";
const ORIGINAL_LEAD =
  "The complete sightseeing day — great temples and tombs of both banks, a private felucca and a trip into the desert, with entry to every site you visit already in the price. Each site at the hour it's quietest, with tips and the logistics handled so you never break the spell to sort anything out. Done in whatever order you like.";
const LIGHT_LEAD =
  "Your own trusted person on the ground for the day — a driver, translator and fixer who knows Luxor from the inside. Insider access and local contacts where they count, tips and the small frictions handled, and the day shaped around you. We plan it together before you arrive; then you go with the flow and pay the local costs as you go, so it stays light and flexible — and the more days you take, the more of Luxor you can fit in.";
const REALITY_LEAD =
  "A full day aimed at one thing: making something real in Egypt. We open the doors, make the introductions in person, and give you a straight local read on every opportunity.";

const MORE_DAYS_MSG =
  "Six days or more — slower still, and shaped entirely around you. Your concierge sends a private proposal.";

// Adventure Light — your own person on the ground. Said plainly, so nobody
// arrives expecting the Signature day.
const LIGHT_INCLUDED = [
  "Door-to-door transfer from Hurghada or Marsa Alam — included in the price, and the car stays with you all day",
  "Your own person on the ground — a trusted driver, translator and fixer all day",
  "Entry to the must-sees — Karnak, Luxor Temple, the Valley of the Kings (three tombs), Hatshepsut and Medinet Habu",
  "A sail on the Nile at golden hour",
  "Your planner on WhatsApp from the moment you book — the trip mapped out with you before you arrive",
  "Authentic local introductions — hosts, artisans & storytellers you'd never find on your own",
  "A hand-picked local food & coffee stop, on us — where locals actually eat, not the tourist cafés",
  "Tips & baksheesh handled by your concierge — no haggling, no awkward moments (you cover the tips; he sorts the rest)",
  "Anything that comes up, sorted on the spot — bookings, timings and the little hiccups",
  "Someone who knows the place — and gets you in, from temple doors to the best tables",
  "Tickets, queues and timings handled as you go",
  "Still reachable after you fly home",
  "A small gift from your concierge",
];
const LIGHT_LOCAL = [
  "Beyond the must-sees and the Nile sail, nothing else is pre-booked — bring local cash and pay for the rest as you go",
  "Any further entry tickets, the experiences you choose and your tips are paid locally, on the day — your concierge handles the how, so it's always smooth and fair",
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
  5: "Five days at the pace of the river — Luxor in depth, and time to venture further.",
};
// A short, persuasive "feel" line over the card's hero shot — tuned to each day
// count, since the shape (and the case for it) changes as the day grows.
const FEEL: Record<DayCount, string> = {
  1: "One day, done properly — three places at their quietest, and the first temple yours at dawn.",
  2: "Two unhurried days — the Egypt everyone sees, then the quiet one almost no one does.",
  3: "The three days we'd choose ourselves — with two signature moments, on us.",
  4: "Four slow days — fewer things, far more time, Egypt entirely at your pace.",
  5: "Five days at the pace of the river — Luxor in depth, and room to venture further.",
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
  ["photographer", 190],
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
  const pct = moreDays ? 100 : Math.min(100, (days / 4) * 100);
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

// ── Editable card content (Keystatic) ──────────────────────────────────────
// Every word of the three product cards can be overridden from the CMS; where a
// field is left empty, the built-in default below is used, so nothing ever
// renders blank. Experience icons are chosen from the IC set by key.
export type CardExperienceContent = {
  icon?: string | null;
  name?: string | null;
  /** The real name of the site or experience, under the expressive name. */
  place?: string | null;
  desc?: string | null;
  /** The product it shows: the tile photo and the "add to my day" key. */
  slug?: string | null;
  /** Shown after "Included ·" on the row's chip, e.g. "insider access". */
  tag?: string | null;
  /** Rows sharing a group fold together under its name (a model day). A group
   *  whose rows have no expressive name lists just the real names. */
  group?: string | null;
};
/** One step of the day, shown in every card's "Your day, start to finish". */
export type DayFlowStep = { h: string; sub?: string; p?: string };
export type CardSummaryContent = { title?: string | null; desc?: string | null };
export type CardContent = {
  summary?: readonly CardSummaryContent[] | null;
  tier?: string | null;
  kicker?: string | null;
  title?: string | null;
  hook?: string | null;
  points?: readonly (string | null)[] | null;
  meta?: string | null;
  priceNote?: string | null;
  lead?: string | null;
  expLede?: string | null;
  experiences?: readonly CardExperienceContent[] | null;
  /** A line under each group's name in "Experiences included" (by group name). */
  experienceGroups?: readonly { name?: string | null; desc?: string | null }[] | null;
  included?: readonly (string | null)[] | null;
  caveatsLabel?: string | null;
  caveats?: readonly (string | null)[] | null;
  note?: string | null;
};
export type CardsContent = {
  signature?: CardContent | null;
  original?: CardContent | null;
  adventure?: CardContent | null;
};

const SIG_HOOK_DEFAULT =
  "The full Luxor Rising day, for a trip that's meant to matter. One concierge, your own Egyptologist and real insider access, every temple and tomb at its quietest, and the experiences only Signature includes. You simply arrive.";
const SIG_EXPLEDE_DEFAULT =
  "Every experience below is included. See as much as you wish, never rushed and always in depth, and stay more days to experience everything with time to take it in. Swap any of them freely: just tell us what matters to you.";
/** How many experiences a brochure shows before "Show all" (two rows of tiles). */
const EXP_FIRST = 8;
const SIG_NOTE_DEFAULT =
  "Every experience is private and licensed-guided, arranged end to end — nothing is shared or off the shelf.";
const ORIG_EXPLEDE_DEFAULT =
  "The best of Luxor's temples and tombs, entry to each one you visit in the price — you choose the order, and add days to go slower and see more.";
const ORIG_NOTE_DEFAULT = "In any order you like, at the quiet hour for each — just tell your concierge.";
const ADV_NOTE_DEFAULT = "Go with the flow — tell us what you need, and we'll arrange it.";

// The checkout column's "What's included" summary for each card (title + desc).
const SIG_SUMMARY_DEFAULT = [
  {
    title: "Your own concierge, end to end",
    desc: "driver, planner, translator & fixer — on WhatsApp from booking, with you all day (everything the Adventure day gives, and more)",
  },
  {
    title: "The best of Luxor — your choice",
    desc: "temples, tombs, a felucca or the desert, in any order — at the quiet hour",
  },
  { title: "Go at your own pace", desc: "see as much as you wish — nothing rushed, nothing off the table" },
  { title: "Everything handled", desc: "Egyptologist, entries, transfers & timing" },
];
const ORIG_SUMMARY_DEFAULT = [
  {
    title: "Entry to every visit included",
    desc: "every temple, tomb & experience you visit — no queues, nothing to buy at the gate",
  },
  { title: "A private felucca & the desert", desc: "golden hour on the Nile and a trip out into the sand" },
  {
    title: "Door-to-door from the coast",
    desc: "collected from Hurghada or Marsa Alam — the car stays all day",
  },
  {
    title: "Your concierge end to end",
    desc: "driver, planner, translator & fixer — in any order you like",
  },
];
const ADV_SUMMARY_DEFAULT = [
  {
    title: "Your own person on the ground",
    desc: "trusted driver, translator, negotiator & problem-solver, all day",
  },
  {
    title: "The must-sees of Luxor & a Nile sail",
    desc: "Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut & Medinet Habu, and a felucca — included",
  },
  {
    title: "Door-to-door from the coast",
    desc: "collected from Hurghada or Marsa Alam — the car stays all day",
  },
  {
    title: "Anything more, paid locally",
    desc: "further entries, the experiences you choose & your tips — in cash, on the day",
  },
];

const DEFAULT_CARDS = {
  signature: {
    tier: "Full day · insider access",
    kicker: "End-to-end to Luxor",
    title: "Signature",
    hook: SIG_HOOK_DEFAULT,
    points: SIGNATURE_POINTS,
    meta: SIGNATURE_META,
    priceNote: "transfer from the coast included",
    lead: SIGNATURE_LEAD,
    expLede: SIG_EXPLEDE_DEFAULT,
    experiences: SIGNATURE_EXPS,
    groupDescs: {},
    included: SIGNATURE_HANDLED,
    caveatsLabel: "As you add days",
    caveats: SIGNATURE_UNLOCKS,
    note: SIG_NOTE_DEFAULT,
    summary: SIG_SUMMARY_DEFAULT,
  },
  original: {
    tier: "Full day · all the sights",
    kicker: "Entries included",
    title: "Original",
    hook: ORIGINAL_SUBTITLE,
    points: ORIGINAL_POINTS,
    meta: ORIGINAL_META,
    priceNote: "transfer from the coast included",
    lead: ORIGINAL_LEAD,
    expLede: ORIG_EXPLEDE_DEFAULT,
    experiences: ORIGINAL_EXPS,
    groupDescs: {},
    included: ORIGINAL_HANDLED,
    caveatsLabel: "Added on request",
    caveats: ORIGINAL_MORE,
    note: ORIG_NOTE_DEFAULT,
    summary: ORIG_SUMMARY_DEFAULT,
  },
  adventure: {
    tier: "The must-sees of Luxor",
    kicker: "The must-sees included",
    title: "Adventure",
    hook: CONSIGLIERE_INTRO,
    points: LIGHT_POINTS,
    meta: CONSIGLIERE_META,
    priceNote: "1–4 guests · extras paid locally",
    lead: LIGHT_LEAD,
    expLede: "",
    experiences: ADVENTURE_EXPS,
    groupDescs: {},
    included: LIGHT_INCLUDED,
    caveatsLabel: "Paid locally, on the day",
    caveats: LIGHT_LOCAL,
    note: ADV_NOTE_DEFAULT,
    summary: ADV_SUMMARY_DEFAULT,
  },
};

type ResolvedExp = { icon: ReactNode; name: string; desc: string; place?: string; tag?: string; group?: string; slug?: string };
type ResolvedSummary = { title: string; desc: string };
type ResolvedCard = {
  summary: ResolvedSummary[];
  tier: string;
  kicker: string;
  title: string;
  hook: string;
  points: string[];
  meta: string;
  priceNote: string;
  lead: string;
  expLede: string;
  experiences: ResolvedExp[];
  groupDescs: Record<string, string>;
  included: string[];
  caveatsLabel: string;
  caveats: string[];
  note: string;
};

const cmsStr = (v: string | null | undefined, d: string): string => (v && v.trim() ? v : d);
const cmsArr = (v: readonly (string | null)[] | null | undefined, d: readonly string[]): string[] => {
  const clean = (v ?? []).map((x) => (x ?? "").trim()).filter(Boolean);
  return clean.length ? clean : [...d];
};
const resolveExps = (
  cms: readonly CardExperienceContent[] | null | undefined,
  def: readonly ResolvedExp[],
): ResolvedExp[] => {
  const clean = (cms ?? []).filter((e) => (e?.name ?? "").trim() || (e?.place ?? "").trim());
  if (!clean.length) return [...def];
  return clean.map((e) => ({
    icon: (e.icon && IC[e.icon as keyof typeof IC]) || IC.check,
    name: (e.name ?? "").trim(),
    desc: (e.desc ?? "").trim(),
    place: (e.place ?? "").trim() || undefined,
    tag: (e.tag ?? "").trim() || undefined,
    group: (e.group ?? "").trim() || undefined,
    slug: (e.slug ?? "").trim() || undefined,
  }));
};
const resolveSummary = (
  cms: readonly CardSummaryContent[] | null | undefined,
  def: readonly ResolvedSummary[],
): ResolvedSummary[] => {
  const clean = (cms ?? []).filter((s) => (s?.title ?? "").trim());
  if (!clean.length) return [...def];
  return clean.map((s) => ({ title: (s.title ?? "").trim(), desc: (s.desc ?? "").trim() }));
};
const resolveCard = (cms: CardContent | null | undefined, def: ResolvedCard): ResolvedCard => ({
  summary: resolveSummary(cms?.summary, def.summary),
  tier: cmsStr(cms?.tier, def.tier),
  kicker: cmsStr(cms?.kicker, def.kicker),
  title: cmsStr(cms?.title, def.title),
  hook: cmsStr(cms?.hook, def.hook),
  points: cmsArr(cms?.points, def.points),
  meta: cmsStr(cms?.meta, def.meta),
  priceNote: cmsStr(cms?.priceNote, def.priceNote),
  lead: cmsStr(cms?.lead, def.lead),
  // expLede may legitimately be empty (Adventure has none), so an empty CMS
  // value only falls back when the default itself is non-empty.
  expLede: cms?.expLede && cms.expLede.trim() ? cms.expLede : def.expLede,
  experiences: resolveExps(cms?.experiences, def.experiences),
  groupDescs: Object.fromEntries(
    (cms?.experienceGroups ?? [])
      .filter((g) => (g?.name ?? "").trim() && (g?.desc ?? "").trim())
      .map((g) => [(g.name ?? "").trim(), (g.desc ?? "").trim()]),
  ),
  included: cmsArr(cms?.included, def.included),
  caveatsLabel: cmsStr(cms?.caveatsLabel, def.caveatsLabel),
  caveats: cmsArr(cms?.caveats, def.caveats),
  note: cmsStr(cms?.note, def.note),
});

export type DayConfiguratorImages = {
  journeyMedinet?: string;
  journeyKarnak?: string;
  journeyBalloon?: string;
  journeyLight?: string;
  journeyReality?: string;
  journeyOriginal?: string;
  /** Your concierge, face on — the Adventure card's picture. */
  concierge?: string;
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
  /** Editable card copy from Keystatic — any field left empty uses the default. */
  cards?: CardsContent;
  /** The day, step by step (the page's journey steps), shown inside every card. */
  dayFlow?: DayFlowStep[];
  /** Closing lines under the steps (e.g. off the beaten track, coming from Cairo). */
  dayFlowNotes?: { h: string; p: string }[];
  /** Each experience's own opening lines (slug → text), for "Read more" in step 1. */
  expPreviews?: Record<string, string>;
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
  depositPercent = DEFAULT_DEPOSIT_PERCENT,
  lightDayRate = LIGHT_DAY_RATE,
  images = {},
  priceTable,
  brandTable,
  supplementTable,
  socialProof = "4.9 · 33+ private days arranged",
  whatsappNumber = "",
  cards,
  dayFlow = [],
  dayFlowNotes = [],
  expPreviews = {},
}: DayConfiguratorProps) {
  // Resolve each card's copy: CMS value where set, built-in default otherwise.
  const SIG = resolveCard(cards?.signature, DEFAULT_CARDS.signature);
  const ORIG = resolveCard(cards?.original, DEFAULT_CARDS.original);
  const ADV = resolveCard(cards?.adventure, DEFAULT_CARDS.adventure);
  // Original and Adventure list every Signature experience, each marked as
  // included in that day or not (requested and paid locally on the day), so
  // the three days compare line by line instead of showing different lists.
  const NOT_INCLUDED = "Not included · request locally";
  const fullList = (tier: ResolvedExp[], onlyIncludedTag: boolean): ResolvedExp[] =>
    SIG.experiences.map((e) => {
      const t = e.slug ? tier.find((x) => x.slug === e.slug) : undefined;
      const inc = !!t && (!onlyIncludedTag || t.tag === "Included");
      return { ...e, tag: inc ? "Included" : NOT_INCLUDED };
    });
  const ORIG_ALL = fullList(ORIG.experiences, false);
  const ADV_ALL = fullList(ADV.experiences, true);
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
    concierge: images.concierge || "/images/hosts/consigliereImage.jpg",
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
  // The day count the page opened with, to return to when the basket is emptied.
  const startDays = useRef(days);
  // Which steps the guest has actually answered (defaults don't count), so
  // "Reserve" walks them through each one in turn and never skips a step.
  const [touched, setTouched] = useState({ card: false, guests: false, days: false });
  const touch = (k: "card" | "guests" | "days") => setTouched((t) => (t[k] ? t : { ...t, [k]: true }));
  // The visitor's picks from across the site ("add to my day").
  const myDay = useMyDay();
  const planDays = (n: number) => {
    if (n <= 5) {
      setMoreDays(false);
      setDays(n as DayCount);
    } else {
      setMoreDays(true);
      setMoreDaysCount(n);
    }
  };
  // The day count follows the picks: set on arrival and whenever one is added
  // or removed (3–4 experiences a day). The guest can still change it after.
  // Emptying the basket puts the days (and the call to action) back to the start.
  useEffect(() => {
    const apply = () => {
      const { days: d } = estimateDays(readDayPicks().map((p) => p.slug));
      if (d > 0) planDays(d);
      else {
        setMoreDays(false);
        setDays(startDays.current);
        setTouched((t) => (t.days ? { ...t, days: false } : t));
      }
    };
    const t = window.setTimeout(apply, 0);
    window.addEventListener(DAY_PICKS_EVENT, apply);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener(DAY_PICKS_EVENT, apply);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [group, setGroup] = useState(2);
  // Which brochures show their whole experience list (first EXP_FIRST otherwise).
  const [expAll, setExpAll] = useState<Record<string, boolean>>({});
  // The step-1 tile whose "Read more" preview is open.
  const [preview, setPreview] = useState<string | null>(null);
  // Step 1 shows one experience at a time, as a full hero card: one clear
  // decision per screen instead of a wall of options.
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTouch = useRef<number | null>(null);
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
    ? ORIG.title
    : isLight
      ? ADV.title
      : isReality
        ? "Reality Hunting"
        : SIG.title;
  // Tap a card → select it for the summary AND toggle its detail panel.
  const pickCard = (key: "signature" | "original" | "light" | "reality", j: Journey) => {
    touch("card");
    setJourney(j);
    setExpanded((prev) => (prev === key ? null : key));
  };
  // 5+ guests or 5+ days → a private proposal. The checkout column keeps its
  // look but turns into a short request form instead of a payment. Reality
  // Hunting is bespoke, so it always takes that same proposal path.
  const [bigGroup, setBigGroup] = useState(false);
  const [bigGroupCount, setBigGroupCount] = useState(6);
  const [moreDays, setMoreDays] = useState(false);
  const [moreDaysCount, setMoreDaysCount] = useState(6);
  const proposal = bigGroup || moreDays || isReality;
  const [eq, setEq] = useState({ name: "", email: "", phone: "", message: "" });
  const [eqSent, setEqSent] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [payChoice, setPay] = useState<Pay>("deposit");
  const [tripDate, setTripDate] = useState("");
  const [dateError, setDateError] = useState(false);
  const [bdOpen, setBdOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  // Which comparison sections are unfolded (the heart of each day, to start).
  const [cmpOpen, setCmpOpen] = useState<Record<string, boolean>>({ "The heart of each day": true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLButtonElement>(null);

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
          ? lightTotal(d, group, lightDayRate, volumeDiscount)
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
  // The automatic balance is charged 48 hours before, so "20% today" needs the
  // date at least three days out; closer than that the guest pays in full or
  // pays the rest locally (lib/payment-policy.ts, enforced again on the server).
  const pay: Pay = payModeAllowed(payChoice, tripDate || undefined) ? payChoice : "full";

  const plan = useMemo(() => {
    const j = JOURNEY[journey];
    const a = ALT[journey];
    const gl = group + (group > 1 ? " guests" : " guest");
    if (journey === "light") {
      const extras: PlanItem[] = [];
      if (photo) extras.push("Private photographer / videographer for your day");
      return {
        start: [] as PlanItem[],
        startTitle: "Adventure · the must-sees of Luxor",
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
    // Signature is the guest's pick of the best of Luxor — no day is pre-fixed to
    // particular temples. Everything goes into one "your choice" menu, scaled by
    // the number of days.
    const start: PlanItem[] = [];
    const pool: PlanItem[] = [];
    pool.push({ t: j.temple, sig: journey === "medinet" });
    pool.push({ t: j.companion });
    pool.push(SUNSET_FIRST);
    if (photo) pool.push("Private photographer / videographer for your day");
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
      pool.push({ t: "Deir el-Shelwit — the hidden temple of Isis", sig: true });
    }
    if (days >= 4) {
      pool.push("Valley of the Workers — Deir el-Medina");
      if (journey !== "balloon") pool.push("Hot-air balloon at dawn over Luxor");
      pool.push({ t: "Sailing lesson on the Nile — take the tiller yourself", sig: true });
    }
    // Kept in step with the Signature card's promises — nothing here is offered
    // that the card (face + "Also included") doesn't already promise.
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
    handled.push("Every reservation and timing, planned for you");
    handled.push(
      "Your day photographed — on your phone from the first moment, not in six weeks"
    );
    handled.push(
      "A full meal and hand-picked local food & coffee stops — where locals actually eat"
    );
    handled.push("Tips already settled — the quiet gestures that open doors a little wider, nothing to carry");
    handled.push("Your concierge on WhatsApp — before you arrive & all day");

    return {
      start,
      startTitle: "",
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

  // The booked stay in short form: one day, or "Sat 14 – Mon 16 Nov · 3 days".
  const stayText = (() => {
    if (!tripDate) return "";
    if (days < 2) return fmtDate(tripDate);
    const end = new Date(tripDate + "T12:00:00");
    end.setDate(end.getDate() + days - 1);
    return `${fmtDate(tripDate)} – ${fmtDate(end.toISOString().slice(0, 10))} · ${days} days`;
  })();


  // Earliest bookable date (tomorrow) — set on the element once it mounts, so
  // server and client render the same markup.
  const setMinDate = (el: HTMLInputElement | null) => {
    if (el) el.min = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  };

  // What the guest chose, in one line — sent with a booking or a proposal request.
  function configSummary(withPicks = true) {
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
            ? "Adventure (the must-sees of Luxor — Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut & Medinet Habu — and a Nile sail included)"
            : "Signature (full guided day — the best of Luxor your choice, insider access, Egyptologist, balloon & a gift)",
      withPicks && myDay.picks.length
        ? `Your experiences (${myDay.picks.length}, about ${myDay.days} day${myDay.days > 1 ? "s" : ""}): ${myDay.picks.map((p) => p.name).join(" / ")}`
        : conc
          ? ""
          : "Experiences: temples, tombs, a felucca or the desert — your choice, in any order",
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
          picks: myDay.picks.map((p) => p.slug),
          company: String(new FormData(form).get("company") ?? ""),
        }),
      });
      if (res.ok) {
        setEqSent(true);
        trackLead({ form: "design-your-day", topic: "concierge-day" });
      } else {
        setError("We couldn't send that just now. Please try again, or write to us on WhatsApp.");
      }
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    }
    setLoading(false);
  }

  // The sticky "Reserve": the next step the guest hasn't answered, then the date,
  // then the booking column. Each target gets a short gold highlight.
  // Jump to a step (the progress rail, the "Change" links in your summary).
  function jumpTo(step: string) {
    const el =
      step === "book" ? document.getElementById("book") : document.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  }

  function goToNextStep(e: React.MouseEvent) {
    e.preventDefault();
    // The order the page asks: who's coming, how long, the day, the date, then reserve.
    // (Picks are optional — the guest can skip them.)
    const next = !touched.guests ? "guests" : !touched.days ? "days" : !touched.card ? "card" : !tripDate ? "date" : "book";
    const el =
      next === "date"
        ? dateFieldRef.current
        : next === "book"
          ? document.getElementById("book")
          : document.querySelector<HTMLElement>(`[data-step="${next}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - (next === "date" ? window.innerHeight / 3 : 90);
    window.scrollTo({ top, behavior: "smooth" });
    el.classList.remove(styles.stepFlash);
    // restart the highlight
    void el.offsetWidth;
    el.classList.add(styles.stepFlash);
    window.setTimeout(() => el.classList.remove(styles.stepFlash), 1800);
    if (next === "date") window.setTimeout(() => dateInputRef.current?.focus({ preventScroll: true }), 600);
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
      ? `${days}-day ${ADV.title}`
      : isOriginal
        ? `${days}-day ${ORIG.title}`
        : `${days}-day ${SIG.title}`;
    const slug = isLight
      ? `concierge-light-${days}d`
      : isOriginal
        ? `concierge-original-${days}d`
        : `concierge-day-${days}d`;
    const preferences = configSummary(false);
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
          picks: myDay.picks.map((p) => p.slug),
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

  // Experiences folded into model days (groups of three), then a last group
  // that simply names everything else that can be swapped in.
  const renderGroups = (exps: ResolvedExp[], descs: Record<string, string> = {}) => {
    const groups: { name: string; items: ResolvedExp[] }[] = [];
    for (const e of exps) {
      const g = e.group ?? "";
      const last = groups[groups.length - 1];
      if (last && last.name === g) last.items.push(e);
      else groups.push({ name: g, items: [e] });
    }
    return (
      <div className={styles.expGroups}>
        {groups.map((g, gi) => {
          const namesOnly = g.items.every((e) => !e.name);
          return (
            <details className={styles.expGroup} key={g.name} open={gi < 2}>
              <summary>
                <span className={styles.expGroupTxt}>
                  <b>{g.name}</b>
                  <span>
                    {descs[g.name] || g.items.map((e) => e.place || e.name).join(" · ")}
                  </span>
                </span>
                <span className={styles.foldChev} aria-hidden />
              </summary>
              {namesOnly ? (
                <ul className={styles.expSwapList}>
                  {g.items.map((e) => (
                    <li key={e.place}>{e.place}</li>
                  ))}
                </ul>
              ) : (
                <ul className={`${styles.expExps} ${styles.expExpsIn}`}>
                  {g.items.map((e) => (
                    <li key={e.name}>
                      <span className={styles.expExpIco}>{e.icon}</span>
                      <span className={styles.expExpTxt}>
                        <b>{e.name}</b>
                        {e.desc && <span className={styles.expExpLine}>{e.desc}</span>}
                        <span className={styles.expExpMeta}>
                          <span className={styles.expExpTag}>
                            <span aria-hidden>✓</span> Included{e.tag ? ` · ${e.tag}` : ""}
                          </span>
                          {e.place && <span className={styles.expExpPlace}>{e.place}</span>}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          );
        })}
      </div>
    );
  };

  // A card's expansion — the brochure. No hero or title (the card above is the
  // header), so it reads as one continuous card: a lead line, the experiences
  // included, everything handled, and any honest caveats — each with a symbol.
  // ── Step 3: what you'd love to see first, then the day that holds it ──────
  type CardKey = "light" | "original" | "signature";
  const selKey: CardKey | "reality" = isLight ? "light" : isOriginal ? "original" : isReality ? "reality" : "signature";
  const TIER_CARDS: {
    key: CardKey;
    j: Journey;
    c: ResolvedCard;
    all: ResolvedExp[];
    rate: number;
    img: string;
    /** Where the picture's subject sits, so every crop keeps it in frame. */
    pos: string;
    essence: string;
  }[] = [
    {
      key: "light",
      j: "light",
      c: ADV,
      all: ADV_ALL,
      rate: lightDayRate,
      img: img.journeyLight,
      pos: "50% 30%",
      essence: "The must-sees of Luxor, included",
    },
    {
      key: "original",
      j: "original",
      c: ORIG,
      all: ORIG_ALL,
      rate: ORIGINAL_RATE,
      img: img.journeyOriginal,
      pos: "50% 50%",
      essence: "The best of Luxor, without compromise",
    },
    {
      key: "signature",
      j: "medinet",
      c: SIG,
      all: SIG.experiences,
      rate: dayRate,
      img: img.journeyMedinet,
      pos: "50% 50%",
      essence: "Luxor in depth — as private as it gets",
    },
  ];
  // Each card's own price for the guests and days chosen above (before add-ons).
  const tierTotal = (key: CardKey) =>
    key === "original"
      ? dayTotal(days, group, ORIGINAL_RATE, volumeDiscount, groupSupplement)
      : key === "light"
        ? lightTotal(days, group, lightDayRate, volumeDiscount)
        : dayTotal(days, group, dayRate, volumeDiscount, groupSupplement);
  // Which column of the comparison each day reads from.
  const CMP_COL: Record<CardKey, 1 | 2 | 3> = { light: 1, original: 2, signature: 3 };
  const CMP_COUNT: Record<string, number> = {};
  {
    let g = "";
    for (const r of COMPARE_ROWS) {
      if ("group" in r) g = r.group;
      else CMP_COUNT[g] = (CMP_COUNT[g] ?? 0) + 1;
    }
  }
  // Is this experience part of that day? Signature holds every one.
  const inCard = (t: (typeof TIER_CARDS)[number], slug: string) =>
    t.key === "signature" || t.all.some((e) => e.slug === slug && e.tag === "Included");
  const tileExps = SIG.experiences.filter((e) => e.slug);
  const pickedExps = tileExps.filter((e) => myDay.has(e.slug!));
  // Picks first; everything else after, tinted, until you reach for it.
  const tileOrder = [...pickedExps, ...tileExps.filter((e) => !myDay.has(e.slug!))];
  const tilesShown = tileOrder;
  // A step counts as answered once the guest has made the choice themselves.
  const picksDone = myDay.picks.length > 0;
  const partyDone = touched.guests && touched.days;
  const chooseCard = (key: CardKey, j: Journey) => {
    touch("card");
    setJourney(j);
    setExpanded(key);
  };

  const renderBrochure = (opts: {
    /** Which card this is, so each remembers its own "Show all". */
    id: string;
    lead: string;
    experiences?: ResolvedExp[];
    groupDescs?: Record<string, string>;
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
            <span className={styles.expEyebrow}>
              {opts.experiences.some((e) => e.tag === "Paid locally" || e.tag === NOT_INCLUDED)
                ? "What your day can hold"
                : "Experiences included"}
            </span>
            {opts.expLede && <p className={styles.expLede}>{opts.expLede}</p>}
            {opts.experiences.some((e) => e.group) ? (
              renderGroups(opts.experiences, opts.groupDescs)
            ) : (
            <>
            {/* The visitor's picks (from anywhere on the site), with the days they need. */}
            <MyDayPicks onPlanDays={planDays} currentDays={moreDays ? moreDaysCount : days} />
            {/* Photo tiles: the poetic line over the picture; tap to add it to your day. */}
            <div className={styles.expTiles}>
              {(expAll[opts.id] ? opts.experiences : opts.experiences.slice(0, EXP_FIRST)).map((e) => {
                const on = !!e.slug && myDay.has(e.slug);
                return (
                  <button
                    type="button"
                    key={e.name}
                    className={`${styles.expTile} ${on ? styles.expTileOn : ""}`}
                    aria-pressed={on}
                    disabled={!e.slug}
                    onClick={() => e.slug && myDay.toggle({ slug: e.slug, name: e.name })}
                  >
                    {e.slug && (
                      <Image src={`/images/cards/tile/${e.slug}.jpg`} alt="" fill unoptimized loading="lazy" />
                    )}
                    <span className={styles.expTileScrim} aria-hidden />
                    {e.slug && (
                      <span className={styles.expTileAdd} aria-hidden>
                        {on ? "✓ In your day" : "+ Add"}
                      </span>
                    )}
                    <span className={styles.expTileTx}>
                      {/* what it is on this day: Signature-only, included, or paid locally */}
                      {e.tag === "Signature" && <span className={styles.expTileSig}>Signature</span>}
                      {e.tag && e.tag !== "Signature" && (
                        <span className={`${styles.expTileTag} ${e.tag === "Included" ? styles.expTileTagIn : ""}`}>
                          {e.tag}
                        </span>
                      )}
                      <span className={styles.expTileName}>{e.name}</span>
                      {e.desc && <span className={styles.expTileLine}>{e.desc}</span>}
                      {(e.place || (e.slug && dayLength(e.slug))) && (
                        <span className={styles.expTilePlace}>
                          {[e.place, e.slug && dayLength(e.slug) && e.place !== "4 days" ? dayLength(e.slug) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {opts.experiences.length > EXP_FIRST &&
              (expAll[opts.id] ? (
                <a className={styles.expMore} href="/experiences">
                  Explore every experience →
                </a>
              ) : (
                <button
                  type="button"
                  className={styles.expMore}
                  onClick={() => setExpAll((m) => ({ ...m, [opts.id]: true }))}
                >
                  Show all {opts.experiences.length} experiences
                </button>
              ))}
            </>
            )}
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
        {dayFlow.length > 0 && (
          <div className={styles.expBlock}>
            <span className={styles.expEyebrow}>Your day, start to finish</span>
            <div className={styles.flowList}>
              {dayFlow.map((f, i) => (
                <details className={styles.flowStep} key={f.h}>
                  <summary>
                    <span className={styles.flowNum} aria-hidden>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.flowTxt}>
                      <b>{f.h}</b>
                      {f.sub && <span className={styles.flowSub}>{f.sub}</span>}
                    </span>
                    {f.p && <span className={styles.foldChev} aria-hidden />}
                  </summary>
                  {f.p && <p className={styles.flowMore}>{f.p}</p>}
                </details>
              ))}
            </div>
            {dayFlowNotes.length > 0 && (
              <ul className={styles.flowNotes}>
                {dayFlowNotes.map((n) => (
                  <li key={n.h}>
                    <b>{n.h}</b> <span>{n.p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.cfgGrid}>
        <div>
          {/* Where you are — four short steps, each ticks as you answer it */}
          <ol className={styles.dsRail} aria-label="Your progress">
            {(
              [
                ["picks", "What you'd love", picksDone],
                ["guests", "Who & how long", partyDone],
                ["card", "Your day", touched.card],
                ["book", "Reserve", false],
              ] as const
            ).map(([k, label, done], i) => (
              <li key={k} className={done ? styles.dsRailOn : ""}>
                <button type="button" onClick={() => jumpTo(k)}>
                  <span aria-hidden>{done ? "✓" : i + 1}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>

          {/* Step 1: what you'd love to see — the same full cards as the gallery above */}
          <div className={styles.step} data-step="picks">
            <div className={styles.stepH}>
              <div className={`${styles.stepN} ${picksDone ? styles.stepDone : ""}`} aria-hidden>
                {picksDone ? "✓" : 1}
              </div>
              <h3>What would you love to experience?</h3>
            </div>
            <p className={styles.prefNote}>
              Tap what you&apos;d love to experience. Your picks lead and the days follow. Not sure yet? Skip ahead;
              your concierge shapes the day with you.
            </p>
            <div className={styles.dsDark}>
              <MyDayPicks onPlanDays={planDays} currentDays={moreDays ? moreDaysCount : days} />
              {!expAll.picks ? (
                (() => {
                  const list = tileExps;
                  const n = list.length;
                  if (!n) return null;
                  const i = ((heroIdx % n) + n) % n;
                  const e = list[i];
                  const on = myDay.has(e.slug!);
                  const tiers = TIER_CARDS.filter((t) => inCard(t, e.slug!)).map((t) => t.c.title);
                  const go = (d: number) => setHeroIdx((x) => x + d);
                  const where = [e.place || "Luxor", e.place !== "4 days" ? dayLength(e.slug!) : null].filter(Boolean).join(" · ");
                  return (
                    <div
                      className={styles.pkHero}
                      onTouchStart={(ev) => (heroTouch.current = ev.touches[0].clientX)}
                      onTouchEnd={(ev) => {
                        const x0 = heroTouch.current;
                        heroTouch.current = null;
                        if (x0 == null) return;
                        const dx = ev.changedTouches[0].clientX - x0;
                        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
                      }}
                    >
                      <div className={styles.pkBg} key={e.slug}>
                        <Image src={`/images/cards/${e.slug}.jpg`} alt="" fill unoptimized sizes="(max-width: 760px) 100vw, 900px" />
                      </div>
                      <span className={styles.pkScrim} aria-hidden />
                      <div className={styles.pkTop}>
                        {e.tag === "Signature" ? <span className={styles.pkSig}>Signature experience</span> : <span />}
                        <span className={styles.pkCount}>
                          {i + 1} / {n}
                        </span>
                      </div>
                      <div className={styles.pkContent} key={`${e.slug}-tx`}>
                        <span className="eyebrow">{where}</span>
                        <h4 className={`display ${styles.pkTitle}`}>{e.name}</h4>
                        {e.desc && <p className={styles.pkHook}>{e.desc}</p>}
                        {expPreviews[e.slug!] && <p className={styles.pkLead}>{expPreviews[e.slug!]}</p>}
                        {tiers.length > 0 && (
                          <ul className={styles.pkTiers} aria-label="Included in">
                            <li className={styles.pkTiersLabel}>Included in</li>
                            {tiers.map((t) => (
                              <li key={t} className={t === "Signature" ? styles.pkTierSig : ""}>
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className={styles.pkCta}>
                          <button
                            type="button"
                            className={`btn btn-primary btn-lg ${on ? styles.pkOn : ""}`}
                            aria-pressed={on}
                            onClick={() => {
                              myDay.toggle({ slug: e.slug!, name: e.name });
                              // added: move on to the next one, so choosing keeps its rhythm
                              if (!on) setTimeout(() => go(1), 700);
                            }}
                          >
                            {on ? "✓ In your day" : "+ Add to my day"}
                          </button>
                          <button type="button" className={`btn btn-ghost btn-lg ${styles.pkSkip}`} onClick={() => go(1)}>
                            Next experience →
                          </button>
                        </div>
                      </div>
                      <button type="button" className={`${styles.pkArrow} ${styles.pkPrev}`} aria-label="Previous experience" onClick={() => go(-1)}>
                        ‹
                      </button>
                      <button type="button" className={`${styles.pkArrow} ${styles.pkNext}`} aria-label="Next experience" onClick={() => go(1)}>
                        ›
                      </button>
                      <span className={styles.pkBar} aria-hidden>
                        <i style={{ width: `${((i + 1) / n) * 100}%` }} />
                      </span>
                    </div>
                  );
                })()
              ) : (
                <div className={styles.expTiles}>
                  {tilesShown.map((e) => {
                    const on = myDay.has(e.slug!);
                    const open = preview === e.slug;
                    return (
                      <div key={e.slug} className={`${styles.expTile} ${on ? styles.expTileOn : styles.dsShadow} ${open ? styles.dsTileOpen : ""}`}>
                        <Image src={`/images/cards/tile/${e.slug}.jpg`} alt="" fill unoptimized loading="lazy" />
                        <span className={styles.expTileScrim} aria-hidden />
                        {/* the whole tile adds it to your day */}
                        <button
                          type="button"
                          className={styles.dsTileHit}
                          aria-pressed={on}
                          aria-label={`${on ? "Remove" : "Add"} ${e.name} ${on ? "from" : "to"} your day`}
                          onClick={() => myDay.toggle({ slug: e.slug!, name: e.name })}
                        />
                        {e.tag === "Signature" && <span className={`${styles.expTileSig} ${styles.dsSigTag}`}>Signature</span>}
                        <span className={styles.expTileAdd} aria-hidden>
                          {on ? "✓ In your day" : "+ Add"}
                        </span>
                        <span className={`${styles.expTileTx} ${styles.dsTileTx}`}>
                          <span className={styles.expTileName}>{e.name}</span>
                          {e.desc && <span className={styles.expTileLine}>{e.desc}</span>}
                          {(e.place || dayLength(e.slug!)) && (
                            <span className={styles.expTilePlace}>
                              {[e.place, e.place !== "4 days" ? dayLength(e.slug!) : null].filter(Boolean).join(" · ")}
                            </span>
                          )}
                          <button type="button" className={styles.dsReadMore} aria-expanded={open} onClick={() => setPreview(e.slug!)}>
                            Read more
                          </button>
                        </span>
                        {/* the preview: the experience's own words, right here on the tile */}
                        {open && (
                          <div className={styles.dsPreview} role="dialog" aria-label={e.name}>
                            <button type="button" className={styles.dsPreviewX} aria-label="Close" onClick={() => setPreview(null)}>
                              ×
                            </button>
                            <span className={styles.expTileName}>{e.name}</span>
                            {e.tag === "Signature" && <span className={styles.dsPreviewSig}>Signature experience</span>}
                            <p>{expPreviews[e.slug!] || e.desc}</p>
                            <button
                              type="button"
                              className={`${styles.dsPreviewAdd} ${on ? styles.dsPreviewAddOn : ""}`}
                              onClick={() => myDay.toggle({ slug: e.slug!, name: e.name })}
                            >
                              {on ? "✓ In your day" : "+ Add to my day"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {!expAll.picks ? (
                <button type="button" className={styles.dsMore} onClick={() => setExpAll((m) => ({ ...m, picks: true }))}>
                  See all {tileOrder.length} at once
                </button>
              ) : (
                <div className={styles.pkLinks}>
                  <button type="button" className={styles.dsMore} onClick={() => setExpAll((m) => ({ ...m, picks: false }))}>
                    ← One at a time
                  </button>
                  <Link className={styles.dsMore} href="/experiences">
                    Explore every experience →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: who's coming and for how long — small answers first, so every day card
              below can show its real price.
              5+ guests or 5+ days turn the checkout into a private proposal. */}
          <div className={styles.step} data-step="guests">
            <div className={styles.stepH}>
              <div className={`${styles.stepN} ${partyDone ? styles.stepDone : ""}`} aria-hidden>
                {partyDone ? "✓" : 2}
              </div>
              <h3>Who&apos;s coming, and for how long?</h3>
            </div>
            <span className={styles.dsPartH}>Who&apos;s coming</span>
            <div className={styles.grpOpts}>
              {[1, 2, 3, 4].map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={!bigGroup && group === g}
                  className={`${styles.grp} ${!bigGroup && group === g ? styles.sel : ""}`}
                  onClick={() => {
                    touch("guests");
                    setGroup(g);
                    setBigGroup(false);
                  }}
                >
                  {g === 1 ? "Just me" : g === 2 ? "Two of us" : g === 3 ? "Three of us" : "Four of us"}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={bigGroup}
                className={`${styles.grp} ${bigGroup ? styles.sel : ""}`}
                onClick={() => {
                  touch("guests");
                  setBigGroup(true);
                }}
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
            <div className={styles.dsPart} data-step="days">
              <span className={styles.dsPartH}>How many days</span>
            {myDay.days > 0 && (
              <p className={styles.daysHint}>
                Set to {myDay.days} day{myDay.days > 1 ? "s" : ""} for your {myDay.picks.length} pick
                {myDay.picks.length > 1 ? "s" : ""}: three to four experiences a day is the right pace. Change it any
                time.
              </p>
            )}
            {myDay.days > (moreDays ? moreDaysCount : days) && (
              <p className={styles.daysWarn} role="status">
                {myDay.picks.length} experiences need about {myDay.days} days at the right pace. In{" "}
                {moreDays ? moreDaysCount : days} day{(moreDays ? moreDaysCount : days) > 1 ? "s" : ""}{" "}
                there
                isn&apos;t time for all of them: choose{" "}
                {myDay.days > 5 ? "6+ days" : `${myDay.days} days`}, or your concierge will help you keep the
                ones that matter most.
              </p>
            )}
            <div className={styles.daysGrid}>
              {([1, 2, 3, 4, 5] as DayCount[]).map((d) => {
                const on = !moreDays && days === d;
                return (
                  <button
                    type="button"
                    key={d}
                    aria-pressed={on}
                    className={`${styles.dayTile} ${on ? styles.sel : ""} ${d < myDay.days ? styles.dayShort : ""}`}
                    onClick={() => {
                      touch("days");
                      setDays(d);
                      setMoreDays(false);
                    }}
                  >
                    {myDay.days > 0 ? (
                      d === myDay.days && <span className={styles.pop}>For your picks</span>
                    ) : (
                      d === 3 && !conc && <span className={styles.pop}>Most popular</span>
                    )}
                    <div className={styles.dn}>
                      {d} {d > 1 ? "days" : "day"}
                    </div>
                    {/* no price yet: it comes with the kind of day, in the next step */}
                    <div className={styles.dsave}>
                      {d === 1
                        ? "a single day"
                        : discountForDays(d, volumeDiscount) > 0
                          ? `${discountForDays(d, volumeDiscount)}% off every day`
                          : " "}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={moreDays}
                className={`${styles.dayTile} ${styles.dayTileMore} ${moreDays ? styles.sel : ""}`}
                onClick={() => {
                  touch("days");
                  setMoreDays(true);
                  setDays(5);
                }}
              >
                {myDay.days > 5 && <span className={styles.pop}>For your picks</span>}
                <div className={styles.dn}>6+ days</div>
                <div className={`${styles.dp} ${styles.dpWord}`}>Tailored</div>
                <div className={styles.dsave}>a private proposal</div>
              </button>
            </div>
            {moreDays && (
              <Stepper
                label="How many days?"
                value={moreDaysCount}
                min={6}
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
          </div>

          {/* Step 3: how the day should feel — three depths of the same day, priced for
              the guests and days above */}
          <div className={styles.step} data-step="card">
            <div className={styles.stepH}>
              <div className={`${styles.stepN} ${touched.card ? styles.stepDone : ""}`} aria-hidden>
                {touched.card ? "✓" : 3}
              </div>
              <h3>How should your day feel?</h3>
            </div>
            <p className={styles.prefNote}>
              Three depths of the same day. Choose one; you can switch any time before you reserve.
            </p>
            {/* The three days as posters — tap one; what it holds opens once, underneath */}
            <div className={styles.dsPosters} role="radiogroup" aria-label="Choose your day">
              {TIER_CARDS.map((t) => {
                const on = selKey === t.key;
                const n = pickedExps.filter((e) => inCard(t, e.slug!)).length;
                const of = pickedExps.length;
                const tot = tierTotal(t.key);
                return (
                  <div
                    key={t.key}
                    role="radio"
                    tabIndex={0}
                    aria-checked={on}
                    aria-label={`${t.c.title} — ${proposal ? `from ${euro(t.rate)} a day` : `${euro(tot)} in total`}`}
                    className={`${styles.sigCard} ${styles.dsPoster} ${on ? `${styles.sigOn} ${styles.dsPosterOn}` : styles.dsTierOff}`}
                    onClick={() => chooseCard(t.key, t.j)}
                    onKeyDown={(e) => pickKey(e, () => chooseCard(t.key, t.j))}
                  >
                    <Image
                      src={t.img}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 80vw, 290px"
                      className={`${styles.sigImg} ${styles.dsPosterImg}`}
                      style={{ objectPosition: on ? "50% 0%" : t.pos }}
                    />
                    <span className={`${styles.sigShade} ${styles.dsPosterShade}`} aria-hidden />
                    <div className={`${styles.sigTop} ${styles.dsPosterTop}`}>
                      {on ? (
                        <span className={styles.sigChosen}>✓ Selected</span>
                      ) : (
                        <span className={styles.dsChoose}>Choose</span>
                      )}
                    </div>
                    <div className={styles.dsPosterBody}>
                      <h4 className={styles.dsPosterLabel}>{t.c.title}</h4>
                      <p className={styles.dsEssence}>{t.c.kicker}</p>
                      {of > 0 && (
                        <span className={`${styles.dsFit} ${n === of ? styles.dsFitAll : ""}`}>
                          {n === of
                            ? `✓ ${of === 1 ? "Your pick" : `All ${of} of your picks`} included`
                            : `${n} of ${of} picks included`}
                        </span>
                      )}
                      <span className={styles.dsPosterPrice}>
                        {proposal ? (
                          <>
                            <b>from {euro(t.rate)}</b> a day
                          </>
                        ) : (
                          <>
                            <b>{euro(tot)}</b>
                            <span className={styles.dsPosterPp}>{group > 1 ? `${euro(Math.round(tot / group))} pp` : "total"}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The chosen day, large — under its poster, as before; then what it holds and the comparison */}
            {(() => {
              const idx = Math.max(0, TIER_CARDS.findIndex((x) => x.key === selKey));
              const t = TIER_CARDS[idx];
              const n = pickedExps.filter((e) => inCard(t, e.slug!)).length;
              const of = pickedExps.length;
              const tot = tierTotal(t.key);
              const dep = todayEur("deposit", tot, depositPercent);
              return (
                <div className={styles.dsOpen}>
                  <span className={styles.dsPointer} style={{ left: `${((idx * 2 + 1) / 6) * 100}%` }} aria-hidden />
                  <div key={t.key} className={`${styles.sigCard} ${styles.dsStage} ${styles.sigOn} ${styles.sigOpen}`}>
                    <Image
                      src={t.img}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 860px"
                      className={styles.sigImg}
                      style={{ objectPosition: t.pos }}
                    />
                    <span className={`${styles.sigShade} ${styles.dsFilmShade}`} aria-hidden />
                    <div className={styles.sigTop}>
                      <span className={styles.sigTier}>{t.c.tier}</span>
                      <span className={styles.sigChosen}>✓ {touched.card ? "Your day" : "Selected"}</span>
                    </div>
                    <div className={`${styles.sigBody} ${styles.dsStageBody}`}>
                      <div className={styles.dsStageTx}>
                        <span className={styles.sigKicker}>{t.c.kicker}</span>
                        <h4 className={`${styles.sigPlace} ${styles.dsFilmTitle}`}>{t.c.title}</h4>
                        <p className={styles.sigHook}>{t.c.hook}</p>
                        <ul className={styles.sigPoints}>
                          {t.c.points.map((pt) => (
                            <li key={pt}>{pt}</li>
                          ))}
                        </ul>
                        {of > 0 && (
                          <span className={`${styles.dsFit} ${n === of ? styles.dsFitAll : ""}`}>
                            {n === of
                              ? `✓ ${of === 1 ? "Your pick" : `All ${of} of your picks`} included`
                              : `${n} of ${of} picks included · ${of - n} arranged locally`}
                          </span>
                        )}
                      </div>
                      {/* the price, said plainly: total, per person, and what reserves it */}
                      <div className={styles.dsPriceBox}>
                        {proposal ? (
                          <>
                            <div className={styles.dsPriceRow}>
                              <span>A private proposal</span>
                              <b>from {euro(t.rate)}/day</b>
                            </div>
                            <p className={styles.dsGuarantee}>✓ No payment now · a reply within 24 hours</p>
                          </>
                        ) : (
                          <>
                            <div className={styles.dsPriceRow}>
                              <span>
                                Total · {glabel} · {days === 1 ? "1 day" : `${days} days`}
                              </span>
                              <b>{euro(tot)}</b>
                            </div>
                            {group > 1 && (
                              <div className={styles.dsPriceRow}>
                                <span>Per person</span>
                                <b>{euro(Math.round(tot / group))}</b>
                              </div>
                            )}
                            <div className={`${styles.dsPriceRow} ${styles.dsPriceKey}`}>
                              <span>
                                Reserve today <small>({depositPercent}%)</small>
                              </span>
                              <b>{euro(dep)}</b>
                            </div>
                            <p className={styles.dsPromises}>
                              <span title="Refundable until 48 hours before your trip">
                                <svg viewBox="0 0 16 16" aria-hidden>
                                  <path d="M8 1.5 2.5 3.6v4c0 3.3 2.3 5.8 5.5 6.9 3.2-1.1 5.5-3.6 5.5-6.9v-4L8 1.5Z" />
                                  <path d="m5.6 8.1 1.7 1.7 3.2-3.4" />
                                </svg>
                                Refundable until 48 h before
                              </span>
                              <span title="The first two hours, or we refund the rest">
                                <svg viewBox="0 0 16 16" aria-hidden>
                                  <circle cx="8" cy="8" r="6" />
                                  <path d="M8 4.6V8l2.3 1.5" />
                                </svg>
                                2-hour promise
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* what the chosen day holds, and how the three compare */}
                  <div className={`${styles.expCard} ${styles.dsAttach}`}>
                    <div className={styles.expInner}>
                      <div key={t.key} className={`${styles.dsDetailHead} ${styles.dsFade}`}>
                        <span className={styles.sigKicker}>Inside your {t.c.title} day</span>
                        <p className={styles.expLead}>{t.c.lead}</p>
                      </div>
                      <div className={`${styles.cmpScroll} ${styles.cmpDark}`}>
                        <table className={styles.cmpTable}>
                          <thead>
                            <tr>
                              <th scope="col" />
                              {TIER_CARDS.map((t) => (
                                <th key={t.key} scope="col" className={selKey === t.key ? styles.cmpOn : ""}>
                                  <button type="button" onClick={() => chooseCard(t.key, t.j)}>
                                    <span>{t.c.title}</span>
                                    <small>from {euro(t.rate)}/day</small>
                                  </button>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let group = "";
                              return COMPARE_ROWS.map((row) => {
                                if ("group" in row) {
                                  group = row.group;
                                  const g = row.group;
                                  const open = !!cmpOpen[g];
                                  return (
                                    <tr key={g} className={styles.cmpGroup}>
                                      <th colSpan={4} scope="colgroup">
                                        <button
                                          type="button"
                                          aria-expanded={open}
                                          onClick={() => setCmpOpen((o) => ({ ...o, [g]: !o[g] }))}
                                        >
                                          <span>{g}</span>
                                          <span className={styles.cmpFold} aria-hidden>
                                            {open ? "Hide −" : `Show ${CMP_COUNT[g] ?? ""} +`}
                                          </span>
                                        </button>
                                      </th>
                                    </tr>
                                  );
                                }
                                if (!cmpOpen[group]) return null;
                                return (
                                  <tr key={row[0]}>
                                    <th scope="row">{row[0]}</th>
                                    {TIER_CARDS.map((t) => {
                                      const v = row[CMP_COL[t.key]];
                                      return (
                                        <td
                                          key={t.key}
                                          className={`${selKey === t.key ? styles.cmpOn : ""} ${
                                            v === "✓" ? styles.cmpYes : v === "–" ? styles.cmpNo : styles.cmpText
                                          }`}
                                        >
                                          {v}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                      <p className={styles.dsReschedDark}>
                        <span aria-hidden>↻</span> Every day comes with flexible rescheduling: if your plans change,
                        tell us and we&apos;ll do our best to move your day to a new date. Anything marked
                        &ldquo;request locally&rdquo; your concierge still arranges on the day; it&apos;s paid locally.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

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
                id: "reality",
                lead: REALITY_LEAD,
                included: REALITY_INCLUDED,
                caveats: { label: "How it works", items: REALITY_LOCAL },
                note: "Tell your concierge what you're hunting for — we reply with a plan and the people to meet.",
              })}
            </>
            )}

          </div>

          {/* Step 4: finishing touches */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>4</div>
              <h3>Add the finishing touches</h3>
            </div>
            <div className={styles.pref}>
              {(
                <div className={`${styles.addon} ${styles.sel}`} style={{ cursor: "default", marginBottom: ".6rem" }}>
                  <span className={styles.chk}>✓</span>
                  <div>
                    <b style={{ fontWeight: 500 }}>
                      Photographed on your phone, throughout
                    </b>
                    <div className="muted" style={{ fontSize: ".76rem" }}>
                      We capture your private moments as they happen and never leave
                      your side — on your phone from the first moment, in full beauty,
                      as timeless memories.
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
                  ? "Everything Luxor is famous for in one unhurried day — the great temples and tombs, a felucca and the desert, entry to every visit handled."
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
                  Entry to every site you visit, a private felucca and the desert — all in the price.{" "}
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

            {/* Your choices, in one place — each one a tap from changing */}
            <ul className={styles.dsRecap}>
              <li>
                <span>Your day</span>
                <b>{dayName}</b>
                <button type="button" onClick={() => jumpTo("card")}>
                  Change
                </button>
              </li>
              <li>
                <span>What you&apos;d love</span>
                <b>
                  {myDay.picks.length > 0
                    ? `${myDay.picks.length} experience${myDay.picks.length > 1 ? "s" : ""}`
                    : "Shaped with your concierge"}
                </b>
                <button type="button" onClick={() => jumpTo("picks")}>
                  {myDay.picks.length > 0 ? "Change" : "Add"}
                </button>
              </li>
              <li>
                <span>Who &amp; how long</span>
                <b>
                  {bigGroup ? `${bigGroupCount} guests` : glabel} ·{" "}
                  {moreDays ? `${moreDaysCount} days` : days === 1 ? "1 day" : `${days} days`}
                </b>
                <button type="button" onClick={() => jumpTo("guests")}>
                  Change
                </button>
              </li>
            </ul>
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
                  {ORIG.summary.map((s) => (
                    <li key={s.title}>
                      <b>{s.title}</b>
                      <span>{s.desc}</span>
                    </li>
                  ))}
                </ul>
              ) : isLight ? (
                <ul className={styles.sumIncl}>
                  {ADV.summary.map((s) => (
                    <li key={s.title}>
                      <b>{s.title}</b>
                      <span>{s.desc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
              <ul className={styles.sumIncl}>
                {SIG.summary.map((s) => (
                  <li key={s.title}>
                    <b>{s.title}</b>
                    <span>{s.desc}</span>
                  </li>
                ))}
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
                {/* the experiences the guest picked ("Add to my day"), first */}
                {myDay.picks.length > 0 && (
                  <>
                    <li className={styles.dh}>
                      Your experiences · {myDay.picks.length} · about {myDay.days} day{myDay.days > 1 ? "s" : ""}
                    </li>
                    {myDay.picks.map((p) => (
                      <li key={"m" + p.slug}>{p.name}</li>
                    ))}
                    <li className={styles.sumPicksNote}>
                      Your concierge shapes the order and timing with you before the day.
                    </li>
                  </>
                )}
                {plan.start.length > 0 && <li className={styles.dh}>{plan.startTitle}</li>}
                {plan.start.map((it, i) => (
                  <li key={"s" + i} className={itemClasses(it)}>
                    {itemText(it)}
                  </li>
                ))}
                {plan.pool.length > 0 && myDay.picks.length === 0 && (
                  <>
                    <li className={styles.dh}>The best of Luxor · your choice</li>
                    {plan.pool.map((it, i) => (
                      <li key={"p" + i} className={itemClasses(it)}>
                        {itemText(it)}
                      </li>
                    ))}
                  </>
                )}
                {plan.bonus.length > 0 && (
                  <>
                    <li className={`${styles.dh} ${styles.dhBonus}`}>Signature experiences · included</li>
                    {plan.bonus.map((it, i) => (
                      <li key={"b" + i} className={itemClasses(it)}>
                        {itemText(it)}
                        {typeof it === "object" && it.bonus && (
                          <span className={styles.bpill}>Signature</span>
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
                              : "The same Signature day, gifts and promise — first two hours, or we refund the rest"}
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
                ? "Transfer, concierge, the must-sees & a Nile sail included · more on request"
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
                <span className={styles.sumChip}>The best of Luxor</span>
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
            </div>
            <div ref={dateFieldRef}>
              <AvailabilityDate
                ref={dateInputRef}
                value={tripDate}
                days={days}
                error={dateError}
                onChange={(d) => {
                  setTripDate(d);
                  setDateError(false);
                  if (error) setError("");
                }}
              />
            </div>

            {/* pay + CTA — kept tight and high so the button never drops below the fold */}
            <div className={styles.sumSub}>How you&apos;d like to pay</div>
            <PaymentChoice
              total={total}
              depositPercent={depositPercent}
              tripDate={tripDate || undefined}
              pay={pay}
              onPay={setPay}
            />
            <label className={styles.sumConsent} data-hide-chat>
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
                : payCta(pay, total, depositPercent)}
            </a>
            {error && (
              <div role="alert" className={styles.sumCancel} style={{ color: "#9a2b2b" }}>
                {error}
              </div>
            )}
            <PaymentReassure
              pay={pay}
              total={total}
              depositPercent={depositPercent}
              tripDate={tripDate || undefined}
              guarantee={
                <>
                  <b>The first two hours, or we refund the rest.</b> If your day isn&apos;t what we
                  promised, tell us in the first two hours. If we can&apos;t put it right, we
                  stop there and refund what&apos;s left after costs already committed.
                </>
              }
            />
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
            : `your ${isLight ? "day" : "journey"}: ${euro(total)}${tripDate ? " · " + stayText : " · free cancellation until 48h before"}`
        }
        ctaHref="#book"
        onCtaClick={goToNextStep}
        ctaLabel={proposal ? "Request your proposal →" : "See your day & price →"}
        ctaShort={proposal ? "Request →" : "Reserve →"}
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
