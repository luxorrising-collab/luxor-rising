import { Resend } from "resend";

// Transactional email via Resend. Everything is guarded: with no RESEND_API_KEY
// set, every send is a silent no-op — so the site works fine before Resend is
// live, and enquiries/bookings are still saved to Supabase regardless.
//
// Env (server-only):
//   RESEND_API_KEY     = re_...            (required to actually send)
//   RESEND_FROM        = "Luxor Rising <concierge@luxorrising.com>"  (optional)
//   RESEND_REPLY_TO    = luxor.rising.com@gmail.com                  (optional)
//   ENQUIRY_NOTIFY_TO  = luxor.rising.com@gmail.com                  (optional)

const FROM = process.env.RESEND_FROM || "Luxor Rising <concierge@luxorrising.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "luxor.rising.com@gmail.com";
const OWNER = process.env.ENQUIRY_NOTIFY_TO || "luxor.rising.com@gmail.com";

let _resend: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend ??= new Resend(key);
  return _resend;
}

const REVIEW_URL = process.env.GOOGLE_REVIEW_URL || "https://luxorrising.com/reviews";

export type EnquiryEmail = {
  name: string;
  email: string;
  dates?: string;
  group?: string;
  base?: string;
  message?: string;
  topic?: string;
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "traveller";
const SIGNOFF =
  "Warmly,\nThe Luxor Rising concierge team\n" +
  "Where reality meets tranquility and every moment becomes cherished.";

/**
 * Notify the concierge of a new enquiry, and send the guest a warm auto-reply.
 * Best-effort: never throws (a mail hiccup must not fail the enquiry save).
 */
export async function sendEnquiryEmails(enq: EnquiryEmail): Promise<void> {
  const resend = client();
  if (!resend) return;

  const lines: string[] = [`Name: ${enq.name}`, `Email: ${enq.email}`];
  if (enq.group) lines.push(`Group: ${enq.group}`);
  if (enq.base) lines.push(`Staying: ${enq.base}`);
  if (enq.dates) lines.push(`Dates: ${enq.dates}`);
  lines.push("", enq.message ? `Message:\n${enq.message}` : "(no message)");
  const detail = lines.join("\n");

  try {
    await Promise.all([
      // 1) Owner notification — reply goes straight to the guest.
      resend.emails.send({
        from: FROM,
        to: OWNER,
        replyTo: enq.email,
        subject: `New enquiry${enq.topic ? ` (${enq.topic})` : ""} — ${enq.name}`,
        text: `A new enquiry came in from the website${enq.topic ? ` — ${enq.topic}` : ""}.\n\n${detail}\n`,
      }),
      // 2) Guest auto-reply — replies land in the concierge inbox.
      resend.emails.send({
        from: FROM,
        to: enq.email,
        replyTo: REPLY_TO,
        subject: "We've got your enquiry — Luxor Rising",
        text:
          `Dear ${firstName(enq.name)},\n\n` +
          `Thank you for reaching out to Luxor Rising. Your concierge will read this personally ` +
          `and reply within 24 hours — with who'd host you and a suggested shape for your days.\n\n` +
          `If anything changes in the meantime, just reply to this email.\n\n` +
          SIGNOFF,
      }),
    ]);
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}

// ── Customer booking-journey emails ────────────────────────────────────────
// All guarded (no-op without RESEND_API_KEY) and best-effort (never throw).
// Wiring: booking confirmation → the Stripe webhook; date confirmation → the
// concierge's confirm action; reminder + review request → a scheduled job.

export type BookingEmail = {
  name: string;
  email: string;
  productName: string;
  tripDate?: string;
  guests?: number;
  amountEur?: number;
  payMode?: string; // 'full' | 'deposit'
  pickup?: string;
  time?: string;
};

async function sendTo(
  to: string,
  subject: string,
  text: string,
  replyTo: string = REPLY_TO,
): Promise<void> {
  const resend = client();
  if (!resend) return;
  try {
    await resend.emails.send({ from: FROM, to, replyTo, subject, text });
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}

const WHAT_TO_BRING =
  "What to bring: your passport or ID (site security asks for it), comfortable shoes, " +
  "sun protection and water, and a light layer for early starts.";

/** After payment — sent from the Stripe webhook once a booking is confirmed. */
export async function sendBookingConfirmation(b: BookingEmail): Promise<void> {
  const mode = b.payMode === "deposit" ? "deposit" : "in full";
  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    "Your booking with Luxor Rising is confirmed — thank you. We're already looking forward to it.",
    "",
    "What you've reserved:",
    `· ${b.productName}`,
    b.tripDate ? `· Date: ${b.tripDate}` : "",
    b.guests ? `· Guests: ${b.guests}` : "",
    b.amountEur != null ? `· Paid: €${b.amountEur} (${mode})` : "",
    "",
    "What happens next: your concierge will confirm the exact timing and pickup within 24 hours." +
      (b.payMode === "deposit" ? " Any remaining balance is settled on the day." : ""),
    "",
    "Anything at all — dietary needs, mobility, a special occasion — just reply to this email and we'll take care of it.",
    "",
    "Free cancellation up to 7 days before, per our terms (luxorrising.com/legal/cancellation).",
    "",
    SIGNOFF,
  ]
    .filter(Boolean)
    .join("\n");
  await sendTo(b.email, `Your Luxor Rising booking is confirmed — ${b.productName}`, text);
}

/** The concierge confirms the exact day/time and pickup. */
export async function sendDateConfirmation(b: BookingEmail): Promise<void> {
  const when = [b.tripDate, b.time].filter(Boolean).join(", ");
  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    `Your ${b.productName} is confirmed${when ? ` for ${when}` : ""}.`,
    b.pickup ? `We'll collect you ${b.pickup}.` : "",
    "",
    WHAT_TO_BRING,
    "",
    "If anything needs to change, just reply to this email and we'll rearrange it.",
    "",
    SIGNOFF,
  ]
    .filter(Boolean)
    .join("\n");
  await sendTo(b.email, `Your day is set${b.tripDate ? ` — ${b.tripDate}` : ""}`, text);
}

/** A few days before — sent by a scheduled job. */
export async function sendTripReminder(b: BookingEmail): Promise<void> {
  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    `A quick note before your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} — we can't wait to show you.`,
    b.pickup ? `We'll collect you ${b.pickup}${b.time ? ` at ${b.time}` : ""}.` : "",
    "",
    WHAT_TO_BRING,
    "",
    "Your concierge is reachable throughout the day, so you never have a decision to make.",
    "",
    SIGNOFF,
  ]
    .filter(Boolean)
    .join("\n");
  await sendTo(b.email, "Your Luxor day is nearly here", text);
}

/** A day or two after — sent by a scheduled job. */
export async function sendReviewRequest(b: BookingEmail): Promise<void> {
  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    "Thank you for spending your day with Luxor Rising — it was a genuine pleasure.",
    "",
    `If it was as special for you as it was for us, a short review would mean the world — and it helps other travellers find us:`,
    REVIEW_URL,
    "",
    "And if anything fell short of what we promised, please tell us directly by replying — we'd always rather hear it from you first.",
    "",
    SIGNOFF,
  ]
    .filter(Boolean)
    .join("\n");
  await sendTo(b.email, "How was your day with us?", text);
}
