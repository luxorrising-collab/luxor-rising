# Luxor Rising — Handover / Onboarding

Tento priečinok obsahuje **všetko, čo potrebuješ na prevzatie projektu Luxor Rising
pod nový Claude účet.**

> **Scenár:** ten istý počítač a tá istá infraštruktúra (GitHub, Vercel, doména) —
> **mení sa iba Claude účet.** Žiadne nové účty okrem Clauda sa nezakladajú a na
> napojeniach sa **nič nemení.** Fungujú ďalej tak, ako sú.

## Čo je tu

| Súbor | Pre koho | Čo obsahuje |
|-------|----------|-------------|
| **[00-MAJITELSKY-NAVOD-SK.md](00-MAJITELSKY-NAVOD-SK.md)** | Pre teba (majiteľa) | Ľudský prehľad: čo vlastním, ako sa robia zmeny, účty pod kontrolou, bežné situácie. **Začni tu.** |
| **[01-NAVOD-PRENOS-SK.md](01-NAVOD-PRENOS-SK.md)** | Pre teba (človeka) | Návod krok za krokom: ako prejsť pod nový Claude účet (3 kroky + test). |
| **[PROMPT-PRE-NOVEHO-CLAUDE.md](PROMPT-PRE-NOVEHO-CLAUDE.md)** | Pre teba → Clauda | Hotová **úvodná prompta** na skopírovanie — prvá správa pre nový Claude účet. |
| **[02-PROJECT-SEED.md](02-PROJECT-SEED.md)** | Pre Clauda (nový účet) | Kompletný „seed" — celý kontext projektu. Toto dáš prečítať novému Claudovi, aby vedel o projekte všetko čo doterajší. |
| **[03-CONNECTIONS-AND-ENV.md](03-CONNECTIONS-AND-ENV.md)** | Pre teba | Mapa všetkých napojení (GitHub, Vercel, doména, Stripe, Meta) + zoznam env premenných (bez tajných hodnôt) + ako dať novému účtu plný prístup. |
| **[_local-private/](_local-private/)** | Pre teba | Bezpečné miesto na tvojom disku pre citlivé dokumenty (heslá, kľúče, exporty). **NIE je v gite** — nikdy sa nenahrá na GitHub. |

## Najdôležitejšia vec, ktorú treba pochopiť

**Web nie je viazaný na Claude účet.** Kód žije na GitHube, beží na Verceli,
edituje sa cez Keystatic — a nič z toho nezávisí od toho, ktorým Claude účtom si
prihlásený. Claude (Claude Code) je len nástroj na tvojom počítači, ktorý pracuje
s kódom.

Takže „prevod pod nový Claude účet" v praxi znamená len:
1. Na novom účte prihlásiť Claude Code,
2. mať naklonovaný repozitár a prístup ku GitHub + Vercel účtom,
3. dať novému Claudovi prečítať `02-PROJECT-SEED.md`.

Detaily sú v návode.
