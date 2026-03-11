"use client";

import React from "react";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Food } from "@/lib/api/types";
import { useCart } from "@/contexts/CartContext";
import { BookingDialog } from "@/components/ui/booking-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface FoodCardProps {
    item: Food;
    showTimeSlots?: boolean;
    /** When provided, renders instead of the default Book Now button (e.g. quantity controls in booking flow) */
    action?: React.ReactNode;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, showTimeSlots = false, action }) => {
    const { getFoodQuantity } = useCart();
    const quantity = getFoodQuantity(item.id);
    const isInCart = quantity > 0;

    return (
        <Card className="p-2  bg-secondary-2 border border-transparent hover:border transition-transform duration-900 group">
            <div className="relative h-48 rounded-[10px] overflow-hidden">
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
                {item.rating && (
                    <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-l-[12px] sm:rounded-l-[15px] rounded-tr-[12px] sm:rounded-tr-[16px] text-[10px] sm:text-xs font-bold flex items-center gap-0.5 sm:gap-1">
                        <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {item.rating}
                    </div>
                )}
            </div>

            <CardContent className="px-1.5 pb-2 pt-2 sm:pt-3">
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <div className="flex-1 pr-1.5 sm:pr-2 min-w-0">
                        <h3 className="text-xs sm:text-[15px] font-bold text-primary tracking-tight leading-tight mb-0.5 sm:mb-1">
                            {item.title}
                        </h3>
                        <span className="text-[10px] sm:text-[12px] text-gray-400 font-medium">
                            Freshly Prepared
                        </span>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-primary-1 text-base sm:text-[18px] font-bold">
                            {item.price}
                        </div>
                        <div className="text-[9px] sm:text-[11px] text-gray-400 font-medium mt-0.5">
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
                            <div className="w-8 h-7 sm:w-10 sm:h-9 bg-primary/[0.04] border border-white/10 rounded-full text-[9px] sm:text-[11px] font-bold text-gray-400 flex items-center justify-center">
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
