"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ExperienceConfigurator.module.css";
import StickyBar from "./StickyBar";
import { trackBeginCheckout } from "@/lib/analytics";

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
  "Your concierge, with you start to finish",
  "Private transfer, door to door",
  "Every reservation and all the timing",
  "Timed against the crowds",
];

type ExperienceConfiguratorProps = {
  name?: string;
  slug?: string;
  basePrice?: number;
  /** Largest bookable party. 4 for most; charters (e.g. the yacht) allow more. */
  maxGuests?: number;
  groupSupplement?: GroupSupplementTier[];
  depositPercent?: number;
  glanceIncludes?: string;
  /** Preferred source for "what we take care of" — the product's own list. */
  includeItems?: { title: string; note?: string }[];
  /** How the day feels — shown above the list, so it sells before it reassures. */
  feelText?: string;
  /** Aggregate review summary — shown as a star line on the price card. */
  reviewAverage?: string;
  reviewCount?: number;
  /** A photo of the place, shown as a banner at the top of the summary card. */
  image?: string;
  /** The evocative experience title (e.g. "Begin where the world began.") shown
   *  prominently, with `name` as the place label above it — mirrors the hero. */
  title?: string;
};

export default function ExperienceConfigurator({
  name = "this experience",
  slug = "",
  basePrice = 140,
  maxGuests = 4,
  groupSupplement = [
    { minGuests: 2, extraPerGuest: 70 },
    { minGuests: 3, extraPerGuest: 55 },
    { minGuests: 4, extraPerGuest: 45 },
  ],
  depositPercent = 50,
  glanceIncludes,
  includeItems,
  feelText,
  reviewAverage,
  reviewCount = 0,
  image,
  title,
}: ExperienceConfiguratorProps) {
  // The evocative title leads (uniqueness); the place name labels it (clarity).
  const hasTitle = Boolean(title && title.trim() && title.trim() !== name.trim());
  const cardLabel = hasTitle ? name : "You're reserving";
  const cardTitle = hasTitle ? title! : name;
  const [group, setGroup] = useState(2);
  const [pay, setPay] = useState<Pay>("deposit");
  const [tripDate, setTripDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const total = basePrice + extra(group, groupSupplement);
  const perPerson = Math.round(total / group);
  const deposit = Math.round((total * depositPercent) / 100);

  const includes = useMemo<{ title: string; note?: string }[]>(() => {
    if (includeItems?.length) return includeItems;
    // Legacy: older products still describe this as a "·"-separated line.
    const parsed = parseIncludes(glanceIncludes);
    return (parsed.length ? parsed : FALLBACK_INCLUDES).map((title) => ({ title }));
  }, [includeItems, glanceIncludes]);

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
    if (!agreed) {
      setError("Please agree to the Terms and Cancellation Policy to continue.");
      return;
    }
    setError("");
    setLoading(true);
    const amount = pay === "full" ? total : deposit;
    trackBeginCheckout({
      value: total,
      currency: "EUR",
      items: [{ item_id: slug, item_name: name, price: total, quantity: group }],
    });
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
              <h3>Who&apos;s coming?</h3>
            </div>
            <div className={styles.grpOpts}>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((g) => (
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
                : `Travelling with your partner or friends? Add them — the per-person price drops. Private, up to ${maxGuests} guests.`}
            </div>
          </div>

          <div className={styles.step}>
            <div className={styles.stepH}>
              <div className={styles.stepN}>2</div>
              <h3>The timing</h3>
            </div>
            <div className={styles.timingCard}>
              <b>Timed against the crowds.</b> We don&apos;t hand you a fixed slot on a coach
              clock — your concierge arranges the hour so you have it as close to yours alone as
              it gets, and confirms the exact timing with you within 24 hours of booking.
            </div>
          </div>

          {/* The full "what we take care of" list lives here in the wide column —
              it's a two-column grid that needs the width, and it gives the left
              column the substance to balance the price card + feel on the right. */}
          {includes.length > 0 && (
            <div className={styles.step}>
              <div className={styles.careHead}>What we take care of</div>
              <ul className={styles.careList}>
                {includes.map((i) => (
                  <li key={i.title}>
                    <b>{i.title}</b>
                    {i.note && <span>{i.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.summary}>
          {image ? (
            <div className={styles.sumImg}>
              <Image src={image} alt={name} fill sizes="(max-width: 880px) 92vw, 440px" />
              <div className={styles.sumImgScrim} />
              <div className={styles.sumImgCap}>
                <span className={styles.sumH}>{cardLabel}</span>
                <span className={styles.sumName}>{cardTitle}</span>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.sumH}>{cardLabel}</div>
              <div className={styles.sumName}>{cardTitle}</div>
            </>
          )}
          {reviewCount > 0 && (
            <div className={styles.sumStars}>
              <span className={styles.stars}>★★★★★</span>
              {reviewAverage ? ` ${reviewAverage}` : ""} · {reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"}
            </div>
          )}
          <div className={styles.sumProof}>Private &amp; fully arranged</div>
          <div className={styles.sumPrice}>{euro(total)}</div>
          <div className={styles.sumPer}>
            {group > 1 ? euro(perPerson) + " per person · more of you, less each" : "Private, just you"}
          </div>
          {/* date — moved into the card so checkout is self-contained (matches concierge) */}
          <div className={styles.sumSub}>Your date</div>
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
          <div className={styles.sumSub}>How you&apos;d like to pay</div>
          <div className={styles.payOpts}>
            <button
              type="button"
              className={`${styles.pay} ${pay === "deposit" ? styles.sel : ""}`}
              onClick={() => setPay("deposit")}
              aria-pressed={pay === "deposit"}
            >
              <span className={styles.payRec}>Easiest</span>
              <b>{euro(deposit)}</b>
              <span>to reserve · rest on the day</span>
            </button>
            <button
              type="button"
              className={`${styles.pay} ${pay === "full" ? styles.sel : ""}`}
              onClick={() => setPay("full")}
              aria-pressed={pay === "full"}
            >
              <b>{euro(total)}</b>
              <span>Pay in full</span>
            </button>
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
              : pay === "deposit"
                ? `Reserve for ${euro(deposit)} →`
                : `Reserve & pay ${euro(total)} →`}
          </a>
          {error && (
            <div role="alert" className={styles.sumError}>
              {error}
            </div>
          )}
          <div className={styles.sumReassure2}>
            <div className={`${styles.rrow} ${styles.rrowGuar}`}>
              <span className={styles.ric} aria-hidden>🛡</span>
              <span>
                <b>First hour, or your money back.</b> If it isn&apos;t what we promised, tell
                us in the first hour and we refund it — less any non-refundable bookings.
              </span>
            </div>
            <div className={styles.rrow}>
              <span className={styles.ric} aria-hidden>🔒</span>
              <span>Secure checkout by Stripe — no account needed</span>
            </div>
            <div className={styles.rrow}>
              <span className={styles.ric} aria-hidden>↩</span>
              <span>
                <Link href="/legal/cancellation">Free cancellation up to 7 days before</Link>
              </span>
            </div>
          </div>
          {/* The emotional "how it feels" note sits BELOW the CTA — it reinforces the
              decision without pushing the price and Reserve button below the fold. */}
          {feelText && (
            <div className={styles.sumFeel}>
              <span className={styles.sumFeelH}>How the day feels</span>
              {feelText}
            </div>
          )}
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
