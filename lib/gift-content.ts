import { reader } from "@/lib/keystatic-reader";
import { GIFT_DEFAULTS, GIFT_ORDER, type GiftData, type GiftKey } from "@/lib/gifts";

// Read the editable gift copy from the Keystatic `gifts` singleton, falling back
// to GIFT_DEFAULTS field-by-field so a missing file or blank field is safe.
export async function getGiftContent(): Promise<Record<GiftKey, GiftData>> {
  let data: Record<string, unknown> | null = null;
  try {
    data = (await reader.singletons.gifts.read()) as Record<string, unknown> | null;
  } catch {
    data = null;
  }
  const out = {} as Record<GiftKey, GiftData>;
  for (const key of GIFT_ORDER) {
    const def = GIFT_DEFAULTS[key];
    const d = (data?.[key] ?? {}) as Partial<GiftData>;
    const tags = Array.isArray(d.tags) ? d.tags.filter((t) => t && t.trim()) : [];
    out[key] = {
      key,
      day: def.day,
      name: d.name?.trim() || def.name,
      hand: d.hand?.trim() || def.hand,
      meaning: d.meaning?.trim() || def.meaning,
      tags: tags.length ? tags : def.tags,
    };
  }
  return out;
}
