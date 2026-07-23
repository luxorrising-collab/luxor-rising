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
          label: "\"Includes\" line",
          description: 'e.g. "Includes private transfer · a certified Egyptologist on site..."',
        }),

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
        testimonials: fields.array(
          fields.object({
            quote: fields.text({ label: "Quote", multiline: true }),
            author: fields.text({ label: "Author", description: 'e.g. "Lena & Tomáš, Vienna"' }),
          }),
          {
            label: "Testimonials",
            itemLabel: (props) => props.fields.author.value || "Testimonial",
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

        contrastEyebrow: fields.text({ label: "Contrast section eyebrow" }),
        contrastTitle: fields.text({ label: "Contrast section title" }),
        contrastLead: fields.text({ label: "Contrast section lead", multiline: true }),
        badWayItems: fields.array(fields.text({ label: "Item" }), {
          label: "\"The usual way\" items",
        }),
        goodWayItems: fields.array(fields.text({ label: "Item" }), {
          label: "\"A Luxor Rising day\" items",
        }),

        dreamText: fields.text({
          label: "\"What your day feels like\" text",
          multiline: true,
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
      },
    }),
  },
});
