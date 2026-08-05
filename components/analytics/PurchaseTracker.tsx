"use client";

import { useEffect } from "react";
import { trackPurchase, type AnalyticsItem } from "@/lib/analytics";

/**
 * Fires the GA4/Meta `purchase` event once, on the confirmation page, with the
 * real Stripe-verified amount passed from the server. Renders nothing.
 */
export default function PurchaseTracker({
  transactionId,
  value,
  currency,
  items,
}: {
  transactionId: string;
  value: number;
  currency: string;
  items: AnalyticsItem[];
}) {
  useEffect(() => {
    trackPurchase({ transactionId, value, currency, items });
    // Keyed on the order id — a genuine second order fires again; a refresh does
    // not (guarded inside trackPurchase).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  return null;
}
