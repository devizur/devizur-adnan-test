import type { Activity } from "@/lib/api/types";

export type BookingProductType = {
  id: number;
  label: string;
  qty: number;
  price: number;
};

export type SelectedBookingProduct = Activity & {
  types: BookingProductType[];
  selectedOption?: number;
};

export type BookingDetails = Record<string, string>;
