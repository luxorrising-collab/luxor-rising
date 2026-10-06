# Luxor Rising — backup & new-computer setup

How to back up the whole project and get it running on a fresh machine.

---

## 1. What lives where

**On GitHub** (`https://github.com/luxorrising-collab/luxor-rising`): everything that's *committed* — all source code, the Keystatic `content/`, and the committed `public/` images/videos.

**ONLY on this computer** (gitignored or uncommitted — GitHub does NOT have these; back them up separately):

| File / folder | What it is | Critical? |
|---|---|---|
| `.env.local` | Supabase / Stripe / Resend secret keys | **YES — nothing works without it** |
| `Luxor_Rising_Modely_naklady_ROAS.xlsx` | Private margins / ROAS model | Yes |
| `obsah-stranok.xlsx` | Content workbook | Yes |
| `docs/luxor-video/clips/model2`, `model3`, `final`, `CMP-*.mp4` | Raw video **source clips** (hero/gallery cuts come from these) | Yes (large) |
| `.assets/` | Marketing-creative build scripts | Yes |
| `public/luxor new images/`, `_prototype/`, `docs/handover/_local-private/` | Staging / private handover | If used |
| Uncommitted "day-feel" work | `components/BackgroundVideo.tsx`, `public/videos/day-feel.*`, edits to `app/(site)/concierge-day/page.tsx` + its CSS | Yes (in progress) |

> `node_modules/` and `.next/` are **not** worth backing up — they regenerate with `npm install`.

---

## 2. Back up to Google Drive

Approx sizes: `.git` 1.5 GB · `public/` 1.2 GB · `docs/luxor-video/` 1.4 GB · `node_modules/` 783 MB · `.next/` 1.5 GB · **total 6.6 GB**.

### Option A — one complete snapshot (~4 GB, foolproof)

From the project folder:

```bash
tar --exclude=node_modules --exclude=.next -czf ../luxor-rising-backup.tgz .
```

(`tar` ships with Windows 10+, Git Bash, and macOS.) Captures **everything** — code, git history, `.env.local`, the Excels, the video sources, and the uncommitted day-feel work. Upload `luxor-rising-backup.tgz` to Drive. `node_modules`/`.next` are skipped (they regenerate with `npm install`).

### Option B — lean backup (~1.4 GB, relies on GitHub for the rest)

GitHub already holds the git history and the committed `public/` media, so you only need the local-only files. First save a patch of the uncommitted (day-feel) edits, then archive the local-only files:

```bash
git diff > ../luxor-uncommitted.patch          # edits to tracked files (day-feel, package.json)
tar -czf ../luxor-local-only.tgz \
  .env.local \
  Luxor_Rising_Modely_naklady_ROAS.xlsx obsah-stranok.xlsx \
  docs/luxor-video .assets \
  components/BackgroundVideo.tsx \
  public/videos/day-feel.mp4 public/videos/day-feel-poster.jpg
```

Upload both `luxor-local-only.tgz` and `luxor-uncommitted.patch`. On the new machine: `git clone`, drop these files in, then `git apply luxor-uncommitted.patch` to restore the day-feel edits.

---

## 3. Set up on the new computer

1. **Install:** Git · Node.js 20 LTS (Next.js 16 needs Node ≥ 18.18) · the Claude Code desktop app. Optional: GitHub CLI (`gh`), Vercel CLI.
2. **Get the project** — either:
   - `git clone https://github.com/luxorrising-collab/luxor-rising.git`, then copy the local-only files from your Drive backup into it (at minimum `.env.local`); **or**
   - unzip `luxor-rising-backup.tgz` (it's already complete).
3. `npm install`
4. `npm run dev` → open http://localhost:3000

---

## 4. Re-check the live services

- **Supabase** (project `qlxfveevlcgzunmbhffj`): if it was paused for inactivity, resume it in the dashboard. Keys are `SUPABASE_URL` + `SUPABASE_SECRET_KEY` in `.env.local`.
- **Vercel** (project `luxor-rising-fod9`): deploys automatically from GitHub `main`. Env vars live in Vercel Production, not the repo — nothing to do on a new dev machine unless you redeploy.
- **Stripe** (live): keys in `.env.local` + Vercel. The webhook endpoint URL must use the **www** host (`www.luxorrising.com`).
- **Resend**: `RESEND_API_KEY` in `.env.local` + Vercel.

---

## 5. Project orientation (the short version)

- **Next.js 16 App Router.** This is *not* vanilla Next — read `AGENTS.md`; check `node_modules/next/dist/docs/` before relying on old APIs.
- **CMS:** Keystatic, content in `content/` (committed, edited at `/keystatic`).
- **Experience pages:** shared `components/ExperienceTemplate.tsx`; per-product config in `app/(site)/experiences/[slug]/page.tsx`; Medinet Habu has its own route.
- **Hero slideshow:** `components/HeroShow.tsx` (crossfading images + clips). Design-Your-Day hero + gallery live in `app/(site)/concierge-day/page.tsx`.
- **Video clips:** served from `public/videos/…`; **cut from the sources in `docs/luxor-video/`** with `node_modules/ffmpeg-static/ffmpeg.exe`.
</content>
