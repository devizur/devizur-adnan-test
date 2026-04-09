import axios from "axios";
import { loadPaidOrders, type PaidOrderRecord } from "@/lib/paidOrdersStorage";
import bookingEngineUrlHttp from "@/lib/api/bookingEngineUrlHttp";
import type { SalesOrderLine, SalesOrderRequest, SalesOrderResponse } from "@/lib/api/salesOrderTypes";

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

function isSalesOrderShape(o: unknown): o is SalesOrderResponse {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const x = o as Record<string, unknown>;
  return typeof x.orderId === "number";
}

function mapSalesOrderToPaidOrder(order: SalesOrderResponse): PaidOrderRecord {
  const orderId = order.orderId ?? 0;
  const createdAtTs = order.createdAt ? Date.parse(order.createdAt) : Date.now();
  const paidAt = Number.isNaN(createdAtTs) ? Date.now() : createdAtTs;
  const totalAmount =
    typeof order.netAmount === "number"
      ? order.netAmount
      : typeof order.grossAmount === "number"
        ? order.grossAmount
        : 0;
  return {
    id: `so_${orderId || Date.now()}`,
    paidAt,
    totalAmount,
    entries: [],
    serverReceivedAt: order.createdAt,
    salesOrder: order,
  };
}

export async function fetchSalesOrderById(orderId: number): Promise<SalesOrderResponse | null> {
  if (!Number.isFinite(orderId) || orderId <= 0) return null;
  try {
    const { data } = await bookingEngineUrlHttp.get<SalesOrderResponse>(`/api/SalesOrder/${orderId}`);
    return data ?? null;
  } catch {
    return null;
  }
}

/** GET all orders from the order-save server (reads data/orders/*.json). */
export async function fetchOrdersFromBackend(): Promise<PaidOrderRecord[]> {
  const local = loadPaidOrders();
  const ids = [
    ...new Set(
      local
        .map((o) => o.salesOrder?.orderId)
        .filter((id): id is number => typeof id === "number" && id > 0)
    ),
  ];
  if (ids.length === 0) return [];

  const fetched = await Promise.all(ids.map((id) => fetchSalesOrderById(id)));
  const mapByOrderId = new Map(
    local
      .map((o) => [o.salesOrder?.orderId, o] as const)
      .filter(([id]) => typeof id === "number" && id > 0)
  );

  const merged = fetched
    .filter((o): o is SalesOrderResponse => !!o && isSalesOrderShape(o))
    .map((sales) => {
      const base = mapByOrderId.get(sales.orderId ?? -1);
      const mapped = mapSalesOrderToPaidOrder(sales);
      return {
        ...(base ?? mapped),
        salesOrder: sales,
        paidAt: base?.paidAt ?? mapped.paidAt,
        totalAmount:
          typeof sales.netAmount === "number"
            ? sales.netAmount
            : base?.totalAmount ?? mapped.totalAmount,
      } satisfies PaidOrderRecord;
    })
    .sort((a, b) => b.paidAt - a.paidAt);

  return merged;
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

function mapOrderToSalesPayload(order: PaidOrderRecord): SalesOrderRequest {
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
        modifiers: [],
        productName: safeName(activity.productName, safeName(activity.title, "Activity")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(activity.category, ""),
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
        modifiers: [],
        productName: safeName(pkg.productName, safeName(pkg.title, "Package")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(pkg.category, ""),
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
        modifiers: [],
        productName: safeName(food.productName, safeName(food.title, "Food")),
        subCategoryId: 0,
        subCategoryName: "",
        categoryId: 0,
        categoryName: safeName(food.category, ""),
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
  const hd = firstEntry?.holderDetails;
  const bookingId =
    typeof order.bookingId === "number" && Number.isFinite(order.bookingId) && order.bookingId > 0
      ? order.bookingId
      : 0;

  return {
    orderId: 0,
    orderNumber: "",
    uniqueOrderRef: `UOR-${Date.now()}`,
    shopId: 1,
    customerId: 0,
    salesPersonId: 3,
    posSessionId: 61,
    orderType: "DineIn",
    orderLevelDiscount: 0,
    appliedOfferId: 0,
    orderNotes: "",
    posTerminalId: 1,
    taxPolicyId: 2,
    orderLevelTax: 0,
    shopBrandMapId: 0,
    shopUnitId_DEPRECATED: 0,
    salesPersonName: "",
    lines,
    freeItems: [],
    orderStatusKey: "",
    payments: [],
    billSplits: [],
    grossAmount,
    totalLineTax,
    netAmount,
    paymentStatus: "Paid",
    createdAt: createdAtIso,
    updatedAt: createdAtIso,
    tableIds: [],
    tokenNumber: "",
    kitchenInstruction: "",
    deliveryInstruction: "",
    isSentToKitchen: true,
    createdBy: 3,
    updatedBy: 3,
    customerName,
    customerRef,
    customer: {
      customerId: 0,
      customerCode: "",
      firstName: hd?.firstName?.trim() ?? "",
      lastName: hd?.lastName?.trim() ?? "",
      phone: hd?.phone?.trim() ?? "",
      email: hd?.email?.trim() ?? "",
      city: "",
      country: "",
      isActive: true,
      createdAt: createdAtIso,
    },
    shopName: "",
    kitchenStatusKey: "",
    deliveryStatusKey: "",
    bookingId,
  };
}

/** POST booking order to booking engine sales order endpoint. */
export async function saveOrderToBackend(order: PaidOrderRecord): Promise<{
  file: string;
} & SalesOrderResponse> {
  try {
    const payload = mapOrderToSalesPayload(order);
    const { data } = await bookingEngineUrlHttp.post<SalesOrderResponse>(
      "/api/SalesOrder",
      payload
    );
    const orderId = data?.orderId;
    const fullOrder =
      typeof orderId === "number" && orderId > 0
        ? await fetchSalesOrderById(orderId)
        : null;
    return {
      file: "",
      ...((fullOrder ?? data ?? {}) as SalesOrderResponse),
    };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const d = err.response.data as { error?: string };
      throw new Error(d.error || `save sales order failed (${err.response.status})`);
    }
    throw err instanceof Error ? err : new Error("save sales order failed");
  }
}
