import { reader } from "@/lib/keystatic-reader";
import { shareCard } from "@/lib/og-card";

// The share image for an Insider's Guide article: the hero photo, a warm tint,
// "The Insider's Guide · N min read" and the article's share line (Keystatic).
export const revalidate = 3600;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await reader.collections.articles.read(slug);
  // Drafts stay private on the live site, like the article itself.
  if (!entry || (entry.draft && process.env.NODE_ENV === "production")) {
    return new Response("Not found", { status: 404 });
  }
  const read = entry.readingTime ?? "";
  return shareCard({
    origin: new URL(req.url).origin,
    heroPath: entry.heroImage,
    kicker: entry.shareLine?.trim() && read ? `The Insider's Guide · ${read}` : "The Insider's Guide",
    line: entry.shareLine,
  });
}
