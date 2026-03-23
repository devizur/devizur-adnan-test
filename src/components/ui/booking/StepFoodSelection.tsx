"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useFoods } from "@/lib/api/hooks";
import type { Food } from "@/lib/api/types";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";
import FoodCard from "@/components/ui/reused/FoodCard";
import { Button } from "@/components/ui/button";
import { FoodModifierDialog } from "@/components/ui/booking/FoodModifierDialog";

export function StepFoodSelection() {
  const dispatch = useAppDispatch();
  const { selectedFoods } = useAppSelector((state) => state.booking);
  const { data: foods = [] } = useFoods();

  const [modifierFood, setModifierFood] = React.useState<Food | null>(null);
  const [selectedTargetProductIds, setSelectedTargetProductIds] = React.useState<number[]>([]);
  const [isModifierDialogOpen, setIsModifierDialogOpen] = React.useState(false);

  const getQuantity = (foodId: number) =>
    selectedFoods.find((i) => i.food.id === foodId)?.quantity ?? 0;

  const handleToggleTarget = (productId: number) => {
    setSelectedTargetProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((x) => x !== productId)
        : [...prev, productId]
    );
  };

  const handleAddClick = (food: Food) => {
    setModifierFood(food);
    setSelectedTargetProductIds([]);
    setIsModifierDialogOpen(true);
  };

  const handleConfirmModifiers = () => {
    if (!modifierFood) return;
    console.log("[StepFoodSelection] Selected modifiers for food:", {
      foodId: modifierFood.id,
      selectedTargetProductIds,
    });

    dispatch(addFood({ food: modifierFood }));
    setIsModifierDialogOpen(false);
    setModifierFood(null);
    setSelectedTargetProductIds([]);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-xs sm:text-sm text-muted-foreground">
        Optional food add-ons. Select items (and any modifiers) to include with your booking.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 scrollbar-dark">
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
                      className="min-h-9 min-w-9 h-9 w-9 rounded-lg sm:rounded-[8px] border border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 cursor-pointer touch-manipulation"
                      onClick={() => {
                        if (qty <= 1) dispatch(removeFood(food.id));
                        else dispatch(updateFoodQuantity({ foodId: food.id, quantity: qty - 1 }));
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span
                      className="text-sm font-medium text-gray-100 tabular-nums"
                      aria-live="polite"
                    >
                      {qty} in cart
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      aria-label={`Increase quantity of ${food.title}`}
                      className="min-h-9 min-w-9 h-9 w-9 rounded-lg sm:rounded-[8px] bg-primary-1 text-black hover:bg-primary-1-hover font-semibold cursor-pointer touch-manipulation"
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
            setSelectedTargetProductIds([]);
          }
        }}
        food={modifierFood}
        selectedTargetProductIds={selectedTargetProductIds}
        onToggleTarget={handleToggleTarget}
        onConfirm={handleConfirmModifiers}
      />
    </div>
  );
}
