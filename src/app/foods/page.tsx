"use client";
import React, { useState } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FoodsPageSection from "@/components/homepage/FoodsPageSection";

const page = () => {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div>
            <HeroSection
                alignment="left"
                badgeText="All-in-one Booking + Ordering"
                title="Order Food &amp; Drinks"
                subtitle="Browse menus, customize your order, and get it delivered or ready for pickup—fast and easy."
                searchPlaceholder="Search foods, cuisines, tags..."
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            >
                <FoodsPageSection searchTerm={searchTerm} />
            </HeroSection>
        </div>
    );
};

export default page;

