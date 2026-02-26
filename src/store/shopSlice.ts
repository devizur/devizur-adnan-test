import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ShopState {
  shopId: number;
}

const initialState: ShopState = {
  shopId: 1,
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
