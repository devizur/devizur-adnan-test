"use client";
import React, { useEffect, useState } from "react";
import { useFoods } from "@/lib/api/hooks";
import FoodCard from "../ui/reused/FoodCard";
import { Pagination } from "@/components/ui/reused/Pagination";

interface FoodsPageSectionProps {
    searchTerm?: string;
}

const FoodsPageSection: React.FC<FoodsPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;
    const { data: foods = [], isLoading, error } = useFoods(
        searchTerm,
        currentPage,
        pageSize
    );

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

    const hasNextPage = foods.length === pageSize;

    if (isLoading) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-primary">Loading foods...</p>
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

    if (!foods.length) {
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
                {foods.map((food) => (
                    <FoodCard key={food.id} item={food} />
                ))}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default FoodsPageSection;

