# Návod: Prevod Luxor Rising pod nový Claude účet

Jednoduchý návod krok za krokom. Cieľ: mať plnú kontrolu nad projektom pod novým
Claude účtom a **zachovať všetky napojenia** (Vercel, GitHub, Keystatic, doména).

---

## ČASŤ A — Najprv pochop, čo prenášaš (dôležité!)

Web sa skladá zo štyroch vecí a **ani jedna nie je viazaná na Claude účet:**

- **Kód** → žije na **GitHube** (repozitár `luxorrising-collab/luxor-rising`)
- **Beh webu** → **Vercel** (automaticky nasadzuje z GitHubu)
- **Doména** → `luxorrising.com` (DNS vo **Websupport**)
- **Editácia obsahu** → **Keystatic** (píše priamo do súborov v repozitári)

**Claude Code je len nástroj** na tvojom počítači, ktorý upravuje kód. Keď sa
prihlásiš iným Claude účtom, web sa nijako nezmení.

Preto „prevod pod nový účet" v skutočnosti znamená dve veci:
1. **Prihlásiť nový Claude účet** v Claude Code na počítači, kde je projekt.
2. **Zabezpečiť prístup** nového účtu ku GitHubu, Vercelu a heslám — lebo napojenia
   sú viazané na *tie* účty, nie na Claude.

> Zhrnutie: Napojenia (Vercel/GitHub/Keystatic) zostanú funkčné automaticky,
> pokiaľ máš prístup ku GitHub a Vercel účtom, ku ktorým je projekt pripojený.

---

## ČASŤ B — Čo si priprav vopred (checklist)

Skôr než začneš, priprav si prístupy (viac v `03-CONNECTIONS-AND-ENV.md`):

- [ ] **GitHub** účet, ktorý je **owner/admin** organizácie `luxorrising-collab`
      (alebo aspoň má prístup k repu `luxor-rising`).
- [ ] **Vercel** účet/tím, ktorý má projekt Luxor Rising (alebo doň buď pozvaný).
- [ ] Prístup k **Websupport** (doména `luxorrising.com`, DNS).
- [ ] **Tajné kľúče** (env premenné) — hlavne `STRIPE_SECRET_KEY`. Ulož ich do
      password managera alebo priamo do Vercelu (nie do gitu!).
- [ ] **Nový Claude účet** (Claude.ai / Claude Code predplatné).
- [ ] Nainštalovaný **Node.js 24+** a **Git** na počítači.

---

## ČASŤ C — Krok za krokom

### 1. Zabezpeč prístup na GitHube
- Prihlás sa na GitHub tým účtom, ktorý má mať kontrolu.
- Otvor `https://github.com/luxorrising-collab/luxor-rising`.
- Ak k nemu **nemáš prístup**: nechaj súčasného ownera org `luxorrising-collab`,
  aby ťa pridal ako **Owner** (Settings → People / Members → Add member).
- Cieľ: nový účet vidí repo a vie doň **pushovať** (`git push`).

### 2. Zabezpeč prístup na Verceli
- Prihlás sa na `https://vercel.com`.
- Nájdi projekt **luxor-rising** (v tíme, ku ktorému je pripojený GitHub repo).
- Ak k nemu nemáš prístup: súčasný majiteľ ťa pozve do tímu
  (Vercel → Team → Settings → Members → Invite), ideálne rola **Owner/Admin**.
- **Dôležité:** Vercel je napojený na GitHub. Nasadzovanie beží samo pri každom
  `git push` na `main`. Netreba nič „prepájať" nanovo, len mať prístup.

### 3. Priprav počítač
- Nainštaluj **Node.js 24+** (`https://nodejs.org`) a **Git**.
- Nainštaluj **Claude Code** a **prihlás sa NOVÝM Claude účtom**.

### 4. Naklonuj projekt (ak ešte nie je na disku)
```bash
git clone https://github.com/luxorrising-collab/luxor-rising.git
cd luxor-rising
```
> Ak projekt už na disku máš (ako teraz), tento krok preskoč.

### 5. Nastav env premenné (tajné kľúče)
- V koreni projektu vytvor súbor **`.env.local`** (je v `.gitignore`, nenahrá sa).
- Skopírúj doň premenné (zoznam a čo znamenajú je v `03-CONNECTIONS-AND-ENV.md`).
  Minimálne:
  ```
  STRIPE_SECRET_KEY=sk_live_...
  META_CAPI_ACCESS_TOKEN=...
  ```
- **Tie isté premenné musia byť aj vo Verceli** (Project → Settings →
  Environment Variables), inak platby/tracking na živom webe nefungujú.

### 6. Over, že web beží lokálne
```bash
npm install
npm run dev
```
- Otvor `http://localhost:3000` — mala by nabehnúť domovská stránka.
- Keystatic admin: `http://localhost:3000/keystatic` (lokálny režim — píše do súborov).

### 7. Zasvieť nového Clauda do projektu
- V Claude Code (prihlásený novým účtom) v priečinku projektu napíš:
  > „Prečítaj `docs/handover/02-PROJECT-SEED.md` a `AGENTS.md`, potom mi zhrň
  > stav projektu."
- `AGENTS.md` a `CLAUDE.md` sa čítajú automaticky. Seed dá Claudovi celý kontext.

### 8. (Voliteľné) Prenes Claude pamäť
- Doterajší účet má lokálnu pamäť projektu v priečinku:
  `C:\Users\<meno>\.claude\projects\C--Users-<meno>-dev-luxor-rising\memory\`
- Obsahuje `MEMORY.md` + poznámky. Ak ideš na **iný počítač**, tento priečinok si
  skopíruj. (Ak zostávaš na tom istom počítači, pamäť tam už je.)
- Obsah pamäte je aj tak zhrnutý v `02-PROJECT-SEED.md`, takže o nič neprídeš.

### 9. Over napojenia (posledná kontrola)
- **GitHub:** sprav malú zmenu → `git commit` → `git push`. Prejde bez chyby?
- **Vercel:** po pushi sa má sám spustiť nový deploy → skontroluj na `vercel.com`,
  že prebehol a `luxorrising.com` sa aktualizoval.
- **Keystatic:** otvor `/keystatic` lokálne, edituj text, ulož → zmena sa objaví
  v súbore v `content/`. Commitni a pushni → nasadí sa.
- **Doména:** `luxorrising.com` aj `www.luxorrising.com` fungujú s HTTPS.

---

## ČASŤ D — Rýchly checklist „všetko funguje"

- [ ] `git push` na `main` prejde
- [ ] Vercel po pushi automaticky nasadí
- [ ] `luxorrising.com` (+ `www`) beží cez HTTPS
- [ ] `npm run dev` naštartuje web lokálne
- [ ] `/keystatic` lokálne otvorí a uloží obsah
- [ ] `STRIPE_SECRET_KEY` je vo Verceli → checkout na živom webe funguje
- [ ] Nový Claude prečítal seed a rozumie projektu

---

## ČASŤ E — Bezpečnosť (prečítaj!)

- **Nikdy necommituj tajné kľúče** (`.env.local`, `STRIPE_SECRET_KEY`, tokeny) do
  gitu. `.gitignore` už `.env*` ignoruje — nechaj to tak.
- Citlivé dokumenty daj do priečinka **`docs/handover/_local-private/`** — ten je
  v `.gitignore`, takže zostane len na tvojom disku a nenahrá sa na GitHub.
- Tajné kľúče najlepšie drž v **password manageri** + vo **Verceli** (tam ich web
  na behu potrebuje). `.env.local` je len pre lokálny vývoj.

---

Ak niečo z tohto nesedí (napr. iný Vercel tím, iný GitHub owner), otvor
`03-CONNECTIONS-AND-ENV.md` — tam sú presné detaily každého napojenia.
