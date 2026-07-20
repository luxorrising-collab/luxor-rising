"use client";

import { useMemo, useState } from "react";
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

const SIGNATURE: Item[] = [
  {
    cat: ["temple", "signature"],
    href: "/medinet-habu",
    src: "/images/medinet-habu-facade.jpg",
    alt: "Medinet Habu temple facade at golden hour",
    meta: "Temples & tombs",
    title: "Medinet Habu, before anyone else",
    hook: "The last great temple, with its colour still on the walls — and almost nobody in it. We open your day here while the coaches are still queuing at Karnak.",
    facts: [<><b>Half day</b></>, <><b>1–8</b> guests</>, <><b>Sunrise</b> start</>],
    badge: "Signature",
    badgeVariant: "signature",
    scarcity: "Empty at 6:30am — we time it that way",
    priceLabel: "Included",
    priceValue: "€0",
    priceNote: "with any day",
    ctaLabel: "See the day",
    ctaVariant: "secondary",
  },
  {
    cat: ["temple", "signature"],
    href: "/concierge-day",
    src: "/images/karnak-columns-detail.jpg",
    alt: "Hypostyle hall columns at Karnak temple",
    meta: "Temples & tombs",
    title: "Karnak, in the quiet hour",
    hook: "134 columns, and for the first hour, only your footsteps. Your consigliere knows which gate opens first and which guard remembers his name.",
    facts: [<><b>Half day</b></>, <><b>1–8</b> guests</>, <><b>Early</b> access</>],
    badge: "Signature",
    badgeVariant: "signature",
    scarcity: "Private access before general opening",
    priceLabel: "Included",
    priceValue: "€0",
    priceNote: "with any day",
    ctaLabel: "See the day",
    ctaVariant: "secondary",
  },
];

const SINGLE_DAY: Item[] = [
  {
    cat: ["temple"],
    href: "/concierge-day?start=valley",
    src: "/images/valley-kings-tomb-pillar.jpg",
    alt: "Entrance to a royal tomb in the Valley of the Kings",
    meta: "Temples & tombs",
    title: "Valley of the Kings, tombs chosen for you",
    hook: "Not the three everyone shuffles through. We pick the tombs by what's just been cleaned, what's just reopened, and what's empty at that hour — including Tutankhamun if you want him.",
    facts: [<><b>Full day</b></>, <><b>1–8</b> guests</>, <>Tutankhamun <b>optional</b></>],
    badge: "Most booked",
    priceLabel: "From",
    priceValue: "€640",
    priceNote: "/ day, private",
    ctaLabel: "Reserve →",
  },
  {
    cat: ["temple"],
    href: "/concierge-day?start=hatshepsut",
    src: "/images/hatshepsut-temple-cliffs-wide-view_IMG_20251009_110231.jpg",
    alt: "Terraces of the Hatshepsut temple against the cliffs of Deir el-Bahari",
    meta: "Temples & tombs",
    title: "Hatshepsut & the cliffs of Deir el-Bahari",
    hook: "The woman who called herself king, and the terraces she cut into the mountain. Best at first light, when the rock still holds the cold.",
    facts: [<><b>Half day</b></>, <><b>1–8</b> guests</>, <><b>Sunrise</b> start</>],
    priceLabel: "From",
    priceValue: "€640",
    priceNote: "/ day, private",
    ctaLabel: "Reserve →",
  },
  {
    cat: ["temple"],
    href: "/concierge-day?add=nefertari",
    src: "/images/tomb-painted-relief-doorway_IMG_20251009_111002.jpg",
    alt: "Painted wall relief in a royal tomb doorway",
    meta: "Temples & tombs",
    title: "Nefertari — the finest painted tomb on earth",
    hook: "Ten minutes inside, and people come out quiet. Entry is capped and expensive, and it is worth every euro. We hold the slot, you just arrive.",
    facts: [<>Add to <b>any day</b></>, <><b>1–8</b> guests</>, <>Ticket <b>secured</b></>],
    badge: "Limited entry",
    scarcity: "150 visitors a day, worldwide",
    priceLabel: "Add-on",
    priceValue: "+€180",
    priceNote: "/ person",
    ctaLabel: "Add to a day →",
  },
  {
    cat: ["sky"],
    href: "/concierge-day?add=balloon",
    src: "/images/hot-air-balloons-valley-kings-dawn_pexels-diego-f-parra-33199-15188096 – kópia.jpg",
    alt: "Hot air balloons over the West Bank at sunrise",
    meta: "Sky & river",
    title: "Balloon over the west bank",
    hook: "Lift off in the dark, and watch the Valley, the Ramesseum and the green edge of the Nile come up out of the shadow beneath you. The one photograph you will actually print.",
    facts: [<><b>~3 hrs</b></>, <><b>Licensed</b> operator</>, <><b>Hotel</b> pickup</>],
    badge: "Sunrise only",
    scarcity: "Books out 5–7 days ahead in winter",
    priceLabel: "Add-on",
    priceValue: "+€130",
    priceNote: "/ person",
    ctaLabel: "Add to a day →",
  },
  {
    cat: ["sky"],
    href: "/concierge-day?add=felucca",
    src: "/images/nile-sunset-feluccas-boat-bow_IMG_20251009_182209.jpg",
    alt: "Felucca sail on the Nile at sunset",
    meta: "Sky & river",
    title: "Felucca, the hour the river turns gold",
    hook: "No engine, no schedule, no other guests. Just the sail, the current, and Luxor going soft on both banks. We bring the karkade and the silence.",
    facts: [<><b>~2 hrs</b></>, <><b>Private</b> boat</>, <><b>Sunset</b></>],
    priceLabel: "Add-on",
    priceValue: "+€60",
    priceNote: "/ boat",
    ctaLabel: "Add to a day →",
  },
  {
    cat: ["sky"],
    href: "/concierge-day?start=crossing",
    src: "/images/desert-highway-van-dashboard-view_IMG_20251008_092628.jpg",
    alt: "Desert highway seen from a private car dashboard",
    meta: "Sky & river",
    title: "The crossing — Hurghada to Luxor, our way",
    hook: "Staying on the Red Sea? Skip the 4am coach and the roadside stops. We move you door to door, and your day in Luxor starts the moment you arrive, not three hours later.",
    facts: [<><b>Full day</b></>, <><b>Door to door</b></>, <>From <b>Hurghada</b></>],
    badge: "Hurghada crossing",
    priceLabel: "From",
    priceValue: "€890",
    priceNote: "/ day, private",
    ctaLabel: "Reserve →",
  },
  {
    cat: ["desert"],
    href: "/concierge-day?start=reality",
    src: "/images/village-road-pickup-taxi-schoolkids_pexels-toulouse-19820449 – kópia.jpg",
    alt: "Village road with a pickup truck taxi and children walking to school",
    meta: "Desert & wild",
    title: "Reality Hunting — the Egypt behind the ticket booth",
    hook: "The day for people who want more than the monuments. Workshops, kitchens, a village that has never seen a tour bus, and the desert at the hour it stops being hot. Nothing here is on a map.",
    facts: [<><b>Full day</b></>, <><b>1–6</b> guests</>, <><b>No itinerary</b></>],
    badge: "A local's own",
    priceLabel: "From",
    priceValue: "€980",
    priceNote: "/ day, private",
    ctaLabel: "Reserve →",
  },
  {
    cat: ["temple"],
    href: "/concierge-day?start=dendera",
    src: "/images/dendera-hathor-column-painted-ceiling_pexels-diego-f-parra-33199-15187798 – kópia.jpg",
    alt: "Painted column and ceiling inside the Dendera temple",
    meta: "Temples & tombs",
    title: "Dendera & Abydos, the long drive worth taking",
    hook: "Two hours north, and almost nobody makes the trip. Ceilings still blue, a zodiac carved in stone, and the temple where Egypt buried its god. You will have both nearly to yourselves.",
    facts: [<><b>Full day</b></>, <><b>1–8</b> guests</>, <><b>Early</b> departure</>],
    priceLabel: "From",
    priceValue: "€740",
    priceNote: "/ day, private",
    ctaLabel: "Reserve →",
  },
  {
    cat: ["temple"],
    href: "/concierge-day?add=sphinxes",
    src: "/images/karnak-obelisk-colonnade-walker_pexels-alexazabache-3214972.jpg",
    alt: "Colonnade and obelisk at Karnak in the evening",
    meta: "Temples & tombs",
    title: "The Avenue of the Sphinxes, lit and empty",
    hook: "Three kilometres of rams, dug out after seventy years and lit at night. Walk it slowly, from Luxor Temple toward Karnak, the way the processions did.",
    facts: [<><b>Evening</b></>, <><b>1–8</b> guests</>, <><b>Free</b> with 2+ days</>],
    badge: "After dark",
    priceLabel: "Add-on",
    priceValue: "+€40",
    priceNote: "/ group",
    ctaLabel: "Add to a day →",
  },
  {
    cat: ["desert"],
    href: "/concierge-day?add=photo",
    src: "/images/woman-red-dress-karnak-columns_pexels-elifinatlasi-66733727-17490855.jpg",
    alt: "Guest photographed in a red dress among temple columns",
    meta: "Desert & wild",
    title: "A photographer, quietly, all day",
    hook: "Not posed. They stay behind you and come back with the pictures you would never have thought to take — including the calèche along the Corniche, which is worth doing purely for this.",
    facts: [<>Add to <b>any day</b></>, <><b>60+</b> edited shots</>, <><b>48hr</b> delivery</>],
    priceLabel: "Add-on",
    priceValue: "+€220",
    priceNote: "/ day",
    ctaLabel: "Add to a day →",
  },
];

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

export const ALL_ITEMS = [...SIGNATURE, ...SINGLE_DAY, ...ENQUIRY];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "temple", label: "Temples & tombs" },
  { value: "sky", label: "Sky & river" },
  { value: "desert", label: "Desert & wild" },
  { value: "signature", label: "Signature" },
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

  const visibleSignature = useMemo(() => SIGNATURE.filter((i) => matches(i, filter)), [filter]);
  const visibleSingleDay = useMemo(
    () => singleDayWithCms.filter((i) => matches(i, filter)),
    [singleDayWithCms, filter]
  );
  const visibleEnquiry = useMemo(() => ENQUIRY.filter((i) => matches(i, filter)), [filter]);
  const totalShown = visibleSignature.length + visibleSingleDay.length + visibleEnquiry.length;

  return (
    <>
      <div className={styles.filtersWrap}>
        <FilterChips options={FILTERS} active={filter} onChange={setFilter} ariaLabel="Filter experiences" />
      </div>
      <div className={styles.count}>
        {filter === "all"
          ? `Showing all ${singleDayWithCms.length} single-day experiences`
          : `Showing ${totalShown} experience${totalShown === 1 ? "" : "s"}`}
      </div>

      {visibleSignature.length > 0 && (
        <Reveal className={styles.sec}>
          <div className={styles.secHead}>
            <h2>Signature days</h2>
            <span className={styles.tag}>Included in every journey</span>
          </div>
          <p className={styles.secSub}>
            The two experiences we built the brand on. If you book a concierge day, at least one
            of these is already yours — no upsell, no asterisk.
          </p>
          <div className={styles.grid}>
            {visibleSignature.map((item) => (
              <ExperienceCard key={item.title} {...item} />
            ))}
          </div>
        </Reveal>
      )}

      {visibleSingleDay.length > 0 && (
        <Reveal className={styles.sec}>
          <div className={styles.secHead}>
            <h2>Book a single day</h2>
            <span className={styles.tag}>Instant reservation</span>
          </div>
          <p className={styles.secSub}>
            One day, one consigliere, everything handled — entries, transfers, timing, and a
            licensed Egyptologist who actually reads the walls. Reserve online in two minutes.
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
