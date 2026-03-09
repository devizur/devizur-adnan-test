"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProductCard, { ProductCardSkeleton } from "@/components/ui/reused/ProductCard";
import { usePackages } from "@/lib/api/hooks";
import { Pagination } from "@/components/ui/reused/Pagination";

const PAGE_SIZE = 9;

interface PackagesPageSectionProps {
    searchTerm?: string;
}

const PackagesPageSection: React.FC<PackagesPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data: allPackages = [], isLoading, error } = usePackages(searchTerm);

    // Frontend pagination: slice full list by current page
    const paginatedPackages = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return allPackages.slice(start, start + PAGE_SIZE);
    }, [allPackages, currentPage]);

    const totalPages = Math.ceil(allPackages.length / PAGE_SIZE) || 1;
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
                        <ProductCardSkeleton key={index} />
                    ))}
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

    if (!allPackages.length) {
        return (
            <section className="container mx-auto pb-20">
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No packages found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPackages.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                totalPages={totalPages}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default PackagesPageSection;

