"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./DayConfigurator.module.css";
import StickyBar from "./StickyBar";
import { useDayCount } from "./DayCount";
import { trackBeginCheckout } from "@/lib/analytics";

type DayCount = 1 | 2 | 3 | 4;
type Journey = "medinet" | "karnak" | "balloon";
type Water = "nile" | "picnic" | "custom";
type Pay = "full" | "deposit";

export type VolumeDiscountTier = { minDays: number; discountPercent: number };
export type GroupSupplementTier = { minGuests: number; extraPerDay: number };

const WATER: Record<Water, string> = {
  nile: "Sunset sail on the Nile",
  picnic: "Desert sunset picnic",
  custom: "A sunset of your choosing",
};
function otherWater(w: Water): Water {
  return w === "nile" ? "picnic" : "nile";
}
const JOURNEY: Record<
  Journey,
  { name: string; temple: string; companion: string }
> = {
  medinet: {
    name: "Where it began",
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
    temple: "Hot-air balloon at dawn — up over the West Bank like an eagle",
    companion: "Then the day flows, decided with your concierge",
  },
};
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
};
const FILL: Record<DayCount, number> = { 1: 12, 2: 52, 3: 100, 4: 100 };
const STAGE: Record<DayCount, string> = {
  1: "A taste",
  2: "Taking shape",
  3: "The signature",
  4: "Unhurried",
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
  ["photoshoot", 120],
  ["balloon", 230],
  ["Sailing lesson", 140],
  ["Egyptologist", 140],
  ["air-conditioned transfers", 90],
  ["Hurghada", 150],
];

const IMG_POOL = [
  "/images/karnak-columns-detail.jpg",
  "/images/valley-kings-tomb-pillar.jpg",
  "/images/nile-river-solo.jpg",
  "/images/desert-dinner-table.jpg",
  "/images/temple-stone-relief.jpg",
  "/images/west-bank-dawn.jpg",
  "/images/desert-stargazing-dune.jpg",
  "/images/nile-felucca-table.jpg",
];

function euro(n: number) {
  return "€" + n.toLocaleString("en-US");
}
function extraPerDay(g: number, groupSupplement: GroupSupplementTier[]) {
  let s = 0;
  for (let i = 2; i <= g; i++) {
    const tier = groupSupplement.find((t) => t.minGuests === i);
    if (tier) s += tier.extraPerDay;
  }
  return s;
}
function discountForDays(d: number, volumeDiscount: VolumeDiscountTier[]) {
  let best: VolumeDiscountTier | null = null;
  for (const t of volumeDiscount) {
    if (d >= t.minDays && (!best || t.minDays > best.minDays)) best = t;
  }
  return best ? best.discountPercent : 0;
}
function dayTotal(
  d: DayCount,
  g: number,
  dayRate: number,
  volumeDiscount: VolumeDiscountTier[],
  groupSupplement: GroupSupplementTier[]
) {
  const discount = discountForDays(d, volumeDiscount);
  return Math.round(dayRate * d * (1 - discount / 100)) + d * extraPerDay(g, groupSupplement);
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
  sunsetNile?: string;
  sunsetPicnic?: string;
  sunsetCustom?: string;
};

type DayConfiguratorProps = {
  dayRate?: number;
  volumeDiscount?: VolumeDiscountTier[];
  groupSupplement?: GroupSupplementTier[];
  depositPercent?: number;
  images?: DayConfiguratorImages;
  /** À-la-carte price map (substring → price) sourced from the live experience
   *  catalogue, so the breakdown matches real product prices. Falls back to the
   *  built-in table if not supplied. */
  priceTable?: [string, number, boolean?][];
  /** Brand titles (substring → poetic product title) for signature experiences,
   *  shown as a small italic subtitle under the place name in the breakdown. */
  brandTable?: [string, string][];
};

export default function DayConfigurator({
  dayRate = 450,
  volumeDiscount = [
    { minDays: 2, discountPercent: 5.56 },
    { minDays: 3, discountPercent: 11.11 },
    { minDays: 4, discountPercent: 12.22 },
  ],
  groupSupplement = [
    { minGuests: 2, extraPerDay: 85 },
    { minGuests: 3, extraPerDay: 70 },
    { minGuests: 4, extraPerDay: 55 },
  ],
  depositPercent = 50,
  images = {},
  priceTable,
  brandTable,
}: DayConfiguratorProps) {
  // Prices come from the live catalogue when supplied (keeps the breakdown in
  // sync with real product prices); the built-in table is only a fallback.
  const table = priceTable && priceTable.length ? priceTable : PRICE_TABLE;
  const priceOf = (nm: string) => {
    for (const [k, v] of table) if (nm.indexOf(k) >= 0) return v;
    return 0;
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
    sunsetNile: images.sunsetNile || "/images/nile-river-solo.jpg",
    sunsetPicnic: images.sunsetPicnic || "/images/desert-dinner-table.jpg",
    sunsetCustom: images.sunsetCustom || "/images/desert-stargazing-dune.jpg",
  };
  const { days, setDays } = useDayCount();
  const [group, setGroup] = useState(2);
  const [water, setWater] = useState<Water>("nile");
  const [journey, setJourney] = useState<Journey>("medinet");
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

  const photoIncluded = days >= 3;
  const photoActive = photoIncluded || photo;

  // Hurghada → Luxor transfer upsell — real price pulled from the
  // hurghada-to-luxor-crossing product via the Keystatic-fed price table.
  const hurgPrice = priceOf("Hurghada") || 150;

  function addonsCost() {
    let c = 0;
    if (photo && days < 3) c += 120;
    if (hurg) c += hurgPrice;
    return c;
  }
  const total = dayTotal(days, group, dayRate, volumeDiscount, groupSupplement) + addonsCost();
  const perPerson = Math.round(total / group);
  const deposit = Math.round((total * depositPercent) / 100);

  const plan = useMemo(() => {
    const j = JOURNEY[journey];
    const a = ALT[journey];
    const gl = group + (group > 1 ? " guests" : " guest");
    const start: PlanItem[] = [];
    start.push({ t: j.temple, sig: journey === "medinet" });
    start.push({ t: j.companion, follows: true });
    start.push({ t: WATER[water] });
    if (photo && days < 3) start.push("Private photoshoot of your day");

    const pool: PlanItem[] = [];
    const bonus: PlanItem[] = [];
    if (days >= 2) {
      pool.push("Valley of the Kings");
      pool.push({ t: a.temple, auto: true, sig: a.tsig });
      pool.push({ t: a.companion, auto: true });
      pool.push({ t: WATER[otherWater(water)], auto: true });
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
      if (journey !== "balloon") pool.push("Hot-air balloon at dawn over the West Bank");
      bonus.push({
        t: "Sailing lesson on the Nile — take the tiller yourself (€140), included",
        sig: true,
        bonus: true,
      });
    }
    const handled: PlanItem[] = [];
    if (hurg) handled.push("Hurghada hotel pickup & private desert crossing");
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
  }, [journey, group, water, photo, days, hurg]);

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
      const pr = priceOf(nm);
      if (pr > 0) {
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
  const showSavings = sepTotal > total;

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

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.min = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    }
  }, []);

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
    const name = `${days}-day Concierge Journey`;
    const slug = `concierge-day-${days}d`;
    const eveningLabel =
      water === "nile" ? "Sunset sail on the Nile" : water === "picnic" ? "Desert sunset picnic" : "Evening — client to choose";
    const preferences = [
      `${days} day${days > 1 ? "s" : ""}`,
      `${group} guest${group > 1 ? "s" : ""}`,
      `Journey: ${JOURNEY[journey].name} (first temple: ${JOURNEY[journey].temple.split(" — ")[0]})`,
      `Evening: ${eveningLabel}`,
      photo ? "Add-on: private photoshoot" : "",
      hurg ? "Add-on: Hurghada round-trip transfer" : "",
    ]
      .filter(Boolean)
      .join(" · ");
    trackBeginCheckout({
      value: total,
      currency: "EUR",
      items: [{ item_id: slug, item_name: name, price: total, quantity: group }],
    });
    setError("");
    setLoading(true);
    const amount = pay === "full" ? total : deposit;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          amountCents: amount * 100,
          totalCents: total * 100,
          mode: pay,
          guests: group,
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
          {/* Step 1: days */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>1</div>
              <h3>How many days with us?</h3>
            </div>
            <div className={styles.daysGrid}>
              {([1, 2, 3, 4] as DayCount[]).map((d) => {
                const tot = dayTotal(d, group, dayRate, volumeDiscount, groupSupplement);
                const sv = dayTotal(1, group, dayRate, volumeDiscount, groupSupplement) * d - tot;
                return (
                  <div
                    key={d}
                    className={`${styles.dayTile} ${days === d ? styles.sel : ""}`}
                    onClick={() => setDays(d)}
                  >
                    {d === 3 && <span className={styles.pop}>Most popular</span>}
                    <div className={styles.dn}>
                      {d} {d > 1 ? "days" : "day"}
                    </div>
                    <div className={styles.dp}>{euro(tot)}</div>
                    <div className={styles.dper}>{euro(Math.round(tot / d))} / day</div>
                    <div className={styles.dsave}>{sv > 0 ? "save " + euro(sv) : ""}</div>
                  </div>
                );
              })}
            </div>
            <div
              className={`${styles.initbar} ${days >= 3 ? styles.full : ""} ${
                days >= 4 ? styles.absorbed : ""
              }`}
            >
              <div className={styles.ibBg}>
                {Array.from({ length: expCount }).map((_, i) => (
                  <span
                    key={i}
                    className={styles.ibSlice}
                    style={{
                      backgroundImage: `url('${IMG_POOL[i % IMG_POOL.length]}')`,
                    }}
                  />
                ))}
              </div>
              <div className={styles.ibOv} />
              <div className={styles.ibHead}>
                <span className={styles.ibTitle}>The Luxor Rising experience</span>
                <span className={styles.ibStage}>{STAGE[days]}</span>
              </div>
              <div className={styles.ibCount}>
                <b>{expCount}</b>
                <span>experiences included</span>
              </div>
              <div className={`${styles.ibSigb} ${sigbCount > 0 ? styles.on : ""}`}>
                <span className={styles.star}>★</span>
                <span>
                  {sigbCount > 0
                    ? sigbCount + (sigbCount > 1 ? " signature bonuses included" : " signature bonus included")
                    : ""}
                </span>
              </div>
              <div className={styles.ibTrack}>
                <div className={styles.ibFill} style={{ width: FILL[days] + "%" }} />
                {[1, 2, 3].map((n, i) => (
                  <span
                    key={n}
                    className={`${styles.ibNode} ${days >= n ? styles.reached : ""} ${
                      days >= 3 && n === 3 ? styles.full : ""
                    }`}
                    style={{ left: [4, 50, 96][i] + "%" }}
                  />
                ))}
              </div>
              <div className={styles.ibLabels}>
                <span>1 day</span>
                <span>2 days</span>
                <span>3 days</span>
              </div>
              <div className={styles.ibMsg}>{IBMSG[days]}</div>
            </div>
          </div>

          {/* Step 2: group */}
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
                  className={`${styles.grp} ${group === g ? styles.sel : ""}`}
                  onClick={() => setGroup(g)}
                >
                  {g === 1 ? "Just me" : g === 2 ? "Two of us" : `${g} of us`}
                </button>
              ))}
            </div>
            <div className={styles.grpNote}>
              {group > 1
                ? euro(perPerson) + " per person — adding guests lowers the per-person rate."
                : "Travelling with your partner or friends? Add them — the per-person price drops."}
            </div>
          </div>

          {/* Step 3: preferences (date moved to the checkout card, right) */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>3</div>
              <h3>Your preferences</h3>
            </div>

            <div className={`${styles.pref} ${styles.prefJourney}`}>
              <div className={styles.prefQ}>First — where does your story begin?</div>
              <div className={styles.prefNote}>
                Your opening sets the tone of the whole journey — arranged privately, before the crowds.
              </div>
              <div className={styles.journeyCards}>
                <div
                  className={`${styles.jcard} ${journey === "medinet" ? styles.sel : ""}`}
                  onClick={() => setJourney("medinet")}
                >
                  <div className={styles.jcImg}>
                    <Image src={img.journeyMedinet} alt="Medinet Habu" fill sizes="240px" />
                    <span className={styles.jcSig}>Signature ★</span>
                    <div className={styles.jcCap}>
                      <span className={styles.jcEyebrow}>Initiation to power</span>
                      <h4>Medinet Habu</h4>
                    </div>
                  </div>
                  <div className={styles.jcBody}>
                    <p>Where Ramesses III forged his power. Begin by claiming your own.</p>
                    <div className={styles.jcPair}>
                      <span className={styles.jcPairLbl}>then</span>
                      <span className={styles.jcPairName}>Hatshepsut Temple</span>
                    </div>
                    <span className={styles.jcPick}>
                      {journey === "medinet" ? "✓ This is your beginning" : "Begin here instead →"}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.jcard} ${journey === "karnak" ? styles.sel : ""}`}
                  onClick={() => setJourney("karnak")}
                >
                  <div className={styles.jcImg}>
                    <Image src={img.journeyKarnak} alt="Karnak at Dawn" fill sizes="240px" />
                    <div className={styles.jcCap}>
                      <span className={styles.jcEyebrow}>The Ancient Journey</span>
                      <h4>Karnak at Dawn</h4>
                    </div>
                  </div>
                  <div className={styles.jcBody}>
                    <p>The greatest temple ever built. Begin your story at its source.</p>
                    <div className={styles.jcPair}>
                      <span className={styles.jcPairLbl}>then</span>
                      <span className={styles.jcPairName}>Luxor Temple</span>
                    </div>
                    <span className={styles.jcPick}>
                      {journey === "karnak" ? "✓ This is your beginning" : "Begin here instead →"}
                    </span>
                  </div>
                </div>
                <div
                  className={`${styles.jcard} ${journey === "balloon" ? styles.sel : ""}`}
                  onClick={() => setJourney("balloon")}
                >
                  <div className={styles.jcImg}>
                    <Image src={img.journeyBalloon} alt="Hot-air balloon at dawn" fill sizes="240px" />
                    <div className={styles.jcCap}>
                      <span className={styles.jcEyebrow}>Fly like an eagle</span>
                      <h4>Balloons at sunrise</h4>
                    </div>
                  </div>
                  <div className={styles.jcBody}>
                    <p>Rise over the West Bank at first light — then go with the flow, and decide what follows together with your concierge.</p>
                    <div className={styles.jcPair}>
                      <span className={styles.jcPairLbl}>then</span>
                      <span className={styles.jcPairName}>You &amp; your concierge</span>
                    </div>
                    <span className={styles.jcPick}>
                      {journey === "balloon" ? "✓ This is your beginning" : "Begin here instead →"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.pref}>
              <div className={styles.prefQ}>Then — choose your sunset</div>
              <div className={styles.prefOpts}>
                <div
                  className={`${styles.opt} ${water === "nile" ? styles.sel : ""}`}
                  onClick={() => setWater("nile")}
                >
                  <span className={styles.thumb}>
                    <Image src={img.sunsetNile} alt="" fill sizes="46px" />
                  </span>
                  <span>Sunset sail on the Nile</span>
                  <span className={styles.dot} />
                </div>
                <div
                  className={`${styles.opt} ${water === "picnic" ? styles.sel : ""}`}
                  onClick={() => setWater("picnic")}
                >
                  <span className={styles.thumb}>
                    <Image src={img.sunsetPicnic} alt="" fill sizes="46px" />
                  </span>
                  <span>Desert sunset picnic</span>
                  <span className={styles.dot} />
                </div>
                <div
                  className={`${styles.opt} ${water === "custom" ? styles.sel : ""}`}
                  onClick={() => setWater("custom")}
                >
                  <span className={styles.thumb}>
                    <Image src={img.sunsetCustom} alt="" fill sizes="46px" />
                  </span>
                  <span>Something else — tell your concierge</span>
                  <span className={styles.dot} />
                </div>
              </div>
              <div className={styles.grpNote}>
                {water === "custom"
                  ? "Have something particular in mind? Your concierge shapes it around you — just say the word."
                  : "Whichever you choose first, the other is arranged for you on a later day."}
              </div>
            </div>

            <div className={styles.pref}>
              <div className={styles.prefQ}>Add the finishing touches</div>
              <div
                className={`${styles.addon} ${photoActive ? styles.sel : ""}`}
                onClick={() => {
                  if (days >= 3) return;
                  setPhoto((p) => !p);
                }}
              >
                <span className={styles.chk}>✓</span>
                <div>
                  <b style={{ fontWeight: 500 }}>Private photoshoot</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    A photographer captures your day
                  </div>
                </div>
                <span className={styles.ax}>{days >= 3 ? "Included" : "+€120"}</span>
              </div>
              <div
                className={`${styles.addon} ${hurg ? styles.sel : ""}`}
                style={{ marginTop: ".6rem" }}
                onClick={() => setHurg((h) => !h)}
              >
                <span className={styles.chk}>✓</span>
                <div>
                  <b style={{ fontWeight: 500 }}>
                    Hurghada ⇄ Luxor day trip{" "}
                    <span className={styles.addonRec}>Recommended</span>
                  </b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    Coming from the Red Sea? The original private round-trip —
                    collected door-to-door, an unhurried day in Luxor, home the
                    same night, timed with your concierge.{" "}
                    <Link
                      href="/experiences/hurghada-to-luxor-crossing"
                      className={styles.addonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      See details →
                    </Link>
                  </div>
                </div>
                <span className={styles.ax}>+€{hurgPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className={styles.summary}>
            {/* banner — the journey you're building, with the theme as its title */}
            <div className={styles.sumImg}>
              <Image
                src={
                  journey === "medinet"
                    ? img.journeyMedinet
                    : journey === "karnak"
                      ? img.journeyKarnak
                      : img.journeyBalloon
                }
                alt={JOURNEY[journey].name}
                fill
                sizes="(max-width: 920px) 100vw, 380px"
              />
              <div className={styles.sumImgScrim} />
              <div className={styles.sumImgCap}>
                <span className={styles.sumH}>Your concierge journey</span>
                <span className={styles.sumJourney}>{JOURNEY[journey].name}</span>
                <span className={styles.sumJourneyFeel}>{FEEL[days]}</span>
              </div>
            </div>

            {/* social proof — a high-ticket day needs trust up front */}
            <div className={styles.sumStars}>
              <span className={styles.stars}>★★★★★</span> 4.9 · 60+ private days arranged in Luxor
            </div>

            {/* price */}
            <div className={styles.sumPriceblock}>
              <div className={styles.sumPrice}>{euro(total)}</div>
              {showSavings && (
                <span className={styles.sumSavepill}>Save {euro(sepTotal - total)}</span>
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
            <div className={styles.sumChips}>
              <span className={styles.sumChip}>{expCount} experiences</span>
              {plan.bonus.length > 0 && (
                <span className={`${styles.sumChip} ${styles.sumChipFree}`}>
                  {plan.bonus.length} signature bonus{plan.bonus.length > 1 ? "es" : ""} — free
                </span>
              )}
              <span className={styles.sumChip}>Everything handled</span>
            </div>

            {/* date — moved into the card so checkout is self-contained */}
            <div className={styles.sumSubRow}>
              <span className={styles.sumSub}>Your date</span>
              <span className={styles.sumScar}>Only one group a day</span>
            </div>
            <div ref={dateFieldRef} className={`${styles.sumDate} ${dateError ? styles.err : ""}`}>
              <input
                ref={dateInputRef}
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
              <div
                className={`${styles.pay} ${pay === "deposit" ? styles.sel : ""}`}
                onClick={() => setPay("deposit")}
              >
                <span className={styles.payRec}>Easiest</span>
                <b>{euro(deposit)}</b>
                <span>to reserve · balance the day before</span>
              </div>
              <div
                className={`${styles.pay} ${pay === "full" ? styles.sel : ""}`}
                onClick={() => setPay("full")}
              >
                <b>{euro(total)}</b>
                <span>Pay in full</span>
              </div>
            </div>
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

            {/* what you get — below the CTA, so it reassures without pushing the button down */}
            <div className={styles.sumDetails}>
              <div className={styles.sumSub}>What&apos;s included</div>
              <ul className={styles.sumIncl}>
                <li>
                  <b>Day 1 · {JOURNEY[journey].name}</b>
                  <span>
                    {medS} &amp; {compS}
                  </span>
                </li>
                <li>
                  <b>{expCount} experiences</b>
                  <span>arranged in any order with your concierge</span>
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
              <button className={styles.sumMore} onClick={() => setListOpen((o) => !o)}>
                {listOpen ? "Hide full itinerary" : "See full itinerary"}{" "}
                <span>{listOpen ? "▴" : "▾"}</span>
              </button>
              <ul className={`${styles.sumList} ${listOpen ? styles.open : ""}`}>
                <li className={styles.dh}>{plan.startTitle}</li>
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
                <li className={styles.dh}>Handled for you, throughout</li>
                {plan.handled.map((it, i) => (
                  <li key={"h" + i} className={itemClasses(it)}>
                    {itemText(it)}
                  </li>
                ))}
              </ul>
              <a
                className={styles.sumAsk}
                href="https://wa.me/0000000000?text=Hi%2C%20I%20have%20a%20question%20about%20a%20concierge%20day"
                target="_blank"
                rel="noopener"
              >
                Questions? Ask us on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </div>

      <StickyBar
        name="Concierge Day"
        meta={`your journey: ${euro(total)}${tripDate ? " · " + fmtDate(tripDate) : ""} · 7-day free cancellation`}
        ctaHref="#design"
        ctaLabel="Check your date →"
        revealOnScroll={false}
      />
    </>
  );
}
