"use client";

import React from "react";
import { FaStar } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Food } from "@/lib/api/types";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface FoodCardProps {
    item: Food;
    showTimeSlots?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ 
    item, 
    showTimeSlots = false
}) => {
    const { getFoodQuantity, addFood, updateFoodQuantity } = useCart();
    const quantity = getFoodQuantity(item.id);

    const handleAddToCart = () => {
        addFood(item, 1);
    };

    const handleDecrease = () => {
        if (quantity > 0) {
            updateFoodQuantity(item.id, quantity - 1);
        }
    };

    const handleIncrease = () => {
        updateFoodQuantity(item.id, quantity + 1);
    };

    return (
        <Card className="p-2  bg-secondary-2 border border-transparent hover:border transition-transform duration-900 group">
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
                    <div className="absolute bottom-1.5 left-1.5 bg-primary-1 text-black px-2.5 py-1.5 rounded-l-[15px] rounded-tr-[16px] text-xs font-bold flex items-center gap-1">
                        <FaStar className="w-3 h-3" />
                        {item.rating}
                    </div>
                )}
            </div>

            <CardContent className="px-1.5 pb-2 pt-3">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-2">
                        <h3 className="text-[15px] font-bold text-primary tracking-tight leading-tight mb-1">
                            {item.title}
                        </h3>
                        <span className="text-[12px] text-gray-400 font-medium">
                            Freshly Prepared
                        </span>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-primary-1 text-[18px] font-bold">
                            {item.price}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {item.unit}
                        </div>
                    </div>
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

                {quantity > 0 ? (
                    <div className="flex items-center gap-2 w-full">
                        <button
                            onClick={handleDecrease}
                            className="flex-shrink-0 w-14 h-9 rounded-[10px]  border-2 border-primary-1 bg-secondary-2 text-primary-1 flex items-center justify-center hover:bg-primary-1/10 transition-all cursor-pointer"
                        >
                            <Minus className="w-4 h-4 text-primary  " />
                        </button>
                        <div className="flex-1 text-center text-primary text-sm font-medium">
                            {quantity} in cart
                        </div>
                        <button
                            onClick={handleIncrease}
                            className="flex-shrink-0 w-14 h-9  rounded-[10px]  bg-primary-1 text-black flex items-center justify-center hover:bg-primary-1/90 transition-all cursor-pointer font-bold"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <Button 
                        onClick={handleAddToCart}
                        className="w-full cursor-pointer py-4 rounded-[10px] text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                    >
                        Add to Cart
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default FoodCard;
