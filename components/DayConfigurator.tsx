"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./DayConfigurator.module.css";
import StickyBar from "./StickyBar";

type DayCount = 1 | 2 | 3 | 4;
type Journey = "medinet" | "karnak";
type Water = "nile" | "picnic";
type Pay = "full" | "deposit";

const DAYBASE: Record<DayCount, number> = { 1: 450, 2: 850, 3: 1200, 4: 1580 };
const PPD: Record<number, number> = { 2: 85, 3: 70, 4: 55 };
const WATER: Record<Water, string> = {
  nile: "Sunset sail on the Nile",
  picnic: "Desert sunset picnic",
};
function otherWater(w: Water): Water {
  return w === "nile" ? "picnic" : "nile";
}
const JOURNEY: Record<
  Journey,
  { name: string; temple: string; companion: string }
> = {
  medinet: {
    name: "Initiation to Power",
    temple: "Medinet Habu — your initiation",
    companion: "Hatshepsut Temple at Deir el-Bahari",
  },
  karnak: {
    name: "The Ancient Journey",
    temple: "Karnak at dawn — your initiation",
    companion: "Luxor Temple",
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
};
const EXPCOUNT: Record<DayCount, number> = { 1: 3, 2: 7, 3: 12, 4: 15 };
const FILL: Record<DayCount, number> = { 1: 12, 2: 52, 3: 100, 4: 100 };
const STAGE: Record<DayCount, string> = {
  1: "A taste",
  2: "Taking shape",
  3: "The signature",
  4: "Unhurried",
};
const SIGB: Record<DayCount, number> = { 1: 0, 2: 0, 3: 2, 4: 3 };
const IBMSG: Record<DayCount, string> = {
  1: "A great first day. Add days to include more — and the value grows with each one.",
  2: "Almost there — one more day unlocks your first signature bonuses.",
  3: "The complete signature Luxor Rising experience — with 2 signature bonuses.",
  4: "A slower, fourth day — more time to explore, and a sailing lesson on the Nile as your third signature bonus.",
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

function priceOf(nm: string) {
  for (const [k, v] of PRICE_TABLE) if (nm.indexOf(k) >= 0) return v;
  return 0;
}
function euro(n: number) {
  return "€" + n.toLocaleString("en-US");
}
function extraPerDay(g: number) {
  let s = 0;
  for (let i = 2; i <= g; i++) s += PPD[i] || 0;
  return s;
}
function dayTotal(d: DayCount, g: number) {
  return DAYBASE[d] + d * extraPerDay(g);
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

export default function DayConfigurator() {
  const [days, setDays] = useState<DayCount>(1);
  const [group, setGroup] = useState(2);
  const [water, setWater] = useState<Water>("nile");
  const [journey, setJourney] = useState<Journey>("medinet");
  const [photo, setPhoto] = useState(false);
  const [hurg, setHurg] = useState(false);
  const [pay, setPay] = useState<Pay>("full");
  const [tripDate, setTripDate] = useState("");
  const [dateError, setDateError] = useState(false);
  const [bdOpen, setBdOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const dateFieldRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const photoIncluded = days >= 3;
  const photoActive = photoIncluded || photo;

  function addonsCost() {
    let c = 0;
    if (photo && days < 3) c += 120;
    if (hurg) c += 150;
    return c;
  }
  const total = dayTotal(days, group) + addonsCost();
  const perPerson = Math.round(total / group);

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
      pool.push("Private photoshoot of your journey");
      bonus.push({ t: "Desert rally across the dunes", sig: true, bonus: true });
      bonus.push({
        t: "Deir el-Shelwit — the hidden temple of Isis",
        sig: true,
        bonus: true,
      });
    }
    if (days >= 4) {
      pool.push("Valley of the Workers — Deir el-Medina");
      pool.push("Hot-air balloon at dawn over the West Bank");
      bonus.push({ t: "Sailing lesson on the Nile", sig: true, bonus: true });
    }
    const handled: PlanItem[] = [];
    if (hurg) handled.push("Hurghada hotel pickup & private desert crossing");
    handled.push("Your own licensed Egyptologist — every day");
    handled.push("All monument entry tickets for " + gl);
    handled.push("Private, air-conditioned transfers throughout");
    handled.push("Every reservation, timing & fast-track entry, planned for you");
    handled.push("Chilled water & cold towels through the day");
    if (days >= 4) handled.push("Upgraded VIP transfers on your unhurried days");
    handled.push("Your consigliere on WhatsApp — before you arrive & all day");
    handled.push("Free cancellation up to 7 days before");

    return {
      start,
      startTitle: "Day 1 · " + j.name,
      pool,
      bonus,
      handled,
    };
  }, [journey, group, water, photo, days, hurg]);

  const priced: { nm: string; pr: number; bonus: boolean }[] = [];
  let sepTotal = 0;
  [plan.start, plan.pool, plan.bonus, plan.handled].forEach((arr) => {
    arr.forEach((it) => {
      const nm = itemText(it);
      const pr = priceOf(nm);
      if (pr > 0) {
        priced.push({
          nm: nm.split(" — ")[0],
          pr,
          bonus: typeof it === "object" && !!it.bonus,
        });
        sepTotal += pr;
      }
    });
  });
  const showSavings = sepTotal > total;

  const dlabel = days + (days > 1 ? " days" : " day");
  const glabel = group + (group > 1 ? " guests" : " guest");
  const meta =
    dlabel +
    " · " +
    glabel +
    (group > 1 ? " · " + euro(perPerson) + " pp" : "") +
    (tripDate ? " · " + fmtDate(tripDate) : " · pick your date");

  const medS = JOURNEY[journey].temple.split(" — ")[0];
  const compS = JOURNEY[journey].companion.split(" at ")[0].split(" — ")[0];

  const cancelText = tripDate
    ? (() => {
        const dl = cancelDeadline(tripDate);
        return dl ? "Free cancellation until " + dl + " — full refund, no questions" : "";
      })()
    : "";

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.min = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    }
  }, []);

  function handleReserve(e: React.MouseEvent) {
    e.preventDefault();
    if (!tripDate) {
      setDateError(true);
      dateFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => dateInputRef.current?.focus(), 420);
      return;
    }
    const msg =
      pay === "full"
        ? "Pay " + euro(total) + " in full"
        : "Pay " +
          euro(Math.round(total * 0.3)) +
          " deposit now, " +
          euro(total - Math.round(total * 0.3)) +
          " on the day";
    alert(
      "Prototype — this is where Stripe checkout opens.\n\n" +
        days +
        "-day concierge journey on " +
        tripDate +
        "\n" +
        msg
    );
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
                const tot = dayTotal(d, group);
                const sv = dayTotal(1, group) * d - tot;
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
                {Array.from({ length: EXPCOUNT[days] || 0 }).map((_, i) => (
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
                <b>{EXPCOUNT[days]}</b>
                <span>experiences included</span>
              </div>
              <div className={`${styles.ibSigb} ${SIGB[days] > 0 ? styles.on : ""}`}>
                <span className={styles.star}>★</span>
                <span>
                  {SIGB[days] > 0
                    ? SIGB[days] + (SIGB[days] > 1 ? " signature bonuses included" : " signature bonus included")
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

          {/* Step 3: date */}
          <div className={`${styles.step} ${tripDate ? styles.stepDone : ""}`}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>3</div>
              <h3>Pick your date</h3>
            </div>
            <div
              ref={dateFieldRef}
              className={`${styles.fld} ${dateError ? styles.err : ""}`}
            >
              <input
                ref={dateInputRef}
                type="date"
                value={tripDate}
                onChange={(e) => {
                  setTripDate(e.target.value);
                  setDateError(false);
                }}
              />
            </div>
            <div className={styles.fldErr}>Choose your date to continue — it takes a second.</div>
            <div className={styles.fldHint}>
              We confirm availability within 12 hours. Free cancellation up to 7 days before.
            </div>
          </div>

          {/* Step 4: preferences */}
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>4</div>
              <h3>Your preferences</h3>
            </div>

            <div className={`${styles.pref} ${styles.prefJourney}`}>
              <div className={styles.prefQ}>First — where does your story begin?</div>
              <div className={styles.prefNote}>
                Your first temple sets the tone of the whole journey — arranged privately, before the crowds.
              </div>
              <div className={styles.journeyCards}>
                <div
                  className={`${styles.jcard} ${journey === "medinet" ? styles.sel : ""}`}
                  onClick={() => setJourney("medinet")}
                >
                  <div className={styles.jcImg}>
                    <Image src="/images/desert-stargazing-dune.jpg" alt="Medinet Habu" fill sizes="240px" />
                    <div className={styles.jcCap}>
                      <span className={styles.jcEyebrow}>The Initiation</span>
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
                    <Image src="/images/nile-felucca-table.jpg" alt="Karnak at Dawn" fill sizes="240px" />
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
                    <Image src="/images/nile-river-solo.jpg" alt="" fill sizes="46px" />
                  </span>
                  <span>Sunset sail on the Nile</span>
                  <span className={styles.dot} />
                </div>
                <div
                  className={`${styles.opt} ${water === "picnic" ? styles.sel : ""}`}
                  onClick={() => setWater("picnic")}
                >
                  <span className={styles.thumb}>
                    <Image src="/images/desert-dinner-table.jpg" alt="" fill sizes="46px" />
                  </span>
                  <span>Desert sunset picnic</span>
                  <span className={styles.dot} />
                </div>
              </div>
              <div className={styles.grpNote}>
                Whichever you choose first, the other is arranged for you on a later day.
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
                  <b style={{ fontWeight: 500 }}>Hurghada pickup &amp; desert crossing</b>
                  <div className="muted" style={{ fontSize: ".76rem" }}>
                    Private door-to-door transfer across the Eastern Desert
                  </div>
                </div>
                <span className={styles.ax}>+€150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className={styles.summary}>
            <div className={styles.sumHead}>
              <div>
                <div className={styles.sumH}>Your concierge journey</div>
                <div className={styles.sumJourney}>{JOURNEY[journey].name}</div>
              </div>
              <div className={styles.sumProof}>
                <span className="s">★★★★★</span>
                <span className="sr">4.9 · 60+ guests</span>
              </div>
            </div>

            <div className={styles.sumPriceblock}>
              <div className={styles.sumPrice}>{euro(total)}</div>
              {showSavings && (
                <span className={styles.sumSavepill}>Save {euro(sepTotal - total)}</span>
              )}
            </div>
            {showSavings && (
              <div className={styles.sumAnchor}>
                {euro(sepTotal)} if booked à la carte{" "}
                <button className={styles.bdToggle} onClick={() => setBdOpen((o) => !o)}>
                  {bdOpen ? "hide breakdown ▴" : "see breakdown ▾"}
                </button>
              </div>
            )}
            {showSavings && (
              <div className={`${styles.sumBd} ${bdOpen ? styles.open : ""}`}>
                {priced.map((x, i) => (
                  <div className={styles.bdRow} key={i}>
                    <span>
                      {x.nm}
                      {x.bonus && <em>bonus</em>}
                    </span>
                    <span>{euro(x.pr)}</span>
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
            <div className={styles.sumMeta}>{meta}</div>

            <div className={styles.sumSub}>What&apos;s included</div>
            <ul className={styles.sumIncl}>
              <li>
                <b>Day 1 · {JOURNEY[journey].name}</b>
                <span>
                  {medS} &amp; {compS}
                </span>
              </li>
              <li>
                <b>{EXPCOUNT[days]} experiences</b>
                <span>arranged in any order with your consigliere</span>
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

            <div className={styles.sumSub}>How you&apos;d like to pay</div>
            <div className={styles.payOpts}>
              <div
                className={`${styles.pay} ${pay === "full" ? styles.sel : ""}`}
                onClick={() => setPay("full")}
              >
                <b>{euro(total)}</b>
                <span>Pay in full</span>
              </div>
              <div
                className={`${styles.pay} ${pay === "deposit" ? styles.sel : ""}`}
                onClick={() => setPay("deposit")}
              >
                <b>{euro(Math.round(total * 0.3))}</b>
                <span>Deposit now · rest on the day</span>
              </div>
            </div>
            <a href="#" className={`btn btn-primary ${styles.sumBtn}`} onClick={handleReserve}>
              {pay === "full"
                ? `Reserve your journey · ${euro(total)} →`
                : `Secure your date · ${euro(Math.round(total * 0.3))} today →`}
            </a>
            <div className={styles.sumCancel}>{cancelText}</div>

            <div className={styles.sumFoot}>
              <div className={styles.sumTrust}>
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                  <path
                    d="M2 5V3.5A3.5 3.5 0 0 1 9 3.5V5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <rect x="1" y="5" width="9" height="7" rx="1.2" fill="currentColor" />
                </svg>{" "}
                Secure payment · Free cancellation up to 7 days before
              </div>
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
