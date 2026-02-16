"use client";

import React from 'react';
import ProductCard from "@/components/ui/reused/ProductCard";
import { usePackages } from "@/lib/api/hooks";
import Link from 'next/link';

// Re-export Package type for backward compatibility
export type { Package } from "@/lib/api/types";

interface PopularPackageProps {
    limit?: number;
    searchTerm?: string;
}

const PopularPackage: React.FC<PopularPackageProps> = ({ limit, searchTerm }) => {
    const { data: packages = [], isLoading, error } = usePackages(searchTerm);
    const hasSearch = !!searchTerm?.trim();

    const itemsToShow =
        hasSearch || !limit ? packages : packages.slice(0, limit);

    if (isLoading) {
        return (
            <section className="container mx-auto px-6 pb-20">
                <div className="text-center py-20">
                    <p className="text-primary">Loading packages...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="container mx-auto px-6 pb-20">
                <div className="text-center py-20">
                    <p className="text-red-500">Error loading packages: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto px-6  pb-20">
            {!hasSearch && (
                <div className="flex items-center justify-between mb-7">
                    <h2 className="text-2xl font-bold tracking-tight text-primary">Popular Packages</h2>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itemsToShow.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>


            {!hasSearch && (
                <div className="flex py-10 justify-center">
                    <Link href="/packages">
                        <button className="hidden md:block px-16 py-3 border  bg-primary-1/10 border-primary-1 text-primary-1 text-base font-semibold rounded-sm hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer">
                            View All Packages
                        </button>
                    </Link>
                </div>
            )}
        </section>
    );
};

export default PopularPackage;
