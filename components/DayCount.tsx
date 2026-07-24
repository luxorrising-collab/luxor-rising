"use client";

import { createContext, useContext, useState } from "react";

export type DayCount = 1 | 2 | 3 | 4;

type Ctx = { days: DayCount; setDays: (d: DayCount) => void };

const DayCountContext = createContext<Ctx | null>(null);

/** Shares the chosen day count between the day builder and the value stack,
 *  so changing days in one place updates the other. */
export function DayCountProvider({
  children,
  initial = 1,
}: {
  children: React.ReactNode;
  initial?: DayCount;
}) {
  const [days, setDays] = useState<DayCount>(initial);
  return <DayCountContext.Provider value={{ days, setDays }}>{children}</DayCountContext.Provider>;
}

export function useDayCount() {
  const ctx = useContext(DayCountContext);
  if (!ctx) throw new Error("useDayCount must be used within a DayCountProvider");
  return ctx;
}
