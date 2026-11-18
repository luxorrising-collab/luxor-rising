// The payment and cancellation rules, in one place. Imported by the checkout
// UI (both configurators), the checkout API, the Stripe webhook, the daily
// automations and the emails, so a rule is stated, enforced and charged the
// same way everywhere. Isomorphic: no server-only imports.
//
// Three ways to pay:
//   full    — the whole price now.
//   deposit — 20% now; the rest charged automatically to the same card 48 hours
//             before the experience (off-session, card saved by Stripe).
//   local   — 20% now; the rest paid on the day to your concierge, in Egyptian
//             pounds, euros or US dollars (cash).
//
// Cancellation: free until 48 hours before the scheduled start (refund less any
// costs already committed, including payment-partner costs). Inside 48 hours,
// or a no-show: the deposit is non-refundable (and a balance already charged is
// treated as committed, refundable only to the extent it isn't).

export type PayMode = "full" | "deposit" | "local";

export const PAY_MODES: PayMode[] = ["deposit", "local", "full"];

/** Default share paid today on the two deposit options (Keystatic can override). */
export const DEFAULT_DEPOSIT_PERCENT = 20;
/** Free cancellation runs until this many hours before the scheduled start. */
export const FREE_CANCEL_HOURS = 48;
/** The automatic balance is charged on the morning this many days before. */
export const BALANCE_DAYS_BEFORE = 2;
/** The automatic balance needs a day's room between booking and the charge. */
export const DEPOSIT_MIN_DAYS = BALANCE_DAYS_BEFORE + 1;
/** If no start time is confirmed yet, the policy treats the start as this time
 *  (Luxor) on the experience date. Stated in the cancellation policy. */
export const DEFAULT_START_TIME = "08:00";

/** Currencies the concierge accepts for a balance paid locally. */
export const LOCAL_CURRENCIES = ["EGP", "EUR", "USD"] as const;
export type LocalCurrency = (typeof LOCAL_CURRENCIES)[number];

export const isPayMode = (v: unknown): v is PayMode => v === "full" || v === "deposit" || v === "local";

/** Whole calendar days from today (local time) to an ISO date (yyyy-mm-dd). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const trip = new Date(`${iso}T00:00:00`);
  return Math.round((trip.getTime() - today.getTime()) / 86400000);
}

/** Whether a way to pay can be offered for this date. Without a date yet,
 *  every option shows (the date check runs again once it's chosen, and on the
 *  server). The automatic balance needs at least DEPOSIT_MIN_DAYS. */
export function payModeAllowed(mode: PayMode, iso?: string, now: Date = new Date()): boolean {
  if (!iso) return true;
  const d = daysUntil(iso, now);
  if (d < 1) return false; // the earliest bookable date is tomorrow
  if (mode === "deposit") return d >= DEPOSIT_MIN_DAYS;
  return true;
}

/** Deposit in whole euros (as cents) — e.g. 20% of €960 = €192. */
export function depositCents(totalCents: number, percent: number): number {
  return Math.round((totalCents / 100) * (percent / 100)) * 100;
}

/** The euro split for a booking: what's paid today and what's left. */
export function splitAmounts(totalCents: number, mode: PayMode, percent: number) {
  const today = mode === "full" ? totalCents : depositCents(totalCents, percent);
  return { todayCents: today, balanceCents: Math.max(0, totalCents - today) };
}

const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** The date the automatic balance is charged (48 hours before): yyyy-mm-dd. */
export const balanceChargeDate = (iso: string) => addDays(iso, -BALANCE_DAYS_BEFORE);

/** The last day of free cancellation (48 hours before a morning start). */
export const freeCancelDate = (iso: string) => addDays(iso, -BALANCE_DAYS_BEFORE);

/** Whether free cancellation is still open for this date (day granularity:
 *  open while the date is more than BALANCE_DAYS_BEFORE days away). */
export const freeCancelOpen = (iso: string, now: Date = new Date()) => daysUntil(iso, now) > BALANCE_DAYS_BEFORE;

/** "Mon 23 Nov" */
export function fmtDay(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "Free cancellation until Mon 23 Nov (48 hours before)" — or the plain rule
 *  when there's no date yet, or a clear line when the window has passed. */
export function cancelLine(iso?: string, now: Date = new Date()): string {
  if (!iso) return `Free cancellation until ${FREE_CANCEL_HOURS} hours before`;
  if (!freeCancelOpen(iso, now))
    return `Inside ${FREE_CANCEL_HOURS} hours of your date — non-refundable once booked`;
  return `Free cancellation until ${fmtDay(freeCancelDate(iso))} (${FREE_CANCEL_HOURS} hours before)`;
}

/** Euro amount for display: "€192". */
export const euro = (n: number) => `€${Math.round(n).toLocaleString("en-US")}`;

export type FxRates = { EGP: number; USD: number; asOf?: string };
/** Used only if the live rate can't be fetched (refreshed by hand when needed). */
export const FALLBACK_FX: FxRates = { EGP: 59, USD: 1.1 };

/** An indicative local amount: "≈ EGP 22,700 or $363". Rounded for reading;
 *  the policy fixes the actual rate (mid-market, on the day). */
export function localApprox(eur: number, fx: FxRates = FALLBACK_FX): string {
  const egp = Math.round((eur * fx.EGP) / 50) * 50;
  const usd = Math.round(eur * fx.USD);
  return `≈ EGP ${egp.toLocaleString("en-US")} or $${usd.toLocaleString("en-US")}`;
}

/** One line per mode, used on the tiles, in Stripe and in the emails. */
export function balanceLine(mode: PayMode, balanceEur: number, iso?: string): string {
  if (mode === "deposit")
    return iso
      ? `${euro(balanceEur)} charged automatically on ${fmtDay(balanceChargeDate(iso))} (48 hours before)`
      : `${euro(balanceEur)} charged automatically 48 hours before`;
  if (mode === "local") return `${euro(balanceEur)} paid on the day — Egyptian pounds, euros or US dollars`;
  return "Nothing more to pay";
}
