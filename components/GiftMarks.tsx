import * as React from "react";

/* Shared gold product marks for the signature gifts, drawn as stroke-only SVGs
   that inherit their colour from `currentColor` — so a parent can light them
   (gold) or dim them (locked) just by setting `color`. Used by the checkout's
   gift tracker; the Gifts section keeps its own richer, filled variants. */

type IconProps = { className?: string };

const common = {
  fill: "none",
  stroke: "currentColor",
  // Heavier stroke so the marks stay legible when rendered small (the checkout
  // ticks and the sticky badge shrink them to ~20px).
  strokeWidth: 5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconSistrum({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 172" className={className} {...common}>
      <path d="M60 114 L60 158" />
      <path d="M51 158 H69" />
      <path d="M35 114 H85" />
      <path d="M40 114 V74 Q40 32 60 32 Q80 32 80 74 V114" />
      <circle cx="60" cy="25" r="5" />
      <path d="M43 56 H77" />
      <ellipse cx="52" cy="56" rx="6.5" ry="4" />
      <ellipse cx="68" cy="56" rx="6.5" ry="4" />
      <path d="M43 76 H77" />
      <ellipse cx="52" cy="76" rx="6.5" ry="4" />
      <ellipse cx="68" cy="76" rx="6.5" ry="4" />
      <path d="M43 96 H77" />
      <ellipse cx="52" cy="96" rx="6.5" ry="4" />
      <ellipse cx="68" cy="96" rx="6.5" ry="4" />
    </svg>
  );
}

export function IconSceptre({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 172" className={className} {...common}>
      <ellipse cx="60" cy="46" rx="21" ry="26" />
      <path d="M31 82 H89" />
      <path d="M60 72 V158" />
    </svg>
  );
}

export function IconCrown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...common}>
      <path d="M24 78 L34 38 L52 58 L60 28 L68 58 L86 38 L96 78 Z" />
      <path d="M24 96 H96" />
    </svg>
  );
}

export type Gift = {
  key: "sistrum" | "sceptre" | "crown";
  day: number;
  name: string;
  Icon: (p: IconProps) => React.ReactElement;
};

export const GIFTS: Gift[] = [
  { key: "sistrum", day: 1, name: "The Sistrum", Icon: IconSistrum },
  { key: "sceptre", day: 2, name: "The Sceptre", Icon: IconSceptre },
  { key: "crown", day: 3, name: "The Crown", Icon: IconCrown },
];

// One signature gift per full concierge day; the set is three.
export const giftsForDays = (days: number) => Math.max(1, Math.min(days, 3));
