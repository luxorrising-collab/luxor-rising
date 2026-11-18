import styles from "./PaymentMarks.module.css";

// The ways to pay, as small card-shaped marks — shown under the checkout button
// and in the footer. Accurate to what Stripe Checkout offers on this account
// (cards, Apple Pay, Google Pay, Link). No hooks, so server and client can use it.
export default function PaymentMarks({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <ul
      className={`${styles.marks} ${tone === "dark" ? styles.dark : ""}`}
      aria-label="Accepted: Visa, Mastercard, American Express, Apple Pay, Google Pay, Link"
    >
      <li title="Visa">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#fff" />
          <text x="19" y="16.2" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="10.5" fill="#1A1F71">
            VISA
          </text>
        </svg>
      </li>
      <li title="Mastercard">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#fff" />
          <circle cx="15.5" cy="12" r="6.3" fill="#EB001B" />
          <circle cx="22.5" cy="12" r="6.3" fill="#F79E1B" fillOpacity="0.92" />
        </svg>
      </li>
      <li title="American Express">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#1F72CD" />
          <text x="19" y="15.6" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="8.2" fill="#fff">
            AMEX
          </text>
        </svg>
      </li>
      <li title="Apple Pay">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#000" />
          <path
            fill="#fff"
            d="M10.9 8.1c.4-.5.7-1.1.6-1.8-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.7.6.1 1.3-.3 1.7-.8Zm.6.9c-.9-.1-1.7.5-2.1.5-.5 0-1.1-.5-1.8-.5-.9 0-1.8.6-2.3 1.4-1 1.7-.3 4.3.7 5.7.5.7 1 1.4 1.7 1.4s.9-.4 1.8-.4.9.4 1.7.4c.7 0 1.2-.7 1.6-1.4.5-.8.7-1.5.7-1.6 0 0-1.4-.5-1.4-2.1 0-1.3 1.1-2 1.2-2-.6-1-1.6-1.1-1.8-1.1Z"
          />
          <text x="24.6" y="15.8" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="8.4" fill="#fff">
            Pay
          </text>
        </svg>
      </li>
      <li title="Google Pay">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#fff" />
          <text x="9.2" y="15.8" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill="#4285F4">
            G
          </text>
          <text x="22.6" y="15.8" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="8.4" fill="#3C4043">
            Pay
          </text>
        </svg>
      </li>
      <li title="Link by Stripe">
        <svg viewBox="0 0 38 24" aria-hidden>
          <rect width="38" height="24" rx="3" fill="#00D66F" />
          <text x="19" y="15.8" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="8.8" fill="#011E0F">
            link
          </text>
        </svg>
      </li>
    </ul>
  );
}
