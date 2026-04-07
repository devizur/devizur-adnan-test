"use client";

import React from "react";
import { Store, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useShopDialog } from "@/contexts/ShopDialogContext";
import { useCompanyConfig, useActiveShops } from "@/lib/api/hooks";

export function ShopSelectorButton({ className }: { className?: string }) {
  const shopId = useAppSelector((state) => state.shop.shopId);
  const { openShopDialog } = useShopDialog();
  const { data: company } = useCompanyConfig();
  const { data: shops = [] } = useActiveShops(company?.id);

  const shop = shops.find((s) => s.shopId === shopId);
  const label = shopId > 0 ? (shop?.shopName?.trim() ?? "Select shop") : "Select shop";

  return (
    <button
      type="button"
      onClick={openShopDialog}
      aria-haspopup="dialog"
      aria-label={`Shop: ${label}. Change location`}
      className={cn(
        "flex min-w-0 max-w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary-1/35 bg-primary-1/8 px-3 py-2 text-sm font-medium text-primary-1 transition-all duration-200 hover:border-primary-1/50 hover:bg-primary-1/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/45",
        className
      )}
    >
      <Store className="size-4 shrink-0 opacity-90" aria-hidden />
      <span className="min-w-0 max-w-[min(11rem,42vw)] truncate">{label}</span>
      <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
    </button>
  );
}
