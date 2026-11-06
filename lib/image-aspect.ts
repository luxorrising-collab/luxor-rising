import "server-only";
import fs from "node:fs";
import path from "node:path";

// Width ÷ height of an image in public/, read from the file header (JPEG with
// its EXIF orientation, or PNG) — no image library. Lets a card ask next/image
// for the width the photo is actually drawn at when object-fit: cover crops it
// into a tall frame, instead of the card's own width (which leaves wide photos
// soft on phones). Undefined when the file can't be read.

const cache = new Map<string, number | undefined>();

function jpegAspect(b: Buffer): number | undefined {
  if (b[0] !== 0xff || b[1] !== 0xd8) return undefined;
  let orientation = 1;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return undefined;
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    // APP1 "Exif": read the orientation tag (0x0112) from IFD0
    if (marker === 0xe1 && b.toString("latin1", i + 4, i + 8) === "Exif") {
      const t = i + 10;
      const le = b.toString("latin1", t, t + 2) === "II";
      const u16 = (o: number) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
      const u32 = (o: number) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
      const ifd = t + u32(t + 4);
      const n = u16(ifd);
      for (let k = 0; k < n; k++) {
        const e = ifd + 2 + k * 12;
        if (u16(e) === 0x0112) orientation = u16(e + 8);
      }
    }
    // SOFn (not DHT 0xc4, JPG 0xc8, DAC 0xcc): frame height & width
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      const h = b.readUInt16BE(i + 5);
      const w = b.readUInt16BE(i + 7);
      return orientation >= 5 && orientation <= 8 ? h / w : w / h;
    }
    i += 2 + len;
  }
  return undefined;
}

export function imageAspect(src: string): number | undefined {
  if (!src.startsWith("/")) return undefined;
  if (cache.has(src)) return cache.get(src);
  let a: number | undefined;
  try {
    const b = fs.readFileSync(path.join(process.cwd(), "public", decodeURIComponent(src)));
    if (b.toString("latin1", 1, 4) === "PNG") a = b.readUInt32BE(16) / b.readUInt32BE(20);
    else a = jpegAspect(b);
  } catch {
    a = undefined;
  }
  cache.set(src, a);
  return a;
}

/** Cards with their photo's aspect attached (see ExperienceGrid's sizes). */
export const withAspect = <T extends { src: string }>(cards: T[]): (T & { aspect?: number })[] =>
  cards.map((c) => ({ ...c, aspect: imageAspect(c.src) }));

const blurCache = new Map<string, string | undefined>();

/** A ~16px-wide blurred WebP of an image in public/, as a data URL — shown at
 *  once while the real photo loads, so a card never appears as an empty box.
 *  Undefined when the file can't be read (or sharp isn't available). */
export async function imageBlur(src: string): Promise<string | undefined> {
  if (!src.startsWith("/")) return undefined;
  if (blurCache.has(src)) return blurCache.get(src);
  let out: string | undefined;
  try {
    const sharp = (await import("sharp")).default;
    const buf = await sharp(path.join(process.cwd(), "public", decodeURIComponent(src)))
      .rotate()
      .resize(16)
      .webp({ quality: 50 })
      .toBuffer();
    out = `data:image/webp;base64,${buf.toString("base64")}`;
  } catch {
    out = undefined;
  }
  blurCache.set(src, out);
  return out;
}

/** Cards with their photo's aspect and a blurred preview attached. */
export async function withPreviews<T extends { src: string }>(
  cards: T[],
): Promise<(T & { aspect?: number; blur?: string })[]> {
  return Promise.all(cards.map(async (c) => ({ ...c, aspect: imageAspect(c.src), blur: await imageBlur(c.src) })));
}
