import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import PurchaseTracker from "@/components/analytics/PurchaseTracker";

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
    };
  } catch {
    return null; // never block the thank-you page on an analytics lookup
  }
}

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ exp?: string; session_id?: string }>;
}) {
  const { exp, session_id } = await searchParams;
  const order = await getPaidOrder(session_id, exp ?? "");

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
