"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./ExperienceConfigurator.module.css";
import StickyBar from "./StickyBar";

type Pay = "full" | "deposit";

export type GroupSupplementTier = { minGuests: number; extraPerGuest: number };

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

// "What we arrange" comes from the product's own glanceIncludes line, so it is
// always accurate for THIS experience (no temple-only assumptions).
function parseIncludes(s?: string): string[] {
  if (!s) return [];
  return s
    .replace(/^\s*includes\s+/i, "")
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}
const FALLBACK_INCLUDES = [
  "Your consigliere, with you start to finish",
  "Private transfer, door to door",
  "Every reservation and all the timing",
  "Timed against the crowds",
];

type ExperienceConfiguratorProps = {
  name?: string;
  slug?: string;
  basePrice?: number;
  groupSupplement?: GroupSupplementTier[];
  depositPercent?: number;
  glanceIncludes?: string;
};

export default function ExperienceConfigurator({
  name = "this experience",
  slug = "",
  basePrice = 140,
  groupSupplement = [
    { minGuests: 2, extraPerGuest: 70 },
    { minGuests: 3, extraPerGuest: 55 },
    { minGuests: 4, extraPerGuest: 45 },
  ],
  depositPercent = 30,
  glanceIncludes,
}: ExperienceConfiguratorProps) {
  const [group, setGroup] = useState(2);
  const [pay, setPay] = useState<Pay>("full");
  const [tripDate, setTripDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const total = basePrice + extra(group, groupSupplement);
  const perPerson = Math.round(total / group);
  const deposit = Math.round((total * depositPercent) / 100);

  const includes = useMemo(() => {
    const parsed = parseIncludes(glanceIncludes);
    return parsed.length ? parsed : FALLBACK_INCLUDES;
  }, [glanceIncludes]);

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.min = new Date().toISOString().split("T")[0];
    }
  }, []);

  async function handleReserve(e: React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    if (!tripDate) {
      dateInputRef.current?.focus();
      setError("Please pick your date first.");
      return;
    }
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
          mode: pay,
          guests: group,
          date: tripDate,
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
              onChange={(e) => {
                setTripDate(e.target.value);
                if (error) setError("");
              }}
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
                  aria-pressed={group === g}
                >
                  {g === 1 ? "Just me" : g === 2 ? "Two of us" : `${g} of us`}
                </button>
              ))}
            </div>
            <div className={styles.grpNote}>
              {group > 1
                ? euro(perPerson) + " per person — adding guests lowers the per-person rate."
                : "Travelling with your partner or friends? Add them — the per-person price drops. Private, up to 4 guests."}
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>3</div>
              <h3>The timing</h3>
            </div>
            <div className={styles.timingCard}>
              <b>Timed against the crowds.</b> We don&apos;t hand you a fixed slot on a coach
              clock — your consigliere arranges the hour so you have it as close to yours alone as
              it gets, and confirms the exact timing with you within 24 hours of booking.
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.sumH}>Your experience</div>
          <div className={styles.sumProof}>
            <span style={{ letterSpacing: ".05em" }}>★★★★★</span> {name} · private &amp; fully
            arranged
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
            <button
              type="button"
              className={`${styles.pay} ${pay === "full" ? styles.sel : ""}`}
              onClick={() => setPay("full")}
              aria-pressed={pay === "full"}
            >
              <b>{euro(total)}</b>
              <span>Pay in full</span>
            </button>
            <button
              type="button"
              className={`${styles.pay} ${pay === "deposit" ? styles.sel : ""}`}
              onClick={() => setPay("deposit")}
              aria-pressed={pay === "deposit"}
            >
              <b>{euro(deposit)}</b>
              <span>Deposit · rest on the day</span>
            </button>
          </div>
          <a
            href="#"
            className={`btn btn-primary ${styles.sumBtn}`}
            onClick={handleReserve}
            aria-disabled={loading}
          >
            {loading ? "Opening secure checkout…" : "Reserve & pay"}
          </a>
          {error && (
            <div role="alert" className={styles.sumError}>
              {error}
            </div>
          )}
          <div className={styles.sumReassure}>
            Secure checkout by Stripe · No account needed · Free cancellation up to 7 days before
          </div>
          <div className={styles.sumFine}>
            Private, just your group · Everything arranged end to end · Your consigliere confirms the
            exact timing within 24 hours
          </div>
          <div className={styles.upsell}>
            Want the whole day arranged around it? <Link href="/concierge-day">Build a Concierge Day →</Link>
          </div>
        </div>
      </div>

      <StickyBar
        name={name}
        meta={`· from ${euro(basePrice)} · private, timed against the crowds`}
        ctaHref="#book"
        ctaLabel="Reserve"
        revealOnScroll
        revealAfter={640}
      />
    </>
  );
}
