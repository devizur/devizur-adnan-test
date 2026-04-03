"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useFoods } from "@/lib/api/hooks";
import type { Food } from "@/lib/api/types";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import type { SelectedFoodModifier } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";
import FoodCard from "@/components/ui/reused/FoodCard";
import { Button } from "@/components/ui/button";
import { FoodModifierDialog } from "@/components/ui/booking/FoodModifierDialog";

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
    console.log("[StepFoodSelection] Selected modifiers for food:", {
      foodId: modifierFood.id,
      selectedModifiers,
    });

    dispatch(addFood({ food: modifierFood, selectedModifiers }));
    setIsModifierDialogOpen(false);
    setModifierFood(null);
    setModifierQuantities({});
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="grid grid-cols-1 gap-2 scrollbar-dark sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {foods.map((food, index) => {
          const qty = getQuantity(food.id);
          return (
            <FoodCard
              key={`${food.id}-${index}`}
              item={food}
              showTimeSlots={false}
              action={
                qty === 0 ? (
                  <Button
                    type="button"
                    onClick={() => handleAddClick(food)}
                    className="mt-2 sm:mt-3 w-full min-h-10 sm:h-11 rounded-lg sm:rounded-[10px] bg-primary-1 text-black font-semibold text-xs sm:text-sm hover:bg-primary-1-hover cursor-pointer touch-manipulation"
                    aria-label={`Add ${food.title} to cart`}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div className="mt-2 sm:mt-3 flex items-center justify-between rounded-lg sm:rounded-[10px] bg-black/40 px-2.5 sm:px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Decrease quantity of ${food.title}`}
                      className="min-h-9 min-w-9 h-9 w-9 rounded-lg sm:rounded-xl border border-gray-700 bg-transparent text-primary/90 hover:bg-gray-800 cursor-pointer touch-manipulation"
                      onClick={() => {
                        if (qty <= 1) dispatch(removeFood(food.id));
                        else dispatch(updateFoodQuantity({ foodId: food.id, quantity: qty - 1 }));
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span
                      className="text-sm font-medium text-primary/90 tabular-nums"
                      aria-live="polite"
                    >
                      {qty} in cart
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      aria-label={`Increase quantity of ${food.title}`}
                      className="min-h-9 min-w-9 h-9 w-9 rounded-lg sm:rounded-xl bg-primary-1 text-black hover:bg-primary-1-hover font-semibold cursor-pointer touch-manipulation"
                      onClick={() => handleAddClick(food)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )
              }
            />
          );
        })}
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
