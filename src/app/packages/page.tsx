"use client";
import React, { useState } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import PackagesPageSection from "@/components/homepage/PackagesPageSection";

const page = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div>
            <HeroSection
                alignment="left"
                badgeText="All-in-one Packages &amp; Combos"
                title="Book Packages &amp; Combos"
                subtitle="Discover curated experiences that bundle food, activities, and more into one seamless booking."
                searchPlaceholder="Search packages, combos, tags..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            >
                <PackagesPageSection searchTerm={searchTerm} />
            </HeroSection>
        </div>
    );
};

export default page;

