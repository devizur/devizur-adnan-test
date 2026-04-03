"use client";
import React from "react";
import { Search } from "lucide-react";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

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
      className={cn(
        "relative overflow-hidden pt-24 sm:pt-28 md:pt-32",
        fullHeight && "min-h-screen flex flex-col items-center justify-center",
      )}
    >
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-zinc-950/40 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 z-0 h-[min(28rem,50vw)] w-[min(42rem,90vw)] -translate-x-1/2 rounded-full bg-primary-1/[0.07] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-32 left-[12%] z-0 h-64 w-64 rounded-full bg-blue-500/15 blur-[100px] sm:h-80 sm:w-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-48 right-[8%] z-0 h-56 w-56 rounded-full bg-violet-500/10 blur-[90px] sm:h-72 sm:w-72"
        aria-hidden
      />

      <div
        className={cn(
          PAGE_CONTENT_CLASS,
          "relative z-10 my-6 flex flex-col sm:my-10 md:my-12",
          isCenter ? "items-center text-center" : "items-start text-left",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col gap-4 sm:gap-5",
            isCenter ? "items-center" : "items-start",
          )}
        >
          {showBadge && (
            <div className={cn("flex w-full", isCenter ? "justify-center" : "justify-start")}>
              <div className="inline-flex items-center rounded-full bg-primary-1 px-3 py-1.5 shadow-md shadow-primary-1/15 ring-1 ring-primary-1/30 sm:px-3.5 sm:py-1.5">
                <span className="text-xs font-bold tracking-tight text-black sm:text-sm">{badgeText}</span>
              </div>
            </div>
          )}

          <h1
            className={cn(
              "text-balance text-3xl font-semibold tracking-tight text-primary sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]",
              isCenter ? "text-center" : "text-left",
            )}
          >
            {title}
          </h1>

          <p
            className={cn(
              "max-w-2xl text-pretty text-sm leading-relaxed text-primary/80 sm:text-base",
              isCenter ? "text-center" : "text-left",
            )}
          >
            {subtitle}
          </p>

          {showSearch && (
            <div
              className={cn(
                "group relative mt-2 w-full max-w-full lg:max-w-2xl",
                isCenter && "mx-auto",
              )}
            >
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm ?? ""}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-xl border border-white/10 bg-white/6 py-3 pl-4 pr-11 text-sm text-primary shadow-inner shadow-black/20",
                  "placeholder:text-zinc-500",
                  "transition-all duration-300",
                  "hover:border-white/15 hover:bg-white/8",
                  "focus:border-primary-1/45 focus:bg-white/9 focus:shadow-lg focus:shadow-primary-1/5 focus:outline-none focus:ring-2 focus:ring-primary-1/25",
                  "sm:h-12 sm:pl-5 sm:pr-12 sm:text-base",
                )}
              />
              <div
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-primary-1 sm:right-4"
                aria-hidden
              >
                <Search className="size-4 opacity-70 sm:size-5" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-4 sm:mt-6 md:mt-8">{children}</div>
    </section>
  );
};

export default HeroSection;
