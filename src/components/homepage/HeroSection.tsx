"use client";
import React from "react";
import { Search } from "lucide-react";

interface HeroSectionProps {
    alignment?: "center" | "left";
    badgeText: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
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
    searchTerm,
    onSearchChange,
    children,
}) => {
    const isCenter = alignment === "center";

    return (
        <section className="relative pt-32 px-6 overflow-hidden">
            {/* Decorative Glow */}
            <div className="absolute top-25 left-40 -translate-x-1/2 -translate-y-1/2 w-250 h-150 bg-blue-400/25 blur-[150px] rounded-full pointer-events-none z-0"></div>

            <div
                className={`container mx-auto my-15 flex flex-col space-y-5 z-10 relative ${
                    isCenter ? "items-center justify-center" : "items-start justify-start"
                }`}
            >
                {/* Badge */}
                <div className={`w-full flex ${isCenter ? "justify-center" : "justify-start"}`}>
                    <div className="flex px-3 py-1 mb-12 bg-primary-1 rounded-full">
                        <span className="text-black text-[11px] font-bold tracking-tight">
                            {badgeText}
                        </span>
                    </div>
                </div>

                {/* Main Heading */}
                <h1
                    className={`text-5xl font-semibold tracking-tighter leading-none text-primary ${
                        isCenter ? "text-center" : ""
                    }`}
                >
                    {title}
                </h1>

                {/* Subheading */}
                <p
                    className={`text-primary font-light text-sm opacity-90 ${
                        isCenter ? "text-center" : ""
                    }`}
                >
                    {subtitle}
                </p>

                {/* Search Bar */}
                <div
                    className={`relative w-full max-w-126.75 group my-8 ${
                        isCenter ? "mx-auto" : ""
                    }`}
                >
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm ?? ""}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="w-126.75 h-11 bg-white/5 border border-white/10 rounded-[12px] py-4 pl-6 pr-6 text-white placeholder-gray-500 focus:outline-none focus:border-primary-1/40 focus:bg-white/[0.07] transition-all duration-300"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-1 transition-colors cursor-pointer">
                        <Search className="w-5 h-5 opacity-60" />
                    </div>
                </div>
            </div>

            {children}
        </section>
    );
};

export default HeroSection;

