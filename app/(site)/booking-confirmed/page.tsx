import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Booking confirmed — Luxor Rising",
  robots: { index: false, follow: false },
};

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ exp?: string }>;
}) {
  const { exp } = await searchParams;

  return (
    <>
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
