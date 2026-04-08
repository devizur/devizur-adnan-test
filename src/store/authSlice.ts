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
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  refreshToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token?: string | null }>
    ) => {
      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
      }
      state.user = action.payload.user;
      state.hydrated = true;
    },
    setToken: (
      state,
      action: PayloadAction<{ token: string | null; refreshToken?: string | null }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.hydrated = true;
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{ token: string | null; user: AuthUser | null }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.refreshToken = null;
      state.hydrated = true;
    },
  },
});

export const { setCredentials, setToken, hydrateAuth, clearAuth } = authSlice.actions;

export default authSlice.reducer;

