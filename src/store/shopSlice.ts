import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShopState {
  shopId: number;
}

const initialState: ShopState = {
  /** Unset until the user picks a shop (see WelcomeDialog + localStorage). */
  shopId: 0,
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setShopId: (state, action: PayloadAction<number>) => {
      state.shopId = action.payload;
    },
  },
});

export const { setShopId } = shopSlice.actions;
export default shopSlice.reducer;
