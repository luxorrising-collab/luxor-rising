// Pure pricing math — the SINGLE definition of how a price is computed, shared
// by the browser builders (DayConfigurator / ExperienceConfigurator) and the
// server-side authoritative quote (lib/quote.ts). Keeping both sides on these
// exact functions is what stops the displayed price and the charged price from
// ever drifting apart. No imports, no side effects.

export type VolumeDiscountTier = { minDays: number; discountPercent: number };
export type GroupSupplementTier = { minGuests: number; extraPerDay: number };
export type ExpSupplementTier = { minGuests: number; extraPerGuest: number };

/** Flat premium for the optional private photographer/videographer add-on. */
export const PHOTO_PRO = 460;

/** Concierge day: per-day party supplement summed across the tiers up to g. */
export function extraPerDay(g: number, groupSupplement: GroupSupplementTier[]): number {
  let s = 0;
  for (let i = 2; i <= g; i++) {
    const tier = groupSupplement.find((t) => t.minGuests === i);
    if (tier) s += tier.extraPerDay;
  }
  return s;
}

/** Largest volume discount whose day threshold is met (0 if none). */
export function discountForDays(d: number, volumeDiscount: VolumeDiscountTier[]): number {
  let best: VolumeDiscountTier | null = null;
  for (const t of volumeDiscount) {
    if (d >= t.minDays && (!best || t.minDays > best.minDays)) best = t;
  }
  return best ? best.discountPercent : 0;
}

/** Full concierge-day price (euros) for d days and g guests. */
export function dayTotal(
  d: number,
  g: number,
  dayRate: number,
  volumeDiscount: VolumeDiscountTier[],
  groupSupplement: GroupSupplementTier[],
): number {
  const discount = discountForDays(d, volumeDiscount);
  // The multi-day discount applies to the whole day price (rate + supplement).
  const perDay = dayRate + extraPerDay(g, groupSupplement);
  return Math.round(perDay * d * (1 - discount / 100));
}

/** Single experience: per-guest supplement summed across the tiers up to g. */
export function expExtra(g: number, groupSupplement: ExpSupplementTier[]): number {
  let s = 0;
  for (let i = 2; i <= g; i++) {
    const tier = groupSupplement.find((t) => t.minGuests === i);
    if (tier) s += tier.extraPerGuest;
  }
  return s;
}
