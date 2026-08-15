import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <section style={{ minHeight: "68vh", display: "flex", alignItems: "center" }}>
        <div className="wrap-narrow center">
          <span className="eyebrow">404</span>
          <h1 className="display" style={{ margin: ".3rem 0 1rem" }}>
            This path doesn&apos;t lead anywhere.
          </h1>
          <p className="lead" style={{ maxWidth: "48ch", margin: "0 auto 1.8rem" }}>
            The page you were after has moved or never existed. Let&apos;s get you
            back to the good part of Egypt.
          </p>
          <div style={{ display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary btn-lg">
              Back to home
            </Link>
            <Link href="/experiences" className="btn btn-line btn-lg">
              Browse experiences
            </Link>
          </div>
        </div>
      </section>
      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
