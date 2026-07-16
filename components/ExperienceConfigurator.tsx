"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ExperienceConfigurator.module.css";
import StickyBar from "./StickyBar";

type TimeOfDay = "dawn" | "golden";
type Pay = "full" | "deposit";

export type GroupSupplementTier = { minGuests: number; extraPerGuest: number };

const ADD = { felucca: 60, photo: 90 };

function extra(g: number, groupSupplement: GroupSupplementTier[]) {
  let s = 0;
  for (let i = 2; i <= g; i++) {
    const tier = groupSupplement.find((t) => t.minGuests === i);
    if (tier) s += tier.extraPerGuest;
  }
  return s;
}
function euro(n: number) {
  return "€" + n.toLocaleString("en-US");
}

type ExperienceConfiguratorProps = {
  name?: string;
  basePrice?: number;
  groupSupplement?: GroupSupplementTier[];
  depositPercent?: number;
};

export default function ExperienceConfigurator({
  name = "Medinet Habu",
  basePrice = 140,
  groupSupplement = [
    { minGuests: 2, extraPerGuest: 70 },
    { minGuests: 3, extraPerGuest: 55 },
    { minGuests: 4, extraPerGuest: 45 },
  ],
  depositPercent = 30,
}: ExperienceConfiguratorProps) {
  const [group, setGroup] = useState(2);
  const [time, setTime] = useState<TimeOfDay>("dawn");
  const [felucca, setFelucca] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [pay, setPay] = useState<Pay>("full");
  const [tripDate, setTripDate] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const total = basePrice + extra(group, groupSupplement) + (felucca ? ADD.felucca : 0) + (photo ? ADD.photo : 0);
  const perPerson = Math.round(total / group);
  const deposit = Math.round((total * depositPercent) / 100);

  const includes = useMemo(() => {
    const b = [
      "Your consigliere, with you start to finish",
      "A certified Egyptologist on site",
      "Private return transfer",
      time === "dawn" ? "Entry at dawn, before the crowds" : "Entry at golden hour",
      "Monument entry for your group",
      "Every reservation & all timing",
    ];
    if (felucca) b.push("A private felucca afterwards");
    if (photo) b.push("A private photoshoot");
    return b;
  }, [time, felucca, photo]);

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.min = new Date().toISOString().split("T")[0];
    }
  }, []);

  function handleReserve(e: React.MouseEvent) {
    e.preventDefault();
    if (!tripDate) {
      dateInputRef.current?.focus();
      alert("Please pick your date first.");
      return;
    }
    const msg =
      pay === "full"
        ? "Pay " + euro(total) + " in full"
        : "Pay " + euro(deposit) + " deposit now, rest on the day";
    alert(
      "Prototype — this is where Stripe checkout opens.\n\n" + name + " · " +
        group +
        " guest(s) · " +
        time +
        " · " +
        tripDate +
        "\n" +
        msg
    );
  }

  return (
    <>
      <div className={styles.cfgGrid}>
        <div>
          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>1</div>
              <h3>Pick your date</h3>
            </div>
            <input
              ref={dateInputRef}
              type="date"
              className={styles.dateInput}
              value={tripDate}
              onChange={(e) => setTripDate(e.target.value)}
            />
          </div>

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

          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>3</div>
              <h3>When?</h3>
            </div>
            <div className={styles.optGrid}>
              <div
                className={`${styles.tile} ${time === "dawn" ? styles.sel : ""}`}
                onClick={() => setTime("dawn")}
              >
                <div className={styles.tt}>Dawn — before the crowds</div>
                <div className={styles.ts}>The temple almost to yourself, in the cool of first light.</div>
              </div>
              <div
                className={`${styles.tile} ${time === "golden" ? styles.sel : ""}`}
                onClick={() => setTime("golden")}
              >
                <div className={styles.tt}>Golden hour</div>
                <div className={styles.ts}>Late-afternoon light, warm on the reliefs.</div>
              </div>
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>4</div>
              <h3>
                Add to it <span style={{ fontWeight: 300, opacity: 0.6, fontSize: ".85rem" }}>(optional)</span>
              </h3>
            </div>
            <div
              className={`${styles.addon} ${felucca ? styles.sel : ""}`}
              onClick={() => setFelucca((f) => !f)}
            >
              <span className={styles.ck}>✓</span>
              <div>
                <div className={styles.an}>A private felucca afterwards</div>
                <div className={styles.ad}>Sail the Nile as the day cools.</div>
              </div>
              <span className={styles.ax}>+€60</span>
            </div>
            <div
              className={`${styles.addon} ${photo ? styles.sel : ""}`}
              onClick={() => setPhoto((p) => !p)}
            >
              <span className={styles.ck}>✓</span>
              <div>
                <div className={styles.an}>A private photoshoot</div>
                <div className={styles.ad}>A photographer captures your visit.</div>
              </div>
              <span className={styles.ax}>+€90</span>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.sumH}>Your experience</div>
          <div className={styles.sumProof}>
            <span style={{ letterSpacing: ".05em" }}>★★★★★</span> {name} · private &amp; certified-guided
          </div>
          <div className={styles.sumPrice}>{euro(total)}</div>
          <div className={styles.sumPer}>
            {group > 1 ? euro(perPerson) + " per person · more of you, less each" : "Private, just you"}
          </div>
          <div className={styles.sumMeta}>
            {group}
            {group > 1 ? " guests" : " guest"} · {tripDate || "pick your date"}
          </div>
          <div className={styles.sumSub}>What we arrange</div>
          <ul className={styles.sumList}>
            {includes.map((i) => (
              <li key={i}>{i}</li>
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
              <b>{euro(deposit)}</b>
              <span>Deposit · rest on the day</span>
            </div>
          </div>
          <a href="#" className={`btn btn-primary ${styles.sumBtn}`} onClick={handleReserve}>
            Reserve &amp; pay
          </a>
          <div className={styles.sumReassure}>Secure checkout · No account needed · We confirm within 24 hours</div>
          <div className={styles.sumFine}>
            Free cancellation up to 7 days before · Guiding by a certified Egyptologist · Entry &amp; transfer
            included · No overnight
          </div>
          <div className={styles.upsell}>
            Want the whole day arranged around it? <a href="/concierge-day">Build a Concierge Day →</a>
          </div>
        </div>
      </div>

      <StickyBar
        name={name}
        meta={`· from ${euro(basePrice)} · private & certified-guided`}
        ctaHref="#book"
        ctaLabel="Reserve"
        revealOnScroll
        revealAfter={640}
      />
    </>
  );
}
