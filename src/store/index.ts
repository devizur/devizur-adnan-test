// Store instance and types
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

// Typed hooks – use these instead of useDispatch/useSelector for full type safety
export { useAppDispatch, useAppSelector } from "./hooks";

// Booking slice actions (re-export so bundler resolves correctly)
export {
  setActivityCombination,
  setDate,
  setTimeOfDay,
  setTimeSlot,
  setBookingReferenceId,
  addActivity,
  removeActivity,
  setActivityGameNo,
  addPackage,
  removePackage,
  setPackageCombination,
} from "./bookingSlice";
