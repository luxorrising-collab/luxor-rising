import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "./LegalPage.module.css";

export const metadata: Metadata = {
  title: "Legal, Payments & Help",
  description: "Terms, privacy, cookies, safety, payments and FAQ for Luxor Rising.",
  robots: { index: false, follow: true },
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "Terms & Conditions",
    p: "Booking terms, the role of Luxor Rising as concierge and coordinator, the role of licensed local partners who deliver the experiences, liability, and the single-day / no-overnight nature of the experiences.",
  },
  {
    h: "Cancellation & Refunds",
    p: "Free cancellation up to 7 days before; deposit vs pay-in-full; what happens if a partner cannot deliver; how refunds are processed and how long they take.",
  },
  {
    h: "Payments",
    p: "Accepted methods, currency (EUR), when the balance is due, and the security of card handling via the payment provider. No card details are stored by Luxor Rising.",
  },
  {
    h: "Privacy Policy",
    p: "What personal data is collected (name, email, trip details), why, how long it is kept, who it is shared with (local partners, payment provider), and your rights under GDPR.",
  },
  {
    h: "Cookie Policy",
    p: "Which cookies the site sets, essential vs analytics, and how to manage them.",
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
          <div className={styles.ph}>
            <b>Placeholder.</b> Final legal copy (Terms, Privacy, Cookies) will be provided — ideally reviewed by
            a lawyer — before live payments go on. Help pages (Safety, Payments &amp; Refunds, FAQ) can be written
            in-house. In the full build each becomes its own page, editable in Keystatic.
          </div>
          {SECTIONS.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
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
