import type { CartEntry } from "@/contexts/CartContext";
import type { SalesOrderResponse } from "@/lib/api/salesOrderTypes";

const MAX_ORDERS = 100;
let inMemoryPaidOrders: PaidOrderRecord[] = [];

export interface PaidOrderRecord {
  id: string;
  paidAt: number;
  totalAmount: number;
  entries: CartEntry[];
  /** Set when payment completes via Stripe Payment Element. */
  stripePaymentIntentId?: string;
  /** Added by the server when the order file is written. */
  serverReceivedAt?: string;
  salesOrder?: SalesOrderResponse;
}

export function loadPaidOrders(): PaidOrderRecord[] {
  return [...inMemoryPaidOrders];
}

/** Remove one paid order from browser storage (keeps list in sync after server delete or offline cancel). */
export function removePaidOrderById(orderId: string): void {
  inMemoryPaidOrders = inMemoryPaidOrders.filter((o) => o.id !== orderId);
}

export function patchPaidOrder(orderId: string, patch: Partial<PaidOrderRecord>): void {
  inMemoryPaidOrders = inMemoryPaidOrders.map((o) =>
    o.id === orderId ? { ...o, ...patch } : o
  );
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
  if (entries.length === 0) return null;
  try {
    const record: PaidOrderRecord = {
      id: `ord_${Date.now()}`,
      paidAt: Date.now(),
      totalAmount,
      entries: JSON.parse(JSON.stringify(entries)) as CartEntry[],
      ...(extras?.stripePaymentIntentId
        ? { stripePaymentIntentId: extras.stripePaymentIntentId }
        : {}),
    };
    inMemoryPaidOrders = [record, ...inMemoryPaidOrders].slice(0, MAX_ORDERS);
    return record;
  } catch {
    return null;
  }
}
