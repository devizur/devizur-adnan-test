"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useFoods } from "@/lib/api/hooks";
import type { Food } from "@/lib/api/types";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import type { SelectedFoodModifier } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";
import FoodCard from "@/components/ui/reused/FoodCard";
import { FoodModifierDialog } from "@/components/ui/booking/FoodModifierDialog";
import { cn } from "@/lib/utils";
import {
  segmentedPrimaryCtaClass,
  segmentedSideBtnClass,
  segmentedStripClass,
  segmentedNumericValueClass,
} from "@/components/ui/booking/booking-segmented-styles";

export function StepFoodSelection() {
  const dispatch = useAppDispatch();
  const { selectedFoods } = useAppSelector((state) => state.booking);
  const { data: foods = [] } = useFoods();

  const [modifierFood, setModifierFood] = React.useState<Food | null>(null);
  const [modifierQuantities, setModifierQuantities] = React.useState<Record<number, number>>({});
  const [isModifierDialogOpen, setIsModifierDialogOpen] = React.useState(false);

  const getQuantity = (foodId: number) =>
    selectedFoods.find((i) => i.food.id === foodId)?.quantity ?? 0;

  const handleIncrementModifier = (modifierId: number) => {
    setModifierQuantities((prev) => ({ ...prev, [modifierId]: (prev[modifierId] ?? 0) + 1 }));
  };

  const handleDecrementModifier = (modifierId: number) => {
    setModifierQuantities((prev) => {
      const next = { ...prev };
      const qty = (next[modifierId] ?? 0) - 1;
      if (qty <= 0) delete next[modifierId];
      else next[modifierId] = qty;
      return next;
    });
  };

  const handleAddClick = (food: Food) => {
    setModifierFood(food);
    setModifierQuantities({});
    setIsModifierDialogOpen(true);
  };

  const handleConfirmModifiers = (selectedModifiers: SelectedFoodModifier[]) => {
    if (!modifierFood) return;
    dispatch(addFood({ food: modifierFood, selectedModifiers }));
    setIsModifierDialogOpen(false);
    setModifierFood(null);
    setModifierQuantities({});
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] bg-gradient-to-b from-[#181818] to-[#161616] px-3 py-2.5 sm:px-5 sm:py-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Food options
        </p>
        
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-dark sm:px-5 sm:py-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
          {foods.map((food, index) => {
            const qty = getQuantity(food.id);
            return (
              <FoodCard
                key={`${food.id}-${index}`}
                item={food}
                compact
                showTimeSlots={false}
                action={
                  qty === 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAddClick(food)}
                      className={cn(
                        segmentedPrimaryCtaClass,
                        "mt-2 w-full cursor-pointer touch-manipulation"
                      )}
                      aria-label={`Add ${food.title} to cart`}
                    >
                      Add to cart
                    </button>
                  ) : (
                    <div className="mt-2 w-full">
                      <div className={segmentedStripClass} role="group" aria-label={`Quantity of ${food.title} in cart`}>
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${food.title}`}
                          className={cn(segmentedSideBtnClass, "touch-manipulation")}
                          onClick={() => {
                            if (qty <= 1) dispatch(removeFood(food.id));
                            else dispatch(updateFoodQuantity({ foodId: food.id, quantity: qty - 1 }));
                          }}
                        >
                          <Minus className="size-3.5 shrink-0" strokeWidth={2.25} />
                        </button>
                        <span
                          className={segmentedNumericValueClass}
                          aria-live="polite"
                          aria-label={`${qty} in cart`}
                        >
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${food.title}`}
                          className={cn(segmentedSideBtnClass, "touch-manipulation")}
                          onClick={() => handleAddClick(food)}
                        >
                          <Plus className="size-3.5 shrink-0" strokeWidth={2.25} />
                        </button>
                      </div>
                     
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      </div>

      <FoodModifierDialog
        open={isModifierDialogOpen}
        onOpenChange={(open) => {
          setIsModifierDialogOpen(open);
          if (!open) {
            setModifierFood(null);
            setModifierQuantities({});
          }
        }}
        food={modifierFood}
        modifierQuantities={modifierQuantities}
        onIncrementModifier={handleIncrementModifier}
        onDecrementModifier={handleDecrementModifier}
        onConfirm={handleConfirmModifiers}
      />
    </div>
  );
}
