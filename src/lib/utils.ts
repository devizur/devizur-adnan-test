import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a price string like "$12.50" or "BDT 200" into a number.
 * Non-numeric characters (except the decimal point) are stripped.
 */
export function parsePrice(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

/**
 * Format a number as a currency-like string.
 * Keeps the existing behavior of prefixing with "$" used in the cart.
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Lorem Picsum demo imagery. Plain width/height returns a random photo per request;
 * for stable-but-varied images per product, use `/seed/{id}/800/600` (see productServices).
 */
export const DemoImageUrl = "https://picsum.photos/800/600";

export type DemoCatalogKind = "food" | "activity" | "package";

export function demoCatalogImage(kind: DemoCatalogKind, productId: number): string {
  return `https://picsum.photos/seed/${kind}-${productId}/800/600`;
}

export function catalogImageOrDemo(
  imageUrl: string | undefined | null,
  kind: DemoCatalogKind,
  productId: number
): string {
  const t = (imageUrl ?? "").trim();
  if (t && /^https?:\/\//i.test(t)) return t;
  return demoCatalogImage(kind, productId);
}

/** Format "09:30" → "9:30 am", "14:00" → "2:00 pm" */
export function formatTimeForDisplay(raw: string): string {
  const [h, m] = raw.split(":").map(Number);
  if (h === 0) return `12:${String(m).padStart(2, "0")} am`;
  if (h === 12) return `12:${String(m).padStart(2, "0")} pm`;
  if (h < 12) return `${h}:${String(m).padStart(2, "0")} am`;
  return `${h - 12}:${String(m).padStart(2, "0")} pm`;
}

/** Convert "9:00 am" / "2:30 pm" → "09:00" / "14:30" for API */
export function displayTimeToApiSlot(display: string): string {
  const s = String(display || "").trim().toLowerCase();
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (!m) return "09:00";
  let h = parseInt(m[1], 10) || 0;
  const mins = parseInt(m[2], 10) || 0;
  const isPm = m[3] === "pm";
  if (isPm && h !== 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}