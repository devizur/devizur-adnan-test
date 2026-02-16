"use client";
import React from "react";
import ProductCard from "@/components/ui/reused/ProductCard";
import { usePackages } from "@/lib/api/hooks";

interface PackagesPageSectionProps {
    searchTerm?: string;
}

const PackagesPageSection: React.FC<PackagesPageSectionProps> = ({ searchTerm }) => {
    const { data: packages = [], isLoading, error } = usePackages(searchTerm);

    if (isLoading) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-primary">Loading packages...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-red-500">Error loading packages: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>
        </section>
    );
};

export default PackagesPageSection;

