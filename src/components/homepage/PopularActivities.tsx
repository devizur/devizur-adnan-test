"use client";

import React from 'react';
import ProductCard from "@/components/ui/reused/ProductCard";
import { useActivities } from "@/lib/api/hooks";

// Re-export Activity type for backward compatibility
export type { Activity } from "@/lib/api/types";

interface PopularActivitiesProps {
    limit?: number;
    searchTerm?: string;
}

const PopularActivities: React.FC<PopularActivitiesProps> = ({ limit, searchTerm }) => {
    const { data: activities = [], isLoading, error } = useActivities();
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? activities.filter(
              (activity) =>
                  activity.title.toLowerCase().includes(normalized) ||
                  activity.category.toLowerCase().includes(normalized)
          )
        : activities;

    const itemsToShow =
        normalized || !limit ? filtered : filtered.slice(0, limit);

    if (isLoading) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-primary">Loading activities...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-red-500">Error loading activities: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container  mx-auto  pb-20">
            {!normalized && (
                <div className="flex items-center justify-between mb-7">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Activities</h2>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itemsToShow.map((activity) => (
                    <ProductCard key={activity.id} item={activity} showTimeSlots />
                ))}
            </div>


            {!normalized && (
                <div className="flex py-10 justify-center">
                    <button className="hidden md:block px-16 py-3 border  bg-primary-1/10 border-primary-1 text-primary-1 text-base font-semibold rounded-sm hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer">
                        View All Activities
                    </button>
                </div>
            )}
        </section>
    );
};

export default PopularActivities;
