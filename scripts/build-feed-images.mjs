// Square (1200×1200) photos for the Google Ads dynamic remarketing feed.
//
// Dynamic display banners crop the feed image to whatever slot they fill, and
// Google recommends a square photo with no text on it, so each product's hero is
// cut to a square here (sharp's "attention" strategy keeps the subject in frame).
//
//   public/images/feed/<slug>.jpg            from the product's hero image
//   public/images/feed/design-your-day.jpg   the Concierge Day row (Karnak hero)
//
// Run after adding or changing a product's hero photo:
//   node scripts/build-feed-images.mjs          (only missing or outdated)
//   node scripts/build-feed-images.mjs --force  (rebuild every image)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
const require = createRequire(path.join(root, "package.json"));
const sharp = require("sharp");
const yaml = require("js-yaml");

const force = process.argv.includes("--force");
const SIZE = 1200;
const outDir = path.join(root, "public", "images", "feed");
fs.mkdirSync(outDir, { recursive: true });

const jobs = [["design-your-day", "/images/experiences/karnak-at-dawn/heroImage.jpg"]];
for (const slug of fs.readdirSync(path.join(root, "content", "experiences"))) {
  const file = path.join(root, "content", "experiences", slug, "index.mdoc");
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const fm = yaml.load(text.split("\n---\n")[0].replace(/^---\n/, "")) ?? {};
  if (fm.isActive && fm.heroImage) jobs.push([slug, fm.heroImage]);
}

let made = 0;
let kept = 0;
for (const [slug, hero] of jobs) {
  const src = path.join(root, "public", hero);
  const out = path.join(outDir, `${slug}.jpg`);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${slug}: missing ${hero}`);
    continue;
  }
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
    kept++;
    continue;
  }
  await sharp(src)
    .rotate()
    .resize(SIZE, SIZE, { fit: "cover", position: sharp.strategy.attention })
    .toColourspace("srgb")
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  made++;
}
console.log(`Feed images: ${made} made, ${kept} up to date → public/images/feed/`);
