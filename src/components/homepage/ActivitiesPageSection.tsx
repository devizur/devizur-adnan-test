"use client";
import React, { useEffect, useState } from "react";
import ActivitiesCard from "@/components/ui/reused/ActivitiesCard";
import { useActivities } from "@/lib/api/hooks";
import { Pagination } from "@/components/ui/reused/Pagination";

interface ActivitiesPageSectionProps {
    searchTerm?: string;
}

const ActivitiesPageSection: React.FC<ActivitiesPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;
    const { data: activities = [], isLoading, error } = useActivities(
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

    const hasNextPage = activities.length === pageSize;

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

    if (!activities.length) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No activities found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activities.map((activity, index) => {
                    const key = `${(activity as any).productId ?? activity.id}-${index}`;
                    return (
                        <ActivitiesCard
                            key={key}
                            item={activity}
                            showTimeSlots
                        />
                    );
                })}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                label={searchTerm?.trim() ? `Results for "${searchTerm.trim()}"` : undefined}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default ActivitiesPageSection;

