import { FALLBACK_FX, type FxRates } from "./payment-policy";

// Indicative euro → Egyptian pound / US dollar rates, for showing what a balance
// paid locally comes to. Mid-market rates from open.er-api.com (free, no key,
// updated daily), cached for 6 hours. Never used to charge anything: the
// cancellation policy fixes the actual rate on the day. Falls back to fixed
// rates if the service can't be reached, so pages and emails never break.
export async function getEurRates(): Promise<FxRates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK_FX;
    const j = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    const EGP = j.rates?.EGP;
    const USD = j.rates?.USD;
    if (j.result !== "success" || !EGP || !USD) return FALLBACK_FX;
    return { EGP, USD, asOf: j.time_last_update_utc };
  } catch {
    return FALLBACK_FX;
  }
}
