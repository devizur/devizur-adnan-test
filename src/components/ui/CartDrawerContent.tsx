"use client";

import React from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { CartEntry } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { DrawerClose } from "@/components/ui/drawer";
import {
  catalogImageOrDemo,
  cn,
  formatPrice,
  parsePrice,
} from "@/lib/utils";
import {
  segmentedNumericValueClass,
  segmentedSideBtnClass,
  segmentedStripClass,
} from "@/components/ui/booking/booking-segmented-styles";

function holderLabel(entry: CartEntry): string {
  const { firstName, lastName, email } = entry.holderDetails;
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email || "Booking";
}

const sectionLabelClass =
  "text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500";

const lineRowClass =
  "flex items-center gap-2.5 rounded-lg border border-white/8 bg-[#141414]/70 p-2.5 ring-1 ring-white/4 sm:gap-3";

const iconGhostBtnClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 text-zinc-500 transition-colors hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35";

const clearCartBtnClass =
  "w-full min-h-9 cursor-pointer rounded-md border border-white/10 bg-[#1c1c1c] px-3 text-xs font-medium text-accent shadow-sm shadow-black/15 transition-colors hover:border-white/14 hover:bg-[#252525] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35";

interface CartDrawerContentProps {
  onClose?: () => void;
}

export const CartDrawerContent: React.FC<CartDrawerContentProps> = ({
  onClose,
}) => {
  const {
    entries,
    removeEntry,
    updateEntry,
    clearCart,
    foodItems,
    activityItems,
    packageItems,
  } = useCart();

  const foodSubtotal = foodItems.reduce(
    (sum, item) => sum + parsePrice(item.food.price) * item.quantity,
    0
  );
  const activitySubtotal = activityItems.reduce(
    (sum, item) => sum + parsePrice(item.activity.price) * item.gameNo,
    0
  );
  const packageSubtotal = packageItems.reduce((sum, item) => {
    const c = item.combination;
    if (c && typeof c.fixedPrice === "number" && !Number.isNaN(c.fixedPrice) && c.fixedPrice >= 0) {
      return sum + c.fixedPrice;
    }
    return sum + parsePrice(item.pkg.price);
  }, 0);
  const subtotal = foodSubtotal + activitySubtotal + packageSubtotal;
  const serviceFee = subtotal * 0.05;
  const discount = 0;
  const total = subtotal + serviceFee - discount;

  const CloseControl = () =>
    onClose ? (
      <button
        type="button"
        onClick={onClose}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1e1e1e] text-zinc-400 transition-colors hover:border-white/14 hover:bg-[#252525] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35"
        aria-label="Close cart"
      >
        <X className="size-4" strokeWidth={2.25} />
      </button>
    ) : (
      <DrawerClose asChild>
        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#1e1e1e] text-zinc-400 transition-colors hover:border-white/14 hover:bg-[#252525] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/35"
          aria-label="Close cart"
        >
          <X className="size-4" strokeWidth={2.25} />
        </button>
      </DrawerClose>
    );

  return (
    <>
      <div className="shrink-0 border-b border-white/8 bg-linear-to-b from-[#1c1c1c] to-[#161616] px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
              Cart
            </h2>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-500 sm:text-xs">
              Bookings and add-ons in one place. Saved locally until checkout.
            </p>
          </div>
          <CloseControl />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-dark sm:px-5 sm:py-5">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#141414]/40 px-6 py-12 text-center ring-1 ring-white/5">
            <ShoppingBag
              className="mb-3 size-10 text-zinc-600"
              strokeWidth={1.25}
              aria-hidden
            />
            <p className="text-sm font-medium text-accent">Your cart is empty</p>
            <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-zinc-500">
              Add a booking from activities or food to see it here.
            </p>
          </div>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              className="border border-white/8 bg-[#1a1a1a]/90 p-3 shadow-sm shadow-black/20 ring-1 ring-white/4 sm:p-4"
            >
              <div className="mb-3 flex min-w-0 items-start justify-between gap-2 border-b border-white/6 pb-3">
                <h3 className="min-w-0 truncate text-sm font-semibold text-zinc-100 sm:text-base">
                  {holderLabel(entry)}
                </h3>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className={iconGhostBtnClass}
                  aria-label="Remove this booking"
                >
                  <Trash2 className="size-3.5" strokeWidth={2} />
                </button>
              </div>

              {entry.activities.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className={sectionLabelClass}>Activities</p>
                  {entry.activities.map(({ activity, gameNo }) => (
                    <div key={activity.id} className={lineRowClass}>
                      <img
                        src={catalogImageOrDemo(
                          activity.image,
                          "activity",
                          activity.id
                        )}
                        alt={activity.title}
                        className="size-11 shrink-0 rounded-md object-cover ring-1 ring-white/10 sm:size-12"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-zinc-500">
                          {activity.price}{" "}
                          <span className="text-zinc-600">×</span> {gameNo}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <div
                          className={cn(segmentedStripClass, "w-[104px] sm:w-[112px]")}
                          role="group"
                          aria-label={`Games for ${activity.title}`}
                        >
                          <button
                            type="button"
                            disabled
                            className={segmentedSideBtnClass}
                            aria-label="Decrease games (disabled)"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className={segmentedNumericValueClass}>
                            {gameNo}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateEntry(entry.id, (prev) => ({
                                ...prev,
                                activities: prev.activities.map((a) =>
                                  a.activity.id === activity.id
                                    ? {
                                        ...a,
                                        gameNo: Math.min(
                                          3,
                                          a.gameNo + 1
                                        ) as 1 | 2 | 3,
                                      }
                                    : a
                                ),
                              }))
                            }
                            disabled={gameNo >= 3}
                            className={cn(
                              segmentedSideBtnClass,
                              "text-primary-1 hover:text-primary-1 hover:bg-primary-1/10"
                            )}
                            aria-label="Increase games"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              activities: prev.activities.filter(
                                (a) => a.activity.id !== activity.id
                              ),
                            }))
                          }
                          className={iconGhostBtnClass}
                          aria-label="Remove activity"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.packages.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className={sectionLabelClass}>Packages</p>
                  {entry.packages.map(({ pkg, combination }) => (
                    <div key={pkg.id} className={lineRowClass}>
                      <img
                        src={catalogImageOrDemo(pkg.image, "package", pkg.id)}
                        alt={pkg.title}
                        className="size-11 shrink-0 rounded-md object-cover ring-1 ring-white/10 sm:size-12"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {pkg.title}
                          {combination?.attributeCombinationName ? (
                            <span className="text-zinc-500 font-normal">
                              {" "}
                              · {combination.attributeCombinationName}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-primary-1">
                          {combination &&
                          typeof combination.fixedPrice === "number" &&
                          !Number.isNaN(combination.fixedPrice)
                            ? formatPrice(combination.fixedPrice)
                            : pkg.price}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateEntry(entry.id, (prev) => ({
                            ...prev,
                            packages: prev.packages.filter((p) => p.pkg.id !== pkg.id),
                          }))
                        }
                        className={iconGhostBtnClass}
                        aria-label="Remove package"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {entry.foods.length > 0 && (
                <div className="space-y-2">
                  <p className={sectionLabelClass}>Food</p>
                  {entry.foods.map(({ food, quantity }) => (
                    <div key={food.id} className={lineRowClass}>
                      <img
                        src={catalogImageOrDemo(food.image, "food", food.id)}
                        alt={food.title}
                        className="size-11 shrink-0 rounded-md object-cover ring-1 ring-white/10 sm:size-12"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-100">
                          {food.title}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-zinc-500">
                          {food.price}{" "}
                          <span className="text-zinc-600">×</span> {quantity}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <div
                          className={cn(segmentedStripClass, "w-[104px] sm:w-[112px]")}
                          role="group"
                          aria-label={`Quantity for ${food.title}`}
                        >
                          <button
                            type="button"
                            disabled
                            className={segmentedSideBtnClass}
                            aria-label="Decrease quantity (disabled)"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className={segmentedNumericValueClass}>
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateEntry(entry.id, (prev) => ({
                                ...prev,
                                foods: prev.foods.map((f) =>
                                  f.food.id === food.id
                                    ? { ...f, quantity: f.quantity + 1 }
                                    : f
                                ),
                              }))
                            }
                            className={cn(
                              segmentedSideBtnClass,
                              "text-primary-1 hover:text-primary-1 hover:bg-primary-1/10"
                            )}
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, (prev) => ({
                              ...prev,
                              foods: prev.foods.filter((f) => f.food.id !== food.id),
                            }))
                          }
                          className={iconGhostBtnClass}
                          aria-label="Remove food"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}

        {entries.length > 0 && (
          <>
            <Card className="border border-white/8 bg-[#141414]/80 p-4 ring-1 ring-white/4 sm:p-4">
              <h3 className="mb-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Summary
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-zinc-200">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span>Service fee (5%)</span>
                  <span className="tabular-nums font-medium text-zinc-200">
                    {formatPrice(serviceFee)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-zinc-400">
                  <span className="text-primary-1/90">Discount</span>
                  <span className="tabular-nums font-medium text-accent">
                    {formatPrice(discount)}
                  </span>
                </div>
                <div className="flex justify-between gap-3 border-t border-white/8 pt-3">
                  <span className="text-sm font-semibold text-zinc-100">
                    Total
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-primary-1">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={cn(clearCartBtnClass, "mt-4")}
                onClick={clearCart}
              >
                Clear cart
              </button>
            </Card>
            <p className="px-0.5 text-center text-[10px] leading-relaxed text-zinc-600">
              Stored in your browser until checkout or cleared.
            </p>
          </>
        )}
      </div>
    </>
  );
};
