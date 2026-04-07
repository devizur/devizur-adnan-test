"use client";
import React, { useState } from "react";
import { useStaticCompanyConfig } from "@/contexts/StaticCompanyConfigContext";
import HeroSection from "@/components/homepage/HeroSection";
import PopularActivities from "@/components/homepage/PopularActivities";
import PopularFoods from "@/components/homepage/PopularFoods";
import PopularPackage from "@/components/homepage/PopularPackage";
import { useActivities, useFoods, usePackages } from "@/lib/api/hooks";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const config = useStaticCompanyConfig();
  const { home } = config.content;
  const { data: activities = [], isLoading: isActivitiesLoading } = useActivities(searchTerm);
  const { data: foods = [], isLoading: isFoodsLoading } = useFoods(searchTerm);
  const { data: packages = [], isLoading: isPackagesLoading } = usePackages(searchTerm);

  const hasAnyProducts = activities.length > 0 || foods.length > 0 || packages.length > 0;
  const isAnyLoading = isActivitiesLoading || isFoodsLoading || isPackagesLoading;
  const hasSearch = !!searchTerm.trim();

  return (
    <div className="min-w-0 overflow-x-hidden bg-background">
      <HeroSection
        alignment="center"
        badgeText={home.heroTag}
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        searchPlaceholder="Search activities, games, tags..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        {hasAnyProducts || isAnyLoading ? (
          <>
            <PopularActivities limit={6} searchTerm={searchTerm} />
            <PopularFoods limit={6} searchTerm={searchTerm} />
            <PopularPackage limit={6} searchTerm={searchTerm} />
          </>
        ) : (
          <section className={cn(PAGE_CONTENT_CLASS, "pb-20")}>
                <div className="text-center py-20">
                    <p className="text-muted-foreground ">  Activities, foods and packages not found </p>
                </div>
            </section>
        )}
      </HeroSection>

    </div>
  );
}
