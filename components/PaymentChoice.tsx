"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  DEFAULT_DEPOSIT_PERCENT,
  FALLBACK_FX,
  balanceChargeDate,
  cancelLine,
  depositCents,
  euro,
  fmtDay,
  freeCancelOpen,
  localApprox,
  payModeAllowed,
  type FxRates,
  type PayMode,
} from "@/lib/payment-policy";
import PaymentMarks from "./PaymentMarks";
import styles from "./PaymentChoice.module.css";

// The three ways to pay, as radio cards, plus the reassurance block under the
// button (balance, guarantee, cancellation, secure-payment badges). Shared by
// Design Your Day and the single-experience checkout so both read the same.

// Indicative rates for the "paid locally" line — fetched once per page.
let fxCache: FxRates | null = null;
let fxPromise: Promise<FxRates> | null = null;
function useFx(): FxRates {
  const [fx, setFx] = useState<FxRates>(fxCache ?? FALLBACK_FX);
  useEffect(() => {
    if (fxCache) return;
    fxPromise ??= fetch("/api/fx")
      .then((r) => (r.ok ? (r.json() as Promise<FxRates>) : FALLBACK_FX))
      .catch(() => FALLBACK_FX);
    fxPromise.then((v) => {
      fxCache = v;
      setFx(v);
    });
  }, []);
  return fx;
}

/** What's paid today for a mode, in whole euros. */
export function todayEur(mode: PayMode, total: number, depositPercent = DEFAULT_DEPOSIT_PERCENT): number {
  return mode === "full" ? total : depositCents(total * 100, depositPercent) / 100;
}

/** The first allowed mode, preferring the guest's current choice. */
export function allowedPay(pay: PayMode, tripDate?: string): PayMode {
  if (payModeAllowed(pay, tripDate)) return pay;
  return "full";
}

/** The button: "Reserve · €192 today →" / "Reserve & pay €960 →". */
export function payCta(mode: PayMode, total: number, depositPercent = DEFAULT_DEPOSIT_PERCENT): string {
  return mode === "full"
    ? `Reserve & pay ${euro(total)} →`
    : `Reserve · ${euro(todayEur(mode, total, depositPercent))} today →`;
}

export default function PaymentChoice({
  total,
  depositPercent = DEFAULT_DEPOSIT_PERCENT,
  tripDate,
  pay,
  onPay,
}: {
  total: number;
  depositPercent?: number;
  tripDate?: string;
  pay: PayMode;
  onPay: (m: PayMode) => void;
}) {
  const fx = useFx();
  const dep = todayEur("deposit", total, depositPercent);
  const rest = total - dep;
  const depositOk = payModeAllowed("deposit", tripDate);

  const options: { mode: PayMode; title: string; sub: ReactNode; amount: string; badge?: string; disabled?: boolean }[] = [
    {
      mode: "deposit",
      title: `Pay ${depositPercent}% today`,
      sub: depositOk
        ? tripDate
          ? `${euro(rest)} charged automatically on ${fmtDay(balanceChargeDate(tripDate))}, 48 hours before`
          : `${euro(rest)} charged automatically 48 hours before`
        : "Not available this close to your date",
      amount: euro(dep),
      badge: "Easiest",
      disabled: !depositOk,
    },
    {
      mode: "local",
      title: `Pay ${depositPercent}% today, the rest locally`,
      sub: (
        <>
          {euro(rest)} on the day to your concierge, in Egyptian pounds, euros or US dollars{" "}
          <span className={styles.approx}>({localApprox(rest, fx)})</span>
        </>
      ),
      amount: euro(dep),
    },
    { mode: "full", title: "Pay in full", sub: "Nothing more to pay", amount: euro(total) },
  ];

  return (
    <div className={styles.choice} role="radiogroup" aria-label="How you'd like to pay" data-hide-chat>
      {options.map((o) => {
        const on = pay === o.mode && !o.disabled;
        return (
          <button
            key={o.mode}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            className={`${styles.opt} ${on ? styles.on : ""}`}
            onClick={() => !o.disabled && onPay(o.mode)}
          >
            <span className={styles.dot} aria-hidden />
            <span className={styles.txt}>
              <span className={styles.title}>
                {o.title}
                {o.badge && !o.disabled && <span className={styles.badge}>{o.badge}</span>}
              </span>
              <span className={styles.sub}>{o.sub}</span>
            </span>
            <span className={styles.amt}>
              {o.amount}
              {o.mode !== "full" && <small>today</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Under the button: the balance in plain words, the guarantee, the dated
 *  cancellation line and the secure-payment badges. */
export function PaymentReassure({
  pay,
  total,
  depositPercent = DEFAULT_DEPOSIT_PERCENT,
  tripDate,
  guarantee,
}: {
  pay: PayMode;
  total: number;
  depositPercent?: number;
  tripDate?: string;
  guarantee: ReactNode;
}) {
  const rest = total - todayEur(pay, total, depositPercent);
  const open = !tripDate || freeCancelOpen(tripDate);
  return (
    <div className={styles.reassure}>
      {pay === "deposit" && (
        <div className={styles.row}>
          <span className={styles.ic} aria-hidden>💳</span>
          <span>
            {euro(rest)} charged automatically to the same card
            {tripDate ? ` on ${fmtDay(balanceChargeDate(tripDate))}` : " 48 hours before"}. If your bank asks to
            confirm it, we email you a secure link.
          </span>
        </div>
      )}
      {pay === "local" && (
        <div className={styles.row}>
          <span className={styles.ic} aria-hidden>💵</span>
          <span>
            {euro(rest)} to your concierge on the day, in cash: Egyptian pounds, euros or US dollars, at the
            day&apos;s mid-market rate.
          </span>
        </div>
      )}
      <div className={`${styles.row} ${styles.guar}`}>
        <span className={styles.ic} aria-hidden>🛡</span>
        <span>{guarantee}</span>
      </div>
      <div className={`${styles.row} ${open ? styles.free : ""}`}>
        <span className={styles.ic} aria-hidden>↩</span>
        <span>
          <Link href="/legal/cancellation" target="_blank">
            {cancelLine(tripDate)}
          </Link>
          {open && " — refunded, less only costs already committed"}
        </span>
      </div>
      <TrustBadges />
    </div>
  );
}

/** "Secure checkout by Stripe" and the ways to pay — the security cue at the button. */
export function TrustBadges() {
  return (
    <div className={styles.trust}>
      <div className={styles.secure}>
        <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden>
          <path
            fill="currentColor"
            d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H4a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 4 15h8a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 12 6h-.5V4.5A3.5 3.5 0 0 0 8 1Zm-2 5V4.5a2 2 0 1 1 4 0V6H6Z"
          />
        </svg>
        <span>
          Secure checkout by <b className={styles.stripe}>stripe</b> · no account needed
        </span>
      </div>
      <PaymentMarks />
    </div>
  );
}
