import type { Metadata } from "next";
import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Markdoc, { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import Faq from "@/components/Faq";
import StickyBar from "@/components/StickyBar";
import ReadingProgress from "@/components/ReadingProgress";
import ArticleToc from "@/components/ArticleToc";
import InlineCta from "@/components/InlineCta";
import AuthorBox from "@/components/AuthorBox";
import ExperienceCard from "@/components/ExperienceCard";
import { reader } from "@/lib/keystatic-reader";
import { ARTICLE_CATEGORY_LABELS, ARTICLE_AUTHORS } from "@/lib/article-labels";
import styles from "./ArticlePage.module.css";

const SLUG = "valley-of-the-kings-which-tombs";

// Structural page furniture below (takeaways, verdict table, both inline
// CTAs, FAQ, bookcard, related experiences) is specific to this article and
// isn't part of the CMS schema, so it stays hardcoded here — only the prose
// body and the fields above come from the articles collection.

const TOC_ITEMS = [
  { id: "mistake", label: "The mistake everyone makes" },
  { id: "worth", label: "Tombs worth your three" },
  { id: "when", label: "When you go matters more" },
  { id: "beyond", label: "What most people miss" },
  { id: "faq", label: "Questions we get asked" },
];

const FAQ_ITEMS = [
  {
    q: "How many tombs can I enter with one ticket?",
    a: "Three, chosen from whichever tombs are open in the current rotation. Tutankhamun (KV62), Seti I (KV17) and Nefertari (in the Valley of the Queens) each require a separate, additional ticket.",
  },
  {
    q: "Is Tutankhamun's tomb worth the extra ticket?",
    a: "Architecturally, no — it is small and modest, and the famous treasures are in Cairo, not in the tomb. Emotionally, for some people, yes. If you're choosing between the extra ticket for Tutankhamun and the one for Seti I, we would send you to Seti I every time.",
  },
  {
    q: "Which tombs are open right now?",
    a: "The rotation changes for conservation reasons, often without announcement. Any list published online — including this one — can be out of date within weeks. We check directly before every guest's day, which is precisely why we exist.",
  },
  {
    q: "What time should I arrive?",
    a: "At opening, around 6am. Between 6:00 and 7:30 you can stand alone inside tombs that will hold forty people by nine o'clock. That hour and a half is worth more than any ticket upgrade.",
  },
  {
    q: "Can I photograph inside the tombs?",
    a: "In most tombs, with a photography ticket bought at the gate. In some — including Seti I — restrictions are tighter and change. We sort this out in advance so nobody is arguing with a guard in front of you.",
  },
];

async function getEntry() {
  const entry = await reader.collections.articles.read(SLUG, { resolveLinkedFiles: true });
  if (!entry) return null;
  return entry;
}

/** Splits the transformed markdoc body into segments, cutting right before
 * each heading whose `{% #id %}` matches one of `splitIds`, in order. */
function splitAtHeadingIds(children: RenderableTreeNode[], splitIds: string[]) {
  const segments: RenderableTreeNode[][] = [];
  let current: RenderableTreeNode[] = [];
  for (const child of children) {
    const id = Tag.isTag(child) ? child.attributes?.id : undefined;
    if (typeof id === "string" && splitIds.includes(id)) {
      segments.push(current);
      current = [child];
    } else {
      current.push(child);
    }
  }
  segments.push(current);
  return segments;
}

export async function generateMetadata(): Promise<Metadata> {
  const entry = await getEntry();
  if (!entry) return {};
  const title = entry.metaTitle || entry.title;
  const description = entry.metaDescription || entry.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/insiders-guide/${SLUG}` },
    openGraph: {
      type: "article",
      siteName: "Luxor Rising",
      title,
      description,
      url: `/insiders-guide/${SLUG}`,
      images: entry.heroImage ? [entry.heroImage] : undefined,
    },
  };
}

export default async function ValleyOfTheKingsArticle() {
  const entry = await getEntry();
  if (!entry) notFound();

  const author = ARTICLE_AUTHORS[entry.author] ?? { name: entry.author, bio: "" };
  const categoryLabel = ARTICLE_CATEGORY_LABELS[entry.category] ?? entry.category;
  const updatedDate = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const { node } = entry.content;
  const transformed = Markdoc.transform(node);
  const rootChildren = Tag.isTag(transformed) ? transformed.children : [transformed];
  const [introAndMistake, setiSection, whenSection, beyondSection, faqHeading] = splitAtHeadingIds(
    rootChildren,
    ["seti", "when", "beyond", "faq"]
  );
  const renderMd = (nodes: RenderableTreeNode[]) => Markdoc.renderers.react(nodes, React, {});

  const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: entry.title,
        description: entry.excerpt,
        image: entry.heroImage ? [`https://luxorrising.com${entry.heroImage}`] : undefined,
        author: {
          "@type": "Person",
          name: author.name,
          jobTitle: "Consigliere, Luxor Rising",
          knowsAbout: ["Valley of the Kings", "Luxor", "Ancient Egypt"],
        },
        reviewedBy: { "@type": "Person", name: "Dr. Nour", jobTitle: "Licensed Egyptologist" },
        publisher: { "@type": "Organization", name: "Luxor Rising" },
        datePublished: entry.publishedAt,
        dateModified: entry.publishedAt,
        mainEntityOfPage: `https://luxorrising.com/insiders-guide/${SLUG}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
          { "@type": "ListItem", position: 2, name: "Insider's Guide", item: "https://luxorrising.com/insiders-guide" },
          { "@type": "ListItem", position: 3, name: entry.title },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <ReadingProgress />
      <Nav
        scrollAware={false}
        links={[
          { href: "/", label: "Home" },
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "/experiences", label: "Experiences" },
          { href: "/insiders-guide", label: "Insider's Guide" },
        ]}
        ctaHref="/concierge-day"
        ctaLabel="Design your day"
      />

      <div className="wrap">
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/insiders-guide">Insider&apos;s Guide</Link>
          <span>/</span>
          {entry.title}
        </nav>

        <header className={styles.head}>
          <div className={styles.kicker}>
            {categoryLabel} · {entry.readingTime}
          </div>
          <h1 className="display">{entry.title}</h1>
          <p className={styles.standfirst}>{entry.excerpt}</p>
        </header>

        <div className={styles.byline}>
          <div className={styles.bylineAvatar} aria-hidden="true">
            {author.name.charAt(0)}
          </div>
          <div className={styles.bylineT}>
            <b>{author.name}</b>
            <span>{author.bio}</span>
          </div>
          <div className={styles.bylineMeta}>
            <span className={styles.verified}>
              <span className={styles.check}>✓</span>Fact-checked by Dr. Nour, licensed Egyptologist
            </span>
            {updatedDate && <span>Updated {updatedDate}</span>}
          </div>
        </div>

        {entry.heroImage && (
          <figure className={styles.heroImg}>
            <Image src={entry.heroImage} alt={entry.title} fill priority sizes="(max-width: 780px) 100vw, 780px" />
          </figure>
        )}
        <figcaption className={styles.cap}>
          A descending corridor in the Valley of the Kings. Most visitors photograph it for
          ninety seconds and leave.
        </figcaption>

        <div className={styles.cols}>
          {/* ARTICLE */}
          <article className={styles.body}>
            <div className={styles.takeaway}>
              <h4>The short version</h4>
              <ul>
                <li>
                  A standard ticket covers <strong>three tombs</strong> from the open rotation —
                  Tutankhamun, Seti I and Nefertari all cost extra, separately.
                </li>
                <li>
                  The three most people default to are{" "}
                  <strong>Ramesses IX, Ramesses IV and Tutankhamun</strong>. Only one of those
                  earns its place.
                </li>
                <li>
                  Our usual three: <strong>KV11 (Ramesses III)</strong>,{" "}
                  <strong>KV2 (Ramesses IV)</strong> and <strong>KV14 (Tausert/Setnakht)</strong> —
                  subject to what&apos;s open that week.
                </li>
                <li>
                  <strong>Seti I (KV17)</strong> costs around €50 extra and is the single best
                  thing in the Valley. If you only splurge once, splurge here — not on
                  Tutankhamun.
                </li>
                <li>
                  The rotation changes constantly.{" "}
                  <strong>The right answer this month is not the right answer next month</strong>{" "}
                  — which is the entire argument for having someone local check before you go.
                </li>
              </ul>
            </div>

            {renderMd(introAndMistake)}

            <div className={styles.verdict}>
              <div className={styles.vrow}>
                <div>
                  <b>KV11 — Ramesses III</b>
                  <span>Long, wide, and covered end to end. The side chambers with the harpists are worth the ticket alone.</span>
                </div>
                <span className={`${styles.v} ${styles.vYes}`}>Always</span>
              </div>
              <div className={styles.vrow}>
                <div>
                  <b>KV17 — Seti I</b>
                  <span>The finest tomb ever cut in Egypt. Costs roughly €50 on top. Reopened after decades of closure.</span>
                </div>
                <span className={`${styles.v} ${styles.vYes}`}>If you do one thing</span>
              </div>
              <div className={styles.vrow}>
                <div>
                  <b>KV14 — Tausert / Setnakht</b>
                  <span>Enormous, strange, and usually near-empty. A queen&apos;s tomb taken over by a king.</span>
                </div>
                <span className={`${styles.v} ${styles.vYes}`}>Always</span>
              </div>
              <div className={styles.vrow}>
                <div>
                  <b>KV2 — Ramesses IV</b>
                  <span>Bright, colourful, easy on the legs. Deserves its popularity — the one default choice that&apos;s correct.</span>
                </div>
                <span className={`${styles.v} ${styles.vMaybe}`}>Good</span>
              </div>
              <div className={styles.vrow}>
                <div>
                  <b>KV62 — Tutankhamun</b>
                  <span>Small and architecturally modest. Extra ticket. Go for the meaning, not the tomb.</span>
                </div>
                <span className={`${styles.v} ${styles.vMaybe}`}>For the name</span>
              </div>
              <div className={styles.vrow}>
                <div>
                  <b>KV6 — Ramesses IX</b>
                  <span>Fine, but you are only in it because it is fifty metres from the gate.</span>
                </div>
                <span className={`${styles.v} ${styles.vNo}`}>Skip</span>
              </div>
            </div>

            {renderMd(setiSection)}

            <InlineCta
              eyebrow="We handle this for you"
              title="We check the rotation the week you arrive"
              body="Which tombs are open changes constantly. We call the Valley, choose your three against what's actually accessible, and have the tickets in hand before you get out of the car."
              ctaLabel="Design your day →"
              ctaHref="/concierge-day?start=valley"
            />

            {renderMd(whenSection)}
            {renderMd(beyondSection)}

            <InlineCta
              eyebrow="The day this article describes"
              title="Valley at dawn, Medinet Habu by nine"
              body="Private, timed against the coaches, with a licensed Egyptologist who can actually read the walls. From €640 for the day — free cancellation up to 7 days before."
              ctaLabel="See the experiences →"
              ctaHref="/experiences"
            />

            {renderMd(faqHeading)}
          </article>

          {/* SIDEBAR */}
          <aside className={styles.side}>
            <ArticleToc items={TOC_ITEMS} />

            <div className={styles.bookcard}>
              <div className={styles.bookcardIm}>
                <Image
                  src="/images/valley-kings-tomb-pillar.jpg"
                  alt="Royal tomb entrance in the Valley of the Kings"
                  fill
                  sizes="320px"
                  loading="lazy"
                />
              </div>
              <div className={styles.bookcardBody}>
                <div className={styles.bcEyebrow}>Do it properly</div>
                <h4>Valley of the Kings, tombs chosen for you</h4>
                <p>
                  We check what&apos;s open the week you arrive, pick your three, and get you in
                  at opening — before the coaches.
                </p>
                <div className={styles.bcPrice}>
                  <b>€640</b>
                  <i>/ day, private</i>
                </div>
                <Link href="/concierge-day?start=valley" className="btn btn-primary" style={{ width: "100%" }}>
                  Design your day →
                </Link>
                <p className={styles.bcTrust}>Free cancellation up to 7 days before</p>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <section className="faq" style={{ maxWidth: 720, margin: "0" }}>
          <Faq items={FAQ_ITEMS} />
        </section>

        {/* AUTHOR */}
        <AuthorBox
          name={author.name}
          bio="Born on the west bank of Luxor, twenty minutes from the Valley gate. He has spent twenty years opening doors in this city — for archaeologists, film crews, and people who simply wanted to see it properly. He is our consigliere: he does not carry the flag, he decides the order of the day."
          href="/insiders-guide"
          ctaLabel="More from the guide →"
        />
      </div>

      {/* RELATED EXPERIENCES */}
      <section className={styles.rel}>
        <Reveal className="wrap">
          <h2 className="display">Stand in it, don&apos;t just read about it</h2>
          <p className={styles.relSub}>Every experience mentioned in this article, timed the way it should be.</p>
          <div className={styles.rgrid}>
            <ExperienceCard
              compact
              href="/concierge-day?start=valley"
              src="/images/valley-kings-tomb-pillar.jpg"
              alt="Valley of the Kings tomb entrance"
              title="Valley of the Kings, at opening"
              hook="Your three tombs, chosen against the live rotation, entered while the Valley is still empty."
              priceLabel="From"
              priceValue="€640"
              priceNote="/ day"
              ctaLabel="Reserve"
            />
            <ExperienceCard
              compact
              href="/medinet-habu"
              src="/images/medinet-habu-facade.jpg"
              alt="Medinet Habu temple facade"
              title="Medinet Habu, before anyone else"
              hook="The temple that still has its colour, fifteen minutes from the Valley — and almost nobody in it."
              priceLabel="Included"
              priceValue="Included"
              priceNote="with any day"
              ctaLabel="See the day"
            />
            <ExperienceCard
              compact
              href="/concierge-day?add=nefertari"
              src="/images/tomb-painted-relief-offering-figure_IMG_20251009_111001.jpg"
              alt="Painted relief inside a royal tomb"
              title="Nefertari — the finest painted tomb on earth"
              hook="Capped at a handful of visitors a day. We hold the slot; you simply arrive."
              priceLabel="Add-on"
              priceValue="+€180"
              priceNote="/ person"
              ctaLabel="Add to a day"
            />
          </div>
        </Reveal>
      </section>

      <div style={{ paddingBottom: "64px" }}>
        <MinimalFooter
          links={[
            { href: "/", label: "Home" },
            { href: "/concierge-day", label: "Concierge Days" },
            { href: "/experiences", label: "Experiences" },
            { href: "/insiders-guide", label: "Insider's Guide" },
          ]}
        />
      </div>

      <StickyBar
        name="€640"
        meta="a private day · Valley at dawn · free cancellation up to 7 days before"
        ctaHref="/concierge-day?start=valley"
        ctaLabel="Design your day →"
        revealOnScroll
        revealAfter={700}
      />
    </>
  );
}
