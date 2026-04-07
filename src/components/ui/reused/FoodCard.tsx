"use client";

import React from "react";
 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Food } from "@/lib/api/types";
import { useCart } from "@/contexts/CartContext";
import { BookingDialog } from "@/components/ui/booking-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FoodCardProps {
    item: Food;
    showTimeSlots?: boolean;
    /** Optional: modifier names associated with this food (from modifier master data) */
    modifierNames?: string[];
    /** When provided, renders instead of the default Book Now button (e.g. quantity controls in booking flow) */
    action?: React.ReactNode;
    /** Dense layout + chrome aligned with booking dialog (e.g. food step) */
    compact?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, showTimeSlots = false, modifierNames, action, compact = false }) => {
    const { getFoodQuantity } = useCart();
    const quantity = getFoodQuantity(item.id);
    const isInCart = quantity > 0;

    return (
        <Card
            className={cn(
                "group p-2 transition-transform duration-300",
                compact
                    ? "rounded-lg border border-white/[0.08] bg-[#1a1a1a] shadow-sm shadow-black/10 hover:border-white/[0.12]"
                    : "border border-transparent bg-secondary-2 hover:border"
            )}
        >
            <div
                className={cn(
                    "relative overflow-hidden",
                    compact ? "h-28 rounded-md sm:h-32" : "h-48 rounded-[10px]"
                )}
            >
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.discount && (
                    <div className="absolute top-0 right-0 bg-primary-1 text-black px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-bl-[12px] sm:rounded-bl-[16px] text-[10px] sm:text-xs font-black">
                        {item.discount}
                    </div>
                )}
            
            </div>

            <CardContent className={cn("px-1.5 pb-2 pt-2", compact ? "sm:pt-2" : "sm:pt-3")}>
                <div className={cn("flex justify-between items-start", compact ? "mb-1.5" : "mb-1.5 sm:mb-2.5")}>
                    <div className="flex-1 pr-1.5 sm:pr-2 min-w-0">
                        <h3
                            className={cn(
                                "font-semibold tracking-tight leading-tight text-zinc-100",
                                compact
                                    ? "text-[11px] sm:text-xs mb-0.5"
                                    : "text-xs sm:text-[15px] font-bold text-primary mb-0.5 sm:mb-1"
                            )}
                        >
                            {item.title}
                        </h3>
                        <span
                            className={cn(
                                "font-medium",
                                compact
                                    ? "text-[9px] text-zinc-500"
                                    : "text-[10px] sm:text-[12px] text-gray-400"
                            )}
                        >
                            Freshly Prepared
                        </span>
                        {modifierNames && modifierNames.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {modifierNames.slice(0, 3).map((name, idx) => (
                                    <span
                                        key={`${name}-${idx}`}
                                        className="px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] sm:text-[10px] text-primary/90"
                                    >
                                        {name}
                                    </span>
                                ))}
                                {modifierNames.length > 3 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[9px] sm:text-[10px] text-gray-400">
                                        +{modifierNames.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="text-right shrink-0">
                        <div
                            className={cn(
                                "font-bold text-primary-1",
                                compact ? "text-sm sm:text-[0.9375rem]" : "text-base sm:text-[18px]"
                            )}
                        >
                            {item.price}
                        </div>
                        <div
                            className={cn(
                                "font-medium mt-0.5",
                                compact ? "text-[9px] text-zinc-500" : "text-[9px] sm:text-[11px] text-gray-400"
                            )}
                        >
                            {item.unit}
                        </div>
                    </div>
                </div>

                {showTimeSlots && item.timeSlots && item.timeSlots.length > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                        {item.timeSlots.slice(0, 3).map((slot, idx) => (
                            <Button
                                key={idx}
                                variant="secondary"
                                size="sm"
                                className="flex-1 bg-secondary-2 rounded-full text-[10px] sm:text-[12px] text-primary/80 border border-accent transition-all min-h-7 sm:min-h-9"
                            >
                                {slot}
                            </Button>
                        ))}
                        {item.timeSlots.length > 3 && (
                            <div className="w-8 h-7 sm:w-10 sm:h-9 bg-primary/4 border border-white/10 rounded-full text-[9px] sm:text-[11px] font-bold text-gray-400 flex items-center justify-center">
                                +{item.timeSlots.length - 3}
                            </div>
                        )}
                    </div>
                )}

                {action !== undefined ? (
                    action
                ) : (
                    <BookingDialog initialFood={item}>
                        <Button
                            className="w-full cursor-pointer py-3 sm:py-4 rounded-[8px] sm:rounded-[10px] text-xs sm:text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                        >
                            {isInCart ? "Book Now: Selected" : "Book Now"}
                        </Button>
                    </BookingDialog>
                )}
            </CardContent>
        </Card>
    );
};

export const FoodCardSkeleton: React.FC = () => {
    return (
        <Card className="p-2 bg-secondary-2 border border-transparent">
            <div className="relative h-48 rounded-[10px] overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>

            <CardContent className="px-1.5 pb-2 pt-2 sm:pt-3">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 pr-1.5 sm:pr-2 min-w-0">
                        <Skeleton className="h-3 sm:h-4 w-3/4 mb-1.5" />
                        <Skeleton className="h-2.5 sm:h-3 w-1/3" />
                    </div>
                    <div className="text-right shrink-0">
                        <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 mb-1" />
                        <Skeleton className="h-2.5 sm:h-3 w-10 sm:w-12" />
                    </div>
                </div>

                <div className="flex justify-between items-center mb-2 sm:mb-4">
                    <Skeleton className="h-2.5 sm:h-3 w-24" />
                    <Skeleton className="h-2 sm:h-2.5 w-12" />
                </div>

                <Skeleton className="h-8 sm:h-10 w-full rounded-[8px] sm:rounded-[10px]" />
            </CardContent>
        </Card>
    );
};

export default FoodCard;
