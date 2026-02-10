import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Activity, Package, Food } from "@/lib/api/types";

export interface BookingPersons {
  adults: number;
  children: number;
}

export interface SelectedFoodItem {
  food: Food;
  quantity: number;
}

export interface HolderDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postCode: string;
}

export interface BookingState {
  /** Current step: 1 = Availability & Selection, 2 = Food Selection, 3 = Holder Details */
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
  /** Step 1: number of persons */
  persons: BookingPersons;
  /** Step 1: selected activities (with game no) */
  selectedActivities: { activity: Activity; gameNo: number }[];
  /** Step 1: selected packages */
  selectedPackages: Package[];
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
  step: 1,
  availabilityName: "",
  availabilityChecked: false,
  date: "",
  timeOfDay: 1,
  timeSlot: "",
  persons: { adults: 0, children: 0 },
  selectedActivities: [],
  selectedPackages: [],
  selectedFoods: [],
  holderDetails: initialHolderDetails,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.step = Math.max(1, Math.min(3, action.payload));
    },
    nextStep: (state) => {
      if (state.step < 3) state.step += 1;
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
    setPersons: (state, action: PayloadAction<BookingPersons>) => {
      state.persons = action.payload;
    },
    incrementAdults: (state) => {
      state.persons.adults += 1;
    },
    decrementAdults: (state) => {
      state.persons.adults = Math.max(0, state.persons.adults - 1);
    },
    incrementChildren: (state) => {
      state.persons.children += 1;
    },
    decrementChildren: (state) => {
      state.persons.children = Math.max(0, state.persons.children - 1);
    },
    addActivity: (state, action: PayloadAction<{ activity: Activity; gameNo?: number }>) => {
      const { activity, gameNo = 1 } = action.payload;
      const existing = state.selectedActivities.findIndex((i) => i.activity.id === activity.id);
      if (existing >= 0) {
        state.selectedActivities[existing].gameNo = Math.min(3, Math.max(1, gameNo));
      } else {
        state.selectedActivities.push({ activity, gameNo: Math.min(3, Math.max(1, gameNo)) });
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
    addPackage: (state, action: PayloadAction<Package>) => {
      if (state.selectedPackages.some((p) => p.id === action.payload.id)) return;
      state.selectedPackages.push(action.payload);
    },
    removePackage: (state, action: PayloadAction<number>) => {
      state.selectedPackages = state.selectedPackages.filter((p) => p.id !== action.payload);
    },
    addFood: (state, action: PayloadAction<{ food: Food; quantity?: number }>) => {
      const { food, quantity = 1 } = action.payload;
      const existing = state.selectedFoods.findIndex((i) => i.food.id === food.id);
      if (existing >= 0) {
        state.selectedFoods[existing].quantity += quantity;
      } else {
        state.selectedFoods.push({ food, quantity });
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
  setStep,
  nextStep,
  prevStep,
  setAvailabilityName,
  setAvailabilityChecked,
  setDate,
  setTimeOfDay,
  setTimeSlot,
  setPersons,
  incrementAdults,
  decrementAdults,
  incrementChildren,
  decrementChildren,
  addActivity,
  removeActivity,
  setActivityGameNo,
  addPackage,
  removePackage,
  addFood,
  removeFood,
  updateFoodQuantity,
  setHolderDetails,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
