import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resolvePicks, picksLine } from "@/lib/day-names";
import { quoteBooking } from "@/lib/quote";
import {
  FREE_CANCEL_HOURS,
  balanceChargeDate,
  fmtDay,
  freeCancelDate,
  freeCancelOpen,
  isPayMode,
  payModeAllowed,
  splitAmounts,
  type PayMode,
} from "@/lib/payment-policy";

// The version of the Terms & Cancellation Policy the guest accepts at checkout
// (stored on the payment, so any later question is answered by the exact text).
const TERMS_VERSION = "2026-11-18";

// Stripe's SDK needs the Node runtime (not Edge).
export const runtime = "nodejs";

type Body = {
  name?: string;
  slug?: string;
  mode?: PayMode;
  guests?: number;
  photo?: boolean; // concierge photographer add-on
  hurg?: boolean; // Hurghada ⇄ Luxor crossing add-on
  seaTransfer?: boolean; // end-to-end concierge transfer (Marsa Alam / Hurghada)
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

  const { name, slug, guests, date, cancelPath, preferences, photo, hurg, seaTransfer } = body;
  const mode: PayMode = isPayMode(body.mode) ? body.mode : "full";
  // The guest's picks ("add to my day"), validated against the canonical list.
  const picks = await resolvePicks((body as { picks?: unknown }).picks);
  const picksText = picksLine(picks);
  if (!name || !slug) {
    return NextResponse.json({ error: "Missing booking details." }, { status: 400 });
  }

  // Authoritative price: recomputed on the server from the product + chosen
  // options. The browser's amount is never trusted — this is what prevents a
  // tampered request from paying less than the real price.
  const quote = await quoteBooking({ slug, guests: guests ?? 1, photo: !!photo, hurg: !!hurg, seaTransfer: !!seaTransfer });
  if (!quote) {
    return NextResponse.json(
      { error: "That option isn't available to book online. Please send us an enquiry." },
      { status: 400 },
    );
  }

  // Every way to pay needs a valid date from tomorrow on; "20% today" with the
  // automatic balance needs at least three days (the balance is charged 48 hours
  // before). The client hides what isn't allowed; this guards against tampering.
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !payModeAllowed("full", date)) {
    return NextResponse.json({ error: "Please choose a date from tomorrow onwards." }, { status: 400 });
  }
  if (!payModeAllowed(mode, date)) {
    return NextResponse.json(
      { error: "Paying 20% now isn't available this close to your date. Please pay in full, or pay the rest locally." },
      { status: 400 },
    );
  }

  // Amounts derived from the authoritative quote (euro-cents throughout).
  const fullTotalCents = quote.totalCents;
  const { todayCents: amountCents, balanceCents } = splitAmounts(fullTotalCents, mode, quote.depositPercent);
  if (amountCents < 100) {
    return NextResponse.json({ error: "This booking can't be processed. Please contact us." }, { status: 400 });
  }
  const eur = (cents: number) => `€${Math.round(cents / 100).toLocaleString("en-US")}`;
  const chargeOn = mode === "deposit" ? balanceChargeDate(date) : "";

  // The note above the pay button. For "20% today" it is also the mandate for
  // charging the balance off-session (required to save and reuse the card), so
  // it states the amount, the date and the card, plainly.
  const cancelNote = freeCancelOpen(date)
    ? `Free cancellation until ${fmtDay(freeCancelDate(date))} (${FREE_CANCEL_HOURS} hours before), refunded less only costs already committed. After that, or if you don't show, your payment is non-refundable.`
    : `Your date is within ${FREE_CANCEL_HOURS} hours, so this booking is non-refundable once paid.`;
  const submitMessage =
    mode === "deposit"
      ? `You pay ${eur(amountCents)} now (${quote.depositPercent}%). You authorise Luxor Rising to charge the remaining ${eur(balanceCents)} to this card automatically on ${fmtDay(chargeOn)}, 48 hours before your date; if it can't be taken we email you a secure link. ${cancelNote} By booking you agree to our Terms & Cancellation Policy (luxorrising.com/legal).`
      : mode === "local"
        ? `You pay ${eur(amountCents)} now (${quote.depositPercent}%) and the remaining ${eur(balanceCents)} on the day to your concierge, in cash: Egyptian pounds, euros or US dollars at the day's mid-market rate. ${cancelNote} By booking you agree to our Terms & Cancellation Policy (luxorrising.com/legal).`
        : `${cancelNote} By booking you agree to our Terms & Cancellation Policy (luxorrising.com/legal).`;

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
      // card so the balance can be charged off-session 48 hours before the trip.
      customer_creation: "always",
      payment_intent_data: {
        ...(mode === "deposit" ? { setup_future_usage: "off_session" as const } : {}),
        description: `${name}${date ? ` · ${date}` : ""} · ${mode === "full" ? "paid in full" : mode === "deposit" ? "deposit, balance auto-charged" : "deposit, balance paid locally"}`.slice(0, 1000),
        metadata: { mode, trip_date: date, terms_version: TERMS_VERSION },
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(amountCents),
            product_data: {
              name:
                mode === "full" ? name : `${name} — ${quote.depositPercent}% deposit`,
              // A concise order recap shown on the Stripe page.
              description: [
                guests ? `${guests} guest${guests > 1 ? "s" : ""}` : null,
                date || null,
                picks.length ? `Your experiences: ${picksText}` : null,
                mode === "deposit"
                  ? `${eur(amountCents)} of ${eur(fullTotalCents)} today — ${eur(balanceCents)} charged automatically on ${fmtDay(chargeOn)}`
                  : mode === "local"
                    ? `${eur(amountCents)} of ${eur(fullTotalCents)} today — ${eur(balanceCents)} paid on the day in EGP, EUR or USD`
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
        balance_due: chargeOn,
        terms_version: TERMS_VERSION,
        preferences: (preferences || "").slice(0, 480),
        // the picks as slugs (the webhook resolves the same canonical names)
        picks: picks.map((p) => p.slug).join(",").slice(0, 490),
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
