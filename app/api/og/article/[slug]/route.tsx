import { ImageResponse } from "next/og";
import { reader } from "@/lib/keystatic-reader";

// The share image for an Insider's Guide article (Facebook, Instagram, WhatsApp,
// X link previews): the hero photo, a warm tint on the left, and the article's
// "share line": one quiet sentence that is NOT the headline, because the
// platforms already print the headline under the image. With no share line it
// falls back to the photo, the tint and the brand mark only.
export const revalidate = 3600;

const W = 1200;
const H = 630;
const GOLD = "#C9A063";
const GOLD_SOFT = "#E5D4AA";
const CREAM = "#FAF3E4";
const INK = "#140c06";
const full = { position: "absolute", top: 0, left: 0, width: W, height: H } as const;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await reader.collections.articles.read(slug);
  // Drafts stay private on the live site, like the article itself.
  if (!entry || (entry.draft && process.env.NODE_ENV === "production")) {
    return new Response("Not found", { status: 404 });
  }

  // Photo, emblem and fonts come from this deployment's own origin (the same
  // approach as the catalogue cards), so nothing has to be bundled.
  const origin = new URL(req.url).origin;
  const font = async (f: string) => {
    const res = await fetch(`${origin}/fonts/feed/${f}`);
    if (!res.ok) throw new Error(`Font ${f} failed to load: ${res.status}`);
    return res.arrayBuffer();
  };
  const [display, sans] = await Promise.all([font("cormorant-600.woff"), font("inter-600.woff")]);
  const hero = entry.heroImage ? `${origin}${entry.heroImage}` : "";
  const emblem = `${origin}/images/logo-emblem.png`;
  const line = (entry.shareLine ?? "").trim();
  const read = entry.readingTime ?? "";
  const lineSize = line.length > 48 ? 54 : 62;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", backgroundColor: INK, fontFamily: "Inter" }}>
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} width={W} height={H} style={{ ...full, objectFit: "cover" }} alt="" />
        )}

        {line ? (
          <>
            {/* Tint on the left, where the line sits; the photo stays clear on the right. */}
            <div
              style={{
                ...full,
                display: "flex",
                background: "linear-gradient(90deg, rgba(20,12,6,0.88) 0%, rgba(20,12,6,0.62) 42%, rgba(20,12,6,0.05) 78%)",
              }}
            />
            <div style={{ position: "absolute", left: 72, top: 0, width: 600, height: H, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26 }}>
              <div style={{ display: "flex", fontSize: 18, letterSpacing: 5, color: GOLD_SOFT, textTransform: "uppercase" }}>
                {read ? `The Insider's Guide · ${read}` : "The Insider's Guide"}
              </div>
              <div style={{ display: "flex", width: 72, height: 2, backgroundColor: GOLD }} />
              <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: lineSize, lineHeight: 1.08, color: CREAM }}>{line}</div>
            </div>
            <div style={{ position: "absolute", left: 72, bottom: 48, display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emblem} width={40} height={40} alt="" />
              <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 28, color: CREAM }}>Luxor Rising</div>
            </div>
          </>
        ) : (
          <>
            {/* No share line: a tint at the foot and the brand mark only. */}
            <div
              style={{
                ...full,
                display: "flex",
                background: "linear-gradient(180deg, rgba(20,12,6,0.15) 0%, rgba(20,12,6,0.25) 45%, rgba(20,12,6,0.82) 100%)",
              }}
            />
            <div style={{ position: "absolute", left: 64, bottom: 56, display: "flex", alignItems: "center", gap: 22 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emblem} width={64} height={64} alt="" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 40, color: CREAM, lineHeight: 1 }}>Luxor Rising</div>
                <div style={{ display: "flex", fontSize: 17, letterSpacing: 5, color: GOLD_SOFT, textTransform: "uppercase" }}>The Insider&apos;s Guide</div>
              </div>
            </div>
          </>
        )}
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Cormorant", data: display, weight: 600, style: "normal" },
        { name: "Inter", data: sans, weight: 600, style: "normal" },
      ],
    },
  );
}
