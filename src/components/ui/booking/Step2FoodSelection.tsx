"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useFoodsAlignedWithModifiers, type FoodWithModifiers } from "@/lib/api/hooks";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";
import FoodCard from "@/components/ui/reused/FoodCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function Step2FoodSelection() {
  const dispatch = useAppDispatch();
  const { selectedFoods } = useAppSelector((state) => state.booking);
  const { data: foods = [] } = useFoodsAlignedWithModifiers();

  const [modifierFood, setModifierFood] = React.useState<FoodWithModifiers | null>(null);
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

  const handleAddClick = (food: FoodWithModifiers) => {
    const hasModifiers = food.modifierTargets && food.modifierTargets.length > 0;

    if (!hasModifiers) {
      dispatch(addFood({ food }));
      return;
    }

    setModifierFood(food);
    setSelectedTargetProductIds([]);
    setIsModifierDialogOpen(true);
  };

  const handleConfirmModifiers = () => {
    if (!modifierFood) return;

    // For now we only log chosen modifiers; booking state still stores just the food + quantity.
    console.log("[Step2FoodSelection] Selected modifiers for food:", {
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
              modifierNames={food.modifierTargets.map((t) => t.productName)}
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

      <AlertDialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {modifierFood ? `Select modifiers for ${modifierFood.title}` : "Select modifiers"}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <div className="mt-2 max-h-72 overflow-y-auto space-y-3 text-sm">
            {modifierFood?.modifierTargets.map((t) => {
              const isSelected = selectedTargetProductIds.includes(t.productId);
              return (
                <button
                  key={t.modifierGroupTargetId}
                  type="button"
                  onClick={() => handleToggleTarget(t.productId)}
                  className={`px-2 py-1 rounded-full text-xs border cursor-pointer touch-manipulation ${
                    isSelected
                      ? "bg-primary-1 text-black border-primary-1"
                      : "bg-black/40 text-gray-200 border-gray-700 hover:bg-black/60"
                  }`}
                >
                  {t.productName}
                </button>
              );
            })}

            {!modifierFood?.modifierTargets.length && (
              <p className="text-sm text-muted-foreground">No modifiers available for this food.</p>
            )}
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              onClick={() => {
                setIsModifierDialogOpen(false);
                setModifierFood(null);
                setSelectedTargetProductIds([]);
              }}
              size="sm"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmModifiers} size="sm">
              Confirm &amp; add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
