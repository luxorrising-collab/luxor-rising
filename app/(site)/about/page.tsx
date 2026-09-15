import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import Reveal from "@/components/Reveal";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import styles from "./AboutPage.module.css";

// Live. To re-hide entirely, set PUBLISHED to false (404s the route) and revert
// the /about links in components/mainNav.ts back to the /#about anchor.
const PUBLISHED = true;

export const metadata: Metadata = {
  title: "A Retreat for Leaders — Why Luxor Rising Exists",
  description:
    "For thousands of years, the people who shaped the world withdrew to the desert and came back clearer. Luxor, at the edge of the Sahara, is where leaders and visionaries reset — arranged end to end.",
  alternates: { canonical: "/about" },
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
          <Image src="/images/desert-dunes-dusk-red.jpg" alt="" fill priority sizes="100vw" />
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

      {/* FOUNDER — credibility + the personal story, in service of the visitor */}
      <section className={styles.founderWrap}>
        <Reveal className={`wrap ${styles.founderGrid}`}>
          <figure className={styles.founderPhoto}>
            <Image
              src="/images/about/founder.jpg"
              alt="Marian, founder of Luxor Rising"
              width={800}
              height={1082}
              sizes="(max-width: 820px) 88vw, 460px"
            />
            <figcaption className={styles.founderCap}>
              <span className={styles.founderCapName}>Marian of Luxor Rising</span>
              <span className={styles.founderCapRole}>Founder</span>
              <a
                href="https://www.linkedin.com/in/marian-dufala-mok/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={styles.founderCta}
              >
                <svg className={styles.liIcon} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
                Connect with me on LinkedIn
              </a>
            </figcaption>
          </figure>
          <div className={styles.founderText}>
            <span className="eyebrow">Who&apos;s behind it</span>
            <h3 className={styles.founderName}>Built by someone who works with leaders like you.</h3>
            <p>
              Luxor Rising is led by Marian — a performance strategist with more than a decade
              inside Central Europe&apos;s leading performance-marketing agencies — over sixty projects
              for founders and market leaders, in some of the most competitive arenas there are:
              construction, tax and legal, e-commerce and local service brands. His craft is
              helping visionaries turn ambition into real results, with the steady hand of a
              seasoned project manager behind every move.
            </p>
            <p>
              He is also a certified breathwork instructor and guide — because the other half of
              the work is stillness. After a demanding year, he travelled to Africa to set a new
              direction for his own life, and Luxor became one of the most powerful and beautiful
              places he had ever stood in. Ahmed was beside him from the first moment to the last,
              and invited him to stay and build something here — a way to bring others to this
              ground with the care and reverence it asks for.
            </p>
            <p className={styles.founderKicker}>
              So this is who arranges your days: someone who knows the pressure you carry, and the
              stillness that answers it. We serve leaders and visionaries with deep respect — for
              you, and for one of the oldest ritual grounds on earth — so that, in the quiet, you
              find your own voice and authority again, the answers you came for, and return more
              grounded, confident, powerful and still.
            </p>
          </div>
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
