"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DayConfigurator.module.css";
import StickyBar from "./StickyBar";
import { GIFTS, giftsForDays } from "./GiftMarks";
import { useDayCount } from "./DayCount";
import { trackBeginCheckout } from "@/lib/analytics";
import { dayTotal, lightTotal, LIGHT_DAY_RATE, PHOTO_PRO } from "@/lib/pricing-math";

type DayCount = 1 | 2 | 3 | 4;
type SignatureJourney = "medinet" | "karnak" | "balloon";
type Journey = SignatureJourney | "light";
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
    name: "Adventure Light",
    temple: "Your concierge, on the ground all day",
    companion: "Planned with you — paid locally as you go",
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
const SIGNATURE_META = "Your concierge + 3 experiences + a signature gift";
const JOURNEY_NOTE =
  "Every Signature day is three hand-picked experiences in a crafted order — with your own concierge end to end: driver, planner, translator and fixer. The full journey holds all 10; add days to unlock more, with signature bonuses and a gift along the way.";
const CONSIGLIERE_INTRO =
  "No fixed plan — just your own person on the ground: a trusted driver, translator and fixer who opens doors and sorts everything on the spot. Your advisor on WhatsApp before you arrive; then bring local cash and go with the flow.";
const CONSIGLIERE_META = "Concierge all day · a small gift · you pay locally";

const MORE_DAYS_MSG =
  "Five days or more — slower still, and shaped entirely around you. Your concierge sends a private proposal.";

// Adventure Light — your own person on the ground. Said plainly, so nobody
// arrives expecting the Signature day.
const LIGHT_INCLUDED = [
  "Your own person on the ground — a trusted driver, translator and fixer all day",
  "Your planner on WhatsApp from the moment you book — the trip mapped out with you before you arrive",
  "Anything that comes up, sorted on the spot — bookings, timings and the little hiccups",
  "Someone who knows the place — and gets you in, from temple doors to the best local tables",
  "Tickets, queues and timings handled as you go",
  "Still reachable after you fly home",
  "A small gift from your concierge",
];
const LIGHT_LOCAL = [
  "No experiences are booked in advance — bring local cash and pay as you go",
  "Entry tickets, experiences, meals and tips are paid locally, on the day — local prices vary with the season",
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
  };
  const journeyImg = (j: Journey) =>
    j === "medinet"
      ? img.journeyMedinet
      : j === "karnak"
        ? img.journeyKarnak
        : j === "balloon"
          ? img.journeyBalloon
          : img.journeyLight;
  const { days, setDays } = useDayCount();
  const [group, setGroup] = useState(2);
  const [journey, setJourney] = useState<Journey>("medinet");
  const isLight = journey === "light";
  // 5+ guests or 5+ days → a private proposal. The checkout column keeps its
  // look but turns into a short request form instead of a payment.
  const [bigGroup, setBigGroup] = useState(false);
  const [bigGroupCount, setBigGroupCount] = useState(6);
  const [moreDays, setMoreDays] = useState(false);
  const [moreDaysCount, setMoreDaysCount] = useState(5);
  const proposal = bigGroup || moreDays;
  const [eq, setEq] = useState({ name: "", email: "", phone: "", message: "" });
  const [eqSent, setEqSent] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [hurg, setHurg] = useState(false);
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

  // End-to-end concierge transfer (Marsa Alam / Hurghada) — a special bundled
  // rate offered only with Design Your Day. The server (quote.ts) uses the same
  // figure from the concierge-sea-transfer product so client and server agree.
  const seaPrice = 290;

  function addonsCost() {
    let c = 0;
    if (photo) c += PHOTO_PRO;
    if (hurg) c += seaPrice;
    return c;
  }
  // Signature days scale by guests and get the volume discount; Adventure Light
  // is a flat concierge rate per day for the group.
  const baseTotal = (d: number) =>
    isLight
      ? lightTotal(d, group, lightDayRate)
      : dayTotal(d, group, dayRate, volumeDiscount, groupSupplement);
  const total = baseTotal(days) + addonsCost();

  // Signature gifts: one per full concierge day, up to the set of three. The
  // configurator shows exactly what the current day count unlocks, and nudges
  // toward completing the set. Adventure Light carries a single small gift.
  const giftCount = isLight ? 0 : moreDays ? 3 : giftsForDays(days);
  const giftsLabel = isLight ? "A gift" : `${giftCount} gift${giftCount > 1 ? "s" : ""}`;
  const giftMsg =
    giftCount >= 3
      ? "The full set — all three signature gifts, hand-picked and yours to keep."
      : giftCount === 2
        ? "Two gifts so far. Add a third day to complete the set with the Crown."
        : "The Sistrum is yours. Add a second day to unlock the Sceptre.";
  // The gold "Save" badge shows the Design Your Day product's own saving (the
  // multi-day volume discount, scaling with days + guests) — not the à-la-carte
  // comparison, which stays below as a separate angle.
  const dydSaving = isLight ? 0 : daySaving(days, group, dayRate, volumeDiscount, groupSupplement);
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
      if (hurg) extras.push("End-to-end concierge transfer from the coast (Marsa Alam or Hurghada)");
      if (photo) extras.push("Private photographer / videographer for your day");
      return {
        start: [] as PlanItem[],
        startTitle: "Adventure Light · concierge only",
        pool: [] as PlanItem[],
        bonus: [] as PlanItem[],
        handled: [...extras, ...LIGHT_INCLUDED] as PlanItem[],
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
    if (hurg) handled.push("End-to-end concierge transfer from the coast (Marsa Alam or Hurghada)");
    handled.push("Your own licensed Egyptologist — every day");
    handled.push("All monument entry tickets for " + gl);
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
      startTitle: "Day 1 · " + j.name,
      pool,
      bonus,
      handled,
    };
  }, [journey, group, photo, days, hurg]);

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
  const showSavings = !isLight && sepTotal > total;

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
      isLight
        ? "Adventure Light (concierge only)"
        : `Signature day: ${JOURNEY[journey].name} (first: ${JOURNEY[journey].temple.split(" — ")[0]})`,
      isLight ? "" : "Sunset: Nile or desert, chosen with the concierge",
      photo ? "Add-on: private photographer / videographer" : "",
      hurg ? "Add-on: End-to-end concierge transfer (sea)" : "",
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
    const name = isLight ? `${days}-day Adventure Light` : `${days}-day Concierge Journey`;
    const slug = isLight ? `concierge-light-${days}d` : `concierge-day-${days}d`;
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
          seaTransfer: hurg,
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
              Start with the day you&apos;re dreaming of. Pick a Signature journey — or hand the
              whole day to your concierge.
            </p>
            {/* three Signature journeys: the feeling leads, the shared promise sits below */}
            <div className={styles.sigCards}>
              {SIGNATURE_CARDS.map((c) => {
                const on = journey === c.key;
                return (
                  <div
                    key={c.key}
                    role="button"
                    tabIndex={0}
                    aria-pressed={on}
                    aria-label={JOURNEY[c.key].name}
                    className={`${styles.sigCard} ${on ? styles.sigOn : ""}`}
                    onClick={() => setJourney(c.key)}
                    onKeyDown={(e) => pickKey(e, () => setJourney(c.key))}
                  >
                    <Image
                      src={journeyImg(c.key)}
                      alt=""
                      fill
                      sizes="(max-width: 560px) 90vw, 290px"
                      className={styles.sigImg}
                    />
                    <span className={styles.sigShade} aria-hidden />
                    <div className={styles.sigTop}>
                      <span className={styles.sigTier}>✦ Signature</span>
                      {on && <span className={styles.sigChosen}>✓ Your day</span>}
                    </div>
                    <div className={styles.sigBody}>
                      <h4 className={styles.sigPlace}>{JOURNEY[c.key].name}</h4>
                      <p className={styles.sigHook}>{c.intro}</p>
                      <span className={styles.sigMeta}>{SIGNATURE_META}</span>
                      <div className={styles.sigFoot}>
                        <span className={styles.sigPrice}>
                          <small>from</small> {euro(dayRate)}
                          <small>/day</small>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={styles.journeyNote}>{JOURNEY_NOTE}</p>

            <div className={styles.cardsOr}>
              <span>or — hand us the day entirely</span>
            </div>
            {/* The Consigliere — same card family, a calmer wide card */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={isLight}
              aria-label="Adventure Light — your own concierge"
              className={`${styles.sigCard} ${styles.sigCardWide} ${isLight ? styles.sigOn : ""}`}
              onClick={() => setJourney("light")}
              onKeyDown={(e) => pickKey(e, () => setJourney("light"))}
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
                <span className={styles.sigTier}>Pay as you go</span>
                {isLight ? (
                  <span className={styles.sigChosen}>✓ Your day</span>
                ) : (
                  <span className={styles.sigSave}>Most flexible</span>
                )}
              </div>
              <div className={styles.sigBody}>
                <span className={styles.sigKicker}>Your own concierge</span>
                <h4 className={styles.sigPlace}>Adventure Light</h4>
                <p className={styles.sigHook}>{CONSIGLIERE_INTRO}</p>
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

            {isLight && (
              <div className={styles.lightInfo}>
                <div>
                  <span className={styles.feelEyebrow}>Included</span>
                  <ul className={styles.lightList}>
                    {LIGHT_INCLUDED.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className={styles.feelEyebrow}>Paid locally, on the day</span>
                  <ul className={`${styles.lightList} ${styles.lightLocal}`}>
                    {LIGHT_LOCAL.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <p className={styles.lightAsk}>
                    Go with the flow — tell us what you need, and we&apos;ll arrange it.
                  </p>
                </div>
              </div>
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
                const sv = isLight ? 0 : daySaving(d, group, dayRate, volumeDiscount, groupSupplement);
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
                    {d === 3 && !isLight && <span className={styles.pop}>Most popular</span>}
                    <div className={styles.dn}>
                      {d} {d > 1 ? "days" : "day"}
                    </div>
                    <div className={styles.dp}>{euro(baseTotal(d))}</div>
                    <div className={styles.dsave}>{sv > 0 ? "save " + euro(sv) : " "}</div>
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
            {isLight ? (
              <div className={styles.grpNote}>
                {moreDays
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
              {!isLight && (
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
                className={`${styles.addon} ${hurg ? styles.sel : ""}`}
                style={{ marginTop: ".6rem" }}
                onClick={() => setHurg((h) => !h)}
              >
                <span className={styles.chk}>✓</span>
                <div>
                  <b style={{ fontWeight: 500 }}>
                    End-to-end concierge transfer{" "}
                    <span className={styles.addonRec}>Recommended</span>
                  </b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    Coming from the sea? Your concierge collects you in Marsa Alam
                    or Hurghada and delivers you back, door to door — and the
                    private car stays with you for the whole stay, wherever the
                    days go. A special rate, only with Design Your Day.
                  </div>
                </div>
                <span className={styles.ax}>+€{seaPrice}</span>
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
                alt={JOURNEY[journey].name}
                fill
                sizes="(max-width: 820px) 100vw, 460px"
                className={styles.visHeroImg}
              />
              <span className={styles.visHeroScrim} aria-hidden />
              <div className={styles.visHeroCap}>
                <span className={styles.visEyebrow}>
                  {isLight ? "Luxor Rising · Concierge" : "Luxor Rising · Signature day"}
                </span>
                <h4 className={styles.visJourney}>
                  {isLight ? "Your own concierge" : JOURNEY[journey].name}
                </h4>
              </div>
              {/* the presents, glowing over the image */}
              <div className={styles.visGifts}>
                {isLight ? (
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
              {isLight
                ? "A trusted driver, translator and friend on the ground — everything handled on the spot."
                : proposal
                  ? "The same Signature day, made to measure — shaped around your group, at your pace."
                  : FEEL[days]}
            </p>
            <p className={styles.visGiftLine}>
              {isLight ? (
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

            {!isLight && (
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
              {isLight ? (
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
                    <b>A small gift</b>
                    <span>from your concierge, yours to keep</span>
                  </li>
                  <li>
                    <b>Paid locally, in cash</b>
                    <span>entry tickets, experiences, meals &amp; tips</span>
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
                  <b>Day 1 · {JOURNEY[journey].name}</b>
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
                  ? isLight
                    ? "Hide the details"
                    : "Hide full itinerary"
                  : isLight
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
                  {isLight ? "Adventure Light · included" : "Handled for you, throughout"}
                </li>
                {plan.handled.map((it, i) => (
                  <li key={"h" + i} className={itemClasses(it)}>
                    {itemText(it)}
                  </li>
                ))}
                {isLight && (
                  <>
                    <li className={styles.dh}>Paid locally, on the day</li>
                    {LIGHT_LOCAL.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                    <li>Tell us what you need — and we&apos;ll arrange it</li>
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
                    <span className={styles.propEyebrow}>Your private proposal</span>
                    <h4 className={styles.propTitle}>
                      {bigGroup && moreDays
                        ? `${bigGroupCount} of you, ${moreDaysCount} days`
                        : bigGroup
                          ? `A day for ${bigGroupCount} of you`
                          : `${moreDaysCount} days in Luxor`}
                    </h4>
                    <p className={styles.propText}>
                      Larger groups and longer journeys are shaped personally —{" "}
                      {isLight ? "the same concierge" : `the same ${JOURNEY[journey].name} day`},
                      arranged around you. Tell us where to reach you; your concierge replies with
                      a proposal and a price.
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
                          {isLight
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
            {/* price */}
            <div className={styles.sumPriceblock}>
              <div className={styles.sumPrice}>{euro(total)}</div>
              {dydSaving > 0 && (
                <span className={styles.sumSavepill}>Save {euro(dydSaving)}</span>
              )}
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
            {isLight ? (
              <div className={styles.sumChips}>
                <span className={styles.sumChip}>Concierge all day</span>
                <span className={styles.sumChip}>Planned with you</span>
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>A gift — to keep</span>
                <span className={styles.sumChip}>Entries paid locally</span>
              </div>
            ) : (
              <div className={styles.sumChips}>
                <span className={styles.sumChip}>{expCount} experiences</span>
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
        name={isLight ? "Adventure Light" : "Concierge Day"}
        meta={
          proposal
            ? "private proposal · reply in 24h"
            : `your ${isLight ? "day" : "journey"}: ${euro(total)}${tripDate ? " · " + fmtDate(tripDate) : ""} · 7-day free cancellation`
        }
        ctaHref="#book"
        ctaLabel={proposal ? "Request your proposal →" : "See your day & price →"}
        revealOnScroll={false}
        extra={
          isLight ? (
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
