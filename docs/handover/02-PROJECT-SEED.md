# Luxor Rising — Project Seed (context for a new Claude account)

> **New Claude, read this first.** It is the full working context for this
> project, distilled from the build history. Combined with `AGENTS.md` /
> `CLAUDE.md` (loaded automatically), it gives you everything the previous
> account knew. Written in English to match the codebase; the human-facing
> setup guide is in Slovak (`01-NAVOD-PRENOS-SK.md`).

---

## 1. What this is

**Luxor Rising** — a premium **concierge travel** website for **Luxor & Hurghada,
Egypt**. Private, unhurried, certified-guided experiences, arranged end to end.
Positioning: ~€650–750 / person; the ideal client is a **leader / visionary**
seeking a reset. Brand voice: calm, confident, editorial, never salesy.

- **Repo:** `github.com/luxorrising-collab/luxor-rising` (branch `main`)
- **Live:** `https://luxorrising.com` (apex primary; `www` redirects to apex)
- **Host:** Vercel (auto-deploys on push to `main`)
- **Operating entity:** Evam trade, s.r.o., IČO 48 093 572, DIČ 2120062648,
  Doležalova 3424/15C, 821 04 Bratislava – mestská časť Ružinov, Slovak Republic.
  Contact: `luxor.rising.com@gmail.com`. Governing law: Slovak Republic.

---

## 2. Tech stack & golden rules

- **Next.js 16.2.10**, App Router, **Turbopack**. React 19. TypeScript. Node 24+.
- **Keystatic 0.5.x** CMS (content in `/content`, schema in `keystatic.config.ts`).
- Styling: **CSS Modules** + global tokens in `app/globals.css`.
- Scripts: `npm run dev` / `build` / `start` / `lint`.

**Golden rules (from `AGENTS.md`):**
- **This is NOT the Next.js you know.** Read the relevant guide in
  `node_modules/next/dist/docs/` before writing Next-specific code. Heed
  deprecations.
- Next 16: `cookies()` / `headers()` are **async** (await them).
- **CSS Modules gotcha:** use `className={styles.x}` — a plain `className="x"`
  will NOT match a hashed `.x` in a `*.module.css`.
- `next/font/google` is fetched at build; a transient "Error while requesting
  resource" on build = just retry.

---

## 3. Layout of the codebase

- `app/(site)/` — the public site (route group). Pages: `page.tsx` (home),
  `concierge-day/`, `experiences/` + `experiences/[slug]/`, `medinet-habu/`
  (hand-built flagship), `private-guide/`, `private-tours/`, `private-villas/`,
  `reviews/`, `insiders-guide/`, `about/`, `legal/{terms,privacy,cancellation,cookies}`,
  `booking-confirmed/`, `[destination]/`, `not-found.tsx`, `error.tsx`.
- `app/api/checkout/route.ts` — Stripe Checkout session creation.
- `app/api/keystatic/[[...params]]/route.ts` — Keystatic API route.
- `app/sitemap.ts`, `app/robots.ts` — SEO (hardcode `https://luxorrising.com`).
- `components/` — shared UI. Key ones: `DayConfigurator` (the concierge/
  Design-your-day builder), `ExperienceConfigurator` + `ExperienceTemplate`
  (single-experience pages), `ConsigliereSection`, `Footer`, `Nav`, `mainNav.ts`
  (nav + `FOOTER_COLUMNS`), consent components, `EnquiryForm`.
- `lib/` — `keystatic-reader.ts`, `analytics.ts`, `consent.ts`, `meta-capi.ts`,
  `reviews(-server).ts`, `partners(-server).ts`.
- `content/` — all CMS content (experiences, singletons, reviews, partners…).
- `keystatic.config.ts` — the entire CMS schema.

---

## 4. Keystatic (content) — how it works

- `reader` (`lib/keystatic-reader.ts`) reads content **from disk** at build/request.
- **Storage mode auto-switches** (`keystatic.config.ts`): if env
  `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is set → GitHub mode
  (`repo: luxorrising-collab/luxor-rising`); otherwise → **local mode**.
  **Currently local mode.** Consequence: `/keystatic` on the LIVE site cannot
  save (serverless FS is read-only). Editing happens locally (then commit/push),
  or set up GitHub storage mode for live editing (needs a GitHub App + env vars).
- `outputFileTracingIncludes` ships `content/**` with serverless functions.

**Experiences** = collection `content/experiences/*/index.mdoc`. 27 products.
Each has: `title` (poetic), `name` (place), `hook`, `heroEyebrow`, `heroImage`,
`glanceLead`, `bestTime`, `glanceIncludes`, `takenCareOf[]`, `highlights[]`,
`momentQuote`, `gallery[]`, book copy, `valueStackRows[]` + `valueStackTotal`,
`faq[]`, `category` (temple/sky/desert/signature), `duration`, `groupSize`,
`maxGuests` (booking cap, default 4; yacht=8), SEO meta, `basePrice`,
`priceType`, `pricePerPerson`, `priceNote`, `groupSupplement[]`, `bookingType`,
`isActive`, + markdown body.

**Pricing invariants (keep true for every product):**
- `basePrice` = solo total. Live total = `basePrice + Σ groupSupplement` for the
  party; per-person = total ÷ guests.
- `basePrice < valueStackTotal` (must show a saving vs "book separately").
- The visible `valueStackRows` must **sum to** `valueStackTotal`.
- `metaDescription`'s "From €X" = `basePrice`; `pricePerPerson` "from €Y" ≈ the
  4-guest per-person rate.

---

## 5. Systems that are built (and how they're wired)

- **Consent (self-built, no CMP)** — `lib/consent.ts`, `components/consent/*`.
  Google Consent Mode v2 defaults denied before GTM; Meta Pixel hard-gated on
  marketing opt-in. First-party `lr_consent` cookie (180d, versioned).
- **Tracking IDs live in Keystatic**, NOT env — `tracking` singleton
  (`content/tracking/index.yaml`): `enabled` master switch + `gtmId` / `ga4Id` /
  `metaPixelId`. **Ships disabled** (banner only shows when enabled AND ≥1 ID).
  Rule: GA4 via `ga4Id` OR a GA4 tag in GTM, not both.
- **Ecommerce data layer** — `lib/analytics.ts` feeds dataLayer + gtag + fbq.
  `begin_checkout` on Reserve; `purchase` on `/booking-confirmed` using the
  **real Stripe-charged amount** fetched server-side (success_url carries
  `{CHECKOUT_SESSION_ID}`; fires only when `payment_status=paid`). De-duped.
- **Meta CAPI** — `lib/meta-capi.ts`. Server-side Purchase from
  `/booking-confirmed`, Stripe-verified amount + SHA-256 email + fbp/fbc/IP/UA,
  shares the Pixel's `event_id` for dedup, gated on marketing consent. Pixel ID
  from Keystatic; token = env `META_CAPI_ACCESS_TOKEN` (+ optional
  `META_CAPI_TEST_EVENT_CODE`). **No-ops until the token is set.**
- **Stripe Checkout** — both configurators POST to `/api/checkout` → Stripe →
  `/booking-confirmed`. Needs env `STRIPE_SECRET_KEY` (redirect-to-hosted;
  no publishable key needed). Deposit-first (50%) or pay-in-full.
- **Reviews** — Keystatic `reviews` collection + `/reviews`. Structured data
  (AggregateRating/Review) emitted **only for `verified` reviews**. Separate
  `partners` collection = hashtag-filterable partner track record. Decision:
  **do NOT auto-scrape Google/Meta** (consent walls + ToS); manual entry only,
  or the official Google Places API (opt-in, not built).
- **Legal** — `/legal/{terms,privacy,cancellation,cookies}`. Company-protective,
  minimal commitments. Carries the Evam trade s.r.o. block, Slovak law, Slovak
  DPA, 14-day refund window, 10-year record retention.
- **SEO** — `sitemap.ts`, `robots.ts`, branded 404 + error pages, JSON-LD on
  product pages.
- **Design-your-day** (`DayConfigurator`) — day builder (1–4 days), journey
  cards, signature bonuses (**Deir el-Shelwit** appears at day 3, **Sailing
  lesson** added at day 4), progress counts derived from the live plan, a
  **Hurghada ⇄ Luxor round-trip** upsell (price fed from Keystatic).
- **About** (`/about`) — visitor-as-hero retreat page for leaders/visionaries.
  Live. Gated behind a `PUBLISHED` const in the page.

**Terminology:** the brand standardised on **"concierge"** (not "consigliere")
across all *visible* text — research-backed (search volume + comprehension +
sales). Internal identifiers are deliberately preserved and must NOT be renamed:
the `consigliere*` Keystatic field keys, the `"consigliere"` **section-ID** used
by the concierge-day page-ordering system (schema enum ↔ `content/
concierge-day-page` ↔ page), and the `ConsigliereSection` component + CSS class.

---

## 6. Environment variables

Only 4 are read by code (see `03-CONNECTIONS-AND-ENV.md` for details). Names only:
- `STRIPE_SECRET_KEY` — **required for live checkout.**
- `META_CAPI_ACCESS_TOKEN`, `META_CAPI_TEST_EVENT_CODE` — Meta server-side tracking.
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` — set only to switch Keystatic to GitHub
  storage mode (then also needs `KEYSTATIC_GITHUB_CLIENT_ID/SECRET`, `KEYSTATIC_SECRET`).

They belong in `.env.local` (local dev) **and** in Vercel → Environment Variables
(production). `.env*` is gitignored — never commit secrets.

---

## 7. Current state & open TODOs (as of handover)

- 🔴 **Enquiry form is a prototype** — `components/EnquiryForm.tsx` shows "Request
  received" but has **no backend**; submissions are lost. Wire it to an email
  service (Resend recommended, or Postmark) via an API route. Highest priority.
- 🔴 **Stripe:** confirm `STRIPE_SECRET_KEY` is in Vercel; switch to **live** keys;
  do one real end-to-end test booking.
- 🟡 **Tracking:** GTM/GA4/Meta IDs are in Keystatic, shipped disabled — fill +
  enable when ready; set `META_CAPI_ACCESS_TOKEN` in Vercel.
- 🟡 **Keystatic editing:** local mode now. For non-technical live editing, set up
  GitHub storage mode.
- 🟡 **Google Search Console:** verify `luxorrising.com`, submit `/sitemap.xml`.
- 🟢 **Legal:** add the Commercial Register insert (OR OS Bratislava I, oddiel Sro,
  vložka …) when available.
- 🟢 **About page:** has no founder name/photo by design — add if wanted.
- Note: `metadataBase`/sitemap/robots hardcode `https://luxorrising.com` (correct
  for the current domain).

---

## 8. Working conventions the previous account followed

- Commit + push only when the user asks. Branch off `main` isn't required here —
  the user works directly on `main` and pushes. Before pushing:
  `git fetch origin && git rebase origin/main` (Keystatic edits can land on remote
  concurrently), then `git push`.
- End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Verify UI changes in the browser preview before claiming done; the screenshot
  pane can be flaky — trust DOM measurements (`innerText`, getBoundingClientRect).
- Windows machine; Git Bash + PowerShell available. Line endings: repo is LF,
  Windows checkout shows CRLF warnings — harmless.
- The user ships fast and expects things pushed live when they say so.
