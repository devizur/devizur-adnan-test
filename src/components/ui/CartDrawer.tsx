"use client";
import { IoMdClose } from "react-icons/io";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentDialog } from "@/components/ui/payment-dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerTitle,
} from "@/components/ui/drawer";
import { formatPrice, parsePrice } from "@/lib/utils";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// Shared cart content component
const CartContent: React.FC<{ onPaymentSuccess?: () => void }> = ({ onPaymentSuccess }) => {
    const {
        foodItems,
        activityItems,
        packageItems,
        updateFoodQuantity,
        removeFood,
        removeActivity,
        removePackage,
        clearCart,
    } = useCart();

    const foodSubtotal = foodItems.reduce(
        (sum, item) => sum + parsePrice(item.food.price) * item.quantity,
        0
    );

    const activitySubtotal = activityItems.reduce(
        (sum, item) => sum + parsePrice(item.activity.price) * item.gameNo,
        0
    );

    const packageSubtotal = packageItems.reduce(
        (sum, item) => sum + parsePrice(item.pkg.price),
        0
    );

    const subtotal = foodSubtotal + activitySubtotal + packageSubtotal;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const discount = 0; // Can be calculated based on discounts
    const total = subtotal + serviceFee - discount;

    return (
        <>
            {/* Header */}
            <div className="p-6 border-b border-accent/20 ">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-primary">Checkout</h2>

                    <DrawerClose asChild>
                        <div  >
                            <IoMdClose className="text-2xl cursor-pointer font-bold text-primary" />
                        </div>
                    </DrawerClose>

                </div>
                <p className="text-sm text-gray-400">
                    Items, bookings, and table reservations—all in one place.
                </p>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6  ">
                {/* Food Items Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <div className="flex items-center justify-between ">
                        <h3 className="text-lg font-bold text-primary">Food Items</h3>
                        <Badge variant="outline" className="bg-primary-1/15 p-1 text-primary-1 font-light border-primary-1 ">  {foodItems.length} {foodItems.length === 1 ? "type" : "types"}</Badge>

                    </div>

                    {foodItems.length === 0 ? (
                        <div className=" ">
                            <p className="text-gray-400 text-sm">No food items yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {foodItems.map((item) => (
                                <div
                                    key={item.food.id}
                                    className="flex border border-accent/40 rounded-xl  items-start gap-3 p-2 "
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

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="text-accent text-sm">
                                                {item.food.price} X  {item.quantity}
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

                    <div className="">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Food Subtotal</span>
                            <span className="text-lg   text-primary">
                                {formatPrice(foodSubtotal)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Activities Booking Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <div className="flex items-center justify-between  ">
                        <h3 className="text-lg font-bold text-primary">Activities Booking</h3>

                        <Badge variant="outline" className="bg-primary-1/15 p-1 text-primary-1 font-light border-primary-1 ">      {activityItems.length}{" "}
                            {activityItems.length === 1 ? "booking" : "bookings"}</Badge>
                    </div>

                    {activityItems.length === 0 ? (
                        <div className="">
                            <p className="text-gray-400 text-sm">No booking yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activityItems.map((item) => (
                                <div
                                    key={item.activity.id}
                                    className="flex items-start gap-3 border border-accent/40 rounded-xl p-2 "
                                >
                                    <img
                                        src={item.activity.image}
                                        alt={item.activity.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">

                                        <div className="flex justify-between items-start">
                                            <div className="">
                                                <h2 className="text-sm font-bold text-primary truncate">
                                                    {item.activity.title}
                                                </h2>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {item.activity.category}
                                                </p>
                                                <div className="flex items-center justify-between ">
                                                    <div className=" text-primary text-sm ">
                                                        {item.activity.price}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start justify-end gap-2">

                                                <button
                                                    onClick={() =>
                                                        removeActivity(item.activity.id)
                                                    }
                                                    className="ml-2 cursor-pointer text-red-300 transition-colors"
                                                >
                                                    <Badge variant="outline" className="bg-red-500/10 p-1 font-bold text-red-500/70   border-red-500  rounded-[10px]">  Remove</Badge>

                                                </button>
                                            </div>

                                        </div>




                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Booking Subtotal</span>
                            <span className="text-lg   text-primary">
                                {formatPrice(activitySubtotal)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Packages Booking Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <div className="flex items-center justify-between  ">
                        <h3 className="text-lg font-bold text-primary">Packages Booking</h3>

                        <Badge
                            variant="outline"
                            className="bg-primary-1/15 p-1 text-primary-1 font-light border-primary-1 "
                        >
                            {packageItems.length}{" "}
                            {packageItems.length === 1 ? "package" : "packages"}
                        </Badge>
                    </div>

                    {packageItems.length === 0 ? (
                        <div className="">
                            <p className="text-gray-400 text-sm">No packages yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {packageItems.map((item) => (
                                <div
                                    key={item.pkg.id}
                                    className="flex items-start gap-3 border border-accent/40 rounded-xl p-2 "
                                >
                                    <img
                                        src={item.pkg.image}
                                        alt={item.pkg.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div className="">
                                                <h4 className="text-sm font-bold text-primary truncate">
                                                    {item.pkg.title}
                                                </h4>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {item.pkg.category}
                                                </p>
                                                <div className="flex items-center justify-between ">
                                                    <div className=" text-primary text-sm ">
                                                        {item.pkg.price}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        removePackage(item.pkg.id)
                                                    }
                                                    className="ml-2 cursor-pointer text-red-300 transition-colors"
                                                >
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-500/10 p-1 font-bold text-red-500/70   border-red-500  rounded-[10px]"
                                                    >
                                                        Remove
                                                    </Badge>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Packages Subtotal</span>
                            <span className="text-lg   text-primary">
                                {formatPrice(packageSubtotal)}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Summary Section */}
                <Card className="p-4 bg-secondary border border-accent/10">
                    <h3 className="text-lg font-bold text-primary ">Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-primary">Subtotal</span>
                            <span className="text-primary font-medium">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-primary">Service Fee (5%)</span>
                            <span className="text-primary font-medium">
                                {formatPrice(serviceFee)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-primary-1">Discount</span>
                            <span className="text-primary ">
                                {formatPrice(discount)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-accent/10">
                            <div className="flex justify-between">
                                <span className="text-lg font-semibold text-primary">
                                    Total Amount
                                </span>
                                <span className="text-xl font-samibold text-primary">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className=" space-y-3 bg-secondary-2">
                        <PaymentDialog onPaymentSuccess={onPaymentSuccess}>
                            <Button
                                className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                            >
                                Add Payment
                            </Button>
                        </PaymentDialog>
                        <Button
                            variant="outline"
                            className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1/10 hover:bg-primary-2  text-primary-1 border border-primary-1"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </Button>

                    </div>
                </Card>
                <p className="text-xs text-gray-400   pt-1">
                    Tip: Food orders, activity bookings, and optional table reservations are all
                    submitted together in one flow.
                </p>
            </div>



        </>
    );
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia("(min-width: 768px)");

        // Set initial value
        setIsDesktop(mediaQuery.matches);

        const handleChange = (event: MediaQueryListEvent) => {
            setIsDesktop(event.matches);
        };

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    return (
        <>
            <Drawer
                direction={isDesktop ? "right" : "bottom"}
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
            >

                <DrawerContent className="max-h-[90vh] lg:min-w-150 bg-secondary-2 border-secondary-2 md:h-full  md:max-h-none flex flex-col">
                    <DrawerTitle className="sr-only">Checkout</DrawerTitle>
                    <CartContent onPaymentSuccess={onClose} />
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CartDrawer;
