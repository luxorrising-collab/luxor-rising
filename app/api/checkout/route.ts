import { NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe's SDK needs the Node runtime (not Edge).
export const runtime = "nodejs";

type Body = {
  name?: string;
  slug?: string;
  amountCents?: number;
  mode?: "full" | "deposit";
  guests?: number;
  date?: string;
};

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Not configured yet — the client shows a friendly message and offers the
    // enquiry fallback. Add STRIPE_SECRET_KEY in the environment to go live.
    return NextResponse.json(
      { error: "Payments are not switched on yet. Please add your Stripe key." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { name, slug, amountCents, mode = "full", guests, date } = body;
  if (!name || !slug || !amountCents || amountCents < 100) {
    return NextResponse.json({ error: "Missing or invalid booking details." }, { status: 400 });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amountCents),
            product_data: {
              name: mode === "deposit" ? `${name} — deposit` : name,
              description: [
                guests ? `${guests} guest${guests > 1 ? "s" : ""}` : null,
                date || null,
                mode === "deposit" ? "Deposit — balance paid on the day" : "Paid in full",
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
        },
      ],
      metadata: {
        slug,
        guests: guests ? String(guests) : "",
        date: date || "",
        mode,
      },
      success_url: `${origin}/booking-confirmed?exp=${encodeURIComponent(name)}`,
      cancel_url: `${origin}/experiences/${slug}#book`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
