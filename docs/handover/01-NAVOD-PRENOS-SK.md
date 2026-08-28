# Návod: Odovzdanie projektu novému Claude účtu (bez zmien infraštruktúry)

**Scenár:** ten istý počítač, ten istý GitHub, ten istý Vercel, tá istá doména —
**mení sa iba Claude účet.** Žiadne nové účty (okrem Clauda) nezakladáš, na webe
ani napojeniach **nič nemeníš.**

---

## Prečo je to takto jednoduché

Claude Code je len nástroj, ktorý pracuje s kódom na tvojom disku. Web, GitHub,
Vercel aj doména sú od Clauda oddelené a fungujú ďalej. Preto „odovzdanie novému
Claudovi" = **len prihlásiť nový Claude účet a dať mu prečítať kontext projektu.**

- `git push` funguje cez **git prihlásenie uložené na počítači** (nie cez Clauda).
- Vercel nasadzuje **automaticky pri každom push** (nie cez Clauda).
- Kľúče (`.env.local`) **už na disku máš** — nič sa nepresúva.

---

## Kroky (celé to je pár minút)

### 1. Prihlás nový Claude účet
V Claude Code sa odhlás zo starého účtu a prihlás **novým Claude účtom**.

### 2. Otvor priečinok projektu
Ten istý ako doteraz:
```
C:\Users\maria\dev\luxor-rising
```
(Nič sa neklonuje ani neprekopíruje — projekt už tam je.)

### 3. Over, že kľúče sú na mieste
Skontroluj, že v koreni projektu existuje súbor **`.env.local`**
(obsahuje napr. `STRIPE_SECRET_KEY`). Ak áno — hotovo, netreba nič robiť.
> Je v `.gitignore`, takže ostáva len na disku. Nekopíruj ho nikam.

### 4. Zasvieť nového Clauda — vlož mu tento prvý prompt
Skopíruj a pošli novému Claudovi v priečinku projektu:

```
Toto je existujúci projekt Luxor Rising. Prečítaj si docs/handover/02-PROJECT-SEED.md
a AGENTS.md, potom mi v skratke zhrň, čo projekt je, aký má stav a čo sú otvorené
úlohy. Infraštruktúra (GitHub, Vercel, doména) zostáva nezmenená.
```

`AGENTS.md` a `CLAUDE.md` číta Claude aj sám. Seed mu dá celý zvyšný kontext.

### 5. Over, že všetko funguje (rýchly test)
```bash
npm install      # ak si dependencies ešte neťahal
npm run dev      # web nabehne na http://localhost:3000
```
Potom sprav malú zmenu (napr. v texte), a:
```bash
git add -A
git commit -m "test: overenie prístupu"
git push
```
Ak `git push` prejde → o pár sekúnd sa na **Verceli** sám spustí deploy a
`luxorrising.com` sa aktualizuje. **Tým je odovzdanie hotové.**

---

## Rýchly checklist

- [ ] Prihlásený **nový Claude účet** v Claude Code
- [ ] Otvorený existujúci priečinok projektu
- [ ] `.env.local` je na mieste (kľúče)
- [ ] Novému Claudovi vložený prvý prompt (prečítal seed)
- [ ] `npm run dev` naštartuje web
- [ ] `git push` prejde → Vercel nasadí → doména funguje

To je celé. Žiadny nový GitHub/Vercel účet, žiadna zmena napojení.

---

## Poznámky

- **Claude „pamäť" projektu** (poznámky z doterajšej práce) je na tomto počítači
  v `C:\Users\maria\.claude\projects\C--Users-maria-dev-luxor-rising\memory\`.
  Keďže ostávaš na tom istom počítači, je tam ďalej. Jej obsah je aj tak zhrnutý
  v `02-PROJECT-SEED.md`.
- Detailná mapa napojení (čo je kde, kde sú kľúče) je v
  `03-CONNECTIONS-AND-ENV.md` — je to len **referencia**, netreba tam nič meniť.

---

## (Iba ak by projekt niekedy preberal niekto INÝ / na inom počítači)

Vtedy — a len vtedy — treba navyše:
1. Naklonovať repo: `git clone https://github.com/luxorrising-collab/luxor-rising.git`
2. Vytvoriť `.env.local` a doň skopírovať kľúče z Vercelu (Settings → Environment
   Variables) alebo z pôvodného `.env.local`.
3. Zabezpečiť, aby ten GitHub/Vercel účet mal prístup k projektu (pridať ho ako
   člena — **nezakladá sa nič nové**, len pozvanie k existujúcemu repu/tímu).

Pre teba, na tomto počítači, toto **neplatí** — kroky 1–5 vyššie stačia.
