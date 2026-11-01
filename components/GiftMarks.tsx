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

// The crown from our logo, traced from public/images/logo-emblem.png with its sharp
// tips and soft valleys, scaled evenly to the icon's width and sitting on the base
// and ground line this mark has always had. Every crown on the site draws these, so
// they can't drift apart.
export const CROWN_OUTLINE =
  "M24 50 L44.1 62.3 Q46.5 63.7 47.9 61.4 L60 40.1 L72.1 61.4 Q73.5 63.7 75.9 62.3 L96 50 L88 78 H32 Z";
export const CROWN_LINE = "M24 96 H96";
export const CROWN_OUTLINE_STYLE = { strokeLinejoin: "miter", strokeMiterlimit: 8 } as const;

export function IconCrown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...common}>
      <path d={CROWN_OUTLINE} style={CROWN_OUTLINE_STYLE} />
      <path d={CROWN_LINE} />
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
