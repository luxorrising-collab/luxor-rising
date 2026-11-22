import { Resend } from "resend";
import { esc, renderEmail, SITE_URL, type SummaryRow } from "./email-template";
import {
  FREE_CANCEL_HOURS,
  balanceChargeDate,
  fmtDay,
  freeCancelDate,
  freeCancelOpen,
  localApprox,
  type FxRates,
} from "./payment-policy";

// How a booking's balance is settled, in one phrase for the emails.
type Mode = string | undefined;
const hasBalance = (m: Mode) => m === "deposit" || m === "local";
const balanceLabel = (m: Mode, auto?: boolean, tripDate?: string) =>
  m === "local"
    ? "Balance (on the day, cash)"
    : auto
      ? `Balance (charged automatically${tripDate ? ` on ${fmtDay(balanceChargeDate(tripDate))}` : ", 48 hours before"})`
      : "Balance";
const balanceValue = (m: Mode, eur: number, fx?: FxRates) =>
  m === "local" ? `€${eur} (${localApprox(eur, fx)})` : `€${eur}`;
// The cancellation line, dated when we know the date.
const cancelFine = (tripDate?: string) =>
  tripDate && !freeCancelOpen(tripDate)
    ? `Booked within ${FREE_CANCEL_HOURS} hours of the date: non-refundable, per our terms — luxorrising.com/legal/cancellation.`
    : `Free cancellation until ${tripDate ? `${fmtDay(freeCancelDate(tripDate))} (${FREE_CANCEL_HOURS} hours before)` : `${FREE_CANCEL_HOURS} hours before`}, refunded less only costs already committed. After that, or a no-show, your payment is non-refundable — luxorrising.com/legal/cancellation.`;

// Transactional email via Resend. Everything is guarded: with no RESEND_API_KEY
// set, every send is a silent no-op — so the site works fine before Resend is
// live, and enquiries/bookings are still saved to Supabase regardless.
//
// Env (server-only):
//   RESEND_API_KEY     = re_...            (required to actually send)
//   RESEND_FROM        = "Luxor Rising <concierge@luxorrising.com>"  (optional)
//   RESEND_REPLY_TO    = luxor.rising.com@gmail.com                  (optional)
//   ENQUIRY_NOTIFY_TO  = luxor.rising.com@gmail.com                  (optional)

let _resend: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend ??= new Resend(key);
  return _resend;
}

// Recipient/sender config. Managed in Keystatic (Service emails), with env
// fallbacks so nothing breaks if the content isn't present. Cached per process.
export type ServiceConfig = {
  from: string;
  replyTo: string;
  owners: string[];
  ahmed: string;
  reviewUrl: string;
};
let _cfg: ServiceConfig | null = null;
export async function serviceConfig(): Promise<ServiceConfig> {
  if (_cfg) return _cfg;
  let s: {
    ownerEmails?: string | null;
    ahmedEmail?: string | null;
    replyTo?: string | null;
    fromEmail?: string | null;
    reviewUrl?: string | null;
  } | null = null;
  try {
    // Lazy import so the module can be used (e.g. buildAhmedBrief in previews)
    // without pulling in the Keystatic reader.
    const { reader } = await import("@/lib/keystatic-reader");
    s = await reader.singletons.serviceEmails.read();
  } catch {
    /* content not present — fall back to env */
  }
  const owners = (
    s?.ownerEmails ||
    process.env.ENQUIRY_NOTIFY_TO ||
    "luxor.rising.com@gmail.com,manofknowledge.sk@gmail.com"
  )
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  _cfg = {
    from: s?.fromEmail || process.env.RESEND_FROM || "Luxor Rising <concierge@luxorrising.com>",
    replyTo: s?.replyTo || process.env.RESEND_REPLY_TO || "luxor.rising.com@gmail.com",
    owners,
    ahmed: s?.ahmedEmail || process.env.AHMED_NOTIFY_TO || "",
    reviewUrl: s?.reviewUrl || process.env.GOOGLE_REVIEW_URL || `${SITE_URL}/reviews`,
  };
  return _cfg;
}

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
  const c = await serviceConfig();
  try {
    await resend.emails.send({
      from: c.from,
      to: opts.to,
      replyTo: opts.replyTo ?? c.replyTo,
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
  const c = await serviceConfig();

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
        from: c.from,
        to: c.owners,
        replyTo: enq.email,
        subject: `New enquiry${enq.topic ? ` (${enq.topic})` : ""} — ${enq.name}`,
        text: `A new enquiry came in from the website${enq.topic ? ` — ${enq.topic}` : ""}.\n\n${textLines.join("\n")}\n`,
        html: ownerHtml,
      }),
      resend.emails.send({
        from: c.from,
        to: enq.email,
        replyTo: c.replyTo,
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
  fx?: FxRates;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  preferences?: string;
  experiences?: string[];
}): Promise<void> {
  const resend = client();
  if (!resend) return;
  const c = await serviceConfig();

  const isDeposit = hasBalance(o.payMode);
  const rows: SummaryRow[] = [{ label: "Experience", value: o.productName }];
  if (o.tripDate) rows.push({ label: "Date", value: o.tripDate });
  if (o.guests) rows.push({ label: "Guests", value: String(o.guests) });
  if (o.totalEur != null) rows.push({ label: "Total", value: `€${o.totalEur}` });
  if (o.amountEur != null)
    rows.push({ label: "Paid now", value: `€${o.amountEur}${isDeposit ? " (deposit)" : " (full)"}` });
  if (isDeposit && o.balanceEur != null)
    rows.push({
      label: balanceLabel(o.payMode, o.balanceAutoCharge, o.tripDate),
      value: balanceValue(o.payMode, o.balanceEur, o.fx),
    });
  rows.push({
    label: "Guest",
    value: [o.customerName, o.customerEmail, o.customerPhone].filter(Boolean).join(" · ") || "—",
  });

  const ownerSections = [
    ...(o.experiences?.length ? [{ title: "Their experiences", items: o.experiences }] : []),
    ...(choiceItems(o.preferences).length ? [{ title: "Their choices", items: choiceItems(o.preferences) }] : []),
  ];
  const sections = ownerSections.length ? ownerSections : undefined;

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
    isDeposit && o.balanceEur != null
      ? `${balanceLabel(o.payMode, o.balanceAutoCharge, o.tripDate)}: ${balanceValue(o.payMode, o.balanceEur, o.fx)}`
      : "",
    `Guest: ${[o.customerName, o.customerEmail, o.customerPhone].filter(Boolean).join(" · ")}`,
    o.experiences?.length ? `\nTheir experiences:\n${o.experiences.map((x) => `· ${x}`).join("\n")}` : "",
    o.preferences ? `\nTheir choices:\n${o.preferences}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await resend.emails.send({
      from: c.from,
      to: c.owners,
      replyTo: o.customerEmail || c.replyTo,
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
  const c = await serviceConfig();
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
      from: c.from,
      to: c.owners,
      replyTo: a.customerEmail || c.replyTo,
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
  dateConfirmations: number;
}): Promise<void> {
  const resend = client();
  if (!resend) return;
  const c = await serviceConfig();
  const rows: SummaryRow[] = [
    { label: "Balances charged", value: String(s.charged) },
    { label: "Payment links sent", value: String(s.linkSent) },
    { label: "Date confirmations", value: String(s.dateConfirmations) },
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
      from: c.from,
      to: c.owners,
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
  balanceAutoCharge?: boolean; // balance will be auto-charged 48 hours before
  payMode?: string; // 'full' | 'deposit' (auto-charged) | 'local' (paid on the day)
  fx?: FxRates; // indicative EGP / USD rates for a balance paid locally
  balanceStatus?: string; // for reminders: scheduled | paid | local_due | …
  pickup?: string;
  time?: string;
  preferences?: string; // the guest's design-your-day choices (" · " joined)
  experiences?: string[]; // the guest's picks ("add to my day"), canonical names
  tier?: "signature" | "original" | "adventure"; // Design-Your-Day package, if any
};

// Read the picks back from a booking's notes ("Your experiences: A · B").
export function experiencesFromNotes(notes?: string | null): string[] {
  const line = (notes ?? "").split("\n").find((l) => l.startsWith("Your experiences: "));
  return line ? line.slice("Your experiences: ".length).split(" · ").map((x) => x.trim()).filter(Boolean) : [];
}

// What a full-service booking includes — a single experience, Signature or
// Original — stated up front to remove doubt and the need to hunt the FAQ.
const INCLUDED: string[] = [
  "Private to your group — never shared with strangers",
  "A licensed Egyptologist / expert host with you throughout",
  "All entry tickets, permits and logistics arranged for you",
  "Hotel or villa pickup and drop-off",
  "Water, shade and an unhurried pace — no rushing between sites",
  "Your concierge reachable all day, so you never have a decision to make",
  `Free cancellation until ${FREE_CANCEL_HOURS} hours before`,
];

// Adventure: the must-sees of Luxor and a Nile sail; the rest is chosen on the
// day and paid locally, so its list is stated honestly.
const INCLUDED_ADVENTURE: string[] = [
  "Private to your group — never shared with strangers",
  "Your own driver, translator & fixer on the ground all day",
  "The must-sees of Luxor — Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut and Medinet Habu, entries included — and a Nile sail",
  "Hotel or villa pickup and drop-off, and door-to-door transfer from the coast",
  "Your concierge reachable all day, so you never have a decision to make",
  "Anything more — further sites, experiences and tips — chosen on the day and paid locally",
  `Free cancellation until ${FREE_CANCEL_HOURS} hours before`,
];

const includedFor = (tier?: string): string[] =>
  tier === "adventure" ? INCLUDED_ADVENTURE : INCLUDED;

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
/** The confirmation email itself (subject, HTML, text) — also used to preview it. */
export function buildBookingConfirmation(b: BookingEmail): { subject: string; html: string; text: string } {
  const isDeposit = hasBalance(b.payMode);
  const paidLabel = b.amountEur != null ? `€${b.amountEur}${isDeposit ? " (deposit)" : " (paid in full)"}` : undefined;

  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Date", value: b.tripDate });
  if (b.guests) rows.push({ label: "Guests", value: String(b.guests) });
  if (b.totalEur != null) rows.push({ label: "Total", value: `€${b.totalEur}` });
  if (paidLabel) rows.push({ label: "Paid now", value: paidLabel });
  if (isDeposit && b.balanceEur != null)
    rows.push({
      label: balanceLabel(b.payMode, b.balanceAutoCharge, b.tripDate),
      value: balanceValue(b.payMode, b.balanceEur, b.fx),
    });

  const balanceNote = isDeposit
    ? b.balanceEur != null
      ? b.payMode === "local"
        ? `The remaining €${b.balanceEur} is paid on the day to your concierge, in cash: Egyptian pounds, euros or US dollars, at the day's mid-market rate (${localApprox(b.balanceEur, b.fx)} at today's rate). You'll get a receipt.`
        : b.balanceAutoCharge
          ? `The remaining €${b.balanceEur} will be charged automatically to your card${b.tripDate ? ` on ${fmtDay(balanceChargeDate(b.tripDate))}` : ""}, 48 hours before your experience — we'll email a receipt. If it can't be taken automatically, we'll send you a secure link.`
          : `We'll email you a secure link to pay the remaining €${b.balanceEur} 48 hours before your experience.`
      : "The remaining balance is settled before the day."
    : "";

  const choices = choiceItems(b.preferences);
  const included = includedFor(b.tier);
  const sections: { title: string; items: string[]; check?: boolean }[] = [];
  if (b.experiences?.length) sections.push({ title: "Your experiences", items: b.experiences });
  if (choices.length) sections.push({ title: "Your day, as you shaped it", items: choices });
  sections.push({ title: "Everything's handled", items: included, check: true });

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
    fineprint: cancelFine(b.tripDate),
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
      ? `· ${balanceLabel(b.payMode, b.balanceAutoCharge, b.tripDate)}: ${balanceValue(b.payMode, b.balanceEur, b.fx)}`
      : "",
    "",
    ...(b.experiences?.length ? ["Your experiences:", ...b.experiences.map((c) => `· ${c}`), ""] : []),
    ...(choices.length ? ["Your day, as you shaped it:", ...choices.map((c) => `· ${c}`), ""] : []),
    "Everything's handled:",
    ...included.map((i) => `· ${i}`),
    "",
    `What happens next: your concierge will confirm the exact timing and pickup within 24 hours.${balanceNote ? " " + balanceNote : ""}`,
    "",
    "Anything at all — dietary needs, mobility, a special occasion — just reply to this email and we'll take care of it.",
    "",
    cancelFine(b.tripDate),
    "",
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject: `Your Luxor Rising booking is confirmed — ${b.productName}`, html, text };
}

export async function sendBookingConfirmation(b: BookingEmail): Promise<void> {
  const { subject, html, text } = buildBookingConfirmation(b);
  await send({ to: b.email, subject, text, html });
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
    sections: b.experiences?.length ? [{ title: "Your experiences", items: b.experiences }] : undefined,
    outro: [WHAT_TO_BRING, "If anything needs to change, just reply to this email and we'll rearrange it."],
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    `Your ${b.productName} is confirmed${when ? ` for ${when}` : ""}.`,
    b.pickup ? `We'll collect you ${b.pickup}.` : "",
    b.experiences?.length ? `\nYour experiences:\n${b.experiences.map((x) => `· ${x}`).join("\n")}` : "",
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
  // A balance paid locally: the one practical thing to prepare.
  const cashEur = b.payMode === "local" && b.balanceStatus === "local_due" ? b.balanceEur : undefined;
  if (cashEur) rows.push({ label: "To pay on the day", value: balanceValue("local", cashEur, b.fx) });
  const cashLine = cashEur
    ? `Please have the remaining €${cashEur} ready for your concierge, in cash: Egyptian pounds, euros or US dollars (${localApprox(cashEur, b.fx)} at today's rate). Resort ATMs often limit each withdrawal, so it's easiest to bring euros or dollars, or withdraw over a couple of days.`
    : "";

  const html = renderEmail({
    preheader: `A quick note before your ${b.productName}.`,
    eyebrow: "Nearly here",
    heading: "Your Luxor day is nearly here",
    intro: [
      `Dear ${firstName(b.name)},`,
      `A quick note before your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} — we can't wait to show you.`,
    ],
    summary: { rows },
    sections: b.experiences?.length ? [{ title: "Your experiences", items: b.experiences }] : undefined,
    outro: [
      ...(cashLine ? [cashLine] : []),
      WHAT_TO_BRING,
      "Your concierge is reachable throughout the day, so you never have a decision to make.",
    ],
  });

  const text = [
    `Dear ${firstName(b.name)},`,
    "",
    `A quick note before your ${b.productName}${b.tripDate ? ` on ${b.tripDate}` : ""} — we can't wait to show you.`,
    cashLine,
    b.pickup ? `We'll collect you ${b.pickup}${b.time ? ` at ${b.time}` : ""}.` : "",
    b.experiences?.length ? `\nYour experiences:\n${b.experiences.map((x) => `· ${x}`).join("\n")}` : "",
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
  const c = await serviceConfig();
  const html = renderEmail({
    preheader: "A short review would mean the world.",
    eyebrow: "Thank you",
    heading: "How was your day with us?",
    intro: [
      `Dear ${firstName(b.name)},`,
      "Thank you for spending your day with Luxor Rising — it was a genuine pleasure.",
      "If it was as special for you as it was for us, a short review would mean the world — and it helps other travellers find us.",
    ],
    cta: { text: "Leave a review", url: c.reviewUrl },
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
    c.reviewUrl,
    "",
    "And if anything fell short of what we promised, please tell us directly by replying — we'd always rather hear it from you first.",
    "",
    SIGNOFF_TEXT,
  ]
    .filter(Boolean)
    .join("\n");

  await send({ to: b.email, subject: "How was your day with us?", text, html });
}

// ── Balance emails (deposit auto-charge, 48 hours before) ───────────────────────

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
  clientEmail?: string;
  clientPhone?: string;
  productName: string;
  productUrl?: string; // link to the product page — Ahmed's reference "manual"
  tripDate?: string; // start date (nástup)
  time?: string; // start / pickup time, if known
  guests?: number;
  pickup?: string; // hotel / base / area, if known
  ordered?: string[]; // explicit list of what was ordered; else derived from preferences
  preferences?: string; // raw design-your-day string (fallback for `ordered`)
  experiences?: string[]; // the guest's picks, canonical names (listed first)
  payMode?: string; // 'full' | 'deposit' | 'local'
  balanceEur?: number; // the balance the concierge collects on the day ('local')
  fx?: FxRates;
  days?: number; // concierge journeys: number of days (drives the menu below)
  tier?: "signature" | "original" | "adventure"; // which Design-Your-Day package
  notes?: string; // any extra concierge notes
  sample?: boolean; // a clearly-labelled sample (not a real booking)
};

const TRANSFER_RE = /transfer|transport|airport|hurghada|shuttle|drive|pick[\s-]?up from/i;

// The full Concierge Day menu (from the Day configurator) — shown on multi-day
// journeys, where the exact sites/activities and their order are agreed with
// the client rather than fully chosen at checkout.
const CONCIERGE_TEMPLES: string[] = [
  "Karnak Temple (at dawn)",
  "Luxor Temple",
  "Medinet Habu — temple of Ramesses III",
  "Hatshepsut Temple (Deir el-Bahari)",
  "Valley of the Kings",
  "Valley of the Workers (Deir el-Medina)",
  "Deir el-Shelwit",
  "Colossi of Memnon",
];
const CONCIERGE_ACTIVITIES: string[] = [
  "Hot-air balloon at dawn over the West Bank",
  "Felucca / sunset sail on the Nile",
  "Desert sunset picnic",
  "Desert rally",
  "Sailing lesson on the Nile",
  "Private photoshoot",
  "A night out in Luxor",
  "Licensed Egyptologist guiding",
  "Air-conditioned private transfers",
  "Hurghada round-trip transfer",
];

// Original — the full sightseeing day: everything in, the order agreed with the
// guest. All entries are paid for; no Signature extras (balloon, gifts, bonuses).
function originalIncluded(hasTransfer: boolean, guests?: number): string[] {
  const g = guests ? `${guests} guest${guests > 1 ? "s" : ""}` : "the guests";
  return [
    "Every great temple & tomb of both banks — the order agreed with the guest",
    `All monument entry tickets for ${g} — nothing paid locally`,
    "A private felucca on the Nile and a trip into the desert",
    "Your own licensed Egyptologist at the sites",
    hasTransfer ? "Hurghada / Marsa Alam door-to-door transfer — the car stays all day" : "",
    "Private, air-conditioned transfers throughout",
    "Every reservation, timing & fast-track entry, arranged in advance",
    "Concierge reachable on WhatsApp all day",
  ].filter(Boolean);
}

// Adventure — the must-sees of Luxor and a Nile sail are included; everything
// else is chosen on the day and paid locally. No Egyptologist.
function adventureIncluded(hasTransfer: boolean): string[] {
  return [
    "Your own driver, translator & fixer on the ground all day",
    "The must-sees, entries included: Karnak, Luxor Temple, the Valley of the Kings, Hatshepsut and Medinet Habu (three tombs in the Valley of the Kings)",
    "A Nile sail (shared felucca) with a local boatman",
    "A hand-picked local food & coffee stop",
    hasTransfer ? "Hurghada / Marsa Alam door-to-door transfer — the car stays all day" : "",
    "Concierge reachable on WhatsApp all day",
    "NOTE: any further sites, experiences, entry tickets and tips are chosen on the day and paid locally, in cash — not included",
  ].filter(Boolean);
}

// The concierge journey scope — what the guest has paid for and must receive,
// exactly as promised on the page (food, transfers, tickets, guiding, photos).
function conciergeIncluded(days: number, hasTransfer: boolean, guests?: number): string[] {
  const g = guests ? `${guests} guest${guests > 1 ? "s" : ""}` : "the guests";
  return [
    "A full meal plus up to three hand-picked local food & coffee stops each day — where locals actually eat",
    "Your own licensed Egyptologist — every day",
    `All monument entry tickets for ${g}`,
    hasTransfer ? "Hurghada hotel pickup & private desert crossing" : "",
    days >= 4
      ? "Private, air-conditioned transfers throughout — upgraded to VIP on the unhurried days"
      : "Private, air-conditioned transfers throughout",
    "Every reservation, timing & fast-track entry, arranged in advance",
    "The day photographed on the guest's own phone — from the first moment",
    "No hassle — nobody follows, sells, or asks for a tip; the guards know us",
    "Concierge reachable on WhatsApp all day",
  ].filter(Boolean);
}

/**
 * Build Ahmed's operational run sheet: everything he needs to deliver the day —
 * what was booked, when, for whom, how to reach the client, and the full list
 * of what they ordered. Deliberately no guest price or margin; payment follows
 * the partnership agreement. Separated from sending so a preview can reuse it.
 */
export function buildAhmedBrief(b: AhmedBrief): { subject: string; html: string; text: string } {
  const ordered = b.ordered && b.ordered.length ? b.ordered : choiceItems(b.preferences);
  const transferItems = ordered.filter((i) => TRANSFER_RE.test(i));
  const isDeposit = b.payMode === "deposit";

  const rows: SummaryRow[] = [{ label: "Experience", value: b.productName }];
  if (b.tripDate) rows.push({ label: "Start date", value: `${b.tripDate}${b.time ? ` · ${b.time}` : ""}` });
  if (b.guests) rows.push({ label: "Guests", value: String(b.guests) });
  rows.push({ label: "Pickup / base", value: b.pickup || "To be confirmed by concierge" });
  if (transferItems.length) rows.push({ label: "Transfer", value: transferItems.join(" · ") });
  rows.push({ label: "Client", value: b.clientName });
  if (b.clientPhone) rows.push({ label: "Call the client", value: b.clientPhone });
  if (b.clientEmail) rows.push({ label: "Email", value: b.clientEmail });
  if (b.productUrl) rows.push({ label: "Product page", value: b.productUrl });

  const tier = b.tier ?? "signature";
  const isConcierge = (b.days ?? 0) >= 1;
  const isSignature = isConcierge && tier === "signature";
  // The full temple/activity menu is a Signature thing (the guest shapes the
  // order over the days). Original is a fixed full-sightseeing day; Adventure is
  // the must-sees of Luxor and a Nile sail, the rest paid locally.
  const signatureMultiDay = isSignature && (b.days ?? 0) >= 2;
  const hasTransfer = transferItems.length > 0;
  const firstTemple = b.preferences?.match(/first temple:\s*([^)]+)\)/i)?.[1]?.trim();

  // One line that frames the journey for Ahmed, tailored to the package.
  const introJourneyLine = isSignature
    ? `This is a ${b.days}-day Signature journey. Everything below is paid for by the guest and must be delivered in full — the exact temples, activities and their order you shape together with the guest, and that's yours to run.`
    : tier === "original"
      ? `This is a ${b.days}-day Original sightseeing journey. Everything below is included and paid for — the great temples & tombs, a felucca and the desert, with all entries; shape the order together with the guest.`
      : tier === "adventure"
        ? `This is a ${b.days}-day Adventure (the must-sees of Luxor). Only the items marked "included" are paid for — the must-sees of Luxor and a Nile sail; everything else the guest chooses on the day and pays locally.`
        : "Here's your run sheet for the day.";

  const sections: { title: string; items: string[]; check?: boolean; small?: boolean }[] = [];
  if (ordered.length)
    sections.push({
      title: isSignature ? "What the client has chosen so far" : "What the client ordered",
      items: ordered,
      check: true,
    });
  if (isSignature) {
    sections.push({
      title: "How the journey works",
      items: [
        `Day 1 opens with the first temple at dawn${firstTemple ? ` — ${firstTemple}` : ""}, before the crowds; then the day flows, shaped around the guest.`,
        "Across the journey you cover the temples and activities below — the order and priority you decide together with the guest, and that's yours to run.",
      ],
    });
    sections.push({
      title: "Included — paid for, and to be delivered in full",
      items: conciergeIncluded(b.days ?? 1, hasTransfer, b.guests),
      check: true,
      small: true,
    });
  } else if (tier === "original") {
    sections.push({
      title: "Included — paid for, and to be delivered in full",
      items: originalIncluded(hasTransfer, b.guests),
      check: true,
      small: true,
    });
  } else if (tier === "adventure") {
    sections.push({
      title: "Included — paid for, and to be delivered in full",
      items: adventureIncluded(hasTransfer),
      check: true,
      small: true,
    });
  }
  if (signatureMultiDay) {
    sections.push({ title: "Temples & sites on the menu", items: CONCIERGE_TEMPLES, small: true });
    sections.push({ title: "Activities on the menu", items: CONCIERGE_ACTIVITIES, small: true });
  }
  if (b.experiences?.length) sections.unshift({ title: "The guest's experiences", items: b.experiences });
  if (b.notes) sections.push({ title: "Notes", items: [b.notes] });

  const paidLine =
    b.payMode === "local"
      ? `COLLECT ON THE DAY: the client paid a deposit to Luxor Rising and pays you the remaining €${b.balanceEur ?? "—"} in cash — Egyptian pounds, euros or US dollars, at the day's mid-market rate on xe.com (${b.balanceEur ? localApprox(b.balanceEur, b.fx) : "rate on the day"} at booking). Count it with the guest, give a receipt, and message Luxor Rising once it's received.`
      : isDeposit
        ? "The client has paid their deposit to Luxor Rising; the remaining balance is charged automatically 48 hours before — you collect nothing from the guest."
        : "The client has paid in full to Luxor Rising — you collect nothing from the guest.";

  const bannerTitle = `${b.productName}${
    b.guests ? ` · ${b.guests} guest${b.guests > 1 ? "s" : ""}` : ""
  }${b.tripDate ? ` · ${b.tripDate}` : ""}`;

  const sample = b.sample === true;
  const html = renderEmail({
    preheader: sample ? `Sample brief — this is how bookings will look` : `New booking for you — ${bannerTitle}`,
    banner: {
      kicker: sample ? "Sample · not a real booking" : "New reservation · Luxor Rising",
      title: bannerTitle,
    },
    heading: sample ? "A quick sample for you" : "Wonderful — a new guest to look after",
    intro: [
      ...(sample
        ? [
            "Hello Ahmed! This is a sample so you can see exactly what a Luxor Rising booking will look like — there is nothing to deliver here, it isn't a real booking. The real ones will arrive the same way, and we'll be in touch.",
          ]
        : []),
      "Great news: another Luxor Rising guest is coming your way, and they're in the very best hands with you. 🎉",
      introJourneyLine,
      "Please give them a warm call to say hello and confirm the pickup point and time.",
    ],
    summary: { title: "Booking", rows },
    sections,
    outro: [
      paidLine,
      "Unless we hear otherwise, we'll take this as confirmed within 24 hours. If anything about it doesn't work for you — the date, the transfer, anything at all — just contact us straight away and we'll make it right.",
      "Every guest you delight can become a returning traveller and a warm recommendation — real long-term value for both of us. Thank you for looking after them; it's how we keep building this together.",
    ],
    fineprint:
      "Your costs for this booking are calculated per our agreement, and settled per our agreement — direct costs advanced before the day; your day-rate and 20% commission within 48 hours of successful delivery.",
    signoff: ["— The Luxor Rising concierge team"],
  });

  const text = [
    sample ? "SAMPLE · NOT A REAL BOOKING" : "NEW RESERVATION · LUXOR RISING",
    bannerTitle,
    "",
    sample
      ? "Hello Ahmed! This is a sample so you can see what a Luxor Rising booking will look like — there is nothing to deliver here, it isn't a real booking. The real ones will arrive the same way."
      : "",
    "Great news — another guest to look after, and they're in the very best hands with you! Give them a warm call to say hello and confirm the pickup point and time.",
    isConcierge ? `\n${introJourneyLine}` : "",
    "",
    `Experience: ${b.productName}`,
    b.productUrl ? `Product page: ${b.productUrl}` : "",
    b.tripDate ? `Start date: ${b.tripDate}${b.time ? ` · ${b.time}` : ""}` : "",
    b.guests ? `Guests: ${b.guests}` : "",
    `Pickup / base: ${b.pickup || "To be confirmed by concierge"}`,
    transferItems.length ? `Transfer: ${transferItems.join(" · ")}` : "",
    `Client: ${b.clientName}`,
    b.clientPhone ? `Call the client: ${b.clientPhone}` : "",
    b.clientEmail ? `Email: ${b.clientEmail}` : "",
    "",
    ordered.length ? (isSignature ? "What the client has chosen so far:" : "What the client ordered:") : "",
    ...ordered.map((i) => `· ${i}`),
    ...(isSignature
      ? [
          "",
          "How the journey works:",
          `· Day 1 opens with the first temple at dawn${firstTemple ? ` — ${firstTemple}` : ""}, before the crowds; then the day flows, shaped around the guest.`,
          "· Across the journey you cover the temples and activities below — the order and priority you decide together with the guest, and that's yours to run.",
          "",
          "Included — paid for, and to be delivered in full:",
          ...conciergeIncluded(b.days ?? 1, hasTransfer, b.guests).map((i) => `· ${i}`),
        ]
      : tier === "original"
        ? ["", "Included — paid for, and to be delivered in full:", ...originalIncluded(hasTransfer, b.guests).map((i) => `· ${i}`)]
        : tier === "adventure"
          ? ["", "Included — paid for, and to be delivered in full:", ...adventureIncluded(hasTransfer).map((i) => `· ${i}`)]
          : []),
    ...(signatureMultiDay
      ? [
          "",
          "Temples & sites on the menu:",
          ...CONCIERGE_TEMPLES.map((i) => `· ${i}`),
          "",
          "Activities on the menu:",
          ...CONCIERGE_ACTIVITIES.map((i) => `· ${i}`),
        ]
      : []),
    b.experiences?.length ? `\nThe guest's experiences:\n${b.experiences.map((x) => `· ${x}`).join("\n")}` : "",
    b.notes ? `\nNotes: ${b.notes}` : "",
    "",
    paidLine,
    "",
    "Unless we hear otherwise, we'll take this as confirmed within 24 hours. If anything about it doesn't work for you — date, transfer, anything — contact us straight away and we'll make it right.",
    "",
    "Every guest you delight can become a returning traveller and a warm recommendation — real long-term value for both of us. Thank you for looking after them; it's how we keep building this together.",
    "",
    "Your costs for this booking are calculated per our agreement, and settled per our agreement — direct costs advanced before the day; day-rate + 20% commission within 48h of successful delivery.",
    "",
    "— The Luxor Rising concierge team",
  ]
    .filter(Boolean)
    .join("\n");

  const subject = sample
    ? `[SAMPLE — not a real booking] ${b.productName}`
    : `Deliver${b.tripDate ? ` — ${b.tripDate}` : ""} · ${b.productName}`;
  return { subject, html, text };
}

/** Send Ahmed's brief. No-op until the partner email is set (Keystatic / env). */
export async function sendAhmedJobBrief(b: AhmedBrief): Promise<void> {
  const c = await serviceConfig();
  if (!c.ahmed) return;
  const { subject, html, text } = buildAhmedBrief(b);
  await send({ to: c.ahmed, subject, text, html });
}

// ── Saved day ("Email me my day") ───────────────────────────────────────────
export type SavedDayEmail = {
  email: string;
  picks: { slug?: string; name: string; title?: string; hook?: string }[];
  /** Opens the site with these picks back in "Your day". */
  link: string;
  /** About how many days the picks need (3–4 a day). */
  days?: number;
  newsletter?: boolean;
  /** The three ways to see the picks with us, Adventure first, Signature last. */
  tiers?: { name: string; kicker: string; from: number; line: string; included: number }[];
};

const pickItems = (picks: SavedDayEmail["picks"]) =>
  picks.map((p) => (p.title && p.title !== p.name ? `${p.name} — ${p.title}` : p.name));

// The first sentence or two of a product's hook — "why it's worth it".
const why = (hook?: string) => {
  if (!hook) return "";
  const parts = hook.match(/[^.!?]+[.!?]+/g) ?? [hook];
  let out = "";
  for (const sentence of parts) {
    if ((out + sentence).length > 260 && out) break;
    out += sentence;
  }
  return out.trim();
};

const E_SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const E_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif";

/** Photo cards: one per experience, with why it's worth it and a link to read more. */
function savedPickCards(picks: SavedDayEmail["picks"]): string {
  return picks
    .slice(0, 8)
    .map((p) => {
      const img = p.slug ? `${SITE_URL}/images/cards/${p.slug}.jpg` : "";
      const page = p.slug ? `${SITE_URL}/experiences/${p.slug}` : SITE_URL;
      const reason = why(p.hook);
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 18px;background:#FFFFFF;border:1px solid #E7DCC5;border-radius:6px;">
        <tr>
          ${img ? `<td width="180" valign="top" style="width:180px;padding:0;"><a href="${page}"><img src="${img}" width="180" alt="${esc(p.name)}" style="display:block;border:0;width:180px;height:auto;border-radius:6px 0 0 6px;"></a></td>` : ""}
          <td valign="top" style="padding:16px 18px;">
            <div style="font-family:${E_SANS};font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#C9A063;">${esc(p.name)}</div>
            ${p.title && p.title !== p.name ? `<div style="font-family:${E_SERIF};font-style:italic;font-size:18px;line-height:1.3;color:#2A1C10;margin:6px 0 8px;">${esc(p.title)}</div>` : ""}
            ${reason ? `<div style="font-family:${E_SANS};font-size:13px;line-height:1.55;color:#3A2818;">${esc(reason)}</div>` : ""}
            <a href="${page}" style="display:inline-block;margin-top:10px;font-family:${E_SANS};font-size:12px;font-weight:700;color:#9A7440;text-decoration:none;">Read more →</a>
          </td>
        </tr>
      </table>`;
    })
    .join("");
}

/** The three ways to see it with us — what each holds, and how many picks it includes. */
function savedTiers(tiers: NonNullable<SavedDayEmail["tiers"]>, of: number): string {
  const rows = tiers
    .map((t, i) => {
      const last = i === tiers.length - 1;
      const all = t.included >= of;
      return `<tr>
        <td valign="top" style="padding:14px 16px;border-bottom:${last ? "none" : "1px solid #E7DCC5"};${last ? "background:#FBF5E8;" : ""}">
          <div style="font-family:${E_SANS};font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#C9A063;">${esc(t.kicker)}</div>
          <div style="font-family:${E_SERIF};font-size:21px;line-height:1.2;color:#2A1C10;margin:2px 0 4px;">${esc(t.name)} <span style="font-family:${E_SANS};font-size:12px;color:#7A6754;">· from €${t.from.toLocaleString("en-US")} a day</span></div>
          <div style="font-family:${E_SANS};font-size:13px;line-height:1.5;color:#3A2818;">${esc(t.line)}</div>
          <div style="font-family:${E_SANS};font-size:12px;font-weight:700;color:${all ? "#6E8B4E" : "#9A7440"};margin-top:6px;">${
            all ? `✓ All ${of} of your picks included` : `${t.included} of your ${of} picks included · the rest arranged locally`
          }</div>
        </td>
      </tr>`;
    })
    .join("");
  return `<div style="margin:6px 0 26px;">
    <div style="font-family:${E_SERIF};font-size:22px;color:#2A1C10;margin:0 0 4px;">Three ways to see it with us</div>
    <div style="font-family:${E_SANS};font-size:13px;line-height:1.5;color:#7A6754;margin:0 0 12px;">The same private day, at three depths. Each comes with your concierge door to door and the transfer from the coast.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#FFFFFF;border:1px solid #E7DCC5;border-radius:6px;">${rows}</table>
  </div>`;
}

/** A few things worth knowing before a day in Luxor — useful, whatever they decide. */
const GOOD_TO_KNOW = [
  "Go early. The temples are at their quietest in the first hour after opening, and the light is softest.",
  "Cover shoulders and knees at the temples, bring a hat and a scarf for the sun, and shoes you can walk in.",
  "Carry some small Egyptian pound notes for tips. On Signature, tips are already settled for you.",
];

/** "Good to know before Luxor" — three short, useful lines. */
const goodToKnow = () =>
  `<div style="margin:0 0 24px;"><div style="font-family:${E_SERIF};font-size:19px;color:#2A1C10;margin:0 0 8px;">Good to know before Luxor</div>${GOOD_TO_KNOW.map(
    (g) =>
      `<div style="font-family:${E_SANS};font-size:13px;line-height:1.55;color:#3A2818;margin:0 0 6px;"><span style="color:#C9A063;font-weight:700;">&#10003;</span>&nbsp; ${esc(g)}</div>`,
  ).join("")}</div>`;

/** The guest's own copy of their day: photos, why each is worth it, and three ways to see it. */
export function buildSavedDay(d: SavedDayEmail): { subject: string; html: string; text: string } {
  const n = d.picks.length;
  const daysLine = d.days ? `, about ${d.days} day${d.days > 1 ? "s" : ""} at the right pace` : "";
  const first = d.picks.find((p) => p.slug);
  const html = renderEmail({
    preheader: `Your ${n} Luxor experiences, with why each is worth it and three ways to see them.`,
    heroImage: first?.slug ? { src: `${SITE_URL}/images/cards/${first.slug}.jpg`, alt: first.name } : undefined,
    eyebrow: "Your day, saved",
    heading: "Your Luxor day, ready when you are",
    intro: [
      "Hello,",
      `Here are the ${n} experiences you picked${daysLine}: why each one is worth it, and three ways to see them with us. One tap brings your day back exactly as you left it, on any device.`,
    ],
    html:
      savedPickCards(d.picks) +
      (d.picks.length > 8 ? `<p style="font-family:${E_SANS};font-size:13px;color:#7A6754;margin:-6px 0 22px;">+ ${d.picks.length - 8} more in your day.</p>` : "") +
      (d.tiers?.length ? savedTiers(d.tiers, n) : "") +
      goodToKnow(),
    cta: { text: "Open my day", url: d.link },
    outro: [
      "When you're ready, hold your date with 20% today, refundable until 48 hours before your trip. Your concierge shapes the order and timing with you.",
      "Celebrating something, or travelling with someone special? Just reply. A real person answers.",
      ...(d.newsletter
        ? ["You're also on the Insider's letter: a short monthly note on Luxor's best hours and hidden places. Reply \"unsubscribe\" any time to stop it."]
        : []),
    ],
    fineprint: "You're receiving this because you asked us to email your day from luxorrising.com. We'll send one reminder, then nothing more unless you write to us.",
  });
  const text = [
    "Hello,",
    "",
    `Here are the ${n} experiences you picked${daysLine}:`,
    "",
    ...d.picks.flatMap((p) => [
      `· ${p.name}${p.title && p.title !== p.name ? ` — ${p.title}` : ""}`,
      ...(why(p.hook) ? [`  ${why(p.hook)}`] : []),
      ...(p.slug ? [`  Read more: ${SITE_URL}/experiences/${p.slug}`] : []),
    ]),
    "",
    ...(d.tiers?.length
      ? [
          "Three ways to see it with us:",
          ...d.tiers.map(
            (t) =>
              `· ${t.name} (from €${t.from} a day): ${t.line} ${t.included >= n ? `All ${n} of your picks included.` : `${t.included} of your ${n} picks included.`}`,
          ),
          "",
        ]
      : []),
    `Open my day: ${d.link}`,
    "",
    "Good to know before Luxor:",
    ...GOOD_TO_KNOW.map((g) => `· ${g}`),
    "",
    "When you're ready, hold your date with 20% today, refundable until 48 hours before your trip.",
    "Celebrating something? Just reply. A real person answers.",
    d.newsletter ? "\nYou're also on the Insider's letter. Reply \"unsubscribe\" any time to stop it." : "",
    "",
    SIGNOFF_TEXT,
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");
  return { subject: "Your Luxor day, saved — with three ways to see it", html, text };
}

/** Two days later, if they haven't booked: one gentle reminder. */
export function buildSavedDayReminder(d: SavedDayEmail): { subject: string; html: string; text: string } {
  const html = renderEmail({
    preheader: "Your Luxor day is still waiting.",
    eyebrow: "Still dreaming of Luxor?",
    heading: "Your day is still waiting",
    intro: [
      "Hello,",
      `Your ${d.picks.length} experiences are saved, just as you left them. Dates in Luxor go quietly, so if you've a day in mind, now is a good moment to hold it.`,
    ],
    sections: [{ title: "Your experiences", items: pickItems(d.picks) }],
    cta: { text: "Open my day", url: d.link },
    outro: [
      "Hold your date with 20% today, free cancellation until 48 hours before. Or reply with any question — a real person answers.",
    ],
    fineprint: "This is the one reminder we promised. We won't email again unless you write to us.",
  });
  const text = [
    "Hello,",
    "",
    `Your ${d.picks.length} experiences are saved, just as you left them:`,
    ...pickItems(d.picks).map((p) => `· ${p}`),
    "",
    `Open my day: ${d.link}`,
    "",
    "Hold your date with 20% today, free cancellation until 48 hours before. Or reply with any question.",
    "",
    SIGNOFF_TEXT,
  ].join("\n");
  return { subject: "Your Luxor day is still waiting", html, text };
}

/** Send the saved day to the guest, and tell the owner a warm lead came in. */
export async function sendSavedDayEmails(d: SavedDayEmail): Promise<void> {
  const { subject, html, text } = buildSavedDay(d);
  await send({ to: d.email, subject, text, html });
  const c = await serviceConfig();
  const resend = client();
  if (!resend) return;
  const items = pickItems(d.picks);
  try {
    await resend.emails.send({
      from: c.from,
      to: c.owners,
      replyTo: d.email,
      subject: `Saved day — ${d.email} · ${d.picks.length} experiences`,
      text: [
        `Someone saved their day: ${d.email}`,
        `Insider's letter: ${d.newsletter ? "yes" : "no"}`,
        "",
        ...items.map((i) => `· ${i}`),
        "",
        `Their link: ${d.link}`,
        "A reminder goes out automatically in 2 days if they haven't booked.",
      ].join("\n"),
      html: renderEmail({
        preheader: `Saved day — ${d.email}`,
        eyebrow: "Warm lead · saved day",
        heading: `Saved day — ${d.email}`,
        intro: [
          `Someone emailed themselves their day. Insider's letter: ${d.newsletter ? "yes" : "no"}. Reply to reach them.`,
        ],
        sections: [{ title: "Their experiences", items }],
        cta: { text: "Open their day", url: d.link },
        outro: ["A reminder goes out automatically in 2 days if they haven't booked."],
        signoff: ["— Luxor Rising"],
      }),
    });
  } catch (err) {
    console.error("Resend saved-day owner note failed:", err instanceof Error ? err.message : err);
  }
}

export async function sendSavedDayReminder(d: SavedDayEmail): Promise<void> {
  const { subject, html, text } = buildSavedDayReminder(d);
  await send({ to: d.email, subject, text, html });
}
