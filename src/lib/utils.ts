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

export const DemoImageUrl = "https://picsum.photos/400/200";

/** Format "09:30" → "9:30 am", "14:00" → "2:00 pm" */
export function formatTimeForDisplay(raw: string): string {
  const [h, m] = raw.split(":").map(Number);
  if (h === 0) return `12:${String(m).padStart(2, "0")} am`;
  if (h === 12) return `12:${String(m).padStart(2, "0")} pm`;
  if (h < 12) return `${h}:${String(m).padStart(2, "0")} am`;
  return `${h - 12}:${String(m).padStart(2, "0")} pm`;
}