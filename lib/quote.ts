import { reader } from "@/lib/keystatic-reader";
import { getFinalPriceMap } from "@/lib/pricing";
import {
  dayTotal,
  expExtra,
  PHOTO_PRO,
  type VolumeDiscountTier,
  type GroupSupplementTier,
  type ExpSupplementTier,
} from "@/lib/pricing-math";

// Authoritative, SERVER-SIDE price for a booking. The checkout route charges
// this — never a figure sent by the browser — so the price cannot be tampered
// with. It rebuilds the total from the same Keystatic data and the same math
// the product pages use, so the amount charged always equals the amount shown.

export type QuoteInput = {
  slug: string;
  guests: number;
  photo?: boolean; // concierge photographer add-on
  hurg?: boolean; // Hurghada ⇄ Luxor crossing add-on
};

export type Quote = {
  /** Full price of the booking, in euro-cents. */
  totalCents: number;
  /** Deposit percentage from the pricing rules (for the "pay a deposit" path). */
  depositPercent: number;
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.round(n)));

const CROSSING_SLUG = "hurghada-to-luxor-crossing";
const CROSSING_FALLBACK = 675;

/** Returns the authoritative quote, or null if the slug isn't a live, bookable
 *  product (unknown, inactive, or enquiry-only) — the caller then rejects. */
export async function quoteBooking(input: QuoteInput): Promise<Quote | null> {
  const [pricingRules, priceMap] = await Promise.all([
    reader.singletons.pricingRules.read(),
    getFinalPriceMap(),
  ]);
  const depositPercent = pricingRules?.depositPercent ?? 50;
  const crossing = priceMap.get(CROSSING_SLUG) ?? CROSSING_FALLBACK;

  // ── Concierge day: slug encodes the day count, e.g. concierge-day-3d ──
  const conc = /^concierge-day-(\d+)d$/.exec(input.slug);
  if (conc) {
    const days = clamp(Number(conc[1]), 1, 4);
    const guests = clamp(input.guests, 1, 4);
    const dayRate = pricingRules?.dayRate ?? 800;
    const volumeDiscount: VolumeDiscountTier[] = (pricingRules?.volumeDiscount ?? []).map((t) => ({
      minDays: t.minDays ?? 0,
      discountPercent: t.discountPercent ?? 0,
    }));
    const groupSupplement: GroupSupplementTier[] = (pricingRules?.groupSupplement ?? []).map((t) => ({
      minGuests: t.minGuests ?? 0,
      extraPerDay: t.extraPerDay ?? 0,
    }));
    let total = dayTotal(days, guests, dayRate, volumeDiscount, groupSupplement);
    if (input.photo) total += PHOTO_PRO;
    if (input.hurg) total += crossing;
    return { totalCents: Math.round(total) * 100, depositPercent };
  }

  // ── Single experience: read the live catalogue entry ──
  const entry = await reader.collections.experiences.read(input.slug);
  if (!entry || !entry.isActive || entry.bookingType === "enquiry") return null;

  const base = priceMap.get(input.slug) ?? entry.basePrice ?? 0;
  if (base <= 0) return null; // no sellable price → not bookable via Stripe

  const maxGuests = entry.maxGuests ?? 4;
  const guests = clamp(input.guests, 1, maxGuests);
  const supplement: ExpSupplementTier[] = (entry.groupSupplement ?? []).map((t) => ({
    minGuests: t.minGuests ?? 0,
    extraPerGuest: t.extraPerGuest ?? 0,
  }));
  let total = base + expExtra(guests, supplement);

  // The crossing add-on is only offered on non-Red-Sea experiences (and never on
  // the crossing itself) — decided here, server-side, from the product itself.
  const isRedSea = /hurghada|red[- ]?sea/i.test(`${entry.heroEyebrow ?? ""} ${input.slug}`);
  if (input.hurg && !isRedSea) total += crossing;

  return { totalCents: Math.round(total) * 100, depositPercent };
}
