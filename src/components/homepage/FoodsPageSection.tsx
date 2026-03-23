"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFoods } from "@/lib/api/hooks";
import type { Food } from "@/lib/api/types";
import FoodCard, { FoodCardSkeleton } from "../ui/reused/FoodCard";
import { Pagination } from "@/components/ui/reused/Pagination";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/components/ui/booking-dialog";
import { FoodModifierDialog } from "@/components/ui/booking/FoodModifierDialog";
import { useCart } from "@/contexts/CartContext";

const PAGE_SIZE = 9;

interface FoodsPageSectionProps {
    searchTerm?: string;
}

const FoodsPageSection: React.FC<FoodsPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: allFoods = [], isLoading, error } = useFoods(searchTerm);
    const { getFoodQuantity } = useCart();

    const [modifierFood, setModifierFood] = useState<Food | null>(null);
    const [modifierDialogOpen, setModifierDialogOpen] = useState(false);
    const [selectedModifierIds, setSelectedModifierIds] = useState<number[]>([]);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [bookingInitialFood, setBookingInitialFood] = useState<Food | null>(null);

    const handleToggleModifier = useCallback((modifierId: number) => {
        setSelectedModifierIds((prev) =>
            prev.includes(modifierId) ? prev.filter((id) => id !== modifierId) : [...prev, modifierId]
        );
    }, []);

    const handleBookNowClick = useCallback((food: Food) => {
        setModifierFood(food);
        setSelectedModifierIds([]);
        setModifierDialogOpen(true);
    }, []);

    const handleModifierConfirm = useCallback(() => {
        const f = modifierFood;
        if (!f) return;
        console.log("[FoodsPage] modifiers confirmed for food:", {
            foodId: f.id,
            productId: f.productId,
            selectedModifierIds,
        });
        setModifierDialogOpen(false);
        setModifierFood(null);
        setSelectedModifierIds([]);
        setBookingInitialFood(f);
        setBookingDialogOpen(true);
    }, [modifierFood, selectedModifierIds]);

    // Frontend pagination: slice full list by current page
    const paginatedFoods = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return allFoods.slice(start, start + PAGE_SIZE);
    }, [allFoods, currentPage]);

    const totalPages = Math.ceil(allFoods.length / PAGE_SIZE) || 1;
    const hasNextPage = currentPage < totalPages;

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Smooth scroll to top on page change
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [currentPage]);

    if (isLoading) {
        return (
            <section className="container mx-auto pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <FoodCardSkeleton key={index} />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-red-500">Error loading foods: {error.message}</p>
                </div>
            </section>
        );
    }

    if (!allFoods.length) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No foods found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedFoods.map((food, index) => {
                    const qty = getFoodQuantity(food.id);
                    const isInCart = qty > 0;
                    return (
                        <FoodCard
                            key={`${food.id}-${index}`}
                            item={food}
                            action={
                                <Button
                                    type="button"
                                    onClick={() => handleBookNowClick(food)}
                                    className="w-full cursor-pointer py-3 sm:py-4 rounded-[8px] sm:rounded-[10px] text-xs sm:text-[15px] bg-primary-1 hover:bg-primary-1/90 font-bold text-secondary"
                                    aria-label={isInCart ? `Continue booking: ${food.title}` : `Book now: ${food.title}`}
                                >
                                    {isInCart ? "Book Now: Selected" : "Book Now"}
                                </Button>
                            }
                        />
                    );
                })}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
            />

            <FoodModifierDialog
                open={modifierDialogOpen}
                onOpenChange={(open) => {
                    setModifierDialogOpen(open);
                    if (!open) {
                        setModifierFood(null);
                        setSelectedModifierIds([]);
                    }
                }}
                food={modifierFood}
                selectedTargetProductIds={selectedModifierIds}
                onToggleTarget={handleToggleModifier}
                onConfirm={handleModifierConfirm}
            />

            <BookingDialog
                initialFood={bookingInitialFood ?? undefined}
                open={bookingDialogOpen}
                onOpenChange={(open) => {
                    setBookingDialogOpen(open);
                    if (!open) setBookingInitialFood(null);
                }}
            >
                <button
                    type="button"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden
                >
                    Open booking
                </button>
            </BookingDialog>
        </section>
    );
};

export default FoodsPageSection;

