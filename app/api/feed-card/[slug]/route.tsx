import { ImageResponse } from "next/og";
import { getFeedProducts } from "@/lib/feeds";

// A branded catalogue card for the Meta product feed — the same graphic as the
// Design Your Day experience cards (full-bleed hero, dark scrim, gold "Included"
// pill, place kicker, poetic serif title, gold rule, "from" price), rendered to
// a square PNG. Meta/Google fetch this URL as the item's image_link, so the ads
// show a composed card instead of a plain photo. Regenerated at most hourly.
export const revalidate = 3600;

// Square 1080 — the safe, un-cropped size for Advantage+ Catalog / dynamic ads.
const W = 1080;
const H = 1080;

const GOLD_SOFT = "#E5D4AA";
const INK = "#140c06";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Everything the renderer needs (hero photo + fonts) is fetched from this
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
    priceValue: deglyph(product.card.priceValue),
  };

  // The hero photo (satori fetches it itself) — an absolute URL on this origin.
  const hero = card.imagePath ? `${origin}${card.imagePath}` : "";

  // Static Cormorant Garamond (display serif) + Inter (sans) as woff — satori
  // can't parse variable fonts (the repo's bundled .ttf are variable) or woff2,
  // so we serve per-weight static instances from /public/fonts/feed.
  const font = (f: string) =>
    fetch(`${origin}/fonts/feed/${f}`).then((r) => r.arrayBuffer());
  const [display, sans, sansLight] = await Promise.all([
    font("cormorant-600.woff"),
    font("inter-600.woff"),
    font("inter-400.woff"),
  ]);

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

        {/* Scrim — the card's two-stop darkening, so the foot reads cleanly. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(14,9,3,0.40) 0%, rgba(14,9,3,0) 22%, rgba(14,9,3,0) 40%, rgba(14,9,3,0.62) 70%, rgba(14,9,3,0.96) 100%)",
          }}
        />

        {/* Top row: gold "Included" pill (left) + wordmark (right). */}
        <div
          style={{
            position: "absolute",
            top: 46,
            left: 52,
            width: W - 104,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {card.included ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(229,212,170,0.55)",
                borderRadius: 999,
                backgroundColor: "rgba(20,12,6,0.46)",
                color: GOLD_SOFT,
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                padding: "13px 24px",
              }}
            >
              Included
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div
            style={{
              display: "flex",
              color: GOLD_SOFT,
              fontSize: 23,
              fontWeight: 600,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Luxor Rising
          </div>
        </div>

        {/* Foot: place kicker, poetic serif title, gold rule, price. */}
        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 66,
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
              marginBottom: 28,
            }}
          />
          <div style={{ display: "flex", alignItems: "baseline" }}>
            {card.priceLead && (
              <div
                style={{
                  display: "flex",
                  fontSize: 25,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "rgba(245,238,222,0.82)",
                  marginRight: 16,
                }}
              >
                {card.priceLead}
              </div>
            )}
            <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 60, color: GOLD_SOFT }}>
              {card.priceValue}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: "Cormorant", data: display, weight: 600, style: "normal" },
        { name: "Inter", data: sans, weight: 600, style: "normal" },
        { name: "Inter", data: sansLight, weight: 400, style: "normal" },
      ],
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
