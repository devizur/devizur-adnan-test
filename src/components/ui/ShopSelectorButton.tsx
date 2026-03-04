"use client";

import React from "react";
import { Store, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useShopDialog } from "@/contexts/ShopDialogContext";
import { SHOPS } from "@/components/ui/welcome-dialog";

export function ShopSelectorButton({ className }: { className?: string }) {
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { openShopDialog } = useShopDialog();

  const shop = SHOPS.find((s) => s.shopId === shopId);
  const label = shop?.title ?? "Select shop";

  return (
    <button
      type="button"
      onClick={openShopDialog}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-primary-1/40 bg-primary-1/5 hover:bg-primary-1/10 text-primary-1 text-sm font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50",
        className
      )}
    >
      <Store className="w-4 h-4 shrink-0" />
      <span className="max-w-[140px] truncate">
        <span>
          {label && label.length > 15
            ? label.slice(0, 15) + "..."
            : label}
        </span>
      </span>

      <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
    </button>
  );
}
