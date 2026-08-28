import { collection, config, fields, singleton } from "@keystatic/core";

const ARTICLE_CATEGORIES = [
  { label: "Temples & tombs", value: "temples-tombs" },
  { label: "Planning & timing", value: "planning-timing" },
  { label: "Life in Luxor", value: "life-in-luxor" },
  { label: "Myths & mistakes", value: "myths-mistakes" },
] as const;

const EXPERIENCE_CATEGORIES = [
  { label: "Temples & tombs", value: "temple" },
  { label: "Sky & river", value: "sky" },
  { label: "Desert & wild", value: "desert" },
  { label: "Signature", value: "signature" },
] as const;

const AUTHORS = [
  { label: "Ahmed", value: "ahmed" },
  { label: "Dr. Nour", value: "dr-nour" },
] as const;

const REVIEW_SOURCES = [
  { label: "Google", value: "google" },
  { label: "Meta / Facebook", value: "facebook" },
  { label: "TripAdvisor", value: "tripadvisor" },
  { label: "Airbnb", value: "airbnb" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Direct / Email", value: "direct" },
] as const;

// Where a review can be pinned as the featured social proof.
const REVIEW_PLACEMENTS = [
  { label: "Home — hero", value: "home-hero" },
  { label: "Concierge Day — social proof", value: "concierge" },
  { label: "Experiences", value: "experiences" },
  { label: "Reviews page — featured", value: "reviews-hero" },
] as const;

// Partner categories double as the #hashtag each is grouped/filtered under.
const PARTNER_CATEGORIES = [
  { label: "Concierge & tours", value: "concierge" },
  { label: "Transfers & drivers", value: "transfers" },
  { label: "Guiding & Egyptology", value: "guiding" },
  { label: "Nile & boats", value: "nile" },
  { label: "Desert & Bedouin", value: "desert" },
  { label: "Ballooning", value: "balloon" },
  { label: "Red Sea & diving", value: "redsea" },
  { label: "Stays & hospitality", value: "stays" },
] as const;

// Shared SEO fields, reused by every content collection.
const seoFields = {
  metaTitle: fields.text({
    label: "Meta title (SEO)",
    description: "Overrides the page <title>. Leave blank to fall back to the main title.",
  }),
  metaDescription: fields.text({
    label: "Meta description (SEO)",
    multiline: true,
    description: "Shown in search results and social previews (~155 characters).",
  }),
};

export default config({
  // This config is bundled for both the server AND the browser (the admin
  // page is a Client Component that imports it directly), so the switch has
  // to be a NEXT_PUBLIC_ var — anything else resolves to `undefined` in the
  // browser bundle even when it's correctly set on the server, which made
  // the admin UI think it was in local mode while the server used GitHub
  // mode. Reusing the app-slug var means no extra env var is needed.
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
    ? { kind: "github", repo: "luxorrising-collab/luxor-rising" }
    : { kind: "local" },

  collections: {
    reviews: collection({
      label: "Reviews & social proof",
      slugField: "author",
      path: "content/reviews/*/",
      columns: ["author", "source", "rating", "verified"],
      schema: {
        author: fields.slug({
          name: {
            label: "Author name",
            description: 'The reviewer, e.g. "Lena & Tomáš" — used as the entry name.',
          },
        }),
        location: fields.text({
          label: "Location",
          description: 'e.g. "Vienna, Austria" — shown under the name.',
        }),
        quote: fields.text({ label: "Review", multiline: true }),
        rating: fields.number({
          label: "Rating out of 5",
          validation: { min: 1, max: 5 },
          defaultValue: 5,
        }),
        date: fields.date({
          label: "Date",
          description: "When they travelled / left the review.",
        }),
        source: fields.select({
          label: "Source",
          options: REVIEW_SOURCES,
          defaultValue: "google",
        }),
        sourceUrl: fields.url({
          label: "Link to the original review",
          description:
            "Paste the public Google / Meta / TripAdvisor review (or profile) link. This is what makes it verifiable — the page shows a 'Verified ↗' link straight to the source.",
        }),
        partner: fields.relationship({
          label: "Partner this review is about",
          collection: "partners",
          description:
            "Link the review to the partner it belongs to — it then shows under that partner. Leave empty for a direct Luxor Rising guest review.",
        }),
        verified: fields.checkbox({
          label: "Verified — a real, attributable guest",
          description:
            "Turn ON only for genuine reviews with a working source link. Google star rich-results (structured data) are emitted for verified reviews ONLY — never for samples.",
          defaultValue: false,
        }),
        avatar: fields.image({
          label: "Photo (optional)",
          directory: "public/images/reviews",
          publicPath: "/images/reviews/",
        }),
        featured: fields.checkbox({
          label: "Featured",
          description: "Pin this review to the top of the sections chosen below.",
          defaultValue: false,
        }),
        placements: fields.multiselect({
          label: "Feature in these sections",
          options: REVIEW_PLACEMENTS,
        }),
        order: fields.number({
          label: "Sort order",
          description: "Lower shows first.",
          defaultValue: 0,
        }),
      },
    }),

    partners: collection({
      label: "Review sources & partners",
      slugField: "name",
      path: "content/partners/*/",
      columns: ["name", "channel", "rating", "reviewCount"],
      schema: {
        name: fields.slug({
          name: {
            label: "Name",
            description:
              'The business/person, e.g. "Royal Transfer Egypt" — or "Luxor Rising" for your own channel.',
          },
        }),
        channel: fields.select({
          label: "Channel",
          description:
            "Is this one of OUR own review channels (e.g. our Google Business Profile), or a third-party partner? Direct channels appear in the top section; partners in the track-record section.",
          options: [
            { label: "Our own channel (direct)", value: "direct" },
            { label: "Third-party partner", value: "partner" },
          ],
          defaultValue: "partner",
        }),
        category: fields.select({
          label: "Category (becomes the #hashtag)",
          options: PARTNER_CATEGORIES,
          defaultValue: "transfers",
        }),
        role: fields.text({
          label: "What they do",
          description: 'Short, e.g. "Airport & intercity transfers".',
        }),
        explanation: fields.text({
          label: "Why they're on the team",
          multiline: true,
          description: "A sentence or two on their track record and why we trust them.",
        }),
        source: fields.select({
          label: "Review source",
          options: REVIEW_SOURCES,
          defaultValue: "google",
        }),
        profileUrl: fields.url({
          label: "Link to their public reviews",
          description:
            "Paste their Google / TripAdvisor / Facebook reviews (or profile) link — shown as a live 'See all reviews ↗' link.",
        }),
        rating: fields.number({
          label: "Rating snapshot (out of 5)",
          validation: { min: 0, max: 5 },
          defaultValue: 0,
          description:
            "Read it off their profile and type it here. Leave 0 to show just the link, no stars.",
        }),
        reviewCount: fields.number({
          label: "Number of reviews (snapshot)",
          defaultValue: 0,
        }),
        snapshotDate: fields.date({
          label: "Snapshot date",
          description: 'The "as of" date for the rating/count above.',
        }),
        verified: fields.checkbox({
          label: "Verified partner",
          description: "Working profile link + numbers checked against it.",
          defaultValue: false,
        }),
        tags: fields.text({
          label: "Extra hashtags (optional)",
          description: 'Space-separated, e.g. "#airport #english-speaking".',
        }),
        logo: fields.image({
          label: "Logo / photo (optional)",
          directory: "public/images/partners",
          publicPath: "/images/partners/",
        }),
        order: fields.number({ label: "Sort order", defaultValue: 0 }),
      },
    }),

    articles: collection({
      label: "Articles (Insider's Guide)",
      slugField: "title",
      path: "content/articles/*/",
      format: { contentField: "content" },
      columns: ["title", "category", "author", "publishedAt"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          description: "Short summary shown on article cards and in previews.",
        }),
        heroImage: fields.image({
          label: "Hero image",
          directory: "public/images/articles",
          publicPath: "/images/articles/",
        }),
        category: fields.select({
          label: "Category",
          options: ARTICLE_CATEGORIES,
          defaultValue: ARTICLE_CATEGORIES[0].value,
        }),
        author: fields.select({
          label: "Author",
          options: AUTHORS,
          defaultValue: AUTHORS[0].value,
        }),
        readingTime: fields.text({
          label: "Reading time",
          description: 'Free text, e.g. "9 min read"',
        }),
        publishedAt: fields.date({ label: "Published at" }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/articles",
              publicPath: "/images/articles/",
            },
          },
        }),
        ...seoFields,
      },
    }),

    experiences: collection({
      label: "Experiences",
      slugField: "title",
      path: "content/experiences/*/",
      format: { contentField: "content" },
      columns: ["title", "category", "basePrice", "isActive"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        name: fields.text({
          label: "Card name",
          description:
            'Short, recognisable name shown on cards, in menus and search — the name people actually look for, e.g. "Karnak at Dawn", "Luxor Temple at Dusk". The poetic Title stays as the page headline. If left blank, the Title is used.',
        }),
        hook: fields.text({
          label: "Hook",
          multiline: true,
          description: "Short, punchy line shown on experience cards and as the hero subtitle.",
        }),

        // Hero
        heroEyebrow: fields.text({
          label: "Hero eyebrow",
          description: 'e.g. "A single experience · Medinet Habu · Luxor West Bank"',
        }),
        heroImage: fields.image({
          label: "Hero image",
          directory: "public/images/experiences",
          publicPath: "/images/experiences/",
        }),

        // At a glance
        glanceLead: fields.text({
          label: "At-a-glance summary",
          multiline: true,
          description: "One or two sentences under the hero, above the fact strip.",
        }),
        bestTime: fields.text({
          label: "Best time",
          description: 'e.g. "Dawn, before the crowds"',
        }),
        glanceIncludes: fields.text({
          label: "How the day feels (paragraph under the facts)",
          multiline: true,
          description:
            "Describe the shape of the experience, not a list of inputs — the list below does that job.",
        }),
        takenCareOf: fields.array(
          fields.object({
            title: fields.text({ label: "Item" }),
            note: fields.text({ label: "Why it matters (optional)", multiline: true }),
          }),
          {
            label: "What we take care of",
            itemLabel: (p) => p.fields.title.value || "Item",
            description:
              "Lead with what nobody else can offer (the hour, the guards, the consigliere). Keep commodities like water last.",
          }
        ),

        // Body
        highlights: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Highlights (\"What you'll see\")",
            itemLabel: (props) => props.fields.title.value || "Highlight",
          }
        ),
        content: fields.markdoc({
          label: "Content",
          description: "The flowing story/narrative sections of the page.",
          options: {
            image: {
              directory: "public/images/experiences",
              publicPath: "/images/experiences/",
            },
          },
        }),
        momentQuote: fields.text({
          label: "Full-bleed moment quote",
          multiline: true,
          description: "Optional short, dramatic line shown over the hero image between sections. Leave blank to skip.",
        }),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/experiences",
              publicPath: "/images/experiences/",
            }),
            caption: fields.text({ label: "Caption" }),
          }),
          {
            label: "Gallery",
            itemLabel: (props) => props.fields.caption.value || "Image",
          }
        ),

        // Book section copy (the interactive configurator itself is not CMS-driven)
        bookEyebrow: fields.text({ label: "Booking section eyebrow" }),
        bookTitle: fields.text({ label: "Booking section title" }),
        bookLead: fields.text({ label: "Booking section lead", multiline: true }),
        bookNote: fields.text({
          label: "Booking section note",
          description: 'e.g. "Each dawn we host only one private group — slots are limited."',
        }),

        // Value stack
        valueStackRows: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            price: fields.text({ label: "Price", description: 'e.g. "€90"' }),
          }),
          {
            label: "Value stack rows",
            itemLabel: (props) => props.fields.label.value || "Row",
          }
        ),
        valueStackTotal: fields.text({
          label: "Value stack total",
          description: 'e.g. "€220+"',
        }),

        faq: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.text({ label: "Answer", multiline: true }),
          }),
          {
            label: "FAQ",
            itemLabel: (props) => props.fields.question.value || "Question",
          }
        ),

        category: fields.select({
          label: "Category",
          options: EXPERIENCE_CATEGORIES,
          defaultValue: EXPERIENCE_CATEGORIES[0].value,
        }),
        duration: fields.text({
          label: "Duration",
          description: 'e.g. "Half day", "~2 hours, private"',
        }),
        groupSize: fields.text({
          label: "Group size",
          description: 'e.g. "1–8 guests"',
        }),
        badge: fields.text({
          label: "Badge",
          description: 'Optional label shown on the card, e.g. "Most booked"',
        }),
        scarcityNote: fields.text({
          label: "Scarcity note",
          description: 'Optional urgency line, e.g. "Books out 5–7 days ahead in winter"',
        }),

        ...seoFields,

        // Pricing
        basePrice: fields.number({
          label: "Base price (EUR)",
          description:
            "0 is allowed when Price type is \"Included\" (e.g. a signature bundled with any day).",
          validation: { min: 0, max: 5000 },
        }),
        priceType: fields.select({
          label: "Price type",
          options: [
            { label: "Per day", value: "perDay" },
            { label: "Per person", value: "perPerson" },
            { label: "Per group", value: "perGroup" },
            { label: "Included (bundled, no extra charge)", value: "included" },
          ],
          defaultValue: "perDay",
        }),
        pricePerPerson: fields.text({
          label: "Per-person price note",
          description: 'Optional, e.g. "per person from €78"',
        }),
        priceNote: fields.text({
          label: "Price note",
          description: 'Free text shown next to the price, e.g. "/ day, private"',
        }),
        maxGuests: fields.integer({
          label: "Max guests (booking)",
          description:
            "Largest party the booking selector allows. 4 for almost everything; raise it only for whole-boat charters (e.g. the yacht at 8).",
          defaultValue: 4,
          validation: { min: 1, max: 12 },
        }),
        groupSupplement: fields.array(
          fields.object({
            minGuests: fields.integer({
              label: "Guest number",
              description: "e.g. 2 means \"the 2nd guest\"",
              validation: { min: 2 },
            }),
            extraPerGuest: fields.number({
              label: "Extra (EUR) for this guest",
              validation: { min: 0 },
            }),
          }),
          {
            label: "Group surcharge (incremental, per guest)",
            description: "How much extra this experience costs as each additional guest joins.",
            itemLabel: (props) =>
              props.fields.minGuests.value
                ? `Guest ${props.fields.minGuests.value} — +€${props.fields.extraPerGuest.value ?? 0}`
                : "Tier",
          }
        ),
        bookingType: fields.select({
          label: "Booking type",
          options: [
            { label: "Instant reservation", value: "instant" },
            { label: "Enquiry only", value: "enquiry" },
          ],
          defaultValue: "instant",
        }),
        isActive: fields.checkbox({
          label: "Active (bookable)",
          description: "Turn off to hide this experience from sale without deleting it.",
          defaultValue: true,
        }),
      },
    }),

    destinations: collection({
      label: "Destination hubs (Luxor, Hurghada)",
      slugField: "title",
      path: "content/destinations/*/",
      format: { contentField: "content" },
      columns: ["title", "isActive"],
      schema: {
        title: fields.slug({
          name: { label: "Title (used in the URL, e.g. \"Luxor\" → /luxor)" },
        }),
        navLabel: fields.text({ label: "Menu label", description: 'Short label for the Destinations dropdown, e.g. "Luxor"' }),
        navBlurb: fields.text({ label: "Menu blurb", description: 'One line under the label in the dropdown' }),

        // Hero (full-bleed image)
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroSubtitle: fields.text({ label: "Hero subtitle", multiline: true }),
        heroImage: fields.image({ label: "Hero image", directory: "public/images/destinations", publicPath: "/images/destinations/" }),
        heroTrustLine: fields.text({ label: "Hero trust line" }),
        primaryCtaLabel: fields.text({ label: "Primary CTA label" }),
        primaryCtaHref: fields.text({ label: "Primary CTA link", description: "e.g. /concierge-day?start=luxor" }),
        secondaryCtaLabel: fields.text({ label: "Secondary CTA label" }),
        secondaryCtaHref: fields.text({ label: "Secondary CTA link (anchor or path)" }),

        // Trust strip
        trustItems: fields.array(fields.text({ label: "Item" }), { label: "Trust strip items" }),

        // Optional feature block (e.g. Hurghada's Luxor day trip)
        showFeature: fields.checkbox({ label: "Show feature block", defaultValue: false }),
        featureEyebrow: fields.text({ label: "Feature eyebrow" }),
        featureTitle: fields.text({ label: "Feature title" }),
        featureBody: fields.text({ label: "Feature body", multiline: true }),
        featureImage: fields.image({ label: "Feature image", directory: "public/images/destinations", publicPath: "/images/destinations/" }),
        featurePriceValue: fields.text({ label: "Feature price", description: 'e.g. "€640"' }),
        featurePriceNote: fields.text({ label: "Feature price note" }),
        featureCtaLabel: fields.text({ label: "Feature CTA label" }),
        featureCtaHref: fields.text({ label: "Feature CTA link" }),

        // Experience cards
        experiencesEyebrow: fields.text({ label: "Experiences eyebrow" }),
        experiencesTitle: fields.text({ label: "Experiences title" }),
        experiencesLead: fields.text({ label: "Experiences lead", multiline: true }),
        experiences: fields.array(
          fields.object({
            image: fields.image({ label: "Image", directory: "public/images/destinations", publicPath: "/images/destinations/" }),
            meta: fields.text({ label: "Meta (small label above title)" }),
            title: fields.text({ label: "Title" }),
            hook: fields.text({ label: "Hook", multiline: true }),
            badge: fields.text({ label: "Badge (optional)" }),
            priceLabel: fields.text({ label: "Price label", description: 'e.g. "From"' }),
            priceValue: fields.text({ label: "Price value", description: 'e.g. "€640"' }),
            priceNote: fields.text({ label: "Price note" }),
            ctaLabel: fields.text({ label: "CTA label" }),
            href: fields.text({ label: "Link" }),
          }),
          { label: "Experience cards", itemLabel: (p) => p.fields.title.value || "Card" }
        ),

        // "Things to do" guide layer (SEO H2 sections)
        guideEyebrow: fields.text({ label: "Guide eyebrow" }),
        guideTitle: fields.text({ label: "Guide title" }),
        guideIntro: fields.text({ label: "Guide intro", multiline: true }),
        guideSections: fields.array(
          fields.object({
            heading: fields.text({ label: "Heading (H3)" }),
            body: fields.text({ label: "Body", multiline: true }),
          }),
          { label: "Guide sections (H2/H3 for SEO)", itemLabel: (p) => p.fields.heading.value || "Section" }
        ),
        guideLinkLabel: fields.text({ label: "Guide link label" }),
        guideLinkHref: fields.text({ label: "Guide link href" }),

        // Flowing narrative (optional)
        content: fields.markdoc({
          label: "Extra content (optional)",
          description: "Optional flowing content section.",
          options: { image: { directory: "public/images/destinations", publicPath: "/images/destinations/" } },
        }),

        // FAQ
        faqTitle: fields.text({ label: "FAQ title" }),
        faq: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.text({ label: "Answer", multiline: true }),
          }),
          { label: "FAQ", itemLabel: (p) => p.fields.question.value || "Question" }
        ),

        // Closer
        closerEyebrow: fields.text({ label: "Closer eyebrow" }),
        closerTitle: fields.text({ label: "Closer title" }),
        closerText: fields.text({ label: "Closer text", multiline: true }),
        closerCtaLabel: fields.text({ label: "Closer CTA label" }),
        closerCtaHref: fields.text({ label: "Closer CTA link" }),
        closerSecondaryLabel: fields.text({ label: "Closer secondary CTA label" }),
        closerSecondaryHref: fields.text({ label: "Closer secondary CTA link" }),

        ...seoFields,
        navOrder: fields.integer({ label: "Menu order", defaultValue: 0, description: "Lower shows first in the Destinations dropdown." }),
        isActive: fields.checkbox({ label: "Active (visible)", defaultValue: true }),
      },
    }),
  },

  singletons: {
    pricingRules: singleton({
      label: "Pricing rules",
      path: "content/pricing-rules/",
      schema: {
        dayRate: fields.number({
          label: "Base day rate (EUR)",
          description: "The starting private-day rate before discounts or supplements.",
          validation: { min: 0 },
        }),
        volumeDiscount: fields.array(
          fields.object({
            minDays: fields.integer({
              label: "From this many days",
              validation: { min: 1 },
            }),
            discountPercent: fields.number({
              label: "Discount (%)",
              validation: { min: 0, max: 100 },
            }),
          }),
          {
            label: "Volume discount (by number of days)",
            itemLabel: (props) =>
              props.fields.minDays.value
                ? `${props.fields.minDays.value}+ days — ${props.fields.discountPercent.value ?? 0}%`
                : "Tier",
          }
        ),
        groupSupplement: fields.array(
          fields.object({
            minGuests: fields.integer({
              label: "From this many guests",
              validation: { min: 1 },
            }),
            extraPerDay: fields.number({
              label: "Extra (EUR) per guest, per day",
              validation: { min: 0 },
            }),
          }),
          {
            label: "Group supplement (by group size)",
            itemLabel: (props) =>
              props.fields.minGuests.value
                ? `${props.fields.minGuests.value}+ guests — +€${props.fields.extraPerDay.value ?? 0}/day`
                : "Tier",
          }
        ),
        depositPercent: fields.number({
          label: "Deposit (%)",
          description: "Percentage of the total price guests may pay as a deposit to hold a date.",
          validation: { min: 0, max: 100 },
        }),
      },
    }),

    productPageSettings: singleton({
      label: "Product page settings (global template)",
      path: "content/product-page-settings/",
      schema: {
        howItWorksEyebrow: fields.text({ label: "\"How it works\" eyebrow" }),
        howItWorksTitle: fields.text({ label: "\"How it works\" title" }),
        howItWorksSteps: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Steps",
            itemLabel: (props) => props.fields.title.value || "Step",
          }
        ),
        disclosureText: fields.text({
          label: "Disclosure text",
          multiline: true,
          description: "Legal/positioning line shown under \"How it works\" on every product page.",
        }),
        // "What a consigliere actually is" — shown on every product page, just
        // before the booking section, where the value question peaks.
        consigliereEyebrow: fields.text({ label: "Consigliere eyebrow" }),
        consigliereTitle: fields.text({ label: "Consigliere title" }),
        consigliereLead: fields.text({ label: "Consigliere lead", multiline: true }),
        consigliereImage: fields.image({
          label: "Consigliere portrait",
          description: "Photo shown next to the consigliere section.",
          directory: "public/images/hosts",
          publicPath: "/images/hosts/",
        }),
        consiglierePoints: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "What a consigliere does", itemLabel: (p) => p.fields.title.value || "Point" }
        ),

        guaranteeEyebrow: fields.text({ label: "Guarantee eyebrow" }),
        guaranteeTitle: fields.text({ label: "Guarantee title" }),
        guaranteeItems: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Guarantee items",
            itemLabel: (props) => props.fields.title.value || "Item",
          }
        ),
        testimonialsEyebrow: fields.text({ label: "Testimonials eyebrow" }),
        testimonialsTitle: fields.text({ label: "Testimonials title" }),
        reviewsVerified: fields.checkbox({
          label: "Reviews are real & verified",
          description:
            "Leave OFF while reviews below are samples: they still show on the page (with a 'sample' note) but emit NO star-rating structured data to Google. Turn ON only once every review is a real, attributable guest — then Google rich-result stars are generated.",
          defaultValue: false,
        }),
        testimonials: fields.array(
          fields.object({
            quote: fields.text({ label: "Quote", multiline: true }),
            author: fields.text({ label: "Author", description: 'e.g. "Lena & Tomáš, Vienna"' }),
            rating: fields.number({
              label: "Rating out of 5",
              validation: { min: 1, max: 5 },
              defaultValue: 5,
            }),
            date: fields.text({
              label: "Date (YYYY-MM-DD)",
              description: "When they travelled — used for review rich results in Google.",
            }),
          }),
          {
            label: "Guest reviews",
            itemLabel: (props) => props.fields.author.value || "Review",
            description:
              "Star ratings Google shows come from here. Keep 'Reviews are real & verified' OFF until every entry is a genuine, attributable guest — sample copy is fine to preview, it just won't emit structured data.",
          }
        ),
      },
    }),

    conciergeDayPage: singleton({
      label: "Concierge Day page",
      path: "content/concierge-day-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title" }),
        heroSubtitle: fields.text({ label: "Hero subtitle", multiline: true }),
        heroTrustLine: fields.text({ label: "Hero trust line" }),
        startingPrice: fields.number({
          label: "Starting price (EUR)",
          validation: { min: 0, max: 5000 },
        }),
        priceNote: fields.text({
          label: "Price note",
          description: 'e.g. "/ day · ≤4 guests, private"',
        }),
        heroImages: fields.array(
          fields.image({
            label: "Image",
            directory: "public/images/concierge-day",
            publicPath: "/images/concierge-day/",
          }),
          { label: "Hero background images (rotating)" }
        ),

        // Page sections — drag to reorder, and untick "Visible" to hide one.
        // Sections render in this order; the hero and footer are fixed.
        sections: fields.array(
          fields.object({
            section: fields.select({
              label: "Section",
              options: [
                { label: "Why most people leave disappointed", value: "contrast" },
                { label: "Why we can actually do this (mechanism)", value: "mechanism" },
                { label: "The feel of the day — image + phases (dayFeel)", value: "dayFeel" },
                { label: "The shape of the day — phases only (dayShape)", value: "dayShape" },
                { label: "What your day feels like — band only (dream)", value: "dream" },
                { label: "Who runs your day (consigliere)", value: "consigliere" },
                { label: "How it works (standalone)", value: "howItWorks" },
                { label: "What your day can hold", value: "experiences" },
                { label: "Design your day (builder)", value: "builder" },
                { label: "Value comparison", value: "valueStack" },
                { label: "Guest reviews", value: "socialProof" },
                { label: "The Luxor Rising promise", value: "guarantee" },
                { label: "Scarcity", value: "scarcity" },
                { label: "Gallery", value: "gallery" },
                { label: "If you're standing at a threshold (deeper)", value: "threshold" },
                { label: "Final call to action", value: "finalCta" },
                { label: "Longer journeys (The Return)", value: "multiDay" },
                { label: "FAQ", value: "faq" },
              ],
              defaultValue: "contrast",
            }),
            visible: fields.checkbox({ label: "Visible", defaultValue: true }),
          }),
          {
            label: "Page sections (drag to reorder, untick to hide)",
            itemLabel: (p) => {
              const labels: Record<string, string> = {
                contrast: "Why most people leave disappointed",
                mechanism: "Why we can actually do this",
                dayFeel: "The feel of the day (image + phases)",
                dayShape: "The shape of the day (phases only)",
                dream: "What your day feels like (band only)",
                consigliere: "Who runs your day",
                howItWorks: "How it works (standalone)",
                experiences: "What your day can hold",
                builder: "Design your day (builder)",
                valueStack: "Value comparison",
                socialProof: "Guest reviews",
                guarantee: "The Luxor Rising promise",
                scarcity: "Scarcity",
                gallery: "Gallery",
                threshold: "If you're standing at a threshold",
                finalCta: "Final call to action",
                multiDay: "Longer journeys",
                faq: "FAQ",
              };
              const name = labels[p.fields.section.value] || p.fields.section.value;
              return p.fields.visible.value ? name : `${name} — hidden`;
            },
          }
        ),

        contrastEyebrow: fields.text({ label: "Contrast section eyebrow" }),
        contrastTitle: fields.text({ label: "Contrast section title" }),
        contrastLead: fields.text({ label: "Contrast section lead", multiline: true }),
        badWayItems: fields.array(fields.text({ label: "Item" }), {
          label: "\"The usual way\" items",
        }),
        goodWayItems: fields.array(fields.text({ label: "Item" }), {
          label: "\"A Luxor Rising day\" items",
        }),

        // Mechanism — why the premium is real, not a claim.
        mechanismEyebrow: fields.text({ label: "Mechanism eyebrow" }),
        mechanismTitle: fields.text({ label: "Mechanism title" }),
        mechanismText: fields.text({ label: "Mechanism text", multiline: true }),
        mechanismNote: fields.text({ label: "Mechanism fine print", multiline: true }),

        // How the day is arranged around the guest — principles, not a timetable.
        dayShapeEyebrow: fields.text({ label: "Shape-of-day eyebrow" }),
        dayShapeTitle: fields.text({ label: "Shape-of-day title" }),
        dayShapeSteps: fields.array(
          fields.object({
            time: fields.text({
              label: "Principle heading",
              description: 'How we arrange the day, not a clock time — e.g. "We start with you, not a route"',
            }),
            label: fields.text({ label: "Explanation", multiline: true }),
          }),
          { label: "How the day is arranged", itemLabel: (p) => p.fields.time.value || "Principle" }
        ),
        dayShapeNote: fields.text({ label: "Shape-of-day closing line", multiline: true }),

        dreamText: fields.text({
          label: "\"What your day feels like\" text",
          multiline: true,
        }),
        dreamImage: fields.image({
          label: "\"What your day feels like\" band image",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),

        experiences: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/concierge-day",
              publicPath: "/images/concierge-day/",
            }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
            badge: fields.text({ label: "Badge (optional, e.g. Signature bonus ★)" }),
          }),
          {
            label: "\"What your day can hold\" cards",
            itemLabel: (p) => p.fields.title.value || "Experience",
          }
        ),

        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/concierge-day",
              publicPath: "/images/concierge-day/",
            }),
            caption: fields.text({ label: "Caption" }),
          }),
          { label: "Gallery images", itemLabel: (p) => p.fields.caption.value || "Image" }
        ),

        builderJourneyMedinetImage: fields.image({
          label: "Day builder — Medinet journey image",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),
        builderJourneyKarnakImage: fields.image({
          label: "Day builder — Karnak journey image",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),
        builderJourneyBalloonImage: fields.image({
          label: "Day builder — Balloon (Eagle at Dawn) journey image",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),
        builderSunsetNileImage: fields.image({
          label: "Day builder — Nile sunset thumbnail",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),
        builderSunsetPicnicImage: fields.image({
          label: "Day builder — desert picnic thumbnail",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),
        builderSunsetCustomImage: fields.image({
          label: "Day builder — custom sunset thumbnail",
          directory: "public/images/concierge-day",
          publicPath: "/images/concierge-day/",
        }),

        valueStackRows: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            price: fields.text({ label: "Price" }),
          }),
          {
            label: "Value stack rows",
            itemLabel: (props) => props.fields.label.value || "Row",
          }
        ),
        valueStackTotal: fields.text({ label: "Value stack total" }),

        // Second, deeper statement of the dream — deliberately far down the page.
        thresholdEyebrow: fields.text({ label: "Threshold eyebrow" }),
        thresholdTitle: fields.text({ label: "Threshold title" }),
        thresholdText: fields.text({ label: "Threshold text", multiline: true }),

        // Route to the longer journeys, where the deeper language belongs fully.
        multiDayEyebrow: fields.text({ label: "Longer journeys eyebrow" }),
        multiDayTitle: fields.text({ label: "Longer journeys title" }),
        multiDayText: fields.text({ label: "Longer journeys text", multiline: true }),
        multiDayCtaLabel: fields.text({ label: "Longer journeys CTA label" }),
        multiDayCtaHref: fields.text({ label: "Longer journeys CTA link" }),

        scarcityBadge: fields.text({ label: "Scarcity badge" }),
        scarcityTitle: fields.text({ label: "Scarcity title" }),
        scarcityText: fields.text({ label: "Scarcity text", multiline: true }),

        faq: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.text({ label: "Answer", multiline: true }),
          }),
          {
            label: "FAQ",
            itemLabel: (props) => props.fields.question.value || "Question",
          }
        ),

        finalEyebrow: fields.text({ label: "Final CTA eyebrow" }),
        finalTitle: fields.text({ label: "Final CTA title" }),
        finalText: fields.text({ label: "Final CTA text", multiline: true }),
      },
    }),

    homePage: singleton({
      label: "Homepage",
      path: "content/home-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroSubtitle: fields.text({ label: "Hero subtitle", multiline: true }),
        heroImage: fields.image({
          label: "Hero background image",
          directory: "public/images",
          publicPath: "/images/",
        }),
        heroCtaLabel: fields.text({ label: "Hero primary CTA label" }),
        heroCtaHref: fields.text({ label: "Hero primary CTA link" }),
        heroSecondaryCtaLabel: fields.text({ label: "Hero secondary CTA label" }),
        heroSecondaryCtaHref: fields.text({ label: "Hero secondary CTA link" }),
        heroTrustLine: fields.text({ label: "Hero trust line" }),

        trustItems: fields.array(fields.text({ label: "Item" }), {
          label: "Trust strip items",
        }),

        positioningEyebrow: fields.text({ label: "Positioning eyebrow" }),
        positioningTitle: fields.text({ label: "Positioning title", multiline: true }),
        positioningLead: fields.text({ label: "Positioning lead", multiline: true }),
        positioningImage: fields.image({
          label: "Positioning image",
          directory: "public/images",
          publicPath: "/images/",
        }),
        positioningBadge: fields.text({ label: "Positioning image badge" }),
        positioningLinkLabel: fields.text({ label: "Positioning link label" }),
        positioningLinkHref: fields.text({ label: "Positioning link href" }),

        offeringEyebrow: fields.text({ label: "Offering eyebrow" }),
        offeringTitle: fields.text({ label: "Offering title" }),
        offeringLead: fields.text({ label: "Offering lead", multiline: true }),
        offeringCards: fields.array(
          fields.object({
            tag: fields.text({ label: "Tag (optional badge, e.g. \"Start here\")" }),
            image: fields.image({
              label: "Image",
              directory: "public/images",
              publicPath: "/images/",
            }),
            kicker: fields.text({ label: "Kicker" }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
            priceLabel: fields.text({ label: "Price label (optional)", description: 'e.g. "From €450"' }),
            ctaLabel: fields.text({ label: "CTA label" }),
            href: fields.text({ label: "Link", description: "Internal path or #anchor" }),
          }),
          {
            label: "Offering cards",
            itemLabel: (props) => props.fields.title.value || "Card",
          }
        ),

        momentImage: fields.image({
          label: "Moment section image",
          directory: "public/images",
          publicPath: "/images/",
        }),
        momentQuote: fields.text({ label: "Moment quote", multiline: true }),

        galleryEyebrow: fields.text({ label: "Gallery eyebrow" }),
        galleryTitle: fields.text({ label: "Gallery title" }),
        galleryLead: fields.text({ label: "Gallery lead", multiline: true }),
        gallery: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images",
              publicPath: "/images/",
            }),
            caption: fields.text({ label: "Caption" }),
          }),
          {
            label: "Gallery",
            itemLabel: (props) => props.fields.caption.value || "Image",
          }
        ),

        howItWorksEyebrow: fields.text({ label: "\"How it works\" eyebrow" }),
        howItWorksTitle: fields.text({ label: "\"How it works\" title" }),
        howItWorksSteps: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Steps",
            itemLabel: (props) => props.fields.title.value || "Step",
          }
        ),
        disclosureText: fields.text({ label: "Disclosure text", multiline: true }),

        whyEyebrow: fields.text({ label: "\"Why us\" eyebrow" }),
        whyTitle: fields.text({ label: "\"Why us\" title" }),
        whyItems: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon glyph", description: "e.g. ✦ ❖ ◆ ✧" }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Why-us items",
            itemLabel: (props) => props.fields.title.value || "Item",
          }
        ),

        testimonialsEyebrow: fields.text({ label: "Testimonials eyebrow" }),
        testimonialsTitle: fields.text({ label: "Testimonials title" }),
        testimonials: fields.array(
          fields.object({
            quote: fields.text({ label: "Quote", multiline: true }),
            author: fields.text({ label: "Author" }),
          }),
          {
            label: "Testimonials",
            itemLabel: (props) => props.fields.author.value || "Testimonial",
          }
        ),

        villasEyebrow: fields.text({ label: "Villas eyebrow" }),
        villasTitle: fields.text({ label: "Villas title" }),
        villasLead: fields.text({ label: "Villas lead", multiline: true }),
        villasImage: fields.image({
          label: "Villas image",
          directory: "public/images",
          publicPath: "/images/",
        }),
        villasCtaLabel: fields.text({ label: "Villas CTA label" }),
        villasCtaHref: fields.text({ label: "Villas CTA href" }),

        guideEyebrow: fields.text({ label: "Guide teaser eyebrow" }),
        guideTitle: fields.text({ label: "Guide teaser title" }),
        guidePosts: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images",
              publicPath: "/images/",
            }),
            kicker: fields.text({ label: "Kicker" }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
            href: fields.text({ label: "Link" }),
          }),
          {
            label: "Guide teaser posts",
            itemLabel: (props) => props.fields.title.value || "Post",
          }
        ),

        finalEyebrow: fields.text({ label: "Final CTA eyebrow" }),
        finalTitle: fields.text({ label: "Final CTA title" }),
        finalLead: fields.text({ label: "Final CTA lead", multiline: true }),
        finalCtaLabel: fields.text({ label: "Final CTA label" }),
        finalCtaHref: fields.text({ label: "Final CTA href" }),

        stickyBarPrice: fields.text({ label: "Mobile sticky bar price text" }),
        stickyBarMeta: fields.text({ label: "Mobile sticky bar meta text" }),
      },
    }),

    insidersGuidePage: singleton({
      label: "Insider's Guide homepage",
      path: "content/insiders-guide-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitleLine1: fields.text({ label: "Hero title, line 1" }),
        heroTitleEmphasis: fields.text({
          label: "Hero title, emphasised word(s)",
          description: 'Rendered as "over <em>this</em>" on the second line.',
        }),
        heroLead: fields.text({ label: "Hero lead paragraph", multiline: true }),

        authors: fields.array(
          fields.object({
            initial: fields.text({ label: "Avatar initial", description: "Single letter, e.g. \"A\"" }),
            name: fields.text({ label: "Name" }),
            role: fields.text({ label: "Role line" }),
          }),
          {
            label: "Authority strip authors",
            itemLabel: (props) => props.fields.name.value || "Author",
          }
        ),

        newsletterEyebrow: fields.text({ label: "Newsletter eyebrow" }),
        newsletterTitleLine1: fields.text({ label: "Newsletter title, line 1" }),
        newsletterTitleLine2: fields.text({ label: "Newsletter title, line 2" }),
        newsletterLead: fields.text({ label: "Newsletter lead", multiline: true }),
        newsletterFinePrint: fields.text({ label: "Newsletter fine print" }),

        closerEyebrow: fields.text({ label: "Closer eyebrow" }),
        closerTitleLine1: fields.text({ label: "Closer title, line 1" }),
        closerTitleLine2: fields.text({ label: "Closer title, line 2" }),
        closerLead: fields.text({ label: "Closer lead", multiline: true }),
        closerPrimaryCtaLabel: fields.text({ label: "Closer primary CTA label" }),
        closerPrimaryCtaHref: fields.text({ label: "Closer primary CTA href" }),
        closerSecondaryCtaLabel: fields.text({ label: "Closer secondary CTA label" }),
        closerSecondaryCtaHref: fields.text({ label: "Closer secondary CTA href" }),
      },
    }),

    privateGuidePage: singleton({
      label: "Private Guide page",
      path: "content/private-guide-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroLead: fields.text({ label: "Hero lead", multiline: true }),
        heroCtaLabel: fields.text({ label: "Hero CTA label" }),
        heroImage: fields.image({ label: "Hero background image", directory: "public/images/private-guide", publicPath: "/images/private-guide/" }),
        trustItems: fields.array(fields.text({ label: "Item" }), { label: "Trust strip items" }),

        consigliereEyebrow: fields.text({ label: "Consigliere section eyebrow" }),
        consigliereTitle: fields.text({ label: "Consigliere section title" }),
        consigliereLead: fields.text({ label: "Consigliere section lead", multiline: true }),
        consiglierePoints: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "What a consigliere is (points)", itemLabel: (p) => p.fields.title.value || "Point" }
        ),

        momentQuote: fields.text({ label: "Moment band quote", multiline: true }),
        momentImage: fields.image({ label: "Moment band image", directory: "public/images/private-guide", publicPath: "/images/private-guide/" }),

        contrastEyebrow: fields.text({ label: "Contrast eyebrow" }),
        contrastTitle: fields.text({ label: "Contrast title" }),
        contrastLead: fields.text({ label: "Contrast lead", multiline: true }),
        agencyTitle: fields.text({ label: "\"Agency\" column title" }),
        agencyItems: fields.array(fields.text({ label: "Item" }), { label: "\"A tour company\" items" }),
        hostTitle: fields.text({ label: "\"Local host\" column title" }),
        hostItems: fields.array(fields.text({ label: "Item" }), { label: "\"Your own local host\" items" }),

        hostsEyebrow: fields.text({ label: "Hosts eyebrow" }),
        hostsTitle: fields.text({ label: "Hosts title" }),
        hostsLead: fields.text({ label: "Hosts lead", multiline: true }),
        hosts: fields.array(
          fields.object({
            image: fields.image({ label: "Photo", directory: "public/images/hosts", publicPath: "/images/hosts/" }),
            name: fields.text({ label: "Name" }),
            role: fields.text({ label: "Role" }),
            bio: fields.text({ label: "Bio", multiline: true }),
          }),
          { label: "Hosts", itemLabel: (p) => p.fields.name.value || "Host" }
        ),

        formEyebrow: fields.text({ label: "Form eyebrow" }),
        formTitle: fields.text({ label: "Form title" }),
        formLead: fields.text({ label: "Form lead", multiline: true }),
        formNote: fields.text({ label: "Form fine print", multiline: true }),

        closerEyebrow: fields.text({ label: "Closer eyebrow" }),
        closerTitle: fields.text({ label: "Closer title" }),
        closerText: fields.text({ label: "Closer text", multiline: true }),
        ...seoFields,
      },
    }),

    privateToursPage: singleton({
      label: "Private Tours page",
      path: "content/private-tours-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroLead: fields.text({ label: "Hero lead", multiline: true }),
        heroCtaLabel: fields.text({ label: "Hero CTA label" }),
        heroCtaHref: fields.text({ label: "Hero CTA link" }),
        trustItems: fields.array(fields.text({ label: "Item" }), { label: "Trust strip items" }),

        contrastEyebrow: fields.text({ label: "Contrast eyebrow" }),
        contrastTitle: fields.text({ label: "Contrast title" }),
        contrastLead: fields.text({ label: "Contrast lead", multiline: true }),
        badTitle: fields.text({ label: "\"Group tour\" column title" }),
        badItems: fields.array(fields.text({ label: "Item" }), { label: "\"Group tour\" items" }),
        goodTitle: fields.text({ label: "\"Private day\" column title" }),
        goodItems: fields.array(fields.text({ label: "Item" }), { label: "\"Private day\" items" }),

        toursEyebrow: fields.text({ label: "Example tours eyebrow" }),
        toursTitle: fields.text({ label: "Example tours title" }),
        toursLead: fields.text({ label: "Example tours lead", multiline: true }),
        tours: fields.array(
          fields.object({
            image: fields.image({ label: "Image", directory: "public/images/tours", publicPath: "/images/tours/" }),
            eyebrow: fields.text({ label: "Eyebrow" }),
            title: fields.text({ label: "Title" }),
            body: fields.text({ label: "Body", multiline: true }),
            priceValue: fields.text({ label: "Price" }),
            priceNote: fields.text({ label: "Price note" }),
            ctaLabel: fields.text({ label: "CTA label" }),
            ctaHref: fields.text({ label: "CTA link (deep-link into the builder)" }),
          }),
          { label: "Example tours", itemLabel: (p) => p.fields.title.value || "Tour" }
        ),

        valueEyebrow: fields.text({ label: "Value eyebrow" }),
        valueTitle: fields.text({ label: "Value title" }),
        valueRows: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            price: fields.text({ label: "Price" }),
          }),
          { label: "Value stack rows", itemLabel: (p) => p.fields.label.value || "Row" }
        ),
        valueFinalLabel: fields.text({ label: "Value final label" }),
        valueFinalPrice: fields.text({ label: "Value final price" }),

        closerEyebrow: fields.text({ label: "Closer eyebrow" }),
        closerTitle: fields.text({ label: "Closer title" }),
        closerText: fields.text({ label: "Closer text", multiline: true }),
        closerCtaLabel: fields.text({ label: "Closer CTA label" }),
        closerCtaHref: fields.text({ label: "Closer CTA link" }),
        ...seoFields,
      },
    }),

    privateVillasPage: singleton({
      label: "Private Villas page",
      path: "content/private-villas-page/",
      schema: {
        heroEyebrow: fields.text({ label: "Hero eyebrow" }),
        heroTitle: fields.text({ label: "Hero title", multiline: true }),
        heroLead: fields.text({ label: "Hero lead", multiline: true }),
        heroCtaLabel: fields.text({ label: "Hero CTA label" }),
        heroImage: fields.image({ label: "Hero background image", directory: "public/images/villas", publicPath: "/images/villas/" }),
        trustItems: fields.array(fields.text({ label: "Item" }), { label: "Trust strip items" }),

        introEyebrow: fields.text({ label: "Intro eyebrow" }),
        introTitle: fields.text({ label: "Intro title" }),
        introLead: fields.text({ label: "Intro lead", multiline: true }),
        vibePoints: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "How we pick (points)", itemLabel: (p) => p.fields.title.value || "Point" }
        ),

        placesEyebrow: fields.text({ label: "Places eyebrow" }),
        placesTitle: fields.text({ label: "Places title" }),
        places: fields.array(
          fields.object({
            eyebrow: fields.text({ label: "Eyebrow" }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
            image: fields.image({ label: "Image", directory: "public/images/villas", publicPath: "/images/villas/" }),
            points: fields.array(fields.text({ label: "Point" }), { label: "Highlights" }),
          }),
          { label: "Places (Hurghada, Luxor)", itemLabel: (p) => p.fields.title.value || "Place" }
        ),

        featuresEyebrow: fields.text({ label: "Features eyebrow" }),
        featuresTitle: fields.text({ label: "Features title" }),
        features: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon (character)" }),
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "What every place has", itemLabel: (p) => p.fields.title.value || "Feature" }
        ),

        retreatEyebrow: fields.text({ label: "Retreat band eyebrow" }),
        retreatTitle: fields.text({ label: "Retreat band title" }),
        retreatLead: fields.text({ label: "Retreat band lead", multiline: true }),
        retreatImage: fields.image({ label: "Retreat band image", directory: "public/images/villas", publicPath: "/images/villas/" }),

        galleryEyebrow: fields.text({ label: "Gallery eyebrow" }),
        galleryTitle: fields.text({ label: "Gallery title" }),
        gallery: fields.array(
          fields.object({
            image: fields.image({ label: "Image", directory: "public/images/villas", publicPath: "/images/villas/" }),
            caption: fields.text({ label: "Caption" }),
          }),
          { label: "Gallery", itemLabel: (p) => p.fields.caption.value || "Image" }
        ),

        stepsEyebrow: fields.text({ label: "How it works eyebrow" }),
        stepsTitle: fields.text({ label: "How it works title" }),
        steps: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          { label: "Steps", itemLabel: (p) => p.fields.title.value || "Step" }
        ),

        formEyebrow: fields.text({ label: "Form eyebrow" }),
        formTitle: fields.text({ label: "Form title" }),
        formLead: fields.text({ label: "Form lead", multiline: true }),
        formNote: fields.text({ label: "Form fine print", multiline: true }),

        closerEyebrow: fields.text({ label: "Closer eyebrow" }),
        closerTitle: fields.text({ label: "Closer title" }),
        closerText: fields.text({ label: "Closer text", multiline: true }),
        ...seoFields,
      },
    }),

    siteSettings: singleton({
      label: "Site settings",
      path: "content/site-settings/",
      schema: {
        siteName: fields.text({ label: "Site name" }),
        tagline: fields.text({
          label: "Tagline",
          description: 'e.g. "Your private consigliere in Egypt — we arrange, you arrive."',
        }),
        defaultMetaDescription: fields.text({
          label: "Default meta description",
          multiline: true,
        }),
        contactEmail: fields.text({ label: "Contact email" }),
        whatsappNumber: fields.text({
          label: "WhatsApp number",
          description: "Include country code, e.g. +20 100 000 0000",
        }),
        address: fields.text({ label: "Address / service area" }),
        defaultOgImage: fields.image({
          label: "Default social share image",
          directory: "public/images",
          publicPath: "/images/",
        }),
        instagramUrl: fields.url({
          label: "Instagram URL",
          description: "Shown as an icon in the footer. Leave blank to hide it.",
        }),
        facebookUrl: fields.url({
          label: "Facebook URL",
          description: "Shown as an icon in the footer. Leave blank to hide it.",
        }),
        youtubeUrl: fields.url({
          label: "YouTube URL",
          description: "Shown as an icon in the footer. Leave blank to hide it.",
        }),
      },
    }),
    tracking: singleton({
      label: "Tracking & analytics",
      path: "content/tracking/",
      schema: {
        enabled: fields.checkbox({
          label: "Enable analytics & the cookie banner",
          description:
            "Master switch. When off, nothing loads and no banner shows — regardless of the IDs below. Turn on once you've entered at least one ID.",
          defaultValue: false,
        }),
        gtmId: fields.text({
          label: "Google Tag Manager ID",
          description:
            "e.g. GTM-XXXXXXX. Recommended container for GA4 + Meta. Leave blank if unused.",
        }),
        ga4Id: fields.text({
          label: "GA4 Measurement ID",
          description:
            "e.g. G-XXXXXXXXXX. Use this OR a GA4 tag inside GTM — not both, or pageviews double-count.",
        }),
        metaPixelId: fields.text({
          label: "Meta (Facebook) Pixel ID",
          description:
            "e.g. 123456789012345. Only loads after a visitor accepts marketing cookies.",
        }),
      },
    }),
  },
});
