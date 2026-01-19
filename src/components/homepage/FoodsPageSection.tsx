"use client";
import React from "react";
import ProductCard from "@/components/ui/reused/ProductCard";
import { foods } from "./PopularFoods";

interface FoodsPageSectionProps {
    searchTerm?: string;
}

const FoodsPageSection: React.FC<FoodsPageSectionProps> = ({ searchTerm }) => {
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? foods.filter(
              (food) =>
                  food.title.toLowerCase().includes(normalized) ||
                  food.category.toLowerCase().includes(normalized)
          )
        : foods;

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((food) => (
                    <ProductCard key={food.id} item={food} />
                ))}
            </div>
        </section>
    );
};

export default FoodsPageSection;

