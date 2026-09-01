# Luxor Rising — Product prices

Current guest-facing prices for every product, and how the pricing system works.
_Last updated: 2026-09-01._

> These are the **sell prices only**. The internal cost model (Ahmed's rates, the
> cost cascade, margins) lives in the private workbook at
> `docs/handover/_local-private/Luxor_Rising_Modely_naklady_ROAS.xlsx`, which is
> gitignored and never committed — the GitHub repo is public.

---

## How pricing flows

1. **The chart** (private Excel) is the source. Each product has a cost-cascade
   `FINAL` (the cost floor) and a **`Sell price (prestige)`** column — clean,
   round numbers, tiered by desirability, in the premium band (no charm/`.99`
   pricing, in keeping with the brand voice).
2. **`scripts/refresh-prices.mjs`** reads the chart's sell price (falling back to
   the cost-cascade floor) and writes the **`Product prices`** Keystatic
   singleton (`content/pricing/index.yaml`).
3. **`lib/pricing.ts`** makes that singleton the single source of truth: every
   price anchor on the site resolves through it — experience pages, the
   experiences listing, checkout, JSON-LD, SEO title/description, and the
   Design-your-day breakdown.

**To change a price:** edit the chart's `Sell price` column → run
`node scripts/refresh-prices.mjs` → re-run the copy sweep for the FAQ/body
figures (prices written into prose don't update automatically). Or edit the
`Product prices` singleton in Keystatic directly — it wins at runtime.

**"Design your day"** (the Concierge Day) is priced from `content/pricing-rules`
(`dayRate`), managed by the same cascade logic as everything else, and surfaced
in the singleton for one-place visibility.

**Estimates:** in the Design-your-day breakdown, lines that aren't a standalone
active product — the Egyptologist, generic transfers, the photo add-on — are
flagged **"(estimate)"** next to the price.

## Group & multi-day scaling

Each **extra guest** adds a fixed supplement to the base (the party shares the
fixed logistics, so the per-person rate falls as guests are added). The
supplement is derived per product from which cost lines scale:

- **Guide (Ahmed):** +20% per extra guest · **Meal & water:** base covers Ahmed
  + one guest, +50% per extra guest · **Per-person entries** (temples, balloon
  seats): × guests.
- **Flat (don't scale):** Egyptologist, the car/transfer, whole-boat or
  whole-group activities (felucca, yacht, desert table), tips.

Applied in Keystatic as `groupSupplement`: **Design-your-day = +€155 / guest /
day** (`content/pricing-rules`), and a per-experience value on each product
(e.g. Valley of the Kings +€100, a balloon seat +€200, a whole-boat felucca
+€35). **Extra days** multiply the daily price, with the volume discount in
`pricing-rules` (2 days −5.56%, 3 −11.11%, 4 −12.22%). The full guest×day grids
live in the private chart's **"DYD price logic"** and **"Single exp — guests"**
sheets.

---

## Price list
<!-- Generated from content/pricing/index.yaml — do not hand-edit; run scripts/refresh-prices.mjs -->

### Concierge day

| Product | Price |
|---|--:|
| Design your day (Concierge Day) | €800 |

### Temples & tombs

| Product | Price |
|---|--:|
| Medinet Habu, Before Anyone Else | €375 |
| The Valley of the Kings, Tombs Chosen for You | €390 |
| Karnak in the Quiet Hour | €380 |
| Luxor Temple at Golden Hour | €375 |
| Hatshepsut & the Cliffs of Deir el-Bahari | €375 |
| Inside Tutankhamun's Tomb (VIP) | €430 |
| Nefertari — Finest Painted Tomb on Earth | €350 |
| Dendera & Abydos, the Drive Worth Taking | €525 |
| Luxor by Night — Temples Illuminated | €370 |
| The Ramesseum & the Valley of the Queens | €375 |
| Deir el-Medina — Tomb-Builders' Village | €375 |
| Deir el-Shelwit — Hidden Temple of Isis | €375 |
| The Colossi of Memnon, on the Way | €350 |

### Nile & river

| Product | Price |
|---|--:|
| Sunrise Hot Air Balloon (per person) | €400 |
| Private VIP Balloon — basket for two (per person) | €850 |
| Balloon & Valley of the Kings (per person) | €550 |
| A Private Felucca at Golden Hour | €350 |
| Dinner on the Nile, Just Your Table | €370 |
| Banana Island by Felucca, with Lunch | €375 |
| Sailing lesson on the Nile | €350 |

### Desert & wild

| Product | Price |
|---|--:|
| Private 4x4 Sunset Safari & Bedouin Dinner | €425 |
| The Private Desert Table (luxury picnic) | €625 |
| Stargazing in the Dunes (per person) | €400 |
| Camel & a Bedouin Breakfast | €375 |
| Reality Hunting (local day) | €475 |

### Hurghada — sea

| Product | Price |
|---|--:|
| Private Speedboat & Snorkelling (group) | €750 |
| Private Motor Yacht, Full Day (group) | €1,950 |

### Transfers

| Product | Price |
|---|--:|
| Hurghada -> Luxor Private Transfer | €675 |
| Full-Day Private Driver (disposal) | €450 |
| Hurghada Airport Transfer | €250 |

### Add-ons & services

| Product | Price |
|---|--:|
| Photoshoot — photographer + OWN camera & editing | €575 |
