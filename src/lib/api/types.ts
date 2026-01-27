/**
 * Shared base type for all catalog items (activities, foods, packages).
 * This keeps domain types independent from UI components.
 */
export interface BaseProduct {
  id: number;
  title: string;
  price: string;
  unit: string;
  rating: number;
  image: string;
  duration: string;
  discount?: string;
  timeSlots?: string[];
}

export interface Activity extends BaseProduct {
  category: string;
}

export interface Food extends BaseProduct {
  category: string;
}

export interface Package extends BaseProduct {
  category: string;
}
