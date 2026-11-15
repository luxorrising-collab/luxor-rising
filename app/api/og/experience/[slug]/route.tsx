import { reader } from "@/lib/keystatic-reader";
import { shareCard } from "@/lib/og-card";
import { experienceFrom, experienceWhere } from "@/lib/experience-cards";

// The share image for an experience page: the hero photo, a warm tint, the place
// and the day price ("Luxor's West Bank · From €330 a day"), and the share line
// from Keystatic, or the experience name when no line is set.
export const revalidate = 3600;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await reader.collections.experiences.read(slug);
  if (!entry) return new Response("Not found", { status: 404 });

  // Same rule as the page: Luxor single-day experiences (and the Red Sea crossing)
  // sell the private day "from €X"; enquiry-only products show no price.
  const isRedSea = /hurghada|red[- ]?sea/i.test(`${entry.heroEyebrow ?? ""} ${slug}`);
  const isFunnel = entry.bookingType !== "enquiry" && (!isRedSea || slug === "hurghada-to-luxor-crossing");
  const where = experienceWhere(slug).replace(/, Egypt$/, "");
  const kicker = isFunnel ? `${where} · From €${experienceFrom(slug).price} a day` : where;

  return shareCard({
    origin: new URL(req.url).origin,
    heroPath: entry.heroImage,
    kicker,
    line: entry.shareLine?.trim() || entry.name || entry.title,
  });
}
