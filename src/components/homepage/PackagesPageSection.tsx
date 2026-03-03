"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ui/reused/ProductCard";
import { usePackages } from "@/lib/api/hooks";
import { Pagination } from "@/components/ui/reused/Pagination";

interface PackagesPageSectionProps {
    searchTerm?: string;
}

const PackagesPageSection: React.FC<PackagesPageSectionProps> = ({ searchTerm }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;
    const { data: packages = [], isLoading, error } = usePackages(
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

    const hasNextPage = packages.length === pageSize;

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

    if (!packages.length) {
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
                {packages.map((pkg) => (
                    <ProductCard key={pkg.id} item={pkg} />
                ))}
            </div>
            <Pagination
                page={currentPage}
                hasNextPage={hasNextPage}
                isLoading={isLoading}
                onPageChange={setCurrentPage}
            />
        </section>
    );
};

export default PackagesPageSection;

