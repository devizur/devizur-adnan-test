"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Activity } from "@/lib/api/types";
import type {
  BookingActivityItem,
  BookingPeople,
  BookingPricing,
  BookingDetails,
  PerPersonBreakdown,
} from "@/components/ui/booking/types";
import { OPTIONS } from "@/components/ui/booking/constants";

const DEFAULT_ADULT_PRICE = 12;
const DEFAULT_CHILD_PRICE = 9;
const CHILD_PRICE_RATIO = 9 / 12; // child as fraction of adult when no activities

export interface BookingCartState {
  /** Selected activities, each with game option (1, 2, or 3 games) */
  activities: BookingActivityItem[];
  /** Global people count for the whole booking */
  people: BookingPeople;
  /** Date (YYYY-MM-DD) */
  date: string;
  /** Time of day: 1=Morning, 2=Afternoon, 3=Evening */
  timeOfDay: 1 | 2 | 3;
  /** Selected start time slot e.g. "11:00 am" */
  selectedStartTime: string | undefined;
  /** UI step: 1 = booking details, 2 = your details form */
  step: number;
  /** Form fields for booking holder */
  bookingDetails: BookingDetails;
}

const defaultPeople: BookingPeople = { adults: 0, children: 0 };

const defaultState: BookingCartState = {
  activities: [],
  people: defaultPeople,
  date: "",
  timeOfDay: 1,
  selectedStartTime: undefined,
  step: 1,
  bookingDetails: {},
};

interface BookingCartContextType extends BookingCartState {
  /** Derived from selected activities + game options; used for per-person breakdown */
  pricing: BookingPricing;
  setStep: (step: number) => void;
  setDate: (date: string) => void;
  setTimeOfDay: (id: 1 | 2 | 3) => void;
  setStartTime: (time: string | undefined) => void;
  setBookingDetails: (details: BookingDetails | ((prev: BookingDetails) => BookingDetails)) => void;
  addActivity: (activity: Activity, gameOption?: 1 | 2 | 3) => void;
  removeActivity: (activityId: number) => void;
  setActivityGameOption: (activityId: number, gameOption: 1 | 2 | 3) => void;
  setAdults: (count: number) => void;
  setChildren: (count: number) => void;
  incrementAdults: () => void;
  decrementAdults: () => void;
  incrementChildren: () => void;
  decrementChildren: () => void;
  isActivitySelected: (activityId: number) => boolean;
  getActivityGameOption: (activityId: number) => 1 | 2 | 3 | undefined;
  totalPeople: number;
  perPersonBreakdown: PerPersonBreakdown;
  resetBookingCart: () => void;
  /** Sync booking activities from cart (e.g. when opening the booking modal). Each cart item becomes selected with gameOption = gameNo (clamped 1–3). */
  syncActivitiesFromCart: (cartItems: { activity: Activity; gameNo: number }[]) => void;
}

const BookingCartContext = createContext<BookingCartContextType | undefined>(undefined);

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingCartState>(defaultState);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, date }));
  }, []);

  const setTimeOfDay = useCallback((timeOfDay: 1 | 2 | 3) => {
    setState((prev) => ({ ...prev, timeOfDay }));
  }, []);

  const setStartTime = useCallback((selectedStartTime: string | undefined) => {
    setState((prev) => ({ ...prev, selectedStartTime }));
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

  const addActivity = useCallback((activity: Activity, gameOption: 1 | 2 | 3 = 1) => {
    setState((prev) => {
      if (prev.activities.some((item) => item.activity.id === activity.id)) return prev;
      return {
        ...prev,
        activities: [...prev.activities, { activity, gameOption }],
      };
    });
  }, []);

  const removeActivity = useCallback((activityId: number) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.filter((item) => item.activity.id !== activityId),
    }));
  }, []);

  const setActivityGameOption = useCallback((activityId: number, gameOption: 1 | 2 | 3) => {
    setState((prev) => ({
      ...prev,
      activities: prev.activities.map((item) =>
        item.activity.id === activityId ? { ...item, gameOption } : item
      ),
    }));
  }, []);

  const setAdults = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      people: { ...prev.people, adults: Math.max(0, count) },
    }));
  }, []);

  const setChildren = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      people: { ...prev.people, children: Math.max(0, count) },
    }));
  }, []);

  const incrementAdults = useCallback(() => {
    setState((prev) => ({ ...prev, people: { ...prev.people, adults: prev.people.adults + 1 } }));
  }, []);

  const decrementAdults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      people: { ...prev.people, adults: Math.max(0, prev.people.adults - 1) },
    }));
  }, []);

  const incrementChildren = useCallback(() => {
    setState((prev) => ({
      ...prev,
      people: { ...prev.people, children: prev.people.children + 1 },
    }));
  }, []);

  const decrementChildren = useCallback(() => {
    setState((prev) => ({
      ...prev,
      people: { ...prev.people, children: Math.max(0, prev.people.children - 1) },
    }));
  }, []);

  const isActivitySelected = useCallback(
    (activityId: number) => state.activities.some((item) => item.activity.id === activityId),
    [state.activities]
  );

  const getActivityGameOption = useCallback(
    (activityId: number) => state.activities.find((item) => item.activity.id === activityId)?.gameOption,
    [state.activities]
  );

  const totalPeople = useMemo(
    () => state.people.adults + state.people.children,
    [state.people.adults, state.people.children]
  );

  /** Dynamic pricing from selected activities + game options (OPTIONS). When no activities, use defaults. */
  const pricing = useMemo((): BookingPricing => {
    if (state.activities.length === 0) {
      return { adultPrice: DEFAULT_ADULT_PRICE, childPrice: DEFAULT_CHILD_PRICE };
    }
    const total = state.activities.reduce((sum, item) => {
      const opt = OPTIONS.find((o) => o.value === item.gameOption);
      return sum + (opt?.price ?? DEFAULT_ADULT_PRICE);
    }, 0);
    const adultPrice = total / state.activities.length;
    const childPrice = Math.round(adultPrice * CHILD_PRICE_RATIO * 100) / 100;
    return { adultPrice, childPrice };
  }, [state.activities]);

  const perPersonBreakdown = useMemo((): PerPersonBreakdown => {
    const { adults, children } = state.people;
    const adultsSubtotal = adults * pricing.adultPrice;
    const childrenSubtotal = children * pricing.childPrice;
    return {
      adultsCount: adults,
      childrenCount: children,
      adultPrice: pricing.adultPrice,
      childPrice: pricing.childPrice,
      adultsSubtotal,
      childrenSubtotal,
      total: adultsSubtotal + childrenSubtotal,
    };
  }, [state.people, pricing]);

  const resetBookingCart = useCallback(() => {
    setState(defaultState);
  }, []);

  const syncActivitiesFromCart = useCallback(
    (cartItems: { activity: Activity; gameNo: number }[]) => {
      const activities: BookingActivityItem[] = cartItems.map(({ activity, gameNo }) => ({
        activity,
        gameOption: Math.min(3, Math.max(1, gameNo || 1)) as 1 | 2 | 3,
      }));
      setState((prev) => ({ ...prev, activities }));
    },
    []
  );

  const value: BookingCartContextType = {
    ...state,
    pricing,
    setStep,
    setDate,
    setTimeOfDay,
    setStartTime,
    setBookingDetails,
    addActivity,
    removeActivity,
    setActivityGameOption,
    setAdults,
    setChildren,
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    isActivitySelected,
    getActivityGameOption,
    totalPeople,
    perPersonBreakdown,
    resetBookingCart,
    syncActivitiesFromCart,
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
