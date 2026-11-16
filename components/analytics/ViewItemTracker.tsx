"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";

/** Fires view_item once per page view: the ID matches the dynamic ads feed row. */
export default function ViewItemTracker({ id, name, price }: { id: string; name: string; price: number }) {
  useEffect(() => {
    trackViewItem({ item: { item_id: id, item_name: name, price } });
  }, [id, name, price]);
  return null;
}
