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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 scrollbar-dark">
        {foods.map((food) => {
          const qty = getQuantity(food.id);
          return (
            <FoodCard
              key={food.id}
              item={food}
              showTimeSlots={false}
              action={
                qty === 0 ? (
                  <Button
                    type="button"
                    onClick={() => dispatch(addFood({ food }))}
                    className="mt-3 w-full h-11 rounded-[10px] bg-primary-1 text-black font-semibold text-sm hover:bg-primary-1-hover cursor-pointer"
                    aria-label={`Add ${food.title} to cart`}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-[10px] bg-black/40 px-3 py-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`Decrease quantity of ${food.title}`}
                      className="h-9 w-9 rounded-[8px] border border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 cursor-pointer"
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
                      className="h-9 w-9 rounded-[8px] bg-primary-1 text-black hover:bg-primary-1-hover font-semibold cursor-pointer"
                      onClick={() => dispatch(addFood({ food }))}
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
    </div>
  );
}
