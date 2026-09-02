import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendBookingConfirmation, sendAhmedJobBrief } from "@/lib/email";

// Stripe SDK + raw-body signature verification need the Node runtime.
export const runtime = "nodejs";

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

  // Idempotency — Stripe delivers at least once. Skip if already recorded.
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return new Response("already recorded", { status: 200 });

  const md = session.metadata ?? {};
  const email = session.customer_details?.email?.toLowerCase() ?? null;
  const clientName = session.customer_details?.name || "Guest";
  const phone = session.customer_details?.phone || null;
  const guests = md.guests ? parseInt(md.guests, 10) || null : null;
  const tripDate = md.date || null;
  const productName = md.product_name || md.slug || "Experience";
  const preferences = md.preferences || "";
  const payMode = md.mode || "full";
  const amountCents = session.amount_total ?? null;

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
  });
  if (error) {
    console.error("booking insert failed:", error.message);
    return new Response("db error", { status: 500 }); // let Stripe retry
  }

  // Emails are best-effort — never fail the webhook over them.
  const amountEur = amountCents != null ? Math.round(amountCents / 100) : undefined;
  if (email) {
    await sendBookingConfirmation({
      name: clientName,
      email,
      productName,
      tripDate: tripDate ?? undefined,
      guests: guests ?? undefined,
      amountEur,
      payMode,
    });
  }
  await sendAhmedJobBrief({
    clientName,
    productName,
    tripDate: tripDate ?? undefined,
    guests: guests ?? undefined,
    preferences: preferences || undefined,
    clientContact: [email, phone].filter(Boolean).join(" · ") || undefined,
  });

  return new Response("ok", { status: 200 });
}
