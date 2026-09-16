"use client";

import { useMemo, useState } from "react";
import Reveal from "@/components/Reveal";
import FilterChips from "@/components/FilterChips";
import ArticleCard, { ArticleCardProps } from "@/components/ArticleCard";
import styles from "./GuideClient.module.css";

type Post = ArticleCardProps & { cat: string };


const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "temples-tombs", label: "Temples & tombs" },
  { value: "planning-timing", label: "Planning & timing" },
  { value: "life-in-luxor", label: "Life in Luxor" },
  { value: "myths-mistakes", label: "Myths & mistakes" },
];

export type CmsArticlePost = Post;

export default function GuideClient({ cmsPosts = [] }: { cmsPosts?: CmsArticlePost[] }) {
  const [filter, setFilter] = useState("all");

  // Articles come entirely from Keystatic — new ones created in the CMS land
  // here automatically.
  const allPosts = useMemo(() => [...cmsPosts], [cmsPosts]);

  const visible = useMemo(
    () => allPosts.filter((p) => filter === "all" || p.cat === filter),
    [allPosts, filter]
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
