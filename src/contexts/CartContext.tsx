"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Food } from "@/lib/api/types";
import { Activity } from "@/lib/api/types";

export interface CartFoodItem {
    food: Food;
    quantity: number;
}

export interface CartActivityItem {
    activity: Activity;
    quantity: number;
}

interface CartContextType {
    foodItems: CartFoodItem[];
    activityItems: CartActivityItem[];
    addFood: (food: Food, quantity?: number) => void;
    removeFood: (foodId: number) => void;
    updateFoodQuantity: (foodId: number, quantity: number) => void;
    addActivity: (activity: Activity, quantity?: number) => void;
    removeActivity: (activityId: number) => void;
    updateActivityQuantity: (activityId: number, quantity: number) => void;
    clearCart: () => void;
    getFoodQuantity: (foodId: number) => number;
    getActivityQuantity: (activityId: number) => number;
    getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEYS = {
    FOOD_ITEMS: "cart-food-items",
    ACTIVITY_ITEMS: "cart-activity-items",
};

// Load cart data from localStorage
const loadCartFromStorage = () => {
    if (typeof window === "undefined") {
        return { foodItems: [], activityItems: [] };
    }

    try {
        const foodItemsStr = localStorage.getItem(CART_STORAGE_KEYS.FOOD_ITEMS);
        const activityItemsStr = localStorage.getItem(CART_STORAGE_KEYS.ACTIVITY_ITEMS);

        const foodItems = foodItemsStr ? JSON.parse(foodItemsStr) : [];
        const activityItems = activityItemsStr ? JSON.parse(activityItemsStr) : [];

        return { foodItems, activityItems };
    } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        return { foodItems: [], activityItems: [] };
    }
};

// Save cart data to localStorage
const saveCartToStorage = (foodItems: CartFoodItem[], activityItems: CartActivityItem[]) => {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(CART_STORAGE_KEYS.FOOD_ITEMS, JSON.stringify(foodItems));
        localStorage.setItem(CART_STORAGE_KEYS.ACTIVITY_ITEMS, JSON.stringify(activityItems));
    } catch (error) {
        console.error("Error saving cart to localStorage:", error);
    }
};

export function CartProvider({ children }: { children: ReactNode }) {
    const [foodItems, setFoodItems] = useState<CartFoodItem[]>([]);
    const [activityItems, setActivityItems] = useState<CartActivityItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const { foodItems: savedFoodItems, activityItems: savedActivityItems } =
            loadCartFromStorage();
        setFoodItems(savedFoodItems);
        setActivityItems(savedActivityItems);
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            saveCartToStorage(foodItems, activityItems);
        }
    }, [foodItems, activityItems, isInitialized]);

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

    const addActivity = (activity: Activity, quantity: number = 1) => {
        setActivityItems((prev) => {
            const existing = prev.find((item) => item.activity.id === activity.id);
            if (existing) {
                return prev.map((item) =>
                    item.activity.id === activity.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { activity, quantity }];
        });
    };

    const removeActivity = (activityId: number) => {
        setActivityItems((prev) =>
            prev.filter((item) => item.activity.id !== activityId)
        );
    };

    const updateActivityQuantity = (activityId: number, quantity: number) => {
        if (quantity <= 0) {
            removeActivity(activityId);
            return;
        }
        setActivityItems((prev) =>
            prev.map((item) =>
                item.activity.id === activityId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setFoodItems([]);
        setActivityItems([]);
        // Clear localStorage as well
        if (typeof window !== "undefined") {
            localStorage.removeItem(CART_STORAGE_KEYS.FOOD_ITEMS);
            localStorage.removeItem(CART_STORAGE_KEYS.ACTIVITY_ITEMS);
        }
    };

    const getFoodQuantity = (foodId: number) => {
        const item = foodItems.find((item) => item.food.id === foodId);
        return item?.quantity || 0;
    };

    const getActivityQuantity = (activityId: number) => {
        const item = activityItems.find((item) => item.activity.id === activityId);
        return item?.quantity || 0;
    };

    const getTotalItems = () => {
        const foodCount = foodItems.reduce((sum, item) => sum + item.quantity, 0);
        const activityCount = activityItems.reduce(
            (sum, item) => sum + item.quantity,
            0
        );
        return foodCount + activityCount;
    };

    return (
        <CartContext.Provider
            value={{
                foodItems,
                activityItems,
                addFood,
                removeFood,
                updateFoodQuantity,
                addActivity,
                removeActivity,
                updateActivityQuantity,
                clearCart,
                getFoodQuantity,
                getActivityQuantity,
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
