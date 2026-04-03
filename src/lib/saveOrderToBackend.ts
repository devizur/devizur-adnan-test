import { getStripeBackendBaseUrl } from "@/lib/stripeCheckout";
import type { PaidOrderRecord } from "@/lib/paidOrdersStorage";

/** POST full order JSON to the Express server; each order is written under server-for-stripe/data/orders/. */
export async function saveOrderToBackend(order: PaidOrderRecord): Promise<{ file: string }> {
  const res = await fetch(`${getStripeBackendBaseUrl()}/save-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string; file?: string };

  if (!res.ok) {
    throw new Error(data.error || `save-order failed (${res.status})`);
  }
  return { file: data.file ?? "" };
}
