import Image from "next/image";
import { imageAspect } from "@/lib/image-aspect";

/**
 * A photo inside an article body (Markdoc's image node), served through
 * next/image: sized from the file itself so the page never jumps, lazily
 * loaded, and in modern formats at the width the column actually needs.
 */
export default function ArticleImage({ src, alt, title }: { src: string; alt?: string; title?: string }) {
  if (!src) return null;
  const aspect = (src.startsWith("/") && imageAspect(src)) || 1.5;
  const width = 1440;
  const height = Math.round(width / aspect);
  return (
    <Image
      src={src}
      alt={alt ?? ""}
      title={title}
      width={width}
      height={height}
      loading="lazy"
      sizes="(max-width: 760px) 100vw, 720px"
    />
  );
}
