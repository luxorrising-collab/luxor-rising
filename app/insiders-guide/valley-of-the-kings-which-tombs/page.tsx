import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
import styles from "./ArticlePage.module.css";

export const metadata: Metadata = {
  title: "Which Tombs in the Valley of the Kings Are Actually Worth It (2026)",
  description:
    "Your ticket covers three tombs out of around eight that are open. Here's which ones we choose for guests, which are overrated, and why the right answer changes month to month.",
  alternates: { canonical: "/insiders-guide/valley-of-the-kings-which-tombs" },
  openGraph: {
    type: "article",
    siteName: "Luxor Rising",
    title: "Which Tombs in the Valley of the Kings Are Actually Worth It",
    description: "Your ticket gets you three. Two of the three most people pick are the wrong ones.",
    url: "/insiders-guide/valley-of-the-kings-which-tombs",
    images: ["/images/tomb-corridor-dark-chamber_IMG_20251009_111103.jpg"],
  },
};

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

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Which tombs in the Valley of the Kings are actually worth it",
      description:
        "Your ticket gets you into three of around eight open tombs. Which ones are worth it, which are overrated, and why the answer changes month to month.",
      image: ["https://luxorrising.com/images/tomb-corridor-dark-chamber_IMG_20251009_111103.jpg"],
      author: {
        "@type": "Person",
        name: "Ahmed",
        jobTitle: "Consigliere, Luxor Rising",
        knowsAbout: ["Valley of the Kings", "Luxor", "Ancient Egypt"],
      },
      reviewedBy: { "@type": "Person", name: "Dr. Nour", jobTitle: "Licensed Egyptologist" },
      publisher: { "@type": "Organization", name: "Luxor Rising" },
      datePublished: "2026-07-01",
      dateModified: "2026-07-01",
      mainEntityOfPage: "https://luxorrising.com/insiders-guide/valley-of-the-kings-which-tombs",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
        { "@type": "ListItem", position: 2, name: "Insider's Guide", item: "https://luxorrising.com/insiders-guide" },
        { "@type": "ListItem", position: 3, name: "Valley of the Kings" },
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

export default function ValleyOfTheKingsArticle() {
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
          Valley of the Kings
        </nav>

        <header className={styles.head}>
          <div className={styles.kicker}>Temples &amp; tombs · 9 min read</div>
          <h1 className="display">Which tombs in the Valley of the Kings are actually worth it</h1>
          <p className={styles.standfirst}>
            Your ticket gets you into three. Around eight are usually open. And two of the three
            most people pick are, on most days, the wrong ones.
          </p>
        </header>

        <div className={styles.byline}>
          <div className={styles.bylineAvatar} aria-hidden="true">
            A
          </div>
          <div className={styles.bylineT}>
            <b>Ahmed</b>
            <span>Our consigliere in Luxor. Born on the west bank, twenty minutes from the Valley gate.</span>
          </div>
          <div className={styles.bylineMeta}>
            <span className={styles.verified}>
              <span className={styles.check}>✓</span>Fact-checked by Dr. Nour, licensed Egyptologist
            </span>
            <span>Updated 1 July 2026</span>
          </div>
        </div>

        <figure className={styles.heroImg}>
          <Image
            src="/images/tomb-corridor-dark-chamber_IMG_20251009_111103.jpg"
            alt="Painted corridor descending into a royal tomb in the Valley of the Kings"
            fill
            priority
            sizes="(max-width: 780px) 100vw, 780px"
          />
        </figure>
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

            <p>
              Here is the thing nobody explains at the ticket booth: the Valley of the Kings is
              not one attraction. It is sixty-odd tombs, of which roughly eight are open on any
              given day, on a rotation that changes for conservation reasons without much
              announcement. Your standard ticket admits you to <strong>three of them</strong>.
              Which three is entirely your choice — and almost everybody chooses badly, because
              they choose at the gate, in the heat, with no information.
            </p>

            <p>
              Ahmed grew up twenty minutes from that gate, and has been inside all of them. So
              let this save you the mistake people make every morning.
            </p>

            <h2 id="mistake">The mistake almost everyone makes</h2>

            <p>
              Most visitors arrive between 9 and 11am, having taken a coach from Hurghada that
              left at three in the morning. They are tired. It is thirty-eight degrees in the
              ravine. Someone points at the two tombs nearest the entrance — usually{" "}
              <strong>Ramesses IX (KV6)</strong> and <strong>Ramesses IV (KV2)</strong>, because
              they are the closest and the queues move — and that is two of your three gone,
              chosen by proximity rather than merit.
            </p>

            <p>
              Then they pay extra for <strong>Tutankhamun (KV62)</strong>, because it is the name
              they know.
            </p>

            <p>
              And this is the honest part that costs us money to say:{" "}
              <em>Tutankhamun&apos;s tomb is, architecturally, one of the least impressive in the
              Valley.</em> It is small. It was not built for him — he died young and they buried
              him in a hurry, in what was probably meant to be a courtier&apos;s tomb. The
              treasure that made it famous is not in it; it is in Cairo. What remains is a mummy
              in a case, one decorated chamber, and a lot of people shuffling in a small space.
            </p>

            <div className={styles.pull}>
              People come out of Tutankhamun&apos;s tomb slightly embarrassed, as though they
              were supposed to feel something and did not.
              <cite>— Ahmed, on the west bank</cite>
            </div>

            <p>
              It is not that you shouldn&apos;t go. If standing two metres from the boy king
              matters to you — and for many people it genuinely does, and that is a perfectly
              good reason — go. Just go <em>knowing</em> what it is, and do not let it be the
              thing you spent your money and your energy on.
            </p>

            <h2 id="worth">The tombs actually worth your three</h2>

            <p>
              These are the ones we take guests into, when they are open. The Valley rotates, so
              treat this as a ranking rather than a fixed list.
            </p>

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

            <h3>The one we&apos;d actually pay extra for</h3>

            <p>
              <strong>Seti I</strong> is not a tomb. It is a cathedral cut downwards into rock,
              over a hundred metres of it, every surface carved and painted, the astronomical
              ceiling still holding its blue. It was closed for decades and reopened with a
              separate, expensive ticket precisely because they want to limit how many bodies
              breathe in it.
            </p>

            <p>
              If you are choosing between the extra ticket for Tutankhamun and the extra ticket
              for Seti I, and you can only justify one: <strong>it is Seti I, and it is not
              close.</strong>
            </p>

            <InlineCta
              eyebrow="We handle this for you"
              title="We check the rotation the week you arrive"
              body="Which tombs are open changes constantly. We call the Valley, choose your three against what's actually accessible, and have the tickets in hand before you get out of the car."
              ctaLabel="Design your day →"
              ctaHref="/concierge-day?start=valley"
            />

            <h2 id="when">When you go matters more than which you pick</h2>

            <p>
              You can choose the three best tombs in the Valley and still have a mediocre
              morning, because you arrived at ten with four coaches. The tombs are narrow. Forty
              people in a corridor built for a burial procession is not an experience, it is a
              queue with paintings.
            </p>

            <p>
              The Valley opens at six. Between <strong>six and half past seven</strong>, you can
              stand alone in KV11. By nine, you cannot. That gap — an hour and a half — is worth
              more than any ticket upgrade you can buy.
            </p>

            <ul>
              <li>
                <strong>Arrive at opening.</strong> Not &quot;early.&quot; At opening. The
                difference between 6:00 and 7:30 is the difference between solitude and
                shuffling.
              </li>
              <li>
                <strong>Do the deepest tomb first</strong>, while it is still cool and your legs
                are fresh. The descents are steeper than people expect.
              </li>
              <li>
                <strong>Skip the middle of the day entirely.</strong> Between eleven and three the
                ravine holds heat like an oven, and the light for photographs is flat and cruel.
              </li>
              <li>
                <strong>Come back in the late afternoon</strong> for the west bank temples, when
                the stone goes orange.
              </li>
            </ul>

            <p>
              This is the single reason we build days the way we do. It is not that our guests
              get better tombs — anyone can buy the same ticket. It is that they get them{" "}
              <em>empty</em>.
            </p>

            <h2 id="beyond">What most people miss entirely</h2>

            <p>
              Fifteen minutes from the Valley gate is <strong>Medinet Habu</strong> — the
              mortuary temple of Ramesses III, still holding its original paint, and on most
              mornings almost deserted. It is, to our mind, the most beautiful thing on the west
              bank, and the majority of visitors never see it, because it is not on the coach
              itinerary.
            </p>

            <p>
              Ten minutes the other way is the tomb of <strong>Nefertari</strong>, which is not
              in the Valley of the Kings at all but the Valley of the Queens, and which is the
              most beautiful painted surface most guests have ever stood in front of. Entry is
              capped and expensive. People come out silent. It is one of the only times we&apos;ve
              seen tourists cry.
            </p>

            <p>
              If you have a day here — a real day, not a stop on a bus route — you can do the
              Valley properly at dawn, Medinet Habu at nine while it is still cool, and be
              drinking tea somewhere shaded before the heat arrives. That is not a luxury
              itinerary. It is just the correct order, which nobody tells you.
            </p>

            <InlineCta
              eyebrow="The day this article describes"
              title="Valley at dawn, Medinet Habu by nine"
              body="Private, timed against the coaches, with a licensed Egyptologist who can actually read the walls. From €640 for the day — free cancellation up to 7 days before."
              ctaLabel="See the experiences →"
              ctaHref="/experiences"
            />

            <h2 id="faq">Questions we get asked</h2>
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
          name="Ahmed"
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
