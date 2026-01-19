"use client";
import React, { useState } from "react";
import { getBrandConfig } from "@/lib/brand-config";
import HeroSection from "@/components/homepage/HeroSection";
import PopularActivities from "@/components/homepage/PopularActivities";
import PopularFoods from "@/components/homepage/PopularFoods";
import PopularPackage from "@/components/homepage/PopularPackage";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const config = getBrandConfig();
  const { home } = config.content;

  return (
    <div className=" ">
      <HeroSection
        alignment="center"
        badgeText={home.heroTag}
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        searchPlaceholder="Search activities, games, tags..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      >
        <PopularActivities limit={6} searchTerm={searchTerm} />
      </HeroSection>
      <PopularFoods limit={6} searchTerm={searchTerm} />
      <PopularPackage limit={6} searchTerm={searchTerm} />
    </div>
  );
}
