import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "./AboutPage.module.css";

// Preview state: reachable at /about so it can be reviewed, but kept OUT of the
// menu (see components/mainNav.ts) and OUT of search (robots noindex below).
// To fully launch: keep PUBLISHED true, remove the robots line, and restore the
// /about links in components/mainNav.ts. To re-hide entirely: set PUBLISHED false.
const PUBLISHED = true;

export const metadata: Metadata = {
  title: "A Retreat for Leaders — Why Luxor Rising Exists",
  description:
    "For thousands of years, the people who shaped the world withdrew to the desert and came back clearer. Luxor, at the edge of the Sahara, is where leaders and visionaries reset — arranged end to end.",
  alternates: { canonical: "/about" },
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "A Retreat for Leaders — Why Luxor Rising Exists",
    description:
      "Where leaders and visionaries go to step out of the noise and set the next vision clear.",
    url: "/about",
  },
};

export default function AboutPage() {
  if (!PUBLISHED) notFound();

  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO — the visitor is the hero; the sell is quiet and already here */}
      <header className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src="/images/desert-sunset-silhouette.jpg" alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">For leaders &amp; visionaries</span>
          <h1 className="display">The desert is where leaders go to become themselves again.</h1>
          <p className="lead" style={{ maxWidth: "60ch", margin: "1rem auto 0" }}>
            For thousands of years, the people who shaped the world withdrew to the emptiness —
            and came back clearer, stronger, and certain of what to do next. Luxor, at the edge
            of the Sahara, is where you do the same. We arrange everything else.
          </p>
          <div className={styles.rule} />
          <div className={styles.heroCtas}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your days →
            </Link>
            <Link href="/private-guide#request" className="btn btn-line btn-lg">
              Talk to us
            </Link>
          </div>
        </Reveal>
      </header>

      {/* THE PAIN — empathy + authority, spoken to the leader */}
      <section className={styles.tint}>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">If you&apos;ve come this far</span>
            <h2 className="display">Success has its own kind of exhaustion.</h2>
            <p>
              No one warns you that building something can hollow you out. That a brutal year —
              a loss, an ending, a fight you didn&apos;t choose — can leave you running on will
              alone, unable to hear your own judgement over the noise.
            </p>
            <p>
              You are used to carrying it. You carry it well. But somewhere in you, you already
              know the truth: you cannot set the next vision from inside the burnout that took
              the last one. To see clearly again, you have to step out of it — completely.
            </p>
          </Reveal>
        </div>
      </section>

      {/* THE TIMELESS ANSWER — traditions + great leaders */}
      <section>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">This is not new</span>
            <h2 className="display">Every tradition sends its seekers into the emptiness.</h2>
            <p>
              The instinct is ancient, and it is universal. <strong>Christ</strong> withdrew to
              the wilderness for forty days before he began. The <strong>Prophet Muhammad</strong>{" "}
              retreated to a cave in the desert hills, and returned with words that remade the
              world. The <strong>Buddha</strong> walked away from a palace into solitude, and
              came back awake.
            </p>
            <p>
              Different faiths, one pattern: leave the world behind, sit in the silence, and
              return transformed. And it was never only the prophets — reformers, founders and
              commanders have always known the same secret. The largest decisions are not made
              in the room full of noise. They are made in the stillness you retreat to first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHY LUXOR — the deeper meaning of the place */}
      <section className={styles.tint}>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">Why here</span>
            <h2 className="display">The oldest ground people ever came to touch the infinite.</h2>
            <p>
              Luxor sits at the edge of the Sahara, on land that has been sacred longer than
              almost anywhere on earth. For thousands of years, pharaohs, priests and pilgrims
              came here to stand between the living and the eternal — to make their reckonings
              where the veil felt thin and reality seemed closest to the infinite.
            </p>
            <p>
              That charge never left. People feel it the moment they arrive: a stillness with
              weight to it, a scale that quiets the mind and widens it at once. It is, simply,
              the most powerful ground we know to think a life over on.
            </p>
          </Reveal>
        </div>
      </section>

      {/* MOMENT — full-bleed emotional peak */}
      <section className={styles.moment}>
        <Image src="/images/experiences/karnak-at-dawn-hero.jpg" alt="" fill sizes="100vw" />
        <div className={styles.momentScrim} />
        <Reveal className={`wrap ${styles.momentIn}`}>
          <p>
            Where the world first went to touch forever — and where you go to see your own life
            clearly.
          </p>
        </Reveal>
      </section>

      {/* WHAT WE DO — the guide's plan, the subtle sell made concrete */}
      <section>
        <div className="wrap">
          <Reveal className={styles.story}>
            <span className="eyebrow">What we make possible</span>
            <h2 className="display">You bring the questions. We carry everything else.</h2>
            <p>
              A retreat only works if nothing pulls you back out of it. So we remove all of it —
              the planning, the logistics, the decisions, the friction. Private from the moment
              you land to the moment you leave. Temples at dawn before another soul arrives. The
              desert at the hour it goes silent. Days shaped entirely around the state of mind
              you came to find.
            </p>
          </Reveal>
          <Reveal className={styles.pillars}>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon} aria-hidden>✦</div>
              <h4>Private &amp; unhurried</h4>
              <p>No groups, no clock. The temples, the river and the desert, at their quietest hour.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon} aria-hidden>❖</div>
              <h4>Nothing to arrange</h4>
              <p>Every transfer, ticket, meal and timing is handled. You make no decisions you didn&apos;t come to make.</p>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon} aria-hidden>◆</div>
              <h4>Timed for stillness</h4>
              <p>The days are composed around space to think — not a checklist of sights to survive.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOUNDER — brief credibility, in service of the visitor */}
      <section className={styles.founderWrap}>
        <Reveal className={`wrap-narrow ${styles.founder}`}>
          <div className={styles.founderMark} aria-hidden>✦</div>
          <span className="eyebrow">Who&apos;s behind it</span>
          <h3 className={styles.founderName}>Built by someone who works with people like you.</h3>
          <p>
            Luxor Rising is led by a performance strategist who works directly with masters of
            their craft — more than sixty leaders across their segments — helping them reach
            their goals in the brutal reality of e-commerce, alongside some of the best in
            Central Europe.
          </p>
          <p className={styles.founderKicker}>
            So the person arranging your days already understands the pressure you carry — and
            exactly why stepping out of it, properly, changes everything.
          </p>
        </Reveal>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your reckoning</span>
          <h2 className="display">Set your next vision where the world set its first.</h2>
          <p className="lead" style={{ marginTop: ".8rem", maxWidth: "50ch", marginLeft: "auto", marginRight: "auto" }}>
            A private retreat in Luxor, arranged end to end. You arrive; everything else is
            handled.
          </p>
          <div className={styles.closerCtas}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your days →
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
