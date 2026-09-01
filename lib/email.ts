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

export type EnquiryEmail = {
  name: string;
  email: string;
  dates?: string;
  group?: string;
  base?: string;
  message?: string;
};

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
        subject: `New enquiry — ${enq.name}`,
        text: `A new enquiry came in from the website.\n\n${detail}\n`,
      }),
      // 2) Guest auto-reply — replies land in the concierge inbox.
      resend.emails.send({
        from: FROM,
        to: enq.email,
        replyTo: REPLY_TO,
        subject: "We've got your enquiry — Luxor Rising",
        text:
          `Dear ${enq.name.split(" ")[0] || "traveller"},\n\n` +
          `Thank you for reaching out to Luxor Rising. Your concierge will read this personally ` +
          `and reply within 24 hours — with who'd host you and a suggested shape for your days.\n\n` +
          `If anything changes in the meantime, just reply to this email.\n\n` +
          `Warmly,\nThe Luxor Rising concierge team\n` +
          `Where reality meets tranquility and every moment becomes cherished.`,
      }),
    ]);
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}
