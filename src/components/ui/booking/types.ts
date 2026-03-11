import type { Activity } from "@/lib/api/types";

/** Selected activity in booking with game option (1, 2, or 3 games) */
export type BookingActivityItem = {
  activity: Activity;
  gameOption: 1 | 2 | 3;
};

/** Global people selection for the whole booking (not per activity) */
export type BookingPeople = {
  adults: number;
  kids: number;
};

/** Pricing used for per-person calculation */
export type BookingPricing = {
  adultPrice: number;
  childPrice: number;
};

/** Date/time selection */
export type BookingDateTime = {
  date: string; // YYYY-MM-DD
  timeOfDay: 1 | 2 | 3; // Morning, Afternoon, Evening
  selectedStartTime: string | undefined; // e.g. "11:00 am"
};

/** Form fields for booking holder (step 2) */
export type BookingDetails = Record<string, string>;

/** Per-person bill breakdown */
export type PerPersonBreakdown = {
  adultsCount: number;
  kidsCount: number;
  adultPrice: number;
  childPrice: number;
  adultsSubtotal: number;
  kidsSubtotal: number;
  total: number;
};
