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

interface FoodModifierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  food: Food | null;
  // Redux-managed: which modifierIds are selected for this food
  selectedTargetProductIds: number[];
  onToggleTarget: (productId: number) => void;
  onConfirm: () => void;
}

export const FoodModifierDialog: React.FC<FoodModifierDialogProps> = ({
  open,
  onOpenChange,
  food,
  selectedTargetProductIds,
  onToggleTarget,
  onConfirm,
}) => {
  // Use backend productId explicitly to match modifier targets
  const productId = food?.productId ?? null;
  const modifierGroups = useProductModifiers(productId);

  // If dialog is opened for a food that has no modifiers, just auto-confirm and close.
  React.useEffect(() => {
    if (!open) return;
    if (!food) return;
    if (modifierGroups.length === 0) {
      onConfirm();
      onOpenChange(false);
    }
  }, [open, food, modifierGroups.length, onConfirm, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">
            {food ? `Select modifiers for ${food.title}` : "Select modifiers"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="mt-1.5 text-xs text-primary-1">
          Choose modifier options for this food. Prices are shown per option.
        </div>

        <div className="mt-3 max-h-72 overflow-y-auto space-y-2 text-sm scrollbar-dark">
          {modifierGroups.map((group) => (
            <div key={group.modifierGroupId} className="space-y-1.5">
              <div className="text-xs font-semibold text-gray-200">
                {group.modifierGroupName}
              </div>
              <div className="space-y-1">
                {group.options.map((opt: any) => {
                  const isSelected = selectedTargetProductIds.includes(opt.modifierId);
                  const price =
                    typeof opt.additionalPrice === "number" && !Number.isNaN(opt.additionalPrice)
                      ? opt.additionalPrice
                      : 0;

                  return (
                    <button
                      key={`${group.modifierGroupId}-${opt.modifierId}`}
                      type="button"
                      onClick={() => onToggleTarget(opt.modifierId)}
                      className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-left cursor-pointer touch-manipulation transition-colors ${
                        isSelected
                          ? "bg-primary-1 text-black border-primary-1  "
                          : "bg-[#181818] text-gray-100 border-gray-800 hover:bg-[#202020] hover:border-primary-1/40"
                      }`}
                    >
                      <span className="font-medium truncate">
                        {opt.modifierName || opt.name || `Modifier #${opt.modifierId}`}
                      </span>
                      <span className="ml-2 text-xs sm:text-sm font-semibold text-primary-1">
                        {price > 0 ? `+${price}` : "Included"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {!modifierGroups.length && (
            <p className="text-sm text-muted-foreground">
              No modifiers available for this food.
            </p>
          )}
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel size="sm" className="bg-primary text-secondary">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className=" text-secondary  " onClick={onConfirm} size="sm">
            Confirm &amp; add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

