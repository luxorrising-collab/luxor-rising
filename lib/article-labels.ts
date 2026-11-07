// Human-readable labels for the `articles` collection's select fields,
// shared between /insiders-guide and the article pages.

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  "temples-tombs": "Temples & tombs",
  "planning-timing": "Planning & timing",
  "life-in-luxor": "Life in Luxor",
  "myths-mistakes": "Myths & mistakes",
};

export type ArticleAuthor = {
  name: string;
  bio: string;
  /** Shown after the name in the byline, e.g. "Founder". */
  role?: string;
  /** One short line for the byline under the headline (the bio goes in the author box). */
  tagline?: string;
  /** A square portrait (the face centred) for the byline and author box. */
  image?: string;
  /** The author's page on this site, and public profiles (structured data). */
  url?: string;
  sameAs?: string[];
};

export const ARTICLE_AUTHORS: Record<string, ArticleAuthor> = {
  "Luxor Rising": {
    name: "Luxor Rising",
    bio: "Written on the ground in Luxor by our concierge team, and fact-checked by a licensed Egyptologist before we publish.",
  },
  Marian: {
    name: "Marian of Luxor Rising",
    role: "Founder · Author",
    tagline: "Shapes private days in Luxor, and writes about its temples.",
    image: "/images/about/founder-avatar.jpg",
    url: "/about",
    sameAs: ["https://www.linkedin.com/in/marian-dufala-mok/"],
    bio: "Founder of Luxor Rising. Marian shapes private days in Luxor, and writes about what its temples meant to the people who built them, and how to visit them now.",
  },
  ahmed: {
    name: "Ahmed",
    bio: "Our consigliere in Luxor. Born on the west bank, twenty minutes from the Valley gate.",
  },
  "dr-nour": {
    name: "Dr. Nour",
    bio: "Licensed Egyptologist, on staff to fact-check every article we publish.",
  },
};
