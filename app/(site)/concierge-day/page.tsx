import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import DayConfigurator from "@/components/DayConfigurator";
import GalleryMosaic from "@/components/GalleryMosaic";
import ValueStack from "@/components/ValueStack";
import { reader } from "@/lib/keystatic-reader";
import styles from "./ConciergeDayPage.module.css";

export const metadata: Metadata = {
  title: "The Signature Concierge Day",
  description:
    "A private day in Luxor, timed before the crowds — your own Egyptologist, the Nile or the desert, and not one decision to make. From €450.",
};

const EXPERIENCES = [
  {
    src: "/images/experiences/karnak-at-dawn-hero.jpg",
    h: "Karnak at dawn",
    p: "The great hypostyle hall before the crowds arrive — arranged privately.",
  },
  {
    src: "/images/experiences/valley-of-the-kings-hero.jpg",
    h: "Valley of the Kings",
    p: "The royal tombs, read for you by a licensed local guide.",
  },
  {
    src: "/images/experiences/felucca-sunset-sail-hero.jpg",
    h: "A private felucca at golden hour",
    p: "The river to yourself as the light turns — hosted by our local boatman.",
  },
  {
    src: "/images/experiences/private-desert-safari-hero.jpg",
    h: "A sunset picnic in the dunes",
    p: "A quiet table in the sand, set by our local host as the sun drops.",
  },
  {
    src: "/images/experiences/medinet-habu-hero.jpg",
    h: "Medinet Habu",
    p: "Our insider temple — colour still on the walls, almost nobody there. Yours from day one.",
  },
  {
    src: "/images/experiences/balloon-hero.jpg",
    h: "Hot-air balloon at dawn",
    p: "Float over the West Bank at sunrise — we'll arrange it on request.",
  },
];

const BONUS_EXPERIENCES = [
  {
    src: "/images/experiences/deir-el-shelwit-hero.jpg",
    k: "Signature bonus ★",
    h: "Deir el-Shelwit — the hidden temple of Isis",
    p: "A near-secret Greco-Roman temple, its ceilings still deep with colour. On us.",
  },
  {
    src: "/images/experiences/luxor-by-night-hero.jpg",
    k: "After dark",
    h: "A night in Luxor city",
    p: "The souk, the lantern-lit Corniche, and hosts who actually know the place.",
  },
];

const GALLERY = [
  { image: "/images/experiences/karnak-at-dawn-hero.jpg", caption: "Karnak, before the crowds" },
  { image: "/images/experiences/valley-of-the-kings-hero.jpg", caption: "Into the royal tombs" },
  { image: "/images/desert-stargazing-dune.jpg", caption: "The desert sky, far from everything" },
  { image: "/images/experiences/felucca-sunset-sail-hero.jpg", caption: "The Nile at golden hour" },
  { image: "/images/desert-dinner-table.jpg", caption: "A private table in the dunes" },
  { image: "/images/experiences/medinet-habu-hero.jpg", caption: "Colour still on the walls" },
  { image: "/images/experiences/balloon-hero.jpg", caption: "Dawn over the West Bank" },
  { image: "/images/experiences/nile-dinner-cruise-hero.jpg", caption: "Dinner on the river" },
  { image: "/images/experiences/camel-bedouin-breakfast-hero.jpg", caption: "Breakfast at the desert's edge" },
];

export default async function ConciergeDayPage() {
  const [page, pricingRules, experiences] = await Promise.all([
    reader.singletons.conciergeDayPage.read(),
    reader.singletons.pricingRules.read(),
    reader.collections.experiences.all(),
  ]);

  const FAQ_ITEMS = (page?.faq ?? []).map((f) => ({ q: f.question, a: f.answer }));

  // Real single-experience prices, pulled from the live catalogue so the
  // "assemble it yourself" comparison always reflects what these actually cost.
  const priceBySlug = (slug: string) =>
    experiences.find((e) => e.slug === slug)?.entry.basePrice ?? 0;
  const named = (name: string, slug: string) => ({ name, price: priceBySlug(slug) });
  // [day 1, day-2 additions, day-3 additions]
  const experiencePlan = [
    [
      named("Karnak at dawn", "karnak-at-dawn"),
      named("Valley of the Kings", "valley-of-the-kings"),
      named("A private felucca at golden hour", "felucca-sunset-sail"),
    ],
    [
      named("Medinet Habu — your signature", "medinet-habu"),
      named("Hatshepsut Temple", "hatshepsut-temple"),
      named("A sunset in the dunes", "private-desert-safari"),
    ],
    [
      named("Luxor by night", "luxor-by-night"),
      named("A private Nile dinner cruise", "nile-dinner-cruise"),
      named("Hot-air balloon at dawn", "hot-air-balloon-luxor"),
    ],
  ];
  // Consigliere leads; temple guards are on your side; the Egyptologist is an addition.
  const perDayServices = [
    { name: "A consigliere managing every hour of it", price: 90 },
    { name: "Temple guards opening doors a coach never gets", price: 70 },
    { name: "Private air-conditioned car & driver", price: 90 },
    { name: "Monument entries, timed before the crowds", price: 60 },
    { name: "A licensed Egyptologist too, at the monuments", price: 140 },
  ];
  const oneOffServices = [{ name: "Personal trip design & every reservation made", price: 120 }];

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
          <span className="eyebrow">{page?.heroEyebrow}</span>
          <h1 className="display">{page?.heroTitle}</h1>
          <div className={styles.oneline}>{page?.heroSubtitle}</div>
          <div className={styles.raterow}>
            <span className="stars">★ ★ ★ ★ ★</span> {page?.heroTrustLine}
          </div>
          <div className={styles.priceRow}>
            <span className="from">From</span>
            <span className="amt">€{page?.startingPrice ?? 450}</span>
            <span className="per">{page?.priceNote}</span>
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
          <span className="eyebrow">{page?.contrastEyebrow}</span>
          <h2 className="display">{page?.contrastTitle}</h2>
          <p className="lead" style={{ marginTop: "1rem" }}>
            {page?.contrastLead}
          </p>
        </Reveal>
        <div className="wrap">
          <Reveal className={styles.cmp}>
            <div className={`${styles.col} ${styles.bad}`}>
              <h4>The usual way</h4>
              <ul>
                {(page?.badWayItems ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.col} ${styles.good}`}>
              <h4>A Luxor Rising day</h4>
              <ul>
                {(page?.goodWayItems ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
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
          <p>{page?.dreamText}</p>
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
                One consigliere handles every hour — entries timed before the crowds, private
                transfer, and the temple guards who open doors a coach never gets. A licensed
                Egyptologist joins you at the monuments too.
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
          <DayConfigurator
            dayRate={pricingRules?.dayRate ?? 450}
            volumeDiscount={(pricingRules?.volumeDiscount ?? []).map((t) => ({
              minDays: t.minDays ?? 0,
              discountPercent: t.discountPercent ?? 0,
            }))}
            groupSupplement={(pricingRules?.groupSupplement ?? []).map((t) => ({
              minGuests: t.minGuests ?? 0,
              extraPerDay: t.extraPerDay ?? 0,
            }))}
            depositPercent={pricingRules?.depositPercent ?? 30}
          />
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
            Booked piece by piece — real prices from our own single experiences — a private
            journey like this adds up fast, and that&apos;s before the hours of planning, the
            language, and knowing who to trust. Choose how many days below and see it for yourself.
          </p>
        </Reveal>
        <ValueStack
          dayRate={pricingRules?.dayRate ?? 450}
          volumeDiscount={(pricingRules?.volumeDiscount ?? []).map((t) => ({
            minDays: t.minDays ?? 0,
            discountPercent: t.discountPercent ?? 0,
          }))}
          experiencePlan={experiencePlan}
          perDayServices={perDayServices}
          oneOffServices={oneOffServices}
        />
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
          <div className={styles.scarBadge}>{page?.scarcityBadge}</div>
          <h2 className="display">{page?.scarcityTitle}</h2>
          <p className="lead" style={{ marginTop: ".9rem" }}>
            {page?.scarcityText}
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
          <GalleryMosaic items={GALLERY} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalcta}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{page?.finalEyebrow}</span>
          <h2 className="display">{page?.finalTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.finalText}
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
