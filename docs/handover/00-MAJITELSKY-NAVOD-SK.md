# Návod pre mňa — majiteľa Luxor Rising

Jednoduchý prehľad v ľudskej reči: **čo vlastním, kde sa čo mení, čo robiť v bežných
situáciách a ako prejsť na nový Claude účet.** Nemusíš byť technický.

---

## 1. Čo vlastne mám (a kde to žije)

Web sa skladá z 5 vecí. Všetky patria mne / firme **Evam trade, s.r.o.**:

| Vec | Kde to je | Čo to robí |
|-----|-----------|------------|
| **Doména** | Websupport | Adresa `luxorrising.com` |
| **Kód webu** | GitHub (`luxorrising-collab/luxor-rising`) | Samotný web |
| **Beh webu (hosting)** | Vercel | Web je online + automaticky sa aktualizuje |
| **Obsah** | Keystatic (v kóde) | Texty, ceny, obrázky, recenzie |
| **Platby / tracking** | Stripe, Meta, Google | Rezervácie a marketing |

**Claude** nie je na tomto zozname — je to len nástroj, ktorým sa web upravuje.
Nič z hora od Clauda nezávisí.

---

## 2. Ako sa robia zmeny na webe

Sú dva druhy zmien:

- **Obsah** (text, cena, obrázok, recenzia) → dá sa cez **Keystatic**
  (`/keystatic`) alebo poviem Claudovi „zmeň toto".
- **Funkcie / dizajn / čokoľvek zložitejšie** → **poviem Claudovi**, čo chcem;
  on to spraví, otestuje a nasadí na web.

Bežný postup s Claudom je jednoduchý: **napíšem čo chcem → Claude to spraví →
povie „nasadené" → o pár sekúnd je to na `luxorrising.com`.** Ja nemusím písať kód.

---

## 3. Účty a prístupy, ktoré mám mať pod kontrolou

Aby som mal plnú kontrolu, potrebujem **prihlásenia** do týchto služieb (existujúce,
nič nové sa nezakladá):

- **GitHub** — kód
- **Vercel** — hosting
- **Websupport** — doména
- **Stripe** — platby
- **Meta Business** — Facebook/Instagram tracking a reklamy
- **Google** (Analytics / Tag Manager) — meranie

👉 **Odporúčanie:** všetky tieto prihlásenia si ulož do jedného **password managera**.
To je „kľúče od kráľovstva". Kým ich mám, mám plnú kontrolu — nech projekt robí
ktokoľvek.

---

## 4. Ako prejsť na nový Claude účet (keď to budem chcieť)

Toto je jednoduché — **nič sa nezakladá okrem nového Clauda, nič sa nemení na webe.**

1. V Claude Code sa prihlásim **novým Claude účtom**.
2. Otvorím ten istý priečinok projektu na počítači.
3. Novému Claudovi vložím tento text:
   > *„Toto je existujúci projekt Luxor Rising. Prečítaj si
   > docs/handover/02-PROJECT-SEED.md a AGENTS.md a zhrň mi stav projektu."*

Hotovo. Podrobnejšie kroky + test sú v **[01-NAVOD-PRENOS-SK.md](01-NAVOD-PRENOS-SK.md)**.

---

## 5. Bežné situácie — čo robiť keď…

- **Chcem zmeniť text/cenu/obrázok** → poviem Claudovi, alebo cez `/keystatic`.
- **Chcem novú funkciu / stránku** → poviem Claudovi, čo a prečo. On navrhne + spraví.
- **Web nejde / niečo je pokazené** → Vercel dashboard ukáže, či posledný deploy
  prešiel. Poviem Claudovi „web hádže chybu, pozri sa" + čo vidím.
- **Chcem vidieť, kto navštevuje web** → Google Analytics (keď zapneme tracking).
- **Prišla rezervácia / platba** → Stripe dashboard.
- **Chcem zmeniť doménu / e-mail** → Websupport.

---

## 6. Bezpečnosť (dôležité, krátke)

- **Tajné kľúče** (Stripe, Meta tokeny…) sú v súbore `.env.local` na počítači a vo
  Verceli. **Nikdy ich nedávam do bežných súborov ani na GitHub.**
- Súkromné dokumenty a heslá si môžem odkladať do priečinka
  **`docs/handover/_local-private/`** — ten sa nikdy nenahrá na GitHub.
- Password manager = základ. Bez neho môžem stratiť prístup.

---

## 7. Čo ešte na webe treba dotiahnuť (aktuálne otvorené)

V ľudskej reči, aby som vedel, čo ma čaká (detail v `02-PROJECT-SEED.md`, časť 7):

- 🔴 **Kontaktný formulár zatiaľ neposiela e-maily** — vyzerá, že odoslal, ale
  dopyt nikam nepríde. Treba napojiť e-mailovú službu (napr. Resend). **Priorita.**
- 🔴 **Platby (Stripe)** — overiť „live" kľúč vo Verceli a spraviť jednu skúšobnú
  reálnu rezerváciu.
- 🟡 **Tracking (Google/Meta)** — ID sú pripravené v Keystatic, treba ich vyplniť
  a zapnúť, keď budem chcieť merať.
- 🟡 **Google Search Console** — prihlásiť doménu, aby ma Google rýchlejšie našiel.
- 🟢 **Právne** — doplniť číslo vložky v Obchodnom registri do právnych stránok.

Keď budem chcieť čokoľvek z toho, len to poviem Claudovi.

---

*Tento projekt vediem cez Claude. Nemusím rozumieť kódu — stačí vedieť, čo chcem,
a mať pod kontrolou účty z bodu 3.*
