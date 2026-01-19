"use client";
import React from "react";
import ProductCard from "@/components/ui/reused/ProductCard";
import { activities } from "./PopularActivities";

interface ActivitiesPageSectionProps {
    searchTerm?: string;
}

const ActivitiesPageSection: React.FC<ActivitiesPageSectionProps> = ({ searchTerm }) => {
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? activities.filter(
              (activity) =>
                  activity.title.toLowerCase().includes(normalized) ||
                  activity.category.toLowerCase().includes(normalized)
          )
        : activities;

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((activity) => (
                    <ProductCard key={activity.id} item={activity} showTimeSlots />
                ))}
            </div>
        </section>
    );
};

export default ActivitiesPageSection;

