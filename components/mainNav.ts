import type { NavLink } from "./Nav";

// The site's primary navigation, shared by every page. Destinations opens a
// dropdown; everything else is a flat link. Kept here so the whole site
// stays in sync from one place.
export const MAIN_NAV: NavLink[] = [
  {
    href: "/luxor",
    label: "Destinations",
    children: [
      { href: "/luxor", label: "Luxor", blurb: "Temples, tombs & the Nile" },
      { href: "/hurghada", label: "Hurghada", blurb: "Red Sea & day trips to Luxor" },
    ],
  },
  { href: "/experiences", label: "Experiences" },
  { href: "/private-villas", label: "Private Villas" },
  { href: "/private-guide", label: "Private Guide" },
  { href: "/insiders-guide", label: "Insider's Guide" },
  { href: "/#about", label: "About" },
];

export type FooterColumn = { title: string; links: { href: string; label: string }[] };

// Three balanced link groups plus the brand block — a single clean row on
// desktop. Destinations and services live together under "Explore".
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { href: "/luxor", label: "Luxor" },
      { href: "/hurghada", label: "Hurghada" },
      { href: "/experiences", label: "Experiences" },
      { href: "/private-villas", label: "Private Villas" },
      { href: "/private-tours", label: "Private Tours" },
      { href: "/concierge-day", label: "Design Your Day" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About us" },
      { href: "/private-guide", label: "Private Guide" },
      { href: "/concierge-day#how", label: "How it works" },
      { href: "/insiders-guide", label: "Insider's Guide" },
      { href: "/private-villas", label: "Private Villas" },
    ],
  },
  {
    title: "Help & legal",
    links: [
      { href: "/#about", label: "Contact" },
      { href: "/legal", label: "Safety" },
      { href: "/legal", label: "Payments & refunds" },
      { href: "/legal", label: "FAQ" },
      { href: "/legal", label: "Terms · Privacy · Cookies" },
    ],
  },
];
