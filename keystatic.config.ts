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
  storage: {
    kind: "local",
  },

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
        hook: fields.text({
          label: "Hook",
          multiline: true,
          description: "Short, punchy line shown on experience cards.",
        }),
        heroImage: fields.image({
          label: "Hero image",
          directory: "public/images/experiences",
          publicPath: "/images/experiences/",
        }),
        gallery: fields.array(
          fields.image({
            label: "Image",
            directory: "public/images/experiences",
            publicPath: "/images/experiences/",
          }),
          {
            label: "Gallery",
            itemLabel: (props) => props.value?.filename ?? "Image",
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
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: "public/images/experiences",
              publicPath: "/images/experiences/",
            },
          },
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
        priceNote: fields.text({
          label: "Price note",
          description: 'Free text shown next to the price, e.g. "/ day, private"',
        }),
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
            supplementPercent: fields.number({
              label: "Supplement (%)",
              validation: { min: 0, max: 100 },
            }),
          }),
          {
            label: "Group supplement (by group size)",
            itemLabel: (props) =>
              props.fields.minGuests.value
                ? `${props.fields.minGuests.value}+ guests — +${props.fields.supplementPercent.value ?? 0}%`
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
