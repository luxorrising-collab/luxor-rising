import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "../LegalPage.module.css";

export const metadata: Metadata = {
  title: "Cancellation & Refunds",
  description:
    "How payment, cancellation, non-refundable costs and the Concierge Day first-two-hours promise work at Luxor Rising.",
};

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
          <p className={styles.updated}>Last updated 12 August 2026</p>

          <div className={styles.ph}>
            <b>Before go-live:</b> confirm your legal entity name, the refund
            processing window, and have this reviewed by a lawyer for your
            jurisdiction (Egypt + the EU/UK markets you sell to). Bracketed values
            below are placeholders to fill in.
          </div>

          <p className={styles.lead}>
            We keep this fair and clear. In plain terms: you can pay in full or
            with a deposit, you can cancel for free up to 7 days before — and the
            only thing we can&apos;t return is money we&apos;ve already committed
            on your behalf (tickets, permits and reservations). This policy forms
            part of our <Link href="/legal/terms">Terms &amp; Conditions</Link>.
          </p>

          <h2>1. How you pay</h2>
          <p>
            To reserve a date you pay either the <strong>full price</strong> or a{" "}
            <strong>50% deposit</strong>, through our secure payment provider
            (Stripe). If you pay a deposit, the remaining balance is due on or
            before the day of your experience. Your booking is confirmed once
            payment is received and we confirm availability (normally within 24
            hours).
          </p>

          <h2>2. Non-refundable costs (please read)</h2>
          <p>
            The moment we begin arranging your experience, we commit real money on
            your behalf to third parties. These costs are{" "}
            <strong>non-refundable from the point they are booked</strong> and are
            always deducted from any refund, whatever the reason for cancellation:
          </p>
          <ul>
            <li>Monument, museum and site entry tickets and permits;</li>
            <li>Licensed Egyptologist / guide booking and reservation fees;</li>
            <li>Private vehicle, boat, balloon or host reservations and deposits;</li>
            <li>Any partner deposit or pre-payment already made for your date.</li>
          </ul>
          <p>
            We only book these once your reservation is confirmed, to keep the
            non-refundable portion as small as possible.
          </p>

          <h2>3. If you cancel</h2>
          <ul>
            <li>
              <strong>7 or more days before your date:</strong> we refund what you
              have paid, <strong>less any non-refundable costs</strong> already
              committed for your booking (section 2).
            </li>
            <li>
              <strong>Fewer than 7 days before, or no-show:</strong> payments are
              non-refundable. A deposit is forfeited; if you paid in full, any
              refund is limited to amounts we have not yet committed, at our
              reasonable discretion.
            </li>
          </ul>

          <h2>4. Changing your date</h2>
          <p>
            Need to move your date? Tell us as early as you can and we&apos;ll do
            our best to reschedule, subject to availability. Non-refundable costs
            already committed for the original date may still apply, and a price
            difference may apply if rates for the new date differ.
          </p>

          <h2>5. Our money-back promise</h2>
          <p>
            We stand behind every experience. If, early on — within the{" "}
            <strong>first hour</strong> of a single experience, or the{" "}
            <strong>first two hours</strong> of a Concierge Day — you feel it
            genuinely isn&apos;t what we promised, tell your consigliere or guide{" "}
            <strong>at that moment</strong> and give us the chance to put it right.
            If we can&apos;t, we&apos;ll stop there and refund the price you paid,{" "}
            <strong>less any non-refundable costs</strong> already incurred on your
            behalf (section 2).
          </p>
          <p>
            This promise applies once per booking and at our reasonable discretion.
            It applies only where you raised the concern within that opening window
            and allowed us a fair opportunity to resolve it; it does not cover a
            change of mind, weather, or matters outside our control after that
            point.
          </p>

          <h2>6. If we or a partner cannot deliver</h2>
          <p>
            Very occasionally an experience can&apos;t go ahead for reasons beyond
            our control — a site closure, a safety or security situation, extreme
            weather, illness, or a partner being unable to deliver. In that case
            we&apos;ll offer you a reschedule or a refund of amounts paid, less any
            non-refundable costs already committed. To the extent permitted by law,
            we are not responsible for related expenses you arrange yourself, such
            as flights, hotels or other travel.
          </p>

          <h2>7. How refunds are made</h2>
          <p>
            Approved refunds are returned to your original payment method, normally
            within <strong>[X]</strong> business days of approval. Your bank or card
            provider may take additional time to show the funds.
          </p>

          <h2>8. Statutory rights</h2>
          <p>
            Nothing in this policy limits any rights you have under mandatory
            consumer law that cannot lawfully be excluded. Because our experiences
            are arranged for a specific date, any statutory &ldquo;cooling-off&rdquo;
            right that would otherwise apply may not apply once the agreed date has
            begun.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about a booking or a refund:{" "}
            <strong>[bookings contact email]</strong>. This policy is issued by{" "}
            <strong>[Luxor Rising — legal entity name]</strong> and forms part of
            our <Link href="/legal/terms">Terms &amp; Conditions</Link>.
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
