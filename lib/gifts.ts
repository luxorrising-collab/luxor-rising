// Signature-gift data and the rule that maps a product to the gift its guests
// receive. The copy here is the fallback / source of truth; the Keystatic
// `gifts` singleton can override any field (see lib/gift-content.ts).

export type GiftKey = "sistrum" | "sceptre" | "crown";

export type GiftData = {
  key: GiftKey;
  day: number;
  name: string;
  hand: string;
  meaning: string;
  tags: string[];
};

export const GIFT_DEFAULTS: Record<GiftKey, GiftData> = {
  sistrum: {
    key: "sistrum",
    day: 1,
    name: "The Sistrum",
    hand: "A small instrument of metal — held, and gently shaken",
    meaning:
      "Its sound has been used for thousands of years to still the mind and clear a space. A soft, feminine current: receptivity, intuition, the grace of letting life move through you — a way to return to that stillness, anywhere.",
    tags: ["Received energy", "Hand-picked", "Locally made"],
  },
  sceptre: {
    key: "sceptre",
    day: 2,
    name: "The Sceptre",
    hand: "Of stone or metal — the mark of one who holds their own authority",
    meaning:
      "The looped cross it bears is a sign of life that endures — breath, continuity, the part of you that does not end. A strong, masculine current: will, direction, standing in your own power without force.",
    tags: ["Inner authority", "Hand-picked", "Locally made"],
  },
  crown: {
    key: "crown",
    day: 3,
    name: "The Crown",
    hand: "A simple band of metal, chosen with a scarf for the occasion",
    meaning:
      "Light enough to wear, meant to be kept. Worn, or held in stillness or on special occasions, its small weight settles the body and quiets the nervous system, drawing you back to a calm, grounded sense of your own inner authority and presence.",
    tags: ["Mastery & presence", "Hand-picked", "Locally made"],
  },
};

export const GIFT_ORDER: GiftKey[] = ["sistrum", "sceptre", "crown"];

// The rule: on temples & tombs, guests receive the Sceptre; on everything else,
// the Sistrum. (The Crown is the author's-day / full-set gift.)
export function giftForCategory(category?: string | null): GiftKey {
  return category === "temple" ? "sceptre" : "sistrum";
}

// Resolve the gift for a product: an explicit Keystatic choice wins, otherwise
// fall back to the category rule.
export function resolveGift(
  signatureGift?: string | null,
  category?: string | null
): GiftKey {
  if (signatureGift === "sistrum" || signatureGift === "sceptre" || signatureGift === "crown") {
    return signatureGift;
  }
  return giftForCategory(category);
}

// A short, human label for where the gift is received (used in hero + checkout).
export const GIFT_SHORT: Record<GiftKey, string> = {
  sistrum: "Sistrum",
  sceptre: "Sceptre",
  crown: "Crown",
};
