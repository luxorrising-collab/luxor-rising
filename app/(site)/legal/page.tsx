import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "./LegalPage.module.css";

export const metadata: Metadata = {
  title: "Legal, Payments & Help",
  description: "Terms, privacy, cookies, safety, payments and FAQ for Luxor Rising.",
  robots: { index: false, follow: true },
};

const SECTIONS: { h: string; p: string; href?: string }[] = [
  {
    h: "Terms & Conditions",
    p: "Booking terms, our role as concierge and coordinator, the licensed local partners who deliver the experiences, limits of liability, and the single-day nature of the experiences",
    href: "/legal/terms",
  },
  {
    h: "Cancellation & Refunds",
    p: "Pay in full or a 50% deposit; free cancellation up to 7 days before (less non-refundable costs); the Concierge Day first-two-hours promise; how refunds are processed",
    href: "/legal/cancellation",
  },
  {
    h: "Privacy Policy",
    p: "What personal data we collect, why, how long we keep it, who it is shared with (local partners, Stripe, and — only with consent — Google/Meta), and your rights under GDPR",
    href: "/legal/privacy",
  },
  {
    h: "Cookie Policy",
    p: "Exactly which cookies the site sets (essential, analytics, marketing), why, how long they last, and how you stay in control",
    href: "/legal/cookies",
  },
  {
    h: "Safety",
    p: "Working only with licensed guides and vetted drivers, on-the-ground support via WhatsApp, and practical safety notes for travellers in Luxor and on the Red Sea.",
  },
  {
    h: "FAQ",
    p: "The common questions — is it worth it over a group tour, who guides and drives, how payment works, what happens if plans change — gathered here in one place.",
  },
];

export default function LegalPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>Legal &amp; help
        </nav>
      </div>
      <section className={styles.legal}>
        <div className="wrap-narrow">
          <span className="eyebrow">Legal, payments &amp; help</span>
          <h1 className="display" style={{ margin: ".3rem 0 1.4rem" }}>
            Policies &amp; help
          </h1>
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
              {s.href && (
                <p>
                  <Link href={s.href} className="btn btn-ghost">
                    Read the full policy →
                  </Link>
                </p>
              )}
            </div>
          ))}
          <p style={{ marginTop: "2.4rem" }}>
            <Link href="/concierge-day" className="btn btn-primary">
              Design your day →
            </Link>
          </p>
        </div>
      </section>
      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
