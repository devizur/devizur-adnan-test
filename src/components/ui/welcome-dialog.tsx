"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Star, MapPin, Store, Search, ChevronRight, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setShopId } from "@/store/shopSlice";
import { clearAuth } from "@/store/authSlice";
import { resetBooking } from "@/store/bookingSlice";
import { useCart } from "@/contexts/CartContext";
import { useBookingCart } from "@/contexts/BookingCartContext";
import { useShopDialog } from "@/contexts/ShopDialogContext";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyConfig, useActiveShops } from "@/lib/api/hooks";
import {
  activeShopToPickerItem,
  type ShopPickerItem,
} from "@/lib/api/shopServices";

export const SELECTED_SHOP_KEY = "welcome-selected-shop";

export function WelcomeDialog() {
  const dispatch = useAppDispatch();
  const currentShopId = useAppSelector((state) => state.shop.shopId);
  const { isOpen, openShopDialog, closeShopDialog } = useShopDialog();
  const { clearCart } = useCart();
  const { resetBookingCart } = useBookingCart();
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");

  const {
    data: company,
    isLoading: companyLoading,
    isError: companyError,
  } = useCompanyConfig();
  const companyId = company?.id;

  const {
    data: shopsRaw = [],
    isLoading: shopsLoading,
    isError: shopsError,
    refetch: refetchShops,
  } = useActiveShops(companyId);

  const shops = React.useMemo(
    () => shopsRaw.map(activeShopToPickerItem),
    [shopsRaw]
  );

  const listLoading = companyLoading || (companyId != null && shopsLoading);
  const listError = companyError || shopsError;

  /** After company + shops are known, sync Redux + localStorage and prompt if needed. */
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (listLoading) return;
    if (companyId == null || listError || shopsRaw.length === 0) {
      openShopDialog();
      return;
    }
    const stored = localStorage.getItem(SELECTED_SHOP_KEY);
    if (stored) {
      const id = parseInt(stored, 10);
      if (!Number.isNaN(id) && shopsRaw.some((s) => s.shopId === id)) {
        dispatch(setShopId(id));
        return;
      }
      localStorage.removeItem(SELECTED_SHOP_KEY);
    }
    openShopDialog();
  }, [listLoading, companyId, listError, shopsRaw, dispatch, openShopDialog]);

  const handleShopSelect = (shop: ShopPickerItem) => {
    dispatch(clearAuth());
    dispatch(resetBooking());
    clearCart();
    resetBookingCart();
    queryClient.clear();
    dispatch(setShopId(shop.shopId));
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_SHOP_KEY, String(shop.shopId));
    }
    closeShopDialog();
    setSearch("");
  };

  const filteredShops = React.useMemo(() => {
    if (!search.trim()) return shops;
    const query = search.toLowerCase();
    return shops.filter((shop) => {
      const titleMatch = shop.title.toLowerCase().includes(query);
      const descriptionMatch = shop.description.toLowerCase().includes(query);
      const tagMatch = shop.tags.some((tag) =>
        tag.label.toLowerCase().includes(query)
      );
      return titleMatch || descriptionMatch || tagMatch;
    });
  }, [shops, search]);

  const open = isOpen;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeShopDialog();
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:min-w-[90%] sm:w-4xl h-[90vh] lg:h-[95vh] bg-secondary-2 backdrop-blur-xl p-0 gap-0 text-white border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] flex flex-col shadow-2xl">
        <AlertDialogHeader className="shrink-0 space-y-0 border-b border-white/10 bg-zinc-950/80 px-5 py-5 text-left sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-1/12 text-primary-1 ring-1 ring-primary-1/25 sm:h-12 sm:w-12"
                aria-hidden
              >
                <Store className="size-5 sm:size-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 pt-0.5">
                <AlertDialogTitle className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
                  Choose your shop
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1.5 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                  Pick a location to load activities, food, and packages for that venue. Shops are loaded for{" "}
                  {company?.name ? (
                    <span className="font-medium text-zinc-300">{company.name}</span>
                  ) : (
                    "your company"
                  )}
                  . You can change this anytime from the header.
                </AlertDialogDescription>
              </div>
            </div>
            {/* {!listLoading && shops.length > 0 ? (
              <span className="shrink-0 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tabular-nums text-zinc-400 sm:self-center">
                {search.trim()
                  ? `${filteredShops.length} match${filteredShops.length === 1 ? "" : "es"}`
                  : `${shops.length} location${shops.length === 1 ? "" : "s"}`}
              </span>
            ) : null} */}
          </div>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          {listLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-500">
              <Loader2 className="size-8 animate-spin text-primary-1" aria-hidden />
              <p className="text-sm">Loading shops…</p>
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 px-6 py-14 text-center">
              <p className="text-sm font-medium text-zinc-300">
                Could not load shops. Check the booking API URL and your connection.
              </p>
              <button
                type="button"
                onClick={() => {
                  void queryClient.invalidateQueries({ queryKey: ["companyConfig"] });
                  void refetchShops();
                }}
                className="rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-primary-1/35 hover:bg-primary-1/10 hover:text-primary-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/40"
              >
                Retry
              </button>
            </div>
          ) : shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 px-6 py-14 text-center">
              <p className="text-sm font-medium text-zinc-300">No active shops for this company</p>
              <p className="max-w-md text-xs text-zinc-500">
                When shops are added in the back office, they will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="relative w-full max-w-md">
                  <label htmlFor="shop-search" className="sr-only">
                    Search shops by name, address, or type
                  </label>
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                    aria-hidden
                  />
                  <input
                    id="shop-search"
                    type="search"
                    autoComplete="off"
                    placeholder="Search by name, city, code, or type…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-zinc-900/80 py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-primary-1/45 focus:outline-none focus:ring-2 focus:ring-primary-1/25"
                  />
                  {search.trim() ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/40"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredShops.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 px-6 py-14 text-center">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-500">
                      <Search className="size-5" aria-hidden />
                    </div>
                    <p className="text-sm font-medium text-zinc-300">No   match your search</p>
                    <p className="mt-1 max-w-sm text-xs text-zinc-500">
                      Try a shorter phrase or clear the filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-5 rounded-lg border border-white/12 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-primary-1/35 hover:bg-primary-1/10 hover:text-primary-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/40"
                    >
                      Clear search
                    </button>
                  </div>
                ) : null}

                {filteredShops.map((shop) => {
                  const isCurrent = shop.shopId === currentShopId;
                  return (
                    <button
                      key={shop.id}
                      type="button"
                      onClick={() => handleShopSelect(shop)}
                      aria-label={`Select ${shop.title}`}
                      aria-current={isCurrent ? "true" : undefined}
                      className={[
                        "group relative aspect-16/11 h-48 w-full overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]",
                        isCurrent
                          ? "border-primary-1/50 shadow-lg shadow-primary-1/10 ring-1 ring-primary-1/30"
                          : "border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/40",
                      ].join(" ")}
                    >
                      <img
                        src={shop.image}
                        alt=""
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        className="absolute inset-0 bg-linear-to-t from-black via-black/75 to-black/25"
                        aria-hidden
                      />
                     
                      <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
                        <div className="flex flex-wrap gap-1.5">
                          {shop.tags.map((tag, i) => (
                            <span
                              key={i}
                              className={[
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md sm:text-[11px]",
                                tag.type === "rating"
                                  ? "border border-amber-400/30 bg-amber-500/15 text-amber-100"
                                  : "border border-white/15 bg-black/45 text-zinc-200",
                              ].join(" ")}
                            >
                              {tag.icon === "star" ? (
                                <Star
                                  className="size-2.5 fill-amber-400 text-amber-400 sm:size-3"
                                  aria-hidden
                                />
                              ) : null}
                              {tag.icon === "pin" ? (
                                <MapPin className="size-2.5 text-zinc-300 sm:size-3" aria-hidden />
                              ) : null}
                              {tag.label}
                            </span>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
                            {shop.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400  ">
                            {shop.description}
                          </p>
                          
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
