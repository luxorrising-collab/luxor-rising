# Úvodná prompta pre nový Claude účet

Toto je **prvá správa**, ktorú vložíš novému Claudovi v priečinku projektu.
Skopíruj celý blok nižšie (medzi čiarami) a pošli ho.

---

```text
Ahoj. Preberáš existujúci, ŽIVÝ projekt Luxor Rising — prémiový concierge-travel
web pre Luxor a Hurghadu (Egypt), beží na https://luxorrising.com. Ja som majiteľ.
Infraštruktúra (GitHub luxorrising-collab/luxor-rising, Vercel, doména) zostáva
NEZMENENÁ — nič nezakladáme ani neprepájame.

NAJPRV si prečítaj tieto súbory a potvrď mi, že si ich prečítal:
1. docs/handover/02-PROJECT-SEED.md   — kompletný kontext projektu
2. AGENTS.md a CLAUDE.md               — pravidlá projektu
3. docs/handover/00-MAJITELSKY-NAVOD-SK.md — prehľad z môjho (majiteľského) pohľadu

KRITICKÉ PRAVIDLÁ, dodržuj ich od začiatku:
- Toto NIE je bežný Next.js — je to Next.js 16 (App Router, Turbopack). Pred písaním
  Next-špecifického kódu si pozri príslušný guide v node_modules/next/dist/docs/.
  cookies()/headers() sú async.
- CSS Modules: používaj className={styles.x}, nikdy className="x".
- Terminológia: vo viditeľnom texte je „concierge" (nie „consigliere"). Interné
  identifikátory (consigliere* Keystatic kľúče, sekčné ID "consigliere",
  ConsigliereSection komponent + CSS trieda) NEPREMENÚVAJ — rozbil by si CMS.
- Ceny experiencov musia platiť: basePrice < valueStackTotal, riadky value-stacku sa
  sčítajú presne na total, a v metaDescription „From €X" = basePrice.
- Tajné kľúče NIKDY necommituj (.env* je v gite ignorované).
- Commity a pushe rob LEN keď o to poprosím. Pred push spusti
  `git fetch origin && git rebase origin/main`, potom push. Commit message ukonči
  riadkom: Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
- Zmeny v UI over v prehliadači (dev server) skôr, než povieš „hotovo".

KEĎ si prečítaš seed, urob toto:
Zhrň mi (a) čo projekt je, (b) aktuálny stav, (c) otvorené úlohy (časť 7 seedu),
a potom počkaj na moje pokyny. Zatiaľ nič nemeň.
```

---

## Poznámka

Táto prompta je „poistka na začiatok" — obsahuje najdôležitejšie pravidlá, aby nový
Claude neurobil chybu skôr, než si prečíta seed. Všetok detail je v
`02-PROJECT-SEED.md`. Prompta funguje v každom jazyku; kľudne ju uprav podľa seba.
