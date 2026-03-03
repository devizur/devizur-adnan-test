"use client";

import { getBrandConfig } from "@/lib/brand-config";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/ui/CartDrawer";
import { useAppSelector } from "@/store/hooks";
import { ShopSelectorButton } from "@/components/ui/ShopSelectorButton";
import { cn } from "@/lib/utils";

export function Navbar() {
    const config = getBrandConfig();
    const pathname = usePathname();
    const router = useRouter();
    const [isNotFound, setIsNotFound] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { navContent } = config.content;
    const { getTotalItems } = useCart();
    const totalItems = getTotalItems();

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

    const token = useAppSelector((state) => state.auth?.token ?? null);
    const activeLabel =
        config.navItems.find((item) => item.href === pathname)?.label ?? "Home";
    const handleMyBookingsClick = () => {
        if (token) {
            router.push("/my-bookings");
        } else {
            router.push("/sign-in");
        }
    };

    if (pathname === "/brands" || isNotFound) return null;

    return (
        <div className="w-full   flex justify-center">
            <nav className="container mx-auto h-24  md:px-4 flex items-center justify-between z-50 absolute top-0 p-4  ">
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
                        {navContent.bookings}
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative cursor-pointer group"
                    >
                        <div className="w-10 h-10 border-2 border-primary-1 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-primary-1" strokeWidth={2.5} />
                        </div>
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-primary-1 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#05080d]">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile: Cart + Hamburger */}
                <div className="flex lg:hidden items-center gap-2 ">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative w-10 h-10 rounded-xl border-2 border-primary-1 flex items-center justify-center text-primary-1 cursor-pointer hover:bg-primary-1/10 transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" strokeWidth={2.5} />
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-primary-1 text-black text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#171717]">
                                {totalItems}
                            </span>
                        )}
                    </button>
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
                        {navContent.bookings && navContent.bookings.length > 15
                            ? navContent.bookings.slice(0, 15) + "..."
                            : navContent.bookings}</button>
                </div>
            </div>
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}
