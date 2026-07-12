"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import FilterChips from "@/components/FilterChips";
import ArticleCard, { ArticleCardProps } from "@/components/ArticleCard";
import styles from "./GuideClient.module.css";

type Post = ArticleCardProps & { cat: string };

const POSTS: Post[] = [
  {
    cat: "plan",
    href: "/insiders-guide/best-time-to-visit-luxor",
    src: "/images/karnak-columns-upward-view-sunlight_pexels-axp-photography-500641970-18934707.jpg",
    alt: "Temple columns in winter sunlight",
    title: "The best month to come — and the one everyone gets wrong",
    excerpt:
      "December is beautiful and busy. October is empty and still hot. The month we quietly recommend is neither, and it has nothing to do with temperature.",
    authorName: "Ahmed",
    readTime: "7 min",
  },
  {
    cat: "temple",
    href: "/insiders-guide/medinet-habu-why",
    src: "/images/medinet-habu-painted-column-corridor_IMG_20251009_095617.jpg",
    alt: "Painted reliefs at Medinet Habu",
    title: "Why Medinet Habu is the temple nobody tells you about",
    excerpt:
      "It still has its colour. It has almost no one in it. And it is a fifteen-minute drive from the tombs everyone queues for. We open every journey here for a reason.",
    authorName: "Dr. Nour",
    readTime: "6 min",
  },
  {
    cat: "plan",
    href: "/insiders-guide/hurghada-to-luxor-day-trip",
    src: "/images/desert-highway-mountains-dashboard_IMG_20251008_094256.jpg",
    alt: "Desert road between Hurghada and Luxor",
    title: "Hurghada to Luxor: what the €40 coach trip really costs you",
    excerpt:
      "A 3am pickup, nine hours on a bus, forty minutes at Karnak with a flag in the air. The maths of the cheap day trip, honestly told.",
    authorName: "Ahmed",
    readTime: "8 min",
  },
  {
    cat: "myth",
    href: "/insiders-guide/balloon-worth-it",
    src: "/images/hot-air-balloons-luxor-town-aerial_pexels-girlvsglobe86-300284270-30404378.jpg",
    alt: "Balloons over the west bank at dawn",
    title: "Is the sunrise balloon worth €130? An honest answer",
    excerpt:
      "Sometimes no. It depends on the season, the wind, and one thing about your itinerary most operators won't mention because it costs them the booking.",
    authorName: "Ahmed",
    readTime: "5 min",
  },
  {
    cat: "temple",
    href: "/insiders-guide/nefertari-tomb",
    src: "/images/tomb-painted-relief-doorway_IMG_20251009_111002.jpg",
    alt: "Painted ceiling detail in a royal tomb",
    title: "Ten minutes in Nefertari, and why people come out silent",
    excerpt:
      "The most expensive ticket in Egypt, capped at a handful of visitors a day. We explain exactly what you're paying for — and who should skip it.",
    authorName: "Dr. Nour",
    readTime: "6 min",
  },
  {
    cat: "life",
    href: "/insiders-guide/tipping-baksheesh",
    src: "/images/town-street-sunset-shops_IMG_20250924_181404.jpg",
    alt: "Street life in Luxor at sunset",
    title: "Baksheesh, explained without the awkwardness",
    excerpt:
      "Who to tip, how much, and the three situations where handing over money is the wrong move entirely. Written by someone who grew up with it.",
    authorName: "Ahmed",
    readTime: "5 min",
  },
  {
    cat: "temple",
    href: "/insiders-guide/karnak-in-one-hour",
    src: "/images/karnak-hypostyle-hall-columns_pexels-alyana-galyana-997347-34533510 – kópia.jpg",
    alt: "Columns of the Karnak hypostyle hall",
    title: "Karnak in one hour: the route we actually walk",
    excerpt:
      "Most people enter, photograph the big columns, and leave having missed the two things worth the trip. Here's the order we take guests in, and why.",
    authorName: "Dr. Nour",
    readTime: "7 min",
  },
  {
    cat: "life",
    href: "/insiders-guide/food-in-luxor",
    src: "/images/unpaved-street-midday-sun_IMG_20250923_170416.jpg",
    alt: "A quiet unpaved street in Luxor at midday",
    title: "Where we eat when nobody is watching",
    excerpt:
      "Not the Corniche places with laminated menus. Four kitchens on the west bank, what to order in each, and how to ask for it.",
    authorName: "Ahmed",
    readTime: "6 min",
  },
  {
    cat: "myth",
    href: "/insiders-guide/scams-and-hassle",
    src: "/images/horse-carriage-street-luxor-riders_pexels-toulouse-19820541 – kópia.jpg",
    alt: "A horse-drawn carriage on a Luxor street",
    title: "The hassle problem, and how much of it is real",
    excerpt:
      "Luxor's reputation is twenty years out of date — but not entirely. What's changed, what hasn't, and the two sentences that end 90% of it.",
    authorName: "Ahmed",
    readTime: "7 min",
  },
];

const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "temple", label: "Temples & tombs" },
  { value: "plan", label: "Planning & timing" },
  { value: "life", label: "Life in Luxor" },
  { value: "myth", label: "Myths & mistakes" },
];

export default function GuideClient() {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () => POSTS.filter((p) => filter === "all" || p.cat === filter),
    [filter]
  );

  return (
    <>
      <div className={styles.filtersWrap}>
        <FilterChips options={FILTERS} active={filter} onChange={setFilter} ariaLabel="Filter articles" />
      </div>
      <Reveal>
        <div className={styles.grid}>
          {visible.map((post) => (
            <ArticleCard key={post.href} {...post} />
          ))}
        </div>
        {visible.length === 0 && (
          <p className="center muted" style={{ padding: "2rem 0" }}>
            No articles in this category yet — try another filter.
          </p>
        )}
      </Reveal>
    </>
  );
}
