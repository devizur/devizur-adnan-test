"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useFoodsAlignedWithModifiers } from "@/lib/api/hooks";
import FoodCard, { FoodCardSkeleton } from "../ui/reused/FoodCard";
import { Pagination } from "@/components/ui/reused/Pagination";

const PAGE_SIZE = 9;

interface FoodsPageSectionProps {
    searchTerm?: string;
}

const FoodsPageSection: React.FC<FoodsPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: combinedFoods, isLoading, error } = useFoodsAlignedWithModifiers(searchTerm);
    const allFoods = combinedFoods ?? [];

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

    // Log combined foods + modifiers (single JSON per food) for debugging
    useEffect(() => {
        if (!combinedFoods) return;
        console.log("[FoodsPage] foods + modifiers (aligned):", combinedFoods);
    }, [combinedFoods]);

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
                {paginatedFoods.map((food, index) => (
                    <FoodCard
                        key={`${food.id}-${index}`}
                        item={food}
                        modifierNames={food.modifierTargets?.map((t) => t.productName) ?? []}
                    />
                ))}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default FoodsPageSection;

