"use client";
import React from "react";
import ActivitiesCard from "@/components/ui/reused/ActivitiesCard";
import { useActivities } from "@/lib/api/hooks";

interface ActivitiesPageSectionProps {
    searchTerm?: string;
}

const ActivitiesPageSection: React.FC<ActivitiesPageSectionProps> = ({ searchTerm }) => {
    const { data: activities = [], isLoading, error } = useActivities();
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? activities.filter(
              (activity) =>
                  activity.title.toLowerCase().includes(normalized) ||
                  activity.category.toLowerCase().includes(normalized)
          )
        : activities;

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
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((activity) => (
                    <ActivitiesCard key={activity.id} item={activity} showTimeSlots />
                ))}
            </div>
        </section>
    );
};

export default ActivitiesPageSection;

