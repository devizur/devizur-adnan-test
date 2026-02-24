import React, { useEffect, useState } from "react";

interface PaginationProps {
    page: number;
    hasNextPage: boolean;
    isLoading?: boolean;
    label?: string;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    page,
    hasNextPage,
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
        if (!Number.isNaN(numeric) && numeric >= 1 && numeric !== page && !isLoading) {
            onPageChange(numeric);
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
        <div className="flex items-center justify-center mt-10">
            <div className="flex items-center gap-2 bg-secondary-2  rounded-lg px-3 py-2 shadow-sm">

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
                        min={1}
                        value={inputValue}
                        disabled={isLoading}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={commitInput}
                        onKeyDown={handleInputKeyDown}
                        className="w-14 text-center text-sm font-medium  rounded-md bg-background/90 text-primary px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                    />

                    {label && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            of {label}
                        </span>
                    )}
                </div>

                {/* Next */}
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasNextPage || isLoading}
                    className="px-3 py-1.5 text-sm font-medium  rounded-md text-primary hover:bg-primary/5 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:cursor-not-allowed"
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