import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";
import authReducer from "./authSlice";
import shopReducer from "./shopSlice";

/**
 * Central Redux store. Add new slices by:
 * 1. Create a slice (e.g. features/xyz/xyzSlice.ts)
 * 2. Import the reducer here
 * 3. Add it to the reducer object below
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    shop: shopReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
