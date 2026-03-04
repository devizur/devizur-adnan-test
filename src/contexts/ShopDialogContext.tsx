"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ShopDialogContextType {
  isOpen: boolean;
  openShopDialog: () => void;
  closeShopDialog: () => void;
}

const ShopDialogContext = createContext<ShopDialogContextType | undefined>(undefined);

export function ShopDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openShopDialog = useCallback(() => setIsOpen(true), []);
  const closeShopDialog = useCallback(() => setIsOpen(false), []);

  return (
    <ShopDialogContext.Provider value={{ isOpen, openShopDialog, closeShopDialog }}>
      {children}
    </ShopDialogContext.Provider>
  );
}

export function useShopDialog() {
  const ctx = useContext(ShopDialogContext);
  if (!ctx) throw new Error("useShopDialog must be used within ShopDialogProvider");
  return ctx;
}
