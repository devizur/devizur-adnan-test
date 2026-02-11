import { configureStore } from "@reduxjs/toolkit";
import bookingReducer from "./bookingSlice";

/**
 * Central Redux store. Add new slices by:
 * 1. Create a slice (e.g. features/xyz/xyzSlice.ts)
 * 2. Import the reducer here
 * 3. Add it to the reducer object below
 */
export const store = configureStore({
  reducer: {
    booking: bookingReducer,
    // Add more reducers: videos: videosReducer, etc.
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
