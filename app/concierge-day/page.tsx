import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import DayConfigurator from "@/components/DayConfigurator";
import styles from "./ConciergeDayPage.module.css";

export const metadata: Metadata = {
  title: "The Signature Concierge Day",
  description:
    "A private day in Luxor, timed before the crowds — your own Egyptologist, the Nile or the desert, and not one decision to make. From €450.",
};

const EXPERIENCES = [
  {
    src: "/images/karnak-columns-detail.jpg",
    h: "Karnak at dawn",
    p: "The great hypostyle hall before the crowds arrive — arranged privately.",
  },
  {
    src: "/images/valley-kings-tomb-pillar.jpg",
    h: "Valley of the Kings, with your own Egyptologist",
    p: "The royal tombs, read for you by a licensed local guide.",
  },
  {
    src: "/images/nile-river-solo.jpg",
    h: "A private felucca at golden hour",
    p: "The river to yourself as the light turns — hosted by our local boatman.",
  },
  {
    src: "/images/desert-dinner-table.jpg",
    h: "A sunset picnic in the dunes",
    p: "A quiet table in the sand, set by our local host as the sun drops.",
  },
  {
    src: "/images/temple-stone-relief.jpg",
    h: "Medinet Habu",
    p: "Our insider temple — colour still on the walls, almost nobody there. Yours from day one.",
  },
  {
    src: "/images/west-bank-dawn.jpg",
    h: "Hot-air balloon at dawn",
    p: "Float over the West Bank at sunrise — we'll arrange it on request.",
  },
];

const BONUS_EXPERIENCES = [
  {
    src: "/images/temple-stone-relief.jpg",
    k: "Signature bonus ★",
    h: "Deir el-Shelwit — the hidden temple of Isis",
    p: "A near-secret Greco-Roman temple, its ceilings still deep with colour. On us.",
  },
  {
    src: "/images/karnak-columns-detail.jpg",
    k: "After dark",
    h: "A night in Luxor city",
    p: "The souk, the lantern-lit Corniche, and hosts who actually know the place.",
  },
];

const GALLERY = [
  { src: "/images/desert-stargazing-dune.jpg", cap: "The desert sky, far from everything", big: true },
  { src: "/images/nile-felucca-table.jpg", cap: "The Nile from your table" },
  { src: "/images/temple-stone-relief.jpg", cap: "Stone that has waited millennia" },
  { src: "/images/private-villa-pool.jpg", cap: "A private villa, found for you" },
  { src: "/images/desert-dinner-table.jpg", cap: "Golden hour in the dunes" },
  { src: "/images/west-bank-dawn.jpg", cap: "Dawn over the West Bank" },
];

const FAQ_ITEMS = [
  {
    q: "Is this really worth it over a cheap group tour?",
    a: "A group tour saves a little money and costs you the experience — crowds, rushing, and a day you don't control. We give you the temples before the crowds, your own expert, and zero decisions. Most guests tell us it was the best day of their trip. That's what you're paying for.",
  },
  {
    q: "Are you a travel agency?",
    a: "No. We're your private concierge and advisor. We arrange and coordinate your day; the experiences, guiding and transfers are delivered by our licensed local partners. Each day is a single day with no overnight.",
  },
  {
    q: "Can I pay part on the day?",
    a: "Yes. Pay in full online, or place a deposit now to lock your date and settle the rest on the day with your concierge.",
  },
  {
    q: "What if my plans change?",
    a: "Cancel up to 7 days before for a full refund, no questions asked. Closer to the day, talk to your consigliere — we'll do everything we can to move it.",
  },
  {
    q: "Who actually guides and drives?",
    a: "Licensed local specialists — a licensed Egyptologist for the monuments, vetted drivers and hosts. We select, brief and coordinate them, and stay reachable all day.",
  },
  {
    q: "What if I want more than one day?",
    a: "Add days in the configurator — the per-day price drops and extra signatures and bonuses unlock (Medinet Habu, a private photoshoot, a welcome gift and more). Each day stays a single day; we never bundle an overnight.",
  },
];

export default function ConciergeDayPage() {
  return (
    <>
      <Nav scrollAware={false} ctaHref="#design" ctaLabel="Design your day" />

      {/* HERO */}
      <section className={styles.phero}>
        <div className={styles.pheroBgs}>
          {["/images/nile-river-solo.jpg", "/images/west-bank-dawn.jpg", "/images/karnak-columns-detail.jpg"].map(
            (src) => (
              <div key={src} className={styles.pheroBg}>
                <Image src={src} alt="" fill priority sizes="100vw" />
              </div>
            )
          )}
        </div>
        <div className={styles.pheroScrim} />
        <div className={`wrap ${styles.pheroContent}`}>
          <span className="eyebrow">Private concierge · Luxor &amp; the West Bank</span>
          <h1 className="display">The one day in Egypt you&apos;ll never stop talking about.</h1>
          <div className={styles.oneline}>
            Your private consigliere arranges everything — the temples before the crowds, your
            own Egyptologist, the Nile at golden hour. You bring nothing but yourself.
          </div>
          <div className={styles.raterow}>
            <span className="stars">★ ★ ★ ★ ★</span> <b>4.9</b> · 60+ private days arranged · for
            travellers already in Hurghada &amp; Luxor
          </div>
          <div className={styles.priceRow}>
            <span className="from">From</span>
            <span className="amt">€450</span>
            <span className="per">/ day · ≤4 guests, private</span>
          </div>
          <Link href="#design" className="btn btn-primary btn-lg">
            Design your day →
          </Link>
          <div className={styles.heroFacts}>
            <div className="f">
              <b>Zero</b>
              <span>Decisions for you</span>
            </div>
            <div className="f">
              <b>≤4</b>
              <span>You &amp; your group</span>
            </div>
            <div className="f">
              <b>Local</b>
              <span>Licensed experts</span>
            </div>
            <div className="f">
              <b>7-day</b>
              <span>Free cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTRAST */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">Why most people leave Egypt disappointed</span>
          <h2 className="display">You came for the wonder. Not for a queue.</h2>
          <p className="lead" style={{ marginTop: "1rem" }}>
            Most visitors meet Luxor through a packed coach, twenty rushed minutes per temple, the
            midday heat, and a guide they share with forty strangers. The real Egypt — the quiet,
            the colour, the awe — passes them by. It doesn&apos;t have to be your story.
          </p>
        </Reveal>
        <div className="wrap">
          <Reveal className={styles.cmp}>
            <div className={`${styles.col} ${styles.bad}`}>
              <h4>The usual way</h4>
              <ul>
                <li>A coach with 40 strangers, on someone else&apos;s clock</li>
                <li>Temples at midday, shoulder to shoulder</li>
                <li>Hours lost to planning, booking, haggling</li>
                <li>A generic script, rushed and impersonal</li>
                <li>You hope it&apos;s good. You find out on the day.</li>
              </ul>
            </div>
            <div className={`${styles.col} ${styles.good}`}>
              <h4>A Luxor Rising day</h4>
              <ul>
                <li>Private — just you and up to three guests</li>
                <li>Karnak at dawn, before the crowds arrive</li>
                <li>Every detail arranged; you make no decisions</li>
                <li>Your own licensed Egyptologist, the story unfolded for you</li>
                <li>A consigliere on call all day, and a promise it&apos;s right</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DREAM */}
      <section className={styles.dream}>
        <Image src="/images/karnak-columns-detail.jpg" alt="" fill sizes="100vw" />
        <div className={styles.dreamScrim} />
        <Reveal className={`wrap-narrow center ${styles.dreamContent}`}>
          <span className="eyebrow light">What your day feels like</span>
          <div className="divider-line" />
          <p>
            You wake before the heat. A private car is already waiting. At Karnak, the great hall
            is <em>almost empty</em> — your Egyptologist unfolds three thousand years as the first
            light moves between the columns. Lunch is handled. By late afternoon the Nile is{" "}
            <em>yours alone</em>, a felucca tilting into the gold. You took no decisions, stood in
            no queue, missed nothing. <em>You simply arrived — and Egypt did the rest.</em>
          </p>
        </Reveal>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">How it works</span>
          <h2 className="display">You design it. We arrange everything.</h2>
          <div className="steps3">
            <div className="s3">
              <div className="num">01</div>
              <h4>You design your day</h4>
              <p>Tell us your date and shape your day — it takes a minute.</p>
            </div>
            <div className="s3">
              <div className="num">02</div>
              <h4>We arrange every detail</h4>
              <p>
                Entries timed around the crowds, private transfer, your own licensed
                Egyptologist, the Nile or the desert — all booked for you.
              </p>
            </div>
            <div className="s3">
              <div className="num">03</div>
              <h4>You simply arrive</h4>
              <p>Your consigliere is reachable all day. You experience Luxor; we handle the rest.</p>
            </div>
          </div>
          <div className="disclosure">
            Luxor Rising is your private concierge &amp; advisor. We arrange and coordinate;
            experiences, guiding and transfers are delivered by our licensed local partners. Each
            concierge day is a single day with no overnight stay.
          </div>
        </Reveal>
      </section>

      {/* EXPERIENCES */}
      <section style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: ".6rem" }}>
            <span className="eyebrow">What your day can hold</span>
            <h2 className="display">Arranged for you, delivered by locals</h2>
            <p className="muted" style={{ maxWidth: "46ch", margin: ".5rem auto 0", fontSize: ".9rem" }}>
              A sample of what your journey can hold across up to three days — tap any experience
              to start designing your day.
            </p>
          </div>
          <Reveal className={styles.expGrid}>
            {EXPERIENCES.map((e) => (
              <div className={styles.exp} key={e.h}>
                <div className={styles.expIm}>
                  <Image src={e.src} alt="" fill sizes="33vw" />
                </div>
                <div className={styles.expTx}>
                  <h4>{e.h}</h4>
                  <p>{e.p}</p>
                </div>
              </div>
            ))}
            {BONUS_EXPERIENCES.map((e) => (
              <div className={styles.exp} key={e.h}>
                <div className={styles.expIm}>
                  <Image src={e.src} alt="" fill sizes="33vw" />
                </div>
                <div className={styles.expTx}>
                  <div className={styles.expK}>{e.k}</div>
                  <h4>{e.h}</h4>
                  <p>{e.p}</p>
                </div>
              </div>
            ))}
            <Link className={styles.expAll} href="#design">
              <div className={styles.expAllIn}>
                <div className="k">The full collection</div>
                <h4>Explore all experiences</h4>
                <p>
                  Temples, tombs, the Nile, the desert and more — design your day and we&apos;ll
                  build it from the full collection.
                </p>
                <span className={styles.expAllCta}>Design your day →</span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CONFIGURATOR */}
      <section id="design" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: "2.2rem" }}>
            <span className="eyebrow">Design your day</span>
            <h2 className="display">Shape it, see the price, reserve.</h2>
            <p className="lead" style={{ marginTop: ".6rem" }}>
              A minute to build. The more days you spend with us, the more we include — and the
              better the value.
            </p>
          </div>
          <DayConfigurator />
        </div>
      </section>

      {/* VALUE STACK */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">What&apos;s handled for you</span>
          <h2 className="display">
            A day that would cost you far more to assemble — if you even could.
          </h2>
          <p className="lead" style={{ marginTop: ".7rem" }}>
            Booked piece by piece, a private day like this runs well over €650 — and that&apos;s
            before the hours of planning, the language, and knowing who to trust. We do all of
            it, and price the whole day from €450.
          </p>
        </Reveal>
        <Reveal className={styles.stack}>
          <div className={styles.stackRow}>
            <span className="l">Your own licensed Egyptologist, all day</span>
            <span className="v">€180</span>
          </div>
          <div className={styles.stackRow}>
            <span className="l">Monument entries, timed before the crowds</span>
            <span className="v">€60</span>
          </div>
          <div className={styles.stackRow}>
            <span className="l">Private air-conditioned car &amp; driver</span>
            <span className="v">€90</span>
          </div>
          <div className={styles.stackRow}>
            <span className="l">A private felucca on the Nile, or a desert picnic</span>
            <span className="v">€120</span>
          </div>
          <div className={styles.stackRow}>
            <span className="l">Personal trip design &amp; every reservation made</span>
            <span className="v">€120</span>
          </div>
          <div className={styles.stackRow}>
            <span className="l">A consigliere on call from dawn to dusk</span>
            <span className="v">€90</span>
          </div>
          <div className={`${styles.stackRow} ${styles.bonus}`}>
            <span className="l">Medinet Habu — our signature, from day one</span>
            <span className="v">€90</span>
          </div>
          <div className={`${styles.stackRow} ${styles.bonus}`}>
            <span className="l">At 3 days: a private photoshoot of your day</span>
            <span className="v">€250</span>
          </div>
          <div className={styles.stackTotal}>
            <span>Total value of a single day</span>
            <span className={styles.tv}>€660+</span>
          </div>
          <div className={styles.stackYou}>
            <span className={styles.yl}>Your concierge day, from</span>
            <span className={styles.yv}>€450</span>
          </div>
          <div className={styles.stackNote}>
            Multi-day unlocks the signatures and bonuses above — value climbs well past €1,000
            while your per-day price falls.
          </div>
        </Reveal>
        <div className="center" style={{ marginTop: "2rem" }}>
          <Link href="#design" className="btn btn-primary btn-lg">
            Design your day →
          </Link>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap center">
          <span className="eyebrow">From recent guests</span>
          <h2 className="display">The day they remember most.</h2>
          <div className="tposts">
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;We&apos;ve travelled a lot. This was the first time we felt like guests, not
                tourists. Karnak at sunrise, alone, is something I&apos;ll never forget.&quot;
              </blockquote>
              <div className="who">— Lena &amp; Tomáš, Vienna · 3-day concierge</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;I planned nothing and missed nothing. Our Egyptologist was extraordinary,
                and the felucca at sunset was pure magic.&quot;
              </blockquote>
              <div className="who">— Marcus, London · Signature day</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;Worth every euro. They handled a last-minute change without us even
                noticing. We&apos;re already planning to come back through them.&quot;
              </blockquote>
              <div className="who">— Sophie, Munich · 2-day concierge</div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: ".74rem", marginTop: "1rem" }}>
            Sample testimonials — to be replaced with real guest reviews.
          </p>
        </Reveal>
      </section>

      {/* GUARANTEE */}
      <section className={styles.guarantee}>
        <Reveal className="wrap-narrow center">
          <div className={styles.seal}>The Luxor Rising promise</div>
          <h2 className="display" style={{ marginTop: ".6rem" }}>
            Your day, guaranteed — or we make it right.
          </h2>
          <div className={styles.grGrid}>
            <div className={styles.gr}>
              <h4>Cancel freely</h4>
              <p>Plans change. Cancel up to 7 days before for a full refund — no questions, no fine print.</p>
            </div>
            <div className={styles.gr}>
              <h4>Pay your way</h4>
              <p>
                Settle in full, or place a deposit to hold your date and pay the rest on the day.
                Your spot is secured either way.
              </p>
            </div>
            <div className={styles.gr}>
              <h4>We make it right</h4>
              <p>
                If anything we promised isn&apos;t delivered, you don&apos;t pay for it — and your
                consigliere fixes it on the spot. That&apos;s the whole point of us.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SCARCITY */}
      <section className={styles.scarcity}>
        <div className="wrap-narrow">
          <div className={styles.scarBadge}>Why we keep it small</div>
          <h2 className="display">A handful of private days each week. No more.</h2>
          <p className="lead" style={{ marginTop: ".9rem" }}>
            Every guest gets a real consigliere and a licensed local team for the day — so we cap
            how many days we take. It keeps the experience flawless, and it means popular dates go
            early. If your date matters, claim it now.
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link href="#design" className="btn btn-primary btn-lg">
              Check your date →
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section>
        <div className="wrap center" style={{ marginBottom: ".5rem" }}>
          <span className="eyebrow">A glimpse of what waits</span>
          <h2 className="display">Moments from a Luxor Rising day</h2>
        </div>
        <div className="wrap">
          <Reveal className={styles.galleryMosaic}>
            {GALLERY.map((g) => (
              <div key={g.src + g.cap} className={`${styles.gm} ${g.big ? styles.gmBig : ""}`}>
                <Image src={g.src} alt={g.cap} fill sizes={g.big ? "50vw" : "25vw"} />
                <div className={styles.gmCap}>{g.cap}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalcta}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your date is waiting</span>
          <h2 className="display">Give us one day. We&apos;ll give you the one you remember.</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Private, effortless, and guaranteed — from €450. Pick your date before it&apos;s
            taken.
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <Link href="#design" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
          </div>
          <p className="muted" style={{ fontSize: ".8rem", marginTop: "1rem" }}>
            7-day free cancellation · deposit or pay in full · a handful of days each week
          </p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap-narrow center">
          <span className="eyebrow">Good to know</span>
          <h2 className="display">Questions, answered</h2>
        </div>
        <div className="wrap-narrow" style={{ paddingTop: 0 }}>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>

      <MinimalFooter
        links={[
          { href: "#", label: "WhatsApp" },
          { href: "#", label: "hello@luxorrising.com" },
          { href: "#", label: "Luxor & Hurghada, Egypt" },
        ]}
      />
    </>
  );
}
