import "server-only";
import crypto from "crypto";

// Meta Conversions API (server-side Purchase). Best practice:
//  - fired from the confirmed order (real Stripe amount), never client input;
//  - de-duplicated against the browser Pixel via a shared `eventId`;
//  - richer match with hashed email + fbp/fbc + IP/UA;
//  - only ever called after the visitor granted marketing consent.
//
// The access token is a SECRET — server env only (META_CAPI_ACCESS_TOKEN).
// The Pixel ID comes from Keystatic (Tracking & analytics), same as the browser.

const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaPurchaseInput = {
  pixelId: string;
  token: string;
  eventId: string; // MUST match the browser Pixel event id (Stripe payment id)
  value: number;
  currency: string;
  contentIds: string[];
  email?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  eventSourceUrl?: string | null;
  testEventCode?: string | null;
};

export async function sendMetaPurchase(
  input: MetaPurchaseInput,
): Promise<{ ok: boolean; skipped?: boolean; status?: number; error?: string }> {
  if (!input.pixelId || !input.token) return { ok: false, skipped: true };

  const user_data: Record<string, unknown> = {};
  if (input.email) user_data.em = [sha256(input.email)];
  if (input.fbp) user_data.fbp = input.fbp;
  if (input.fbc) user_data.fbc = input.fbc;
  if (input.clientIp) user_data.client_ip_address = input.clientIp;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
        user_data,
        custom_data: {
          value: input.value,
          currency: input.currency,
          content_type: "product",
          content_ids: input.contentIds,
          contents: input.contentIds.map((id) => ({ id, quantity: 1 })),
        },
      },
    ],
    ...(input.testEventCode ? { test_event_code: input.testEventCode } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${input.pixelId}/events?access_token=${encodeURIComponent(input.token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      return { ok: false, status: res.status, error: await res.text() };
    }
    return { ok: true, status: res.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "fetch failed" };
  }
}
