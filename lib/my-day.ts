"use client";

// "My day": the experiences a visitor has added while browsing, remembered in
// this browser across pages and tabs (localStorage), like a basket. They travel
// into Design Your Day (shown there and sent with the booking or enquiry).

import { useSyncExternalStore } from "react";
import { planDays } from "./day-plan";
import { trackCartChange } from "./analytics";

export type DayPick = { slug: string; name: string };

const KEY = "lr-my-day";
const EVT = "lr-my-day-change";
const EMPTY: DayPick[] = [];

let cacheRaw: string | null = null;
let cacheVal: DayPick[] = EMPTY;
// Canonical names (slug → the builder's name), set once by the site layout, so
// a pick reads the same wherever it was added from.
let NAMES: Record<string, string> = {};
export function setDayNames(names: Record<string, string>) {
  NAMES = names;
  cacheRaw = null; // re-read with the canonical names
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT, { detail: {} }));
}

function read(): DayPick[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cacheRaw) return cacheVal;
    cacheRaw = raw;
    const parsed = raw ? JSON.parse(raw) : [];
    cacheVal = Array.isArray(parsed)
      ? parsed
          .filter((p): p is DayPick => p && typeof p.slug === "string" && typeof p.name === "string")
          .map((p) => (NAMES[p.slug] ? { ...p, name: NAMES[p.slug] } : p))
      : EMPTY;
  } catch {
    cacheVal = EMPTY;
  }
  return cacheVal;
}

function write(next: DayPick[], added?: DayPick) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked (private mode): the picks simply aren't remembered */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: { added } }));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMyDay() {
  const picks = useSyncExternalStore(subscribe, read, () => EMPTY);
  const has = (slug: string) => picks.some((p) => p.slug === slug);
  const add = (pick: DayPick) => {
    const cur = read();
    if (cur.some((p) => p.slug === pick.slug)) return;
    pick = { ...pick, name: NAMES[pick.slug] ?? pick.name };
    write([...cur, pick], pick);
    trackCartChange({ action: "add", item: { item_id: pick.slug, item_name: pick.name } });
  };
  const remove = (slug: string) => {
    const cur = read();
    const gone = cur.find((p) => p.slug === slug);
    if (!gone) return;
    write(cur.filter((p) => p.slug !== slug));
    trackCartChange({ action: "remove", item: { item_id: gone.slug, item_name: gone.name } });
  };
  const toggle = (pick: DayPick) => (read().some((p) => p.slug === pick.slug) ? remove(pick.slug) : add(pick));
  const clear = () => write([]);
  return { picks, has, add, remove, toggle, clear, ...planDays(picks.map((p) => p.slug)) };
}

/** The current picks, read straight from storage (outside React). */
export const readDayPicks = (): DayPick[] => (typeof window === "undefined" ? EMPTY : read());
/** Fired on every change to the picks (this tab). */
export const DAY_PICKS_EVENT = EVT;

/** Listen for "added" moments (for the confirmation toast). */
export function onDayPickAdded(cb: (pick: DayPick) => void) {
  const h = (e: Event) => {
    const added = (e as CustomEvent<{ added?: DayPick }>).detail?.added;
    if (added) cb(added);
  };
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

// How many days the picks need lives in ./day-plan (shared with server cards).
export { planDays, dayLength, type DaySegment } from "./day-plan";
