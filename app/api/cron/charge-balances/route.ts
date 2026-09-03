import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  sendBalanceReceipt,
  sendBalancePaymentLink,
  sendOwnerBalanceAlert,
  sendOwnerCronSummary,
  sendTripReminder,
  sendReviewRequest,
  sendDateConfirmation,
} from "@/lib/email";
import { SITE_URL } from "@/lib/email-template";

// The daily automations run (Vercel Cron, see vercel.json). Secured with
// CRON_SECRET. Does three things, each idempotent:
//   1. Balance auto-charge the day before (Hybrid A+B: off-session charge, else
//      email a secure payment link) and alert the owner on failure.
//   2. Trip reminder a few days before (once).
//   3. Review request a day or two after (once).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type EmbeddedCustomer = { email: string | null; name: string | null; phone: string | null };
const oneCustomer = (c: EmbeddedCustomer | EmbeddedCustomer[] | null): EmbeddedCustomer | null =>
  Array.isArray(c) ? (c[0] ?? null) : c;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured → allow (e.g. local dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

const dateOffset = (days: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

type Supa = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  const supabase = getSupabaseAdmin();
  if (!key || !supabase) {
    return Response.json({ ok: false, reason: "not configured" }, { status: 200 });
  }
  const stripe = new Stripe(key);

  const result = {
    due: 0,
    charged: 0,
    linkSent: 0,
    skipped: 0,
    reminders: 0,
    reviews: 0,
    dateConfirmations: 0,
  };

  await chargeBalances(stripe, supabase, result);
  await sendDateConfirmations(supabase, result);
  await sendReminders(supabase, result);
  await sendReviews(supabase, result);

  if (result.charged || result.linkSent || result.reminders || result.reviews || result.dateConfirmations) {
    await sendOwnerCronSummary({
      charged: result.charged,
      linkSent: result.linkSent,
      reminders: result.reminders,
      reviews: result.reviews,
      dateConfirmations: result.dateConfirmations,
    });
  }

  return Response.json({ ok: true, ...result });
}

// 1) Balance auto-charge the day before (also catches last-minute bookings).
async function chargeBalances(stripe: Stripe, supabase: Supa, result: { due: number; charged: number; linkSent: number; skipped: number }) {
  const { data: due, error } = await supabase
    .from("bookings")
    .select(
      "id, product_name, trip_date, currency, balance_cents, stripe_customer_id, stripe_payment_method_id, customers(email,name,phone)",
    )
    .eq("balance_status", "scheduled")
    .gt("balance_cents", 0)
    .not("trip_date", "is", null)
    .lte("trip_date", dateOffset(1));
  if (error) {
    console.error("charge-balances query failed:", error.message);
    return;
  }
  result.due = due?.length ?? 0;

  for (const b of due ?? []) {
    const { data: claimed } = await supabase
      .from("bookings")
      .update({ balance_status: "charging" })
      .eq("id", b.id)
      .eq("balance_status", "scheduled")
      .select("id");
    if (!claimed || claimed.length === 0) {
      result.skipped++;
      continue;
    }

    const cust = oneCustomer(b.customers as EmbeddedCustomer | EmbeddedCustomer[] | null);
    const currency = b.currency || "eur";
    const amountEur = Math.round(b.balance_cents / 100);

    if (!b.stripe_customer_id || !b.stripe_payment_method_id) {
      await sendLink(stripe, supabase, b, cust, currency, "no saved card");
      result.linkSent++;
      continue;
    }

    try {
      const pi = await stripe.paymentIntents.create({
        amount: b.balance_cents,
        currency,
        customer: b.stripe_customer_id,
        payment_method: b.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        description: `${b.product_name || "Experience"} — balance`,
        metadata: { booking_id: b.id, kind: "balance-auto" },
      });

      if (pi.status === "succeeded") {
        await supabase
          .from("bookings")
          .update({ balance_status: "paid", balance_charged_at: new Date().toISOString(), balance_last_error: null })
          .eq("id", b.id);
        if (cust?.email) {
          await sendBalanceReceipt({
            name: cust.name || "Guest",
            email: cust.email,
            productName: b.product_name || "your experience",
            tripDate: b.trip_date ?? undefined,
            amountEur,
          });
        }
        result.charged++;
      } else {
        await sendLink(stripe, supabase, b, cust, currency, `status:${pi.status}`);
        result.linkSent++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`balance charge failed for ${b.id}:`, msg);
      await sendLink(stripe, supabase, b, cust, currency, msg);
      result.linkSent++;
    }
  }
}

// 2) Trip reminder a few days before (once, guarded by reminder_sent_at).
async function sendReminders(supabase: Supa, result: { reminders: number }) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, product_name, trip_date, customers(email,name,phone)")
    .is("reminder_sent_at", null)
    .eq("payment_status", "paid")
    .not("trip_date", "is", null)
    .gte("trip_date", dateOffset(0))
    .lte("trip_date", dateOffset(3));
  if (error) {
    console.error("reminders query failed:", error.message);
    return;
  }
  for (const b of data ?? []) {
    const { data: claimed } = await supabase
      .from("bookings")
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq("id", b.id)
      .is("reminder_sent_at", null)
      .select("id");
    if (!claimed || claimed.length === 0) continue;
    const cust = oneCustomer(b.customers as EmbeddedCustomer | EmbeddedCustomer[] | null);
    if (cust?.email) {
      await sendTripReminder({
        name: cust.name || "Guest",
        email: cust.email,
        productName: b.product_name || "your experience",
        tripDate: b.trip_date ?? undefined,
      });
      result.reminders++;
    }
  }
}

// 3) Review request a day or two after (once, guarded by review_request_sent_at).
async function sendReviews(supabase: Supa, result: { reviews: number }) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, product_name, trip_date, customers(email,name,phone)")
    .is("review_request_sent_at", null)
    .eq("payment_status", "paid")
    .not("trip_date", "is", null)
    .lt("trip_date", dateOffset(0))
    .gte("trip_date", dateOffset(-3));
  if (error) {
    console.error("reviews query failed:", error.message);
    return;
  }
  for (const b of data ?? []) {
    const { data: claimed } = await supabase
      .from("bookings")
      .update({ review_request_sent_at: new Date().toISOString() })
      .eq("id", b.id)
      .is("review_request_sent_at", null)
      .select("id");
    if (!claimed || claimed.length === 0) continue;
    const cust = oneCustomer(b.customers as EmbeddedCustomer | EmbeddedCustomer[] | null);
    if (cust?.email) {
      await sendReviewRequest({
        name: cust.name || "Guest",
        email: cust.email,
        productName: b.product_name || "your experience",
        tripDate: b.trip_date ?? undefined,
      });
      result.reviews++;
    }
  }
}

// Concierge date confirmation: the concierge sets confirmed_time / confirmed_pickup
// and flips date_confirmed=true in Supabase; this emails the guest once.
async function sendDateConfirmations(supabase: Supa, result: { dateConfirmations: number }) {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, product_name, trip_date, confirmed_time, confirmed_pickup, customers(email,name,phone)")
    .eq("date_confirmed", true)
    .is("date_confirmation_sent_at", null)
    .eq("payment_status", "paid");
  if (error) {
    console.error("date-confirmation query failed:", error.message);
    return;
  }
  for (const b of data ?? []) {
    const { data: claimed } = await supabase
      .from("bookings")
      .update({ date_confirmation_sent_at: new Date().toISOString() })
      .eq("id", b.id)
      .is("date_confirmation_sent_at", null)
      .select("id");
    if (!claimed || claimed.length === 0) continue;
    const cust = oneCustomer(b.customers as EmbeddedCustomer | EmbeddedCustomer[] | null);
    if (cust?.email) {
      await sendDateConfirmation({
        name: cust.name || "Guest",
        email: cust.email,
        productName: b.product_name || "your experience",
        tripDate: b.trip_date ?? undefined,
        time: b.confirmed_time ?? undefined,
        pickup: b.confirmed_pickup ?? undefined,
      });
      result.dateConfirmations++;
    }
  }
}

type DueBooking = {
  id: string;
  product_name: string | null;
  trip_date: string | null;
  balance_cents: number;
  stripe_customer_id: string | null;
};

async function sendLink(
  stripe: Stripe,
  supabase: Supa,
  b: DueBooking,
  cust: EmbeddedCustomer | null,
  currency: string,
  error?: string,
) {
  let url: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "pay",
      ...(b.stripe_customer_id ? { customer: b.stripe_customer_id } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: b.balance_cents,
            product_data: {
              name: `${b.product_name || "Experience"} — balance`,
              ...(b.trip_date ? { description: `Experience date: ${b.trip_date}` } : {}),
            },
          },
        },
      ],
      metadata: { kind: "balance", booking_id: b.id },
      success_url: `${SITE_URL}/booking-confirmed?balance=1`,
      cancel_url: `${SITE_URL}/`,
    });
    url = session.url;
  } catch (e) {
    console.error("balance link session failed:", e instanceof Error ? e.message : e);
  }

  await supabase
    .from("bookings")
    .update({ balance_status: url ? "link_sent" : "failed", balance_last_error: error ?? null })
    .eq("id", b.id);

  const amountEur = Math.round(b.balance_cents / 100);
  if (url && cust?.email) {
    await sendBalancePaymentLink({
      name: cust.name || "Guest",
      email: cust.email,
      productName: b.product_name || "your experience",
      tripDate: b.trip_date ?? undefined,
      amountEur,
      url,
    });
  }
  // Always let the owner know an auto-charge didn't go through.
  await sendOwnerBalanceAlert({
    productName: b.product_name || "your experience",
    tripDate: b.trip_date ?? undefined,
    customerName: cust?.name ?? undefined,
    customerEmail: cust?.email ?? undefined,
    customerPhone: cust?.phone ?? undefined,
    amountEur,
    reason: url ? error : `${error ?? "charge failed"} (no link created)`,
  });
}
