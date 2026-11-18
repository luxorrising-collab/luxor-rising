import { getEurRates } from "@/lib/fx";

// Indicative EUR → EGP / USD rates for the checkout ("≈ EGP 22,700 or $363").
export const revalidate = 21600;

export async function GET() {
  const fx = await getEurRates();
  return Response.json(fx, { headers: { "cache-control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
}
