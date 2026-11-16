import { buildGoogleDynamicCsv, feedsEnabled } from "@/lib/feeds";

// Google Ads dynamic remarketing feed (Custom type) for Performance Max.
// Regenerated at most hourly; use /api/feeds/refresh to force it sooner.
export const revalidate = 3600;

export async function GET() {
  if (!(await feedsEnabled())) {
    return new Response("Product feeds are turned off.", { status: 403 });
  }
  const csv = await buildGoogleDynamicCsv();
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'inline; filename="luxor-rising-google-dynamic.csv"',
    },
  });
}
