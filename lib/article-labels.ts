// Human-readable labels for the `articles` collection's select fields,
// shared between /insiders-guide and the article pages.

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  "temples-tombs": "Temples & tombs",
  "planning-timing": "Planning & timing",
  "life-in-luxor": "Life in Luxor",
  "myths-mistakes": "Myths & mistakes",
};

export const ARTICLE_AUTHORS: Record<string, { name: string; bio: string }> = {
  ahmed: {
    name: "Ahmed",
    bio: "Our consigliere in Luxor. Born on the west bank, twenty minutes from the Valley gate.",
  },
  "dr-nour": {
    name: "Dr. Nour",
    bio: "Licensed Egyptologist, on staff to fact-check every article we publish.",
  },
};
