// Portrait (3:4) crops of each experience's photos for the phone cards.
//
// On a phone the experience cards are tall 3:4 frames, and most hero photos are
// landscape, so object-fit: cover had the browser fetch a photo ~1.8x the screen
// width just to show its middle. These crops are cut to the card's own shape
// (sharp's "attention" strategy keeps the subject in frame), so a phone downloads
// exactly what it shows: one for the card, and one for the gentle crossfade.
//
//   public/images/cards/<slug>.jpg     from the product's hero image
//   public/images/cards/<slug>-2.jpg   from the product's first gallery photo
//
// Run after adding or changing a product's hero or first gallery photo:
//   node scripts/build-card-crops.mjs          (only missing or outdated crops)
//   node scripts/build-card-crops.mjs --force  (rebuild every crop)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const require = createRequire(path.join(root, "package.json"));
const sharp = require("sharp");
const yaml = require("js-yaml");

const force = process.argv.includes("--force");
const W = 1080;
const H = 1440;
const outDir = path.join(root, "public", "images", "cards");
fs.mkdirSync(outDir, { recursive: true });

const field = (fm, key) => (fm[key] ?? null);
let made = 0;
let kept = 0;
for (const slug of fs.readdirSync(path.join(root, "content", "experiences"))) {
  const file = path.join(root, "content", "experiences", slug, "index.mdoc");
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fm = yaml.load(text.split("\n---\n")[0].replace(/^---\n/, "")) ?? {};
  if (!field(fm, "isActive")) continue;
  const sources = [
    [field(fm, "heroImage"), `${slug}.jpg`],
    [(fm.gallery ?? []).find((g) => g?.image)?.image ?? null, `${slug}-2.jpg`],
  ];
  for (const [src, name] of sources) {
    if (!src) continue;
    const input = path.join(root, "public", decodeURIComponent(src));
    if (!fs.existsSync(input)) continue;
    const out = path.join(outDir, name);
    if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(input).mtimeMs) {
      kept++;
      continue;
    }
    await sharp(input)
      .rotate()
      .resize(W, H, { fit: "cover", position: sharp.strategy.attention, withoutEnlargement: false })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toFile(out);
    made++;
  }
}
console.log(`Card crops: ${made} written, ${kept} up to date → public/images/cards/`);
