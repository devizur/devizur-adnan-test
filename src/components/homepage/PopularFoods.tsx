"use client";

import React from "react";
import { useFoods } from "@/lib/api/hooks";
import FoodCard, { FoodCardSkeleton } from "../ui/reused/FoodCard";
import { HomePageSection, HomeSectionHeading, HomeViewAll } from "@/components/homepage/HomeSection";

export type { Food } from "@/lib/api/types";

interface PopularFoodsProps {
  limit?: number;
  searchTerm?: string;
}

const PopularFoods: React.FC<PopularFoodsProps> = ({ limit, searchTerm }) => {
  const { data: foods = [], isLoading, error } = useFoods(searchTerm);
  const hasSearch = !!searchTerm?.trim();

  const itemsToShow = hasSearch || !limit ? foods : foods.slice(0, limit);

  if (isLoading) {
    const skeletonCount = 3;

    return (
      <HomePageSection continued>
        {!hasSearch && <HomeSectionHeading eyebrow="Dine" title="Popular foods" />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <FoodCardSkeleton key={index} />
          ))}
        </div>
      </HomePageSection>
    );
  }

  if (error) {
    return (
      <HomePageSection continued>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-10 text-center sm:py-14">
          <p className="text-sm text-red-400 sm:text-base">Could not load foods: {error.message}</p>
        </div>
      </HomePageSection>
    );
  }

  if (itemsToShow.length === 0) return null;

  return (
    <HomePageSection continued>
      {!hasSearch && <HomeSectionHeading eyebrow="Dine" title="Popular foods" />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {itemsToShow.map((food) => (
          <FoodCard key={food.id} item={food} />
        ))}
      </div>

      {!hasSearch && <HomeViewAll href="/foods">View all foods</HomeViewAll>}
    </HomePageSection>
  );
};

export default PopularFoods;
