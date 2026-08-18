import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "./AboutPage.module.css";

// Work in progress — hidden from the live site for now. Flip PUBLISHED to true
// (and restore the /about links in components/mainNav.ts) when it's ready.
const PUBLISHED = false;

export const metadata: Metadata = {
  title: "Our Story — How Luxor Rising Began",
  description:
    "Luxor Rising began with 28 days in Egypt, a friendship with Ahmed, and four days in Luxor that changed the founder's life. The story of why we exist.",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "Our Story — How Luxor Rising Began",
    description:
      "Twenty-eight days in Egypt, a friendship with Ahmed, and four days in Luxor that changed everything.",
    url: "/about",
  },
};

export default function AboutPage() {
  if (!PUBLISHED) notFound();

  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src="/images/desert-sunset-silhouette.jpg" alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">Our story</span>
          <h1 className="display">Four days at the edge of the Sahara changed my life.</h1>
          <p className="lead" style={{ maxWidth: "56ch", margin: "1rem auto 0" }}>
            Luxor Rising began the way the best things do — unplanned, on a trip I took to
            save myself, in the company of a man who would become my partner.
          </p>
          <div className={styles.rule} />
          <div className={styles.heroCtas}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="/private-guide" className="btn btn-line btn-lg">
              Meet Ahmed
            </Link>
          </div>
        </Reveal>
      </header>

      {/* WHY I CAME */}
      <section>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">Why I came</span>
            <h2 className="display">I came to Egypt to find a new vision.</h2>
            <p>
              I spend my working life as a performance strategist in Central Europe. I help
              people and businesses perform under pressure — which means I know, intimately,
              what pressure and burnout do to a person. After the hardest year of my life, in
              business and personally, I needed to step out of it completely. Not a holiday.
              A retreat.
            </p>
            <p>
              I wanted somewhere old enough, and quiet enough, to set a new vision for my
              life. I chose the desert. I went to Egypt for twenty-eight days — and I went
              with a second, quieter intention too: to find partners, and build something
              real here.
            </p>
          </Reveal>
        </div>
      </section>

      {/* AHMED */}
      <section className={styles.tint}>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">The friendship</span>
            <h2 className="display">From the airport, to the airport — Ahmed.</h2>
            <p>
              From the moment I landed, a man named Ahmed took care of everything. He met me
              at the airport, and twenty-eight days later he said goodbye to me there. In
              between, he showed me an Egypt no visitor gets to see.
            </p>
            <p>
              It was Ahmed who insisted I go to Luxor. He didn&apos;t just book it — he told
              me how the place <em>feels</em>, what makes it unlike anywhere else on earth,
              why it mattered. Then he arranged four days for me. They were perfect.
            </p>
          </Reveal>
        </div>
      </section>

      {/* MOMENT — full-bleed quote */}
      <section className={styles.moment}>
        <Image src="/images/experiences/karnak-at-dawn-hero.jpg" alt="" fill sizes="100vw" />
        <div className={styles.momentScrim} />
        <Reveal className={`wrap ${styles.momentIn}`}>
          <p>
            Luxor sits at the edge of the Sahara, on one of the oldest ritual grounds on the
            planet. I have never, anywhere, felt so at home.
          </p>
        </Reveal>
      </section>

      {/* FOUR DAYS */}
      <section>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">Luxor</span>
            <h2 className="display">Four days, and a new vision.</h2>
            <p>
              I watched the sun rise over the sea and set over the desert. I spent the days
              contemplating — really contemplating — and somewhere inside them I set the new
              vision I had come for. Those four days were deeply, permanently impactful. There
              is a power to that place, a vibe I still cannot fully explain and have never
              stopped feeling.
            </p>
            <p>
              I had arrived intending to build cooperations in Egypt. What I did not expect
              was to find, in Ahmed, someone chasing the exact same dream — a local who had
              been looking for a partner to build it with.
            </p>
          </Reveal>
        </div>
      </section>

      {/* THE PARTNERSHIP / WHY WE EXIST */}
      <section className={styles.tint}>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">Luxor Rising</span>
            <h2 className="display">Two people, one dream.</h2>
            <p>
              Luxor Rising is what we built together: my outside eye for how a day should
              feel and flow, and Ahmed&apos;s lifetime of knowing this place — its people,
              and how to open doors that never open for tourists.
            </p>
            <p>
              We made the company we wished had existed when I first arrived. One that takes
              a tired, overwhelmed traveller and hands them the version of Egypt I was lucky
              enough to be given: nothing to arrange, nothing to carry, nothing to prove.
              Just arrive — and let the oldest place on earth do the rest.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FOUNDER PROFILE */}
      <section className={styles.founderWrap}>
        <Reveal className={`wrap-narrow ${styles.founder}`}>
          <div className={styles.founderMark} aria-hidden>
            ✦
          </div>
          <span className="eyebrow">The founder</span>
          {/* TODO: replace with the founder's name, and add a portrait to
              /images/about/founder.jpg if you'd like one shown here. */}
          <h3 className={styles.founderName}>[ Your name ]</h3>
          <div className={styles.founderRole}>Founder · Performance strategist, Central Europe</div>
          <p>
            Across more than sixty projects, I&apos;ve built a career on helping people and
            organisations perform under pressure without breaking. Luxor Rising is the other
            side of that work — the place, and the way, to put yourself back together and see
            clearly again.
          </p>
          <p className={styles.founderKicker}>
            It&apos;s the trip that changed me, made into something I can hand to you.
          </p>
        </Reveal>
      </section>

      {/* AHMED CROSS-LINK */}
      <section className={styles.partnerWrap}>
        <Reveal className={`wrap ${styles.partner}`}>
          <div className={styles.partnerImg}>
            <Image
              src="/images/hosts/ahmed-nile-sunset.jpg"
              alt="Ahmed, on the Nile at sunset"
              fill
              sizes="(max-width: 760px) 100vw, 420px"
            />
          </div>
          <div className={styles.partnerBody}>
            <span className="eyebrow">The man who started it all</span>
            <h3 className="display" style={{ margin: ".3rem 0 .8rem" }}>
              Ahmed, your consigliere.
            </h3>
            <p>
              Ahmed is the reason this exists — and the person who now looks after you on the
              ground, exactly the way he looked after me. His full story, and what a
              consigliere really is, lives on its own page.
            </p>
            <Link href="/private-guide" className="btn btn-line" style={{ marginTop: "1.2rem" }}>
              Meet Ahmed →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your turn</span>
          <h2 className="display">Come and feel it for yourself.</h2>
          <p className="lead" style={{ marginTop: ".8rem", maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
            The four days that changed my life are the ones we now arrange for you — private,
            unhurried, and handled end to end.
          </p>
          <div className={styles.closerCtas}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="/private-guide#request" className="btn btn-line btn-lg">
              Talk to us
            </Link>
          </div>
        </Reveal>
      </section>

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
