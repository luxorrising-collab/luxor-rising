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
  { href: "/private-guide", label: "Private Guide" },
  { href: "/insiders-guide", label: "Insider's Guide" },
  { href: "/#about", label: "About" },
];

export type FooterColumn = { title: string; links: { href: string; label: string }[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Destinations",
    links: [
      { href: "/luxor", label: "Luxor" },
      { href: "/hurghada", label: "Hurghada" },
    ],
  },
  {
    title: "Experiences & services",
    links: [
      { href: "/experiences", label: "Experiences" },
      { href: "/private-tours", label: "Private Tours" },
      { href: "/private-guide", label: "Private Guide" },
      { href: "/concierge-day", label: "Design Your Day" },
      { href: "/#villas", label: "Private Villas" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#about", label: "About us" },
      { href: "/concierge-day#how", label: "How it works" },
      { href: "/insiders-guide", label: "Insider's Guide" },
      { href: "/#about", label: "Contact" },
    ],
  },
  {
    title: "Help & legal",
    links: [
      { href: "/legal", label: "Safety" },
      { href: "/legal", label: "Payments & refunds" },
      { href: "/legal", label: "FAQ" },
      { href: "/legal", label: "Terms · Privacy · Cookies" },
    ],
  },
];
