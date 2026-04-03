"use client";

import React from "react";
import ActivitiesCard, { ActivitiesCardSkeleton } from "@/components/ui/reused/ActivitiesCard";
import { useActivities } from "@/lib/api/hooks";
import { HomePageSection, HomeSectionHeading, HomeViewAll } from "@/components/homepage/HomeSection";
import type { Activity } from "@/lib/api/types";

export type { Activity };

interface PopularActivitiesProps {
  limit?: number;
  searchTerm?: string;
}

const PopularActivities: React.FC<PopularActivitiesProps> = ({ limit, searchTerm }) => {
  const { data: activities = [], isLoading, error } = useActivities(searchTerm);
  const hasSearch = !!searchTerm?.trim();

  const itemsToShow = hasSearch || !limit ? activities : activities.slice(0, limit);

  if (isLoading) {
    const skeletonCount = 3;

    return (
      <HomePageSection>
        {!hasSearch && (
          <HomeSectionHeading eyebrow="Discover" title="Popular activities" />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ActivitiesCardSkeleton key={index} />
          ))}
        </div>
      </HomePageSection>
    );
  }

  if (error) {
    return (
      <HomePageSection>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-10 text-center sm:py-14">
          <p className="text-sm text-red-400 sm:text-base">Could not load activities: {error.message}</p>
        </div>
      </HomePageSection>
    );
  }

  if (itemsToShow.length === 0) return null;

  return (
    <HomePageSection>
      {!hasSearch && <HomeSectionHeading eyebrow="Discover" title="Popular activities" />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {itemsToShow.map((activity: Activity, index) => (
          <ActivitiesCard
            key={`${activity.productId}-${activity.id}-${index}`}
            item={activity}
            showTimeSlots
          />
        ))}
      </div>

      {!hasSearch && (
        <HomeViewAll href="/activities">View all activities</HomeViewAll>
      )}
    </HomePageSection>
  );
};

export default PopularActivities;
