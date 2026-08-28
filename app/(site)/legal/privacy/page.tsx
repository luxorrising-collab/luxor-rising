import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "../LegalPage.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal data Luxor Rising collects, why, who it is shared with, and your rights under GDPR.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/legal">Legal &amp; help</Link>
          <span>/</span>Privacy
        </nav>
      </div>

      <section className={styles.legal}>
        <div className="wrap-narrow">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ margin: ".3rem 0 .5rem" }}>
            Privacy Policy
          </h1>
          <p className={styles.updated}>Last updated 12 August 2026</p>

          <div className={styles.ph}>
            <b>Before go-live:</b> fill the legal entity, registered address and a
            dedicated privacy contact email, confirm the retention periods, and
            have this reviewed by a lawyer for your jurisdiction.
          </div>

          <p className={styles.lead}>
            We collect only what we need to arrange your trip and run the site, we
            never sell your data, and you stay in control of it. This policy
            explains what we hold and your rights. Cookies and tracking are covered
            in our <Link href="/legal/cookies">Cookie Policy</Link>.
          </p>

          <h2>Who is responsible for your data</h2>
          <p>
            The data controller is <strong>Evam trade, s.r.o.</strong>, a company
            registered in the Slovak Republic (IČO 48&nbsp;093&nbsp;572, DIČ
            2120062648) with its registered seat at{" "}
            <strong>Doležalova 3424/15C, 821 04 Bratislava – mestská časť
            Ružinov, Slovak Republic</strong>. For any privacy question or
            request, contact{" "}
            <a href="mailto:luxor.rising.com@gmail.com">luxor.rising.com@gmail.com</a>.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Booking &amp; enquiry details</strong> — your name, email,
              phone/WhatsApp, trip dates, group size, and anything you tell us about
              your preferences or needs.
            </li>
            <li>
              <strong>Payment information</strong> — handled by our payment provider
              (Stripe). We receive confirmation and limited details (such as the
              amount and last digits), but <strong>we do not store your full card
              number</strong>.
            </li>
            <li>
              <strong>Messages</strong> — correspondence you send us by form, email
              or WhatsApp.
            </li>
            <li>
              <strong>Usage &amp; marketing data</strong> — only if you consent:
              analytics and advertising identifiers, as described in the{" "}
              <Link href="/legal/cookies">Cookie Policy</Link>.
            </li>
          </ul>

          <h2>Why we use it, and our legal basis</h2>
          <ul>
            <li>
              <strong>To arrange and deliver your booking</strong> — performance of
              our contract with you.
            </li>
            <li>
              <strong>To answer enquiries and provide support</strong> — our
              legitimate interest in responding to you.
            </li>
            <li>
              <strong>To take payment and prevent fraud</strong> — contract and our
              (and Stripe&apos;s) legitimate interest.
            </li>
            <li>
              <strong>To keep records</strong> for tax, accounting and legal
              purposes — our legal obligations.
            </li>
            <li>
              <strong>Analytics and marketing</strong> — your consent, which you can
              withdraw at any time.
            </li>
          </ul>

          <h2>Who we share it with</h2>
          <p>
            We share the minimum necessary with:
          </p>
          <ul>
            <li>
              <strong>Local partners</strong> who deliver your experience (your
              guide, driver, boat or balloon operator, host) — so they can prepare
              for your day.
            </li>
            <li>
              <strong>Stripe</strong> — to process payments.
            </li>
            <li>
              <strong>Our hosting, email and messaging providers</strong> — to run
              the site and communicate with you.
            </li>
            <li>
              <strong>Google and Meta</strong> — only if you consent to analytics or
              marketing cookies.
            </li>
            <li>
              Authorities or advisers where required by law, or to establish or
              defend legal claims.
            </li>
          </ul>
          <p>We never sell your personal data.</p>

          <h2>International transfers</h2>
          <p>
            Because we operate in Egypt and use international providers, your data
            may be processed outside the EEA/UK — including in Egypt (our partners)
            and the United States (Stripe, and Google/Meta if you consent). Where we
            transfer data internationally we rely on appropriate safeguards such as
            the EU–US Data Privacy Framework and/or Standard Contractual Clauses.
          </p>

          <h2>How long we keep it</h2>
          <p>
            We keep booking and enquiry data for as long as needed to provide the
            service and handle any follow-up, and then only as long as required for
            legal, tax and accounting purposes (up to{" "}
            <strong>10</strong> years for financial records, as required by Slovak
            accounting and tax law), after which it is
            deleted or anonymised. Marketing data is kept until you withdraw consent
            or it expires.
          </p>

          <h2>Your rights</h2>
          <p>
            Subject to applicable law, you can ask us to give you access to your
            data, correct it, delete it, restrict or object to its use, or provide
            it in a portable form; and you can withdraw consent at any time
            (including via <Link href="/legal/cookies">cookie settings</Link>). To
            exercise any of these, email{" "}
            <a href="mailto:luxor.rising.com@gmail.com">luxor.rising.com@gmail.com</a>.
            You also have the right to complain to your local data-protection
            authority, or to our supervisory authority, the Office for Personal
            Data Protection of the Slovak Republic (Úrad na ochranu osobných
            údajov Slovenskej republiky).
          </p>

          <h2>Security</h2>
          <p>
            We use appropriate technical and organisational measures to protect your
            data. No method of transmission or storage is completely secure, but we
            work to keep your information safe and to limit access to those who need
            it.
          </p>

          <h2>Children</h2>
          <p>
            Our site and bookings are intended for adults. Where minors travel, an
            accompanying adult provides their details and is responsible for them.
          </p>

          <h2>Changes</h2>
          <p>
            We may update this policy; the current version and its date are always
            shown here.
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
