"use client";
import React, { useEffect, useMemo, useState } from "react";
import ActivitiesCard, { ActivitiesCardSkeleton } from "@/components/ui/reused/ActivitiesCard";
import { useActivities } from "@/lib/api/hooks";
import { Pagination } from "@/components/ui/reused/Pagination";

const PAGE_SIZE = 9;

interface ActivitiesPageSectionProps {
    searchTerm?: string;
}

const ActivitiesPageSection: React.FC<ActivitiesPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: allActivities = [], isLoading, error } = useActivities(searchTerm);

    // Frontend pagination: slice full list by current page
    const paginatedActivities = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return allActivities.slice(start, start + PAGE_SIZE);
    }, [allActivities, currentPage]);

    const totalPages = Math.ceil(allActivities.length / PAGE_SIZE) || 1;
    const hasNextPage = currentPage < totalPages;

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

    if (isLoading) {
        return (
            <section className="container mx-auto pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                        <ActivitiesCardSkeleton key={index} />
                    ))}
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

    if (!allActivities.length) {
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
                {paginatedActivities.map((activity, index) => {
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
                totalPages={totalPages}
                isLoading={isLoading}
                label={searchTerm?.trim() ? `Results for "${searchTerm.trim()}"` : undefined}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default ActivitiesPageSection;

