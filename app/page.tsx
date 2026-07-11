import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import styles from "./HomePage.module.css";

const TRUST_ITEMS = [
  "≤4 guests per day",
  "Private licensed Egyptologist",
  "Empty temples at dawn",
  "Zero logistics for you",
  "7-day free cancellation",
];

export default function HomePage() {
  return (
    <>
      <Nav
        links={[
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "#villas", label: "Private Villas" },
          { href: "#experiences", label: "Experiences" },
          { href: "#guide", label: "Insider's Guide" },
          { href: "#about", label: "About" },
        ]}
        ctaHref="/concierge-day"
        ctaLabel="Design your day"
      />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBgs}>
          <div className={styles.heroBg}>
            <Image src="/images/hero-desert-night.jpg" alt="" fill priority sizes="100vw" />
          </div>
        </div>
        <div className={styles.heroScrim} />
        <div className={`wrap ${styles.heroContent}`}>
          <span className="eyebrow">Private concierge · Luxor · The Nile · The West Bank</span>
          <h1 className={`display ${styles.heroClaim}`}>
            Arrive somewhere your future self will return to.
          </h1>
          <div className={styles.heroSub}>
            Private, unhurried days in ancient Egypt — arranged one experience at a time, for no
            more than four guests, by people who live here.
          </div>
          <div className={styles.heroCta}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="#experiences" className="btn btn-ghost btn-lg">
              Explore experiences
            </Link>
          </div>
          <div className={styles.heroTrust}>
            <span className="stars">★ ★ ★ ★ ★</span> <b>4.9</b> from recent guests · 60+ private
            days arranged · Fully bespoke
          </div>
        </div>
        <div className={styles.scrollHint}>Scroll</div>
      </section>

      {/* TRUST STRIP */}
      <section className={styles.trustStrip}>
        <div className="wrap">
          <div className={styles.tsInner}>
            {TRUST_ITEMS.map((item, i) => (
              <div className={styles.tsItem} key={item}>
                {i > 0 && <span className={styles.tdot} />}
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section className={styles.posn}>
        <Reveal className={`wrap ${styles.posnGrid}`}>
          <div className={styles.posnMedia}>
            <Image src="/images/desert-sunset-silhouette.jpg" alt="" fill sizes="50vw" />
            <span className={styles.posnBadge}>Paced to the light</span>
          </div>
          <div className={styles.posnCopy}>
            <span className="eyebrow">The promise</span>
            <h2 className="display">
              You won&apos;t follow a schedule.
              <br />
              You&apos;ll follow the light.
            </h2>
            <p className="lead">
              Most of Egypt is sold by the busload — three temples before lunch, a boat shared
              with eighty strangers. We do the opposite: one experience at a time, paced to the
              hour the light is most beautiful, with every detail arranged so you never lift a
              finger.
            </p>
            <Link href="#how" className={styles.linkArrow}>
              See how a day unfolds →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* OFFERING */}
      <section id="offering" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <Reveal className="center" style={{ marginBottom: "2.2rem" }}>
            <span className="eyebrow">How we look after you</span>
            <h2 className="display">Three ways into Egypt</h2>
            <p
              className="lead"
              style={{ marginTop: ".7rem", maxWidth: "54ch", marginLeft: "auto", marginRight: "auto" }}
            >
              Start with a single perfect day — then let it become a villa, a longer stay, or a
              place you keep returning to.
            </p>
          </Reveal>
          <Reveal className={styles.offerGrid}>
            <Link href="/concierge-day" className={`${styles.offer} ${styles.feature}`}>
              <span className={styles.offerTag}>Start here</span>
              <div className={styles.im}>
                <Image src="/images/valley-kings-tomb-pillar.jpg" alt="" fill sizes="33vw" />
              </div>
              <div className={styles.bd}>
                <div className={styles.k}>The signature</div>
                <h3>The Concierge Day</h3>
                <p>
                  A private day, timed before the crowds — your own Egyptologist, the Nile or the
                  desert, and not one decision to make.
                </p>
                <div className={styles.offerFoot}>
                  <span className={styles.price}>From €450</span>
                  <span className={styles.go}>Design your day →</span>
                </div>
              </div>
            </Link>
            <Link href="#villas" className={styles.offer}>
              <div className={styles.im}>
                <Image src="/images/private-villa-pool.jpg" alt="" fill sizes="33vw" />
              </div>
              <div className={styles.bd}>
                <div className={styles.k}>Stay</div>
                <h3>Private Villas</h3>
                <p>
                  Off-market villas in Luxor you won&apos;t find on any booking site — found,
                  vetted and arranged for you.
                </p>
                <div className={styles.offerFoot}>
                  <span className={styles.go}>Enquire →</span>
                </div>
              </div>
            </Link>
            <Link href="/concierge-day" className={styles.offer}>
              <div className={styles.im}>
                <Image src="/images/desert-stargazing-dune.jpg" alt="" fill sizes="33vw" />
              </div>
              <div className={styles.bd}>
                <div className={styles.k}>Go deeper</div>
                <h3>Bespoke &amp; Multi-day</h3>
                <p>
                  Several days, fully tailored — signatures unlock, the per-day value climbs, and
                  the trip is built around you.
                </p>
                <div className={styles.offerFoot}>
                  <span className={styles.go}>Build yours →</span>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* MOMENT */}
      <section className={styles.moment}>
        <Image src="/images/karnak-columns-detail.jpg" alt="" fill sizes="100vw" />
        <div className={styles.momentScrim} />
        <Reveal className={`wrap ${styles.momentIn}`}>
          <p>
            Three thousand years of wonder — arranged entirely around{" "}
            <em>one unforgettable day.</em>
          </p>
        </Reveal>
      </section>

      {/* EXPERIENCES / GALLERY */}
      <section id="experiences">
        <div className="wrap center" style={{ marginBottom: ".4rem" }}>
          <span className="eyebrow">A glimpse of Egypt</span>
          <h2 className="display">Moments we arrange</h2>
          <p
            className="lead"
            style={{ marginTop: ".6rem", maxWidth: "60ch", marginLeft: "auto", marginRight: "auto" }}
          >
            Temples before the crowds, the Nile at golden hour, the desert under stars —
            delivered by our licensed local partners, curated by us.
          </p>
        </div>
        <div className="wrap">
          <Reveal className={styles.galleryMosaic}>
            {[
              { src: "/images/desert-stargazing-dune.jpg", cap: "The desert sky, far from everything", big: true },
              { src: "/images/nile-felucca-table.jpg", cap: "The Nile from your table" },
              { src: "/images/temple-stone-relief.jpg", cap: "Stone that has waited millennia" },
              { src: "/images/nile-river-solo.jpg", cap: "The river to yourself" },
              { src: "/images/desert-dinner-table.jpg", cap: "A private table in the dunes" },
              { src: "/images/west-bank-dawn.jpg", cap: "Dawn over the West Bank" },
            ].map((g) => (
              <div key={g.src} className={`${styles.gm} ${g.big ? styles.gmBig : ""}`}>
                <Image src={g.src} alt={g.cap} fill sizes={g.big ? "50vw" : "25vw"} />
                <div className={styles.gmCap}>{g.cap}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">How it works</span>
          <h2 className="display">You design it. We arrange everything.</h2>
          <div className="steps3">
            <div className="s3">
              <div className="num">01</div>
              <h4>You design your day</h4>
              <p>Pick your date and preferences in a minute on our day page.</p>
            </div>
            <div className="s3">
              <div className="num">02</div>
              <h4>We arrange every detail</h4>
              <p>
                Entries, transfers, your own licensed Egyptologist, the Nile or the desert — all
                booked for you.
              </p>
            </div>
            <div className="s3">
              <div className="num">03</div>
              <h4>You simply arrive</h4>
              <p>Your consigliere is reachable all day. You experience Egypt; we handle the rest.</p>
            </div>
          </div>
          <div className="disclosure">
            Luxor Rising is your private concierge &amp; advisor. We arrange and coordinate;
            experiences, guiding and transfers are delivered by our licensed local partners. Each
            concierge day is a single day with no overnight stay.
          </div>
        </Reveal>
      </section>

      {/* WHY */}
      <section id="about">
        <Reveal className="wrap center">
          <span className="eyebrow">Why Luxor Rising</span>
          <h2 className="display">The difference is everything you don&apos;t have to do</h2>
          <div className={styles.whyGrid}>
            {[
              ["✦", "Truly private", "Just you and up to three guests — never a coach of strangers."],
              ["❖", "Insider access", "The right places at the right hour, and a few almost nobody sees."],
              ["◆", "Licensed locals", "Your own licensed Egyptologist and vetted local hosts deliver every moment."],
              ["✧", "Effortless", "No planning, no queues, no decisions — and a promise it's right."],
            ].map(([icon, title, body]) => (
              <div className={styles.whyI} key={title}>
                <div className="ic">{icon}</div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap center">
          <span className="eyebrow">From recent guests</span>
          <h2 className="display">The day they remember most</h2>
          <div className="tposts">
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;We&apos;ve travelled a lot. This was the first time we felt like guests, not
                tourists. Karnak at sunrise, alone, is something I&apos;ll never forget.&quot;
              </blockquote>
              <div className="who">— Lena &amp; Tomáš, Vienna</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;I planned nothing and missed nothing. Our Egyptologist was extraordinary,
                and the felucca at sunset was pure magic.&quot;
              </blockquote>
              <div className="who">— Marcus, London</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;Worth every euro. They handled a last-minute change without us even
                noticing. We&apos;re already planning to come back through them.&quot;
              </blockquote>
              <div className="who">— Sophie, Munich</div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: ".74rem", marginTop: "1rem" }}>
            Sample testimonials — to be replaced with real guest reviews.
          </p>
        </Reveal>
      </section>

      {/* VILLAS */}
      <section id="villas">
        <Reveal
          className="wrap"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "clamp(1.6rem,4vw,3.2rem)",
            alignItems: "center",
          }}
        >
          <div className={styles.villasMedia}>
            <Image src="/images/private-villa-pool.jpg" alt="" fill sizes="50vw" />
          </div>
          <div>
            <span className="eyebrow">Private villas</span>
            <h2 className="display" style={{ margin: ".3rem 0 .8rem" }}>
              Stay somewhere you won&apos;t find online
            </h2>
            <p className="lead">
              We curate off-market private villas in and around Luxor — the kind that never reach
              booking sites. Tell us what you&apos;re dreaming of; we present the options, arrange
              the details, and you contract directly with the owner.
            </p>
            <div style={{ marginTop: "1.6rem" }}>
              <Link href="/concierge-day" className="btn btn-line">
                Ask about villas →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* INSIDER'S GUIDE */}
      <section id="guide" style={{ background: "var(--color-paper)" }}>
        <div className="wrap center" style={{ marginBottom: ".4rem" }}>
          <span className="eyebrow">Insider&apos;s Guide</span>
          <h2 className="display">Read before you go</h2>
        </div>
        <div className="wrap">
          <Reveal className={styles.blogGrid}>
            {[
              {
                src: "/images/valley-kings-tomb-pillar.jpg",
                k: "Luxor",
                h: "How to see the Valley of the Kings without the crowds",
                p: "The hours, the tombs worth your time, and what most visitors get wrong.",
              },
              {
                src: "/images/nile-river-solo.jpg",
                k: "Day trips",
                h: "Hurghada to Luxor: the perfect day trip",
                p: "Is it worth it, how long it really takes, and how to do it in comfort.",
              },
              {
                src: "/images/temple-stone-relief.jpg",
                k: "Planning",
                h: "The best time of year to visit Luxor",
                p: "Heat, crowds and light — month by month, from people who live it.",
              },
            ].map((post) => (
              <Link href="#" className={styles.post} key={post.h}>
                <div className={styles.postIm}>
                  <Image src={post.src} alt="" fill sizes="33vw" />
                </div>
                <div className={styles.postBd}>
                  <div className={styles.postK}>{post.k}</div>
                  <h4>{post.h}</h4>
                  <p>{post.p}</p>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.final}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your date is waiting</span>
          <h2 className="display">Give us one day. We&apos;ll give you the one you remember.</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Private, effortless, and guaranteed — from €450. Design your day in a minute.
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
          </div>
        </Reveal>
      </section>

      <FullFooter
        columns={[
          {
            title: "Concierge",
            links: [
              { href: "/concierge-day", label: "Concierge Days" },
              { href: "/concierge-day", label: "Bespoke & multi-day" },
              { href: "#villas", label: "Private villas" },
              { href: "#experiences", label: "Experiences" },
            ],
          },
          {
            title: "Company",
            links: [
              { href: "#about", label: "About us" },
              { href: "#guide", label: "Insider's Guide" },
              { href: "#how", label: "How it works" },
            ],
          },
          {
            title: "Plan with us",
            links: [
              { href: "#", label: "WhatsApp" },
              { href: "#", label: "hello@luxorrising.com" },
              { href: "#", label: "Luxor & Hurghada, Egypt" },
            ],
          },
        ]}
      />
    </>
  );
}
