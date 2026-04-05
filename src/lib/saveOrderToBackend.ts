import { getOrdersSaveBackendBaseUrl } from "@/lib/ordersSaveBackend";
import type { PaidOrderRecord } from "@/lib/paidOrdersStorage";

/** POST full order JSON to server-for-save-data; each order is written under data/orders/. */
export async function saveOrderToBackend(order: PaidOrderRecord): Promise<{ file: string }> {
  const res = await fetch(`${getOrdersSaveBackendBaseUrl()}/save-order`, {
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
