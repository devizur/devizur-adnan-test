"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Food, Activity, Package } from "@/lib/api/types";

export interface CartFoodItem {
    food: Food;
    quantity: number;
}

export interface CartActivityItem {
    activity: Activity;
    gameNo: number;
}

export interface CartPackageItem {
    pkg: Package;
}

interface CartContextType {
    foodItems: CartFoodItem[];
    activityItems: CartActivityItem[];
    packageItems: CartPackageItem[];
    addFood: (food: Food, quantity?: number) => void;
    removeFood: (foodId: number) => void;
    updateFoodQuantity: (foodId: number, quantity: number) => void;
    addActivity: (activity: Activity, gameNo?: number) => void;
    updateActivityGameNo: (activityId: number, gameNo: number) => void;
    removeActivity: (activityId: number) => void;
    addPackage: (pkg: Package) => void;
    removePackage: (pkgId: number) => void;
    clearCart: () => void;
    getFoodQuantity: (foodId: number) => number;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [foodItems, setFoodItems] = useState<CartFoodItem[]>([]);
    const [activityItems, setActivityItems] = useState<CartActivityItem[]>([]);
    const [packageItems, setPackageItems] = useState<CartPackageItem[]>([]);

    const addFood = (food: Food, quantity: number = 1) => {
        setFoodItems((prev) => {
            const existing = prev.find((item) => item.food.id === food.id);
            if (existing) {
                return prev.map((item) =>
                    item.food.id === food.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { food, quantity }];
        });
    };

    const removeFood = (foodId: number) => {
        setFoodItems((prev) => prev.filter((item) => item.food.id !== foodId));
    };

    const updateFoodQuantity = (foodId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFood(foodId);
            return;
        }
        setFoodItems((prev) =>
            prev.map((item) =>
                item.food.id === foodId ? { ...item, quantity } : item
            )
        );
    };

    const addActivity = (activity: Activity, gameNo: number = 1) => {
        setActivityItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.activity.id === activity.id);
            if (existingIndex !== -1) {
                // Update existing activity with new game number
                return prev.map((item, index) =>
                    index === existingIndex ? { ...item, gameNo } : item
                );
            }
            return [...prev, { activity, gameNo }];
        });
    };

    const updateActivityGameNo = (activityId: number, gameNo: number) => {
        setActivityItems((prev) =>
            prev.map((item) =>
                item.activity.id === activityId ? { ...item, gameNo } : item
            )
        );
    };

    const removeActivity = (activityId: number) => {
        setActivityItems((prev) =>
            prev.filter((item) => item.activity.id !== activityId)
        );
    };

    const addPackage = (pkg: Package) => {
        setPackageItems((prev) => {
            const exists = prev.some((item) => item.pkg.id === pkg.id);
            if (exists) {
                return prev;
            }
            return [...prev, { pkg }];
        });
    };

    const removePackage = (pkgId: number) => {
        setPackageItems((prev) =>
            prev.filter((item) => item.pkg.id !== pkgId)
        );
    };

    const clearCart = () => {
        setFoodItems([]);
        setActivityItems([]);
        setPackageItems([]);
    };

    const getFoodQuantity = (foodId: number) => {
        const item = foodItems.find((item) => item.food.id === foodId);
        return item?.quantity || 0;
    };

    const getTotalItems = () => {
        const foodCount = foodItems.reduce((sum, item) => sum + item.quantity, 0);
        const activityCount = activityItems.length;
        const packageCount = packageItems.length;
        return foodCount + activityCount + packageCount;
    };

    return (
        <CartContext.Provider
            value={{
                foodItems,
                activityItems,
                packageItems,
                addFood,
                removeFood,
                updateFoodQuantity,
                addActivity,
                updateActivityGameNo,
                removeActivity,
                addPackage,
                removePackage,
                clearCart,
                getFoodQuantity,
                getTotalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
