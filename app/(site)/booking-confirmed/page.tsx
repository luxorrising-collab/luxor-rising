import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import { cookies, headers } from "next/headers";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import PurchaseTracker from "@/components/analytics/PurchaseTracker";
import { reader } from "@/lib/keystatic-reader";
import { sendMetaPurchase } from "@/lib/meta-capi";

export const metadata: Metadata = {
  title: "Booking confirmed — Luxor Rising",
  robots: { index: false, follow: false },
};

// Stripe SDK needs the Node runtime.
export const runtime = "nodejs";

type Order = {
  transactionId: string;
  value: number;
  currency: string;
  slug: string;
  name: string;
  email: string | null;
};

// Retrieve the real, PAID amount from Stripe — never trust a client-supplied
// value for conversion reporting. Returns null unless the session is paid.
async function getPaidOrder(
  sessionId: string | undefined,
  fallbackName: string,
): Promise<Order | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!sessionId || !key) return null;
  try {
    const stripe = new Stripe(key);
    const s = await stripe.checkout.sessions.retrieve(sessionId);
    if (s.payment_status !== "paid" || !s.amount_total) return null;
    return {
      transactionId:
        typeof s.payment_intent === "string" ? s.payment_intent : s.id,
      value: s.amount_total / 100,
      currency: (s.currency ?? "eur").toUpperCase(),
      slug: s.metadata?.slug || "experience",
      name: fallbackName || "Luxor Rising experience",
      email: s.customer_details?.email ?? null,
    };
  } catch {
    return null; // never block the thank-you page on an analytics lookup
  }
}

// Server-side Meta Purchase (Conversions API), fired once the order is paid.
// Best practice: shares the browser Pixel's event id for de-dup, enriches match
// with hashed email + fbp/fbc + IP/UA, and ONLY runs with marketing consent.
async function fireServerConversion(order: Order): Promise<void> {
  try {
    const token = process.env.META_CAPI_ACCESS_TOKEN;
    if (!token) return; // CAPI not configured — Pixel still covers the browser
    const tracking = await reader.singletons.tracking.read();
    if (!tracking?.enabled || !tracking.metaPixelId) return;

    const cookieStore = await cookies();
    let marketing = false;
    try {
      const raw = cookieStore.get("lr_consent")?.value;
      marketing = !!(raw && JSON.parse(decodeURIComponent(raw)).marketing);
    } catch {
      marketing = false;
    }
    if (!marketing) return; // GDPR: no marketing consent → no server conversion

    const hdrs = await headers();
    const host = hdrs.get("host");

    await sendMetaPurchase({
      pixelId: tracking.metaPixelId,
      token,
      eventId: order.transactionId, // matches the browser Pixel for de-dup
      value: order.value,
      currency: order.currency,
      contentIds: [order.slug],
      email: order.email,
      fbp: cookieStore.get("_fbp")?.value ?? null,
      fbc: cookieStore.get("_fbc")?.value ?? null,
      clientIp: (hdrs.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
      userAgent: hdrs.get("user-agent"),
      eventSourceUrl: host ? `https://${host}/booking-confirmed` : null,
      testEventCode: process.env.META_CAPI_TEST_EVENT_CODE ?? null,
    });
  } catch {
    // analytics must never break the thank-you page
  }
}

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ exp?: string; session_id?: string }>;
}) {
  const { exp, session_id } = await searchParams;
  const order = await getPaidOrder(session_id, exp ?? "");
  if (order) await fireServerConversion(order);

  return (
    <>
      {order && (
        <PurchaseTracker
          transactionId={order.transactionId}
          value={order.value}
          currency={order.currency}
          items={[
            {
              item_id: order.slug,
              item_name: order.name,
              price: order.value,
              quantity: 1,
            },
          ]}
        />
      )}
      <Nav scrollAware={false} ctaHref="/experiences" ctaLabel="Experiences" />
      <section style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
        <div className="wrap-narrow center">
          <div
            aria-hidden
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              margin: "0 auto 1.4rem",
              display: "grid",
              placeItems: "center",
              background: "var(--color-cream)",
              border: "1px solid var(--color-gold-soft)",
              color: "var(--color-gold-deep)",
              fontSize: "1.6rem",
            }}
          >
            ✓
          </div>
          <span className="eyebrow">You&apos;re booked</span>
          <h1 className="display" style={{ margin: ".3rem 0 1rem" }}>
            Thank you — your place is reserved.
          </h1>
          <p className="lead" style={{ maxWidth: "52ch", margin: "0 auto 1.6rem" }}>
            {exp ? (
              <>
                Your payment for <em>{exp}</em> went through and a receipt is on its way to your
                email.
              </>
            ) : (
              <>Your payment went through and a receipt is on its way to your email.</>
            )}{" "}
            Your consigliere will be in touch within 24 hours to lock in the exact timing and every
            last detail.
          </p>
          <div
            style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/experiences" className="btn btn-primary btn-lg">
              Browse more experiences
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Build a whole day
            </Link>
          </div>
        </div>
      </section>
      <MinimalFooter
        links={[
          { href: "/", label: "Home" },
          { href: "/experiences", label: "Experiences" },
          { href: "/concierge-day", label: "Concierge Days" },
        ]}
        bottomText="© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada"
      />
    </>
  );
}
