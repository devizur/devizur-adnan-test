"use client";
import React from "react";
import { Search } from "lucide-react";

interface HeroSectionProps {
    alignment?: "center" | "left";
    badgeText: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    showBadge?: boolean;
    showSearch?: boolean;
    fullHeight?: boolean;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    children?: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    alignment = "center",
    badgeText,
    title,
    subtitle,
    searchPlaceholder,
    showBadge = true,
    showSearch = true,
    fullHeight = false,
    searchTerm,
    onSearchChange,
    children,
}) => {
    const isCenter = alignment === "center";

    return (
        <section
            className={`relative pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6 overflow-hidden ${
                fullHeight ? "min-h-screen flex items-center" : ""
            }`}
        >
            {/* Decorative Glow */}
           <div className="absolute top-25 left-40 -translate-x-1/2 -translate-y-1/2 w-250 h-150 bg-blue-400/25 blur-[150px] rounded-full pointer-events-none z-0"></div>
            <div
                className={`container mx-auto my-8 sm:my-12 md:my-15 flex flex-col space-y-3 sm:space-y-4 lg:space-y-5 z-10 relative ${
                    isCenter ? "items-center justify-center" : "items-start justify-start"
                }`}
            >
                {/* Badge */}
                {showBadge && (
                    <div className={`w-full flex ${isCenter ? "justify-center" : "justify-start"}`}>
                        <div className="flex px-2.5 py-1 sm:px-3 lg:mb-12 bg-primary-1 rounded-full">
                            <span className="text-black text-xs sm:text-[14px] font-bold tracking-tight">
                                {badgeText}
                            </span>
                        </div>
                    </div>
                )}

                {/* Main Heading */}
                <h1
                    className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter leading-tight sm:leading-none text-primary max-w-full ${
                        isCenter ? "text-center" : ""
                    }`}
                >
                    {title}
                </h1>

                {/* Subheading */}
                <p
                    className={`text-primary font-light text-xs sm:text-sm opacity-90 max-w-full ${
                        isCenter ? "text-center" : ""
                    }`}
                >
                    {subtitle}
                </p>

                {/* Search Bar */}
                {showSearch && (
                    <div
                        className={`relative w-full max-w-full md:max-w-2xl lg:max-w-126.75 group my-6 sm:my-8 ${
                            isCenter ? "mx-auto" : ""
                        }`}
                    >
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm ?? ""}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full h-10 sm:h-11 bg-white/5 border border-white/10 rounded-[10px] sm:rounded-[12px] py-3 sm:py-4 pl-4 pr-10 sm:pl-6 sm:pr-6 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-primary-1/40 focus:bg-white/[0.07] transition-all duration-300"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-1 transition-colors cursor-pointer">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                        </div>
                    </div>
                )}
            </div>

            {children}
        </section>
    );
};

export default HeroSection;

