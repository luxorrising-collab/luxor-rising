import { revalidatePath } from "next/cache";

// Manual refresh: force both feeds to regenerate now (e.g. after a price or
// product change). Linked from the "Marketing feeds" singleton in Keystatic.
export async function GET() {
  revalidatePath("/api/feeds/meta");
  revalidatePath("/api/feeds/google");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Feeds refreshed</title></head>
<body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:3rem auto;padding:0 1.25rem;color:#2e2216">
<h1 style="font-weight:600">✓ Product feeds refreshed</h1>
<p>Both feeds now reflect the latest products and prices. Meta and Google will pick up the changes on their next scheduled fetch — or re-fetch them from those dashboards to see the update immediately.</p>
<ul style="line-height:1.9">
<li><a href="/api/feeds/meta">Meta catalogue feed</a></li>
<li><a href="/api/feeds/google">Google page feed (Performance Max)</a></li>
</ul>
</body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
