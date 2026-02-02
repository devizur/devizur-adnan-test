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
    gameNo: number;
    ///////////////////////////
}

interface CartContextType {
    foodItems: CartFoodItem[];
    activityItems: CartActivityItem[];
    addFood: (food: Food, quantity?: number) => void;
    removeFood: (foodId: number) => void;
    updateFoodQuantity: (foodId: number, quantity: number) => void;
    addActivity: (activity: Activity) => void;
    removeActivity: (activityId: number) => void;
    clearCart: () => void;
    getFoodQuantity: (foodId: number) => number;
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
        const rawActivityItems = activityItemsStr ? JSON.parse(activityItemsStr) : [];

        // Ensure backward compatibility and default games value
        const activityItems: CartActivityItem[] = rawActivityItems.map(
            (item: any) => ({
                ...item,
                games: item.games ?? 1,
            })
        );

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

    const addActivity = (activity: Activity) => {
        setActivityItems((prev) => {
            const exists = prev.some((item) => item.activity.id === activity.id);
            if (exists) {
                return prev;
            }
            return [...prev, { activity, gameNo: 1}];
        });
    };
    



    const removeActivity = (activityId: number) => {
        setActivityItems((prev) =>
            prev.filter((item) => item.activity.id !== activityId)
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

    const getTotalItems = () => {
        const foodCount = foodItems.reduce((sum, item) => sum + item.quantity, 0);
        const activityCount = activityItems.length;
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
