// Premium HTML shell for Luxor Rising transactional emails.
// Table-based with inline styles for broad email-client support (Gmail, Apple
// Mail, Outlook). Brand tokens mirror app/globals.css; serif headings echo
// Cormorant via Georgia (email clients can't rely on web fonts), body in a
// clean sans to echo Inter.

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.luxorrising.com";
// Full brand logo (emblem + wordmark) in its original dark colour on a
// transparent background, centred on the gold header band — the name lives in
// the logo, so it isn't repeated as text.
const LOGO = `${SITE_URL}/images/logo-email.png`;
const HEADER_BG = "#C89B56"; // matches the logo's own gold

// Brand palette (from globals.css)
const CREAM = "#FAF3E4";
const PAPER = "#FDFAF3";
const ESPRESSO = "#3A2818";
const INK = "#2A1C10";
const GOLD = "#C9A063";
const GOLD_SOFT = "#E5D4AA";
const MUTED = "#7A6754";
const LINE = "#E7DcC5";

const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif";

const TAGLINE = "Where reality meets tranquility and every moment becomes cherished.";

export type SummaryRow = { label: string; value: string };
export type Cta = { text: string; url: string };

export type EmailContent = {
  preheader: string; // hidden inbox-preview line
  eyebrow?: string; // small gold label above the heading
  heading: string;
  /** Intro paragraphs (plain text; rendered as styled <p>). */
  intro?: string[];
  /** Optional "order summary" style card. */
  summary?: { title?: string; rows: SummaryRow[]; footnote?: string };
  /** Titled lists after the summary — e.g. "Your choices", "Everything's handled".
   *  check:true renders gold ticks; otherwise gold bullets. */
  sections?: { title: string; items: string[]; check?: boolean }[];
  cta?: Cta;
  /** Paragraphs after the CTA / summary. */
  outro?: string[];
  /** Small print block just above the footer (e.g. cancellation policy). */
  fineprint?: string;
  /** Signoff name lines; defaults to the concierge team. */
  signoff?: string[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const paragraphs = (lines?: string[], color = ESPRESSO) =>
  (lines ?? [])
    .map(
      (t) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:${color};">${esc(
          t,
        )}</p>`,
    )
    .join("");

function summaryBlock(summary?: EmailContent["summary"]): string {
  if (!summary || !summary.rows.length) return "";
  const rows = summary.rows
    .map(
      (r, i) => `
      <tr>
        <td style="padding:12px 0 12px;${
          i > 0 ? `border-top:1px solid ${LINE};` : ""
        }font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};white-space:nowrap;vertical-align:top;">${esc(
          r.label,
        )}</td>
        <td style="padding:12px 0 12px;${
          i > 0 ? `border-top:1px solid ${LINE};` : ""
        }font-family:${SANS};font-size:15px;line-height:1.5;color:${INK};text-align:right;vertical-align:top;">${esc(
          r.value,
        )}</td>
      </tr>`,
    )
    .join("");
  const title = summary.title
    ? `<div style="font-family:${SERIF};font-size:18px;color:${INK};margin:0 0 8px;">${esc(
        summary.title,
      )}</div>`
    : "";
  const footnote = summary.footnote
    ? `<div style="margin-top:12px;font-family:${SANS};font-size:13px;line-height:1.5;color:${MUTED};">${esc(
        summary.footnote,
      )}</div>`
    : "";
  return `
    <div style="margin:8px 0 28px;padding:22px 24px;background:${CREAM};border:1px solid ${LINE};border-radius:4px;">
      ${title}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>
      ${footnote}
    </div>`;
}

function sectionsBlock(sections?: EmailContent["sections"]): string {
  if (!sections || !sections.length) return "";
  return sections
    .map((s) => {
      const items = s.items
        .filter(Boolean)
        .map((it) => {
          const bullet = s.check
            ? `<span style="color:${GOLD};font-weight:700;">&#10003;</span>`
            : `<span style="color:${GOLD};">&bull;</span>`;
          return `<tr>
            <td style="padding:5px 12px 5px 0;font-family:${SANS};font-size:15px;line-height:1.5;vertical-align:top;width:14px;">${bullet}</td>
            <td style="padding:5px 0;font-family:${SANS};font-size:15px;line-height:1.5;color:${ESPRESSO};">${esc(
              it,
            )}</td>
          </tr>`;
        })
        .join("");
      return `<div style="margin:0 0 26px;">
        <div style="font-family:${SERIF};font-size:19px;color:${INK};margin:0 0 10px;">${esc(s.title)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${items}</table>
      </div>`;
    })
    .join("");
}

function ctaBlock(cta?: Cta): string {
  if (!cta) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 28px;">
      <tr>
        <td align="center" bgcolor="${GOLD}" style="border-radius:2px;">
          <a href="${cta.url}" style="display:inline-block;padding:15px 34px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${INK};text-decoration:none;">${esc(
            cta.text,
          )}</a>
        </td>
      </tr>
    </table>`;
}

/** Render a complete, brand-styled HTML email. */
export function renderEmail(c: EmailContent): string {
  const signoff = c.signoff ?? ["Warmly,", "The Luxor Rising concierge team"];
  const signoffHtml = `
    <p style="margin:24px 0 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${ESPRESSO};">
      ${signoff.map((l) => esc(l)).join("<br>")}
    </p>`;
  const eyebrow = c.eyebrow
    ? `<div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${GOLD};margin:0 0 10px;">${esc(
        c.eyebrow,
      )}</div>`
    : "";
  const fineprint = c.fineprint
    ? `<div style="margin:8px 0 0;padding-top:20px;border-top:1px solid ${LINE};font-family:${SANS};font-size:12px;line-height:1.6;color:${MUTED};">${esc(
        c.fineprint,
      )}</div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};-webkit-text-size-adjust:100%;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(
    c.preheader,
  )}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr>
    <td align="center" style="padding:32px 14px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;border-collapse:collapse;">
        <!-- header -->
        <tr>
          <td align="center" style="padding:26px 40px 22px;background:${HEADER_BG};border-radius:4px 4px 0 0;">
            <img src="${LOGO}" width="112" alt="Luxor Rising" style="display:block;border:0;width:112px;max-width:40%;height:auto;margin:0 auto;">
          </td>
        </tr>
        <!-- rule -->
        <tr><td style="height:3px;line-height:3px;font-size:0;background:${ESPRESSO};">&nbsp;</td></tr>
        <!-- body -->
        <tr>
          <td style="padding:40px 40px 36px;background:${PAPER};">
            ${eyebrow}
            <h1 style="margin:0 0 18px;font-family:${SERIF};font-weight:500;font-size:28px;line-height:1.15;color:${INK};">${esc(
              c.heading,
            )}</h1>
            ${paragraphs(c.intro)}
            ${summaryBlock(c.summary)}
            ${sectionsBlock(c.sections)}
            ${ctaBlock(c.cta)}
            ${paragraphs(c.outro)}
            ${signoffHtml}
            ${fineprint}
          </td>
        </tr>
        <!-- footer -->
        <tr>
          <td style="padding:28px 40px 34px;background:${ESPRESSO};border-radius:0 0 4px 4px;text-align:center;">
            <div style="font-family:${SERIF};font-style:italic;font-size:15px;line-height:1.5;color:${GOLD_SOFT};margin:0 0 16px;">${esc(
              TAGLINE,
            )}</div>
            <div style="font-family:${SANS};font-size:12px;line-height:1.7;color:${GOLD};">
              <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">luxorrising.com</a>
              &nbsp;·&nbsp;
              <a href="${SITE_URL}/legal" style="color:${GOLD};text-decoration:none;">Terms &amp; policies</a>
            </div>
            <div style="font-family:${SANS};font-size:11px;line-height:1.6;color:${MUTED};margin-top:12px;">Luxor, Egypt · Private, concierge-led journeys</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
