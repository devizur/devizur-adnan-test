"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export function HomePageSection({
  children,
  className,
  continued,
}: {
  children: React.ReactNode;
  className?: string;
  /** When true, adds a top divider and extra spacing (use for sections after the first). */
  continued?: boolean;
}) {
  return (
    <section
      className={cn(
        PAGE_CONTENT_CLASS,
        "pb-8 sm:pb-10 md:pb-12 scroll-mt-28",
        continued && "mt-5 sm:mt-6 md:mt-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function HomeSectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 sm:mb-5 max-w-3xl", className)}>
      <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-1/90 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{title}</h2>
    </div>
  );
}

export function HomeViewAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-center pt-5 sm:pt-6 md:pt-7">
      <Button
        asChild
        variant="outline"
        className="h-11 rounded-xl border-primary-1/45 bg-primary-1/10 text-primary-1 shadow-sm shadow-black/20 hover:bg-primary-1 hover:text-black hover:border-primary-1 px-8 sm:px-10 font-semibold transition-all duration-300"
      >
        <Link href={href}>{children}</Link>
      </Button>
    </div>
  );
}
