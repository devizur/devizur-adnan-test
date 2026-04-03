import type { CartEntry } from "@/contexts/CartContext";

const PAID_ORDERS_KEY = "booking_paid_orders_v1";
const MAX_ORDERS = 100;

export interface PaidOrderRecord {
  id: string;
  paidAt: number;
  totalAmount: number;
  entries: CartEntry[];
}

export function loadPaidOrders(): PaidOrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PAID_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as PaidOrderRecord[];
  } catch {
    return [];
  }
}

/** Snapshot current cart as a paid order (call before clearCart). */
export function appendPaidOrder(entries: CartEntry[], totalAmount: number): void {
  if (typeof window === "undefined" || entries.length === 0) return;
  try {
    const list = loadPaidOrders();
    const record: PaidOrderRecord = {
      id: `ord_${Date.now()}`,
      paidAt: Date.now(),
      totalAmount,
      entries: JSON.parse(JSON.stringify(entries)) as CartEntry[],
    };
    list.unshift(record);
    localStorage.setItem(PAID_ORDERS_KEY, JSON.stringify(list.slice(0, MAX_ORDERS)));
  } catch {
    // ignore quota / parse errors
  }
}
