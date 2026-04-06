"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  hasNextPage: boolean;
  totalPages?: number;
  isLoading?: boolean;
  label?: string;
  onPageChange: (page: number) => void;
}

const navBtnClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-[#1e1e1e] text-accent shadow-sm shadow-black/10 transition-colors hover:border-white/12 hover:bg-[#252525] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4";

export const Pagination: React.FC<PaginationProps> = ({
  page,
  hasNextPage,
  totalPages,
  isLoading = false,
  label,
  onPageChange,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(page));

  useEffect(() => {
    setInputValue(String(page));
  }, [page]);

  const handlePrevious = () => {
    if (page > 1 && !isLoading) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !isLoading) {
      onPageChange(page + 1);
    }
  };

  const commitInput = () => {
    const numeric = parseInt(inputValue.trim() || "0", 10);
    if (Number.isNaN(numeric) || numeric < 1) {
      setInputValue(String(page));
      return;
    }
    const clamped = totalPages != null ? Math.min(numeric, totalPages) : numeric;
    if (!isLoading && clamped !== page) {
      onPageChange(clamped);
    } else {
      setInputValue(String(page));
    }
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInput();
    }
  };

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-3 sm:mt-12"
      aria-label="Pagination"
    >
      {label ? (
        <p className="max-w-full px-2 text-center text-[11px] leading-snug text-zinc-500 sm:text-xs">
          {label}
        </p>
      ) : null}

      <div
        className={cn(
          "inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-[#141414]/95 px-2 py-2 shadow-lg shadow-black/25 ring-1 ring-white/4 sm:gap-2 sm:px-2.5 sm:py-2"
        )}
      >
        <button
          type="button"
          onClick={handlePrevious}
          disabled={page === 1 || isLoading}
          className={navBtnClass}
          aria-label="Go to previous page"
        >
          <ChevronLeft strokeWidth={2.25} aria-hidden />
        </button>

        <div
          className="flex min-w-0 items-center gap-1.5 px-1 sm:gap-2 sm:px-2"
          role="group"
          aria-label="Current page"
        >
          <span className="hidden text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:inline">
            Page
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="Page number"
            value={inputValue}
            disabled={isLoading}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commitInput}
            onKeyDown={handleInputKeyDown}
            className={cn(
              "h-9 w-11 rounded-lg border border-white/10 bg-[#1e1e1e] text-center text-sm font-semibold tabular-nums text-white",
              "placeholder:text-zinc-600 focus:border-primary-1/45 focus:outline-none focus:ring-2 focus:ring-primary-1/25",
              "disabled:cursor-not-allowed disabled:opacity-45 sm:w-12"
            )}
          />
          {totalPages != null ? (
            <span className="whitespace-nowrap text-xs tabular-nums text-zinc-500 sm:text-sm">
              <span className="text-zinc-600">/</span> {totalPages}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!hasNextPage || isLoading}
          className={navBtnClass}
          aria-label="Go to next page"
        >
          <ChevronRight strokeWidth={2.25} aria-hidden />
        </button>

        {isLoading ? (
          <div
            className="ml-0.5 flex size-9 items-center justify-center sm:ml-1"
            aria-live="polite"
            aria-busy="true"
          >
            <div
              className="size-4 animate-spin rounded-full border-2 border-zinc-600 border-t-primary-1"
              aria-hidden
            />
          </div>
        ) : null}
      </div>
    </nav>
  );
};
