"use client";

import React from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Shared cart content component
const CartContent: React.FC<{
    onClose?: () => void;
}> = ({ onClose }) => {
    const {
        foodItems,
        activityItems,
        updateFoodQuantity,
        removeFood,
        updateActivityQuantity,
        removeActivity,
        clearCart,
    } = useCart();

    // Calculate prices
    const parsePrice = (priceStr: string): number => {
        return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
    };

    const foodSubtotal = foodItems.reduce(
        (sum, item) => sum + parsePrice(item.food.price) * item.quantity,
        0
    );

    const activitySubtotal = activityItems.reduce(
        (sum, item) => sum + parsePrice(item.activity.price) * item.quantity,
        0
    );

    const subtotal = foodSubtotal + activitySubtotal;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const discount = 0; // Can be calculated based on discounts
    const total = subtotal + serviceFee - discount;

    const formatPrice = (amount: number): string => {
        return `$${amount.toFixed(2)}`;
    };

    return (
        <>
            {/* Header */}
            <div className="p-6 border-b border-accent/20">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-primary">Checkout</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-primary transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-400">
                    Items, bookings, and table reservations—all in one place.
                </p>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(100vh-300px)]">
                {/* Food Items Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-primary">Food Items</h3>
                        <span className="px-3 py-1 bg-primary-1/20 text-primary-1 text-xs font-bold rounded-full">
                            {foodItems.length} {foodItems.length === 1 ? "type" : "types"}
                        </span>
                    </div>

                    {foodItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">No food items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {foodItems.map((item) => (
                                <div
                                    key={item.food.id}
                                    className="flex items-start gap-3 pb-4 border-b border-accent/10 last:border-0 last:pb-0"
                                >
                                    <img
                                        src={item.food.image}
                                        alt={item.food.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-primary truncate">
                                            {item.food.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.food.category}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-primary-1 font-bold">
                                                {item.food.price}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateFoodQuantity(
                                                            item.food.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-7 h-7 rounded border border-primary-1/30 bg-secondary-2 text-primary-1 flex items-center justify-center hover:bg-primary-1/10 transition-all"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-medium text-primary w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateFoodQuantity(
                                                            item.food.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-7 h-7 rounded bg-primary-1 text-black flex items-center justify-center hover:bg-primary-1/90 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => removeFood(item.food.id)}
                                                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-accent/10">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Food Subtotal</span>
                            <span className="text-lg font-bold text-primary-1">
                                {formatPrice(foodSubtotal)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Activities Booking Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-primary">Activities Booking</h3>
                        <span className="px-3 py-1 bg-primary-1/20 text-primary-1 text-xs font-bold rounded-full">
                            {activityItems.length}{" "}
                            {activityItems.length === 1 ? "booking" : "bookings"}
                        </span>
                    </div>

                    {activityItems.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">No booking yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activityItems.map((item) => (
                                <div
                                    key={item.activity.id}
                                    className="flex items-start gap-3 pb-4 border-b border-accent/10 last:border-0 last:pb-0"
                                >
                                    <img
                                        src={item.activity.image}
                                        alt={item.activity.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-primary truncate">
                                            {item.activity.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.activity.category}
                                        </p>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-primary-1 font-bold">
                                                {item.activity.price}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateActivityQuantity(
                                                            item.activity.id,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-7 h-7 rounded border border-primary-1/30 bg-secondary-2 text-primary-1 flex items-center justify-center hover:bg-primary-1/10 transition-all"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-medium text-primary w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateActivityQuantity(
                                                            item.activity.id,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-7 h-7 rounded bg-primary-1 text-black flex items-center justify-center hover:bg-primary-1/90 transition-all"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        removeActivity(item.activity.id)
                                                    }
                                                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-accent/10">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Booking Subtotal</span>
                            <span className="text-lg font-bold text-primary-1">
                                {formatPrice(activitySubtotal)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Summary Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <h3 className="text-lg font-bold text-primary mb-4">Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span className="text-primary font-medium">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Service Fee (5%)</span>
                            <span className="text-primary font-medium">
                                {formatPrice(serviceFee)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-primary-1">Discount</span>
                            <span className="text-primary-1 font-medium">
                                {formatPrice(discount)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-accent/10">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-primary">
                                    Total Amount
                                </span>
                                <span className="text-xl font-bold text-primary-1">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Footer - Action Buttons */}
            <div className="p-6 border-t border-accent/20 space-y-3 bg-secondary-2">
                <Button
                    className="w-full py-3 bg-primary-1 hover:bg-primary-1/90 text-black font-bold rounded-lg"
                    onClick={() => {
                        // Handle payment
                        console.log("Add Payment clicked");
                    }}
                >
                    Add Payment
                </Button>
                <Button
                    variant="outline"
                    className="w-full py-3 border-2 border-primary-1 text-primary-1 hover:bg-primary-1/10 font-bold rounded-lg"
                    onClick={clearCart}
                >
                    Clear Cart
                </Button>
                <p className="text-xs text-gray-400 text-center pt-2">
                    Tip: Food orders, activity bookings, and optional table reservations are all
                    submitted together in one flow.
                </p>
            </div>
        </>
    );
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Drawer - Bottom */}
            <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DrawerContent className="max-h-[90vh] md:hidden flex flex-col">
                    <CartContent />
                </DrawerContent>
            </Drawer>

            {/* Desktop Side Drawer */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="hidden md:block fixed inset-0 bg-black/50 z-40 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Side Drawer */}
                    <div
                        className={`hidden md:flex fixed right-0 top-0 h-full w-full max-w-md bg-secondary-2 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex-col ${
                            isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <CartContent onClose={onClose} />
                    </div>
                </>
            )}
        </>
    );
};

export default CartDrawer;
