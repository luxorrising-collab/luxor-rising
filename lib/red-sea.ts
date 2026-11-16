// The paused standalone Red Sea boat products keep their own single-experience
// checkout. Every other experience, the coast ones included, funnels into
// Design Your Day. (This replaces a keyword match on "hurghada"/"red sea" in
// the slug or hero eyebrow, which caught the new coast experiences by mistake.)
export const RED_SEA_STANDALONE = new Set(["private-yacht-red-sea", "red-sea-boat-snorkelling"]);
export const isRedSeaStandalone = (slug: string): boolean => RED_SEA_STANDALONE.has(slug);
