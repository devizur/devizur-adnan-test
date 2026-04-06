import axios from "axios";
import type { PaidOrderRecord } from "@/lib/paidOrdersStorage";

/**
 * Base URL for the local order JSON server (server-for-save-data).
 * Default: http://localhost:5002 — POST /save-order, GET/DELETE /orders.
 * Do not use NEXT_PUBLIC_STRIPE_BACKEND_URL here; that points at the payment gateway, not this service.
 */
function ensureHttpScheme(url: string): string {
  const t = url.trim().replace(/\/$/, "");
  if (!t) return "http://localhost:5002";
  if (/^https?:\/\//i.test(t)) return t;
  // "localhost:5002" without scheme → axios treats "localhost" as protocol (Unsupported protocol localhost:)
  return `http://${t}`;
}

function getOrdersSaveBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_ORDERS_SAVE_BACKEND_URL?.trim();
  if (raw) return ensureHttpScheme(raw);
  return "http://localhost:5002";
}

/** Axios client for order persistence (save-order + orders list/delete). */
const localHttp = axios.create({
  baseURL: `${getOrdersSaveBaseUrl()}/`,
});

export default localHttp;

function isOrderShape(o: unknown): o is PaidOrderRecord {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const x = o as Record<string, unknown>;
  return typeof x.id === "string" && Array.isArray(x.entries);
}

/** GET all orders from the order-save server (reads data/orders/*.json). */
export async function fetchOrdersFromBackend(): Promise<PaidOrderRecord[]> {
  try {
    const { data } = await localHttp.get<{ orders?: unknown; error?: string }>("/orders", {
      headers: { "Cache-Control": "no-store" },
    });
    const raw = data?.orders;
    if (!Array.isArray(raw)) return [];
    return raw.filter(isOrderShape);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { error?: string };
      throw new Error(d.error || `Could not load orders (${err.response.status})`);
    }
    throw err instanceof Error ? err : new Error("Could not load orders");
  }
}


export async function deleteOrderFromBackend(orderId: string): Promise<{ ok: true; notFound?: boolean }> {
  try {
    await localHttp.delete(`/orders/${encodeURIComponent(orderId)}`, {
      headers: { "Cache-Control": "no-store" },
    });
    return { ok: true };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { ok: true, notFound: true };
    }
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { error?: string };
      throw new Error(d.error || `Could not cancel order (${err.response.status})`);
    }
    throw err instanceof Error ? err : new Error("Could not cancel order");
  }
}

/** POST full order JSON to server-for-save-data; each order is written under data/orders/. */
export async function saveOrderToBackend(order: PaidOrderRecord): Promise<{ file: string }> {
  try {
    const { data } = await localHttp.post<{ error?: string; file?: string }>("/save-order", order);
    return { file: data?.file ?? "" };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { error?: string };
      throw new Error(d.error || `save-order failed (${err.response.status})`);
    }
    throw err instanceof Error ? err : new Error("save-order failed");
  }
}
