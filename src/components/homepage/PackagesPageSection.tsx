"use client";
import React from "react";
import ProductCard from "@/components/ui/reused/ProductCard";
import { popularPackagesData } from "./PopularPackage";

interface PackagesPageSectionProps {
    searchTerm?: string;
}

const PackagesPageSection: React.FC<PackagesPageSectionProps> = ({ searchTerm }) => {
    const normalized = searchTerm?.toLowerCase().trim() || "";

    const filtered = normalized
        ? popularPackagesData.filter(
              (pkg) =>
                  pkg.title.toLowerCase().includes(normalized) ||
                  pkg.category.toLowerCase().includes(normalized)
          )
        : popularPackagesData;

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>
        </section>
    );
};

export default PackagesPageSection;

