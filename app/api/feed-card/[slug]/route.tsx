import { ImageResponse } from "next/og";
import { getFeedProducts } from "@/lib/feeds";

// A branded catalogue card for the Meta product feed — the Design Your Day card
// graphic (full-bleed hero, dark scrim, place kicker, poetic serif title, gold
// rule) with the logo top-left as in our video theme and the "Included" badge
// top-right, rendered to a square PNG. No price: Meta shows the feed's price field
// beside the image. Meta fetches this URL as the item's image_link.
export const revalidate = 3600;

// Square 1080 — the safe, un-cropped size for Advantage+ Catalog / dynamic ads.
const W = 1080;
const H = 1080;

const GOLD_SOFT = "#E5D4AA";
const CREAM = "#FAF3E4";
const INK = "#140c06";
const SHADOW = "0 2px 14px rgba(0,0,0,0.55)";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Everything the renderer needs (hero photo, emblem, fonts) is fetched from this
  // deployment's own origin, so the route works identically in dev and on
  // Vercel's serverless runtime without bundling/tracing any files.
  const origin = new URL(_req.url).origin;
  const products = await getFeedProducts();
  const product = products.find((p) => p.id === slug);
  if (!product) return new Response("Not found", { status: 404 });
  // Map arrow glyphs (e.g. the "⇄" in "Hurghada ⇄ Luxor") to an en-dash — the
  // static Inter/Cormorant latin subsets don't carry them, so they'd tofu.
  const deglyph = (s: string) => s.replace(/[←-⇿⟰-⟿⬀-⯿]/g, "–");
  const card = {
    ...product.card,
    kicker: deglyph(product.card.kicker),
    charm: deglyph(product.card.charm),
  };

  // The hero photo (satori fetches it itself) — an absolute URL on this origin.
  const hero = card.imagePath ? `${origin}${card.imagePath}` : "";

  // Static Cormorant Garamond (display serif) + Inter (sans) as woff — satori
  // can't parse variable fonts (the repo's bundled .ttf are variable) or woff2,
  // so we serve per-weight static instances from /public/fonts/feed.
  const font = async (f: string) => {
    const res = await fetch(`${origin}/fonts/feed/${f}`);
    if (!res.ok) throw new Error(`Font ${f} failed to load: ${res.status}`);
    return res.arrayBuffer();
  };
  const [display, sans] = await Promise.all([font("cormorant-600.woff"), font("inter-600.woff")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: INK,
          fontFamily: "Inter",
        }}
      >
        {hero && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            width={W}
            height={H}
            style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }}
            alt=""
          />
        )}

        {/* Scrim — darkens the top for the logo and the foot for the text, so both
            read on any hero, including a bright desert sky. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(14,9,3,0.74) 0%, rgba(14,9,3,0) 26%, rgba(14,9,3,0) 36%, rgba(14,9,3,0.72) 62%, rgba(14,9,3,0.97) 100%)",
          }}
        />

        {/* Top row: logo as in the video theme (left) + "Included" badge (right). */}
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 48,
            width: W - 96,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${origin}/images/logo-emblem.png`} width={88} height={88} alt="" />
            <div
              style={{
                display: "flex",
                marginLeft: 16,
                fontFamily: "Cormorant",
                fontSize: 56,
                fontWeight: 600,
                color: CREAM,
                textShadow: SHADOW,
              }}
            >
              Luxor Rising
            </div>
          </div>

          {card.badge && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "2px solid rgba(229,212,170,0.75)",
                borderRadius: 46,
                backgroundColor: "rgba(20,12,6,0.72)",
                padding: "16px 36px 16px 26px",
              }}
            >
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke={GOLD_SOFT}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: 14 }}
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    color: GOLD_SOFT,
                    fontSize: 36,
                    fontWeight: 600,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    lineHeight: 1.1,
                  }}
                >
                  Included
                </div>
                {card.badge.note && (
                  <div style={{ display: "flex", color: CREAM, fontSize: 22, fontWeight: 600, marginTop: 4 }}>
                    {card.badge.note}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Foot: place kicker, poetic serif title, gold rule. */}
        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 72,
            width: W - 120,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              color: GOLD_SOFT,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 5,
              textTransform: "uppercase",
              marginBottom: 20,
              textShadow: SHADOW,
            }}
          >
            {card.kicker}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant",
              color: "#ffffff",
              fontSize: 86,
              lineHeight: 1.06,
              fontWeight: 600,
              textShadow: SHADOW,
            }}
          >
            {card.charm}
          </div>
          <div
            style={{
              display: "flex",
              width: 66,
              height: 2,
              backgroundColor: GOLD_SOFT,
              opacity: 0.6,
              marginTop: 30,
            }}
          />
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Cormorant", data: display, weight: 600, style: "normal" },
        { name: "Inter", data: sans, weight: 600, style: "normal" },
      ],
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
