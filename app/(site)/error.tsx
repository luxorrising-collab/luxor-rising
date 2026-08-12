"use client";

import { useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console + server logs for debugging.
    console.error(error);
  }, [error]);

  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <section style={{ minHeight: "68vh", display: "flex", alignItems: "center" }}>
        <div className="wrap-narrow center">
          <span className="eyebrow">Something went wrong</span>
          <h1 className="display" style={{ margin: ".3rem 0 1rem" }}>
            That didn&apos;t load as it should.
          </h1>
          <p className="lead" style={{ maxWidth: "48ch", margin: "0 auto 1.8rem" }}>
            A hiccup on our side, not yours. Try again — and if it keeps
            happening, message your consigliere on WhatsApp and we&apos;ll sort it.
          </p>
          <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => reset()}>
              Try again
            </button>
            <Link href="/" className="btn btn-line btn-lg">
              Back to home
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
