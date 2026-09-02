import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendBookingConfirmation, sendAhmedJobBrief, sendBalanceReceipt } from "@/lib/email";

// Stripe SDK + raw-body signature verification need the Node runtime.
export const runtime = "nodejs";

type EmbeddedCustomer = { email: string | null; name: string | null };
const oneCustomer = (c: EmbeddedCustomer | EmbeddedCustomer[] | null): EmbeddedCustomer | null =>
  Array.isArray(c) ? (c[0] ?? null) : c;

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !webhookSecret) {
    return new Response("Stripe webhook not configured.", { status: 503 });
  }
  const stripe = new Stripe(key);

  // The raw body string is required — parsing it first breaks the signature.
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature check failed:", err instanceof Error ? err.message : err);
    return new Response("Invalid signature", { status: 400 });
  }

  // We only act on a completed, paid checkout.
  if (event.type !== "checkout.session.completed") {
    return new Response("ignored", { status: 200 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return new Response("not paid", { status: 200 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Don't ask Stripe to retry forever if the DB isn't wired.
    return new Response("db not configured", { status: 200 });
  }

  const md = session.metadata ?? {};

  // ── Branch 1: a balance top-up (the fallback payment link) completing.
  // Mark the existing booking's balance paid; do NOT create a new booking.
  if (md.kind === "balance" && md.booking_id) {
    const { data: bk } = await supabase
      .from("bookings")
      .select("id, balance_status, product_name, trip_date, customers(email,name)")
      .eq("id", md.booking_id)
      .maybeSingle();
    if (bk && bk.balance_status !== "paid") {
      await supabase
        .from("bookings")
        .update({
          balance_status: "paid",
          balance_charged_at: new Date().toISOString(),
          balance_last_error: null,
        })
        .eq("id", md.booking_id);
      const cust = oneCustomer(bk.customers as EmbeddedCustomer | EmbeddedCustomer[] | null);
      if (cust?.email) {
        await sendBalanceReceipt({
          name: cust.name || "Guest",
          email: cust.email,
          productName: bk.product_name || "your experience",
          tripDate: bk.trip_date ?? undefined,
          amountEur: session.amount_total != null ? Math.round(session.amount_total / 100) : undefined,
        });
      }
    }
    return new Response("balance recorded", { status: 200 });
  }

  // ── Branch 2: a new booking.
  // Idempotency — Stripe delivers at least once. Skip if already recorded.
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return new Response("already recorded", { status: 200 });

  const email = session.customer_details?.email?.toLowerCase() ?? null;
  const clientName = session.customer_details?.name || "Guest";
  const phone = session.customer_details?.phone || null;
  const guests = md.guests ? parseInt(md.guests, 10) || null : null;
  const tripDate = md.date || null;
  const productName = md.product_name || md.slug || "Experience";
  const preferences = md.preferences || "";
  const payMode = md.mode || "full";
  const amountCents = session.amount_total ?? null;
  const fullTotalCents = md.full_total_cents ? parseInt(md.full_total_cents, 10) || null : null;
  const balanceCents = md.balance_cents ? parseInt(md.balance_cents, 10) || null : null;

  // For a deposit, capture the saved card + customer so the balance can be
  // charged off-session the day before the trip.
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
  let paymentMethodId: string | null = null;
  if (payMode === "deposit" && typeof session.payment_intent === "string") {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      paymentMethodId = typeof pi.payment_method === "string" ? pi.payment_method : null;
    } catch (e) {
      console.error("PI retrieve failed:", e instanceof Error ? e.message : e);
    }
  }
  const scheduleBalance =
    payMode === "deposit" && (balanceCents ?? 0) > 0 && !!stripeCustomerId && !!paymentMethodId;

  // Upsert the customer by email, then record the booking.
  let customerId: string | null = null;
  if (email) {
    // Only include phone when Stripe actually returned one, so a repeat booking
    // without a phone doesn't wipe a number captured earlier.
    const customerRow: { email: string; name: string; source: string; phone?: string } = {
      email,
      name: clientName,
      source: "booking",
    };
    if (phone) customerRow.phone = phone;
    const { data: cust } = await supabase
      .from("customers")
      .upsert(customerRow, { onConflict: "email" })
      .select("id")
      .single();
    customerId = cust?.id ?? null;
  }

  const { error } = await supabase.from("bookings").insert({
    customer_id: customerId,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    product_slug: md.slug || null,
    product_name: productName,
    guests,
    trip_date: tripDate,
    amount_total_cents: amountCents,
    currency: session.currency || "eur",
    pay_mode: payMode,
    payment_status: "paid",
    notes: preferences || null,
    stripe_customer_id: stripeCustomerId,
    stripe_payment_method_id: paymentMethodId,
    balance_cents: balanceCents ?? 0,
    balance_status: scheduleBalance ? "scheduled" : "none",
  });
  if (error) {
    console.error("booking insert failed:", error.message);
    return new Response("db error", { status: 500 }); // let Stripe retry
  }

  // Emails are best-effort — never fail the webhook over them.
  const amountEur = amountCents != null ? Math.round(amountCents / 100) : undefined;
  const totalEur = fullTotalCents != null ? Math.round(fullTotalCents / 100) : undefined;
  const balanceEur = balanceCents != null ? Math.round(balanceCents / 100) : undefined;
  if (email) {
    await sendBookingConfirmation({
      name: clientName,
      email,
      productName,
      tripDate: tripDate ?? undefined,
      guests: guests ?? undefined,
      amountEur,
      totalEur,
      balanceEur,
      payMode,
      preferences: preferences || undefined,
      // Tell the guest the balance auto-charges only when we actually scheduled it.
      balanceAutoCharge: scheduleBalance,
    });
  }
  await sendAhmedJobBrief({
    clientName,
    productName,
    tripDate: tripDate ?? undefined,
    guests: guests ?? undefined,
    preferences: preferences || undefined,
    clientContact: [email, phone].filter(Boolean).join(" · ") || undefined,
    balanceEur: payMode === "deposit" ? balanceEur : undefined,
  });

  return new Response("ok", { status: 200 });
}
