"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import FilterChips from "@/components/FilterChips";
import ExperienceCard, { ExperienceCardProps } from "@/components/ExperienceCard";
import styles from "./ExperiencesClient.module.css";

type Item = ExperienceCardProps & { cat: string[] };

export type CmsExperienceItem = Pick<
  ExperienceCardProps,
  | "href"
  | "src"
  | "alt"
  | "title"
  | "place"
  | "hook"
  | "badge"
  | "scarcity"
  | "facts"
  | "priceValue"
  | "priceLabel"
  | "priceNote"
  | "ctaLabel"
>;

// Single experiences are now fully managed in Keystatic and injected via
// `cmsItems` — including The Crossing and Reality Hunting. Nothing is
// hard-coded here any more.
const SINGLE_DAY: Item[] = [];

const ENQUIRY: Item[] = [
  {
    cat: ["sky"],
    href: "/concierge-day",
    src: "/images/nile-cruise-boats-docked-mountains_nile cruise (5).jpg",
    alt: "Traditional sailing boats moored on the Nile beneath the Theban mountains",
    meta: "Sky & river",
    title: "Dahabiya — two nights under sail",
    hook: "A wooden sailing boat, six cabins, no engine noise and no buffet queue. You moor where the cruise ships cannot, and eat dinner on deck with the bank ten metres away.",
    facts: [<><b>3 days</b>, 2 nights</>, <>Up to <b>8</b> guests</>, <><b>Full board</b></>],
    badge: "2 nights aboard",
    priceLabel: "From",
    priceValue: "€1,480",
    priceNote: "/ person",
    ctaLabel: "Request a proposal",
    ctaVariant: "secondary",
  },
  {
    cat: ["desert"],
    href: "/concierge-day",
    src: "/images/desert-camp-carpet-aisle-lanterns_pexels-francesco-ungaro-998634.jpg",
    alt: "Desert camp at night with lanterns lighting a carpeted path",
    meta: "Desert & wild",
    title: "The Multi-Day Journey",
    hook: "Four days built for someone at a turning point. Temples in the morning, desert at night, and long conversations with people who have spent their lives listening to travellers decide things.",
    facts: [<><b>4 days</b></>, <><b>1–4</b> guests</>, <>Consigliere <b>throughout</b></>],
    badge: "Hero journey",
    badgeVariant: "signature",
    priceLabel: "From",
    priceValue: "€1,850",
    priceNote: "/ person",
    ctaLabel: "Request a proposal",
    ctaVariant: "secondary",
  },
  {
    cat: ["desert", "signature"],
    href: "/concierge-day",
    src: "/images/hatshepsut-temple-terrace-valley-view_IMG_20251009_110715.jpg",
    alt: "View over the Theban valley from the Hatshepsut temple terrace at dawn",
    meta: "Desert & wild",
    title: "The Return",
    hook: "A week. No itinerary published, because it is written for one person. If you already know why you want to come back to Egypt, you will understand what this is.",
    facts: [<><b>7 days</b></>, <><b>1–2</b> guests</>, <><b>Written</b> for you</>],
    badge: "By invitation",
    badgeVariant: "signature",
    priceLabel: "From",
    priceValue: "€2,450",
    priceNote: "/ person",
    ctaLabel: "Begin a conversation",
    ctaVariant: "secondary",
  },
];

export const ALL_ITEMS = [...SINGLE_DAY, ...ENQUIRY];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "temple", label: "Temples & tombs" },
  { value: "sky", label: "Sky & river" },
  { value: "desert", label: "Desert & wild" },
];

function matches(item: Item, filter: string) {
  return filter === "all" || item.cat.includes(filter);
}

export default function ExperiencesClient({ cmsItems = [] }: { cmsItems?: CmsExperienceItem[] }) {
  const [filter, setFilter] = useState("all");

  // Real, CMS-managed experiences are shown alongside the curated single-day
  // lineup — new entries created in Keystatic land here automatically,
  // without touching the hand-written cards above.
  const singleDayWithCms = useMemo<Item[]>(
    () => [...cmsItems.map((item) => ({ ...item, cat: ["temple"] })), ...SINGLE_DAY],
    [cmsItems]
  );

  const visibleSingleDay = useMemo(
    () => singleDayWithCms.filter((i) => matches(i, filter)),
    [singleDayWithCms, filter]
  );
  const visibleEnquiry = useMemo(() => ENQUIRY.filter((i) => matches(i, filter)), [filter]);
  const totalShown = visibleSingleDay.length + visibleEnquiry.length;

  return (
    <>
      {/* The concierge day is the flagship: a full private day of several
          experiences, clearly priced — not a €0 "included" card. */}
      <Reveal className={styles.concierge}>
        <div className={styles.conciergeText}>
          <span className="eyebrow">Start here</span>
          <h2>The Concierge Day</h2>
          <p>
            The heart of Luxor Rising — one private day with <b>several experiences</b> woven into
            it. A signature temple at dawn like <b>Medinet Habu</b> or <b>Karnak</b> while the
            coaches still queue, then the tombs, the river or the desert. One consigliere handles
            every ticket, transfer and timing.
          </p>
          <div className={styles.conciergeMeta}>
            <span>
              <b>From €640</b> / day
            </span>
            <span>Private · 1–8 guests</span>
            <span>Several experiences, one day</span>
          </div>
          <Link href="/concierge-day" className="btn btn-primary">
            Design your day →
          </Link>
        </div>
        <div className={styles.conciergeGrid} aria-hidden="true">
          {[
            "karnak-at-dawn-hero",
            "valley-of-the-kings-hero",
            "felucca-sunset-sail-hero",
            "private-desert-safari-hero",
          ].map((n) => (
            <div key={n} className={styles.conciergeTile}>
              <Image
                src={`/images/experiences/${n}.jpg`}
                alt=""
                fill
                sizes="(max-width: 720px) 45vw, 22vw"
              />
            </div>
          ))}
        </div>
      </Reveal>

      <div className={styles.filtersWrap}>
        <FilterChips options={FILTERS} active={filter} onChange={setFilter} ariaLabel="Filter experiences" />
      </div>
      <div className={styles.count}>
        {filter === "all"
          ? `Showing all ${singleDayWithCms.length} single experiences`
          : `Showing ${totalShown} experience${totalShown === 1 ? "" : "s"}`}
      </div>

      {visibleSingleDay.length > 0 && (
        <Reveal className={styles.sec}>
          <div className={styles.secHead}>
            <h2>Book a single experience</h2>
            <span className={styles.tag}>Instant reservation</span>
          </div>
          <p className={styles.secSub}>
            One experience, one consigliere, everything handled — entry, transfer, timing, and a
            licensed Egyptologist who actually reads the walls. Reserve online in two minutes. Or
            weave several into a <Link href="/concierge-day">concierge day</Link>.
          </p>
          <div className={styles.grid}>
            {visibleSingleDay.map((item) => (
              <ExperienceCard key={item.title} {...item} />
            ))}
          </div>
        </Reveal>
      )}

      {visibleEnquiry.length > 0 && (
        <Reveal className={styles.sec}>
          <div className={styles.secHead}>
            <h2>The long journeys</h2>
            <span className={styles.tag}>By arrangement</span>
          </div>
          <p className={styles.secSub}>
            Journeys with nights in them — a boat, a house, a week. These aren&apos;t sold from a
            cart. We speak first, then we build it around you.
          </p>
          <div className={styles.enqNote}>
            <b>Why these aren&apos;t a &quot;buy now&quot; button.</b> Anything with accommodation
            is arranged personally, with a written proposal and a contract — so you know exactly
            who is responsible for what, and so are we. Tell us what you have in mind and we&apos;ll
            come back within 24 hours.
          </div>
          <div className={styles.grid}>
            {visibleEnquiry.map((item) => (
              <ExperienceCard key={item.title} {...item} />
            ))}
          </div>
        </Reveal>
      )}

      {totalShown === 0 && (
        <p className="center muted" style={{ padding: "2rem 0" }}>
          No experiences match that filter yet — try another category.
        </p>
      )}
    </>
  );
}
