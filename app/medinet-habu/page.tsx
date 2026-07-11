import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import Gallery from "@/components/Gallery";
import JsonLd from "@/components/JsonLd";
import ExperienceConfigurator from "@/components/ExperienceConfigurator";
import styles from "./MedinetHabuPage.module.css";

export const metadata: Metadata = {
  title: "Medinet Habu Private Tour at Dawn with a Certified Egyptologist",
  description:
    "Visit Medinet Habu privately at dawn with a certified Egyptologist — the best-preserved temple in Thebes, far fewer crowds, every detail arranged end to end. From €140.",
  alternates: { canonical: "/medinet-habu" },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "Medinet Habu — a private, certified-guided dawn experience",
    description:
      "The best-preserved temple in Thebes, before the crowds — with a certified Egyptologist and your consigliere, end to end. From €140.",
    images: ["/images/medinet-habu-facade.jpg"],
    url: "/medinet-habu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medinet Habu — private, certified-guided, before the crowds",
    description: "Stand where Egyptians said the world began. Private dawn visit with a certified Egyptologist. From €140.",
    images: ["/images/medinet-habu-facade.jpg"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://luxorrising.com/#org",
      name: "Luxor Rising",
      url: "https://luxorrising.com",
      logo: "https://luxorrising.com/images/logo-footer.png",
      description:
        "Private concierge and advisor for unhurried, certified-guided experiences in Luxor and the Egyptian Nile.",
      areaServed: "Luxor, Egypt",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
        { "@type": "ListItem", position: 2, name: "Experiences", item: "https://luxorrising.com/#experiences" },
        { "@type": "ListItem", position: 3, name: "Medinet Habu", item: "https://luxorrising.com/medinet-habu" },
      ],
    },
    {
      "@type": "Product",
      name: "Medinet Habu - Private, Certified-Guided Experience",
      image: [
        "https://luxorrising.com/images/medinet-habu-facade.jpg",
        "https://luxorrising.com/images/painted-pillar-hieroglyphs.jpg",
        "https://luxorrising.com/images/sea-peoples-relief.jpg",
        "https://luxorrising.com/images/painted-ceiling-detail.jpg",
      ],
      description:
        "A private, certified-guided visit to Medinet Habu, the best-preserved temple in Thebes and memorial temple of Ramesses III on the West Bank of Luxor. Timed before the crowds, with private transfer and a certified Egyptologist on site, arranged end to end.",
      brand: { "@type": "Brand", name: "Luxor Rising" },
      category: "Private guided experience",
      areaServed: "Luxor, Egypt",
      offers: {
        "@type": "Offer",
        price: "140",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://luxorrising.com/medinet-habu#book",
        seller: { "@id": "https://luxorrising.com/#org" },
      },
    },
    {
      "@type": "ImageGallery",
      name: "Medinet Habu - photo gallery",
      about: "Medinet Habu temple, Luxor, Egypt",
      associatedMedia: [
        {
          "@type": "ImageObject",
          contentUrl: "https://luxorrising.com/images/medinet-habu-facade.jpg",
          caption: "The great first pylon of Medinet Habu.",
        },
        {
          "@type": "ImageObject",
          contentUrl: "https://luxorrising.com/images/painted-pillar-hieroglyphs.jpg",
          caption: "The painted hypostyle hall of Medinet Habu, with colour surviving overhead.",
        },
        {
          "@type": "ImageObject",
          contentUrl: "https://luxorrising.com/images/sea-peoples-relief.jpg",
          caption: "Deeply carved reliefs on the first pylon, including the record of the Sea Peoples.",
        },
        {
          "@type": "ImageObject",
          contentUrl: "https://luxorrising.com/images/painted-ceiling-detail.jpg",
          caption: "Surviving painted ceiling colour at Medinet Habu.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Medinet Habu worth visiting compared to Karnak?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Medinet Habu is the best-preserved temple in Thebes, with surviving painted reliefs, the only contemporary record of the Sea Peoples, and far fewer crowds than Karnak. With a private guide it is many visitors' favourite stop in Luxor.",
          },
        },
        {
          "@type": "Question",
          name: "How long does a visit to Medinet Habu take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Allow about two hours on site for an unhurried, private visit. Adding a felucca makes it a half-day.",
          },
        },
        {
          "@type": "Question",
          name: "Is the guide a licensed Egyptologist?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Guiding inside Egyptian monuments is legally reserved for licensed Egyptian guides. A certified Egyptologist meets you on site, and the concierge coordinates everything around them.",
          },
        },
        {
          "@type": "Question",
          name: "What is included in the price?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Private return transfer, monument entry, timing before the crowds, a certified Egyptologist for your group, and all the arranging. Optional add-ons such as a felucca or a photoshoot are available.",
          },
        },
        {
          "@type": "Question",
          name: "How much does it cost to enter Medinet Habu?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The monument entry fee is small, around EGP 220 (roughly 4 to 5 euros). This experience covers the private car and driver, a certified Egyptologist, timing before the crowds, and all logistics, not just the entry.",
          },
        },
        {
          "@type": "Question",
          name: "Can I add other sites or make it a full day?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. A felucca on the Nile, additional sites such as the Valley of the Kings, or a full private day can be arranged.",
          },
        },
      ],
    },
  ],
};

const FAQ_ITEMS = [
  {
    q: "Is Medinet Habu really worth it over Karnak?",
    a: "Different pleasures. Karnak is vast; Medinet Habu is complete — better-preserved colour, the only record of the Sea Peoples, and a fraction of the crowds. With a private guide it's many guests' favourite stop in Luxor.",
  },
  {
    q: "How long does it take?",
    a: "Allow around two hours on site for an unhurried, private visit. Add a felucca and you'll want half a day.",
  },
  {
    q: "Is the guide really certified?",
    a: "Yes — guiding inside Egyptian monuments is by law reserved for licensed Egyptian guides. Your Egyptologist meets you on site; we coordinate everything around them.",
  },
  {
    q: "What's included in the price?",
    a: "Private return transfer, monument entry, timing before the crowds, a certified Egyptologist for your group, and all the arranging. Optional add-ons (felucca, photoshoot) are shown as you build.",
  },
  {
    q: "It's only a few euros to enter — why this?",
    a: "The gate fee is small; what you're paying for is the private car, the right hour, a certified Egyptologist who brings it to life, and zero logistics — booked, timed and handled for you.",
  },
  {
    q: "Can I add the Valley of the Kings, or make it a full day?",
    a: (
      <>
        Absolutely — that&apos;s our speciality. Add a felucca here, or let us compose a whole day
        around it.{" "}
        <Link href="/concierge-day" style={{ color: "var(--color-gold-deep)", borderBottom: "1px solid var(--color-gold-soft)" }}>
          Build a Concierge Day →
        </Link>
      </>
    ),
  },
];

export default function MedinetHabuPage() {
  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav ctaHref="#book" ctaLabel="Reserve" />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src="/images/medinet-habu-facade.jpg" alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <div className={`wrap ${styles.heroContent}`}>
          <span className="eyebrow">A single experience · Medinet Habu · Luxor West Bank</span>
          <h1 className="display">Begin where the world began.</h1>
          <div className={styles.heroSub}>
            Medinet Habu rises over the primeval mound — the first land to emerge from chaos,
            where the gods themselves were born and reborn. A private, certified-guided initiation
            into the best-preserved temple in Thebes, before the crowds — arranged and
            accompanied end to end, so you do nothing but take it in.
          </div>
          <div className={styles.priceRow}>
            <span className="from">From</span>
            <span className="amt">€140</span>
            <span className="per">· private &amp; guided · per person from €78</span>
          </div>
          <div className={styles.heroCta}>
            <Link href="#book" className="btn btn-primary btn-lg">
              Reserve this experience →
            </Link>
            <Link href="#myth" className="btn btn-ghost btn-lg">
              Why it matters
            </Link>
          </div>
          <div className={styles.heroTrust}>
            <span className="stars">★ ★ ★ ★ ★</span> Certified Egyptologist on site · your
            consigliere with you throughout · far quieter than Karnak
          </div>
        </div>
      </section>

      {/* AT A GLANCE */}
      <section className={styles.glance}>
        <div className="wrap">
          <p className={styles.glanceLead}>
            <strong>Medinet Habu is the best-preserved temple in Thebes</strong> — the memorial
            temple of Ramesses III, on the West Bank of Luxor. Visited privately, before the
            crowds, and arranged end to end.
          </p>
          <div className={styles.glanceRule} />
          <div className={styles.glanceFacts}>
            <div className={styles.gf}>
              <span>Duration</span>~2 hours, private
            </div>
            <div className={styles.gf}>
              <span>Best time</span>Dawn, before the crowds
            </div>
            <div className={styles.gf}>
              <span>From</span>€140 · per person €78
            </div>
            <div className={styles.gf}>
              <span>Cancellation</span>Free, up to 7 days
            </div>
          </div>
          <p className={styles.glanceIncl}>
            Includes private transfer · a certified Egyptologist on site · monument entry · every
            detail arranged
          </p>
        </div>
      </section>

      {/* THE CASE */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">Why here, why now</span>
          <h2 className="display" style={{ margin: ".3rem 0 1rem" }}>
            The temple everyone walks past — and shouldn&apos;t.
          </h2>
          <p className="lead">
            While the buses queue at Karnak, Medinet Habu stands almost empty — yet it is arguably
            the most complete temple in Thebes. Colour still clings to its walls, even across the
            ceilings. The great pylon carries the only eyewitness record of the Sea Peoples. And a
            two-storey Syrian gate guards a royal palace most visitors never realise is there.
          </p>
          <p style={{ margin: "1.1rem auto 0", opacity: 0.82, maxWidth: "60ch" }}>
            You&apos;ll have room to breathe — and a certified Egyptologist to read three thousand
            years for you, privately.
          </p>
          <Link href="#book" className="link-arrow" style={{ display: "inline-block", marginTop: "1.4rem", fontSize: ".78rem", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-gold-deep)", borderBottom: "1px solid var(--color-gold-soft)", paddingBottom: ".25rem" }}>
            Reserve your visit →
          </Link>
        </Reveal>
      </section>

      {/* THE MYTH / INITIATION */}
      <section className={styles.myth} id="myth">
        <Image src="/images/painted-pillar-hieroglyphs.jpg" alt="" fill sizes="100vw" />
        <div className={styles.mythScrim} />
        <Reveal className={`wrap ${styles.mythIn}`}>
          <span className="eyebrow">Why it&apos;s an initiation</span>
          <h2 className="display">A place built on one living idea: that life renews itself.</h2>
          <p>
            Strip away the names, and Medinet Habu was raised to hold a single principle — one
            many cultures have arrived at on their own. The Egyptians said the first land rose
            here out of chaos; that from formlessness, order and life appeared, and kept
            appearing. They gave the force a name, and imagined elder powers asleep beneath the
            mound. But the idea beneath the story is older than any god&apos;s name: creation is
            not one event, safely in the past — it is a movement that <em>repeats</em>. What is
            tired can be renewed. What has ended can begin again.
          </p>
          <p>
            So for a thousand years, every tenth day, this temple performed a return — the source
            revisited, the cycle wound forward, life quietly made new. Every tradition keeps some
            form of this rhythm: the fast and the feast, the retreat and the return, the old year
            and the new. To stand here is to step inside that pattern made of stone — a reminder
            that renewal is not luck, but a <b>law you can choose to live by</b>.
          </p>
          <div className={styles.mythH2}>The same dream, written large</div>
          <p>
            Even a pharaoh sought it. Ramesses III raised his memorial temple on this exact ground
            for a reason anyone can feel — he wanted to <b>endure</b>: his name spoken, his spirit
            tended, his life renewed beyond its own ending. Priests kept that renewal alive with
            daily care, festivals filled its courts, and the <b>living king</b> showed himself to
            his people from the palace wall. His dream was simply the human one, made monumental —
            to begin, to last, to be made new — and he placed it where beginning itself was said
            to have begun.
          </p>
          <div className={styles.mythPull}>
            To know yourself is to know you still carry a beginning — and this is a place built to
            remind you of it.
          </div>
        </Reveal>
      </section>

      {/* PERSONAL MEANING */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">Why it matters — to you</span>
          <h2 className="display">A beginning you can stand inside.</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Most of us never get to mark a fresh start with a place. Here, you can.
          </p>
          <p style={{ marginTop: "1.1rem", opacity: 0.86, maxWidth: "64ch", marginLeft: "auto", marginRight: "auto" }}>
            To stand at first light on the mound where Egyptians believed the world itself began —
            where even their gods came to be renewed — is to borrow that idea for yourself: a
            pause at the source, a threshold, a quiet reset before whatever comes next. Most
            people come to Luxor for monuments. The ones who come <em>here</em> — early,
            unhurried, with someone to tell them what they&apos;re seeing — tend to leave with
            something harder to photograph: a sense of scale, of stillness, of having quietly
            begun again.
          </p>
          <p style={{ marginTop: "1rem", opacity: 0.86, maxWidth: "64ch", marginLeft: "auto", marginRight: "auto" }}>
            Bring a new chapter to it — a milestone, an anniversary, a decision, or simply the
            wish to feel small in the best possible way. It&apos;s the one stop in Luxor most
            guests say they never forget.
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1.3rem,2.4vw,1.8rem)",
              color: "var(--color-gold-deep)",
              maxWidth: "26ch",
              margin: "1.8rem auto 0",
              lineHeight: 1.3,
            }}
          >
            Come to be reminded that beginnings are still possible — and to make one your own.
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <Link href="#book" className="btn btn-primary btn-lg">
              Reserve your beginning →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* WHAT YOU'LL SEE */}
      <section style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: ".4rem" }}>
            <span className="eyebrow">On the day</span>
            <h2 className="display">What your Egyptologist will show you</h2>
          </div>
          <Reveal className={styles.seeGrid}>
            <div className={styles.see}>
              <div className="ix">✦</div>
              <div>
                <h4>The Migdol Gate</h4>
                <p>
                  A two-storey Syrian-style fortress gatehouse, unique in Egypt — concealing the
                  royal palace and the Window of Appearances, where the king showed himself to his
                  people.
                </p>
              </div>
            </div>
            <div className={styles.see}>
              <div className="ix">❖</div>
              <div>
                <h4>The Great Pylon</h4>
                <p>
                  Colossal reliefs of Ramesses III&apos;s victories — including the only
                  contemporary eyewitness record of the mysterious Sea Peoples.
                </p>
              </div>
            </div>
            <div className={styles.see}>
              <div className="ix">◆</div>
              <div>
                <h4>Colour that survived</h4>
                <p>
                  Among the best-preserved painted reliefs in Thebes — carved deep and still
                  vivid, even overhead on the ceilings most temples have long lost.
                </p>
              </div>
            </div>
            <div className={styles.see}>
              <div className="ix">✧</div>
              <div>
                <h4>The Small Temple &amp; the mound</h4>
                <p>
                  The older sanctuary of Hatshepsut and Thutmose III, raised over the primeval
                  mound itself — the symbolic heart of the whole site.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className="wrap">
          <div className="center" style={{ marginBottom: "1.8rem" }}>
            <span className="eyebrow">A closer look</span>
            <h2 className="display">What three thousand years looks like up close.</h2>
          </div>
          <Gallery
            tiles={[
              {
                src: "/images/medinet-habu-facade.jpg",
                alt: "The towering first pylon of Medinet Habu temple against a blue sky",
                caption: "The great first pylon — colossal, and most mornings, almost empty.",
                width: 1500,
                height: 1000,
                span: "feat",
              },
              {
                src: "/images/painted-pillar-hieroglyphs.jpg",
                alt: "Painted columns and ceiling inside the hypostyle hall of Medinet Habu",
                caption: "Colour still clinging to the hypostyle hall — even overhead.",
                width: 1600,
                height: 903,
                span: "wide",
              },
              {
                src: "/images/sea-peoples-relief.jpg",
                alt: "Deeply carved relief of the pharaoh and hieroglyphs on the wall of Medinet Habu",
                caption: "The only record of the Sea Peoples, cut deep into stone.",
                width: 900,
                height: 542,
              },
              {
                src: "/images/painted-ceiling-detail.jpg",
                alt: "Surviving painted ceiling and cartouches in vivid colour at Medinet Habu",
                caption: "Painted ceilings most temples lost long ago.",
                width: 1200,
                height: 657,
              },
              {
                placeholder: true,
                caption: "Your certified Egyptologist, reading the walls for you.",
                span: "wide",
              },
              {
                placeholder: true,
                caption: "First light over the West Bank, before the crowds.",
                span: "wide",
              },
            ]}
          />
          <p className="muted center" style={{ fontSize: ".78rem", marginTop: "1.1rem" }}>
            Photographed on location in Luxor · click any image to enlarge
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">How it works</span>
          <h2 className="display">You choose a date. We arrange everything.</h2>
          <div className="steps3">
            <div className="s3">
              <div className="num">01</div>
              <h4>Reserve in a minute</h4>
              <p>Pick your date, who&apos;s coming, and the hour. Pay securely online.</p>
            </div>
            <div className="s3">
              <div className="num">02</div>
              <h4>Your consigliere takes over</h4>
              <p>
                Private return transfer, entry and perfect timing before the crowds, and a{" "}
                <b>certified Egyptologist</b> on site — every detail handled, and your consigliere{" "}
                <b>with you from start to finish</b>.
              </p>
            </div>
            <div className="s3">
              <div className="num">03</div>
              <h4>You just enjoy the flow</h4>
              <p>Nothing to organise, decide or carry. You arrive — and three thousand years unfold around you.</p>
            </div>
          </div>
          <div className="disclosure">
            Luxor Rising is your private concierge &amp; advisor. We arrange and coordinate;
            guiding and transfers are delivered by our licensed local partners and a certified
            Egyptologist on site. This is a single daytime experience with no overnight stay.
          </div>
        </Reveal>
      </section>

      {/* BOOK / CONFIGURATOR */}
      <section id="book" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: ".3rem" }}>
            <span className="eyebrow">Reserve your experience</span>
            <h2 className="display">Build it, see the price, reserve.</h2>
            <p className="lead" style={{ marginTop: ".6rem" }}>
              A private visit — just you and your group. The more of you, the less per person.
            </p>
            <p style={{ marginTop: ".5rem", fontSize: ".82rem", color: "var(--color-gold-deep)" }}>
              Each dawn we host only one private group — slots are limited.
            </p>
          </div>
          <ExperienceConfigurator />
        </div>
      </section>

      {/* VALUE */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">What&apos;s handled for you</span>
          <h2 className="display">The entry ticket is the cheap part.</h2>
          <p className="lead" style={{ marginTop: ".7rem" }}>
            Anyone can pay the gate. The value is everything around it — a private car and driver,
            a certified Egyptologist for a few unhurried hours, and a consigliere who handles
            every detail so you simply enjoy the day.
          </p>
          <div className={styles.stack}>
            <div className={styles.stackRow}>
              <span>A certified Egyptologist, for your visit (3–4 hrs)</span>
              <span className="v">€90</span>
            </div>
            <div className={styles.stackRow}>
              <span>Private car &amp; driver, round trip</span>
              <span className="v">€45</span>
            </div>
            <div className={styles.stackRow}>
              <span>Monument entry &amp; dawn timing</span>
              <span className="v">€25</span>
            </div>
            <div className={styles.stackRow}>
              <span>Your consigliere, with you end to end</span>
              <span className="v">€60</span>
            </div>
            <div className={`${styles.stackRow} ${styles.tot}`}>
              <span>Assembled separately</span>
              <span className="v">
                <s>€220+</s>
              </span>
            </div>
            <div className={`${styles.stackRow} ${styles.fin}`}>
              <span>Your private experience, from</span>
              <span className="v">€140</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: ".78rem", marginTop: "1rem" }}>
            Per-person price falls as your group grows. Values illustrative — final pricing
            confirmed at checkout.
          </p>
        </Reveal>
      </section>

      {/* GUARANTEE */}
      <section className={styles.guarantee}>
        <Reveal className="wrap">
          <span className="eyebrow" style={{ color: "var(--color-gold-soft)" }}>
            Our promise
          </span>
          <h2 className="display">Reserved with confidence — or we make it right.</h2>
          <div className={styles.grGrid}>
            <div className={styles.gr}>
              <h4>Cancel freely</h4>
              <p>Plans change. Cancel up to 7 days before for a full refund, no fine print.</p>
            </div>
            <div className={styles.gr}>
              <h4>Pay your way</h4>
              <p>
                Settle in full, or place a deposit and pay the rest on the day. Your spot is held
                either way.
              </p>
            </div>
            <div className={styles.gr}>
              <h4>We make it right</h4>
              <p>
                If anything we promised isn&apos;t delivered, you don&apos;t pay for it — and your
                consigliere fixes it on the spot.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap center">
          <span className="eyebrow">From recent guests</span>
          <h2 className="display">The temple they didn&apos;t expect to love most.</h2>
          <div className="tposts">
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;We almost skipped it. It became the highlight of Luxor — empty, glowing, and
                our guide made the carvings come alive.&quot;
              </blockquote>
              <div className="who">— Lena &amp; Tomáš, Vienna</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;Standing on the oldest sacred ground in Thebes, at dawn, with no one else
                there. I won&apos;t forget it.&quot;
              </blockquote>
              <div className="who">— Marcus, London</div>
            </div>
            <div className="tp">
              <div className="st">★★★★★</div>
              <blockquote>
                &quot;Everything was arranged — car, tickets, a brilliant Egyptologist. We just
                showed up and were amazed.&quot;
              </blockquote>
              <div className="who">— Sophie, Munich</div>
            </div>
          </div>
          <p className="muted" style={{ fontSize: ".74rem", marginTop: "1rem" }}>
            Sample testimonials — to be replaced with real guest reviews.
          </p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section>
        <Reveal className="wrap-narrow">
          <div className="center" style={{ marginBottom: "1.6rem" }}>
            <span className="eyebrow">Good to know</span>
            <h2 className="display">Questions, answered</h2>
          </div>
          <Faq items={FAQ_ITEMS} />
        </Reveal>
      </section>

      {/* FINAL */}
      <section className={styles.final}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your beginning is waiting</span>
          <h2 className="display">Begin where everything began.</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Private, certified-guided, and arranged end to end — from €140. Reserve your hour at
            the mound.
          </p>
          <div style={{ marginTop: "1.8rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#book" className="btn btn-primary btn-lg">
              Reserve this experience →
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Or build a whole day
            </Link>
          </div>
        </Reveal>
      </section>

      <MinimalFooter
        links={[
          { href: "/", label: "Home" },
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "/#experiences", label: "Experiences" },
          { href: "/#villas", label: "Private Villas" },
        ]}
        bottomText="© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada"
      />
    </>
  );
}
