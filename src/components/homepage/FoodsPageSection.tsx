"use client";
import React from "react";
import { useFoods } from "@/lib/api/hooks";
import FoodCard from "../ui/reused/FoodCard";

interface FoodsPageSectionProps {
    searchTerm?: string;
}

const FoodsPageSection: React.FC<FoodsPageSectionProps> = ({ searchTerm }) => {
    const { data: foods = [], isLoading, error } = useFoods(searchTerm);

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

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {foods.map((food) => (
                    <FoodCard key={food.id} item={food} />
                ))}
            </div>
        </section>
    );
};

export default FoodsPageSection;

