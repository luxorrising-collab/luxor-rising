# _local-private — súkromné dokumenty (NIE je v gite)

Toto je **bezpečné miesto na tvojom disku** pre citlivé veci. Všetko v tomto
priečinku (okrem tohto README) je v `.gitignore` — **nikdy sa nenahrá na GitHub.**

## Sem môžeš dať napríklad:

- kópiu `.env.local` / zoznam kľúčov (Stripe, Meta…), export z password managera
- prihlasovacie poznámky k Verceli / GitHubu / Websupportu / Stripe / Meta
- exporty faktúr, zmluvy, firemné dokumenty (Evam trade, s.r.o.)
- akékoľvek onboarding poznámky pre nový účet

## Pravidlá

1. **Nikdy odtiaľto nekopíruj tajné kľúče do kódu ani do bežných súborov v repe.**
2. Ak si nie si istý, či je niečo tajné — priprav to sem.
3. Skutočné tajné kľúče web potrebuje vo **Verceli** (Environment Variables) a
   pre lokálny vývoj v koreňovom `.env.local` — nie tu. Tento priečinok je archív
   / záloha pre teba, nie zdroj, z ktorého číta web.

> Overenie, že ignore funguje: po pridaní súboru sem spusti `git status` — súbor
> sa **nemá** objaviť medzi zmenami (okrem tohto README).
