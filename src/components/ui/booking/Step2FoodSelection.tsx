"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFoods } from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store";
import { addFood, removeFood, updateFoodQuantity } from "@/store/bookingSlice";
import { Minus, Plus } from "lucide-react";

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
            <div
              key={food.id}
              className={cn(
                "p-4 rounded-xl border transition-colors",
                qty > 0 ? "border-primary-1 bg-primary-1/5" : "border-border bg-card"
              )}
            >
              <div className="flex gap-3">
                <img
                  src={food.image || ""}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{food.title}</p>
                  <p className="text-xs text-muted-foreground">{food.price}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground">
                  {qty > 0 ? "Added" : "Optional"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (qty <= 1) dispatch(removeFood(food.id));
                      else dispatch(updateFoodQuantity({ foodId: food.id, quantity: qty - 1 }));
                    }}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => dispatch(addFood({ food }))}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
