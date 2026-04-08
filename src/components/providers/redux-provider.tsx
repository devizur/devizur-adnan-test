"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { hydrateAuth } from "@/store/authSlice";
import { loadStoredAuth } from "@/lib/auth-storage";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = loadStoredAuth();
    store.dispatch(
      hydrateAuth({
        token: null,
        user: stored?.user ?? null,
      })
    );
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
