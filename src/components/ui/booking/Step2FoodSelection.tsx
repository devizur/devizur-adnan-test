"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFoods } from "@/lib/api/hooks";
import type { RootState } from "@/store";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";
import FoodCard from "@/components/ui/reused/FoodCard";
import { Button } from "@/components/ui/button";

export function Step2FoodSelection() {
  const dispatch = useDispatch();
  const { selectedFoods } = useSelector((state: RootState) => state.booking);
  const { data: foods = [] } = useFoods();

  const getQuantity = (foodId: number) =>
    selectedFoods.find((i) => i.food.id === foodId)?.quantity ?? 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Optional food add-ons. Select items to include with your booking.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto scrollbar-dark">
        {foods.map((food) => {
          const qty = getQuantity(food.id);
          return (
            <FoodCard
              key={food.id}
              item={food}
              showTimeSlots={false}
              action={
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">
                    {qty > 0 ? "Added" : "Optional"}
                  </span>
                  <div className="flex items-center gap-2" role="group" aria-label={`Quantity for ${food.title}`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Decrease quantity of ${food.title}`}
                      className="min-h-11 min-w-11 rounded-xl border border-border focus-visible:ring-primary-1/50 cursor-pointer"
                      onClick={() => {
                        if (qty <= 1) dispatch(removeFood(food.id));
                        else dispatch(updateFoodQuantity({ foodId: food.id, quantity: qty - 1 }));
                      }}
                      disabled={qty === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="min-w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">{qty}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Increase quantity of ${food.title}`}
                      className="min-h-11 min-w-11 rounded-xl border border-border focus-visible:ring-primary-1/50 cursor-pointer"
                      onClick={() => dispatch(addFood({ food }))}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
