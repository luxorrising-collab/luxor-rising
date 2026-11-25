import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "../LegalPage.module.css";

export const metadata: Metadata = {
  title: "Cancellation & Refunds",
  description:
    "How you can pay (in full, or 20% today), free cancellation until 48 hours before, what is non-refundable, and the first-two-hours promise at Luxor Rising.",
};

// Keep in step with lib/payment-policy.ts (20% deposit, 48 hours, 08:00 start)
// and with TERMS_VERSION in app/api/checkout/route.ts.
export default function CancellationPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/legal">Legal &amp; help</Link>
          <span>/</span>Cancellation &amp; Refunds
        </nav>
      </div>

      <section className={styles.legal}>
        <div className="wrap-narrow">
          <span className="eyebrow">Legal</span>
          <h1 className="display" style={{ margin: ".3rem 0 .5rem" }}>
            Cancellation &amp; Refunds
          </h1>
          <p className={styles.updated}>Last updated 18 November 2026</p>

          <p className={styles.lead}>
            In plain terms: you can pay in full, or pay 20% today and the rest either
            automatically 48 hours before or locally on the day. You can cancel for
            free until <strong>48 hours before</strong> your experience, and we refund
            what you&apos;ve paid less only the costs we&apos;ve already committed for
            you. Within 48 hours, or if you don&apos;t show, your payment is
            non-refundable. This policy forms part of our{" "}
            <Link href="/legal/terms">Terms &amp; Conditions</Link>.
          </p>

          <h2>1. How you pay</h2>
          <p>
            All prices are in euros. At checkout you choose one of three ways to pay,
            through our secure payment provider, Stripe:
          </p>
          <ul>
            <li>
              <strong>Pay in full</strong> — the whole price now. Nothing more to pay.
            </li>
            <li>
              <strong>Pay 20% today, the rest automatically</strong> — a deposit of 20%
              of the total (rounded to whole euros) now. You authorise us to charge the
              remaining balance to the same card <strong>automatically 48 hours
              before</strong> your experience, on the date shown at checkout and in your
              confirmation. Stripe stores your card securely for this one purpose; we
              never see or store your card number. We email a receipt once the balance
              is taken. If the charge can&apos;t be completed (for example, your bank
              asks you to confirm it), we email you a <strong>secure payment
              link</strong>; the balance must be paid before your experience begins.
              This option is available when your date is at least three days away.
            </li>
            <li>
              <strong>Pay 20% today, the rest locally</strong> — a deposit of 20% now,
              and the remaining balance <strong>on the day, before the experience
              begins</strong>, in cash to your concierge, who collects it on our
              behalf. You may pay in <strong>euros</strong> (the exact euro amount),{" "}
              <strong>Egyptian pounds</strong> or <strong>US dollars</strong>. Amounts in
              pounds or dollars are converted from the euro price at the mid-market
              rate shown on xe.com at 08:00 Luxor time that day, rounded to the nearest
              whole unit in your favour. You receive a receipt for every payment.
            </li>
          </ul>
          <p>
            Your booking is confirmed once the payment due today is received and we
            confirm availability (normally within 24 hours). Your bank or card provider
            may charge its own fees, for example for a card payment in euros; these are
            outside our control.
          </p>
          <p>
            <strong>If a balance isn&apos;t paid.</strong> If the balance due before the
            experience (charged automatically, by the secure link, or locally on the
            day) is not paid by the time the experience is due to begin, we may decline
            to begin it, and the booking is treated as a cancellation by you within 48
            hours (section 3).
          </p>

          <h2>2. Costs already committed</h2>
          <p>
            From the moment we begin arranging your experience, we commit real money on
            your behalf. These costs are <strong>non-refundable from the point they are
            incurred</strong> and are deducted from any refund, whatever the reason for
            cancellation:
          </p>
          <ul>
            <li>Monument, museum and site entry tickets and permits;</li>
            <li>Licensed Egyptologist / guide booking and reservation fees;</li>
            <li>Private vehicle, boat, balloon or host reservations and deposits;</li>
            <li>Any partner deposit or pre-payment already made for your date;</li>
            <li>
              <strong>Payment-partner costs</strong>: the card processing and
              transaction fees charged by our payment providers (such as Stripe), which
              are not returned to us when a payment is refunded, and any
              currency-conversion or transfer costs incurred on your payment or on the
              refund.
            </li>
          </ul>
          <p>
            We book third-party services only once your reservation is confirmed, to
            keep these costs as small as possible. On request, we will show you what
            was deducted and why.
          </p>

          <h2>3. If you cancel</h2>
          <ul>
            <li>
              <strong>Until 48 hours before the scheduled start:</strong> we refund
              what you have paid, <strong>less only the costs already
              committed</strong> for your booking (section 2).
            </li>
            <li>
              <strong>Within 48 hours of the scheduled start, or a no-show:</strong>{" "}
              your <strong>deposit becomes non-refundable</strong>. If you paid in full,
              or the automatic balance has already been charged, your payment is
              non-refundable; at our reasonable discretion we may refund any part we
              have not committed and can recover. If you chose to pay the balance
              locally, the balance is not collected, and the deposit is retained.
            </li>
            <li>
              <strong>Booking within 48 hours of the start:</strong> there is no
              free-cancellation period, so the payment is non-refundable once made
              (our promise in section 5 still applies).
            </li>
          </ul>
          <p>
            The &ldquo;scheduled start&rdquo; is the start or pickup time we confirm to
            you. Until a time is confirmed, it is <strong>08:00 Luxor time</strong> on
            your experience date. A <strong>no-show</strong> means you are not at the
            agreed pickup point within 30 minutes of the agreed time and have not told
            us. To cancel, email us or reply to your confirmation; the time we receive
            your message counts.
          </p>

          <h2>4. Changing your date</h2>
          <p>
            Need to move your date? Tell us as early as you can and we&apos;ll do our
            best to reschedule, subject to availability. Costs already committed for
            the original date may still apply, and a price difference may apply if
            rates for the new date differ. A request made within 48 hours of the start
            is treated under section 3 if we cannot accommodate it.
          </p>

          <h2>5. Our money-back promise</h2>
          <p>
            We stand behind every experience. If, early on — within the{" "}
            <strong>first hour</strong> of a single experience, or the{" "}
            <strong>first two hours</strong> of a Concierge Day — you feel it genuinely
            isn&apos;t what we promised, tell your concierge or guide{" "}
            <strong>at that moment</strong> and give us the chance to put it right. If
            we can&apos;t, we&apos;ll stop there and refund the price you paid,{" "}
            <strong>less the costs already committed</strong> on your behalf (section
            2).
          </p>
          <p>
            This promise applies once per booking and at our reasonable discretion. It
            applies only where you raised the concern within that opening window and
            allowed us a fair opportunity to resolve it; it does not cover a change of
            mind, weather, or matters outside our control after that point.
          </p>

          <h2>6. If we or a partner cannot deliver</h2>
          <p>
            Very occasionally an experience can&apos;t go ahead for reasons beyond our
            control — a site closure, a safety or security situation, extreme weather,
            illness, or a partner being unable to deliver. In that case we&apos;ll offer
            you a reschedule or a refund of amounts paid, less the costs already
            committed. To the extent permitted by law, we are not responsible for
            related expenses you arrange yourself, such as flights, hotels or other
            travel.
          </p>

          <h2>7. How refunds are made</h2>
          <p>
            Approved refunds of card payments are returned to your original payment
            method, normally within <strong>14</strong> business days of approval;
            your bank may take additional time to show the funds. A balance you paid
            locally in cash is refunded by bank transfer or card refund, in euros, at
            the euro value received on the day.
          </p>

          <h2>8. Payment questions and disputes</h2>
          <p>
            If anything about a payment looks wrong, please contact us first — we
            answer quickly and can usually resolve it the same day. When you book, we
            keep a record of what you chose and agreed to at checkout (including, for
            the automatic option, your authorisation to charge the balance), which we
            may share with Stripe and your card issuer if a payment is disputed.
          </p>

          <h2>9. Statutory rights</h2>
          <p>
            Nothing in this policy limits any rights you have under mandatory consumer
            law that cannot lawfully be excluded. Our experiences are leisure services
            arranged for a specific date, so the 14-day right of withdrawal for
            distance contracts does not apply to them (Article 16(l) of Directive
            2011/83/EU and its national implementations); the cancellation terms above
            apply instead.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about a booking, a payment or a refund:{" "}
            <a href="mailto:luxor.rising.com@gmail.com">luxor.rising.com@gmail.com</a>.
            This policy is issued by <strong>Evam trade, s.r.o.</strong> (IČO
            48&nbsp;093&nbsp;572, DIČ 2120062648), Doležalova 3424/15C, 821 04
            Bratislava – mestská časť Ružinov, Slovak Republic, and forms part of our{" "}
            <Link href="/legal/terms">Terms &amp; Conditions</Link>.
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
