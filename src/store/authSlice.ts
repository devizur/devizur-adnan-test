import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") ?? "null")
      : null,
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
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;

