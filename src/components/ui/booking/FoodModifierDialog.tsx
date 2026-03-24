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
} from "@/components/ui/alert-dialog";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SelectedFoodModifier } from "@/store/bookingSlice";

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
  // Use backend productId explicitly to match modifier targets
  const productId = food?.productId ?? null;
  const { modifierGroups, isModifiersPending } = useProductModifiers(productId);

  // If dialog is opened for a food that has no modifiers, auto-confirm after master data loads.
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
      <AlertDialogContent  className="border-secondary" size="default">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">
            {food ? `Select modifiers for ${food.title}` : "Select modifiers"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="mt-1.5 text-xs text-primary-1">
          Choose modifier options for this food. Prices are shown per option.
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto space-y-2 text-sm scrollbar-dark">
          {isModifiersPending && (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading modifiers…</p>
          )}
          {!isModifiersPending &&
            modifierGroups.map((group) => (
            <div key={group.modifierGroupId} className="space-y-1.5">
              <div className="text-xs font-semibold text-gray-200">
                {group.modifierGroupName}
              </div>
              <div className="space-y-1">
                {group.options.map((opt: any) => {
                  const qty = modifierQuantities[opt.modifierId] ?? 0;
                  const price =
                    typeof opt.additionalPrice === "number" && !Number.isNaN(opt.additionalPrice)
                      ? opt.additionalPrice
                      : 0;

                  return (
                    <div
                      key={`${group.modifierGroupId}-${opt.modifierId}`}
                      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-left cursor-pointer touch-manipulation transition-colors ${
                        qty > 0
                          ? "bg-primary-1 text-black border-primary-1  "
                          : "bg-[#181818] text-gray-100 border-gray-800 hover:bg-[#202020] hover:border-primary-1/40"
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-3">
                        <span className="font-medium truncate ">
                          {opt.modifierName || opt.name || `Modifier #${opt.modifierId}`}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {price > 0 ? `+ $${price.toFixed(2)}` : "Included"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-7 w-7 rounded-md border border-gray-700 bg-black/20 text-gray-100 hover:bg-black/40"
                          onClick={() => onDecrementModifier(opt.modifierId)}
                          aria-label={`Decrease ${opt.modifierName || opt.name || "modifier"}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="w-6 text-center font-semibold tabular-nums">{qty}</span>
                        <Button
                          type="button"
                          size="icon"
                          className="h-7 w-7 rounded-md bg-primary-1 text-black hover:bg-primary-1-hover"
                          onClick={() => onIncrementModifier(opt.modifierId)}
                          aria-label={`Increase ${opt.modifierName || opt.name || "modifier"}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!isModifiersPending && !modifierGroups.length && (
            <p className="text-sm text-muted-foreground">
              No modifiers available for this food.
            </p>
          )}
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel size="sm" className="bg-primary text-secondary">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className=" text-secondary  " onClick={handleConfirm} size="sm">
            Confirm &amp; add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

