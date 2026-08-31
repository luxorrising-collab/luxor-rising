"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import FilterChips from "@/components/FilterChips";
import chip from "@/components/FilterChips.module.css";
import ExperienceCard, { ExperienceCardProps } from "@/components/ExperienceCard";
import styles from "./ExperiencesClient.module.css";

type Item = ExperienceCardProps & { cat: string[]; loc?: string };

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
> & { category?: string; location?: string };

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
    facts: [<><b>4 days</b></>, <><b>1–4</b> guests</>, <>Concierge <b>throughout</b></>],
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

const LOCATIONS = [
  { value: "luxor", label: "Luxor" },
  { value: "hurghada", label: "Hurghada" },
];

// Products are grouped by category so like sits with like — signature (our
// flagship) leads, then temples, river, desert.
const CAT_ORDER: Record<string, number> = { signature: 0, temple: 1, sky: 2, desert: 3 };
const catRank = (it: Item) => Math.min(...it.cat.map((c) => CAT_ORDER[c] ?? 99));

function matches(item: Item, filter: string, locs: Set<string>) {
  const catOk = filter === "all" || item.cat.includes(filter);
  return catOk && locs.has(item.loc ?? "luxor");
}

export default function ExperiencesClient({
  cmsItems = [],
  conciergeDayPrice = 800,
}: {
  cmsItems?: CmsExperienceItem[];
  conciergeDayPrice?: number;
}) {
  const [filter, setFilter] = useState("all");
  // Both destinations on by default; you can toggle one off (never both).
  const [locs, setLocs] = useState<Set<string>>(() => new Set(["luxor", "hurghada"]));
  const toggleLoc = (v: string) =>
    setLocs((prev) => {
      const next = new Set(prev);
      if (next.has(v)) {
        if (next.size > 1) next.delete(v);
      } else {
        next.add(v);
      }
      return next;
    });

  // Real, CMS-managed experiences are shown alongside the curated single-day
  // lineup — new entries created in Keystatic land here automatically. They
  // carry their real category + destination, and the whole list is sorted by
  // category so like sits with like.
  const singleDayWithCms = useMemo<Item[]>(
    () =>
      [
        ...cmsItems.map((item) => ({
          ...item,
          cat: [item.category || "temple"],
          loc: item.location || "luxor",
        })),
        ...SINGLE_DAY,
      ].sort((a, b) => catRank(a) - catRank(b)),
    [cmsItems]
  );

  const visibleSingleDay = useMemo(
    () => singleDayWithCms.filter((i) => matches(i, filter, locs)),
    [singleDayWithCms, filter, locs]
  );
  const visibleEnquiry = useMemo(() => ENQUIRY.filter((i) => matches(i, filter, locs)), [filter, locs]);
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
            coaches still queue, then the tombs, the river or the desert. One concierge handles
            every ticket, transfer and timing.
          </p>
          <div className={styles.conciergeMeta}>
            <span>
              <b>From €{conciergeDayPrice}</b> / day
            </span>
            <span>Private · 1–4 guests</span>
            <span>Several experiences, one day</span>
          </div>
          <Link href="/concierge-day" className="btn btn-primary">
            Design your day →
          </Link>
        </div>
        <div className={styles.journey} aria-hidden="true">
          {[
            { n: "karnak-at-dawn-hero", label: "Dawn temple" },
            { n: "valley-of-the-kings-hero", label: "The tombs" },
            { n: "balloon-hero", label: "The sky" },
            { n: "felucca-sunset-sail-hero", label: "The river" },
            { n: "private-desert-safari-hero", label: "The desert" },
          ].map((s, i) => (
            <div key={s.n} className={styles.jSeg}>
              <div className={styles.jSegImg}>
                <Image
                  src={`/images/experiences/${s.n}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 40vw, 16vw"
                />
              </div>
              <div className={styles.jSegLabel}>
                <span className={styles.jNum}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.jName}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className={styles.filtersWrap}>
        <div className={styles.filterBar}>
          <FilterChips options={FILTERS} active={filter} onChange={setFilter} ariaLabel="Filter by type" />
          <span className={styles.filterDivider} aria-hidden />
          <div className={chip.row} role="group" aria-label="Filter by destination">
            {LOCATIONS.map((l) => (
              <button
                key={l.value}
                type="button"
                className={`${chip.chip} ${locs.has(l.value) ? chip.on : ""}`}
                onClick={() => toggleLoc(l.value)}
                aria-pressed={locs.has(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.count}>
        {`Showing ${totalShown} experience${totalShown === 1 ? "" : "s"}`}
      </div>

      {visibleSingleDay.length > 0 && (
        <Reveal className={styles.sec}>
          <div className={styles.secHead}>
            <h2>Book a single experience</h2>
            <span className={styles.tag}>Instant reservation</span>
          </div>
          <p className={styles.secSub}>
            One experience, one concierge, everything handled — entry, transfer, timing, and a
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
