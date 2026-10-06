# Luxor Rising — Backup & New-Computer Setup Guide

Everything needed to back up this project, restore it on a fresh computer, and get Claude Code up to speed. Keep a copy of this file in Google Drive next to the backup archive.

---

## 0. TL;DR

- **Back up:** make one `.tar` (≈4.4 GB) with the command in §2, upload it to Google Drive.
- **New machine:** install Git · Node 20 · Claude Code → extract the backup (or `git clone`) → `npm install` → `npm run dev` → http://localhost:3000.
- **The one irreplaceable file:** `.env.local` (all the secret keys — it is *not* on GitHub).
- **Get Claude oriented:** paste Prompt 1 from §6.

---

## 1. What's where — tracked vs. local-only

**On GitHub** (`https://github.com/luxorrising-collab/luxor-rising`): all committed code, the Keystatic `content/`, and committed `public/` images & videos.

**ONLY on the computer** (gitignored or uncommitted — GitHub does NOT have these):

| File / folder | What it is | Critical? |
|---|---|---|
| `.env.local` | Supabase / Stripe / Resend secret keys | **YES — nothing runs without it** |
| `Luxor_Rising_Modely_naklady_ROAS.xlsx` | Private margins / ROAS model | Yes |
| `obsah-stranok.xlsx` | Content workbook | Yes |
| `docs/luxor-video/clips/model2`, `model3`, `final`, `CMP-*.mp4` | Raw video **source clips** (hero/gallery cuts come from these) | Yes (large, ~1.4 GB) |
| `.assets/` | Marketing-creative build scripts | Yes |
| `public/luxor new images/`, `_prototype/`, `docs/handover/_local-private/` | Staging / private handover | If used |
| Uncommitted "day-feel" work | `components/BackgroundVideo.tsx`, `public/videos/day-feel.*`, edits to `app/(site)/concierge-day/page.tsx` + its CSS | Yes (in progress) |

Rough sizes: `.git` 1.5 GB · `public/` 1.2 GB · `docs/luxor-video/` 1.4 GB · `node_modules/` 783 MB · `.next/` 1.5 GB · **total ≈ 6.6 GB**. `node_modules` and `.next` are never worth backing up — they regenerate with `npm install`.

---

## 2. Making / refreshing the backup

Run from the project folder (`C:\Users\maria\dev\luxor-rising`). `tar` ships with Windows 10+, Git Bash, and macOS.

### Option A — one complete snapshot (≈4.4 GB, foolproof)

```bash
tar --exclude=node_modules --exclude=.next -cf ../luxor-rising-backup.tar .
```

Captures **everything**: code, git history, `.env.local`, the Excels, the video sources, and the uncommitted day-feel work. Upload `luxor-rising-backup.tar` to Drive. (Plain `tar`, no gzip — the content is mostly already-compressed video, so gzip adds lots of time for almost no saving.)

### Option B — lean backup (≈1.4 GB, relies on GitHub for the rest)

GitHub already holds the git history and committed `public/` media, so back up only the local-only files plus a patch of the uncommitted edits:

```bash
git diff > ../luxor-uncommitted.patch          # edits to tracked files (day-feel, package.json)
tar -cf ../luxor-local-only.tar \
  .env.local \
  Luxor_Rising_Modely_naklady_ROAS.xlsx obsah-stranok.xlsx \
  docs/luxor-video .assets \
  components/BackgroundVideo.tsx \
  public/videos/day-feel.mp4 public/videos/day-feel-poster.jpg
```

Upload both files. On the new machine, after `git clone`, drop these in and run `git apply ../luxor-uncommitted.patch` to restore the day-feel edits.

> Delete the `.tar` from your disk once it's safely on Drive — it lives one level up from the project so it won't get swept into git.

---

## 3. Setting up on the new computer

**3.1 Install**
- **Git** — https://git-scm.com
- **Node.js 20 LTS** — https://nodejs.org (Next.js 16 needs Node ≥ 18.18)
- **Claude Code** — the desktop app
- Optional: **GitHub CLI** (`gh`), **Vercel CLI**

**3.2 Get the project** — pick one:
- *From the backup:* make an empty folder, drop `luxor-rising-backup.tar` in, then `tar -xf luxor-rising-backup.tar` — it's already complete (code + secrets + sources + history).
- *From GitHub:* `git clone https://github.com/luxorrising-collab/luxor-rising.git`, then copy the local-only files from Drive into the folder (at minimum `.env.local`), and if you used Option B: `git apply ../luxor-uncommitted.patch`.

**3.3 Install deps & run**
```bash
npm install
npm run dev        # → http://localhost:3000
```

**3.4 CMS** — Keystatic reads from `content/` (already included). Edit at `/keystatic`.

---

## 4. Re-check the live services

- **Supabase** (project `qlxfveevlcgzunmbhffj`): if it was paused for inactivity, resume it in the dashboard. Keys `SUPABASE_URL` + `SUPABASE_SECRET_KEY` are in `.env.local`. Quick DB sanity check lives in your session history (connection + recent `customers`/`enquiries`/`bookings`).
- **Vercel** (project `luxor-rising-fod9`): deploys automatically from GitHub `main`. Env vars live in **Vercel Production**, not the repo — nothing to do on a dev machine unless you redeploy. *Gotcha:* env-var changes only take effect on a fresh Production **build** (push a commit to trigger it).
- **Stripe** (live): keys in `.env.local` + Vercel. The webhook endpoint URL must use the **www** host (`www.luxorrising.com`) — the apex 308-redirects and Stripe won't follow it.
- **Resend** (email): `RESEND_API_KEY` in `.env.local` + Vercel; domain `luxorrising.com` is DKIM-verified.

---

## 5. Project orientation (the short version)

- **Next.js 16 App Router** — *not* vanilla Next. Read `AGENTS.md`; check `node_modules/next/dist/docs/` before relying on old APIs.
- **CMS:** Keystatic, content in `content/` (committed, edited at `/keystatic`).
- **Experience pages:** shared `components/ExperienceTemplate.tsx`; per-product config in `app/(site)/experiences/[slug]/page.tsx`; Medinet Habu has its own route (`app/(site)/medinet-habu/`).
- **"Design Your Day":** `app/(site)/concierge-day/page.tsx` — the cinematic hero + gallery.
- **Hero slideshow:** `components/HeroShow.tsx` (crossfading images + muted clips, one fade-length early-cut so clips play full-length).
- **Video clips:** served from `public/videos/…`, **cut from the sources in `docs/luxor-video/`** using `node_modules/ffmpeg-static/ffmpeg.exe` (use the absolute path — a `cd` breaks the relative one).
- **Integrations:** Supabase (DB) · Stripe (payments + balance auto-charge cron) · Resend (emails) · Keystatic (CMS). See `lib/`.

---

## 6. Claude Code prompts for the new computer

Open Claude Code **in the project folder**, then paste one of these.

### Prompt 1 — First run: verify the setup

```text
I've just set up the Luxor Rising project on a new computer — a Next.js 16
App Router site for a private concierge travel business in Luxor, Egypt.

Please get oriented and confirm everything works:
1. Read AGENTS.md, CLAUDE.md, and docs/NEW-MACHINE-SETUP.md.
2. Run `git status`; tell me the branch and whether the uncommitted
   "day-feel" work on /concierge-day is present.
3. Confirm .env.local exists and lists SUPABASE_URL, SUPABASE_SECRET_KEY,
   the Stripe keys, and RESEND_API_KEY (do NOT print the values).
4. Confirm the video source clips are present in docs/luxor-video/ (these
   are local-only, not on GitHub).
5. Run `npm install` if needed, start the dev server, and verify
   http://localhost:3000 loads with no console errors.
6. Give me a short map of the project: the CMS (Keystatic/content), the
   experience pages, the HeroShow slideshow, and where clips are cut from.
```

### Prompt 2 — Full project tour (when you want to understand the codebase)

```text
Walk me through the Luxor Rising codebase in depth. Cover: the App Router
structure, the shared ExperienceTemplate and how per-product pages are
configured, the Keystatic CMS setup and which singletons/collections exist,
the Supabase/Stripe/Resend/email flow (enquiry → booking → balance auto-charge),
and how the hero/gallery video clips are produced from docs/luxor-video with
ffmpeg. Point me to the key files for each. Don't change anything.
```

### Prompt 3 — Resume work

```text
Resume work on Luxor Rising. First run `git status` and `git log --oneline -10`
to see where things stand, and check whether the "day-feel" background-video
work on /concierge-day is still uncommitted. Then summarise what's in progress
and ask me what I want to tackle next. Push to main only when I ask.
```

### Prompt 4 — Check the client database (Supabase)

```text
Check the Luxor Rising Supabase database is healthy and show me the latest
client activity. Use .env.local (SUPABASE_URL + SUPABASE_SECRET_KEY) to connect
read-only, confirm the customers/enquiries/bookings tables are reachable, and
list the most recent few records (mask emails, don't print phone numbers).
Don't write any test rows.
```

---

## 7. Troubleshooting

- **`npm run dev` errors about missing env / Supabase not configured** → `.env.local` is missing or wasn't restored. Copy it from the backup.
- **Clips/images missing in the hero** → the video **sources** (`docs/luxor-video/`) or committed `public/videos/` weren't restored; re-extract from the backup.
- **ffmpeg "not found" when cutting clips** → use the absolute path `C:/Users/<you>/dev/luxor-rising/node_modules/ffmpeg-static/ffmpeg.exe`; a `cd` in the same command breaks the relative path.
- **Stripe webhook failing after deploy** → confirm the endpoint URL uses the **www** host, and that a fresh Production build picked up the env vars.
- **Keystatic/`/keystatic` edits not showing** → content is committed to `content/`; after a Keystatic edit it commits to the repo — pull before pushing other work.
</content>
