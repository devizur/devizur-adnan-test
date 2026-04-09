"use client";

import { useStaticCompanyConfig } from "@/contexts/StaticCompanyConfigContext";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { ShopSelectorButton } from "@/components/ui/ShopSelectorButton";
import { PAGE_CONTENT_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export function Navbar() {
    const config = useStaticCompanyConfig();
    const pathname = usePathname();
    const router = useRouter();
    const [isNotFound, setIsNotFound] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { navContent } = config.content;

    // Check if we're on a 404 page
    useEffect(() => {
        const checkNotFound = () => {
            const isNotFoundPage = document.body.getAttribute("data-page") === "not-found";
            setIsNotFound(isNotFoundPage);
        };
        checkNotFound();
        // Check periodically in case the attribute is set after mount
        const interval = setInterval(checkNotFound, 100);
        return () => clearInterval(interval);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileMenuOpen]);

    const user = useAppSelector((state) => state.auth?.user ?? null);
    const activeLabel =
        config.navItems.find((item) => item.href === pathname)?.label ?? "Home";
    const bookingsLabel = user ? navContent.bookings : "Login";
    const handleMyBookingsClick = () => {
        if (user) {
            router.push("/my-bookings");
        } else {
            router.push("/sign-in");
        }
    };

    if (pathname === "/companies" || isNotFound) return null;

    return (
        <>
            <nav className="absolute top-0 left-0 right-0 z-50">
                <div className={cn(PAGE_CONTENT_CLASS, "flex h-24 items-center justify-between")}>
                <Link href="/" >
                    <div className="">
                        {/* Native img + suppressHydrationWarning: browser extensions (e.g. Porda) can inject attributes into the logo img after SSR, causing hydration mismatch */}
                        <img
                            src={navContent.logoPath || config.logo}
                            alt="Logo"
                            width={98}
                            height={32}
                            suppressHydrationWarning
                        />
                    </div>
                </Link>

                {/* Navigation Links */}
                <ul className="hidden lg:flex items-center space-x-10">
                    {config.navItems.map((item: { label: string; href: string }) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <button
                                    className={`relative text-[14px] font-medium transition-colors duration-300 cursor-pointer ${activeLabel === item.label
                                            ? "text-primary-1"
                                            : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                    {activeLabel === item.label && (
                                        <div className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-primary-1 flex justify-between items-center px-0">
                                            <div className="w-1 h-1 bg-primary-1 rotate-45 -ml-0.5"></div>
                                            <div className="w-1 h-1 bg-primary-1 rotate-45 -mr-0.5"></div>
                                        </div>
                                    )}
                                </button>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Action Buttons - Desktop */}
                <div className="hidden lg:flex items-center space-x-4 sm:space-x-6">
                    <ShopSelectorButton />
                    <button
                        onClick={handleMyBookingsClick}
                        className="hidden md:block px-6 py-2 border bg-primary-1/10 border-primary-1 text-primary-1 text-sm font-semibold rounded-full hover:bg-primary-1 hover:text-black transition-all duration-300 cursor-pointer"
                    >
                        {bookingsLabel}
                    </button>
                </div>

                {/* Mobile: Hamburger */}
                <div className="flex lg:hidden items-center gap-2 ">
                    <button
                        onClick={() => setIsMobileMenuOpen((o) => !o)}
                        className={cn(
                            "w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors",
                            isMobileMenuOpen
                                ? "border-primary-1 bg-primary-1/10 text-primary-1"
                                : "border-primary-1 text-primary-1 hover:bg-primary-1/10"
                        )}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-out",
                    "bg-black/70 backdrop-blur-md",
                    isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Menu Drawer - slides from right */}
            <div
                className={cn(
                    "fixed top-0 right-0 bottom-0 w-full max-w-sm lg:hidden z-50",
                    "bg-secondary-2 border-l border-gray-800/80",
                    "flex flex-col overflow-hidden",
                    "shadow-2xl shadow-black/50",
                    "transition-transform duration-300 ease-out will-change-transform",
                    isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
            >
                {/* Drawer Header - safe area for notched devices */}
                <div className="flex items-center justify-between px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] border-b border-gray-800/80 shrink-0">
                    <span className="text-sm font-semibold text-white uppercase tracking-wider">Menu</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-10 h-10 rounded-xl border border-gray-700 bg-white/5 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto px-4 py-5">
                    <ul className="space-y-1">
                        {config.navItems.map((item: { label: string; href: string }) => (
                            <li key={item.href}>
                                <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                    <div
                                        className={cn(
                                            "py-3.5 px-4 rounded-xl text-[15px] font-medium transition-all duration-200 cursor-pointer",
                                            activeLabel === item.label
                                                ? "bg-primary-1/15 text-primary-1 border border-primary-1/30"
                                                : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                                        )}
                                    >
                                        {item.label}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Actions Footer - safe area for notched devices */}
                <div className="px-4 py-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-gray-800/80 shrink-0 space-y-3">
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider px-1 mb-2">Shop & Book</div>
                    <ShopSelectorButton className="w-full" />
                    <button
                        onClick={() => {
                            handleMyBookingsClick();
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3 px-4 border border-primary-1/40 bg-primary-1/10 text-primary-1 text-sm font-semibold rounded-xl hover:bg-primary-1 hover:text-black transition-all duration-200 cursor-pointer"
                    >
                        {bookingsLabel && bookingsLabel.length > 15
                            ? bookingsLabel.slice(0, 15) + "..."
                            : bookingsLabel}</button>
                </div>
            </div>
        </>
    );
}
