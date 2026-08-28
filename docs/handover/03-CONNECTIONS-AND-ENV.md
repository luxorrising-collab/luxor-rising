# Napojenia & env premenné — referenčná mapa

> **Toto je len referencia. Ak zostávaš ty na tom istom počítači, NIČ tu nemeníš** —
> všetky napojenia už fungujú. Dokument slúži na to, aby si (aj nový Claude) vedel,
> čo je kde a kde sú kľúče. Kroky typu „pridať Owner / pozvať do tímu" platia **iba**
> vtedy, ak by projekt preberal **niekto iný**; pre teba ich ignoruj.

Tajné **hodnoty** tu nie sú (a ani nesmú byť) — len názvy a kde ich nájsť.

---

## 1. GitHub — kód

- **Repozitár:** `https://github.com/luxorrising-collab/luxor-rising`
- **Organizácia:** `luxorrising-collab`
- **Hlavná vetva:** `main` (Vercel z nej nasadzuje)

**Plná kontrola = byť Owner organizácie.**
- Owner org `luxorrising-collab` → Settings → People/Members → pridaj nový účet ako
  **Owner** (alebo aspoň s právom push do repa).
- Overenie: nový účet vie spraviť `git push` na `main` bez chyby.

> Prenos vlastníctva celej org (ak treba): GitHub → Organization → Settings →
> len iný Owner môže pridať/odobrať Ownerov. Repo sa dá aj presunúť (Transfer),
> ale **pozor** — zmení sa URL a treba znovu prepojiť Vercel. Odporúčanie:
> **nepresúvaj repo**, len pridaj nový účet ako Owner.

---

## 2. Vercel — beh a nasadzovanie webu

- **Projekt:** `luxor-rising` (na Verceli, napojený na GitHub repo vyššie).
- Nasadzuje sa **automaticky** pri každom `git push` na `main`.

**Plná kontrola = byť člen tímu (Owner/Admin) s tým projektom.**
- Vercel → Team → Settings → **Members → Invite** → pridaj nový účet (rola Owner/Admin).
- Env premenné (nižšie) sú uložené vo Verceli per projekt — nový účet ich uvidí
  po pridaní do tímu.

> Napojenie GitHub → Vercel je už hotové a netreba ho robiť nanovo. Ak by sa
> náhodou odpojilo: Vercel → Project → Settings → Git → Connect Git Repository →
> vyber `luxorrising-collab/luxor-rising`.

---

## 3. Doména — luxorrising.com

- **Registrátor / DNS:** Websupport.
- **Nastavenie (funkčné, netreba meniť):**
  - `A` záznam pre `@` (apex) → `76.76.21.21`
  - `CNAME` pre `www` → `cname.vercel-dns.com`
  - Primárna doména na Verceli = **apex** `luxorrising.com` (www presmeruje naň).
  - **Žiadny AAAA/IPv6** záznam (blokuje SSL).
- **Plná kontrola = prístup do Websupport účtu**, kde je doména vedená.

---

## 4. Keystatic — editácia obsahu

- Momentálne **lokálny režim** (píše do súborov v repozitári).
- Netreba samostatný „účet" — kontrola = prístup ku GitHub repu (obsah je tam).
- Live editácia priamo z `/keystatic` na webe by vyžadovala **GitHub storage mode**
  (GitHub App + env premenné). Zatiaľ nezriadené — detail v `02-PROJECT-SEED.md`.

---

## 5. Platby & tracking — kde sú kľúče

- **Stripe** — účet, kde vznikajú platby. Kľúč `STRIPE_SECRET_KEY` (test aj live).
  Kontrola = prístup do Stripe dashboardu. Live web potrebuje **live** kľúč.
- **Meta (Facebook)** — Pixel + Conversions API token (`META_CAPI_ACCESS_TOKEN`).
  Kontrola = prístup do Meta Business / Events Managera.
- **Google (GA4 / GTM)** — ID sa zadávajú v Keystatic (`content/tracking/`), nie
  v env. Kontrola = prístup do Google Analytics / Tag Managera.

---

## 6. Env premenné (názvy — hodnoty sem NEPÍŠ)

Musia byť na **dvoch miestach**: v `.env.local` (lokálny vývoj) a vo **Verceli**
(Project → Settings → Environment Variables → Production).

| Premenná | Na čo | Povinná? |
|----------|-------|----------|
| `STRIPE_SECRET_KEY` | Stripe Checkout (platby) | **Áno** pre platby na živom webe |
| `META_CAPI_ACCESS_TOKEN` | Meta Conversions API (server-side tracking) | Len keď chceš Meta tracking |
| `META_CAPI_TEST_EVENT_CODE` | Testovanie Meta eventov | Voliteľné |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Prepne Keystatic na GitHub režim | Len ak chceš live editáciu |
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App (Keystatic GitHub režim) | Len s GitHub režimom |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App (Keystatic GitHub režim) | Len s GitHub režimom |
| `KEYSTATIC_SECRET` | Podpis session (Keystatic GitHub režim) | Len s GitHub režimom |

> **Kde sú aktuálne hodnoty?** V súbore `.env.local` na pôvodnom počítači a/alebo
> vo Verceli (Environment Variables). Skopíruj ich odtiaľ. Ak niektorý kľúč
> nemáš, vygeneruj nový v príslušnej službe (Stripe/Meta) a nahraď ho na oboch
> miestach.

---

## 7. Kontrolný zoznam „plná kontrola pod novým účtom"

- [ ] Nový GitHub účet = **Owner** org `luxorrising-collab` (vie pushovať)
- [ ] Nový účet je vo **Vercel tíme** projektu (Owner/Admin)
- [ ] Prístup do **Websupport** (doména/DNS)
- [ ] Prístup do **Stripe**, **Meta Business**, **Google Analytics/GTM**
- [ ] `.env.local` + Vercel Env Vars naplnené rovnakými kľúčmi
- [ ] Nový **Claude** účet prihlásený v Claude Code, prečítal seed
