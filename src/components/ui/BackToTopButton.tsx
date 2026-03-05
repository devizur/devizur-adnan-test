'use client';

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      setIsVisible(window.scrollY > 400);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const baseClasses =
    "fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 rounded-full bg-primary-1/70  text-black shadow-lg w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all duration-300 hover:bg-primary-1/90 cursor-pointer";
  const visibilityClasses = isVisible
    ? "opacity-100 translate-y-0 pointer-events-auto"
    : "opacity-0 translate-y-3 pointer-events-none";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className={`${baseClasses} ${visibilityClasses}`}
    >
      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
}

