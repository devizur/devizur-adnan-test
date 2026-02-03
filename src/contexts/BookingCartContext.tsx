"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Activity } from "@/lib/api/types";
import type { SelectedBookingProduct, BookingDetails } from "@/components/ui/booking/types";

const BOOKING_CART_STORAGE_KEY = "booking-cart";

export interface BookingCartState {
  selectedProducts: SelectedBookingProduct[];
  step: number;
  slot: string | undefined;
  activeTab: number;
  bookingDetails: BookingDetails;
}

const defaultState: BookingCartState = {
  selectedProducts: [],
  step: 1,
  slot: undefined,
  activeTab: 1,
  bookingDetails: {},
};

interface BookingCartContextType extends BookingCartState {
  setStep: (step: number) => void;
  setSlot: (slot: string | undefined) => void;
  setActiveTab: (id: number) => void;
  setBookingDetails: (details: BookingDetails | ((prev: BookingDetails) => BookingDetails)) => void;
  toggleProduct: (activity: Activity) => void;
  setProductOption: (productId: number, value: number) => void;
  updateProductQty: (productId: number, typeId: number, action: "increment" | "decrement") => void;
  totalSelectedQty: number;
  resetBookingCart: () => void;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

function loadFromStorage(): BookingCartState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(BOOKING_CART_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<BookingCartState>;
    return {
      selectedProducts: parsed.selectedProducts ?? defaultState.selectedProducts,
      step: typeof parsed.step === "number" ? parsed.step : defaultState.step,
      slot: parsed.slot ?? defaultState.slot,
      activeTab: typeof parsed.activeTab === "number" ? parsed.activeTab : defaultState.activeTab,
      bookingDetails: parsed.bookingDetails ?? defaultState.bookingDetails,
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: BookingCartState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKING_CART_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving booking cart to localStorage:", e);
  }
}

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingCartState>(defaultState);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) saveToStorage(state);
  }, [state, initialized]);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setSlot = useCallback((slot: string | undefined) => {
    setState((prev) => ({ ...prev, slot }));
  }, []);

  const setActiveTab = useCallback((activeTab: number) => {
    setState((prev) => ({ ...prev, activeTab }));
  }, []);

  const setBookingDetails = useCallback(
    (details: BookingDetails | ((prev: BookingDetails) => BookingDetails)) => {
      setState((prev) => ({
        ...prev,
        bookingDetails: typeof details === "function" ? details(prev.bookingDetails) : details,
      }));
    },
    []
  );

  const toggleProduct = useCallback((activity: Activity) => {
    setState((prev) => {
      const exists = prev.selectedProducts.some((item) => item.id === activity.id);
      if (exists) {
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter((item) => item.id !== activity.id),
        };
      }
      return {
        ...prev,
        selectedProducts: [
          ...prev.selectedProducts,
          {
            ...activity,
            types: [
              { id: 1, label: "Adult", qty: 0, price: 20 },
              { id: 2, label: "Kids", qty: 0, price: 15 },
            ],
          },
        ],
      };
    });
  }, []);

  const setProductOption = useCallback((productId: number, value: number) => {
    setState((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map((item) =>
        item.id === productId ? { ...item, selectedOption: value } : item
      ),
    }));
  }, []);

  const updateProductQty = useCallback(
    (productId: number, typeId: number, action: "increment" | "decrement") => {
      setState((prev) => ({
        ...prev,
        selectedProducts: prev.selectedProducts.map((product) => {
          const updatedTypes = product.types.map((type) => {
            if (type.id !== typeId) return type;
            const newQty =
              action === "increment" ? type.qty + 1 : Math.max(0, type.qty - 1);
            return { ...type, qty: newQty };
          });
          return { ...product, types: updatedTypes };
        }),
      }));
    },
    []
  );

  const totalSelectedQty = state.selectedProducts.reduce(
    (sum, p) => sum + p.types.reduce((s, t) => s + t.qty, 0),
    0
  );

  const resetBookingCart = useCallback(() => {
    setState(defaultState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(BOOKING_CART_STORAGE_KEY);
    }
  }, []);

  const value: BookingCartContextType = {
    ...state,
    setStep,
    setSlot,
    setActiveTab,
    setBookingDetails,
    toggleProduct,
    setProductOption,
    updateProductQty,
    totalSelectedQty,
    resetBookingCart,
  };

  return (
    <BookingCartContext.Provider value={value}>{children}</BookingCartContext.Provider>
  );
}

export function useBookingCart() {
  const ctx = useContext(BookingCartContext);
  if (ctx === undefined) {
    throw new Error("useBookingCart must be used within a BookingCartProvider");
  }
  return ctx;
}
