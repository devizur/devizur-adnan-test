"use client";

import React from 'react';
import ProductCard from "@/components/ui/reused/ProductCard";
import { useFoods } from "@/lib/api/hooks";
import Link from 'next/link';

// Re-export Food type for backward compatibility
export type { Food } from "@/lib/api/types";

interface PopularFoodsProps {
    limit?: number;
    searchTerm?: string;
}

const PopularFoods: React.FC<PopularFoodsProps> = ({ limit, searchTerm }) => {
    const { data: foods = [], isLoading, error } = useFoods();
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? foods.filter(
              (food) =>
                  food.title.toLowerCase().includes(normalized) ||
                  food.category.toLowerCase().includes(normalized)
          )
        : foods;

    const itemsToShow =
        normalized || !limit ? filtered : filtered.slice(0, limit);

    if (isLoading) {
        return (
            <section className="container mx-auto px-6 pb-20">
                <div className="text-center py-20">
                    <p className="text-primary">Loading foods...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto px-6 pb-20">
                <div className="text-center py-20">
                    <p className="text-red-500">Error loading foods: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-6  pb-20">
            {!normalized && (
                <div className="flex items-center justify-between mb-7">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Foods</h2>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itemsToShow.map((food) => (
                    <ProductCard key={food.id} item={food} />
                ))}
            </div>


            {!normalized && (
                <div className="flex py-10 justify-center">
                    <Link href="/foods">
                        <button className="hidden md:block px-16 py-3 border  bg-primary-1/10 border-primary-1 text-primary-1 text-base font-semibold rounded-sm hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer">
                            View All Foods
                        </button>
                    </Link>
                </div>
            )}
        </section>
    );
};

export default PopularFoods;
