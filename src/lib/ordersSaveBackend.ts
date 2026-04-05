/**
 * Base URL for the local order JSON server (server-for-save-data).
 * Payment uses the payment gateway; this is only POST /save-order, GET/DELETE /orders.
 */
export function getOrdersSaveBackendBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_ORDERS_SAVE_BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_STRIPE_BACKEND_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "http://localhost:5002";
}
