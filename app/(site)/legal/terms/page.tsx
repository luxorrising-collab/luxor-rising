import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
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
          <p className={styles.updated}>Last updated 2 September 2026</p>

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
            Luxor Rising (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a brand operated by{" "}
            <strong>Evam trade, s.r.o.</strong>, a company registered in the Slovak
            Republic with its registered seat at{" "}
            <strong>Doležalova 3424/15C, 821 04 Bratislava – mestská časť
            Ružinov, Slovak Republic</strong> (Company ID / IČO
            48&nbsp;093&nbsp;572, Tax ID / DIČ 2120062648). Luxor Rising is a
            private travel{" "}
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
              If you pay a deposit, you authorise us to charge the remaining
              balance to the same card automatically on the day before your
              experience; if that charge cannot be completed we email you a secure
              link to settle it before the day. See our{" "}
              <Link href="/legal/cancellation">Cancellation &amp; Refunds</Link>{" "}
              policy for detail.
            </li>
            <li>
              Payments are processed by our payment provider (Stripe). We do not
              store your card details; where you pay a deposit, Stripe securely
              stores your card so the balance can be taken as above.
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
            may be adjusted by us or your concierge on the day — for example for
            weather, crowds, site access or safety — without reducing the value of
            the experience. Descriptions and images are indicative.
          </p>
          <p>
            The experiences sold on this site are <strong>single-day experiences
            without overnight accommodation</strong>. The parties intend that they
            do not constitute a &ldquo;package&rdquo; or a &ldquo;linked travel
            arrangement&rdquo; within Directive (EU) 2015/2302 or its national
            implementations. Luxor Rising acts as a concierge and{" "}
            <strong>intermediary</strong> that connects you with independent,
            licensed local suppliers, who are responsible for the services they
            perform. Any multi-day itinerary or accommodation is handled only as a
            separate arrangement and is outside these terms unless we agree it in
            writing.
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

          <h2>12. How to raise a problem</h2>
          <p>
            If any part of your experience falls short, tell your concierge, guide
            or host <strong>at the time</strong>, so we have a fair chance to put it
            right on the spot. If a matter is not resolved, notify us in writing at{" "}
            <a href="mailto:luxor.rising.com@gmail.com">luxor.rising.com@gmail.com</a>{" "}
            <strong>within 14 days</strong> of the experience. Raising concerns
            promptly and giving us a reasonable opportunity to resolve them is a
            condition of any claim or refund beyond your mandatory statutory rights.
          </p>

          <h2>13. General</h2>
          <p>
            If any provision of these terms is held to be invalid or unenforceable,
            the remaining provisions continue in full force. Our not enforcing a term
            on any occasion is not a waiver of it. You may not transfer your booking
            or these terms to anyone else without our written consent; we may assign,
            transfer or subcontract our rights and obligations, including to the
            local partners who deliver your experience. These terms, together with
            our <Link href="/legal/cancellation">Cancellation &amp; Refunds</Link>{" "}
            and <Link href="/legal/privacy">Privacy</Link> policies, are the entire
            agreement between us about your booking and replace any prior
            discussions. Nothing in these terms gives any third party a right to
            enforce them.
          </p>

          <h2>14. Governing law</h2>
          <p>
            These terms are governed by the laws of the{" "}
            <strong>Slovak Republic</strong>, and the courts of the{" "}
            <strong>Slovak Republic</strong> have jurisdiction, without affecting any
            mandatory consumer-protection rights you have where you live.
          </p>

          <h2>Contact</h2>
          <p>
            <strong>Evam trade, s.r.o.</strong> · Doležalova 3424/15C, 821 04
            Bratislava – mestská časť Ružinov, Slovak Republic · IČO
            48&nbsp;093&nbsp;572 · DIČ 2120062648 ·{" "}
            <a href="mailto:luxor.rising.com@gmail.com">luxor.rising.com@gmail.com</a>.
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
