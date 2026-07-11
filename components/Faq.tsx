"use client";

import { useState } from "react";

export type FaqItem = { q: string; a: React.ReactNode };

export default function Faq({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq">
      {items.map((item, i) => (
        <div
          key={item.q}
          className={`qa ${openIndex === i ? "open" : ""}`}
          onClick={() => setOpenIndex(openIndex === i ? null : i)}
        >
          <div className="qa-q">
            <span>{item.q}</span>
            <span className="pl">+</span>
          </div>
          <div className="qa-a">{item.a}</div>
        </div>
      ))}
    </div>
  );
}
