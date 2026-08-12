import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "../LegalPage.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms on which Luxor Rising arranges and coordinates private experiences delivered by licensed local partners.",
};

export default function TermsPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/legal">Legal &amp; help</Link>
          <span>/</span>Terms &amp; Conditions
        </nav>
      </div>

      <section className={styles.legal}>
        <div className="wrap-narrow">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ margin: ".3rem 0 .5rem" }}>
            Terms &amp; Conditions
          </h1>
          <p className={styles.updated}>Last updated 12 August 2026</p>

          <div className={styles.ph}>
            <b>Before go-live:</b> fill the bracketed values (legal entity,
            registered address, governing law) and have this reviewed by a lawyer
            for your jurisdiction (Egypt + the EU/UK markets you sell to).
          </div>

          <p className={styles.lead}>
            These terms govern your booking with Luxor Rising. By reserving an
            experience you agree to them, together with our{" "}
            <Link href="/legal/cancellation">Cancellation &amp; Refunds</Link>{" "}
            policy and <Link href="/legal/cookies">Cookie Policy</Link>. Please
            read them — they set out what we do, what we don&apos;t, and the limits
            of our responsibility.
          </p>

          <h2>1. Who we are and what we do</h2>
          <p>
            Luxor Rising (&ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by{" "}
            <strong>[Luxor Rising — legal entity name]</strong> of{" "}
            <strong>[registered address]</strong>, is a private travel{" "}
            <strong>concierge and coordinator</strong>. We design, arrange and
            coordinate private experiences that are <strong>delivered by
            independent, licensed local partners</strong> — Egyptologists and
            guides, drivers, boat operators, balloon operators and hosts. We select
            and manage these partners on your behalf; we do not ourselves provide
            guiding, transport or other on-the-ground services.
          </p>

          <h2>2. Bookings, prices and payment</h2>
          <ul>
            <li>
              Prices are shown on the site and confirmed at checkout. Obvious
              errors (for example a clear mispricing) may be corrected before your
              booking is confirmed.
            </li>
            <li>
              You reserve by paying the full price or a 50% deposit; payment,
              deposits and refunds are governed by our{" "}
              <Link href="/legal/cancellation">Cancellation &amp; Refunds</Link>{" "}
              policy.
            </li>
            <li>
              Payments are processed by our payment provider (Stripe). We do not
              store your card details.
            </li>
            <li>
              A booking is confirmed only once we have received payment and
              confirmed availability to you (normally within 24 hours).
            </li>
          </ul>

          <h2>3. Your responsibilities</h2>
          <ul>
            <li>
              Ensure you hold valid travel documents (passport, visa) and meet any
              entry requirements — these are your responsibility.
            </li>
            <li>
              We strongly recommend comprehensive travel insurance covering
              cancellation, medical care and activities; you travel uninsured at
              your own risk.
            </li>
            <li>
              Tell us in advance of any medical condition, mobility need, allergy
              or other matter relevant to the experience, so we can advise on
              suitability. You are responsible for judging whether an activity is
              appropriate for you and your party.
            </li>
            <li>
              Follow the reasonable safety instructions of your guide, driver and
              hosts, and respect local laws, customs and the monuments and sites
              you visit.
            </li>
            <li>
              You are responsible for the conduct of everyone in your party,
              including any minors.
            </li>
          </ul>

          <h2>4. Nature of the experiences</h2>
          <p>
            Unless expressly stated otherwise, experiences are single-day and do
            not include overnight accommodation, flights or travel insurance.
            Timings, routes and the order of visits are arranged for quality and
            may be adjusted by us or your consigliere on the day — for example for
            weather, crowds, site access or safety — without reducing the value of
            the experience. Descriptions and images are indicative.
          </p>

          <h2>5. Changes, closures and events beyond our control</h2>
          <p>
            We may need to change or substitute elements of an experience (for
            example a comparable site or partner) where necessary. Where an
            experience cannot proceed for reasons beyond our reasonable control —
            including site closures, government or security measures, extreme
            weather, illness or a partner&apos;s inability to deliver — the{" "}
            <Link href="/legal/cancellation">Cancellation &amp; Refunds</Link>{" "}
            policy applies. We are not liable for such events.
          </p>

          <h2>6. Our responsibility to you</h2>
          <p>
            We take care in selecting and coordinating our partners. However, the
            experiences are delivered by independent partners, and:
          </p>
          <ul>
            <li>
              To the fullest extent permitted by law, our total liability to you in
              connection with any booking is{" "}
              <strong>limited to the total amount you paid for that booking</strong>.
            </li>
            <li>
              We are not liable for indirect, incidental or consequential loss,
              including (without limitation) missed flights, accommodation, other
              travel arrangements, or loss of enjoyment beyond the value of the
              booking.
            </li>
            <li>
              We are not responsible for the acts or omissions of independent
              partners or third parties beyond our reasonable control.
            </li>
            <li>
              Nothing in these terms excludes or limits our liability where it
              would be unlawful to do so — including for death or personal injury
              caused by our negligence, or for fraud.
            </li>
          </ul>

          <h2>7. Conduct</h2>
          <p>
            For everyone&apos;s safety we (or a partner) may refuse to begin, or may
            end, an experience without refund where a guest is behaving unsafely,
            unlawfully, or abusively toward staff, partners or others, or is
            materially under the influence of alcohol or drugs.
          </p>

          <h2>8. Photography</h2>
          <p>
            Where included, your day is photographed on your own device for your
            personal use. We will only use images or footage that identify you for
            our own marketing with your separate consent.
          </p>

          <h2>9. Intellectual property</h2>
          <p>
            The content of this site (text, images, design and branding) belongs to
            us or our licensors and may not be copied or reused without permission.
          </p>

          <h2>10. Privacy</h2>
          <p>
            We handle your personal data in line with our{" "}
            <Link href="/legal/privacy">Privacy Policy</Link>.
          </p>

          <h2>11. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The version in force when
            you book applies to that booking; the current version is always shown
            here with its date.
          </p>

          <h2>12. Governing law</h2>
          <p>
            These terms are governed by the laws of{" "}
            <strong>[governing law jurisdiction]</strong>, and the courts of{" "}
            <strong>[jurisdiction]</strong> have jurisdiction, without affecting any
            mandatory consumer-protection rights you have where you live.
          </p>

          <h2>Contact</h2>
          <p>
            <strong>[Luxor Rising — legal entity name]</strong> ·{" "}
            <strong>[registered address]</strong> ·{" "}
            <strong>[bookings contact email]</strong>.
          </p>

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
