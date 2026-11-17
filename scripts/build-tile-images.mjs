// Small, ready-sized photos for the experience tiles and the "Your day" list.
//
// These photos are shown small and many at once, so they are cut to size here
// and served as plain files (next/image `unoptimized`). They never go through
// Vercel's on-demand image service: that keeps them light, cacheable by the
// CDN as-is, and loading even when the image service's monthly quota is used up.
//
//   public/images/cards/tile/<slug>.jpg    480×640, the Design Your Day photo tiles
//   public/images/cards/thumb/<slug>.jpg   168×168, the thumbnails in "Your day"
//
// Source: the 3:4 card crops in public/images/cards/<slug>.jpg (build-card-crops.mjs).
// Run after adding or changing card crops:
//   node scripts/build-tile-images.mjs          (only missing or outdated)
//   node scripts/build-tile-images.mjs --force  (rebuild all)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const require = createRequire(path.join(root, "package.json"));
const sharp = require("sharp");

const force = process.argv.includes("--force");
const cards = path.join(root, "public", "images", "cards");
const outputs = [
  { dir: path.join(cards, "tile"), w: 480, h: 640, q: 76 },
  { dir: path.join(cards, "thumb"), w: 168, h: 168, q: 74 },
];
for (const o of outputs) fs.mkdirSync(o.dir, { recursive: true });

let made = 0;
let kept = 0;
for (const file of fs.readdirSync(cards)) {
  if (!/\.jpg$/.test(file) || /-2\.jpg$/.test(file)) continue;
  const src = path.join(cards, file);
  for (const o of outputs) {
    const out = path.join(o.dir, file);
    if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
      kept++;
      continue;
    }
    await sharp(src)
      .resize(o.w, o.h, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: o.q, mozjpeg: true, progressive: true })
      .toFile(out);
    made++;
  }
}
console.log(`Tile images: ${made} made, ${kept} up to date → public/images/cards/{tile,thumb}/`);
