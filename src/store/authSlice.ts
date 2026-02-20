import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setToken: (
      state,
      action: PayloadAction<{ token: string | null; refreshToken?: string | null }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;

