import { buildGooglePageFeedCsv, feedsEnabled } from "@/lib/feeds";

// Regenerated at most hourly; use /api/feeds/refresh to force it sooner.
export const revalidate = 3600;

export async function GET() {
  if (!(await feedsEnabled())) {
    return new Response("Product feeds are turned off.", { status: 403 });
  }
  const csv = await buildGooglePageFeedCsv();
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'inline; filename="luxor-rising-google-pagefeed.csv"',
    },
  });
}
