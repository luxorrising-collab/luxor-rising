---
name: write-article
description: >-
  Write a publication-ready Insider's Guide article for Luxor Rising, in the
  brand's voice and the existing blog design, drafted into Keystatic for review.
  Loads the full playbook: brand voice, readability, SEO, GEO, sales, fact-check,
  FAQ and sources. Use whenever the task is to write, draft, plan or research a
  blog post / guide / article for luxorrising.com, or when the user types
  /write-article. Each article is fact-checked against live sources and saved as
  a DRAFT (invisible on the live site) for the user to review and publish.
---

# Write a Luxor Rising Insider's Guide article

You are writing for **Luxor Rising** — a private concierge in Luxor, Egypt. The
blog is "The Insider's Guide to Luxor." The whole premise: honest, specific,
on-the-ground advice from people who live there, that quietly proves why having
a local concierge is worth it. Every article both *helps the reader for free*
and *earns the booking*.

Read the three reference files before writing — they are the source of truth:

- `references/brand-voice.md` — how we sound, with real examples. Non-negotiable.
- `references/topic-roadmap.md` — the prioritised topic/keyword plan. Pick from here.
- `references/research-notes.md` — fact base (prices, hours, names) with sources
  and dates. **Always re-verify; these change.**

## The output, in one line

A single Markdoc file at `content/articles/<slug>/index.mdoc` with complete
frontmatter (including `draft: true`) and a body in our voice — nothing more to
do for it to render beautifully, because the design is automatic.

## Workflow

### 1. Pick and frame the topic
- Take the next topic from `references/topic-roadmap.md` (or the one the user
  named). One article = one real question a traveller actually types.
- Decide the single primary keyword/question. Everything serves it.
- Confirm the slug: short, lowercase, hyphenated, keyword-first — e.g.
  `medinet-habu-worth-visiting`, `is-luxor-safe`, `nile-sunset-felucca-luxor`.

### 2. Research and fact-check (mandatory — do not skip)
- Use WebSearch for current facts: prices (EGP and rough €/$), opening hours,
  what's open/closed, ticket rules, safety advisories, distances, seasons.
  These change constantly — never write a price or hour from memory.
- Cross-check at least two independent sources per hard fact. Prefer official
  sources (egymonuments.gov.eg, museum sites, government advisories) over
  aggregators and OTAs.
- Record every source you used — they become the `sources` field.
- If a fact can't be verified, don't state it as fact. Say it varies, or that
  "we check it before every guest's day" — which is true and on-brand.
- `references/research-notes.md` is a starting point only. Re-verify and update
  it when you learn something new (and note the date).

### 3. Structure (this order, adapted to the topic)
Lead with the answer, then earn the depth. This serves readability, SEO **and**
GEO (AI answers quote the first, self-contained, specific lines).

1. **Opening (≈40–70 words):** answer the title question directly in the first
   two sentences, with the specific number or name in it. No throat-clearing.
   Then one line of Ahmed / local grounding.
2. **The honest / contrarian section:** the thing the guidebooks or OTAs won't
   say, even when it costs us a sale. This is the trust engine.
3. **The substance:** 2–4 `##` sections, each a question-style or plain-spoken
   heading. Short paragraphs (2–3 sentences). One `###` sub-section where useful.
4. **A practical list:** concrete, numbered or bulleted do-this advice (times,
   order, what to skip). Specific beats clever.
5. **"What most people miss":** the insider edge — usually something only a
   local would know, that maps to something we can arrange.
6. **FAQ:** 4–6 real questions, answered honestly in voice. Goes in the `faqs`
   field (NOT the body) — it renders as an accordion and feeds FAQ structured
   data for Google rich results and AI answers.
7. **Sources:** the `sources` field.

Also write 3–5 **key takeaways** (the `keyTakeaways` field) — each a standalone,
quotable sentence with the specific fact in it. This is the box skimmers read and
the lines AI engines lift.

### 4. Readability targets
- Flesch Reading Ease ~60–70. Plain, direct, concrete.
- Most sentences under ~20 words. Vary rhythm; a short sentence lands.
- Paragraphs 2–3 sentences. White space is a feature.
- Second person ("you"). Active voice. Specific nouns and numbers.
- No marketing adjectives stacked up ("luxurious, unforgettable, magical").
  Show the thing; let the reader feel it.

### 5. SEO
- `metaTitle`: ≤ ~60 chars, primary keyword near the front, include the year
  when the facts are year-sensitive (e.g. "(2026)"). May differ from the H1.
- `metaDescription`: ~150–155 chars, the promise + a specific, honest hook.
- Primary keyword in: title, first paragraph, at least one `##` heading, and
  naturally through the body. Don't stuff.
- Internal links in the body: at least one to `/concierge-day`, and relevant
  ones to `/experiences`, `/medinet-habu`, or a specific experience/destination
  page. Use descriptive anchor text.
- `excerpt`: 1–3 sentences, the same promise, written to make someone click.

### 6. GEO (getting quoted by AI answers)
- Definitional, self-contained first sentence per section — true out of context.
- Extractable structure: short lists, clear headings, the FAQ, the takeaways.
- Cite sources and name the expert (our Egyptologist, Ahmed on the ground).
- Keep facts current and set `updatedAt` when you refresh an existing article.

### 7. Sales — soft, honest, earned
- Never hard-sell in the prose. The article must stand alone as genuinely useful.
- The argument for us is structural: "anyone can buy the same ticket; we get you
  in *empty*, at the right hour, with the right tomb open." Make the reader feel
  the gap between doing it alone and having it arranged — don't assert it.
- One in-body link to `/concierge-day` with natural anchor text is enough; the
  template adds the standard CTA, author box and sticky bar automatically.

### 8. Assemble the file
Write `content/articles/<slug>/index.mdoc`. Frontmatter is YAML; body is Markdoc.

```markdown
---
title: <The H1 — a real question or claim, not a keyword string>
draft: true
excerpt: >-
  <1–3 sentence promise, click-worthy, honest>
heroImage: /images/articles/<slug>-hero.jpg
category: <temples-tombs | planning-timing | life-in-luxor | myths-mistakes>
author: <Luxor Rising | Ahmed | Dr. Nour>   # byline; see article-labels.ts
readingTime: <e.g. "8 min read">
publishedAt: <YYYY-MM-DD>
updatedAt: <YYYY-MM-DD>    # optional; set when refreshing facts
keyTakeaways:
  - <standalone quotable sentence with the specific fact>
  - <…3–5 total>
faqs:
  - question: <real question>
    answer: <honest answer in voice>
  - <…4–6 total>
sources:
  - label: <Source name, e.g. "Ministry of Tourism & Antiquities — Medinet Habu">
    url: <https://…>
  - <…every source used>
metaTitle: <≤60 chars, keyword-first, year if relevant>
metaDescription: <~155 chars>
---
<body in Markdoc: ## and ### headings, **bold**, > blockquote for an Ahmed line,
- bullet lists. Do NOT put the FAQ or sources in the body — they come from the
fields above. Do NOT add {% #id %} to headings; the editor rejects it.>
```

Field rules:
- `draft: true` **always** on a new article. The user unticks it in Keystatic to
  publish. (Delivering as a draft is the whole point — never auto-publish.)
- `category` must be one of the four exact values above.
- `author`: "Luxor Rising" (brand), "Ahmed" (west-bank local voice), or "Dr. Nour"
  (Egyptologist). Match the voice to the byline.
- Markdoc body headings get their ids and the table of contents automatically;
  write plain `## Heading` text.

### 9. Hero image
- Reference `heroImage: /images/articles/<slug>-hero.jpg`.
- If the image doesn't exist yet, still reference the intended path and tell the
  user which image to add (or offer to generate one via the Higgsfield tools).
  A missing image degrades gracefully; don't block the draft on it.

### 10. Verify and hand off
- Confirm the file parses: valid YAML frontmatter, four-value category, body is
  clean Markdoc.
- The article is now a draft in Keystatic: invisible on the live site and in the
  sitemap, visible in the Keystatic admin for the user to review, edit and
  publish (untick Draft).
- Tell the user: the slug, the one-line angle, the primary keyword, and the top
  sources — so they can sanity-check before publishing.

## Guardrails
- Honesty over hype, every time. If something is overrated, say so — that candour
  is the brand.
- Never invent prices, hours, dates, tomb names, or quotes. Verify or omit.
- Don't contradict the existing site (pricing, product names, "Luxor's West Bank"
  wording). When unsure about a product detail, check the relevant page/CMS entry.
- One article per run unless asked. Quality over volume.
- British English (the existing article uses it: "colour", "metres").
