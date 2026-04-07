"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "@/lib/api/types";
import { useCart } from "@/contexts/CartContext";
import { BookingDialog } from "@/components/ui/booking-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ActivitiesCardProps {
    item: Activity;
    showTimeSlots?: boolean;
}

const ActivitiesCard: React.FC<ActivitiesCardProps> = ({ item, showTimeSlots = false }) => {
    const { activityItems } = useCart();
    const isInCart = activityItems.some((i) => i.activity.id === item.id);

    return (
        <Card className="p-2 gap-2   bg-secondary-2 border border-transparent hover:border transition-transform duration-900 group">
        <Link href={`/details/${item.id}`} className="flex flex-col gap-2"  >
        
            <div className="relative h-48 rounded-[10px] overflow-hidden">
                <img
                    src={item.image}
                    alt={item?.productName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

            </div>

            <div className="px-1.5 ">
                {/* Product name and price */}
                <div className="flex justify-between items-start">
                    <h3 className="text-xs sm:text-[14px] font-bold text-primary tracking-tight leading-tight">
                        {item?.productName}
                    </h3>
                    <div className="text-right shrink-0">
                        <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                            <span className="text-primary-1 text-base sm:text-lg font-bold">
                                ${item?.fixedPrice ?? "Unavailable"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center ">
                    <span className="text-gray-500 text-[10px] sm:text-xs font-medium">
                        Duration: {item?.duration || "--"}
                    </span>
                    <span className="text-gray-500 text-[9px] sm:text-[10px] font-medium">
                        {item?.unit || "per person"}
                    </span>
                </div>

            </div>
        </Link>
            
            <BookingDialog initialActivity={item}>
                <Button
                    className="w-full cursor-pointer    rounded-[8px] sm:rounded-[10px] text-xs sm:text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                >
                    {isInCart ? "Book Now: Selected" : "Book Now"}
                </Button>
            </BookingDialog>

        </Card>
    );
};

export const ActivitiesCardSkeleton: React.FC = () => {
    return (
        <Card className="p-2 bg-secondary-2 border border-transparent">
            <div className="relative h-48 rounded-[10px] overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>

            <CardContent className="px-1.5 pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-3 sm:h-4 w-3/4" />
                    <Skeleton className="h-4 sm:h-5 w-14 sm:w-16" />
                </div>

                <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <Skeleton className="h-2.5 sm:h-3 w-24" />
                    <Skeleton className="h-2 sm:h-2.5 w-12" />
                </div>

                <Skeleton className="h-8 sm:h-10 w-full rounded-[8px] sm:rounded-[10px]" />
            </CardContent>
        </Card>
    );
};

export default ActivitiesCard;
