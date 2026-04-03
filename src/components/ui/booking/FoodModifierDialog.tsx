"use client";

import React from "react";
import type { Food } from "@/lib/api/types";
import { useProductModifiers } from "@/lib/api/useProductModifiers";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectedFoodModifier } from "@/store/bookingSlice";
import {
  segmentedSideBtnClass,
  segmentedStripClass,
  segmentedNumericValueClass,
} from "@/components/ui/booking/booking-segmented-styles";

const footerBarClass =
  "flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-white/6 bg-[#141414]/95 px-4 py-2.5 sm:px-5";

const footerBtnSecondaryClass =
  "m-0 h-8 min-h-8 gap-1.5 rounded-md border border-white/8 bg-[#1c1c1c] px-3 text-xs font-medium text-zinc-300 shadow-sm shadow-black/15 transition-colors hover:border-white/12 hover:bg-[#252525] hover:text-white focus-visible:ring-2 focus-visible:ring-primary-1/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]";

const footerBtnPrimaryClass =
  "h-8 min-h-8 rounded-md border border-zinc-700/60 bg-primary-1 px-3.5 text-xs font-semibold text-secondary shadow-sm shadow-black/20 transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-1/45";

interface FoodModifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  modifierQuantities: Record<number, number>;
  onIncrementModifier: (modifierId: number) => void;
  onDecrementModifier: (modifierId: number) => void;
  onConfirm: (selectedModifiers: SelectedFoodModifier[]) => void;
}

export const FoodModifierDialog: React.FC<FoodModifierDialogProps> = ({
  open,
  onOpenChange,
  food,
  modifierQuantities,
  onIncrementModifier,
  onDecrementModifier,
  onConfirm,
}) => {
  const productId = food?.productId ?? null;
  const { modifierGroups, isModifiersPending } = useProductModifiers(productId);

  React.useEffect(() => {
    if (!open) return;
    if (!food) return;
    if (isModifiersPending) return;
    if (modifierGroups.length === 0) {
      onConfirm([]);
      onOpenChange(false);
    }
  }, [open, food, isModifiersPending, modifierGroups.length, onConfirm, onOpenChange]);

  const handleConfirm = () => {
    const selectedModifiers: SelectedFoodModifier[] = [];
    modifierGroups.forEach((group: any) => {
      (group.options ?? []).forEach((opt: any) => {
        const qty = modifierQuantities[opt.modifierId] ?? 0;
        if (qty > 0) {
          selectedModifiers.push({
            modifierId: Number(opt.modifierId),
            modifierName: String(opt.modifierName || opt.name || `Modifier #${opt.modifierId}`),
            additionalPrice: Number(opt.additionalPrice || 0),
            quantity: qty,
            modifierGroupId: Number(group.modifierGroupId),
            modifierGroupName: String(group.modifierGroupName || ""),
          });
        }
      });
    });
    onConfirm(selectedModifiers);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className={cn(
          "gap-0 overflow-hidden border border-white/8 bg-[#1a1a1a] p-0 text-zinc-100 shadow-2xl shadow-black/40 ring-1 ring-white/4 sm:max-w-md"
        )}
      >
        <AlertDialogHeader className="shrink-0 space-y-1 border-b border-white/6 bg-linear-to-b from-[#181818] to-[#161616] px-4 py-3 text-left sm:px-5 sm:py-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Add-ons
          </p>
          <AlertDialogTitle className="text-left text-base font-semibold leading-snug text-white sm:text-[17px]">
            {food ? food.title : "Select modifiers"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-xs leading-relaxed text-zinc-500">
            Adjust quantities per option. Extra charges are shown where they apply.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div
          className="max-h-[min(52vh,340px)] min-h-[120px] overflow-y-auto px-4 py-3 scrollbar-dark sm:px-5 sm:py-4"
          role="region"
          aria-label="Modifier options"
        >
          {isModifiersPending && (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div
                className="size-6 animate-spin rounded-full border-2 border-zinc-600 border-t-primary-1"
                aria-hidden
              />
              <p className="text-xs text-zinc-500">Loading options…</p>
            </div>
          )}

          {!isModifiersPending &&
            modifierGroups.map((group) => (
              <div
                key={group.modifierGroupId}
                className="mb-4 last:mb-0 rounded-xl border border-white/8 bg-[#141414]/55 p-3 shadow-sm shadow-black/15 ring-1 ring-white/4 sm:p-3.5"
              >
                <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  {group.modifierGroupName}
                </p>
                <ul className="space-y-2">
                  {group.options.map((opt: any) => {
                    const qty = modifierQuantities[opt.modifierId] ?? 0;
                    const price =
                      typeof opt.additionalPrice === "number" && !Number.isNaN(opt.additionalPrice)
                        ? opt.additionalPrice
                        : 0;
                    const label = opt.modifierName || opt.name || `Modifier #${opt.modifierId}`;

                    return (
                      <li
                        key={`${group.modifierGroupId}-${opt.modifierId}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors sm:px-3.5 sm:py-3",
                          qty > 0
                            ? "border-primary-1/35 bg-primary-1/8 ring-1 ring-primary-1/25"
                            : "border-white/6 bg-[#1e1e1e]/90 hover:border-white/10"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-100">{label}</p>
                          <p className="mt-0.5 text-[11px] tabular-nums text-zinc-500">
                            {price > 0 ? `+ $${price.toFixed(2)} each` : "Included"}
                          </p>
                        </div>
                        <div
                          className={cn(segmentedStripClass, "w-[104px] shrink-0 sm:w-[112px]")}
                          role="group"
                          aria-label={`Quantity for ${label}`}
                        >
                          <button
                            type="button"
                            className={segmentedSideBtnClass}
                            disabled={qty <= 0}
                            onClick={() => onDecrementModifier(opt.modifierId)}
                            aria-label={`Decrease ${label}`}
                          >
                            <Minus className="size-3.5" strokeWidth={2.25} />
                          </button>
                          <span className={segmentedNumericValueClass}>{qty}</span>
                          <button
                            type="button"
                            className={cn(
                              segmentedSideBtnClass,
                              "text-primary-1 hover:text-primary-1 hover:bg-primary-1/10"
                            )}
                            onClick={() => onIncrementModifier(opt.modifierId)}
                            aria-label={`Increase ${label}`}
                          >
                            <Plus className="size-3.5" strokeWidth={2.25} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          {!isModifiersPending && !modifierGroups.length && (
            <p className="py-6 text-center text-sm text-zinc-500">
              No add-ons are configured for this item.
            </p>
          )}
        </div>

        <AlertDialogFooter className={footerBarClass}>
          <AlertDialogCancel size="sm" className={footerBtnSecondaryClass}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className={footerBtnPrimaryClass} onClick={handleConfirm} size="sm">
            Confirm & add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
