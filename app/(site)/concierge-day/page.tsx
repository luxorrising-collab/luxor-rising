import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import Reveal from "@/components/Reveal";
import Faq from "@/components/Faq";
import DayConfigurator from "@/components/DayConfigurator";
import GalleryMosaic from "@/components/GalleryMosaic";
import ValueStack from "@/components/ValueStack";
import ConsigliereSection from "@/components/ConsigliereSection";
import ExperienceGrid from "@/components/ExperienceGrid";
import { DayCountProvider } from "@/components/DayCount";
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

const SECTION_FALLBACK = [
  "contrast",
  "mechanism",
  "dayFeel",
  "experiences",
  "consigliere",
  "builder",
  "valueStack",
  "socialProof",
  "guarantee",
  "scarcity",
  "gallery",
  "threshold",
  "finalCta",
  "multiDay",
  "faq",
];

export default async function ConciergeDayPage() {
  const [page, pricingRules, experiences, product] = await Promise.all([
    reader.singletons.conciergeDayPage.read(),
    reader.singletons.pricingRules.read(),
    reader.collections.experiences.all(),
    reader.singletons.productPageSettings.read(),
  ]);

  const FAQ_ITEMS = (page?.faq ?? []).map((f) => ({ q: f.question, a: f.answer }));

  // Reviews are shared with the product pages (edited once, in Keystatic). Shown
  // here too, gated the same way — sample reviews render with a note but emit no
  // structured data until reviewsVerified is switched on.
  const reviews = (product?.testimonials ?? []).filter((t) => t.quote && t.author);
  const reviewsVerified = product?.reviewsVerified ?? false;

  // Real single-experience prices, pulled from the live catalogue so the
  // "assemble it yourself" comparison always reflects what these actually cost.
  const priceBySlug = (slug: string) =>
    experiences.find((e) => e.slug === slug)?.entry.basePrice ?? 0;

  // À-la-carte price map for the builder's "see full breakdown" — sourced from
  // the SAME live product prices, so the breakdown and the value-stack always
  // agree and update from Keystatic. Keys match the builder's plan wording
  // (substring match); order preserved. Pure services/add-ons that aren't
  // standalone catalogue products keep sensible fixed values.
  const alaCartePrices: [string, number][] = [
    ["Medinet", priceBySlug("medinet-habu")],
    ["Karnak", priceBySlug("karnak-at-dawn")],
    ["Hatshepsut", priceBySlug("hatshepsut-temple")],
    ["Luxor Temple", priceBySlug("luxor-temple")],
    ["Valley of the Kings", priceBySlug("valley-of-the-kings")],
    ["Deir el-Shelwit", priceBySlug("deir-el-shelwit")],
    ["Colossi", priceBySlug("colossi-of-memnon")],
    ["Valley of the Workers", priceBySlug("deir-el-medina")],
    ["felucca", priceBySlug("felucca-sunset-sail")],
    ["sail on the Nile", priceBySlug("felucca-sunset-sail")],
    ["Sunset sail", priceBySlug("felucca-sunset-sail")],
    ["picnic", priceBySlug("private-desert-safari")],
    ["choosing", priceBySlug("private-desert-safari")],
    ["Desert rally", priceBySlug("private-desert-safari")],
    ["night in Luxor", priceBySlug("luxor-by-night")],
    ["photoshoot", 120],
    ["balloon", priceBySlug("hot-air-balloon-luxor")],
    ["Sailing lesson", priceBySlug("felucca-sunset-sail")],
    ["Egyptologist", 140],
    ["air-conditioned transfers", 90],
    ["Hurghada", priceBySlug("hurghada-to-luxor-crossing")],
  ];

  // Brand titles for the signature experiences in the breakdown — the place name
  // stays the clear label, the poetic product title (e.g. "Begin where the world
  // began.") shows as a small italic subtitle. Services/add-ons stay plain.
  const brandBySlug = (slug: string) =>
    experiences.find((e) => e.slug === slug)?.entry.title ?? "";
  const alaCarteBrands: [string, string][] = [
    ["Medinet", brandBySlug("medinet-habu")],
    ["Karnak", brandBySlug("karnak-at-dawn")],
    ["Hatshepsut", brandBySlug("hatshepsut-temple")],
    ["Luxor Temple", brandBySlug("luxor-temple")],
    ["Valley of the Kings", brandBySlug("valley-of-the-kings")],
    ["Deir el-Shelwit", brandBySlug("deir-el-shelwit")],
    ["Valley of the Workers", brandBySlug("deir-el-medina")],
    ["Sunset sail", brandBySlug("felucca-sunset-sail")],
    ["sail on the Nile", brandBySlug("felucca-sunset-sail")],
    ["felucca", brandBySlug("felucca-sunset-sail")],
    ["night in Luxor", brandBySlug("luxor-by-night")],
    ["balloon", brandBySlug("hot-air-balloon-luxor")],
  ];
  const named = (name: string, slug: string) => ({ name, price: priceBySlug(slug) });
  // [day 1, day-2 additions, day-3 additions, day-4 additions]
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
    [
      named("Dawn camel ride & Bedouin breakfast", "camel-bedouin-breakfast"),
      named("Banana Island by felucca", "banana-island-felucca"),
      named("A night under desert stars", "desert-astronomy-night"),
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

  // Images are CMS-editable via the Concierge Day page singleton, with the
  // original hardcoded sets kept as fallbacks so nothing breaks if a field is empty.
  const heroFromCms = (page?.heroImages ?? []).filter((s): s is string => !!s);
  const heroBgList =
    heroFromCms.length > 0
      ? heroFromCms
      : ["/images/nile-river-solo.jpg", "/images/west-bank-dawn.jpg", "/images/karnak-columns-detail.jpg"];
  const dreamImg = page?.dreamImage || "/images/karnak-columns-detail.jpg";
  const expCards =
    (page?.experiences ?? []).length > 0
      ? page!.experiences.map((e) => ({ src: e.image ?? "", h: e.title, p: e.description, k: e.badge || undefined }))
      : [...EXPERIENCES.map((e) => ({ ...e, k: undefined as string | undefined })), ...BONUS_EXPERIENCES];
  const galleryItems =
    (page?.gallery ?? []).length > 0
      ? page!.gallery.map((g) => ({ image: g.image ?? "", caption: g.caption }))
      : GALLERY;
  const builderImages = {
    journeyMedinet: page?.builderJourneyMedinetImage || undefined,
    journeyKarnak: page?.builderJourneyKarnakImage || undefined,
    journeyBalloon: page?.builderJourneyBalloonImage || undefined,
    sunsetNile: page?.builderSunsetNileImage || undefined,
    sunsetPicnic: page?.builderSunsetPicnicImage || undefined,
    sunsetCustom: page?.builderSunsetCustomImage || undefined,
  };

  // Section order + visibility come from Keystatic (drag to reorder there).
  const orderedFromCms = (page?.sections ?? [])
    .filter((s) => s.visible !== false && s.section)
    .map((s) => s.section as string);
  const orderedKeys = orderedFromCms.length > 0 ? orderedFromCms : SECTION_FALLBACK;

  const sectionMap: Record<string, ReactNode> = {
    contrast: (
      <section key="contrast">
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
    ),
    mechanism: (
      <section key="mechanism" className={styles.mech}>
        <Reveal className="wrap-narrow">
          <div className="center">
            <span className="eyebrow">{page?.mechanismEyebrow}</span>
            <h2 className="display">{page?.mechanismTitle}</h2>
          </div>
          <p className={styles.mechText}>{page?.mechanismText}</p>
          {page?.mechanismNote && <p className={styles.mechNote}>{page.mechanismNote}</p>}
        </Reveal>
      </section>
    ),
    dayShape: (
      <section key="dayShape" style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap-narrow">
          <div className="center" style={{ marginBottom: "1.4rem" }}>
            <span className="eyebrow">{page?.dayShapeEyebrow}</span>
            <h2 className="display">{page?.dayShapeTitle}</h2>
            <p className="lead" style={{ marginTop: ".9rem", maxWidth: "62ch", marginInline: "auto" }}>
              Two people can book the same temples and want completely different days. So
              instead of a timetable, your consigliere composes the day around you — and puts
              you in each place at the hour it is genuinely quiet.
            </p>
          </div>
          <div className={styles.principles}>
            {(page?.dayShapeSteps ?? []).map((s, i) => (
              <div className={styles.prItem} key={s.time || i}>
                <h3 className={styles.prHead}>{s.time}</h3>
                <p className={styles.prBody}>{s.label}</p>
              </div>
            ))}
          </div>
          {page?.dayShapeNote && <p className={styles.tlNote}>{page.dayShapeNote}</p>}
        </Reveal>
      </section>
    ),
    // Merged "What your day feels like" (image) + "The feel of it" (phases) into
    // one graphic section — image on one side, the day's phases as a timeline on
    // the other. Less prose, more shape.
    dayFeel: (
      <section key="dayFeel" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <Reveal className={styles.dfGrid}>
            <div className={styles.dfImg}>
              <Image src={dreamImg} alt="" fill sizes="(max-width: 860px) 100vw, 46vw" />
            </div>
            <div className={styles.dfBody}>
              <span className="eyebrow">{page?.dayShapeEyebrow}</span>
              <h2 className="display">{page?.dayShapeTitle}</h2>
              <ol className={styles.timeline}>
                {(page?.dayShapeSteps ?? []).map((s, i) => (
                  <li className={styles.tlItem} key={s.time || i}>
                    <span className={styles.tlTime}>{s.time}</span>
                    <span className={styles.tlLabel}>{s.label}</span>
                  </li>
                ))}
              </ol>
              {page?.dayShapeNote && <p className={styles.tlNote}>{page.dayShapeNote}</p>}
            </div>
          </Reveal>
        </div>
      </section>
    ),
    // The person who runs the day — shared cover component with the product
    // pages, with the concierge-day "how it works" folded into the overlay.
    consigliere: (
      <ConsigliereSection
        key="consigliere"
        eyebrow={product?.consigliereEyebrow}
        title={product?.consigliereTitle ?? ""}
        lead={product?.consigliereLead}
        image={product?.consigliereImage || "/images/hosts/ahmed-nile-sunset.jpg"}
        points={(product?.consiglierePoints ?? []).map((p) => ({
          title: p.title,
          description: p.description,
        }))}
      />
    ),
    threshold: (
      <section key="threshold" className={styles.threshold}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">{page?.thresholdEyebrow}</span>
          <h2 className="display">{page?.thresholdTitle}</h2>
          <p className="lead" style={{ marginTop: ".9rem" }}>
            {page?.thresholdText}
          </p>
        </Reveal>
      </section>
    ),
    multiDay: (
      <section key="multiDay" className={styles.multiDay}>
        <div className={styles.multiDayBg}>
          <Image src="/images/experiences/felucca-sunset-sail-hero.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.multiDayScrim} />
        <Reveal className={`wrap-narrow center ${styles.multiDayIn}`}>
          <span className="eyebrow">{page?.multiDayEyebrow}</span>
          <h2 className="display">{page?.multiDayTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.multiDayText}
          </p>
          <div style={{ marginTop: "1.6rem" }}>
            <Link href={page?.multiDayCtaHref || "/private-guide"} className="btn btn-ghost btn-lg">
              {page?.multiDayCtaLabel || "Begin a conversation →"}
            </Link>
          </div>
        </Reveal>
      </section>
    ),
    dream: (
      <section key="dream" className={styles.dream}>
        <Image src={dreamImg} alt="" fill sizes="100vw" />
        <div className={styles.dreamScrim} />
        <Reveal className={`wrap-narrow center ${styles.dreamContent}`}>
          <span className="eyebrow light">What your day feels like</span>
          <div className="divider-line" />
          <p>{page?.dreamText}</p>
        </Reveal>
      </section>
    ),
    howItWorks: (
      <section key="howItWorks" id="how">
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
    ),
    experiences: (
      <section key="experiences" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: ".6rem" }}>
            <span className="eyebrow">What your day can hold</span>
            <h2 className="display">Arranged for you, delivered by locals</h2>
            <p className="muted" style={{ maxWidth: "46ch", margin: ".5rem auto 0", fontSize: ".9rem" }}>
              A sample of what your journey can hold across up to three days — tap any experience
              to start designing your day.
            </p>
          </div>
          <ExperienceGrid cards={expCards} initial={9} />
        </div>
      </section>
    ),
    builder: (
      <section key="builder" id="design" style={{ background: "var(--color-paper)" }}>
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
            depositPercent={pricingRules?.depositPercent ?? 50}
            images={builderImages}
            priceTable={alaCartePrices}
            brandTable={alaCarteBrands}
          />
        </div>
      </section>
    ),
    valueStack: (
      <section key="valueStack">
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
    ),
    socialProof:
      reviews.length > 0 ? (
        <section key="socialProof" style={{ background: "var(--color-paper)" }}>
          <Reveal className="wrap center">
            <span className="eyebrow">From recent guests</span>
            <h2 className="display">The day they remember most.</h2>
            {!reviewsVerified && (
              <p className="muted" style={{ fontSize: ".74rem", marginTop: ".6rem" }}>
                Sample reviews — shown for layout only, to be replaced with real guest words.
              </p>
            )}
            <div className="tposts">
              {reviews.map((t, i) => {
                const stars = Math.max(1, Math.min(5, Math.round(t.rating ?? 5)));
                return (
                  <div className="tp" key={t.author || i}>
                    <div className="st" aria-label={`${stars} out of 5`}>
                      {"★".repeat(stars)}
                      {"☆".repeat(5 - stars)}
                    </div>
                    <blockquote>&quot;{t.quote}&quot;</blockquote>
                    <div className="who">— {t.author}</div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </section>
      ) : null,
    guarantee: (
      <section key="guarantee" className={styles.guarantee}>
        <div className={styles.guaranteeBg}>
          <Image src="/images/medinet-habu-facade.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.guaranteeScrim} />
        <Reveal className={`wrap-narrow center ${styles.grInner}`}>
          <span className="eyebrow">The Luxor Rising promise</span>
          <h2 className="display">Your day, guaranteed — or we make it right.</h2>
          <div className={styles.grGrid}>
            <div className={styles.gr}>
              <h4>Love the first two hours, or it&apos;s free</h4>
              <p>Not different from any tour you&apos;ve taken? Say so before lunch, refunded in full.</p>
            </div>
            <div className={styles.gr}>
              <h4>Cancel freely</h4>
              <p>Full refund up to 7 days before. No questions, no fine print.</p>
            </div>
            <div className={styles.gr}>
              <h4>Pay your way</h4>
              <p>Pay in full, or a deposit now and the rest on the day.</p>
            </div>
          </div>
        </Reveal>
      </section>
    ),
    scarcity: (
      <section key="scarcity" className={styles.scarcity}>
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
    ),
    gallery: (
      <section key="gallery">
        <div className="wrap center" style={{ marginBottom: ".5rem" }}>
          <span className="eyebrow">A glimpse of what waits</span>
          <h2 className="display">Moments from a Luxor Rising day</h2>
        </div>
        <div className="wrap">
          <GalleryMosaic items={galleryItems} />
        </div>
      </section>
    ),
    finalCta: (
      <section key="finalCta" className={styles.finalcta}>
        <div className={styles.finalBg}>
          <Image src="/images/experiences/karnak-at-dawn-hero.jpg" alt="" fill sizes="100vw" />
        </div>
        <div className={styles.finalScrim} />
        <Reveal className={`wrap-narrow center ${styles.finalIn}`}>
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
          {/* The Luxor Rising promise, folded into the close as one guarantee section */}
          <div className={styles.finalGuarantee}>
            <span className={styles.finalGrEyebrow}>The Luxor Rising promise — or we make it right</span>
            <div className={styles.finalGrGrid}>
              <div className={styles.finalGr}>
                <h4>Love the first two hours, or it&apos;s free</h4>
                <p>Not different from any tour you&apos;ve taken? Say so before lunch, refunded in full.</p>
              </div>
              <div className={styles.finalGr}>
                <h4>Cancel freely</h4>
                <p>Full refund up to 7 days before. No questions, no fine print.</p>
              </div>
              <div className={styles.finalGr}>
                <h4>Pay your way</h4>
                <p>Pay in full, or a deposit now and the rest on the day.</p>
              </div>
            </div>
          </div>
          <p className={styles.finalFine}>
            7-day free cancellation · deposit or pay in full · a handful of days each week
          </p>
        </Reveal>
      </section>
    ),
    faq: (
      <section key="faq" id="faq">
        <div className="wrap-narrow center">
          <span className="eyebrow">Good to know</span>
          <h2 className="display">Questions, answered</h2>
        </div>
        <div className="wrap-narrow" style={{ paddingTop: 0 }}>
          <Faq items={FAQ_ITEMS} />
        </div>
      </section>
    ),
  };

  return (
    <>
      <Nav ctaHref="#design" ctaLabel="Design your day" />

      {/* HERO */}
      <section className={styles.phero}>
        <div className={styles.pheroBgs}>
          {heroBgList.map((src) => (
            <div key={src} className={styles.pheroBg}>
              <Image src={src} alt="" fill priority sizes="100vw" quality={90} />
            </div>
          ))}
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
            <div className={styles.f}>
              <b>Zero</b>
              <span>Decisions for you</span>
            </div>
            <div className={styles.f}>
              <b>≤4</b>
              <span>You &amp; your group</span>
            </div>
            <div className={styles.f}>
              <b>Local</b>
              <span>Licensed experts</span>
            </div>
            <div className={styles.f}>
              <b>7-day</b>
              <span>Free cancellation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sections render in the order set in Keystatic. The builder and value
          stack both live inside one DayCountProvider so they share day count
          wherever they sit in the order. */}
      <DayCountProvider>{orderedKeys.map((k) => sectionMap[k]).filter(Boolean)}</DayCountProvider>

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
