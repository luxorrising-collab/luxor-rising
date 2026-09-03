import { Resend } from "resend";
import { renderEmail, SITE_URL, type SummaryRow } from "./email-template";

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
// Owner inbox(es) — every new order and enquiry is copied here. Comma-separate
// ENQUIRY_NOTIFY_TO to override; defaults to both master accounts.
const OWNER = (process.env.ENQUIRY_NOTIFY_TO || "luxor.rising.com@gmail.com,manofknowledge.sk@gmail.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
// The local delivery partner's inbox. Unset → the Ahmed brief is skipped.
const AHMED = process.env.AHMED_NOTIFY_TO || "";

let _resend: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend ??= new Resend(key);
  return _resend;
}

const REVIEW_URL = process.env.GOOGLE_REVIEW_URL || `${SITE_URL}/reviews`;

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
const SIGNOFF_TEXT =
  "Warmly,\nThe Luxor Rising concierge team\n" +
  "Where reality meets tranquility and every moment becomes cherished.";

async function send(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: opts.replyTo ?? REPLY_TO,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Notify the concierge of a new enquiry, and send the guest a warm auto-reply.
 * Best-effort: never throws (a mail hiccup must not fail the enquiry save).
 */
export async function sendEnquiryEmails(enq: EnquiryEmail): Promise<void> {
  const resend = client();
  if (!resend) return;

  const rows: SummaryRow[] = [
    { label: "Name", value: enq.name },
    { label: "Email", value: enq.email },
  ];
  if (enq.group) rows.push({ label: "Group", value: enq.group });
  if (enq.base) rows.push({ label: "Staying", value: enq.base });
  if (enq.dates) rows.push({ label: "Dates", value: enq.dates });

  const textLines = [
    `Name: ${enq.name}`,
    `Email: ${enq.email}`,
    enq.group ? `Group: ${enq.group}` : "",
    enq.base ? `Staying: ${enq.base}` : "",
    enq.dates ? `Dates: ${enq.dates}` : "",
    "",
    enq.message ? `Message:\n${enq.message}` : "(no message)",
  ].filter(Boolean);

  const ownerHtml = renderEmail({
    preheader: `New enquiry from ${enq.name}`,
    eyebrow: enq.topic ? `New enquiry · ${enq.topic}` : "New enquiry",
    heading: `New enquiry — ${enq.name}`,
    intro: ["A new enquiry came in from the website. Reply to this email to reach the guest directly."],
    summary: { title: "Enquiry", rows },
    outro: enq.message ? [`Message:`, enq.message] : ["(No message left.)"],
    signoff: ["— Luxor Rising"],
  });

  const guestHtml = renderEmail({
    preheader: "Thank you — your concierge will reply within 24 hours.",
    eyebrow: "Enquiry received",
    heading: `Dear ${firstName(enq.name)},`,
    intro: [
      "Thank you for reaching out to Luxor Rising.",
      "Your concierge will read this personally and reply within 24 hours — with who'd host you and a suggested shape for your days.",
      "If anything changes in the meantime, just reply to this email.",
    ],
    cta: { text: "Explore the experiences", url: `${SITE_URL}/experiences` },
  });

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: OWNER,
        replyTo: enq.email,
        subject: `New enquiry${enq.topic ? ` (${enq.topic})` : ""} — ${enq.name}`,
        text: `A new enquiry came in from the website${enq.topic ? ` — ${enq.topic}` : ""}.\n\n${textLines.join("\n")}\n`,
        html: ownerHtml,
      }),
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
          SIGNOFF_TEXT,
        html: guestHtml,
      }),
    ]);
  } catch (err) {
    console.error("Resend send failed:", err instanceof Error ? err.message : err);
  }
}

/**
 * Notify the owner inbox(es) of a new paid booking. Reply goes to the guest.
 * Best-effort — never throws (must not fail the webhook).
 */
export async function sendOrderNotification(o: {
  productName: string;
  tripDate?: string;
  guests?: number;
  amountEur?: number;
  totalEur?: number;
  balanceEur?: number;
  payMode?: string;
  balanceAutoCharge?: boolean;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  preferences?: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;

  const isDeposit = o.payMode === "deposit";
  const rows: SummaryRow[] = [{ label: "Experience", value: o.productName }];
  if (o.tripDate) rows.push({ label: "Date", value: o.tripDate });
  if (o.guests) rows.push({ label: "Guests", value: String(o.guests) });
  if (o.totalEur != null) rows.push({ label: "Total", value: `€${o.totalEur}` });
  if (o.amountEur != null)
    rows.push({ label: "Paid now", value: `€${o.amountEur}${isDeposit ? " (deposit)" : " (full)"}` });
  if (isDeposit && o.balanceEur != null)
    rows.push({
      label: o.balanceAutoCharge ? "Balance (auto, day before)" : "Balance",
      value: `€${o.balanceEur}`,
    });
  rows.push({
    label: "Guest",
    value: [o.customerName, o.customerEmail, o.customerPhone].filter(Boolean).join(" · ") || "—",
  });

  const sections = choiceItems(o.preferences).length
    ? [{ title: "Their choices", items: choiceItems(o.preferences) }]
    : undefined;

  const html = renderEmail({
    preheader: `New booking — ${o.productName}${o.tripDate ? ` · ${o.tripDate}` : ""}`,
    eyebrow: "New booking",
    heading: `New booking — ${o.productName}`,
    intro: ["A new booking was paid on the website. Reply to reach the guest."],
    summary: { title: "Order", rows },
    sections,
    signoff: ["— Luxor Rising"],
  });

  const text = [
    `New booking — ${o.productName}`,
    o.tripDate ? `Date: ${o.tripDate}` : "",
    o.guests ? `Guests: ${o.guests}` : "",
    o.totalEur != null ? `Total: €${o.totalEur}` : "",
    o.amountEur != null ? `Paid now: €${o.amountEur}${isDeposit ? " (deposit)" : " (full)"}` : "",
    isDeposit && o.balanceEur != null ? `Balance: €${o.balanceEur}` : "",
    `Guest: ${[o.customerName, o.customerEmail, o.customerPhone].filter(Boolean).join(" · ")}`,
    o.preferences ? `\nTheir choices:\n${o.preferences}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: FROM,
      to: OWNER,
      replyTo: o.customerEmail || REPLY_TO,
      subject: `New booking — ${o.productName}${o.tripDate ? ` · ${o.tripDate}` : ""}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Resend owner order notification failed:", err instanceof Error ? err.message : err);
  }
}

/** Alert the owner when an automatic balance charge fails and a link was sent. */
export async function sendOwnerBalanceAlert(a: {
  productName: string;
  tripDate?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amountEur?: number;
  reason?: string;
}): Promise<void> {
  const resend = client();
  if (!resend) return;
  const rows: SummaryRow[] = [{ label: "Experience", value: a.productName }];
  if (a.tripDate) rows.push({ label: "Date", value: a.tripDate });
  if (a.amountEur != null) rows.push({ label: "Balance due", value: `€${a.amountEur}` });
  rows.push({
    label: "Guest",
    value: [a.customerName, a.customerEmail, a.customerPhone].filter(Boolean).join(" · ") || "—",
  });
  if (a.reason) rows.push({ label: "Reason", value: a.reason });

  const html = renderEmail({
    preheader: `Balance auto-charge failed — ${a.productName}`,
    eyebrow: "Heads up",
    heading: "A balance couldn't be auto-charged",
    intro: [
      "The automatic balance charge didn't go through, so we've emailed the guest a secure payment link. Keep an eye on whether they complete it before the day.",
      "Reply to reach the guest directly.",
    ],
    summary: { title: "Balance", rows },
    signoff: ["— Luxor Rising"],
  });
  const text = [
    `Balance auto-charge failed — ${a.productName}`,
    a.tripDate ? `Date: ${a.tripDate}` : "",
    a.amountEur != null ? `Balance due: €${a.amountEur}` : "",
    `Guest: ${[a.customerName, a.customerEmail, a.customerPhone].filter(Boolean).join(" · ")}`,
    a.reason ? `Reason: ${a.reason}` : "",
    "",
    "We emailed the guest a secure link. Watch for completion.",
  ]
    .filter(Boolean)
    .join("\n");
  try {
    await resend.emails.send({
      from: FROM,
      to: OWNER,
      replyTo: a.customerEmail || REPLY_TO,
      subject: `⚠ Balance auto-charge failed — ${a.productName}`,
      text,
      html,
    });
  } catch (err) {
    console.error("Resend owner balance alert failed:", err instanceof Error ? err.message : err);
  }
}

/** Daily summary of the balance-charging run (only sent when there was activity). */
export async function sendOwnerCronSummary(s: {
  charged: number;
  linkSent: number;
  reminders: number;
  reviews: number;
}): Promise<void> {
  const resend = client();
  if (!resend) return;
  const rows: SummaryRow[] = [
    { label: "Balances charged", value: String(s.charged) },
    { label: "Payment links sent", value: String(s.linkSent) },
    { label: "Trip reminders", value: String(s.reminders) },
    { label: "Review requests", value: String(s.reviews) },
  ];
  const html = renderEmail({
    preheader: `Daily run: ${s.charged} charged, ${s.linkSent} link(s), ${s.reminders} reminder(s)`,
    eyebrow: "Daily automations",
    heading: "Today's automated run",
    intro: ["Here's what the daily run just did."],
    summary: { title: "Summary", rows },
    signoff: ["— Luxor Rising"],
  });
  const text = [
    "Today's automated run",
    `Balances charged: ${s.charged}`,
    `Payment links sent: ${s.linkSent}`,
    `Trip reminders: ${s.reminders}`,
    `Review requests: ${s.reviews}`,
  ].join("\n");
  try {
    await resend.emails.send({
      from: FROM,
      to: OWNER,
      subject: `Daily run — ${s.charged} charged, ${s.linkSent} link(s), ${s.reminders} reminder(s)`,
      text,
      html,
    });
  } catch (err) {
    console.error("Resend owner cron summary failed:", err instanceof Error ? err.message : err);
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
  amountEur?: number; // amount actually charged
  totalEur?: number; // full price of the experience
  balanceEur?: number; // outstanding balance due on the day (deposit bookings)
  balanceAutoCharge?: boolean; // balance will be auto-charged the day before
  payMode?: string; // 'full' | 'deposit'
  pickup?: string;
  time?: string;
  preferences?: string; // the guest's design-your-day choices (" · " joined)
};

// What every Luxor Rising booking includes — stated up front to remove doubt
// and the need to hunt through the FAQ.
const INCLUDED: string[] = [
  "Private to your group — never shared with strangers",
  "A licensed Egyptologist / expert host with you throughout",
  "All entry tickets, permits and logistics arranged for you",
  "Hotel or villa pickup and drop-off",
  "Water, shade and an unhurried pace — no rushing between sites",
  "Your concierge reachable all day, so you never have a decision to make",
  "Free cancellation up to 7 days before",
];

// Turn the "1 days · 2 guests · Journey: … · Evening: …" preferences string into
// clean bullet items, dropping the day/guest counts already shown in the summary.
function choiceItems(preferences?: string): string[] {
  if (!preferences) return [];
  return preferences
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^\d+\s+(day|days|guest|guests)$/i.test(s));
}

const WHAT_TO_BRING =
  "What to bring: your passport or ID (site security asks for it), comfortable shoes, " +
  "sun protection and water, and a light layer for early starts.";

/** After payment — sent from the Stripe webhook once a booking is confirmed. */
export async function sendBookingConfirmation(b: BookingEmail): Promise<void> {
  const isDeposit = b.payMode === "deposit";
  const paidLabel = b.amountEur != null ? `€${b.amountEur}${isDeposit ? " (deposit)" : " (paid in full)"}` : undefined;

  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Date", value: b.tripDate });
  if (b.guests) rows.push({ label: "Guests", value: String(b.guests) });
  if (b.totalEur != null) rows.push({ label: "Total", value: `€${b.totalEur}` });
  if (paidLabel) rows.push({ label: "Paid now", value: paidLabel });
  if (isDeposit && b.balanceEur != null)
    rows.push({
      label: b.balanceAutoCharge ? "Balance (day before)" : "Balance on the day",
      value: `€${b.balanceEur}`,
    });

  const balanceNote = isDeposit
    ? b.balanceEur != null
      ? b.balanceAutoCharge
        ? `The remaining €${b.balanceEur} will be charged automatically to your card the day before your experience — we'll email a receipt. If it can't be taken automatically, we'll send you a secure link.`
        : `The remaining €${b.balanceEur} is settled on the day — cash or card, whichever suits you.`
      : "The remaining balance is settled on the day."
    : "";

  const choices = choiceItems(b.preferences);
  const sections: { title: string; items: string[]; check?: boolean }[] = [];
  if (choices.length) sections.push({ title: "Your day, as you shaped it", items: choices });
  sections.push({ title: "Everything's handled", items: INCLUDED, check: true });

  const html = renderEmail({
    preheader: `Your ${b.productName} is confirmed.`,
    eyebrow: "Booking confirmed",
    heading: `Your journey is confirmed`,
    intro: [
      `Dear ${firstName(b.name)},`,
      "Thank you — your booking with Luxor Rising is confirmed, and we're already looking forward to it.",
    ],
    summary: { title: "What you've reserved", rows },
    sections,
    outro: [
      `Your concierge will confirm the exact timing and pickup within 24 hours.${balanceNote ? " " + balanceNote : ""}`,
      "Anything at all — dietary needs, mobility, a special occasion — just reply to this email and we'll take care of it.",
    ],
    fineprint: "Free cancellation up to 7 days before, per our terms — luxorrising.com/legal/cancellation.",
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    "Your booking with Luxor Rising is confirmed — thank you. We're already looking forward to it.",
    "",
    "What you've reserved:",
    `· ${b.productName}`,
    b.tripDate ? `· Date: ${b.tripDate}` : "",
    b.guests ? `· Guests: ${b.guests}` : "",
    b.totalEur != null ? `· Total: €${b.totalEur}` : "",
    paidLabel ? `· Paid now: ${paidLabel}` : "",
    isDeposit && b.balanceEur != null
      ? `· ${b.balanceAutoCharge ? "Balance (day before)" : "Balance on the day"}: €${b.balanceEur}`
      : "",
    "",
    ...(choices.length ? ["Your day, as you shaped it:", ...choices.map((c) => `· ${c}`), ""] : []),
    "Everything's handled:",
    ...INCLUDED.map((i) => `· ${i}`),
    "",
    `What happens next: your concierge will confirm the exact timing and pickup within 24 hours.${balanceNote ? " " + balanceNote : ""}`,
    "",
    "Anything at all — dietary needs, mobility, a special occasion — just reply to this email and we'll take care of it.",
    "",
    "Free cancellation up to 7 days before, per our terms (luxorrising.com/legal/cancellation).",
    "",
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  await send({
    to: b.email,
    subject: `Your Luxor Rising booking is confirmed — ${b.productName}`,
    text,
    html,
  });
}

/** The concierge confirms the exact day/time and pickup. */
export async function sendDateConfirmation(b: BookingEmail): Promise<void> {
  const when = [b.tripDate, b.time].filter(Boolean).join(", ");
  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (when) rows.push({ label: "When", value: when });
  if (b.pickup) rows.push({ label: "Pickup", value: b.pickup });

  const html = renderEmail({
    preheader: `Your ${b.productName} is set${b.tripDate ? ` for ${b.tripDate}` : ""}.`,
    eyebrow: "Your day is set",
    heading: `Everything's arranged`,
    intro: [
      `Dear ${firstName(b.name)},`,
      `Your ${b.productName} is confirmed${when ? ` for ${when}` : ""}.${b.pickup ? ` We'll collect you ${b.pickup}.` : ""}`,
    ],
    summary: { rows },
    outro: [WHAT_TO_BRING, "If anything needs to change, just reply to this email and we'll rearrange it."],
  });

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
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  await send({ to: b.email, subject: `Your day is set${b.tripDate ? ` — ${b.tripDate}` : ""}`, text, html });
}

/** A few days before — sent by a scheduled job. */
export async function sendTripReminder(b: BookingEmail): Promise<void> {
  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Date", value: b.tripDate });
  if (b.pickup) rows.push({ label: "Pickup", value: `${b.pickup}${b.time ? ` at ${b.time}` : ""}` });

  const html = renderEmail({
    preheader: `A quick note before your ${b.productName}.`,
    eyebrow: "Nearly here",
    heading: "Your Luxor day is nearly here",
    intro: [
      `Dear ${firstName(b.name)},`,
      `A quick note before your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} — we can't wait to show you.`,
    ],
    summary: { rows },
    outro: [WHAT_TO_BRING, "Your concierge is reachable throughout the day, so you never have a decision to make."],
  });

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
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  await send({ to: b.email, subject: "Your Luxor day is nearly here", text, html });
}

/** A day or two after — sent by a scheduled job. */
export async function sendReviewRequest(b: BookingEmail): Promise<void> {
  const html = renderEmail({
    preheader: "A short review would mean the world.",
    eyebrow: "Thank you",
    heading: "How was your day with us?",
    intro: [
      `Dear ${firstName(b.name)},`,
      "Thank you for spending your day with Luxor Rising — it was a genuine pleasure.",
      "If it was as special for you as it was for us, a short review would mean the world — and it helps other travellers find us.",
    ],
    cta: { text: "Leave a review", url: REVIEW_URL },
    outro: [
      "And if anything fell short of what we promised, please tell us directly by replying — we'd always rather hear it from you first.",
    ],
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    "Thank you for spending your day with Luxor Rising — it was a genuine pleasure.",
    "",
    "If it was as special for you as it was for us, a short review would mean the world — and it helps other travellers find us:",
    REVIEW_URL,
    "",
    "And if anything fell short of what we promised, please tell us directly by replying — we'd always rather hear it from you first.",
    "",
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  await send({ to: b.email, subject: "How was your day with us?", text, html });
}

// ── Balance emails (deposit auto-charge, day before) ───────────────────────

/** After the balance is charged (off-session) or paid via the link. */
export async function sendBalanceReceipt(b: {
  name: string;
  email: string;
  productName: string;
  tripDate?: string;
  amountEur?: number;
}): Promise<void> {
  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Date", value: b.tripDate });
  if (b.amountEur != null) rows.push({ label: "Balance paid", value: `€${b.amountEur}` });

  const html = renderEmail({
    preheader: "Your balance is paid — you're all set.",
    eyebrow: "Balance settled",
    heading: "You're all set",
    intro: [
      `Dear ${firstName(b.name)},`,
      b.amountEur != null
        ? `The remaining €${b.amountEur} for your ${b.productName} has been settled — thank you. Nothing else to do.`
        : `The balance for your ${b.productName} has been settled — thank you. Nothing else to do.`,
    ],
    summary: { rows },
    outro: ["Your concierge will confirm the final timing and pickup. We can't wait to host you."],
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    b.amountEur != null
      ? `The remaining €${b.amountEur} for your ${b.productName} has been settled — thank you. Nothing else to do.`
      : `The balance for your ${b.productName} has been settled — thank you.`,
    "",
    "Your concierge will confirm the final timing and pickup. We can't wait to host you.",
    "",
    SIGNOFF_TEXT,
  ].join("\n");

  await send({ to: b.email, subject: `Balance settled — ${b.productName}`, text, html });
}

/** Fallback when the automatic balance charge can't be taken — a secure link. */
export async function sendBalancePaymentLink(b: {
  name: string;
  email: string;
  productName: string;
  tripDate?: string;
  amountEur?: number;
  url: string;
}): Promise<void> {
  const due = b.amountEur != null ? `€${b.amountEur}` : "your balance";
  const html = renderEmail({
    preheader: `One quick step — please settle ${due}.`,
    eyebrow: "One quick step",
    heading: "Please complete your balance",
    intro: [
      `Dear ${firstName(b.name)},`,
      `We tried to take the remaining ${due} for your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} automatically, but your bank needs you to confirm it.`,
      "It takes a moment and any card works:",
    ],
    cta: { text: `Pay ${due} securely`, url: b.url },
    outro: [
      "This secures your booking ahead of the day. If you'd prefer to arrange it another way, just reply and we'll help.",
    ],
    fineprint: "This is a secure Stripe payment page — we never see your card details.",
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    `We tried to take the remaining ${due} for your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} automatically, but your bank needs you to confirm it.`,
    "",
    "Please complete it securely here (any card works):",
    b.url,
    "",
    "If you'd prefer to arrange it another way, just reply and we'll help.",
    "",
    SIGNOFF_TEXT,
  ].join("\n");

  await send({ to: b.email, subject: `Please complete your balance — ${b.productName}`, text, html });
}

// ── Partner (Ahmed) job brief ──────────────────────────────────────────────
export type AhmedBrief = {
  clientName: string;
  productName: string;
  tripDate?: string;
  guests?: number;
  pickup?: string; // base / hotel / area
  preferences?: string; // journey, water choice, add-ons, dietary, occasion, message…
  clientContact?: string; // optional, for day-of coordination
  balanceEur?: number; // balance to collect on the day (deposit bookings)
};

/**
 * The operational hand-off to the local delivery partner when a booking is
 * confirmed: what to deliver, when, for whom, and their preferences. Payment
 * follows the partnership agreement (advanced direct costs + day-rate + 20%
 * commission within 48h of delivery) — deliberately no guest price or margin.
 * Sent from the Stripe webhook. No-op if AHMED_NOTIFY_TO is unset.
 */
export async function sendAhmedJobBrief(b: AhmedBrief): Promise<void> {
  if (!AHMED) return;

  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Date", value: b.tripDate });
  if (b.guests) rows.push({ label: "Guests", value: String(b.guests) });
  if (b.pickup) rows.push({ label: "Pickup / base", value: b.pickup });
  rows.push({ label: "Client", value: `${b.clientName}${b.clientContact ? ` — ${b.clientContact}` : ""}` });
  if (b.balanceEur != null)
    rows.push({ label: "Collect on the day", value: `€${b.balanceEur} (guest balance)` });

  const html = renderEmail({
    preheader: `New booking to deliver${b.tripDate ? ` — ${b.tripDate}` : ""}.`,
    eyebrow: "Operations",
    heading: "A booking is confirmed",
    intro: ["Please prepare to deliver this booking to the Luxor Rising standard (Schedule A) — punctual, private, unhurried, the sites timed against the crowds."],
    summary: { title: "Job brief", rows },
    outro: b.preferences ? ["What they chose / preferences:", b.preferences] : [],
    fineprint:
      "Payment (per our agreement): direct costs are advanced before the day; your day-rate and 20% commission are settled within 48 hours of delivery. Reply here to confirm you can cover this day, or if you'll send a vetted replacement.",
    signoff: ["— Luxor Rising"],
  });

  const text = [
    "A booking is confirmed — please prepare to deliver it.",
    "",
    `· Experience: ${b.productName}`,
    b.tripDate ? `· Date: ${b.tripDate}` : "",
    b.guests ? `· Guests: ${b.guests}` : "",
    b.pickup ? `· Pickup / base: ${b.pickup}` : "",
    `· Client: ${b.clientName}${b.clientContact ? ` (${b.clientContact})` : ""}`,
    b.balanceEur != null ? `· Collect on the day: €${b.balanceEur} (guest balance)` : "",
    "",
    b.preferences ? `What they chose / preferences:\n${b.preferences}` : "",
    "",
    "Please deliver to the Luxor Rising standard (Schedule A) — punctual, private, unhurried, the sites timed against the crowds.",
    "",
    "Payment (per our agreement): direct costs are advanced before the day; your day-rate and 20% commission are settled within 48 hours of delivery.",
    "",
    "Reply here to confirm you can cover this day, or if you'll send a vetted replacement.",
    "",
    "— Luxor Rising",
  ]
    .filter(Boolean)
    .join("\n");

  await send({
    to: AHMED,
    subject: `New booking to deliver${b.tripDate ? ` — ${b.tripDate}` : ""} · ${b.productName}`,
    text,
    html,
    replyTo: REPLY_TO,
  });
}
