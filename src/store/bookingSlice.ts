import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Activity, Package, Food, AttributeCombinationItem } from "@/lib/api/types";

export interface BookingPersons {
  adults: number;
  kids: number;
}

export interface SelectedFoodItem {
  food: Food;
  quantity: number;
  selectedModifiers?: SelectedFoodModifier[];
}

export interface SelectedFoodModifier {
  modifierId: number;
  modifierName: string;
  additionalPrice: number;
  quantity: number;
  modifierGroupId?: number;
  modifierGroupName?: string;
}

export interface HolderDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postCode: string;
}

export type BookingFlowMode = "activityFirst" | "foodFirst";

export interface SelectedPackageItem {
  pkg: Package;
  combination?: AttributeCombinationItem;
}

export interface BookingState {
  /** When foodFirst: step 1=Food, 2=Availability, 3=Holder, 4=Payment. Else step 1=Availability, 2=Food, 3=Holder, 4=Payment */
  flowMode: BookingFlowMode;
  /** Current step (1–4); meaning depends on flowMode */
  step: number;
  /** Step 1: name for availability check */
  availabilityName: string;
  /** Step 1: whether availability was checked */
  availabilityChecked: boolean;
  /** Step 1: date YYYY-MM-DD */
  date: string;
  /** Step 1: time of day 1=Morning, 2=Afternoon, 3=Evening */
  timeOfDay: 1 | 2 | 3;
  /** Step 1: selected time slot e.g. "11:00 am" */
  timeSlot: string;
  /** From retrieveTimeSlots or generateBookingItemSteps – used for subsequent API calls */
  bookingReferenceId: string;
  /** Step 1: number of persons */
  persons: BookingPersons;
  /** Step 1: selected activities (game no and/or API attribute combination for dynamic options) */
  selectedActivities: {
    activity: Activity;
    gameNo: number;
    combination?: AttributeCombinationItem;
  }[];
  /** Step 1: selected packages (optional attribute combination from API) */
  selectedPackages: SelectedPackageItem[];
  /** Step 2: optional food add-ons */
  selectedFoods: SelectedFoodItem[];
  /** Step 3: booking holder details */
  holderDetails: HolderDetails;
}

const initialHolderDetails: HolderDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  postCode: "",
};

const initialState: BookingState = {
  flowMode: "activityFirst",
  step: 1,
  availabilityName: "",
  availabilityChecked: false,
  date: "",
  timeOfDay: 1,
  timeSlot: "",
  bookingReferenceId: "",
  persons: { adults: 0, kids: 0 },
  selectedActivities: [],
  selectedPackages: [],
  selectedFoods: [],
  holderDetails: initialHolderDetails,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setFlowMode: (state, action: PayloadAction<BookingFlowMode>) => {
      state.flowMode = action.payload;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.step = Math.max(1, Math.min(4, action.payload));
    },
    nextStep: (state) => {
      if (state.step < 4) state.step += 1;
    },
    prevStep: (state) => {
      if (state.step > 1) state.step -= 1;
    },
    setAvailabilityName: (state, action: PayloadAction<string>) => {
      state.availabilityName = action.payload;
    },
    setAvailabilityChecked: (state, action: PayloadAction<boolean>) => {
      state.availabilityChecked = action.payload;
    },
    setDate: (state, action: PayloadAction<string>) => {
      state.date = action.payload;
    },
    setTimeOfDay: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.timeOfDay = action.payload;
    },
    setTimeSlot: (state, action: PayloadAction<string>) => {
      state.timeSlot = action.payload;
    },
    setBookingReferenceId: (state, action: PayloadAction<string>) => {
      state.bookingReferenceId = action.payload;
    },
    setPersons: (state, action: PayloadAction<BookingPersons>) => {
      state.persons = action.payload;
    },
    incrementAdults: (state) => {
      state.persons.adults += 1;
    },
    decrementAdults: (state) => {
      state.persons.adults = Math.max(0, state.persons.adults - 1);
    },
    incrementKids: (state) => {
      state.persons.kids += 1;
    },
    decrementKids: (state) => {
      state.persons.kids = Math.max(0, state.persons.kids - 1);
    },
    addActivity: (
      state,
      action: PayloadAction<{
        activity: Activity;
        gameNo?: number;
        combination?: AttributeCombinationItem;
      }>
    ) => {
      const { activity, gameNo = 1, combination } = action.payload;
      const existing = state.selectedActivities.findIndex((i) => i.activity.id === activity.id);
      const finalGameNo = Math.min(3, Math.max(1, gameNo));
      if (existing >= 0) {
        state.selectedActivities[existing].gameNo = finalGameNo;
        if (combination !== undefined) state.selectedActivities[existing].combination = combination;
      } else {
        state.selectedActivities.push({
          activity,
          gameNo: finalGameNo,
          ...(combination !== undefined && { combination }),
        });
      }
    },
    removeActivity: (state, action: PayloadAction<number>) => {
      state.selectedActivities = state.selectedActivities.filter(
        (i) => i.activity.id !== action.payload
      );
    },
    setActivityGameNo: (state, action: PayloadAction<{ activityId: number; gameNo: number }>) => {
      const item = state.selectedActivities.find((i) => i.activity.id === action.payload.activityId);
      if (item) item.gameNo = Math.min(3, Math.max(1, action.payload.gameNo)) as 1 | 2 | 3;
    },
    setActivityCombination: (
      state,
      action: PayloadAction<{ activityId: number; combination: AttributeCombinationItem }>
    ) => {
      const item = state.selectedActivities.find((i) => i.activity.id === action.payload.activityId);
      if (item) item.combination = action.payload.combination;
    },
    addPackage: (
      state,
      action: PayloadAction<{ pkg: Package; combination?: AttributeCombinationItem }>
    ) => {
      const { pkg, combination } = action.payload;
      if (state.selectedPackages.some((p) => p.pkg.id === pkg.id)) return;
      state.selectedPackages.push({
        pkg,
        ...(combination !== undefined && { combination }),
      });
    },
    removePackage: (state, action: PayloadAction<number>) => {
      state.selectedPackages = state.selectedPackages.filter((p) => p.pkg.id !== action.payload);
    },
    setPackageCombination: (
      state,
      action: PayloadAction<{ packageId: number; combination: AttributeCombinationItem }>
    ) => {
      const item = state.selectedPackages.find((p) => p.pkg.id === action.payload.packageId);
      if (item) item.combination = action.payload.combination;
    },
    addFood: (
      state,
      action: PayloadAction<{
        food: Food;
        quantity?: number;
        selectedModifiers?: SelectedFoodModifier[];
      }>
    ) => {
      const { food, quantity = 1, selectedModifiers } = action.payload;
      const existing = state.selectedFoods.findIndex((i) => i.food.id === food.id);
      if (existing >= 0) {
        state.selectedFoods[existing].quantity += quantity;
        if (selectedModifiers) {
          state.selectedFoods[existing].selectedModifiers = selectedModifiers;
        }
      } else {
        state.selectedFoods.push({ food, quantity, ...(selectedModifiers ? { selectedModifiers } : {}) });
      }
    },
    removeFood: (state, action: PayloadAction<number>) => {
      state.selectedFoods = state.selectedFoods.filter((i) => i.food.id !== action.payload);
    },
    updateFoodQuantity: (state, action: PayloadAction<{ foodId: number; quantity: number }>) => {
      const item = state.selectedFoods.find((i) => i.food.id === action.payload.foodId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.selectedFoods = state.selectedFoods.filter((i) => i.food.id !== action.payload.foodId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    setHolderDetails: (state, action: PayloadAction<Partial<HolderDetails>>) => {
      state.holderDetails = { ...state.holderDetails, ...action.payload };
    },
    /** Reset booking flow after adding to cart (keep dialog open for next booking) */
    resetBooking: () => initialState,
  },
});

export const {
  setFlowMode,
  setStep,
  nextStep,
  prevStep,
  setAvailabilityName,
  setAvailabilityChecked,
  setDate,
  setTimeOfDay,
  setTimeSlot,
  setBookingReferenceId,
  setPersons,
  incrementAdults,
  decrementAdults,
  incrementKids,
  decrementKids,
  addActivity,
  removeActivity,
  setActivityGameNo,
  setActivityCombination,
  addPackage,
  removePackage,
  setPackageCombination,
  addFood,
  removeFood,
  updateFoodQuantity,
  setHolderDetails,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
