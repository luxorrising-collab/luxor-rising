// Article tags ("hashtags"): typed freely in Keystatic as plain words
// ("Medinet Habu"), shown as #MedinetHabu, and grouped on
// /insiders-guide/tag/<slug> pages so readers can browse every article on a theme.

export type ArticleTag = { label: string; hashtag: string; slug: string; href: string };

/** "Isis & Osiris" → "isis-and-osiris" */
export function tagSlug(raw: string): string {
  return raw
    .replace(/^#/, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "Isis & Osiris" → "#IsisAndOsiris" */
export function tagHashtag(raw: string): string {
  const words = raw
    .replace(/^#/, "")
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  return "#" + words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

export function toTag(raw: string): ArticleTag {
  const label = raw.replace(/^#/, "").trim();
  const slug = tagSlug(label);
  return { label, hashtag: tagHashtag(label), slug, href: `/insiders-guide/tag/${slug}` };
}

/** De-duplicated tags of one article, in the order written. */
export function articleTags(raw: readonly (string | null | undefined)[] | null | undefined): ArticleTag[] {
  const seen = new Set<string>();
  const out: ArticleTag[] = [];
  for (const r of raw ?? []) {
    if (!r || !r.trim()) continue;
    const t = toTag(r);
    if (!t.slug || seen.has(t.slug)) continue;
    seen.add(t.slug);
    out.push(t);
  }
  return out;
}
