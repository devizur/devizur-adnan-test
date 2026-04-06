"use client";

import React from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/reused/ProductCard";
import { usePackages } from "@/lib/api/hooks";
import { HomePageSection, HomeSectionHeading, HomeViewAll } from "@/components/homepage/HomeSection";

export type { Package } from "@/lib/api/types";

interface PopularPackageProps {
  limit?: number;
  searchTerm?: string;
}

const PopularPackage: React.FC<PopularPackageProps> = ({ limit, searchTerm }) => {
  const { data: packages = [], isLoading, error } = usePackages(searchTerm);
  const hasSearch = !!searchTerm?.trim();

  const itemsToShow = hasSearch || !limit ? packages : packages.slice(0, limit);

  if (isLoading) {
    const skeletonCount = limit && limit > 0 ? limit : 3;

    return (
      <HomePageSection continued>
        {!hasSearch && <HomeSectionHeading eyebrow="Bundles" title="Popular packages" />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </HomePageSection>
    );
  }

  if (error) {
    return (
      <HomePageSection continued>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-10 text-center sm:py-14">
          <p className="text-sm text-red-400 sm:text-base">Could not load packages: {error.message}</p>
        </div>
      </HomePageSection>
    );
  }

  if (itemsToShow.length === 0) return null;

  return (
    <HomePageSection continued>
      {!hasSearch && <HomeSectionHeading eyebrow="Bundles" title="Popular packages" />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
        {itemsToShow.map((pkg) => (
          <ProductCard key={pkg.id} item={pkg} />
        ))}
      </div>

      {!hasSearch && <HomeViewAll href="/packages">View all packages</HomeViewAll>}
    </HomePageSection>
  );
};

export default PopularPackage;
