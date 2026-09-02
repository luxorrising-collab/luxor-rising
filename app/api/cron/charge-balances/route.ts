import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { sendBalanceReceipt, sendBalancePaymentLink } from "@/lib/email";
import { SITE_URL } from "@/lib/email-template";

// Charges outstanding deposit balances the day before the trip (Hybrid A+B):
// attempt an off-session charge of the saved card; if that can't be taken
// (decline / SCA), email the guest a secure link to pay the balance instead.
//
// Runs from Vercel Cron (see vercel.json). Secured with CRON_SECRET.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type EmbeddedCustomer = { email: string | null; name: string | null };
const oneCustomer = (c: EmbeddedCustomer | EmbeddedCustomer[] | null): EmbeddedCustomer | null =>
  Array.isArray(c) ? (c[0] ?? null) : c;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // not configured → allow (e.g. local dev)
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

  const key = process.env.STRIPE_SECRET_KEY;
  const supabase = getSupabaseAdmin();
  if (!key || !supabase) {
    return Response.json({ ok: false, reason: "not configured" }, { status: 200 });
  }
  const stripe = new Stripe(key);

  // Charge the day before: everything with a trip on/before tomorrow that is
  // still scheduled (also catches last-minute bookings made inside the window).
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const { data: due, error } = await supabase
    .from("bookings")
    .select(
      "id, product_name, trip_date, currency, balance_cents, stripe_customer_id, stripe_payment_method_id, customers(email,name)",
    )
    .eq("balance_status", "scheduled")
    .gt("balance_cents", 0)
    .not("trip_date", "is", null)
    .lte("trip_date", cutoffDate);

  if (error) {
    console.error("charge-balances query failed:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const result = { due: due?.length ?? 0, charged: 0, linkSent: 0, skipped: 0 };

  for (const b of due ?? []) {
    // Optimistic claim so overlapping runs can't double-charge.
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
      // Nothing saved to charge → fall back to a link immediately.
      await sendLink(stripe, supabase, b, cust, currency);
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
          .update({
            balance_status: "paid",
            balance_charged_at: new Date().toISOString(),
            balance_last_error: null,
          })
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
        // requires_action / processing → needs the guest present: send a link.
        await sendLink(stripe, supabase, b, cust, currency, `status:${pi.status}`);
        result.linkSent++;
      }
    } catch (err) {
      // Card declined / authentication required → fall back to a link.
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`balance charge failed for ${b.id}:`, msg);
      await sendLink(stripe, supabase, b, cust, currency, msg);
      result.linkSent++;
    }
  }

  return Response.json({ ok: true, ...result });
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
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
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
    .update({
      balance_status: url ? "link_sent" : "failed",
      balance_last_error: error ?? null,
    })
    .eq("id", b.id);

  if (url && cust?.email) {
    await sendBalancePaymentLink({
      name: cust.name || "Guest",
      email: cust.email,
      productName: b.product_name || "your experience",
      tripDate: b.trip_date ?? undefined,
      amountEur: Math.round(b.balance_cents / 100),
      url,
    });
  }
}
