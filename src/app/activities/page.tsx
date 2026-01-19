
"use client";
import React, { useState } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import ActivitiesPageSection from "@/components/homepage/ActivitiesPageSection";

const page = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div>
            <HeroSection
                alignment="left"
                badgeText="All-in-one Booking + Ordering"
                title="Book Activities & Games"
                subtitle="Choose a time slot, select the number of guests, and book instantly—smooth and simple"
                searchPlaceholder="Search activities, games, tags..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            >
                <ActivitiesPageSection searchTerm={searchTerm} />
            </HeroSection>
        </div>
    );
};

export default page;