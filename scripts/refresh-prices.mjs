// Refresh the Keystatic "Product prices" singleton from the internal pricing
// chart (Excel). Reads ONLY the FINAL PRODUCT PRICE (column U) per product and
// writes content/pricing/index.yaml. The internal cost cascade and margins stay
// in the private workbook and never enter the repo.
//
//   node scripts/refresh-prices.mjs [path-to-xlsx]
//
// Default source: docs/handover/_local-private/Luxor_Rising_Modely_naklady_ROAS.xlsx
// (gitignored — internal). Run it locally whenever the chart changes, then
// commit content/pricing/index.yaml.

import ExcelJS from "exceljs";
import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SHEET = "Products & pricing (INTERNAL)";
const DEFAULT_XLSX = "docs/handover/_local-private/Luxor_Rising_Modely_naklady_ROAS.xlsx";
const OUT = "content/pricing/index.yaml";

// Chart product name (column A) -> live experience slug (content/experiences/*).
// Empty = no matching live experience (transfers, photo add-ons, desert table).
const SLUG = {
  "Medinet Habu, Before Anyone Else": "medinet-habu",
  "The Valley of the Kings, Tombs Chosen for You": "valley-of-the-kings",
  "Karnak in the Quiet Hour": "karnak-at-dawn",
  "Luxor Temple at Golden Hour": "luxor-temple",
  "Hatshepsut & the Cliffs of Deir el-Bahari": "hatshepsut-temple",
  "Inside Tutankhamun's Tomb (VIP)": "tutankhamun-tomb",
  "Nefertari — Finest Painted Tomb on Earth": "nefertari-tomb",
  "Dendera & Abydos, the Drive Worth Taking": "dendera-abydos",
  "Luxor by Night — Temples Illuminated": "luxor-by-night",
  "The Ramesseum & the Valley of the Queens": "ramesseum-valley-of-queens",
  "Deir el-Medina — Tomb-Builders' Village": "deir-el-medina",
  "Deir el-Shelwit — Hidden Temple of Isis": "deir-el-shelwit",
  "The Colossi of Memnon, on the Way": "colossi-of-memnon",
  "Sunrise Hot Air Balloon (per person)": "hot-air-balloon-luxor",
  "Private VIP Balloon — basket for two (per person)": "hot-air-balloon-private-vip",
  "Balloon & Valley of the Kings (per person)": "balloon-valley-of-the-kings",
  "A Private Felucca at Golden Hour": "felucca-sunset-sail",
  "Dinner on the Nile, Just Your Table": "nile-dinner-cruise",
  "Banana Island by Felucca, with Lunch": "banana-island-felucca",
  "Private 4x4 Sunset Safari & Bedouin Dinner": "private-desert-safari",
  "The Private Desert Table (luxury picnic)": "",
  "Stargazing in the Dunes (per person)": "desert-astronomy-night",
  "Camel & a Bedouin Breakfast": "camel-bedouin-breakfast",
  "Reality Hunting (local day)": "reality-hunting",
  "Private Speedboat & Snorkelling (group)": "red-sea-boat-snorkelling",
  "Private Motor Yacht, Full Day (group)": "private-yacht-red-sea",
  "Hurghada -> Luxor Private Transfer": "hurghada-to-luxor-crossing",
  "Full-Day Private Driver (disposal)": "",
  "Hurghada Airport Transfer": "",
  "Photoshoot — photographer + OWN camera & editing": "",
  "Photos on YOUR phone — host shoots on guest smartphone": "",
};

const kebab = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

const num = (cell) => {
  const v = cell?.value;
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && typeof v.result === "number") return v.result;
  return null;
};
const str = (cell) => {
  const v = cell?.value;
  if (v == null) return "";
  if (typeof v === "object") return v.richText ? v.richText.map((t) => t.text).join("") : String(v.result ?? "");
  return String(v);
};

const xlsxPath = process.argv[2] || DEFAULT_XLSX;
if (!existsSync(xlsxPath)) {
  console.error(`✗ Chart not found: ${xlsxPath}\n  Put the internal workbook there, or pass its path as an argument.`);
  process.exit(1);
}

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(xlsxPath);
const ws = wb.getWorksheet(SHEET);
if (!ws) { console.error(`✗ Sheet "${SHEET}" not found in ${xlsxPath}`); process.exit(1); }

const products = [];

// "Design your day" (the Concierge Day builder) is priced from the pricing-rules
// singleton's day rate, not a chart row — surface it in the one-place editor too.
try {
  const rules = await readFile("content/pricing-rules/index.yaml", "utf8");
  const m = rules.match(/dayRate:\s*([\d.]+)/);
  if (m) {
    products.push({
      key: "design-your-day",
      name: "Design your day (Concierge Day)",
      category: "Concierge day",
      finalPrice: Math.round(Number(m[1])),
      experienceSlug: "",
    });
  }
} catch { /* pricing-rules missing — skip */ }

for (let r = 15; r <= 51; r++) {
  const name = str(ws.getCell(`A${r}`)).trim();
  const category = str(ws.getCell(`B${r}`)).trim();
  if (!name || !category) continue; // category-header / blank rows have no B
  const final = num(ws.getCell(`U${r}`));
  if (final == null) continue;
  const slug = SLUG[name] ?? "";
  products.push({
    key: slug || kebab(name),
    name,
    category,
    finalPrice: Math.round(final),
    experienceSlug: slug,
  });
}

const q = (s) => JSON.stringify(s); // valid YAML double-quoted scalar
const today = new Date().toISOString().slice(0, 10);
let yaml = "";
yaml += `lastSyncedFromChart: ${q(today)}\n`;
yaml += `chartSource: ${q(path.basename(xlsxPath))}\n`;
yaml += `products:\n`;
for (const p of products) {
  yaml += `  - key: ${q(p.key)}\n`;
  yaml += `    name: ${q(p.name)}\n`;
  yaml += `    category: ${q(p.category)}\n`;
  yaml += `    finalPrice: ${p.finalPrice}\n`;
  yaml += `    experienceSlug: ${q(p.experienceSlug)}\n`;
}

await writeFile(OUT, yaml, "utf8");
const linked = products.filter((p) => p.experienceSlug).length;
console.log(`✓ Wrote ${OUT} — ${products.length} products (${linked} linked to live experiences), synced ${today}.`);
