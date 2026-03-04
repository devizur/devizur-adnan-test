import React, { useEffect, useState } from "react";

interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    totalPages?: number;
    isLoading?: boolean;
    label?: string;
    onPageChange: (page: number) => void;
}

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
        const numeric = parseInt(inputValue || "0", 10);
        const clamped =
            totalPages != null ? Math.min(Math.max(1, numeric), totalPages) : numeric;
        if (!Number.isNaN(clamped) && clamped >= 1 && clamped !== page && !isLoading) {
            onPageChange(clamped);
        }
        setInputValue(String(page));
    };

    const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            commitInput();
        }
    };

    return (
        <div className="flex items-center justify-center mt-10">
            <div className="flex items-center gap-2 bg-secondary-2 border border-white/10 rounded-lg px-3 py-2 shadow-sm">

                {/* Previous */}
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={page === 1 || isLoading}
                    className="px-3 py-1.5 text-sm font-medium  rounded-md text-primary hover:bg-primary/5 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    ← Previous
                </button>

                {/* Page indicator */}
                <div className="flex items-center gap-2 px-2">
                    <span className="text-sm text-muted-foreground">Page</span>

                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={inputValue}
                        disabled={isLoading}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={commitInput}
                        onKeyDown={handleInputKeyDown}
                        className="w-14 text-center text-sm font-medium  rounded-md bg-background/90 text-primary px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                    />

                    {totalPages != null && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            of {totalPages}
                        </span>
                    )}

                    {label && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {label}
                        </span>
                    )}
                </div>

                {/* Next */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasNextPage || isLoading}
                    className="px-3 py-1.5 text-sm font-medium rounded-md text-primary hover:bg-primary/5 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    Next →
                </button>

                {/* Loading indicator */}
                {isLoading && (
                    <div className="ml-2">
                        <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
};