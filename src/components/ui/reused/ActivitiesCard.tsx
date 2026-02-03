"use client";

import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "@/lib/api/types";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ActivitiesCardProps {
    item: Activity;
    showTimeSlots?: boolean;
}

const ActivitiesCard: React.FC<ActivitiesCardProps> = ({ item, showTimeSlots = false }) => {
    const { addActivity, activityItems } = useCart();

    const handleBookNow = () => {
        const alreadyInCart = activityItems.some((i) => i.activity.id === item.id);
        if (alreadyInCart) {
            toast.info("Already in cart", {
                description: item.title,
            });
        } else {
            addActivity(item);
            toast.success("Activity added to cart", {
                description: item.title,
            });
        }
    };
    return (
        <Card className="p-2   bg-secondary-2 border border-transparent hover:border transition-transform duration-900 group">
            <div className="relative h-48 rounded-[10px] overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {item.discount && (
                    <div className="absolute top-0 right-0 bg-primary-1 text-black px-5 py-2.5 rounded-bl-[16px] text-xs font-black">
                        {item.discount}
                    </div>
                )}
                {item.rating && (
                    <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2.5 py-1.5 rounded-l-[15px] rounded-tr-[16px] text-xs">
                        <FaStar className="inline w-3 h-3 mr-1" />
                        {item.rating}
                    </div>
                )}
            </div>

            <CardContent className="px-1.5 pb-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-[14px] font-bold text-primary tracking-tight leading-tight">
                        {item.title}
                    </h3>
                    <div className="text-right shrink-0">
                        <div className="text-primary-1 text-[18px] font-bold">
                            {item.price}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 text-xs font-medium">
                        Duration: {item.duration}
                    </span>
                    <span className="text-gray-500 text-[10px] font-medium">
                        {item.unit}
                    </span>
                </div>

                {showTimeSlots && item.timeSlots && item.timeSlots.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                        {item.timeSlots.slice(0, 3).map((slot, idx) => (
                            <Button
                                key={idx}
                                variant="secondary"
                                size="sm"
                                className="flex-1 bg-secondary-2 rounded-full text-[12px] text-primary/80 border border-accent transition-all"
                            >
                                {slot}
                            </Button>
                        ))}
                        {item.timeSlots.length > 3 && (
                            <div className="w-10 h-9 bg-primary/[0.04] border border-white/10 rounded-full text-[11px] font-bold text-gray-400 flex items-center justify-center">
                                +{item.timeSlots.length - 3}
                            </div>
                        )}
                    </div>
                )}

                <Button 
                    onClick={handleBookNow}
                    className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                >
                    Book Now
                </Button>
            </CardContent>
        </Card>
    );
};

export default ActivitiesCard;
