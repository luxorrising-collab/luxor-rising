import GiftsSection from "./GiftsSection";
import { getGiftContent } from "@/lib/gift-content";
import type { GiftKey } from "@/lib/gifts";

// Server wrapper: reads the editable gift copy from Keystatic and hands it to
// the (client) GiftsSection, so the names, subtitles, meanings and tags are all
// CMS-managed while the interactive showcase stays a client component.
export default async function GiftsSectionServer({
  featured,
  designHref,
}: {
  featured?: GiftKey;
  designHref?: string;
}) {
  const content = await getGiftContent();
  return <GiftsSection featured={featured} designHref={designHref} content={content} />;
}
