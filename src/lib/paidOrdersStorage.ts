import type { CartEntry } from "@/contexts/CartContext";

const PAID_ORDERS_KEY = "booking_paid_orders_v1";
const MAX_ORDERS = 100;

export interface PaidOrderRecord {
  id: string;
  paidAt: number;
  totalAmount: number;
  entries: CartEntry[];
  /** Set when payment completes via Stripe Payment Element. */
  stripePaymentIntentId?: string;
  /** Added by the server when the order file is written. */
  serverReceivedAt?: string;
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

/** Remove one paid order from browser storage (keeps list in sync after server delete or offline cancel). */
export function removePaidOrderById(orderId: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = loadPaidOrders().filter((o) => o.id !== orderId);
    localStorage.setItem(PAID_ORDERS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export interface AppendPaidOrderExtras {
  stripePaymentIntentId?: string;
}

/** Snapshot current cart as a paid order (call before clearCart). Returns the record for syncing to the backend. */
export function appendPaidOrder(
  entries: CartEntry[],
  totalAmount: number,
  extras?: AppendPaidOrderExtras
): PaidOrderRecord | null {
  if (typeof window === "undefined" || entries.length === 0) return null;
  try {
    const list = loadPaidOrders();
    const record: PaidOrderRecord = {
      id: `ord_${Date.now()}`,
      paidAt: Date.now(),
      totalAmount,
      entries: JSON.parse(JSON.stringify(entries)) as CartEntry[],
      ...(extras?.stripePaymentIntentId
        ? { stripePaymentIntentId: extras.stripePaymentIntentId }
        : {}),
    };
    list.unshift(record);
    localStorage.setItem(PAID_ORDERS_KEY, JSON.stringify(list.slice(0, MAX_ORDERS)));
    return record;
  } catch {
    return null;
  }
}
