import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import JsonLd from "@/components/JsonLd";

const HERO = "/images/desert-dune-milky-way_jimmy-larry-7uvixXrQkfw-unsplash.jpg";
const MID = "/images/desert-dunes-dusk-red.jpg";

export const metadata: Metadata = {
  title: "Thirty Days in the Desert — A Bespoke Retreat for Leaders & Visionaries",
  description:
    "Disappear for one month into one of the oldest ritual grounds on Earth and return transformed. A fully bespoke, end-to-end desert retreat in Luxor, Egypt — built around one person, connected to the world only when you choose. By invitation.",
  alternates: { canonical: "/thirty-days-in-the-desert" },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "Thirty Days in the Desert — Disappear for a month. Return changed.",
    description:
      "A fully bespoke, end-to-end month in the Egyptian desert for leaders and visionaries. One of the oldest ritual grounds on Earth, arranged around one person. By invitation.",
    url: "/thirty-days-in-the-desert",
    images: [HERO],
  },
};

const STACK: { h: string; p: string }[] = [
  {
    h: "A month written for one person",
    p: "Not an itinerary you join. A plan built around the question you are carrying — from a single long conversation before you ever pack a bag.",
  },
  {
    h: "Arranged end to end",
    p: "Visas, flights, transfers, permissions, a private camp, a chef, staff, security, and a doctor on call. Every logistic handled, so not one decision reaches you.",
  },
  {
    h: "A private desert camp",
    p: "Yours alone — proper beds, real food, hot water, shade and fire. Comfort is not the enemy of solitude; discomfort just becomes another distraction.",
  },
  {
    h: "The old ground, privately",
    p: "The temples and tombs of ancient Thebes, opened for you off-hours, and the open Sahara beyond them — walked with a private Egyptologist, or in complete silence.",
  },
  {
    h: "Connected only when you choose",
    p: "Satellite and 4G on site. You can vanish completely — and still sign the thing that can’t wait, or reach your family in a heartbeat. You step away without abandoning what you are responsible for.",
  },
  {
    h: "A guide, and then space",
    p: "Someone who has walked people through this before — present when you want counsel, invisible when you don’t. Company is offered, never imposed.",
  },
  {
    h: "The return, handled too",
    p: "The month is bracketed by preparation and integration — so what you find in the silence survives contact with your ordinary life.",
  },
];

export default function ThirtyDaysPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Thirty Days in the Desert",
    brand: { "@type": "Brand", name: "Luxor Rising" },
    category: "Bespoke retreat",
    description:
      "A fully bespoke, end-to-end thirty-day desert retreat in Luxor, Egypt for leaders and visionaries. Built around one person, in one of the oldest ritual grounds on Earth, connected to the world only when you choose. By invitation.",
    url: "https://luxorrising.com/thirty-days-in-the-desert",
    image: `https://luxorrising.com${HERO}`,
    offers: {
      "@type": "Offer",
      priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR" },
      availability: "https://schema.org/LimitedAvailability",
      url: "https://luxorrising.com/thirty-days-in-the-desert#request",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Nav scrollAware={false} ctaHref="#request" ctaLabel="Request an invitation" />

      {/* HERO */}
      <header
        style={{
          position: "relative",
          minHeight: "88vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--color-cream)",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src={HERO} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(120% 90% at 50% 0%, rgba(15,10,6,.55), rgba(15,10,6,.86))",
          }}
        />
        <Reveal className="wrap" style={{ position: "relative", zIndex: 1, padding: "8rem 0" }}>
          <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
            By invitation · Luxor, Egypt
          </span>
          <h1 className="display" style={{ fontSize: "clamp(2.6rem,7vw,5rem)", margin: ".4rem 0 0", color: "var(--color-gold-soft)" }}>
            Disappear for a month.
            <br />
            Return changed.
          </h1>
          <p className="lead" style={{ maxWidth: "40ch", margin: "1.4rem auto 0", color: "var(--color-cream)" }}>
            Thirty days in one of the oldest ritual grounds on Earth — a fully bespoke retreat for
            leaders and visionaries, arranged end to end. You bring the question. We build the
            month around it.
          </p>
          <div className="divider-line" />
          <Link href="#request" className="btn btn-primary btn-lg">
            Request an invitation →
          </Link>
        </Reveal>
      </header>

      {/* THE PREMISE — dream outcome */}
      <section className="wrap-narrow center" style={{ padding: "5.5rem 0 4rem" }}>
        <Reveal>
          <span className="eyebrow">Why this exists</span>
          <h2 className="display" style={{ margin: ".4rem 0 1.1rem" }}>
            The most valuable thing you own is a clear mind.
          </h2>
          <p className="lead" style={{ maxWidth: "60ch", margin: "0 auto" }}>
            People at the top of anything rarely lack information. What they lack is silence long
            enough to hear themselves think — to make the one decision, see the next decade, or
            simply become a person they recognise again. That doesn’t happen in a weekend. It
            happens when the noise finally runs out.
          </p>
        </Reveal>
      </section>

      {/* WHY 30 DAYS — turn the time objection into the mechanism */}
      <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)" }}>
        <Reveal className="wrap-narrow" style={{ padding: "5rem 0" }}>
          <span className="eyebrow">Why a month, not a weekend</span>
          <h2 className="display" style={{ margin: ".4rem 0 1.2rem" }}>
            A weekend rearranges your calendar. A month rearranges you.
          </h2>
          <p style={{ maxWidth: "64ch", marginBottom: "1.4rem" }}>
            For as long as there are records of it, thirty to forty days is the length humans have
            gone into the wilderness to change — the desert fathers, the vision quest, forty days in
            the wild. It is not arbitrary. It is roughly how long it takes a driven mind to actually
            let go.
          </p>
          <div style={{ display: "grid", gap: "1px", background: "var(--color-line)", border: "1px solid var(--color-line)", borderRadius: "6px", overflow: "hidden" }}>
            {[
              ["Week one", "You stop. The body unwinds, the sleep returns, the reflex to check your phone slowly dies."],
              ["Week two", "The noise thins. Old thoughts surface. You get bored — which is the door opening."],
              ["Week three", "The real thinking begins. This is the week people come for, and the one they can never buy a shortcut to."],
              ["Week four", "You integrate. What you found stops being a feeling and becomes a decision you’ll keep."],
            ].map(([w, p]) => (
              <div key={w} style={{ background: "var(--color-cream)", padding: "1.2rem 1.4rem" }}>
                <b style={{ fontFamily: "var(--font-display)", color: "var(--color-gold-deep)", fontSize: "1.05rem" }}>{w}</b>
                <p style={{ margin: ".3rem 0 0", color: "var(--color-ink)", opacity: 0.86 }}>{p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* WHY LEADERS & VISIONARIES */}
      <section className="wrap-narrow" style={{ padding: "5.5rem 0" }}>
        <Reveal>
          <span className="eyebrow">Who it is for</span>
          <h2 className="display" style={{ margin: ".4rem 0 1.2rem" }}>
            The people who most need to disappear are the ones who believe they can’t.
          </h2>
          <p style={{ maxWidth: "64ch", marginBottom: "1.1rem" }}>
            Founders at an inflection point. Leaders between two chapters. Anyone carrying a vision
            that has grown too large to think about between meetings. The most effective people in
            the world already protect long stretches of solitude on purpose — it is a well-kept habit
            of the exceptionally clear, not a luxury for the idle.
          </p>
          <p style={{ maxWidth: "64ch", color: "var(--color-muted)" }}>
            You can afford the month precisely because you can’t afford another year of not having
            taken it.
          </p>
        </Reveal>
      </section>

      {/* WHY LUXOR — significance, dark section */}
      <section style={{ position: "relative", color: "var(--color-cream)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src={MID} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,13,7,.82), rgba(20,13,7,.9))" }} />
        <Reveal className="wrap-narrow" style={{ position: "relative", zIndex: 1, padding: "6rem 0" }}>
          <span className="eyebrow" style={{ color: "var(--color-gold)" }}>Why here</span>
          <h2 className="display" style={{ margin: ".4rem 0 1.2rem", color: "var(--color-gold-soft)" }}>
            The oldest ground on Earth for asking the largest questions.
          </h2>
          <p style={{ maxWidth: "64ch", marginBottom: "1.1rem" }}>
            Luxor is ancient Thebes — where, for more than four thousand years without a break,
            people have built temples, buried kings, and come to stand in front of something larger
            than themselves. There is nowhere else on the planet where the ritual has run this deep
            for this long.
          </p>
          <p style={{ maxWidth: "64ch", marginBottom: "1.1rem" }}>
            And it sits on a threshold. At Luxor the green edge of the Nile — water, life, the whole
            human bustle — ends, and the Sahara begins: the largest silence on the continent, opening
            straight off the edge of the tombs. Life on one side, eternity on the other, a few
            minutes’ drive apart.
          </p>
          <p style={{ maxWidth: "64ch", color: "var(--color-gold-soft)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.25rem" }}>
            You would be doing an ancient thing, in the one place that has done it longest.
          </p>
        </Reveal>
      </section>

      {/* THE OFFER STACK */}
      <section className="wrap" style={{ padding: "5.5rem 0 4rem" }}>
        <Reveal className="center">
          <span className="eyebrow">What a bespoke month holds</span>
          <h2 className="display" style={{ margin: ".4rem 0 .8rem" }}>
            Everything arranged. Nothing standing between you and the silence.
          </h2>
          <p className="lead" style={{ maxWidth: "58ch", margin: "0 auto 2.6rem" }}>
            The whole point is effortlessness. You make no arrangements, solve no problems and carry
            nothing. The desert asks enough of you on its own.
          </p>
        </Reveal>
        <div style={{ maxWidth: "760px", margin: "0 auto", borderTop: "1px solid var(--color-line)" }}>
          {STACK.map((s) => (
            <Reveal key={s.h} style={{ display: "flex", gap: "1.1rem", padding: "1.4rem 0", borderBottom: "1px solid var(--color-line-soft, var(--color-line))" }}>
              <span aria-hidden style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)", fontSize: "1.3rem", lineHeight: 1.2 }}>✦</span>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "1.28rem", color: "var(--color-ink)", margin: "0 0 .3rem" }}>{s.h}</h3>
                <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.6 }}>{s.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* RISK REVERSAL + SCARCITY */}
      <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-line)" }}>
        <Reveal className="wrap-narrow center" style={{ padding: "5rem 0" }}>
          <span className="eyebrow">How it begins — and why it stays rare</span>
          <h2 className="display" style={{ margin: ".4rem 0 1.2rem" }}>
            A conversation first. Nothing booked until it’s right.
          </h2>
          <p style={{ maxWidth: "60ch", margin: "0 auto 1.1rem" }}>
            It starts with one private, unhurried conversation — no obligation, complete discretion,
            an NDA if you want one. From it we write a bespoke plan for your month, and not a single
            thing is arranged until you have read it and said yes. If it isn’t right for you, we’ll be
            the first to say so.
          </p>
          <p style={{ maxWidth: "60ch", margin: "0 auto", color: "var(--color-muted)" }}>
            We take one guest or party into the desert at a time, in the cool-season windows only.
            The desert cannot be scaled, so places are genuinely few — and spoken for early.
          </p>
        </Reveal>
      </section>

      {/* REQUEST */}
      <section id="request" className="wrap-narrow" style={{ padding: "5.5rem 0" }}>
        <Reveal className="center" style={{ marginBottom: "2rem" }}>
          <span className="eyebrow">The invitation</span>
          <h2 className="display" style={{ margin: ".4rem 0 .8rem" }}>
            Begin a private conversation.
          </h2>
          <p className="lead" style={{ maxWidth: "52ch", margin: "0 auto" }}>
            Tell us, in a line or two, what you’re carrying and roughly when. We reply personally,
            within 24 hours.
          </p>
        </Reveal>
        <EnquiryForm
          topic="Thirty Days in the Desert"
          note="A bespoke month is arranged personally. Share as little or as much as you like — everything you write is held in complete confidence."
        />
      </section>

      <div style={{ paddingBottom: "64px" }}>
        <FullFooter columns={FOOTER_COLUMNS} />
      </div>
    </>
  );
}
