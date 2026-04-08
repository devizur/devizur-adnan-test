import axios from "axios";
import type { PaidOrderRecord } from "@/lib/paidOrdersStorage";
import bookingEngineUrlHttp from "@/lib/api/bookingEngineUrlHttp";

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
  // Local GET /orders has been removed from this flow.
  return [];
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

type SalesOrderLine = {
  orderLineId: number;
  orderId: number;
  productId: number;
  orderLineSerial: number;
  quantity: number;
  unitPrice: number;
  appliedOfferId: number;
  taxPolicyId: number;
  discount: number;
  taxAmount: number;
  modifierTotalPrice: number;
  lineTotal: number;
  kitchenStatusKey: string;
  deliveryStatusKey: string;
  orderStatusKey: string;
  discountOrFreeInfo: string;
  isComboProduct: boolean;
  productName: string;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  modifiers: unknown[];
  comboLines: unknown[];
};

type SalesOrderPayload = {
  orderId: number;
  orderNumber: string;
  uniqueOrderRef: string;
  shopId: number;
  customerId: number;
  salesPersonId: number;
  salesSessionId: number;
  orderType: string;
  grossAmount: number;
  totalLineTax: number;
  orderLevelDiscount: number;
  netAmount: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  appliedOfferId: number;
  tableIds: unknown[];
  tokenNumber: string;
  orderNotes: string;
  kitchenInstruction: string;
  deliveryInstruction: string;
  isSentToKitchen: boolean;
  createdBy: number;
  updatedBy: number;
  posTerminalId: number;
  taxPolicyId: number;
  orderLevelTax: number;
  shopUnitId: number;
  customerName: string;
  customerRef: string;
  lines: SalesOrderLine[];
  freeItems: unknown[];
  orderStatusKey: string;
  kitchenStatusKey: string;
  deliveryStatusKey: string;
};

function toMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function safeName(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v : fallback;
}

function mapOrderToSalesPayload(order: PaidOrderRecord): SalesOrderPayload {
  const createdAtIso = new Date(order.paidAt || Date.now()).toISOString();
  const lines: SalesOrderLine[] = [];
  let serial = 1;

  for (const entry of order.entries) {
    for (const row of entry.activities) {
      const activity = row.activity;
      const quantity = Math.max(1, Number(row.gameNo) || 1);
      const unitPrice = toMoney(activity.fixedPrice) || toMoney(activity.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      lines.push({
        orderLineId: 0,
        orderId: 0,
        productId: Number(activity.productId || activity.id || 0),
        orderLineSerial: serial++,
        quantity,
        unitPrice,
        appliedOfferId: 0,
        taxPolicyId: 2,
        discount: 0,
        taxAmount: 0,
        modifierTotalPrice: 0,
        lineTotal,
        kitchenStatusKey: "",
        deliveryStatusKey: "",
        orderStatusKey: "",
        discountOrFreeInfo: "No Discount",
        isComboProduct: false,
        productName: safeName(activity.productName, safeName(activity.title, "Activity")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(activity.category, ""),
        modifiers: [],
        comboLines: [],
      });
    }

    for (const row of entry.packages) {
      const pkg = row.pkg;
      const quantity = 1;
      const unitPrice =
        (row.combination?.fixedPrice ?? 0) > 0
          ? Number(row.combination?.fixedPrice)
          : toMoney(pkg.fixedPrice) || toMoney(pkg.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      lines.push({
        orderLineId: 0,
        orderId: 0,
        productId: Number(pkg.productId || pkg.id || 0),
        orderLineSerial: serial++,
        quantity,
        unitPrice,
        appliedOfferId: 0,
        taxPolicyId: 2,
        discount: 0,
        taxAmount: 0,
        modifierTotalPrice: 0,
        lineTotal,
        kitchenStatusKey: "",
        deliveryStatusKey: "",
        orderStatusKey: "",
        discountOrFreeInfo: "No Discount",
        isComboProduct: Boolean(pkg.isComboProduct),
        productName: safeName(pkg.productName, safeName(pkg.title, "Package")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(pkg.category, ""),
        modifiers: [],
        comboLines: [],
      });
    }

    for (const row of entry.foods) {
      const food = row.food;
      const quantity = Math.max(1, Number(row.quantity) || 1);
      const unitPrice = toMoney(food.fixedPrice) || toMoney(food.price);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      lines.push({
        orderLineId: 0,
        orderId: 0,
        productId: Number(food.productId || food.id || 0),
        orderLineSerial: serial++,
        quantity,
        unitPrice,
        appliedOfferId: 0,
        taxPolicyId: 2,
        discount: 0,
        taxAmount: 0,
        modifierTotalPrice: 0,
        lineTotal,
        kitchenStatusKey: "",
        deliveryStatusKey: "",
        orderStatusKey: "",
        discountOrFreeInfo: "No Discount",
        isComboProduct: Boolean(food.isComboProduct),
        productName: safeName(food.productName, safeName(food.title, "Food")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(food.category, ""),
        modifiers: [],
        comboLines: [],
      });
    }
  }

  const grossAmount = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const totalLineTax = Math.round(grossAmount * 0.1 * 100) / 100;
  const netAmount = Math.round((grossAmount + totalLineTax) * 100) / 100;
  const firstEntry = order.entries[0];
  const customerName = firstEntry
    ? `${firstEntry.holderDetails.firstName} ${firstEntry.holderDetails.lastName}`.trim()
    : "";
  const customerRef = firstEntry?.holderDetails.email?.trim() || "";

  return {
    orderId: 0,
    orderNumber: "",
    uniqueOrderRef: `UOR-${Date.now()}`,
    shopId: 1,
    customerId: 0,
    salesPersonId: 3,
    salesSessionId: 61,
    orderType: "DineIn",
    grossAmount,
    totalLineTax,
    orderLevelDiscount: 0,
    netAmount,
    paymentStatus: "Paid",
    createdAt: createdAtIso,
    updatedAt: createdAtIso,
    appliedOfferId: 0,
    tableIds: [],
    tokenNumber: "",
    orderNotes: "",
    kitchenInstruction: "",
    deliveryInstruction: "",
    isSentToKitchen: true,
    createdBy: 3,
    updatedBy: 3,
    posTerminalId: 1,
    taxPolicyId: 2,
    orderLevelTax: 0,
    shopUnitId: 2,
    customerName,
    customerRef,
    lines,
    freeItems: [],
    orderStatusKey: "",
    kitchenStatusKey: "",
    deliveryStatusKey: "",
  };
}

/** POST booking order to booking engine sales order endpoint. */
export async function saveOrderToBackend(order: PaidOrderRecord): Promise<{
  file: string;
  orderId?: number;
  orderNumber?: string;
  uniqueOrderRef?: string;
  tokenNumber?: string;
  grossAmount?: number;
  totalLineTax?: number;
  netAmount?: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}> {
  try {
    const payload = mapOrderToSalesPayload(order);
    console.log("[saveOrderToBackend] sales order payload", payload);
    const { data } = await bookingEngineUrlHttp.post<{
      orderId?: number;
      orderNumber?: string;
      uniqueOrderRef?: string;
      tokenNumber?: string;
      grossAmount?: number;
      totalLineTax?: number;
      netAmount?: number;
      paymentStatus?: string;
      createdAt?: string;
      updatedAt?: string;
    }>("/api/SalesOrder", payload);
    return {
      file: "",
      ...((data ?? {}) as {
        orderId?: number;
        orderNumber?: string;
        uniqueOrderRef?: string;
        tokenNumber?: string;
        grossAmount?: number;
        totalLineTax?: number;
        netAmount?: number;
        paymentStatus?: string;
        createdAt?: string;
        updatedAt?: string;
      }),
    };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { error?: string };
      throw new Error(d.error || `save sales order failed (${err.response.status})`);
    }
    throw err instanceof Error ? err : new Error("save sales order failed");
  }
}
