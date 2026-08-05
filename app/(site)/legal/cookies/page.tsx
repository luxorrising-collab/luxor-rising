import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";
import styles from "../LegalPage.module.css";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Exactly which cookies Luxor Rising uses, why, how long they last, and how you stay in control of them.",
};

type Row = { name: string; provider: string; purpose: string; duration: string };

const NECESSARY: Row[] = [
  {
    name: "lr_consent",
    provider: "Luxor Rising (first-party)",
    purpose: "Remembers your cookie choices so we don't ask again.",
    duration: "180 days",
  },
  {
    name: "__stripe_mid",
    provider: "Stripe (payments)",
    purpose: "Fraud prevention while you pay. Set only on the checkout step.",
    duration: "1 year",
  },
  {
    name: "__stripe_sid",
    provider: "Stripe (payments)",
    purpose: "Fraud prevention while you pay. Set only on the checkout step.",
    duration: "30 minutes",
  },
];

const ANALYTICS: Row[] = [
  {
    name: "_ga",
    provider: "Google Analytics 4",
    purpose: "Tells one anonymous visitor apart from another to count visits.",
    duration: "2 years",
  },
  {
    name: "_ga_*",
    provider: "Google Analytics 4",
    purpose: "Keeps track of a single visit (session state).",
    duration: "2 years",
  },
];

const MARKETING: Row[] = [
  {
    name: "_fbp",
    provider: "Meta (Facebook) Pixel",
    purpose: "Measures ad results and helps us reach similar travellers.",
    duration: "3 months",
  },
  {
    name: "fr",
    provider: "Meta (on facebook.com)",
    purpose: "Ad delivery and measurement.",
    duration: "3 months",
  },
  {
    name: "_gcl_au",
    provider: "Google Ads",
    purpose: "Attributes a booking to the ad that led to it.",
    duration: "90 days",
  },
];

function CookieTable({ caption, rows }: { caption: string; rows: Row[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Cookie</th>
            <th scope="col">Set by</th>
            <th scope="col">What it does</th>
            <th scope="col">Lasts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>
                <code>{r.name}</code>
              </td>
              <td>{r.provider}</td>
              <td>{r.purpose}</td>
              <td>{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiePolicyPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/legal">Legal &amp; help</Link>
          <span>/</span>Cookies
        </nav>
      </div>

      <section className={styles.legal}>
        <div className="wrap-narrow">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ margin: ".3rem 0 .5rem" }}>
            Cookie Policy
          </h1>
          <p className={styles.updated}>Last updated 5 August 2026</p>

          {/* Internal note for the owner — remove before go-live. */}
          <div className={styles.ph}>
            <b>Before go-live:</b> fill in your legal entity name, registered
            address and a dedicated privacy contact email in the{" "}
            <b>Contact</b> section below, and have this page reviewed by a lawyer
            for your jurisdiction (Egypt + the EU/UK markets you sell to).
          </div>

          <p className={styles.lead}>
            We keep tracking light and honest. This page explains exactly what
            runs on the site, why, and how long it stays — and you decide what
            you&apos;re comfortable with. Decline everything optional and you
            lose nothing: the site and your booking work either way.
          </p>

          <h2>You&apos;re in control</h2>
          <p>
            When you first arrive we ask before switching on anything that
            isn&apos;t essential. Nothing in the Analytics or Marketing groups
            below loads until you say yes, and you can change your mind whenever
            you like.
          </p>
          <div className={styles.withdraw}>
            <strong>Change your choice any time.</strong> You can update or
            withdraw your consent whenever you like — there&apos;s a{" "}
            <strong>Cookie settings</strong> link in the footer of every page.{" "}
            <CookieSettingsButton label="Manage cookie settings →" />
          </div>

          <h2>What cookies are</h2>
          <p>
            Cookies are small files a site stores in your browser. Some are
            needed for the site to function; others help us understand what works
            and reach the right travellers. We group them into three plain
            categories.
          </p>

          <h2>The cookies we use</h2>

          <h3>1. Strictly necessary — always on</h3>
          <p>
            These make the site and secure payment work, and remember your
            cookie choice. They don&apos;t track you for advertising and
            can&apos;t be switched off.
          </p>
          <CookieTable caption="Strictly necessary cookies" rows={NECESSARY} />

          <h3>2. Analytics — only if you accept</h3>
          <p>
            Anonymous, aggregated usage stats (Google Analytics 4) so we can see
            which pages help and which don&apos;t. Loaded through Google Consent
            Mode, so nothing is stored until you opt in.
          </p>
          <CookieTable caption="Analytics cookies" rows={ANALYTICS} />

          <h3>3. Marketing — only if you accept</h3>
          <p>
            Lets us measure our advertising and reach travellers like you (Meta
            Pixel, Google Ads). The Meta Pixel is never even loaded until you
            accept this group.
          </p>
          <CookieTable caption="Marketing cookies" rows={MARKETING} />

          <p>
            We may also load Google Tag Manager, which is a container that manages
            the tags above; on its own it sets no cookies. The exact cookie names
            and lifetimes set by Google and Meta are controlled by them and can
            change; the tables above are accurate at the date shown.
          </p>

          <h2>Your consent and the legal basis</h2>
          <ul>
            <li>
              <strong>Strictly necessary cookies</strong> are set on the basis of
              our legitimate interest in running a secure site and performing your
              booking contract. Under ePrivacy/PECR they are exempt from consent.
            </li>
            <li>
              <strong>Analytics and Marketing cookies</strong> are set only with
              your consent (GDPR Art. 6(1)(a) and the ePrivacy/PECR rules). You
              can withdraw that consent at any time, as easily as you gave it,
              using the controls above.
            </li>
          </ul>

          <h2>Sharing and international transfers</h2>
          <p>
            If you accept Analytics or Marketing, the relevant data is processed
            by Google and/or Meta as our processors/partners. These providers are
            based in the United States, so your data may be transferred outside
            the EEA/UK. Such transfers rely on the EU–US Data Privacy Framework
            and/or Standard Contractual Clauses. For detail on how they use data,
            see{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google&apos;s Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://www.facebook.com/privacy/policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta&apos;s Privacy Policy
            </a>
            . We never sell your personal data.
          </p>

          <h2>Managing cookies in your browser</h2>
          <p>
            Beyond the controls on this site, you can block or delete cookies in
            your browser settings. Blocking strictly necessary cookies may stop
            parts of the site — including checkout — from working. Guides for{" "}
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chrome
            </a>
            ,{" "}
            <a
              href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
            >
              Safari
            </a>{" "}
            and{" "}
            <a
              href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firefox
            </a>{" "}
            are available from each provider.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            When we add or remove a tool we&apos;ll update this page and, if the
            change affects the optional categories, ask for your consent again.
            The date at the top always shows the current version.
          </p>

          <h2>Contact</h2>
          <p>
            This Cookie Policy is issued by{" "}
            <strong>[Luxor Rising — legal entity name]</strong>, of{" "}
            <strong>[registered address]</strong>, the data controller for this
            site. Questions or requests about cookies and your data:{" "}
            <strong>[privacy contact email]</strong>. This policy sits alongside
            our <Link href="/legal">Privacy Policy</Link>, which covers personal
            data more broadly.
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
