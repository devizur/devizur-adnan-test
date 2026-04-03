import { getStripeBackendBaseUrl } from "@/lib/stripeCheckout";
import type { PaidOrderRecord } from "@/lib/paidOrdersStorage";

function isOrderShape(o: unknown): o is PaidOrderRecord {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const x = o as Record<string, unknown>;
  return typeof x.id === "string" && Array.isArray(x.entries);
}

/** GET all orders from the Express server (reads data/orders/*.json). */
export async function fetchOrdersFromBackend(): Promise<PaidOrderRecord[]> {
  const res = await fetch(`${getStripeBackendBaseUrl()}/orders`, { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as { orders?: unknown; error?: string };

  if (!res.ok) {
    throw new Error(data.error || `Could not load orders (${res.status})`);
  }

  const raw = data.orders;
  if (!Array.isArray(raw)) return [];

  return raw.filter(isOrderShape);
}

/**
 * Remove one order from the Express server (deletes matching JSON under data/orders/).
 * 404 means no file on server — caller may still remove local copy.
 */
export async function deleteOrderFromBackend(orderId: string): Promise<{ ok: true; notFound?: boolean }> {
  const res = await fetch(`${getStripeBackendBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (res.status === 404) {
    return { ok: true, notFound: true };
  }
  if (!res.ok) {
    throw new Error(data.error || `Could not cancel order (${res.status})`);
  }
  return { ok: true };
}
