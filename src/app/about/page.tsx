"use client";
import React from "react";
import HeroSection from "@/components/homepage/HeroSection";

const AboutPage = () => {
    return (
        <div className="h-full min-h-screen">
            <HeroSection
                alignment="center"
                badgeText="About"
                title="About Devizur"
                subtitle="Coming soon"
                searchPlaceholder=""
                showBadge={false}
                showSearch={false}
            />
        </div>
    );
};

export default AboutPage;

