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

## 2. Back up to Google Drive (one complete snapshot)

From the project folder, make a single archive that excludes only the regenerable heavy folders:

```bash
tar --exclude=node_modules --exclude=.next -czf ../luxor-rising-backup.tgz .
```

(`tar` ships with Windows 10+, Git Bash, and macOS.) This captures **everything** — code, git history, `.env.local`, the Excels, the video sources, and the uncommitted day-feel work. Upload `luxor-rising-backup.tgz` to Drive.

**Leaner alternative** (if the archive is too big for Drive): push any committed work to GitHub, then back up only the "ONLY on this computer" files from the table above, and rely on `git clone` for the rest.

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
