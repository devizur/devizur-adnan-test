"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Food, Activity, Package } from "@/lib/api/types";
import type { HolderDetails, BookingPersons } from "@/store/bookingSlice";

const CART_STORAGE_KEY = "booking_cart";

/** Checkout entry = one booking with holder details + products (activities, packages, foods). Only one at a time. */
export interface CartEntry {
  id: string;
  /** Booking holder contact/details – kept in relation to this entry's products */
  holderDetails: HolderDetails;
  persons: BookingPersons;
  date: string;
  timeSlot: string;
  timeOfDay: 1 | 2 | 3;
  activities: { activity: Activity; gameNo: number }[];
  packages: Package[];
  foods: { food: Food; quantity: number }[];
  addedAt: number;
}

export interface CartFoodItem {
  food: Food;
  quantity: number;
}

export interface CartActivityItem {
  activity: Activity;
  gameNo: number;
}

export interface CartPackageItem {
  pkg: Package;
}

interface CartContextType {
  /** At most one checkout booking (holder + products). Persisted to localStorage. */
  entries: CartEntry[];
  /** Set the single checkout booking (replaces any previous entry). */
  addEntry: (entry: Omit<CartEntry, "id" | "addedAt">) => void;
  /** Remove one booking from the cart. */
  removeEntry: (id: string) => void;
  /** Update one entry (e.g. change food quantity, remove an item). */
  updateEntry: (entryId: string, updater: (prev: CartEntry) => CartEntry) => void;
  /** Clear entire cart – e.g. after payment is done. */
  clearCart: () => void;
  /** Total item count across all entries (for badge, etc.). */
  getTotalItems: () => number;
  /** Flattened lists for backward compatibility / summary; prefer using entries for UI. */
  foodItems: CartFoodItem[];
  activityItems: CartActivityItem[];
  packageItems: CartPackageItem[];
  getFoodQuantity: (foodId: number) => number;
}

function loadCartFromStorage(): CartEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as CartEntry[];
  } catch {
    return [];
  }
}

function saveCartToStorage(entries: CartEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    setEntries(loadCartFromStorage());
    setHydrated(true);
  }, []);

  // Persist to localStorage when cart changes (after hydration so we don't overwrite with [])
  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage(entries);
  }, [entries, hydrated]);

  const addEntry = useCallback((entry: Omit<CartEntry, "id" | "addedAt">) => {
    const newEntry: CartEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      addedAt: Date.now(),
    };
    setEntries([newEntry]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((entryId: string, updater: (prev: CartEntry) => CartEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? updater(e) : e)));
  }, []);

  const clearCart = useCallback(() => {
    setEntries([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return entries.reduce((sum, e) => {
      const foodCount = e.foods.reduce((s, i) => s + i.quantity, 0);
      return sum + e.activities.length + e.packages.length + foodCount;
    }, 0);
  }, [entries]);

  const { foodItems, activityItems, packageItems } = useMemo(() => {
    const foodItems: CartFoodItem[] = [];
    const activityItems: CartActivityItem[] = [];
    const packageItems: CartPackageItem[] = [];
    entries.forEach((e) => {
      e.foods.forEach(({ food, quantity }) => {
        const existing = foodItems.find((i) => i.food.id === food.id);
        if (existing) existing.quantity += quantity;
        else foodItems.push({ food, quantity });
      });
      e.activities.forEach(({ activity, gameNo }) => activityItems.push({ activity, gameNo }));
      e.packages.forEach((pkg) => packageItems.push({ pkg }));
    });
    return { foodItems, activityItems, packageItems };
  }, [entries]);

  const getFoodQuantity = useCallback(
    (foodId: number) => {
      return foodItems.reduce((sum, item) => (item.food.id === foodId ? sum + item.quantity : sum), 0);
    },
    [foodItems]
  );

  const value: CartContextType = useMemo(
    () => ({
      entries,
      addEntry,
      removeEntry,
      updateEntry,
      clearCart,
      getTotalItems,
      foodItems,
      activityItems,
      packageItems,
      getFoodQuantity,
    }),
    [
      entries,
      addEntry,
      removeEntry,
      updateEntry,
      clearCart,
      getTotalItems,
      foodItems,
      activityItems,
      packageItems,
      getFoodQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
