import { NextResponse } from "next/server";
import Stripe from "stripe";
import { quoteBooking } from "@/lib/quote";

// Stripe's SDK needs the Node runtime (not Edge).
export const runtime = "nodejs";

type Body = {
  name?: string;
  slug?: string;
  mode?: "full" | "deposit";
  guests?: number;
  photo?: boolean; // concierge photographer add-on
  hurg?: boolean; // Hurghada ⇄ Luxor crossing add-on
  date?: string;
  cancelPath?: string;
  preferences?: string;
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

  const { name, slug, mode = "full", guests, date, cancelPath, preferences, photo, hurg } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: "Missing booking details." }, { status: 400 });
  }

  // Authoritative price: recomputed on the server from the product + chosen
  // options. The browser's amount is never trusted — this is what prevents a
  // tampered request from paying less than the real price.
  const quote = await quoteBooking({ slug, guests: guests ?? 1, photo: !!photo, hurg: !!hurg });
  if (!quote) {
    return NextResponse.json(
      { error: "That option isn't available to book online. Please send us an enquiry." },
      { status: 400 },
    );
  }

  // A deposit relies on the day-before balance auto-charge, which can't run this
  // close to the date — require full payment instead. The client already hides
  // the deposit option for near dates; this guards against tampering.
  if (mode === "deposit") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntil = date
      ? Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86400000)
      : -1;
    if (daysUntil < 2) {
      return NextResponse.json(
        { error: "A deposit isn't available this close to your date — please pay in full." },
        { status: 400 },
      );
    }
  }

  // Amounts derived from the authoritative quote (euro-cents throughout).
  const fullTotalCents = quote.totalCents;
  const depositCents = Math.round((fullTotalCents / 100) * (quote.depositPercent / 100)) * 100;
  const amountCents = mode === "deposit" ? depositCents : fullTotalCents;
  const balanceCents = mode === "deposit" ? Math.max(0, fullTotalCents - depositCents) : 0;
  if (amountCents < 100) {
    return NextResponse.json({ error: "This booking can't be processed. Please contact us." }, { status: 400 });
  }
  const eur = (cents: number) => `€${Math.round(cents / 100)}`;

  // The note above the pay button. For a deposit it doubles as the mandate for
  // charging the balance off-session (required to save & reuse the card).
  const submitMessage =
    mode === "deposit"
      ? `You're paying a deposit of ${eur(amountCents)} now. The remaining ${eur(balanceCents)} will be charged automatically to this card the day before your experience. If it can't be taken automatically we'll email you a secure link. Free cancellation up to 7 days before. By booking you agree to our Terms & Cancellation Policy at luxorrising.com/legal.`
      : "Free cancellation up to 7 days before your date. By booking you agree to our Terms & Cancellation Policy at luxorrising.com/legal.";

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  // Only accept an internal, single-slash path for the cancel URL (no open
  // redirects). Falls back to the product page.
  const safeCancel =
    cancelPath && /^\/(?!\/)[A-Za-z0-9\-_/#?=&.]*$/.test(cancelPath)
      ? cancelPath
      : `/experiences/${slug}#book`;
  const stripe = new Stripe(key);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // "Book" reads better than "Pay" for a reservation.
      submit_type: "book",
      // Email is always collected by Checkout; also ask for a phone number so
      // the concierge / delivery partner can coordinate on the day.
      phone_number_collection: { enabled: true },
      // Create a Stripe customer for every booking; for a deposit, also save the
      // card so the balance can be charged off-session the day before the trip.
      customer_creation: "always",
      payment_intent_data: mode === "deposit" ? { setup_future_usage: "off_session" } : undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amountCents),
            product_data: {
              name: mode === "deposit" ? `${name} — deposit` : name,
              // A concise order recap shown on the Stripe page.
              description: [
                guests ? `${guests} guest${guests > 1 ? "s" : ""}` : null,
                date || null,
                mode === "deposit"
                  ? `Deposit of ${eur(amountCents)} of ${eur(fullTotalCents)} — ${eur(balanceCents)} balance due on the day`
                  : "Paid in full",
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
        },
      ],
      // Legal note / balance mandate shown right above the pay button.
      custom_text: {
        submit: { message: submitMessage },
      },
      metadata: {
        slug,
        product_name: name.slice(0, 480),
        guests: guests ? String(guests) : "",
        date: date || "",
        mode,
        full_total_cents: String(fullTotalCents),
        balance_cents: String(balanceCents),
        preferences: (preferences || "").slice(0, 480),
      },
      // {CHECKOUT_SESSION_ID} is substituted by Stripe on redirect — it lets the
      // confirmation page retrieve the real, paid amount server-side for analytics.
      success_url: `${origin}/booking-confirmed?exp=${encodeURIComponent(name)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${safeCancel}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
