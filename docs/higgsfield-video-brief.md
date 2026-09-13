# Luxor Rising — social video ads brief (Higgsfield)

Two short vertical (9:16) film-style ads: real Luxor scenes elevated by a surreal
"symbol of tranquility" reveal. Movie-trailer feel; music + voiceover optional.

## Higgsfield setup (done)
- CLI installed + authed (`higgsfield`, workspace "Private", plus plan, ~110 credits).
- **Generation on this plan works ONLY via the MCP server** (`higgsfield-ai`,
  https://mcp.higgsfield.ai/mcp) — CLI `generate create` returns
  `only_mcp_usage_on_trial_is_available`. MCP is registered + connected.
- Companion skills installed under `.agents/skills/` (higgsfield-generate, etc.).

## Costs (confirmed) — the credit-saver
- Image (nano_banana / seedream_v4_5 / flux_kontext): **1 credit** each.
- Video 8s: **veo3_1_lite = 8**, kling2_6 = 10, seedance_2_0_mini = 12.5.
- Golden rule: design the LOOK as **1-credit still key-frames** first; iterate cheap;
  only animate APPROVED frames to video. Use real Luxor photos as base (image-to-video)
  so we don't pay to recreate the location. Always `generate cost` before `create`.

## Creative note (agreed)
- Concept B icon: use a **radiant ancient-Egyptian golden goddess of tranquility**
  (Isis-like, sun-disc halo, serene, eyes closed) — NOT an explicit Virgin Mary
  (religiously sensitive in a pharaonic temple + off-brand).
- Lion: **majestic golden GLOWING lion** (guardian, warm light) — not pink demon eyes.

## CONCEPT A — "The Guardian" (~16–18s, 9:16)
Arc: tension → threat → surreal reveal → tranquility → brand.
1. Tension (real POV, 3s): first-person walking a dim dusty Luxor back-street at dusk, handheld, warm tungsten, film grain, anamorphic.
2. Threat (real POV, 3s): a pack of stray dogs ahead blocking the lane, barking, backlit silhouettes, tense.
3. REVEAL ⭐ (key-frame→video, 4s): reverse angle — a colossal GOLDEN GLOWING LION towers behind the viewer, serene, warm light pouring from its mane; the dogs look up at IT and fall silent; glow floods the alley; slow push-in.
4. Temples (key-frame→video, 3s): the glowing lion moves through a hypostyle hall of carved columns at dawn, god-rays across hieroglyphs, slow dolly.
5. Tranquility (key-frame→video, 3s): the lion stands on a red dune under stars, calm, glow fading into sunrise.
6. Brand (2s): espresso-black, gold Luxor Rising crown crest, tagline "Where reality meets tranquility."

## CONCEPT B — "The Presence" (~14–16s, 9:16)
1. Enter (real POV, 3s): first-person walking into a dark temple corridor, light shafts, painted ceiling, slow push, reverent.
2. Deeper (real POV, 3s): deeper into the gloom, hieroglyph walls, a single golden shaft ahead, dust motes.
3. REVEAL ⭐ (key-frame→video, 4s): in the sanctuary darkness a radiant GOLDEN GODDESS materialises — serene, eyes closed, sun-disc halo of golden rays (Isis-like), softly glowing, dust in her light.
4. Grace (key-frame→video, 3s): her golden light spreads along the carved walls, illuminating the gods on the columns, god-rays.
5. Payoff (real/animated, 2s): pull back through the doorway into a soft Luxor dawn, balloons rising.
6. Brand (2s): crest + tagline.

## Budget plan (110 credits)
- Key-frame stills: ~6 × 1 = 6.
- Hero videos: ~4 × 8 (veo3_1_lite) = 32 per concept → both ≈ 80. Comfortable.
- Real "walking POV" shots: use owner's own video if available = 0 credits.

## MCP workflow (after restart, tools = mcp__higgsfield-ai__*)
1. `generate cost` (free) to confirm price.
2. Generate 1-credit key-frame image (nano_banana/flux_kontext), aspect 9:16; iterate.
3. Animate approved key-frame → video (veo3_1_lite, --image keyframe).
4. Poll/wait, download, assemble in CapCut with music + end-card tagline.

First demo to run: Concept A hero key-frame — "majestic colossal lion on red desert
dunes at night under stars near Luxor, soft warm golden inner glow, serene guardian,
distant palms, cinematic film still, anamorphic, film grain, 9:16" (nano_banana, 1 credit).
